import type { KnowledgeDocument } from "../store.js";
import { AppError } from "../errors.js";
import { sleep } from "../retry.js";

const API = "https://api.github.com";

export interface RepoInfo {
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  homepage: string | null;
  topics?: string[];
  language: string | null;
  fork: boolean;
  archived: boolean;
  private: boolean;
  default_branch: string;
  pushed_at: string;
  stargazers_count: number;
}

interface TreeEntry { path: string; type: "blob" | "tree"; sha: string; size?: number }

/* ---------- file selection ---------- */

const EXCLUDED_DIRS = /(^|\/)(node_modules|dist|build|out|coverage|\.next|\.nuxt|\.vercel|\.git|\.github\/workflows|vendor|target|__pycache__|\.venv|venv|public\/assets|generated|\.cache)(\/|$)/i;
const EXCLUDED_FILES = /(^|\/)(package-lock\.json|yarn\.lock|pnpm-lock\.yaml|bun\.lockb?|composer\.lock|Cargo\.lock|poetry\.lock|\.env(\..*)?|.*\.min\.(js|css)|.*\.map|.*secret.*|.*credential.*|.*\.pem|.*\.key|id_rsa.*)$/i;
const BINARY = /\.(png|jpe?g|gif|webp|avif|ico|svg|bmp|tiff?|pdf|zip|gz|tgz|rar|7z|mp[34]|mov|webm|wav|ogg|woff2?|ttf|otf|eot|exe|dll|so|dylib|bin|wasm|jar|class|pyc|sqlite|db|psd|fig)$/i;
const DOCS = /(^|\/)(readme|architecture|design|contributing|changelog|overview|docs?\/[^/]+)(\.[a-z]+)?$|\.mdx?$/i;
const SOURCE = /\.(ts|tsx|js|jsx|mjs|py|java|go|rs|rb|php|cs|kt|swift|vue|svelte|sql|prisma)$/i;
const IMPORTANT_SOURCE = /(^|\/)(index|main|app|server|api|routes?|schema|models?|config|store|service)s?\.[a-z]+$/i;

export function isExcludedPath(path: string): boolean {
  return EXCLUDED_DIRS.test(path) || EXCLUDED_FILES.test(path) || BINARY.test(path);
}

/** README/docs first, then manifest files, then a handful of the most "entry-point" source files. */
export function selectFiles(tree: TreeEntry[], opts: { maxDocs?: number; maxSource?: number; maxBytes?: number } = {}): TreeEntry[] {
  const maxBytes = opts.maxBytes ?? 60_000;
  const blobs = tree.filter((t) => t.type === "blob" && (t.size ?? 0) > 0 && (t.size ?? 0) <= maxBytes && !isExcludedPath(t.path));
  const depth = (p: string) => p.split("/").length;
  const docs = blobs.filter((b) => DOCS.test(b.path)).sort((a, b) => depth(a.path) - depth(b.path)).slice(0, opts.maxDocs ?? 8);
  const manifests = blobs.filter((b) => /^(package\.json|pyproject\.toml|requirements\.txt|pom\.xml|go\.mod|Cargo\.toml|vercel\.json|docker-compose\.ya?ml|Dockerfile)$/i.test(b.path));
  const source = blobs
    .filter((b) => SOURCE.test(b.path) && !/\.(test|spec|d)\.[a-z]+$/i.test(b.path))
    .sort((a, b) => Number(IMPORTANT_SOURCE.test(b.path)) - Number(IMPORTANT_SOURCE.test(a.path)) || depth(a.path) - depth(b.path))
    .slice(0, opts.maxSource ?? 6);
  return [...docs, ...manifests, ...source];
}

/* ---------- API client ---------- */

export class GitHubClient {
  private readonly token?: string;
  private readonly fetchImpl: typeof fetch;
  constructor(opts: { token?: string; fetchImpl?: typeof fetch } = {}) {
    this.token = opts.token;
    this.fetchImpl = opts.fetchImpl ?? fetch;
  }

  private headers(accept = "application/vnd.github+json") {
    const h: Record<string, string> = { Accept: accept, "User-Agent": "vardhan-portfolio-rag", "X-GitHub-Api-Version": "2022-11-28" };
    if (this.token) h.Authorization = `Bearer ${this.token}`;
    return h;
  }

  /** GET with rate-limit awareness: waits for short resets, fails fast on long ones. */
  async get(url: string, accept?: string): Promise<Response> {
    for (let attempt = 0; attempt < 3; attempt++) {
      const res = await this.fetchImpl(url, { headers: this.headers(accept), signal: AbortSignal.timeout(15_000) });
      const remaining = Number(res.headers.get("x-ratelimit-remaining") ?? "1");
      if ((res.status === 403 || res.status === 429) && remaining === 0) {
        const reset = Number(res.headers.get("x-ratelimit-reset") ?? "0") * 1000;
        const wait = Math.max(0, reset - Date.now());
        if (wait > 60_000) throw new AppError(503, "github_rate_limited", "GitHub rate limit reached; sync will resume after the reset.");
        await sleep(wait + 500);
        continue;
      }
      if (res.status >= 500) { await sleep(500 * 2 ** attempt); continue; }
      return res;
    }
    throw new AppError(502, "github_unavailable", "GitHub is unavailable.");
  }

  async json<T>(url: string): Promise<T> {
    const res = await this.get(url);
    if (!res.ok) throw new AppError(502, "github_error", "GitHub request failed.", { cause: new Error(`${url} → ${res.status}`) });
    return (await res.json()) as T;
  }

  async listPublicRepos(user: string): Promise<RepoInfo[]> {
    const out: RepoInfo[] = [];
    for (let page = 1; page <= 10; page++) {
      const batch = await this.json<RepoInfo[]>(`${API}/users/${encodeURIComponent(user)}/repos?type=owner&sort=pushed&per_page=100&page=${page}`);
      out.push(...batch);
      if (batch.length < 100) break;
    }
    return out.filter((r) => !r.private && !r.fork);
  }

  async languages(full: string) {
    return this.json<Record<string, number>>(`${API}/repos/${full}/languages`);
  }

  async tree(full: string, branch: string): Promise<{ sha: string; tree: TreeEntry[] }> {
    const res = await this.get(`${API}/repos/${full}/git/trees/${encodeURIComponent(branch)}?recursive=1`);
    if (res.status === 409 || res.status === 404) return { sha: "empty", tree: [] }; // empty repository
    if (!res.ok) throw new AppError(502, "github_error", "GitHub request failed.");
    return (await res.json()) as { sha: string; tree: TreeEntry[] };
  }

  async fileText(full: string, path: string): Promise<string | null> {
    const res = await this.get(`${API}/repos/${full}/contents/${path.split("/").map(encodeURIComponent).join("/")}`, "application/vnd.github.raw+json");
    if (!res.ok) return null;
    const text = await res.text();
    return text.includes("\u0000") ? null : text; // binary that slipped past the extension filter
  }
}

/* ---------- documents ---------- */

/** Redact anything that looks like a credential before it is ever embedded. */
export function scrubSecrets(text: string): string {
  return text
    .replace(/(gsk_|sk-|ghp_|gho_|github_pat_|xox[bap]-|AKIA)[A-Za-z0-9_-]{10,}/g, "[redacted]")
    .replace(/((?:api[_-]?key|secret|token|password|passwd)\s*[:=]\s*)["']?[^\s"'`]{8,}/gi, "$1[redacted]")
    .replace(/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, "[redacted private key]");
}

export interface RepoSyncResult { docs: KnowledgeDocument[]; skipped: string[]; repos: number }

/**
 * Build documents for every public repo. A repo whose tree SHA matches the stored overview
 * version is skipped entirely (incremental sync); its existing documents are kept.
 */
export async function buildGitHubDocuments(
  client: GitHubClient,
  user: string,
  knownVersions: Map<string, string | null | undefined>,
  opts: { force?: boolean; maxRepos?: number } = {},
): Promise<RepoSyncResult> {
  const repos = (await client.listPublicRepos(user)).slice(0, opts.maxRepos ?? 100);
  const docs: KnowledgeDocument[] = [];
  const skipped: string[] = [];

  for (const repo of repos) {
    const { sha, tree } = await client.tree(repo.full_name, repo.default_branch);
    const overviewId = `github:${repo.name}:overview`;
    if (!opts.force && knownVersions.get(overviewId) === sha) { skipped.push(repo.name); continue; }

    const langs = await client.languages(repo.full_name).catch(() => ({} as Record<string, number>));
    const total = Object.values(langs).reduce((a, b) => a + b, 0) || 1;
    const langLine = Object.entries(langs).sort((a, b) => b[1] - a[1]).map(([l, n]) => `${l} ${Math.round((n / total) * 100)}%`).join(", ");
    const meta = { repo: repo.name, project: repo.name.toLowerCase(), section: "repository" };

    docs.push({
      sourceType: "github",
      sourceId: overviewId,
      title: `${repo.name} — GitHub repository`,
      sourceUrl: repo.html_url,
      version: sha,
      metadata: { ...meta, kind: "overview", homepage: repo.homepage || null, pushedAt: repo.pushed_at },
      content: [
        `Repository: ${repo.full_name}`,
        `URL: ${repo.html_url}`,
        repo.description ? `Description: ${repo.description}` : "Description: none provided",
        repo.homepage ? `Live / homepage: ${repo.homepage}` : "",
        repo.topics?.length ? `Topics: ${repo.topics.join(", ")}` : "",
        langLine ? `Languages: ${langLine}` : repo.language ? `Primary language: ${repo.language}` : "",
        `Default branch: ${repo.default_branch}`,
        `Last pushed: ${repo.pushed_at.slice(0, 10)}`,
        repo.archived ? "Status: archived" : "",
        `Files: ${tree.filter((t) => t.type === "blob" && !isExcludedPath(t.path)).length}`,
      ].filter(Boolean).join("\n"),
    });

    for (const f of selectFiles(tree)) {
      const text = await client.fileText(repo.full_name, f.path);
      if (!text?.trim()) continue;
      docs.push({
        sourceType: "github",
        sourceId: `github:${repo.name}:${f.path}`,
        title: `${repo.name}/${f.path}`,
        sourceUrl: `${repo.html_url}/blob/${repo.default_branch}/${f.path}`,
        version: f.sha,
        metadata: { ...meta, path: f.path, kind: DOCS.test(f.path) ? "docs" : "source" },
        content: scrubSecrets(text),
      });
    }
  }
  return { docs, skipped, repos: repos.length };
}

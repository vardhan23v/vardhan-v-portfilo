import type { SourceType } from "../../src/lib/ai/types.js";
import type { ServerConfig } from "./config.js";
import type { EmbeddingProvider } from "./embeddings/types.js";
import { logError, toPublicError } from "./errors.js";
import { GitHubClient, buildGitHubDocuments } from "./ingest/github.js";
import { pdfToText, resumeDocuments } from "./ingest/pdf.js";
import { ingestDocuments, type IngestStats } from "./ingest/pipeline.js";
import { buildPortfolioDocuments } from "./ingest/portfolio.js";
import type { KnowledgeStore } from "./store.js";

interface Deps { store: KnowledgeStore; embedder: EmbeddingProvider; cfg: ServerConfig; fetchImpl?: typeof fetch }

async function withJob<T extends Record<string, unknown>>(deps: Deps, source: string, run: () => Promise<T>) {
  const jobId = await deps.store.startJob(source);
  try {
    const stats = await run();
    await deps.store.finishJob(jobId, "succeeded", stats);
    return { source, ok: true as const, stats };
  } catch (err) {
    logError(`sync:${source}`, err);
    const e = toPublicError(err);
    await deps.store.finishJob(jobId, "failed", {}, e.message).catch(() => {});
    return { source, ok: false as const, error: e.message };
  }
}

const opts = (cfg: ServerConfig, force: boolean) => ({ force, chunkTokens: cfg.RAG_CHUNK_TOKENS, overlapTokens: cfg.RAG_CHUNK_OVERLAP });

export function syncPortfolio(deps: Deps, force = false) {
  return withJob(deps, "portfolio", async () => ({ ...(await ingestDocuments("portfolio", buildPortfolioDocuments(), deps, opts(deps.cfg, force))) }));
}

export function syncGitHub(deps: Deps, force = false) {
  return withJob(deps, "github", async () => {
    const existing = await deps.store.listDocuments("github");
    const versions = new Map(existing.map((d) => [d.sourceId, d.version]));
    const client = new GitHubClient({ token: deps.cfg.GITHUB_TOKEN, fetchImpl: deps.fetchImpl });
    const { docs, skipped, repos } = await buildGitHubDocuments(client, deps.cfg.GITHUB_USERNAME, versions, { force });
    const skippedSet = new Set(skipped);
    const stats: IngestStats = await ingestDocuments("github", docs, deps, {
      ...opts(deps.cfg, force),
      keep: (id) => skippedSet.has(id.split(":")[1] ?? ""),
    });
    return { ...stats, repos, reposUnchanged: skipped.length };
  });
}

/** Index the public resume (site.resume) — the default resume source. */
export function syncPublicResume(deps: Deps, force = false) {
  return withJob(deps, "resume", async () => {
    const url = new URL("/resume/resume.pdf", deps.cfg.SITE_URL).toString();
    const res = await (deps.fetchImpl ?? fetch)(url, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) throw new Error(`resume fetch ${res.status}`);
    const text = await pdfToText(new Uint8Array(await res.arrayBuffer()));
    const docs = resumeDocuments(text, { id: "public", title: "Resume", url });
    return { ...(await ingestDocuments("resume", docs, deps, { ...opts(deps.cfg, force), keep: (id) => !id.startsWith("resume:public:") })) };
  });
}

/** Admin-uploaded resume. Indexed as text only; the file itself is never stored or served. */
export function ingestUploadedResume(deps: Deps, bytes: Uint8Array, label: string) {
  return withJob(deps, "resume-upload", async () => {
    const text = await pdfToText(bytes);
    // Cite the public resume URL: the upload has no public location by design.
    const docs = resumeDocuments(text, { id: "upload", title: label, url: new URL("/resume/resume.pdf", deps.cfg.SITE_URL).toString() });
    return { ...(await ingestDocuments("resume", docs, deps, { ...opts(deps.cfg, true), keep: (id) => !id.startsWith("resume:upload:") })), characters: text.length };
  });
}

export async function runSync(deps: Deps, sources: SourceType[], force: boolean) {
  const results = [];
  if (sources.includes("portfolio")) results.push(await syncPortfolio(deps, force));
  if (sources.includes("resume")) results.push(await syncPublicResume(deps, force));
  if (sources.includes("github")) results.push(await syncGitHub(deps, force));
  return results;
}

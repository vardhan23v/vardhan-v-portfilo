import { featuredProjects, otherProjects } from "../../src/classic/data/projects.js";
import type { SourceRef, SourceType } from "../../src/lib/ai/types.js";
import { estimateTokens } from "./chunking.js";
import type { EmbeddingProvider } from "./embeddings/types.js";
import type { ChunkMatch, KnowledgeStore } from "./store.js";

export interface RetrievedChunk extends ChunkMatch {
  n: number;
  score: number;
  section?: string;
}

export interface RetrievalOptions {
  topK: number;
  threshold: number;
  maxContextTokens: number;
}

/** Lowercase, strip punctuation/zero-width chars, collapse whitespace. */
export function normalizeQuestion(q: string): string {
  return q
    .normalize("NFKC")
    .replace(/[​-‏⁠]/g, "")
    .replace(/[’']/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export interface ProjectKey { key: string; names: string[] }

/** Every project the portfolio knows, with the spellings a visitor might use. */
export const PROJECT_KEYS: ProjectKey[] = [
  ...featuredProjects.map((p) => ({ key: p.slug, names: [p.name, p.slug, repoName(p.github)] })),
  ...otherProjects.map((p) => ({ key: repoName(p.github) || norm(p.name).replace(/ /g, "-"), names: [p.name, repoName(p.github)] })),
].map((k) => ({ key: k.key.toLowerCase(), names: [...new Set(k.names.filter(Boolean).map(norm).filter((n) => n.length >= 3))] }));

export function repoName(url?: string): string {
  return url?.match(/github\.com\/[^/]+\/([^/#?]+)/i)?.[1]?.replace(/\.git$/, "") ?? "";
}

/** Projects named in the question (whole-word match on name, slug or repo name). Longest names win. */
export function matchProjects(question: string, extraRepos: string[] = []): string[] {
  const q = ` ${norm(question)} `;
  const keys = [...PROJECT_KEYS, ...extraRepos.map((r) => ({ key: r.toLowerCase(), names: [norm(r)] }))];
  const hits = new Set<string>();
  for (const k of keys) if (k.names.some((n) => q.includes(` ${n} `))) hits.add(k.key);
  return [...hits];
}

/** Which source categories a question leans on — used to boost, never to hide evidence. */
export function preferredSources(question: string): SourceType[] {
  const q = question.toLowerCase();
  const out: SourceType[] = [];
  if (/\b(resume|cv|curriculum)\b/.test(q)) out.push("resume");
  if (/\b(repo|repository|github|code|source|readme|architecture|implemented|implementation|commit|language)\b/.test(q)) out.push("github");
  if (/\b(portfolio|project|skill|stack|experience|education|certif|contact|email|hire)\b/.test(q)) out.push("portfolio");
  return out;
}

function chunkProject(c: ChunkMatch): string | undefined {
  const v = (c.chunkMetadata.project ?? c.documentMetadata.project ?? c.documentMetadata.repo) as string | undefined;
  return v?.toLowerCase();
}

export async function retrieve(
  question: string,
  deps: { store: KnowledgeStore; embedder: EmbeddingProvider },
  opts: RetrievalOptions,
): Promise<RetrievedChunk[]> {
  const q = normalizeQuestion(question);
  const projects = matchProjects(q);
  const prefer = preferredSources(q);
  const embedding = await deps.embedder.embedText(q);

  const candidates = await deps.store.matchChunks(embedding, { count: opts.topK * 4, threshold: opts.threshold });

  // Exact project-name match: make sure that project's own chunks are in the pool even if the
  // vector search ranked them lower than generic text.
  if (projects.length && !candidates.some((c) => projects.includes(chunkProject(c) ?? ""))) {
    const named = await deps.embedder.embedText(projects.join(" "));
    const extra = await deps.store.matchChunks(named, { count: opts.topK * 2, threshold: Math.max(0, opts.threshold - 0.1) });
    for (const e of extra) if (!candidates.some((c) => c.chunkId === e.chunkId)) candidates.push(e);
  }

  const scored = candidates.map((c) => {
    let score = c.similarity;
    const proj = chunkProject(c);
    if (projects.length && proj && projects.includes(proj)) score += 0.2;
    else if (projects.length && proj) score -= 0.05; // a different named project is probably noise
    if (prefer.includes(c.sourceType)) score += 0.05;
    return { ...c, score };
  });
  scored.sort((a, b) => b.score - a.score);

  // Drop the long tail: anything far below the best match is unlikely to help and costs tokens.
  const best = scored[0]?.score ?? 0;
  const relevant = scored.filter((c) => c.score >= best - 0.25 && (c.similarity >= opts.threshold || (projects.length && projects.includes(chunkProject(c) ?? ""))));

  const picked: RetrievedChunk[] = [];
  const seen = new Set<string>();
  let budget = opts.maxContextTokens;
  for (const c of relevant) {
    if (picked.length >= opts.topK) break;
    const fp = c.content.slice(0, 200);
    if (seen.has(fp)) continue;
    const cost = estimateTokens(c.content);
    if (cost > budget && picked.length) continue;
    seen.add(fp);
    budget -= cost;
    picked.push({ ...c, n: picked.length + 1, section: (c.chunkMetadata.section ?? c.documentMetadata.section) as string | undefined });
  }
  return picked;
}

export function toSourceRef(c: RetrievedChunk): SourceRef {
  return {
    n: c.n,
    chunkId: c.chunkId,
    title: c.title,
    category: c.sourceType,
    url: c.sourceUrl ?? undefined,
    section: c.section,
    repo: (c.documentMetadata.repo as string | undefined) ?? undefined,
    path: (c.chunkMetadata.path ?? c.documentMetadata.path) as string | undefined,
    chunkIndex: Number(c.chunkMetadata.chunkIndex ?? 0),
    similarity: Math.round(c.similarity * 1000) / 1000,
  };
}

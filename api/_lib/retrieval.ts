import { featuredProjects, otherProjects } from "../../src/classic/data/projects.js";
import type { ChatTurn, SourceRef, SourceType } from "../../src/lib/ai/types.js";
import { estimateTokens } from "./chunking.js";
import type { EmbeddingProvider } from "./embeddings/types.js";
import { CAREER_TITLE, CONTACT_TITLE, DIGEST_TITLE, SKILLS_TITLE, careerOverview, contactOverview, factCard, judgementDigest, projectDigest, projectName, skillsOverview } from "./digest.js";
import type { QueryPlan } from "./planner.js";
import type { ChunkMatch, KnowledgeStore, TermHit } from "./store.js";

export interface RetrievedChunk extends ChunkMatch {
  n: number;
  score: number;
  section?: string;
}

export interface RetrievalOptions {
  topK: number;
  threshold: number;
  maxContextTokens: number;
  /** Conversation before the current question, used to resolve follow-ups like "why is it hard?". */
  history?: ChatTurn[];
  plan?: QueryPlan;
  /** An embedding already started for one query text (the raw question), so planning and embedding overlap. */
  warm?: { text: string; embedding: Promise<number[] | null> };
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

/** Projects named in the text (whole-word match on name, slug or repo name), in the order they first appear. */
export function matchProjects(question: string, extraRepos: string[] = []): string[] {
  const q = ` ${norm(question)} `;
  const keys = [...PROJECT_KEYS, ...extraRepos.map((r) => ({ key: r.toLowerCase(), names: [norm(r)] }))];
  const at = new Map<string, number>();
  for (const k of keys) {
    const pos = k.names.map((n) => q.indexOf(` ${n} `)).filter((i) => i >= 0);
    if (pos.length && !at.has(k.key)) at.set(k.key, Math.min(...pos));
  }
  return [...at].sort((a, b) => a[1] - b[1]).map(([k]) => k);
}

/**
 * The projects the conversation is currently about, most recent first (at most 3). Answers bold the
 * projects they discuss, so bold names in assistant turns are trusted over passing mentions.
 */
export function conversationFocus(history: ChatTurn[] = []): string[] {
  const out: string[] = [];
  for (const t of history.slice(-4).reverse()) {
    let found: string[];
    if (t.role === "assistant") {
      const bold = [...t.content.matchAll(/\*\*([^*\n]{2,80})\*\*/g)].map((m) => m[1]).join(" · ");
      found = bold ? matchProjects(bold) : matchProjects(t.content.slice(0, 240));
    } else found = matchProjects(t.content);
    for (const k of found) if (!out.includes(k)) out.push(k);
    if (out.length >= 3) break;
  }
  return out.slice(0, 3);
}

/** True when the question leans on the conversation ("which is harder?", "tell me more", "what stack does it use?"). */
export function isFollowUp(question: string, history: ChatTurn[] = []): boolean {
  return history.some((t) => t.role === "assistant") && !matchProjects(question).length && FOLLOW_UP.test(normalizeQuestion(question));
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

const FOLLOW_UP = /\b(it|its|that|this|those|these|them|they|former|latter|first one|second one|the project|more|else|hardest part|which (?:one|is|was|of|would)|harder|easier|tougher|better|why not|how so)\b|^(?:and|so|but|why)\b/i;
export const JUDGEMENT = /\b(strongest|best|better|most (?:impressive|complex|challenging|difficult|technical)|hardest|harder|easier|tougher|favou?rite|stand ?out|more (?:complex|impressive|difficult|technical|challenging)|compare|versus|vs)\b/i;
export const HIRING = /\b(hire|hiring|fit for|good fit|right fit|why (?:him|vardhan)|strengths?|qualified)\b/i;
const EXPERIENCE = /\b(experience|internships?|intern|employ\w*|career|jobs?|compan(?:y|ies))\b/i;
const CONTACT = /\b(e-?mail|contact|reach|linkedin|phone|locat\w*|based in|where (?:is|does) (?:he|vardhan) (?:from|live))\b/i;
const EDUCATION = /\b(study|studied|studying|education|degree|college|university|school|b\.?tech|cgpa)\b/i;
const STOPWORDS = new Set("list all any give show the and for with has have had his him was were are does did what which where when who why how can could would should about from that this those these they them built build used using use know work worked project projects tell please vardhan".split(" "));

/**
 * The current question, made to stand alone: a follow-up names the projects the conversation is
 * about, or falls back to the previous question when no project is in focus.
 */
export function standaloneQuestion(question: string, history: ChatTurn[] = []): string {
  const q = normalizeQuestion(question);
  const prev = [...history].reverse().find((t) => t.role === "user")?.content;
  if (!prev || matchProjects(q).length || q.split(" ").length > 14 || !FOLLOW_UP.test(q)) return q;
  const focus = conversationFocus(history);
  if (focus.length) return `${q} (about ${focus.map(projectName).join(" and ")})`;
  return `${normalizeQuestion(prev).slice(0, 300)} ${q}`;
}

/** Searches to run for one question: the question, each part of a compound one, and intent anchors. */
export function searchQueries(question: string, projects: string[] = []): string[] {
  const out = [question];
  const parts = question.split(/\?\s+|\s+and\s+(?=(?:what|where|when|who|how|which|why|does|did|is|can|his)\b)/i).map((p) => p.trim());
  if (parts.length > 1) out.push(...parts.filter((p) => p.split(" ").length >= 2));
  if (JUDGEMENT.test(question)) out.push("featured projects architecture, key decisions, technical challenges and impact");
  if (HIRING.test(question)) out.push("professional summary, work experience, skills and flagship projects");
  if (CONTACT.test(question)) out.push("Sree Vardhan V profile and contact email LinkedIn GitHub");
  if (EDUCATION.test(question)) out.push("Education degree college university B.Tech school");
  if (projects.length > 1) out.push(...projects.map((p) => `${p} project overview architecture tech stack`));
  return [...new Set(out)].slice(0, 5);
}

export function keywords(question: string): string[] {
  return [...new Set(norm(question).split(" ").filter((w) => w.length >= 3 && !STOPWORDS.has(w)))];
}

/** Agent notes and tool folders mention technologies without showing Vardhan's work. */
export const NOISE_PATH = /(^|\/)(\.[a-z][\w-]*|references)\//i;

function isNoise(metadata: Record<string, unknown>) {
  return typeof metadata.path === "string" && NOISE_PATH.test(metadata.path);
}

function syntheticChunk(id: string, title: string, content: string, sourceUrl?: string, project?: string): ChunkMatch {
  return { chunkId: id, documentId: id, title, content, sourceType: "portfolio", sourceUrl, chunkMetadata: { synthetic: true, ...(project ? { card: true, project } : {}) }, documentMetadata: {}, similarity: 1 };
}

function snippet(content: string, term: string): string {
  const at = content.toLowerCase().indexOf(term.toLowerCase());
  return content.slice(Math.max(0, at - 50), at + term.length + 50).replace(/\s+/g, " ").replace(/"/g, "'").trim();
}

/** Groups exact-text matches by project, with the words around each so "no X" reads as no. */
export function termSummary(term: string, hits: TermHit[], limit: number): string {
  const useful = hits.filter((h) => !isNoise(h.metadata)).sort((a, b) => Number(a.sourceType === "github") - Number(b.sourceType === "github"));
  if (!useful.length) return `Exhaustive text search: "${term}" appears nowhere in Vardhan's portfolio, resume or indexed repositories.`;
  const groups = new Map<string, TermHit>();
  for (const h of useful) {
    const key = String(h.metadata.repo ?? h.metadata.project ?? h.sourceType);
    if (!groups.has(key)) groups.set(key, h);
  }
  const lines = [...groups].slice(0, 12).map(([k, h]) => `- ${k}: "${snippet(h.content, term)}"`);
  const complete = hits.length < limit && groups.size <= 12;
  return `${complete ? "Exhaustive" : "Partial (result limit reached)"} text search for "${term}". A match is only a mention: read the quoted words, because "no ${term}" means it was not used:\n${lines.join("\n")}`;
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
  const asked = normalizeQuestion(question);
  const q = opts.plan?.standalone ? normalizeQuestion(opts.plan.standalone) : standaloneQuestion(asked, opts.history);
  const projects = [...new Set([...matchProjects(q), ...(opts.plan?.focus ?? [])])];
  const prefer = preferredSources(q);
  const terms = keywords(asked);
  const queries = [...new Set([q, ...searchQueries(q, projects).slice(1), ...(opts.plan?.searches ?? []).map(normalizeQuestion)])].slice(0, 5);
  const warmed = opts.warm && queries.includes(normalizeQuestion(opts.warm.text)) ? await opts.warm.embedding : null;
  const rest = warmed ? queries.filter((x) => x !== normalizeQuestion(opts.warm!.text)) : queries;
  const fresh = rest.length ? await deps.embedder.embedDocuments(rest) : [];
  const byText = new Map(rest.map((x, i) => [x, fresh[i]]));
  if (warmed) byText.set(normalizeQuestion(opts.warm!.text), warmed);
  const embeddings = queries.map((x) => byText.get(x)!);
  const results = await Promise.all(embeddings.map((e) => deps.store.matchChunks(e, { count: opts.topK * 4, threshold: opts.threshold })));

  // Merge the searches, keeping each chunk's best similarity.
  const merged = new Map<string, ChunkMatch>();
  for (const c of results.flat()) {
    const had = merged.get(c.chunkId);
    if (!had || c.similarity > had.similarity) merged.set(c.chunkId, c);
  }
  const candidates = [...merged.values()].filter((c) => !isNoise(c.chunkMetadata) && !isNoise(c.documentMetadata));

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
    // Curated pages describe Vardhan; raw repository files often only mention a term in passing.
    if (c.sourceType !== "github") score += 0.04;
    else if (c.documentMetadata.kind === "source" && !prefer.includes("github")) score -= 0.06;
    // Exact technology and product names are where embeddings are weakest.
    const text = ` ${norm(`${c.title} ${c.content}`)} `;
    score += Math.min(0.09, terms.filter((t) => text.includes(` ${t} `)).length * 0.03);
    return { ...c, score };
  });
  scored.sort((a, b) => b.score - a.score);

  // Drop the long tail: anything far below the best match is unlikely to help and costs tokens.
  const best = scored[0]?.score ?? 0;
  // Each search keeps its best hits, so one part of a compound question can't erase the other.
  const anchors = new Set(results.flatMap((r) => r.slice(0, 2).map((c) => c.chunkId)));
  const relevant = scored.filter((c) => (c.score >= best - 0.25 || anchors.has(c.chunkId)) && (c.similarity >= opts.threshold || (projects.length && projects.includes(chunkProject(c) ?? ""))));

  // The top hit of every search gets a guaranteed slot before the general ranking fills the rest.
  if (results.length > 1) {
    const leaders = new Set(results.map((r) => r.find((c) => !isNoise(c.chunkMetadata) && !isNoise(c.documentMetadata))?.chunkId));
    relevant.sort((a, b) => Number(leaders.has(b.chunkId)) - Number(leaders.has(a.chunkId)) || b.score - a.score);
  }

  const intent = opts.plan?.intent;
  // No evidence, nothing to look up, no project in view and not a question the overviews answer:
  // let the caller refuse without a model call.
  const aboutWork = projects.length > 0 || /\b(projects?|work|built|build|apps?|portfolio|repos?|code|stack|products?)\b/i.test(q);
  const overviewQuestion = intent === "list" || HIRING.test(q) || ((intent === "judgement" || intent === "comparison") && aboutWork);
  if (!relevant.length && !opts.plan?.terms.length && !projects.length && !overviewQuestion) return [];

  // Context every answer of this kind needs, ahead of the ranked evidence.
  const fixed: ChunkMatch[] = [];
  if (intent === "judgement" || intent === "comparison") fixed.push(syntheticChunk("digest", DIGEST_TITLE, judgementDigest()));
  else if (intent === "list") fixed.push(syntheticChunk("digest", DIGEST_TITLE, projectDigest()));
  if (opts.plan && (EXPERIENCE.test(q) || HIRING.test(q))) fixed.push(syntheticChunk("career", CAREER_TITLE, careerOverview()));
  if (opts.plan && CONTACT.test(q)) fixed.push(syntheticChunk("contact", CONTACT_TITLE, contactOverview()));
  if (opts.plan && HIRING.test(q)) fixed.push(syntheticChunk("skills", SKILLS_TITLE, skillsOverview()));
  if (deps.store.findTerm) {
    const TERM_LIMIT = 150;
    for (const term of opts.plan?.terms ?? []) {
      const hits = await deps.store.findTerm(term, TERM_LIMIT);
      fixed.push(syntheticChunk(`term:${term}`, `Text search: ${term}`, termSummary(term, hits, TERM_LIMIT)));
    }
  }
  // Every project in view gets its full fact card, so answers never depend on a lucky vector match.
  for (const key of projects.slice(0, 3)) {
    const card = factCard(key);
    if (card) fixed.push(syntheticChunk(`card:${key}`, card.title, card.content, card.url, key));
  }

  const picked: RetrievedChunk[] = fixed.map((c, i) => ({ ...c, n: i + 1, score: 1 }));
  const seen = new Set<string>();
  const perDocument = new Map<string, number>();
  let budget = opts.maxContextTokens - fixed.reduce((n, c) => n + estimateTokens(c.content), 0);
  const maxPicked = opts.topK + fixed.length;
  for (const c of relevant) {
    if (picked.length >= maxPicked) break;
    const fp = c.content.slice(0, 200);
    if (seen.has(fp)) continue;
    // Several chunks of one README would crowd out the other evidence.
    if ((perDocument.get(c.documentId) ?? 0) >= 2) continue;
    const cost = estimateTokens(c.content);
    if (cost > budget && picked.length > fixed.length) continue;
    seen.add(fp);
    perDocument.set(c.documentId, (perDocument.get(c.documentId) ?? 0) + 1);
    budget -= cost;
    picked.push({ ...c, n: picked.length + 1, section: (c.chunkMetadata.section ?? c.documentMetadata.section) as string | undefined });
  }
  return picked;
}

/** A project's fact card as the next numbered source, for projects chosen after retrieval (e.g. the notes' pick). */
export function cardChunk(key: string, n: number): RetrievedChunk | null {
  const card = factCard(key);
  return card ? { ...syntheticChunk(`card:${key}`, card.title, card.content, card.url, key), n, score: 1 } : null;
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

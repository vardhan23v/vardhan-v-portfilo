import { matchProjects } from "./retrieval.js";

/** What the answer guard needs to know about the sources the model was given. */
export interface GuardSource {
  n: number;
  content: string;
  title?: string | null;
  sourceUrl?: string | null;
}

const URL_RE = /https?:\/\/[^\s)"'<>\]]+/g;
const trimUrl = (u: string) => u.replace(/[.,;:!?]+$/, "").replace(/\/+$/, "").toLowerCase();

/** Every URL the sources contain, normalized, so the answer can only link to those. */
export function knownUrls(sources: GuardSource[]): Set<string> {
  const out = new Set<string>();
  for (const s of sources) {
    if (s.sourceUrl) out.add(trimUrl(s.sourceUrl));
    for (const m of s.content.matchAll(URL_RE)) out.add(trimUrl(m[0]));
  }
  return out;
}

/** Drops citations to sources that don't exist and unlinks URLs the sources never gave. */
export function fixAnswerText(text: string, valid: Set<number>, urls: Set<string>, stats?: GuardStats): string {
  return text
    .replace(/\s*\[(\d+(?:\s*,\s*\d+)*)\](?!\()/g, (m, group: string) => {
      const all = group.split(",").map((x) => Number(x.trim()));
      const keep = all.filter((n) => valid.has(n));
      if (stats) stats.droppedCitations += all.length - keep.length;
      if (keep.length === all.length) return m;
      return keep.length ? ` [${keep.join(", ")}]` : "";
    })
    .replace(/\[([^\]\n]{1,120})\]\((https?:\/\/[^)\s]+)\)/g, (m, label: string, url: string) => {
      if (urls.has(trimUrl(url))) return m;
      if (stats) stats.unlinked += 1;
      return label;
    });
}

export interface GuardStats { droppedCitations: number; unlinked: number }

/**
 * Where streamed text can safely be released: everything except a trailing "[" construct that may
 * still turn into a citation or a link. Long runs are released anyway so nothing stalls.
 */
function safeCut(s: string): number {
  const open = s.lastIndexOf("[");
  if (open === -1) return s.length;
  const tail = s.slice(open);
  if (tail.length > 300) return s.length;
  const closed = tail.match(/^\[[^\]]*\]/);
  if (!closed) return open;
  const after = tail.slice(closed[0].length);
  if (after === "") return open;
  if (after.startsWith("(") && !after.includes(")")) return open;
  return s.length;
}

/** Streaming guard: applies fixAnswerText to complete pieces of the answer as they arrive. */
export function answerGuard(sources: GuardSource[]) {
  const valid = new Set(sources.map((s) => s.n));
  const urls = knownUrls(sources);
  const stats: GuardStats = { droppedCitations: 0, unlinked: 0 };
  let held = "";
  return {
    stats,
    push(delta: string): string {
      held += delta;
      const cut = safeCut(held);
      if (cut === 0) return "";
      const out = held.slice(0, cut);
      held = held.slice(cut);
      return fixAnswerText(out, valid, urls, stats);
    },
    flush(): string {
      const out = fixAnswerText(held, valid, urls, stats);
      held = "";
      return out;
    },
  };
}

/**
 * Claims the sources can't back, counted for the logs (never the text itself): project names the
 * sources never mention, and numbers of two or more digits that appear in no source.
 */
export function unsupportedCounts(answer: string, sources: GuardSource[]): { projects: number; numbers: number } {
  const corpus = sources.map((s) => `${s.title ?? ""}\n${s.content}`).join("\n");
  const inSources = new Set(matchProjects(corpus));
  const projects = matchProjects(answer).filter((k) => !inSources.has(k)).length;
  const plain = answer.replace(URL_RE, "").replace(/\[\d+(?:\s*,\s*\d+)*\]/g, "");
  const nums = [...new Set(plain.match(/\b\d{2,}(?:[.,]\d+)?\b/g) ?? [])];
  const numbers = nums.filter((n) => !corpus.includes(n)).length;
  return { projects, numbers };
}

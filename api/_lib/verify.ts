import { site } from "../../src/classic/data/site.js";
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

/** Short label for a bare URL the model wrote instead of a Markdown link. */
export function linkLabel(url: string): string {
  if (/github\.com/i.test(url)) return "GitHub";
  if (url.toLowerCase().startsWith(`${site.url.toLowerCase()}/work/`)) return "Case study";
  return "Live site";
}

/**
 * House style the model doesn't always follow: plain spaces and hyphens, named links instead of
 * bare <url>s, one citation group per claim with a space before it, no Markdown hard breaks.
 */
export function tidyAnswerText(text: string): string {
  return text
    .replace(/[\u00a0\u202f\u2007\u2009]/g, " ")
    .replace(/[\u2010\u2011]/g, "-")
    // "React + Express" reads as notation; prose joins with "and".
    .replace(/(\w|\)) \+ (?=[A-Z\w])/g, "$1 and ")
    .replace(/<(https?:\/\/[^>\s]+)>/g, (_m, url: string) => `[${linkLabel(url)}](${url})`)
    .replace(/\[(\d+(?:\s*,\s*\d+)*)\](?:\s*\[(\d+(?:\s*,\s*\d+)*)\])+/g, (m) => `[${[...new Set(m.match(/\d+/g)!)].join(", ")}]`)
    .replace(/([^\s([])\[(\d+(?:\s*,\s*\d+)*)\](?!\()/g, "$1 [$2]")
    // "...2026. [3]" → "...2026 [3]." (citation before the full stop).
    .replace(/(^|[^\s.])\.\s+\[(\d+(?:\s*,\s*\d+)*)\](?=\s|$)/g, "$1 [$2].")
    // A bare URL becomes a named link (never inside an existing link or <url>).
    .replace(/(^|[^(<\w/])(https?:\/\/[^\s)<>\]]+[^\s)<>\].,;:!?])/g, (_m, pre: string, url: string) => `${pre}[${linkLabel(url)}](${url})`)
    .replace(/[ \t]+\n/g, "\n");
}

/** Drops citations to sources that don't exist and unlinks URLs the sources never gave. */
export function fixAnswerText(text: string, valid: Set<number>, urls: Set<string>, stats?: GuardStats): string {
  return tidyAnswerText(text)
    .replace(/\s*\[(\d+(?:\s*,\s*\d+)*)\](?!\()/g, (m, group: string) => {
      const all = group.split(",").map((x) => Number(x.trim()));
      const keep = all.filter((n) => valid.has(n));
      if (stats) stats.droppedCitations += all.length - keep.length;
      if (keep.length === all.length) return m;
      return keep.length ? `${m.match(/^\s*/)![0]}[${keep.join(", ")}]` : "";
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
  // A URL still being written (bare or in <…>): hold its whole token until whitespace ends it.
  const word = s.match(/(\S+)$/);
  if (word && /^[(<[]?(?:h(?:t(?:t(?:p(?:s?(?::(?:\/\/?)?)?)?)?)?)?)?$|^[(<[]?https?:\/\//.test(word[1]) && /h/.test(word[1]) && word[1].length < 300) {
    return Math.min(word.index!, cutBracket(s.slice(0, word.index!)));
  }
  // A bare <url> still being written: hold from "<" until it closes.
  const angle = s.lastIndexOf("<");
  const tail = angle >= 0 ? s.slice(angle) : "";
  if (tail && !tail.includes(">") && tail.length < 300 && ("<https://".startsWith(tail) || /^<https?:\/\//.test(tail))) return Math.min(angle, cutBracket(s));
  // A sentence end may still be followed by its citation ("event. [3]" becomes "event [3].").
  const end = s.match(/[.!?]\s*$/);
  if (end) return Math.min(end.index!, cutBracket(s));
  return cutBracket(s);
}

function cutBracket(s: string): number {
  const open = s.lastIndexOf("[");
  if (open === -1) return s.length;
  const tail = s.slice(open);
  if (tail.length > 300) return s.length;
  const closed = tail.match(/^\[[^\]]*\]/);
  const after = closed ? tail.slice(closed[0].length) : "";
  const hold = !closed || after === "" || (after.startsWith("(") && !after.includes(")"));
  if (!hold) return s.length;
  // Keep a whole run of citations ("[1][4][") and the character before it together, so the run can
  // be merged into one group and spaced from the word before it.
  let start = open;
  for (let m; (m = s.slice(0, start).match(/\[\d+(?:\s*,\s*\d+)*\]\s*$/)); ) start = m.index!;
  // ...and the whole word before it (never part of a word or URL), with any full stop after it.
  return s.slice(0, start).search(/\S*\s*$/);
}

/** Streaming guard: applies fixAnswerText to complete pieces of the answer as they arrive. */
export function answerGuard(sources: GuardSource[]) {
  const valid = new Set(sources.map((s) => s.n));
  const urls = knownUrls(sources);
  const stats: GuardStats = { droppedCitations: 0, unlinked: 0 };
  let held = "";
  let last = "";
  // A citation released after its word (in a later chunk) still gets its leading space.
  const release = (text: string) => {
    let out = fixAnswerText(text, valid, urls, stats);
    if (/^\[\d/.test(out) && last && !/[\s([]/.test(last)) out = ` ${out}`;
    if (out) last = out.at(-1)!;
    return out;
  };
  return {
    stats,
    push(delta: string): string {
      held += delta;
      const cut = safeCut(held);
      if (cut === 0) return "";
      const out = held.slice(0, cut);
      held = held.slice(cut);
      return release(out);
    },
    flush(): string {
      const out = release(held);
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

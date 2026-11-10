/**
 * A deliberately small Markdown parser for assistant answers → a plain block/inline tree that
 * React renders as elements (never innerHTML). Supports paragraphs, headings, bullet/numbered
 * lists, fenced code, **bold**, *italic*, `code`, [links](url), bare <https://…> links and
 * citations like [2].
 */
export type Inline =
  | { t: "text"; v: string }
  | { t: "strong"; c: Inline[] }
  | { t: "em"; c: Inline[] }
  | { t: "code"; v: string }
  | { t: "link"; href: string; c: Inline[] }
  | { t: "cite"; n: number };

export type Block =
  | { t: "p"; c: Inline[] }
  | { t: "h"; level: number; c: Inline[] }
  | { t: "ul" | "ol"; items: Inline[][] }
  | { t: "pre"; v: string };

const MAX_BOLD_WORDS = 8;

/** Only http(s), mailto, same-site paths and in-app `app:` targets are ever linked. */
export function safeHref(href: string): string | null {
  const h = href.trim();
  if (/^(https?:\/\/|mailto:)/i.test(h)) return h;
  if (/^app:[a-z-]+$/i.test(h)) return h;
  if (/^\/(?!\/)/.test(h)) return h;
  return null;
}

const INLINE = /(\*\*([^*]+)\*\*)|(`([^`]+)`)|(\[([^\]]+)\]\(([^)\s]+)\))|(\[(\d+(?:\s*,\s*\d+)*)\])|(\*([^*\s][^*]*)\*)|(_([^_\s][^_]*)_)|(<(https?:\/\/[^>\s]+)>)/g;

/** A readable label for a bare URL: "GitHub" for repositories, otherwise the host name. */
function urlLabel(url: string): string {
  if (/^https?:\/\/(www\.)?github\.com\//i.test(url)) return "GitHub";
  return url.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/.*$/, "");
}

export function parseInline(s: string): Inline[] {
  const out: Inline[] = [];
  let last = 0;
  for (const m of s.matchAll(INLINE)) {
    const i = m.index ?? 0;
    if (i > last) out.push({ t: "text", v: s.slice(last, i) });
    // Models sometimes bold a whole sentence; emphasis only works on short phrases.
    if (m[1]) {
      if (m[2].trim().split(/\s+/).length > MAX_BOLD_WORDS) out.push(...parseInline(m[2]));
      else out.push({ t: "strong", c: parseInline(m[2]) });
    }
    else if (m[3]) out.push({ t: "code", v: m[4] });
    else if (m[5]) {
      const href = safeHref(m[7]);
      out.push(href ? { t: "link", href, c: parseInline(m[6]) } : { t: "text", v: m[6] });
    } else if (m[8]) {
      // Models often attach a citation straight to the word before it.
      const prev = out.at(-1);
      if (prev && prev.t !== "cite" && !(prev.t === "text" && /\s$/.test(prev.v))) out.push({ t: "text", v: " " });
      for (const n of m[9].split(",")) out.push({ t: "cite", n: Number(n.trim()) });
    }
    else if (m[10]) out.push({ t: "em", c: parseInline(m[11]) });
    else if (m[12]) out.push({ t: "em", c: parseInline(m[13]) });
    else if (m[14]) {
      const href = safeHref(m[15]);
      out.push(href ? { t: "link", href, c: [{ t: "text", v: urlLabel(href) }] } : { t: "text", v: m[15] });
    }
    last = i + m[0].length;
  }
  if (last < s.length) out.push({ t: "text", v: s.slice(last) });
  for (let k = 0; k < out.length; k++) {
    const n = out[k];
    // "React + Express" reads as notation; answers join words with "and".
    if (n.t === "text" && n.v.includes(" + ")) out[k] = { t: "text", v: n.v.replace(/(\w|\)) \+ (?=[A-Za-z])/g, "$1 and ") };
  }
  // "React [2] ." → "React [2]." — no gap between a citation and the punctuation after it.
  for (let k = 1; k < out.length; k++) {
    const n = out[k];
    if (out[k - 1].t === "cite" && n.t === "text" && /^\s+[.,;:!?)]/.test(n.v)) out[k] = { t: "text", v: n.v.replace(/^\s+/, "") };
  }
  return out;
}

export function parseMarkdown(src: string): Block[] {
  const lines = src.replace(/\r/g, "").split("\n");
  const blocks: Block[] = [];
  let para: string[] = [];
  const flush = () => {
    if (!para.length) return;
    const text = para.join(" ");
    para = [];
    // A "Links:" line keeps only real links: names whose link was removed would read as dead text.
    if (/^links:/i.test(text)) {
      const links = parseInline(text).filter((n) => n.t === "link");
      if (!links.length) return;
      const c: Inline[] = [{ t: "text", v: "Links: " }];
      links.forEach((l, i) => { if (i) c.push({ t: "text", v: " · " }); c.push(l); });
      blocks.push({ t: "p", c });
      return;
    }
    blocks.push({ t: "p", c: parseInline(text) });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^```/.test(line)) {
      flush();
      const code: string[] = [];
      while (++i < lines.length && !/^```/.test(lines[i])) code.push(lines[i]);
      blocks.push({ t: "pre", v: code.join("\n") });
      continue;
    }
    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    if (h) { flush(); blocks.push({ t: "h", level: h[1].length, c: parseInline(h[2]) }); continue; }
    // A line that starts with a bold label ("**Stack:** React") is a list item even without a marker,
    // so label-per-line answers don't run together into one paragraph.
    const labelled = /^\s*\*\*[^*\n]{1,40}(?::\*\*|\*\*\s*[:\u2013\u2014-])\s*\S/.test(line) ? `- ${line.trim()}` : line;
    const li = /^\s*([-*•]|\d+[.)])\s+(.*)$/.exec(labelled);
    if (li) {
      flush();
      const kind = /\d/.test(li[1]) ? "ol" : "ul";
      const prev = blocks[blocks.length - 1];
      if (prev && prev.t === kind) prev.items.push(parseInline(li[2]));
      else blocks.push({ t: kind, items: [parseInline(li[2])] });
      continue;
    }
    if (!line.trim()) { flush(); continue; }
    para.push(line.trim());
  }
  flush();
  return blocks;
}

/**
 * A deliberately small Markdown parser for assistant answers → a plain block/inline tree that
 * React renders as elements (never innerHTML). Supports paragraphs, headings, bullet/numbered
 * lists, fenced code, **bold**, *italic*, `code`, [links](url) and citations like [2].
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

/** Only http(s), mailto, same-site paths and in-app `app:` targets are ever linked. */
export function safeHref(href: string): string | null {
  const h = href.trim();
  if (/^(https?:\/\/|mailto:)/i.test(h)) return h;
  if (/^app:[a-z-]+$/i.test(h)) return h;
  if (/^\/(?!\/)/.test(h)) return h;
  return null;
}

const INLINE = /(\*\*([^*]+)\*\*)|(`([^`]+)`)|(\[([^\]]+)\]\(([^)\s]+)\))|(\[(\d+(?:\s*,\s*\d+)*)\])|(\*([^*\s][^*]*)\*)|(_([^_\s][^_]*)_)/g;

export function parseInline(s: string): Inline[] {
  const out: Inline[] = [];
  let last = 0;
  for (const m of s.matchAll(INLINE)) {
    const i = m.index ?? 0;
    if (i > last) out.push({ t: "text", v: s.slice(last, i) });
    if (m[1]) out.push({ t: "strong", c: parseInline(m[2]) });
    else if (m[3]) out.push({ t: "code", v: m[4] });
    else if (m[5]) {
      const href = safeHref(m[7]);
      out.push(href ? { t: "link", href, c: parseInline(m[6]) } : { t: "text", v: m[6] });
    } else if (m[8]) for (const n of m[9].split(",")) out.push({ t: "cite", n: Number(n.trim()) });
    else if (m[10]) out.push({ t: "em", c: parseInline(m[11]) });
    else if (m[12]) out.push({ t: "em", c: parseInline(m[13]) });
    last = i + m[0].length;
  }
  if (last < s.length) out.push({ t: "text", v: s.slice(last) });
  return out;
}

export function parseMarkdown(src: string): Block[] {
  const lines = src.replace(/\r/g, "").split("\n");
  const blocks: Block[] = [];
  let para: string[] = [];
  const flush = () => { if (para.length) { blocks.push({ t: "p", c: parseInline(para.join(" ")) }); para = []; } };

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
    const li = /^\s*([-*•]|\d+[.)])\s+(.*)$/.exec(line);
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

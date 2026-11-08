/** ~4 characters per token for English prose/code — good enough for budgeting chunk sizes. */
export const estimateTokens = (s: string) => Math.ceil(s.length / 4);

/**
 * Split text into ~chunkTokens pieces with ~overlapTokens of trailing context carried into the
 * next piece. Breaks on blank lines first, then lines, then sentences, so headings stay with
 * their paragraphs where possible.
 */
export function chunkText(text: string, opts: { chunkTokens?: number; overlapTokens?: number } = {}): string[] {
  const maxChars = (opts.chunkTokens ?? 700) * 4;
  const overlapChars = (opts.overlapTokens ?? 100) * 4;
  const normalized = text.replace(/\r\n/g, "\n").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (!normalized) return [];
  if (normalized.length <= maxChars) return [normalized];

  const units = splitUnits(normalized, maxChars);
  const chunks: string[] = [];
  let cur = "";
  for (const u of units) {
    if (cur && cur.length + u.length + 2 > maxChars) {
      chunks.push(cur.trim());
      const tail = cur.slice(-overlapChars);
      const cut = tail.search(/\s/);
      cur = (cut >= 0 ? tail.slice(cut + 1) : tail) + "\n\n" + u;
    } else {
      cur = cur ? `${cur}\n\n${u}` : u;
    }
  }
  if (cur.trim()) chunks.push(cur.trim());
  return chunks;
}

function splitUnits(text: string, maxChars: number): string[] {
  const out: string[] = [];
  for (const para of text.split(/\n\n+/)) {
    if (para.length <= maxChars) { out.push(para); continue; }
    const pieces = para.includes("\n") ? para.split("\n") : para.split(/(?<=[.!?])\s+/);
    for (const p of pieces) {
      if (p.length <= maxChars) out.push(p);
      else for (let i = 0; i < p.length; i += maxChars) out.push(p.slice(i, i + maxChars));
    }
  }
  return out;
}

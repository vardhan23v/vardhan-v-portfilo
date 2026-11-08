import { createHash } from "node:crypto";
import type { EmbeddingProvider } from "./types.js";

/**
 * Deterministic bag-of-words hashing embedder. No network, no semantics beyond shared terms —
 * for tests and offline development only (EMBEDDING_PROVIDER=hash). Not for production.
 */
export class HashEmbeddings implements EmbeddingProvider {
  readonly name = "hash";
  readonly model = "hash-bow-v1";
  private readonly dims: number;
  constructor(dims = 1536) { this.dims = dims; }
  getDimensions() { return this.dims; }

  async embedText(text: string): Promise<number[]> {
    const v = new Array<number>(this.dims).fill(0);
    const words = text.toLowerCase().match(/[a-z0-9]+/g) ?? [];
    for (const w of words) {
      if (w.length < 2) continue;
      const h = createHash("md5").update(w).digest();
      const idx = h.readUInt32LE(0) % this.dims;
      v[idx] += h[4] & 1 ? 1 : -1;
    }
    const norm = Math.hypot(...v) || 1;
    return v.map((x) => x / norm);
  }

  async embedDocuments(texts: string[]) {
    return Promise.all(texts.map((t) => this.embedText(t)));
  }
}

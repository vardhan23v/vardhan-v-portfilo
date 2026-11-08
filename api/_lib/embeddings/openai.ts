import { AppError } from "../errors.js";
import { fetchWithRetry } from "../retry.js";
import type { EmbeddingProvider } from "./types.js";

/**
 * Any OpenAI-compatible /embeddings endpoint (OpenAI, Azure-compatible gateways, Together, Jina …).
 * Default: OpenAI text-embedding-3-small at 1536 dimensions — matches vector(1536) in the migration.
 */
export class OpenAICompatibleEmbeddings implements EmbeddingProvider {
  readonly name = "openai-compatible";
  readonly model: string;
  private readonly dims: number;
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly fetchImpl?: typeof fetch;

  constructor(opts: { apiKey: string; baseUrl: string; model: string; dimensions: number; fetchImpl?: typeof fetch }) {
    this.apiKey = opts.apiKey;
    this.baseUrl = opts.baseUrl.replace(/\/$/, "");
    this.model = opts.model;
    this.dims = opts.dimensions;
    this.fetchImpl = opts.fetchImpl;
  }

  getDimensions() { return this.dims; }

  async embedText(text: string) {
    return (await this.embedDocuments([text]))[0];
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    const out: number[][] = [];
    for (let i = 0; i < texts.length; i += 64) {
      const batch = texts.slice(i, i + 64);
      const res = await fetchWithRetry(
        `${this.baseUrl}/embeddings`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model: this.model, input: batch, dimensions: this.dims }),
        },
        { timeoutMs: 20_000, label: "embeddings", fetchImpl: this.fetchImpl },
      );
      const body = (await res.json()) as { data?: { index: number; embedding: number[] }[] };
      const rows = [...(body.data ?? [])].sort((a, b) => a.index - b.index).map((d) => d.embedding);
      if (rows.length !== batch.length || rows.some((r) => r.length !== this.dims)) {
        throw new AppError(502, "embedding_mismatch", "Embedding service returned unexpected dimensions.");
      }
      out.push(...rows);
    }
    return out;
  }
}

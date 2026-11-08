import type { ServerConfig } from "../config.js";
import { AppError } from "../errors.js";
import { HashEmbeddings } from "./hash.js";
import { OpenAICompatibleEmbeddings } from "./openai.js";
import type { EmbeddingProvider } from "./types.js";

export function createEmbeddingProvider(cfg: ServerConfig): EmbeddingProvider {
  if (cfg.EMBEDDING_PROVIDER === "hash") return new HashEmbeddings(cfg.EMBEDDING_DIMENSIONS);
  if (!cfg.EMBEDDING_API_KEY) throw new AppError(503, "not_configured", "The assistant is not configured yet.");
  return new OpenAICompatibleEmbeddings({
    apiKey: cfg.EMBEDDING_API_KEY,
    baseUrl: cfg.EMBEDDING_BASE_URL,
    model: cfg.EMBEDDING_MODEL,
    dimensions: cfg.EMBEDDING_DIMENSIONS,
  });
}
export type { EmbeddingProvider };

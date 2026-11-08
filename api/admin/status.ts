import { requireAdmin } from "../_lib/auth.js";
import { getConfig } from "../_lib/config.js";
import { errorResponse, json } from "../_lib/http.js";
import { createStore } from "../_lib/supabaseStore.js";

/** Index health: document counts per source, chunk count, recent ingestion jobs, active config. */
export async function GET(req: Request) {
  try {
    requireAdmin(req);
    const cfg = getConfig();
    const status = await createStore(cfg).status();
    return json({
      ...status,
      config: {
        chatModel: cfg.GROQ_MODEL,
        embeddingProvider: cfg.EMBEDDING_PROVIDER,
        embeddingModel: cfg.EMBEDDING_MODEL,
        embeddingDimensions: cfg.EMBEDDING_DIMENSIONS,
        topK: cfg.RAG_TOP_K,
        similarityThreshold: cfg.RAG_SIMILARITY_THRESHOLD,
        githubUser: cfg.GITHUB_USERNAME,
        githubTokenConfigured: Boolean(cfg.GITHUB_TOKEN),
      },
    });
  } catch (err) {
    return errorResponse(err, null);
  }
}

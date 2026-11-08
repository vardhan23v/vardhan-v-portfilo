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
    const models = cfg.GROQ_API_KEY
      ? await fetch("https://api.groq.com/openai/v1/models", { headers: { Authorization: `Bearer ${cfg.GROQ_API_KEY}` }, signal: AbortSignal.timeout(5000) })
          .then((r) => r.json() as Promise<{ data?: { id: string }[] }>)
          .then((b) => b.data?.map((m) => m.id) ?? [])
          .catch(() => [])
      : [];
    return json({
      ...status,
      config: {
        chatModel: cfg.GROQ_MODEL,
        fallbackModel: cfg.GROQ_FALLBACK_MODEL,
        backupModel: cfg.GROQ_BACKUP_MODEL,
        availableChatModels: models,
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

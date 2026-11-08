import { requireAdmin } from "../_lib/auth.js";
import { getConfig } from "../_lib/config.js";
import { createEmbeddingProvider } from "../_lib/embeddings/index.js";
import { errorResponse, json, readJsonLimited } from "../_lib/http.js";
import { createStore } from "../_lib/supabaseStore.js";
import { runSync } from "../_lib/sync.js";
import { syncRequestSchema } from "../_lib/validation.js";
import { AppError } from "../_lib/errors.js";

export const config = { maxDuration: 300 };

/** Vercel Cron calls GET with `Authorization: Bearer $CRON_SECRET` (incremental, all sources). */
export async function GET(req: Request) {
  try {
    requireAdmin(req);
    const cfg = getConfig();
    const results = await runSync({ cfg, store: createStore(cfg), embedder: createEmbeddingProvider(cfg) }, ["portfolio", "resume", "github"], false);
    return json({ results });
  } catch (err) {
    return errorResponse(err, null);
  }
}

/** Manual sync: `{ "sources": ["github"], "force": false }` with `Authorization: Bearer $ADMIN_TOKEN`. */
export async function POST(req: Request) {
  try {
    if (requireAdmin(req) !== "admin") throw new AppError(403, "forbidden", "Forbidden.");
    const parsed = syncRequestSchema.safeParse(await readJsonLimited(req, 4096));
    if (!parsed.success) throw new AppError(400, "invalid_request", "Invalid sync request.");
    const cfg = getConfig();
    const results = await runSync({ cfg, store: createStore(cfg), embedder: createEmbeddingProvider(cfg) }, parsed.data.sources, parsed.data.force);
    return json({ results });
  } catch (err) {
    return errorResponse(err, null);
  }
}

import { requireAdmin } from "../_lib/auth.js";
import { getConfig } from "../_lib/config.js";
import { createEmbeddingProvider } from "../_lib/embeddings/index.js";
import { AppError } from "../_lib/errors.js";
import { errorResponse, json, readBodyLimited } from "../_lib/http.js";
import { MAX_PDF_BYTES } from "../_lib/ingest/pdf.js";
import { createStore } from "../_lib/supabaseStore.js";
import { ingestUploadedResume } from "../_lib/sync.js";

export const config = { maxDuration: 120 };

/**
 * Upload a resume PDF as the raw request body:
 *   curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/pdf" \
 *        --data-binary @resume.pdf https://<host>/api/admin/resume
 * Only the extracted text is indexed; the PDF is never stored or exposed.
 */
export async function POST(req: Request) {
  try {
    if (requireAdmin(req) !== "admin") throw new AppError(403, "forbidden", "Forbidden.");
    if (!(req.headers.get("content-type") ?? "").startsWith("application/pdf")) throw new AppError(415, "unsupported_media_type", "Expected application/pdf.");
    const bytes = await readBodyLimited(req, MAX_PDF_BYTES);
    const cfg = getConfig();
    const result = await ingestUploadedResume({ cfg, store: createStore(cfg), embedder: createEmbeddingProvider(cfg) }, bytes, "Resume (uploaded)");
    return json(result, result.ok ? 200 : 422);
  } catch (err) {
    return errorResponse(err, null);
  }
}

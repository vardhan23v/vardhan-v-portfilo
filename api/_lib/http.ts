import { getConfig } from "./config.js";
import { AppError, toPublicError } from "./errors.js";

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
  "Cache-Control": "no-store",
};

export function allowedOrigins(): string[] {
  const cfg = getConfig();
  const extra = cfg.ALLOWED_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean);
  const list = [new URL(cfg.SITE_URL).origin, ...extra];
  if (process.env.VERCEL_ENV !== "production") list.push("http://localhost:5173", "http://localhost:4173", "http://localhost:3000");
  return list;
}

/**
 * Browsers send Origin on cross-origin and on same-origin POSTs. A request with no Origin is a
 * non-browser client (curl, cron) — allowed, but still rate-limited.
 */
export function checkOrigin(req: Request): string | null {
  const origin = req.headers.get("origin");
  if (!origin) return null;
  const self = new URL(req.url).origin;
  if (origin === self || allowedOrigins().includes(origin)) return origin;
  throw new AppError(403, "forbidden_origin", "This origin is not allowed.");
}

export function headers(origin: string | null, extra: Record<string, string> = {}): Headers {
  const h = new Headers({ ...SECURITY_HEADERS, ...extra });
  if (origin) {
    h.set("Access-Control-Allow-Origin", origin);
    h.set("Vary", "Origin");
  }
  return h;
}

export function preflight(req: Request, methods: string): Response {
  try {
    const origin = checkOrigin(req);
    const h = headers(origin, {
      "Access-Control-Allow-Methods": methods,
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "600",
    });
    return new Response(null, { status: 204, headers: h });
  } catch (err) {
    return errorResponse(err, null);
  }
}

export function json(body: unknown, status = 200, origin: string | null = null): Response {
  return new Response(JSON.stringify(body), { status, headers: headers(origin, { "Content-Type": "application/json" }) });
}

export function errorResponse(err: unknown, origin: string | null): Response {
  const e = toPublicError(err);
  const extra: Record<string, string> = { "Content-Type": "application/json" };
  if (e.retryAfter) extra["Retry-After"] = String(e.retryAfter);
  return new Response(JSON.stringify({ error: { code: e.code, message: e.message } }), { status: e.status, headers: headers(origin, extra) });
}

/** Read a body with a hard byte cap (Content-Length is advisory, so the stream is counted too). */
export async function readBodyLimited(req: Request, maxBytes: number): Promise<Uint8Array> {
  const declared = Number(req.headers.get("content-length") ?? "0");
  if (declared > maxBytes) throw new AppError(413, "too_large", "Request body is too large.");
  if (!req.body) return new Uint8Array();
  const reader = req.body.getReader();
  const parts: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new AppError(413, "too_large", "Request body is too large.");
    }
    parts.push(value);
  }
  const out = new Uint8Array(total);
  let off = 0;
  for (const p of parts) { out.set(p, off); off += p.byteLength; }
  return out;
}

export async function readJsonLimited(req: Request, maxBytes: number): Promise<unknown> {
  const type = req.headers.get("content-type") ?? "";
  if (!type.includes("application/json")) throw new AppError(415, "unsupported_media_type", "Expected application/json.");
  const bytes = await readBodyLimited(req, maxBytes);
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new AppError(400, "invalid_json", "Request body is not valid JSON.");
  }
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd?.split(",")[0] ?? req.headers.get("x-real-ip") ?? "unknown").trim();
}

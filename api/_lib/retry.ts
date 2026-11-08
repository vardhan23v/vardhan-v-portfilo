import { AppError } from "./errors.js";

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function isTransient(status: number) {
  return status === 408 || status === 409 || status === 429 || status >= 500;
}

/** fetch with a per-attempt timeout and bounded exponential backoff on transient failures. */
export async function fetchWithRetry(
  url: string,
  init: RequestInit,
  opts: { timeoutMs: number; retries?: number; fetchImpl?: typeof fetch; label: string },
): Promise<Response> {
  const retries = opts.retries ?? 2;
  const f = opts.fetchImpl ?? fetch;
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await f(url, { ...init, signal: AbortSignal.timeout(opts.timeoutMs) });
      if (res.ok) return res;
      if (!isTransient(res.status) || attempt === retries) {
        const detail = (await res.text().catch(() => "")).slice(0, 300).replace(/sk-[A-Za-z0-9_-]+|gsk_[A-Za-z0-9]+/g, "[key]");
        console.error(`[${opts.label}] HTTP ${res.status}: ${detail}`);
        if (res.status === 429) {
          const ra = Number(res.headers.get("retry-after") ?? "30");
          throw new AppError(503, "upstream_busy", "The assistant is busy right now. Please try again shortly.", { retryAfter: Number.isFinite(ra) ? Math.ceil(ra) : 30 });
        }
        throw new AppError(502, "upstream_error", "The assistant service returned an error.", { cause: new Error(`${opts.label} HTTP ${res.status}`) });
      }
      const ra = Number(res.headers.get("retry-after"));
      await sleep(Number.isFinite(ra) && ra > 0 ? Math.min(ra * 1000, 4000) : 300 * 2 ** attempt);
    } catch (err) {
      if (err instanceof AppError) throw err;
      lastErr = err;
      const timedOut = err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError");
      if (attempt === retries) {
        throw new AppError(timedOut ? 504 : 502, timedOut ? "upstream_timeout" : "upstream_unreachable", timedOut ? "The assistant took too long to respond. Please try again." : "The assistant service is unreachable.", { cause: err });
      }
      await sleep(300 * 2 ** attempt);
    }
  }
  throw new AppError(502, "upstream_unreachable", "The assistant service is unreachable.", { cause: lastErr });
}

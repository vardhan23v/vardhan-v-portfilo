/** An error whose `publicMessage` is safe to show a visitor. Everything else is reported generically. */
export class AppError extends Error {
  readonly status: number;
  readonly code: string;
  readonly publicMessage: string;
  readonly retryAfter?: number;

  constructor(status: number, code: string, publicMessage: string, opts: { cause?: unknown; retryAfter?: number } = {}) {
    super(publicMessage, { cause: opts.cause });
    this.status = status;
    this.code = code;
    this.publicMessage = publicMessage;
    this.retryAfter = opts.retryAfter;
  }
}

export function toPublicError(err: unknown): { status: number; code: string; message: string; retryAfter?: number } {
  if (err instanceof AppError) return { status: err.status, code: err.code, message: err.publicMessage, retryAfter: err.retryAfter };
  return { status: 500, code: "internal", message: "Something went wrong. Please try again." };
}

/** Log server-side without leaking secrets (keys/tokens are redacted from messages). */
export function logError(scope: string, err: unknown) {
  const msg = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
  console.error(`[${scope}]`, redact(msg));
}

export function redact(s: string): string {
  return s
    .replace(/(gsk_|sk-|ghp_|github_pat_|eyJ)[A-Za-z0-9_\-.]{8,}/g, "[redacted]")
    .replace(/(Bearer\s+)[^\s"']+/gi, "$1[redacted]");
}

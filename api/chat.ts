import { CHAT_LIMITS } from "../src/lib/ai/types.js";
import { streamChat } from "./_lib/chat.js";
import { getConfig } from "./_lib/config.js";
import { createEmbeddingProvider } from "./_lib/embeddings/index.js";
import { AppError, logError } from "./_lib/errors.js";
import { sha256 } from "./_lib/hash.js";
import { checkOrigin, clientIp, errorResponse, headers, preflight, readJsonLimited } from "./_lib/http.js";
import { GroqProvider } from "./_lib/llm/groq.js";
import { RateLimiter } from "./_lib/rateLimit.js";
import { createStore } from "./_lib/supabaseStore.js";
import { parseChatRequest } from "./_lib/validation.js";

export const config = { maxDuration: 60 };

let limiter: RateLimiter | null = null;

export function OPTIONS(req: Request) {
  return preflight(req, "POST, OPTIONS");
}

export async function POST(req: Request): Promise<Response> {
  let origin: string | null = null;
  try {
    origin = checkOrigin(req);
    const cfg = getConfig();
    limiter ??= new RateLimiter(cfg.RATE_LIMIT_PER_MINUTE, cfg.RATE_LIMIT_PER_DAY);

    const body = parseChatRequest(await readJsonLimited(req, CHAT_LIMITS.maxBodyBytes));
    const ipHash = sha256(`ip:${clientIp(req)}`).slice(0, 32);
    limiter.hit([`ip:${ipHash}`, `s:${body.sessionId}`]);

    if (!cfg.GROQ_API_KEY) throw new AppError(503, "not_configured", "The assistant is not configured yet.");
    const store = createStore(cfg);
    const embedder = createEmbeddingProvider(cfg);
    const llm = new GroqProvider({ apiKey: cfg.GROQ_API_KEY, model: cfg.GROQ_MODEL, timeoutMs: cfg.GROQ_TIMEOUT_MS });

    const stream = streamChat(body, {
      store, embedder, llm, cfg,
      onComplete: (answer, sources) =>
        store.logChat?.({ clientSessionId: body.sessionId, ipHash, surface: body.surface, question: body.messages[body.messages.length - 1].content, answer, sources })
          .catch((e) => logError("chat-log", e)),
    });
    return new Response(stream, {
      status: 200,
      headers: headers(origin, { "Content-Type": "text/event-stream; charset=utf-8", "X-Accel-Buffering": "no", Connection: "keep-alive" }),
    });
  } catch (err) {
    if (!(err instanceof AppError)) logError("chat", err);
    return errorResponse(err, origin);
  }
}

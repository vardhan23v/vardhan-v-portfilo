import { AppError } from "../errors.js";
import { fetchWithRetry } from "../retry.js";
import { readSSE } from "./sse.js";
import type { LLMMessage, LLMProvider } from "./types.js";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// Shared across requests in a warm function, so one request's usage informs the next.
// Groq's limits are per model, so each model keeps its own reading.
const remainingTokens = new Map<string, number>();

export class GroqProvider implements LLMProvider {
  readonly name = "groq";
  readonly model: string;
  private readonly fallbackModels: string[];
  private readonly apiKey: string;
  private readonly timeoutMs: number;
  private readonly fetchImpl?: typeof fetch;

  constructor(opts: { apiKey: string; model: string; fallbackModels?: string[]; timeoutMs: number; fetchImpl?: typeof fetch }) {
    this.apiKey = opts.apiKey;
    this.model = opts.model;
    this.fallbackModels = [...new Set(opts.fallbackModels ?? [])].filter((m) => m && m !== opts.model);
    this.timeoutMs = opts.timeoutMs;
    this.fetchImpl = opts.fetchImpl;
  }

  /** Tokens left this minute for this provider's main model, when known. */
  tokensRemaining() {
    return remainingTokens.get(this.model);
  }

  async *streamChat(messages: LLMMessage[], opts: { temperature?: number; maxTokens?: number; reasoningEffort?: "low" | "medium" | "high" } = {}): AsyncIterable<string> {
    const request = (model: string, failFastOn429: boolean) => fetchWithRetry(
      GROQ_URL,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages,
          stream: true,
          temperature: opts.temperature ?? 0.2,
          // Reasoning tokens count against this limit on gpt-oss models.
          max_tokens: opts.maxTokens ?? 1100,
          ...(model.includes("gpt-oss") ? { reasoning_effort: opts.reasoningEffort ?? "medium", include_reasoning: false } : {}),
          ...(model.includes("qwen") ? { reasoning_format: "hidden" } : {}),
        }),
      },
      { timeoutMs: this.timeoutMs, label: "groq", fetchImpl: this.fetchImpl, failFastOn429 },
    );
    // Rate limits are per model, so the next model usually still has capacity.
    const models = [this.model, ...this.fallbackModels];
    let res: Response | undefined;
    let served = this.model;
    for (const [i, model] of models.entries()) {
      const last = i === models.length - 1;
      try {
        res = await request(model, !last);
        served = model;
        break;
      } catch (err) {
        if (last || !(err instanceof AppError) || err.code !== "upstream_busy") throw err;
      }
    }
    if (!res) throw new AppError(503, "upstream_busy", "The assistant is busy right now. Please try again shortly.");
    const left = Number(res.headers.get("x-ratelimit-remaining-tokens"));
    if (Number.isFinite(left) && res.headers.has("x-ratelimit-remaining-tokens")) remainingTokens.set(served, left);
    if (!res.body) throw new AppError(502, "upstream_error", "The assistant service returned an empty response.");
    for await (const data of readSSE(res.body)) {
      if (data === "[DONE]") return;
      let parsed: { choices?: { delta?: { content?: string } }[]; error?: unknown };
      try { parsed = JSON.parse(data); } catch { continue; }
      if (parsed.error) throw new AppError(502, "upstream_error", "The assistant service returned an error.");
      const delta = parsed.choices?.[0]?.delta?.content;
      if (delta) yield delta;
    }
  }
}

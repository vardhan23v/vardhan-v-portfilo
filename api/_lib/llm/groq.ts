import { AppError } from "../errors.js";
import { fetchWithRetry } from "../retry.js";
import { readSSE } from "./sse.js";
import type { LLMMessage, LLMProvider } from "./types.js";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// Shared across requests in a warm function, so one request's usage informs the next.
let remainingTokens: number | undefined;

export class GroqProvider implements LLMProvider {
  readonly name = "groq";
  readonly model: string;
  private readonly fallbackModel?: string;
  private readonly apiKey: string;
  private readonly timeoutMs: number;
  private readonly fetchImpl?: typeof fetch;

  constructor(opts: { apiKey: string; model: string; fallbackModel?: string; timeoutMs: number; fetchImpl?: typeof fetch }) {
    this.apiKey = opts.apiKey;
    this.model = opts.model;
    this.fallbackModel = opts.fallbackModel && opts.fallbackModel !== opts.model ? opts.fallbackModel : undefined;
    this.timeoutMs = opts.timeoutMs;
    this.fetchImpl = opts.fetchImpl;
  }

  tokensRemaining() {
    return remainingTokens;
  }

  async *streamChat(messages: LLMMessage[], opts: { temperature?: number; maxTokens?: number; reasoningEffort?: "low" | "medium" | "high" } = {}): AsyncIterable<string> {
    const request = (model: string) => fetchWithRetry(
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
        }),
      },
      { timeoutMs: this.timeoutMs, label: "groq", fetchImpl: this.fetchImpl },
    );
    let res: Response;
    try {
      res = await request(this.model);
    } catch (err) {
      // Rate limits are per model, so a smaller model usually still has capacity.
      if (!this.fallbackModel || !(err instanceof AppError) || err.code !== "upstream_busy") throw err;
      res = await request(this.fallbackModel);
    }
    const left = Number(res.headers.get("x-ratelimit-remaining-tokens"));
    if (Number.isFinite(left) && res.headers.has("x-ratelimit-remaining-tokens")) remainingTokens = left;
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

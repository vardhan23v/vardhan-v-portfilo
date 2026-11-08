import { AppError } from "../errors.js";
import { fetchWithRetry } from "../retry.js";
import { readSSE } from "./sse.js";
import type { LLMMessage, LLMProvider } from "./types.js";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export class GroqProvider implements LLMProvider {
  readonly name = "groq";
  readonly model: string;
  private readonly apiKey: string;
  private readonly timeoutMs: number;
  private readonly fetchImpl?: typeof fetch;

  constructor(opts: { apiKey: string; model: string; timeoutMs: number; fetchImpl?: typeof fetch }) {
    this.apiKey = opts.apiKey;
    this.model = opts.model;
    this.timeoutMs = opts.timeoutMs;
    this.fetchImpl = opts.fetchImpl;
  }

  async *streamChat(messages: LLMMessage[], opts: { temperature?: number; maxTokens?: number } = {}): AsyncIterable<string> {
    const res = await fetchWithRetry(
      GROQ_URL,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.model,
          messages,
          stream: true,
          temperature: opts.temperature ?? 0.2,
          max_tokens: opts.maxTokens ?? 700,
        }),
      },
      { timeoutMs: this.timeoutMs, label: "groq", fetchImpl: this.fetchImpl },
    );
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

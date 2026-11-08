export interface LLMMessage { role: "system" | "user" | "assistant"; content: string }

export interface LLMProvider {
  readonly name: string;
  readonly model: string;
  /** Tokens left in the provider's current rate-limit window, when known. */
  tokensRemaining?(): number | undefined;
  /** Yields text deltas as they arrive. */
  streamChat(messages: LLMMessage[], opts?: { temperature?: number; maxTokens?: number; reasoningEffort?: "low" | "medium" | "high" }): AsyncIterable<string>;
}

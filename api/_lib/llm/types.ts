export interface LLMMessage { role: "system" | "user" | "assistant"; content: string }

export interface LLMProvider {
  readonly name: string;
  readonly model: string;
  /** Yields text deltas as they arrive. */
  streamChat(messages: LLMMessage[], opts?: { temperature?: number; maxTokens?: number }): AsyncIterable<string>;
}

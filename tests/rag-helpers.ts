import { HashEmbeddings } from "../api/_lib/embeddings/hash";
import { MemoryStore } from "../api/_lib/store";
import { ingestDocuments } from "../api/_lib/ingest/pipeline";
import { buildPortfolioDocuments } from "../api/_lib/ingest/portfolio";
import type { LLMProvider, LLMMessage } from "../api/_lib/llm/types";

export async function indexedPortfolio() {
  const store = new MemoryStore();
  const embedder = new HashEmbeddings(512);
  await ingestDocuments("portfolio", buildPortfolioDocuments(), { store, embedder }, { chunkTokens: 700, overlapTokens: 100 });
  return { store, embedder };
}

/** Fake LLM: records the prompt and streams a scripted answer in small pieces. */
export class ScriptedLLM implements LLMProvider {
  readonly name = "scripted";
  readonly model = "scripted";
  calls: LLMMessage[][] = [];
  private readonly answer: string | ((m: LLMMessage[]) => string);
  constructor(answer: string | ((m: LLMMessage[]) => string)) { this.answer = answer; }
  async *streamChat(messages: LLMMessage[]) {
    this.calls.push(messages);
    const a = typeof this.answer === "function" ? this.answer(messages) : this.answer;
    for (let i = 0; i < a.length; i += 7) yield a.slice(i, i + 7);
  }
}

export async function readAll(stream: ReadableStream<Uint8Array>) {
  const text = await new Response(stream).text();
  return text.split("\n\n").filter(Boolean).map((b) => JSON.parse(b.replace(/^data: /, "")));
}

export const RAG_CFG = { RAG_TOP_K: 5, RAG_SIMILARITY_THRESHOLD: 0.15, RAG_MAX_CONTEXT_TOKENS: 3500 };

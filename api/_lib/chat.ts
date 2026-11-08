import { UNSUPPORTED_ANSWER, type ChatStreamEvent, type SourceRef } from "../../src/lib/ai/types.js";
import type { ServerConfig } from "./config.js";
import type { EmbeddingProvider } from "./embeddings/types.js";
import { logError, toPublicError } from "./errors.js";
import type { LLMProvider } from "./llm/types.js";
import { buildMessages, citedNumbers, isUnsupportedAnswer } from "./prompt.js";
import { retrieve, toSourceRef } from "./retrieval.js";
import type { KnowledgeStore } from "./store.js";
import type { ChatRequest } from "./validation.js";

export interface ChatDeps {
  store: KnowledgeStore;
  embedder: EmbeddingProvider;
  llm: LLMProvider;
  cfg: Pick<ServerConfig, "RAG_TOP_K" | "RAG_SIMILARITY_THRESHOLD" | "RAG_MAX_CONTEXT_TOKENS">;
  onComplete?: (answer: string, sources: SourceRef[]) => void | Promise<void>;
}

const enc = new TextEncoder();
const sse = (e: ChatStreamEvent) => enc.encode(`data: ${JSON.stringify(e)}\n\n`);

/**
 * Question → normalize → embed → retrieve/filter/rank → prompt → stream.
 * Sources are emitted after the answer and filtered to the ones it actually cited.
 */
export function streamChat(req: ChatRequest, deps: ChatDeps): ReadableStream<Uint8Array> {
  return new ReadableStream({
    async start(controller) {
      let answer = "";
      try {
        const question = req.messages[req.messages.length - 1].content;
        const chunks = await retrieve(question, deps, {
          topK: deps.cfg.RAG_TOP_K,
          threshold: deps.cfg.RAG_SIMILARITY_THRESHOLD,
          maxContextTokens: deps.cfg.RAG_MAX_CONTEXT_TOKENS,
        });

        if (!chunks.length) {
          answer = UNSUPPORTED_ANSWER;
          controller.enqueue(sse({ type: "token", text: answer }));
          controller.enqueue(sse({ type: "sources", sources: [] }));
          controller.enqueue(sse({ type: "done", supported: false }));
          await deps.onComplete?.(answer, []);
          return;
        }

        for await (const delta of deps.llm.streamChat(buildMessages(req.messages, chunks))) {
          answer += delta;
          controller.enqueue(sse({ type: "token", text: delta }));
        }

        const supported = !isUnsupportedAnswer(answer);
        const cited = citedNumbers(answer);
        const refs = supported
          ? chunks.filter((c) => cited.size === 0 || cited.has(c.n)).map(toSourceRef)
          : [];
        controller.enqueue(sse({ type: "sources", sources: refs }));
        controller.enqueue(sse({ type: "done", supported }));
        await deps.onComplete?.(answer, refs);
      } catch (err) {
        logError("chat", err);
        const e = toPublicError(err);
        controller.enqueue(sse({ type: "error", code: e.code, message: e.message }));
      } finally {
        controller.close();
      }
    },
  });
}

import { UNSUPPORTED_ANSWER, type ChatStreamEvent, type SourceRef } from "../../src/lib/ai/types.js";
import type { ServerConfig } from "./config.js";
import type { EmbeddingProvider } from "./embeddings/types.js";
import { logError, toPublicError } from "./errors.js";
import type { LLMProvider } from "./llm/types.js";
import { buildMessages, citationStream, citedNumbers, isUnsupportedAnswer } from "./prompt.js";
import { planQuestion, type Intent } from "./planner.js";
import { retrieve, toSourceRef } from "./retrieval.js";
import type { KnowledgeStore } from "./store.js";
import type { ChatRequest } from "./validation.js";

export interface ChatDeps {
  store: KnowledgeStore;
  embedder: EmbeddingProvider;
  llm: LLMProvider;
  /** Small model that plans the search; heuristics are used without it. */
  planner?: LLMProvider;
  cfg: Pick<ServerConfig, "RAG_TOP_K" | "RAG_SIMILARITY_THRESHOLD" | "RAG_MAX_CONTEXT_TOKENS">;
  onComplete?: (answer: string, sources: SourceRef[]) => void | Promise<void>;
}

const SMALL_TALK = /^(hi|hii+|hello|hey|hola|namaste|yo|thanks|thank you|thx|ok|okay|cool|nice|great|bye|good (?:morning|afternoon|evening))(?:\s+(?:there|vardhan|vardhan ai))?[\s!.,]*$/i;
const SMALL_TALK_REPLY = "Hi! I can tell you about Vardhan's projects, skills, experience and education. What would you like to know?";

/** How hard the model should think for each kind of question. */
export function effortFor(intent: Intent): { reasoningEffort: "low" | "medium" | "high"; maxTokens: number } {
  if (intent === "judgement" || intent === "comparison") return { reasoningEffort: "high", maxTokens: 1500 };
  if (intent === "fact") return { reasoningEffort: "low", maxTokens: 900 };
  return { reasoningEffort: "medium", maxTokens: 1100 };
}

const REFUSAL_PROBE = 60;
const STRONG_SOURCE = 0.4;
const RETRY_NOTE = "\n\n(The sources above are relevant. Answer from them, stating plainly anything they do not cover.)";
const canon = (s: string) => s.replace(/[’‘]/g, "'").trimStart();

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
        if (SMALL_TALK.test(question.trim())) {
          answer = SMALL_TALK_REPLY;
          controller.enqueue(sse({ type: "token", text: answer }));
          controller.enqueue(sse({ type: "sources", sources: [] }));
          controller.enqueue(sse({ type: "done", supported: true }));
          await deps.onComplete?.(answer, []);
          return;
        }

        const history = req.messages.slice(0, -1);
        const plan = await planQuestion(question, history, deps.planner);
        const chunks = await retrieve(question, deps, {
          history,
          plan,
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

        const messages = buildMessages(req.messages, chunks);
        const hasStrongSource = chunks.some((c) => !c.chunkId.includes(":") && c.chunkId !== "digest" && c.similarity >= STRONG_SOURCE);
        const emit = (text: string) => {
          answer += text;
          controller.enqueue(sse({ type: "token", text }));
        };

        /** Streams one attempt. Text is held back only while it could still be the refusal sentence. */
        const attempt = async (msgs: typeof messages, opts: Parameters<LLMProvider["streamChat"]>[1]): Promise<"answered" | "refused" | "empty"> => {
          const citations = citationStream();
          let held = "";
          let released = false;
          for await (const delta of deps.llm.streamChat(msgs, opts)) {
            const text = citations.push(delta);
            if (!text) continue;
            if (released) { emit(text); continue; }
            held += text;
            const probe = canon(held);
            if (probe.length >= REFUSAL_PROBE && UNSUPPORTED_ANSWER.startsWith(probe.slice(0, REFUSAL_PROBE))) return "refused";
            if (!UNSUPPORTED_ANSWER.startsWith(probe.slice(0, UNSUPPORTED_ANSWER.length))) { released = true; emit(held); }
          }
          const tail = citations.flush();
          if (!released) held += tail; else if (tail) emit(tail);
          if (!released && held.trim()) emit(held);
          return answer.trim() ? "answered" : "empty";
        };

        const first = await attempt(messages, effortFor(plan.intent));
        if (first === "empty") {
          // Reasoning models can spend the whole token limit thinking and return nothing.
          console.error("[chat] model returned an empty answer");
          await attempt(messages, { reasoningEffort: "low", maxTokens: 1400 });
        } else if (first === "refused" && hasStrongSource) {
          const last = messages[messages.length - 1];
          await attempt([...messages.slice(0, -1), { ...last, content: last.content + RETRY_NOTE }], effortFor(plan.intent));
        }

        if (!answer.trim()) {
          answer = UNSUPPORTED_ANSWER;
          controller.enqueue(sse({ type: "token", text: answer }));
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

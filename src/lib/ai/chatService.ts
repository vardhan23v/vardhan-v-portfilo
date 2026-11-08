import { CHAT_LIMITS, type ChatStreamEvent, type ChatSurface, type ChatTurn, type SourceRef } from "./types";

/**
 * The one client for /api/chat — used by the global assistant and the macOS Messages app alike.
 * Never holds credentials: everything sensitive lives in the serverless function.
 */
export class ChatError extends Error {
  readonly code: string;
  readonly retryable: boolean;
  constructor(code: string, message: string, retryable = true) {
    super(message);
    this.code = code;
    this.retryable = retryable;
  }
}

export interface StreamResult { text: string; sources: SourceRef[]; supported: boolean }

export interface StreamOptions {
  messages: ChatTurn[];
  sessionId: string;
  surface: ChatSurface;
  signal?: AbortSignal;
  onToken?: (delta: string, full: string) => void;
  endpoint?: string;
  fetchImpl?: typeof fetch;
}

/** Parse the SSE body into events. Exported for tests. */
export async function* parseEventStream(body: ReadableStream<Uint8Array>): AsyncGenerator<ChatStreamEvent> {
  const reader = body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (value) buf += dec.decode(value, { stream: !done });
    let idx: number;
    while ((idx = buf.indexOf("\n\n")) >= 0) {
      const block = buf.slice(0, idx);
      buf = buf.slice(idx + 2);
      const data = block.split("\n").filter((l) => l.startsWith("data:")).map((l) => l.slice(5).trim()).join("");
      if (!data) continue;
      try { yield JSON.parse(data) as ChatStreamEvent; } catch { /* ignore a malformed frame */ }
    }
    if (done) break;
  }
}

/** Keep the request small: trim history to the last N turns and cap each message. */
export function prepareHistory(messages: ChatTurn[]): ChatTurn[] {
  const trimmed = messages
    .filter((m) => m.content.trim())
    .slice(-CHAT_LIMITS.maxMessages)
    .map((m) => ({ role: m.role, content: m.role === "user" ? m.content.slice(0, CHAT_LIMITS.maxMessageChars) : m.content.slice(0, CHAT_LIMITS.maxMessageChars * 3) }));
  while (trimmed.length && trimmed[0].role !== "user") trimmed.shift();
  return trimmed;
}

export async function streamAnswer(opts: StreamOptions): Promise<StreamResult> {
  const f = opts.fetchImpl ?? fetch;
  let res: Response;
  try {
    res = await f(opts.endpoint ?? "/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: prepareHistory(opts.messages), sessionId: opts.sessionId, surface: opts.surface }),
      signal: opts.signal,
    });
  } catch (err) {
    if ((err as Error)?.name === "AbortError") throw new ChatError("aborted", "Stopped.", true);
    throw new ChatError("network", "Couldn't reach the assistant. Check your connection and try again.");
  }

  if (!res.ok || !res.body) {
    let message = "The assistant is unavailable right now. Please try again.";
    let code = `http_${res.status}`;
    try {
      const j = (await res.json()) as { error?: { code?: string; message?: string } };
      if (j.error?.message) message = j.error.message;
      if (j.error?.code) code = j.error.code;
    } catch { /* non-JSON (e.g. the static host has no /api) */ }
    if (res.status === 404) message = "The assistant isn't available on this deployment yet.";
    throw new ChatError(code, message, res.status !== 400 && res.status !== 413);
  }

  let text = "";
  let sources: SourceRef[] = [];
  let supported = true;
  let finished = false;
  try {
    for await (const ev of parseEventStream(res.body)) {
      if (ev.type === "token") { text += ev.text; opts.onToken?.(ev.text, text); }
      else if (ev.type === "sources") sources = ev.sources;
      else if (ev.type === "done") { supported = ev.supported; finished = true; }
      else if (ev.type === "error") throw new ChatError(ev.code, ev.message);
    }
  } catch (err) {
    if (err instanceof ChatError) throw err;
    if ((err as Error)?.name === "AbortError") throw new ChatError("aborted", "Stopped.", true);
    throw new ChatError("stream", "The answer was interrupted. Please try again.");
  }
  if (!finished) throw new ChatError("stream", "The answer was interrupted. Please try again.");
  return { text, sources, supported };
}

export function getSessionId(): string {
  const KEY = "vardhan-ai-session";
  try {
    const existing = sessionStorage.getItem(KEY);
    if (existing && /^[A-Za-z0-9_-]{8,64}$/.test(existing)) return existing;
    const id = crypto.randomUUID().replace(/-/g, "");
    sessionStorage.setItem(KEY, id);
    return id;
  } catch {
    return Math.random().toString(36).slice(2).padEnd(12, "0");
  }
}

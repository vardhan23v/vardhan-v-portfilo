import { useCallback, useEffect, useRef, useState } from "react";
import { ChatError, getSessionId, streamAnswer } from "./chatService";
import type { ChatSurface, ChatTurn, SourceRef } from "./types";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceRef[];
  status: "streaming" | "done" | "error";
  error?: string;
  supported?: boolean;
  /** Epoch ms when the message was created. */
  at: number;
}

const SAVED_LIMIT = 12;
const savedKey = (surface: ChatSurface) => `vardhan-ai:chat:${surface}`;

/** Only the single global panel keeps its chat across reloads; finished messages only. */
function loadSaved(surface: ChatSurface): ChatMessage[] {
  if (surface !== "global" || typeof sessionStorage === "undefined") return [];
  try {
    const list = JSON.parse(sessionStorage.getItem(savedKey(surface)) ?? "[]") as ChatMessage[];
    return Array.isArray(list) ? list.filter((m) => m.status === "done") : [];
  } catch { return []; }
}

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

/** Conversation state + streaming for any chat surface. */
export function useChat(surface: ChatSurface) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadSaved(surface));
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const sessionRef = useRef<string>("");
  const messagesRef = useRef(messages);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    if (surface !== "global") return;
    try {
      sessionStorage.setItem(savedKey(surface), JSON.stringify(messages.filter((m) => m.status === "done").slice(-SAVED_LIMIT)));
    } catch { /* storage blocked or full: the chat still works for this page */ }
  }, [messages, surface]);

  const run = useCallback(async (history: ChatTurn[], assistantId: string) => {
    sessionRef.current ||= getSessionId();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setBusy(true);
    const patch = (p: Partial<ChatMessage>) => setMessages((ms) => ms.map((m) => (m.id === assistantId ? { ...m, ...p } : m)));
    try {
      const r = await streamAnswer({
        messages: history,
        sessionId: sessionRef.current,
        surface,
        signal: ctrl.signal,
        onToken: (_d, full) => patch({ content: full }),
      });
      patch({ content: r.text, sources: r.sources, supported: r.supported, status: "done" });
    } catch (err) {
      const e = err instanceof ChatError ? err : new ChatError("unknown", "Something went wrong.");
      patch({ status: "error", error: e.message });
    } finally {
      if (abortRef.current === ctrl) abortRef.current = null;
      setBusy(false);
    }
  }, [surface]);

  const historyFor = (ms: ChatMessage[]): ChatTurn[] =>
    ms.filter((m) => m.status === "done" || m.role === "user").map((m) => ({ role: m.role, content: m.content }));

  const send = useCallback((text: string) => {
    const q = text.trim();
    if (!q || abortRef.current) return;
    const user: ChatMessage = { id: uid(), role: "user", content: q, status: "done", at: Date.now() };
    const bot: ChatMessage = { id: uid(), role: "assistant", content: "", status: "streaming", at: Date.now() };
    const next = [...messagesRef.current.filter((m) => m.status !== "error" || m.role === "user"), user];
    setMessages([...next, bot]);
    void run(historyFor(next), bot.id);
  }, [run]);

  /** Re-ask the question behind an assistant message (failed or not). */
  const retry = useCallback((assistantId: string) => {
    if (abortRef.current) return;
    const ms = messagesRef.current;
    const idx = ms.findIndex((m) => m.id === assistantId);
    if (idx < 1) return;
    const before = ms.slice(0, idx);
    const bot: ChatMessage = { id: uid(), role: "assistant", content: "", status: "streaming", at: Date.now() };
    setMessages([...before, bot]);
    void run(historyFor(before), bot.id);
  }, [run]);

  const stop = useCallback(() => abortRef.current?.abort(), []);
  const clear = useCallback(() => { abortRef.current?.abort(); setMessages([]); }, []);

  /** Append a local (non-RAG) exchange, e.g. a navigation intent handled in the browser. */
  const addLocal = useCallback((question: string, reply: string) => {
    setMessages((ms) => [...ms, { id: uid(), role: "user", content: question, status: "done", at: Date.now() }, { id: uid(), role: "assistant", content: reply, status: "done", supported: true, at: Date.now() }]);
  }, []);

  return { messages, busy, send, retry, stop, clear, addLocal };
}

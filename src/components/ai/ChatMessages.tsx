import { useEffect, useRef, useState } from "react";
import { Check, Copy, RotateCcw } from "lucide-react";
import type { ChatMessage } from "../../lib/ai/useChat";
import { Markdown } from "./Markdown";
import { SourceReferences } from "./SourceReferences";

function MessageActions({ m, onRetry }: { m: ChatMessage; onRetry: (id: string) => void }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(m.content.replace(/\s*\[\d+(?:\s*,\s*\d+)*\]/g, ""));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard blocked */ }
  };
  return (
    <div className="pa-msg__actions">
      {m.status === "done" && m.content && (
        <button type="button" onClick={copy} aria-label={copied ? "Copied" : "Copy response"} title="Copy">
          {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
        </button>
      )}
      {m.status !== "streaming" && (
        <button type="button" onClick={() => onRetry(m.id)} aria-label="Retry" title="Retry"><RotateCcw aria-hidden /></button>
      )}
    </div>
  );
}

function AssistantBubble({ m, onRetry }: { m: ChatMessage; onRetry: (id: string) => void }) {
  const [hl, setHl] = useState<number | null>(null);
  const cites = new Set((m.sources ?? []).map((s) => s.n));
  return (
    <div className={`pa-msg pa-msg--bot${m.status === "error" ? " is-error" : ""}`}>
      {m.status === "streaming" && !m.content ? (
        <div className="pa-typing" role="status" aria-label="Assistant is thinking"><i /><i /><i /></div>
      ) : (
        <Markdown className="pa-md" text={m.content} citations={cites} onCite={setHl} />
      )}
      {m.status === "error" && <p className="pa-msg__error" role="alert">{m.error}</p>}
      {m.sources && <SourceReferences sources={m.sources} highlight={hl} />}
      <MessageActions m={m} onRetry={onRetry} />
    </div>
  );
}

export function ChatMessages({ messages, onRetry, empty }: { messages: ChatMessage[]; onRetry: (id: string) => void; empty?: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const last = messages[messages.length - 1];
  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, last?.content, last?.status]);

  return (
    <div className="pa-messages" ref={ref} role="log" aria-live="polite" aria-relevant="additions" aria-busy={last?.status === "streaming"}>
      {messages.length === 0 && empty}
      {messages.map((m) =>
        m.role === "user" ? (
          <div key={m.id} className="pa-msg pa-msg--me"><p>{m.content}</p></div>
        ) : (
          <AssistantBubble key={m.id} m={m} onRetry={onRetry} />
        ),
      )}
    </div>
  );
}

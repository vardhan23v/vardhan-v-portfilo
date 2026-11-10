import { useEffect, useRef, useState, type WheelEvent } from "react";
import { ArrowDown, Check, Copy, RotateCcw } from "lucide-react";
import type { ChatMessage } from "../../lib/ai/useChat";
import { motionReduced } from "../../lib/motion";
import { Markdown } from "./Markdown";
import { SourceReferences } from "./SourceReferences";
import { SuggestedQuestions } from "./SuggestedQuestions";
import { followUps } from "../../lib/ai/followups";

const NEAR_END_PX = 60;

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
          {copied ? <Check className="pa-copied" aria-hidden /> : <Copy aria-hidden />}
        </button>
      )}
      {m.status !== "streaming" && (
        <button type="button" onClick={() => onRetry(m.id)} aria-label="Retry" title="Retry"><RotateCcw aria-hidden /></button>
      )}
    </div>
  );
}

function AssistantBubble({ m, isNew, onRetry }: { m: ChatMessage; isNew: boolean; onRetry: (id: string) => void }) {
  const [hl, setHl] = useState<number | null>(null);
  const cites = new Set((m.sources ?? []).map((s) => s.n));
  return (
    <div className={`pa-msg pa-msg--bot${isNew ? " is-new" : ""}${m.status === "error" ? " is-error" : ""}${m.status === "streaming" && m.content ? " is-streaming" : ""}`}>
      {m.status === "streaming" && !m.content ? (
        <div className="pa-typing" role="status"><span>Thinking</span><i aria-hidden /><i aria-hidden /><i aria-hidden /></div>
      ) : (
        m.content && <Markdown className="pa-md" text={m.content} citations={cites} onCite={setHl} />
      )}
      {m.status === "error" && (
        <div className="pa-error" role="alert">
          <p>{m.error}</p>
          <button type="button" onClick={() => onRetry(m.id)}><RotateCcw aria-hidden />Try again</button>
        </div>
      )}
      {m.sources && <SourceReferences sources={m.sources} highlight={hl} />}
      {m.status !== "error" && <MessageActions m={m} onRetry={onRetry} />}
    </div>
  );
}

export function ChatMessages({ messages, onRetry, onPick, empty }: { messages: ChatMessage[]; onRetry: (id: string) => void; onPick?: (q: string) => void; empty?: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const following = useRef(true);
  const seen = useRef(messages.length);
  // Messages from before this panel opened are history, so they don't replay their entrance.
  const [openedAt] = useState(() => Date.now());
  const [awayFromEnd, setAwayFromEnd] = useState(false);
  const last = messages[messages.length - 1];
  const next = onPick ? followUps(messages) : [];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // A new question always returns to the end; streamed text only follows a reader who stayed there.
    if (messages.length !== seen.current) following.current = true;
    seen.current = messages.length;
    if (following.current) el.scrollTop = el.scrollHeight;
  }, [messages.length, last?.content, last?.status]);

  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    following.current = el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_END_PX;
    setAwayFromEnd(!following.current);
  };

  // Scroll events arrive a frame late, so a fast stream could pull the reader back first.
  const stopFollowing = (e: WheelEvent<HTMLDivElement>) => {
    if (e.deltaY < 0) following.current = false;
  };

  const jumpToEnd = () => {
    following.current = true;
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: motionReduced() ? "auto" : "smooth" });
  };

  return (
    <div className="pa-messages-wrap">
      <div className="pa-messages" ref={ref} onScroll={onScroll} onWheel={stopFollowing} onTouchMove={() => { following.current = false; }} role="log" aria-live="polite" aria-relevant="additions" aria-busy={last?.status === "streaming"}>
        {messages.length === 0 && empty}
        {messages.map((m) =>
          m.role === "user" ? (
            <div key={m.id} className={`pa-msg pa-msg--me${m.at >= openedAt ? " is-new" : ""}`}><p>{m.content}</p></div>
          ) : (
            <AssistantBubble key={m.id} m={m} isNew={m.at >= openedAt} onRetry={onRetry} />
          ),
        )}
        {onPick && next.length > 0 && <SuggestedQuestions variant="chips" items={next} onPick={onPick} />}
      </div>
      <button type="button" className={`pa-jump${awayFromEnd ? " is-visible" : ""}`} onClick={jumpToEnd}><ArrowDown aria-hidden />Latest</button>
    </div>
  );
}

import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type WheelEvent } from "react";
import { ArrowDown, Check, Copy, RotateCcw } from "lucide-react";
import type { ChatMessage } from "../../lib/ai/useChat";
import { assistantMotionOff } from "../../lib/ai/motion";
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

/** Cited row → visible inside the log (never the page behind the panel), then flashed once. */
function revealSource(bubble: HTMLElement) {
  const row = bubble.querySelector<HTMLElement>(".pa-sources li.is-hl");
  const log = bubble.closest<HTMLElement>(".pa-messages");
  if (!row || !log) return;
  const off = assistantMotionOff();
  const r = row.getBoundingClientRect();
  const l = log.getBoundingClientRect();
  // Room for the "Latest" pill and the bottom fade.
  const below = r.bottom - (l.bottom - 44);
  const above = l.top + 8 - r.top;
  const delta = below > 0 ? Math.min(below, r.top - l.top - 8) : above > 0 ? -above : 0;
  if (delta) log.scrollTo({ top: log.scrollTop + delta, behavior: off ? "auto" : "smooth" });
  if (!off) row.firstElementChild?.animate?.([{ opacity: 1 }, { opacity: 0 }], { duration: 900, easing: "ease-out", pseudoElement: "::after" });
}

const AssistantBubble = memo(function AssistantBubble({ m, isNew, onRetry }: { m: ChatMessage; isNew: boolean; onRetry: (id: string) => void }) {
  const [hl, setHl] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const cites = useMemo(() => new Set((m.sources ?? []).map((s) => s.n)), [m.sources]);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  // Open the sources (SourceReferences opens on highlight), bring the row into view, flash it.
  // Clicking the same number again replays the scroll and flash; it never collapses the list.
  const onCite = useCallback((n: number) => {
    const el = ref.current;
    if (!el) return;
    const wasOpen = el.querySelector(".pa-sources")?.hasAttribute("open");
    setHl(n);
    window.clearTimeout(timer.current);
    // 320ms = the ::details-content block-size transition, only when the list has to open.
    timer.current = window.setTimeout(() => revealSource(el), wasOpen || assistantMotionOff() ? 30 : 330);
  }, []);
  return (
    <div ref={ref} className={`pa-msg pa-msg--bot${isNew ? " is-new" : ""}${m.status === "error" ? " is-error" : ""}${m.status === "streaming" && m.content ? " is-streaming" : ""}`}>
      {m.status === "streaming" && !m.content ? (
        <div className="pa-typing" role="status"><span>Thinking</span><i aria-hidden /><i aria-hidden /><i aria-hidden /></div>
      ) : (
        m.content && <Markdown className="pa-md" text={m.content} citations={cites} onCite={onCite} active={hl} />
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
});

export function ChatMessages({ messages, onRetry, onPick, empty }: { messages: ChatMessage[]; onRetry: (id: string) => void; onPick?: (q: string) => void; empty?: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const following = useRef(true);
  const seen = useRef(messages.length);
  // Messages from before this panel opened are history, so they don't replay their entrance.
  const [openedAt] = useState(() => Date.now());
  const [awayFromEnd, setAwayFromEnd] = useState(false);
  const last = messages[messages.length - 1];
  // Follow-ups only exist under a finished answer, so skip the work on every streamed token.
  const next = onPick && last?.status === "done" ? followUps(messages) : [];

  // Before paint, so a newly wrapped line never shows one frame low before the log catches up.
  useLayoutEffect(() => {
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
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: assistantMotionOff() ? "auto" : "smooth" });
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

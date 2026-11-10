import { useCallback, useEffect, useRef, useState, type AnimationEvent, type KeyboardEvent, type PointerEvent } from "react";
import { Sparkles, Trash2, X } from "lucide-react";
import type { useChat } from "../../lib/ai/useChat";
import { assistantMotionOff } from "../../lib/ai/motion";
import { ChatInput } from "./ChatInput";
import { ChatMessages } from "./ChatMessages";
import { SuggestedQuestions } from "./SuggestedQuestions";

type Chat = ReturnType<typeof useChat>;

/** Swipe-to-dismiss only where the panel is a bottom sheet under a finger. */
const SHEET_QUERY = "(max-width: 560px) and (pointer: coarse)";
const DISMISS_PX = 90;
const DISMISS_VELOCITY = 0.5; // px/ms
const SETTLE = { duration: 280, easing: "cubic-bezier(0.22, 1, 0.36, 1)" };
/** How long the empty state takes to lift away before a picked starter question is sent. */
const LEAVE_MS = 160;

interface Drag { id: number; y0: number; t0: number; dy: number; frame: number }

interface Props {
  chat: Chat;
  closing: boolean;
  reopened: boolean;
  onClose: () => void;
  onClosed: () => void;
}

export function AssistantPanel({ chat, closing, reopened, onClose, onClosed }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // Escape closes; stopPropagation keeps the command palette / mac window manager from also reacting.
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") { e.stopPropagation(); onClose(); }
  };
  useEffect(() => {
    // Keep page-level shortcuts (1–7 edition jumps, mac window keys, palette) out of the panel.
    // Stopped at <body>, i.e. after React's own listener on #root has run, so the panel's
    // React handlers (Enter to send, Escape to close) still work.
    const stop = (e: globalThis.KeyboardEvent) => {
      if (ref.current && e.target instanceof Node && ref.current.contains(e.target)) e.stopPropagation();
    };
    document.body.addEventListener("keydown", stop);
    return () => document.body.removeEventListener("keydown", stop);
  }, []);

  // Phones: lift the sheet above the on-screen keyboard, which 100dvh doesn't account for.
  useEffect(() => {
    const vv = window.visualViewport;
    const panel = ref.current;
    if (!vv || !panel) return;
    const fit = () => panel.style.setProperty("--pa-keyboard", `${Math.max(0, window.innerHeight - vv.height - vv.offsetTop)}px`);
    fit();
    vv.addEventListener("resize", fit);
    vv.addEventListener("scroll", fit);
    return () => { vv.removeEventListener("resize", fit); vv.removeEventListener("scroll", fit); };
  }, []);

  // Reopened mid-close: the text box stays mounted, so autoFocus won't run again.
  const wasClosing = useRef(false);
  useEffect(() => {
    if (wasClosing.current && !closing) ref.current?.querySelector("textarea")?.focus({ preventScroll: true });
    wasClosing.current = closing;
  }, [closing]);

  // Starter question: the picked pill confirms, the rest of the empty state lifts away, then it sends.
  const [leaving, setLeaving] = useState(false);
  const pendingPick = useRef<{ q: string; timer: number } | null>(null);
  const { send } = chat;
  const pick = useCallback((q: string) => {
    if (pendingPick.current) return;
    if (assistantMotionOff()) { send(q); return; }
    setLeaving(true);
    pendingPick.current = { q, timer: window.setTimeout(() => { pendingPick.current = null; setLeaving(false); send(q); }, LEAVE_MS) };
  }, [send]);
  // Closed inside that window: still ask, so the click is never lost.
  useEffect(() => () => {
    const p = pendingPick.current;
    if (p) { window.clearTimeout(p.timer); send(p.q); }
  }, [send]);

  // Phones: drag the sheet down by its header to dismiss it.
  const drag = useRef<Drag | null>(null);
  const scrimOf = () => ref.current?.parentElement?.querySelector<HTMLElement>(".pa-scrim") ?? null;
  const onDragStart = (e: PointerEvent<HTMLElement>) => {
    const panel = ref.current;
    if (!panel || closing || drag.current || !e.isPrimary || (e.target as Element).closest("button")) return;
    if (!window.matchMedia(SHEET_QUERY).matches) return;
    // CSS animations override inline transforms, so a drag during the entrance would do nothing.
    if (panel.getAnimations().some((a) => a.playState === "running")) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    panel.querySelector("textarea")?.blur(); // the keyboard offset would move the sheet under the finger
    drag.current = { id: e.pointerId, y0: e.clientY, t0: e.timeStamp, dy: 0, frame: 0 };
  };
  const onDragMove = (e: PointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    d.dy = Math.max(0, e.clientY - d.y0);
    d.frame ||= requestAnimationFrame(() => {
      d.frame = 0;
      const panel = ref.current;
      if (panel) panel.style.transform = `translateY(${d.dy}px)`;
      const scrim = scrimOf();
      if (scrim) scrim.style.opacity = String(1 - Math.min(d.dy / 420, 0.9));
    });
  };
  const onDragEnd = (e: PointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    cancelAnimationFrame(d.frame);
    const panel = ref.current;
    const scrim = scrimOf();
    if (!panel) return;
    const scrimFrom = scrim ? Number(scrim.style.opacity || 1) : 1;
    panel.style.transform = "";
    if (scrim) scrim.style.opacity = "";
    if (!d.dy) return;
    const fast = d.dy / Math.max(1, e.timeStamp - d.t0) > DISMISS_VELOCITY;
    if (e.type === "pointerup" && (d.dy > DISMISS_PX || fast)) {
      // The exit (pa-sheet-out) continues from where the finger let go.
      panel.style.setProperty("--pa-drag", `translateY(${d.dy}px)`);
      scrim?.style.setProperty("--pa-scrim-from", String(scrimFrom));
      onClose();
      return;
    }
    if (assistantMotionOff()) return; // snap back
    panel.animate([{ transform: `translateY(${d.dy}px)` }, { transform: "none" }], SETTLE);
    scrim?.animate([{ opacity: scrimFrom }, { opacity: 1 }], SETTLE);
  };

  // Children animate too and their events bubble here; only the panel's own exit counts.
  const onAnimationEnd = (e: AnimationEvent<HTMLDivElement>) => {
    if (closing && e.target === e.currentTarget) onClosed();
  };

  return (
    <div id="pa-panel" ref={ref} className={`pa-panel${closing ? " is-closing" : ""}${reopened && !closing ? " is-reopened" : ""}`} role="dialog" aria-modal="false" aria-labelledby="pa-title" inert={closing} onKeyDown={onKey} onAnimationEnd={onAnimationEnd}>
      <header className="pa-panel__head" onPointerDown={onDragStart} onPointerMove={onDragMove} onPointerUp={onDragEnd} onPointerCancel={onDragEnd}>
        <span className="pa-panel__mark" aria-hidden><Sparkles /></span>
        <div className="pa-panel__titles">
          <h2 id="pa-title">Vardhan AI</h2>
          <p>Answers from his portfolio, GitHub and resume</p>
        </div>
        {chat.messages.length > 0 && (
          <button type="button" className="pa-icon pa-icon--clear" onClick={chat.clear} aria-label="Clear conversation" title="Clear conversation"><Trash2 aria-hidden /></button>
        )}
        <button type="button" className="pa-icon" onClick={onClose} aria-label="Close assistant"><X aria-hidden /></button>
      </header>
      <ChatMessages
        messages={chat.messages}
        onRetry={chat.retry}
        onPick={chat.send}
        empty={
          <div className={`pa-empty${leaving ? " is-leaving" : ""}`}>
            <h3 className="pa-empty__hi">Hi, I'm Vardhan AI</h3>
            <p>Ask about his projects, skills or experience. Every answer shows where it came from.</p>
            <SuggestedQuestions onPick={pick} disabled={chat.busy} />
          </div>
        }
      />
      <ChatInput busy={chat.busy} onSend={chat.send} onStop={chat.stop} autoFocus draftKey="global" />
      <p className="pa-panel__foot">AI can make mistakes — sources are linked under each answer.</p>
    </div>
  );
}

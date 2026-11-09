import { useEffect, useRef, type AnimationEvent, type KeyboardEvent } from "react";
import { Trash2, X } from "lucide-react";
import type { useChat } from "../../lib/ai/useChat";
import { ChatInput } from "./ChatInput";
import { ChatMessages } from "./ChatMessages";
import { SuggestedQuestions } from "./SuggestedQuestions";

type Chat = ReturnType<typeof useChat>;

interface Props {
  chat: Chat;
  closing: boolean;
  onClose: () => void;
  onClosed: () => void;
}

export function AssistantPanel({ chat, closing, onClose, onClosed }: Props) {
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

  // Reopened mid-close: the text box stays mounted, so autoFocus won't run again.
  const wasClosing = useRef(false);
  useEffect(() => {
    if (wasClosing.current && !closing) ref.current?.querySelector("textarea")?.focus({ preventScroll: true });
    wasClosing.current = closing;
  }, [closing]);

  // Children animate too and their events bubble here; only the panel's own exit counts.
  const onAnimationEnd = (e: AnimationEvent<HTMLDivElement>) => {
    if (closing && e.target === e.currentTarget) onClosed();
  };

  return (
    <div id="pa-panel" ref={ref} className={`pa-panel${closing ? " is-closing" : ""}`} role="dialog" aria-modal="false" aria-labelledby="pa-title" inert={closing} onKeyDown={onKey} onAnimationEnd={onAnimationEnd}>
      <header className="pa-panel__head">
        <span className="pa-panel__dot" aria-hidden />
        <div className="pa-panel__titles">
          <h2 id="pa-title">Vardhan AI</h2>
          <p>Answers from his portfolio, GitHub and resume</p>
        </div>
        {chat.messages.length > 0 && (
          <button type="button" className="pa-icon" onClick={chat.clear} aria-label="Clear conversation" title="Clear conversation"><Trash2 aria-hidden /></button>
        )}
        <button type="button" className="pa-icon" onClick={onClose} aria-label="Close assistant"><X aria-hidden /></button>
      </header>
      <ChatMessages
        messages={chat.messages}
        onRetry={chat.retry}
        empty={
          <div className="pa-empty">
            <p>Hi! Ask me anything about Vardhan's projects, skills or experience. Every answer cites where it came from.</p>
            <SuggestedQuestions onPick={chat.send} disabled={chat.busy} />
          </div>
        }
      />
      <ChatInput busy={chat.busy} onSend={chat.send} onStop={chat.stop} autoFocus />
      <p className="pa-panel__foot">AI can make mistakes — sources are linked under each answer.</p>
    </div>
  );
}

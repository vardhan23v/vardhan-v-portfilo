import { useCallback, useEffect, useRef, useState } from "react";
import { useChat } from "../../lib/ai/useChat";
import { ASK_EVENT } from "../../lib/ai/ask";
import { motionReduced } from "../../lib/motion";
import { AssistantLauncher } from "./AssistantLauncher";
import { AssistantPanel } from "./AssistantPanel";
import "./assistant.css";

const CLOSE_FALLBACK_MS = 400;

/** Global floating assistant, mounted once in the root layout so it persists across editions. */
export function PortfolioAssistant() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [reopened, setReopened] = useState(false);
  const chat = useChat("global");
  const launcher = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);

  const finishClosing = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    setClosing(false);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setReopened(false);
    if (!motionReduced()) {
      setClosing(true);
      // animationend is the normal exit; this covers a hidden tab or a skipped animation.
      closeTimer.current = window.setTimeout(finishClosing, CLOSE_FALLBACK_MS);
    }
    // After the re-render: on phones the launcher is hidden while the sheet is open.
    requestAnimationFrame(() => launcher.current?.focus({ preventScroll: true }));
  }, [finishClosing]);

  const show = useCallback(() => {
    // Reopened mid-close: continue from where the panel is now instead of restarting.
    const panel = closing ? document.getElementById("pa-panel") : null;
    if (panel) {
      const now = getComputedStyle(panel);
      panel.style.setProperty("--pa-from-opacity", now.opacity);
      panel.style.setProperty("--pa-from-transform", now.transform);
    }
    setReopened(Boolean(panel));
    finishClosing();
    setOpen(true);
  }, [closing, finishClosing]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  // "Ask AI" buttons around the site: open the panel and ask. send() ignores it mid-answer.
  const { send } = chat;
  useEffect(() => {
    const onAsk = (e: Event) => {
      const q = (e as CustomEvent<string>).detail;
      if (typeof q !== "string" || !q.trim()) return;
      show();
      send(q);
    };
    window.addEventListener(ASK_EVENT, onAsk);
    return () => window.removeEventListener(ASK_EVENT, onAsk);
  }, [show, send]);

  return (
    <div className="pa-root" data-open={open || undefined} data-closing={closing || undefined}>
      {(open || closing) && <AssistantPanel chat={chat} closing={closing} reopened={reopened} onClose={close} onClosed={finishClosing} />}
      <AssistantLauncher ref={launcher} open={open} onToggle={() => (open ? close() : show())} />
    </div>
  );
}

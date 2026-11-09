import { useCallback, useEffect, useRef, useState } from "react";
import { useChat } from "../../lib/ai/useChat";
import { motionReduced } from "../../lib/motion";
import { AssistantLauncher } from "./AssistantLauncher";
import { AssistantPanel } from "./AssistantPanel";
import "./assistant.css";

const CLOSE_FALLBACK_MS = 300;

/** Global floating assistant, mounted once in the root layout so it persists across editions. */
export function PortfolioAssistant() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const chat = useChat("global");
  const launcher = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);

  const finishClosing = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    setClosing(false);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    if (!motionReduced()) {
      setClosing(true);
      // animationend is the normal exit; this covers a hidden tab or a skipped animation.
      closeTimer.current = window.setTimeout(finishClosing, CLOSE_FALLBACK_MS);
    }
    // After the re-render: on phones the launcher is hidden while the sheet is open.
    requestAnimationFrame(() => launcher.current?.focus({ preventScroll: true }));
  }, [finishClosing]);

  const show = useCallback(() => {
    finishClosing();
    setOpen(true);
  }, [finishClosing]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  return (
    <div className="pa-root" data-open={open || undefined}>
      {(open || closing) && <AssistantPanel chat={chat} closing={closing} onClose={close} onClosed={finishClosing} />}
      <AssistantLauncher ref={launcher} open={open} onToggle={() => (open ? close() : show())} />
    </div>
  );
}

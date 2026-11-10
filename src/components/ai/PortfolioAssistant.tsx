import { useCallback, useEffect, useRef, useState, type AnimationEvent } from "react";
import { useLocation } from "react-router-dom";
import { useChat } from "../../lib/ai/useChat";
import { ASK_EVENT } from "../../lib/ai/ask";
import { assistantMotionOff } from "../../lib/ai/motion";
import { editionKey } from "../../seo";
import { AssistantLauncher } from "./AssistantLauncher";
import { AssistantPanel } from "./AssistantPanel";
import "./assistant.css";

const CLOSE_FALLBACK_MS = 400;

/** Global floating assistant, mounted once in the root layout so it persists across editions. */
export function PortfolioAssistant() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [reopened, setReopened] = useState(false);
  // The launcher's one-time sheen has played (or the visitor already found the panel).
  const [greeted, setGreeted] = useState(false);
  // .pa-root lives outside every edition root, so it carries the edition itself for its skin.
  const edition = editionKey(useLocation().pathname);
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
    if (!assistantMotionOff()) {
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
      // A swipe-dismiss leaves its offset behind for the exit; the reopened sheet starts clean.
      panel.style.removeProperty("--pa-drag");
      panel.style.transform = "";
      const scrim = panel.parentElement?.querySelector<HTMLElement>(".pa-scrim");
      scrim?.style.removeProperty("--pa-scrim-from");
      if (scrim) scrim.style.opacity = "";
    }
    setReopened(Boolean(panel));
    setGreeted(true);
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

  const onLauncherAnimationEnd = (e: AnimationEvent<HTMLDivElement>) => {
    if ((e.target as Element).classList.contains("pa-launcher") && e.nativeEvent.pseudoElement === "::after") setGreeted(true);
  };

  return (
    <div className="pa-root" data-edition={edition} data-open={open || undefined} data-closing={closing || undefined} data-greeted={greeted || undefined} onAnimationEnd={onLauncherAnimationEnd}>
      {/* Phones only (CSS): dims the page behind the sheet and closes it on tap. */}
      {(open || closing) && <div className="pa-scrim" onClick={close} aria-hidden="true" />}
      {(open || closing) && <AssistantPanel chat={chat} closing={closing} reopened={reopened} onClose={close} onClosed={finishClosing} />}
      <AssistantLauncher ref={launcher} open={open} onToggle={() => (open ? close() : show())} />
    </div>
  );
}

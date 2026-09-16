import { createContext, useCallback, useContext, useLayoutEffect, useRef, useState, type ReactNode, type PointerEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { usePreferences } from "../../hooks/usePreferences";
import { AppGlyph, type GlyphId } from "./AppGlyph";

export interface Notice {
  title?: string;
  body: string;
  app?: GlyphId;
  action?: { label: string; onClick: () => void };
}

interface ToastCtx {
  /** Plain string → a simple status toast; object → a notification banner. */
  toast: (n: string | Notice) => void;
}

const Ctx = createContext<ToastCtx>({ toast: () => {} });
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [notice, setNotice] = useState<Notice | null>(null);
  const [leaving, setLeaving] = useState(false);
  /** Bumps per notice so each card is a fresh element (no inline swipe styles carry over). */
  const [seq, setSeq] = useState(0);
  const hideTimer = useRef(0);
  const closeTimer = useRef(0);
  const { prefs } = usePreferences();
  const cardRef = useRef<HTMLDivElement>(null);
  const swipe = useRef<{ x0: number; dx: number; moved: boolean } | null>(null);

  const dismiss = useCallback(() => {
    window.clearTimeout(hideTimer.current);
    window.clearTimeout(closeTimer.current);
    setLeaving(true);
    closeTimer.current = window.setTimeout(() => {
      setNotice(null);
      setLeaving(false);
    }, 220);
  }, []);

  const toast = useCallback(
    (n: string | Notice) => {
      if (prefs.dnd) return;
      const next: Notice = typeof n === "string" ? { body: n } : n;
      window.clearTimeout(hideTimer.current);
      window.clearTimeout(closeTimer.current);
      setNotice(next);
      setSeq((s) => s + 1);
      setLeaving(false);
      const ttl = next.title ? 4200 : 2600;
      hideTimer.current = window.setTimeout(() => setLeaving(true), ttl);
      closeTimer.current = window.setTimeout(() => {
        setNotice(null);
        setLeaving(false);
      }, ttl + 220);
    },
    [prefs.dnd]
  );

  useLayoutEffect(() => () => {
    window.clearTimeout(hideTimer.current);
    window.clearTimeout(closeTimer.current);
  }, []);

  // Swipe a banner to the right to dismiss it; a short drag springs back.
  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    swipe.current = { x0: e.clientX, dx: 0, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
    window.clearTimeout(hideTimer.current);
    window.clearTimeout(closeTimer.current);
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const s = swipe.current;
    const el = cardRef.current;
    if (!s || !el) return;
    s.dx = Math.max(0, e.clientX - s.x0);
    if (s.dx > 4) s.moved = true;
    el.style.transition = "none";
    el.style.transform = `translateX(${s.dx}px)`;
    el.style.opacity = String(Math.max(0.2, 1 - s.dx / 260));
  };
  const onUp = (e: PointerEvent<HTMLDivElement>) => {
    const s = swipe.current;
    const el = cardRef.current;
    swipe.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
    if (!s || !el) return;
    if (s.dx > 90) {
      // Keep sliding out from where it was dropped; dismiss() unmounts once the slide is done.
      el.style.transition = "transform 220ms var(--ease-cinema), opacity 200ms";
      el.style.transform = "translateX(120%)";
      el.style.opacity = "0";
      dismiss();
      return;
    }
    el.style.transition = "transform 320ms cubic-bezier(0.34, 1.4, 0.64, 1), opacity 200ms";
    el.style.transform = "";
    el.style.opacity = "";
    if (!s.moved) dismiss();
    else hideTimer.current = window.setTimeout(dismiss, 2200);
  };

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="mac-toast-region" aria-live="polite">
        {notice && (
          <div
            key={seq}
            ref={cardRef}
            className={`mac-toast${notice.title ? " mac-toast--banner" : ""}${leaving ? " mac-toast--leaving" : ""}`}
            role="status"
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
          >
            {notice.title ? <AppGlyph id={notice.app ?? "overview"} size={34} /> : <CheckCircle2 />}
            <div className="mac-toast__text">
              {notice.title && <div className="mac-toast__title">{notice.title}</div>}
              <div className="mac-toast__body">{notice.body}</div>
              {notice.action && (
                <button
                  className="mac-toast__action"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    notice.action?.onClick();
                    dismiss();
                  }}
                >
                  {notice.action.label}
                </button>
              )}
            </div>
            <div className="mac-toast__timer" aria-hidden="true" style={{ animationDuration: notice.title ? "4200ms" : "2600ms" }} />
          </div>
        )}
      </div>
    </Ctx.Provider>
  );
}

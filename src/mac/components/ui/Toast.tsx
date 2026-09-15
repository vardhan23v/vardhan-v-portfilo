import { createContext, useCallback, useContext, useLayoutEffect, useRef, useState, type ReactNode } from "react";
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
  const hideTimer = useRef(0);
  const closeTimer = useRef(0);
  const { prefs } = usePreferences();

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

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="mac-toast-region" aria-live="polite">
        {notice && (
          <div
            className={`mac-toast${notice.title ? " mac-toast--banner" : ""}${leaving ? " mac-toast--leaving" : ""}`}
            role="status"
            onClick={dismiss}
          >
            {notice.title ? <AppGlyph id={notice.app ?? "overview"} size={34} /> : <CheckCircle2 />}
            <div className="mac-toast__text">
              {notice.title && <div className="mac-toast__title">{notice.title}</div>}
              <div className="mac-toast__body">{notice.body}</div>
              {notice.action && (
                <button
                  className="mac-toast__action"
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

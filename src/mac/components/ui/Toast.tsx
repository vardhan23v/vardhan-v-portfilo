import { createContext, useCallback, useContext, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import { usePreferences } from "../../hooks/usePreferences";

interface ToastCtx {
  toast: (msg: string) => void;
}

const Ctx = createContext<ToastCtx>({ toast: () => {} });

export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  const hideTimer = useRef(0);
  const closeTimer = useRef(0);
  const { prefs } = usePreferences();

  const toast = useCallback(
    (m: string) => {
      if (prefs.dnd) return;
      window.clearTimeout(hideTimer.current);
      window.clearTimeout(closeTimer.current);
      setMsg(m);
      setLeaving(false);
      hideTimer.current = window.setTimeout(() => setLeaving(true), 2600);
      closeTimer.current = window.setTimeout(() => {
        setMsg(null);
        setLeaving(false);
      }, 2600 + 220);
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
        {msg && (
          <div className={`mac-toast${leaving ? " mac-toast--leaving" : ""}`} role="status">
            <CheckCircle2 />
            <span>{msg}</span>
            <div className="mac-toast__timer" aria-hidden="true" />
          </div>
        )}
      </div>
    </Ctx.Provider>
  );
}

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";

interface ToastCtx {
  toast: (msg: string) => void;
}

const Ctx = createContext<ToastCtx>({ toast: () => {} });

export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef(0);

  const toast = useCallback((m: string) => {
    setMsg(m);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMsg(null), 2600);
  }, []);

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="mac-toast-region" aria-live="polite">
        {msg && (
          <div className="mac-toast" role="status">
            <CheckCircle2 />
            <span>{msg}</span>
          </div>
        )}
      </div>
    </Ctx.Provider>
  );
}

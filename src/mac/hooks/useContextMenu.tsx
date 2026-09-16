import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

export type CtxItem =
  | { label: string; action?: () => void; disabled?: boolean; checked?: boolean; shortcut?: string }
  | { sep: true };

interface CtxState {
  x: number;
  y: number;
  items: CtxItem[];
  title?: string;
}

interface CtxApi {
  /** Open a menu at the event's pointer position. Calls preventDefault for you. */
  open: (e: { clientX: number; clientY: number; preventDefault: () => void }, items: CtxItem[], title?: string) => void;
  close: () => void;
}

const Ctx = createContext<CtxApi>({ open: () => {}, close: () => {} });
export const useContextMenu = () => useContext(Ctx);

/** One shared right-click menu for the whole desktop (desktop, Dock, window titles). */
export function ContextMenuProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CtxState | null>(null);
  const open = useCallback<CtxApi["open"]>((e, items, title) => {
    e.preventDefault();
    setState({ x: e.clientX, y: e.clientY, items, title });
  }, []);
  const close = useCallback(() => setState(null), []);
  const api = useMemo(() => ({ open, close }), [open, close]);
  return (
    <Ctx.Provider value={api}>
      {children}
      {state && <ContextMenu state={state} onClose={close} />}
    </Ctx.Provider>
  );
}

function ContextMenu({ state, onClose }: { state: CtxState; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: state.x, y: state.y });
  /** Where focus was before the menu opened; it goes back there unless an action moved it. */
  const returnTo = useRef<HTMLElement | null>(null);

  // Keep the menu on screen; anchor it to the pointer otherwise. Focus lands on the
  // first item so arrow keys work at once (script focus after a click shows no ring).
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    returnTo.current = document.activeElement as HTMLElement | null;
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    setPos({ x: Math.max(6, Math.min(state.x, vw - r.width - 6)), y: Math.max(30, Math.min(state.y, vh - r.height - 6)) });
    el.querySelector<HTMLButtonElement>(".mac-ctx__item:not(:disabled)")?.focus({ preventScroll: true });
  }, [state]);

  useLayoutEffect(
    () => () => {
      const el = returnTo.current;
      const active = document.activeElement;
      const stillHere = !active || active === document.body || (ref.current?.contains(active) ?? false);
      if (stillHere && el && el.isConnected && el !== document.body) el.focus({ preventScroll: true });
    },
    []
  );

  useEffect(() => {
    const down = (e: PointerEvent) => {
      if (ref.current && e.target instanceof Node && ref.current.contains(e.target)) return;
      onClose();
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("pointerdown", down, true);
    document.addEventListener("keydown", key);
    window.addEventListener("blur", onClose);
    window.addEventListener("resize", onClose);
    return () => {
      document.removeEventListener("pointerdown", down, true);
      document.removeEventListener("keydown", key);
      window.removeEventListener("blur", onClose);
      window.removeEventListener("resize", onClose);
    };
  }, [onClose]);

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(ref.current?.querySelectorAll<HTMLButtonElement>(".mac-ctx__item:not(:disabled)") ?? []);
    if (!items.length) return;
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    const go = (n: number) => {
      e.preventDefault();
      items[(n + items.length) % items.length]?.focus({ preventScroll: true });
    };
    if (e.key === "ArrowDown") go(i + 1);
    else if (e.key === "ArrowUp") go(i < 0 ? items.length - 1 : i - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(items.length - 1);
    else if (e.key === "Tab") {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div
      ref={ref}
      className="mac-ctx"
      role="menu"
      aria-label={state.title ?? "Context menu"}
      style={{ left: pos.x, top: pos.y, transformOrigin: `${state.x <= pos.x ? "left" : "right"} top` }}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={onKeyDown}
    >
      {state.title && <div className="mac-ctx__title">{state.title}</div>}
      {state.items.map((it, i) =>
        "sep" in it ? (
          <div className="mac-ctx__sep" key={i} role="separator" />
        ) : (
          <button
            key={i}
            type="button"
            role="menuitem"
            tabIndex={-1}
            className="mac-ctx__item"
            disabled={it.disabled}
            aria-checked={it.checked ? true : undefined}
            onClick={() => {
              onClose();
              it.action?.();
            }}
          >
            <span className="mac-ctx__check" aria-hidden="true">
              {it.checked ? "✓" : ""}
            </span>
            <span className="mac-ctx__label">{it.label}</span>
            {it.shortcut && <span className="mac-ctx__shortcut">{it.shortcut}</span>}
          </button>
        )
      )}
    </div>
  );
}

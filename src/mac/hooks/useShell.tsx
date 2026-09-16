import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

export type ShellOverlay = "none" | "launchpad" | "widgets" | "expose" | "saver" | "desktop";
export type SysState = "none" | "lock" | "sleep" | "restart" | "shutdown";
export interface PreviewItem { src: string; title: string; sub?: string }

interface ShellCtx {
  overlay: ShellOverlay;
  setOverlay: (o: ShellOverlay) => void;
  toggleOverlay: (o: Exclude<ShellOverlay, "none">) => void;
  booted: boolean;
  setBooted: (v: boolean) => void;
  iconsHidden: boolean;
  setIconsHidden: (v: boolean) => void;
  sysState: SysState;
  setSysState: (s: SysState) => void;
  preview: PreviewItem | null;
  setPreview: (p: PreviewItem | null) => void;
  /** True for ~500ms after Mission Control or Show Desktop ends, so windows glide home. */
  settling: boolean;
}

const BOOT_KEY = "mac-booted";
const ICONS_KEY = "mac-desktop-icons";

const Ctx = createContext<ShellCtx>({
  overlay: "none",
  setOverlay: () => {},
  toggleOverlay: () => {},
  booted: true,
  setBooted: () => {},
  iconsHidden: false,
  setIconsHidden: () => {},
  sysState: "none",
  setSysState: () => {},
  preview: null,
  setPreview: () => {},
  settling: false,
});

function readBooted(): boolean {
  if (typeof window === "undefined") return true;
  try {
    if (new URLSearchParams(window.location.search).get("noboot") === "1") return true;
    return sessionStorage.getItem(BOOT_KEY) === "1";
  } catch {
    return true;
  }
}

function readIconsHidden(): boolean {
  try {
    const raw = localStorage.getItem(ICONS_KEY);
    return raw ? Boolean(JSON.parse(raw).hidden) : false;
  } catch {
    return false;
  }
}

/** Shell-level UI that is not a window: overlays, boot gate, desktop-icon visibility. */
export function ShellProvider({ children }: { children: ReactNode }) {
  const [overlay, setOverlayState] = useState<ShellOverlay>("none");
  const [settling, setSettling] = useState(false);
  const overlayRef = useRef<ShellOverlay>("none");
  const settleTimer = useRef(0);

  // Leaving an overlay that moved windows (Mission Control, Show Desktop) raises `settling`
  // in the same render, so the CSS transition is already on when the transforms come off.
  const setOverlay = useCallback((o: ShellOverlay) => {
    const cur = overlayRef.current;
    if (o !== cur && (cur === "expose" || cur === "desktop")) {
      setSettling(true);
      window.clearTimeout(settleTimer.current);
      settleTimer.current = window.setTimeout(() => setSettling(false), 520);
    }
    overlayRef.current = o;
    setOverlayState(o);
  }, []);
  const [booted, setBootedState] = useState<boolean>(readBooted);
  const [iconsHidden, setIconsHiddenState] = useState<boolean>(readIconsHidden);
  const [sysState, setSysState] = useState<SysState>("none");
  const [preview, setPreview] = useState<PreviewItem | null>(null);

  const setBooted = useCallback((v: boolean) => {
    setBootedState(v);
    try {
      if (v) sessionStorage.setItem(BOOT_KEY, "1");
      else sessionStorage.removeItem(BOOT_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const setIconsHidden = useCallback((v: boolean) => {
    setIconsHiddenState(v);
    try {
      const raw = localStorage.getItem(ICONS_KEY);
      const obj = raw ? JSON.parse(raw) : {};
      localStorage.setItem(ICONS_KEY, JSON.stringify({ ...obj, hidden: v }));
    } catch {
      /* ignore */
    }
  }, []);

  const toggleOverlay = useCallback(
    (o: Exclude<ShellOverlay, "none">) => {
      setOverlay(overlayRef.current === o ? "none" : o);
    },
    [setOverlay]
  );

  const value = useMemo(
    () => ({ overlay, setOverlay, toggleOverlay, booted, setBooted, iconsHidden, setIconsHidden, sysState, setSysState, preview, setPreview, settling }),
    [overlay, setOverlay, toggleOverlay, booted, setBooted, iconsHidden, setIconsHidden, sysState, preview, settling]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useShell = () => useContext(Ctx);
export const SHELL_KEYS = { BOOT_KEY, ICONS_KEY };

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type ShellOverlay = "none" | "launchpad" | "widgets" | "expose" | "saver";
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
  const [overlay, setOverlay] = useState<ShellOverlay>("none");
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

  const toggleOverlay = useCallback((o: Exclude<ShellOverlay, "none">) => {
    setOverlay((cur) => (cur === o ? "none" : o));
  }, []);

  const value = useMemo(
    () => ({ overlay, setOverlay, toggleOverlay, booted, setBooted, iconsHidden, setIconsHidden, sysState, setSysState, preview, setPreview }),
    [overlay, toggleOverlay, booted, setBooted, iconsHidden, setIconsHidden, sysState, preview]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useShell = () => useContext(Ctx);
export const SHELL_KEYS = { BOOT_KEY, ICONS_KEY };

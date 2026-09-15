import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from "react";
import type { PageId } from "./useNav";

export type AppId = PageId | "finder" | "terminal" | "vardhan-ai" | "settings" | "about-mac";

export interface WindowInstance {
  id: AppId;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
  // previous bounds for restore
  prev?: { x: number; y: number; w: number; h: number };
}

const APP_TITLES: Record<AppId, string> = {
  overview: "Vardhan — Overview",
  about: "About Vardhan",
  projects: "Projects",
  experience: "Experience",
  skills: "Skills",
  achievements: "Achievements",
  contact: "Contact",
  finder: "Finder",
  terminal: "Terminal",
  "vardhan-ai": "Vardhan AI",
  settings: "Settings",
  "about-mac": "About This Mac",
};

export const MENU_H = 28;
export const DOCK_H = 84;

/** Viewport size that never reports 0 (some embedded browsers lay out at 0×0
 *  for the first frame, which used to produce invisible 0px-wide windows). */
function viewport() {
  if (typeof window === "undefined") return { vw: 1200, vh: 800 };
  const vw = window.innerWidth || document.documentElement.clientWidth || 1200;
  const vh = window.innerHeight || document.documentElement.clientHeight || 800;
  return { vw: Math.max(vw, 320), vh: Math.max(vh, 480) };
}

/** Keep a window inside the desktop area for the given viewport. */
function fitBounds(w: WindowInstance, vw: number, vh: number): WindowInstance {
  if (w.maximized) return { ...w, x: 0, y: MENU_H, w: vw, h: vh - MENU_H - DOCK_H };
  if (vw <= 640) return { ...w, x: 0, y: MENU_H, w: vw, h: vh - MENU_H - DOCK_H };
  const width = Math.min(Math.max(360, w.w), vw - 16);
  const height = Math.min(Math.max(260, w.h), vh - MENU_H - DOCK_H - 8);
  const x = Math.max(8, Math.min(vw - width - 8, w.x));
  const y = Math.max(MENU_H + 4, Math.min(vh - DOCK_H - height, w.y));
  return { ...w, x, y, w: width, h: height };
}

function defaultBounds(appId: AppId, index: number, vw: number, vh: number) {
  const isMobile = vw <= 640;
  if (isMobile) return { x: 0, y: MENU_H, w: vw, h: vh - MENU_H - DOCK_H };
  // stagger cascade
  const w = Math.min(appId === "projects" || appId === "finder" ? 980 : appId === "terminal" ? 720 : 860, Math.floor(vw * 0.86));
  const h = Math.min(620, Math.floor(vh * 0.78));
  const offset = index * 28;
  const x = Math.max(16, Math.floor((vw - w) / 2 + offset - 60));
  const y = Math.max(32, Math.floor((vh - h) / 2 + offset - 20));
  return { x, y, w, h };
}

interface WindowManagerCtx {
  windows: WindowInstance[];
  activeId: AppId | null;
  openWindow: (id: AppId) => void;
  closeWindow: (id: AppId) => void;
  minimizeWindow: (id: AppId) => void;
  maximizeWindow: (id: AppId) => void;
  focusWindow: (id: AppId) => void;
  updateWindowPos: (id: AppId, x: number, y: number) => void;
  updateWindowSize: (id: AppId, w: number, h: number) => void;
  /** Tile a window to the left/right half or the full desktop area. */
  snapWindow: (id: AppId, side: "left" | "right" | "full") => void;
  isOpen: (id: AppId) => boolean;
  isMinimized: (id: AppId) => boolean;
  bringToFront: (id: AppId) => void;
}

const Ctx = createContext<WindowManagerCtx | null>(null);

export function WindowManagerProvider({ children }: { children: ReactNode }) {
  const zRef = useRef(10);
  const [windows, setWindows] = useState<WindowInstance[]>(() => {
    if (typeof window === "undefined") return [];
    const { vw, vh } = viewport();
    const b = defaultBounds("overview", 0, vw, vh);
    zRef.current = 11;
    return [{ id: "overview", title: APP_TITLES.overview, ...b, z: 10, minimized: false, maximized: false }];
  });
  const [activeId, setActiveId] = useState<AppId | null>("overview");

  // Re-fit every window when the viewport changes (device rotation, browser
  // resize, or the embedded pane growing from 0px on first paint).
  useEffect(() => {
    if (typeof window === "undefined") return;
    let raf = 0;
    const refit = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const { vw, vh } = viewport();
        setWindows((prev) => {
          let changed = false;
          const next = prev.map((w) => {
            const f = fitBounds(w, vw, vh);
            if (f.x !== w.x || f.y !== w.y || f.w !== w.w || f.h !== w.h) changed = true;
            return f;
          });
          return changed ? next : prev;
        });
      });
    };
    refit();
    window.addEventListener("resize", refit);
    window.addEventListener("orientationchange", refit);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", refit);
      window.removeEventListener("orientationchange", refit);
    };
  }, []);

  const isOpen = useCallback((id: AppId) => windows.some((w) => w.id === id && !w.minimized), [windows]);
  const isMinimized = useCallback((id: AppId) => windows.some((w) => w.id === id && w.minimized), [windows]);

  const bringToFront = useCallback((id: AppId) => {
    // Renormalize z-index before it can grow past overlay layers (palette/toast sit at 2000+).
    setWindows((prev) => {
      let max = 10;
      for (const w of prev) if (w.z > max) max = w.z;
      if (max > 500) {
        const sorted = [...prev].sort((a, b) => a.z - b.z);
        const remapped = sorted.map((w, i) => ({ ...w, z: 10 + i }));
        zRef.current = 10 + remapped.length;
        return remapped.map((w) => (w.id === id ? { ...w, z: ++zRef.current } : w));
      }
      zRef.current = max + 1;
      return prev.map((w) => (w.id === id ? { ...w, z: zRef.current } : w));
    });
    setActiveId(id);
  }, []);

  const focusWindow = useCallback((id: AppId) => {
    bringToFront(id);
    // un-minimize on focus
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, minimized: false } : w)));
  }, [bringToFront]);

  const openWindow = useCallback((id: AppId) => {
    const existing = windows.find((w) => w.id === id);
    if (existing) {
      focusWindow(id);
      return;
    }
    const { vw, vh } = viewport();
    const b = defaultBounds(id, windows.length, vw, vh);
    zRef.current += 1;
    const next: WindowInstance = {
      id,
      title: APP_TITLES[id] ?? id,
      ...b,
      z: zRef.current,
      minimized: false,
      maximized: false,
    };
    setWindows((prev) => [...prev, next]);
    setActiveId(id);
  }, [windows, focusWindow]);

  const closeWindow = useCallback((id: AppId) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
    setActiveId((prev) => {
      if (prev !== id) return prev;
      const remaining = windows.filter((w) => w.id !== id);
      return remaining.length ? remaining[remaining.length - 1].id : null;
    });
  }, [windows]);

  const minimizeWindow = useCallback((id: AppId) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, minimized: true } : w)));
    // focus next topmost
    const remaining = windows.filter((w) => w.id !== id && !w.minimized);
    if (remaining.length) {
      const top = [...remaining].sort((a, b) => b.z - a.z)[0];
      setActiveId(top.id);
    } else setActiveId(null);
  }, [windows]);

  const maximizeWindow = useCallback((id: AppId) => {
    const { vw, vh } = viewport();
    setWindows((prev) => prev.map((w) => {
      if (w.id !== id) return w;
      if (w.maximized) {
        // restore
        const p = w.prev ?? defaultBounds(id, 0, vw, vh);
        return { ...w, maximized: false, x: p.x, y: p.y, w: p.w, h: p.h, prev: undefined };
      }
      // maximize: fill desktop (minus menu + dock)
      return {
        ...w,
        prev: { x: w.x, y: w.y, w: w.w, h: w.h },
        maximized: true,
        x: 0,
        y: MENU_H,
        w: vw,
        h: vh - MENU_H - DOCK_H,
      };
    }));
    bringToFront(id);
  }, [bringToFront]);

  const updateWindowPos = useCallback((id: AppId, x: number, y: number) => {
    const { vw, vh } = viewport();
    setWindows((prev) => prev.map((w) => {
      if (w.id !== id || w.maximized) return w;
      // clamp
      const clampedX = Math.max(-w.w + 80, Math.min(vw - 80, x));
      const clampedY = Math.max(MENU_H, Math.min(vh - DOCK_H - 40, y));
      return { ...w, x: clampedX, y: clampedY };
    }));
  }, []);

  const updateWindowSize = useCallback((id: AppId, w: number, h: number) => {
    setWindows((prev) => prev.map((win) => win.id === id && !win.maximized ? { ...win, w: Math.max(360, w), h: Math.max(260, h) } : win));
  }, []);

  const snapWindow = useCallback((id: AppId, side: "left" | "right" | "full") => {
    const { vw, vh } = viewport();
    const h = vh - MENU_H - DOCK_H;
    const half = Math.floor(vw / 2);
    setWindows((prev) => prev.map((w) => {
      if (w.id !== id) return w;
      if (side === "full") return { ...w, maximized: false, x: 8, y: MENU_H + 4, w: vw - 16, h: h - 8 };
      return { ...w, maximized: false, x: side === "left" ? 0 : half, y: MENU_H, w: half, h };
    }));
    bringToFront(id);
  }, [bringToFront]);

  return (
    <Ctx.Provider value={{ windows, activeId, openWindow, closeWindow, minimizeWindow, maximizeWindow, focusWindow, updateWindowPos, updateWindowSize, snapWindow, isOpen, isMinimized, bringToFront }}>
      {children}
    </Ctx.Provider>
  );
}

export const useWindowManager = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWindowManager must be inside WindowManagerProvider");
  return ctx;
};

export const useWindowManagerOptional = () => useContext(Ctx);

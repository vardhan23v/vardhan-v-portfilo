import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";
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

function defaultBounds(appId: AppId, index: number, vw: number, vh: number) {
  const isMobile = vw <= 640;
  if (isMobile) return { x: 0, y: 0, w: vw, h: vh };
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
  isOpen: (id: AppId) => boolean;
  isMinimized: (id: AppId) => boolean;
  bringToFront: (id: AppId) => void;
}

const Ctx = createContext<WindowManagerCtx | null>(null);

const MENU_H = 28;
const DOCK_H = 64;

export function WindowManagerProvider({ children }: { children: ReactNode }) {
  const zRef = useRef(10);
  const [windows, setWindows] = useState<WindowInstance[]>(() => {
    if (typeof window === "undefined") return [];
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const b = defaultBounds("overview", 0, vw, vh);
    zRef.current = 11;
    return [{ id: "overview", title: APP_TITLES.overview, ...b, z: 10, minimized: false, maximized: false }];
  });
  const [activeId, setActiveId] = useState<AppId | null>("overview");

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
    const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;
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
    const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;
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
    const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;
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

  return (
    <Ctx.Provider value={{ windows, activeId, openWindow, closeWindow, minimizeWindow, maximizeWindow, focusWindow, updateWindowPos, updateWindowSize, isOpen, isMinimized, bringToFront }}>
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

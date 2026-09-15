import { useEffect, useMemo, useRef, useState } from "react";
import { useNav, type PageId } from "../../hooks/useNav";
import { useWindowManager, MENU_H, DOCK_H } from "../../hooks/useWindowManager";
import { useToast } from "../ui/Toast";
import { site } from "../../data/site";
import { usePalette } from "../../hooks/usePalette";
import { useShell } from "../../hooks/useShell";
import { WindowFrame } from "../window/WindowFrame";
import { AppContent } from "../../apps/AppContent";
import { MenuBar } from "./MenuBar";
import { Dock } from "./Dock";
import { Wallpaper } from "./Wallpaper";
import { DesktopIcons } from "./DesktopIcons";
import { WidgetsPanel } from "./WidgetsPanel";
import { Launchpad } from "./Launchpad";
import { Screensaver } from "./Screensaver";
import { AppSwitcher } from "./AppSwitcher";
import { SystemStates } from "./SystemStates";

const PAGE_SHORTCUTS: Record<string, PageId> = {
  "1": "overview", "2": "about", "3": "projects", "4": "experience",
  "5": "skills", "6": "achievements", "7": "contact",
};

const isPageId = (id: string): id is PageId =>
  ["overview", "about", "projects", "experience", "skills", "achievements", "contact"].includes(id);

/** Desktop shell: wallpaper + menu bar + icons + window layer + dock + overlays. */
export function Desktop() {
  const { navigate, page } = useNav();
  const { windows, activeId, openWindow, minimizeWindow } = useWindowManager();
  const { register } = usePalette();
  const { overlay, setOverlay, toggleOverlay, setSysState } = useShell();
  const { toast } = useToast();
  const areaRef = useRef<HTMLDivElement>(null);
  const [snapHint, setSnapHint] = useState<"left" | "right" | "full" | null>(null);

  // Mission Control layout: every window (minimized too) scaled into a grid.
  const exposeLayout = useMemo(() => {
    if (overlay !== "expose" || windows.length === 0) return {};
    const vw = areaRef.current?.clientWidth ?? window.innerWidth;
    const vh = (areaRef.current?.clientHeight ?? window.innerHeight) - MENU_H - DOCK_H;
    const n = windows.length;
    const cols = Math.ceil(Math.sqrt(n));
    const rows = Math.ceil(n / cols);
    const pad = 28;
    const cellW = (vw - pad * (cols + 1)) / cols;
    const cellH = (vh - pad * (rows + 1) - 40) / rows;
    const out: Record<string, { x: number; y: number; s: number }> = {};
    const ordered = [...windows].sort((a, b) => a.z - b.z);
    ordered.forEach((w, i) => {
      const c = i % cols;
      const r = Math.floor(i / cols);
      const s = Math.min(cellW / w.w, cellH / w.h, 0.85);
      const x = pad + c * (cellW + pad) + (cellW - w.w * s) / 2;
      const y = MENU_H + pad + r * (cellH + pad + 40) + (cellH - w.h * s) / 2;
      out[w.id] = { x, y, s };
    });
    return out;
  }, [overlay, windows]);

  // Snap preview while dragging a window to an edge.
  useEffect(() => {
    const h = (e: Event) => setSnapHint((e as CustomEvent).detail ?? null);
    window.addEventListener("mac-snap-hint", h);
    return () => window.removeEventListener("mac-snap-hint", h);
  }, []);

  // Welcome notification, once per session.
  useEffect(() => {
    try {
      if (sessionStorage.getItem("mac-greeted")) return;
      sessionStorage.setItem("mac-greeted", "1");
    } catch { /* ignore */ }
    const hr = Number(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", hour12: false, timeZone: "Asia/Kolkata" }));
    const part = hr < 5 ? "night" : hr < 12 ? "morning" : hr < 17 ? "afternoon" : "evening";
    const t = window.setTimeout(
      () =>
        toast({
          title: `Good ${part}`,
          body: `Welcome to ${site.name.split(" ")[1] ?? "Vardhan"}'s desk. ⌥Tab switches apps, ⌃↑ shows every window.`,
          app: "overview",
          action: { label: "Shortcuts", onClick: () => window.dispatchEvent(new CustomEvent("open-help-overlay")) },
        }),
      900
    );
    return () => window.clearTimeout(t);
  }, [toast]);

  // 1–7 shortcuts open/focus the page window.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (overlay !== "none") return;
      const p = PAGE_SHORTCUTS[e.key];
      if (p) {
        navigate(p);
        openWindow(p);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate, openWindow, overlay]);

  // Keep the page highlight in sync when focus moves between page windows.
  useEffect(() => {
    if (activeId && isPageId(activeId) && activeId !== page) navigate(activeId);
  }, [activeId, page, navigate]);

  // ⌘/Ctrl+M minimize · Ctrl+↑ / F3 Mission Control · ⌘⇧D show desktop · Esc leaves Mission Control.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && !e.shiftKey && e.key.toLowerCase() === "m") {
        e.preventDefault();
        if (activeId) minimizeWindow(activeId);
      } else if ((e.ctrlKey && e.key === "ArrowUp") || e.key === "F3") {
        e.preventDefault();
        toggleOverlay("expose");
      } else if (mod && e.shiftKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        for (const w of windows) if (!w.minimized) minimizeWindow(w.id);
      } else if (e.ctrlKey && e.metaKey && e.key.toLowerCase() === "q") {
        e.preventDefault();
        setSysState("lock");
      } else if (e.key === "Escape" && overlay === "expose") {
        setOverlay("none");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeId, minimizeWindow, toggleOverlay, overlay, setOverlay, windows, setSysState]);

  // Shell commands in Spotlight.
  useEffect(() => {
    register([
      { id: "launchpad", label: "Open Launchpad", hint: "apps", action: () => setOverlay("launchpad") },
      { id: "widgets", label: "Toggle Widgets", hint: "clock · github", action: () => toggleOverlay("widgets") },
      { id: "reset-icons", label: "Reset desktop icons", hint: "desktop", action: () => window.dispatchEvent(new Event("mac-reset-desktop-icons")) },
      { id: "expose", label: "Mission Control", hint: "ctrl ↑", action: () => setOverlay("expose") },
      { id: "saver", label: "Start screensaver", hint: "idle", action: () => setOverlay("saver") },
    ]);
  }, [register, setOverlay, toggleOverlay]);

  const visible = windows.filter((w) => !w.minimized).length;

  return (
    <div className="mac-desktop">
      <Wallpaper />
      <MenuBar />
      <div className={`mac-desktop__area${overlay === "expose" ? " is-expose" : ""}`} ref={areaRef}>
        <DesktopIcons />
        {snapHint && <div className={`mac-snap-preview mac-snap-preview--${snapHint}`} aria-hidden="true" />}
        {windows.map((w) => (
          <WindowFrame key={w.id} id={w.id} title={w.title} expose={exposeLayout[w.id]}>
            <AppContent appId={w.id} />
          </WindowFrame>
        ))}
        {overlay === "expose" && (
          <button className="mac-expose-exit mac-caps" onClick={() => setOverlay("none")}>
            {windows.length} window{windows.length === 1 ? "" : "s"} · click one to focus · esc
          </button>
        )}
        {visible === 0 && windows.length > 0 && (
          <div className="mac-desktop__empty">
            <div className="mac-desktop__empty-title">Everything is tucked away.</div>
            <div className="mac-desktop__empty-sub mac-caps">click the dock · press ⌘K</div>
          </div>
        )}
      </div>
      <Dock />
      <WidgetsPanel />
      <Launchpad />
      <Screensaver />
      <AppSwitcher />
      <SystemStates />
    </div>
  );
}

import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { useNav, type PageId } from "../../hooks/useNav";
import { useWindowManager, MENU_H, DOCK_H } from "../../hooks/useWindowManager";
import { useToast } from "../ui/Toast";
import { site } from "../../data/site";
import { usePalette } from "../../hooks/usePalette";
import { useShell } from "../../hooks/useShell";
import { useContextMenu } from "../../hooks/useContextMenu";
import { motionReduced } from "../../../lib/motion";
import { usePreferences } from "../../hooks/usePreferences";
import { useTheme } from "../../hooks/useTheme";
import { usePresence } from "../../hooks/usePresence";
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
  const { windows, activeId, openWindow, minimizeWindow, cycleWindow, snapWindow } = useWindowManager();
  const { register } = usePalette();
  const { overlay, setOverlay, toggleOverlay, setSysState, iconsHidden, setIconsHidden, settling } = useShell();
  const { toast } = useToast();
  const ctxMenu = useContextMenu();
  const { prefs } = usePreferences();
  const { toggle: toggleTheme } = useTheme();
  const areaRef = useRef<HTMLDivElement>(null);
  const [snapHint, setSnapHint] = useState<"left" | "right" | "full" | null>(null);
  const lastSnap = useRef<"left" | "right" | "full">("left");
  if (snapHint) lastSnap.current = snapHint;
  const snapPresence = usePresence(!!snapHint, 180);
  const [cornerFx, setCornerFx] = useState<{ corner: string; n: number } | null>(null);

  // Opening or focusing a window brings the windows back (Show Desktop ends), as on macOS.
  const parkedKey = useRef("");
  useEffect(() => {
    const key = `${windows.length}:${activeId ?? ""}`;
    if (overlay !== "desktop") {
      parkedKey.current = key;
      return;
    }
    if (parkedKey.current !== key) setOverlay("none");
  }, [overlay, windows.length, activeId, setOverlay]);

  // Hot corners: bottom-left Launchpad · top-right Mission Control · bottom-right Show Desktop.
  // A corner fires after a short dwell and re-arms once the pointer leaves it.
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    let armed = true;
    let timer = 0;
    let inCorner: string | null = null;
    const cornerOf = (x: number, y: number) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      if (x <= 1 && y >= vh - 1) return "bl";
      if (x >= vw - 1 && y >= vh - 1) return "br";
      if (x >= vw - 1 && y <= 0) return "tr";
      return null;
    };
    const fire = (c: string) => {
      setCornerFx({ corner: c, n: Date.now() });
      if (c === "bl") toggleOverlay("launchpad");
      else if (c === "tr") toggleOverlay("expose");
      else if (c === "br") toggleOverlay("desktop");
    };
    const onMove = (e: globalThis.MouseEvent) => {
      const c = e.buttons ? null : cornerOf(e.clientX, e.clientY);
      if (c === inCorner) return;
      inCorner = c;
      window.clearTimeout(timer);
      if (!c) {
        armed = true;
        return;
      }
      if (!armed) return;
      timer = window.setTimeout(() => {
        armed = false;
        fire(c);
      }, 320);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.clearTimeout(timer);
    };
  }, [toggleOverlay]);

  const onDesktopContextMenu = (e: MouseEvent) => {
    const t = e.target as HTMLElement;
    if (t.closest(".mac-desktop-window, .mac-dock, .mac-menubar, .mac-dicon, .mac-toast, .mac-launchpad, .mac-widgets, .mac-ctx, input, textarea")) return;
    ctxMenu.open(e, [
      { label: "New Note", action: () => openWindow("notes") },
      { label: "Change Wallpaper…", action: () => openWindow("settings") },
      { sep: true },
      { label: "Show Desktop Icons", checked: !iconsHidden, action: () => setIconsHidden(!iconsHidden) },
      { label: "Clean Up Icons", action: () => window.dispatchEvent(new Event("mac-reset-desktop-icons")) },
      { sep: true },
      { label: "Mission Control", shortcut: "⌃↑", action: () => setOverlay("expose") },
      { label: "Launchpad", action: () => setOverlay("launchpad") },
      { label: overlay === "desktop" ? "Bring Windows Back" : "Show Desktop", shortcut: "⇧⌘D", action: () => toggleOverlay("desktop") },
      { sep: true },
      { label: "Keyboard Shortcuts", shortcut: "?", action: () => window.dispatchEvent(new CustomEvent("open-help-overlay")) },
    ]);
  };

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
    // System shortcuts: every combo here carries a modifier (or is F3/Escape), so they
    // work while a text field has focus, as they do on macOS.
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && !e.shiftKey && e.key.toLowerCase() === "m") {
        e.preventDefault();
        if (activeId) minimizeWindow(activeId);
      } else if ((e.ctrlKey && e.key === "ArrowUp") || e.key === "F3") {
        e.preventDefault();
        toggleOverlay("expose");
      } else if (mod && e.shiftKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        toggleOverlay("desktop");
      } else if (mod && e.key === "`") {
        e.preventDefault();
        cycleWindow();
      } else if (e.ctrlKey && e.altKey && activeId && (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "Enter")) {
        e.preventDefault();
        snapWindow(activeId, e.key === "ArrowLeft" ? "left" : e.key === "ArrowRight" ? "right" : "full");
      } else if (mod && e.key === ",") {
        e.preventDefault();
        openWindow("settings");
      } else if (mod && e.shiftKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        toggleTheme();
      } else if (e.ctrlKey && e.metaKey && e.key.toLowerCase() === "q") {
        e.preventDefault();
        setSysState("lock");
      } else if (e.key === "Escape" && (overlay === "expose" || overlay === "desktop")) {
        setOverlay("none");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeId, minimizeWindow, toggleOverlay, overlay, setOverlay, windows, setSysState, cycleWindow, openWindow, toggleTheme, snapWindow]);

  // Shell commands in Spotlight.
  useEffect(() => {
    register([
      { id: "launchpad", label: "Open Launchpad", hint: "apps", action: () => setOverlay("launchpad") },
      { id: "widgets", label: "Toggle Widgets", hint: "clock · github", action: () => toggleOverlay("widgets") },
      { id: "reset-icons", label: "Reset desktop icons", hint: "desktop", action: () => window.dispatchEvent(new Event("mac-reset-desktop-icons")) },
      { id: "expose", label: "Mission Control", hint: "ctrl ↑", action: () => setOverlay("expose") },
      { id: "show-desktop", label: "Show Desktop", hint: "⇧⌘D", action: () => toggleOverlay("desktop") },
      { id: "saver", label: "Start screensaver", hint: "idle", action: () => setOverlay("saver") },
    ]);
  }, [register, setOverlay, toggleOverlay]);

  const visible = windows.filter((w) => !w.minimized).length;

  return (
    <div className="mac-desktop" onContextMenu={onDesktopContextMenu}>
      <Wallpaper />
      <MenuBar />
      <div
        className={`mac-desktop__area${overlay === "expose" ? " is-expose" : ""}${overlay === "launchpad" ? " is-behind" : ""}${settling ? " is-settling" : ""}`}
        ref={areaRef}
        onClick={(e) => {
          if (overlay === "expose" && e.target === e.currentTarget) setOverlay("none");
        }}
      >
        {overlay === "desktop" && <button type="button" className="mac-desktop__catcher" onClick={() => setOverlay("none")} aria-label="Bring windows back" />}
        <DesktopIcons />
        {snapPresence.mounted && (
          <div className={`mac-snap-preview mac-snap-preview--${snapHint ?? lastSnap.current}${snapPresence.closing ? " is-hidden" : ""}`} aria-hidden="true" />
        )}
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
      {cornerFx && !motionReduced() && <div key={cornerFx.n} className={`mac-corner-fx mac-corner-fx--${cornerFx.corner}`} aria-hidden="true" />}
      <Dock />
      <WidgetsPanel />
      <Launchpad />
      <Screensaver />
      <AppSwitcher />
      <SystemStates />
      {prefs.brightness < 1 && <div className="mac-dim" style={{ opacity: 1 - prefs.brightness }} aria-hidden="true" />}
    </div>
  );
}

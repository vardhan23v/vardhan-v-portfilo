import { useEffect } from "react";
import { useNav, type PageId } from "../../hooks/useNav";
import { useWindowManager } from "../../hooks/useWindowManager";
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
  const { overlay, setOverlay, toggleOverlay } = useShell();

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

  // ⌘/Ctrl+M minimizes the active window (⌘W is browser-reserved).
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "m") {
        e.preventDefault();
        if (activeId) minimizeWindow(activeId);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeId, minimizeWindow]);

  // Shell commands in Spotlight.
  useEffect(() => {
    register([
      { id: "launchpad", label: "Open Launchpad", hint: "apps", action: () => setOverlay("launchpad") },
      { id: "widgets", label: "Toggle Widgets", hint: "clock · github", action: () => toggleOverlay("widgets") },
      { id: "reset-icons", label: "Reset desktop icons", hint: "desktop", action: () => window.dispatchEvent(new Event("mac-reset-desktop-icons")) },
    ]);
  }, [register, setOverlay, toggleOverlay]);

  const visible = windows.filter((w) => !w.minimized).length;

  return (
    <div className="mac-desktop">
      <Wallpaper />
      <MenuBar />
      <div className="mac-desktop__area">
        <DesktopIcons />
        {windows.map((w) => (
          <WindowFrame key={w.id} id={w.id} title={w.title}>
            <AppContent appId={w.id} />
          </WindowFrame>
        ))}
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
    </div>
  );
}

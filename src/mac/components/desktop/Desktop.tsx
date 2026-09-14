import { useEffect } from "react";
import { useNav, type PageId } from "../../hooks/useNav";
import { useWindowManager } from "../../hooks/useWindowManager";
import { WindowFrame } from "../window/WindowFrame";
import { AppContent } from "../../apps/AppContent";
import { MenuBar } from "./MenuBar";
import { Dock } from "./Dock";

const PAGE_SHORTCUTS: Record<string, PageId> = {
  "1": "overview", "2": "about", "3": "projects", "4": "experience",
  "5": "skills", "6": "achievements", "7": "contact",
};

const isPageId = (id: string): id is PageId =>
  ["overview", "about", "projects", "experience", "skills", "achievements", "contact"].includes(id);

/** Desktop shell: menu bar + window layer + dock.
 *  Replaces the old single-window AppShell; all page components render
 *  untouched inside WindowFrames via AppContent. */
export function Desktop() {
  const { navigate, page } = useNav();
  const { windows, activeId, openWindow, minimizeWindow } = useWindowManager();

  // 1–7 shortcuts open/focus the page window (migrated from old PageContent).
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      const p = PAGE_SHORTCUTS[e.key];
      if (p) {
        navigate(p);
        openWindow(p);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate, openWindow]);

  // Keep the sidebar highlight in sync when focus moves between page windows.
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

  return (
    <div className="mac-desktop">
      <div className="mac-bg" aria-hidden="true">
        <div className="mac-blob mac-blob--a" />
        <div className="mac-blob mac-blob--b" />
      </div>
      <MenuBar />
      <div className="mac-desktop__area">
        {windows.map((w) => (
          <WindowFrame key={w.id} id={w.id} title={w.title}>
            <AppContent appId={w.id} />
          </WindowFrame>
        ))}
        {windows.filter((w) => !w.minimized).length === 0 && (
          <div className="mac-desktop__empty">
            <div className="mac-desktop__empty-title">All windows minimized</div>
            <div className="mac-desktop__empty-sub">Click the Dock or press ⌘K to continue.</div>
          </div>
        )}
      </div>
      <Dock />
    </div>
  );
}

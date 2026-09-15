import { useEffect, useCallback, useState } from "react";

export function HelpOverlay() {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const isTyping = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      // ? without modifiers opens help (Shift+/). Also handle "/" with meta as fallback.
      if (!isTyping && e.key === "?" ) {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape" && open) close();
    };
    const onCustom = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-help-overlay" as any, onCustom);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-help-overlay" as any, onCustom);
    };
  }, [open, close]);

  if (!open) return null;

  return (
    <div className="help-overlay" onClick={close} role="dialog" aria-modal="true" aria-label="Keyboard shortcuts">
      <div className="help-panel" onClick={(e) => e.stopPropagation()}>
        <div className="help-panel__head">
          <div>
            <div className="help-panel__title">Keyboard Shortcuts</div>
            <div className="help-panel__sub">Press <kbd>?</kbd> anytime to toggle · <kbd>Esc</kbd> to close</div>
          </div>
          <button className="mac-btn mac-btn--ghost" onClick={close} aria-label="Close help">✕</button>
        </div>

        <div className="help-grid">
          <section>
            <h3>General</h3>
            <dl>
              <dt><kbd>⌘K</kbd> / <kbd>Ctrl K</kbd></dt><dd>Spotlight — search pages, projects, actions</dd>
              <dt><kbd>?</kbd></dt><dd>Toggle this help</dd>
              <dt><kbd>Esc</kbd></dt><dd>Close palette / modal / menu</dd>
              <dt><kbd>⌘,</kbd></dt><dd>Open Settings</dd>
            </dl>
          </section>
          <section>
            <h3>Navigation</h3>
            <dl>
              <dt><kbd>1</kbd>–<kbd>7</kbd></dt><dd>Overview / About / Projects / Experience / Skills / Achievements / Contact</dd>
              <dt><kbd>↑</kbd> <kbd>↓</kbd> + <kbd>↵</kbd></dt><dd>Navigate Spotlight results</dd>
              <dt>Click Dock</dt><dd>Open / focus app · Launchpad opens the app grid</dd>
              <dt>Click clock</dt><dd>Widgets panel (IST, GitHub, status, links)</dd>
              <dt>Desktop icons</dt><dd>Drag to arrange · double-click to open</dd>
            </dl>
          </section>
          <section>
            <h3>Windows</h3>
            <dl>
              <dt>Drag header</dt><dd>Move window (desktop only)</dd>
              <dt>Double-click header</dt><dd>Maximize / restore</dd>
              <dt>Drag corner</dt><dd>Resize</dd>
              <dt><kbd>⌘M</kbd></dt><dd>Minimize active window</dd>
              <dt><kbd>⌃↑</kbd> / <kbd>F3</kbd></dt><dd>Mission Control — every window in a grid</dd>
              <dt><kbd>⇧⌘D</kbd></dt><dd>Show desktop</dd>
              <dt><kbd>⌥Tab</kbd></dt><dd>App switcher — hold ⌥, tap Tab to cycle, release to focus</dd>
              <dt>Drag to an edge</dt><dd>Snap left / right half · top edge fills the desk</dd>
              <dt>Traffic lights</dt><dd>Close / Minimize / Zoom</dd>
            </dl>
          </section>
          <section>
            <h3>System</h3>
            <dl>
              <dt>Control Center</dt><dd>Theme, accent, brightness, volume, network, Focus</dd>
              <dt>Menu → View</dt><dd>Toggle appearance · Reset workspace</dd>
              <dt>Developer Mode</dt><dd>Settings → General → live inspector (windows, prefs, console)</dd>
            </dl>
          </section>
          <section>
            <h3>Apps</h3>
            <dl>
              <dt>Terminal</dt><dd><kbd>help</kbd> <kbd>about</kbd> <kbd>date</kbd> <kbd>repo &lt;slug&gt;</kbd> <kbd>open &lt;app&gt;</kbd> · <kbd>↑↓</kbd> history</dd>
              <dt>Vardhan AI</dt><dd>Ask about projects / stack / experience / education / contact — links open apps</dd>
              <dt>Finder</dt><dd>Browse projects · <kbd>Space</kbd> Quick Look · ←/→ screenshots</dd>
              <dt>Terminal extras</dt><dd><kbd>matrix</kbd> rain · <kbd>sudo hire vardhan</kbd> confetti</dd>
              <dt>Sounds</dt><dd>Settings → Sound → Interface sounds (boot chime, pops, dings)</dd>
            </dl>
          </section>
        </div>

        <div className="help-panel__foot">
          <span>Tip: All shortcuts respect focused inputs — type freely in Terminal & forms.</span>
        </div>
      </div>
    </div>
  );
}

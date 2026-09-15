import { Fragment, useState } from "react";
import { useWindowManager, type AppId } from "../../hooks/useWindowManager";
import { usePreferences } from "../../hooks/usePreferences";
import { useShell } from "../../hooks/useShell";
import { AppGlyph, type GlyphId } from "../ui/AppGlyph";

type DockId = AppId | "launchpad";
const DOCK_APPS: { id: DockId; label: string; sep?: boolean }[] = [
  { id: "finder", label: "Finder" },
  { id: "launchpad", label: "Launchpad" },
  { id: "overview", label: "Vardhan" },
  { id: "projects", label: "Projects" },
  { id: "terminal", label: "Terminal" },
  { id: "vardhan-ai", label: "Vardhan AI" },
  { id: "contact", label: "Contact" },
  { id: "settings", label: "Settings", sep: true },
];

/** Dock: open/focus apps, Launchpad overlay, running dots, CSS magnification. */
export function Dock() {
  const { windows, activeId, openWindow } = useWindowManager();
  const { prefs } = usePreferences();
  const { overlay, setOverlay, toggleOverlay } = useShell();
  const [bouncing, setBouncing] = useState<string | null>(null);
  const bounce = (id: string) => {
    setBouncing(id);
    window.setTimeout(() => setBouncing((b) => (b === id ? null : b)), 900);
  };

  return (
    <>
      {prefs.dockAutoHide && <div className="mac-dock-hotzone" aria-hidden="true" />}
      <div className={`mac-dock-wrap${prefs.dockAutoHide ? " is-autohide" : ""}`}>
        <nav className="mac-dock" aria-label="Dock">
          {DOCK_APPS.map(({ id, label, sep }) => {
            const isLaunchpad = id === "launchpad";
            const win = isLaunchpad ? undefined : windows.find((w) => w.id === id);
            const isActive = isLaunchpad ? overlay === "launchpad" : activeId === id && !!win && !win.minimized;
            return (
              <Fragment key={id}>
                {sep && <span className="mac-dock__sep" aria-hidden="true" />}
                <button
                  data-app={id}
                  className={`mac-dock__item${isActive ? " is-active" : ""}${win ? " is-open" : ""}${win?.minimized ? " is-minimized" : ""}${bouncing === id ? " is-bouncing" : ""}`}
                  onClick={() => {
                    if (isLaunchpad) toggleOverlay("launchpad");
                    else {
                      setOverlay("none");
                      if (!win || win.minimized) bounce(id);
                      openWindow(id as AppId);
                    }
                  }}
                  aria-label={`Open ${label}`}
                  title={label}
                >
                  <AppGlyph id={id as GlyphId} size={46} />
                  <span className="mac-dock__tip" aria-hidden="true">{label}</span>
                  <span className="mac-dock__dot" aria-hidden="true" />
                </button>
              </Fragment>
            );
          })}
        </nav>
      </div>
    </>
  );
}

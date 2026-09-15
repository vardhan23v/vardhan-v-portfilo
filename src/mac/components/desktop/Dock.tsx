import { Fragment } from "react";
import { Folder, LayoutDashboard, Briefcase, Terminal, Sparkles, Mail, Settings } from "lucide-react";
import { useWindowManager, type AppId } from "../../hooks/useWindowManager";
import { usePreferences } from "../../hooks/usePreferences";

const DOCK_APPS: { id: AppId; label: string; Icon: typeof Folder; sep?: boolean }[] = [
  { id: "finder", label: "Finder", Icon: Folder },
  { id: "overview", label: "Vardhan", Icon: LayoutDashboard },
  { id: "projects", label: "Projects", Icon: Briefcase },
  { id: "terminal", label: "Terminal", Icon: Terminal },
  { id: "vardhan-ai", label: "Vardhan AI", Icon: Sparkles },
  { id: "contact", label: "Contact", Icon: Mail },
  { id: "settings", label: "Settings", Icon: Settings, sep: true },
];

/** Phase-1 Dock: open/focus apps, active dot, minimized tick.
 *  Magnification is CSS proximity scaling (GPU transforms only). */
export function Dock() {
  const { windows, activeId, openWindow } = useWindowManager();
  const { prefs } = usePreferences();

  return (
    <>
      {prefs.dockAutoHide && <div className="mac-dock-hotzone" aria-hidden="true" />}
      <div className={`mac-dock-wrap${prefs.dockAutoHide ? " is-autohide" : ""}`} aria-hidden="false">
        <nav className="mac-dock" aria-label="Dock">
        {DOCK_APPS.map(({ id, label, Icon, sep }) => {
          const win = windows.find((w) => w.id === id);
          const isActive = activeId === id && win && !win.minimized;
          return (
            <Fragment key={id}>
            {sep && <span className="mac-dock__sep" aria-hidden="true" />}
            <button
              data-app={id}
              className={`mac-dock__item${isActive ? " is-active" : ""}${win ? " is-open" : ""}${win?.minimized ? " is-minimized" : ""}`}
              onClick={() => openWindow(id)}
              aria-label={`Open ${label}`}
              title={label}
            >
              <span className="mac-dock__icon"><Icon /></span>
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

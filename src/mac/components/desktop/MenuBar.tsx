import { Search, Sun, Moon } from "lucide-react";
import { useWindowManager } from "../../hooks/useWindowManager";
import { usePalette } from "../../hooks/usePalette";
import { useTheme } from "../../hooks/useTheme";
import { useIstTime } from "../../hooks/useIstTime";

/** Phase-1 menu bar: active app, Spotlight trigger, theme toggle, live clock.
 *  Dropdown menus arrive in a later phase. */
export function MenuBar() {
  const { windows, activeId } = useWindowManager();
  const { setOpen } = usePalette();
  const { theme, toggle } = useTheme();
  const ist = useIstTime(false);

  const active = windows.find((w) => w.id === activeId);
  const activeName = active ? active.title : "VardhanOS";

  return (
    <header className="mac-menubar" aria-label="Menu bar">
      <div className="mac-menubar__left">
        <span className="mac-menubar__logo" aria-hidden="true">V</span>
        <span className="mac-menubar__app">{activeName}</span>
        <span className="mac-menubar__menus" aria-hidden="true">
          <span>File</span><span>Edit</span><span>View</span><span>Window</span><span>Help</span>
        </span>
      </div>
      <div className="mac-menubar__right">
        <span className="mac-menubar__clock" title="India Standard Time">{ist}</span>
        <button className="mac-menubar__btn" onClick={() => setOpen(true)} aria-label="Open Spotlight search" title="Spotlight (⌘K)">
          <Search />
        </button>
        <button
          className="mac-menubar__btn"
          onClick={toggle}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          title="Toggle theme"
        >
          {theme === "dark" ? <Sun /> : <Moon />}
        </button>
      </div>
    </header>
  );
}

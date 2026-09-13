import { Search, Moon, Sun, Menu } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import { usePalette } from "../../hooks/usePalette";
import { useNav } from "../../hooks/useNav";

const PAGE_TITLES: Record<string, string> = {
  overview: "Overview",
  about: "About",
  projects: "Projects",
  experience: "Experience",
  skills: "Skills",
  achievements: "Achievements",
  contact: "Contact",
};

export function Toolbar() {
  const { theme, toggle } = useTheme();
  const { setOpen } = usePalette();
  const { page, setMobileOpen } = useNav();

  return (
    <div className="mac-toolbar">
      <div className="traffic-lights">
        <div className="traffic-light traffic-light--close" />
        <div className="traffic-light traffic-light--minimize" />
        <div className="traffic-light traffic-light--maximize" />
      </div>

      <button
        className="mac-toolbar__btn mac-toolbar__hamburger"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <Menu />
      </button>

      <div className="mac-toolbar__title">
        Vardhan — {PAGE_TITLES[page] ?? "Portfolio"}
      </div>

      <div className="mac-toolbar__actions">
        <button
          className="mac-toolbar__btn"
          onClick={() => setOpen(true)}
          aria-label="Open command palette"
          title="Search (⌘K)"
        >
          <Search />
        </button>
        <button
          className="mac-toolbar__btn"
          onClick={toggle}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? <Sun /> : <Moon />}
        </button>
      </div>
    </div>
  );
}

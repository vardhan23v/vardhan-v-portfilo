import { Search, Moon, Sun, Menu } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import { usePalette } from "../../hooks/usePalette";
import { useNav } from "../../hooks/useNav";
import { useIstTime } from "../../hooks/useIstTime";
import { featuredProjects } from "../../data/projects";
import { skillCategories } from "../../data/skills";
import { experience } from "../../data/experience";
import type { WindowState } from "../AppShell";

const PAGE_TITLES: Record<string, string> = {
  overview: "Overview",
  about: "About",
  projects: "Projects",
  experience: "Experience",
  skills: "Skills",
  achievements: "Achievements",
  contact: "Contact",
};

const PAGE_CONTEXT: Record<string, string> = {
  overview: "Vardhan — developer workspace",
  about: "The story behind the work",
  projects: `${featuredProjects.length} featured · 13 more`,
  experience: `${experience.length} roles · 2026 — present`,
  skills: `${skillCategories.reduce((a, c) => a + c.items.length, 0)}+ technologies`,
  achievements: "Education & certifications",
  contact: "Replies within 24h",
};

export function Toolbar({ win, setWin }: { win: WindowState; setWin: (w: WindowState) => void }) {
  const { theme, toggle } = useTheme();
  const { setOpen } = usePalette();
  const { page, setMobileOpen } = useNav();
  const ist = useIstTime();

  const toggleMax = () => setWin(win === "maximized" ? "normal" : "maximized");

  return (
    <div className="mac-toolbar">
      <div className="traffic-lights" role="group" aria-label="Window controls">
        <button
          type="button"
          className="traffic-light traffic-light--close"
          onClick={() => setWin(win === "closed" ? "normal" : "closed")}
          aria-label={win === "closed" ? "Reopen window" : "Close window"}
          title="Close"
        />
        <button
          type="button"
          className="traffic-light traffic-light--minimize"
          onClick={() => setWin(win === "minimized" ? "normal" : "minimized")}
          aria-label={win === "minimized" ? "Restore window" : "Minimize window"}
          title="Minimize"
        />
        <button
          type="button"
          className="traffic-light traffic-light--maximize"
          onClick={toggleMax}
          aria-label={win === "maximized" ? "Exit full screen" : "Maximize window"}
          title={win === "maximized" ? "Restore" : "Maximize"}
        />
      </div>

      <button
        className="mac-toolbar__btn mac-toolbar__hamburger"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <Menu />
      </button>

      <div key={page} className="mac-toolbar__title mac-toolbar__title--fade">Vardhan — {PAGE_TITLES[page] ?? "Portfolio"}</div>
      <div key={page + "-ctx"} className="mac-toolbar__context mac-toolbar__title--fade">{PAGE_CONTEXT[page]}</div>

      <div className="mac-toolbar__actions">
        <span className="mac-toolbar__clock" title="India Standard Time">
          {ist}
        </span>
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
          title="Toggle theme"
        >
          {theme === "dark" ? <Sun /> : <Moon />}
        </button>
      </div>
    </div>
  );
}

import { useEffect, useLayoutEffect, useRef } from "react";
import { ThemeProvider, useTheme } from "./hooks/useTheme";
import { NavProvider, useNav, type PageId } from "./hooks/useNav";
import { PaletteProvider } from "./hooks/usePalette";
import { ToastProvider } from "./components/ui/Toast";
import { AppShell } from "./components/AppShell";
import { CommandPalette } from "./components/command-palette/CommandPalette";
import { OverviewPage } from "./pages/overview/OverviewPage";
import { AboutPage } from "./pages/about/AboutPage";
import { ProjectsPage } from "./pages/projects/ProjectsPage";
import { ExperiencePage } from "./pages/experience/ExperiencePage";
import { SkillsPage } from "./pages/skills/SkillsPage";
import { AchievementsPage } from "./pages/achievements/AchievementsPage";
import { ContactPage } from "./pages/contact/ContactPage";
import "./styles.css";

const PAGES: Record<PageId, React.ComponentType> = {
  overview: OverviewPage,
  about: AboutPage,
  projects: ProjectsPage,
  experience: ExperiencePage,
  skills: SkillsPage,
  achievements: AchievementsPage,
  contact: ContactPage,
};

function PageContent() {
  const { page, navigate } = useNav();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;

      const shortcuts: Record<string, PageId> = {
        "1": "overview",
        "2": "about",
        "3": "projects",
        "4": "experience",
        "5": "skills",
        "6": "achievements",
        "7": "contact",
      };

      if (shortcuts[e.key]) {
        navigate(shortcuts[e.key]);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [page]);

  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollHeight - el.clientHeight;
      el.style.setProperty("--scroll", String(max > 0 ? Math.min(el.scrollTop / max, 1) : 0));
    };
    el.style.setProperty("--scroll", "0");
    el.addEventListener("scroll", update, { passive: true });
    update();
    return () => el.removeEventListener("scroll", update);
  }, [page]);

  const Page = PAGES[page];
  return (
    <div ref={contentRef} key={page} className="mac-content mac-content--animated">
      <div className="mac-scrollprogress" aria-hidden="true" />
      <Page />
    </div>
  );
}

function PageRouter() {
  return <PageContent />;
}

function MacInner() {
  const { theme } = useTheme();
  return (
    <div className="mac-root" data-theme={theme} data-cursor-off>
      <PaletteProvider>
        <NavProvider>
          <ToastProvider>
            <AppShell>
              <PageRouter />
            </AppShell>
            <CommandPalette />
          </ToastProvider>
        </NavProvider>
      </PaletteProvider>
    </div>
  );
}

export function MacPortfolio() {
  return (
    <ThemeProvider>
      <MacInner />
    </ThemeProvider>
  );
}

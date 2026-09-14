import { useLayoutEffect, useRef } from "react";
import type { PageId } from "../../hooks/useNav";
import { OverviewPage } from "../../pages/overview/OverviewPage";
import { AboutPage } from "../../pages/about/AboutPage";
import { ProjectsPage } from "../../pages/projects/ProjectsPage";
import { ExperiencePage } from "../../pages/experience/ExperiencePage";
import { SkillsPage } from "../../pages/skills/SkillsPage";
import { AchievementsPage } from "../../pages/achievements/AchievementsPage";
import { ContactPage } from "../../pages/contact/ContactPage";

const PAGES: Record<PageId, React.ComponentType> = {
  overview: OverviewPage,
  about: AboutPage,
  projects: ProjectsPage,
  experience: ExperiencePage,
  skills: SkillsPage,
  achievements: AchievementsPage,
  contact: ContactPage,
};

/** Per-window scroll container — preserves the old PageContent behavior
 *  (scroll reset + --scroll progress bar) inside each window. */
export function WindowPage({ page }: { page: PageId }) {
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
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
    <div ref={contentRef} className="mac-content mac-content--animated">
      <div className="mac-scrollprogress" aria-hidden="true" />
      <Page />
    </div>
  );
}

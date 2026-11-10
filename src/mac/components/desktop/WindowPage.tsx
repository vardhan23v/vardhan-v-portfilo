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

/** Scroll-driven animations draw the progress bar with no script (motion.css). */
const scrollTimeline = typeof CSS !== "undefined" && typeof CSS.supports === "function" && CSS.supports("animation-timeline: scroll()");

/** Per-window scroll container — preserves the old PageContent behavior
 *  (scroll reset + progress bar) inside each window. */
export function WindowPage({ page }: { page: PageId }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
  }, [page]);

  // Fallback: one rAF-batched transform write on the bar itself; the scroll range is cached
  // and refreshed by a ResizeObserver instead of being read on every scroll event.
  useLayoutEffect(() => {
    const el = contentRef.current;
    const bar = barRef.current;
    if (!el || !bar || scrollTimeline) return;
    let max = 0;
    let raf = 0;
    const measure = () => {
      max = el.scrollHeight - el.clientHeight;
    };
    const paint = () => {
      raf = 0;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(el.scrollTop / max, 1) : 0})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    measure();
    paint();
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = typeof ResizeObserver === "function" ? new ResizeObserver(() => { measure(); onScroll(); }) : null;
    ro?.observe(el);
    if (el.firstElementChild?.nextElementSibling) ro?.observe(el.firstElementChild.nextElementSibling);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro?.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [page]);

  const Page = PAGES[page];
  return (
    <div ref={contentRef} className="mac-content mac-content--animated">
      <div className="mac-scrollprogress" aria-hidden="true" ref={barRef} />
      <Page />
    </div>
  );
}

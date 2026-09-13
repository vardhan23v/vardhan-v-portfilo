import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, ExternalLink, X, LayoutGrid, Rows3, ChevronLeft, ChevronRight } from "lucide-react";
import { GithubIcon } from "../../lib/icons";
import { useNav } from "../../hooks/useNav";
import { usePalette } from "../../hooks/usePalette";
import { featuredProjects, otherProjects, type Project } from "../../data/projects";
import { catOf, categoryCounts, CATEGORY_LABELS, type ProjectCategory } from "../../lib/projects";
import { Reveal } from "../../components/ui/Reveal";
import { useTilt } from "../../../hooks/useTilt";
import "../../styles/projects.css";

type Category = "all" | ProjectCategory;
type Sort = "default" | "az" | "tech";

function highlight(text: string, q: string) {
  const query = q.trim();
  if (!query) return text;
  const i = text.toLowerCase().indexOf(query.toLowerCase());
  if (i === -1) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark>{text.slice(i, i + query.length)}</mark>
      {text.slice(i + query.length)}
    </>
  );
}

function ProjectCard({
  project,
  query,
  list,
  onClick,
}: {
  project: Project;
  query: string;
  list: boolean;
  onClick: () => void;
}) {
  const ref = useTilt<HTMLButtonElement>(7);
  return (
    <button
      ref={ref}
      className={`project-card${list ? " project-card--list" : ""}`}
      onClick={onClick}
    >
      <div className="project-card__top">
        <span className="project-card__cat">{CATEGORY_LABELS[catOf(project)]}</span>
        {project.highlight && <span className="mac-tag">flagship</span>}
        <span className="project-card__arrow" aria-hidden="true">
          →
        </span>
      </div>
      <div className="project-card__header">
        <span className="project-card__emoji">{project.emoji}</span>
        <div>
          <div className="project-card__name">{highlight(project.name, query)}</div>
          <div className="project-card__tagline">{highlight(project.tagline, query)}</div>
        </div>
      </div>
      <div className="project-card__tech">
        {project.tech.slice(0, list ? 4 : 5).map((t) => (
          <span className="mac-tag" key={t}>
            {highlight(t, query)}
          </span>
        ))}
        {project.tech.length > (list ? 4 : 5) && (
          <span className="mac-tag">+{project.tech.length - (list ? 4 : 5)}</span>
        )}
      </div>
    </button>
  );
}

function ProjectModal({
  project,
  siblings,
  onClose,
  onStep,
}: {
  project: Project;
  siblings: Project[];
  onClose: () => void;
  onStep: (dir: 1 | -1) => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const idx = siblings.findIndex((p) => p.slug === project.slug);
  const closeTimer = useRef(0);
  const [closing, setClosing] = useState(false);
  const [dir, setDir] = useState(1);

  const handleClose = useCallback(() => {
    setClosing(true);
    closeTimer.current = window.setTimeout(() => {
      setClosing(false);
      onClose();
    }, 170);
  }, [onClose]);

  const handleStep = useCallback(
    (d: 1 | -1) => {
      setDir(d);
      onStep(d);
    },
    [onStep]
  );

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowRight") handleStep(1);
      if (e.key === "ArrowLeft") handleStep(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(closeTimer.current);
    };
  }, [handleClose, handleStep]);

  const prevP = siblings[(idx - 1 + siblings.length) % siblings.length];
  const nextP = siblings[(idx + 1) % siblings.length];

  return (
    <div
      className={`project-modal-overlay${closing ? " project-modal-overlay--closing" : ""}`}
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${project.name} details`}
      onClick={(e) => {
        if (e.target === overlayRef.current) handleClose();
      }}
    >
      <div
        key={project.slug}
        className={`project-modal${closing ? " project-modal--closing" : dir === -1 ? " project-modal__slide--left" : " project-modal__slide"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="project-modal__header">
          <span className="project-modal__emoji">{project.emoji}</span>
          <div className="project-modal__header-text">
            <div className="project-card__cat">{CATEGORY_LABELS[catOf(project)]}</div>
            <div className="project-modal__name">{project.name}</div>
            <div className="project-modal__tagline">{project.tagline}</div>
          </div>
          <button className="project-modal__close" onClick={onClose} aria-label="Close (Esc)">
            <X />
          </button>
        </div>
        <div className="project-modal__body">
          <div className="project-modal__section">
            <div className="project-modal__section-title">The problem</div>
            <p className="project-modal__problem">{project.problem}</p>
          </div>
          <div className="project-modal__section">
            <div className="project-modal__section-title">What it does</div>
            <ul className="project-modal__features">
              {project.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
          <div className="project-modal__section">
            <div className="project-modal__section-title">Stack</div>
            <div className="project-modal__tech">
              {project.tech.map((t) => (
                <span className="mac-tag" key={t}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="project-modal__footer">
          <a className="mac-btn mac-btn--ghost" href={project.github} target="_blank" rel="noopener noreferrer">
            <GithubIcon size={14} /> GitHub
          </a>
          {project.live && (
            <a className="mac-btn mac-btn--primary" href={project.live} target="_blank" rel="noopener noreferrer">
              <ExternalLink /> Live Demo
            </a>
          )}
        </div>
        {siblings.length > 1 && (
          <div className="project-modal__nav">
            <button onClick={() => handleStep(-1)}>
              <ChevronLeft style={{ width: 12, height: 12, display: "inline", verticalAlign: -1 }} />{" "}
              {prevP?.name ?? "Prev"}
            </button>
            <button onClick={() => handleStep(1)}>
              {nextP?.name ?? "Next"}{" "}
              <ChevronRight style={{ width: 12, height: 12, display: "inline", verticalAlign: -1 }} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function ProjectsPage() {
  const { openProject, setOpenProject } = useNav();
  const { setOpen: setPaletteOpen } = usePalette();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<Category>("all");
  const [sort, setSort] = useState<Sort>("default");
  const [listView, setListView] = useState(false);

  const counts = useMemo(() => categoryCounts(featuredProjects), []);

  const filtered = useMemo(() => {
    let list = [...featuredProjects];
    if (cat !== "all") list = list.filter((p) => catOf(p) === cat);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.tech.some((t) => t.toLowerCase().includes(q)) ||
          p.slug.includes(q)
      );
    }
    if (sort === "az") list.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "tech") list.sort((a, b) => b.tech.length - a.tech.length);
    return list;
  }, [cat, query, sort]);

  const hasFilters = cat !== "all" || !!query.trim() || sort !== "default";
  const clear = () => {
    setCat("all");
    setQuery("");
    setSort("default");
  };

  const step = (dir: 1 | -1) => {
    if (!openProject || filtered.length < 2) return;
    const i = filtered.findIndex((p) => p.slug === openProject.slug);
    const n = filtered[(i + dir + filtered.length) % filtered.length];
    if (n) setOpenProject(n);
  };

  // if the open project gets filtered out, keep the modal usable via full list
  const siblings = filtered.some((p) => p.slug === openProject?.slug) ? filtered : featuredProjects;

  return (
    <div className="mac-page">
      <div className="page-header">
        <div className="page-header__eyebrow">Projects</div>
        <h1 className="page-header__title">Featured Work</h1>
        <p className="page-header__subtitle">
          {featuredProjects.length} featured projects — each with a real problem, real features, and a real
          tech stack.
        </p>
      </div>

      <div className="mac-toolrow">
        <label className="mac-search">
          <Search />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, stacks…"
            aria-label="Search projects"
          />
          <kbd>⌘K</kbd>
        </label>
        <select
          className="mac-select"
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          aria-label="Sort projects"
        >
          <option value="default">Featured</option>
          <option value="az">A–Z</option>
          <option value="tech">Most stack</option>
        </select>
        <button
          className="mac-select"
          onClick={() => setListView((v) => !v)}
          aria-label={listView ? "Switch to grid view" : "Switch to list view"}
          title={listView ? "Grid view" : "List view"}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}
        >
          {listView ? <LayoutGrid style={{ width: 14, height: 14 }} /> : <Rows3 style={{ width: 14, height: 14 }} />}
          {listView ? "Grid" : "List"}
        </button>
      </div>

      <div className="mac-pills" style={{ marginBottom: "var(--sp-3)" }} role="group" aria-label="Filter by category">
        <button className={`mac-pill${cat === "all" ? " mac-pill--active" : ""}`} onClick={() => setCat("all")}>
          All <span className="mac-pill__count">{featuredProjects.length}</span>
        </button>
        {(Object.keys(CATEGORY_LABELS) as ProjectCategory[]).map((c) => (
          <button
            key={c}
            className={`mac-pill${cat === c ? " mac-pill--active" : ""}`}
            onClick={() => setCat(cat === c ? "all" : c)}
          >
            {CATEGORY_LABELS[c]} <span className="mac-pill__count">{counts[c]}</span>
          </button>
        ))}
      </div>

      <div className="mac-resultline">
        <span>
          {filtered.length} of {featuredProjects.length} shown
        </span>
        {hasFilters && (
          <button onClick={clear}>Clear filters</button>
        )}
        <span style={{ marginLeft: "auto" }}>
          <button onClick={() => setPaletteOpen(true)} title="Open Spotlight (⌘K)">
            Spotlight ⌘K
          </button>
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="mac-empty">
          <span className="mac-empty__emoji">🔍</span>
          <div className="mac-empty__title">No projects match</div>
          <div className="mac-empty__sub">Try a different search or category.</div>
          <button className="mac-btn mac-btn--primary" onClick={clear}>
            Clear filters
          </button>
        </div>
      ) : (
        <div className={`project-grid${listView ? " project-grid--list" : ""}`}>
          {filtered.map((p, i) => (
            <Reveal key={p.slug} index={Math.min(i, 5)}>
              <ProjectCard project={p} query={query} list={listView} onClick={() => setOpenProject(p)} />
            </Reveal>
          ))}
        </div>
      )}

      <div className="mac-section">
        <Reveal>
          <div className="page-header__eyebrow">Other things</div>
          <h2 className="page-header__title" style={{ fontSize: "var(--text-2xl)" }}>
            Other Things I&apos;ve Built
          </h2>
        </Reveal>
        <div className="project-grid" style={{ marginTop: "var(--sp-4)" }}>
          {otherProjects.map((p, i) => (
            <Reveal key={p.name} index={Math.min(i, 4)}>
              <a className="project-card" href={p.github} target="_blank" rel="noopener noreferrer">
                <div className="project-card__header">
                  <span className="project-card__emoji">{p.emoji}</span>
                  <div>
                    <div className="project-card__name">{p.name}</div>
                    <div className="project-card__tagline">{p.description}</div>
                  </div>
                </div>
                <div className="project-card__tech">
                  {p.tech.map((t) => (
                    <span className="mac-tag" key={t}>
                      {t}
                    </span>
                  ))}
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>

      {openProject && (
        <ProjectModal
          project={openProject}
          siblings={siblings}
          onClose={() => setOpenProject(null)}
          onStep={step}
        />
      )}
    </div>
  );
}

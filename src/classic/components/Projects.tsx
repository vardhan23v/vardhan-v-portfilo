import { useEffect, useRef, useState } from "react";
import type { Project } from "../data/projects";
import { featuredProjects, otherProjects } from "../data/projects";
import { SectionHead } from "./SectionHead";
import { useTilt } from "../../hooks/useTilt";
import { Reveal } from "../hooks/useReveal";
import { Icon } from "../lib/icons";
import { site } from "../data/site";
import "./Projects.css";

const CATEGORY: Record<string, "AI" | "full-stack"> = {
  "extension-ai": "AI",
  "ai-code-reviewer": "AI",
  "careerforge-pro": "AI",
  "vard-ai": "AI",
  "disastermind-ai": "AI",
  drivenest: "full-stack",
  "campus-compass": "full-stack",
};

type Filter = "all" | "AI" | "full-stack";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "all" },
  { id: "AI", label: "ai" },
  { id: "full-stack", label: "full-stack" },
];

function Mark({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const lower = text.toLowerCase();
  const i = lower.indexOf(query);
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="project-hl">{text.slice(i, i + query.length)}</mark>
      {text.slice(i + query.length)}
    </>
  );
}

function ProjectCard({ project, query }: { project: Project; query: string }) {
  const [a1, a2, a3] = project.accent;
  const ref = useTilt<HTMLDivElement>(4, ".project-card");
  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    e.currentTarget.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
  };
  return (
    <div ref={ref}>
      <article
        className={`project-card card ${project.highlight ? "project-card-featured" : ""}`}
        style={
          {
            "--pa1": a1,
            "--pa2": a2,
            "--pa3": a3,
          } as React.CSSProperties
        }
        onMouseMove={onMove}
      >
      <div className="project-visual" aria-hidden="true">
        <div className="project-chrome">
          <span className="terminal-dot terminal-dot-r" />
          <span className="terminal-dot terminal-dot-y" />
          <span className="terminal-dot terminal-dot-g" />
          <span className="project-chrome-path">
            {query ? `~/projects/*${query}*` : `${project.slug}.tsx`}
          </span>
          <span className="project-chrome-icon">{project.emoji}</span>
        </div>
        <div className="project-code">
          <span style={{ "--pi": 0 } as React.CSSProperties}>&gt; {project.slug}.build()</span>
          <span style={{ "--pi": 1 } as React.CSSProperties}>&gt; llm.connect("groq")</span>
          <span style={{ "--pi": 2 } as React.CSSProperties}>&gt; dispatch(&#123; deploy: true &#125;)</span>
          <span className="project-code-ok" style={{ "--pi": 3 } as React.CSSProperties}>&gt; ✓ shipped</span>
        </div>
      </div>

      <div className="project-body">
        <div className="project-top">
          <div>
            <h3 className="project-name"><Mark text={project.name} query={query} /></h3>
            <p className="project-tagline"><Mark text={project.tagline} query={query} /></p>
          </div>
          {project.highlight && <span className="project-badge">Flagship</span>}
        </div>

        <p className="project-problem">
          <span className="project-problem-label">The problem</span>
          <Mark text={project.problem} query={query} />
        </p>

        <ul className="project-features">
          {project.features.slice(0, project.highlight ? 6 : 4).map((f) => (
            <li key={f}>
              <Icon.check width={14} height={14} />
              <Mark text={f} query={query} />
            </li>
          ))}
        </ul>

        <div className="project-tech">
          {project.tech.map((t) => (
            <span key={t}>
              <Mark text={t} query={query} />
            </span>
          ))}
        </div>

        <div className="project-links">
          <a href={project.github} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
            <Icon.github width={16} height={16} /> GitHub
          </a>
          {project.live && (
            <a href={project.live} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
              <Icon.external width={15} height={15} /> Live Demo
            </a>
          )}
        </div>
      </div>
    </article>
    </div>
  );
}

export function Projects() {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/") return;
      const t = document.activeElement?.tagName;
      if (t === "INPUT" || t === "TEXTAREA") return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const q = query.trim().toLowerCase();
  const visible = featuredProjects.filter((p) => {
    const catOk = filter === "all" || CATEGORY[p.slug] === filter;
    if (!q) return catOk;
    const hay = [p.name, p.slug, p.tagline, p.problem, ...p.features, ...p.tech]
      .join(" ")
      .toLowerCase();
    return catOk && hay.includes(q);
  });

  return (
    <section id="projects">
      <div className="container">
        <SectionHead
          eyebrow="Featured Projects"
          title={<>Things I've actually <span className="grad-text">built and shipped</span></>}
          sub="AI-powered developer tools, assistants, and full-stack apps — each one solving a real problem."
        />

        <div className="project-toolbar">
          <div className="project-search" role="search">
            <span className="project-search-prompt" aria-hidden="true">$</span>
            <span className="project-search-cmd" aria-hidden="true">find ./projects</span>
            <input
              ref={inputRef}
              className="project-search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setQuery("");
              }}
              placeholder="--name llm"
              aria-label="Search projects"
            />
            <span className="project-search-cursor" aria-hidden="true" />
            <span className="project-search-count" aria-live="polite">
              {q
                ? `${visible.length} match${visible.length === 1 ? "" : "es"}`
                : `${featuredProjects.length} shipped`}
            </span>
          </div>

          <div className="project-filters" role="tablist" aria-label="Filter projects by category">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={filter === f.id}
                className={`project-filter${filter === f.id ? " is-active" : ""}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
                <span className="project-filter-count">
                  {f.id === "all"
                    ? featuredProjects.length
                    : featuredProjects.filter((p) => CATEGORY[p.slug] === f.id).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="projects-grid" key={`${filter}:${q}`}>
          {visible.map((p, i) => (
            <Reveal
              key={p.slug}
              as="div"
              className={p.highlight ? "project-wrap-featured" : ""}
              style={{ "--i": i } as React.CSSProperties}
            >
              <ProjectCard project={p} query={q} />
            </Reveal>
          ))}
        </div>

        {visible.length === 0 && (
          <div className="project-empty" role="status">
            <span className="project-empty-icon" aria-hidden="true">∅</span>
            <p>
              no matches for "<strong>{query}</strong>"
            </p>
            <span className="project-empty-hint">try "ai", "react", or "chrome"</span>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setQuery("")}
            >
              clear search
            </button>
          </div>
        )}

        <Reveal>
          <div className="others">
            <h3 className="others-title">
              <Icon.folder width={20} height={20} /> Other things I've built
            </h3>
            <div className="others-grid">
              {otherProjects.map((p) => (
                <a
                  key={p.name}
                  href={p.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="others-card card"
                >
                  <div className="others-card-top">
                    <span className="others-card-icon" aria-hidden="true">
                      {p.emoji}
                    </span>
                    <Icon.external width={16} height={16} className="others-card-ext" />
                  </div>
                  <h4>{p.name}</h4>
                  <p>{p.description}</p>
                  <div className="others-tech">
                    {p.tech.slice(0, 3).map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                </a>
              ))}
            </div>
            <div className="others-more">
              <a href={site.github} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                View All Projects on GitHub <Icon.arrowRight width={17} height={17} />
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
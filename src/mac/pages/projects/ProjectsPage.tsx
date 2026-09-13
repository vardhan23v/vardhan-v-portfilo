import { useState } from "react";
import { ExternalLink, X } from "lucide-react";
import { GithubIcon } from "../../lib/icons";
import { featuredProjects, otherProjects, type Project } from "../../data/projects";
import "../../styles/projects.css";

function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  return (
    <button className="project-card" onClick={onClick}>
      <div className="project-card__header">
        <span className="project-card__emoji">{project.emoji}</span>
        <div>
          <div className="project-card__name">{project.name}</div>
          <div className="project-card__tagline">{project.tagline}</div>
        </div>
      </div>
      <div className="project-card__tech">
        {project.tech.slice(0, 5).map((t) => (
          <span className="mac-tag" key={t}>{t}</span>
        ))}
        {project.tech.length > 5 && (
          <span className="mac-tag">+{project.tech.length - 5}</span>
        )}
      </div>
    </button>
  );
}

function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  return (
    <div className="project-modal-overlay" onClick={onClose}>
      <div className="project-modal" onClick={(e) => e.stopPropagation()}>
        <div className="project-modal__header">
          <span className="project-modal__emoji">{project.emoji}</span>
          <div className="project-modal__header-text">
            <div className="project-modal__name">{project.name}</div>
            <div className="project-modal__tagline">{project.tagline}</div>
          </div>
          <button className="project-modal__close" onClick={onClose} aria-label="Close">
            <X />
          </button>
        </div>
        <div className="project-modal__body">
          <div className="project-modal__section">
            <div className="project-modal__section-title">Problem</div>
            <p className="project-modal__problem">{project.problem}</p>
          </div>
          <div className="project-modal__section">
            <div className="project-modal__section-title">Features</div>
            <ul className="project-modal__features">
              {project.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
          <div className="project-modal__section">
            <div className="project-modal__section-title">Tech Stack</div>
            <div className="project-modal__tech">
              {project.tech.map((t) => (
                <span className="mac-tag" key={t}>{t}</span>
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
      </div>
    </div>
  );
}

export function ProjectsPage() {
  const [selected, setSelected] = useState<Project | null>(null);

  return (
    <div className="mac-page">
      <div className="page-header">
        <div className="page-header__eyebrow">Projects</div>
        <h1 className="page-header__title">Featured Work</h1>
        <p className="page-header__subtitle">
          {featuredProjects.length} featured projects — each with a real problem, real features, and a real tech stack.
        </p>
      </div>

      <div className="project-grid">
        {featuredProjects.map((p) => (
          <ProjectCard key={p.slug} project={p} onClick={() => setSelected(p)} />
        ))}
      </div>

      {otherProjects.length > 0 && (
        <>
          <div className="page-header" style={{ marginTop: "var(--sp-10)" }}>
            <div className="page-header__eyebrow">Other Things</div>
            <h2 className="page-header__title" style={{ fontSize: "var(--text-2xl)" }}>
              Other Things I've Built
            </h2>
          </div>
          <div className="project-grid">
            {otherProjects.map((p) => (
              <a
                key={p.name}
                className="project-card"
                href={p.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="project-card__header">
                  <span className="project-card__emoji">{p.emoji}</span>
                  <div>
                    <div className="project-card__name">{p.name}</div>
                    <div className="project-card__tagline">{p.description}</div>
                  </div>
                </div>
                <div className="project-card__tech">
                  {p.tech.map((t) => (
                    <span className="mac-tag" key={t}>{t}</span>
                  ))}
                </div>
              </a>
            ))}
          </div>
        </>
      )}

      {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

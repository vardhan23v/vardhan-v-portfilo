import { useEffect, useRef } from "react";
import type { Project } from "../data/projects";
import { Icon } from "../lib/icons";
import { monogram } from "../lib/monogram";

interface Props {
  project: Project | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

/** Slide-over quick view for a featured project. Esc / backdrop / ← → handled here. */
export function ProjectDrawer({ project, onClose, onPrev, onNext }: Props) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!project) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => closeRef.current?.focus(), 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") onPrev();
      else if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      restoreRef.current?.focus?.();
    };
  }, [project, onClose, onPrev, onNext]);

  if (!project) return null;
  const [a1, a2, a3] = project.accent;

  return (
    <div className="pd-root" role="dialog" aria-modal="true" aria-labelledby="pd-title">
      <button type="button" className="pd-backdrop" aria-label="Close project details" onClick={onClose} />
      <aside className="pd-panel card" style={{ "--pa1": a1, "--pa2": a2, "--pa3": a3 } as React.CSSProperties}>
        <div className="pd-head">
          <span className="pd-emoji" aria-hidden="true">{monogram(project.name)}</span>
          <div className="pd-titles">
            <h3 id="pd-title">{project.name}</h3>
            <p>{project.tagline}</p>
          </div>
          <button ref={closeRef} type="button" className="pd-close" onClick={onClose} aria-label="Close">
            <Icon.close width={18} height={18} />
          </button>
        </div>

        <div className="pd-badges">
          {project.highlight && <span className="project-badge">Flagship</span>}
          <span className={`pd-status ${project.live ? "is-live" : ""}`}>
            <i aria-hidden="true" /> {project.live ? "live" : "source only"}
          </span>
          <span className="pd-slug">{project.slug}</span>
        </div>

        {project.screenshots?.length ? (
          <div className="pd-shots">
            {project.screenshots.map((s, i) => (
              <img key={s} src={s} alt={`${project.name} screenshot ${i + 1}`} loading="lazy" decoding="async" />
            ))}
          </div>
        ) : null}

        <section className="pd-section">
          <h4>The problem</h4>
          <p>{project.problem}</p>
        </section>

        <section className="pd-section">
          <h4>What it does</h4>
          <ul className="pd-features">
            {project.features.map((f) => (
              <li key={f}>
                <Icon.check width={14} height={14} />
                {f}
              </li>
            ))}
          </ul>
        </section>

        <section className="pd-section">
          <h4>Stack</h4>
          <div className="project-tech pd-tech">
            {project.tech.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </section>

        <div className="pd-actions">
          <a href={project.github} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
            <Icon.github width={16} height={16} /> Source
          </a>
          {project.live && (
            <a href={project.live} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              <Icon.external width={15} height={15} /> Open live demo
            </a>
          )}
        </div>

        <div className="pd-nav">
          <button type="button" className="pd-navbtn" onClick={onPrev}>← previous</button>
          <span className="pd-hint" aria-hidden="true">esc closes · ← → browse</span>
          <button type="button" className="pd-navbtn" onClick={onNext}>next →</button>
        </div>
      </aside>
    </div>
  );
}

import { Link, Navigate, useParams } from "react-router-dom";
import { caseStudies } from "../data/work";
import { useReveal } from "../hooks/useReveal";
import { WorkDiagram } from "./WorkDiagram";
import "./WorkDetail.css";

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h9M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function WorkDetail() {
  const { slug } = useParams();
  const idx = caseStudies.findIndex((c) => c.slug === slug);
  if (idx === -1) return <Navigate to="/" replace />;

  const work = caseStudies[idx];
  const prev = caseStudies[(idx - 1 + caseStudies.length) % caseStudies.length];
  const next = caseStudies[(idx + 1) % caseStudies.length];
  const headRef = useReveal<HTMLElement>();

  return (
    <article className="case">
      <header className="container case-head" ref={headRef}>
        <Link to="/#work" className="case-back">
          ← Work
        </Link>
        <p className="case-number">
          Case study {work.number} / 0{caseStudies.length}
        </p>
        <h1 className="case-title">{work.name}</h1>
        <p className="case-tagline">{work.description}</p>
        <div className="case-links">
          <a href={work.github} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
            GitHub <Arrow />
          </a>
          {work.live && (
            <a href={work.live} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
              Live demo <Arrow />
            </a>
          )}
        </div>
        <dl className="case-tech">
          <dt>Stack</dt>
          <dd>{work.tech.join(" · ")}</dd>
        </dl>
      </header>

      <div className="container case-body">
        <section className="case-block" aria-labelledby="problem-h">
          <h2 id="problem-h">The problem</h2>
          <p>{work.problem}</p>
        </section>

        <section className="case-block" aria-labelledby="approach-h">
          <h2 id="approach-h">The approach</h2>
          <p>{work.approach}</p>
        </section>

        <section className="case-block case-block-arch" aria-labelledby="arch-h">
          <h2 id="arch-h">Architecture</h2>
          <div className="case-arch-grid">
            <WorkDiagram steps={work.architecture} />
            <p className="case-arch-cap">
              Data and responsibility flow through the stack in one direction. Each layer is
              replaceable without disturbing the rest.
            </p>
          </div>
        </section>

        <section className="case-block" aria-labelledby="decisions-h">
          <h2 id="decisions-h">Engineering decisions</h2>
          <ol className="case-decisions">
            {work.decisions.map((d, i) => (
              <li key={d.title}>
                <span className="case-d-num">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{d.title}</h3>
                  <p>{d.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="case-block" aria-labelledby="outcome-h">
          <h2 id="outcome-h">Outcome</h2>
          <p>{work.outcome}</p>
        </section>

        <section className="case-block" aria-labelledby="learned-h">
          <h2 id="learned-h">What I learned</h2>
          <ul className="case-learned">
            {work.learned.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </section>
      </div>

      <nav className="case-nav container" aria-label="More case studies">
        <Link to={`/work/${prev.slug}`} className="case-nav-item">
          <span className="case-nav-meta">← Previous</span>
          <span className="case-nav-name">{prev.number} — {prev.name}</span>
        </Link>
        <Link to={`/work/${next.slug}`} className="case-nav-item case-nav-next">
          <span className="case-nav-meta">Next →</span>
          <span className="case-nav-name">{next.number} — {next.name}</span>
        </Link>
      </nav>
    </article>
  );
}
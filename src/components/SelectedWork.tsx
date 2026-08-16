import { Link } from "react-router-dom";
import { caseStudies, otherWork } from "../data/work";
import { site } from "../data/site";
import { WorkDiagram } from "./WorkDiagram";
import { Reveal } from "../hooks/useReveal";
import "./Work.css";

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h9M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WorkVisual({ project }: { project: (typeof caseStudies)[number] }) {
  const image = project.slug === "disastermind-ai" ? "/work/disastermind-map.jpg" : undefined;
  if (image) {
    return (
      <img
        src={image}
        alt="DisasterMind AI tactical map during an active cyclone simulation"
        className="work-shot"
        width={640}
        height={386}
        loading="lazy"
      />
    );
  }
  return <WorkDiagram steps={project.architecture} />;
}

export function SelectedWork() {
  return (
    <section id="work">
      <div className="container">
        <Reveal>
          <header className="section-head">
            <span className="section-index">01 — Selected Work</span>
            <h2 className="section-title">Case studies, not feature lists.</h2>
            <p className="section-sub">
              Each project below is a story: the problem, how I approached it, the engineering
              decisions, and what I learned.
            </p>
          </header>
        </Reveal>

        <div className="work-list">
          {caseStudies.map((p, i) => {
            const flip = i % 2 === 1;
            return (
              <Reveal as="article" key={p.slug} className={`work-row ${flip ? "work-flip" : ""}`}>
                <div className="work-copy">
                  <span className="work-number">{p.number}</span>
                  <h3 className="work-name">
                    <Link to={`/work/${p.slug}`}>{p.name}</Link>
                  </h3>
                  <p className="work-tagline">{p.tagline}</p>
                  <p className="work-desc">{p.description}</p>
                  <Link to={`/work/${p.slug}`} className="link-arrow">
                    Case study <Arrow />
                  </Link>
                </div>

                <div className="work-visual">
                  <WorkVisual project={p} />
                </div>

                <dl className="work-details">
                  <div className="work-detail">
                    <dt>Problem</dt>
                    <dd>{p.problem}</dd>
                  </div>
                  <div className="work-detail">
                    <dt>Approach</dt>
                    <dd>{p.approach}</dd>
                  </div>
                  <div className="work-detail">
                    <dt>Technology</dt>
                    <dd>
                      <span className="work-tech">{p.tech.join(" · ")}</span>
                    </dd>
                  </div>
                  <div className="work-detail">
                    <dt>Outcome</dt>
                    <dd>{p.outcome}</dd>
                  </div>
                  <div className="work-detail work-detail-links">
                    <dt>Links</dt>
                    <dd className="work-links">
                      <a href={p.github} target="_blank" rel="noopener noreferrer" className="link-arrow">
                        GitHub <Arrow />
                      </a>
                      {p.live && (
                        <a href={p.live} target="_blank" rel="noopener noreferrer" className="link-arrow">
                          Live <Arrow />
                        </a>
                      )}
                    </dd>
                  </div>
                </dl>
              </Reveal>
            );
          })}
        </div>

        <Reveal>
          <div className="other-work">
            <h3>
              <span className="section-index">Also built</span>
            </h3>
            <ul className="other-work-list">
              {otherWork.map((o) => (
                <li key={o.name}>
                  <a href={o.url} target="_blank" rel="noopener noreferrer" className="other-work-row">
                    <span className="other-work-name">{o.name}</span>
                    <span className="other-work-note">{o.note}</span>
                    <span className="other-work-ext" aria-hidden="true">
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="other-work-more">
              <a href={`${site.github}`} target="_blank" rel="noopener noreferrer" className="link-arrow">
                Explore everything on GitHub <Arrow />
              </a>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
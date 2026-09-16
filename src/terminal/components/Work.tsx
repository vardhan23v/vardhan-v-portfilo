import { Link } from "react-router-dom";
import { caseStudies, otherWork } from "../data/work";
import { Reveal } from "../hooks/useReveal";
import { TypeCmd } from "./TypeCmd";

export function Work() {
  return (
    <section className="section" id="work" aria-labelledby="work-title">
      <div className="container">
        <div className="shell">
          <Reveal>
            <div className="shell-head">
              <TypeCmd cmd="ls -l ./work/" />
              <h2 className="shell-title" id="work-title">
                SELECTED_PROJECTS <span className="dim">// {String(caseStudies.length).padStart(2, "0")} shipped</span>
              </h2>
            </div>
          </Reveal>

          <Reveal>
            <div className="term">
              <div className="term-bar" aria-hidden="true">
                <span className="term-dot r" />
                <span className="term-dot a" />
                <span className="term-dot g" />
                <span className="term-title">
                  <b>vardhan@folio</b>:~/work$ ls -la
                </span>
              </div>
              <div className="term-body">
                <div className="prog-grid">
                  {caseStudies.map((p) => (
                    <div className="prog" key={p.slug} data-spot style={{ "--i": caseStudies.indexOf(p) } as React.CSSProperties}>
                      <div className="prog-idx" aria-hidden="true">
                        {p.number}
                      </div>
                      <div>
                        <Link to={`/terminal/work/${p.slug}`} className="prog-name">
                          {p.name}
                          <span className="suffix">/</span>
                          <span className="arrow" aria-hidden="true">
                            ▸
                          </span>
                        </Link>
                        <p className="prog-desc">{p.description}</p>
                        <div className="prog-tech">
                          {p.tech.slice(0, 5).map((t) => (
                            <span className="chip" key={t}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="prog-side">
                        <span className={`badge ${p.live ? "" : "amber"}`}>
                          {p.live ? "LIVE" : "SOURCE"}
                        </span>
                        <div className="prog-links">
                          {p.live && (
                            <a className="tlink" href={p.live} target="_blank" rel="noopener noreferrer">
                              demo
                            </a>
                          )}
                          <a
                            className="tlink"
                            href={p.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`git clone https://github.com/vardhan23v/${p.slug}`}
                          >
                            src
                          </a>
                          <Link className="tlink-dim" to={`/terminal/work/${p.slug}`}>
                            case-study
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <div className="other-work">
              <div className="shell-head">
                <TypeCmd cmd="ls -1 ./also_built/" />
                <h3 className="shell-title">
                  ALSO_BUILT <span className="dim">// {otherWork.length} experiments &amp; tools</span>
                </h3>
              </div>
              <div className="other-grid" role="list">
                {otherWork.map((o, i) => (
                  <a
                    className="other-item"
                    role="listitem"
                    key={o.name}
                    href={o.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-spot
                    style={{ "--i": i } as React.CSSProperties}
                  >
                    <span className="other-idx" aria-hidden="true">[{String(i).padStart(2, "0")}]</span>
                    <span className="other-main">
                      <span className="other-name">
                        {o.name}
                        <span className="bracket">/</span>
                      </span>
                      <span className="other-note">{o.note}</span>
                    </span>
                    <span className={`remote-lang lang-${(o.lang ?? "").toLowerCase()}`}>
                      <i aria-hidden="true" />
                      {o.lang ?? "—"}
                    </span>
                    <span className="other-go" aria-hidden="true">↗</span>
                  </a>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
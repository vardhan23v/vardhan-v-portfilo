import { Link } from "react-router-dom";
import { caseStudies, otherWork } from "../data/work";
import { Reveal } from "../hooks/useReveal";

export function Work() {
  return (
    <section className="section" id="work" aria-labelledby="work-title">
      <div className="container">
        <div className="shell">
          <Reveal>
            <div className="shell-head">
              <span className="cmdline">
                <span className="dollar">$</span> ls -l ./work/
              </span>
              <h2 className="shell-title" id="work-title">
                SELECTED_PROJECTS <span className="dim">// 05 shipped</span>
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
                    <div className="prog" key={p.slug}>
                      <div className="prog-idx" aria-hidden="true">
                        {p.number}
                      </div>
                      <div>
                        <Link to={`/work/${p.slug}`} className="prog-name">
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
                          <Link className="tlink-dim" to={`/work/${p.slug}`}>
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
                <span className="cmdline">
                  <span className="dollar">$</span> ls ./also_built/
                </span>
                <h3 className="shell-title">
                  ALSO_BUILT <span className="dim">// experiments &amp; tools</span>
                </h3>
              </div>
              <div className="other-grid">
                {otherWork.map((o) => (
                  <div className="other-item" key={o.name}>
                    <a href={o.url} target="_blank" rel="noopener noreferrer">
                      {o.name}
                      <span className="bracket">/</span>
                    </a>
                    <p>{o.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
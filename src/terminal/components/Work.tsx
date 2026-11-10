import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motionReduced } from "../../lib/motion";
import { caseStudies, otherWork } from "../data/work";
import { Reveal } from "../hooks/useReveal";
import { TypeCmd } from "./TypeCmd";

/** ALSO_BUILT shows this many cards until `ls -a` expands the rest. */
const LIMIT = 8;

export function Work() {
  const [all, setAll] = useState(false);
  const moreBtn = useRef<HTMLButtonElement | null>(null);
  const firstMore = useRef<HTMLAnchorElement | null>(null);
  const hidden = otherWork.length - LIMIT;
  const shown = all ? otherWork : otherWork.slice(0, LIMIT);

  const toggle = () => {
    if (!all) {
      setAll(true);
      // keyboard / screen-reader users land on the first newly listed project
      requestAnimationFrame(() => firstMore.current?.focus());
      return;
    }
    setAll(false);
    requestAnimationFrame(() => moreBtn.current?.scrollIntoView({ block: "nearest", behavior: motionReduced() ? "auto" : "smooth" }));
  };

  return (
    <section className="section" id="work" aria-labelledby="work-title">
      <div className="container">
        <div className="shell">
          <Reveal>
            <div className="shell-head">
              <TypeCmd cmd="ls -l ./work/" />
              <h2 className="shell-title" id="work-title">
                SELECTED_PROJECTS <span className="dim">// {String(caseStudies.length).padStart(2, "0")} case studies</span>
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
                        <Link to={`/terminal/work/${p.slug}`} className="prog-name" viewTransition>
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
                            title={`git clone ${p.github}`}
                          >
                            src
                          </a>
                          <Link className="tlink-dim" to={`/terminal/work/${p.slug}`} viewTransition>
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
                  ALSO_BUILT <span className="dim">// {otherWork.length} more projects &amp; tools</span>
                </h3>
              </div>
              <ul className="other-grid" id="also-built">
                {shown.map((o, i) => (
                  <li key={o.name}>
                  <a
                    className={`other-item${i >= LIMIT ? " is-more" : ""}`}
                    href={o.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-spot
                    ref={i === LIMIT ? firstMore : undefined}
                    style={{ "--i": i, "--j": Math.max(0, i - LIMIT) } as React.CSSProperties}
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
                  </li>
                ))}
              </ul>
              {hidden > 0 && (
                <button
                  type="button"
                  ref={moreBtn}
                  className="btn btn-sm other-more"
                  aria-expanded={all}
                  aria-controls="also-built"
                  onClick={toggle}
                >
                  {all ? "ls | head -8" : `ls -a  # ${hidden} more`}
                </button>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
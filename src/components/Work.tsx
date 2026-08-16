import { Link } from "react-router-dom";
import { caseStudies, otherWork } from "../data/work";
import { Reveal } from "../hooks/useReveal";

const dotColors = ["#818cf8", "#22d3ee", "#34d399", "#fbbf24", "#f472b6", "#a78bfa"];

export function Work() {
  return (
    <section className="section" id="work" aria-labelledby="work-title">
      <div className="container">
        <div className="sec-row">
          <Reveal>
            <div className="sec-head">
              <span className="eyebrow">selected work</span>
              <h2 className="sec-title" id="work-title">
                Products I've built
              </h2>
              <p className="sec-sub">
                Five case studies, each with its own stack, story, and engineering decisions.
                All source is public.
              </p>
            </div>
          </Reveal>
          <Reveal>
            <a className="tlink-arrow" href="https://github.com/vardhan23v" target="_blank" rel="noopener noreferrer">
              github.com/vardhan23v →
            </a>
          </Reveal>
        </div>

        <div className="work-grid">
          {caseStudies.map((p) => {
            const grad = `linear-gradient(135deg, ${p.theme.from}, ${p.theme.to})`;
            return (
              <Reveal key={p.slug}>
                <article
                  className="proj-card"
                  style={
                    {
                      "--c-grad": grad,
                      "--c-glow": p.theme.glow,
                    } as React.CSSProperties
                  }
                >
                  <Link to={`/work/${p.slug}`} className="proj-thumb" aria-label={`${p.name} — case study`}>
                    {p.shot ? (
                      <img src={p.shot} alt={`Screenshot of ${p.name}`} loading="lazy" />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: grad }} aria-hidden="true" />
                    )}
                    <span className="num">{p.number}</span>
                    <span className="name">{p.name}</span>
                  </Link>
                  <div className="proj-body">
                    <p className="proj-desc">{p.description}</p>
                    <div className="proj-chips">
                      {p.tech.slice(0, 5).map((t) => (
                        <span className="chip" key={t}>
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="proj-actions">
                      <span className={p.live ? "badge-live" : "badge-src"}>
                        {p.live ? "LIVE" : "SOURCE"}
                      </span>
                      {p.live && (
                        <a className="tlink" href={p.live} target="_blank" rel="noopener noreferrer">
                          demo
                        </a>
                      )}
                      <a className="tlink" href={p.github} target="_blank" rel="noopener noreferrer">
                        source
                      </a>
                      <Link className="tlink tlink-arrow" to={`/work/${p.slug}`}>
                        case study →
                      </Link>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>

        <Reveal>
          <div style={{ marginTop: 56 }}>
            <h3 className="sec-title" style={{ fontSize: "clamp(20px, 2.6vw, 26px)" }}>
              Also built <span style={{ color: "var(--text-3)", fontSize: "0.62em" }}>— experiments &amp; tools</span>
            </h3>
            <div className="also-row">
              {otherWork.map((o, i) => (
                <a
                  key={o.name}
                  className="also-pill"
                  href={o.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={o.note}
                >
                  <span
                    className="dot"
                    style={{ background: dotColors[i % dotColors.length], boxShadow: `0 0 8px ${dotColors[i % dotColors.length]}` }}
                    aria-hidden="true"
                  />
                  {o.name}
                </a>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
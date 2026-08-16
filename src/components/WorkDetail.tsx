import { Link, Navigate, useParams } from "react-router-dom";
import { caseStudies } from "../data/work";
import { Reveal } from "../hooks/useReveal";

const factIcons: Record<string, { icon: string; bg: string }> = {
  status: { icon: "●", bg: "linear-gradient(135deg, #34d399, #0d9488)" },
  role: { icon: "✦", bg: "linear-gradient(135deg, #a78bfa, #6366f1)" },
  stack: { icon: "◇", bg: "linear-gradient(135deg, #22d3ee, #3b82f6)" },
};

export function WorkDetail() {
  const { slug } = useParams<{ slug: string }>();
  const idx = caseStudies.findIndex((p) => p.slug === slug);
  if (idx === -1) return <Navigate to="/" replace />;

  const p = caseStudies[idx];
  const prev = caseStudies[(idx - 1 + caseStudies.length) % caseStudies.length];
  const next = caseStudies[(idx + 1) % caseStudies.length];
  const t = p.theme;
  const grad = `linear-gradient(135deg, ${t.from}, ${t.to})`;

  return (
    <section className="case" aria-labelledby="case-title">
      <div className="container">
        <Link to="/#work" className="case-back">
          ← Back to work
        </Link>

        <Reveal>
          <div className="case-head">
            <div>
              <span className="eyebrow">
                <span
                  className="dot"
                  style={{ background: t.main, boxShadow: `0 0 10px ${t.main}` }}
                  aria-hidden="true"
                />
                case study {p.number} / 05
              </span>
              <h1 className="case-title" id="case-title">
                {p.name}
              </h1>
              <p className="case-tagline">{p.tagline}</p>
              <div className="case-actions">
                {p.live && (
                  <a className="btn btn-primary" href={p.live} target="_blank" rel="noopener noreferrer">
                    Open live demo
                  </a>
                )}
                <a className="btn btn-ghost" href={p.github} target="_blank" rel="noopener noreferrer">
                  View source
                </a>
                {p.shot && (
                  <a className="btn btn-ghost" href={p.shot} target="_blank" rel="noopener noreferrer">
                    Screenshot
                  </a>
                )}
              </div>
            </div>

            <div className="case-facts">
              <div className="fact">
                <span className="fi" style={{ background: factIcons.status.bg }} aria-hidden="true">
                  ●
                </span>
                <div>
                  <div className="fl">Status</div>
                  <div className="fv">{p.live ? "Deployed & live" : "Source-only"}</div>
                </div>
              </div>
              <div className="fact">
                <span className="fi" style={{ background: factIcons.role.bg }} aria-hidden="true">
                  ✦
                </span>
                <div>
                  <div className="fl">Role</div>
                  <div className="fv">Sole builder — end to end</div>
                </div>
              </div>
              <div className="fact">
                <span className="fi" style={{ background: factIcons.stack.bg }} aria-hidden="true">
                  ◇
                </span>
                <div>
                  <div className="fl">Stack</div>
                  <div className="case-chip-row" style={{ marginTop: 4 }}>
                    {p.tech.slice(0, 5).map((tt) => (
                      <span className="chip" key={tt}>
                        {tt}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {p.shot && (
          <Reveal>
            <div className="feature-card" style={{ marginTop: 40, "--c-glow": t.glow } as React.CSSProperties}>
              <div className="feature-shot" style={{ aspectRatio: "21/9" }}>
                <img src={p.shot} alt={`Screenshot of ${p.name} in action`} loading="lazy" />
              </div>
            </div>
          </Reveal>
        )}

        <Reveal>
          <div className="case-sec">
            <h2 className="case-sec-h">
              <span className="sq">◆</span> The problem
            </h2>
            <p className="case-p">{p.problem}</p>
          </div>
        </Reveal>

        <Reveal>
          <div className="case-sec">
            <h2 className="case-sec-h">
              <span className="sq">◆</span> The approach
            </h2>
            <p className="case-p">{p.approach}</p>
          </div>
        </Reveal>

        <Reveal>
          <div className="case-sec">
            <h2 className="case-sec-h">
              <span className="sq">◆</span> Architecture
            </h2>
            <div className="arch-flow">
              {p.architecture.map((a, i) => (
                <div key={i}>
                  {i > 0 && <div className="arch-conn" aria-hidden="true" />}
                  <div className="arch-node">
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 3,
                        background: grad,
                        flex: "none",
                        boxShadow: `0 0 10px ${t.main}`,
                      }}
                      aria-hidden="true"
                    />
                    <b>{a.label}</b>
                    {a.note && <span className="an-note">{a.note}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="case-sec">
            <h2 className="case-sec-h">
              <span className="sq">◆</span> Engineering decisions
            </h2>
            <div className="dec-grid">
              {p.decisions.map((d, i) => (
                <div className="dec-card" key={i}>
                  <div className="dec-no" style={{ color: t.main }}>
                    DECISION 0{i + 1}
                  </div>
                  <h3>{d.title}</h3>
                  <p>{d.text}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="case-sec">
            <h2 className="case-sec-h">
              <span className="sq">◆</span> Outcome
            </h2>
            <div className="outcome-box">
              <p className="case-p">{p.outcome}</p>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="case-sec">
            <h2 className="case-sec-h">
              <span className="sq">◆</span> What I learned
            </h2>
            <ul className="learn-grid">
              {p.learned.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal>
          <nav className="case-prevnext" aria-label="Adjacent case studies">
            <Link to={`/work/${prev.slug}`}>
              <span className="dir">← Previous</span>
              <span className="nm">{prev.name}</span>
            </Link>
            <Link to={`/work/${next.slug}`} className="next-a">
              <span className="dir">Next →</span>
              <span className="nm">{next.name}</span>
            </Link>
          </nav>
        </Reveal>
      </div>
    </section>
  );
}
import { Link, Navigate, useParams } from "react-router-dom";
import { caseStudies } from "../data/work";

export function WorkDetail() {
  const { slug } = useParams<{ slug: string }>();
  const idx = caseStudies.findIndex((p) => p.slug === slug);
  if (idx === -1) return <Navigate to="/" replace />;

  const p = caseStudies[idx];
  const prev = caseStudies[(idx - 1 + caseStudies.length) % caseStudies.length];
  const next = caseStudies[(idx + 1) % caseStudies.length];

  return (
    <section className="case" aria-labelledby="case-title">
      <div className="container">
        <div className="case-nav-top">
          <Link to="/terminal#work">← ~/work</Link>
          <span className="bracket">·</span>
          <span>reading {p.number}/05</span>
          <span className="bracket">·</span>
          <a href={p.github} target="_blank" rel="noopener noreferrer">
            git clone ../{p.slug}
          </a>
        </div>

        <h1 className="case-title" id="case-title">
          {(p.name.replace(/\s/g, "_") + ".md").toUpperCase()}
        </h1>

        <div className="case-meta">
          <span>
            <b>PROJECT:</b> {p.tagline}
          </span>
          <span>
            <b>STATUS:</b> {p.live ? "deployed" : "source-only"}
          </span>
          <span>
            <b>ROLE:</b> sole builder
          </span>
        </div>

        <p className="case-lead">{p.description}</p>

        <div className="prog-tech">
          {p.tech.map((t) => (
            <span className="chip" key={t}>
              {t}
            </span>
          ))}
        </div>

        <div className="case-actions">
          {p.live && (
            <a className="btn btn-solid" href={p.live} target="_blank" rel="noopener noreferrer">
              open live demo
            </a>
          )}
          <a className="btn" href={p.github} target="_blank" rel="noopener noreferrer">
            view source on github
          </a>
        </div>

        <div className="term man-body" style={{ marginTop: 34 }}>
          <div className="term-bar" aria-hidden="true">
            <span className="term-dot r" />
            <span className="term-dot a" />
            <span className="term-dot g" />
            <span className="term-title">
              vim&nbsp;<b>~/work/{p.slug}/README.md</b> — normal
            </span>
          </div>
          <div className="term-body man-line">
            <div className="cmdline">
              <span className="dollar">$</span> cat ~/work/{p.slug}/README.md
            </div>

            <div className="man-section">
              <h2 className="man-h">
                <span className="hash">##</span> the_problem
              </h2>
              <p className="man-p">{p.problem}</p>
            </div>

            <div className="man-section">
              <h2 className="man-h">
                <span className="hash">##</span> the_approach
              </h2>
              <p className="man-p">{p.approach}</p>
            </div>

            <div className="man-section">
              <h2 className="man-h">
                <span className="hash">##</span> architecture
              </h2>
              <p className="man-p man-dim">$ tree ./system — top-level flow</p>
              <div className="arch-list">
                {p.architecture.map((a, i) => (
                  <div className="arch-row" key={i}>
                    <b>{a.label}</b>
                    {a.note && <span className="note">{a.note}</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="man-section">
              <h2 className="man-h">
                <span className="hash">##</span> engineering_decisions
              </h2>
              <p className="man-p man-dim">$ git log --oneline --reverse | head -4</p>
              {p.decisions.map((d, i) => (
                <div className="decision" key={i}>
                  <div className="dec-idx">
                    commit {String(i + 1).padStart(7, "0")} — file: {d.title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}
                  </div>
                  <h3>
                    <span className="dec-no">{i + 1}</span>
                    {d.title}
                  </h3>
                  <p>{d.text}</p>
                </div>
              ))}
            </div>

            <div className="man-section">
              <h2 className="man-h">
                <span className="hash">##</span> outcome
              </h2>
              <div className="outcome-box">
                <p className="man-p">{p.outcome}</p>
              </div>
            </div>

            <div className="man-section">
              <h2 className="man-h">
                <span className="hash">##</span> what_i_learned
              </h2>
              <ul className="learn-list">
                {p.learned.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <hr className="sep" />
            <div className="cmdline">
              <span className="dollar">$</span> echo "EOF — read 100% of ~/work/{p.slug}"
              <br />
              EOF — read 100% of ~/work/{p.slug}
            </div>
          </div>
        </div>

        <nav className="case-prevnext" aria-label="Adjacent case studies">
          <Link to={`/terminal/work/${prev.slug}`}>
            <span className="dir">← ../</span>
            <span>
              ./<span className="ext">{prev.name.toLowerCase().replace(/\s+/g, "-")}</span>
            </span>
          </Link>
          <Link to={`/terminal/work/${next.slug}`} className="next-a">
            <span className="dir">../ →</span>
            <span>
              ./<span className="ext">{next.name.toLowerCase().replace(/\s+/g, "-")}</span>
            </span>
          </Link>
        </nav>
      </div>
    </section>
  );
}
import { useEffect } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { caseStudies } from "../data/work";

/** Old terminal slugs → current ones (kept so shared links keep working). */
const LEGACY: Record<string, string> = { "code-reviewer": "ai-code-reviewer" };

const shortHash = (s: string) => {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(16).slice(0, 7).padStart(7, "0");
};

export function WorkDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const idx = caseStudies.findIndex((p) => p.slug === slug);
  const total = caseStudies.length;
  const prev = caseStudies[(idx - 1 + total) % total];
  const next = caseStudies[(idx + 1) % total];

  // [ and ] move between case studies
  useEffect(() => {
    if (idx === -1) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (e.key === "[") navigate(`/terminal/work/${prev.slug}`, { viewTransition: true });
      else if (e.key === "]") navigate(`/terminal/work/${next.slug}`, { viewTransition: true });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, prev, next, navigate]);

  if (idx === -1) {
    const to = slug && LEGACY[slug];
    return <Navigate to={to ? `/terminal/work/${to}` : "/terminal#work"} replace />;
  }
  const p = caseStudies[idx];

  return (
    <section className="case" aria-labelledby="case-title">
      <div className="container">
        <div className="case-nav-top">
          <Link to="/terminal#work">$ cd ..</Link>
          <span className="bracket">·</span>
          <span>reading {p.number}/{String(total).padStart(2, "0")}</span>
          <span className="bracket">·</span>
          <a href={p.github} target="_blank" rel="noopener noreferrer">
            git clone ../{p.slug}
          </a>
          <span className="bracket case-keys" aria-hidden="true">[ / ] prev · next</span>
        </div>

        <h1 className="case-title" id="case-title">
          {(p.name.replace(/\s/g, "_") + ".md").toUpperCase()}
        </h1>

        <div className="case-meta">
          <span><b>PROJECT:</b> {p.tagline}</span>
          <span><b>STATUS:</b> {p.live ? "deployed" : "source-only"}</span>
          <span><b>ROLE:</b> sole builder</span>
          <span><b>STACK:</b> {p.tech.length} tools</span>
        </div>

        <p className="case-lead">{p.description}</p>

        <div className="prog-tech">
          {p.tech.map((t) => (
            <span className="chip" key={t}>{t}</span>
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

        {p.screenshots?.length ? (
          <div className="case-shots" aria-label="Screenshots">
            <p className="man-p man-dim">$ open ./screenshots/ — {p.screenshots.length} files</p>
            <div className="case-shots-grid">
              {p.screenshots.map((s, i) => (
                <figure className="case-shot" key={s.src} style={{ "--i": i } as React.CSSProperties}>
                  <img src={s.src} alt={`${p.name}: ${s.caption}`} loading="lazy" decoding="async" />
                  <figcaption>
                    <span className="bracket">{String(i + 1).padStart(2, "0")}</span> {s.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        ) : null}

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
              <h2 className="man-h"><span className="hash">##</span> the_problem</h2>
              <p className="man-p">{p.problem}</p>
            </div>

            <div className="man-section">
              <h2 className="man-h"><span className="hash">##</span> the_approach</h2>
              <p className="man-p">{p.approach}</p>
            </div>

            <div className="man-section">
              <h2 className="man-h"><span className="hash">##</span> architecture</h2>
              <p className="man-p man-dim">$ tree ./system — top-level flow</p>
              <div className="arch-tree" role="list">
                <div className="arch-root">./system</div>
                {p.architecture.map((a, i) => {
                  const last = i === p.architecture.length - 1;
                  return (
                    <div className="arch-row" role="listitem" key={i} style={{ "--i": i } as React.CSSProperties}>
                      <span className="arch-branch" aria-hidden="true">{last ? "└── " : "├── "}</span>
                      <b>{a.label}</b>
                      {a.note && (
                        <span className="note">
                          <span className="arch-branch" aria-hidden="true">{last ? "    " : "│   "}└ </span>
                          {a.note}
                        </span>
                      )}
                      {!last && <span className="arch-arrow" aria-hidden="true">↓</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="man-section">
              <h2 className="man-h"><span className="hash">##</span> engineering_decisions</h2>
              <p className="man-p man-dim">$ git log --oneline --reverse | head -{p.decisions.length}</p>
              {p.decisions.map((d, i) => (
                <div className="decision" key={i}>
                  <div className="dec-idx">
                    <span className="dec-hash">{shortHash(p.slug + d.title)}</span> {d.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")} <span className="bracket">(#{i + 1})</span>
                  </div>
                  <h3>
                    <span className="dec-no">+</span>
                    {d.title}
                  </h3>
                  <p className="dec-diff">
                    <span className="dec-plus" aria-hidden="true">+</span>
                    {d.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="man-section">
              <h2 className="man-h"><span className="hash">##</span> outcome</h2>
              <div className="outcome-box">
                <p className="man-p">{p.outcome}</p>
              </div>
            </div>

            <div className="man-section">
              <h2 className="man-h"><span className="hash">##</span> what_i_learned</h2>
              <p className="man-p man-dim">$ grep -n "lesson" ./NOTES.md</p>
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
            <span className="dir">← [ prev · {prev.number}</span>
            <span className="pn-name">./<span className="ext">{prev.slug}</span></span>
            <span className="pn-tag">{prev.tagline}</span>
          </Link>
          <Link to={`/terminal/work/${next.slug}`} className="next-a">
            <span className="dir">next · {next.number} ] →</span>
            <span className="pn-name">./<span className="ext">{next.slug}</span></span>
            <span className="pn-tag">{next.tagline}</span>
          </Link>
        </nav>
      </div>
    </section>
  );
}

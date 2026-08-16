import { useEffect } from "react";
import { Link } from "react-router-dom";
import { site } from "../classic/data/site";

const terminalLines = [
  { p: "$ vardhan build --ai", cls: "l-prompt" },
  { p: "✓ shipped", cls: "l-ok" },
];

export function Landing() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="landing-root">
      <main className="landing-main">
        <header className="landing-head">
          <p className="landing-eyebrow">sree vardhan v — generative-ai · full-stack</p>
          <h1 className="landing-title">
            One portfolio.
            <br />
            <span className="landing-grad">Four interfaces.</span>
          </h1>
          <p className="landing-what">I build AI-powered products and full-stack systems.</p>
          <p className="landing-sub">
            Computer Science undergraduate focused on Generative AI, full-stack
            development, and developer tooling. One body of work, four ways to
            experience it — pick a lane, switch anytime.
          </p>

          <div className="landing-ctas">
            <a className="l-cta l-cta-primary" href="#editions">
              View selected work <span aria-hidden="true">→</span>
            </a>
            <a className="l-cta" href={site.github} target="_blank" rel="noopener noreferrer">
              GitHub <span aria-hidden="true">↗</span>
            </a>
            <a className="l-cta" href={site.resume} target="_blank" rel="noopener noreferrer">
              Resume <span aria-hidden="true">↗</span>
            </a>
          </div>

          <div className="landing-pipeline" aria-hidden="true">
            <span>frontend</span>
            <i>→</i>
            <span>api</span>
            <i>→</i>
            <span>database</span>
            <i>→</i>
            <span>llm</span>
            <i>→</i>
            <span>product</span>
          </div>
        </header>

        <div className="edition-bar">
          <span className="edition-bar-label">four interfaces</span>
          <span className="edition-bar-hint">
            keyboard: tab + enter · press <kbd>1</kbd>–<kbd>4</kbd> · switch from any page
          </span>
        </div>

        <div className="edition-grid" id="editions" role="list" aria-label="Portfolio interfaces — choose an edition">
          <Link to="/terminal" className="edition-card ed-term" aria-label="Open the Terminal interface" role="listitem">
            <div className="mini-term" aria-hidden="true">
              <div className="mini-body">
                {terminalLines.map((l, i) => (
                  <div key={i} className={l.cls}>
                    {l.p}
                  </div>
                ))}
                <div className="l-cursor" />
              </div>
            </div>
            <div className="ed-meta">
              <span className="ed-num" aria-hidden="true">
                01
              </span>
              <h2>Terminal</h2>
              <p>
                A fully interactive shell — type commands, read man pages, browse
                the work like a file system.
              </p>
              <span className="ed-cta">
                Enter the shell <span aria-hidden="true">→</span>
              </span>
            </div>
          </Link>

          <Link to="/classic" className="edition-card ed-classic" aria-label="Open the Classic interface" role="listitem">
            <div className="mini-classic" aria-hidden="true">
              <div className="mc-name">
                VARDHAN<span className="mc-dot">.</span>V
              </div>
              <div className="mc-role">generative-ai :: full-stack</div>
            </div>
            <div className="ed-meta">
              <span className="ed-num" aria-hidden="true">
                02
              </span>
              <h2>Classic</h2>
              <p>
                The original — animated build terminal, project grid, GitHub
                stats, and the full journey.
              </p>
              <span className="ed-cta">
                Open the original <span aria-hidden="true">→</span>
              </span>
            </div>
          </Link>

          <Link to="/paper" className="edition-card ed-paper" aria-label="Open the Paper interface" role="listitem">
            <div className="mini-paper" aria-hidden="true">
              <div className="mp-name">
                Sree Vardhan
                <br />
                <span className="mp-it">Vardhan V.</span>
              </div>
              <div className="mp-rule" />
              <div className="mp-line" />
              <div className="mp-line short" />
            </div>
            <div className="ed-meta">
              <span className="ed-num" aria-hidden="true">
                03
              </span>
              <h2>Paper</h2>
              <p>
                Light editorial — serif headlines, magazine layout, quiet and
                readable. The same work, beautifully printed.
              </p>
              <span className="ed-cta">
                Open the paper <span aria-hidden="true">→</span>
              </span>
            </div>
          </Link>

          <Link to="/aurora" className="edition-card ed-aurora" aria-label="Open the Aurora interface" role="listitem">
            <div className="mini-aurora" aria-hidden="true">
              <span className="ma-blob pink" />
              <span className="ma-blob cyan" />
              <div className="ma-name">
                Sree Vardhan <span className="ma-it">V.</span>
              </div>
              <div className="ma-chip">glass · light · gradient</div>
            </div>
            <div className="ed-meta">
              <span className="ed-num" aria-hidden="true">
                04
              </span>
              <h2>Aurora</h2>
              <p>
                Glassmorphism — frosted panels floating over drifting pastel
                auroras. Premium, soft, luminous.
              </p>
              <span className="ed-cta">
                Step into the light <span aria-hidden="true">→</span>
              </span>
            </div>
          </Link>
        </div>

        <p className="landing-note">switch editions from any page</p>
      </main>

      <footer className="landing-foot">
        <span>© 2026 {site.name}</span>
        <span className="landing-links">
          <a href={site.github} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href={site.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          <a href={`mailto:${site.email}`}>Email</a>
        </span>
      </footer>
    </div>
  );
}
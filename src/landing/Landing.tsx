import { useEffect } from "react";
import { Link } from "react-router-dom";
import { site } from "../classic/data/site";

const terminalLines = [
  { p: "$ vardhan build --ai", cls: "l-prompt" },
  { p: "▶ Initializing AI...", cls: "l-dim" },
  { p: "▶ Connecting LLM...", cls: "l-dim" },
  { p: "▶ Building application...", cls: "l-dim" },
  { p: "✓ shipped", cls: "l-ok" },
];

export function Landing() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="landing-root">
      <div className="landing-bg" aria-hidden="true">
        <div className="landing-blob b1" />
        <div className="landing-blob b2" />
      </div>

      <main className="landing-main">
        <header className="landing-head">
          <span className="landing-eyebrow">
            <span className="landing-dot" aria-hidden="true" />
            sree vardhan v · portfolio <b className="landing-v">v3</b>
          </span>
          <h1 className="landing-title">
            One portfolio.
            <br />
            <span className="landing-grad">Pick your vibe.</span>
          </h1>
          <p className="landing-sub">
            {site.name} — {site.title}. Same work, same projects, two very
            different skins. Choose the one that feels like you — switch anytime
            from any page.
          </p>
          <nav className="landing-quick" aria-label="Quick links">
            <a href={site.github} target="_blank" rel="noopener noreferrer">
              <span className="q-ic" aria-hidden="true">
                GH
              </span>
              github.com/vardhan23v
            </a>
            <a href={site.linkedin} target="_blank" rel="noopener noreferrer">
              <span className="q-ic" aria-hidden="true">
                IN
              </span>
              vardhan-v23
            </a>
            <a href={site.resume} download>
              <span className="q-ic" aria-hidden="true">
                CV
              </span>
              résumé
            </a>
          </nav>
        </header>

        <div className="edition-grid">
          <Link to="/terminal" className="edition-card ed-term">
            <div className="ed-preview">
              <div className="mini-term">
                <div className="mini-bar" aria-hidden="true">
                  <span className="md r" />
                  <span className="md a" />
                  <span className="md g" />
                  <span className="mini-title">vardhan — build.sh</span>
                </div>
                <div className="mini-body" aria-hidden="true">
                  {terminalLines.map((l, i) => (
                    <div key={i} className={`l-line ${l.cls}`}>
                      {l.p}
                    </div>
                  ))}
                  <div className="l-cursor" />
                </div>
              </div>
            </div>
            <div className="ed-meta">
              <span className="ed-num" aria-hidden="true">
                01
              </span>
              <h2>
                Terminal <span className="ed-badge">hacker</span>
              </h2>
              <p>
                CRT scanlines, phosphor green, a fully interactive shell you can
                type commands into, and case studies rendered as man pages.
              </p>
              <span className="ed-cta">
                Enter the shell <span aria-hidden="true">→</span>
              </span>
            </div>
          </Link>

          <Link to="/classic" className="edition-card ed-classic">
            <div className="ed-preview">
              <div className="mini-classic">
                <div className="mc-glow" aria-hidden="true" />
                <span className="mc-orb o1" aria-hidden="true" />
                <span className="mc-orb o2" aria-hidden="true" />
                <span className="mc-orb o3" aria-hidden="true" />
                <div className="mc-name">
                  VARDHAN<span className="mc-dot">.</span>V
                </div>
                <div className="mc-role">GENERATIVE-AI DEV :: FULL-STACK DEV</div>
                <div className="mc-pills">
                  <span className="mc-pill">AI products</span>
                  <span className="mc-pill">web apps</span>
                  <span className="mc-pill">developer tools</span>
                </div>
              </div>
            </div>
            <div className="ed-meta">
              <span className="ed-num" aria-hidden="true">
                02
              </span>
              <h2>
                Classic <span className="ed-badge">original</span>
              </h2>
              <p>
                The original design — animated build terminal, neural-network
                hero, project grid, GitHub stats, and the full journey timeline.
              </p>
              <span className="ed-cta">
                Open the original <span aria-hidden="true">→</span>
              </span>
            </div>
          </Link>
        </div>

        <div className="landing-note">
          Same content, same projects, same person. No wrong answer — switch
          editions from any page.
        </div>
      </main>

      <footer className="landing-foot">
        <span>© 2026 {site.name} · Built with React + TypeScript</span>
        <span className="landing-links">
          <a href={site.github} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href={site.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </span>
      </footer>
    </div>
  );
}
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
  return (
    <div className="landing-root">
      <div className="landing-bg" aria-hidden="true">
        <div className="landing-blob b1" />
        <div className="landing-blob b2" />
      </div>

      <main className="landing-main">
        <div className="landing-head">
          <span className="landing-eyebrow">
            <span className="landing-dot" aria-hidden="true" />
            portfolio v2 · two editions
          </span>
          <h1 className="landing-title">
            One portfolio.
            <br />
            <span className="landing-grad">Pick your vibe.</span>
          </h1>
          <p className="landing-sub">
            {site.name} — {site.title}. The same work, the same
            projects, rendered in two very different skins. Choose the one that feels like you.
          </p>
        </div>

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
                <div className="mini-body">
                  {terminalLines.map((l, i) => (
                    <div key={i} className={l.cls}>
                      {l.p}
                    </div>
                  ))}
                  <div className="l-cursor" aria-hidden="true" />
                </div>
              </div>
            </div>
            <div className="ed-meta">
              <h2>
                Terminal <span className="ed-badge">hacker</span>
              </h2>
              <p>
                CRT scanlines, phosphor green, a fully interactive shell you can type commands
                into, and case studies rendered as man pages.
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
              <h2>
                Classic <span className="ed-badge">original</span>
              </h2>
              <p>
                The original design — animated build terminal, neural-network hero, project
                grid, GitHub stats, and the full journey timeline.
              </p>
              <span className="ed-cta">
                Open the original <span aria-hidden="true">→</span>
              </span>
            </div>
          </Link>
        </div>

        <div className="landing-note">
          Same content, same projects, same person. No wrong answer —
          you can switch editions from any page.
        </div>
      </main>

      <footer className="landing-foot">
<span>
            © 2026 {site.name} · Built with React + TypeScript
          </span>
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
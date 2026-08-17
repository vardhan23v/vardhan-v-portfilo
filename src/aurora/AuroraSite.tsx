import { useState } from "react";
import { InterfaceSwitcher } from "../interface-switcher/InterfaceSwitcher";
import { useTilt } from "../hooks/useTilt";
import { Link } from "react-router-dom";
import { featuredProjects, type Project } from "../classic/data/projects";
import { experience } from "../classic/data/experience";
import { skillCategories } from "../classic/data/skills";
import { site } from "../classic/data/site";
import "./styles/aurora.css";

export const auroraProjects = featuredProjects.filter((p) => p.slug !== "campus-compass");

export function AuroraDetails({ p }: { p: Project }) {
  const [open, setOpen] = useState(false);
  const ctrl = `au-eng-${p.slug}`;
  return (
    <div className="au-eng">
      <button
        type="button"
        className="au-eng-btn"
        aria-expanded={open}
        aria-controls={ctrl}
        onClick={() => setOpen(!open)}
      >
        <span>engineering details</span>
        <span className={`au-eng-arrow${open ? " open" : ""}`} aria-hidden="true">
          →
        </span>
      </button>
      <div className={`au-eng-wrap${open ? " open" : ""}`} id={ctrl}>
        <div className="au-eng-body">
          <div>
            <span className="au-eng-label">the problem</span>
            <p>{p.problem}</p>
          </div>
          <div>
            <span className="au-eng-label">what it does</span>
            <ul>
              {p.features.slice(0, 4).map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
          <div>
            <span className="au-eng-label">stack</span>
            <p>{p.tech.join(" · ")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeaturedProject({ p }: { p: Project }) {
  const ref = useTilt<HTMLDivElement>(4, ".au-ft");
  return (
    <div ref={ref} className="au-ft-tilt au-reveal">
      <article className="au-ft" style={{ "--pa1": p.accent[0] } as React.CSSProperties}>
        <div className="au-ft-copy">
          <span className="au-rank">Project 01</span>
          <h3 className="au-ft-name">{p.name}</h3>
          <p className="au-ft-tagline">{p.tagline}</p>
          <div className="au-card-tech">
            {p.tech.slice(0, 7).map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
          <div className="au-card-links">
            <a href={p.github} target="_blank" rel="noopener noreferrer">
              GitHub <span aria-hidden="true">↗</span>
            </a>
            {p.live && (
              <a href={p.live} target="_blank" rel="noopener noreferrer">
                Live Demo <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
          <AuroraDetails p={p} />
        </div>
        <div className="au-ft-visual" aria-hidden="true">
          <div className="au-ft-bloom" style={{ "--pa1": p.accent[0] } as React.CSSProperties} />
          <div className="au-ft-beam au-ft-beam-a" />
          <div className="au-ft-beam au-ft-beam-b" />
          <div className="au-ft-core">
            <span className="au-ft-glyph">{p.emoji}</span>
            <span className="au-ft-vname">{p.name}</span>
            <span className="au-ft-vcap">
              {p.slug} · v1.0 · prod
            </span>
          </div>
          <span className="au-ft-vtag">featured</span>
        </div>
      </article>
    </div>
  );
}

function AuroraCard({ p, n }: { p: Project; n: string }) {
  const ref = useTilt<HTMLDivElement>(5, ".au-card");
  return (
    <div ref={ref} className="au-tilt au-reveal">
      <article className="au-card" style={{ "--pa1": p.accent[0] } as React.CSSProperties}>
        <span className="au-rank">{n}</span>
        <h3 className="au-card-name">{p.name}</h3>
        <p className="au-card-tagline">{p.tagline}</p>
        <div className="au-card-tech">
          {p.tech.slice(0, 5).map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <div className="au-card-links">
          <a href={p.github} target="_blank" rel="noopener noreferrer">
            GitHub <span aria-hidden="true">↗</span>
          </a>
          {p.live && (
            <a href={p.live} target="_blank" rel="noopener noreferrer">
              Live Demo <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
      </article>
    </div>
  );
}

export function AuroraSite() {
  return (
    <div className="aurora-root">
      <div className="aurora-bg" aria-hidden="true">
        <div className="au-glow au-glow-purple" />
        <div className="au-glow au-glow-blue" />
        <div className="au-glow au-glow-cyan" />
      </div>

      <div className="aurora-inner">
        <nav className="aurora-nav" aria-label="Main">
          <Link to="/" className="aurora-wordmark">
            {site.name}
            <span className="dot">.</span>
          </Link>
          <div className="aurora-nav-links">
            <a href="#work">Work</a>
            <a href="#experience">Experience</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </div>
          <InterfaceSwitcher current="aurora" />
        </nav>

        <header className="aurora-hero">
          <div className="au-hero-copy">
            <p className="aurora-eyebrow">
              <span className="glow-dot" aria-hidden="true" />
              generative ai · full-stack · product engineering
            </p>
            <h1 className="aurora-title">
              Where code meets <span className="aurora-grad">light.</span>
            </h1>
            <p className="aurora-lede">I build AI-powered products and full-stack systems.</p>
            <p className="aurora-sub">
              Computer Science undergraduate focused on Generative AI, full-stack
              development, and developer tooling.
            </p>
            <div className="aurora-actions">
              <a className="aurora-btn aurora-btn-solid" href="#work">
                View selected work <span aria-hidden="true">→</span>
              </a>
              <a className="aurora-btn" href={site.github} target="_blank" rel="noopener noreferrer">
                GitHub <span aria-hidden="true">↗</span>
              </a>
              <a className="aurora-btn" href={site.resume} target="_blank" rel="noopener noreferrer">
                Resume <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
          <div className="au-hero-visual au-reveal" aria-hidden="true">
            <div className="au-sys-head">
              <span>build system</span>
              <span className="au-sys-live">
                <i className="au-sys-dot" /> system online
              </span>
            </div>
            <div className="au-sys-list">
              <span className="au-sys-rail" />
              {["React", "Node.js", "Database", "LLM", "Product"].map((s, i) => (
                <div className="au-sys-row" key={s}>
                  <span className={`au-sys-name${i === 4 ? " au-sys-name-last" : ""}`}>{s}</span>
                  {i === 4 ? (
                    <span className="au-sys-chip">deployed</span>
                  ) : (
                    <span className="au-sys-mark" />
                  )}
                </div>
              ))}
            </div>
            <div className="au-sys-foot">react → node → database → llm → product</div>
          </div>
        </header>

        <section className="aurora-section" id="work" aria-labelledby="aurora-work-title">
          <div className="aurora-head au-reveal">
            <div>
              <h2 id="aurora-work-title">Selected work</h2>
              <p className="aurora-subhead">
                A few things I&rsquo;ve built across AI, full-stack development, and
                developer tooling.
              </p>
            </div>
            <span className="tag">built &amp; shipped</span>
          </div>
          <FeaturedProject p={auroraProjects[0]} />
          <div className="aurora-grid">
            {auroraProjects.slice(1).map((p, i) => (
              <AuroraCard key={p.slug} p={p} n={String(i + 2).padStart(2, "0")} />
            ))}
          </div>
        </section>

        <section className="aurora-section" id="experience" aria-labelledby="aurora-exp-title">
          <div className="aurora-head au-reveal">
            <div>
              <h2 id="aurora-exp-title">Experience</h2>
              <p className="aurora-subhead">
                Where I&rsquo;ve been building — from AI testing to full-stack
                engineering.
              </p>
            </div>
            <span className="tag">the log</span>
          </div>
          <div className="au-exp-list au-reveal">
            {experience.map((e) => (
              <div className="au-exp-row" key={e.company}>
                <span className="au-exp-dot" style={{ background: e.accent }} aria-hidden="true" />
                <div className="au-exp-main">
                  <div className="au-exp-role">{e.role}</div>
                  <div className="au-exp-company">{e.company}</div>
                </div>
                <span className="au-exp-period">{e.period}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="aurora-section" id="about" aria-labelledby="aurora-about-title">
          <div className="au-about">
            <div className="au-about-head">
              <h2 id="aurora-about-title">About</h2>
              <span className="tag">whoami</span>
            </div>
            <div className="au-about-body">
              <div className="au-prose au-reveal">
                <p>
                  I&rsquo;m a Computer Science undergraduate focused on Generative AI,
                  full-stack development, and building useful software products.
                </p>
                <p>
                  I enjoy working across the stack — from React interfaces and Node.js
                  APIs to databases and LLM integrations. Most of my learning happens
                  through building and shipping real projects.
                </p>
              </div>
              <dl className="au-meta au-reveal">
                <div className="au-meta-row">
                  <dt>Location</dt>
                  <dd>Kurnool, India</dd>
                </div>
                <div className="au-meta-row">
                  <dt>Education</dt>
                  <dd>NMAM Institute of Technology</dd>
                </div>
                <div className="au-meta-row">
                  <dt>Focus</dt>
                  <dd>Generative AI · Full Stack · Developer Tools</dd>
                </div>
              </dl>
              <div className="au-skills au-reveal">
                {skillCategories.map((c) => (
                  <div className="au-skill-line" key={c.label}>
                    <span className="au-skill-label">{c.label}</span>
                    <span className="au-skill-items">{c.items.map((i) => i.name).join(" · ")}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="aurora-section" id="contact" aria-labelledby="aurora-contact-title">
          <div className="au-contact au-reveal">
            <h2 id="aurora-contact-title">
              Let&rsquo;s build something <span className="grad">beautiful.</span>
            </h2>
            <p>Open to internships, collaborations and interesting problems.</p>
            <div className="aurora-actions">
              <a className="aurora-btn aurora-btn-solid" href={`mailto:${site.email}`}>
                {site.email}
              </a>
            </div>
          </div>
        </section>

        <footer className="aurora-foot">
          <span>© 2026 {site.name}</span>
          <span className="aurora-foot-links">
            <Link to="/">editions</Link>
            <a href={site.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a href={`mailto:${site.email}`}>Email</a>
          </span>
        </footer>
      </div>
    </div>
  );
}
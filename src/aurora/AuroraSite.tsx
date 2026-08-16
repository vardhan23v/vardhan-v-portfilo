import { Link } from "react-router-dom";
import { featuredProjects } from "../classic/data/projects";
import { experience } from "../classic/data/experience";
import { skillCategories } from "../classic/data/skills";
import { site } from "../classic/data/site";
import "./styles/aurora.css";

export function AuroraSite() {
  return (
    <div className="aurora-root">
      <div className="aurora-bg" aria-hidden="true">
        <div className="au-blob pink" />
        <div className="au-blob violet" />
        <div className="au-blob cyan" />
        <div className="au-blob mint" />
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
          <Link to="/" className="aurora-editions">
            ↺ editions
          </Link>
        </nav>

        <header className="aurora-hero">
          <span className="aurora-eyebrow">
            <span className="glow-dot" aria-hidden="true" />
            portfolio — aurora edition
          </span>
          <h1 className="aurora-title">
            {site.name}.
            <br />
            <span className="aurora-grad">Where code meets light.</span>
          </h1>
          <p className="aurora-sub">
            {site.title}. I turn interfaces, APIs and LLM backends into working
            products — and ship them. Currently a computer science
            undergraduate building with AI + the full stack.
          </p>
          <div className="aurora-actions">
            <a className="aurora-btn aurora-btn-solid" href={site.resume} download>
              Download résumé ↓
            </a>
            <a className="aurora-btn" href={`mailto:${site.email}`}>
              Say hello
            </a>
          </div>
          <div className="aurora-hero-meta">
            <span className="au-chip">{site.location}</span>
            <a className="au-chip" href={site.github} target="_blank" rel="noopener noreferrer">
              github.com/vardhan23v
            </a>
            <a className="au-chip" href={site.linkedin} target="_blank" rel="noopener noreferrer">
              linkedin.com/in/vardhan-v23
            </a>
          </div>
        </header>

        <section className="aurora-section" id="work" aria-labelledby="aurora-work-title">
          <div className="aurora-head">
            <h2 id="aurora-work-title">Selected work</h2>
            <span className="tag">built &amp; shipped</span>
          </div>
          <div className="aurora-grid">
            {featuredProjects.map((p) => (
              <article className="au-card" key={p.slug}>
                <h3 className="au-card-name">{p.name}</h3>
                <p className="au-card-tagline">{p.tagline}</p>
                <div className="au-card-tech">
                  {p.tech.slice(0, 5).map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
                <div className="au-card-links">
                  <a href={p.github} target="_blank" rel="noopener noreferrer">
                    github ↗
                  </a>
                  {p.live && (
                    <a href={p.live} target="_blank" rel="noopener noreferrer">
                      live demo ↗
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          className="aurora-section"
          id="experience"
          aria-labelledby="aurora-exp-title"
        >
          <div className="aurora-head">
            <h2 id="aurora-exp-title">Experience</h2>
            <span className="tag">the log</span>
          </div>
          <div className="au-exp-list">
            {experience.map((e) => (
              <div className="au-exp-row" key={e.company}>
                <div>
                  <div className="au-exp-role">{e.role}</div>
                  <div className="au-exp-company">{e.company}</div>
                </div>
                <span className="au-exp-period">{e.period}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="aurora-section" id="about" aria-labelledby="aurora-about-title">
          <div className="aurora-head">
            <h2 id="aurora-about-title">About</h2>
            <span className="tag">whoami</span>
          </div>
          <div className="au-glass-panel">
            <div className="au-prose">
              <p>
                {site.name} — a Generative AI developer and full-stack engineer
                in the making. I enjoy taking an idea from interface to API,
                database, and AI integration, then turning it into a product
                people actually use.
              </p>
              <p>
                B.Tech — Computer Science &amp; Engineering, NMAM Institute of
                Technology, NITTE (2024–2028).
              </p>
            </div>
            <div className="au-skills">
              {skillCategories.map((c) => (
                <div className="au-skill-line" key={c.label}>
                  <span className="au-skill-label">{c.label}</span>
                  <span className="au-skill-items">
                    {c.items.map((i) => i.name).join(" · ")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="aurora-section" id="contact" aria-labelledby="aurora-contact-title">
          <div className="au-contact">
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
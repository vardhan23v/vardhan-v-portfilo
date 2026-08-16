import { Link } from "react-router-dom";
import { featuredProjects } from "../classic/data/projects";
import { experience } from "../classic/data/experience";
import { skillCategories } from "../classic/data/skills";
import { site } from "../classic/data/site";
import "./styles/paper.css";

export function PaperSite() {
  return (
    <div className="paper-root">
      <nav className="paper-nav" aria-label="Main">
        <Link to="/" className="paper-wordmark">
          {site.name}
          <span className="dot">.</span>
        </Link>
        <div className="paper-nav-links">
          <a href="#work">Work</a>
          <a href="#experience">Experience</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </div>
        <Link to="/" className="paper-nav-editions">
          ↺ editions
        </Link>
      </nav>

      <main className="paper-main" id="paper-main">
        <header className="paper-masthead">
          <p className="paper-overline">Portfolio — Paper edition</p>
          <h1 className="paper-mast-headline">
            Sree Vardhan
            <br />
            <span className="it">Vardhan V.</span>
          </h1>
          <p className="paper-mast-sub">
            {site.title}. I turn interfaces, APIs and LLM backends into working
            products — and ship them. Currently a computer science
            undergraduate building with AI + the full stack.
          </p>
          <div className="paper-mast-actions">
            <a className="paper-btn paper-btn-primary" href={site.resume} download>
              Download résumé ↓
            </a>
            <a className="paper-btn paper-btn-ghost" href={`mailto:${site.email}`}>
              Say hello
            </a>
          </div>
          <div className="paper-mast-meta">
            <span>{site.location}</span>
            <a href={site.github} target="_blank" rel="noopener noreferrer">
              github.com/vardhan23v
            </a>
            <a href={site.linkedin} target="_blank" rel="noopener noreferrer">
              linkedin.com/in/vardhan-v23
            </a>
          </div>
        </header>

        <section className="paper-section" id="work" aria-labelledby="paper-work-title">
          <p className="paper-overline" id="paper-work-title">
            Selected work
          </p>
          {featuredProjects.map((p, i) => (
            <article className="paper-work-item" key={p.slug}>
              <span className="paper-work-num" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h2 className="paper-work-name">{p.name}</h2>
                <p className="paper-work-tagline">{p.tagline}</p>
                <div className="paper-work-tech">
                  {p.tech.slice(0, 5).map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
                <div className="paper-work-links">
                  <a href={p.github} target="_blank" rel="noopener noreferrer">
                    github ↗
                  </a>
                  {p.live && (
                    <a href={p.live} target="_blank" rel="noopener noreferrer">
                      live demo ↗
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="paper-section" id="experience" aria-labelledby="paper-exp-title">
          <p className="paper-overline" id="paper-exp-title">
            Experience
          </p>
          {experience.map((e) => (
            <div className="paper-exp-item" key={e.company}>
              <div>
                <div className="paper-exp-role">{e.role}</div>
                <div className="paper-exp-company">
                  {e.company} — {e.period.split("—")[0].trim()}
                </div>
              </div>
              <span className="paper-exp-period">{e.period}</span>
            </div>
          ))}
        </section>

        <section className="paper-section" id="about" aria-labelledby="paper-about-title">
          <p className="paper-overline" id="paper-about-title">
            About
          </p>
          <div className="paper-prose">
            <p>
              {site.name} — a Generative AI developer and full-stack
              engineer in the making. I enjoy taking an idea from interface to
              API, database, and AI integration, then turning it into a product
              people actually use.
            </p>
            <p>
              Education: B.Tech — Computer Science &amp; Engineering, NMAM
              Institute of Technology, NITTE (2024–2028). Certifications
              include Forage engineering simulations at Electronic Arts and
              Commonwealth Bank, generative &amp; agentic AI with Python, and
              PostgreSQL.
            </p>
          </div>
          <div className="paper-skills">
            {skillCategories.map((c) => (
              <div className="paper-skill-line" key={c.label}>
                <span className="paper-skill-label">{c.label}</span>
                <span className="paper-skill-items">
                  {c.items.map((i) => i.name).join(", ")}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="paper-section" id="contact" aria-labelledby="paper-contact-title">
          <p className="paper-overline" id="paper-contact-title">
            Contact
          </p>
          <h2 className="paper-contact-head">
            Let&rsquo;s build something{" "}
            <span className="it">interesting.</span>
          </h2>
          <div className="paper-mast-actions">
            <a className="paper-btn paper-btn-primary" href={`mailto:${site.email}`}>
              {site.email}
            </a>
          </div>
          <p className="paper-mast-meta" style={{ marginTop: 20 }}>
            <a href={site.github} target="_blank" rel="noopener noreferrer">
              github
            </a>
            <a href={site.linkedin} target="_blank" rel="noopener noreferrer">
              linkedin
            </a>
          </p>
        </section>
      </main>

      <footer className="paper-foot">
        <span>© 2026 {site.name}</span>
        <span className="paper-foot-links">
          <Link to="/">editions</Link>
          <a href={site.github} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href={`mailto:${site.email}`}>Email</a>
        </span>
      </footer>
    </div>
  );
}
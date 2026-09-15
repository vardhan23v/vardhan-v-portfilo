import { useEffect, useState } from "react";
import { InterfaceSwitcher } from "../interface-switcher/InterfaceSwitcher";
import { Link } from "react-router-dom";
import { featuredProjects, type Project } from "../classic/data/projects";
import { experience } from "../classic/data/experience";
import { skillCategories } from "../classic/data/skills";
import { site } from "../classic/data/site";
import "./styles/paper.css";

export const paperProjects = featuredProjects;

export function EngineeringDetails({ p }: { p: Project }) {
  const [open, setOpen] = useState(false);
  const ctrl = `eng-${p.slug}`;
  return (
    <div className="paper-eng">
      <button
        type="button"
        className="paper-eng-btn"
        aria-expanded={open}
        aria-controls={ctrl}
        onClick={() => setOpen(!open)}
      >
        <span>engineering details</span>
        <span aria-hidden="true">{open ? "−" : "→"}</span>
      </button>
      <div className={`paper-eng-body${open ? " is-open" : ""}`} id={ctrl}>
          <div className="paper-eng-inner">
            <div>
              <span className="paper-eng-label">the problem</span>
              <p>{p.problem}</p>
            </div>
            <div>
              <span className="paper-eng-label">what it does</span>
              <ul>
                {p.features.slice(0, 4).map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
            <div>
              <span className="paper-eng-label">stack</span>
              <p>{p.tech.join(" · ")}</p>
            </div>
          </div>
        </div>
    </div>
  );
}

export function PaperSite() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll("[data-pp-reveal]");
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("pp-in");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.05 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const ids = ["work", "experience", "about", "contact"];
    const links = [...document.querySelectorAll<HTMLAnchorElement>(".paper-nav-links a")];
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const link = links.find((l) => l.getAttribute("href") === `#${entry.target.id}`);
          if (!link) return;
          links.forEach((l) => l.classList.remove("is-active"));
          link.classList.add("is-active");
        }
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, []);

  return (
    <div className="paper-root" data-cursor-accent="paper">
      <a className="paper-skip" href="#paper-main">
        Skip to content
      </a>
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
        <InterfaceSwitcher current="paper" />
      </nav>

      <main className="paper-main" id="paper-main">
        <header className="paper-masthead">
          <p className="paper-overline">Generative AI developer · full-stack engineer</p>
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
          <h2 className="paper-overline" id="paper-work-title" data-pp-reveal>
            Selected work
          </h2>
          {paperProjects.map((p, i) => (
            <article
              data-pp-reveal
              className={`paper-work-item ${i % 2 === 1 ? "paper-work-item--alt" : ""}`}
              key={p.slug}
              style={{ "--d": `${Math.min(i * 0.06, 0.3)}s` } as React.CSSProperties}
            >
              <span className={`paper-work-num ${i % 2 === 1 ? "paper-work-num--right" : ""}`} aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="paper-work-name">{p.name}</h3>
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
                <EngineeringDetails p={p} />
              </div>
            </article>
          ))}
        </section>

        <section className="paper-section" id="experience" aria-labelledby="paper-exp-title">
          <h2 className="paper-overline" id="paper-exp-title" data-pp-reveal>
            Experience
          </h2>
          {experience.map((e) => (
            <div className="paper-exp-item" data-pp-reveal key={e.company}>
              <div>
                <div className="paper-exp-role">{e.role}</div>
                <div className="paper-exp-company">{e.company}</div>
              </div>
              <span className="paper-exp-period">{e.period}</span>
            </div>
          ))}
        </section>

        <section className="paper-section" id="about" aria-labelledby="paper-about-title">
          <h2 className="paper-overline" id="paper-about-title" data-pp-reveal>
            About
          </h2>
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
              <div className="paper-skill-line" data-pp-reveal key={c.label}>
                <span className="paper-skill-label">{c.label}</span>
                <span className="paper-skill-items">
                  {c.items.map((i) => i.name).join(", ")}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="paper-section" id="contact" aria-labelledby="paper-contact-title">
          <h2 className="paper-overline" id="paper-contact-title" data-pp-reveal>
            Contact
          </h2>
          <h3 className="paper-contact-head" data-pp-reveal>
            Let&rsquo;s build something{" "}
            <span className="it">interesting.</span>
          </h3>
          <div className="paper-mast-actions" data-pp-reveal>
            <a className="paper-btn paper-btn-primary" href={`mailto:${site.email}`}>
              {site.email}
            </a>
          </div>
          <p className="paper-mast-meta paper-mast-meta-contact" data-pp-reveal>
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
          <a href="#paper-main">back to top ↑</a>
        </span>
      </footer>
    </div>
  );
}
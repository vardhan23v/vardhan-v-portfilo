import { useEffect, useRef, useState } from "react";
import { InterfaceSwitcher } from "../interface-switcher/InterfaceSwitcher";
import { Link } from "react-router-dom";
import { featuredProjects, type Project } from "../classic/data/projects";
import { experience } from "../classic/data/experience";
import { skillCategories } from "../classic/data/skills";
import { site } from "../classic/data/site";
import { caseStudyPath, hasCaseStudy } from "../work/links";
import { aboutProject, askAssistant } from "../lib/ai/ask";
import { prefetchEdition } from "../lib/editionLoaders";
import "./styles/paper.css";

export const paperProjects = featuredProjects;
const YEAR = new Date().getFullYear();

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
        <span className="paper-eng-arr" aria-hidden="true">→</span>
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

const SECTION_IDS = ["work", "experience", "about", "contact"] as const;
/** Section overline text, shared by each section's h2 and the running head. */
const SECTION_LABELS: Record<(typeof SECTION_IDS)[number], string> = {
  work: "Selected work",
  experience: "Experience",
  about: "About",
  contact: "Contact",
};

/** Start downloading a route's chunk when the pointer, focus or a touch heads for its link. */
const prefetchOn = (path: string) => {
  const go = () => prefetchEdition(path);
  return { onMouseEnter: go, onFocus: go, onTouchStart: go };
};

export function PaperSite() {
  const mastRef = useRef<HTMLElement>(null);
  const [runShown, setRunShown] = useState(false);
  const [active, setActive] = useState<(typeof SECTION_IDS)[number]>("work");

  // Running head: shown once the masthead has scrolled away.
  useEffect(() => {
    const mast = mastRef.current;
    if (!mast) return;
    const io = new IntersectionObserver(
      ([entry]) => setRunShown(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 }
    );
    io.observe(mast);
    return () => io.disconnect();
  }, []);

  // On touch screens (no hover), mark the work row being read: a thin band near the middle of the viewport.
  useEffect(() => {
    if (!window.matchMedia("(hover: none)").matches) return;
    const rows = [...document.querySelectorAll<HTMLElement>(".paper-work-item")];
    if (!rows.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target;
          if (entry.isIntersecting) {
            rows.forEach((r) => r !== el && r.classList.remove("is-current"));
            el.classList.add("is-current");
          } else {
            el.classList.remove("is-current");
          }
        }
      },
      { rootMargin: "-42% 0px -52% 0px", threshold: 0 }
    );
    rows.forEach((r) => io.observe(r));
    return () => {
      io.disconnect();
      rows.forEach((r) => r.classList.remove("is-current"));
    };
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
    const ids = SECTION_IDS;
    const links = [...document.querySelectorAll<HTMLAnchorElement>(".paper-nav-links a")];
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const link = links.find((l) => l.getAttribute("href") === `#${entry.target.id}`);
          if (!link) return;
          links.forEach((l) => l.classList.remove("is-active"));
          link.classList.add("is-active");
          setActive(entry.target.id as (typeof SECTION_IDS)[number]);
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
        <Link to="/" className="paper-wordmark" {...prefetchOn("/")}>
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

      <div className="paper-runhead" aria-hidden="true" data-shown={runShown}>
        <span className="paper-runhead-mark">
          {site.name}
          <span className="dot">.</span>
        </span>
        <span className="paper-runhead-label" key={active}>
          § {SECTION_LABELS[active]}
        </span>
      </div>

      <main className="paper-main" id="paper-main">
        <header className="paper-masthead" ref={mastRef}>
          <p className="paper-overline">
            <span>
              Generative AI developer · <span className="pp-nowrap">full-stack engineer</span>
            </span>
          </p>
          <h1 className="paper-mast-headline">
            <span className="pp-line">
              <span>Sree</span>
            </span>{" "}
            <span className="pp-line">
              <span className="it">Vardhan V.</span>
            </span>
          </h1>
          <p className="paper-mast-sub">
            {site.title}. I turn interfaces, APIs and LLM backends into working
            products — and ship them. Currently a computer science
            undergraduate building with AI + the full stack.
          </p>
          <div className="paper-mast-actions">
            <a className="paper-btn paper-btn-primary" href={site.resume} download="sree-vardhan-v-resume.pdf">
              Download résumé <span className="pp-arr pp-arr--down" aria-hidden="true">↓</span>
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
            {SECTION_LABELS.work}
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
                    github <span className="pp-arr pp-arr--out" aria-hidden="true">↗</span>
                  </a>
                  {p.live && (
                    <a href={p.live} target="_blank" rel="noopener noreferrer">
                      live demo <span className="pp-arr pp-arr--out" aria-hidden="true">↗</span>
                    </a>
                  )}
                  {hasCaseStudy(p.slug) && <Link to={caseStudyPath(p.slug)} state={{ from: "/paper" }} {...prefetchOn(caseStudyPath(p.slug))}>case study <span className="pp-arr pp-arr--fwd" aria-hidden="true">→</span></Link>}
                  <button type="button" data-ask-ai onClick={() => askAssistant(aboutProject(p.name))}>ask ai<span className="sr-only"> about {p.name}</span> <span aria-hidden="true" className="ask-spark">✦</span></button>
                </div>
                <EngineeringDetails p={p} />
              </div>
            </article>
          ))}
        </section>

        <section className="paper-section" id="experience" aria-labelledby="paper-exp-title">
          <h2 className="paper-overline" id="paper-exp-title" data-pp-reveal>
            {SECTION_LABELS.experience}
          </h2>
          {experience.map((e, i) => (
            <div className="paper-exp-item" data-pp-reveal key={e.company} style={{ "--d": `${Math.min(i * 0.07, 0.35)}s` } as React.CSSProperties}>
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
            {SECTION_LABELS.about}
          </h2>
          <div className="paper-prose">
            <p data-pp-reveal>
              {site.name} — a Generative AI developer and full-stack
              engineer in the making. I enjoy taking an idea from interface to
              API, database, and AI integration, then turning it into a product
              people actually use.
            </p>
            <p data-pp-reveal style={{ "--d": "0.08s" } as React.CSSProperties}>
              Education: B.Tech — Computer Science &amp; Engineering, NMAM
              Institute of Technology, NITTE (2024–2028). Certifications
              include FlyRank AI's Front-end AI Engineering internship,
              Anthropic's Claude 101, a Commonwealth Bank software engineering
              simulation, generative &amp; agentic AI with Python, and
              PostgreSQL.
            </p>
          </div>
          <div className="paper-skills">
            {skillCategories.map((c, i) => (
              <div className="paper-skill-line" data-pp-reveal key={c.label} style={{ "--d": `${Math.min(i * 0.05, 0.3)}s` } as React.CSSProperties}>
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
            {SECTION_LABELS.contact}
          </h2>
          <h3 className="paper-contact-head" data-pp-reveal>
            Let&rsquo;s build something{" "}
            <span className="it">
              interesting.
              <svg className="pp-stroke" viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                <path d="M2 8 C 40 3, 100 3, 152 6" pathLength="1" />
              </svg>
            </span>
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
        <span>© {YEAR} {site.name}</span>
        <span className="paper-foot-links">
          <Link to="/" {...prefetchOn("/")}>editions</Link>
          <a href={site.github} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href={`mailto:${site.email}`}>Email</a>
          <a href="#paper-main">back to top <span className="pp-arr pp-arr--up" aria-hidden="true">↑</span></a>
        </span>
      </footer>
    </div>
  );
}
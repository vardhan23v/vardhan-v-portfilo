import { useEffect } from "react";
import { Link } from "react-router-dom";
import { InterfaceSwitcher } from "../interface-switcher/InterfaceSwitcher";
import { featuredProjects, type Project } from "../classic/data/projects";
import { certifications, education, experience } from "../classic/data/experience";
import { skillCategories } from "../classic/data/skills";
import { site } from "../classic/data/site";
import "./styles/paper.css";

export const paperProjects = featuredProjects;

const CHAPTERS = [
  { id: "work", title: "Selected work" },
  { id: "experience", title: "Experience" },
  { id: "about", title: "About" },
  { id: "contact", title: "Contact" },
] as const;

/** "ATS-oriented optimization" stays as is; "Live preview" becomes "live preview". */
function runIn(s: string) {
  return s.length > 1 && s[1] === s[1].toLowerCase() ? s[0].toLowerCase() + s.slice(1) : s;
}

function sentence(items: string[]) {
  const parts = items.map(runIn);
  if (parts.length <= 1) return parts.join("");
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

function Entry({ p }: { p: Project }) {
  return (
    <article className="paper-entry paper-entry--work" id={`work-${p.slug}`}>
      <aside className="paper-margin">
        <p>{p.tech.slice(0, 5).join(", ")}</p>
        <p>
          <a href={p.github} target="_blank" rel="noopener noreferrer">
            Source on GitHub
          </a>
        </p>
        {p.live && (
          <p>
            <a href={p.live} target="_blank" rel="noopener noreferrer">
              Open live demo
            </a>
          </p>
        )}
      </aside>
      <div className="paper-text">
        <h3 className="paper-entry-title">{p.name}</h3>
        <p className="paper-lede">{p.tagline}</p>
        <p>{p.problem}</p>
        <p>Includes {sentence(p.features.slice(0, 4))}.</p>
        {p.cover && (
          <figure className="paper-figure">
            <img src={p.cover} alt={`${p.name} interface`} loading="lazy" width={1280} height={800} />
            <figcaption>{p.name}, operations view.</figcaption>
          </figure>
        )}
      </div>
    </article>
  );
}

export function PaperSite() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const links = [...document.querySelectorAll<HTMLAnchorElement>(".paper-head-nav a")];
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const href = `#${entry.target.id}`;
          links.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === href));
        }
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
    );
    for (const c of CHAPTERS) {
      const el = document.getElementById(c.id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, []);

  return (
    <div className="paper-root" data-cursor-accent="paper">
      <a className="paper-skip" href="#paper-main">
        Skip to content
      </a>

      <header className="paper-head">
        <div className="paper-head-inner">
          <Link to="/" className="paper-head-name">
            {site.name}
          </Link>
          <nav className="paper-head-nav" aria-label="Chapters">
            {CHAPTERS.map((c) => (
              <a key={c.id} href={`#${c.id}`}>
                {c.title}
              </a>
            ))}
          </nav>
          <InterfaceSwitcher current="paper" />
        </div>
      </header>

      <main className="paper-main" id="paper-main">
        <section className="paper-titlepage" aria-labelledby="paper-h1">
          <h1 className="paper-h1" id="paper-h1">
            Products built with AI, shipped end to end.
          </h1>
          <p className="paper-author">
            {site.name}
            <br />
            Generative AI and full-stack developer
          </p>
          <p className="paper-imprint">
            Paper edition, September 2026. {site.location}.
          </p>
          <ol className="paper-contents" aria-label="Contents">
            {CHAPTERS.map((c, i) => (
              <li key={c.id}>
                <a href={`#${c.id}`}>
                  <span>{c.title}</span>
                  <span className="paper-leader" aria-hidden="true" />
                  <span className="paper-contents-num">{i + 1}</span>
                </a>
              </li>
            ))}
          </ol>
          <div className="paper-actions">
            <a className="paper-btn paper-btn-primary" href={site.resume} download>
              Download résumé
            </a>
            <a className="paper-btn" href={`mailto:${site.email}`}>
              Write to me
            </a>
          </div>
        </section>

        <section className="paper-chapter" id="work" aria-labelledby="paper-work-title">
          <div className="paper-chapter-head">
            <span className="paper-chapter-num" aria-hidden="true">
              1
            </span>
            <h2 className="paper-h2" id="paper-work-title">
              Selected work
            </h2>
          </div>
          {paperProjects.map((p) => (
            <Entry p={p} key={p.slug} />
          ))}
        </section>

        <section className="paper-chapter" id="experience" aria-labelledby="paper-exp-title">
          <div className="paper-chapter-head">
            <span className="paper-chapter-num" aria-hidden="true">
              2
            </span>
            <h2 className="paper-h2" id="paper-exp-title">
              Experience
            </h2>
          </div>
          {experience.map((e) => (
            <article className="paper-entry" key={e.company}>
              <aside className="paper-margin">
                <p>{e.period}</p>
              </aside>
              <div className="paper-text">
                <h3 className="paper-entry-title paper-entry-title--sm">{e.role}</h3>
                <p className="paper-lede">{e.company}</p>
                <ul className="paper-list">
                  {e.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </section>

        <section className="paper-chapter" id="about" aria-labelledby="paper-about-title">
          <div className="paper-chapter-head">
            <span className="paper-chapter-num" aria-hidden="true">
              3
            </span>
            <h2 className="paper-h2" id="paper-about-title">
              About
            </h2>
          </div>
          <div className="paper-entry">
            <aside className="paper-margin">
              <p>{site.availability}</p>
            </aside>
            <div className="paper-text">
              <p className="paper-lede">
                {site.name} is a computer science undergraduate who builds with language models and ships with
                the full stack.
              </p>
              <p>
                The work above runs from the interface down to the API, the database and the model call, and
                each one is a product people can open, not a demo. Most of it pairs several model providers with a
                fallback chain so the product keeps working when one of them does not.
              </p>
            </div>
          </div>

          {education.slice(0, 2).map((ed) => (
            <div className="paper-entry" key={ed.school}>
              <aside className="paper-margin">
                <p>{ed.period}</p>
              </aside>
              <div className="paper-text">
                <h3 className="paper-entry-title paper-entry-title--sm">{ed.degree}</h3>
                <p className="paper-lede">{ed.school}</p>
                {ed.detail && <p>{ed.detail}</p>}
              </div>
            </div>
          ))}

          <div className="paper-entry">
            <aside className="paper-margin">
              <p>Certifications</p>
            </aside>
            <div className="paper-text">
              <ul className="paper-list">
                {certifications.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          </div>

          {skillCategories.map((c) => (
            <div className="paper-entry paper-entry--tight" key={c.label}>
              <aside className="paper-margin">
                <p>{c.label}</p>
              </aside>
              <div className="paper-text">
                <p>{c.items.map((i) => i.name).join(", ")}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="paper-chapter" id="contact" aria-labelledby="paper-contact-title">
          <div className="paper-chapter-head">
            <span className="paper-chapter-num" aria-hidden="true">
              4
            </span>
            <h2 className="paper-h2" id="paper-contact-title">
              Contact
            </h2>
          </div>
          <div className="paper-entry">
            <aside className="paper-margin">
              <p>
                <a href={site.github} target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
              </p>
              <p>
                <a href={site.linkedin} target="_blank" rel="noopener noreferrer">
                  LinkedIn
                </a>
              </p>
            </aside>
            <div className="paper-text">
              <p className="paper-lede">
                {site.availability}. The quickest way to reach me is email, and I answer within a day.
              </p>
              <p>
                <a className="paper-email" href={`mailto:${site.email}`}>
                  {site.email}
                </a>
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="paper-colophon">
        <div className="paper-entry">
          <aside className="paper-margin">
            <p>Colophon</p>
          </aside>
          <div className="paper-text">
            <p>
              This edition is set in Fraunces, printed to the web with React and Vite, and published from{" "}
              {site.location}. © 2026 {site.name}.
            </p>
            <p className="paper-colophon-links">
              <Link to="/">Other editions</Link>
              <a href={site.github} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
              <a href="#paper-main">Back to top</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { Link } from "react-router-dom";
import { caseStudies } from "../data/work";
import { site } from "../data/site";
import { Reveal } from "../hooks/useReveal";

const featured = caseStudies.find((p) => p.shot) ?? caseStudies[0];

const stats = [
  { num: "05", lbl: "products shipped" },
  { num: "04", lbl: "engineering roles" },
  { num: "12+", lbl: "public repos" },
  { num: "'28", lbl: "B.Tech CSE" },
];

export function Hero() {
  return (
    <section className="hero" aria-label="Introduction">
      <div className="container hero-grid">
        <Reveal>
          <span className="eyebrow">
            <span className="dot" aria-hidden="true" />
            {site.status}
          </span>
          <h1 className="hero-title">
            I build <span className="hero-grad">AI-powered products</span> and full-stack
            systems that actually ship.
          </h1>
          <p className="hero-sub">
            {site.fullName} — Computer Science undergraduate focused on Generative AI,
            developer tools, and end-to-end product engineering.
          </p>
          <div className="hero-cta">
            <a className="btn btn-primary" href="#work">
              View my work
            </a>
            <a className="btn btn-ghost" href={`mailto:${site.email}`}>
              Get in touch
            </a>
            <a className="btn btn-ghost" href={site.resume} download>
              Resume
            </a>
          </div>
          <div className="hero-stats">
            {stats.map((s) => (
              <div className="stat" key={s.lbl}>
                <div className="num">{s.num}</div>
                <div className="lbl">{s.lbl}</div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal className="" as="div">
          <div className="hero-visual">
            <span className="float-chip float-chip-1">
              <span className="ic" aria-hidden="true" />
              Gemini · Groq · Claude
            </span>
            <span className="float-chip float-chip-2">
              <span className="ic" aria-hidden="true" />
              React · Node · MongoDB
            </span>
            <span className="float-chip float-chip-3">
              <span className="ic" aria-hidden="true" />
              10-agent simulation
            </span>

            <div className="feature-card">
              <div className="feature-shot">
                <img
                  src={featured.shot}
                  alt={`Screenshot of ${featured.name}, my ${featured.tagline}`}
                  loading="eager"
                />
                <div className="feature-meta">
                  <span className="feature-name">{featured.name}</span>
                  <span className="badge-live">LIVE</span>
                </div>
              </div>
              <div className="feature-body">
                <span className="feature-tag">{featured.tagline}</span>
                <Link className="tlink-arrow" to={`/work/${featured.slug}`}>
                  Read the case study →
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
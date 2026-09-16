import { useEffect } from "react";
import { site } from "../data/site";
import { Icon } from "../lib/icons";
import "./Hero.css";
import { motionReduced } from "../../lib/motion";
import { stats } from "../data/stats";
import { featuredProjects } from "../data/projects";
import { monogram } from "../lib/monogram";
import { CountUp } from "./CountUp";

function useClassicHeroFX() {
  useEffect(() => {
    if (motionReduced()) return;
    const hero = document.querySelector<HTMLElement>(".classic-root .hero");
    const visual = document.querySelector<HTMLElement>(".classic-root .hero-visual");
    const neural = document.querySelector<HTMLElement>(".classic-root .hero-neural");
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY;
        if (hero) {
          const fade = Math.max(0, 1 - y / 700);
          const ty = y * 0.1;
          hero.style.opacity = String(fade);
          hero.style.transform = `translateY(${ty}px)`;
        }
        if (visual) {
          visual.style.transform = `translateY(${y * -0.05}px)`;
        }
        if (neural) {
          neural.style.transform = `translateY(${y * 0.06}px)`;
        }
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
}

const HERO_STATS: { value: number; label: string; suffix?: string }[] = [
  { value: stats.shipped, label: "products shipped" },
  { value: stats.repos, label: "public repositories" },
  { value: stats.roles, label: "internships and roles" },
];

const latest = featuredProjects[0];

export function Hero() {
  useClassicHeroFX();
  return (
    <section className="hero" id="top">
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="hero-availability">
            <span className="hero-availability-dot" aria-hidden="true" />
            Open to internships and AI product work
          </p>

          <h1 className="hero-name">
            Sree Vardhan V builds AI products end to end.
          </h1>

          <p className="hero-desc">
            Computer science undergraduate at NMAM Institute of Technology. I take an idea from
            interface to API, database and model integration, then deploy it and keep it running.
            The latest one turns a plain-English prompt into a working Chrome extension.
          </p>

          <div className="hero-actions">
            <a href="#projects" className="btn btn-primary">
              View projects
            </a>
            <a href={site.resume} className="btn btn-ghost" download>
              <Icon.download width={17} height={17} /> Download résumé
            </a>
          </div>

          <dl className="hero-stats" aria-label="At a glance">
            {HERO_STATS.map((s) => (
              <div className="hero-stat" key={s.label}>
                <dd>
                  <CountUp to={s.value} suffix={s.suffix} />
                </dd>
                <dt>{s.label}</dt>
              </div>
            ))}
          </dl>

          <div className="hero-links">
            <a href={site.github} target="_blank" rel="noopener noreferrer">
              <Icon.github width={17} height={17} /> GitHub
            </a>
            <a href={site.linkedin} target="_blank" rel="noopener noreferrer">
              <Icon.linkedin width={16} height={16} /> LinkedIn
            </a>
            <a href={`mailto:${site.email}`}>
              <Icon.mail width={17} height={17} /> Email
            </a>
            <span className="hero-location">
              <Icon.mapPin width={15} height={15} /> {site.location}
            </span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-neural" aria-hidden="true">
            <span className="hero-node n1" />
            <span className="hero-node n2" />
            <span className="hero-node n3" />
            <span className="hero-node n4" />
            <span className="hero-node n5" />
            <svg className="hero-lines" viewBox="0 0 400 400" fill="none">
              <path d="M90 70 L200 190" stroke="url(#lg1)" />
              <path d="M310 70 L200 190" stroke="url(#lg1)" />
              <path d="M90 70 L70 300" stroke="url(#lg2)" />
              <path d="M310 70 L330 300" stroke="url(#lg2)" />
              <path d="M200 190 L70 300" stroke="url(#lg3)" />
              <path d="M200 190 L330 300" stroke="url(#lg3)" />
              <path d="M70 300 L330 300" stroke="url(#lg1)" opacity="0.5" />
              <defs>
                <linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1">
                  <stop stopColor="#8f84ff" stopOpacity="0.5" />
                  <stop offset="1" stopColor="#8f84ff" stopOpacity="0.1" />
                </linearGradient>
                <linearGradient id="lg2" x1="1" y1="0" x2="0" y2="1">
                  <stop stopColor="#8f84ff" stopOpacity="0.35" />
                  <stop offset="1" stopColor="#8f84ff" stopOpacity="0.08" />
                </linearGradient>
                <linearGradient id="lg3" x1="0" y1="0" x2="1" y2="1">
                  <stop stopColor="#b3abff" stopOpacity="0.35" />
                  <stop offset="1" stopColor="#8f84ff" stopOpacity="0.1" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <article className="hero-latest" aria-labelledby="hero-latest-title">
            <header className="hero-latest-head">
              <span className="hero-latest-kicker">Latest shipped</span>
              <span className={`hero-latest-status ${latest.live ? "is-live" : ""}`}>
                <i aria-hidden="true" /> {latest.live ? "Live" : "Source"}
              </span>
            </header>
            <h2 id="hero-latest-title" className="hero-latest-title">
              <span className="hero-latest-emoji" aria-hidden="true">{monogram(latest.name)}</span>
              {latest.name}
            </h2>
            <p className="hero-latest-tagline">{latest.tagline}</p>
            <ul className="hero-latest-facts">
              {latest.features.slice(0, 3).map((f) => (
                <li key={f}>
                  <Icon.check width={14} height={14} />
                  {f}
                </li>
              ))}
            </ul>
            <div className="hero-latest-stack" aria-label="Stack">
              {latest.tech.slice(0, 5).map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
            <div className="hero-latest-actions">
              {latest.live && (
                <a href={latest.live} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                  <Icon.external width={15} height={15} /> Open live demo
                </a>
              )}
              <a href={latest.github} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                <Icon.github width={15} height={15} /> Source
              </a>
            </div>
          </article>
        </div>
      </div>


    </section>
  );
}
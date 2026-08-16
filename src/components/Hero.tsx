import { site } from "../data/site";
import { Console } from "./Console";
import "./Hero.css";

export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="hero-status">
            <span className="hero-status-dot" aria-hidden="true" />
            {site.status}
          </p>

          <h1 className="hero-headline">{site.headline}</h1>

          <p className="hero-sub">{site.subheadline}</p>

          <p className="hero-intro">{site.intro}</p>

          <div className="hero-actions">
            <a href="#work" className="btn btn-primary">
              View selected work
            </a>
            <a href={site.github} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              GitHub
            </a>
            <a href={site.resume} className="btn btn-ghost" download>
              Resume
            </a>
          </div>
        </div>

        <div className="hero-visual">
          <Console />
        </div>
      </div>
    </section>
  );
}
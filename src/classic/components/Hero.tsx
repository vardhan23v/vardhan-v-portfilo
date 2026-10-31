import { experience, education } from "../data/experience";
import { site } from "../data/site";
import { stats } from "../data/stats";
import { Constellation } from "./NightSky";

export function Hero() {
  const now = experience[0];
  const school = education[0];
  return (
    <section className="hero" id="top" aria-labelledby="hero-h1">
      <Constellation />
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <h1 className="hero-title" id="hero-h1">Sree Vardhan V</h1>
          <p className="hero-role">Generative AI and full-stack developer</p>
          <p className="hero-intro">
            I’m a computer-science student who builds AI products end to end, from the interface to the model behind it, and keeps them running. {stats.featured} are on GitHub; {stats.live} are live right now.
          </p>
          <div className="hero-actions">
            <a className="btn" href="#work">Explore projects</a>
            <a className="btn btn--secondary" href={site.resume} download="sree-vardhan-v-resume.pdf">View résumé <span className="btn-note">PDF</span></a>
            <a className="btn btn--secondary" href="#contact">Contact me</a>
          </div>
          <p className="hero-social">
            <a href={site.github} target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href={site.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </p>
        </div>
        <dl className="glance" aria-label="At a glance">
          <div className="glance-row"><dt>Studying</dt><dd>{school.degree.replace("B.Tech — ", "B.Tech, ")}, {school.school.replace(" (NITTE)", "")}, {school.period.replace(" — ", " to ")}</dd></div>
          <div className="glance-row"><dt>Available</dt><dd>{site.availability.replace("&", "and")}</dd></div>
          <div className="glance-row"><dt>Now</dt><dd>{now.role}, {now.company}</dd></div>
          <div className="glance-row"><dt>Shipped</dt><dd>{stats.featured} products, {stats.live} live on the web</dd></div>
          <div className="glance-row"><dt>Based in</dt><dd>{site.location.replace(", Andhra Pradesh", "")}</dd></div>
        </dl>
      </div>
    </section>
  );
}

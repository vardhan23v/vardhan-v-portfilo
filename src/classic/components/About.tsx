import { experience, education } from "../data/experience";
import { site } from "../data/site";
import { Reveal } from "../hooks/useReveal";

export function About() {
  const latest = experience[0];
  const school = education[0];
  return (
    <section className="about" id="about" aria-labelledby="about-h2">
      <div className="wrap about-grid">
        <Reveal as="div" className="about-copy">
          <h2 className="h2" id="about-h2">About</h2>
          <p className="about-p about-p--lead">
            I am a computer-science undergraduate at {school.school.replace(" (NITTE)", "")} who builds products from the interface to the model behind them, and keeps them running once they are live.
          </p>
          <p className="about-p">
            The latest one turns a plain-English prompt into a working Chrome extension. Since 2026 I have held {experience.length} roles, most recently at {latest.company}, writing TypeScript end to end, and I am {site.availability.toLowerCase().replace("&", "and")}.
          </p>
          <p className="about-p">
            Away from client work I build real-time systems and agent pipelines for hackathons, and I keep every project open on GitHub with its tests and deploy config.
          </p>
        </Reveal>
        <Reveal as="dl" className="facts" delay="reveal-d1">
          <div className="fact"><dt>Based in</dt><dd>{site.location}</dd></div>
          <div className="fact"><dt>Studying</dt><dd>{school.degree.replace(" — ", ", ")}, {school.period.replace(" — ", " to ")}</dd></div>
          <div className="fact"><dt>Now</dt><dd>{latest.role} at {latest.company}</dd></div>
          <div className="fact"><dt>Email</dt><dd><a href={`mailto:${site.email}`}>{site.email}</a></dd></div>
          <div className="fact"><dt>Elsewhere</dt><dd><a href={site.github} target="_blank" rel="noopener noreferrer">GitHub</a> · <a href={site.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a></dd></div>
          <div className="fact"><dt>Availability</dt><dd>{site.availability.replace("&", "and")}</dd></div>
        </Reveal>
      </div>
    </section>
  );
}

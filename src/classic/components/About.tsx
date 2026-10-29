import { featuredProjects } from "../data/projects";
import { experience } from "../data/experience";
import { site } from "../data/site";
import { Reveal } from "../hooks/useReveal";

export function About() {
  const flagship = featuredProjects.find((p) => p.highlight) ?? featuredProjects[0];
  const portrait = flagship.screenshots?.find((s) => s.includes("phone")) ?? flagship.cover;
  const latestRole = experience[0];
  return (
    <section className="about" id="about" aria-labelledby="about-h2">
      <h2 className="about-h2" id="about-h2">About</h2>
      <Reveal as="div" className="about-facts">
        <p>{site.location}</p>
        <p>B.Tech, computer science, 2024 to 2028</p>
        <p><a href={`mailto:${site.email}`}>{site.email}</a></p>
      </Reveal>
      <div className="about-body">
        <Reveal as="p" className="about-p about-p--lead">
          {portrait && <img className="about-portrait" src={portrait} alt={`${flagship.name}, his most recent product, on a phone`} width={440} height={440} loading="lazy" decoding="async" />}
          <strong>{site.name}</strong> is a computer-science undergraduate at NMAM Institute of Technology who builds products from the interface to the model behind them, and keeps them running.
        </Reveal>
        <Reveal as="p" className="about-p about-p--second" delay="reveal-d1">
          The latest one turns a plain-English prompt into a working Chrome extension. He has held {experience.length} roles since 2026, most recently at {latestRole.company}, writes TypeScript end to end, and is {site.availability.toLowerCase().replace("&", "and")}.
        </Reveal>
      </div>
    </section>
  );
}

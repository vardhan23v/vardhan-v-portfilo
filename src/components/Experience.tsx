import { experience } from "../data/experience";
import { SectionHead } from "./SectionHead";
import { Reveal } from "../hooks/useReveal";
import { Icon } from "../lib/icons";
import "./Experience.css";

export function Experience() {
  return (
    <section id="experience">
      <div className="container">
        <SectionHead
          eyebrow="Experience"
          title={<>Where I've been <span className="grad-text">building</span></>}
          sub="Internships and product communities where I shipped real work and learned how products actually get made."
        />

        <div className="timeline">
          {experience.map((e, i) => (
            <Reveal key={e.company} as="div" className="timeline-item" delay={i % 2 ? "reveal-d1" : undefined}>
              <div className="timeline-dot" style={{ "--td": e.accent } as React.CSSProperties} aria-hidden="true" />
              <article className="timeline-card card">
                <div className="timeline-head">
                  <div>
                    <span className="timeline-role">{e.role}</span>
                    <h3>{e.company}</h3>
                  </div>
                  <span className="timeline-period">
                    <Icon.clock width={13} height={13} /> {e.period}
                  </span>
                </div>
                <ul>
                  {e.points.map((p) => (
                    <li key={p}>
                      <Icon.check width={14} height={14} />
                      {p}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
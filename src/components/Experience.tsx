import { experience } from "../data/experience";
import { Reveal } from "../hooks/useReveal";
import "./Experience.css";

export function Experience() {
  return (
    <section id="experience">
      <div className="container">
        <Reveal>
          <header className="section-head">
            <span className="section-index">02 — Experience</span>
            <h2 className="section-title">Internships and product communities.</h2>
          </header>
        </Reveal>

        <div className="exp-list">
          {experience.map((e) => (
            <Reveal as="article" key={e.company} className="exp-row">
              <div className="exp-main">
                <div className="exp-role">
                  <span className="exp-company">{e.company}</span>
                  <span className="exp-role-name"> — {e.role}</span>
                </div>
                <ul className="exp-points">
                  {e.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
              <div className="exp-period">{e.period}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
import { education, certifications } from "../data/experience";
import { SectionHead } from "./SectionHead";
import { Reveal } from "../hooks/useReveal";
import { Icon } from "../lib/icons";
import "./Education.css";

export function Education() {
  return (
    <section id="education" aria-label="Education and certifications">
      <div className="container">
        <div className="edu-grid">
          <div>
            <SectionHead
              eyebrow="Education"
              title={<>The <span className="grad-text">foundation</span></>}
            />
            <div className="edu-timeline">
              {education.map((e, i) => (
                <Reveal key={e.school} as="div" className="edu-item" delay={i % 2 ? "reveal-d1" : undefined}>
                  <span className="edu-dot" aria-hidden="true" />
                  <article className="edu-card card">
                    <div className="edu-head">
                      <h3>{e.school}</h3>
                      <span className="edu-period">{e.period}</span>
                    </div>
                    <p className="edu-degree">{e.degree}</p>
                    {e.detail && <p className="edu-detail">{e.detail}</p>}
                  </article>
                </Reveal>
              ))}
            </div>
          </div>

          <div>
            <SectionHead
              eyebrow="Certifications"
              title={<>Proof of <span className="grad-text">learning</span></>}
            />
            <div className="cert-grid">
              {certifications.map((c, i) => (
                <Reveal key={c} as="div" className="cert-card" delay={i % 2 ? "reveal-d1" : undefined}>
                  <span className="cert-icon" aria-hidden="true">
                    <Icon.cert width={18} height={18} />
                  </span>
                  <span>{c}</span>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
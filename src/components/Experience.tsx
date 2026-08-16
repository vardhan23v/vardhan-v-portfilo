import { certifications, education, experience } from "../data/experience";
import { Reveal } from "../hooks/useReveal";

export function Experience() {
  return (
    <section className="section" id="experience" aria-labelledby="exp-title">
      <div className="container">
        <Reveal>
          <div className="sec-head" style={{ marginBottom: 44 }}>
            <span className="eyebrow">experience</span>
            <h2 className="sec-title" id="exp-title">
              Where I've been working
            </h2>
            <p className="sec-sub">
              Factual, current, and growing. No inflated titles — the work is the evidence.
            </p>
          </div>
        </Reveal>

        <Reveal>
          <div className="exp-list">
            {experience.map((e) => (
              <div className="exp-item" key={e.company}>
                <div className="exp-card">
                  <div className="exp-period">{e.period}</div>
                  <div className="exp-role">{e.role}</div>
                  <div className="exp-company">
                    {e.company} <span style={{ color: "var(--text-3)" }}>—</span>{" "}
                    <span className="badge-src" style={{ fontSize: 11 }}>
                      ACTIVE
                    </span>
                  </div>
                  <ul className="exp-points">
                    {e.points.map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <div className="edu-panel">
            <div className="edu-card">
              <h3>Education</h3>
              <div className="big">{education.degree}</div>
              <div className="dim">
                {education.school} · {education.period}
              </div>
            </div>
            <div className="edu-card">
              <h3>Certifications</h3>
              <ul className="cert-list">
                {certifications.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
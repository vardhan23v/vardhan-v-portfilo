import { experience, education, certifications } from "../../data/experience";

export function ExperiencePage() {
  return (
    <div className="mac-page">
      <div className="page-header">
        <div className="page-header__eyebrow">Experience</div>
        <h1 className="page-header__title">Experience & Education</h1>
      </div>

      <div style={{ marginBottom: "var(--sp-8)" }}>
        <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600, marginBottom: "var(--sp-4)" }}>
          Work Experience
        </h2>
        <div className="experience-list">
          {experience.map((exp) => (
            <div className="experience-item" key={exp.company} style={{ borderLeftColor: exp.accent }}>
              <div className="experience-item__role">{exp.role}</div>
              <div className="experience-item__company">{exp.company}</div>
              <div className="experience-item__period">{exp.period}</div>
              <ul className="experience-item__points">
                {exp.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: "var(--sp-8)" }}>
        <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600, marginBottom: "var(--sp-4)" }}>
          Education
        </h2>
        <div className="education-list">
          {education.map((edu) => (
            <div className="education-item" key={edu.school}>
              <div className="education-item__school">{edu.school}</div>
              <div className="education-item__degree">{edu.degree}</div>
              <div className="education-item__period">{edu.period}</div>
              {edu.detail && (
                <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", marginTop: "var(--sp-1)" }}>
                  {edu.detail}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600, marginBottom: "var(--sp-4)" }}>
          Certifications
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)" }}>
          {certifications.map((cert) => (
            <div key={cert} style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", padding: "var(--sp-2) 0", borderBottom: "0.5px solid var(--border)" }}>
              {cert}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

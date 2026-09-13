import { Award, GraduationCap, BookOpen } from "lucide-react";
import { education, certifications } from "../../data/experience";

export function AchievementsPage() {
  return (
    <div className="mac-page">
      <div className="page-header">
        <div className="page-header__eyebrow">Achievements</div>
        <h1 className="page-header__title">Education & Certifications</h1>
      </div>

      <div style={{ marginBottom: "var(--sp-8)" }}>
        <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600, marginBottom: "var(--sp-4)", display: "flex", alignItems: "center", gap: "var(--sp-2)" }}>
          <GraduationCap style={{ width: 18, height: 18, color: "var(--accent)" }} />
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
        <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600, marginBottom: "var(--sp-4)", display: "flex", alignItems: "center", gap: "var(--sp-2)" }}>
          <Award style={{ width: 18, height: 18, color: "var(--accent)" }} />
          Certifications
        </h2>
        <div className="achievements-grid">
          {certifications.map((cert) => (
            <div className="achievement-card" key={cert}>
              <div className="achievement-card__title" style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)" }}>
                <BookOpen style={{ width: 14, height: 14, color: "var(--accent)" }} />
                {cert.split("—")[0].trim()}
              </div>
              {cert.includes("—") && (
                <div className="achievement-card__text">{cert.split("—")[1]?.trim()}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

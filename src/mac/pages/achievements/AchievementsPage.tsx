import { Award, GraduationCap, BookOpen } from "lucide-react";
import { education, certifications } from "../../data/experience";
import { CountUp } from "../../components/ui/CountUp";
import { Reveal } from "../../components/ui/Reveal";

export function AchievementsPage() {
  return (
    <div className="mac-page">
      <div className="page-header">
        <div className="page-header__eyebrow">Achievements</div>
        <h1 className="page-header__title">Education & Certifications</h1>
        <p className="page-header__subtitle">
          The credentials behind the work — {education.length} schools, {certifications.length} certifications.
        </p>
      </div>

      <div className="mac-stats" style={{ marginBottom: "var(--sp-8)" }}>
        <Reveal index={0}>
          <div className="mac-stat">
            <div className="mac-stat__value">
              <CountUp value={education.length} />
            </div>
            <div className="mac-stat__label">Schools</div>
          </div>
        </Reveal>
        <Reveal index={1}>
          <div className="mac-stat">
            <div className="mac-stat__value">
              <CountUp value={certifications.length} />
            </div>
            <div className="mac-stat__label">Certifications</div>
          </div>
        </Reveal>
      </div>

      <div style={{ marginBottom: "var(--sp-8)" }}>
        <Reveal>
          <h2 className="mac-section-title">
            <GraduationCap /> Education
          </h2>
        </Reveal>
        <div className="education-list">
          {education.map((edu, i) => (
            <Reveal key={edu.school} index={Math.min(i, 2)}>
              <div className="education-item">
                <div className="education-item__school">{edu.school}</div>
                <div className="education-item__degree">{edu.degree}</div>
                <div className="education-item__period">{edu.period}</div>
                {edu.detail && (
                  <p
                    style={{
                      fontSize: "var(--text-xs)",
                      color: "var(--text-secondary)",
                      marginTop: "var(--sp-1)",
                    }}
                  >
                    {edu.detail}
                  </p>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <div>
        <Reveal>
          <h2 className="mac-section-title">
            <Award /> Certifications
          </h2>
        </Reveal>
        <div className="achievements-grid">
          {certifications.map((cert, i) => (
            <Reveal key={cert} index={Math.min(i, 5)}>
              <div className="achievement-card">
                <div
                  className="achievement-card__title"
                  style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)" }}
                >
                  <BookOpen style={{ width: 14, height: 14, color: "var(--accent)", flexShrink: 0 }} />
                  {cert.split("—")[0].trim()}
                </div>
                {cert.includes("—") && (
                  <div className="achievement-card__text">{cert.split("—")[1]?.trim()}</div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}

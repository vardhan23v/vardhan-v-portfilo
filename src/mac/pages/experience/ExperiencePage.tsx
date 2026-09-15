import { useState } from "react";
import { Briefcase, ChevronDown, GraduationCap } from "lucide-react";
import { useNav } from "../../hooks/useNav";
import { experience, education } from "../../data/experience";
import { Reveal } from "../../components/ui/Reveal";

export function ExperiencePage() {
  const { navigate } = useNav();
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <div className="mac-page">
      <div className="page-header">
        <div className="page-header__eyebrow">Experience</div>
        <h1 className="page-header__title">A ledger of roles.</h1>
        <p className="page-header__subtitle">
          {experience.length} roles · 2026 — present. Select a row to see what I actually did.
        </p>
      </div>

      <div style={{ marginBottom: "var(--sp-8)" }}>
        <h2 className="mac-section-title">
          <Briefcase /> Work
        </h2>
        <div className="experience-list">
          {experience.map((exp, i) => {
            const open = expanded === i;
            return (
              <Reveal key={exp.company} index={Math.min(i, 3)}>
                <div className="experience-item" style={{ "--exp-accent": exp.accent } as React.CSSProperties}>
                  <div className="experience-item__period">{exp.period}</div>
                  <button
                    onClick={() => setExpanded(open ? null : i)}
                    aria-expanded={open}
                    style={{ display: "block", width: "100%", textAlign: "left" }}
                  >
                    <div className="experience-item__role">{exp.role}</div>
                    <div className="experience-item__company">{exp.company}</div>
                    <span className="experience-item__toggle">
                      {open ? "Hide details" : `Show ${exp.points.length} highlights`}
                      <ChevronDown
                        style={{
                          width: 13,
                          height: 13,
                          transform: open ? "rotate(180deg)" : "none",
                          transition: "transform 150ms",
                        }}
                      />
                    </span>
                  </button>
                  {open && (
                    <ul className="experience-item__points">
                      {exp.points.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>

      <div>
        <Reveal>
          <div className="mac-preview-head">
            <h2 className="mac-section-title" style={{ marginBottom: 0 }}>
              <GraduationCap /> Education
            </h2>
            <button className="mac-link" onClick={() => navigate("achievements")}>
              Certifications →
            </button>
          </div>
        </Reveal>
        <div className="education-list">
          {education.map((edu, i) => (
            <Reveal key={edu.school} index={Math.min(i, 2)}>
              <div className="education-item">
                <div className="education-item__period">{edu.period}</div>
                <div className="education-item__school">{edu.school}</div>
                <div className="education-item__degree">{edu.degree}</div>
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
    </div>
  );
}

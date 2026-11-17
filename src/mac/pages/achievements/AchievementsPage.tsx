import { ArrowUpRight, Award, GitPullRequest, GraduationCap } from "lucide-react";
import { education, certifications } from "../../data/experience";
import { contributions, ossStats, statusLabel, OSS_AS_OF } from "../../../classic/data/opensource";
import { CountUp } from "../../components/ui/CountUp";
import { Reveal } from "../../components/ui/Reveal";

export function AchievementsPage() {
  return (
    <div className="mac-page">
      <div className="page-header">
        <div className="page-header__eyebrow">Achievements</div>
        <h1 className="page-header__title">Credentials, numbered.</h1>
        <p className="page-header__subtitle">
          The credentials behind the work — {education.length} schools, {certifications.length} certifications,{" "}
          {ossStats.prs} open-source pull requests.
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
        <Reveal index={2}>
          <div className="mac-stat">
            <div className="mac-stat__value">
              <CountUp value={ossStats.prs} />
            </div>
            <div className="mac-stat__label">Upstream PRs</div>
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

      <div style={{ marginBottom: "var(--sp-8)" }}>
        <Reveal>
          <h2 className="mac-section-title">
            <Award /> Certifications
          </h2>
        </Reveal>
        <div className="achievements-grid">
          {certifications.map((cert, i) => (
            <Reveal key={cert} index={Math.min(i, 5)}>
              <div className="achievement-card">
                <span className="achievement-card__n">{String(i + 1).padStart(2, "0")}</span>
                <div className="achievement-card__title">{cert.split("—")[0].trim()}</div>
                {cert.includes("—") && (
                  <div className="achievement-card__text">{cert.split("—")[1]?.trim()}</div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <div>
        <Reveal>
          <h2 className="mac-section-title">
            <GitPullRequest /> Open source
          </h2>
        </Reveal>
        <Reveal>
          <p className="oss-lede">
            Pull requests to other people&rsquo;s projects — {ossStats.merged} merged, {ossStats.open} in review. Status as
            GitHub reported it on {OSS_AS_OF}.
          </p>
        </Reveal>
        <div className="achievements-grid oss-grid">
          {contributions.map((c, i) => (
            <Reveal key={c.repo} index={Math.min(i, 5)}>
              <article className="achievement-card oss-card" aria-labelledby={`oss-${i}`}>
                <span className="achievement-card__n">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="achievement-card__title" id={`oss-${i}`}>
                  <a className="oss-card__repo" href={c.url} target="_blank" rel="noopener noreferrer">
                    {c.project}
                    <ArrowUpRight aria-hidden="true" />
                  </a>
                </h3>
                <div className="achievement-card__text">
                  {c.repo} · ★ {c.stars}
                </div>
                <p className="oss-card__about">{c.about}</p>
                <ul className="oss-card__prs">
                  {c.prs.map((pr) => (
                    <li key={pr.number}>
                      <a className="oss-pr" href={pr.url} target="_blank" rel="noopener noreferrer">
                        <span className="oss-pr__num">#{pr.number}</span>
                        <span className="oss-pr__title">{pr.title}</span>
                        <span className={`oss-pr__status is-${pr.status}`}>{statusLabel(pr.status)}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}

import { certifications, education, experience } from "../data/experience";
import { Reveal } from "../hooks/useReveal";
import { TypeCmd } from "./TypeCmd";

export function Experience() {
  return (
    <section className="section" id="experience" aria-labelledby="exp-title">
      <div className="container">
        <div className="shell">
          <Reveal>
            <div className="shell-head">
              <TypeCmd cmd="tail -f ~/experience.log" />
              <h2 className="shell-title" id="exp-title">
                EXPERIENCE_LOG <span className="dim">// 2026</span>
              </h2>
            </div>
            <p className="shell-sub">factual, current, and still taking input. nothing inflated.</p>
          </Reveal>

          <Reveal>
            <div className="term">
              <div className="term-bar" aria-hidden="true">
                <span className="term-dot r" />
                <span className="term-dot a" />
                <span className="term-dot g" />
                <span className="term-title">
                  <b>vardhan@folio</b>:~/log$ cat experience.log
                </span>
              </div>
              <div className="term-body">
                <div className="exp-list">
                  {experience.map((e, i) => (
                    <div className="exp-item" key={e.company} style={{ "--i": i } as React.CSSProperties}>
                      <div className="exp-headln">
                        [{e.period}] <b>INFO</b> role_registered
                      </div>
                      <div className="exp-role">{e.role}</div>
                      <div className="exp-company">
                        @ {e.company} <span className="bracket">·</span> {e.period}
                      </div>
                      <ul className="exp-points">
                        {e.points.map((pt, i) => (
                          <li key={i}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="edu-box">
                  <h3>education &amp; certs</h3>
                  <div className="edu-meta">
                    <span className="school">
                      {education.degree} — {education.school}
                    </span>
                    <span className="dim">{education.period}</span>
                  </div>
                  <ul className="cert-list">
                    {certifications.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
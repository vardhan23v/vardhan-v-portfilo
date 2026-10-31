import { certifications, education, experience } from "../data/experience";
import { Reveal } from "../hooks/useReveal";

const period = (p: string) => p.replace(" — ", " to ").replace("Present", "now");

export function Experience() {
  return (
    <section className="xp" id="experience" aria-labelledby="xp-h2">
      <div className="wrap">
        <Reveal as="div" className="section-head">
          <h2 className="h2" id="xp-h2">Experience</h2>
          <p className="section-sub">{experience.length} roles since 2026, two of them ongoing. The site is the current record; the résumé is a summary.</p>
        </Reveal>
        <Reveal as="ol" className="xp-list">
          {experience.map((e, i) => (
            <li className="xp-row" key={e.company + e.role} style={{ "--i": i } as React.CSSProperties}>
              <p className="xp-period">{period(e.period)}</p>
              <div className="xp-main">
                <h3 className="xp-role">{e.role}</h3>
                <p className="xp-co">{e.company}</p>
                <ul className="xp-points">
                  {e.points.slice(0, 2).map((pt) => <li key={pt}>{pt}</li>)}
                </ul>
              </div>
            </li>
          ))}
        </Reveal>
        <div className="xp-aside">
          <Reveal as="div" className="xp-block">
            <h3 className="h3">Education</h3>
            <ul className="plain-list">
              {education.map((e) => (
                <li key={e.school}>
                  <strong>{e.degree.replace(" — ", ", ")}</strong>
                  <span>{e.school}, {e.period.replace(" — ", " to ")}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal as="div" className="xp-block" delay="reveal-d1">
            <h3 className="h3">Certificates</h3>
            <ul className="plain-list">
              {certifications.map((c) => {
                const [name, issuer] = c.split(" — ");
                return (
                  <li key={c}>
                    <strong>{name}</strong>
                    {issuer && <span>{issuer}</span>}
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

import { certifications, education, experience } from "../data/experience";
import { ROLE_DETAIL } from "../content";
import { site } from "../data/site";

const period = (p: string) => p.replace(" — ", " to ").replace("Present", "now");

export function Experience() {
  return (
    <section className="xp" id="experience" aria-labelledby="xp-h2">
      <div className="wrap">
        <div className="section-head">
          <h2 className="h2" id="xp-h2">Experience</h2>
          <p className="section-sub">
            {experience.length} roles since March 2026. <a href={site.resume} download="sree-vardhan-v-resume.pdf">Download the résumé (PDF)</a>
          </p>
        </div>
        <ol className="xp-list">
          {experience.map((e) => {
            const now = /present/i.test(e.period);
            return (
              <li className="xp-row" key={e.company + e.role}>
                <p className="xp-period">{period(e.period)}{now && <span className="xp-now">Current role</span>}</p>
                <div className="xp-main">
                  <h3 className="xp-role">{e.role}</h3>
                  <p className="xp-co">{e.company}</p>
                  <ul className="xp-points">
                    {(ROLE_DETAIL[e.company] ?? e.points.slice(0, 2)).map((pt) => <li key={pt}>{pt}</li>)}
                  </ul>
                </div>
              </li>
            );
          })}
        </ol>
        <div className="xp-aside">
          <div className="xp-block">
            <h3 className="h3">Education</h3>
            <ul className="plain-list">
              {education.map((e) => (
                <li key={e.school}>
                  <strong>{e.degree.replace(" — ", ", ")}</strong>
                  <span>{e.school}, {e.period.replace(" — ", " to ")}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="xp-block">
            <h3 className="h3">Certificates</h3>
            <ul className="plain-list">
              {certifications.filter((c) => c.includes(" — ")).map((c) => {
                const [name, issuer] = c.split(" — ");
                return (
                  <li key={c}>
                    <strong>{name}</strong>
                    <span>{issuer}</span>
                  </li>
                );
              })}
            </ul>
            {certifications.some((c) => !c.includes(" — ")) && (
              <p className="also">Also completed: {certifications.filter((c) => !c.includes(" — ")).join(", ")}.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

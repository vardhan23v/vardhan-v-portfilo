import { skillCategories } from "../data/skills";

export function Skills() {
  return (
    <section className="skills" id="skills" aria-labelledby="skills-h2">
      <div className="wrap">
        <div className="section-head">
          <h2 className="h2" id="skills-h2">Skills</h2>
          <p className="section-sub">Grouped the way the projects above use them.</p>
        </div>
        <dl className="skills-list">
          {skillCategories.map((c) => (
            <div className="skill-row" key={c.label}>
              <dt>{c.label}</dt>
              <dd>{c.items.map((s) => s.name).join(", ")}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

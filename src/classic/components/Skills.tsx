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
              <dd>
                <span className="sr-only">{c.items.map((s) => s.name).join(", ")}</span>
                <span aria-hidden="true">
                  {c.items.map((s, w) => (
                    <span className="sk-word" key={s.name} style={{ "--w": w } as React.CSSProperties}>{s.name}{w < c.items.length - 1 ? ", " : ""}</span>
                  ))}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

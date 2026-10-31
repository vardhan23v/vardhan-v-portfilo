import { exploring, skillCategories } from "../data/skills";
import { Reveal } from "../hooks/useReveal";

export function Skills() {
  return (
    <section className="skills" id="skills" aria-labelledby="skills-h2">
      <div className="wrap">
        <Reveal as="div" className="section-head">
          <h2 className="h2" id="skills-h2">Stack</h2>
          <p className="section-sub">What I work with day to day, grouped the way the projects use it. No percentages: the work above is the measure.</p>
        </Reveal>
        <Reveal as="div" className="skills-grid">
          {skillCategories.map((c, i) => (
            <div className="skill-card" key={c.label} style={{ "--i": i } as React.CSSProperties}>
              <h3 className="h3">{c.label}</h3>
              <ul className="card-tech">
                {c.items.map((s) => <li className="chip" key={s.name}>{s.name}</li>)}
              </ul>
            </div>
          ))}
        </Reveal>
        <Reveal as="p" className="skills-explore">
          <strong>Exploring now:</strong> {exploring.map((e) => e.name).join(", ")}.
        </Reveal>
      </div>
    </section>
  );
}

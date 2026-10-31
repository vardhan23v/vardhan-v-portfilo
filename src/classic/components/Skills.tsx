import { exploring, skillCategories } from "../data/skills";
import { useRef } from "react";
import { Reveal } from "../hooks/useReveal";
import { useLines } from "../motion/useLines";

export function Skills() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useLines(titleRef);
  return (
    <section className="skills" id="skills" aria-labelledby="skills-h2">
      <div className="wrap">
        <Reveal as="div" className="section-head">
          <h2 className="h2" id="skills-h2" ref={titleRef}>Stack</h2>
          <p className="section-sub">What I work with day to day, grouped the way the projects use it. No percentages: the work above is the measure.</p>
        </Reveal>
        <Reveal as="div" className="skills-grid">
          {skillCategories.map((c, i) => (
            <div className="skill-card" key={c.label} style={{ "--i": i } as React.CSSProperties}>
              <h3 className="h3">{c.label}</h3>
              <ul className="card-tech">
                {c.items.map((s, n) => <li className="chip" key={s.name} style={{ "--c": n } as React.CSSProperties}>{s.name}</li>)}
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

import { skillCategories, exploring } from "../data/skills";
import { SectionHead } from "./SectionHead";
import { Reveal } from "../hooks/useReveal";
import { Icon, type IconName } from "../lib/icons";
import "./Skills.css";
import { usedIn } from "../data/stats";

function CategoryGlyph({ icon }: { icon: string }) {
  const Glyph = Icon[icon as IconName];
  return <Glyph width={19} height={19} />;
}

export function Skills() {
  return (
    <section id="skills">
      <div className="container">
        <SectionHead
          eyebrow="Tech Stack"
          index="04"
          title="Tools I ship with"
          sub="Grouped by where they sit in a product. The count next to a tool is how many of the projects above use it."
        />

        <div className="skills-grid">
          {skillCategories.map((cat, i) => (
            <Reveal key={cat.label} as="div" className="skill-cat" delay={i % 3 === 0 ? "reveal-d0" : undefined}>
              <div className="skill-cat-header">
                <span className="skill-cat-icon" aria-hidden="true">
                  <CategoryGlyph icon={cat.icon} />
                </span>
                <h3>{cat.label}</h3>
              </div>
              <div className="skill-chips">
                {cat.items.map((item, j) => {
                  const n = usedIn(item.name);
                  return (
                    <span
                      key={item.name}
                      className="skill-chip"
                      style={{ "--cd": `${j * 34}ms` } as React.CSSProperties}
                      title={n ? `used in ${n} project${n === 1 ? "" : "s"}` : undefined}
                    >
                      {item.name}
                      {n > 0 && <span className="skill-chip-count" aria-label={`used in ${n} projects`}>×{n}</span>}
                    </span>
                  );
                })}
              </div>
            </Reveal>
          ))}

          <Reveal className="skill-cat skill-exploring">
            <div className="skill-cat-header">
              <span className="skill-cat-icon" aria-hidden="true">
                <Icon.book width={19} height={19} />
              </span>
              <h3>Currently exploring</h3>
            </div>
            <ul className="exploring-list">
              {exploring.map((e) => (
                <li key={e.name}>
                  <span className="exploring-dot" aria-hidden="true" />
                  <div>
                    <strong>{e.name}</strong>
                    <span>{e.note}</span>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
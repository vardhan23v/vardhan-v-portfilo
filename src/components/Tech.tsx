import { techGroups } from "../data/tech";
import { Reveal } from "../hooks/useReveal";

const groupColors = ["#818cf8", "#22d3ee", "#34d399", "#fbbf24", "#f472b6", "#a78bfa"];

export function Tech() {
  return (
    <section className="section" id="tech" aria-labelledby="tech-title">
      <div className="container">
        <Reveal>
          <div className="sec-head" style={{ marginBottom: 40 }}>
            <span className="eyebrow">toolbox</span>
            <h2 className="sec-title" id="tech-title">
              Technologies I work with
            </h2>
            <p className="sec-sub">Grouped by where they sit in the stack — no percentage bars, just tools.</p>
          </div>
        </Reveal>

        <div className="tech-grid">
          {techGroups.map((g, gi) => (
            <Reveal key={g.label}>
              <div className="tech-card">
                <h3>
                  <span className="tc" style={{ background: groupColors[gi % groupColors.length], color: groupColors[gi % groupColors.length] }} aria-hidden="true" />
                  {g.label}
                </h3>
                <div className="tech-chips">
                  {g.items.map((it) => (
                    <span className="chip" key={it}>
                      {it}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
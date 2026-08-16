import { techGroups } from "../data/tech";
import { Reveal } from "../hooks/useReveal";
import "./Tech.css";

export function Tech() {
  return (
    <section id="tech">
      <div className="container">
        <Reveal>
          <header className="section-head">
            <span className="section-index">04 — Capabilities</span>
            <h2 className="section-title">Technologies I work with.</h2>
            <p className="section-sub">
              The tools I reach for when building — stated plainly, without scores or bars.
            </p>
          </header>
        </Reveal>

        <dl className="tech-spec">
          {techGroups.map((g) => (
            <div className="tech-group" key={g.label}>
              <dt>{g.label}</dt>
              <dd>
                <span className="tech-items">{g.items.join("  ·  ")}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
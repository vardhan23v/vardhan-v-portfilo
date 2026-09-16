import { techGroups } from "../data/tech";
import { Reveal } from "../hooks/useReveal";
import { TypeCmd } from "./TypeCmd";

const total = techGroups.reduce((n, g) => n + g.items.length, 0);

export function Tech() {
  return (
    <section className="section" id="tech" aria-labelledby="tech-title">
      <div className="container">
        <div className="shell">
          <Reveal>
            <div className="shell-head">
              <TypeCmd cmd="tree ~/skills -L 2" />
              <h2 className="shell-title" id="tech-title">
                SKILLS.TREE <span className="dim">// tools i actually use</span>
              </h2>
            </div>
          </Reveal>

          <Reveal>
            <div className="tree" role="list" aria-label="Technology stack tree">
              <span className="tree-root" style={{ "--i": 0 } as React.CSSProperties}>~/skills</span>
              <div className="tree-grid">
                {techGroups.map((g, gi) => (
                  <div className="tree-dirblock" role="listitem" key={g.label} data-spot style={{ "--i": gi + 1 } as React.CSSProperties}>
                    <div className="tree-dirline">
                      <span className="tree-branch">{gi === techGroups.length - 1 ? "└── " : "├── "}</span>
                      <span className="tree-dir">{g.label.toLowerCase().replace(/\s*[&/]\s*/g, "-")}/</span>
                      <span className="tree-count">{g.items.length}</span>
                    </div>
                    <ul className="tree-files">
                      {g.items.map((it, ii) => (
                        <li key={it} style={{ "--j": ii } as React.CSSProperties}>
                          <span className="tree-branch">{ii === g.items.length - 1 ? "└── " : "├── "}</span>
                          <span className="tree-file">{it}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="tree-summary">
                {techGroups.length} directories, {total} files
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

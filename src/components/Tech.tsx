import { techGroups } from "../data/tech";
import { Reveal } from "../hooks/useReveal";

export function Tech() {
  return (
    <section className="section" id="tech" aria-labelledby="tech-title">
      <div className="container">
        <div className="shell">
          <Reveal>
            <div className="shell-head">
              <span className="cmdline">
                <span className="dollar">$</span> tree ~/skills
              </span>
              <h2 className="shell-title" id="tech-title">
                SKILLS.TREE <span className="dim">// tools i actually use</span>
              </h2>
            </div>
          </Reveal>

          <Reveal>
            <div className="tree" role="list" aria-label="Technology stack tree">
              <span className="tree-root">~/skills</span>
              {techGroups.map((g, gi) => (
                <div key={g.label} role="listitem">
                  <span className="tree-branch">
                    {gi === techGroups.length - 1 ? "└── " : "├── "}
                  </span>
                  <span className="tree-dir">{g.label.toLowerCase()}/</span>
                  <span className="tree-file">
                    {g.items.map((it, ii) => (
                      <span key={it}>
                        {ii > 0 && <span className="tree-branch"> · </span>}
                        {it}
                      </span>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
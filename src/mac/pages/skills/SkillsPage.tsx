import { Code, Layout, Server, Database, Sparkles, Wrench } from "lucide-react";
import { skillCategories, exploring } from "../../data/skills";

const ICONS: Record<string, typeof Code> = {
  code: Code,
  layout: Layout,
  server: Server,
  database: Database,
  sparkles: Sparkles,
  tools: Wrench,
};

export function SkillsPage() {
  return (
    <div className="mac-page">
      <div className="page-header">
        <div className="page-header__eyebrow">Skills</div>
        <h1 className="page-header__title">Tech Stack</h1>
        <p className="page-header__subtitle">
          {skillCategories.reduce((a, c) => a + c.items.length, 0)}+ technologies across{" "}
          {skillCategories.length} categories — honest context, no percentage bars.
        </p>
      </div>

      <div className="skills-grid">
        {skillCategories.map((cat) => {
          const Icon = ICONS[cat.icon] ?? Code;
          return (
            <div className="skill-category" key={cat.label}>
              <div className="skill-category__label">
                <Icon style={{ width: 16, height: 16, color: "var(--accent)" }} />
                {cat.label}
              </div>
              <div className="skill-category__items">
                {cat.items.map((item) => (
                  <span className="mac-tag" key={item.name}>{item.name}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {exploring.length > 0 && (
        <div style={{ marginTop: "var(--sp-8)" }}>
          <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600, marginBottom: "var(--sp-4)" }}>
            Currently Exploring
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
            {exploring.map((item) => (
              <div key={item.name} style={{ padding: "var(--sp-3) var(--sp-4)", background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-md)" }}>
                <div style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>{item.name}</div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", marginTop: 2 }}>{item.note}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

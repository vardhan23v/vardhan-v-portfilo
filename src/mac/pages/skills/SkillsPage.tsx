import { useMemo, useState } from "react";
import { Code, Layout, Server, Database, Sparkles, Wrench, Search, FlaskConical } from "lucide-react";
import { skillCategories, exploring } from "../../data/skills";
import { featuredProjects } from "../../data/projects";
import { projectsUsing } from "../../lib/projects";
import { useNav } from "../../hooks/useNav";
import { Reveal } from "../../components/ui/Reveal";

const ICONS: Record<string, typeof Code> = {
  code: Code,
  layout: Layout,
  server: Server,
  database: Database,
  sparkles: Sparkles,
  tools: Wrench,
};

const total = skillCategories.reduce((a, c) => a + c.items.length, 0);

export function SkillsPage() {
  const { navigate, setOpenProject } = useNav();
  const [query, setQuery] = useState("");
  const [activeSkill, setActiveSkill] = useState<string | null>(null);

  const visibleCats = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return skillCategories;
    return skillCategories
      .map((c) => ({ ...c, items: c.items.filter((i) => i.name.toLowerCase().includes(q)) }))
      .filter((c) => c.items.length > 0);
  }, [query]);

  const matched = activeSkill ? projectsUsing(featuredProjects, activeSkill) : [];

  const toggleSkill = (name: string) => setActiveSkill((s) => (s === name ? null : name));

  return (
    <div className="mac-page">
      <div className="page-header">
        <div className="page-header__eyebrow">Skills</div>
        <h1 className="page-header__title">Tech Stack</h1>
        <p className="page-header__subtitle">
          {total}+ technologies across {skillCategories.length} categories — honest context, no percentage bars.
          Select any skill to see where I&apos;ve shipped it.
        </p>
      </div>

      <div className="mac-toolrow">
        <label className="mac-search">
          <Search />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter skills… (try React, MCP, Prisma)"
            aria-label="Filter skills"
          />
        </label>
      </div>

      {visibleCats.length === 0 ? (
        <div className="mac-empty">
          <span className="mac-empty__emoji">🧰</span>
          <div className="mac-empty__title">No skills match “{query}”</div>
          <div className="mac-empty__sub">Try a shorter term.</div>
          <button className="mac-btn mac-btn--primary" onClick={() => setQuery("")}>
            Clear search
          </button>
        </div>
      ) : (
        <div className="skills-grid">
          {visibleCats.map((cat, ci) => {
            const Icon = ICONS[cat.icon] ?? Code;
            return (
              <Reveal key={cat.label} index={Math.min(ci, 3)}>
                <div className="skill-category">
                  <div className="skill-category__label">
                    <Icon style={{ width: 16, height: 16, color: "var(--accent)" }} />
                    {cat.label}
                    <span className="mac-sidebar__badge" style={{ marginLeft: "auto" }}>
                      {cat.items.length}
                    </span>
                  </div>
                  <div className="skill-category__items">
                    {cat.items.map((item) => (
                      <button
                        key={item.name}
                        className={`mac-tag mac-tag--clickable${activeSkill === item.name ? " mac-tag--active" : ""}`}
                        onClick={() => toggleSkill(item.name)}
                        title={`See projects using ${item.name}`}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      )}

      {activeSkill && (
        <div className="mac-section">
          <div className="mac-preview-head">
            <h2 className="mac-section-title" style={{ marginBottom: 0 }}>
              Shipped with {activeSkill}
            </h2>
            <button className="mac-link" onClick={() => setActiveSkill(null)}>
              Clear
            </button>
          </div>
          {matched.length === 0 ? (
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
              No featured project lists {activeSkill} directly — but it powers the workflow behind them.
            </p>
          ) : (
            <div className="project-grid">
              {matched.map((p) => (
                <button
                  key={p.slug}
                  className="project-card"
                  onClick={() => {
                    navigate("projects");
                    setTimeout(() => setOpenProject(p), 60);
                  }}
                >
                  <div className="project-card__header">
                    <span className="project-card__emoji">{p.emoji}</span>
                    <div>
                      <div className="project-card__name">{p.name}</div>
                      <div className="project-card__tagline">{p.tagline}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {exploring.length > 0 && (
        <div className="mac-section">
          <Reveal>
            <h2 className="mac-section-title">
              <FlaskConical /> Currently exploring
            </h2>
          </Reveal>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
            {exploring.map((item, i) => (
              <Reveal key={item.name} index={Math.min(i, 3)}>
                <div
                  style={{
                    padding: "var(--sp-3) var(--sp-4)",
                    background: "var(--surface)",
                    border: "0.5px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  <div style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>{item.name}</div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", marginTop: 2 }}>
                    {item.note}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

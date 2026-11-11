import { stats } from "../data/stats";
import { featuredProjects } from "../data/projects";
import { Count } from "./Count";

/** Four numbers taken straight from the data files (projects, live sites, roles, tools). */
export function Stats() {
  const items = [
    { n: stats.featured, label: "products built", sub: "all open source" },
    { n: stats.live, label: "live on the web", sub: "deployed and running" },
    { n: stats.roles, label: "roles since 2026", sub: "internship and beta testing" },
    { n: featuredProjects.filter((p) => p.category === "ai").length, label: "AI products", sub: "agents, LLM apps, dev tools" },
  ];
  return (
    <section className="stats" aria-label="In numbers">
      <div className="wrap">
        <dl className="stats-grid">
          {items.map((s) => (
            <div className="stat" key={s.label}>
              <dt className="stat-label">{s.label}</dt>
              <dd className="stat-n"><Count n={s.n} /></dd>
              <dd className="stat-sub">{s.sub}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

import { stats } from "../data/stats";
import { Count } from "./Count";

/** Four numbers taken straight from the data files (projects, live sites, roles, tools). */
export function Stats() {
  const items = [
    { n: stats.featured, label: "products built", sub: "all open source" },
    { n: stats.live, label: "live on the web", sub: "deployed and running" },
    { n: stats.roles, label: "roles since 2026", sub: "internships and testing" },
    { n: stats.tools, label: "tools in my stack", sub: "AI to production" },
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

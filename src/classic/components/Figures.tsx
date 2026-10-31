import { stats } from "../data/stats";
import { useGithub } from "../../hooks/useGithub";
import { Reveal } from "../hooks/useReveal";
import { RollingFigure } from "../motion/RollingFigure";

export function Figures() {
  const gh = useGithub();
  const rows: { n: number; caption: string }[] = [
    { n: stats.featured, caption: "products built end to end" },
    { n: stats.live, caption: "of them running on the web" },
    { n: gh.repos, caption: "public repositories on GitHub" },
    { n: stats.roles, caption: "roles and internships since 2026" },
  ];
  return (
    <section className="figures" aria-labelledby="figures-h2">
      <h2 className="sr-only" id="figures-h2">By the numbers</h2>
      <Reveal as="div" className="wrap figures-grid">
        {rows.map((r, i) => (
          <p className="figures-row" key={r.caption} style={{ "--i": i } as React.CSSProperties}>
            <RollingFigure className="figures-n" value={r.n} />
            <span className="figures-caption">{r.caption}</span>
          </p>
        ))}
      </Reveal>
    </section>
  );
}

import { stats } from "../data/stats";
import { useGithub } from "../../hooks/useGithub";
import { Reveal } from "../hooks/useReveal";

export function Figures() {
  const gh = useGithub();
  const rows: { n: number; caption: string }[] = [
    { n: stats.featured, caption: "products built end to end" },
    { n: stats.live, caption: "of them running on the web" },
    { n: gh.repos, caption: "public repositories on GitHub" },
    { n: stats.roles, caption: "roles and internships since 2026" },
    { n: stats.tools, caption: "tools in the working stack" },
  ];
  return (
    <section className="figures" id="figures" aria-labelledby="figures-h2">
      <Reveal as="h2" className="figures-h2" id="figures-h2">
        <span className="figures-h2-soft">Counted,</span>
        <span>not claimed.</span>
      </Reveal>
      <Reveal as="div" className="figures-rows" delay="reveal-d1">
        {rows.map((r) => (
          <p className="figures-row" key={r.caption}>
            <span className="figures-caption">{r.caption}</span>
            <span className="figures-n">{r.n}</span>
          </p>
        ))}
      </Reveal>
    </section>
  );
}

import { CATEGORY_LABEL, featuredProjects, type Project } from "../data/projects";
import { Reveal } from "../hooks/useReveal";

/** Every frame the project has, in the order the sheet shows them. */
export function framesOf(p: Project): string[] {
  const list = p.screenshots && p.screenshots.length ? p.screenshots : p.cover ? [p.cover] : [];
  return [...new Set(list)];
}

function Strip({ p }: { p: Project }) {
  const frames = framesOf(p);
  if (frames.length === 0) {
    return (
      <div className="work-strip work-strip--empty">
        <div className="work-frame work-frame--text" role="img" aria-label={`${p.name}: ${p.tagline}`}>
          <div>
            <p className="wf-name">{p.name}</p>
            <p className="wf-tag">{p.tagline}</p>
          </div>
          <ul className="wf-list">
            {p.features.slice(0, 6).map((f) => <li key={f}>{f}</li>)}
          </ul>
        </div>
      </div>
    );
  }
  return (
    <div className="work-strip" role="group" aria-label={`${p.name} screens, scroll sideways`}>
      {frames.map((src, i) => (
        <figure className="work-frame" key={src}>
          <img src={src} alt={`${p.name}, screen ${i + 1} of ${frames.length}`} width={1046} height={600} loading="lazy" decoding="async" />
        </figure>
      ))}
    </div>
  );
}

export function Work() {
  return (
    <section className="work" id="work" aria-labelledby="work-h2">
      <Reveal as="h2" className="work-title" id="work-h2">The work, all {featuredProjects.length}</Reveal>
      {featuredProjects.map((p, i) => (
        <Reveal as="article" className="work-item" key={p.slug} id={`work-${p.slug}`}>
          <Strip p={p} />
          <div className="work-facts">
            <div className="work-fact work-fact--name">
              <h3 className="work-name">{p.name} <span className="work-cat">{CATEGORY_LABEL[p.category]}</span></h3>
              <p className="work-line">{p.tagline}</p>
              <p className="work-links">
                {p.live && <a className="work-link" href={p.live} target="_blank" rel="noopener noreferrer">Open the live app</a>}
                <a className="work-link" href={p.github} target="_blank" rel="noopener noreferrer">Source on GitHub</a>
              </p>
            </div>
            <div className="work-fact work-fact--stack">
              <span className="work-fact-k">Built with</span>
              <span>{p.tech.slice(0, 4).join(", ")}</span>
            </div>
            <div className="work-fact work-fact--year">
              <span className="work-fact-k">Shipped</span>
              <span>{p.year ?? "2026"}</span>
            </div>
            <div className="work-fact work-fact--team">
              <span className="work-fact-k">Credit</span>
              <span>{p.role ?? "Sole builder"}</span>
            </div>
            <span className="work-index" aria-hidden="true">{i + 1} of {featuredProjects.length}</span>
          </div>
        </Reveal>
      ))}
    </section>
  );
}

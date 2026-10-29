import { CATEGORY_LABEL, featuredProjects, type Project } from "../data/projects";
import { useRef } from "react";
import { Reveal } from "../hooks/useReveal";
import { useLines } from "../motion/useLines";
import { LiveFrame } from "./LiveFrame";

/** Every frame the project has, in the order the sheet shows them. */
export function framesOf(p: Project): string[] {
  const list = p.screenshots && p.screenshots.length ? p.screenshots : p.cover ? [p.cover] : [];
  return [...new Set(list)];
}

function TypesetCard({ p }: { p: Project }) {
  return (
    <div className="work-frame--text" role="img" aria-label={`${p.name}: ${p.tagline}`}>
      <div>
        <p className="wf-name">{p.name}</p>
        <p className="wf-tag">{p.tagline}</p>
      </div>
      <ul className="wf-list">
        {p.features.slice(0, 6).map((f) => <li key={f}>{f}</li>)}
      </ul>
    </div>
  );
}

function Strip({ p }: { p: Project }) {
  const frames = framesOf(p);
  const live = p.live && p.embed !== false ? p.live : undefined;
  // The first frame is the live product when it can be framed; the captures follow it.
  const first = live ? (
    <figure className="work-frame work-frame--live" key="live">
      <LiveFrame url={live} name={p.name} poster={frames[0] ? <img src={frames[0]} alt={`${p.name}, screen 1 of ${frames.length}`} width={1046} height={600} loading="lazy" decoding="async" /> : <TypesetCard p={p} />} />
    </figure>
  ) : null;
  const rest = (live ? frames.slice(1) : frames).map((src, i) => (
    <figure className="work-frame" key={src}>
      <img src={src} alt={`${p.name}, screen ${i + (live ? 2 : 1)} of ${frames.length}`} width={1046} height={600} loading="lazy" decoding="async" />
    </figure>
  ));
  if (!first && rest.length === 0) {
    return (
      <div className="work-strip work-strip--empty">
        <div className="work-frame"><TypesetCard p={p} /></div>
      </div>
    );
  }
  const single = (first ? 1 : 0) + rest.length === 1;
  return (
    <div className={`work-strip${single ? " work-strip--empty" : ""}`} role="group" aria-label={single ? undefined : `${p.name} screens, scroll sideways`}>
      {first}
      {rest}
    </div>
  );
}

export function Work() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useLines(titleRef);
  return (
    <section className="work" id="work" aria-labelledby="work-h2">
      <h2 className="work-title" id="work-h2" ref={titleRef}>{`The work, all ${featuredProjects.length}`}</h2>
      {featuredProjects.map((p, i) => (
        <Reveal as="article" className="work-item" key={p.slug} id={`work-${p.slug}`}>
          <Strip p={p} />
          <div className="work-facts">
            <div className="work-fact work-fact--name" style={{ "--i": 0 } as React.CSSProperties}>
              <h3 className="work-name">{p.name} <span className="work-cat">{CATEGORY_LABEL[p.category]}</span></h3>
              <p className="work-line">{p.tagline}</p>
              <p className="work-features">{p.features.slice(0, 3).join(", ")}.</p>
              <p className="work-links">
                {p.live && <a className="work-link" href={p.live} target="_blank" rel="noopener noreferrer">Open the live app</a>}
                <a className="work-link" href={p.github} target="_blank" rel="noopener noreferrer">Source on GitHub</a>
              </p>
            </div>
            <div className="work-fact work-fact--stack" style={{ "--i": 1 } as React.CSSProperties}>
              <span className="work-fact-k">Built with</span>
              <span>{p.tech.slice(0, 4).join(", ")}</span>
            </div>
            <div className="work-fact work-fact--year" style={{ "--i": 2 } as React.CSSProperties}>
              <span className="work-fact-k">Shipped</span>
              <span>{p.year ?? "2026"}</span>
            </div>
            <div className="work-fact work-fact--team" style={{ "--i": 3 } as React.CSSProperties}>
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

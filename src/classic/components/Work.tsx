import { CATEGORY_LABEL, featuredProjects, type Project } from "../data/projects";
import { Reveal } from "../hooks/useReveal";
import { embeddable, framesOf } from "../lib/frames";
import { LiveFrame } from "./LiveFrame";

function TypesetCard({ p }: { p: Project }) {
  return (
    <div className="frame-text" role="img" aria-label={`${p.name}: ${p.tagline}`}>
      <p className="frame-text-name">{p.name}</p>
      <p className="frame-text-tag">{p.tagline}</p>
    </div>
  );
}

/** The project's first frame: the live app when it can be framed, else its capture, else type. */
function Frame({ p, eager }: { p: Project; eager?: boolean }) {
  const frames = framesOf(p);
  const live = embeddable(p);
  const poster = frames[0]
    ? <img src={frames[0]} alt={`${p.name}, the app on a desktop screen`} width={1440} height={900} loading={eager ? "eager" : "lazy"} decoding="async" />
    : <TypesetCard p={p} />;
  return (
    <div className={`card-frame${live ? " card-frame--live" : ""}${frames[0] ? "" : " card-frame--text"}`}>
      {live ? <LiveFrame url={live} name={p.name} poster={poster} /> : poster}
    </div>
  );
}

function Card({ p, i, featured }: { p: Project; i: number; featured?: boolean }) {
  const extra = p.tech.length - 5;
  return (
    <article className={`card${featured ? " card--featured" : ""}`} id={`work-${p.slug}`} style={{ "--i": i } as React.CSSProperties}>
      <Frame p={p} eager={featured} />
      <div className="card-body">
        <div className="card-top">
          <h3 className="card-name">{p.name}</h3>
          <span className="pill">{CATEGORY_LABEL[p.category]}</span>
        </div>
        <p className="card-tag">{p.tagline}</p>
        {featured && <p className="card-problem">{p.problem}</p>}
        <ul className="card-feats" aria-label="What it does">
          {p.features.slice(0, featured ? 5 : 3).map((f) => <li key={f}>{f}</li>)}
        </ul>
        <ul className="card-tech" aria-label="Built with">
          {p.tech.slice(0, 5).map((t) => <li className="chip" key={t}>{t}</li>)}
          {extra > 0 && <li className="chip chip--more">+{extra} more</li>}
        </ul>
        <p className="card-meta">
          <span>{p.year ?? "2026"}</span>
          <span>{p.role ?? "Sole builder"}</span>
        </p>
        <p className="card-links">
          {p.live && <a className="card-link" href={p.live} target="_blank" rel="noopener noreferrer">Live app</a>}
          <a className="card-link" href={p.github} target="_blank" rel="noopener noreferrer">Source</a>
        </p>
      </div>
    </article>
  );
}

export function Work() {
  const [first, ...rest] = featuredProjects;
  return (
    <section className="work" id="work" aria-labelledby="work-h2">
      <div className="wrap">
        <Reveal as="div" className="section-head">
          <h2 className="h2" id="work-h2">Selected work</h2>
          <p className="section-sub">
            {featuredProjects.length} products, each shipped with source. Where the app allows it, the card runs the live site itself; press “Try it here” to use it in place.
          </p>
        </Reveal>
        <Reveal as="div" className="work-featured" options={{ rootMargin: "0px 0px 20% 0px" }}>
          <Card p={first} i={0} featured />
        </Reveal>
        <Reveal as="div" className="work-grid">
          {rest.map((p, i) => <Card p={p} i={i} key={p.slug} />)}
        </Reveal>
      </div>
    </section>
  );
}

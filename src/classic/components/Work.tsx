import { useId, useMemo, useState } from "react";
import { CATEGORY_LABEL, featuredProjects, type Project, type ProjectCategory } from "../data/projects";
import { CREDIT, FEATURED_SLUGS, KEY_WORK } from "../content";
import { embeddable, framesOf } from "../lib/frames";
import { LiveFrame } from "./LiveFrame";
import { SyncDiagram } from "./SyncDiagram";

const featured = FEATURED_SLUGS.map((s) => featuredProjects.find((p) => p.slug === s)).filter((p): p is Project => Boolean(p));
const rest = featuredProjects.filter((p) => !featured.includes(p));
const CATEGORIES = (["ai", "full-stack", "tool"] as ProjectCategory[]).filter((c) => rest.some((p) => p.category === c));
const INITIAL = 4;

const stack = (p: Project, n: number) => p.tech.slice(0, n).join(" · ");

function Links({ p }: { p: Project }) {
  return (
    <p className="links">
      {p.live && <a className="link" href={p.live} target="_blank" rel="noopener noreferrer">Live app<span className="sr-only"> for {p.name} (opens in a new tab)</span></a>}
      <a className="link" href={p.github} target="_blank" rel="noopener noreferrer">Source<span className="sr-only"> for {p.name} on GitHub (opens in a new tab)</span></a>
    </p>
  );
}

function Featured({ p }: { p: Project }) {
  const shot = framesOf(p)[0];
  const live = embeddable(p);
  const img = shot ? <img src={shot} alt={`${p.name}, screenshot of the app`} width={1440} height={900} loading="lazy" decoding="async" /> : null;
  return (
    <article className="feature" id={`work-${p.slug}`}>
      {img && <div className="feature-shot">{live ? <LiveFrame url={live} name={p.name} poster={img} /> : img}</div>}
      <div className="feature-body">
        <h3 className="feature-name">{p.name}</h3>
        <p className="feature-tag">{p.tagline}</p>
        <dl className="spec">
          <div><dt>What I built</dt><dd>{KEY_WORK[p.slug] ?? p.features.slice(0, 3).join(", ")}</dd></div>
          <div><dt>Stack</dt><dd>{stack(p, 5)}</dd></div>
          {CREDIT[p.slug] && <div><dt>Context</dt><dd>{CREDIT[p.slug]}</dd></div>}
        </dl>
        <Links p={p} />
      </div>
    </article>
  );
}

function Compact({ p }: { p: Project }) {
  const shot = framesOf(p)[0];
  return (
    <article className={`compact${shot ? "" : " compact--text"}`} id={`work-${p.slug}`}>
      {shot && <img className="compact-thumb" src={shot} alt="" width={1440} height={900} loading="lazy" decoding="async" />}
      <div className="compact-body">
        <h4 className="compact-name">{p.name} <span className="compact-cat">{CATEGORY_LABEL[p.category]}</span></h4>
        <p className="compact-tag">{p.tagline}</p>
        <p className="compact-work">{KEY_WORK[p.slug]}</p>
        <p className="meta">{stack(p, 3)}{CREDIT[p.slug] && <> · {CREDIT[p.slug]}</>}</p>
        <Links p={p} />
      </div>
    </article>
  );
}

export function Work() {
  const [cat, setCat] = useState<ProjectCategory | "all">("all");
  const [expanded, setExpanded] = useState(false);
  const listId = useId();
  const filtered = useMemo(() => (cat === "all" ? rest : rest.filter((p) => p.category === cat)), [cat]);
  // "All" starts short; a chosen category shows everything in it.
  const shown = cat === "all" && !expanded ? filtered.slice(0, INITIAL) : filtered;
  const hidden = filtered.length - shown.length;

  return (
    <section className="work" id="work" aria-labelledby="work-h2">
      <div className="wrap">
        <div className="section-head">
          <h2 className="h2" id="work-h2">Selected work</h2>
          <p className="section-sub">Four products that show the range: AI pipelines, real-time systems and research tooling. Each one is open source; most are live.</p>
        </div>
        <div className="features">
          {featured.map((p) => <Featured p={p} key={p.slug} />)}
        </div>
        <SyncDiagram />

        <div className="more">
          <div className="more-head">
            <h3 className="h3" id="more-h3">More projects</h3>
            <div className="filters" role="group" aria-label="Filter projects by category">
              {(["all", ...CATEGORIES] as const).map((c) => {
                const n = c === "all" ? rest.length : rest.filter((p) => p.category === c).length;
                return (
                  <button key={c} type="button" className="filter" aria-pressed={cat === c} aria-controls={listId} onClick={() => { setCat(c); setExpanded(false); }}>
                    {c === "all" ? "All" : CATEGORY_LABEL[c]} <span className="filter-n">{n}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <p className="sr-only" role="status">{`Showing ${shown.length} of ${filtered.length} ${cat === "all" ? "" : CATEGORY_LABEL[cat] + " "}projects`}</p>
          <div className="compacts" id={listId} aria-labelledby="more-h3">
            {shown.map((p) => <Compact p={p} key={p.slug} />)}
          </div>
          {cat === "all" && (hidden > 0 || expanded) && (
            <button type="button" className="btn btn--secondary more-toggle" aria-expanded={expanded} aria-controls={listId} onClick={() => setExpanded((v) => !v)}>
              {expanded ? "Show fewer projects" : `Show ${hidden} more project${hidden === 1 ? "" : "s"}`}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

import { useId, useMemo, useState } from "react";
import { CATEGORY_LABEL, featuredProjects, type Project, type ProjectCategory } from "../data/projects";
import { CREDIT, FEATURED_SLUGS, KEY_WORK } from "../content";
import { embeddable, framesOf, hostOf } from "../lib/frames";
import { LiveFrame } from "./LiveFrame";
import { smooth } from "../lib/vt";
import { ProjectDialog } from "./ProjectDialog";
import { Builds } from "./Builds";

const featured = FEATURED_SLUGS.map((s) => featuredProjects.find((p) => p.slug === s)).filter((p): p is Project => Boolean(p));
const rest = featuredProjects.filter((p) => !featured.includes(p));
const CATEGORIES = (["ai", "full-stack", "tool"] as ProjectCategory[]).filter((c) => rest.some((p) => p.category === c));
const INITIAL = 4;
const ALL = [...featured, ...rest];

const stack = (p: Project, n: number) => p.tech.slice(0, n).join(" · ");
const Chips = ({ p, n }: { p: Project; n: number }) => (
  <ul className="chips">{p.tech.slice(0, n).map((t) => <li className="chip" key={t}>{t}</li>)}</ul>
);

function Links({ p, onOpen }: { p: Project; onOpen?: () => void }) {
  return (
    <p className="links">
      {onOpen && <button type="button" className="link link-btn" onClick={onOpen}>Details<span className="sr-only"> about {p.name}</span></button>}
      {p.live && <a className="link" href={p.live} target="_blank" rel="noopener noreferrer">Live app<span className="sr-only"> for {p.name} (opens in a new tab)</span></a>}
      <a className="link" href={p.github} target="_blank" rel="noopener noreferrer">Source<span className="sr-only"> for {p.name} on GitHub (opens in a new tab)</span></a>
    </p>
  );
}

function Featured({ p, flagship, onOpen }: { p: Project; flagship?: boolean; onOpen: () => void }) {
  const shot = framesOf(p)[0];
  const live = embeddable(p);
  const img = shot ? <img src={shot} alt={`${p.name}, screenshot of the app`} width={1440} height={900} loading="lazy" decoding="async" /> : null;
  return (
    <article className={`feature${flagship ? " feature--flagship" : ""}`} id={`work-${p.slug}`}>
      {img && (
        <div className="shot-frame">
          <div className="shot-bar" aria-hidden="true"><i /><i /><i /><span>{hostOf(p.live ?? p.github)}</span></div>
          <div className="feature-shot">{live ? <LiveFrame url={live} name={p.name} poster={img} /> : img}</div>
        </div>
      )}
      <div className="feature-body">
        <p className="feature-cat">{flagship ? `Flagship · ${CATEGORY_LABEL[p.category]}` : CATEGORY_LABEL[p.category]}</p>
        <h3 className="feature-name">{p.name}</h3>
        <p className="feature-tag">{p.tagline}</p>
        <dl className="spec">
          <div><dt>What I built</dt><dd>{KEY_WORK[p.slug] ?? p.features.slice(0, 3).join(", ")}</dd></div>
          <div><dt>Stack</dt><dd><Chips p={p} n={5} /></dd></div>
          {CREDIT[p.slug] && <div><dt>Context</dt><dd>{CREDIT[p.slug]}</dd></div>}
        </dl>
        <Links p={p} onOpen={onOpen} />
      </div>
    </article>
  );
}

function Compact({ p, k, onOpen }: { p: Project; k: number; onOpen: () => void }) {
  const shot = framesOf(p)[0];
  return (
    <article className={`compact${shot ? "" : " compact--text"}`} data-cat={p.category} id={`work-${p.slug}`} style={{ "--k": k } as React.CSSProperties}>
      {shot && <img className="compact-thumb" src={shot} alt="" width={1440} height={900} loading="lazy" decoding="async" />}
      <div className="compact-body">
        <h4 className="compact-name">{p.name}<span className="compact-arrow" aria-hidden="true">→</span> <span className="compact-cat">{CATEGORY_LABEL[p.category]}</span></h4>
        <p className="compact-tag">{p.tagline}</p>
        <p className="compact-work">{KEY_WORK[p.slug]}</p>
        <p className="meta">{stack(p, 3)}{CREDIT[p.slug] && <> · {CREDIT[p.slug]}</>}</p>
        <Links p={p} onOpen={onOpen} />
      </div>
    </article>
  );
}

export function Work() {
  const [cat, setCat] = useState<ProjectCategory | "all">("all");
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<number | null>(null);
  const openSlug = (slug: string) => setOpen(ALL.findIndex((x) => x.slug === slug));
  const listId = useId();
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rest.filter((p) => (cat === "all" || p.category === cat) && (!q || [p.name, p.tagline, ...p.tech].join(" ").toLowerCase().includes(q)));
  }, [cat, query]);
  // "All" starts short; a chosen category shows everything in it.
  const shown = cat === "all" && !expanded && !query ? filtered.slice(0, INITIAL) : filtered;
  const hidden = filtered.length - shown.length;

  return (
    <section className="work" id="work" aria-labelledby="work-h2">
      <div className="wrap">
        <div className="section-head">
          <h2 className="h2" id="work-h2">Projects</h2>
          <p className="section-sub">The flagship first, then three that show the range: an AI agent pipeline, a real-time system and an AI developer tool. Each one is open source and live.</p>
        </div>
        <div className="features">
          {featured.map((p, i) => <Featured p={p} key={p.slug} flagship={i === 0} onOpen={() => openSlug(p.slug)} />)}
        </div>

        <div className="more">
          <div className="more-head">
            <h3 className="h3" id="more-h3">More projects</h3>
            <div className="filters" role="group" aria-label="Filter projects by category">
              {(["all", ...CATEGORIES] as const).map((c) => {
                const n = c === "all" ? rest.length : rest.filter((p) => p.category === c).length;
                return (
                  <button key={c} type="button" className="filter" aria-pressed={cat === c} aria-controls={listId} onClick={() => smooth(() => { setCat(c); setExpanded(false); })}>
                    {c === "all" ? "All" : CATEGORY_LABEL[c]} <span className="filter-n">{n}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="search">
            <label className="sr-only" htmlFor="project-search">Search projects</label>
            <input id="project-search" className="search-input" type="search" placeholder="Search by name or tech, e.g. React" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <p className="sr-only" role="status">{`Showing ${shown.length} of ${filtered.length} ${cat === "all" ? "" : CATEGORY_LABEL[cat] + " "}projects`}</p>
          <div className="compacts" id={listId} aria-labelledby="more-h3" key={cat}>
            {shown.map((p, i) => <Compact p={p} key={p.slug} onOpen={() => openSlug(p.slug)} k={expanded && cat === "all" ? Math.max(0, i - INITIAL) : i} />)}
          </div>
          {filtered.length === 0 && <p className="empty">No project matches “{query}”. <button type="button" className="link link-btn" onClick={() => { setQuery(""); setCat("all"); }}>Clear search</button></p>}
          {cat === "all" && !query && (hidden > 0 || expanded) && (
            <button type="button" className="btn btn--secondary more-toggle" aria-expanded={expanded} aria-controls={listId} onClick={() => smooth(() => setExpanded((v) => !v))}>
              {expanded ? "Show fewer projects" : `Show ${hidden} more project${hidden === 1 ? "" : "s"}`}
            </button>
          )}
        </div>
        <Builds />
      </div>
      <ProjectDialog list={ALL} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
    </section>
  );
}

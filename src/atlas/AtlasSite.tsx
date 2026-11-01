import "@fontsource/host-grotesk/latin-400.css";
import "@fontsource/host-grotesk/latin-500.css";
import "@fontsource/fragment-mono/latin-400.css";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type KeyboardEvent as RKeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { InterfaceSwitcher } from "../interface-switcher/InterfaceSwitcher";
import { CATEGORY_LABEL, featuredProjects, otherProjects } from "../classic/data/projects";
import { education, experience } from "../classic/data/experience";
import { skillCategories } from "../classic/data/skills";
import { site } from "../classic/data/site";
import { mailtoHref, sendMessage } from "../lib/contact";
import { caseStudyPath, hasCaseStudy } from "../work/links";
import { GRID_COLS, GRID_ROWS, H, W, backdrop, terrain } from "./terrain";
import { useContributions, useRepos, type Activity } from "./useLive";
import "./styles/atlas.css";

/* ---------- data, all derived from the portfolio's own records ---------- */
const T = terrain(featuredProjects.length);
const BG = backdrop();
const pad = (n: number) => String(n).padStart(2, "0");
const PLATES = featuredProjects.map((p, i) => ({ p, s: T.summits[i], n: pad(i + 1) }));
const shotOf = (p: (typeof featuredProjects)[number]) => p.cover ?? p.screenshots?.[0];

interface Row { n: string; name: string; text: string; tag: string; year?: string; url: string; live?: string }
const STATIC_ROWS: Omit<Row, "n">[] = otherProjects.map((p) => ({ name: p.name, text: p.description, tag: p.tech.slice(0, 2).join(", "), url: p.github, live: p.live }));

/** Every project numbered once, summits first, so skills can cite them by number. */
const NUMBERED = [
  ...featuredProjects.map((p, i) => ({ n: pad(i + 1), tech: p.tech })),
  ...otherProjects.map((p, i) => ({ n: pad(featuredProjects.length + i + 1), tech: p.tech })),
];
/** A project uses a skill when a stack entry is that skill, or starts with it as a word ("Gemini 2.0 Flash" → Gemini). */
const uses = (tech: string, skill: string) => {
  const t = tech.toLowerCase(), k = skill.toLowerCase();
  return t === k || t.startsWith(`${k} `) || t.startsWith(`${k} ·`);
};
const usedIn = (skill: string) => NUMBERED.filter((x) => x.tech.some((t) => uses(t, skill))).map((x) => x.n);
const SKILL_COUNT = skillCategories.reduce((a, c) => a + c.items.length, 0);

const school = education[0];
const BIO = `I study computer science${school ? ` at ${school.school.replace(" (NITTE)", "")}` : ""} and build AI products from the interface to the model behind them, then keep them running once they are live. Since March 2026 I have held ${experience.length} roles, and every project is on GitHub with its source.`;

const SECTIONS = [
  { id: "atl-projects", roman: "I", label: "Projects" },
  { id: "atl-more", roman: "II", label: "More projects" },
  { id: "atl-skills", roman: "III", label: "Skills" },
  { id: "atl-activity", roman: "IV", label: "Activity" },
  { id: "atl-route", roman: "V", label: "Route" },
  { id: "contact", roman: "VI", label: "Contact" },
] as const;

const ext = { target: "_blank", rel: "noopener noreferrer" } as const;
const NewTab = () => <span className="sr-only"> (opens in a new tab)</span>;
const monthYear = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
const host = (u: string) => u.replace(/^https?:\/\//, "").replace(/\/$/, "");
const repoPath = (u: string) => u.replace("https://github.com/", "");

/* ---------- shared pieces ---------- */
function Contours({ lines, className }: { lines: typeof BG; className: string }) {
  return (
    <svg className={className} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      {lines.map((l) => <path key={l.level} d={l.d} className={l.index ? "is-index" : undefined} />)}
    </svg>
  );
}

function Ruler() {
  return <div className="atl-ruler" aria-hidden="true">{Array.from({ length: 13 }, (_, i) => <i key={i} />)}</div>;
}

function Head({ i, lead }: { i: number; lead: string }) {
  const s = SECTIONS[i];
  return (
    <header className="atl-head">
      <Ruler />
      <p className="atl-roman" aria-hidden="true">{s.roman}</p>
      <h2 id={`${s.id}-h`} className="atl-h2">{s.label}</h2>
      <p className="atl-lead">{lead}</p>
    </header>
  );
}

/* ---------- title sheet ---------- */
/** `activity` is the year's total, null while loading, or "failed" when the sheet is left out. */
function TitleSheet({ activity, more }: { activity: number | null | "failed"; more: number }) {
  const map = useRef<HTMLDivElement>(null);
  // A summit keeps its triangle but drops its name wherever the name would run under the card,
  // the legend or off the map; re-measured whenever the map changes size.
  useEffect(() => {
    const el = map.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const fit = () => {
      const box = el.getBoundingClientRect();
      const covers = [...el.querySelectorAll(".atl-card, .atl-legend")].map((c) => c.getBoundingClientRect());
      el.querySelectorAll<HTMLLIElement>(".atl-peaks li").forEach((li) => {
        li.classList.remove("is-quiet");
        const r = li.querySelector(".atl-peak-name")?.getBoundingClientRect();
        if (!r || !r.width) return;
        const hit = r.right > box.right - 8 || covers.some((c) => r.right > c.left - 8 && r.left < c.right + 8 && r.bottom > c.top - 8 && r.top < c.bottom + 8);
        li.classList.toggle("is-quiet", hit);
      });
    };
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const contents = [
    { icon: "peak", n: 0, count: pad(PLATES.length) },
    { icon: "hollow", n: 1, count: pad(more) },
    { icon: "ridge", n: 2, count: pad(SKILL_COUNT) },
    { icon: "profile", n: 3, count: activity === null ? "…" : activity === "failed" ? null : activity.toLocaleString("en-GB") },
    { icon: "trail", n: 4, count: pad(experience.length) },
    { icon: "datum", n: 5, count: "" },
  ];
  return (
    <section className="atl-title" id="atl-top" aria-labelledby="atl-name">
      <ol className="atl-coords atl-coords--top" aria-hidden="true">{[...GRID_COLS].map((c) => <li key={c}>{c}</li>)}</ol>
      <ol className="atl-coords atl-coords--bottom" aria-hidden="true">{[...GRID_COLS].map((c) => <li key={c}>{c}</li>)}</ol>
      <ol className="atl-coords atl-coords--left" aria-hidden="true">{Array.from({ length: GRID_ROWS }, (_, i) => <li key={i}>{i + 1}</li>)}</ol>
      <ol className="atl-coords atl-coords--right" aria-hidden="true">{Array.from({ length: GRID_ROWS }, (_, i) => <li key={i}>{i + 1}</li>)}</ol>
      <div className="atl-map" ref={map}>
        <div className="atl-map-art">
        <Contours lines={T.lines} className="atl-map-lines" />
        <div className="atl-map-grid" aria-hidden="true" />
        <ul className="atl-peaks">
          {PLATES.map(({ p, s, n }) => (
            <li key={p.slug} style={{ "--x": `${(s.x / W) * 100}%`, "--y": `${(s.y / H) * 100}%`, "--d": Number(n) } as CSSProperties}>
              <a href={`#plate-${p.slug}`}>
                <span className="atl-tri" aria-hidden="true" />
                <span className="atl-peak-name">{n} {p.name}</span>
                <span className="sr-only">, summit at {s.ref}</span>
              </a>
            </li>
          ))}
        </ul>
        </div>

        <div className="atl-card">
          <p className="atl-card-top"><span>Sheet I · An atlas of the work of</span><span className="atl-north" aria-hidden="true"><svg viewBox="0 0 12 16"><path d="M6 0 11 12 6 9 1 12Z" /></svg><b>N</b></span></p>
          <h1 className="atl-name" id="atl-name">{site.name}</h1>
          <p className="atl-sub">{site.title}</p>
          <p className="atl-bio">{BIO}</p>
          <p className="atl-card-foot">
            <span className="atl-scalebar" aria-hidden="true"><i /><i /><i /><i /></span>
            <span>Surveyed from <a href={site.github} {...ext}>github.com/{site.githubUser}<NewTab /></a></span>
          </p>
        </div>

        <nav className="atl-legend" aria-label="Contents">
          <p className="atl-legend-top"><span>Legend</span><span>Contents</span></p>
          <ol>
            {contents.filter((c) => c.count !== null).map(({ icon, n, count }) => (
              <li key={n}>
                <a href={`#${SECTIONS[n].id}`}>
                  <i className={`atl-ico atl-ico--${icon}`} aria-hidden="true" />
                  <span className="atl-legend-roman" aria-hidden="true">{SECTIONS[n].roman}</span>
                  <span className="atl-legend-label">{SECTIONS[n].label}</span>
                  <span className="atl-legend-count">{count}</span>
                </a>
              </li>
            ))}
          </ol>
          <p className="atl-legend-key" aria-hidden="true"><span><i /> Contour</span><span><i className="ix" /> Index contour</span><span><i className="dt" /> Datum</span></p>
        </nav>
      </div>
    </section>
  );
}

/* ---------- sticky bar: section, search, progress ---------- */
interface Target { label: string; kind: string; href: string }
function useTargets(rows: Row[]): Target[] {
  return useMemo(() => [
    ...SECTIONS.map((s) => ({ label: s.label, kind: `Section ${s.roman}`, href: `#${s.id}` })),
    ...PLATES.map(({ p, n }) => ({ label: p.name, kind: `Plate ${n}`, href: `#plate-${p.slug}` })),
    ...rows.map((r) => ({ label: r.name, kind: `Project ${r.n}`, href: `#row-${r.n}` })),
    ...skillCategories.flatMap((c) => c.items.map((s) => ({ label: s.name, kind: c.label, href: `#atl-skills` }))),
  ], [rows]);
}

function Bar({ rows }: { rows: Row[] }) {
  const [current, setCurrent] = useState(-1);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const bar = useRef<HTMLElement>(null);
  const targets = useTargets(rows);
  const results = q.trim() ? targets.filter((t) => t.label.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 8) : [];

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
        const pct = Math.min(1, scrollY / max);
        bar.current?.style.setProperty("--p", pct.toFixed(4));
        const pctEl = bar.current?.querySelector(".atl-pct");
        if (pctEl) pctEl.textContent = `${Math.round(pct * 100)}%`;
        let cur = -1;
        SECTIONS.forEach((s, i) => {
          const el = document.getElementById(s.id);
          if (el && el.getBoundingClientRect().top < innerHeight * 0.4) cur = i;
        });
        setCurrent(cur);
      });
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey || (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable))) return;
      e.preventDefault();
      input.current?.focus();
    };
    addEventListener("keydown", onKey);
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("keydown", onKey);
      cancelAnimationFrame(raf);
    };
  }, []);

  const go = (t: Target) => {
    setOpen(false);
    setQ("");
    const el = document.querySelector(t.href);
    el?.scrollIntoView({ block: "start" });
    history.replaceState(null, "", t.href);
  };
  const onKeyDown = (e: RKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(results.length - 1, a + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    else if (e.key === "Enter" && results[active]) { e.preventDefault(); go(results[active]); }
    else if (e.key === "Escape") { setOpen(false); input.current?.blur(); }
  };
  const sec = SECTIONS[current];
  return (
    <header className="atl-bar" ref={bar}>
      <a href="#atl-top" className="atl-bar-name">{site.name}</a>
      <p className="atl-bar-sec" aria-live="polite">{sec ? <><span className="atl-roman-sm">{sec.roman}</span> {sec.label}</> : <span className="atl-bar-dim">Title sheet</span>}</p>
      <div className="atl-search">
        <span aria-hidden="true" className="atl-slash">/</span>
        <input
          ref={input}
          type="search"
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-controls="atl-results"
          aria-autocomplete="list"
          aria-activedescendant={open && results[active] ? `atl-r-${active}` : undefined}
          aria-label="Find a project, skill or section"
          placeholder="Find a project, skill or section"
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(0); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={onKeyDown}
        />
        <span className="atl-pct" aria-hidden="true">0%</span>
        <kbd aria-hidden="true">/</kbd>
        {open && results.length > 0 && (
          <ul className="atl-results" id="atl-results" role="listbox" aria-label="Matches">
            {results.map((r, i) => (
              <li key={r.kind + r.label} id={`atl-r-${i}`} role="option" aria-selected={i === active} onMouseDown={(e) => { e.preventDefault(); go(r); }} onMouseEnter={() => setActive(i)}>
                <span>{r.label}</span><em>{r.kind}</em>
              </li>
            ))}
          </ul>
        )}
      </div>
      <span className="atl-progress" aria-hidden="true" />
      <InterfaceSwitcher current="atlas" />
    </header>
  );
}

/* ---------- I. Projects ---------- */
function Plates() {
  return (
    <section className="atl-sec" id="atl-projects" aria-labelledby="atl-projects-h">
      <Head i={0} lead={`${PLATES.length} summits, each shown as it is: its own picture where it has one.`} />
      <ol className="atl-plates">
        {PLATES.map(({ p, s, n }, i) => {
          const shot = shotOf(p);
          return (
            <li key={p.slug} id={`plate-${p.slug}`} className={`atl-plate atl-plate--${i % 3}`}>
              <p className="atl-plate-ref" aria-hidden="true"><span className="atl-tri" /> {n} {s.ref}</p>
              <div className="atl-plate-card">
                <div className="atl-plate-inner">
                  {shot ? (
                    <img src={shot} alt={`${p.name}, screenshot of the app`} width={1440} height={900} loading="lazy" decoding="async" />
                  ) : (
                    <>
                      <p className="atl-plate-no"><span className="atl-tri" aria-hidden="true" /> {n}</p>
                      <p className="atl-plate-big" aria-hidden="true">{p.name}</p>
                      <p className="atl-plate-meta">{CATEGORY_LABEL[p.category]} · {p.tech.length} tools</p>
                    </>
                  )}
                </div>
              </div>
              <div className="atl-plate-cap">
                <p className="atl-plate-of"><span>Plate {n} of {pad(PLATES.length)}</span> <span>Summit at {s.ref}</span></p>
                <h3 className="atl-plate-name">{p.name}</h3>
                <p className="atl-plate-text">{p.tagline}</p>
                <dl className="atl-facts">
                  <div><dt>Category</dt><dd>{CATEGORY_LABEL[p.category]}</dd></div>
                  <div><dt>Role</dt><dd>{p.role ?? "Sole builder"}</dd></div>
                  <div><dt>Stack</dt><dd>{p.tech.join(", ")}</dd></div>
                </dl>
                <div className="atl-plate-links">
                  {p.live && <p><span>Live site</span><a href={p.live} {...ext}>{host(p.live)}<NewTab /></a></p>}
                  <p><span>Source</span><a href={p.github} {...ext}>{repoPath(p.github)}<NewTab /></a></p>
                  {hasCaseStudy(p.slug) && <p><span>Case study</span><Link to={caseStudyPath(p.slug)} state={{ from: "/atlas" }}>Read the case study</Link></p>}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/* ---------- II. More projects (gazetteer) ---------- */
function More({ rows, live }: { rows: Row[]; live: "loading" | "ok" | "failed" }) {
  const [cur, setCur] = useState(0);
  const list = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const el = list.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((es) => {
      for (const e of es) if (e.isIntersecting) setCur(Number((e.target as HTMLElement).dataset.i));
    }, { rootMargin: "-45% 0px -50% 0px" });
    el.querySelectorAll("li").forEach((li) => io.observe(li));
    return () => io.disconnect();
  }, [rows]);
  const r = rows[cur] ?? rows[0];
  return (
    <section className="atl-sec" id="atl-more" aria-labelledby="atl-more-h">
      <Head i={1} lead={`${rows.length} smaller peaks${live === "ok" ? ", with the newest public repositories read live from GitHub" : ""}.`} />
      <div className="atl-gaz">
        <div className="atl-gaz-side" aria-hidden="true">
          <p className="atl-gaz-big">{r?.n}</p>
          <p className="atl-gaz-meta">{[r?.tag, r?.year].filter(Boolean).join(" · ")}</p>
          <p className="atl-gaz-of">of {pad(featuredProjects.length + rows.length)}</p>
        </div>
        <ol className="atl-gaz-list" ref={list}>
          {rows.map((row, i) => (
            <li key={row.url + row.n} id={`row-${row.n}`} data-i={i} onMouseEnter={() => setCur(i)} className={i === cur ? "is-cur" : undefined}>
              <span className="atl-gaz-n">{row.n}</span>
              <span className="atl-tri atl-tri--hollow" aria-hidden="true" />
              <a className="atl-gaz-name" href={row.url} {...ext} onFocus={() => setCur(i)}>{row.name}<NewTab /></a>
              <p className="atl-gaz-text">{row.text}{row.live && <> <a href={row.live} {...ext} className="atl-gaz-live">Live<NewTab /></a></>}</p>
              <span className="atl-gaz-tag">{row.tag}</span>
              <span className="atl-gaz-year">{row.year ?? ""}</span>
            </li>
          ))}
        </ol>
      </div>
      {live === "failed" && <p className="atl-note">GitHub did not answer, so only the portfolio's own records are listed.</p>}
    </section>
  );
}

/* ---------- III. Skills (index) ---------- */
function Skills() {
  return (
    <section className="atl-sec" id="atl-skills" aria-labelledby="atl-skills-h">
      <Head i={2} lead={`${SKILL_COUNT} entries in ${skillCategories.length} groups. The numbers after a name are the projects that use it.`} />
      <div className="atl-index">
        {skillCategories.map((c) => (
          <div key={c.label} className="atl-index-group">
            <h3><span>{c.label}</span><span className="atl-index-count">{pad(c.items.length)}</span></h3>
            <ul>
              {c.items.map((s) => {
                const ns = usedIn(s.name);
                return (
                  <li key={s.name}>
                    <span>{s.name}</span>
                    {ns.length > 0 && <span className="atl-index-refs"><span className="sr-only">used in projects </span>{ns.slice(0, 4).join(", ")}{ns.length > 4 ? ` +${ns.length - 4}` : ""}</span>}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- IV. Activity ---------- */
function smooth(pts: [number, number][]) {
  if (pts.length < 2) return "";
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

/** Adds `is-in` once the element is on screen, so the profile draws where it can be seen. */
function useSeen<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { el.classList.add("is-in"); return; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add("is-in"); io.disconnect(); }
    }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

function ActivityBody({ a }: { a: Activity }) {
  const seen = useSeen<HTMLDivElement>();
  const VW = 1000, VH = 300, TOP = 34, BASE = 280;
  const max = Math.max(1, ...a.weeks.map((w) => w.count));
  const n = a.weeks.length;
  const pts = a.weeks.map((w, i) => [(i / Math.max(1, n - 1)) * VW, BASE - Math.sqrt(w.count / max) * (BASE - TOP)] as [number, number]);
  const ridge = smooth(pts);
  const pi = a.weeks.indexOf(a.busiest);
  const peak = pts[Math.max(0, pi)];
  const months = a.weeks.map((w, i) => ({ i, d: new Date(w.start) })).filter(({ d }, k, arr) => k > 0 && d.getMonth() !== arr[k - 1].d.getMonth());
  const dayMax = Math.max(1, ...a.days.map((d) => d.count));
  const lead = (new Date(a.days[0]?.date ?? Date.UTC(2000, 0, 1)).getUTCDay() + 6) % 7; // Monday-first rows
  const byMonth = new Map<string, number>();
  a.days.forEach((d) => byMonth.set(d.date.slice(0, 7), (byMonth.get(d.date.slice(0, 7)) ?? 0) + d.count));
  return (
    <>
      <div className="atl-act-top">
        <p className="atl-act-total"><span className="atl-act-big">{a.total.toLocaleString("en-GB")}</span><span className="atl-act-cap">contributions in the last year</span></p>
        <dl className="atl-facts atl-facts--act">
          <div><dt>Active days</dt><dd>{a.active}</dd></div>
          <div><dt>Busiest week</dt><dd>{a.busiest.count}, week of {monthYear(a.busiest.start)}</dd></div>
          <div><dt>Longest run</dt><dd>{a.longest} days</dd></div>
        </dl>
      </div>
      <figure className="atl-profile">
        <div className="atl-profile-plot" ref={seen}>
          <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <path d={`${ridge}L${VW} ${VH}L0 ${VH}Z`} className="atl-profile-fill" />
            <path d={ridge} className="atl-profile-line" pathLength={1} />
          </svg>
          {peak && <p className={`atl-peak-tag${peak[0] / VW > 0.85 ? " is-flip" : ""}`} style={{ left: `${(peak[0] / VW) * 100}%`, top: `${(peak[1] / VH) * 100}%` }}><span className="atl-tri" aria-hidden="true" /> Peak, {a.busiest.count}</p>}
        </div>
        <div className="atl-axis" aria-hidden="true">{months.map(({ i, d }) => <span key={i} style={{ left: `${(i / Math.max(1, n - 1)) * 100}%` }}>{d.toLocaleDateString("en-GB", { month: "short" })}</span>)}</div>
        <div className="atl-plan" aria-hidden="true" style={{ "--lead": lead } as CSSProperties}>
          {Array.from({ length: lead }, (_, i) => <i key={`pad${i}`} className="is-pad" />)}
          {a.days.map((d) => <i key={d.date} style={{ "--l": d.count ? (0.2 + 0.8 * Math.sqrt(d.count / dayMax)).toFixed(2) : 0 } as CSSProperties} />)}
        </div>
        <figcaption className="atl-act-caps"><span>Section: the weekly totals, heights on a square-root scale</span><span>Plan: a square a day <i className="atl-plan-key" aria-hidden="true"><b /><b /><b /><b /><b /></i></span></figcaption>
      </figure>
      <table className="sr-only">
        <caption>Contributions per month, last year</caption>
        <thead><tr><th scope="col">Month</th><th scope="col">Contributions</th></tr></thead>
        <tbody>{[...byMonth].map(([m, c]) => <tr key={m}><th scope="row">{monthYear(`${m}-01`)}</th><td>{c}</td></tr>)}</tbody>
      </table>
    </>
  );
}

function ActivitySec({ act }: { act: ReturnType<typeof useContributions> }) {
  if (act.status === "failed") return null;
  return (
    <section className="atl-sec" id="atl-activity" aria-labelledby="atl-activity-h">
      <Head i={3} lead="The last year of contributions, in section and in plan." />
      {act.status === "loading" ? <div className="atl-skel" aria-busy="true" aria-label="Loading contributions" /> : <ActivityBody a={act.data} />}
    </section>
  );
}

/* ---------- V. Route ---------- */
function Route() {
  return (
    <section className="atl-sec" id="atl-route" aria-labelledby="atl-route-h">
      <Head i={4} lead="Roles so far, newest first, as waypoints on one trail." />
      <ol className="atl-route">
        {experience.map((x, i) => (
          <li key={x.company + x.role}>
            <span className="atl-gaz-n">{pad(i + 1)}</span>
            <span className="atl-route-mark" aria-hidden="true" />
            <div>
              <h3 className="atl-route-role">{x.role}</h3>
              <p className="atl-route-co">{x.company}</p>
            </div>
            <ul className="atl-route-pts">{x.points.map((pt) => <li key={pt}>{pt}</li>)}</ul>
            <span className="atl-gaz-tag">{x.period}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ---------- VI. Contact ---------- */
type Status = "idle" | "sending" | "sent" | "mailto" | "error";
function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [tried, setTried] = useState(false);
  const fallback = mailtoHref({ name: name || "visitor", email, message });
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const valid = name.trim().length > 0 && emailOk && message.trim().length > 0;
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!valid || status === "sending") return;
    setStatus("sending");
    const r = await sendMessage({ name, email, message, source: "atlas" });
    if (r.ok) { setStatus("sent"); setName(""); setEmail(""); setMessage(""); setTried(false); return; }
    if (r.reason === "no-key") { window.location.href = fallback; setStatus("mailto"); return; }
    setStatus("error");
  };
  const err = (show: boolean, id: string, text: string) => (show ? <p className="atl-err" id={id}>{text}</p> : null);
  const links = [
    { label: "Email", sub: site.email, href: `mailto:${site.email}` },
    { label: "GitHub", sub: `github.com/${site.githubUser}`, href: site.github, ext: true },
    { label: "LinkedIn", sub: host(site.linkedin).replace("www.", ""), href: site.linkedin, ext: true },
    { label: "Résumé", sub: "PDF", href: site.resume, download: true },
  ];
  return (
    <section className="atl-sec atl-contact" id="contact" aria-labelledby="contact-h">
      <Ruler />
      <div className="atl-contact-left">
        <p className="atl-roman" aria-hidden="true">VI</p>
        <h2 id="contact-h" className="atl-h2 atl-h2--xl">Contact</h2>
        <p className="atl-lead">Write to me directly, or find me on these. I reply {site.replyTime}.</p>
        <svg className="atl-compass" viewBox="-60 -60 120 120" aria-hidden="true" focusable="false">
          <circle r="54" className="c1" /><circle r="44" className="c2" />
          {Array.from({ length: 48 }, (_, i) => { const a = (i / 48) * Math.PI * 2; const r0 = i % 4 === 0 ? 46 : 50; return <line key={i} x1={Math.cos(a) * r0} y1={Math.sin(a) * r0} x2={Math.cos(a) * 54} y2={Math.sin(a) * 54} />; })}
          <path d="M0 -40 7 0 0 6 -7 0Z" className="n" /><path d="M0 40 4 0 0 6 -4 0Z" className="s" />
          <text y="-30" className="t">N</text>
        </svg>
      </div>
      <div className="atl-contact-right">
        <ul className="atl-links">
          {links.map((l) => (
            <li key={l.label}>
              <a href={l.href} {...(l.ext ? ext : {})} {...(l.download ? { download: "sree-vardhan-v-resume.pdf" } : {})}>
                <span className="atl-link-label">{l.label}</span>
                <span className="atl-link-sub">{l.sub}</span>
                <span className="atl-link-arrow" aria-hidden="true">↗</span>
                {l.ext && <NewTab />}
              </a>
            </li>
          ))}
        </ul>
        <form className="atl-form" onSubmit={submit} noValidate aria-labelledby="atl-form-h">
          <p className="atl-form-h" id="atl-form-h">Write a message</p>
          <div className="atl-form-row">
            <div>
              <label htmlFor="atl-name-in">Name</label>
              <input id="atl-name-in" type="text" autoComplete="name" placeholder="Jane Recruiter" required value={name} onChange={(e) => setName(e.target.value)} aria-invalid={tried && !name.trim() ? true : undefined} aria-describedby={tried && !name.trim() ? "atl-name-err" : undefined} />
              {err(tried && !name.trim(), "atl-name-err", "Please add your name.")}
            </div>
            <div>
              <label htmlFor="atl-email-in">Email</label>
              <input id="atl-email-in" type="email" autoComplete="email" placeholder="jane@company.com" required value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={tried && !emailOk ? true : undefined} aria-describedby={tried && !emailOk ? "atl-email-err" : undefined} />
              {err(tried && !emailOk, "atl-email-err", "Please enter a valid email address.")}
            </div>
          </div>
          <label htmlFor="atl-msg-in">Message</label>
          <textarea id="atl-msg-in" rows={4} placeholder="Tell me about the role / project…" required value={message} onChange={(e) => setMessage(e.target.value)} aria-invalid={tried && !message.trim() ? true : undefined} aria-describedby={tried && !message.trim() ? "atl-msg-err" : undefined} />
          {err(tried && !message.trim(), "atl-msg-err", "Please add a few words.")}
          <div className="atl-form-foot">
            <button type="submit" className="atl-btn" disabled={status === "sending"}>{status === "sending" ? "Sending…" : "Send message"}</button>
            <p role="status" aria-live="polite" className="atl-form-status">
              {status === "sent" && "Sent. Thank you, I will reply soon."}
              {status === "mailto" && "Your mail app opened with the message."}
              {status === "error" && <>Could not send. <a href={fallback}>Email me directly</a> instead.</>}
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}

export function AtlasSite() {
  const repos = useRepos(12);
  const act = useContributions();
  const rows: Row[] = useMemo(() => {
    const known = new Set(STATIC_ROWS.map((r) => r.url.toLowerCase()));
    const liveRows = repos.status === "ok"
      ? repos.data.filter((r) => !known.has(r.url.toLowerCase())).map((r) => ({ name: r.name.replace(/[-_]/g, " ").replace(/\b[a-z]/g, (c) => c.toUpperCase()), text: r.description ?? "No description on GitHub.", tag: [r.language, r.stars ? `${r.stars} star${r.stars === 1 ? "" : "s"}` : ""].filter(Boolean).join(", "), year: String(new Date(r.pushed).getFullYear()), url: r.url, live: r.homepage ?? undefined }))
      : [];
    return [...liveRows, ...STATIC_ROWS].map((r, i) => ({ ...r, n: pad(featuredProjects.length + i + 1) }));
  }, [repos]);
  return (
    <div className="atlas" data-cursor-accent="atlas">
      <a className="atl-skip" href="#atl-projects">Skip to the projects</a>
      <div className="atl-backdrop" aria-hidden="true"><Contours lines={BG} className="atl-bg-lines" /></div>
      <Bar rows={rows} />
      <main id="main">
        <TitleSheet activity={act.status === "ok" ? act.data.total : act.status === "failed" ? "failed" : null} more={rows.length} />
        <Plates />
        <More rows={rows} live={repos.status} />
        <Skills />
        <ActivitySec act={act} />
        <Route />
        <Contact />
      </main>
      <footer className="atl-foot">
        <span>© {site.name}</span>
        <a href="#atl-top">Back to the title page</a>
        <span>Surveyed from github.com/{site.githubUser} and the portfolio's own records</span>
      </footer>
    </div>
  );
}

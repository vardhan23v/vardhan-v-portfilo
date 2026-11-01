import { useRef, useState, type CSSProperties, type FormEvent, type PointerEvent } from "react";
import { Link } from "react-router-dom";
import { InterfaceSwitcher } from "../interface-switcher/InterfaceSwitcher";
import { CATEGORY_LABEL, featuredProjects, otherProjects } from "../classic/data/projects";
import { experience } from "../classic/data/experience";
import { skillCategories } from "../classic/data/skills";
import { site } from "../classic/data/site";
import { mailtoHref, sendMessage } from "../lib/contact";
import { Reveal } from "../hooks/useReveal";
import { caseStudyPath, hasCaseStudy } from "../work/links";
import { GRID_COLS, GRID_ROWS, H, W, terrain, tint } from "./terrain";
import { useContributions, useRepos, type Activity } from "./useLive";
import "./styles/atlas.css";

const T = terrain(featuredProjects.length);
const PLATES = featuredProjects.map((p, i) => ({ p, s: T.summits[i], n: String(i + 1).padStart(2, "0") }));
const RV = { failSafe: true };
const ROMAN = ["I", "II", "III", "IV", "V", "VI"];
const SHEETS = [
  ["summits", "Summits"],
  ["survey", "Survey"],
  ["elevation", "Elevation"],
  ["route", "Route"],
  ["terrain", "Terrain"],
  ["contact", "Contact"],
] as const;

const ext = { target: "_blank", rel: "noopener noreferrer" } as const;
const NewTab = () => <span className="sr-only"> (opens in a new tab)</span>;
const month = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
const host = (u: string) => u.replace(/^https?:\/\//, "").replace(/\/$/, "");

/** Paints the height field once as hypsometric tints; the SVG contours sit on top. */
function paintTint(): string | null {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = W + 1;
  c.height = H + 1;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  const img = ctx.createImageData(c.width, c.height);
  T.field.forEach((h, i) => {
    const [r, g, b] = tint(h);
    img.data.set([r, g, b, 255], i * 4);
  });
  ctx.putImageData(img, 0, 0);
  return c.toDataURL();
}

function Sheet({ id, n, title, lead, children }: { id: string; n: number; title: string; lead: string; children: React.ReactNode }) {
  return (
    <section className="at-sheet" id={id} aria-labelledby={`${id}-h`}>
      <Reveal className="at-sheet-head" options={RV}>
        <p className="at-sheet-no">Sheet {ROMAN[n]}</p>
        <h2 id={`${id}-h`}>{title}</h2>
        <p className="at-sheet-lead">{lead}</p>
      </Reveal>
      {children}
    </section>
  );
}

function TitleSheet() {
  const [tintSrc] = useState(paintTint);
  const plate = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<string | null>(null);
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = plate.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--rx", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    el.style.setProperty("--ry", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
  };
  const onLeave = () => {
    plate.current?.style.setProperty("--rx", "0");
    plate.current?.style.setProperty("--ry", "0");
  };
  return (
    <header className="at-title" id="top">
      <div className="at-title-copy">
        <p className="at-kicker">A survey of the work of</p>
        <h1 className="at-name">{site.name}</h1>
        <p className="at-role">{site.title}</p>
        <dl className="at-coords">
          <div><dt>Base camp</dt><dd>{site.location}</dd></div>
          <div><dt>Status</dt><dd>{site.availability}</dd></div>
          <div><dt>Summits</dt><dd>{featuredProjects.length} featured projects</dd></div>
        </dl>
        <p className="at-actions">
          <a className="at-btn at-btn--primary" href="#summits">Survey the work</a>
          <a className="at-btn" href={site.resume} download="sree-vardhan-v-resume.pdf">Résumé (PDF)</a>
        </p>
      </div>

      <div className="at-map-wrap">
        <div className="at-map" ref={plate} onPointerMove={onMove} onPointerLeave={onLeave}>
          <ol className="at-ticks at-ticks--x" aria-hidden="true">{[...GRID_COLS].map((c) => <li key={c}>{c}</li>)}</ol>
          <ol className="at-ticks at-ticks--y" aria-hidden="true">{Array.from({ length: GRID_ROWS }, (_, i) => <li key={i}>{i + 1}</li>)}</ol>
          <div className="at-map-inner">
            <svg className="at-terrain" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
              {tintSrc && <image href={tintSrc} x="0" y="0" width={W} height={H} preserveAspectRatio="none" className="at-tint" />}
              <g className="at-grid">
                {Array.from({ length: GRID_COLS.length - 1 }, (_, i) => <line key={`x${i}`} x1={((i + 1) * W) / GRID_COLS.length} x2={((i + 1) * W) / GRID_COLS.length} y1="0" y2={H} />)}
                {Array.from({ length: GRID_ROWS - 1 }, (_, i) => <line key={`y${i}`} y1={((i + 1) * H) / GRID_ROWS} y2={((i + 1) * H) / GRID_ROWS} x1="0" x2={W} />)}
              </g>
              <g className="at-contours">
                {T.lines.map((l) => <path key={l.level} d={l.d} className={l.index ? "is-index" : undefined} />)}
              </g>
            </svg>
            <ul className="at-summits">
              {PLATES.map(({ p, s, n }) => (
                <li key={p.slug} style={{ "--x": `${(s.x / W) * 100}%`, "--y": `${(s.y / H) * 100}%`, "--d": Number(n) * 0.06 } as CSSProperties} className={hover === p.slug ? "is-on" : undefined}>
                  <a href={`#plate-${p.slug}`} onPointerEnter={() => setHover(p.slug)} onPointerLeave={() => setHover(null)} onFocus={() => setHover(p.slug)} onBlur={() => setHover(null)}>
                    <span className="at-peak" aria-hidden="true" />
                    <span className="at-peak-label"><b>{p.name}</b><span>{s.ref} · {p.tagline}</span></span>
                    <span className="sr-only">, summit {n} at {s.ref}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="at-legend" aria-hidden="true">
            <p className="at-legend-h">Legend</p>
            <p><i className="at-key at-key--peak" /> Featured project</p>
            <p><i className="at-key at-key--index" /> Index contour</p>
            <p><i className="at-key at-key--line" /> Contour</p>
          </div>
          <div className="at-scale" aria-hidden="true"><span /><span /><span /><em>0 · 1 · 2 · 3 sheets</em></div>
          <div className="at-compass" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 2 15 13 12 11 9 13Z" /><path d="M12 22 9 13 12 15 15 13Z" className="s" /></svg><b>N</b></div>
        </div>
      </div>
    </header>
  );
}

function Plates() {
  return (
    <Sheet id="summits" n={0} title="Summits" lead={`${featuredProjects.length} featured projects, each plotted on the title sheet at its grid reference.`}>
      <ol className="at-plates">
        {PLATES.map(({ p, s, n }) => {
          const shot = p.cover ?? p.screenshots?.[0];
          return (
            <li key={p.slug} id={`plate-${p.slug}`} className="at-plate-li">
              <Reveal as="article" className="at-plate" options={RV}>
                <p className="at-plate-meta"><span>Plate {n} of {PLATES.length}</span><span>▲ {s.ref}</span><span>{CATEGORY_LABEL[p.category]}</span></p>
                {shot && (
                  <div className="at-plate-shot">
                    <img src={shot} alt={`${p.name}, screenshot of the app`} width={1440} height={900} loading="lazy" decoding="async" />
                  </div>
                )}
                <h3 className="at-plate-name">{p.name}</h3>
                <p className="at-plate-tag">{p.tagline}</p>
                <p className="at-plate-text">{p.problem}</p>
                <ul className="at-chips">{p.tech.slice(0, 6).map((t) => <li key={t}>{t}</li>)}</ul>
                <p className="at-plate-links">
                  {p.live && <a href={p.live} {...ext}>Live: {host(p.live)}<NewTab /></a>}
                  <a href={p.github} {...ext}>Source<span className="sr-only"> of {p.name} on GitHub</span><NewTab /></a>
                  {hasCaseStudy(p.slug) && <Link to={caseStudyPath(p.slug)} state={{ from: "/atlas" }} className="at-case">Case study →</Link>}
                </p>
              </Reveal>
            </li>
          );
        })}
      </ol>
    </Sheet>
  );
}

function Survey() {
  const repos = useRepos();
  return (
    <Sheet id="survey" n={1} title="Field survey" lead="The latest public repositories, read live from GitHub. Summits from Sheet I are left out.">
      {repos.status === "loading" && (
        <ul className="at-survey" aria-busy="true" aria-label="Loading repositories">
          {Array.from({ length: 6 }, (_, i) => <li key={i} className="at-skel" />)}
        </ul>
      )}
      {repos.status === "ok" && (
        <ul className="at-survey">
          {repos.data.map((r) => (
            <li key={r.url}>
              <a href={r.url} {...ext} className="at-survey-name">{r.name}<NewTab /></a>
              <p>{r.description ?? "No description on GitHub."}</p>
              <p className="at-survey-meta">
                {r.language && <span>{r.language}</span>}
                <span>★ {r.stars}</span>
                <span>Pushed {month(r.pushed)}</span>
                {r.homepage && <a href={r.homepage} {...ext}>Live<NewTab /></a>}
              </p>
            </li>
          ))}
        </ul>
      )}
      {repos.status === "failed" && (
        <>
          <p className="at-note">GitHub did not answer, so this is the offline survey from the portfolio's own records.</p>
          <ul className="at-survey">
            {otherProjects.slice(0, 9).map((r) => (
              <li key={r.github}>
                <a href={r.github} {...ext} className="at-survey-name">{r.name}<NewTab /></a>
                <p>{r.description}</p>
                <p className="at-survey-meta"><span>{r.tech.slice(0, 3).join(" · ")}</span>{r.live && <a href={r.live} {...ext}>Live<NewTab /></a>}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </Sheet>
  );
}

function Profile({ a }: { a: Activity }) {
  const max = Math.max(1, ...a.weeks.map((w) => w.count));
  const n = a.weeks.length;
  const VW = 600, VH = 140;
  const pt = (i: number) => [(i / Math.max(1, n - 1)) * VW, VH - 12 - Math.sqrt(a.weeks[i].count / max) * (VH - 28)] as const;
  const ridge = a.weeks.map((_, i) => pt(i)).map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join("");
  const peakI = a.weeks.indexOf(a.busiest);
  const [px, py] = pt(Math.max(0, peakI));
  const months = a.weeks.map((w, i) => ({ i, d: new Date(w.start) })).filter(({ d }, k, arr) => k === 0 || d.getMonth() !== arr[k - 1].d.getMonth()).filter((_, k) => k % 2 === 1);
  const dayMax = Math.max(1, ...a.days.map((d) => d.count));
  const byMonth = new Map<string, number>();
  a.days.forEach((d) => byMonth.set(d.date.slice(0, 7), (byMonth.get(d.date.slice(0, 7)) ?? 0) + d.count));
  return (
    <>
      <dl className="at-stats">
        <div><dt>Contributions, last year</dt><dd>{a.total.toLocaleString("en-GB")}</dd></div>
        <div><dt>Active days</dt><dd>{a.active}</dd></div>
        <div><dt>Longest run</dt><dd>{a.longest} days</dd></div>
        <div><dt>Busiest week</dt><dd>{a.busiest.count}, week of {month(a.busiest.start)}</dd></div>
      </dl>
      <figure className="at-profile">
        <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="at-ridge" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--at-ochre)" stopOpacity="0.55" />
              <stop offset="1" stopColor="var(--at-moss)" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((f) => <line key={f} x1="0" x2={VW} y1={VH - 12 - f * (VH - 28)} y2={VH - 12 - f * (VH - 28)} className="at-profile-grid" />)}
          <path d={`${ridge}L${VW} ${VH}L0 ${VH}Z`} fill="url(#at-ridge)" />
          <path d={ridge} className="at-profile-line" pathLength={1} />
          <path d={`M${px} ${py}l-4 7h8z`} className="at-profile-peak" />
        </svg>
        <div className="at-profile-x" aria-hidden="true">
          {months.map(({ i, d }) => <span key={i} style={{ left: `${(i / Math.max(1, n - 1)) * 100}%` }}>{d.toLocaleDateString("en-GB", { month: "short" })}</span>)}
        </div>
        <figcaption>Section: weekly totals, heights on a square-root scale. Peak marked ▲.</figcaption>
      </figure>
      <figure className="at-plan">
        <div className="at-plan-grid" aria-hidden="true">
          {a.days.map((d) => <i key={d.date} style={{ "--l": d.count ? 0.25 + 0.75 * Math.sqrt(d.count / dayMax) : 0 } as CSSProperties} />)}
        </div>
        <figcaption>Plan: one square a day, a column per week.</figcaption>
      </figure>
      <table className="sr-only">
        <caption>Contributions per month, last year</caption>
        <thead><tr><th scope="col">Month</th><th scope="col">Contributions</th></tr></thead>
        <tbody>{[...byMonth].map(([m, c]) => <tr key={m}><th scope="row">{month(`${m}-01`)}</th><td>{c}</td></tr>)}</tbody>
      </table>
    </>
  );
}

function Elevation() {
  const act = useContributions();
  if (act.status === "failed") return null;
  return (
    <Sheet id="elevation" n={2} title="Elevation profile" lead="A year of GitHub contributions, drawn in section and in plan.">
      {act.status === "loading" ? <div className="at-skel at-skel--chart" aria-busy="true" aria-label="Loading contributions" /> : <Profile a={act.data} />}
    </Sheet>
  );
}

function Route() {
  return (
    <Sheet id="route" n={3} title="Route" lead="Roles so far, newest first, as waypoints on one trail.">
      <ol className="at-route">
        {experience.map((x, i) => (
          <li key={x.company + x.role}>
            <Reveal className="at-wp" options={RV}>
              <p className="at-wp-no">Waypoint {String(i + 1).padStart(2, "0")} · {x.period}</p>
              <h3>{x.role}</h3>
              <p className="at-wp-co">{x.company}</p>
              <ul>{x.points.map((pt) => <li key={pt}>{pt}</li>)}</ul>
            </Reveal>
          </li>
        ))}
      </ol>
    </Sheet>
  );
}

function TerrainKey() {
  return (
    <Sheet id="terrain" n={4} title="Terrain key" lead="The tools I work with, grouped the way a map key groups its symbols.">
      <div className="at-keys">
        {skillCategories.map((c, i) => (
          <Reveal key={c.label} className="at-keygroup" options={RV} style={{ "--i": i, "--band": `var(--at-band-${(i % 5) + 1})` } as CSSProperties}>
            <h3><i className="at-swatch" aria-hidden="true" />{c.label}</h3>
            <ul>{c.items.map((s) => <li key={s.name}>{s.name}</li>)}</ul>
          </Reveal>
        ))}
      </div>
    </Sheet>
  );
}

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
  const err = (show: boolean, id: string, text: string) => (show ? <p className="at-err" id={id}>{text}</p> : null);
  return (
    <Sheet id="contact" n={5} title="Contact" lead={`Send word to base camp. I reply ${site.replyTime}.`}>
      <div className="at-contact">
        <div className="at-contact-direct">
          <a href={`mailto:${site.email}`} className="at-contact-mail">{site.email}</a>
          <p>
            <a href={site.github} {...ext}>GitHub<NewTab /></a>
            <a href={site.linkedin} {...ext}>LinkedIn<NewTab /></a>
            <a href={site.resume} download="sree-vardhan-v-resume.pdf">Résumé (PDF)</a>
          </p>
        </div>
        <form className="at-form" onSubmit={submit} noValidate>
          <label htmlFor="at-name">Your name</label>
          <input id="at-name" type="text" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} aria-invalid={tried && !name.trim() ? true : undefined} aria-describedby={tried && !name.trim() ? "at-name-err" : undefined} />
          {err(tried && !name.trim(), "at-name-err", "Please add your name.")}
          <label htmlFor="at-email">Your email</label>
          <input id="at-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={tried && !emailOk ? true : undefined} aria-describedby={tried && !emailOk ? "at-email-err" : undefined} />
          {err(tried && !emailOk, "at-email-err", "Please enter a valid email address.")}
          <label htmlFor="at-msg">Message</label>
          <textarea id="at-msg" rows={5} required value={message} onChange={(e) => setMessage(e.target.value)} aria-invalid={tried && !message.trim() ? true : undefined} aria-describedby={tried && !message.trim() ? "at-msg-err" : undefined} />
          {err(tried && !message.trim(), "at-msg-err", "Please add a few words.")}
          <div className="at-form-foot">
            <button type="submit" className="at-btn at-btn--primary" disabled={status === "sending"}>{status === "sending" ? "Sending…" : "Send message"}</button>
            <p role="status" aria-live="polite" className="at-form-status">
              {status === "sent" && "Sent. Thank you, I will reply soon."}
              {status === "mailto" && "Your mail app opened with the message."}
              {status === "error" && <>Could not send. <a href={fallback}>Email me directly</a> instead.</>}
            </p>
          </div>
        </form>
      </div>
    </Sheet>
  );
}

export function AtlasSite() {
  return (
    <div className="atlas" data-cursor-accent="atlas">
      <a className="at-skip" href="#main">Skip to the sheets</a>
      <nav className="at-nav" aria-label="Sheets">
        <a href="#top" className="at-brand"><b>Atlas</b> <span>· {site.name}</span></a>
        <ol className="at-index">
          {SHEETS.map(([id, label], i) => <li key={id}><a href={`#${id}`}><span aria-hidden="true">{ROMAN[i] ?? ""}</span> {label}</a></li>)}
        </ol>
        <InterfaceSwitcher current="atlas" />
      </nav>
      <TitleSheet />
      <main id="main">
        <Plates />
        <Survey />
        <Elevation />
        <Route />
        <TerrainKey />
        <Contact />
      </main>
      <footer className="at-foot">
        <p>Surveyed from <a href={site.github} {...ext}>github.com/{site.githubUser}<NewTab /></a> and the portfolio's own records.</p>
        <a href="#top">Back to the title sheet ↑</a>
      </footer>
    </div>
  );
}

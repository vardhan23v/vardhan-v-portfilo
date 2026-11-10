import { useEffect, useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { caseStudies } from "../terminal/data/work";
import { featuredProjects, CATEGORY_LABEL } from "../classic/data/projects";
import { KEY_WORK, CREDIT } from "../classic/content";
import { EDITIONS } from "../editions";
import { NotFound } from "../components/NotFound";
import { Reveal } from "../hooks/useReveal";
import { prefetchEdition } from "../lib/editionLoaders";
import { caseStudyPath } from "./links";
import "./case-study.css";

/** Old slugs → current ones, so shared links keep working. */
const LEGACY: Record<string, string> = { "code-reviewer": "ai-code-reviewer" };

/** Screenshot captions come from the file name, not from new copy. */
const SHOT_LABEL = (src: string) => (/phone/.test(src) ? "Phone" : /-2\./.test(src) ? "Desktop, second screen" : "Desktop");

/** Reveal on the first visible pixel (no dark band at the bottom while reading), and reveal
 *  anything already on screen at once, so nothing waits on the observer. */
const RV = { failSafe: true, threshold: 0, rootMargin: "0px" };
const ext = { target: "_blank", rel: "noopener noreferrer" } as const;
const NewTab = () => <span className="sr-only"> (opens in a new tab)</span>;

type CsState = { from?: string; vtDir?: "fwd" | "back" } | null;

/** Start fetching a route's code when a link to it is about to be used. */
const prefetchOn = (to: string) => {
  const go = () => prefetchEdition(to);
  return { onPointerEnter: go, onFocus: go, onTouchStart: go };
};

/** The shareable, edition-neutral case-study page for one project. */
export function CaseStudy() {
  const { slug } = useParams<{ slug: string }>();
  const idx = caseStudies.findIndex((c) => c.slug === slug);
  if (idx === -1) {
    const to = slug && LEGACY[slug];
    return to ? <Navigate to={caseStudyPath(to)} replace /> : <NotFound />;
  }
  // Keyed by slug: prev/next mounts a fresh page (header stagger, reveals, no carried-over
  // hover/pinned/lightbox state on reused nodes).
  return <Study key={caseStudies[idx].slug} idx={idx} />;
}

function Study({ idx }: { idx: number }) {
  const navigate = useNavigate();
  const { state: rawState } = useLocation();
  const state = rawState as CsState;
  const total = caseStudies.length;
  const p = caseStudies[idx];
  const prev = caseStudies[(idx - 1 + total) % total];
  const next = caseStudies[(idx + 1) % total];
  const toward = (vtDir: "fwd" | "back") => ({ ...(state ?? {}), vtDir });

  const [shot, setShot] = useState<string | null>(null);
  const shotRef = useRef<string | null>(null);
  useEffect(() => { shotRef.current = shot; }, [shot]);
  const [pinned, setPinned] = useState(false);
  const headRef = useRef<HTMLElement>(null);
  const pnRef = useRef<HTMLElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // [ and ] move between case studies, sliding in the direction of travel (Root reads vtDir).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || shotRef.current) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      const go = e.key === "[" ? { to: prev.slug, vtDir: "back" as const } : e.key === "]" ? { to: next.slug, vtDir: "fwd" as const } : null;
      if (go) navigate(caseStudyPath(go.to), { viewTransition: true, state: { ...(state ?? {}), vtDir: go.vtDir } });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev.slug, next.slug, navigate, state]);

  // Compact bar: shown once the header has scrolled away, hidden again while the bottom
  // prev/next cards are on screen (so the same links never show twice).
  useEffect(() => {
    const head = headRef.current, pn = pnRef.current;
    if (!head || !pn || typeof IntersectionObserver === "undefined") return;
    let headAbove = false, pnSeen = false;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === head) headAbove = !e.isIntersecting && e.boundingClientRect.top < 0;
        else pnSeen = e.isIntersecting;
      }
      setPinned(headAbove && !pnSeen);
    });
    io.observe(head);
    io.observe(pn);
    return () => io.disconnect();
  }, []);

  // Lightbox: a native modal dialog (focus trap, Esc, inert page, focus return for free).
  useEffect(() => {
    const d = dialogRef.current;
    if (shot && d && !d.open) d.showModal();
  }, [shot]);

  const base = featuredProjects.find((x) => x.slug === p.slug);
  const shots = base?.screenshots ?? [];
  const from = EDITIONS.find((e) => e.to === state?.from);
  const back = from ? { to: from.to, label: `Back to ${from.label}` } : { to: "/", label: "All editions" };
  const shotLabel = shot ? SHOT_LABEL(shot).toLowerCase() : "";
  const closeShot = () => dialogRef.current?.close();
  const onDialogClick = (e: ReactMouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) closeShot(); // the empty area around the image
  };

  return (
    <main className="cs" id="main" data-cursor-accent="work">
      <div className="cs-bar" data-on={pinned} inert={!pinned}>
        <span className="cs-bar-name">{p.name}</span>
        <Link to={caseStudyPath(prev.slug)} state={toward("back")} viewTransition className="cs-bar-link cs-bar-prev">
          <span aria-hidden="true">←</span>
          <span className="sr-only">Previous case study: {prev.name}</span>
        </Link>
        <Link to={caseStudyPath(next.slug)} state={toward("fwd")} viewTransition className="cs-bar-link cs-bar-next">
          <span className="cs-bar-nm">Next: {next.name}</span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      <nav className="cs-top" aria-label="Case study">
        <Link to={back.to} className="cs-back" {...prefetchOn(back.to)}>
          <span className="cs-back-arrow" aria-hidden="true">←</span>{back.label}
        </Link>
        <span className="cs-keys" aria-hidden="true"><kbd>[</kbd> <kbd>]</kbd> previous · next</span>
      </nav>

      <header className="cs-head" ref={headRef}>
        <p className="cs-kicker">Case study {p.number} of {String(total).padStart(2, "0")}{base && <> · {CATEGORY_LABEL[base.category]}</>}</p>
        <h1 className="cs-title">{p.name}</h1>
        <p className="cs-tagline">{p.tagline}</p>
        <dl className="cs-facts">
          <div><dt>Role</dt><dd>{p.role ?? "Sole builder"}</dd></div>
          <div>
            <dt>Status</dt>
            <dd>
              {p.live
                ? <><span className="cs-dot" aria-hidden="true" />Live</>
                : <><span className="cs-dot cs-dot--off" aria-hidden="true" />Source only</>}
            </dd>
          </div>
          <div><dt>Stack</dt><dd>{p.tech.length} tools</dd></div>
          {CREDIT[p.slug] && <div><dt>Context</dt><dd>{CREDIT[p.slug]}</dd></div>}
        </dl>
        <p className="cs-lead">{p.description}</p>
        <p className="cs-actions">
          {p.live && <a className="cs-btn cs-btn--primary" href={p.live} {...ext}>Open the live app<span className="cs-arrow" aria-hidden="true">↗</span><NewTab /></a>}
          <a className="cs-btn" href={p.github} {...ext}>Source on GitHub<span className="cs-arrow" aria-hidden="true">↗</span><NewTab /></a>
        </p>
      </header>

      {shots.length > 0 && (
        <section className="cs-shots" aria-label="Screenshots">
          {shots.map((src, i) => {
            const phone = /phone/.test(src);
            return (
              <Reveal as="figure" key={src} options={RV} className={`cs-shot${phone ? " cs-shot--phone" : ""}`} style={{ "--i": i } as CSSProperties}>
                <button type="button" className="cs-shot-open" aria-label={`Enlarge ${SHOT_LABEL(src).toLowerCase()} screenshot`} onClick={() => setShot(src)}>
                  <img src={src} alt={`${p.name}, ${SHOT_LABEL(src).toLowerCase()} view`} width={phone ? 390 : 1440} height={phone ? 844 : 900} loading={i === 0 ? "eager" : "lazy"} decoding="async" />
                </button>
                <figcaption>{SHOT_LABEL(src)}</figcaption>
              </Reveal>
            );
          })}
        </section>
      )}

      {shot && (
        <dialog
          ref={dialogRef}
          className={`cs-lightbox${/phone/.test(shot) ? " is-phone" : ""}`}
          aria-label={`${p.name}, ${shotLabel} screenshot`}
          onClose={() => setShot(null)}
          onClick={onDialogClick}
        >
          <img src={shot} alt={`${p.name}, ${shotLabel} view`} width={/phone/.test(shot) ? 390 : 1440} height={/phone/.test(shot) ? 844 : 900} decoding="async" />
          {/* eslint-disable-next-line jsx-a11y/no-autofocus -- the dialog's only control */}
          <button type="button" className="cs-lightbox-x" aria-label="Close" autoFocus onClick={closeShot}>×</button>
        </dialog>
      )}

      <article className="cs-body">
        <Reveal as="section" className="cs-sec" options={RV}>
          <h2>The problem</h2>
          <p>{p.problem}</p>
        </Reveal>
        <Reveal as="section" className="cs-sec" options={RV}>
          <h2>Approach</h2>
          <p>{p.approach}</p>
          {KEY_WORK[p.slug] && <p className="cs-note">{KEY_WORK[p.slug]}</p>}
        </Reveal>
        <Reveal as="section" className="cs-sec" options={RV}>
          <h2>Key decisions</h2>
          <ol className="cs-decisions">
            {p.decisions.map((d) => (
              <li key={d.title}>
                <h3>{d.title}</h3>
                <p>{d.text}</p>
              </li>
            ))}
          </ol>
        </Reveal>
        <Reveal as="section" className="cs-sec" options={RV}>
          <h2>Architecture</h2>
          <ol className="cs-arch">
            {p.architecture.map((a) => (
              <li key={a.label}>
                <b>{a.label}</b>
                {a.note && <span>{a.note}</span>}
              </li>
            ))}
          </ol>
        </Reveal>
        <Reveal as="section" className="cs-sec" options={RV}>
          <h2>Outcome</h2>
          <p className="cs-outcome">{p.outcome}</p>
        </Reveal>
        <Reveal as="section" className="cs-sec" options={RV}>
          <h2>What I learned</h2>
          <ul className="cs-learned">{p.learned.map((s) => <li key={s}>{s}</li>)}</ul>
        </Reveal>
        <Reveal as="section" className="cs-sec" options={RV}>
          <h2>Stack</h2>
          <ul className="cs-chips">{p.tech.map((t) => <li key={t}>{t}</li>)}</ul>
        </Reveal>
      </article>

      <nav className="cs-pn" aria-label="More case studies" ref={pnRef}>
        <Link to={caseStudyPath(prev.slug)} state={toward("back")} viewTransition className="cs-pn-card">
          <span className="cs-pn-dir">← Previous</span>
          <span className="cs-pn-name">{prev.name}</span>
          <span className="cs-pn-tag">{prev.tagline}</span>
        </Link>
        <Link to={caseStudyPath(next.slug)} state={toward("fwd")} viewTransition className="cs-pn-card cs-pn-card--next">
          <span className="cs-pn-dir">Next →</span>
          <span className="cs-pn-name">{next.name}</span>
          <span className="cs-pn-tag">{next.tagline}</span>
        </Link>
      </nav>

      <footer className="cs-foot">
        <Link to={`/terminal/work/${p.slug}`} {...prefetchOn(`/terminal/work/${p.slug}`)}>Read it in the terminal</Link>
        <Link to={back.to} {...prefetchOn(back.to)}>{back.label}</Link>
      </footer>
    </main>
  );
}

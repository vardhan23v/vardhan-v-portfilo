import { useEffect, type CSSProperties } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { caseStudies } from "../terminal/data/work";
import { featuredProjects, CATEGORY_LABEL } from "../classic/data/projects";
import { KEY_WORK, CREDIT } from "../classic/content";
import { EDITIONS } from "../editions";
import { NotFound } from "../components/NotFound";
import { Reveal } from "../hooks/useReveal";
import { caseStudyPath } from "./links";
import "./case-study.css";

/** Old slugs → current ones, so shared links keep working. */
const LEGACY: Record<string, string> = { "code-reviewer": "ai-code-reviewer" };

/** Screenshot captions come from the file name, not from new copy. */
const SHOT_LABEL = (src: string) => (/phone/.test(src) ? "Phone" : /-2\./.test(src) ? "Desktop, second screen" : "Desktop");

/** Reveal anything already on screen at once, so nothing waits on the observer. */
const RV = { failSafe: true };
const ext = { target: "_blank", rel: "noopener noreferrer" } as const;
const NewTab = () => <span className="sr-only"> (opens in a new tab)</span>;

/** The shareable, edition-neutral case-study page for one project. */
export function CaseStudy() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { state } = useLocation() as { state: { from?: string } | null };
  const idx = caseStudies.findIndex((c) => c.slug === slug);
  const total = caseStudies.length;
  const prev = caseStudies[(idx - 1 + total) % total];
  const next = caseStudies[(idx + 1) % total];

  // [ and ] move between case studies
  useEffect(() => {
    if (idx === -1) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      const go = e.key === "[" ? prev : e.key === "]" ? next : null;
      if (go) navigate(caseStudyPath(go.slug), { viewTransition: true, state });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, prev, next, navigate, state]);

  if (idx === -1) {
    const to = slug && LEGACY[slug];
    return to ? <Navigate to={caseStudyPath(to)} replace /> : <NotFound />;
  }

  const p = caseStudies[idx];
  const base = featuredProjects.find((x) => x.slug === p.slug);
  const shots = base?.screenshots ?? [];
  const from = EDITIONS.find((e) => e.to === state?.from);
  const back = from ? { to: from.to, label: `Back to ${from.label}` } : { to: "/", label: "All editions" };

  return (
    <main className="cs" id="main">
      <nav className="cs-top" aria-label="Case study">
        <Link to={back.to} className="cs-back">← {back.label}</Link>
        <span className="cs-keys" aria-hidden="true"><kbd>[</kbd> <kbd>]</kbd> previous · next</span>
      </nav>

      <header className="cs-head">
        <p className="cs-kicker">Case study {p.number} of {String(total).padStart(2, "0")}{base && <> · {CATEGORY_LABEL[base.category]}</>}</p>
        <h1 className="cs-title">{p.name}</h1>
        <p className="cs-tagline">{p.tagline}</p>
        <dl className="cs-facts">
          <div><dt>Role</dt><dd>{p.role ?? "Sole builder"}</dd></div>
          <div><dt>Status</dt><dd>{p.live ? "Live" : "Source only"}</dd></div>
          <div><dt>Stack</dt><dd>{p.tech.length} tools</dd></div>
          {CREDIT[p.slug] && <div><dt>Context</dt><dd>{CREDIT[p.slug]}</dd></div>}
        </dl>
        <p className="cs-lead">{p.description}</p>
        <p className="cs-actions">
          {p.live && <a className="cs-btn cs-btn--primary" href={p.live} {...ext}>Open the live app<NewTab /></a>}
          <a className="cs-btn" href={p.github} {...ext}>Source on GitHub<NewTab /></a>
        </p>
      </header>

      {shots.length > 0 && (
        <section className="cs-shots" aria-label="Screenshots">
          {shots.map((src, i) => {
            const phone = /phone/.test(src);
            return (
              <Reveal as="figure" key={src} options={RV} className={`cs-shot${phone ? " cs-shot--phone" : ""}`} style={{ "--i": i } as CSSProperties}>
                <img src={src} alt={`${p.name}, ${SHOT_LABEL(src).toLowerCase()} view`} width={phone ? 390 : 1440} height={phone ? 844 : 900} loading={i === 0 ? "eager" : "lazy"} decoding="async" />
                <figcaption>{SHOT_LABEL(src)}</figcaption>
              </Reveal>
            );
          })}
        </section>
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

      <nav className="cs-pn" aria-label="More case studies">
        <Link to={caseStudyPath(prev.slug)} state={state} viewTransition className="cs-pn-card">
          <span className="cs-pn-dir">← Previous</span>
          <span className="cs-pn-name">{prev.name}</span>
          <span className="cs-pn-tag">{prev.tagline}</span>
        </Link>
        <Link to={caseStudyPath(next.slug)} state={state} viewTransition className="cs-pn-card cs-pn-card--next">
          <span className="cs-pn-dir">Next →</span>
          <span className="cs-pn-name">{next.name}</span>
          <span className="cs-pn-tag">{next.tagline}</span>
        </Link>
      </nav>

      <footer className="cs-foot">
        <Link to={`/terminal/work/${p.slug}`}>Read it in the terminal</Link>
        <Link to={back.to}>{back.label}</Link>
      </footer>
    </main>
  );
}

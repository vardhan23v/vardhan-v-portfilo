import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type Dispatch, type MouseEvent, type SetStateAction } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EDITIONS, type Edition } from "../editions";
import { Skin } from "./skins";
import { useTilt } from "../hooks/useTilt";
import { useMagnetic } from "../hooks/useMagnetic";
import { useGithub } from "../hooks/useGithub";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { site } from "../classic/data/site";
import { featuredProjects } from "../classic/data/projects";
import { experience } from "../classic/data/experience";
import { skillCategories } from "../classic/data/skills";
import "./Landing.css";
import { MotionToggle } from "../components/MotionToggle";

const STAGE_INTERVAL_MS = 4200;
const PORTAL_GROW_MS = 60;
const PORTAL_HOLD_MS = 640;
const PORTAL_CLEAR_MS = 400;

/** Headline stack for the marquee: AI/LLM, frontend and backend first; tooling stays on the Skills pages. */
const MARQUEE = [...new Set(
  skillCategories
    .filter((c) => !/tools|cloud/i.test(c.label))
    .flatMap((c) => c.items.map((i) => i.name))
)];

const [FIRST, LAST] = [site.name.split(" ").slice(0, -1).join(" "), site.name.split(" ").slice(-1)[0]];

/* ── hooks ─────────────────────────────────────────────────── */

function useIstClock() {
  const [t, setT] = useState("");
  useEffect(() => {
    const tick = () => setT(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" }));
    tick();
    const i = window.setInterval(tick, 30_000);
    return () => window.clearInterval(i);
  }, []);
  return t;
}

/** Adds `.is-in` to reveal targets inside `root` once they scroll into view (fail-safe for in-view mounts). */
function useRevealOnScroll(root: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const targets = el.querySelectorAll<HTMLElement>("[data-reveal]");
    const vh = window.innerHeight;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    }, { threshold: 0.12, rootMargin: "0px 0px -4% 0px" });
    targets.forEach((t) => { if (t.getBoundingClientRect().top < vh) t.classList.add("is-in"); else io.observe(t); });
    return () => io.disconnect();
  }, [root]);
}

/** Masthead parallax + pointer-driven wallpaper offset, written as CSS custom properties. */
function useWallpaperParallax(root: React.RefObject<HTMLElement | null>, head: React.RefObject<HTMLElement | null>, reduced: boolean) {
  useEffect(() => {
    const rootEl = root.current;
    const headEl = head.current;
    if (!rootEl || reduced) return;
    let raf = 0;
    const onScroll = () => {
      if (!headEl) return;
      const y = Math.min(window.scrollY, 500);
      headEl.style.opacity = String(1 - y / 520);
      headEl.style.transform = `translateY(${y * 0.16}px)`;
    };
    const onMove = (e: PointerEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        rootEl.style.setProperty("--px", (e.clientX / window.innerWidth - 0.5).toFixed(3));
        rootEl.style.setProperty("--py", (e.clientY / window.innerHeight - 0.5).toFixed(3));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
      if (headEl) { headEl.style.opacity = ""; headEl.style.transform = ""; }
    };
  }, [root, head, reduced]);
}

interface Portal { ed: Edition; x: number; y: number; w: number; h: number; phase: "grow" | "hold" }

/** Card → page transition: the clicked preview swells to fill the viewport, then we navigate.
 *  Always navigates; the visual is skipped for reduced motion and modifier clicks. */
function usePortal(reduced: boolean) {
  const navigate = useNavigate();
  const [portal, setPortal] = useState<Portal | null>(null);
  const busy = useRef(false);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const enter = useCallback((ed: Edition, fromEl?: HTMLElement | null) => {
    if (busy.current) return;
    if (reduced) { navigate(ed.to, { viewTransition: true }); return; }
    busy.current = true;
    const r = fromEl?.getBoundingClientRect();
    const rect = r && r.width > 0
      ? { x: r.left, y: r.top, w: r.width, h: r.height }
      : { x: window.innerWidth / 2 - 160, y: window.innerHeight / 2 - 100, w: 320, h: 200 };
    setPortal({ ed, ...rect, phase: "grow" });
    timers.current.push(
      window.setTimeout(() => setPortal((p) => (p ? { ...p, phase: "hold" } : p)), PORTAL_GROW_MS),
      window.setTimeout(() => {
        navigate(ed.to, { viewTransition: true });
        timers.current.push(window.setTimeout(() => { setPortal(null); busy.current = false; }, PORTAL_CLEAR_MS));
      }, PORTAL_HOLD_MS),
    );
  }, [navigate, reduced]);

  /** Link click: let modifier-clicks (new tab) through untouched. */
  const onLinkClick = useCallback((e: MouseEvent<HTMLElement>, ed: Edition, fromEl?: HTMLElement | null) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    enter(ed, fromEl);
  }, [enter]);

  return { portal, enter, onLinkClick };
}

/* ── components ────────────────────────────────────────────── */

function PortalOverlay({ p }: { p: Portal }) {
  const style = { "--px": `${p.x}px`, "--py": `${p.y}px`, "--pw": `${p.w}px`, "--ph": `${p.h}px` } as CSSProperties;
  return (
    <div className={`ed-portal ed-portal--${p.ed.tone} is-${p.phase}`} style={style} aria-hidden="true">
      <div className="ed-portal__card">
        <span className="ed-portal__num">{p.ed.num}</span>
        <span className="ed-portal__name">{p.ed.label}</span>
        <span className="ed-portal__hint">entering…</span>
      </div>
    </div>
  );
}

function EditionStage({ index, setIndex, reduced, onEnter }: {
  index: number;
  setIndex: Dispatch<SetStateAction<number>>;
  reduced: boolean;
  onEnter: (e: MouseEvent<HTMLElement>, ed: Edition, el: HTMLElement) => void;
}) {
  const [hovering, setHovering] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const paused = hovering || userPaused;
  const panelId = useId();
  const tabsRef = useRef<HTMLDivElement>(null);
  const ed = EDITIONS[index];

  useEffect(() => {
    if (paused || reduced) return;
    const t = window.setInterval(() => setIndex((i) => (i + 1) % EDITIONS.length), STAGE_INTERVAL_MS);
    return () => window.clearInterval(t);
  }, [paused, reduced, index, setIndex]);

  const focusTab = (i: number) => tabsRef.current?.querySelectorAll<HTMLButtonElement>("[role=tab]")[i]?.focus();
  const onTabKey = (e: React.KeyboardEvent) => {
    const n = EDITIONS.length;
    let next: number | null = null;
    if (e.key === "ArrowRight") next = (index + 1) % n;
    else if (e.key === "ArrowLeft") next = (index + n - 1) % n;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    if (next === null) return;
    e.preventDefault();
    setIndex(next);
    focusTab(next);
  };

  return (
    <div
      className={`stage-frame${paused ? " is-paused" : ""}`}
      style={{ "--stage-interval": `${STAGE_INTERVAL_MS}ms` } as CSSProperties}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHovering(false); }}
      aria-roledescription="carousel"
      aria-label="Live preview of the six portfolio editions"
    >
      <div className="stage-bar">
        <span className="stage-dot r" /><span className="stage-dot y" /><span className="stage-dot g" />
        <span className="stage-url" aria-hidden="true">{site.host}{ed.to}</span>
        <span className="stage-count" aria-hidden="true">{ed.num} / 06</span>
      </div>
      <Link
        to={ed.to}
        id={panelId}
        role="tabpanel"
        aria-live="polite"
        className="stage-screen"
        aria-label={`Open the ${ed.label} edition`}
        onClick={(e) => onEnter(e, ed, e.currentTarget)}
      >
        {EDITIONS.map((s, i) => (
          <div key={s.to} className={`stage-skin stage-${s.tone}${i === index ? " is-active" : ""}`} aria-hidden="true">
            <Skin tone={s.tone} size="stage" />
          </div>
        ))}
        <span className="stage-enter" aria-hidden="true">enter {ed.label} →</span>
      </Link>
      <div className="stage-foot">
        <div className="stage-segments" role="tablist" aria-label="Choose edition preview" ref={tabsRef} onKeyDown={onTabKey}>
          {EDITIONS.map((s, i) => (
            <button
              key={s.to}
              type="button"
              role="tab"
              id={`stage-tab-${s.tone}`}
              aria-selected={i === index}
              aria-controls={panelId}
              aria-label={`Preview ${s.label}`}
              tabIndex={i === index ? 0 : -1}
              className={`stage-seg${i === index ? " is-active" : ""}`}
              onClick={() => setIndex(i)}
            >
              <i key={i === index ? `${s.to}-on` : s.to} />
            </button>
          ))}
        </div>
        <button type="button" className="stage-pause" onClick={() => setUserPaused((p) => !p)} aria-pressed={userPaused} aria-label={userPaused ? "Resume preview rotation" : "Pause preview rotation"}>
          {userPaused ? "▶" : "❚❚"}
        </button>
        <span className="stage-tone" aria-hidden="true">{ed.label} · {ed.role}</span>
      </div>
    </div>
  );
}

function EditionCard({ ed, keyNum, onClick }: { ed: Edition; keyNum: string; onClick: (e: MouseEvent<HTMLElement>, ed: Edition, el: HTMLElement | null) => void }) {
  const ref = useTilt<HTMLDivElement>(5, ".edition-card");
  const previewRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} className="edition-tilt" role="listitem" data-reveal>
      <Link to={ed.to} viewTransition className={`edition-card ed-${ed.tone}`} aria-label={`Open the ${ed.label} edition — ${ed.role}`} data-cursor={ed.tone} onClick={(e) => onClick(e, ed, previewRef.current)}>
        <kbd className="ed-key" aria-hidden="true">{keyNum}</kbd>
        <div className="ed-preview" ref={previewRef} aria-hidden="true"><Skin tone={ed.tone} size="mini" /></div>
        <div className="ed-meta">
          <span className="ed-num" aria-hidden="true">{ed.num}</span>
          <h3>{ed.label}</h3>
          <span className="ed-role">{ed.role}</span>
          <p>{ed.blurb}</p>
          <span className="ed-cta">{ed.cta} <span aria-hidden="true">→</span></span>
        </div>
      </Link>
    </div>
  );
}

function Stat({ value, label, href, loading }: { value: number; label: string; href?: string; loading?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el || loading) return;
    let raf = 0;
    const io = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting) return;
      io.disconnect();
      if (reduced) { el.textContent = String(value).padStart(2, "0"); return; }
      const t0 = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / 1100);
        el.textContent = String(Math.round((1 - Math.pow(1 - p, 3)) * value)).padStart(2, "0");
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [value, reduced, loading]);
  const body = (
    <>
      <span className="land-stat-num" ref={ref}>{loading ? "··" : "00"}</span>
      <span className="land-stat-label">{label}</span>
    </>
  );
  return href
    ? <a className="land-stat land-stat--link" href={href} target="_blank" rel="noopener">{body}<span className="sr-only"> (opens GitHub in a new tab)</span></a>
    : <div className="land-stat">{body}</div>;
}

/* ── page ──────────────────────────────────────────────────── */

export function Landing() {
  const [index, setIndex] = useState(0);
  const reduced = usePrefersReducedMotion();
  const ist = useIstClock();
  const gh = useGithub();
  const rootRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const { portal, enter, onLinkClick } = usePortal(reduced);

  useEffect(() => { window.scrollTo(0, 0); }, []);
  useRevealOnScroll(rootRef);
  useWallpaperParallax(rootRef, headRef, reduced);
  useMagnetic(".l-cta", 0.25, 10);

  // 1–6 on the landing: run the portal from the matching card, then enter (works under reduced motion too).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      const n = Number(e.key);
      if (n >= 1 && n <= EDITIONS.length) {
        e.stopImmediatePropagation();
        const ed = EDITIONS[n - 1];
        const card = cardsRef.current?.querySelector<HTMLElement>(`.ed-${ed.tone} .ed-preview`) ?? null;
        enter(ed, card);
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [enter]);

  const live = featuredProjects.filter((p) => p.live).length;
  const current = EDITIONS[index];

  return (
    <div ref={rootRef} className={`landing-root${portal ? " is-leaving" : ""}`} data-tone={current.tone}>
      {portal && <PortalOverlay p={portal} />}
      <div className="land-wall" aria-hidden="true"><i className="a" /><i className="b" /><i className="c" /><i className="grain" /></div>

      <header className="landing-top" data-reveal>
        <span className="lt-mark">✦ <em>{site.name}</em></span>
        <nav className="lt-nav" aria-label="Quick links">
          <a href="#work">Work</a>
          <a href="#editions">Editions</a>
          <a href={site.github} target="_blank" rel="noopener">GitHub<span className="sr-only"> (opens in a new tab)</span> ↗</a>
          <a href={`mailto:${site.email}`} className="lt-hire">Hire me</a>
        </nav>
      </header>

      <main className="landing-main" id="main">
        <section className="landing-head" ref={headRef} aria-labelledby="landing-h1">
          <div className="hero-grid">
            <div className="hero-copy">
              <p className="landing-dateline">
                <span><span className="sr-only">Local time </span>{ist || "--:--"} IST</span>
                <span>{site.location.split(",")[0]}</span>
                <span>{site.availability}</span>
              </p>
              <h1 className="landing-title" id="landing-h1">
                {FIRST} <em>{LAST}</em>
              </h1>
              <p className="landing-tagline" aria-hidden="true">One body of work. <em>Six ways in.</em></p>
              <p className="landing-what">
                <b>{site.title}.</b> I build AI-powered products, developer tools and full-stack systems — and ship them open-source.
              </p>
              <div className="landing-ctas">
                <a className="l-cta l-cta-primary" href="#work">See the work <span aria-hidden="true">→</span></a>
                <a className="l-cta" href={site.resume} target="_blank" rel="noopener">Resume<span className="sr-only"> (PDF, opens in a new tab)</span> <span aria-hidden="true">↗</span></a>
                <a className="l-cta l-cta-ghost" href="#editions">Pick an interface <span aria-hidden="true">↓</span></a>
              </div>
              <div className="landing-pipeline" aria-hidden="true">
                <span>frontend</span><i>→</i><span>api</span><i>→</i><span>database</span><i>→</i><span>llm</span><i>→</i><span>product</span>
              </div>
            </div>
            <div className="hero-stage">
              <EditionStage index={index} setIndex={setIndex} reduced={reduced} onEnter={onLinkClick} />
            </div>
          </div>
          <div className="landing-scroll" aria-hidden="true"><i /></div>
        </section>

        <div className="land-marquee" aria-hidden="true">
          <div className="land-marquee-track">
            {[0, 1].map((k) => (
              <span className="land-marquee-group" key={k}>
                {MARQUEE.map((n) => (<span className="land-marquee-item" key={n}>{n}<i /></span>))}
              </span>
            ))}
          </div>
        </div>

        <section className="land-stats" data-reveal aria-label="By the numbers">
          <Stat value={featuredProjects.length} label="featured projects" />
          <Stat value={live} label="live deployments" />
          <Stat value={gh.repos} label="public repos" href={site.github} loading={gh.loading} />
          <Stat value={experience.length} label="roles & internships" />
        </section>

        <section className="land-projects" id="work" data-reveal aria-labelledby="work-h2">
          <div className="section-head">
            <span className="section-kicker">index</span>
            <h2 className="section-title" id="work-h2">Selected <em>work.</em></h2>
            <p className="section-sub">{featuredProjects.length} featured projects, {live} of them live. Every one ships with source.</p>
          </div>
          <div className="land-ledger">
            {featuredProjects.map((p, i) => (
              <a key={p.slug} className="land-row" style={{ "--i": i, "--pa": p.accent[0], "--pb": p.accent[2] } as CSSProperties} href={p.live ?? p.github} target="_blank" rel="noopener">
                <span className="lr-n">{String(i + 1).padStart(2, "0")}</span>
                <span className="lr-emoji" aria-hidden="true">{p.emoji}</span>
                <span className="lr-main"><span className="lr-name">{p.name}</span><span className="lr-tag">{p.tagline}</span></span>
                <span className="lr-tech">{p.tech.slice(0, 3).join(" · ")}</span>
                <span className={`lr-status${p.live ? " is-live" : ""}`}>{p.live ? "live" : "source"}<span className="sr-only">, opens in a new tab</span></span>
                <span className="lr-arrow" aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </section>

        <section className="editions" id="editions" aria-labelledby="editions-h2">
          <div className="section-head" data-reveal>
            <span className="section-kicker">contents</span>
            <h2 className="section-title" id="editions-h2">Same work, <em>six interfaces.</em></h2>
            <p className="section-sub">Every edition has the same projects, experience and contact — pick the one that suits how you read. Press <kbd>1</kbd>–<kbd>6</kbd> from any page to switch.</p>
          </div>
          <div className="edition-grid" role="list" aria-label="Portfolio editions" ref={cardsRef}>
            {EDITIONS.map((e, i) => (
              <EditionCard key={e.to} ed={e} keyNum={String(i + 1)} onClick={onLinkClick} />
            ))}
          </div>
        </section>

        <p className="landing-note" data-reveal>{site.tagline}</p>
      </main>

      <footer className="landing-foot" data-reveal>
        <span>© 2026 {site.name} · {site.location.split(",").slice(0, 1)}, India</span>
        <span className="landing-links">
          <a href={site.github} target="_blank" rel="noopener">GitHub</a>
          <a href={site.linkedin} target="_blank" rel="noopener">LinkedIn</a>
          <a href={`mailto:${site.email}`}>{site.email}</a>
          <MotionToggle className="landing-motion" />
        </span>
      </footer>
    </div>
  );
}

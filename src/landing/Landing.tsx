import { type ReactNode, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Link, useNavigate } from "react-router-dom";
import { InterfaceSwitcher } from "../interface-switcher/InterfaceSwitcher";
import { useTilt } from "../hooks/useTilt";
import { site } from "../classic/data/site";
import { featuredProjects } from "../classic/data/projects";
import { experience } from "../classic/data/experience";
import { skillCategories } from "../classic/data/skills";

const STATS = [
  { value: featuredProjects.length, label: "shipped products" },
  { value: 6, label: "interfaces, one portfolio" },
  { value: experience.length, label: "roles & internships" },
  { value: skillCategories.reduce((s, c) => s + c.items.length, 0), label: "stack technologies" },
];

const SKILL_NAMES = [...new Set(skillCategories.flatMap((c) => c.items.map((i) => i.name)))];
const STAGE_INTERVAL = 4200;

const EDITIONS = [
  {
    to: "/terminal", label: "Terminal", url: "vardhan.dev/terminal", tone: "term", num: "01", role: "developer",
    blurb: "A fully interactive shell — type commands, read man pages, browse the work like a file system.",
    cta: "Enter the shell",
    skin: (
      <div className="stage-term" aria-hidden="true">
        <p>$ vardhan build --ai</p>
        <p className="dim">▸ initializing llm…</p>
        <p className="dim">▸ wiring react + node…</p>
        <p className="ok">✓ shipped <i /></p>
      </div>
    ),
    mini: (
      <div className="mini-term" aria-hidden="true">
        <div className="mini-body">
          <div className="l-prompt">$ vardhan build --ai</div>
          <div className="l-ok">✓ shipped</div>
          <div className="l-cursor" />
        </div>
      </div>
    ),
  },
  {
    to: "/classic", label: "Classic", url: "vardhan.dev/classic", tone: "classic", num: "02", role: "professional",
    blurb: "The original — animated build terminal, project grid, GitHub stats, and the full journey.",
    cta: "Open the original",
    skin: (
      <div className="stage-classic" aria-hidden="true">
        <div className="sc-name">VARDHAN<span className="sc-dot">.</span>V</div>
        <div className="sc-grid"><span /><span /><span /><span /></div>
      </div>
    ),
    mini: (
      <div className="mini-classic" aria-hidden="true">
        <div className="mc-name">VARDHAN<span className="mc-dot">.</span>V</div>
        <div className="mc-role">generative-ai :: full-stack</div>
      </div>
    ),
  },
  {
    to: "/paper", label: "Paper", url: "vardhan.dev/paper", tone: "paper", num: "03", role: "editorial",
    blurb: "Light editorial — serif headlines, magazine layout, quiet and readable. The same work, beautifully printed.",
    cta: "Open the paper",
    skin: (
      <div className="stage-paper" aria-hidden="true">
        <p className="sp-name">Sree Vardhan<br /><em>Vardhan V.</em></p>
        <div className="sp-rule" />
        <p className="sp-line" />
        <p className="sp-line short" />
      </div>
    ),
    mini: (
      <div className="mini-paper" aria-hidden="true">
        <div className="mp-name">Sree Vardhan<br /><span className="mp-it">Vardhan V.</span></div>
        <div className="mp-rule" />
        <div className="mp-line" />
        <div className="mp-line short" />
      </div>
    ),
  },
  {
    to: "/aurora", label: "Aurora", url: "vardhan.dev/aurora", tone: "aurora", num: "04", role: "visual",
    blurb: "Glassmorphism — frosted panels floating over drifting pastel auroras. Premium, soft, luminous.",
    cta: "Step into the light",
    skin: (
      <div className="stage-aurora" aria-hidden="true">
        <span className="sa-blob pink" /><span className="sa-blob cyan" />
        <p className="sa-name">Sree Vardhan <em>V.</em></p>
        <span className="sa-chip">generative-ai · full-stack</span>
      </div>
    ),
    mini: (
      <div className="mini-aurora" aria-hidden="true">
        <span className="ma-blob pink" /><span className="ma-blob cyan" />
        <div className="ma-name">Sree Vardhan <span className="ma-it">V.</span></div>
        <div className="ma-chip">glass · light · gradient</div>
      </div>
    ),
  },
  {
    to: "/forge", label: "Forge", url: "vardhan.dev/forge", tone: "forge", num: "05", role: "builder",
    blurb: "Editorial dark — Kanit headlines, stacked project cards, and a quiet premium engineering tone.",
    cta: "Enter the forge",
    skin: (
      <div className="stage-forge" aria-hidden="true">
        <p className="sf-name">Sree Vardhan <span className="sf-dot">V.</span></p>
        <div className="sf-rule" />
        <p className="sf-head">Where code meets intelligence.</p>
        <div className="sf-pipe"><span>frontend</span><i>→</i><span>api</span><i>→</i><span>llm</span><i>→</i><span>ship</span></div>
      </div>
    ),
    mini: (
      <div className="mini-forge" aria-hidden="true">
        <div className="mf-name">Sree Vardhan <span className="mf-dot">V.</span></div>
        <div className="mf-rule" />
        <div className="mf-head">Where code meets intelligence.</div>
        <div className="mf-pipe"><span>frontend</span><i>→</i><span>api</span><i>→</i><span>llm</span><i>→</i><span>product</span></div>
      </div>
    ),
  },
  {
    to: "/mac", label: "macOS", url: "vardhan.dev/mac", tone: "mac", num: "06", role: "application",
    blurb: "Dark-glass desktop — boot screen, draggable icons, Launchpad, Mission Control, widgets, Spotlight, Finder and Terminal.",
    cta: "Open the application",
    skin: (
      <div className="stage-mac" aria-hidden="true">
        <div className="sm-menubar"><span>✦</span><em>Vardhan — Overview</em></div>
        <div className="sm-window">
          <div className="sm-bar"><span className="sm-dot r" /><span className="sm-dot y" /><span className="sm-dot g" /><span className="sm-title">VARDHAN — OVERVIEW</span></div>
          <div className="sm-body"><div className="sm-name">Sree Vardhan <i>V</i></div><div className="sm-line" /><div className="sm-line short" /><div className="sm-card" /></div>
        </div>
        <div className="sm-dock"><span /><span /><span /><span /><span /><span /></div>
      </div>
    ),
    mini: (
      <div className="mini-mac" aria-hidden="true">
        <div className="mm-bar"><span className="mm-dot r" /><span className="mm-dot y" /><span className="mm-dot g" /></div>
        <div className="mm-body"><div className="mm-name">Vardhan <i>V</i></div><div className="mm-line" /><div className="mm-line short" /></div>
        <div className="mm-dock"><span /><span /><span /><span /><span /></div>
      </div>
    ),
  },
];

type Portal = { to: string; tone: string; label: string; num: string; x: number; y: number; w: number; h: number; phase: "grow" | "hold" };

/** Card → page transition: the clicked preview swells to fill the viewport, then we navigate. */
function usePortal() {
  const navigate = useNavigate();
  const [portal, setPortal] = useState<Portal | null>(null);
  const busy = useRef(false);
  const go = (e: React.MouseEvent | null, ed: { to: string; tone: string; label: string; num: string }, fromEl?: HTMLElement | null) => {
    if (busy.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || e?.metaKey || e?.ctrlKey || e?.shiftKey) return; // let the Link handle it
    e?.preventDefault();
    busy.current = true;
    const el = fromEl ?? (e?.currentTarget as HTMLElement | null);
    const r = el?.getBoundingClientRect();
    const rect = r && r.width > 0
      ? { x: r.left, y: r.top, w: r.width, h: r.height }
      : { x: window.innerWidth / 2 - 160, y: window.innerHeight / 2 - 100, w: 320, h: 200 };
    setPortal({ ...ed, ...rect, phase: "grow" });
    window.setTimeout(() => setPortal((p) => (p ? { ...p, phase: "hold" } : p)), 60);
    window.setTimeout(() => {
      navigate(ed.to, { viewTransition: true });
      window.setTimeout(() => { setPortal(null); busy.current = false; }, 400);
    }, 640);
  };
  return { portal, go };
}

function PortalOverlay({ p }: { p: Portal }) {
  const style = { "--px": `${p.x}px`, "--py": `${p.y}px`, "--pw": `${p.w}px`, "--ph": `${p.h}px` } as CSSProperties;
  return (
    <div className={`ed-portal ed-portal--${p.tone} is-${p.phase}`} style={style} aria-hidden="true">
      <div className="ed-portal__card">
        <span className="ed-portal__num">{p.num}</span>
        <span className="ed-portal__name">{p.label}</span>
        <span className="ed-portal__hint">entering…</span>
      </div>
    </div>
  );
}

function useIst() {
  const [t, setT] = useState("");
  useEffect(() => {
    const tick = () => setT(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" }));
    tick();
    const i = window.setInterval(tick, 30000);
    return () => window.clearInterval(i);
  }, []);
  return t;
}

function EditionStage({ index, setIndex, onEnter }: { index: number; setIndex: (f: (i: number) => number) => void; onEnter: (e: React.MouseEvent, ed: (typeof EDITIONS)[number]) => void }) {
  const [paused, setPaused] = useState(false);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (paused || reduced) return;
    const t = window.setInterval(() => setIndex((i) => (i + 1) % EDITIONS.length), STAGE_INTERVAL);
    return () => window.clearInterval(t);
  }, [paused, reduced, index, setIndex]);

  const ed = EDITIONS[index];
  return (
    <div
      className="stage-frame"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      tabIndex={0}
      role="group"
      aria-label="Live preview of the six portfolio editions. Use left and right arrows to switch."
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") setIndex((i) => (i + 1) % EDITIONS.length);
        if (e.key === "ArrowLeft") setIndex((i) => (i + EDITIONS.length - 1) % EDITIONS.length);
      }}
    >
      <div className="stage-bar">
        <span className="stage-dot r" /><span className="stage-dot y" /><span className="stage-dot g" />
        <span className="stage-url" aria-hidden="true">{ed.url}</span>
        <span className="stage-count" aria-hidden="true">{ed.num} / 06</span>
      </div>
      <Link to={ed.to} className="stage-screen" aria-label={`Open the ${ed.label} interface`} onClick={(e) => onEnter(e, ed)}>
        {EDITIONS.map((s, i) => (
          <div key={s.to} className={`stage-skin stage-${s.tone}${i === index ? " is-active" : ""}`}>{s.skin}</div>
        ))}
        <span className="stage-enter" aria-hidden="true">enter {ed.label} →</span>
      </Link>
      <div className="stage-foot">
        <div className="stage-segments" role="tablist" aria-label="Choose edition preview">
          {EDITIONS.map((s, i) => (
            <button key={s.to} type="button" role="tab" aria-selected={i === index} aria-label={`Preview ${s.label}`} className={`stage-seg${i === index ? " is-active" : ""}`} onClick={() => setIndex(() => i)}>
              <i key={i === index ? `${s.to}-${i}` : s.to} />
            </button>
          ))}
        </div>
        <span className="stage-tone" aria-hidden="true">{ed.label.toLowerCase()} · {ed.role}</span>
      </div>
    </div>
  );
}

function EditionCard({ to, label, tone, keyNum, children, onClick }: { to: string; label: string; tone: string; keyNum: string; children: ReactNode; onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void }) {
  const ref = useTilt<HTMLDivElement>(5, ".edition-card");
  return (
    <div ref={ref} className="edition-tilt" role="listitem">
      <Link to={to} viewTransition className={`edition-card ed-${tone}`} aria-label={label} data-cursor={tone} onClick={onClick}>
        <kbd className="ed-key" aria-hidden="true">{keyNum}</kbd>
        {children}
      </Link>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting) return;
      io.disconnect();
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { el.textContent = String(value).padStart(2, "0"); return; }
      const t0 = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / 1100);
        el.textContent = String(Math.round((1 - Math.pow(1 - p, 3)) * value)).padStart(2, "0");
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [value]);
  return (
    <div className="land-stat">
      <span className="land-stat-num" ref={ref}>00</span>
      <span className="land-stat-label">{label}</span>
    </div>
  );
}

export function Landing() {
  const [index, setIndex] = useState(0);
  const ist = useIst();
  const { portal, go } = usePortal();

  // 1–6 on the landing page: flash the edition then enter (global shortcut is replaced here).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      const n = Number(e.key);
      if (n >= 1 && n <= 6) {
        e.stopImmediatePropagation();
        const ed = EDITIONS[n - 1];
        const card = document.querySelector<HTMLElement>(`.edition-card.ed-${ed.tone} .ed-preview`);
        go(null, ed, card);
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [go]);
  const [first, last] = [site.name.split(" ").slice(0, -1).join(" "), site.name.split(" ").slice(-1)[0]];

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // reveal on scroll (fail-safe for elements already in view)
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".edition-tilt, [data-land-reveal]");
    const vh = window.innerHeight;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    }, { threshold: 0.12, rootMargin: "0px 0px -4% 0px" });
    els.forEach((el) => { const r = el.getBoundingClientRect(); if (r.top < vh) el.classList.add("is-in"); else io.observe(el); });
    return () => io.disconnect();
  }, []);

  // masthead parallax + pointer-driven wallpaper
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const head = document.querySelector<HTMLElement>(".landing-head");
    const root = document.querySelector<HTMLElement>(".landing-root");
    const onScroll = () => {
      if (head && !reduced) {
        const y = Math.min(window.scrollY, 500);
        head.style.opacity = String(1 - y / 520);
        head.style.transform = `translateY(${y * 0.16}px)`;
      }
    };
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      if (reduced || !root || raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        root.style.setProperty("--px", (e.clientX / window.innerWidth - 0.5).toFixed(3));
        root.style.setProperty("--py", (e.clientY / window.innerHeight - 0.5).toFixed(3));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("pointermove", onMove); cancelAnimationFrame(raf); };
  }, []);

  // magnetic CTAs
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cleanups = [...document.querySelectorAll<HTMLElement>(".l-cta")].map((btn) => {
      const onMove = (e: MouseEvent) => {
        const r = btn.getBoundingClientRect();
        if (!r.width) return;
        btn.style.setProperty("--mx", `${(((e.clientX - (r.left + r.width / 2)) / r.width) * 10).toFixed(2)}px`);
        btn.style.setProperty("--my", `${(((e.clientY - (r.top + r.height / 2)) / r.height) * 7).toFixed(2)}px`);
      };
      const reset = () => { btn.style.removeProperty("--mx"); btn.style.removeProperty("--my"); };
      btn.addEventListener("mousemove", onMove);
      btn.addEventListener("mouseleave", reset);
      return () => { btn.removeEventListener("mousemove", onMove); btn.removeEventListener("mouseleave", reset); };
    });
    return () => cleanups.forEach((f) => f());
  }, []);

  const current = EDITIONS[index];

  return (
    <div className={`landing-root${portal ? " is-leaving" : ""}`} data-tone={current.tone}>
      {portal && <PortalOverlay p={portal} />}
      <div className="land-wall" aria-hidden="true"><i className="a" /><i className="b" /><i className="c" /><i className="grain" /></div>

      <header className="landing-top" data-land-reveal>
        <span className="lt-mark">✦ <em>{site.name}</em></span>
        <nav className="lt-nav" aria-label="Quick links">
          <a href="#editions">Editions</a>
          <a href="#work">Work</a>
          <a href={site.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
          <a href={`mailto:${site.email}`} className="lt-hire">Hire me</a>
        </nav>
      </header>

      <main className="landing-main">
        <section className="landing-head">
          <div className="hero-grid">
            <div className="hero-copy">
              <p className="landing-dateline">
                <span>{ist || "--:--"} IST</span><span>{site.location.split(",")[0]}</span><span>open to work</span>
              </p>
              <h1 className="landing-title">
                One body of work.<br /><em>Six ways in.</em>
              </h1>
              <p className="landing-what">
                <b>{first} <i>{last}</i></b> — {site.title.toLowerCase()}. I build AI-powered products, developer tools and full-stack systems, then ship them with source.
              </p>
              <div className="landing-ctas">
                <a className="l-cta l-cta-primary" href="#editions">Choose an interface <span aria-hidden="true">→</span></a>
                <Link className="l-cta" to="/mac" viewTransition>Boot the desktop <span aria-hidden="true">✦</span></Link>
                <a className="l-cta l-cta-ghost" href={site.resume} target="_blank" rel="noopener noreferrer">Resume <span aria-hidden="true">↗</span></a>
              </div>
              <div className="landing-pipeline" aria-hidden="true">
                <span>frontend</span><i>→</i><span>api</span><i>→</i><span>database</span><i>→</i><span>llm</span><i>→</i><span>product</span>
              </div>
            </div>
            <div className="hero-stage">
              <EditionStage index={index} setIndex={(f) => setIndex((i) => f(i))} onEnter={(e, ed) => go(e, ed, (e.currentTarget as HTMLElement))} />
            </div>
          </div>
          <div className="landing-scroll" aria-hidden="true"><i /></div>
        </section>

        <div className="land-marquee" aria-hidden="true">
          <div className="land-marquee-track">
            {[0, 1].map((k) => (
              <span className="land-marquee-group" key={k} aria-hidden={k === 1}>
                {SKILL_NAMES.map((n) => (<span className="land-marquee-item" key={n}>{n}<i /></span>))}
              </span>
            ))}
          </div>
        </div>

        <section className="land-stats" data-land-reveal>
          {STATS.map((s) => <Stat key={s.label} value={s.value} label={s.label} />)}
        </section>

        <section className="editions" id="editions">
          <div className="section-head" data-land-reveal>
            <span className="section-kicker">contents</span>
            <h2 className="section-title">Same work, <em>six interfaces.</em></h2>
            <p className="section-sub">Every edition is the complete portfolio. Pick the one that suits how you read — or press <kbd>1</kbd>–<kbd>6</kbd> from any page.</p>
          </div>
          <div className="edition-grid" role="list" aria-label="Portfolio interfaces — choose an edition">
            {EDITIONS.map((e, i) => (
              <EditionCard key={e.to} to={e.to} label={`Open the ${e.label} interface`} tone={e.tone} keyNum={String(i + 1)} onClick={(ev) => go(ev, e, (ev.currentTarget as HTMLElement).querySelector(".ed-preview"))}>
                <div className="ed-preview">{e.mini}</div>
                <div className="ed-meta">
                  <span className="ed-num" aria-hidden="true">{e.num}</span>
                  <h3>{e.label}</h3>
                  <span className="ed-role">{e.role}</span>
                  <p>{e.blurb}</p>
                  <span className="ed-cta">{e.cta} <span aria-hidden="true">→</span></span>
                </div>
              </EditionCard>
            ))}
          </div>
          <div className="edition-bar" data-land-reveal>
            <span className="edition-bar-label">switch from any page</span>
            <InterfaceSwitcher current="landing" />
            <span className="edition-bar-hint">⌘K palette · <kbd>1</kbd>–<kbd>6</kbd> keys</span>
          </div>
        </section>

        <section className="land-projects" id="work" data-land-reveal>
          <div className="section-head">
            <span className="section-kicker">index</span>
            <h2 className="section-title">Shipped <em>&amp; live.</em></h2>
          </div>
          <div className="land-ledger">
            {featuredProjects.map((p, i) => (
              <a key={p.slug} className="land-row" style={{ "--i": i, "--pa": p.accent[0], "--pb": p.accent[2] } as CSSProperties} href={p.live ?? p.github} target="_blank" rel="noopener noreferrer">
                <span className="lr-n">{String(i + 1).padStart(2, "0")}</span>
                <span className="lr-emoji" aria-hidden="true">{p.emoji}</span>
                <span className="lr-main"><span className="lr-name">{p.name}</span><span className="lr-tag">{p.tagline}</span></span>
                <span className="lr-tech">{p.tech.slice(0, 3).join(" · ")}</span>
                <span className="lr-arrow" aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </section>

        <p className="landing-note" data-land-reveal>{site.tagline}</p>
      </main>

      <footer className="landing-foot" data-land-reveal>
        <span>© 2026 {site.name} · Kurnool, India</span>
        <span className="landing-links">
          <a href={site.github} target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href={site.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href={`mailto:${site.email}`}>Email</a>
        </span>
      </footer>
    </div>
  );
}

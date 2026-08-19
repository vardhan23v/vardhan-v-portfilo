import { type ReactNode, useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { InterfaceSwitcher } from "../interface-switcher/InterfaceSwitcher";
import { useTilt } from "../hooks/useTilt";
import { site } from "../classic/data/site";
import { featuredProjects } from "../classic/data/projects";
import { experience } from "../classic/data/experience";
import { skillCategories } from "../classic/data/skills";

const STATS = [
  { value: featuredProjects.length, label: "shipped products", pad: true },
  { value: 5, label: "interfaces, one portfolio", pad: true },
  { value: experience.length, label: "roles & internships", pad: true },
  { value: 31, label: "stack technologies", pad: true },
];

const SKILL_NAMES = [...new Set(skillCategories.flatMap((c) => c.items.map((i) => i.name)))];

function EditionCard({
  to,
  label,
  className,
  cursor,
  keyNum,
  children,
}: {
  to: string;
  label: string;
  className: string;
  cursor: string;
  keyNum: string;
  children: ReactNode;
}) {
  const ref = useTilt<HTMLDivElement>(6, ".edition-card");
  return (
    <div ref={ref} className="edition-tilt" role="listitem">
      <Link
        to={to}
        className={`edition-card ${className}`}
        aria-label={label}
        data-cursor={cursor}
      >
        <kbd className="ed-key" aria-hidden="true">{keyNum}</kbd>
        {children}
      </Link>
    </div>
  );
}

const terminalLines = [
  { p: "$ vardhan build --ai", cls: "l-prompt" },
  { p: "✓ shipped", cls: "l-ok" },
];

function Stat({ value, label, pad }: { value: number; label: string; pad?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        io.disconnect();
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          el.textContent = pad ? String(value).padStart(2, "0") : String(value);
          return;
        }
        const t0 = performance.now();
        const dur = 1100;
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = pad ? String(Math.round(eased * value)).padStart(2, "0") : String(Math.round(eased * value));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value, pad]);
  return (
    <div className="land-stat">
      <span className="land-stat-num" ref={ref}>
        0
      </span>
      <span className="land-stat-label">{label}</span>
    </div>
  );
}

export function Landing() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll(".edition-tilt, [data-land-reveal]");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -4% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const head = document.querySelector<HTMLElement>(".landing-head");

    const onScroll = () => {
      if (head && !reduced) {
        const y = Math.min(window.scrollY, 500);
        head.style.opacity = String(1 - y / 460);
        head.style.transform = `translateY(${y * 0.18}px)`;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const magnet = (btn: HTMLElement) => {
      const onMove = (e: MouseEvent) => {
        const r = btn.getBoundingClientRect();
        if (r.width === 0) return;
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        btn.style.setProperty("--mx", `${(dx * 10).toFixed(2)}px`);
        btn.style.setProperty("--my", `${(dy * 7).toFixed(2)}px`);
      };
      const reset = () => {
        btn.style.removeProperty("--mx");
        btn.style.removeProperty("--my");
      };
      btn.addEventListener("mousemove", onMove);
      btn.addEventListener("mouseleave", reset);
      return () => {
        btn.removeEventListener("mousemove", onMove);
        btn.removeEventListener("mouseleave", reset);
      };
    };
    const buttons = document.querySelectorAll<HTMLElement>(".l-cta");
    const cleanups = [...buttons].map(magnet);
    return () => cleanups.forEach((f) => f());
  }, []);

  return (
    <div className="landing-root">
      <main className="landing-main">
        <header className="landing-head">
          <p className="landing-eyebrow">sree vardhan v — generative-ai · full-stack</p>
          <h1 className="landing-title">
            One portfolio.
            <br />
            <span className="landing-grad">Five interfaces.</span>
          </h1>
          <p className="landing-what">I build AI-powered products and full-stack systems.</p>
          <p className="landing-sub">
            Computer Science undergraduate focused on Generative AI, full-stack
            development, and developer tooling. One body of work, five ways to
            experience it — pick a lane, switch anytime.
          </p>

          <div className="landing-ctas">
            <a className="l-cta l-cta-primary" href="#editions">
              View selected work <span aria-hidden="true">→</span>
            </a>
            <a className="l-cta" href={site.github} target="_blank" rel="noopener noreferrer">
              GitHub <span aria-hidden="true">↗</span>
            </a>
            <a className="l-cta" href={site.resume} target="_blank" rel="noopener noreferrer">
              Resume <span aria-hidden="true">↗</span>
            </a>
          </div>

          <div className="landing-pipeline" aria-hidden="true">
            <span>frontend</span>
            <i>→</i>
            <span>api</span>
            <i>→</i>
            <span>database</span>
            <i>→</i>
            <span>llm</span>
            <i>→</i>
            <span>product</span>
          </div>

          <div className="landing-scroll" aria-hidden="true">
            <i />
          </div>
        </header>

        <div className="land-marquee" aria-hidden="true">
          <div className="land-marquee-track">
            <span className="land-marquee-group">
              {SKILL_NAMES.map((n) => (
                <span className="land-marquee-item" key={n}>
                  {n}
                  <i />
                </span>
              ))}
            </span>
            <span className="land-marquee-group" aria-hidden="true">
              {SKILL_NAMES.map((n) => (
                <span className="land-marquee-item" key={n}>
                  {n}
                  <i />
                </span>
              ))}
            </span>
          </div>
        </div>

        <div className="land-stats" data-land-reveal>
          {STATS.map((s) => (
            <Stat key={s.label} value={s.value} label={s.label} pad={s.pad} />
          ))}
        </div>

        <div className="edition-bar">
          <span className="edition-bar-label">five interfaces</span>
          <InterfaceSwitcher current="landing" />
        </div>
        <p className="edition-bar-hint">
          ⌘/ctrl + K — command palette · press <kbd>1</kbd>–<kbd>5</kbd> — switch from any page
        </p>

        <div className="edition-grid" id="editions" role="list" aria-label="Portfolio interfaces — choose an edition">
          <EditionCard to="/terminal" label="Open the Terminal interface" className="ed-term" cursor="term" keyNum="1">
            <div className="mini-term" aria-hidden="true">
              <div className="mini-body">
                {terminalLines.map((l, i) => (
                  <div key={i} className={l.cls}>
                    {l.p}
                  </div>
                ))}
                <div className="l-cursor" />
              </div>
            </div>
            <div className="ed-meta">
              <span className="ed-num" aria-hidden="true">
                01
              </span>
              <h2>Terminal</h2>
              <p>
                A fully interactive shell — type commands, read man pages, browse
                the work like a file system.
              </p>
              <span className="ed-cta">
                Enter the shell <span aria-hidden="true">→</span>
              </span>
            </div>
          </EditionCard>

          <EditionCard to="/classic" label="Open the Classic interface" className="ed-classic" cursor="classic" keyNum="2">
            <div className="mini-classic" aria-hidden="true">
              <div className="mc-name">
                VARDHAN<span className="mc-dot">.</span>V
              </div>
              <div className="mc-role">generative-ai :: full-stack</div>
            </div>
            <div className="ed-meta">
              <span className="ed-num" aria-hidden="true">
                02
              </span>
              <h2>Classic</h2>
              <p>
                The original — animated build terminal, project grid, GitHub
                stats, and the full journey.
              </p>
              <span className="ed-cta">
                Open the original <span aria-hidden="true">→</span>
              </span>
            </div>
          </EditionCard>

          <EditionCard to="/paper" label="Open the Paper interface" className="ed-paper" cursor="paper" keyNum="3">
            <div className="mini-paper" aria-hidden="true">
              <div className="mp-name">
                Sree Vardhan
                <br />
                <span className="mp-it">Vardhan V.</span>
              </div>
              <div className="mp-rule" />
              <div className="mp-line" />
              <div className="mp-line short" />
            </div>
            <div className="ed-meta">
              <span className="ed-num" aria-hidden="true">
                03
              </span>
              <h2>Paper</h2>
              <p>
                Light editorial — serif headlines, magazine layout, quiet and
                readable. The same work, beautifully printed.
              </p>
              <span className="ed-cta">
                Open the paper <span aria-hidden="true">→</span>
              </span>
            </div>
          </EditionCard>

          <EditionCard to="/aurora" label="Open the Aurora interface" className="ed-aurora" cursor="aurora" keyNum="4">
            <div className="mini-aurora" aria-hidden="true">
              <span className="ma-blob pink" />
              <span className="ma-blob cyan" />
              <div className="ma-name">
                Sree Vardhan <span className="ma-it">V.</span>
              </div>
              <div className="ma-chip">glass · light · gradient</div>
            </div>
            <div className="ed-meta">
              <span className="ed-num" aria-hidden="true">
                04
              </span>
              <h2>Aurora</h2>
              <p>
                Glassmorphism — frosted panels floating over drifting pastel
                auroras. Premium, soft, luminous.
              </p>
              <span className="ed-cta">
                Step into the light <span aria-hidden="true">→</span>
              </span>
            </div>
          </EditionCard>

          <EditionCard to="/forge" label="Open the Forge interface" className="ed-forge" cursor="forge" keyNum="5">
            <div className="mini-forge" aria-hidden="true">
              <div className="mf-name">
                Sree Vardhan <span className="mf-dot">V.</span>
              </div>
              <div className="mf-rule" />
              <div className="mf-head">Where code meets intelligence.</div>
              <div className="mf-pipe">
                <span>frontend</span>
                <i>→</i>
                <span>api</span>
                <i>→</i>
                <span>database</span>
                <i>→</i>
                <span>llm</span>
                <i>→</i>
                <span>product</span>
              </div>
            </div>
            <div className="ed-meta">
              <span className="ed-num" aria-hidden="true">
                05
              </span>
              <h2>Forge</h2>
              <p>
                Editorial dark — Kanit headlines, stacked project cards, and a
                quiet premium engineering tone.
              </p>
              <span className="ed-cta">
                Enter the forge <span aria-hidden="true">→</span>
              </span>
            </div>
          </EditionCard>
        </div>

        <div className="land-projects" data-land-reveal>
          <div className="land-projects-head">
            <span className="land-projects-kicker">index</span>
            <span className="land-projects-sub">shipped &amp; live</span>
          </div>
          <div className="land-projects-row">
            {featuredProjects.map((p, i) => (
              <a
                key={p.slug}
                className="land-project-item"
                style={{ "--i": i, "--pa1": p.accent[0] } as CSSProperties}
                href={p.live ?? p.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="lpi-emoji" aria-hidden="true">
                  {p.emoji}
                </span>
                <span className="lpi-name">{p.name}</span>
                <span className="lpi-arrow" aria-hidden="true">
                  ↗
                </span>
              </a>
            ))}
          </div>
        </div>

        <p className="landing-note" data-land-reveal>switch editions from any page</p>
      </main>

      <footer className="landing-foot" data-land-reveal>
        <span>© 2026 {site.name}</span>
        <span className="landing-links">
          <a href={site.github} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href={site.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          <a href={`mailto:${site.email}`}>Email</a>
        </span>
      </footer>
    </div>
  );
}
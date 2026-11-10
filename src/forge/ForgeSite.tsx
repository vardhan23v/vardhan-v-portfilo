import "@fontsource/kanit/latin-300.css";
import "@fontsource/kanit/latin-ext-300.css";
import "@fontsource/kanit/latin-400.css";
import "@fontsource/kanit/latin-ext-400.css";
import "@fontsource/kanit/latin-500.css";
import "@fontsource/kanit/latin-ext-500.css";
import "@fontsource/kanit/latin-600.css";
import "@fontsource/kanit/latin-ext-600.css";
import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import { flushSync } from "react-dom";
import { Link } from "react-router-dom";
import { InterfaceSwitcher } from "../interface-switcher/InterfaceSwitcher";
import { LiquidButton, MetalButton } from "../components/ui/LiquidButton";
import { useTilt } from "../hooks/useTilt";
import { useMagnetic } from "../hooks/useMagnetic";
import { useGithub } from "../hooks/useGithub";
import { EmberField } from "./EmberField";
import { featuredProjects, type Project, CATEGORY_LABEL } from "../classic/data/projects";
import { caseStudyPath, hasCaseStudy } from "../work/links";
import { experience } from "../classic/data/experience";
import { skillCategories } from "../classic/data/skills";
import { site } from "../classic/data/site";
import { github, aiStack } from "../classic/data/stats";
import "./styles/forge.css";
import { motionReduced, startLocalTransition } from "../lib/motion";
import { prefetchEdition } from "../lib/editionLoaders";
import { aboutProject, askAssistant } from "../lib/ai/ask";

function getCategory(p: Project): string {
  return (p.kicker ?? CATEGORY_LABEL[p.category]).toUpperCase();
}

const FORGE_PROJECTS = featuredProjects.map((p, i) => ({
  ...p,
  num: String(i + 1).padStart(2, "0"),
  cat: getCategory(p),
}));

const AI_TECH = /gemini|claude|groq|gpt|openai|mistral|cohere|crewai|mcp|whisper|onnx|llm|agent/i;

const ABOUT_PARAGRAPHS = [
  "I'm a Computer Science undergraduate focused on Generative AI, full-stack development, and shipping useful software products.",
  "I work across the stack — React interfaces, Node.js APIs, databases, and LLM integrations — and ship what I build.",
  "I'm especially interested in AI-powered developer tools, intelligent web applications, and agentic systems.",
];

const ABOUT_META: [string, string][] = [
  ["Name", "Sree Vardhan V."],
  ["Focus", "Generative AI · Full Stack · AI Products"],
  ["Education", "B.Tech — Computer Science"],
  ["Location", site.location],
  ["GitHub", "github.com/vardhan23v"],
];

const STACK_ALIAS: Record<string, string> = {
  "Gemini API": "Gemini",
  "Claude API": "Claude",
  "Groq API": "Groq",
};

function stackGroups() {
  return skillCategories.map((c) => ({
    label: c.label === "AI / LLM" ? "AI" : c.label,
    items: [
      ...new Set(
        c.items
          .map((i) => STACK_ALIAS[i.name] ?? i.name)
          .concat(c.label === "Frontend" ? ["Tailwind CSS"] : c.label === "AI / LLM" ? ["Generative AI"] : [])
      ),
    ],
  }));
}

const STACK = stackGroups();

const STACK_HUES = ["#7dd3fc", "#93c5fd", "#a78bfa", "#67e8f9", "#c4b5fd", "#86efac"];

const STACK_CONTEXT: Record<string, string> = {
  Languages: "the foundation",
  Frontend: "interfaces that feel alive",
  Backend: "APIs & systems",
  Databases: "structured storage",
  AI: "models wired into products",
  Tools: "workflow force-multipliers",
  "Cloud & Tools": "workflow force-multipliers",
};

const SECTION_META: Record<string, [string, string]> = {
  work: ["01", "selected work"],
  stack: ["02", "stack"],
  experience: ["03", "experience"],
  about: ["04", "about"],
  contact: ["05", "contact"],
  interfaces: ["06", "interfaces"],
};

const INTERFACES: { to: string; name: string; desc: string; key: string }[] = [
  { to: "/terminal", name: "Terminal", desc: "interactive command shell", key: ">" },
  { to: "/classic", name: "Classic", desc: "the original design", key: "⌘" },
  { to: "/paper", name: "Paper", desc: "light editorial", key: "¶" },
  { to: "/aurora", name: "Aurora", desc: "luminous glass", key: "✦" },
  { to: "/mac", name: "macOS", desc: "a working desktop", key: "⌥" },
  { to: "/atlas", name: "Atlas", desc: "a contour map", key: "◎" },
];

const STOKE_KEY = "fg.stoked";
function readStoked() {
  try {
    return localStorage.getItem(STOKE_KEY) === "1";
  } catch {
    return false;
  }
}

/** Ember sparks that fly out of a button while it is hovered. */
function Sparks() {
  return (
    <i className="fg-sparks" aria-hidden="true">
      {Array.from({ length: 7 }, (_, i) => (
        <b key={i} style={{ "--a": `${-70 + i * 24}deg`, "--d": `${(i * 0.09) % 0.5}s` } as CSSProperties} />
      ))}
    </i>
  );
}

function SectionEyebrow({ id, left }: { id: string; left?: boolean }) {
  const [idx, name] = SECTION_META[id];
  return (
    <p className={`fg-sec-eyebrow${left ? " fg-sec-eyebrow-left" : ""}`}>
      <span className="fg-sec-idx">{idx}</span>
      <span className="fg-sec-name">{name}</span>
      <span className="fg-sec-rule" aria-hidden="true" />
    </p>
  );
}

const LEDES = [
  "Building AI-powered products that feel simple to use.",
  "Wiring LLM APIs, agents, and streaming into shipped software.",
  "Turning raw ideas into shipped, working products.",
];

/** Rotating lede; the timer only runs while the hero is on screen and the tab is visible. */
function useLede(active: boolean) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!active || motionReduced()) return;
    const t = window.setInterval(() => setIdx((v) => (v + 1) % LEDES.length), 4200);
    return () => window.clearInterval(t);
  }, [active]);
  return idx;
}

/** Followers and repo count from GitHub, cached per session; static numbers until it answers. */
function useGithubStats(): { followers: number; repos: number } {
  const { followers, repos } = useGithub();
  return { followers, repos };
}

function useForgeReveals() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(".fg-reveal"));
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("fg-in");
            obs.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

/** `.is-onscreen` on each section, so its decorative loops (heading shimmer, contact glow) pause off screen. */
function useForgeOnscreen() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(".fg-section"));
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) e.target.classList.toggle("is-onscreen", e.isIntersecting);
    });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/**
 * Every scroll effect in one passive listener and one rAF: read (scrollY plus geometry cached on
 * resize), then write. Nav heat bar (--sp), hero parallax and fade (wide screens only), marquee
 * drift (only while the marquee is visible) and the experience timeline (--tl, --tl-y).
 * Under reduced motion only --sp is written: the heat bar is information, not decoration.
 */
function useForgeScroll() {
  useEffect(() => {
    const reduced = motionReduced();
    const nav = document.querySelector<HTMLElement>(".fg-nav");
    const hero = document.querySelector<HTMLElement>(".fg-hero");
    const tl = document.querySelector<HTMLElement>(".fg-timeline");
    const marquee = document.querySelector<HTMLElement>(".fg-marquee");
    const tracks = Array.from(document.querySelectorAll<HTMLElement>(".fg-marquee-track"));
    const wide = window.matchMedia("(min-width: 1025px)");

    let docMax = 1;
    let vh = window.innerHeight;
    let heroH = 1;
    let tlTop = 0;
    let tlH = 1;
    const halves = tracks.map(() => 0);
    let marqueeOn = false;
    let lastHeroY = -1;
    let lastTl = -1;
    let dirty = true;
    let raf = 0;

    const measure = () => {
      vh = window.innerHeight;
      docMax = Math.max(1, document.documentElement.scrollHeight - vh);
      if (hero) heroH = Math.max(1, hero.offsetHeight);
      if (tl) {
        tlTop = tl.getBoundingClientRect().top + window.scrollY;
        tlH = Math.max(1, tl.offsetHeight);
      }
      tracks.forEach((t, i) => {
        halves[i] = (t.firstElementChild as HTMLElement | null)?.offsetWidth ?? 0;
      });
      lastHeroY = -1;
      lastTl = -1;
    };

    const frame = () => {
      raf = 0;
      // read
      if (dirty) {
        measure();
        dirty = false;
      }
      const y = window.scrollY;
      // write
      nav?.style.setProperty("--sp", clamp01(y / docMax).toFixed(4));
      if (reduced) return;
      if (hero && wide.matches) {
        const hy = Math.min(y, heroH + 100);
        if (hy !== lastHeroY) {
          lastHeroY = hy;
          hero.style.transform = `translate3d(0, ${(hy * 0.1).toFixed(1)}px, 0)`;
          hero.style.opacity = clamp01(1 - (hy - heroH * 0.35) / (heroH * 0.5)).toFixed(3);
        }
      }
      if (marqueeOn) {
        tracks.forEach((t, i) => {
          const half = halves[i];
          if (!half) return;
          const off = (y * 0.35) % half;
          // Even rows drift right from -half, odd rows left from 0: both stay covered edge to edge.
          t.style.transform = i % 2 === 0 ? `translate3d(${(off - half).toFixed(1)}px, 0, 0)` : `translate3d(${(-off).toFixed(1)}px, 0, 0)`;
        });
      }
      if (tl) {
        const p = clamp01((vh * 0.72 - (tlTop - y)) / tlH);
        if (p !== lastTl) {
          lastTl = p;
          tl.style.setProperty("--tl", p.toFixed(4));
          tl.style.setProperty("--tl-y", `${(p * Math.max(0, tlH - 20)).toFixed(1)}px`);
        }
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const invalidate = () => {
      dirty = true;
      schedule();
    };

    const onWide = () => {
      if (!wide.matches && hero) {
        hero.style.transform = "";
        hero.style.opacity = "";
      }
      invalidate();
    };

    const ro = new ResizeObserver(invalidate);
    ro.observe(document.body);
    if (hero) ro.observe(hero);
    tracks.forEach((t) => ro.observe(t));
    const io = new IntersectionObserver((entries) => {
      marqueeOn = entries[0]?.isIntersecting ?? false;
      if (marqueeOn) schedule();
    });
    if (marquee && !reduced) io.observe(marquee);

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", invalidate, { passive: true });
    wide.addEventListener("change", onWide);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", invalidate);
      wide.removeEventListener("change", onWide);
      ro.disconnect();
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
}

function useForgeSpy() {
  useEffect(() => {
    const links = [
      ...document.querySelectorAll<HTMLAnchorElement>(".fg-nav-links a[href^='#'], .fg-nav-panel a[href^='#']"),
    ];
    const ids = ["work", "stack", "experience", "about", "contact"];
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const active = `#${entry.target.id}`;
          links.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === active));
        }
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, []);
}

function useForgeTimelineReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(".fg-tl-item"));
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("fg-tl-in");
            obs.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.1 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

function ForgeNav() {
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  // The mobile panel closes on Escape (focus returns to the toggle) and on a tap outside the nav.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      menuRef.current?.focus();
    };
    const onDown = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);
  const links: [string, string][] = [
    ["#work", "Projects"],
    ["#stack", "Stack"],
    ["#experience", "Experience"],
    ["#about", "About"],
    ["#contact", "Contact"],
  ];
  const go = (e: MouseEvent<HTMLAnchorElement>) => {
    (e.currentTarget as HTMLAnchorElement).blur();
    setOpen(false);
  };
  const warmHome = () => prefetchEdition("/");
  return (
    <nav className="fg-nav" aria-label="Main" ref={navRef}>
      <Link to="/" className="fg-nav-name" onPointerEnter={warmHome} onFocus={warmHome} onTouchStart={warmHome}>
        Sree Vardhan <span className="fg-dot">V.</span>
      </Link>
      <div className={`fg-nav-links${open ? " is-open" : ""}`}>
        {links.map(([href, label]) => (
          <a key={href} href={href} onClick={go}>
            {label}
          </a>
        ))}
        <a href={site.github} target="_blank" rel="noopener noreferrer" className="fg-nav-gh" onClick={go}>
          GitHub <span aria-hidden="true">↗</span>
        </a>
      </div>
      <div className="fg-nav-right">
        <InterfaceSwitcher current="forge" />
        <button
          ref={menuRef}
          type="button"
          className={`fg-menu${open ? " is-open" : ""}`}
          aria-expanded={open}
          aria-controls="fg-nav-panel"
          aria-label="Toggle navigation"
          onClick={() => setOpen(!open)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
      <div className={`fg-nav-panel${open ? " is-open" : ""}`} id="fg-nav-panel">
        {links.map(([href, label], n) => (
          <a key={href} href={href} onClick={go} style={{ "--n": n } as CSSProperties}>
            {label}
          </a>
        ))}
        <a href={site.github} target="_blank" rel="noopener noreferrer" onClick={go} style={{ "--n": links.length } as CSSProperties}>
          GitHub <span aria-hidden="true">↗</span>
        </a>
      </div>
    </nav>
  );
}

/** Uptime as its own leaf: derived from a stored start time, ticking only while `active`, so it stays right after a pause. */
function Uptime({ active }: { active: boolean }) {
  const t0 = useRef(0);
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (!t0.current) t0.current = performance.now();
    if (!active || motionReduced()) return;
    const tick = () => setSecs(Math.floor((performance.now() - t0.current) / 1000));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [active]);
  const m = String(Math.floor(secs / 60)).padStart(2, "0");
  const s = String(secs % 60).padStart(2, "0");
  return (
    <span className="fg-pipe-uptime">
      <i className="fg-pipe-dot" /> uptime {m}:{s}
    </span>
  );
}

const BUILD_LOG = [
  "▸ compiling ui ......... ok",
  "▸ wiring llm tools ..... ok",
  "▸ migrating database ... ok",
  "▸ streaming tokens ..... ok",
  "▸ deploying → vercel ... ✓ live",
];

/** Typing build log; pauses (keeping its place) while the hero is off screen or the tab is hidden. */
function BuildLog({ override, active }: { override?: number | null; active: boolean }) {
  const [line, setLine] = useState(0);
  const [chars, setChars] = useState(BUILD_LOG[0].length);
  const pos = useRef({ i: 0, c: 0 });

  useEffect(() => {
    if (motionReduced() || override != null || !active) return;
    let t = 0;
    const typeNext = () => {
      const p = pos.current;
      const target = BUILD_LOG[p.i];
      if (p.c <= target.length) {
        setLine(p.i);
        setChars(p.c);
        p.c += 1 + Math.floor(Math.random() * 2);
        t = window.setTimeout(typeNext, 34 + Math.random() * 46);
      } else {
        p.i = (p.i + 1) % BUILD_LOG.length;
        p.c = 0;
        t = window.setTimeout(typeNext, 1500);
      }
    };
    t = window.setTimeout(typeNext, 800);
    return () => window.clearTimeout(t);
  }, [override, active]);

  const text = override != null ? BUILD_LOG[override] : BUILD_LOG[line].slice(0, chars);
  return (
    <span className="fg-pipe-log">
      {text}
      <i className="fg-pipe-caret" aria-hidden="true" />
    </span>
  );
}

/** Section heading with per-word rise-in, staggered via --wi, fired by .fg-in. */
function StaggerHeading({ text, className = "" }: { text: string; className?: string }) {
  return (
    <h2 className={`fg-heading hero-heading fg-h-stagger ${className}`} aria-label={text}>
      {text.split(" ").map((word, i) => (
        <span className="fg-h-clip" key={`${word}-${i}`} aria-hidden="true">
          <span className="fg-h-word" style={{ "--wi": i } as CSSProperties}>
            {word}
          </span>{" "}
        </span>
      ))}
    </h2>
  );
}

/**
 * True while the hero is on screen and the tab is visible. Also marks `.forge-root[data-hero-off]`
 * so the hero's CSS loops (float, pulses, caret, shimmer) pause when it scrolls away.
 */
function useHeroActive(ref: RefObject<HTMLElement | null>) {
  const [onScreen, setOnScreen] = useState(true);
  const [visible, setVisible] = useState(() => typeof document === "undefined" || !document.hidden);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = el.closest<HTMLElement>(".forge-root");
    const io = new IntersectionObserver((entries) => {
      const on = entries[0]?.isIntersecting ?? true;
      setOnScreen(on);
      root?.toggleAttribute("data-hero-off", !on);
    });
    io.observe(el);
    const onVis = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      root?.removeAttribute("data-hero-off");
    };
  }, [ref]);
  return onScreen && visible;
}

function Hero({ stoked, onStoke }: { stoked: boolean; onStoke: (from: HTMLElement) => void }) {
  const heroRef = useRef<HTMLElement>(null);
  const active = useHeroActive(heroRef);
  const ledeIdx = useLede(active);
  const [trace, setTrace] = useState<number | null>(null);
  const [step, setStep] = useState<number | null>(null);
  const [builds, setBuilds] = useState(0);
  const [passed, setPassed] = useState(false);

  // "Run build": rows go queued → running → ok in sequence, the log follows, prod flashes.
  const runBuild = () => {
    if (step !== null) return;
    setPassed(false);
    const fast = motionReduced();
    let i = 0;
    setStep(0);
    const tick = () => {
      i += 1;
      if (i < 5) {
        setStep(i);
        window.setTimeout(tick, fast ? 0 : 520);
      } else {
        setStep(null);
        setPassed(true);
        setBuilds((b) => b + 1);
        window.setTimeout(() => setPassed(false), 2400);
      }
    };
    window.setTimeout(tick, fast ? 0 : 520);
  };
  const pipeRef = useTilt<HTMLDivElement>(5, ".fg-pipe");
  // Stage colours follow the tokens, so stoked mode recolours the pipeline too.
  const pipeline: [string, string, string][] = [
    ["Frontend", "React · Tailwind UI", "var(--fg-cyan)"],
    ["API", "Node.js · REST · Cloudinary", "var(--fg-blue)"],
    ["Database", "Cloud MySQL · Prisma", "var(--fg-violet)"],
    ["LLM", aiStack.slice(0, 4).join(" · "), "var(--fg-purple)"],
    ["Product", "Railway · Vercel · live", "#BBCCD7"],
  ];
  return (
    <header className="fg-hero" ref={heroRef}>
      <EmberField stoked={stoked} />
      <div className="fg-hero-copy">
        <p className="fg-eyebrow fg-enter" style={{ "--d": "0s" } as CSSProperties}>
          generative ai · full-stack · product engineering
        </p>
        <p className="fg-name fg-enter" style={{ "--d": "0.08s" } as CSSProperties}>
          Sree Vardhan V.
        </p>
        <h1 className="fg-hero-heading fg-enter fg-glint" style={{ "--d": "0.16s" } as CSSProperties}>
          Where code meets intelligence.
        </h1>
        <span className="sr-only">Building AI-powered products that feel simple to use.</span>
        <p className="fg-lede fg-enter" style={{ "--d": "0.3s" } as CSSProperties} aria-hidden="true">
          <span key={ledeIdx} className="fg-lede-swap">
            {LEDES[ledeIdx]}
          </span>
        </p>
        <p className="fg-description fg-enter" style={{ "--d": "0.4s" } as CSSProperties}>
          I design and ship AI-powered products — wiring LLM APIs, agents, and streaming
          interfaces into full-stack systems that solve real problems.
        </p>
        <div className="fg-ctas fg-enter" style={{ "--d": "0.5s" } as CSSProperties}>
          <LiquidButton variant="default" size="xxl" className="fg-lb-hero" href="#work">
            View selected work <span aria-hidden="true">→</span>
          </LiquidButton>
          <a className="fg-btn" href={site.github} target="_blank" rel="noopener noreferrer">
            GitHub <span aria-hidden="true">↗</span>
            <Sparks />
          </a>
          <a className="fg-btn" href={site.resume} target="_blank" rel="noopener noreferrer">
            Resume <span aria-hidden="true">↗</span>
            <Sparks />
          </a>
        </div>
        <div className="fg-context fg-enter" style={{ "--d": "0.58s" } as CSSProperties}>
          <span>generative ai</span>
          <span>full-stack engineering</span>
          <span>agentic systems</span>
          <button
            type="button"
            className={`fg-stoke${stoked ? " is-on" : ""}`}
            onClick={(e) => onStoke(e.currentTarget)}
            aria-pressed={stoked}
          >
            <i aria-hidden="true" /> {stoked ? "forge stoked" : "stoke the forge"}
          </button>
        </div>
      </div>
      <div ref={pipeRef} className="fg-hero-visual fg-enter" style={{ "--d": "0.34s" } as CSSProperties} role="group" aria-label="Build pipeline demo">
        <div className={`fg-pipe${step !== null ? " is-building" : ""}${passed ? " is-passed" : ""}`}>
          <div className="fg-pipe-head">
            <span>build pipeline{builds > 0 && <span className="fg-pipe-count"> · #{builds}</span>}</span>
            <span className="fg-pipe-head-right">
              <button type="button" className="fg-pipe-run" onClick={runBuild} disabled={step !== null}>
                {step !== null ? "building…" : "run build ▶"}
              </button>
              <span className="fg-pipe-status">
                <i className="fg-pipe-dot" /> {passed ? "passed ✓" : "prod"}
              </span>
            </span>
          </div>
          <div className="fg-pipe-rows">
            <div className="fg-pipe-pulse" aria-hidden="true" />
            {pipeline.map(([name, meta, color], i) => (
              <div
                className={`fg-pipe-row${
                  trace !== null ? (i >= trace ? " is-downstream" : " is-dimmed") : ""
                }${step !== null && i === step ? " is-running" : ""}${(step !== null && i < step) || passed ? " is-done" : ""}`}
                key={name}
                style={{ "--pc": color, "--i": i } as CSSProperties}
                onMouseEnter={() => setTrace(i)}
                onMouseLeave={() => setTrace(null)}
              >
                <span className="fg-pipe-idx">
                  {(step !== null && i < step) || passed ? "ok" : String(i + 1).padStart(2, "0")}
                </span>
                <span className="fg-pipe-name">{name}</span>
                <span className="fg-pipe-arrow">→</span>
                <span className="fg-pipe-meta">{meta}</span>
              </div>
            ))}
          </div>
          <div className="fg-pipe-foot">
            <BuildLog override={step} active={active} />
            <Uptime active={active} />
          </div>
        </div>
      </div>
    </header>
  );
}

function Stat({ value, label, accent }: { value: number; label: string; accent?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    // Write inside the accent <em> when there is one, so the styling survives the count.
    const el = host.querySelector("em") ?? host;
    if (motionReduced()) {
      el.textContent = String(value);
      return;
    }
    let raf = 0;
    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        obs.disconnect();
        const t0 = performance.now();
        const dur = 900;
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = String(Math.round(value * eased));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    obs.observe(host);
    return () => {
      obs.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [value]);
  return (
    <div className="fg-stat">
      <span className="fg-stat-value" ref={ref}>
        {accent ? <em>0</em> : 0}
      </span>
      <span className="fg-stat-label">{label}</span>
    </div>
  );
}

function StatsStrip() {
  const { followers, repos } = useGithubStats();
  const items: { value: number; label: string; accent?: boolean }[] = [
    { value: FORGE_PROJECTS.length, label: "featured products" },
    { value: STACK.length, label: "stack groups" },
    { value: repos ?? github.repos, label: "public repos" },
    { value: followers ?? github.followers, label: "github followers", accent: true },
  ];
  return (
    <section className="fg-stats fg-reveal" aria-label="Live stats">
      {items.map((it) => (
        <Stat key={it.label} {...it} />
      ))}
    </section>
  );
}

function Marquee() {
  const row = (projects: (typeof FORGE_PROJECTS)[number][], dir: "l" | "r") => (
    <div className={`fg-marquee-track fg-marquee-track-${dir}`} key={dir}>
      {[0, 1].map((half) => (
        <span className="fg-marquee-group" key={half} aria-hidden={half === 1}>
          {projects.map((p) => (
            <span className="fg-marquee-item" key={p.slug}>
              <span aria-hidden="true">{p.emoji}</span> {p.name} <i />
            </span>
          ))}
          {projects.map((p) => (
            <span className="fg-marquee-item" key={`${p.slug}-b`} aria-hidden="true">
              <span>{p.emoji}</span> {p.name} <i />
            </span>
          ))}
        </span>
      ))}
    </div>
  );
  const even = FORGE_PROJECTS.filter((_, i) => i % 2 === 0);
  const odd = FORGE_PROJECTS.filter((_, i) => i % 2 === 1);
  return (
    <section className="fg-marquee fg-reveal" aria-label="Things I have built">
      <span className="fg-marquee-label">things I&rsquo;ve built</span>
      <div className="fg-marquee-rows">
        {row(even, "l")}
        {row(odd, "r")}
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="fg-section" id="about">
      <div className="fg-about fg-reveal">
        <SectionEyebrow id="about" />
        <StaggerHeading text="About me" />
        <div className="fg-prose">
          {ABOUT_PARAGRAPHS.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <dl className="fg-meta">
          {ABOUT_META.map(([k, v]) => (
            <div className="fg-meta-cell" key={k}>
              <dt>{k}</dt>
              <dd>
                {v.split("/").map((part, pi) => (
                  <Fragment key={pi}>
                    {pi > 0 && (
                      <>
                        /<wbr />
                      </>
                    )}
                    {part}
                  </Fragment>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function Stack() {
  return (
    <section className="fg-section" id="stack">
      <div className="fg-stack fg-reveal">
        <SectionEyebrow id="stack" left />
        <StaggerHeading text="Stack" />
        <div className="fg-stack-grid">
          {STACK.map((c, i) => (
            <div className="fg-stack-card" key={c.label} style={{ "--i": i, "--hc": STACK_HUES[i % STACK_HUES.length] } as CSSProperties}>
              <span className="fg-stack-idx">{String(i + 1).padStart(2, "0")}</span>
              <h3>{c.label}</h3>
              <span className="fg-stack-desc">{STACK_CONTEXT[c.label] ?? ""}</span>
              <div className="fg-stack-items">
                {c.items.map((name, ci) => (
                  <span key={name} style={{ "--ci": ci } as CSSProperties}>
                    {name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Experience() {
  return (
    <section className="fg-section" id="experience">
      <div className="fg-exp fg-reveal">
        <SectionEyebrow id="experience" left />
        <StaggerHeading text="Experience" />
        <ol className="fg-timeline">
          {experience.map((e, i) => (
            <li className="fg-timeline-item fg-tl-item" key={e.company} style={{ "--i": i } as CSSProperties}>
              <span className="fg-timeline-num">{String(i + 1).padStart(2, "0")}</span>
              <div className="fg-timeline-body">
                <div className="fg-timeline-top">
                  <h3>{e.role}</h3>
                  <span className="fg-timeline-company">{e.company}</span>
                  <span className="fg-timeline-period">{e.period}</span>
                </div>
                <ul>
                  {e.points.slice(0, 3).map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/**
 * Card glow that follows a mouse pointer: an 840px blob moved with transform (no gradient repaint).
 * The card rect is cached on enter and re-read once after a scroll, so the glow stays under a
 * stationary cursor while the sticky card moves.
 */
function useCardGlow() {
  const glowRef = useRef<HTMLElement>(null);
  const st = useRef({ raf: 0, x: 0, y: 0, rect: null as DOMRect | null, stale: true, card: null as HTMLElement | null, onScroll: null as null | (() => void) });

  const write = () => {
    const s = st.current;
    s.raf = 0;
    if (!s.card || !glowRef.current) return;
    if (s.stale || !s.rect) {
      s.rect = s.card.getBoundingClientRect();
      s.stale = false;
    }
    glowRef.current.style.transform = `translate3d(${(s.x - s.rect.left - 420).toFixed(1)}px, ${(s.y - s.rect.top - 420).toFixed(1)}px, 0)`;
  };
  const schedule = () => {
    if (!st.current.raf) st.current.raf = requestAnimationFrame(write);
  };
  const stop = () => {
    const s = st.current;
    if (s.onScroll) window.removeEventListener("scroll", s.onScroll);
    s.onScroll = null;
    if (s.raf) cancelAnimationFrame(s.raf);
    s.raf = 0;
    s.card = null;
  };
  useEffect(() => stop, []);

  const enabled = (e: ReactPointerEvent<HTMLElement>) => e.pointerType === "mouse" && !motionReduced();
  const handlers = {
    onPointerEnter: (e: ReactPointerEvent<HTMLElement>) => {
      if (!enabled(e)) return;
      const s = st.current;
      s.card = e.currentTarget;
      s.stale = true;
      s.x = e.clientX;
      s.y = e.clientY;
      if (!s.onScroll) {
        s.onScroll = () => {
          st.current.stale = true;
          schedule();
        };
        window.addEventListener("scroll", s.onScroll, { passive: true });
      }
      schedule();
    },
    onPointerMove: (e: ReactPointerEvent<HTMLElement>) => {
      if (!enabled(e)) return;
      const s = st.current;
      if (!s.card) s.card = e.currentTarget;
      s.x = e.clientX;
      s.y = e.clientY;
      schedule();
    },
    onPointerLeave: stop,
  };
  return [glowRef, handlers] as const;
}

function ProjectCard({ p, i }: { p: (typeof FORGE_PROJECTS)[number]; i: number }) {
  const [glowRef, glowHandlers] = useCardGlow();
  const ai = p.tech.filter((t) => AI_TECH.test(t));
  const features = p.features.slice(0, 4);
  const featured = p.highlight === true;
  const [flipped, setFlipped] = useState(false);
  const [turns, setTurns] = useState(0);
  const warmCase = () => prefetchEdition(caseStudyPath(p.slug));
  const flip = (to: boolean) => {
    setFlipped(to);
    setTurns((t) => t + 1);
  };
  return (
    <div className="fg-proj-wrap" style={{ "--i": i, "--pa1": p.accent[0] } as CSSProperties} data-slug={p.slug}>
      <article
        className={`fg-proj-card${featured ? " fg-proj-featured" : ""}${flipped ? " is-flipped" : ""}${turns ? ` fg-turn-${turns % 2}` : ""}`}
        {...glowHandlers}
      >
        <i className="fg-proj-glow" aria-hidden="true" ref={glowRef} />
        <div className="fg-proj-back" aria-hidden={!flipped} inert={!flipped}>
          <div className="fg-proj-top">
            <span className="fg-proj-num">{p.num} · spec sheet</span>
            <button type="button" className="fg-proj-flip" onClick={() => flip(false)}>
              back <span aria-hidden="true">⟲</span>
            </button>
          </div>
          <h3 className="fg-proj-title fg-proj-title-sm">{p.name}</h3>
          <dl className="fg-spec">
            <div>
              <dt>category</dt>
              <dd>{p.cat}</dd>
            </div>
            <div>
              <dt>stack</dt>
              <dd>{p.tech.join(" · ")}</dd>
            </div>
            <div>
              <dt>ai engine</dt>
              <dd>{ai.length ? ai.join(" · ") : "none"}</dd>
            </div>
            <div>
              <dt>features</dt>
              <dd>{p.features.join(" · ")}</dd>
            </div>
            <div>
              <dt>source</dt>
              <dd>
                <a href={p.github} target="_blank" rel="noopener noreferrer">
                  {p.github.replace("https://github.com/", "")}
                </a>
              </dd>
            </div>
            {p.live && (
              <div>
                <dt>live</dt>
                <dd>
                  <a href={p.live} target="_blank" rel="noopener noreferrer">
                    {p.live.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </div>
        <div className="fg-proj-front" aria-hidden={flipped} inert={flipped}>
        <div className="fg-proj-top">
          <span className="fg-proj-num">{p.num}</span>
          <span className="fg-proj-topright">
            <button type="button" className="fg-proj-flip" onClick={() => flip(true)} aria-label={`Show ${p.name} spec sheet`}>
              specs <span aria-hidden="true">⟳</span>
            </button>
            {featured && <span className="fg-proj-badge">featured</span>}
            <span className="fg-proj-cat" style={{ color: `color-mix(in srgb, ${p.accent[0]} 75%, #fff)` }}>
              {p.cat}
            </span>
          </span>
        </div>
        <h3 className="fg-proj-title">{p.name}</h3>
        <p className="fg-proj-desc">{p.tagline}</p>
        <p className="fg-proj-problem">
          <span className="fg-proj-label">problem</span>
          {p.problem}
        </p>
        {features.length > 0 && (
          <ul className="fg-proj-features">
            {features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        )}
        {ai.length > 0 && (
          <p className="fg-proj-ai">
            <span className="fg-proj-label">ai engine</span>
            {ai.join(" · ")}
          </p>
        )}
        <div className="fg-proj-tech">
          {p.tech
            .filter((t) => !AI_TECH.test(t))
            .slice(0, 6)
            .map((t) => (
              <span key={t}>{t}</span>
            ))}
        </div>
        <div className="fg-proj-links">
          <a href={p.github} target="_blank" rel="noopener noreferrer" className="fg-proj-link">
            GitHub <span aria-hidden="true">↗</span>
          </a>
          {p.live && (
            <a href={p.live} target="_blank" rel="noopener noreferrer" className="fg-proj-link">
              Live Demo <span aria-hidden="true">↗</span>
            </a>
          )}
          {hasCaseStudy(p.slug) && (
            <Link
              to={caseStudyPath(p.slug)}
              state={{ from: "/forge" }}
              className="fg-proj-link"
              onPointerEnter={warmCase}
              onFocus={warmCase}
              onTouchStart={warmCase}
            >
              Case study →
            </Link>
          )}
          <button type="button" className="fg-proj-link" data-ask-ai onClick={() => askAssistant(aboutProject(p.name))}>
            Ask AI<span className="sr-only"> about {p.name}</span> <span aria-hidden="true" className="ask-spark">✦</span>
          </button>
        </div>
        <span className="fg-proj-emoji" aria-hidden="true">{p.emoji}</span>
        </div>
      </article>
    </div>
  );
}

const WORK_FILTERS: { key: string; label: string; match: (cat: string) => boolean }[] = [
  { key: "all", label: "all", match: () => true },
  { key: "ai", label: "ai products", match: (c) => c.startsWith("AI") },
  { key: "fullstack", label: "full-stack", match: (c) => c.startsWith("FULL-STACK") },
  { key: "devtool", label: "dev tools", match: (c) => c.includes("DEVELOPER TOOL") },
];

function Work() {
  const [filter, setFilter] = useState("all");
  const active = WORK_FILTERS.find((f) => f.key === filter) ?? WORK_FILTERS[0];
  const visible = useMemo(
    () => FORGE_PROJECTS.filter((p) => active.match(p.cat)),
    [active]
  );

  // j / k step through the cards, f cycles the filter (digits are taken by the edition switcher).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.key === "j" || e.key === "k") {
        const wraps = [...document.querySelectorAll<HTMLElement>(".fg-proj-wrap")];
        if (!wraps.length) return;
        const cur = wraps.findIndex((w) => w.classList.contains("is-focus"));
        let next = e.key === "j" ? cur + 1 : cur - 1;
        if (cur === -1) next = e.key === "j" ? 0 : wraps.length - 1;
        next = Math.max(0, Math.min(wraps.length - 1, next));
        wraps.forEach((w) => w.classList.remove("is-focus"));
        const w = wraps[next];
        w.classList.add("is-focus");
        w.scrollIntoView({ behavior: motionReduced() ? "auto" : "smooth", block: "start" });
        e.preventDefault();
      } else if (e.key === "f") {
        setFilter((cur) => {
          const i = WORK_FILTERS.findIndex((f) => f.key === cur);
          return WORK_FILTERS[(i + 1) % WORK_FILTERS.length].key;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Molten ink under the active filter: measured once per change (and on resize / font load),
  // moved with transform. Hidden until the first measurement so it never flies in from 0,0.
  const groupRef = useRef<HTMLDivElement>(null);
  const inkRef = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const group = groupRef.current;
    const ink = inkRef.current;
    if (!group || !ink) return;
    const place = () => {
      const btn = group.querySelector<HTMLElement>(".fg-filter.is-active");
      if (!btn) return;
      const first = group.dataset.ink !== "ready";
      if (first) ink.style.transition = "none";
      ink.style.transform = `translate(${btn.offsetLeft}px, ${btn.offsetTop}px)`;
      ink.style.width = `${btn.offsetWidth}px`;
      ink.style.height = `${btn.offsetHeight}px`;
      if (first) {
        void ink.offsetWidth;
        ink.style.transition = "";
        group.dataset.ink = "ready";
      }
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(group);
    let live = true;
    document.fonts?.ready.then(() => live && place());
    return () => {
      live = false;
      ro.disconnect();
    };
  }, [filter]);

  // After a filter change, bring a reader who was inside the stack back to its first card.
  const firstFilter = useRef(true);
  useEffect(() => {
    if (firstFilter.current) {
      firstFilter.current = false;
      return;
    }
    const work = document.getElementById("work");
    if (work && work.getBoundingClientRect().top < 0) {
      work.scrollIntoView({ block: "start", behavior: motionReduced() ? "auto" : "smooth" });
    }
  }, [filter]);

  return (
    <section className="fg-section fg-work" id="work">
      <div className="fg-work-head fg-reveal">
        <SectionEyebrow id="work" left />
        <StaggerHeading text="Selected Work" />
        <p className="fg-subhead">
          A selection of AI-powered products, full-stack applications, and developer
          tools — ordered by AI engineering relevance.
        </p>
        <p className="fg-keys" aria-hidden="true">
          <kbd>j</kbd>
          <kbd>k</kbd> cards <kbd>f</kbd> filter <kbd>specs</kbd> flips a card
        </p>
        <div className="fg-work-filters" role="group" aria-label="Filter projects" ref={groupRef}>
          <span className="fg-filter-ink" aria-hidden="true" ref={inkRef} />
          {WORK_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              className={`fg-filter${filter === f.key ? " is-active" : ""}`}
              aria-pressed={filter === f.key}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
              <span className="fg-filter-count">
                {FORGE_PROJECTS.filter((p) => f.match(p.cat)).length}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="fg-work-stack" key={filter}>
        {visible.map((p, i) => (
          <ProjectCard p={p} i={i} key={p.slug} />
        ))}
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section className="fg-section" id="contact">
      <div className="fg-contact fg-reveal">
        <SectionEyebrow id="contact" />
        <h2 className="fg-heading hero-heading fg-glint">Let&rsquo;s build something.</h2>
        <p className="fg-subhead">Have an idea, project, or opportunity? Let&rsquo;s talk.</p>
        <div className="fg-ctas fg-ctas-center">
          <MetalButton variant="gold" className="fg-lb-contact" href={`mailto:${site.email}`}>
            Contact me
          </MetalButton>
          <a className="fg-btn" href={site.github} target="_blank" rel="noopener noreferrer">
            GitHub <span aria-hidden="true">↗</span>
            <Sparks />
          </a>
          <a className="fg-btn" href={site.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn <span aria-hidden="true">↗</span>
            <Sparks />
          </a>
        </div>
      </div>
    </section>
  );
}

function Interfaces() {
  return (
    <section className="fg-section" id="interfaces">
      <div className="fg-interfaces fg-reveal">
        <SectionEyebrow id="interfaces" />
        <StaggerHeading text="Other interfaces" />
        <p className="fg-subhead">
          Seven interfaces, one portfolio — every edition runs the same work through a
          different design system. This is Forge; here are the rest.
        </p>
        <div className="fg-interfaces-grid">
          {INTERFACES.map((it) => (
            <Link
              to={it.to}
              className="fg-interface-card"
              key={it.to}
              onPointerEnter={() => prefetchEdition(it.to)}
              onFocus={() => prefetchEdition(it.to)}
              onTouchStart={() => prefetchEdition(it.to)}
            >
              <span className="fg-interface-key" aria-hidden="true">
                {it.key}
              </span>
              <span className="fg-interface-name">{it.name}</span>
              <span className="fg-interface-desc">{it.desc}</span>
              <span className="fg-interface-arrow" aria-hidden="true">
                ↗
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ForgeFooter() {
  return (
    <footer className="fg-foot fg-reveal">
      <span>Sree Vardhan <span className="fg-dot">V.</span></span>
      <span className="fg-foot-links">
        <a href="#fg-top">Top <span aria-hidden="true">↑</span></a>
        <a href={site.github} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <a href={site.linkedin} target="_blank" rel="noopener noreferrer">
          LinkedIn
        </a>
        <a href={`mailto:${site.email}`}>Email</a>
      </span>
    </footer>
  );
}

/**
 * One spark burst on a .fg-btn for touch taps and keyboard activation (mouse hover keeps its own
 * loop). The class is removed after the last spark, so a burst is never cut short.
 */
function useSparkBursts() {
  useEffect(() => {
    if (motionReduced()) return;
    const timers = new Map<HTMLElement, number>();
    const burst = (el: HTMLElement) => {
      window.clearTimeout(timers.get(el));
      el.classList.remove("is-sparking");
      void el.offsetWidth;
      el.classList.add("is-sparking");
      timers.set(
        el,
        window.setTimeout(() => {
          el.classList.remove("is-sparking");
          timers.delete(el);
        }, 1450)
      );
    };
    const btnFrom = (t: EventTarget | null) => (t instanceof Element ? t.closest<HTMLElement>(".forge-root .fg-btn") : null);
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      const b = btnFrom(e.target);
      if (b) burst(b);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.repeat) return;
      const b = btnFrom(e.target);
      if (b) burst(b);
    };
    document.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
      timers.forEach((t, el) => {
        window.clearTimeout(t);
        el.classList.remove("is-sparking");
      });
    };
  }, []);
}

export function ForgeSite() {
  useForgeReveals();
  useForgeOnscreen();
  // Buttons only: filter chips stay locked to the sliding ink.
  useMagnetic(".fg-btn", 0.24, 7);
  useForgeScroll();
  useForgeSpy();
  useForgeTimelineReveal();
  useSparkBursts();
  const [stoked, setStoked] = useState(readStoked);
  const blobRef = useRef<HTMLElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STOKE_KEY, stoked ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [stoked]);

  // Stoking: the new palette spreads out from the toggle as a circular heat wave (an in-page
  // View Transition scoped by html[data-vt="stoke"]). Reduced motion or no API: an instant swap.
  const onStoke = (from: HTMLElement) => {
    const toggle = () => setStoked((s) => !s);
    const root = document.documentElement;
    if (motionReduced() || !("startViewTransition" in document)) {
      toggle();
      return;
    }
    const r = from.getBoundingClientRect();
    root.style.setProperty("--sx", `${Math.round(r.left + r.width / 2)}px`);
    root.style.setProperty("--sy", `${Math.round(r.top + r.height / 2)}px`);
    root.dataset.vt = "stoke";
    startLocalTransition(() => flushSync(toggle));
    window.setTimeout(() => {
      if (root.dataset.vt === "stoke") delete root.dataset.vt;
    }, 900);
  };

  // A soft glow follows the pointer over the background grid, moved with transform only.
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches || motionReduced()) return;
    let raf = 0;
    let x = 0;
    let y = 0;
    const onMove = (e: globalThis.PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const blob = blobRef.current;
        if (!blob) return;
        blob.style.transform = `translate3d(${x - 380}px, ${y - 380}px, 0)`;
        blob.style.opacity = "1";
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="forge-root" id="fg-top" data-cursor-accent="forge" data-stoked={stoked ? "1" : undefined}>
      <div className="fg-bg" aria-hidden="true">
        <div className="fg-grid" />
        <i className="fg-glow-blob" aria-hidden="true" ref={blobRef} />
      </div>
      <main className="forge-main">
        <ForgeNav />
        <Hero stoked={stoked} onStoke={onStoke} />
        <StatsStrip />
        <Marquee />
        <Work />
        <Stack />
        <Experience />
        <About />
        <Contact />
        <Interfaces />
      </main>
      <ForgeFooter />
    </div>
  );
}

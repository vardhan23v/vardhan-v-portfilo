import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { motion, MotionConfig, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Mail, Menu, X } from "lucide-react";
import { featuredProjects } from "../classic/data/projects";
import { experience } from "../classic/data/experience";
import { skillCategories } from "../classic/data/skills";
import { site } from "../classic/data/site";
import { Icon } from "../classic/lib/icons";
import "./styles/cosmos.css";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-70px" },
  transition: { duration: 0.75, delay, ease: EASE },
});

const SECTIONS = [
  { id: "home", label: "Home" },
  { id: "projects", label: "Projects" },
  { id: "journey", label: "Experience" },
  { id: "stack", label: "Stack" },
  { id: "contact", label: "Contact" },
] as const;

const projects = featuredProjects.filter((p) => p.slug !== "campus-compass");
const [featured, ...rest] = projects;

function seeded(seed: number): () => number {
  let s = seed;
  return () => (((s = (s * 16807) % 2147483647) % 1000) / 1000);
}

const rnd = seeded(20260817);
const STARS = Array.from({ length: 44 }, (_, i) => ({
  left: `${(rnd() * 100).toFixed(2)}%`,
  top: `${(rnd() * 100).toFixed(2)}%`,
  size: `${(1 + rnd() * 2.1).toFixed(2)}px`,
  o: (0.22 + rnd() * 0.58).toFixed(2),
  d: `${(3.5 + rnd() * 5).toFixed(2)}s`,
  del: `${(rnd() * 6).toFixed(2)}s`,
  cls: i % 11 === 0 ? "co-star-gold" : i % 7 === 0 ? "co-star-cyan" : "",
}));

const PANEL_ROWS = [
  ["AI SYSTEM", "ONLINE", "co-pst-online"],
  ["LLM PIPELINE", "ACTIVE", "co-pst-active"],
  ["API", "CONNECTED", "co-pst-connect"],
  ["DATABASE", "READY", "co-pst-ready"],
  ["BUILD", "SHIPPED", "co-pst-shipped"],
] as const;

type Cluster = {
  label: string;
  cx: number;
  cy: number;
  cls: string;
  nodes: { name: string; x: number; y: number }[];
};

const CLUSTERS: Cluster[] = [
  {
    label: "GENERATIVE AI",
    cx: 250,
    cy: 230,
    cls: "co-cl-gold",
    nodes: [
      { name: "Gemini", x: 118, y: 92 },
      { name: "Claude", x: 66, y: 244 },
      { name: "Groq", x: 146, y: 372 },
      { name: "AI Agents", x: 296, y: 392 },
    ],
  },
  {
    label: "FULL STACK",
    cx: 650,
    cy: 230,
    cls: "co-cl-cyan",
    nodes: [
      { name: "React", x: 660, y: 82 },
      { name: "TypeScript", x: 820, y: 120 },
      { name: "Node.js", x: 856, y: 250 },
      { name: "Express.js", x: 786, y: 368 },
      { name: "MongoDB", x: 650, y: 398 },
      { name: "PostgreSQL", x: 488, y: 344 },
    ],
  },
];

function CelestialBackdrop() {
  return (
    <div className="co-bg" aria-hidden="true">
      <div className="co-bg-sky" />
      <div className="co-swirl co-swirl-a" />
      <div className="co-swirl co-swirl-b" />
      <div className="co-swirl co-swirl-c" />
      <div className="co-swirl co-swirl-d" />
      <div className="co-streak co-streak-a" />
      <div className="co-streak co-streak-b" />
      <div className="co-orb co-orb-gold" />
      <div className="co-orb co-orb-cyan" />
      <div className="co-orb co-orb-violet" />
      <div className="co-stars">
        {STARS.map((s, i) => (
          <i
            key={i}
            className={s.cls}
            style={
              {
                left: s.left,
                top: s.top,
                "--s": s.size,
                "--o": s.o,
                "--d": s.d,
                "--del": s.del,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <div className="co-noise" />
    </div>
  );
}

function SystemPanel() {
  return (
    <div className="co-panel" aria-hidden="true">
      <div className="co-panel-head">
        <span>SYSTEM STATUS</span>
        <span className="co-plive">
          <i /> LIVE
        </span>
      </div>
      {PANEL_ROWS.map(([name, status, cls]) => (
        <div className="co-panel-row" key={name}>
          <span>{name}</span>
          <span className={`co-pst ${cls}`}>
            <i /> {status}
          </span>
        </div>
      ))}
    </div>
  );
}

function Silhouette() {
  return (
    <div className="co-stage" aria-hidden="true">
      <div className="co-horizon" />
      <svg className="co-sil" viewBox="0 0 240 260" role="presentation">
        <defs>
          <radialGradient id="coSilGlow" cx="50%" cy="100%" r="72%">
            <stop offset="0%" stopColor="#f5c76a" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#f5c76a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="coSilBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0c1a30" />
            <stop offset="100%" stopColor="#050b18" />
          </linearGradient>
        </defs>
        <ellipse cx="120" cy="236" rx="92" ry="24" fill="url(#coSilGlow)" />
        <circle cx="120" cy="62" r="21" fill="url(#coSilBody)" />
        <path
          d="M151 112 L120 99 L89 112 L81 252 L159 252 Z"
          fill="url(#coSilBody)"
          stroke="rgba(97,218,255,0.28)"
          strokeWidth="1"
        />
        <path d="M89 112 L120 99" stroke="rgba(97,218,255,0.4)" strokeWidth="1.4" fill="none" />
        <path d="M101 52 a20 20 0 0 1 34 -2" stroke="rgba(97,218,255,0.35)" strokeWidth="1.2" fill="none" />
        <circle cx="182" cy="58" r="4" fill="#f5c76a" opacity="0.95" />
        <circle cx="182" cy="58" r="12" fill="none" stroke="rgba(245,199,106,0.35)" strokeWidth="1" />
        <path d="M158 40 h14 M170 28 v12" stroke="rgba(245,199,106,0.5)" strokeWidth="1.2" />
        <path d="M60 118 h18 M69 109 v18" stroke="rgba(97,218,255,0.35)" strokeWidth="1.1" />
      </svg>
    </div>
  );
}

function ExtVisual() {
  return (
    <div className="co-ext" aria-hidden="true">
      <div className="co-ext-bar">
        <i />
        <i />
        <i />
        <span className="co-ext-url">extension-ai · manifest v3</span>
      </div>
      <div className="co-ext-body">
        <div className="co-ext-pane">
          <span className="co-ext-prompt">&gt; build a tab manager</span>
          <br />
          <span>…generates manifest.json · popup · content script</span>
        </div>
        <div className="co-ext-pane">
          <span className="co-ext-ok">✓ working extension</span>
          <br />
          <span className="co-ext-ok">✓ live preview rendered</span>
          <br />
          <span className="co-ext-tag">ZIP READY</span>
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ p, n, index }: { p: (typeof projects)[number]; n: string; index: number }) {
  return (
    <motion.article className="co-card" {...reveal(index * 0.08)}>
      <div
        className="co-card-visual"
        aria-hidden="true"
        style={{ "--ca": p.accent[0], "--ca-glow": `${p.accent[0]}38` } as CSSProperties}
      >
        <div className="co-cv-orb" />
        <span className="co-cv-num">{n} // MISSION</span>
        <span className="co-cv-name">{p.name.toUpperCase()}</span>
      </div>
      <div className="co-card-body">
        <span className="co-card-num">{n}</span>
        <h3>{p.name}</h3>
        <p>{p.tagline}</p>
        <ul className="co-chips" aria-label={`${p.name} technologies`}>
          {p.tech.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <div className="co-cardlinks co-cardlinks--push">
          <a href={p.github} target="_blank" rel="noopener noreferrer">
            GitHub <ArrowUpRight size={13} />
          </a>
          {p.live && (
            <a href={p.live} target="_blank" rel="noopener noreferrer">
              Live demo <ArrowUpRight size={13} />
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}

function Constellation() {
  return (
    <div className="co-constellation" role="img" aria-label="Technology constellation. Generative AI mapped to Gemini, Claude, Groq and AI agents; full stack mapped to React, TypeScript, Node.js, Express.js, MongoDB and PostgreSQL.">
      <svg viewBox="0 0 900 460" role="presentation">
        <defs>
          <radialGradient id="coHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#61daff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#61daff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="coCyanNode" cx="38%" cy="32%" r="70%">
            <stop offset="0%" stopColor="#eafbff" />
            <stop offset="100%" stopColor="#61daff" />
          </radialGradient>
          <radialGradient id="coVioNode" cx="38%" cy="32%" r="70%">
            <stop offset="0%" stopColor="#ece9ff" />
            <stop offset="100%" stopColor="#8b7cff" />
          </radialGradient>
          <radialGradient id="coGoldNode" cx="38%" cy="32%" r="70%">
            <stop offset="0%" stopColor="#fff8e8" />
            <stop offset="100%" stopColor="#f5c76a" />
          </radialGradient>
        </defs>

        <line
          x1="310"
          y1="230"
          x2="560"
          y2="230"
          className="co-cl-line-flow"
          strokeDasharray="2 9"
        />

        {CLUSTERS.map((c) => (
          <g key={c.label} className={c.cls}>
            {c.nodes.map((n) => (
              <line key={n.name} x1={c.cx} y1={c.cy} x2={n.x} y2={n.y} className="co-cl-line" />
            ))}
            <circle cx={c.cx} cy={c.cy} r="30" className="co-cl-halo" />
            <circle cx={c.cx} cy={c.cy} r="19" stroke="rgba(245,199,106,0.5)" strokeWidth="1" fill="none" />
            {c.nodes.map((n) => (
              <g key={n.name}>
                <circle cx={n.x} cy={n.y} r="9" className="co-cl-node" />
                <text x={n.x} y={n.y + 27} className="co-cl-label">
                  {n.name}
                </text>
              </g>
            ))}
            <text x={c.cx} y={c.cy + 5} className="co-cl-main">
              {c.label}
            </text>
          </g>
        ))}
      </svg>
      <div className="co-cc-list">
        {CLUSTERS.map((c) => (
          <div className={`co-cc-cluster ${c.cls}`} key={c.label}>
            <span className="co-cc-name">{c.label}</span>
            <span className="co-cc-chips">
              {c.nodes.map((n) => (
                <span className="co-cc-chip" key={n.name}>
                  {n.name}
                </span>
              ))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CosmosNav({ active, go }: { active: string; go: (id: string) => void }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <nav className="co-nav" aria-label="Primary">
        <span className="co-nav-mark">
          SREE VARDHAN <b>V.</b>
        </span>
        <span className="co-nav-divider" aria-hidden="true" />
        <ul className="co-nav-links">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className={active === s.id ? "is-active" : ""}
                aria-current={active === s.id ? "true" : undefined}
                onClick={() => go(s.id)}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="co-nav-burger"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={16} /> : <Menu size={16} />}
        </button>
      </nav>

      {open && (
        <nav className="co-nav-mobile" aria-label="Primary mobile">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={active === s.id ? "is-active" : ""}
              onClick={() => {
                setOpen(false);
                go(s.id);
              }}
            >
              {s.label}
            </button>
          ))}
        </nav>
      )}
    </>
  );
}

export function CosmosSite() {
  const [active, setActive] = useState("home");
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 900], [0, 120]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-38% 0px -55% 0px" }
    );
    for (const s of SECTIONS) {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    }
    return () => obs.disconnect();
  }, []);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  const stack = skillCategories.map((c) => c.items.map((i) => i.name)).flat();

  return (
    <MotionConfig reducedMotion="user">
      <div className="co-root">
        <CelestialBackdrop />
        <a className="co-skip" href="#projects">
          Skip to content
        </a>
        <CosmosNav active={active} go={go} />

        <main className="co-frame">
          <section className="co-hero" id="home">
            <motion.div className="co-hero-inner" style={{ y: heroY }}>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
              >
                <p className="co-eyebrow">
                  <span className="co-dot" />
                  <span>
                    <b>Sree Vardhan V.</b> — Generative AI Developer
                  </span>
                </p>
                <h1 className="co-title">
                  Building
                  <br />
                  <span className="co-grad">Intelligence</span>
                  <br />
                  into software.
                </h1>
                <p className="co-lede">
                  I build AI-powered products and full-stack systems, combining modern web
                  technologies with Generative AI to turn ideas into useful software.
                </p>
                <div className="co-actions">
                  <a className="co-btn co-btn-solid" href="#projects" onClick={(e) => {
                    e.preventDefault();
                    go("projects");
                  }}>
                    View selected work <ArrowUpRight size={15} />
                  </a>
                  <a className="co-btn" href={site.github} target="_blank" rel="noopener noreferrer">
                    GitHub <ArrowUpRight size={15} />
                  </a>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.32, ease: EASE }}
              >
                <SystemPanel />
              </motion.div>
            </motion.div>

            <Silhouette />
            <div className="co-cue" aria-hidden="true">
              <span />
              scroll to explore
            </div>
          </section>

          <section className="co-section" id="projects">
            <motion.div {...reveal()}>
              <p className="co-label">01 · the work</p>
              <h2 className="co-h2">
                Selected <span className="co-grad">missions</span>
              </h2>
              <p className="co-sub">
                Real products, real repos — AI tooling, full-stack systems, and
                developer utilities that shipped.
              </p>
            </motion.div>

            <motion.div className="co-featured" {...reveal(0.08)}>
              <ExtVisual />
              <div>
                <span className="co-fnum">01</span>
                <h3 className="co-fmark">{featured.name}</h3>
                <p className="co-fdesc">
                  An AI-powered platform that turns natural-language prompts into working
                  Chrome extensions — generated, previewed, and packaged in one flow.
                </p>
                <ul className="co-chips" aria-label={`${featured.name} technologies`}>
                  {featured.tech.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                <div className="co-cardlinks">
                  <a href={featured.github} target="_blank" rel="noopener noreferrer">
                    GitHub <ArrowUpRight size={14} />
                  </a>
                  {featured.live && (
                    <a href={featured.live} target="_blank" rel="noopener noreferrer">
                      Live app <ArrowUpRight size={14} />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>

            <div className="co-grid">
              {rest.map((p, i) => (
                <ProjectCard key={p.slug} p={p} n={String(i + 2).padStart(2, "0")} index={i % 2} />
              ))}
            </div>
          </section>

          <section className="co-section" id="journey">
            <motion.div {...reveal()}>
              <p className="co-label">02 · the journey</p>
              <h2 className="co-h2">Journey</h2>
              <p className="co-sub">
                Shipping software and learning how AI products move from prototype to production.
              </p>
            </motion.div>

            <ol className="co-timeline">
              {experience.map((e, i) => (
                <li className="co-tl-item" key={`${e.company}-${i}`} style={{ "--tl-accent": e.accent } as CSSProperties}>
                  <span className="co-tl-dot" aria-hidden="true" />
                  <motion.div {...reveal(i * 0.06)}>
                    <div className="co-tl-role">{e.role}</div>
                    <div className="co-tl-co">{e.company}</div>
                    <div className="co-tl-period">{e.period}</div>
                    <ul className="co-tl-points">
                      {e.points.map((pt) => (
                        <li key={pt}>{pt}</li>
                      ))}
                    </ul>
                  </motion.div>
                </li>
              ))}
            </ol>
          </section>

          <section className="co-section" id="profile">
            <motion.div {...reveal()}>
              <p className="co-label">03 · profile</p>
              <h2 className="co-h2">Profile</h2>
            </motion.div>

            <div className="co-profile">
              <motion.div className="co-prose" {...reveal(0.06)}>
                <p>
                  I&rsquo;m a <strong>Computer Science undergraduate</strong> focused on Generative
                  AI, full-stack development, and building useful software products.
                </p>
                <p>
                  I enjoy working across the stack — from React interfaces and Node.js APIs to
                  databases and LLM integrations. Most of my learning happens through building
                  and shipping real projects.
                </p>
              </motion.div>
              <motion.dl className="co-meta" {...reveal(0.12)}>
                <div className="co-meta-row">
                  <dt>Location</dt>
                  <dd>Kurnool, India</dd>
                </div>
                <div className="co-meta-row">
                  <dt>Education</dt>
                  <dd>NMAM Institute of Technology</dd>
                </div>
                <div className="co-meta-row">
                  <dt>Focus</dt>
                  <dd>Generative AI · Full Stack · Developer Tools</dd>
                </div>
                <div className="co-meta-row">
                  <dt>Voice</dt>
                  <dd>{site.tagline}</dd>
                </div>
              </motion.dl>
            </div>
          </section>

          <section className="co-section" id="stack">
            <motion.div {...reveal()}>
              <p className="co-label">04 · the system</p>
              <h2 className="co-h2">The system</h2>
              <p className="co-sub">
                The two constellations I build with — {stack.join(" · ")}.
              </p>
            </motion.div>

            <motion.div {...reveal(0.06)}>
              <Constellation />
            </motion.div>
          </section>
        </main>

        <section className="co-contact" id="contact">
          <div className="co-contact-glow" aria-hidden="true" />
          <motion.div {...reveal()}>
            <h2>
              Let&rsquo;s build
              <br />
              <span className="co-grad">something</span>
              <br />
              <span className="co-grad-gold">intelligent.</span>
            </h2>
            <p>Have an idea, project, or opportunity? Let&rsquo;s build something useful.</p>
            <div className="co-actions">
              <a className="co-btn co-btn-solid co-btn-gold" href={`mailto:${site.email}`}>
                Contact me <ArrowUpRight size={15} />
              </a>
              <a className="co-btn" href={site.github} target="_blank" rel="noopener noreferrer">
                GitHub <ArrowUpRight size={15} />
              </a>
            </div>
          </motion.div>
        </section>

        <div className="co-frame">
          <footer className="co-foot">
            <span>
              <span className="co-foot-name">{site.name}.</span> Generative AI Developer
            </span>
            <span className="co-foot-links">
              <a href={site.github} target="_blank" rel="noopener noreferrer">
                <Icon.github width={12} height={12} /> GitHub
              </a>
              <a href={site.linkedin} target="_blank" rel="noopener noreferrer">
                <Icon.linkedin width={12} height={12} /> LinkedIn
              </a>
              <a href={`mailto:${site.email}`}>
                <Mail size={13} style={{ verticalAlign: "-2px" }} /> Email
              </a>
              <Link to="/">Editions</Link>
            </span>
            <span>© 2026 {site.name}</span>
          </footer>
        </div>
      </div>
    </MotionConfig>
  );
}
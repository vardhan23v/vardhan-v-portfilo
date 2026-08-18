import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  MotionConfig,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import { ArrowUpRight, Mail, Menu, X } from "lucide-react";
import { featuredProjects } from "../classic/data/projects";
import { experience } from "../classic/data/experience";
import { site } from "../classic/data/site";
import { Icon } from "../classic/lib/icons";
import "./styles/cosmos.css";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.8, delay, ease: EASE },
});

const SECTIONS = [
  { id: "work", label: "Projects" },
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

const rnd = seeded(20260818);
const STARS = Array.from({ length: 34 }, (_, i) => ({
  left: `${(2 + rnd() * 88).toFixed(2)}%`,
  top: `${(2 + rnd() * 82).toFixed(2)}%`,
  size: `${(1 + rnd() * 1.6).toFixed(2)}px`,
  o: (0.35 + rnd() * 0.55).toFixed(2),
  d: `${(3 + rnd() * 5).toFixed(2)}s`,
  del: `${(rnd() * 6).toFixed(2)}s`,
  gold: i % 5 === 0,
}));

const ORBS: { top: string; size: number; o: number; d: number; left?: string; right?: string }[] = [
  { top: "21%", left: "11%", size: 34, o: 0.8, d: 13 },
  { top: "36%", right: "26%", size: 20, o: 0.7, d: 17 },
  { top: "13%", left: "40%", size: 15, o: 0.55, d: 19 },
  { top: "62%", left: "5%", size: 26, o: 0.45, d: 15 },
  { top: "30%", right: "13%", size: 12, o: 0.85, d: 21 },
];

const CONST_CLUSTERS = [
  {
    label: "GENERATIVE AI",
    cx: 250,
    cy: 230,
    gold: true,
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
    gold: false,
    nodes: [
      { name: "React", x: 660, y: 82 },
      { name: "TypeScript", x: 820, y: 120 },
      { name: "Node.js", x: 856, y: 250 },
      { name: "Express", x: 786, y: 368 },
      { name: "MongoDB", x: 650, y: 398 },
      { name: "PostgreSQL", x: 488, y: 344 },
    ],
  },
] as const;

const CONST_EXTRA = [
  { name: "Python", x: 372, y: 118 },
  { name: "Java", x: 344, y: 336 },
] as const;

function CelestialField() {
  return (
    <div className="sl-sky" aria-hidden="true">
      <div className="sl-sky-base" />
      <div className="sl-stars">
        {STARS.map((s, i) => (
          <i
            key={i}
            className={s.gold ? "sl-star-gold" : ""}
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
      <div className="sl-vignette" />
      <div className="sl-noise" />
    </div>
  );
}

function HeroSky() {
  return (
    <div className="sl-hero-bg" aria-hidden="true">
      <div className="sl-swirls">
        <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" role="presentation">
          <path d="M280 190 C 520 60, 900 95, 1190 250" />
          <path d="M330 270 C 560 150, 920 175, 1170 315" />
          <path d="M700 -50 C 920 20, 1180 35, 1430 190" />
          <path d="M90 560 C 380 420, 780 490, 1090 650" />
          <path d="M-60 710 C 300 550, 820 570, 1230 770" />
          <path d="M240 385 C 410 300, 630 325, 800 435" />
          <path d="M940 60 C 1080 20, 1260 40, 1360 150" />
        </svg>
      </div>
      <div className="sl-orb">
        <i className="sl-orb-ring sl-orb-ring-a" />
        <i className="sl-orb-ring sl-orb-ring-b" />
      </div>
      <div className="sl-orbs">
        {ORBS.map((o, i) => (
          <i
            key={i}
            className="sl-orb-mini"
            style={
              {
                top: o.top,
                ...(o.left !== undefined ? { left: o.left } : { right: o.right }),
                "--o": o.o,
                "--s": `${o.size}px`,
                "--d": `${o.d}s`,
              } as unknown as CSSProperties
            }
          />
        ))}
      </div>
      <div className="sl-horizon-glow" />
    </div>
  );
}

function HeroLandscape() {
  return (
    <div className="sl-landscape" aria-hidden="true">
      <svg viewBox="0 0 1440 340" preserveAspectRatio="none" role="presentation">
        <path
          d="M0 210 C 240 150, 480 200, 720 160 S 1200 140, 1440 190 L1440 340 L0 340 Z"
          fill="#102E59"
          opacity="0.5"
        />
        <path
          d="M0 250 C 300 200, 620 240, 960 210 S 1300 210, 1440 250 L1440 340 L0 340 Z"
          fill="#0A1E3B"
        />
        <path
          d="M0 305 C 260 262, 560 292, 860 276 S 1280 272, 1440 296 L1440 340 L0 340 Z"
          fill="#061226"
        />
        <path d="M560 340 L622 290 L712 290 L772 340 Z" fill="#020711" />
        <circle cx="480" cy="214" r="2" fill="#FFD978" opacity="0.95" />
        <circle cx="480" cy="214" r="7" fill="#FFD978" opacity="0.18" />
        <circle cx="905" cy="196" r="2" fill="#FFD978" opacity="0.9" />
        <circle cx="905" cy="196" r="7" fill="#FFD978" opacity="0.16" />
        <circle cx="1150" cy="238" r="1.6" fill="#FFF0B0" opacity="0.85" />
        <circle cx="300" cy="250" r="1.6" fill="#FFF0B0" opacity="0.8" />
        <circle cx="622" cy="266" r="1.5" fill="#FFD978" opacity="0.8" />
      </svg>
    </div>
  );
}

function Silhouette() {
  return (
    <div className="sl-sil" aria-hidden="true">
      <svg viewBox="0 0 180 240" role="presentation">
        <g transform="rotate(-7 90 140)">
          <circle cx="90" cy="52" r="21" fill="#020711" />
          <path
            d="M151 118 L120 106 L89 120 L81 252 L159 252 L151 118 Z"
            fill="#020711"
            stroke="rgba(2,7,17,0.9)"
            strokeWidth="1"
          />
          <path
            d="M91 30 a20 19 0 0 1 28 -4"
            stroke="rgba(245,201,95,0.5)"
            strokeWidth="1.6"
            fill="none"
          />
          <path
            d="M132 96 a38 46 0 0 1 14 16"
            stroke="rgba(245,201,95,0.3)"
            strokeWidth="1.4"
            fill="none"
          />
        </g>
      </svg>
    </div>
  );
}

function MiniScene() {
  return (
    <div className="sl-scene" aria-hidden="true">
      <div className="sl-scene-orb" />
      <div className="sl-scene-swirl" />
      <div className="sl-scene-hills" />
    </div>
  );
}

function StarlightNav({
  active,
  go,
  scrolled,
}: {
  active: string;
  go: (id: string) => void;
  scrolled: boolean;
}) {
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
      <nav className={`sl-nav${scrolled ? " is-scrolled" : ""}`} aria-label="Primary">
        <span className="sl-nav-name">
          Sree Vardhan <b>V.</b>
        </span>
        <ul className="sl-nav-links">
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
          className="sl-nav-burger"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={15} /> : <Menu size={15} />}
        </button>
      </nav>

      {open && (
        <nav className="sl-nav-mobile" aria-label="Primary mobile">
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

function FeaturedProject({ p }: { p: (typeof projects)[number] }) {
  return (
    <article className="sl-featured">
      <div className="sl-featured-frame">
        <MiniScene />
        <span className="sl-fp-num">01</span>
        <span className="sl-fp-name">EXTENSION AI</span>
        <span className="sl-fp-cat">PRODUCT ENGINEERING · MANIFEST V3</span>
      </div>
      <div className="sl-featured-meta">
        <h3>{p.name}</h3>
        <p>
          An AI-powered platform that turns natural-language prompts into working Chrome
          extensions.
        </p>
        <ul className="sl-chips" aria-label={`${p.name} technologies`}>
          {p.tech.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <div className="sl-links">
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
    </article>
  );
}

function ProjectEntry({ p, n, index }: { p: (typeof projects)[number]; n: string; index: number }) {
  return (
    <motion.article className="sl-entry" {...reveal(index * 0.06)}>
      <div className="sl-entry-frame">
        <MiniScene />
      </div>
      <div className="sl-entry-body">
        <span className="sl-entry-num">{n}</span>
        <h3>{p.name}</h3>
        <p>{p.tagline}</p>
        <a href={p.github} target="_blank" rel="noopener noreferrer">
          GitHub <ArrowUpRight size={12} />
        </a>
      </div>
      <span className="sl-entry-arrow" aria-hidden="true">
        ↗
      </span>
    </motion.article>
  );
}

function Constellation() {
  return (
    <div
      className="sl-constellation"
      role="img"
      aria-label="Technology constellation. Generative AI: Gemini, Claude, Groq and AI Agents. Full stack: React, TypeScript, Node.js, Express, MongoDB and PostgreSQL. Additional languages: Python and Java."
    >
      <svg viewBox="0 0 900 460" role="presentation">
        <line x1="310" y1="230" x2="560" y2="230" className="sl-cst-flow" />
        {CONST_CLUSTERS.map((c) => (
          <g key={c.label} className={c.gold ? "sl-cst-gold" : "sl-cst-blue"}>
            {c.nodes.map((n) => (
              <line key={n.name} x1={c.cx} y1={c.cy} x2={n.x} y2={n.y} className="sl-cst-line" />
            ))}
            <circle cx={c.cx} cy={c.cy} r="4" className="sl-cst-core" />
            {c.nodes.map((n) => (
              <g key={n.name}>
                <circle cx={n.x} cy={n.y} r="2.6" className="sl-cst-node" />
                <text x={n.x} y={n.y + 22} className="sl-cst-label">
                  {n.name}
                </text>
              </g>
            ))}
            <text x={c.cx} y={c.cy + 18} className="sl-cst-main">
              {c.label}
            </text>
          </g>
        ))}
        {CONST_EXTRA.map((n) => (
          <g key={n.name} className="sl-cst-dim">
            <circle cx={n.x} cy={n.y} r="2.2" className="sl-cst-node" />
            <text x={n.x} y={n.y + 22} className="sl-cst-label">
              {n.name}
            </text>
          </g>
        ))}
      </svg>
      <div className="sl-cst-list">
        {[...CONST_CLUSTERS, { label: "MORE", gold: true, nodes: CONST_EXTRA }].map((c) => (
          <div className={`sl-cst-card${c.gold ? " is-gold" : ""}`} key={c.label}>
            <span className="sl-cst-card-name">{c.label}</span>
            <span className="sl-cst-card-chips">
              {c.nodes.map((n) => (
                <span className="sl-cst-chip" key={n.name}>
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

export function CosmosSite() {
  const [active, setActive] = useState("work");
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const heroRef = useRef<HTMLElement | null>(null);

  const heroProg = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const skyY = useTransform(heroProg.scrollYProgress, [0, 1], [0, 150]);
  const hillsY = useTransform(heroProg.scrollYProgress, [0, 1], [0, -70]);
  const heroFade = useTransform(heroProg.scrollYProgress, [0, 0.7], [1, 0]);
  const heroUp = useTransform(heroProg.scrollYProgress, [0, 0.7], [0, -40]);

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 40));

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

  return (
    <MotionConfig reducedMotion="user">
      <div className="sl-root">
        <div className="sl-sky-layer">
          <motion.div style={{ y: skyY }}>
            <CelestialField />
          </motion.div>
        </div>
        <a className="sl-skip" href="#work">
          Skip to content
        </a>
        <StarlightNav active={active} go={go} scrolled={scrolled} />

        <main>
          <section className="sl-hero" id="home" ref={heroRef}>
            <motion.div className="sl-hero-bg" style={{ y: skyY }}>
              <HeroSky />
            </motion.div>
            <motion.div className="sl-hero-copy" style={{ opacity: heroFade, y: heroUp }}>
              <motion.p
                className="sl-eyebrow"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
              >
                <span className="sl-eyebrow-name">Sree Vardhan V.</span>
                <span className="sl-eyebrow-role">— Generative AI Developer</span>
              </motion.p>
              <motion.h1
                className="sl-title"
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.22, ease: EASE }}
              >
                Building
                <br />
                <span className="sl-title-gold">Intelligence</span>
                <br />
                into software.
              </motion.h1>
              <motion.p
                className="sl-lede"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.4, ease: EASE }}
              >
                I build AI-powered products and full-stack systems, combining modern web
                technologies with Generative AI to turn ideas into useful software.
              </motion.p>
              <motion.div
                className="sl-actions"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.52, ease: EASE }}
              >
                <a
                  className="sl-btn sl-btn-gold"
                  href="#work"
                  onClick={(e) => {
                    e.preventDefault();
                    go("work");
                  }}
                >
                  View selected work <ArrowUpRight size={15} />
                </a>
                <a className="sl-btn" href={site.github} target="_blank" rel="noopener noreferrer">
                  GitHub <ArrowUpRight size={15} />
                </a>
              </motion.div>
              <motion.p
                className="sl-meta"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2, delay: 0.72 }}
              >
                AI SYSTEMS · FULL-STACK · GENERATIVE AI · PRODUCT ENGINEERING
              </motion.p>
            </motion.div>

            <motion.div className="sl-landscape-layer" style={{ y: hillsY }}>
              <HeroLandscape />
            </motion.div>
            <Silhouette />
            <div className="sl-cue" aria-hidden="true">
              <span />
              scroll
            </div>
          </section>

          <section className="sl-section" id="work">
            <motion.div {...reveal()}>
              <p className="sl-label">01 · the work</p>
              <h2 className="sl-h2">
                Selected <span className="sl-gold">work</span>
              </h2>
            </motion.div>

            <motion.div {...reveal(0.06)}>
              <FeaturedProject p={featured} />
            </motion.div>

            <div className="sl-entries">
              {rest.map((p, i) => (
                <ProjectEntry key={p.slug} p={p} n={String(i + 2).padStart(2, "0")} index={i % 2} />
              ))}
            </div>
          </section>

          <section className="sl-section" id="journey">
            <motion.div {...reveal()}>
              <p className="sl-label">02 · the journey</p>
              <h2 className="sl-h2">Journey</h2>
            </motion.div>

            <ol className="sl-timeline">
              {experience.map((e, i) => (
                <li className="sl-tl-item" key={`${e.company}-${i}`}>
                  <span className="sl-tl-dot" aria-hidden="true" />
                  <motion.div {...reveal(i * 0.05)}>
                    <div className="sl-tl-role">{e.role}</div>
                    <div className="sl-tl-co">{e.company}</div>
                    <div className="sl-tl-period">{e.period}</div>
                    <p className="sl-tl-line">{e.points[0]}</p>
                  </motion.div>
                </li>
              ))}
            </ol>
          </section>

          <section className="sl-section sl-profile" id="profile">
            <motion.div {...reveal()}>
              <p className="sl-label">03 · profile</p>
              <h2 className="sl-h2">Profile</h2>
              <div className="sl-prose">
                <p>
                  I&rsquo;m a Computer Science undergraduate focused on Generative AI,
                  full-stack development, and building useful software products.
                </p>
                <p>
                  I enjoy working across the stack — from React interfaces and Node.js APIs to
                  databases and LLM integrations.
                </p>
              </div>
              <p className="sl-prose-meta">
                KURNOOL, INDIA · NMAM INSTITUTE OF TECHNOLOGY · GENERATIVE AI / FULL STACK / DEV
                TOOLS
              </p>
            </motion.div>
          </section>

          <section className="sl-section" id="stack">
            <motion.div {...reveal()}>
              <p className="sl-label">04 · the system</p>
              <h2 className="sl-h2">
                The <span className="sl-gold">system</span>
              </h2>
              <p className="sl-sub">The stars I build with.</p>
            </motion.div>

            <motion.div {...reveal(0.06)}>
              <Constellation />
            </motion.div>
          </section>
        </main>

        <section className="sl-contact" id="contact">
          <div className="sl-contact-glow" aria-hidden="true" />
          <div className="sl-contact-hills" aria-hidden="true" />
          <motion.div {...reveal()}>
            <p className="sl-label">05 · the invitation</p>
            <h2 className="sl-contact-title">
              Let&rsquo;s build
              <br />
              <span>something</span>
              <br />
              <span className="sl-gold">intelligent.</span>
            </h2>
            <p className="sl-contact-sub">
              Have an idea, project, or opportunity? Let&rsquo;s build something useful.
            </p>
            <div className="sl-actions">
              <a className="sl-btn sl-btn-gold" href={`mailto:${site.email}`}>
                Contact me <ArrowUpRight size={15} />
              </a>
              <a className="sl-btn" href={site.github} target="_blank" rel="noopener noreferrer">
                GitHub <ArrowUpRight size={15} />
              </a>
            </div>
          </motion.div>
        </section>

        <div className="sl-frame">
          <footer className="sl-foot">
            <span className="sl-foot-name">
              Sree Vardhan V. <span>Generative AI Developer</span>
            </span>
            <span className="sl-foot-links">
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

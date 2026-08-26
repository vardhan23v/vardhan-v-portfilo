import { useEffect, useRef, useState } from "react";
import { InterfaceSwitcher } from "../interface-switcher/InterfaceSwitcher";
import { useTilt } from "../hooks/useTilt";
import { Link } from "react-router-dom";
import { featuredProjects, type Project } from "../classic/data/projects";
import { experience } from "../classic/data/experience";
import { skillCategories } from "../classic/data/skills";
import { site } from "../classic/data/site";
import { Icon } from "../classic/lib/icons";
import { ExpandableTabs, type ExpandableTabItem } from "../components/ui/expandable-tabs";
import "./styles/aurora.css";

export const auroraProjects = featuredProjects;

type Filter = "all" | "ai" | "full-stack" | "tools";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "ai", label: "AI" },
  { id: "full-stack", label: "Full-stack" },
  { id: "tools", label: "Dev tools" },
];

const NAV_TABS: ExpandableTabItem[] = [
  { type: "tab", title: "Home", icon: <Icon.home width={16} height={16} />, value: "home" },
  { type: "tab", title: "About", icon: <Icon.user width={16} height={16} />, value: "about" },
  {
    type: "tab",
    title: "Experience",
    icon: <Icon.briefcase width={16} height={16} />,
    value: "experience",
  },
  { type: "separator" },
  { type: "tab", title: "Projects", icon: <Icon.folderKanban width={16} height={16} />, value: "work" },
  { type: "tab", title: "Contact", icon: <Icon.mail width={16} height={16} />, value: "contact" },
];

function catOf(p: Project): Exclude<Filter, "all"> {
  if (p.slug === "extension-ai") return "tools";
  if (p.slug === "ai-code-reviewer" || p.slug.endsWith("-ai")) return "ai";
  return "full-stack";
}

function useIstTime() {
  const [t, setT] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const tick = () => setT(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);
  return t;
}

export function AuroraDetails({ p }: { p: Project }) {
  const [open, setOpen] = useState(false);
  const ctrl = `au-eng-${p.slug}`;
  return (
    <div className="au-eng">
      <button
        type="button"
        className="au-eng-btn"
        aria-expanded={open}
        aria-controls={ctrl}
        onClick={() => setOpen(!open)}
      >
        <span>engineering details</span>
        <span className={`au-eng-arrow${open ? " open" : ""}`} aria-hidden="true">
          →
        </span>
      </button>
      <div className={`au-eng-wrap${open ? " open" : ""}`} id={ctrl}>
        <div className="au-eng-body">
          <div>
            <span className="au-eng-label">the problem</span>
            <p>{p.problem}</p>
          </div>
          <div>
            <span className="au-eng-label">what it does</span>
            <ul>
              {p.features.slice(0, 4).map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
          <div>
            <span className="au-eng-label">stack</span>
            <p>{p.tech.join(" · ")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuroraStat({ value, label }: { value: number | null; label: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || value === null) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        io.disconnect();
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          el.textContent = String(value);
          return;
        }
        const t0 = performance.now();
        const dur = 1200;
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = String(Math.round(eased * value));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value]);
  return (
    <div className="au-stat">
      <span className="au-stat-value" ref={ref}>
        {value === null ? "—" : 0}
      </span>
      <span className="au-stat-label">{label}</span>
    </div>
  );
}

const GITHUB_FOLLOWERS = 31;

function FeaturedProject({ p }: { p: Project }) {
  const ref = useTilt<HTMLDivElement>(4, ".au-ft");
  return (
    <div ref={ref} className="au-ft-tilt">
      <article className="au-ft" style={{ "--pa1": p.accent[0] } as React.CSSProperties}>
        <div className="au-ft-copy">
          <span className="au-rank">Project 01 · flagship</span>
          <h3 className="au-ft-name">{p.name}</h3>
          <p className="au-ft-tagline">{p.tagline}</p>
          <div className="au-card-tech">
            {p.tech.slice(0, 7).map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
          <div className="au-card-links">
            <a href={p.github} target="_blank" rel="noopener noreferrer">
              GitHub <span aria-hidden="true">↗</span>
            </a>
            {p.live && (
              <a href={p.live} target="_blank" rel="noopener noreferrer">
                Live Demo <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
          <AuroraDetails p={p} />
        </div>
        <div className="au-ft-visual" aria-hidden="true">
          <div className="au-ft-bloom" style={{ "--pa1": p.accent[0] } as React.CSSProperties} />
          <div className="au-ft-beam au-ft-beam-a" />
          <div className="au-ft-beam au-ft-beam-b" />
          <div className="au-ft-core">
            <span className="au-ft-glyph">{p.emoji}</span>
            <span className="au-ft-vname">{p.name}</span>
            <span className="au-ft-vcap">
              {p.slug} · v1.0 · prod
            </span>
          </div>
          <span className="au-ft-vtag">featured</span>
        </div>
      </article>
    </div>
  );
}

function AuroraCard({ p, n, i }: { p: Project; n: string; i: number }) {
  const ref = useTilt<HTMLDivElement>(5, ".au-card");
  return (
    <div ref={ref} className="au-tilt" style={{ "--i": i } as React.CSSProperties}>
      <article className="au-card" style={{ "--pa1": p.accent[0] } as React.CSSProperties}>
        <span className="au-rank">{n}</span>
        <h3 className="au-card-name">{p.name}</h3>
        <p className="au-card-tagline">{p.tagline}</p>
        <div className="au-card-tech">
          {p.tech.slice(0, 5).map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <div className="au-card-links">
          <a href={p.github} target="_blank" rel="noopener noreferrer">
            GitHub <span aria-hidden="true">↗</span>
          </a>
          {p.live && (
            <a href={p.live} target="_blank" rel="noopener noreferrer">
              Live Demo <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
      </article>
    </div>
  );
}

function CopyEmail() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
    } catch {
      /* clipboard unavailable — fall back silently */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      type="button"
      className={`aurora-btn au-copy${copied ? " au-copied" : ""}`}
      onClick={copy}
      aria-live="polite"
    >
      {copied ? "copied ✓" : "copy email"}
    </button>
  );
}

export function AuroraSite() {
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<number | null>(0);
  const [scrolled, setScrolled] = useState(false);
  const ist = useIstTime();
  const followers = GITHUB_FOLLOWERS;

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = NAV_TABS.findIndex((t) => t.type === "tab" && t.value === e.target.id);
          if (i >= 0) setSelected(i);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    for (const t of NAV_TABS) {
      if (t.type !== "tab" || !t.value) continue;
      const el = document.getElementById(t.value);
      if (el) obs.observe(el);
    }
    return () => obs.disconnect();
  }, []);

  const handleSelect = (i: number | null) => {
    setSelected(i);
    if (i === null) return;
    const t = NAV_TABS[i];
    if (t.type !== "tab" || !t.value) return;
    const el = document.getElementById(t.value);
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const featured = auroraProjects[0];
  const counts = auroraProjects.reduce(
    (m, p) => {
      m[catOf(p)]++;
      return m;
    },
    { ai: 0, "full-stack": 0, tools: 0 } as Record<Exclude<Filter, "all">, number>
  );
  const shown = auroraProjects.slice(1).filter((p) => filter === "all" || catOf(p) === filter);
  const showFeatured = filter === "all" || catOf(featured) === filter;

  const stackStrip = skillCategories.flatMap((c) => c.items.map((i) => i.name));
  const statData = [
    { value: auroraProjects.length, label: "shipped products" },
    { value: experience.length, label: "roles & internships" },
    { value: skillCategories.reduce((s, c) => s + c.items.length, 0), label: "stack technologies" },
    { value: followers, label: "github followers" },
  ];

  return (
    <div className="aurora-root" data-cursor-off>
      <div className="aurora-bg" aria-hidden="true">
        <div className="au-glow au-glow-purple" />
        <div className="au-glow au-glow-blue" />
        <div className="au-glow au-glow-cyan" />
      </div>

      <div className="aurora-inner">
        <nav className={`aurora-nav${scrolled ? " is-scrolled" : ""}`} aria-label="Main">
          <Link to="/" className="aurora-wordmark">
            {site.name}
            <span className="dot">.</span>
          </Link>
          <ExpandableTabs
            className="aurora-nav-tabs"
            tabs={NAV_TABS}
            selected={selected}
            onSelect={handleSelect}
            activeColor="au-nav-tab-active"
          />
          <InterfaceSwitcher current="aurora" />
        </nav>

        <header className="aurora-hero" id="home">
          <div className="au-hero-copy">
            <p className="aurora-name">
              Sree Vardhan <span className="aurora-grad">V.</span>
            </p>
            <p className="aurora-eyebrow">
              <span className="glow-dot" aria-hidden="true" />
              generative ai · full-stack · product engineering
            </p>
            <h1 className="aurora-title">
              Where code meets <span className="aurora-grad">light.</span>
            </h1>
            <p className="aurora-lede">{site.tagline}</p>
            <p className="aurora-sub">
              AI-powered products and full-stack systems, shipped end-to-end — from
              LLM integration and agent tooling to the deployed app. Computer Science
              undergraduate at NMAM Institute of Technology.
            </p>
            <div className="aurora-actions">
              <a className="aurora-btn aurora-btn-solid" href="#work">
                View selected work <span aria-hidden="true">→</span>
              </a>
              <a className="aurora-btn" href={site.github} target="_blank" rel="noopener noreferrer">
                GitHub <span aria-hidden="true">↗</span>
              </a>
              <a className="aurora-btn" href={site.resume} target="_blank" rel="noopener noreferrer">
                Resume <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
          <div className="au-hero-visual au-reveal" aria-hidden="true">
            <div className="au-sys-head">
              <span>build system</span>
              <span className="au-sys-live">
                <i className="au-sys-dot" /> system online
              </span>
            </div>
            <div className="au-sys-list">
              <span className="au-sys-rail" />
              {["React", "Node.js", "Database", "LLM", "Product"].map((s, i) => (
                <div className="au-sys-row" key={s}>
                  <span className={`au-sys-name${i === 4 ? " au-sys-name-last" : ""}`}>{s}</span>
                  {i === 4 ? (
                    <span className="au-sys-chip">deployed</span>
                  ) : (
                    <span className="au-sys-mark" />
                  )}
                </div>
              ))}
            </div>
            <div className="au-sys-foot">
              <span>react → node → database → llm → product</span>
              <span className="au-sys-clock">ist {ist}</span>
            </div>
          </div>
        </header>

        <div className="au-marquee au-reveal" aria-hidden="true">
          <div className="au-marquee-track">
            <span className="au-marquee-group">{stackStrip.join("  ·  ")}  ·  </span>
            <span className="au-marquee-group">{stackStrip.join("  ·  ")}  ·  </span>
          </div>
        </div>

        <div className="aurora-stats au-reveal" aria-label="Portfolio stats">
          {statData.map((s) => (
            <AuroraStat key={s.label} value={s.value} label={s.label} />
          ))}
        </div>

        <section className="aurora-section" id="work" aria-labelledby="aurora-work-title">
          <div className="aurora-head au-reveal">
            <div>
              <h2 id="aurora-work-title">Selected work</h2>
              <p className="aurora-subhead">
                A few things I&rsquo;ve built across AI, full-stack development, and
                developer tooling.
              </p>
            </div>
            <span className="tag">built &amp; shipped</span>
          </div>
          <div className="au-filters" role="group" aria-label="Filter projects by category">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`au-filter${filter === f.id ? " is-active" : ""}`}
                aria-pressed={filter === f.id}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
                <span className="au-filter-count">
                  {f.id === "all" ? auroraProjects.length : counts[f.id]}
                </span>
              </button>
            ))}
          </div>
          <div className="au-projects au-reveal">
            {showFeatured && <FeaturedProject key={`ft-${filter}`} p={featured} />}
            {shown.length > 0 && (
              <div className="aurora-grid" key={filter}>
                {shown.map((p) => (
                  <AuroraCard
                    key={p.slug}
                    p={p}
                    n={String(auroraProjects.indexOf(p) + 1).padStart(2, "0")}
                    i={shown.indexOf(p)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="aurora-section" id="experience" aria-labelledby="aurora-exp-title">
          <div className="aurora-head au-reveal">
            <div>
              <h2 id="aurora-exp-title">Experience</h2>
              <p className="aurora-subhead">
                Where I&rsquo;ve been building — from AI testing to full-stack
                engineering.
              </p>
            </div>
            <span className="tag">the log</span>
          </div>
          <div className="au-exp-list au-reveal">
            {experience.map((e) => (
              <div className="au-exp-row" key={e.company}>
                <span className="au-exp-dot" style={{ background: e.accent }} aria-hidden="true" />
                <div className="au-exp-main">
                  <div className="au-exp-role">{e.role}</div>
                  <div className="au-exp-company">{e.company}</div>
                </div>
                <span className="au-exp-period">{e.period}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="aurora-section" id="about" aria-labelledby="aurora-about-title">
          <div className="au-about">
            <div className="au-about-head">
              <h2 id="aurora-about-title">About</h2>
              <span className="tag">whoami</span>
            </div>
            <div className="au-about-body">
              <div className="au-prose au-reveal">
                <p>
                  I&rsquo;m a Computer Science undergraduate focused on Generative AI,
                  full-stack development, and building useful software products.
                </p>
                <p>
                  I enjoy working across the stack — from React interfaces and Node.js
                  APIs to databases and LLM integrations. Most of my learning happens
                  through building and shipping real projects.
                </p>
              </div>
              <dl className="au-meta au-reveal">
                <div className="au-meta-row">
                  <dt>Location</dt>
                  <dd>{site.location}</dd>
                </div>
                <div className="au-meta-row">
                  <dt>Education</dt>
                  <dd>NMAM Institute of Technology</dd>
                </div>
                <div className="au-meta-row">
                  <dt>Focus</dt>
                  <dd>Generative AI · Full Stack · Developer Tools</dd>
                </div>
              </dl>
              <div className="au-skills au-reveal">
                {skillCategories.map((c) => (
                  <div className="au-skill-line" key={c.label}>
                    <span className="au-skill-label">{c.label}</span>
                    <span className="au-skill-items">{c.items.map((i) => i.name).join(" · ")}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="aurora-section" id="contact" aria-labelledby="aurora-contact-title">
          <div className="au-contact au-reveal">
            <h2 id="aurora-contact-title">
              Let&rsquo;s build something <span className="grad">beautiful.</span>
            </h2>
            <p>Open to internships, collaborations and interesting problems.</p>
            <div className="aurora-actions">
              <a className="aurora-btn aurora-btn-solid" href={`mailto:${site.email}`}>
                {site.email}
              </a>
              <CopyEmail />
            </div>
            <div className="au-contact-links">
              <a href={site.linkedin} target="_blank" rel="noopener noreferrer">
                <Icon.linkedin width={15} height={15} /> {site.linkedin.replace("https://www.", "")}
              </a>
              <a href={site.github} target="_blank" rel="noopener noreferrer">
                <Icon.github width={15} height={15} /> {site.github.replace("https://", "")}
              </a>
            </div>
          </div>
        </section>

        <footer className="aurora-foot au-reveal">
          <span>© 2026 {site.name}</span>
          <span className="aurora-foot-links">
            <Link to="/">editions</Link>
            <a href={site.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a href={`mailto:${site.email}`}>Email</a>
          </span>
        </footer>
      </div>
    </div>
  );
}
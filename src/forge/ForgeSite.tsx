import { useEffect, useState, type CSSProperties, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import { InterfaceSwitcher } from "../interface-switcher/InterfaceSwitcher";
import { LiquidButton, MetalButton } from "../components/ui/LiquidButton";
import { featuredProjects, type Project } from "../classic/data/projects";
import { experience } from "../classic/data/experience";
import { skillCategories } from "../classic/data/skills";
import { site } from "../classic/data/site";
import "./styles/forge.css";

const CATEGORY: Record<string, string> = {
  "extension-ai": "AI PRODUCT · DEVELOPER TOOL",
  "ai-code-reviewer": "AI · DEVELOPER TOOL",
  "careerforge-pro": "AI · CAREER PLATFORM",
  "vard-ai": "AI ASSISTANT",
  "disastermind-ai": "AI · EMERGENCY OPERATIONS",
  drivenest: "FULL-STACK · DATABASE",
};

function getCategory(p: Project): string {
  return CATEGORY[p.slug] ?? "AI · FULL-STACK";
}

const FORGE_PROJECTS = featuredProjects.map((p, i) => ({
  ...p,
  num: `0${i + 1}`,
  cat: getCategory(p),
}));

const ABOUT_PARAGRAPHS = [
  "I'm a Computer Science undergraduate focused on Generative AI, full-stack development, and building useful software products.",
  "I enjoy working across the stack — from React interfaces and Node.js APIs to databases and LLM integrations. Most of my learning happens through building, experimenting, and shipping real projects.",
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
    items: c.items
      .map((i) => STACK_ALIAS[i.name] ?? i.name)
      .concat(c.label === "Frontend" ? ["Tailwind CSS"] : c.label === "AI / LLM" ? ["Generative AI"] : []),
  }));
}

const STACK = stackGroups();

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

function useMarqueeDrift() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tracks = Array.from(document.querySelectorAll<HTMLElement>(".fg-marquee-track"));
    if (!tracks.length) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY;
        tracks.forEach((t, i) => {
          const half = (t.firstElementChild as HTMLElement | null)?.offsetWidth ?? 0;
          if (!half) return;
          const off = (y * 0.35) % half;
          t.style.transform = i % 2 === 0 ? `translate3d(${off}px, 0, 0)` : `translate3d(${-off}px, 0, 0)`;
        });
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
}

function useForgeScrollFX() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bar = document.querySelector<HTMLElement>(".fg-progress");
    const hero = document.querySelector<HTMLElement>(".fg-hero");
    const tl = document.querySelector<HTMLElement>(".fg-timeline");
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      if (bar) bar.style.transform = `scaleX(${Math.min(1, y / max)})`;
      if (hero) {
        hero.style.transform = `translateY(${y * 0.1}px)`;
        hero.style.opacity = String(Math.max(0, 1 - y / 620));
      }
      if (tl) {
        const r = tl.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (window.innerHeight * 0.72 - r.top) / Math.max(1, r.height)));
        tl.style.setProperty("--tl", String(p));
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
}

function useForgeSpy() {
  useEffect(() => {
    const links = [
      ...document.querySelectorAll<HTMLAnchorElement>(".fg-nav-links a[href^='#'], .fg-nav-panel a[href^='#']"),
    ];
    const ids = ["about", "experience", "work", "contact"];
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
  const links: [string, string][] = [
    ["#about", "About"],
    ["#experience", "Experience"],
    ["#work", "Projects"],
    ["#contact", "Contact"],
  ];
  const go = (e: MouseEvent<HTMLAnchorElement>) => {
    (e.currentTarget as HTMLAnchorElement).blur();
    setOpen(false);
  };
  return (
    <nav className="fg-nav" aria-label="Main">
      <Link to="/" className="fg-nav-name">
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
        {links.map(([href, label]) => (
          <a key={href} href={href} onClick={go}>
            {label}
          </a>
        ))}
        <a href={site.github} target="_blank" rel="noopener noreferrer" onClick={go}>
          GitHub <span aria-hidden="true">↗</span>
        </a>
      </div>
    </nav>
  );
}

function Hero() {
  const pipeline: [string, string, string][] = [
    ["Frontend", "React · type-safe UI", "#7DD3FC"],
    ["API", "Node.js · REST", "#93C5FD"],
    ["Database", "Mongo · MySQL · Prisma", "#A78BFA"],
    ["LLM", "Gemini · Groq · Claude", "#C4B5FD"],
    ["Product", "shipped & live", "#BBCCD7"],
  ];
  return (
    <header className="fg-hero">
      <div className="fg-hero-copy">
        <p className="fg-eyebrow fg-enter" style={{ "--d": "0s" } as CSSProperties}>
          generative ai · full-stack · product engineering
        </p>
        <p className="fg-name fg-enter" style={{ "--d": "0.08s" } as CSSProperties}>
          Sree Vardhan V.
        </p>
        <h1 className="fg-hero-heading fg-enter" style={{ "--d": "0.16s" } as CSSProperties}>
          Where code meets intelligence.
        </h1>
        <p className="fg-lede fg-enter" style={{ "--d": "0.3s" } as CSSProperties}>
          Building AI-powered products that feel simple to use.
        </p>
        <p className="fg-description fg-enter" style={{ "--d": "0.4s" } as CSSProperties}>
          I build AI-powered products and full-stack systems, combining modern web
          technologies with Generative AI to turn ideas into useful software.
        </p>
        <div className="fg-ctas fg-enter" style={{ "--d": "0.5s" } as CSSProperties}>
          <LiquidButton variant="default" size="xxl" className="fg-lb-hero" href="#work">
            View selected work <span aria-hidden="true">→</span>
          </LiquidButton>
          <a className="fg-btn" href={site.github} target="_blank" rel="noopener noreferrer">
            GitHub <span aria-hidden="true">↗</span>
          </a>
          <a className="fg-btn" href={site.resume} target="_blank" rel="noopener noreferrer">
            Resume <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
      <div className="fg-hero-visual fg-enter" style={{ "--d": "0.34s" } as CSSProperties} aria-hidden="true">
        <div className="fg-pipe">
          <div className="fg-pipe-head">
            <span>build pipeline</span>
            <span className="fg-pipe-status">
              <i className="fg-pipe-dot" /> prod
            </span>
          </div>
          <div className="fg-pipe-rows">
            {pipeline.map(([name, meta, color], i) => (
              <div className="fg-pipe-row" key={name} style={{ "--pc": color, "--i": i } as CSSProperties}>
                <span className="fg-pipe-idx">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="fg-pipe-name">{name}</span>
                <span className="fg-pipe-arrow">→</span>
                <span className="fg-pipe-meta">{meta}</span>
              </div>
            ))}
          </div>
          <div className="fg-pipe-foot">frontend → api → database → llm → product</div>
        </div>
      </div>
    </header>
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
      {row(even, "l")}
      {row(odd, "r")}
    </section>
  );
}

function About() {
  return (
    <section className="fg-section" id="about">
      <div className="fg-about fg-reveal">
        <h2 className="fg-heading hero-heading">About me</h2>
        <div className="fg-prose">
          {ABOUT_PARAGRAPHS.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <dl className="fg-meta">
          {ABOUT_META.map(([k, v]) => (
            <div className="fg-meta-cell" key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
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
        <h2 className="fg-heading hero-heading">Stack</h2>
        <div className="fg-stack-grid">
          {STACK.map((c, i) => (
            <div className="fg-stack-card" key={c.label} style={{ "--i": i } as CSSProperties}>
              <span className="fg-stack-idx">{String(i + 1).padStart(2, "0")}</span>
              <h3>{c.label}</h3>
              <div className="fg-stack-items">
                {c.items.map((name) => (
                  <span key={name}>{name}</span>
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
        <h2 className="fg-heading hero-heading">Experience</h2>
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

function ProjectCard({ p, i }: { p: (typeof FORGE_PROJECTS)[number]; i: number }) {
  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    e.currentTarget.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
  };
  return (
    <div className="fg-proj-wrap" style={{ "--i": i } as CSSProperties}>
      <article className="fg-proj-card" style={{ "--pa1": p.accent[0] } as CSSProperties} onMouseMove={onMove}>
        <div className="fg-proj-top">
          <span className="fg-proj-num">{p.num}</span>
          <span className="fg-proj-cat" style={{ color: p.accent[0] }}>
            {p.cat}
          </span>
        </div>
        <h3 className="fg-proj-title">{p.name}</h3>
        <p className="fg-proj-desc">{p.tagline}</p>
        <div className="fg-proj-tech">
          {p.tech.slice(0, 6).map((t) => (
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
        </div>
      </article>
    </div>
  );
}

function Work() {
  return (
    <section className="fg-section fg-work" id="work">
      <div className="fg-work-head fg-reveal">
        <h2 className="fg-heading hero-heading">Selected Work</h2>
        <p className="fg-subhead">
          A selection of AI-powered products, full-stack applications, and developer
          tools I&rsquo;ve built.
        </p>
      </div>
      <div className="fg-work-stack">
        {FORGE_PROJECTS.map((p, i) => (
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
        <h2 className="fg-heading hero-heading">Let&rsquo;s build something.</h2>
        <p className="fg-subhead">Have an idea, project, or opportunity? Let&rsquo;s talk.</p>
        <div className="fg-ctas fg-ctas-center">
          <MetalButton variant="gold" className="fg-lb-contact" href={`mailto:${site.email}`}>
            Contact me
          </MetalButton>
          <a className="fg-btn" href={site.github} target="_blank" rel="noopener noreferrer">
            GitHub <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}

function ForgeFooter() {
  return (
    <footer className="fg-foot">
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

export function ForgeSite() {
  useForgeReveals();
  useMarqueeDrift();
  useForgeScrollFX();
  useForgeSpy();
  useForgeTimelineReveal();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="forge-root" id="fg-top" data-cursor-accent="forge">
      <div className="fg-bg" aria-hidden="true" />
      <div className="fg-progress" aria-hidden="true" />
      <main className="forge-main">
        <ForgeNav />
        <Hero />
        <Marquee />
        <About />
        <Stack />
        <Experience />
        <Work />
        <Contact />
      </main>
      <ForgeFooter />
    </div>
  );
}
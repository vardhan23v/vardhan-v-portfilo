import { Link } from "react-router-dom";
import { User, Hammer, Crosshair, Quote, Workflow, ExternalLink } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "../../lib/icons";
import { site } from "../../data/site";
import { skillCategories } from "../../data/skills";
import { Reveal } from "../../components/ui/Reveal";

const STEPS = [
  { title: "Understand", text: "Read the real problem before writing a line — users, constraints, edge cases." },
  { title: "Design", text: "Smallest honest architecture that can grow: data model, API shape, UI states." },
  { title: "Build", text: "TypeScript end-to-end, AI-assisted but human-reviewed, tested where it matters." },
  { title: "Ship", text: "Deploy early, watch it break, fix it fast. Docs and source included." },
];

const EDITIONS = [
  { label: "Terminal", to: "/terminal", num: "01" },
  { label: "Classic", to: "/classic", num: "02" },
  { label: "Paper", to: "/paper", num: "03" },
  { label: "Aurora", to: "/aurora", num: "04" },
  { label: "Forge", to: "/forge", num: "05" },
];

const topStack = skillCategories
  .flatMap((c) => c.items.map((i) => i.name))
  .filter((n) => ["React", "TypeScript", "Node.js", "MCP", "Socket.IO", "Prisma"].includes(n));

export function AboutPage() {
  return (
    <div className="mac-page">
      <div className="page-header">
        <div className="page-header__eyebrow">About</div>
        <h1 className="page-header__title">A short essay on how I work.</h1>
      </div>

      <Reveal>
        <div className="mac-card" style={{ display: "flex", gap: "var(--sp-4)", alignItems: "center" }}>
          <span className="mac-avatar" style={{ width: 56, height: 56, fontSize: "1.2rem" }} aria-hidden="true">
            SV
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "var(--text-lg)", fontWeight: 700 }}>{site.name}</div>
            <div style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>{site.shortTitle}</div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginTop: 2 }}>
              {site.location}
            </div>
          </div>
          <div style={{ display: "flex", gap: "var(--sp-2)" }}>
            <a className="mac-toolbar__btn" href={site.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <GithubIcon size={16} />
            </a>
            <a className="mac-toolbar__btn" href={site.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <LinkedinIcon size={16} />
            </a>
            <a className="mac-toolbar__btn" href={`mailto:${site.email}`} aria-label="Email">
              <ExternalLink style={{ width: 15, height: 15 }} />
            </a>
          </div>
        </div>
      </Reveal>

      <div className="mac-section">
        <Reveal>
          <h2 className="mac-section-title">
            <User /> Who I am
          </h2>
        </Reveal>
        <Reveal index={1}>
          <p className="about-section__text about-section__text--lede">
            I&apos;m {site.name}, a Computer Science student at NMAM Institute of Technology (NITTE) and a
            Generative AI Developer &amp; Full-Stack Developer based in {site.location}. I build AI-powered web
            applications, developer tools, and full-stack products — not just prototypes, but production systems
            that ship.
          </p>
        </Reveal>
      </div>

      <div className="mac-section">
        <Reveal>
          <h2 className="mac-section-title">
            <Hammer /> What I build
          </h2>
        </Reveal>
        <Reveal index={1}>
          <p className="about-section__text">
            I focus on the intersection of AI and full-stack engineering: LLM-powered developer tools, real-time
            systems, browser extensions, ERP platforms, and interactive data visualizations. I&apos;m drawn to
            problems where AI can meaningfully accelerate a workflow — not as a gimmick, but as a core engine.
          </p>
        </Reveal>
        <Reveal index={2}>
          <div className="mac-pills" style={{ marginTop: "var(--sp-3)" }}>
            {topStack.map((t) => (
              <span className="mac-tag" key={t}>
                {t}
              </span>
            ))}
          </div>
        </Reveal>
      </div>

      <div className="mac-section">
        <Reveal>
          <h2 className="mac-section-title">
            <Crosshair /> Current focus
          </h2>
        </Reveal>
        <Reveal index={1}>
          <p className="about-section__text">
            AI agents with MCP tool use, multi-provider LLM orchestration, streaming architectures, and
            production-grade TypeScript — plus real-time systems with Socket.IO and server-authoritative state.
          </p>
        </Reveal>
      </div>

      <div className="mac-section">
        <Reveal>
          <h2 className="mac-section-title">
            <Workflow /> How I work
          </h2>
        </Reveal>
        <div className="about-steps">
          {STEPS.map((s, i) => (
            <Reveal key={s.title} index={Math.min(i, 3)}>
              <div className="about-step">
                <span className="about-step__n">0{i + 1}</span>
                <div className="about-step__t">{s.title}</div>
                <div className="about-step__d">{s.text}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="mac-section">
        <Reveal>
          <h2 className="mac-section-title">
            <Quote /> Philosophy
          </h2>
        </Reveal>
        <Reveal index={1}>
          <p className="about-section__text">
            I build with AI. I ship with code. Understand the real problem first, then engineer a solution
            that&apos;s honest about what it does. No inflated metrics, no buzzword stacking — just products that
            work and code I&apos;m proud of.
          </p>
        </Reveal>
      </div>

      <div className="mac-section">
        <Reveal>
          <h2 className="mac-section-title">Same work, five more interfaces</h2>
        </Reveal>
        <div className="mac-editions">
          {EDITIONS.map((e, i) => (
            <Reveal key={e.to} index={i}>
              <Link className="mac-edition" to={e.to}>
                <span className="mac-edition__num">{e.num}</span>
                <span className="mac-edition__name">{e.label}</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import {
  Briefcase,
  MapPin,
  GraduationCap,
  Rocket,
  ExternalLink,
  Sparkles,
  FolderKanban,
} from "lucide-react";
import { useNav } from "../../hooks/useNav";
import { useWindowManager } from "../../hooks/useWindowManager";
import { useGithub } from "../../hooks/useGithub";
import { site } from "../../data/site";
import { featuredProjects } from "../../data/projects";
import { experience } from "../../data/experience";
import { skillCategories, exploring } from "../../data/skills";
import { certifications } from "../../data/experience";
import { CountUp } from "../../components/ui/CountUp";
import { Reveal } from "../../components/ui/Reveal";
import { Tilt } from "../../components/ui/Tilt";
import { GithubIcon } from "../../lib/icons";


const EDITIONS = [
  { label: "Terminal", to: "/terminal", num: "01" },
  { label: "Classic", to: "/classic", num: "02" },
  { label: "Paper", to: "/paper", num: "03" },
  { label: "Aurora", to: "/aurora", num: "04" },
  { label: "Forge", to: "/forge", num: "05" },
];

const techTotal = skillCategories.reduce((a, c) => a + c.items.length, 0);

export function OverviewPage() {
  const { navigate, setOpenProject } = useNav();
  const { openWindow } = useWindowManager();
  const { followers, repos, loading } = useGithub();
  const preview = featuredProjects.slice(0, 3);
  const goProjects = () => {
    navigate("projects");
    openWindow("projects");
  };

  return (
    <>
      <div className="mac-page">
        <Reveal>
        <div className="overview-hero">
          <div className="overview-hero__greeting">Hello, I&apos;m</div>
          <h1 className="overview-hero__name">{site.name}</h1>
          <p className="overview-hero__role">
            {site.title}
            <br />
            {site.tagline}
          </p>
          <div className="overview-hero__actions">
            <button className="mac-btn mac-btn--primary" onClick={() => navigate("projects")}>
              <Briefcase />
              View Projects
            </button>
            <a className="mac-btn mac-btn--ghost" href={site.github} target="_blank" rel="noopener noreferrer">
              <GithubIcon size={14} />
              GitHub
            </a>
            <a className="mac-btn mac-btn--ghost" href={site.resume} target="_blank" rel="noopener noreferrer">
              <ExternalLink />
              Resume
            </a>
          </div>
        </div>
      </Reveal>

      <Reveal index={1}>
        <div className="overview-meta">
          <div className="overview-meta__item">
            <div className="overview-meta__label">Status</div>
            <div className="overview-meta__value">
              <span className="status-badge">
                <span className="status-badge__dot" />
                Available for opportunities
              </span>
            </div>
          </div>
          <div className="overview-meta__item">
            <div className="overview-meta__label">Location</div>
            <div className="overview-meta__value" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <MapPin style={{ width: 14, height: 14, color: "var(--text-tertiary)" }} />
              {site.location}
            </div>
          </div>
          <div className="overview-meta__item">
            <div className="overview-meta__label">Currently</div>
            <div className="overview-meta__value" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Rocket style={{ width: 14, height: 14, color: "var(--text-tertiary)" }} />
              Building AI-powered products
            </div>
          </div>
          <div className="overview-meta__item">
            <div className="overview-meta__label">Education</div>
            <div className="overview-meta__value" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <GraduationCap style={{ width: 14, height: 14, color: "var(--text-tertiary)" }} />
              B.Tech CSE — NITTE
            </div>
          </div>
        </div>
      </Reveal>

      <div className="mac-section">
        <Reveal>
          <div className="page-header__eyebrow">At a glance</div>
        </Reveal>
        <div className="mac-stats">
          <Reveal index={0}>
            <Tilt target=".mac-stat">
              <div className="mac-stat">
                <div className="mac-stat__value">
                  <CountUp value={featuredProjects.length} />
                </div>
                <div className="mac-stat__label">Featured projects</div>
              </div>
            </Tilt>
          </Reveal>
          <Reveal index={1}>
            <Tilt target=".mac-stat">
              <div className="mac-stat">
                <div className="mac-stat__value">
                  <CountUp value={experience.length} />
                </div>
                <div className="mac-stat__label">Roles held</div>
              </div>
            </Tilt>
          </Reveal>
          <Reveal index={2}>
            <Tilt target=".mac-stat">
              <div className="mac-stat">
                <div className="mac-stat__value">
                  <CountUp value={techTotal} suffix="+" />
                </div>
                <div className="mac-stat__label">Technologies</div>
              </div>
            </Tilt>
          </Reveal>
          <Reveal index={3}>
            <Tilt target=".mac-stat">
              <div className="mac-stat">
                <div className="mac-stat__value">
                  {loading ? <span className="mac-skeleton">--</span> : <CountUp value={followers} />}
                </div>
                <div className="mac-stat__label">GitHub followers · {loading ? "…" : `${repos} repos`}</div>
              </div>
            </Tilt>
          </Reveal>
        </div>
      </div>

      <div className="mac-section">
        <Reveal>
          <div className="mac-preview-head">
            <h2 className="mac-section-title" style={{ marginBottom: 0 }}>
              <FolderKanban /> Featured work
            </h2>
            <button className="mac-link" onClick={goProjects}>
              View all →
            </button>
          </div>
        </Reveal>
        <div className="project-grid">
          {preview.map((p, i) => (
            <Reveal key={p.slug} index={i}>
              <Tilt target=".project-card">
                <button
                  className="project-card"
                  onClick={() => {
                    goProjects();
                    // open after the page switches
                    setTimeout(() => setOpenProject(p), 80);
                  }}
                >
                  <div className="project-card__header">
                    <span className="project-card__emoji">{p.emoji}</span>
                    <div>
                      <div className="project-card__name">{p.name}</div>
                      <div className="project-card__tagline">{p.tagline}</div>
                    </div>
                  </div>
                  <div className="project-card__tech">
                    {p.tech.slice(0, 4).map((t) => (
                      <span className="mac-tag" key={t}>
                        {t}
                      </span>
                    ))}
                </div>
                </button>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="mac-section">
        <Reveal>
          <h2 className="mac-section-title">
            <Sparkles /> How I ship
          </h2>
        </Reveal>
        <Reveal index={1}>
          <div className="mac-pipeline" aria-hidden="true">
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
        </Reveal>
        <Reveal index={2}>
          <p
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--text-secondary)",
              marginTop: "var(--sp-3)",
              lineHeight: 1.7,
            }}
          >
            Currently exploring {exploring.slice(0, 3).map((e) => e.name.toLowerCase()).join(" · ")} — with{" "}
            {certifications.length} certifications backing the journey.
          </p>
        </Reveal>
      </div>

      <div className="mac-section">
        <Reveal>
          <div className="mac-preview-head">
            <h2 className="mac-section-title" style={{ marginBottom: 0 }}>
              <GithubIcon size={17} /> Open source
            </h2>
            <a className="mac-link" href={site.github} target="_blank" rel="noopener noreferrer">
              @{site.githubUser} ↗
            </a>
          </div>
        </Reveal>
        <Reveal index={1}>
          <div className="mac-card" style={{ display: "flex", gap: "var(--sp-4)", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 160px" }}>
              <div style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>Building in public</div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", marginTop: 4 }}>
                {loading ? "Fetching live stats…" : `${repos} public repos · ${followers} followers`} — every featured
                project ships with source.
              </div>
            </div>
            <a className="mac-btn mac-btn--primary" href={site.github} target="_blank" rel="noopener noreferrer">
              <GithubIcon size={14} /> Follow along
            </a>
          </div>
        </Reveal>
      </div>

      <div className="mac-section">
        <Reveal>
          <h2 className="mac-section-title">Five more ways in</h2>
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
    </>
  );
}

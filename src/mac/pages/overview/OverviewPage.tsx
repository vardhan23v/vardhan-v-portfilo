import { Briefcase, MapPin, GraduationCap, Rocket, ExternalLink } from "lucide-react";
import { useNav } from "../../hooks/useNav";
import { site } from "../../data/site";
import { featuredProjects } from "../../data/projects";
import { experience } from "../../data/experience";
import { skillCategories } from "../../data/skills";

export function OverviewPage() {
  const { navigate } = useNav();

  return (
    <div className="mac-page">
      <div className="overview-hero">
        <div className="overview-hero__greeting">Hello, I'm</div>
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
            <ExternalLink />
            GitHub
          </a>
        </div>
      </div>

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

      <div style={{ marginTop: "var(--sp-8)" }}>
        <div className="page-header__eyebrow">Quick Stats</div>
        <div style={{ display: "flex", gap: "var(--sp-4)", flexWrap: "wrap", marginTop: "var(--sp-3)" }}>
          <div className="overview-meta__item" style={{ flex: "1 1 120px" }}>
            <div className="overview-meta__value" style={{ fontSize: "var(--text-2xl)", fontWeight: 700 }}>
              {featuredProjects.length}
            </div>
            <div className="overview-meta__label">Featured Projects</div>
          </div>
          <div className="overview-meta__item" style={{ flex: "1 1 120px" }}>
            <div className="overview-meta__value" style={{ fontSize: "var(--text-2xl)", fontWeight: 700 }}>
              {experience.length}
            </div>
            <div className="overview-meta__label">Roles</div>
          </div>
          <div className="overview-meta__item" style={{ flex: "1 1 120px" }}>
            <div className="overview-meta__value" style={{ fontSize: "var(--text-2xl)", fontWeight: 700 }}>
              {skillCategories.reduce((a, c) => a + c.items.length, 0)}+
            </div>
            <div className="overview-meta__label">Technologies</div>
          </div>
        </div>
      </div>
    </div>
  );
}

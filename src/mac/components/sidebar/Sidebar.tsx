import {
  LayoutDashboard,
  User,
  Briefcase,
  Clock,
  Layers,
  Trophy,
  Mail,
  ExternalLink,
  FileText,
  X,
  AppWindow,
} from "lucide-react";
import { Link } from "react-router-dom";
import { GithubIcon, LinkedinIcon } from "../../lib/icons";
import { useNav, NAV_ITEMS, type PageId } from "../../hooks/useNav";
import { site } from "../../data/site";
import { featuredProjects } from "../../data/projects";
import { skillCategories } from "../../data/skills";
import { experience } from "../../data/experience";
import { certifications } from "../../data/experience";

const ICONS: Record<PageId, typeof LayoutDashboard> = {
  overview: LayoutDashboard,
  about: User,
  projects: Briefcase,
  experience: Clock,
  skills: Layers,
  achievements: Trophy,
  contact: Mail,
};

const BADGES: Partial<Record<PageId, number>> = {
  projects: featuredProjects.length,
  experience: experience.length,
  skills: skillCategories.length,
  achievements: certifications.length,
};

const EXTERNAL_LINKS = [
  { label: "GitHub", href: site.github, icon: GithubIcon },
  { label: "LinkedIn", href: site.linkedin, icon: LinkedinIcon },
  { label: "Resume", href: site.resume, icon: FileText },
];

const EDITIONS = [
  { label: "Terminal", to: "/terminal" },
  { label: "Classic", to: "/classic" },
  { label: "Paper", to: "/paper" },
  { label: "Aurora", to: "/aurora" },
  { label: "Forge", to: "/forge" },
];

export function Sidebar() {
  const { page, navigate, mobileOpen, setMobileOpen } = useNav();

  return (
    <>
      <div
        className={`mac-sidebar--mobile-overlay ${mobileOpen ? "mac-sidebar--mobile-overlay--visible" : ""}`}
        onClick={() => setMobileOpen(false)}
      />
      <nav className={`mac-sidebar ${mobileOpen ? "mac-sidebar--open" : ""}`} aria-label="Navigation">
        <div className="mac-sidebar__profile">
          <span className="mac-sidebar__avatar" aria-hidden="true">
            SV
          </span>
          <div className="mac-sidebar__who">
            <div className="mac-sidebar__name">{site.name}</div>
            <div className="mac-sidebar__role">AI · Full-Stack</div>
          </div>
          <button
            className="mac-sidebar__close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>

        <div className="mac-sidebar__section">
          <div className="mac-sidebar__label">Main</div>
          {NAV_ITEMS.filter((i) => i.section === "main").map((item) => {
            const Icon = ICONS[item.id];
            return (
              <button
                key={item.id}
                className={`mac-sidebar__item ${page === item.id ? "mac-sidebar__item--active" : ""}`}
                onClick={() => navigate(item.id)}
                aria-current={page === item.id ? "page" : undefined}
              >
                <Icon />
                <span>{item.label}</span>
                {BADGES[item.id] != null ? (
                  <span className="mac-sidebar__badge">{BADGES[item.id]}</span>
                ) : (
                  <span className="mac-sidebar__shortcut">{item.shortcut}</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mac-sidebar__divider" />

        <div className="mac-sidebar__section">
          <div className="mac-sidebar__label">Connect</div>
          {EXTERNAL_LINKS.map((link) => (
            <a
              key={link.label}
              className="mac-sidebar__item"
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <link.icon size={16} />
              <span>{link.label}</span>
              <ExternalLink style={{ width: 12, height: 12, opacity: 0.4, marginLeft: "auto" }} />
            </a>
          ))}
        </div>

        <div className="mac-sidebar__divider" />

        <div className="mac-sidebar__section">
          <div className="mac-sidebar__label">Other editions</div>
          {EDITIONS.map((e) => (
            <Link key={e.to} className="mac-sidebar__item" to={e.to}>
              <AppWindow style={{ width: 16, height: 16, opacity: 0.7 }} />
              <span>{e.label}</span>
              <ExternalLink style={{ width: 12, height: 12, opacity: 0.4, marginLeft: "auto" }} />
            </Link>
          ))}
        </div>

        <div className="mac-sidebar__foot">
          <div className="mac-sidebar__ver">portfolio v6 · macOS ed.</div>
        </div>
      </nav>
    </>
  );
}

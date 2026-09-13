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
} from "lucide-react";
import { GithubIcon, LinkedinIcon } from "../../lib/icons";
import { useNav, NAV_ITEMS, type PageId } from "../../hooks/useNav";
import { site } from "../../data/site";

const ICONS: Record<PageId, typeof LayoutDashboard> = {
  overview: LayoutDashboard,
  about: User,
  projects: Briefcase,
  experience: Clock,
  skills: Layers,
  achievements: Trophy,
  contact: Mail,
};

const EXTERNAL_LINKS = [
  { label: "GitHub", href: site.github, icon: GithubIcon },
  { label: "LinkedIn", href: site.linkedin, icon: LinkedinIcon },
  { label: "Resume", href: site.resume, icon: FileText },
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
                <span className="mac-sidebar__shortcut">{item.shortcut}</span>
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
      </nav>
    </>
  );
}

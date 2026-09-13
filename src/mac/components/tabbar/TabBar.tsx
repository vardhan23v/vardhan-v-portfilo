import { LayoutDashboard, Briefcase, Layers, Mail } from "lucide-react";
import { useNav, type PageId } from "../../hooks/useNav";

const TABS: { id: PageId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "projects", label: "Projects", icon: Briefcase },
  { id: "skills", label: "Skills", icon: Layers },
  { id: "contact", label: "Contact", icon: Mail },
];

export function TabBar() {
  const { page, navigate } = useNav();
  const activeIndex = TABS.findIndex((t) => t.id === page);
  return (
    <nav className="mac-tabbar" aria-label="Primary">
      <span className="mac-tabbar__indicator" aria-hidden="true" style={{ left: `${Math.max(activeIndex, 0) * 25}%` }} />
      {TABS.map((t) => (
        <button
          key={t.id}
          className={`mac-tabbar__item${page === t.id ? " mac-tabbar__item--active" : ""}`}
          onClick={() => navigate(t.id)}
          aria-current={page === t.id ? "page" : undefined}
        >
          <t.icon />
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}

import { Folder, FileText, ExternalLink } from "lucide-react";
import { featuredProjects, otherProjects } from "../data/projects";
import { useNav } from "../hooks/useNav";
import { useWindowManager } from "../hooks/useWindowManager";

/** Phase-1 Finder: favorites sidebar + real project folders.
 *  Opening a project focuses the Projects window with its detail modal. */
export function FinderApp() {
  const { setOpenProject } = useNav();
  const { openWindow } = useWindowManager();

  const openProject = (slug: string) => {
    const p = featuredProjects.find((x) => x.slug === slug);
    if (!p) return;
    openWindow("projects");
    setTimeout(() => setOpenProject(p), 80);
  };

  return (
    <div className="finder">
      <aside className="finder__sidebar" aria-label="Favorites">
        <div className="finder__side-label">Favorites</div>
        {["Projects", "Documents", "Resume", "GitHub"].map((f) => (
          <div key={f} className="finder__side-item">
            <Folder /> <span>{f}</span>
          </div>
        ))}
        <div className="finder__side-label">Locations</div>
        <div className="finder__side-item">
          <Folder /> <span>Vardhan&apos;s Mac</span>
        </div>
      </aside>
      <div className="finder__main">
        <div className="finder__path">Projects · {featuredProjects.length} featured · {otherProjects.length} more</div>
        <div className="finder__grid" role="list">
          {featuredProjects.map((p) => (
            <button key={p.slug} className="finder__item" role="listitem" onClick={() => openProject(p.slug)} title={`Open ${p.name}`}>
              <span className="finder__item-emoji" aria-hidden="true">{p.emoji}</span>
              <span className="finder__item-name">{p.name}</span>
              <span className="finder__item-sub">{p.tech.slice(0, 2).join(" · ")}</span>
            </button>
          ))}
        </div>
        <div className="finder__foot">
          <FileText /> <span>{featuredProjects.length + otherProjects.length} items, all with source on GitHub</span>
          <ExternalLink style={{ width: 12, height: 12 }} />
        </div>
      </div>
    </div>
  );
}

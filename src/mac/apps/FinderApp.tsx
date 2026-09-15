import { useMemo, useState } from "react";
import { Folder, FileText, ExternalLink, LayoutGrid, Rows3, Star } from "lucide-react";
import { GithubIcon } from "../lib/icons";
import { featuredProjects, otherProjects, type Project } from "../data/projects";
import { catOf, CATEGORY_LABELS } from "../lib/projects";
import { useNav } from "../hooks/useNav";
import { useWindowManager } from "../hooks/useWindowManager";
import { ProjectCover } from "../components/ui/ProjectCover";
import { site } from "../data/site";

type Place = "featured" | "flagship" | "other" | "resume" | "github";
const PLACES: { id: Place; label: string; Icon: React.ComponentType<{ size?: number }> }[] = [
  { id: "featured", label: "Featured", Icon: Folder },
  { id: "flagship", label: "Flagship", Icon: Star },
  { id: "other", label: "Other things", Icon: Folder },
  { id: "resume", label: "Resume", Icon: FileText },
  { id: "github", label: "GitHub", Icon: GithubIcon },
];

/** Finder: places sidebar, icon/list views with covers, and a preview pane. */
export function FinderApp() {
  const { setOpenProject } = useNav();
  const { openWindow } = useWindowManager();
  const [place, setPlace] = useState<Place>("featured");
  const [view, setView] = useState<"icons" | "list">("icons");
  const [selected, setSelected] = useState<string | null>(featuredProjects[0]?.slug ?? null);

  const items: Project[] = useMemo(() => {
    if (place === "flagship") return featuredProjects.filter((p) => p.highlight);
    return featuredProjects;
  }, [place]);

  const sel = items.find((p) => p.slug === selected) ?? items[0];

  const open = (p: Project) => {
    openWindow("projects");
    setTimeout(() => setOpenProject(p), 80);
  };
  const choosePlace = (id: Place) => {
    if (id === "resume") return window.open(site.resume, "_blank", "noopener");
    if (id === "github") return window.open(site.github, "_blank", "noopener");
    setPlace(id);
  };

  const path = place === "other" ? `~/work/other · ${otherProjects.length} items` : `~/work/${place} · ${items.length} items`;

  return (
    <div className="finder">
      <aside className="finder__sidebar" aria-label="Places">
        <div className="finder__side-label">Places</div>
        {PLACES.map(({ id, label, Icon }) => (
          <button key={id} className={`finder__side-item${place === id ? " is-active" : ""}`} onClick={() => choosePlace(id)}>
            <Icon size={14} /> <span>{label}</span>
          </button>
        ))}
        <div className="finder__side-label">Locations</div>
        <div className="finder__side-item"><Folder /> <span>Vardhan&apos;s Mac</span></div>
      </aside>

      <div className="finder__main">
        <div className="finder__bar">
          <span className="finder__path">{path}</span>
          <div className="finder__view" role="group" aria-label="View">
            <button className={view === "icons" ? "is-on" : ""} onClick={() => setView("icons")} aria-label="Icon view"><LayoutGrid /></button>
            <button className={view === "list" ? "is-on" : ""} onClick={() => setView("list")} aria-label="List view"><Rows3 /></button>
          </div>
        </div>

        <div className="finder__content">
          <div className="finder__scroll">
            {place === "other" ? (
              <div className="finder__list">
                {otherProjects.map((p) => (
                  <a key={p.name} className="finder__row" href={p.github} target="_blank" rel="noopener noreferrer">
                    <span style={{ fontSize: 18, textAlign: "center" }}>{p.emoji}</span>
                    <span>{p.name}</span>
                    <span className="finder__row-tech">{p.tech.slice(0, 3).join(" · ")}</span>
                    <span className="finder__row-kind">repo ↗</span>
                  </a>
                ))}
              </div>
            ) : view === "icons" ? (
              <div className="finder__grid" role="list">
                {items.map((p) => (
                  <button
                    key={p.slug}
                    role="listitem"
                    className={`finder__item${sel?.slug === p.slug ? " is-selected" : ""}`}
                    onClick={() => setSelected(p.slug)}
                    onDoubleClick={() => open(p)}
                    title={`Double-click to open ${p.name}`}
                  >
                    <ProjectCover project={p} size="sm" ratio="4/3" />
                    <span className="finder__item-name">{p.name}</span>
                    <span className="finder__item-sub">{CATEGORY_LABELS[catOf(p)]}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="finder__list">
                {items.map((p) => (
                  <button
                    key={p.slug}
                    className={`finder__row${sel?.slug === p.slug ? " is-selected" : ""}`}
                    onClick={() => setSelected(p.slug)}
                    onDoubleClick={() => open(p)}
                  >
                    <ProjectCover project={p} size="sm" ratio="1/1" />
                    <span>{p.name}</span>
                    <span className="finder__row-tech">{p.tech.slice(0, 3).join(" · ")}</span>
                    <span className="finder__row-kind">{CATEGORY_LABELS[catOf(p)]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {place !== "other" && sel && (
            <aside className="finder__preview" aria-label="Preview">
              <div className="finder__preview-shots">
                {(sel.screenshots?.length ? sel.screenshots : [sel.cover]).map((shot, i) => (
                  <ProjectCover key={`${sel.slug}-${i}`} project={sel} src={shot} size="sm" ratio="16/9" />
                ))}
              </div>
              <div className="finder__preview-name">{sel.name}</div>
              <div className="finder__preview-sub">{sel.tagline}</div>
              <dl>
                <dt>Kind</dt><dd>{CATEGORY_LABELS[catOf(sel)]}</dd>
                <dt>Stack</dt><dd>{sel.tech.slice(0, 4).join(", ")}</dd>
                <dt>Source</dt><dd>GitHub{sel.live ? " · Live" : ""}</dd>
              </dl>
              <button className="mac-btn mac-btn--primary" onClick={() => open(sel)}>Open in Projects</button>
            </aside>
          )}
        </div>

        <div className="finder__foot">
          <FileText /> <span>{featuredProjects.length + otherProjects.length} items, all with source on GitHub</span>
          <ExternalLink />
        </div>
      </div>
    </div>
  );
}

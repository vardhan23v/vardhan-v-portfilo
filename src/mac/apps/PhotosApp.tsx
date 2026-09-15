import { useMemo, useState } from "react";
import { Image as ImageIcon, Heart, Monitor, Maximize2 } from "lucide-react";
import { featuredProjects } from "../data/projects";
import { useWindowManager } from "../hooks/useWindowManager";
import { useShell } from "../hooks/useShell";
import { usePreferences } from "../hooks/usePreferences";
import { useToast } from "../components/ui/Toast";
import { ProjectCover } from "../components/ui/ProjectCover";

export interface Photo { id: string; src?: string; title: string; sub: string; project: (typeof featuredProjects)[number] }
const FAV_KEY = "mac-photo-favs";

export function libraryPhotos(): Photo[] {
  const out: Photo[] = [];
  for (const p of featuredProjects) {
    const shots = p.screenshots?.length ? p.screenshots : [p.cover];
    shots.forEach((s, i) => out.push({ id: `${p.slug}-${i}`, src: s, title: p.name, sub: s ? `screenshot ${i + 1}` : "generated cover", project: p }));
  }
  return out;
}

/** Photos: project screenshots + generated covers, favourites, set-as-wallpaper, opens Preview. */
export function PhotosApp() {
  const photos = useMemo(libraryPhotos, []);
  const [favs, setFavs] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem(FAV_KEY) || "[]"); } catch { return []; } });
  const [filter, setFilter] = useState<"all" | "shots" | "favs">("all");
  const [sel, setSel] = useState<string | null>(null);
  const { openWindow } = useWindowManager();
  const { setPreview } = useShell();
  const { set } = usePreferences();
  const { toast } = useToast();

  const list = photos.filter((p) => (filter === "shots" ? !!p.src : filter === "favs" ? favs.includes(p.id) : true));
  const toggleFav = (id: string) => setFavs((f) => { const n = f.includes(id) ? f.filter((x) => x !== id) : [...f, id]; try { localStorage.setItem(FAV_KEY, JSON.stringify(n)); } catch { /* ignore */ } return n; });
  const open = (p: Photo) => { setPreview({ src: p.src ?? `cover:${p.project.slug}`, title: p.title, sub: p.sub }); openWindow("preview"); };
  const wallpaper = (p: Photo) => { set("wallpaper", p.src ?? `cover:${p.project.slug}`); toast({ title: "Wallpaper set", body: `${p.title} — ${p.sub}`, app: "photos" }); };
  const cur = list.find((p) => p.id === sel);

  return (
    <div className="photos">
      <aside className="photos__side">
        <div className="finder__side-label">Library</div>
        {([["all", "All photos"], ["shots", "Screenshots"], ["favs", "Favourites"]] as const).map(([k, label]) => (
          <button key={k} className={`finder__side-item${filter === k ? " is-active" : ""}`} onClick={() => setFilter(k)}>
            {k === "favs" ? <Heart size={14} /> : <ImageIcon size={14} />} <span>{label}</span>
            <em>{k === "all" ? photos.length : k === "shots" ? photos.filter((p) => !!p.src).length : favs.length}</em>
          </button>
        ))}
        <div className="finder__side-label">Albums</div>
        {featuredProjects.slice(0, 5).map((p) => (
          <button key={p.slug} className="finder__side-item" onClick={() => { setFilter("all"); setSel(`${p.slug}-0`); }}><span>{p.emoji}</span> <span>{p.name}</span></button>
        ))}
      </aside>
      <div className="photos__main">
        <div className="finder__bar"><span className="finder__path">{list.length} items · double-click to open in Preview</span></div>
        <div className="photos__grid" role="list">
          {list.map((p) => (
            <button key={p.id} role="listitem" className={`photos__item${sel === p.id ? " is-selected" : ""}`} onClick={() => setSel(p.id)} onDoubleClick={() => open(p)} title={`${p.title} — ${p.sub}`}>
              <ProjectCover project={p.project} src={p.src} size="sm" ratio="1/1" />
              {favs.includes(p.id) && <span className="photos__fav" aria-hidden="true">♥</span>}
            </button>
          ))}
        </div>
        {cur && (
          <div className="photos__bar">
            <span className="photos__bar-title">{cur.title} <em>{cur.sub}</em></span>
            <button className="mac-btn mac-btn--ghost" onClick={() => toggleFav(cur.id)}><Heart /> {favs.includes(cur.id) ? "Unfavourite" : "Favourite"}</button>
            <button className="mac-btn mac-btn--ghost" onClick={() => wallpaper(cur)}><Monitor /> Set as wallpaper</button>
            <button className="mac-btn mac-btn--primary" onClick={() => open(cur)}><Maximize2 /> Open</button>
          </div>
        )}
      </div>
    </div>
  );
}

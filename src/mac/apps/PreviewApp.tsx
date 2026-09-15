import { useState } from "react";
import { ZoomIn, ZoomOut, Monitor, ExternalLink } from "lucide-react";
import { useShell } from "../hooks/useShell";
import { usePreferences } from "../hooks/usePreferences";
import { useToast } from "../components/ui/Toast";
import { featuredProjects } from "../data/projects";
import { ProjectCover } from "../components/ui/ProjectCover";

/** Preview: shows the image handed over by Photos / Finder (or a generated cover). */
export function PreviewApp() {
  const { preview } = useShell();
  const { set } = usePreferences();
  const { toast } = useToast();
  const [zoom, setZoom] = useState(1);
  if (!preview) return <div className="preview preview--empty"><span className="mac-caps">Open an image from Photos or Finder</span></div>;
  const coverSlug = preview.src.startsWith("cover:") ? preview.src.slice(6) : null;
  const project = coverSlug ? featuredProjects.find((p) => p.slug === coverSlug) : null;
  return (
    <div className="preview">
      <div className="preview__bar">
        <span className="preview__title">{preview.title} {preview.sub && <em>· {preview.sub}</em>}</span>
        <span className="preview__tools">
          <button className="mac-btn mac-btn--ghost" onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))} aria-label="Zoom out"><ZoomOut /></button>
          <span className="mac-caps">{Math.round(zoom * 100)}%</span>
          <button className="mac-btn mac-btn--ghost" onClick={() => setZoom((z) => Math.min(3, z + 0.25))} aria-label="Zoom in"><ZoomIn /></button>
          <button className="mac-btn mac-btn--ghost" onClick={() => { set("wallpaper", preview.src); toast({ title: "Wallpaper set", body: preview.title, app: "preview" }); }}><Monitor /> Wallpaper</button>
          {!coverSlug && <a className="mac-btn mac-btn--ghost" href={preview.src} target="_blank" rel="noopener noreferrer" aria-label="Open original"><ExternalLink /></a>}
        </span>
      </div>
      <div className="preview__canvas">
        <div className="preview__img" style={{ transform: `scale(${zoom})` }}>
          {project ? <ProjectCover project={project} size="lg" ratio="16/9" /> : <img src={preview.src} alt={preview.title} />}
        </div>
      </div>
    </div>
  );
}

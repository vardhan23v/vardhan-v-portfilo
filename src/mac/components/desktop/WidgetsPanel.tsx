import { useEffect, useRef } from "react";
import { ArrowUpRight, Mail } from "lucide-react";
import { useShell } from "../../hooks/useShell";
import { useIstTime } from "../../hooks/useIstTime";
import { useGithub } from "../../hooks/useGithub";
import { useWindowManager } from "../../hooks/useWindowManager";
import { site } from "../../data/site";
import { status } from "../../data/status";
import { featuredProjects } from "../../data/projects";
import { GithubIcon, LinkedinIcon } from "../../lib/icons";
import { AppGlyph } from "../ui/AppGlyph";

function useDate() {
  const d = new Date();
  return {
    day: d.toLocaleDateString("en-IN", { weekday: "long", timeZone: "Asia/Kolkata" }),
    date: d.toLocaleDateString("en-IN", { day: "numeric", month: "long", timeZone: "Asia/Kolkata" }),
  };
}

/** Notification-Center-style panel: clock, GitHub, status, quick links. */
export function WidgetsPanel() {
  const { overlay, setOverlay } = useShell();
  const { openWindow } = useWindowManager();
  const ist = useIstTime(false);
  const { day, date } = useDate();
  const { followers, repos, loading } = useGithub();
  const ref = useRef<HTMLDivElement>(null);
  const open = overlay === "widgets";
  const latest = featuredProjects[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && e.target instanceof Node && !ref.current.contains(e.target)) setOverlay("none");
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOverlay("none");
    };
    // defer so the opening click doesn't immediately close it
    const t = window.setTimeout(() => document.addEventListener("pointerdown", onDown), 0);
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, setOverlay]);

  if (!open) return null;

  return (
    <aside className="mac-widgets" ref={ref} aria-label="Widgets">
      <section className="mac-widget mac-widget--clock">
        <div className="mac-widget__eyebrow mac-caps">{day} · IST</div>
        <div className="mac-widget__time">{ist}</div>
        <div className="mac-widget__date">{date}</div>
      </section>

      <section className="mac-widget mac-widget--status">
        <div className="mac-widget__eyebrow mac-caps">{status.headline}</div>
        <p className="mac-widget__lede">{status.detail}</p>
        <div className="mac-widget__foot">
          <span className="mac-dot" /> {status.availability}
        </div>
      </section>

      <section className="mac-widget mac-widget--github">
        <div className="mac-widget__eyebrow mac-caps">GitHub · @{site.githubUser}</div>
        <div className="mac-widget__stats">
          <div><b>{loading ? "—" : repos}</b><span>repos</span></div>
          <div><b>{loading ? "—" : followers}</b><span>followers</span></div>
          <div><b>{featuredProjects.length}</b><span>featured</span></div>
        </div>
        <a className="mac-widget__link" href={site.github} target="_blank" rel="noopener noreferrer">
          Open profile <ArrowUpRight />
        </a>
      </section>

      {latest && (
        <button className="mac-widget mac-widget--latest" onClick={() => { openWindow("projects"); setOverlay("none"); }}>
          <div className="mac-widget__eyebrow mac-caps">Latest build</div>
          <div className="mac-widget__row">
            <span className="mac-widget__emoji" aria-hidden="true">{latest.emoji}</span>
            <div>
              <div className="mac-widget__title">{latest.name}</div>
              <div className="mac-widget__sub">{latest.tagline}</div>
            </div>
          </div>
        </button>
      )}

      <section className="mac-widget mac-widget--links">
        <div className="mac-widget__eyebrow mac-caps">Reach</div>
        <div className="mac-widget__links">
          <a href={`mailto:${site.email}`}><Mail /> Email</a>
          <a href={site.github} target="_blank" rel="noopener noreferrer"><GithubIcon size={14} /> GitHub</a>
          <a href={site.linkedin} target="_blank" rel="noopener noreferrer"><LinkedinIcon size={14} /> LinkedIn</a>
          <button onClick={() => { openWindow("contact"); setOverlay("none"); }}><AppGlyph id="contact" size={16} /> Contact app</button>
        </div>
      </section>
    </aside>
  );
}

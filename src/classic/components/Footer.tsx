import { EDITIONS } from "../../editions";
import { useIstTime } from "../../hooks/useIstTime";
import { site } from "../data/site";
import { useReveal } from "../hooks/useReveal";

export function Footer() {
  const year = new Date().getFullYear();
  const time = useIstTime(false);
  const gridRef = useReveal<HTMLDivElement>({ rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
  return (
    <footer className="foot" aria-label="Footer">
      <div className="reveal wrap foot-grid" ref={gridRef}>
        <div className="foot-brand" style={{ "--i": 0 } as React.CSSProperties}>
          <p className="foot-name">{site.name}</p>
          <p className="foot-statement">Built with AI, shipped with code, all of it open on GitHub.</p>
        </div>
        <nav className="foot-col" aria-label="Footer sections" style={{ "--i": 1 } as React.CSSProperties}>
          <p className="foot-word">Sections</p>
          <a href="#work">Work</a>
          <a href="#about">About</a>
          <a href="#experience">Experience</a>
          <a href="#skills">Skills</a>
          <a href="#contact">Contact</a>
        </nav>
        <nav className="foot-col" aria-label="Other editions" style={{ "--i": 2 } as React.CSSProperties}>
          <p className="foot-word">Other editions</p>
          {EDITIONS.filter((e) => e.tone !== "classic").map((e) => (
            <a key={e.to} href={e.to}>{e.label}</a>
          ))}
        </nav>
        <div className="foot-col" style={{ "--i": 3 } as React.CSSProperties}>
          <p className="foot-word">Reach me</p>
          <a href={`mailto:${site.email}`}>{site.email}</a>
          <a href={site.github} target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href={site.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <p className="foot-meta">{site.location.split(",")[0]}, India · {time ? `${time} IST` : "IST"}</p>
        </div>
      </div>
      <div className="wrap foot-legal">
        <p>© {year} {site.name}. Set in Inter.</p>
        <a href="#top">Back to top</a>
      </div>
    </footer>
  );
}

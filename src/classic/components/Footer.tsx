import { EDITIONS } from "../../editions";
import { useIstTime } from "../../hooks/useIstTime";
import { site } from "../data/site";

export function Footer() {
  const year = new Date().getFullYear();
  const time = useIstTime(false);
  return (
    <footer className="foot" aria-label="Footer">
      <div className="wrap foot-grid">
        <div className="foot-brand">
          <p className="foot-name">{site.name}</p>
          <p className="foot-statement">Built with AI, shipped with code, all of it open on GitHub.</p>
        </div>
        <nav className="foot-col" aria-label="Footer sections">
          <p className="foot-word">Sections</p>
          <a href="#about">About</a>
          <a href="#work">Projects</a>
          <a href="#experience">Experience</a>
          <a href="#skills">Skills</a>
          <a href="#contact">Contact</a>
        </nav>
        <nav className="foot-col" aria-label="Other editions">
          <p className="foot-word">Other editions</p>
          {EDITIONS.filter((e) => e.tone !== "classic").map((e) => (
            <a key={e.to} href={e.to}>{e.label}</a>
          ))}
        </nav>
        <div className="foot-col">
          <p className="foot-word">Reach me</p>
          <a href={`mailto:${site.email}`}>{site.email}</a>
          <a href={site.github} target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href={site.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <p className="foot-meta">{site.location.split(",")[0]}, India · {time ? `${time} IST` : "IST"}</p>
        </div>
      </div>
      <div className="wrap foot-legal">
        <p>© {year} {site.name}. Set in Bricolage Grotesque and Inter, under a still sky. <span className="keys">Keys: <kbd>g</kbd> then <kbd>p</kbd> projects, <kbd>e</kbd> experience, <kbd>c</kbd> contact.</span></p>
        <a href="#top">Back to top</a>
      </div>
    </footer>
  );
}

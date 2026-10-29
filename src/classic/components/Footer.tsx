import { EDITIONS } from "../../editions";
import { useIstTime } from "../../hooks/useIstTime";
import { site } from "../data/site";

export function Footer() {
  const year = new Date().getFullYear();
  const time = useIstTime(false);
  return (
    <footer className="foot" aria-label="Footer">
      <div className="foot-tile foot-tile--say">
        <p className="foot-statement">Built with AI, shipped with code, and all of it open on GitHub.</p>
        <p className="foot-legal">© {year} {site.name}. Set in Kanit and Inter.</p>
      </div>
      <nav className="foot-tile foot-tile--nav" aria-label="Pages and editions">
        <a href="#work">Work</a>
        <a href="#about">About</a>
        <a href="#ledger">Experience</a>
        <a href={site.github} target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href={site.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <span className="foot-nav-word">Other editions</span>
        {EDITIONS.filter((e) => e.tone !== "classic").map((e) => (
          <a key={e.to} href={e.to}>{e.label}</a>
        ))}
      </nav>
      <div className="foot-tile foot-tile--time">
        <p>{site.location.split(",")[0]}, India</p>
        <p>{time ? `${time} IST` : "IST"}</p>
      </div>
      <div className="foot-tile foot-tile--mail">
        <a href={`mailto:${site.email}`}>{site.email}</a>
      </div>
      <div className="foot-tile foot-tile--mark" aria-hidden="true">
        <span>{site.name}</span>
      </div>
      <a className="foot-tile foot-tile--go" href={`mailto:${site.email}?subject=${encodeURIComponent("Let's build something")}`}>
        <span>Start a conversation</span>
        <svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false"><path d="M8 40 40 8M16 8h24v24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="square" /></svg>
      </a>
    </footer>
  );
}

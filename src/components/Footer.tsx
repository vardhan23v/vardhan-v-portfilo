import { Link } from "react-router-dom";
import { site } from "../data/site";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <span className="footer-brand">
            <span className="mark" aria-hidden="true">
              V
            </span>
            {site.fullName}
          </span>
          <nav className="footer-links" aria-label="Footer">
            <Link to="/#work">Work</Link>
            <Link to="/#experience">Experience</Link>
            <Link to="/#about">About</Link>
            <a href={site.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a href={site.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </nav>
        </div>
        <div className="footer-note">
          <span>© 2026 {site.fullName}. Built with React + TypeScript.</span>
          <span>
            Designed & engineered by <span style={{ color: "var(--text-2)" }}>me</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
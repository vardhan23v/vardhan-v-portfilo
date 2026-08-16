import { Link } from "react-router-dom";
import { site } from "../data/site";
import "./Footer.css";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <Link to="/" className="footer-name">
            Vardhan V
          </Link>
          <p className="footer-role">Generative AI Developer · Full-Stack Developer</p>
          <p className="footer-location">{site.location}</p>
        </div>

        <nav className="footer-nav" aria-label="Footer">
          <Link to="/#work">Work</Link>
          <Link to="/#experience">Experience</Link>
          <Link to="/#about">About</Link>
          <Link to="/#contact">Contact</Link>
        </nav>

        <div className="footer-socials">
          <a href={site.github} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href={site.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          <a href={`mailto:${site.email}`}>Email</a>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>© {new Date().getFullYear()} Vardhan V</p>
        <p className="footer-built">
          <span className="mono">Built with React + TypeScript</span>
        </p>
      </div>
    </footer>
  );
}
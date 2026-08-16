import { site } from "../data/site";
import { Icon } from "../lib/icons";
import "./Footer.css";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <a href="#top" className="nav-logo" aria-label="Back to top">
            <span className="nav-logo-mark" aria-hidden="true">
              <span>SV</span>
            </span>
            <span className="nav-logo-name">
              vardhan<span className="nav-logo-dot">.dev</span>
            </span>
          </a>
          <p>
            Student → Builder → AI Developer → Full-Stack Engineer. Built with AI, shipped with
            code.
          </p>
        </div>

        <nav className="footer-nav" aria-label="Footer">
          <a href="#about">About</a>
          <a href="#projects">Projects</a>
          <a href="#experience">Experience</a>
          <a href="#skills">Skills</a>
          <a href="#contact">Contact</a>
        </nav>

        <div className="footer-socials">
          <a href={site.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <Icon.github width={18} height={18} />
          </a>
          <a href={site.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <Icon.linkedin width={17} height={17} />
          </a>
          <a href={`mailto:${site.email}`} aria-label="Email">
            <Icon.mail width={18} height={18} />
          </a>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>
          © {year} Sree Vardhan V · {site.location}
        </p>
        <p className="footer-made">
          Designed &amp; built by me · <span className="grad-text">no template involved</span>
        </p>
      </div>
    </footer>
  );
}
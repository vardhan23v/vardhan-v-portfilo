import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { site } from "../data/site";

const links = [
  { label: "Work", href: "/#work" },
  { label: "Experience", href: "/#experience" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="nav-brand" aria-label="Vardhan V — home">
          <span className="mark" aria-hidden="true">
            V
          </span>
          Vardhan&nbsp;V
        </Link>

        <nav className="nav-links" aria-label="Primary">
          {links.map((l) => (
            <Link key={l.href} to={l.href}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="nav-actions">
          <a href={site.resume} className="btn btn-ghost btn-sm" download>
            Resume
          </a>
          <button
            className={`nav-burger ${open ? "nav-burger-x" : ""}`}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
      </div>

      <div id="mobile-menu" className={`nav-mobile ${open ? "nav-mobile-open" : ""}`}>
        <nav aria-label="Mobile">
          {links.map((l) => (
            <Link key={l.href} to={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="nav-mobile-meta">
          <a href={site.resume} download>
            Resume
          </a>
          <a href={site.github} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href={site.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </div>
      </div>
    </header>
  );
}
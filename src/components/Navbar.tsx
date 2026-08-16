import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { site } from "../data/site";
import "./Navbar.css";

const links = [
  { label: "Work", href: "/#work" },
  { label: "Experience", href: "/#experience" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className={`nav ${scrolled || open ? "nav-scrolled" : ""}`}>
      <div className="container nav-inner">
        <Link to="/" className="nav-brand" aria-label="Vardhan V — home">
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
          <a
            href={site.github}
            target="_blank"
            rel="noopener noreferrer"
            className="nav-social"
          >
            GitHub
          </a>
          <a
            href={site.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="nav-social"
          >
            LinkedIn
          </a>
          <a href={site.resume} className="btn btn-ghost btn-sm" download>
            Resume
          </a>
          <button
            className="nav-burger"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            <span className={`nav-burger-line ${open ? "nav-burger-x" : ""}`} aria-hidden="true" />
            <span className={`nav-burger-line ${open ? "nav-burger-x" : ""}`} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div id="mobile-menu" className={`nav-mobile ${open ? "nav-mobile-open" : ""}`}>
        <nav aria-label="Mobile">
          {links.map((l, i) => (
            <Link
              key={l.href}
              to={l.href}
              onClick={() => setOpen(false)}
              style={{ transitionDelay: open ? `${i * 40}ms` : "0ms" }}
            >
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
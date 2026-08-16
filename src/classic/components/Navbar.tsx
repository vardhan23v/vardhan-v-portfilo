import { useEffect, useState } from "react";
import { site } from "../data/site";
import { Icon } from "../lib/icons";
import "./Navbar.css";

const links = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Skills", href: "#skills" },
  { label: "Certifications", href: "#certifications" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className={`nav ${scrolled || open ? "nav-scrolled" : ""}`}>
      <div className="container nav-inner">
        <a href="#top" className="nav-logo" aria-label="Sree Vardhan V — home">
          <span className="nav-logo-mark" aria-hidden="true">
            <span>SV</span>
          </span>
          <span className="nav-logo-name">
            vardhan<span className="nav-logo-dot">.dev</span>
          </span>
        </a>

        <nav className="nav-links" aria-label="Primary">
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="nav-actions">
          <div className="nav-socials">
            <a href={site.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <Icon.github width={19} height={19} />
            </a>
            <a href={site.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <Icon.linkedin width={18} height={18} />
            </a>
          </div>
          <a href={site.resume} className="btn btn-primary btn-sm nav-resume" download>
            Resume
          </a>
          <button
            className="nav-burger"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <Icon.close width={22} height={22} /> : <Icon.menu width={22} height={22} />}
          </button>
        </div>
      </div>

      <div id="mobile-menu" className={`nav-mobile ${open ? "nav-mobile-open" : ""}`}>
        <nav aria-label="Mobile">
          {links.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              onClick={close}
              style={{ transitionDelay: open ? `${80 + i * 45}ms` : "0ms" }}
            >
              <span className="nav-mobile-index">0{i + 1}</span>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="nav-mobile-bottom">
          <a href={site.github} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
            <Icon.github width={18} height={18} /> GitHub
          </a>
          <a href={site.linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
            <Icon.linkedin width={17} height={17} /> LinkedIn
          </a>
          <a href={site.resume} className="btn btn-primary" download>
            <Icon.download width={17} height={17} /> Download Resume
          </a>
        </div>
      </div>
    </header>
  );
}
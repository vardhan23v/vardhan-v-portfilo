import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { site } from "../data/site";

const links = [
  { label: "work", href: "/#work" },
  { label: "experience", href: "/#experience" },
  { label: "tech", href: "/#tech" },
  { label: "about", href: "/#about" },
  { label: "mail", href: "/#contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const { pathname } = useLocation();
  const onCase = pathname.startsWith("/work/");

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const clock = now.toTimeString().slice(0, 8);

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="nav-brand" aria-label="Vardhan V — back to shell">
          vardhan&nbsp;.v
        </Link>

        <span className="nav-path" aria-hidden="true">
          {onCase ? "~/work/*" : "~"} <span className="bracket">$</span> _
        </span>

        <nav className="nav-links" aria-label="Primary">
          {links.map((l) => (
            <Link key={l.href} to={l.href} title={`$ cd ${l.label}`}>
              <b>$</b> {l.label}
            </Link>
          ))}
        </nav>

        <time className="nav-clock" dateTime={now.toISOString()}>
          {clock}
        </time>

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

      <div id="mobile-menu" className={`nav-mobile ${open ? "nav-mobile-open" : ""}`}>
        <nav aria-label="Mobile">
          {links.map((l) => (
            <Link key={l.href} to={l.href} onClick={() => setOpen(false)}>
              <b>$</b> cd {l.label}/
            </Link>
          ))}
        </nav>
        <div className="nav-mobile-meta">
          <a href={site.resume} download>
            download resume
          </a>
          <a href={site.github} target="_blank" rel="noopener noreferrer">
            github.com/vardhan23v
          </a>
          <a href={site.linkedin} target="_blank" rel="noopener noreferrer">
            linkedin.com/in/vardhan-v23
          </a>
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </div>
      </div>
    </header>
  );
}
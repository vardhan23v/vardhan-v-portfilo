import { useEffect, useRef, useState } from "react";
import { site } from "../data/site";

const LINKS = [
  { href: "#work", label: "Work" },
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#skills", label: "Skills" },
  { href: "#contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const sheet = sheetRef.current;
    const focusables = () => Array.from(sheet?.querySelectorAll<HTMLElement>("a, button") ?? []);
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); buttonRef.current?.focus(); return; }
      if (e.key !== "Tab") return;
      const f = focusables();
      if (f.length === 0) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.documentElement.style.overflow = ""; };
  }, [open]);

  return (
    <header className="nav">
      <div className="nav-inner">
        <a className="nav-mark" href="#top">{site.name}</a>
        <nav className="nav-links" aria-label="Sections">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
        </nav>
        <div className="nav-end">
          <a className="btn btn--ghost nav-resume" href={site.resume} download="sree-vardhan-v-resume.pdf">Résumé</a>
          <a className="btn nav-cta" href="#contact">Contact me</a>
          <button type="button" className="nav-menu" ref={buttonRef} aria-expanded={open} aria-controls="nav-sheet" onClick={() => setOpen((o) => !o)}>
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>
      <div className={`nav-sheet${open ? " is-open" : ""}`} id="nav-sheet" ref={sheetRef} role="dialog" aria-modal="true" aria-label="Menu" hidden={!open}>
        <nav aria-label="Menu sections">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
          ))}
        </nav>
        <div className="nav-sheet-foot">
          <a className="btn" href="#contact" onClick={() => setOpen(false)}>Contact me</a>
          <a className="btn btn--secondary" href={site.resume} download="sree-vardhan-v-resume.pdf">Résumé</a>
          <button type="button" className="btn btn--ghost" onClick={() => { setOpen(false); buttonRef.current?.focus(); }}>Close</button>
        </div>
      </div>
    </header>
  );
}

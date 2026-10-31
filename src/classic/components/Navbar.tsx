import { useEffect, useRef, useState } from "react";
import { site } from "../data/site";
import { motionReduced } from "../../lib/motion";

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
  const headerRef = useRef<HTMLElement>(null);
  const linksRef = useRef<HTMLElement>(null);
  const indRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState<string | null>(null);

  // Shadow once the page moves; slide away on the way down, back on the way up.
  useEffect(() => {
    const nav = headerRef.current;
    if (!nav) return;
    let lastY = window.scrollY;
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      nav.classList.toggle("is-scrolled", y > 8);
      const busy = nav.contains(document.activeElement) || document.documentElement.style.overflow === "hidden";
      const hide = !motionReduced() && !busy && y > Math.max(600, window.innerHeight * 0.8) && y > lastY + 2;
      if (hide) nav.classList.add("is-hidden");
      else if (y < lastY - 2 || y <= 600 || busy) nav.classList.remove("is-hidden");
      lastY = y;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    nav.addEventListener("focusin", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); nav.removeEventListener("focusin", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);

  // The section in the middle band of the viewport is the current one.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const ids = LINKS.map((l) => l.href.slice(1));
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
    }, { rootMargin: "-45% 0px -50% 0px" });
    for (const id of ids) { const el = document.getElementById(id); if (el) io.observe(el); }
    const top = document.getElementById("top");
    const ioTop = top ? new IntersectionObserver(([e]) => { if (e.isIntersecting) setActive(null); }, { rootMargin: "-45% 0px -50% 0px" }) : null;
    if (top) ioTop?.observe(top);
    return () => { io.disconnect(); ioTop?.disconnect(); };
  }, []);

  // One underline slides to the active link.
  useEffect(() => {
    const ind = indRef.current, links = linksRef.current;
    if (!ind || !links) return;
    const place = () => {
      const a = active ? links.querySelector<HTMLElement>(`a[href="#${active}"]`) : null;
      if (!a) { ind.style.opacity = "0"; return; }
      ind.style.opacity = "1";
      ind.style.transform = `translateX(${a.offsetLeft + 12}px) scaleX(${(a.offsetWidth - 24) / 100})`;
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [active]);

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
    <header className="nav" ref={headerRef}>
      <div className="nav-inner">
        <a className="nav-mark" href="#top">{site.name}</a>
        <nav className="nav-links" aria-label="Sections" ref={linksRef}>
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} aria-current={active === l.href.slice(1) ? "location" : undefined}>{l.label}</a>
          ))}
          <span className="nav-ind" ref={indRef} aria-hidden="true" />
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

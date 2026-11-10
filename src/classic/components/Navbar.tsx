import { useEffect, useRef, useState } from "react";
import { site } from "../data/site";
import { motionReduced } from "../../lib/motion";

const LINKS = [
  { href: "#about", label: "About" },
  { href: "#work", label: "Projects" },
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
  const activeRef = useRef<string | null>(null);
  const progRef = useRef<HTMLSpanElement>(null);
  useEffect(() => { activeRef.current = active; }, [active]);
  const openRef = useRef(false);
  useEffect(() => {
    openRef.current = open;
    if (open) headerRef.current?.removeAttribute("data-hidden");
  }, [open]);

  // A hairline shadow once the page has moved, so the bar reads as sitting above the content.
  useEffect(() => {
    const nav = headerRef.current;
    if (!nav) return;
    let raf = 0;
    let lastY = window.scrollY;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      nav.classList.toggle("is-scrolled", y > 8);
      // Out of the way while reading down (past 200px), back the moment the reader scrolls up. Never while
      // the menu is open or focus is inside the bar, and never under reduced motion.
      const keep = openRef.current || nav.contains(document.activeElement) || motionReduced() || document.visibilityState !== "visible" || y <= 200;
      if (keep) nav.removeAttribute("data-hidden");
      else if (y > lastY + 4) nav.setAttribute("data-hidden", "");
      else if (y < lastY - 4) nav.removeAttribute("data-hidden");
      if (Math.abs(y - lastY) > 4 || keep) lastY = y;
      // How far through the current section the reader is: fills the hairline under the bar.
      const bar = progRef.current;
      const sec = activeRef.current ? document.getElementById(activeRef.current) : null;
      if (bar) {
        if (!sec) { bar.style.transform = "scaleX(0)"; return; }
        const r = sec.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (window.innerHeight * 0.5 - r.top) / r.height));
        bar.style.transform = `scaleX(${p.toFixed(3)})`;
      }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    // Keyboard users tabbing into a hidden bar get it back at once.
    const onFocus = () => nav.removeAttribute("data-hidden");
    // A page that goes hidden may stop ticking frames; never leave the bar parked off screen there.
    const onVis = () => { if (document.visibilityState !== "visible") nav.removeAttribute("data-hidden"); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    nav.addEventListener("focusin", onFocus);
    document.addEventListener("visibilitychange", onVis);
    return () => { window.removeEventListener("scroll", onScroll); nav.removeEventListener("focusin", onFocus); document.removeEventListener("visibilitychange", onVis); nav.removeAttribute("data-hidden"); if (raf) cancelAnimationFrame(raf); };
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
    // The header's Close toggle stays visible above the sheet, so it is part of the Tab cycle too.
    const focusables = () => [buttonRef.current, ...Array.from(sheet?.querySelectorAll<HTMLElement>("a, button") ?? [])].filter((el): el is HTMLElement => Boolean(el));
    sheet?.querySelector<HTMLElement>("a, button")?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); buttonRef.current?.focus({ preventScroll: true }); return; }
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
    <>
    <header className="nav" ref={headerRef} data-menu-open={open ? "" : undefined}>
      <div className="nav-inner">
        <a className="nav-mark" href="#top" aria-label={`${site.name}, home`}>{site.name}</a>
        <span className="nav-progress" ref={progRef} aria-hidden="true" />
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
    </header>
      <div className={`nav-sheet${open ? " is-open" : ""}`} id="nav-sheet" ref={sheetRef} role="dialog" aria-modal="true" aria-label="Menu" hidden={!open}>
        <nav aria-label="Menu sections">
          {LINKS.map((l, i) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} aria-current={active === l.href.slice(1) ? "location" : undefined} style={{ "--i": i } as React.CSSProperties}>{l.label}</a>
          ))}
        </nav>
        <div className="nav-sheet-foot">
          <a className="btn" href="#contact" onClick={() => setOpen(false)}>Contact me</a>
          <a className="btn btn--secondary" href={site.resume} download="sree-vardhan-v-resume.pdf">Résumé</a>
          <a className="btn btn--secondary" href={site.github} target="_blank" rel="noopener noreferrer">GitHub</a>
          <a className="btn btn--secondary" href={site.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a className="btn btn--secondary" href={`mailto:${site.email}`}>Email</a>
          <button type="button" className="btn btn--ghost" onClick={() => { setOpen(false); buttonRef.current?.focus({ preventScroll: true }); }}>Close</button>
        </div>
      </div>
    </>
  );
}

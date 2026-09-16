import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { InterfaceSwitcher } from "../../interface-switcher/InterfaceSwitcher";
import { site } from "../data/site";
import { useActiveSection } from "../hooks/useActiveSection";
import { usePhosphor } from "../hooks/usePhosphor";
import { nextPhosphor, setPhosphor } from "../lib/phosphor";
import { motionReduced } from "../../lib/motion";

const WINDOWS = [
  { n: 0, label: "~", id: "", href: "/terminal" },
  { n: 1, label: "work", id: "work", href: "/terminal#work" },
  { n: 2, label: "experience", id: "experience", href: "/terminal#experience" },
  { n: 3, label: "tech", id: "tech", href: "/terminal#tech" },
  { n: 4, label: "about", id: "about", href: "/terminal#about" },
  { n: 5, label: "mail", id: "contact", href: "/terminal#contact" },
];

const isTyping = (t: EventTarget | null) => {
  const el = t as HTMLElement | null;
  return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
};

/**
 * The edition's only chrome: a tmux/vim-style bar pinned to the bottom.
 * Mode, brand, section "windows", scroll position, phosphor, clock and the
 * interface switcher; on phones the windows collapse into a bottom sheet.
 * Also owns the vim scroll keys (j / k / gg / G).
 */
export function StatusLine() {
  const { pathname } = useLocation();
  const section = useActiveSection();
  const phosphor = usePhosphor();
  const [pct, setPct] = useState(0);
  const [line, setLine] = useState(1);
  const [insert, setInsert] = useState(false);
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const onCase = pathname.startsWith("/terminal/work/");

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setPct(max > 0 ? Math.min(100, Math.round((window.scrollY / max) * 100)) : 100);
      setLine(1 + Math.floor(window.scrollY / 24));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [pathname]);

  useEffect(() => {
    const onFocus = (e: FocusEvent) => setInsert(isTyping(e.target));
    const onBlur = () => setInsert(false);
    document.addEventListener("focusin", onFocus);
    document.addEventListener("focusout", onBlur);
    return () => {
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("focusout", onBlur);
    };
  }, []);

  // vim motion keys + Esc closes the sheet
  useEffect(() => {
    let lastG = 0;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return setOpen(false);
      if (e.altKey || e.ctrlKey || e.metaKey || isTyping(e.target)) return;
      const behavior: ScrollBehavior = motionReduced() ? "auto" : "smooth";
      const step = Math.round(window.innerHeight * 0.12);
      if (e.key === "j") window.scrollBy({ top: step, behavior });
      else if (e.key === "k") window.scrollBy({ top: -step, behavior });
      else if (e.key === "G") window.scrollTo({ top: document.documentElement.scrollHeight, behavior });
      else if (e.key === "g") {
        const now = performance.now();
        if (now - lastG < 450) window.scrollTo({ top: 0, behavior });
        lastG = now;
        return;
      } else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const cwd = onCase ? `~/work/${pathname.split("/").pop()}` : section ? `~/${section}` : "~";
  const pos = pct <= 0 ? "Top" : pct >= 100 ? "Bot" : `${pct}%`;
  const clock = now.toTimeString().slice(0, 8);

  return (
    <>
      <div className={`statusline ${open ? "is-open" : ""}`} role="navigation" aria-label="Terminal navigation and status">
        <span className={`sl-mode ${insert ? "is-insert" : ""}`} role="status">
          {insert ? "-- INSERT --" : "-- NORMAL --"}
        </span>
        <Link to="/terminal" className="sl-brand" aria-label="vardhan.v — back to the shell">
          vardhan.v
        </Link>

        <nav className="sl-windows" aria-label="Sections">
          {WINDOWS.map((w) => {
            const active = !onCase && (w.id ? section === w.id : !section);
            return (
              <Link key={w.n} to={w.href} className={active ? "is-active" : ""} aria-current={active ? "location" : undefined} title={`$ cd ${w.label}`}>
                <b>{w.n}:</b>
                {w.label}
                {active ? "*" : ""}
              </Link>
            );
          })}
          {onCase && (
            <span className="is-active" aria-current="location">
              <b>6:</b>
              {cwd.split("/").pop()}*
            </span>
          )}
        </nav>

        <span className="sl-fill" aria-hidden="true">
          <i style={{ width: `${pct}%` }} />
        </span>

        <span className="sl-switcher">
          <InterfaceSwitcher current="terminal" />
        </span>

        <button
          type="button"
          className="sl-phosphor"
          onClick={() => setPhosphor(nextPhosphor(phosphor))}
          title="Cycle CRT phosphor (also: `theme <name>` in the shell)"
          aria-label={`Phosphor: ${phosphor}. Click to change.`}
        >
          <i aria-hidden="true" /> {phosphor}
        </button>
        <span className="sl-pos" aria-label={`Reading ${cwd}, ${pos}`}>
          ln {line} · {pos}
        </span>
        <time className="sl-clock" dateTime={now.toISOString()}>
          {clock}
        </time>

        <button
          className={`sl-burger ${open ? "is-x" : ""}`}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="sl-sheet"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </div>

      <div id="sl-sheet" className={`sl-sheet ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <nav aria-label="Mobile">
          {WINDOWS.map((w) => (
            <Link key={w.n} to={w.href} onClick={() => setOpen(false)}>
              <b>{w.n}:</b> cd {w.label}/
            </Link>
          ))}
        </nav>
        <div className="sl-sheet-meta">
          <InterfaceSwitcher current="terminal" />
          <a href={site.resume} download>download resume</a>
          <a href={site.github} target="_blank" rel="noopener noreferrer">github.com/vardhan23v</a>
          <a href={site.linkedin} target="_blank" rel="noopener noreferrer">linkedin.com/in/vardhan-v23</a>
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </div>
      </div>
      {open && <button type="button" className="sl-scrim" aria-label="Close menu" onClick={() => setOpen(false)} />}
    </>
  );
}

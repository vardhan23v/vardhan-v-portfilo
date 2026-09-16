import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { editionRoutes } from "../../editions";
import { InterfaceSwitcher } from "../../interface-switcher/InterfaceSwitcher";
import { site } from "../data/site";
import { useActiveSection } from "../hooks/useActiveSection";
import { usePhosphor } from "../hooks/usePhosphor";
import { isPhosphor, nextPhosphor, setPhosphor, PHOSPHORS } from "../lib/phosphor";
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
  const navigate = useNavigate();
  const section = useActiveSection();
  const [cmd, setCmd] = useState<string | null>(null); // vim ":" command line
  const [msg, setMsg] = useState<{ text: string; err?: boolean } | null>(null);
  const cmdRef = useRef<HTMLInputElement | null>(null);
  const msgTimer = useRef(0);

  const say = (text: string, err = false) => {
    setMsg({ text, err });
    window.clearTimeout(msgTimer.current);
    msgTimer.current = window.setTimeout(() => setMsg(null), err ? 3200 : 2200);
  };

  const runEx = (raw: string) => {
    const line = raw.trim();
    setCmd(null);
    if (!line) return;
    const [head, ...rest] = line.split(/\s+/);
    const arg = rest.join(" ");
    const behavior: ScrollBehavior = motionReduced() ? "auto" : "smooth";
    const win = WINDOWS.find((w) => String(w.n) === head || w.label === head || w.id === head);
    if (win) return navigate(win.href);
    switch (head) {
      case "q": case "q!": case "wq": case "x": case "quit": case "exit":
        say("exiting terminal — back to editions");
        return navigate("/", { viewTransition: true });
      case "w": case "write":
        return say('"portfolio" [readonly] nothing to write');
      case "e": case "edit": case "tabe": {
        const to = `/${arg.replace(/^\//, "")}`;
        if (editionRoutes.includes(to)) return navigate(to, { viewTransition: true });
        return say(`E32: unknown edition "${arg}" — try ${editionRoutes.map((r) => r.slice(1)).join(", ")}`, true);
      }
      case "theme": case "phosphor": case "colo": case "colorscheme":
        if (isPhosphor(arg)) { setPhosphor(arg); return say(`phosphor → ${arg}`); }
        return say(`E185: unknown phosphor "${arg}" — ${PHOSPHORS.join(" | ")}`, true);
      case "set":
        if (/^(no)?motion$/.test(arg)) return say("use the landing footer or ⌘K → Animations");
        return say(`E518: unknown option: ${arg}`, true);
      case "top": case "0": case "gg":
        return window.scrollTo({ top: 0, behavior });
      case "$": case "bot": case "bottom": case "G":
        return window.scrollTo({ top: document.documentElement.scrollHeight, behavior });
      case "resume": case "cv":
        window.open(site.resume, "_blank", "noopener");
        return say("opening resume.pdf");
      case "gh": case "github":
        window.open(site.github, "_blank", "noopener");
        return;
      case "mail": case "email":
        window.location.href = `mailto:${site.email}`;
        return;
      case "h": case "help":
        say(":1-5 sections · :e <edition> · :theme <p> · :q · :!<shell cmd>");
        return window.dispatchEvent(new CustomEvent("folio:shell", { detail: "help" }));
      case "sh": case "!":
        return window.dispatchEvent(new CustomEvent("folio:shell", { detail: arg }));
      default:
        if (head.startsWith("!")) return window.dispatchEvent(new CustomEvent("folio:shell", { detail: line.slice(1) }));
        if (/^\d+$/.test(head)) return say(`E486: no window ${head} (0–5)`, true);
        return say(`E492: Not an editor command: ${line}`, true);
    }
  };
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
      if (e.key === ":") {
        e.preventDefault();
        setCmd("");
        requestAnimationFrame(() => cmdRef.current?.focus());
        return;
      }
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
        {cmd !== null ? (
          <span className="sl-mode is-cmd">
            <span aria-hidden="true">:</span>
            <input
              ref={cmdRef}
              className="sl-cmd"
              value={cmd}
              onChange={(e) => setCmd(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") runEx(cmd);
                else if (e.key === "Escape") setCmd(null);
              }}
              onBlur={() => setCmd(null)}
              aria-label="Command line — type a vim command and press Enter"
              autoComplete="off"
              spellCheck={false}
            />
          </span>
        ) : (
          <span className={`sl-mode ${insert ? "is-insert" : ""}`} role="status">
            {insert ? "-- INSERT --" : "-- NORMAL --"}
          </span>
        )}
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

        {msg ? (
          <span className={`sl-msg ${msg.err ? "is-err" : ""}`} role="status">
            {msg.text}
          </span>
        ) : (
          <span className="sl-fill" aria-hidden="true">
            <i style={{ width: `${pct}%` }} />
          </span>
        )}

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

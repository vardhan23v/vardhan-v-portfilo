import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useShell } from "../../hooks/useShell";
import { useWindowManager, type AppId } from "../../hooks/useWindowManager";
import { useNav, type PageId } from "../../hooks/useNav";
import { AppGlyph } from "../ui/AppGlyph";
import { motionReduced } from "../../../lib/motion";

const LAUNCH_APPS: { id: AppId; label: string; hint: string }[] = [
  { id: "overview", label: "Overview", hint: "front page" },
  { id: "about", label: "About", hint: "the essay" },
  { id: "projects", label: "Projects", hint: "9 featured" },
  { id: "experience", label: "Experience", hint: "the ledger" },
  { id: "skills", label: "Skills", hint: "type specimen" },
  { id: "achievements", label: "Achievements", hint: "certifications" },
  { id: "contact", label: "Contact", hint: "say hello" },
  { id: "finder", label: "Finder", hint: "browse work" },
  { id: "terminal", label: "Terminal", hint: "type help" },
  { id: "vardhan-ai", label: "Messages", hint: "chat with vardhan" },
  { id: "notes", label: "Notes", hint: "markdown" },
  { id: "photos", label: "Photos", hint: "screenshots" },
  { id: "settings", label: "Settings", hint: "accent · theme" },
  { id: "about-mac", label: "About This Mac", hint: "specs" },
];

const PAGE_IDS = new Set<string>(["overview", "about", "projects", "experience", "skills", "achievements", "contact"]);

/** Full-screen searchable app grid (overlay, not a window). Zooms in on open and back out on close. */
export function Launchpad() {
  const { overlay, setOverlay } = useShell();
  const { openWindow } = useWindowManager();
  const { navigate } = useNav();
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const open = overlay === "launchpad";
  const [visible, setVisible] = useState(open);
  const [closing, setClosing] = useState(false);
  const prevFocus = useRef<HTMLElement | null>(null);
  const launched = useRef(false);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return LAUNCH_APPS;
    return LAUNCH_APPS.filter((a) => a.label.toLowerCase().includes(s) || a.hint.includes(s) || a.id.includes(s));
  }, [q]);

  // Stay mounted for the exit animation, then leave.
  useEffect(() => {
    if (open) {
      prevFocus.current = document.activeElement as HTMLElement | null;
      launched.current = false;
      setVisible(true);
      setClosing(false);
      setQ("");
      setIdx(0);
      const t = window.setTimeout(() => inputRef.current?.focus(), 30);
      return () => window.clearTimeout(t);
    }
    if (!visible) return;
    setClosing(true);
    const t = window.setTimeout(
      () => {
        setVisible(false);
        setClosing(false);
        // Keyboard focus goes back to whatever opened Launchpad, unless an app was launched.
        const el = prevFocus.current;
        if (!launched.current && el && el.isConnected && el !== document.body) el.focus({ preventScroll: true });
      },
      motionReduced() ? 0 : 200
    );
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    setIdx(0);
  }, [q]);

  if (!visible) return null;

  const launch = (id: AppId) => {
    if (closing) return;
    launched.current = true;
    if (PAGE_IDS.has(id)) navigate(id as PageId);
    openWindow(id);
    setOverlay("none");
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (closing) return;
    const grid = (e.currentTarget as HTMLElement).querySelector(".mac-launchpad__grid");
    const cols = grid ? getComputedStyle(grid).gridTemplateColumns.split(" ").length : 6;
    if (e.key === "Escape") { e.preventDefault(); setOverlay("none"); }
    else if (e.key === "Enter") { e.preventDefault(); if (list[idx]) launch(list[idx].id); }
    else if (e.key === "ArrowRight") { e.preventDefault(); setIdx((i) => Math.min(list.length - 1, i + 1)); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); setIdx((i) => Math.max(0, i - 1)); }
    else if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(list.length - 1, i + cols)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(0, i - cols)); }
  };

  return (
    <div
      className={`mac-launchpad${closing ? " is-closing" : ""}`}
      role="dialog"
      aria-modal={closing ? undefined : "true"}
      aria-hidden={closing || undefined}
      inert={closing}
      aria-label="Launchpad"
      onClick={() => setOverlay("none")}
      onKeyDown={onKey}
    >
      <div className="mac-launchpad__inner" onClick={(e) => e.stopPropagation()}>
        <label className="mac-launchpad__search">
          <Search />
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search apps" aria-label="Search apps" />
        </label>
        <div className="mac-launchpad__grid" role="listbox" aria-label="Apps">
          {list.length === 0 && <div className="mac-launchpad__empty">Nothing called “{q}”.</div>}
          {list.map((a, i) => (
            <button
              key={a.id}
              role="option"
              aria-selected={i === idx}
              className={`mac-launchpad__app${i === idx ? " is-active" : ""}`}
              onClick={() => launch(a.id)}
              onMouseEnter={() => setIdx(i)}
              style={{ "--i": i } as React.CSSProperties}
            >
              <AppGlyph id={a.id} size={64} />
              <span className="mac-launchpad__label">{a.label}</span>
              <span className="mac-launchpad__hint mac-caps">{a.hint}</span>
            </button>
          ))}
        </div>
        <div className="mac-launchpad__foot mac-caps">↑↓←→ move · ↵ open · esc close</div>
      </div>
    </div>
  );
}

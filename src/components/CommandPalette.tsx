import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { site } from "../classic/data/site";
import "./command-palette.css";

type Item = { id: string; label: string; hint: string; path?: string; href?: string; action?: "top" };

const ITEMS: Item[] = [
  { id: "home", label: "Home — landing", hint: "/", path: "/" },
  { id: "terminal", label: "Terminal interface", hint: "1", path: "/terminal" },
  { id: "classic", label: "Classic interface", hint: "2", path: "/classic" },
  { id: "paper", label: "Paper interface", hint: "3", path: "/paper" },
  { id: "aurora", label: "Aurora interface", hint: "4", path: "/aurora" },
  { id: "forge", label: "Forge interface", hint: "5", path: "/forge" },
  { id: "top", label: "Back to top", hint: "top", action: "top" },
  { id: "gh", label: "GitHub", hint: "↗", href: site.github },
  { id: "li", label: "LinkedIn", hint: "↗", href: site.linkedin },
  { id: "mail", label: "Email", hint: "✉", href: `mailto:${site.email}` },
  { id: "resume", label: "Resume", hint: "↗", href: site.resume },
];

export function CommandPalette() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ITEMS;
    return ITEMS.filter((i) => `${i.label} ${i.hint}`.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    if (index >= items.length) setIndex(0);
  }, [items.length, index]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => inputRef.current?.focus(), 20);
    return () => {
      document.body.style.overflow = "";
      clearTimeout(t);
    };
  }, [open]);

  const select = useCallback(
    (item: Item) => {
      setOpen(false);
      if (item.path) {
        navigate(item.path);
      } else if (item.href) {
        if (item.href.startsWith("mailto:")) {
          window.location.href = item.href;
        } else {
          window.open(item.href, "_blank", "noopener,noreferrer");
        }
      } else if (item.action === "top") {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
      }
    },
    [navigate]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      if (!open) return;
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setIndex((i) => Math.min(i + 1, items.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const it = items[index];
        if (it) select(it);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, items, index, select]);

  if (!open) return null;

  return (
    <div
      className="cp-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onClick={() => setOpen(false)}
    >
      <div className="cp-panel" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="cp-input"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIndex(0);
          }}
          placeholder="Jump to a page, interface, or link…"
          aria-label="Search"
        />
        {items.length ? (
          <div className="cp-list" role="listbox">
            {items.map((it, i) => (
              <button
                key={it.id}
                type="button"
                role="option"
                aria-selected={i === index}
                className={`cp-item${i === index ? " is-active" : ""}`}
                onMouseEnter={() => setIndex(i)}
                onClick={() => select(it)}
              >
                <span>{it.label}</span>
                <span className="cp-hint">{it.hint}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="cp-empty">No matches for “{query}”.</div>
        )}
        <div className="cp-footer">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  );
}
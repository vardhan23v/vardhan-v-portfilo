import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { site } from "../classic/data/site";
import "./command-palette.css";

type Item = {
  id: string;
  label: string;
  hint: string;
  keywords?: string;
  path?: string;
  href?: string;
  action?: "top" | "copy-email" | "copy-link" | "party" | "random";
};

const ITEMS: Item[] = [
  { id: "home", label: "Home — landing", hint: "/", path: "/" },
  { id: "terminal", label: "Terminal interface", hint: "1", keywords: "crt shell hacker", path: "/terminal" },
  { id: "classic", label: "Classic interface", hint: "2", keywords: "original dark", path: "/classic" },
  { id: "paper", label: "Paper interface", hint: "3", keywords: "light editorial print", path: "/paper" },
  { id: "aurora", label: "Aurora interface", hint: "4", keywords: "glass gradient", path: "/aurora" },
  { id: "forge", label: "Forge interface", hint: "5", keywords: "industrial", path: "/forge" },
  { id: "random", label: "Surprise me — random interface", hint: "⚄", keywords: "shuffle lucky", action: "random" },
  { id: "top", label: "Back to top", hint: "top", keywords: "scroll up", action: "top" },
  { id: "copy-email", label: "Copy email address", hint: "⧉", keywords: "clipboard contact", action: "copy-email" },
  { id: "copy-link", label: "Copy link to this page", hint: "⧉", keywords: "clipboard share url", action: "copy-link" },
  { id: "gh", label: "GitHub", hint: "↗", keywords: "code repos", href: site.github },
  { id: "li", label: "LinkedIn", hint: "↗", keywords: "social", href: site.linkedin },
  { id: "mail", label: "Email", hint: "✉", keywords: "contact mail", href: `mailto:${site.email}` },
  { id: "resume", label: "Resume", hint: "↗", keywords: "cv download", href: site.resume },
  { id: "party", label: "Party mode", hint: "🎉", keywords: "confetti easter egg konami fun", action: "party" },
];

const RECENTS_KEY = "cp-recents";
const editionPaths = ["/terminal", "/classic", "/paper", "/aurora", "/forge"];

function readRecents(): string[] {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function pushRecent(id: string) {
  try {
    const next = [id, ...readRecents().filter((x) => x !== id)].slice(0, 4);
    localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — recents are a convenience only */
  }
}

/** Subsequence fuzzy score: higher is better, -1 means no match. */
function fuzzyScore(query: string, text: string): number {
  let score = 0;
  let ti = 0;
  let streak = 0;
  for (const ch of query) {
    const found = text.indexOf(ch, ti);
    if (found === -1) return -1;
    streak = found === ti ? streak + 1 : 1;
    score += streak * 2 + (found === 0 || text[found - 1] === " " ? 3 : 0);
    ti = found + 1;
  }
  return score;
}

export function CommandPalette() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      const recents = readRecents();
      if (!recents.length) return ITEMS;
      const pinned = recents
        .map((id) => ITEMS.find((i) => i.id === id))
        .filter((i): i is Item => !!i);
      return [...pinned, ...ITEMS.filter((i) => !recents.includes(i.id))];
    }
    return ITEMS.map((i) => ({
      item: i,
      score: fuzzyScore(q, `${i.label} ${i.keywords ?? ""} ${i.hint}`.toLowerCase()),
    }))
      .filter((r) => r.score >= 0)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.item);
  }, [query]);

  useEffect(() => {
    if (index >= items.length) setIndex(0);
  }, [items.length, index]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    setCopied(null);
    const t = setTimeout(() => inputRef.current?.focus(), 20);
    return () => {
      document.body.style.overflow = "";
      clearTimeout(t);
    };
  }, [open]);

  const select = useCallback(
    (item: Item) => {
      pushRecent(item.id);
      if (item.action === "copy-email" || item.action === "copy-link") {
        const text = item.action === "copy-email" ? site.email : window.location.href;
        navigator.clipboard?.writeText(text).then(
          () => {
            setCopied(item.id);
            setTimeout(() => setOpen(false), 650);
          },
          () => setOpen(false)
        );
        return;
      }
      setOpen(false);
      if (item.action === "party") {
        window.dispatchEvent(new CustomEvent("vardhan:party"));
      } else if (item.action === "random") {
        const others = editionPaths.filter((p) => p !== window.location.pathname);
        navigate(others[Math.floor(Math.random() * others.length)], { viewTransition: true });
      } else if (item.path) {
        navigate(item.path, { viewTransition: true });
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
                <span>{copied === it.id ? "Copied ✓" : it.label}</span>
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

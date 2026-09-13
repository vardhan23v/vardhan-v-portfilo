import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Search, ArrowRight, Copy, Check, Shuffle } from "lucide-react";
import { usePalette } from "../../hooks/usePalette";
import { useNav, type PageId } from "../../hooks/useNav";
import { useTheme } from "../../hooks/useTheme";
import { site } from "../../data/site";
import "../../styles/command-palette.css";

interface CmdItem {
  id: string;
  label: string;
  hint?: string;
  keywords: string;
  action: () => void;
}

function fuzzyScore(query: string, text: string): number {
  if (!query) return 1;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t.includes(q)) return 2;
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length ? 1 : 0;
}

export function CommandPalette() {
  const { open, setOpen } = usePalette();
  const { navigate } = useNav();
  const { toggle } = useTheme();
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const commands: CmdItem[] = useMemo(
    () => [
      { id: "overview", label: "Go to Overview", hint: "1", keywords: "home overview main", action: () => navigate("overview") },
      { id: "about", label: "Go to About", hint: "2", keywords: "about me bio", action: () => navigate("about") },
      { id: "projects", label: "Go to Projects", hint: "3", keywords: "projects work portfolio", action: () => navigate("projects") },
      { id: "experience", label: "Go to Experience", hint: "4", keywords: "experience work history", action: () => navigate("experience") },
      { id: "skills", label: "Go to Skills", hint: "5", keywords: "skills tech stack", action: () => navigate("skills") },
      { id: "achievements", label: "Go to Achievements", hint: "6", keywords: "achievements education certifications", action: () => navigate("achievements") },
      { id: "contact", label: "Go to Contact", hint: "7", keywords: "contact email reach", action: () => navigate("contact") },
      { id: "theme", label: "Toggle Theme", hint: "light/dark", keywords: "theme dark light mode", action: toggle },
      { id: "random", label: "Surprise Me", hint: "🎲", keywords: "random shuffle surprise", action: () => navigate(["overview", "about", "projects", "experience", "skills", "achievements", "contact"][(Math.random() * 7) | 0] as PageId) },
      { id: "gh", label: "Open GitHub", hint: "↗", keywords: "github code repos", action: () => window.open(site.github, "_blank") },
      { id: "li", label: "Open LinkedIn", hint: "↗", keywords: "linkedin social", action: () => window.open(site.linkedin, "_blank") },
      { id: "resume", label: "Download Resume", hint: "↗", keywords: "resume cv download", action: () => window.open(site.resume, "_blank") },
      {
        id: "copy-email",
        label: "Copy Email",
        hint: "📋",
        keywords: "email copy contact",
        action: () => {
          navigator.clipboard.writeText(site.email);
          setCopied("copy-email");
          setTimeout(() => setCopied(null), 1500);
        },
      },
    ],
    [navigate, toggle],
  );

  const filtered = useMemo(() => {
    if (!query) return commands;
    return commands
      .map((c) => ({ ...c, score: fuzzyScore(query, c.label + " " + c.keywords) }))
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [query, commands]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIdx(0);
      setCopied(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const run = useCallback(
    (item: CmdItem) => {
      item.action();
      setOpen(false);
    },
    [setOpen],
  );

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[activeIdx]) run(filtered[activeIdx]);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, filtered, activeIdx, run, setOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, setOpen]);

  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  if (!open) return null;

  return (
    <div className="palette-overlay" onClick={() => setOpen(false)}>
      <div className="palette" onClick={(e) => e.stopPropagation()}>
        <div className="palette__input-wrap">
          <Search />
          <input
            ref={inputRef}
            className="palette__input"
            placeholder="Search Vardhan..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search commands"
          />
        </div>
        <div className="palette__list" ref={listRef}>
          {filtered.length === 0 ? (
            <div className="palette__empty">No results found</div>
          ) : (
            filtered.map((item, i) => (
              <button
                key={item.id}
                className={`palette__item ${i === activeIdx ? "palette__item--active" : ""}`}
                onClick={() => run(item)}
                onMouseEnter={() => setActiveIdx(i)}
              >
                {copied === item.id ? <Check /> : item.id === "copy-email" ? <Copy /> : <ArrowRight />}
                <span className="palette__item-label">{item.label}</span>
                {item.id === "random" ? (
                  <Shuffle style={{ width: 14, height: 14, color: "var(--text-tertiary)" }} />
                ) : item.hint ? (
                  <span className="palette__item-hint">{item.hint}</span>
                ) : null}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

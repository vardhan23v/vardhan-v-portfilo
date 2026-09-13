import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Search, ArrowRight, Copy, Check, Shuffle, ArrowUp } from "lucide-react";
import { usePalette } from "../../hooks/usePalette";
import { useNav, type PageId } from "../../hooks/useNav";
import { useTheme } from "../../hooks/useTheme";
import { useToast } from "../ui/Toast";
import { site } from "../../data/site";
import { featuredProjects } from "../../data/projects";
import "../../styles/command-palette.css";

interface CmdItem {
  id: string;
  label: string;
  hint?: string;
  group: string;
  keywords: string;
  action: () => void;
}

function fuzzyScore(query: string, text: string): number {
  if (!query) return 1;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t.includes(q)) return 3;
  // subsequence match
  let qi = 0;
  let streak = 0;
  let score = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      qi++;
      streak++;
      score += streak;
    } else {
      streak = 0;
    }
  }
  return qi === q.length ? score : 0;
}

export function CommandPalette() {
  const { open, setOpen } = usePalette();
  const { navigate, setOpenProject } = useNav();
  const { toggle } = useTheme();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const openProjectBySlug = useCallback(
    (slug: string) => {
      const p = featuredProjects.find((x) => x.slug === slug);
      if (!p) return;
      navigate("projects");
      setTimeout(() => setOpenProject(p), 60);
    },
    [navigate, setOpenProject]
  );

  const copyText = useCallback(
    async (id: string, text: string, msg: string) => {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        /* clipboard unavailable */
      }
      setCopied(id);
      toast(msg);
      setTimeout(() => setCopied(null), 1500);
    },
    [toast]
  );

  const commands: CmdItem[] = useMemo(
    () => [
      { id: "overview", label: "Go to Overview", hint: "1", group: "Pages", keywords: "home overview main workspace", action: () => navigate("overview") },
      { id: "about", label: "Go to About", hint: "2", group: "Pages", keywords: "about me bio story", action: () => navigate("about") },
      { id: "projects", label: "Go to Projects", hint: "3", group: "Pages", keywords: "projects work portfolio featured", action: () => navigate("projects") },
      { id: "experience", label: "Go to Experience", hint: "4", group: "Pages", keywords: "experience work history jobs", action: () => navigate("experience") },
      { id: "skills", label: "Go to Skills", hint: "5", group: "Pages", keywords: "skills tech stack tools", action: () => navigate("skills") },
      { id: "achievements", label: "Go to Achievements", hint: "6", group: "Pages", keywords: "achievements education certifications awards", action: () => navigate("achievements") },
      { id: "contact", label: "Go to Contact", hint: "7", group: "Pages", keywords: "contact email reach hire", action: () => navigate("contact") },
      ...featuredProjects.map((p) => ({
        id: `proj-${p.slug}`,
        label: `Open ${p.name}`,
        hint: "project",
        group: "Projects",
        keywords: `${p.tagline} ${p.tech.join(" ")} ${p.slug}`,
        action: () => openProjectBySlug(p.slug),
      })),
      { id: "theme", label: "Toggle theme", hint: "light/dark", group: "Actions", keywords: "theme dark light mode appearance", action: toggle },
      {
        id: "random",
        label: "Surprise me",
        hint: "🎲",
        group: "Actions",
        keywords: "random shuffle surprise lucky",
        action: () =>
          navigate(
            ["overview", "about", "projects", "experience", "skills", "achievements", "contact"][
              (Math.random() * 7) | 0
            ] as PageId
          ),
      },
      {
        id: "copy-email",
        label: "Copy email address",
        hint: "⧉",
        group: "Actions",
        keywords: "email copy contact clipboard",
        action: () => void copyText("copy-email", site.email, "Email copied to clipboard"),
      },
      {
        id: "copy-link",
        label: "Copy link to macOS edition",
        hint: "⧉",
        group: "Actions",
        keywords: "link copy share url clipboard",
        action: () => void copyText("copy-link", `${window.location.origin}/mac`, "Link copied to clipboard"),
      },
      {
        id: "top",
        label: "Back to top",
        hint: "↑",
        group: "Actions",
        keywords: "top scroll up",
        action: () => {
          document.querySelector(".mac-root .mac-content")?.scrollTo({ top: 0, behavior: "smooth" });
        },
      },
      { id: "gh", label: "Open GitHub", hint: "↗", group: "Links", keywords: "github code repos opensource", action: () => window.open(site.github, "_blank") },
      { id: "li", label: "Open LinkedIn", hint: "↗", group: "Links", keywords: "linkedin social career", action: () => window.open(site.linkedin, "_blank") },
      { id: "resume", label: "Download resume", hint: "↗", group: "Links", keywords: "resume cv download pdf", action: () => window.open(site.resume, "_blank") },
    ],
    [navigate, toggle, openProjectBySlug, copyText]
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    return commands
      .map((c) => ({ ...c, score: fuzzyScore(query, `${c.label} ${c.keywords}`) }))
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
  }, [open ]);

  const run = useCallback(
    (item: CmdItem) => {
      item.action();
      if (item.id !== "copy-email" && item.id !== "copy-link") setOpen(false);
      else setTimeout(() => setOpen(false), 650);
    },
    [setOpen]
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
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
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

  useEffect(() => {
    listRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  if (!open) return null;

  let lastGroup = "";
  return (
    <div className="palette-overlay" onClick={() => setOpen(false)}>
      <div
        className="palette"
        role="dialog"
        aria-modal="true"
        aria-label="Spotlight command palette"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="palette__input-wrap">
          <Search />
          <input
            ref={inputRef}
            className="palette__input"
            placeholder="Search pages, projects, actions…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search commands"
          />
        </div>
        <div className="palette__list" ref={listRef} role="listbox">
          {filtered.length === 0 ? (
            <div className="palette__empty">No results for “{query}”.</div>
          ) : (
            filtered.map((item, i) => {
              const showGroup = item.group !== lastGroup;
              lastGroup = item.group;
              return (
                <div key={item.id}>
                  {showGroup && query.trim() === "" && <div className="palette__group">{item.group}</div>}
                  <button
                    className={`palette__item ${i === activeIdx ? "palette__item--active" : ""}`}
                    onClick={() => run(item)}
                    onMouseEnter={() => setActiveIdx(i)}
                    role="option"
                    aria-selected={i === activeIdx}
                    data-active={i === activeIdx}
                  >
                    {copied === item.id ? (
                      <Check />
                    ) : item.id === "copy-email" || item.id === "copy-link" ? (
                      <Copy />
                    ) : item.id === "random" ? (
                      <Shuffle style={{ width: 14, height: 14 }} />
                    ) : item.id === "top" ? (
                      <ArrowUp style={{ width: 14, height: 14 }} />
                    ) : (
                      <ArrowRight />
                    )}
                    <span className="palette__item-label">{item.label}</span>
                    {item.hint ? <span className="palette__item-hint">{item.hint}</span> : null}
                  </button>
                </div>
              );
            })
          )}
        </div>
        <div className="palette__footer">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>esc close</span>
          <span style={{ marginLeft: "auto" }}>{filtered.length} results</span>
        </div>
      </div>
    </div>
  );
}

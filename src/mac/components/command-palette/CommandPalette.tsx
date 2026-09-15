import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Search, ArrowRight, Copy, Check, Shuffle, ArrowUp } from "lucide-react";
import { usePalette } from "../../hooks/usePalette";
import { useNav, type PageId } from "../../hooks/useNav";
import { useWindowManager } from "../../hooks/useWindowManager";
import { useTheme } from "../../hooks/useTheme";
import { useToast } from "../ui/Toast";
import { site } from "../../data/site";
import { featuredProjects } from "../../data/projects";

interface CmdItem {
  id: string;
  label: string;
  hint?: string;
  group: string;
  keywords: string;
  action: () => void;
}

function subseqScore(query: string, text: string): number {
  let qi = 0;
  let streak = 0;
  let score = 0;
  for (let ti = 0; ti < text.length && qi < query.length; ti++) {
    if (text[ti] === query[qi]) {
      qi++;
      streak++;
      score += streak;
    } else {
      streak = 0;
    }
  }
  return qi === query.length ? score : 0;
}

function fieldScore(query: string, text: string): number {
  if (text === query) return 5;
  if (text.startsWith(query)) return 4;
  if (text.includes(query)) return 3;
  return subseqScore(query, text) > 0 ? 1 : 0;
}

/**
 * Label matches dominate keyword matches, so "email" finds
 * "Copy email address" ahead of a project whose tagline mentions email.
 */
function fuzzyScore(query: string, label: string, keywords: string): number {
  if (!query) return 1;
  const q = query.toLowerCase().trim();
  const l = label.toLowerCase();
  const k = keywords.toLowerCase();
  return fieldScore(q, l) * 10 + fieldScore(q, k);
}

export function CommandPalette() {
  const { open, setOpen, items } = usePalette();
  const { navigate, setOpenProject } = useNav();
  const { openWindow } = useWindowManager();
  const { toggle } = useTheme();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef(0);
  const [closing, setClosing] = useState(false);

  // Desktop navigation: switch the page highlight AND open/focus its window.
  const go = useCallback(
    (p: PageId) => {
      navigate(p);
      openWindow(p);
    },
    [navigate, openWindow]
  );

  const openProjectBySlug = useCallback(
    (slug: string) => {
      const p = featuredProjects.find((x) => x.slug === slug);
      if (!p) return;
      go("projects");
      setTimeout(() => setOpenProject(p), 80);
    },
    [go, setOpenProject]
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
      { id: "overview", label: "Go to Overview", hint: "1", group: "Pages", keywords: "home overview main workspace", action: () => go("overview") },
      { id: "about", label: "Go to About", hint: "2", group: "Pages", keywords: "about me bio story", action: () => go("about") },
      { id: "projects", label: "Go to Projects", hint: "3", group: "Pages", keywords: "projects work portfolio featured", action: () => go("projects") },
      { id: "experience", label: "Go to Experience", hint: "4", group: "Pages", keywords: "experience work history jobs", action: () => go("experience") },
      { id: "skills", label: "Go to Skills", hint: "5", group: "Pages", keywords: "skills tech stack tools", action: () => go("skills") },
      { id: "achievements", label: "Go to Achievements", hint: "6", group: "Pages", keywords: "achievements education certifications awards", action: () => go("achievements") },
      { id: "contact", label: "Go to Contact", hint: "7", group: "Pages", keywords: "contact email reach hire", action: () => go("contact") },
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
          go(
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
      { id: "app-settings", label: "Open Settings", hint: "", group: "Apps", keywords: "settings preferences system", action: () => openWindow("settings") },
      { id: "app-finder", label: "Open Finder", hint: "", group: "Apps", keywords: "finder files browse", action: () => openWindow("finder") },
      { id: "app-terminal", label: "Open Terminal", hint: "", group: "Apps", keywords: "terminal shell cli command", action: () => openWindow("terminal") },
      { id: "app-ai", label: "Open Vardhan AI", hint: "✦", group: "Apps", keywords: "ai assistant chat muse", action: () => openWindow("vardhan-ai") },
      { id: "app-about", label: "About This Mac", hint: "", group: "Apps", keywords: "about mac system info vardhanos", action: () => openWindow("about-mac") },
      ...items.map((it) => ({ id: it.id, label: it.label, hint: it.hint, group: "Shell", keywords: `${it.label} ${it.hint ?? ""} shell desktop`, action: it.action })),
    ],
    [go, toggle, openProjectBySlug, copyText, openWindow, items]
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    return commands
      .map((c) => ({ ...c, score: fuzzyScore(query, c.label, c.keywords) }))
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

  const handleClose = useCallback(() => {
    setClosing(true);
    closeTimer.current = window.setTimeout(() => {
      setClosing(false);
      setOpen(false);
    }, 170);
  }, [setOpen]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  const run = useCallback(
    (item: CmdItem) => {
      item.action();
      if (item.id !== "copy-email" && item.id !== "copy-link") handleClose();
      else setTimeout(() => handleClose(), 650);
    },
    [handleClose]
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
        handleClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, filtered, activeIdx, run, handleClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) handleClose();
        else {
          setClosing(false);
          setOpen(true);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, handleClose]);

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
    <div className={`palette-overlay${closing ? " palette-overlay--closing" : ""}`} onClick={handleClose}>
      <div
        className={`palette${closing ? " palette--closing" : ""}`}
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

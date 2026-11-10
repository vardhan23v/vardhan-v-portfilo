import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { site } from "../classic/data/site";
import { caseStudies } from "../terminal/data/work";
import "./command-palette.css";
import { motionReduced, motionSummary, setMotionPreference } from "../lib/motion";
import { prefetchEdition } from "../lib/editionLoaders";

type Item = {
  id: string;
  label: string;
  hint: string;
  keywords?: string;
  path?: string;
  href?: string;
  action?: "top" | "copy-email" | "copy-link" | "party" | "random" | "motion";
};

const ITEMS: Item[] = [
  { id: "home", label: "Home — landing", hint: "/", path: "/" },
  { id: "terminal", label: "Terminal interface", hint: "1", keywords: "crt shell hacker", path: "/terminal" },
  { id: "classic", label: "Classic interface", hint: "2", keywords: "original dark", path: "/classic" },
  { id: "paper", label: "Paper interface", hint: "3", keywords: "light editorial print", path: "/paper" },
  { id: "aurora", label: "Aurora interface", hint: "4", keywords: "glass gradient", path: "/aurora" },
  { id: "forge", label: "Forge interface", hint: "5", keywords: "industrial", path: "/forge" },
  { id: "mac", label: "macOS interface", hint: "6", keywords: "mac application desktop", path: "/mac" },
  { id: "atlas", label: "Atlas interface", hint: "7", keywords: "map contour topographic survey", path: "/atlas" },
  ...caseStudies.map((c): Item => ({ id: `cs-${c.slug}`, label: `Case study — ${c.name}`, hint: "case", keywords: `project work ${c.tagline}`, path: `/work/${c.slug}` })),
  { id: "random", label: "Surprise me — random interface", hint: "⚄", keywords: "shuffle lucky", action: "random" },
  { id: "top", label: "Back to top", hint: "top", keywords: "scroll up", action: "top" },
  { id: "copy-email", label: "Copy email address", hint: "⧉", keywords: "clipboard contact", action: "copy-email" },
  { id: "copy-link", label: "Copy link to this page", hint: "⧉", keywords: "clipboard share url", action: "copy-link" },
  { id: "gh", label: "GitHub", hint: "↗", keywords: "code repos", href: site.github },
  { id: "li", label: "LinkedIn", hint: "↗", keywords: "social", href: site.linkedin },
  { id: "mail", label: "Email", hint: "✉", keywords: "contact mail", href: `mailto:${site.email}` },
  { id: "resume", label: "Resume", hint: "↗", keywords: "cv download", href: site.resume },
  { id: "party", label: "Party mode", hint: "🎉", keywords: "confetti easter egg konami fun", action: "party" },
  { id: "motion", label: "Animations — toggle", hint: "⟲", keywords: "motion reduce animation effects transitions", action: "motion" },
];

const withMotionLabel = (items: Item[]): Item[] =>
  items.map((i) => (i.id === "motion" ? { ...i, label: `${motionSummary().label} — click to change` } : i));

const RECENTS_KEY = "cp-recents";
const editionPaths = ["/terminal", "/classic", "/paper", "/aurora", "/forge", "/mac", "/atlas"];

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
  const { pathname } = useLocation();
  // /mac ships its own Spotlight-style palette — avoid a double overlay
  const isMac = pathname.startsWith("/mac");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);
  const [entering, setEntering] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const glideRef = useRef<HTMLSpanElement>(null);
  const opener = useRef<Element | null>(null);
  const closeTimer = useRef(0);
  const closingRef = useRef(false);

  const [motionTick, setMotionTick] = useState(0);
  const items = useMemo(() => {
    void motionTick;
    const q = query.trim().toLowerCase();
    if (!q) {
      const recents = readRecents();
      if (!recents.length) return withMotionLabel(ITEMS);
      const pinned = recents
        .map((id) => ITEMS.find((i) => i.id === id))
        .filter((i): i is Item => !!i);
      return withMotionLabel([...pinned, ...ITEMS.filter((i) => !recents.includes(i.id))]);
    }
    return withMotionLabel(ITEMS).map((i) => ({
      item: i,
      score: fuzzyScore(q, `${i.label} ${i.keywords ?? ""} ${i.hint}`.toLowerCase()),
    }))
      .filter((r) => r.score >= 0)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.item);
  }, [query, motionTick]);

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

  const enterTimer = useRef(0);
  const openPalette = useCallback(() => {
    opener.current = document.activeElement;
    setOpen(true);
    // rows animate in on the open render only (keyed rows re-inserted while typing would restart)
    clearTimeout(enterTimer.current);
    const animate = !motionReduced();
    setEntering(animate);
    if (animate) enterTimer.current = window.setTimeout(() => setEntering(false), 300);
  }, []);

  /** Every close path goes through here: a 140 ms exit (instant under reduced motion), then focus returns to the opener. */
  const close = useCallback((immediate = false) => {
    if (closingRef.current && !immediate) return;
    clearTimeout(closeTimer.current);
    const done = () => {
      closingRef.current = false;
      setClosing(false);
      setOpen(false);
      const back = opener.current as HTMLElement | null;
      opener.current = null;
      if (back && back.isConnected && back !== document.body) back.focus?.({ preventScroll: true });
    };
    if (immediate || motionReduced()) return done();
    closingRef.current = true;
    setClosing(true);
    closeTimer.current = window.setTimeout(done, 140);
  }, []);

  useEffect(() => () => {
    clearTimeout(closeTimer.current);
    clearTimeout(enterTimer.current);
  }, []);

  // The active row's edition starts downloading before Enter.
  const activePath = open ? items[index]?.path : undefined;
  useEffect(() => {
    if (activePath) prefetchEdition(activePath);
  }, [activePath]);

  // One highlight glides to the active row; the row stays in view while arrowing through the list.
  useLayoutEffect(() => {
    if (!open) return;
    const list = listRef.current;
    const glide = glideRef.current;
    const row = list?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!glide || !row) return;
    glide.style.transform = `translateY(${row.offsetTop}px)`;
    glide.style.height = `${row.offsetHeight}px`;
    glide.style.opacity = "1";
    row.scrollIntoView({ block: "nearest" });
  }, [index, items, open]);

  const select = useCallback(
    (item: Item) => {
      pushRecent(item.id);
      if (item.action === "copy-email" || item.action === "copy-link") {
        const text = item.action === "copy-email" ? site.email : window.location.href;
        navigator.clipboard?.writeText(text).then(
          () => {
            setCopied(item.id);
            setTimeout(() => close(), 650);
          },
          () => close()
        );
        return;
      }
      if (item.action === "motion") {
        const { pref } = motionSummary();
        setMotionPreference(pref === "on" ? "off" : pref === "off" ? "auto" : "on");
        setMotionTick((t) => t + 1);
        return; // stay open so the new state is visible
      }
      // a navigation's page transition covers the palette, so it leaves at once (and focus is not pulled back)
      const leaving = item.action === "random" || !!item.path;
      if (leaving) opener.current = null;
      close(leaving);
      if (item.action === "party") {
        window.dispatchEvent(new CustomEvent("vardhan:party"));
      } else if (item.action === "random") {
        const others = editionPaths.filter((p) => p !== window.location.pathname);
        navigate(others[Math.floor(Math.random() * others.length)], { viewTransition: true });
      } else if (item.path) {
        // Case studies offer a way back to the edition the palette was opened from.
        navigate(item.path, { viewTransition: true, state: { from: "/" + pathname.split("/")[1] } });
      } else if (item.href) {
        if (item.href.startsWith("mailto:")) {
          window.location.href = item.href;
        } else {
          window.open(item.href, "_blank", "noopener,noreferrer");
        }
      } else if (item.action === "top") {
        const reduced = motionReduced();
        window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
      }
    },
    [navigate, pathname, close]
  );

  useEffect(() => {
    if (isMac) {
      setOpen(false);
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (closingRef.current) return;
        if (open) close();
        else openPalette();
        return;
      }
      if (!open) return;
      if (closingRef.current) {
        e.preventDefault();
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        close();
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
  }, [open, items, index, select, isMac, close, openPalette]);

  if (isMac || !open) return null;

  const optId = (it: Item) => `cp-opt-${it.id}`;

  return (
    <div
      className="cp-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      data-state={closing ? "closing" : "open"}
      onClick={() => close()}
    >
      <div className="cp-panel" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="cp-input"
          value={query}
          onChange={(e) => {
            if (closingRef.current) return;
            setQuery(e.target.value);
            setIndex(0);
          }}
          placeholder="Jump to a page, interface, or link…"
          aria-label="Search"
          role="combobox"
          aria-expanded="true"
          aria-controls="cp-list"
          aria-autocomplete="list"
          aria-activedescendant={items[index] ? optId(items[index]) : undefined}
        />
        {items.length ? (
          <div ref={listRef} className="cp-list" id="cp-list" role="listbox" aria-label="Results" data-entering={entering || undefined}>
            <span ref={glideRef} className="cp-glide" aria-hidden="true" />
            {items.map((it, i) => (
              <button
                key={it.id}
                id={optId(it)}
                type="button"
                role="option"
                tabIndex={-1}
                aria-selected={i === index}
                className={`cp-item${i === index ? " is-active" : ""}`}
                style={{ "--i": i } as CSSProperties}
                onMouseEnter={() => setIndex(i)}
                onClick={() => {
                  if (!closingRef.current) select(it);
                }}
              >
                <span>{copied === it.id ? "Copied ✓" : it.label}</span>
                <span className="cp-hint">{it.hint}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="cp-empty" role="status">
            <span className="cp-empty-glyph" aria-hidden="true">⌕</span>
            <span className="cp-empty-text">No matches for “{query}”.</span>
          </div>
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

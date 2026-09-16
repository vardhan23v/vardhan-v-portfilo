import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { InterfaceSwitcher } from "../interface-switcher/InterfaceSwitcher";
import { useTilt } from "../hooks/useTilt";
import { Link } from "react-router-dom";
import { featuredProjects, type Project } from "../classic/data/projects";
import { experience, education, certifications } from "../classic/data/experience";
import { skillCategories, exploring } from "../classic/data/skills";
import { site } from "../classic/data/site";
import { github } from "../classic/data/stats";
import { Icon } from "../classic/lib/icons";
import { ExpandableTabs, type ExpandableTabItem } from "../components/ui/expandable-tabs";
import "./styles/aurora.css";
import { motionReduced } from "../lib/motion";

export const auroraProjects = featuredProjects;

type Filter = "all" | "ai" | "full-stack" | "tools";
type Sort = "default" | "az" | "tech";
type ViewMode = "grid" | "list";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "ai", label: "AI" },
  { id: "full-stack", label: "Full-stack" },
  { id: "tools", label: "Dev tools" },
];

const SORTS: { id: Sort; label: string }[] = [
  { id: "default", label: "Featured" },
  { id: "az", label: "A → Z" },
  { id: "tech", label: "Most stack" },
];

// Same order as the page: home, work, experience, about, contact.
const NAV_TABS: ExpandableTabItem[] = [
  { type: "tab", title: "Home", icon: <Icon.home width={16} height={16} />, value: "home" },
  { type: "tab", title: "Projects", icon: <Icon.folderKanban width={16} height={16} />, value: "work" },
  {
    type: "tab",
    title: "Experience",
    icon: <Icon.briefcase width={16} height={16} />,
    value: "experience",
  },
  { type: "separator" },
  { type: "tab", title: "About", icon: <Icon.user width={16} height={16} />, value: "about" },
  { type: "tab", title: "Contact", icon: <Icon.mail width={16} height={16} />, value: "contact" },
];

function catOf(p: Project): Exclude<Filter, "all"> {
  if (p.slug === "extension-ai") return "tools";
  if (p.slug === "ai-code-reviewer" || p.slug.endsWith("-ai")) return "ai";
  return "full-stack";
}

function useIstTime() {
  const [t, setT] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const tick = () => setT(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);
  return t;
}

const SECTIONS = [
  { id: "home", label: "Home" },
  { id: "work", label: "Work" },
  { id: "stack", label: "Stack" },
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
] as const;

const HUES = [
  { id: "violet", label: "Violet", deg: 0, swatch: "#a78bfa" },
  { id: "cyan", label: "Cyan", deg: -70, swatch: "#22d3ee" },
  { id: "pink", label: "Pink", deg: 40, swatch: "#f472b6" },
  { id: "mint", label: "Mint", deg: -120, swatch: "#34d399" },
] as const;
type HueId = (typeof HUES)[number]["id"];
const HUE_KEY = "au.hue";

function readHue(): HueId {
  try {
    const v = localStorage.getItem(HUE_KEY);
    return HUES.some((h) => h.id === v) ? (v as HueId) : "violet";
  } catch {
    return "violet";
  }
}

function repoOf(url: string) {
  const m = url.match(/github\.com\/([^/]+\/[^/#?]+)/);
  return m ? m[1] : null;
}

function relTime(iso: string) {
  const d = (Date.now() - new Date(iso).getTime()) / 864e5;
  if (d < 1) return "today";
  if (d < 2) return "yesterday";
  const unit = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"} ago`;
  if (d < 30) return unit(Math.round(d), "day");
  if (d < 365) return unit(Math.max(1, Math.round(d / 30)), "month");
  return unit(Math.max(1, Math.round(d / 365)), "year");
}

/** Stars and last push for a repo, cached for the session; null while loading or when GitHub is unreachable. */
function useRepoStats(github: string) {
  const [stats, setStats] = useState<{ stars: number; pushed: string } | null>(null);
  useEffect(() => {
    const repo = repoOf(github);
    if (!repo) return;
    const key = `au.gh.${repo}`;
    try {
      const cached = sessionStorage.getItem(key);
      if (cached) {
        setStats(JSON.parse(cached));
        return;
      }
    } catch {
      /* ignore */
    }
    let alive = true;
    fetch(`https://api.github.com/repos/${repo}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!alive || !j) return;
        const s = { stars: j.stargazers_count ?? 0, pushed: j.pushed_at ?? "" };
        setStats(s);
        try {
          sessionStorage.setItem(key, JSON.stringify(s));
        } catch {
          /* ignore */
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [github]);
  return stats;
}

/** Types each word out, holds, deletes, moves on. Static first word when motion is reduced. */
function Typer({ words }: { words: string[] }) {
  const [text, setText] = useState(motionReduced() ? words[0] : "");
  useEffect(() => {
    if (motionReduced()) return;
    let w = 0;
    let i = 0;
    let deleting = false;
    let t = 0;
    const step = () => {
      const word = words[w];
      if (!deleting) {
        i++;
        setText(word.slice(0, i));
        if (i === word.length) {
          deleting = true;
          t = window.setTimeout(step, 1700);
          return;
        }
        t = window.setTimeout(step, 46);
      } else {
        i--;
        setText(word.slice(0, i));
        if (i === 0) {
          deleting = false;
          w = (w + 1) % words.length;
          t = window.setTimeout(step, 320);
          return;
        }
        t = window.setTimeout(step, 24);
      }
    };
    t = window.setTimeout(step, 900);
    return () => clearTimeout(t);
  }, [words]);
  return (
    <span className="au-typer">
      {text}
      <i className="au-typer-caret" aria-hidden="true" />
    </span>
  );
}

/** Sets --sx/--sy on the element so a spotlight can follow the pointer. */
function spotlight(e: React.MouseEvent<HTMLElement>) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--sx", `${e.clientX - r.left}px`);
  el.style.setProperty("--sy", `${e.clientY - r.top}px`);
}

// ---------- engineering details (inline) ----------

export function AuroraDetails({ p }: { p: Project }) {
  const [open, setOpen] = useState(false);
  const ctrl = `au-eng-${p.slug}`;
  return (
    <div className="au-eng">
      <button
        type="button"
        className="au-eng-btn"
        aria-expanded={open}
        aria-controls={ctrl}
        onClick={() => setOpen(!open)}
      >
        <span>engineering details</span>
        <span className={`au-eng-arrow${open ? " open" : ""}`} aria-hidden="true">
          →
        </span>
      </button>
      <div className={`au-eng-wrap${open ? " open" : ""}`} id={ctrl}>
        <div className="au-eng-body">
          <div>
            <span className="au-eng-label">the problem</span>
            <p>{p.problem}</p>
          </div>
          <div>
            <span className="au-eng-label">what it does</span>
            <ul>
              {p.features.slice(0, 4).map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
          <div>
            <span className="au-eng-label">stack</span>
            <p>{p.tech.join(" · ")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuroraStat({ value, label, sub, i }: { value: number | null; label: string; sub?: string; i: number }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || value === null) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        io.disconnect();
        if (motionReduced()) {
          el.textContent = String(value);
          return;
        }
        const t0 = performance.now();
        const dur = 1200;
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = String(Math.round(eased * value));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value]);
  return (
    <div className="au-stat" style={{ "--i": i } as React.CSSProperties} onMouseMove={spotlight}>
      <span className="au-spot" aria-hidden="true" />
      <span className="au-stat-value" ref={ref}>
        {value === null ? "—" : 0}
      </span>
      <span className="au-stat-label">{label}</span>
      {sub && <span className="au-stat-sub">{sub}</span>}
    </div>
  );
}

// ---------- project modal ----------

function ProjectModal({
  p,
  index,
  total,
  dir,
  onClose,
  onStep,
  onToast,
}: {
  p: Project;
  index: number;
  total: number;
  dir: 1 | -1;
  onClose: () => void;
  onStep: (d: 1 | -1) => void;
  onToast: (msg: string) => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const gh = useRepoStats(p.github);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") onStep(1);
      else if (e.key === "ArrowLeft") onStep(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, onStep]);

  const copyLink = async () => {
    const url = `${site.url}/aurora#p=${p.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      onToast(`Link to ${p.name} copied.`);
    } catch {
      onToast(url);
    }
  };

  return (
    <div
      className="au-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={`${p.name} details`}
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="au-modal" key={p.slug} data-dir={dir}>
        <button type="button" className="au-modal-close" onClick={onClose} aria-label="Close">
          <Icon.close width={16} height={16} />
        </button>
        <div className="au-modal-nav">
          <button type="button" onClick={() => onStep(-1)} aria-label="Previous project" disabled={total < 2}>
            ←
          </button>
          <span>
            {index + 1} / {total}
          </span>
          <button type="button" onClick={() => onStep(1)} aria-label="Next project" disabled={total < 2}>
            →
          </button>
        </div>
        <div className="au-modal-head" style={{ "--pa1": p.accent[0] } as React.CSSProperties}>
          <span className="au-modal-emoji" aria-hidden="true">
            {p.emoji}
          </span>
          <div>
            <span className="au-rank">
              {catOf(p)} · {p.tech.slice(0, 2).join(" · ")}
            </span>
            <h3 className="au-modal-title">{p.name}</h3>
            <p className="au-modal-tagline">{p.tagline}</p>
            {gh && (
              <span className="au-modal-gh">
                ★ {gh.stars} {gh.stars === 1 ? "star" : "stars"}
                {gh.pushed && ` · updated ${relTime(gh.pushed)}`}
              </span>
            )}
          </div>
        </div>
        <div className="au-modal-body">
          <div>
            <span className="au-eng-label">the problem</span>
            <p>{p.problem}</p>
          </div>
          <div>
            <span className="au-eng-label">features</span>
            <ul className="au-modal-features">
              {p.features.map((f) => (
                <li key={f}>
                  <span className="au-modal-bullet" aria-hidden="true" /> {f}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <span className="au-eng-label">stack</span>
            <div className="au-modal-tech">
              {p.tech.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="au-modal-actions">
          <a href={p.github} target="_blank" rel="noopener noreferrer" className="aurora-btn aurora-btn-solid au-modal-btn">
            GitHub <span aria-hidden="true">↗</span>
          </a>
          {p.live && (
            <a href={p.live} target="_blank" rel="noopener noreferrer" className="aurora-btn au-modal-btn">
              Live Demo <span aria-hidden="true">↗</span>
            </a>
          )}
          <button type="button" className="aurora-btn au-modal-btn" onClick={copyLink}>
            Copy link <span aria-hidden="true">⧉</span>
          </button>
          <button type="button" className="aurora-btn au-modal-btn au-modal-ghost" onClick={onClose}>
            Close <span aria-hidden="true">✕</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function FeaturedProject({ p, onOpen }: { p: Project; onOpen: () => void }) {
  const ref = useTilt<HTMLDivElement>(4, ".au-ft");
  return (
    <div ref={ref} className="au-ft-tilt">
      <article
        className="au-ft"
        style={{ "--pa1": p.accent[0] } as React.CSSProperties}
        onClick={onOpen}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen();
          }
        }}
        aria-label={`Open ${p.name} quick view`}
        onMouseMove={spotlight}
      >
        <span className="au-spot" aria-hidden="true" />
        <div className="au-ft-copy">
          <span className="au-rank">Project 01 · flagship — click to explore</span>
          <h3 className="au-ft-name">{p.name}</h3>
          <p className="au-ft-tagline">{p.tagline}</p>
          <div className="au-card-tech">
            {p.tech.slice(0, 7).map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
          <div className="au-card-links" onClick={(e) => e.stopPropagation()}>
            <a href={p.github} target="_blank" rel="noopener noreferrer">
              GitHub <span aria-hidden="true">↗</span>
            </a>
            {p.live && (
              <a href={p.live} target="_blank" rel="noopener noreferrer">
                Live Demo <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <AuroraDetails p={p} />
          </div>
        </div>
        <div className="au-ft-visual" aria-hidden="true">
          <div className="au-ft-bloom" style={{ "--pa1": p.accent[0] } as React.CSSProperties} />
          <div className="au-ft-beam au-ft-beam-a" />
          <div className="au-ft-beam au-ft-beam-b" />
          <div className="au-ft-core">
            <span className="au-ft-glyph">{p.emoji}</span>
            <span className="au-ft-vname">{p.name}</span>
            <span className="au-ft-vcap">{p.slug} · v1.0 · prod</span>
          </div>
          <span className="au-ft-vtag">featured — press to view</span>
        </div>
      </article>
    </div>
  );
}

function AuroraCard({ p, n, i, onOpen }: { p: Project; n: string; i: number; onOpen: () => void }) {
  const ref = useTilt<HTMLDivElement>(5, ".au-card");
  return (
    <div ref={ref} className="au-tilt" style={{ "--i": i } as React.CSSProperties}>
      <article
        className="au-card"
        style={{ "--pa1": p.accent[0] } as React.CSSProperties}
        onClick={onOpen}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen();
          }
        }}
        aria-label={`Open ${p.name} quick view`}
        onMouseMove={spotlight}
      >
        <span className="au-spot" aria-hidden="true" />
        <span className="au-rank">{n} · {catOf(p)}</span>
        <h3 className="au-card-name">{p.name}</h3>
        <p className="au-card-tagline">{p.tagline}</p>
        <div className="au-card-tech">
          {p.tech.slice(0, 5).map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <div className="au-card-links" onClick={(e) => e.stopPropagation()}>
          <a href={p.github} target="_blank" rel="noopener noreferrer">
            GitHub <span aria-hidden="true">↗</span>
          </a>
          {p.live && (
            <a href={p.live} target="_blank" rel="noopener noreferrer">
              Live Demo <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
        <span className="au-card-cta" aria-hidden="true">
          quick view →
        </span>
      </article>
    </div>
  );
}

function CopyEmail() {
  const [copied, setCopied] = useState(false);
  const [burst, setBurst] = useState(0);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
    } catch {
      /* clipboard unavailable — fall back silently */
    }
    setCopied(true);
    setBurst((b) => b + 1);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      type="button"
      className={`aurora-btn au-copy${copied ? " au-copied" : ""}`}
      onClick={copy}
      aria-live="polite"
    >
      {copied ? "copied ✓" : "copy email"}
      {burst > 0 && (
        <span className="au-sparks" key={burst} aria-hidden="true">
          {Array.from({ length: 10 }, (_, i) => (
            <i key={i} style={{ "--a": `${i * 36}deg`, "--h": `${(i * 47) % 360}` } as React.CSSProperties} />
          ))}
        </span>
      )}
    </button>
  );
}

function ContactForm({ onToast }: { onToast: (msg: string) => void }) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  const validate = useCallback(() => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required";
    if (form.message.trim().length < 10) e.message = "At least 10 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [form]);

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSending(true);
    const subject = `Hello from ${form.name.trim()}`;
    const body = `${form.message.trim()}\n\n— ${form.name.trim()} (${form.email.trim()})`;
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setTimeout(() => {
      setSending(false);
      onToast(`Opening your email app with the message to ${site.email}.`);
    }, 600);
  };

  return (
    <form className="au-form" onSubmit={submit} noValidate>
      <div className="au-form-row">
        <label className="au-form-field">
          <span>Your name</span>
          <input
            value={form.name}
            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            placeholder="Ada Lovelace"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "au-err-name" : undefined}
          />
          {errors.name && <em id="au-err-name">{errors.name}</em>}
        </label>
        <label className="au-form-field">
          <span>Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
            placeholder="ada@analytical.engine"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "au-err-email" : undefined}
          />
          {errors.email && <em id="au-err-email">{errors.email}</em>}
        </label>
      </div>
      <label className="au-form-field">
        <span>Message</span>
        <textarea
          value={form.message}
          onChange={(e) => setForm((s) => ({ ...s, message: e.target.value }))}
          placeholder="Tell me about your idea, role, or project…"
          rows={4}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "au-err-msg" : undefined}
        />
        {errors.message && <em id="au-err-msg">{errors.message}</em>}
      </label>
      <div className="au-form-actions">
        <button type="submit" className="aurora-btn aurora-btn-solid" disabled={sending}>
          {sending ? "opening…" : "Send message"} <span aria-hidden="true">{sending ? "⟳" : "→"}</span>
        </button>
        <span className="au-form-hint">opens in your email app — replies within 24h</span>
      </div>
    </form>
  );
}

export function AuroraSite() {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("default");
  const [view, setView] = useState<ViewMode>("grid");
  const [skillFilter, setSkillFilter] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(0);
  const [scrolled, setScrolled] = useState(false);
  const [expandedExp, setExpandedExp] = useState<number | null>(0);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [mouse, setMouse] = useState({ x: 50, y: 50 });
  const [hue, setHue] = useState<HueId>(readHue);
  const [activeSection, setActiveSection] = useState<string>("home");
  const [modalDir, setModalDir] = useState<1 | -1>(1);
  const [rolling, setRolling] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const ist = useIstTime();
  const followers = github.followers;

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = NAV_TABS.findIndex((t) => t.type === "tab" && t.value === e.target.id);
          if (i >= 0) setSelected(i);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    for (const t of NAV_TABS) {
      if (t.type !== "tab" || !t.value) continue;
      const el = document.getElementById(t.value);
      if (el) obs.observe(el);
    }
    return () => obs.disconnect();
  }, []);

  const handleSelect = (i: number | null) => {
    setSelected(i);
    if (i === null) return;
    const t = NAV_TABS[i];
    if (t.type !== "tab" || !t.value) return;
    const el = document.getElementById(t.value);
    if (!el) return;
    const reduce = motionReduced();
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  // Marks reveal groups as they enter the viewport; drives the staggered
  // child entrances and the reveal fallback where view() timelines are missing.
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".aurora-root .au-reveal");
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        navRef.current?.style.setProperty("--sp", String(Math.min(1, window.scrollY / max)));
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Dot navigation: which section is on screen.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActiveSection(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    for (const s of SECTIONS) {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, []);

  // Hue preset: persisted, applied as a hue rotation on the glows and gradients.
  useEffect(() => {
    try {
      localStorage.setItem(HUE_KEY, hue);
    } catch {
      /* ignore */
    }
  }, [hue]);

  // Deep link: /aurora#p=<slug> opens that project's quick view.
  useEffect(() => {
    const m = window.location.hash.match(/^#p=([a-z0-9-]+)$/);
    if (!m) return;
    const p = auroraProjects.find((x) => x.slug === m[1]);
    if (!p) return;
    setActiveProject(p);
    setTimeout(() => document.getElementById("work")?.scrollIntoView({ block: "start" }), 50);
  }, []);

  useEffect(() => {
    if (activeProject) {
      history.replaceState(null, "", `#p=${activeProject.slug}`);
    } else if (window.location.hash.startsWith("#p=")) {
      history.replaceState(null, "", window.location.pathname);
    }
  }, [activeProject]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMouse({ x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 });
    };
    window.addEventListener("mousemove", onMove as unknown as EventListener);
    return () => window.removeEventListener("mousemove", onMove as unknown as EventListener);
  }, []);

  // derived project list
  const counts = useMemo(
    () =>
      auroraProjects.reduce(
        (m, p) => {
          m[catOf(p)]++;
          return m;
        },
        { ai: 0, "full-stack": 0, tools: 0 } as Record<Exclude<Filter, "all">, number>
      ),
    []
  );

  const filtered = useMemo(() => {
    let list = [...auroraProjects];
    if (filter !== "all") list = list.filter((p) => catOf(p) === filter);
    if (skillFilter) list = list.filter((p) => p.tech.some((t) => t.toLowerCase().includes(skillFilter.toLowerCase())));
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.tech.some((t) => t.toLowerCase().includes(q)) ||
          p.slug.includes(q)
      );
    }
    if (sort === "az") list.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "tech") list.sort((a, b) => b.tech.length - a.tech.length);
    return list;
  }, [filter, query, sort, skillFilter]);

  const featured = useMemo(() => filtered[0] ?? null, [filtered]);
  const rest = useMemo(() => (featured ? filtered.slice(1) : filtered), [filtered, featured]);
  const stackStrip = useMemo(() => skillCategories.flatMap((c) => c.items.map((i) => i.name)), []);
  const statData = useMemo(
    () => [
      { value: auroraProjects.length, label: "shipped products", sub: "live & open-source" },
      { value: experience.length, label: "roles & internships", sub: "2026 — present" },
      { value: skillCategories.reduce((s, c) => s + c.items.length, 0), label: "stack technologies", sub: "ai → product" },
      { value: followers, label: "github followers", sub: "@vardhan23v" },
    ],
    [followers]
  );

  // skill lab: unique techs from projects
  const labTechs = useMemo(() => {
    const s = new Set<string>();
    auroraProjects.forEach((p) => p.tech.forEach((t) => s.add(t)));
    return [...s].sort().slice(0, 28);
  }, []);

  const clearFilters = () => {
    setFilter("all");
    setQuery("");
    setSkillFilter(null);
    setSort("default");
  };

  const hasActiveFilters = filter !== "all" || !!query.trim() || !!skillFilter || sort !== "default";

  const modalList = filtered.length ? filtered : auroraProjects;
  const modalIndex = activeProject ? Math.max(0, modalList.findIndex((x) => x.slug === activeProject.slug)) : 0;
  const stepProject = useCallback(
    (d: 1 | -1) => {
      setActiveProject((cur) => {
        const list = filtered.length ? filtered : auroraProjects;
        const i = cur ? list.findIndex((x) => x.slug === cur.slug) : 0;
        return list[(i + d + list.length) % list.length] ?? cur;
      });
      setModalDir(d);
    },
    [filtered]
  );

  const randomProject = () => {
    if (rolling) return;
    setRolling(true);
    const pool = auroraProjects.filter((x) => x.slug !== activeProject?.slug);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setTimeout(
      () => {
        setRolling(false);
        setModalDir(1);
        setActiveProject(pick);
      },
      motionReduced() ? 0 : 520
    );
  };

  const hueDeg = HUES.find((h) => h.id === hue)?.deg ?? 0;

  return (
    <div className="aurora-root" data-cursor-off data-hue={hue} style={{ "--au-hue": `${hueDeg}deg` } as React.CSSProperties}>
      <div className="aurora-bg" aria-hidden="true" style={{ "--mx": `${mouse.x}%`, "--my": `${mouse.y}%` } as React.CSSProperties}>
        <div className="au-glow au-glow-purple" />
        <div className="au-glow au-glow-blue" />
        <div className="au-glow au-glow-cyan" />
        <div className="au-mouse-glow" style={{ left: `${mouse.x}%`, top: `${mouse.y}%` } as React.CSSProperties} />
      </div>

      {activeProject && (
        <ProjectModal
          p={activeProject}
          index={modalIndex}
          total={modalList.length}
          dir={modalDir}
          onClose={() => setActiveProject(null)}
          onStep={stepProject}
          onToast={showToast}
        />
      )}

      <nav className="au-dots" aria-label="Sections">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={`au-dot${activeSection === s.id ? " is-active" : ""}`}
            aria-current={activeSection === s.id ? "true" : undefined}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(s.id)?.scrollIntoView({ behavior: motionReduced() ? "auto" : "smooth", block: "start" });
            }}
          >
            <span className="au-dot-label">{s.label}</span>
            <i aria-hidden="true" />
          </a>
        ))}
      </nav>

      {toast && (
        <div className="au-toast" role="status" aria-live="polite">
          <span className="au-toast-dot" aria-hidden="true" />
          {toast}
        </div>
      )}

      <div className="aurora-inner">
        <nav className={`aurora-nav${scrolled ? " is-scrolled" : ""}`} aria-label="Main" ref={navRef}>
          <Link to="/" className="aurora-wordmark">
            {site.name}
            <span className="dot">.</span>
          </Link>
          <ExpandableTabs
            className="aurora-nav-tabs"
            tabs={NAV_TABS}
            selected={selected}
            onSelect={handleSelect}
            activeColor="au-nav-tab-active"
          />
          <InterfaceSwitcher current="aurora" />
        </nav>

        <header className="aurora-hero" id="home">
          <div className="au-hero-copy">
            <p className="aurora-name">
              Sree Vardhan <span className="aurora-grad">V.</span>
            </p>
            <p className="aurora-eyebrow">
              <span className="glow-dot" aria-hidden="true" />
              generative ai · full-stack · product engineering
            </p>
            <h1 className="aurora-title">
              Where code meets <span className="aurora-grad">light.</span>
            </h1>
            <p className="aurora-lede">{site.tagline}</p>
            <p className="aurora-sub">
              AI-powered products and full-stack systems, shipped end-to-end — from LLM integration and agent tooling
              to the deployed app. Computer Science undergraduate at NMAM Institute of Technology.
            </p>
            <div className="au-hero-meta">
              <span className="au-availability">
                <i className="au-av-dot" aria-hidden="true" /> {site.availability}
              </span>
              <span className="au-hero-location">
                <Icon.mapPin width={12} height={12} aria-hidden="true" /> {site.location} · IST {ist || "--:--"}
              </span>
            </div>
            <div className="aurora-actions">
              <a className="aurora-btn aurora-btn-solid" href="#work">
                View selected work <span aria-hidden="true">→</span>
              </a>
              <a className="aurora-btn" href={site.github} target="_blank" rel="noopener noreferrer">
                GitHub <span aria-hidden="true">↗</span>
              </a>
              <a className="aurora-btn" href={site.resume} target="_blank" rel="noopener noreferrer">
                Resume <span aria-hidden="true">↗</span>
              </a>
            </div>
            <div className="au-hero-hints">
              <span>
                <kbd>⌘K</kbd> palette
              </span>
              <span>
                <kbd>1-6</kbd> switch interfaces
              </span>
              <span>click any card → quick view</span>
              <span className="au-hue" role="group" aria-label="Aurora colour">
                aurora
                {HUES.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    className={`au-hue-swatch${hue === h.id ? " is-active" : ""}`}
                    style={{ "--sw": h.swatch } as React.CSSProperties}
                    aria-pressed={hue === h.id}
                    aria-label={h.label}
                    title={h.label}
                    onClick={() => setHue(h.id)}
                  />
                ))}
              </span>
            </div>
          </div>
          <div className="au-hero-visual au-reveal" aria-hidden="true">
            <div className="au-sys-head">
              <span>
                building <Typer words={auroraProjects.map((p) => p.name)} />
              </span>
              <span className="au-sys-live">
                <i className="au-sys-dot" /> system online
              </span>
            </div>
            <div className="au-sys-list">
              <span className="au-sys-rail" />
              {["React", "Node.js", "Database", "LLM", "Product"].map((s, i) => (
                <div className="au-sys-row" key={s}>
                  <span className={`au-sys-name${i === 4 ? " au-sys-name-last" : ""}`}>{s}</span>
                  {i === 4 ? <span className="au-sys-chip">deployed</span> : <span className="au-sys-mark" />}
                </div>
              ))}
            </div>
            <div className="au-sys-foot">
              <span>react → node → database → llm → product</span>
              <span className="au-sys-clock">ist {ist}</span>
            </div>
            <div className="au-sys-stats">
              <span>
                <strong>{auroraProjects.length}</strong> products
              </span>
              <span>
                <strong>{experience.length}</strong> roles
              </span>
              <span>
                <strong>{skillCategories.reduce((a, c) => a + c.items.length, 0)}</strong> tech
              </span>
            </div>
          </div>
        </header>

        <div className="au-marquee au-reveal" aria-hidden="true">
          <div className="au-marquee-track">
            <span className="au-marquee-group">{stackStrip.join("  ·  ")}  ·  </span>
            <span className="au-marquee-group">{stackStrip.join("  ·  ")}  ·  </span>
          </div>
        </div>

        <div className="aurora-stats au-reveal" aria-label="Portfolio stats">
          {statData.map((s, i) => (
            <AuroraStat key={s.label} value={s.value} label={s.label} sub={s.sub} i={i} />
          ))}
        </div>

        {/* ---------- WORK ---------- */}
        <section className="aurora-section" id="work" aria-labelledby="aurora-work-title">
          <div className="aurora-head au-reveal">
            <div>
              <h2 id="aurora-work-title">Selected work</h2>
              <p className="aurora-subhead">
                A few things I&apos;ve built across AI, full-stack development, and developer tooling. Search, filter,
                and open any project for the full breakdown.
              </p>
            </div>
            <span className="tag">built &amp; shipped · {filtered.length} shown</span>
          </div>

          <div className="au-toolbar au-reveal">
            <div className="au-search">
              <Icon.code width={14} height={14} aria-hidden="true" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects, tech, or tags…"
                aria-label="Search projects"
              />
              {query && (
                <button type="button" className="au-search-clear" onClick={() => setQuery("")} aria-label="Clear search">
                  ✕
                </button>
              )}
            </div>
            <div className="au-toolbar-right">
              <label className="au-sort">
                <span>sort</span>
                <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort projects">
                  {SORTS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className={`au-random${rolling ? " is-rolling" : ""}`}
                onClick={randomProject}
                aria-label="Open a random project"
                title="Random project"
              >
                <span aria-hidden="true">⚄</span> random
              </button>
              <div className="au-view" role="group" aria-label="View mode">
                <button
                  type="button"
                  className={`au-view-btn${view === "grid" ? " is-active" : ""}`}
                  aria-pressed={view === "grid"}
                  aria-label="Grid view"
                  onClick={() => setView("grid")}
                >
                  ⊞
                </button>
                <button
                  type="button"
                  className={`au-view-btn${view === "list" ? " is-active" : ""}`}
                  aria-pressed={view === "list"}
                  aria-label="List view"
                  onClick={() => setView("list")}
                >
                  ☰
                </button>
              </div>
            </div>
          </div>

          <div className="au-filters au-reveal" role="group" aria-label="Filter projects by category">
            {FILTERS.map((f, i) => (
              <button
                key={f.id}
                type="button"
                className={`au-filter${filter === f.id ? " is-active" : ""}`}
                aria-pressed={filter === f.id}
                onClick={() => setFilter(f.id)}
                style={{ "--i": i } as React.CSSProperties}
              >
                {f.label}
                <span className="au-filter-count">{f.id === "all" ? auroraProjects.length : counts[f.id]}</span>
              </button>
            ))}
            {skillFilter && (
              <button type="button" className="au-filter is-active au-filter-skill" onClick={() => setSkillFilter(null)}>
                {skillFilter} <span aria-hidden="true">✕</span>
              </button>
            )}
            {hasActiveFilters && (
              <button type="button" className="au-filter au-filter-clear" onClick={clearFilters}>
                clear
              </button>
            )}
          </div>

          <div className={`au-projects au-reveal au-projects-${view}`}>
            {filtered.length === 0 ? (
              <div className="au-empty">
                <span className="au-empty-emoji" aria-hidden="true">
                  ⊘
                </span>
                <h3>No matches</h3>
                <p>
                  No projects match “<strong>{query || skillFilter || filter}</strong>”. Try clearing filters or searching
                  for React, AI, or Full-stack.
                </p>
                <button type="button" className="aurora-btn" onClick={clearFilters}>
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                {featured && <FeaturedProject key={`ft-${filter}-${query}-${skillFilter}-${sort}`} p={featured} onOpen={() => setActiveProject(featured)} />}
                {rest.length > 0 && (
                  <div className={`aurora-grid${view === "list" ? " is-list" : ""}`} key={`${filter}-${query}-${skillFilter}-${sort}-${view}`}>
                    {rest.map((p) => (
                      <AuroraCard
                        key={p.slug}
                        p={p}
                        n={String(auroraProjects.indexOf(p) + 1).padStart(2, "0")}
                        i={rest.indexOf(p)}
                        onOpen={() => setActiveProject(p)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="au-work-foot au-reveal">
            <span>
              {filtered.length} of {auroraProjects.length} projects · sorted by {SORTS.find((s) => s.id === sort)?.label.toLowerCase()}
            </span>
            <a href={site.github} target="_blank" rel="noopener noreferrer" className="au-work-foot-link">
              View all on GitHub <span aria-hidden="true">↗</span>
            </a>
          </div>
        </section>

        {/* ---------- SKILL LAB ---------- */}
        <section className="aurora-section" id="stack" aria-labelledby="aurora-stack-title">
          <div className="aurora-head au-reveal">
            <div>
              <h2 id="aurora-stack-title">Stack lab</h2>
              <p className="aurora-subhead">
                Click any technology to filter projects instantly — the stack is connected to the work above.
              </p>
            </div>
            <span className="tag">interactive</span>
          </div>
          <div className="au-lab au-reveal">
            <div className="au-lab-pills">
              {labTechs.map((t, i) => (
                <button
                  key={t}
                  type="button"
                  className={`au-lab-pill${skillFilter === t ? " is-active" : ""}`}
                  style={{ "--i": i } as React.CSSProperties}
                  aria-pressed={skillFilter === t}
                  onClick={() => {
                    setSkillFilter((prev) => (prev === t ? null : t));
                    const el = document.getElementById("work");
                    if (prevSkillFilter() !== t) el?.scrollIntoView({ behavior: "smooth", block: "start" });
                    function prevSkillFilter() {
                      return skillFilter;
                    }
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="au-lab-cats">
              {skillCategories.map((c) => (
                <div className="au-lab-cat" key={c.label}>
                  <span className="au-lab-cat-label">
                    <Icon.code width={12} height={12} aria-hidden="true" /> {c.label}
                  </span>
                  <span className="au-lab-cat-items">{c.items.map((i) => i.name).join(" · ")}</span>
                </div>
              ))}
            </div>
            <div className="au-lab-exploring">
              <span className="au-eng-label">currently exploring</span>
              <div className="au-lab-exploring-grid">
                {exploring.map((e) => (
                  <span key={e.name} title={e.note}>
                    <strong>{e.name}</strong> — {e.note}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="aurora-section" id="experience" aria-labelledby="aurora-exp-title">
          <div className="aurora-head au-reveal">
            <div>
              <h2 id="aurora-exp-title">Experience</h2>
              <p className="aurora-subhead">Where I&apos;ve been building — from AI testing to full-stack engineering.</p>
            </div>
            <span className="tag">the log · {experience.length} roles</span>
          </div>
          <div className="au-exp-list au-reveal">
            {experience.map((e, idx) => {
              const open = expandedExp === idx;
              return (
                <div className={`au-exp-row${open ? " is-open" : ""}`} key={e.company} style={{ "--i": idx } as React.CSSProperties}>
                  <span className="au-exp-dot" style={{ background: e.accent }} aria-hidden="true" />
                  <div className="au-exp-main">
                    <div className="au-exp-role">{e.role}</div>
                    <div className="au-exp-company">{e.company}</div>
                    <div className={`au-exp-points${open ? " is-open" : ""}`}>
                      <ul>
                        {e.points.map((pt) => (
                          <li key={pt}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="au-exp-meta">
                    <span className="au-exp-period">{e.period}</span>
                    <button
                      type="button"
                      className="au-exp-toggle"
                      aria-expanded={open}
                      onClick={() => setExpandedExp(open ? null : idx)}
                    >
                      {open ? "hide" : "details"} <span aria-hidden="true">{open ? "−" : "+"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ---------- EDUCATION ---------- */}
        <section className="aurora-section" id="education" aria-labelledby="aurora-edu-title">
          <div className="aurora-head au-reveal">
            <div>
              <h2 id="aurora-edu-title">Education</h2>
              <p className="aurora-subhead">The foundation behind the products — and the certifications that kept me honest.</p>
            </div>
            <span className="tag">foundation</span>
          </div>
          <div className="au-edu-grid au-reveal">
            <div className="au-edu-timeline">
              {education.map((ed, i) => (
                <div className="au-edu-card" key={ed.school} style={{ "--i": i } as React.CSSProperties}>
                  <span className="au-edu-dot" aria-hidden="true" />
                  <div>
                    <h3>{ed.school}</h3>
                    <p className="au-edu-degree">{ed.degree}</p>
                    {ed.detail && <p className="au-edu-detail">{ed.detail}</p>}
                  </div>
                  <span className="au-edu-period">{ed.period}</span>
                </div>
              ))}
            </div>
            <div className="au-cert-panel">
              <span className="au-eng-label">certifications · {certifications.length}</span>
              <div className="au-cert-grid">
                {certifications.map((c, i) => (
                  <span className="au-cert-chip" key={c} style={{ "--i": i } as React.CSSProperties}>
                    <Icon.cert width={12} height={12} aria-hidden="true" />
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="aurora-section" id="about" aria-labelledby="aurora-about-title">
          <div className="au-about">
            <div className="au-about-head">
              <h2 id="aurora-about-title">About</h2>
              <span className="tag">whoami</span>
            </div>
            <div className="au-about-body">
              <div className="au-prose au-reveal">
                <p>
                  I&apos;m a Computer Science undergraduate focused on Generative AI, full-stack development, and building
                  useful software products.
                </p>
                <p>
                  I enjoy working across the stack — from React interfaces and Node.js APIs to databases and LLM
                  integrations. Most of my learning happens through building and shipping real projects.
                </p>
                <div className="au-about-highlights">
                  <span>
                    <Icon.sparkles width={14} height={14} aria-hidden="true" /> Ships with AI — Muse Spark 1.2, DeepSeek, Kimi, MCP
                  </span>
                  <span>
                    <Icon.rocket width={14} height={14} aria-hidden="true" /> 9+ production products, 4 internships
                  </span>
                </div>
              </div>
              <dl className="au-meta au-reveal">
                <div className="au-meta-row">
                  <dt>Location</dt>
                  <dd>{site.location}</dd>
                </div>
                <div className="au-meta-row">
                  <dt>Education</dt>
                  <dd>NMAM Institute of Technology — CSE, 2024-2028</dd>
                </div>
                <div className="au-meta-row">
                  <dt>Focus</dt>
                  <dd>Generative AI · Full Stack · Developer Tools · Agentic systems</dd>
                </div>
                <div className="au-meta-row">
                  <dt>Currently</dt>
                  <dd>{site.availability}</dd>
                </div>
              </dl>
              <div className="au-skills au-reveal">
                {skillCategories.map((c, i) => (
                  <div className="au-skill-line" key={c.label} style={{ "--i": i } as React.CSSProperties}>
                    <span className="au-skill-label">{c.label}</span>
                    <span className="au-skill-items">{c.items.map((i) => i.name).join(" · ")}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="aurora-section" id="contact" aria-labelledby="aurora-contact-title">
          <div className="au-contact au-reveal">
            <h2 id="aurora-contact-title">
              Let&apos;s build something <span className="grad">beautiful.</span>
            </h2>
            <p>Open to internships, collaborations and interesting problems. Expect a reply within 24 hours.</p>
            <div className="au-contact-grid">
              <div className="au-contact-direct">
                <div className="aurora-actions">
                  <a className="aurora-btn aurora-btn-solid" href={`mailto:${site.email}`}>
                    {site.email}
                  </a>
                  <CopyEmail />
                </div>
                <div className="au-contact-links">
                  <a href={site.linkedin} target="_blank" rel="noopener noreferrer">
                    <Icon.linkedin width={15} height={15} /> {site.linkedin.replace("https://www.", "")}
                  </a>
                  <a href={site.github} target="_blank" rel="noopener noreferrer">
                    <Icon.github width={15} height={15} /> {site.github.replace("https://", "")}
                  </a>
                </div>
                <p className="au-contact-note">
                  Prefer a form? Fill it in and it opens your email app with the message ready to send — nothing is
                  stored here.
                </p>
              </div>
              <ContactForm onToast={showToast} />
            </div>
          </div>
        </section>

        <footer className="aurora-foot au-reveal">
          <span>© 2026 {site.name} — Aurora edition · IST {ist}</span>
          <span className="aurora-foot-links">
            <Link to="/">editions</Link>
            <a href={site.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a href={`mailto:${site.email}`}>Email</a>
            <button type="button" className="au-foot-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              top ↑
            </button>
          </span>
        </footer>
      </div>
    </div>
  );
}

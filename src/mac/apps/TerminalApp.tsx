import { useEffect, useRef, useState, useCallback } from "react";
import { useWindowManager, type AppId } from "../hooks/useWindowManager";
import { site } from "../data/site";
import { featuredProjects } from "../data/projects";
import { skillCategories } from "../data/skills";
import { experience } from "../data/experience";
import { useIstTime } from "../hooks/useIstTime";

interface Line { text: string; kind: "in" | "out" | "dim"; }

const OPEN_TARGETS: Record<string, AppId | "github" | "linkedin" | "resume"> = {
  projects: "projects", about: "about", skills: "skills", experience: "experience",
  contact: "contact", achievements: "achievements", overview: "overview",
  finder: "finder", terminal: "terminal", settings: "settings", ai: "vardhan-ai",
  "vardhan-ai": "vardhan-ai", "about-mac": "about-mac", aboutmac: "about-mac",
  github: "github", linkedin: "linkedin", resume: "resume",
};

const HELP = [
  "help — show this help",
  "ls — list projects      pwd — where am i",
  "whoami — who is vardhan   neofetch — system info   about — bio",
  "open <app> — open pages & apps (projects, finder, github, linkedin, resume…)",
  "repo <slug> — open a project's GitHub      date — current time",
  "skills | experience | contact — quick facts",
  "sudo hire vardhan — try it",
  "clear — clear screen",
];

/** Phase-5 Terminal: expanded command set over portfolio data.
 *  `open`, `repo`, `github`, `linkedin` drive real navigation. */
export function TerminalApp() {
  const { openWindow } = useWindowManager();
  const ist = useIstTime();
  const [lines, setLines] = useState<Line[]>([
    { text: "Vardhan OS · glass edition — type `help` to start.", kind: "dim" },
  ]);
  const [value, setValue] = useState("");
  const [hist, setHist] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [lines]);

  const print = (text: string, kind: Line["kind"] = "out") =>
    setLines((prev) => [...prev.slice(-120), { text, kind }]);

  const run = useCallback((raw: string) => {
    const cmd = raw.trim();
    if (!cmd) return;
    print(`vardhan@glass ~ ${cmd}`, "in");
    const [name, ...rest] = cmd.split(/\s+/);
    const arg = rest.join(" ");
    switch (name.toLowerCase()) {
      case "help": HELP.forEach((h) => print(h)); break;
      case "clear": setLines([]); break;
      case "pwd": print("/Users/vardhan"); break;
      case "whoami": print("vardhan — Generative AI & Full-Stack Developer"); break;
      case "about":
        print(site.name);
        print(site.title);
        print(site.location);
        print(site.tagline);
        print(`Contact: ${site.email}`);
        break;
      case "date": print(`Local time: ${ist}`); break;
      case "ls":
        featuredProjects.forEach((p) => print(`${p.slug}/  — ${p.name}`));
        break;
      case "skills":
        print(skillCategories.map((c) => c.items.map((i) => i.name).join(", ")).join(" · ").slice(0, 400));
        break;
      case "experience":
        experience.forEach((e) => print(`${e.role} @ ${e.company}`));
        break;
      case "contact": print(`${site.email} · ${site.github} · ${site.linkedin}`); break;
      case "neofetch":
        print("VARDHAN");
        print("----------------");
        print("OS: VardhanOS");
        print(`Role: ${site.title}`);
        print(`Frontend: React / TypeScript`);
        print(`Backend: Node.js / Express`);
        print(`AI: Muse Spark / DeepSeek / MCP`);
        print(`Projects: ${featuredProjects.length} featured`);
        print("Status: Building…");
        break;
      case "echo": print(arg); break;
      case "github": window.open(site.github, "_blank"); print("Opening GitHub…"); break;
      case "linkedin": window.open(site.linkedin, "_blank"); print("Opening LinkedIn…"); break;
      case "resume": window.open(site.resume, "_blank"); print("Opening resume…"); break;
      case "repo": {
        const q = arg.toLowerCase();
        const bySlug = featuredProjects.find((p) => p.slug === q);
        const byName = featuredProjects.find((p) => p.name.toLowerCase() === q);
        const proj = bySlug ?? byName;
        if (!q || !proj) {
          if (q) print(`repo: no project '${q}'`);
          featuredProjects.forEach((p) => print(`${p.slug}  → ${p.github}`));
          break;
        }
        window.open(proj.github, "_blank");
        print(`Opening ${proj.name} repo…`);
        break;
      }
      case "open": {
        const t = arg.toLowerCase();
        if (!t) { print("usage: open <app>  (try: open projects)"); break; }
        const target = OPEN_TARGETS[t];
        if (target === "github") { window.open(site.github, "_blank"); print("Opening GitHub…"); }
        else if (target === "linkedin") { window.open(site.linkedin, "_blank"); print("Opening LinkedIn…"); }
        else if (target === "resume") { window.open(site.resume, "_blank"); print("Opening resume…"); }
        else if (target) { openWindow(target); print(`Opening ${t}…`); }
        else print(`open: no such app: ${t}`);
        break;
      }
      case "sudo":
        if (/hire\s+vardhan/.test(cmd.toLowerCase())) {
          print("✔ Reference check passed. Offer letter compiling…", "out");
          print(`Contact: ${site.email}`, "out");
        } else print(`sudo: ${arg || "nothing to do"}`);
        break;
      default: print(`command not found: ${name}  (try: help)`, "dim");
    }
  }, [openWindow, ist]);

  return (
    <div className="termapp" onClick={() => inputRef.current?.focus()}>
      <div className="termapp__body" ref={bodyRef} aria-live="polite">
        {lines.map((l, i) => (
          <div key={i} className={`termapp__line termapp__line--${l.kind}`}>{l.text}</div>
        ))}
        <form
          className="termapp__row"
          onSubmit={(e) => {
            e.preventDefault();
            setHist((h) => [value, ...h].slice(0, 50));
            setHistIdx(-1);
            run(value);
            setValue("");
          }}
        >
          <span className="termapp__prompt" aria-hidden="true">vardhan@glass ~</span>
          <input
            ref={inputRef}
            className="termapp__input"
            value={value}
            autoFocus
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp") { e.preventDefault(); if (hist[histIdx + 1]) { setHistIdx(histIdx + 1); setValue(hist[histIdx + 1]); } }
              else if (e.key === "ArrowDown") { e.preventDefault(); if (histIdx > 0) { setHistIdx(histIdx - 1); setValue(hist[histIdx - 1]); } else { setHistIdx(-1); setValue(""); } }
            }}
            aria-label="Terminal input"
            spellCheck={false}
            autoComplete="off"
          />
        </form>
      </div>
    </div>
  );
}

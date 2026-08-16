import { useEffect, useRef, useState } from "react";
import { site } from "../data/site";
import { techGroups } from "../data/tech";
import { experience, education, certifications, process } from "../data/experience";

type Line = { key: number; text: string; cls: string };

let keySeq = 0;
const K = () => ++keySeq;
const L = (text: string, cls = "") => ({ key: K(), text, cls });

const FILES = ["about.txt", "experience.log", "skills.tree", "how_i_work.sh"];

const COMMANDS = [
  "help",
  "whoami",
  "me",
  "ls",
  "pwd",
  "work",
  "cd work",
  "projects",
  "experience",
  "cat about.txt",
  "cat experience.log",
  "cat skills.tree",
  "cat how_i_work.sh",
  "tech",
  "tree",
  "about",
  "open",
  "remote",
  "opensource",
  "contact",
  "mail",
  "email",
  "social",
  "links",
  "resume",
  "neofetch",
  "fetch",
  "matrix",
  "cowsay",
  "ping",
  "sh how_i_work.sh",
  "how_i_work.sh",
  "uptime",
  "date",
  "time",
  "clear",
  "sudo",
  "who",
  "exit",
  "vim",
  "nano",
];

function scrollToSection(id: string) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById(id)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
}

function uptime() {
  const mins = Math.floor(performance.now() / 60000);
  const days = Math.floor(mins / 1440);
  const hours = Math.floor((mins % 1440) / 60);
  const m = mins % 60;
  return days > 0 ? `${days}d ${hours}h ${m}m` : `${hours}h ${m}m`;
}

function runCmd(raw: string): Line[] {
  const parts = raw.trim().split(/\s+/);
  const cmd = parts[0] ?? "";
  const arg = raw.trim().slice(cmd.length).trim();
  const out: Line[] = [];
  const push = (t: string, c = "") => out.push(L(t, c));

  const catFile = (file: string) => {
    switch (file) {
      case "about.txt":
        push("┌─ about.txt", "cyan");
        push(site.headline);
        push(`${site.subheadline}`);
        push("");
        push(`${education.degree.toLowerCase()} @ ${education.school}`, "dim");
        push(`${education.period} · ${site.location}`, "dim");
        push("");
        push(`certifications: ${certifications.map((c) => c.split(" — ")[0].toLowerCase()).join(", ")}`, "dim");
        push("└─ end of file", "cyan");
        break;
      case "experience.log":
        push("┌─ experience.log", "cyan");
        experience.forEach((e) => push(`[${e.period}] ${e.company} — ${e.role}`, "green"));
        push("└─ end of file", "cyan");
        break;
      case "skills.tree":
        push("┌─ skills.tree", "cyan");
        techGroups.forEach((g) => push(`${g.label.toLowerCase().padEnd(10)} → ${g.items.join(", ")}`, "green"));
        push("└─ end of file", "cyan");
        break;
      case "how_i_work.sh":
        push("┌─ how_i_work.sh", "cyan");
        push("#!/usr/bin/env bash", "green");
        process.forEach((s) => push(`# ${s.step} ${s.label.toLowerCase().padEnd(9)} — ${s.text}`));
        push('echo "pipeline: healthy"', "green");
        push("└─ end of file", "cyan");
        break;
      default:
        push(`cat: ${file || "(no file)"}: no such file`, "red");
        push(`try: ${FILES.join(", ")}`, "dim");
    }
  };

  switch (cmd) {
    case "":
      return [];
    case "help":
      push("available commands:", "cyan");
      push("  help                     show this list");
      push("  whoami / me              who is behind this terminal");
      push("  ls / pwd                 where you are");
      push("  work / cd work           selected projects");
      push("  experience               what I have been doing");
      push("  tech / tree              technology stack");
      push("  about                    the longer story");
      push("  open / remote            open-source repos");
      push("  contact / mail           how to reach me");
      push("  social / links           my links");
      push("  resume                   download résumé");
      push("  neofetch / fetch         system info");
      push("  cat <file>               read a file: about.txt, experience.log, skills.tree, how_i_work.sh");
      push("  cowsay [msg]             cow says hello");
      push("  matrix                   follow the white rabbit");
      push("  ping [host]              trace a packet");
      push("  uptime / date            terminal facts");
      push("  clear                    wipe the session", "dim");
      push("  `                        focus this terminal from anywhere", "dim");
      push("  tab / ↑↓                 completion / command history", "dim");
      break;
    case "whoami":
    case "me":
      push("sre_vardhan_v", "green b");
      push(`${site.role}`, "amber");
      push(`${site.fullName} · b.tech CSE @ nmam institute · ${site.location}`, "dim");
      push(site.intro);
      break;
    case "ls":
    case "pwd":
      push(`/home/vardhan/portfolio`, "green");
      push("about.txt  experience.log  skills.tree  how_i_work.sh  work/  repos/", "dim");
      break;
    case "work":
    case "projects":
      push("opening  ~/work", "cyan");
      scrollToSection("work");
      break;
    case "cd":
      if (arg === "work" || arg === "work/") {
        push("opening  ~/work", "cyan");
        scrollToSection("work");
      } else {
        push(`cd: ${arg || "(no dir)"}: no such directory`, "red");
        push("try: cd work", "dim");
      }
      break;
    case "experience":
      push("tailing  ~/experience.log", "cyan");
      scrollToSection("experience");
      break;
    case "tech":
    case "tree":
      push("rendering  ~/skills.tree", "cyan");
      scrollToSection("tech");
      break;
    case "about":
      push("rendering  ~/about.txt", "cyan");
      scrollToSection("about");
      break;
    case "open":
    case "remote":
    case "opensource":
      push("git remote -v               # repos", "cyan");
      scrollToSection("opensource");
      break;
    case "contact":
    case "mail":
    case "email":
      push(`opening mail session → ${site.email}`, "cyan");
      scrollToSection("contact");
      break;
    case "social":
    case "links":
      push("github   " + site.github, "green");
      push("linkedin " + site.linkedin, "green");
      push(`email    ${site.email}`, "green");
      push("opening github + linkedin in new tabs…", "dim");
      window.open(site.github, "_blank", "noopener,noreferrer");
      window.open(site.linkedin, "_blank", "noopener,noreferrer");
      break;
    case "resume":
      push("fetching  ~/resume.pdf", "cyan");
      push(site.resume, "green");
      push("  downloading sree-vardhan-v-resume.pdf", "dim");
      const a = document.createElement("a");
      a.href = site.resume;
      a.download = "sree-vardhan-v-resume.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      break;
    case "neofetch":
    case "fetch":
      push(
        `        ██╗   ██╗
        ██║   ██║    vardhan@folio
        ██║   ██║    ───────────────────────────
        ╚██████╔╝    OS:       portfolio_os x64
         ╚═════╝     Kernel:   react-19
                     Shell:    bash 5.2
                     Uptime:   ${uptime()}
                     DE:       CRT 60Hz amber/green
                     Theme:    terminal-v3.0.0
                     Location: ${site.location}
                     Role:     ${site.role.toLowerCase()}`,
        "green"
      );
      push("type 'help' to explore the rest.", "dim");
      break;
    case "cat":
      catFile(arg);
      break;
    case "sh":
    case "how_i_work.sh":
      push("executing  ./how_i_work.sh --pipeline", "cyan");
      scrollToSection("process");
      break;
    case "matrix":
      push("wake up, neo…", "dim");
      const KATA = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜ012";
      for (let i = 0; i < 9; i++) {
        let s = "";
        const n = 38 + Math.floor(Math.random() * 28);
        for (let j = 0; j < n; j++) {
          s += Math.random() < 0.62 ? KATA[Math.floor(Math.random() * KATA.length)] : " ";
        }
        push(s, "green");
      }
      push("status: following the white rabbit", "dim");
      break;
    case "cowsay":
      const msg = arg || "hello, i am a portfolio cow.";
      push(" " + "_".repeat(msg.length + 2), "cyan");
      push(`< ${msg} >`, "cyan");
      push(" " + "-".repeat(msg.length + 2), "cyan");
      push("        \\   ^__^", "green");
      push("         \\  (oo)\\_______", "green");
      push("            (__)\\       )\\/\\", "green");
      push("                ||----w |", "green");
      push("                ||     ||", "green");
      break;
    case "ping":
      const host = arg || "google.com";
      push(`PING ${host} (142.250.191.78): 56 data bytes`, "dim");
      let t = 12.4;
      for (let i = 0; i < 3; i++) {
        t += Math.random() * 2.4 - 1.2;
        push(`64 bytes from 142.250.191.78: icmp_seq=${i} ttl=115 time=${t.toFixed(1)} ms`, "dim");
      }
      push(`--- ${host} ping statistics ---`, "dim");
      push("3 packets transmitted, 3 received, 0% packet loss", "dim");
      break;
    case "uptime":
      push(`up ${uptime()}, load: building_products`, "green");
      break;
    case "date":
    case "time":
      push(new Date().toString().slice(0, 24), "amber");
      break;
    case "hello":
    case "hi":
    case "hey":
      push("hello, visitor. type 'help' to see what I can do.", "green");
      break;
    case "rm":
    case "rm -rf":
    case "rm -rf /":
      push("nice try. nothing was deleted (exit status: 0).", "amber");
      push("this terminal is sandboxed; so is your ego.", "dim");
      break;
    case "sudo":
      push("user 99 is NOT in the sudoers file. this incident will be reported.", "red");
      break;
    case "who":
      push("you are the visitor. i am the portfolio.", "green");
      break;
    case "vim":
    case "nano":
      push("this is a portfolio, not a text editor. (0 saved changes)", "red");
      break;
    case "42":
      push("the answer to life, the universe, and everything.", "amber");
      break;
    case "exit":
      push("this is not a chat-ssh. press f5 to reboot.", "dim");
      break;
    default:
      push(`bash: ${cmd}: command not found`, "red");
      push("type 'help' for the manual.", "dim");
  }
  return out;
}

const quickCmds = ["help", "whoami", "ls", "work", "neofetch", "contact"];

export function Hero() {
  const [lines, setLines] = useState<Line[]>([
    L("PORTFOLIO_OS session established.", "dim"),
    L("type 'help' to explore, or use the buttons below.", "dim"),
  ]);
  const [input, setInput] = useState("");
  const histIdxRef = useRef<number | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const historyRef = useRef<string[]>([]);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: "smooth" });
  }, [lines]);

  useEffect(() => {
    const onGlobal = (e: KeyboardEvent) => {
      if (e.key !== "`") return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      e.preventDefault();
      heroRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onGlobal);
    return () => window.removeEventListener("keydown", onGlobal);
  }, []);

  const submit = (raw: string) => {
    const cmds = raw.trim().toLowerCase().split(/[;&]+/).map((c) => c.trim()).filter(Boolean);
    if (cmds.length > 0) {
      historyRef.current = [...historyRef.current, raw.trim()].slice(-100);
      histIdxRef.current = null;
    }
    const next: Line[] = [];
    for (const c of cmds) {
      next.push(L(`$ ${raw.trim()}`, "cmd"));
      next.push(...runCmd(c));
      if (c === "clear" && cmds.length === 1) {
        setLines([]);
        setInput("");
        return;
      }
    }
    if (next.length === 0) return;
    setLines((prev) => [...prev, ...next]);
    setInput("");
  };

  const complete = () => {
    const parts = input.trim().split(/\s+/);
    const last = parts[parts.length - 1] ?? "";
    const isCat = parts.length > 1 && parts[0] === "cat";
    const matches = isCat
      ? FILES.filter((f) => f.startsWith(last))
      : COMMANDS.filter((c) => c.startsWith(last));
    if (matches.length === 1) {
      const done = matches[0];
      setInput(parts.length > 1 ? `${parts.slice(0, -1).join(" ")} ${done} ` : `${done} `);
    } else if (matches.length > 1) {
      setLines((prev) => [...prev, L(matches.join("   "), "dim")]);
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      submit(input);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const h = historyRef.current;
      if (h.length === 0) return;
      const idx = histIdxRef.current === null ? h.length - 1 : Math.max(0, histIdxRef.current - 1);
      histIdxRef.current = idx;
      setInput(h[idx]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdxRef.current === null) return;
      const idx = histIdxRef.current + 1;
      if (idx >= historyRef.current.length) {
        histIdxRef.current = null;
        setInput("");
      } else {
        histIdxRef.current = idx;
        setInput(historyRef.current[idx]);
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      complete();
    }
  };

  return (
    <section className="hero" aria-label="Introduction" ref={heroRef}>
      <div className="container hero-grid">
        <div>
          <pre className="hero-banner" aria-hidden="true">
            {`VARDHAN
.V`}
          </pre>
          <div className="hero-tag">generative-ai developer :: full-stack developer</div>
          <p className="hero-intro">
            {site.fullName} — b.tech computer science @ nmam. I turn interfaces, APIs,
            databases and LLM backends into working products, and I ship them.
          </p>

          <div className="hero-chips" role="group" aria-label="Quick commands">
            {quickCmds.map((c) => (
              <button
                key={c}
                type="button"
                className="hero-quick"
                onClick={() => submit(`${c} ; `)}
              >
                <b>$</b> {c}
              </button>
            ))}
          </div>

          <div className="hero-cta">
            <a className="btn btn-solid" href={site.resume} download>
              resume.pdf
            </a>
            <a className="btn" href="#work">
              see work
            </a>
            <a className="btn" href={`mailto:${site.email}`}>
              mail
            </a>
          </div>

          <p className="hero-status">
            <span className="ok">● <span className="visually-hidden">online</span></span> status: currently building
            with AI + full-stack tech <span className="bracket">·</span> location: {site.location}{" "}
            <span className="bracket">·</span> tty: 1
          </p>
        </div>

        <div className="shell-win">
          <div className="term">
            <div className="term-bar" aria-hidden="true">
              <span className="term-dot r" />
              <span className="term-dot a" />
              <span className="term-dot g" />
              <span className="term-title">
                <b>vardhan@folio</b>:~$ interactive
              </span>
            </div>
            <div className="term-body">
              <div className="shell-lines" ref={boxRef} aria-live="polite">
                {lines.map((l) => (
                  <span key={l.key} className={`shell-ln ${l.cls}`}>
                    {l.cls === "cmd" ? (
                      <>
                        <span className="prompt">
                          vardhan@folio<span className="path">:~</span>
                          <span className="dollar">$</span>
                        </span>
                        {l.text.slice(2)}
                      </>
                    ) : (
                      l.text
                    )}
                  </span>
                ))}
              </div>
              <div className="shell-entry">
                <span className="prompt" aria-hidden="true">
                  vardhan@folio<span className="path">:~</span>
                  <span className="dollar">$</span>
                </span>
                <input
                  ref={inputRef}
                  className="shell-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKey}
                  placeholder="type a command…"
                  aria-label="Terminal — type a command and press Enter"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
              <div className="shell-foot">
                <span>
                  [ <span className="shell-cmd">?=help · `=focus</span> ] 5 procs alive
                </span>
                <span className="bracket">terminal v3.0.0 · port 443</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
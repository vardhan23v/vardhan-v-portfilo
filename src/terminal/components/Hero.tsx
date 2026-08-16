import { useEffect, useRef, useState } from "react";
import { site } from "../data/site";

type Line = { key: number; text: string; cls: string };

let keySeq = 0;
const K = () => ++keySeq;
const L = (text: string, cls = "") => ({ key: K(), text, cls });

function scrollToSection(id: string) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById(id)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
}

function runCmd(raw: string): Line[] {
  const cmd = raw.trim().toLowerCase();
  const out: Line[] = [];
  const push = (t: string, c = "") => out.push(L(t, c));

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
      push("  about / cat about.txt    the longer story");
      push("  open / remote            open-source repos");
      push("  contact / mail           how to reach me");
      push("  resume                   download résumé");
      push("  uptime / date            terminal facts");
      push("  clear                    wipe the session", "dim");
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
      push("about.txt   experience.log   skills.tree   work/   how_i_work.sh   repos/", "dim");
      break;
    case "work":
    case "cd work":
    case "cd work/":
    case "projects":
      push("opening  ~/work", "cyan");
      scrollToSection("work");
      break;
    case "experience":
    case "cat experience.log":
      push("tailing  ~/experience.log", "cyan");
      scrollToSection("experience");
      break;
    case "tech":
    case "tree":
      push("rendering  ~/skills.tree", "cyan");
      scrollToSection("tech");
      break;
    case "about":
    case "cat about.txt":
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
    case "resume":
      push(site.resume, "green");
      push("  hint: it is still a placeholder — ask me for the real file.", "dim");
      break;
    case "uptime":
      push(`up ${Math.floor(performance.now() / 60000)} min, load: building_products`, "green");
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
    case "exit":
      push("this is not a chat-ssh. press f5 to reboot.", "dim");
      break;
    default:
      push(`bash: ${cmd}: command not found`, "red");
      push("type 'help' for the manual.", "dim");
  }
  return out;
}

const quickCmds = ["help", "whoami", "ls", "work", "experience", "contact"];

export function Hero() {
  const [lines, setLines] = useState<Line[]>([
    L("PORTFOLIO_OS session established.", "dim"),
    L("type 'help' to explore, or use the buttons below.", "dim"),
  ]);
  const [input, setInput] = useState("");
  const boxRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: "smooth" });
  }, [lines]);

  const submit = (raw: string) => {
    const cmds = raw.trim().toLowerCase().split(/[;&]+/).map((c) => c.trim()).filter(Boolean);
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

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") submit(input);
  };

  return (
    <section className="hero" aria-label="Introduction">
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
                  [ <span className="shell-cmd">?=help</span> ] 5 procs alive
                </span>
                <span className="bracket">terminal v2.5.1 · port 443</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
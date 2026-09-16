/**
 * The hero shell's command engine. Pure: `runLine()` turns a typed line into
 * output lines plus side-effects the component performs (scroll, navigate,
 * start a game…). Supports `;`/`&&` chains and `|` pipes into grep / head /
 * tail / wc / sort.
 */
import { site } from "../data/site";
import { techGroups, fallbackRepos } from "../data/tech";
import { caseStudies, otherWork } from "../data/work";
import { certifications, experience, education, process } from "../data/experience";
import { PHOSPHORS, getPhosphor, isPhosphor, setPhosphor, getCrt, setCrt } from "./phosphor";
import { bannerRows } from "./banner";

export const OS_VERSION = "3.0.0";
export const HOST = "folio";

export type Line = { key: number; text: string; cls: string };
let keySeq = 0;
export const nextKey = () => ++keySeq;
export const L = (text: string, cls = ""): Line => ({ key: nextKey(), text, cls });

export type ShellEffect =
  | { type: "scroll"; id: string }
  | { type: "navigate"; to: string }
  | { type: "open"; url: string }
  | { type: "download"; url: string; name: string }
  | { type: "clear" }
  | { type: "remote"; on: boolean }
  | { type: "top" }
  | { type: "sl" }
  | { type: "snake" }
  | { type: "history-clear" }
  | { type: "announce"; text: string };

export interface ShellCtx {
  history: string[];
  remote: boolean;
}

export interface ShellResult {
  lines: Line[];
  effects: ShellEffect[];
}

/* ------------------------------------------------------------------ */
/* session + history persistence                                        */

const SESSION_KEY = "folio.session-start";
const HISTORY_KEY = "folio.history";

export function sessionStart(): number {
  try {
    const v = sessionStorage.getItem(SESSION_KEY);
    if (v) return Number(v);
    const now = Date.now();
    sessionStorage.setItem(SESSION_KEY, String(now));
    return now;
  } catch {
    return Date.now() - performance.now();
  }
}

export function uptime(): string {
  const mins = Math.floor((Date.now() - sessionStart()) / 60000);
  const days = Math.floor(mins / 1440);
  const hours = Math.floor((mins % 1440) / 60);
  const m = mins % 60;
  return days > 0 ? `${days}d ${hours}h ${m}m` : hours > 0 ? `${hours}h ${m}m` : `${m}m`;
}

export function loadHistory(): string[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string").slice(-50) : [];
  } catch {
    return [];
  }
}

export function saveHistory(h: string[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(-50)));
  } catch {
    /* private mode */
  }
}

/* ------------------------------------------------------------------ */
/* helpers                                                              */

/** Pad rows into aligned columns. */
export function cols(rows: string[][], gap = 2): string[] {
  const widths: number[] = [];
  rows.forEach((r) => r.forEach((c, i) => (widths[i] = Math.max(widths[i] ?? 0, c.length))));
  return rows.map((r) => r.map((c, i) => (i === r.length - 1 ? c : c.padEnd(widths[i]))).join(" ".repeat(gap)).replace(/\s+$/, ""));
}

const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};

const pseudoIp = (host: string) => {
  const h = hash(host);
  return `${(h >> 24) & 255 || 10}.${(h >> 16) & 255}.${(h >> 8) & 255}.${h & 255 || 1}`;
};

const bar = (n: number, max: number, w = 18) => "▇".repeat(Math.max(1, Math.round((n / max) * w))).padEnd(w, "·");

const today = () => new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short" });

const slugOf = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const FILES = ["about.txt", "experience.log", "skills.tree", "how_i_work.sh", "resume.pdf", "work/", "repos/"];

const closest = (needle: string, hay: string[]) => {
  const n = needle.toLowerCase();
  return hay.find((h) => h.toLowerCase().startsWith(n)) ?? hay.find((h) => h.toLowerCase().includes(n));
};

/* ------------------------------------------------------------------ */
/* manual                                                               */

export const MAN_PAGES: Record<string, { syn: string; desc: string }> = {
  help: { syn: "help", desc: "list every command with a one-line summary." },
  whoami: { syn: "whoami", desc: "who is behind this terminal. alias: me." },
  ls: { syn: "ls [-la] [work|repos]", desc: "list the portfolio directory; `ls work` lists case studies, `ls repos` public repos." },
  pwd: { syn: "pwd", desc: "print the working directory." },
  cd: { syn: "cd <dir>", desc: "jump to a section: work, experience, tech, about, repos, contact." },
  cat: { syn: "cat <file>", desc: `read a file: ${FILES.filter((f) => !f.endsWith("/")).join(", ")}, or work/<slug>.md.` },
  open: { syn: "open <slug> | open <slug> live | open <slug> src", desc: "open a case study page, its live demo, or its repo." },
  work: { syn: "work", desc: "scroll to the selected projects. alias: projects." },
  experience: { syn: "experience", desc: "scroll to the experience log." },
  tech: { syn: "tech", desc: "scroll to the skills tree. alias: tree." },
  about: { syn: "about", desc: "scroll to the longer story." },
  remote: { syn: "remote", desc: "scroll to the open-source repos. alias: opensource." },
  contact: { syn: "contact", desc: "scroll to the mail form. aliases: mail, email." },
  social: { syn: "social", desc: "print my links. alias: links." },
  resume: { syn: "resume", desc: "download the résumé pdf." },
  neofetch: { syn: "neofetch", desc: "system information card. alias: fetch." },
  stats: { syn: "stats", desc: "portfolio metrics as bars." },
  grep: { syn: "<cmd> | grep [-v] <pattern>", desc: "filter the output of another command (case-insensitive)." },
  head: { syn: "<cmd> | head [n]", desc: "first n lines (default 5)." },
  tail: { syn: "<cmd> | tail [n]", desc: "last n lines (default 5)." },
  wc: { syn: "<cmd> | wc -l", desc: "count lines." },
  sort: { syn: "<cmd> | sort", desc: "sort lines alphabetically." },
  echo: { syn: "echo <text>", desc: "print text back (case preserved)." },
  env: { syn: "env", desc: "print the environment. alias: export." },
  alias: { syn: "alias", desc: "print the alias table." },
  whatis: { syn: "whatis <cmd>", desc: "one-line description of a command." },
  man: { syn: "man <cmd>", desc: "manual page for a command." },
  history: { syn: "history [-c] · !n", desc: "session history (persisted); -c clears; !n re-runs entry n." },
  ping: { syn: "ping <host>", desc: "trace a packet to a host (simulated)." },
  curl: { syn: "curl [-I] [/api/projects]", desc: "fetch the portfolio; -I for headers, /api/projects for JSON." },
  ssh: { syn: "ssh [user@host]", desc: "open a remote session (prompt changes until `exit`)." },
  exit: { syn: "exit", desc: "leave the remote session." },
  banner: { syn: "banner <text>", desc: "print text as block letters (max 12 chars)." },
  cowsay: { syn: "cowsay [message]", desc: "a cow says it." },
  fortune: { syn: "fortune", desc: "random wisdom." },
  matrix: { syn: "matrix", desc: "follow the white rabbit." },
  top: { syn: "top", desc: "live process table for a few seconds. alias: htop." },
  sl: { syn: "sl", desc: "you meant ls. enjoy the train." },
  snake: { syn: "snake", desc: "play snake in the shell: arrows / wasd, q to quit." },
  theme: { syn: `theme <${PHOSPHORS.join("|")}>`, desc: "set the CRT phosphor colour. alias: phosphor." },
  crt: { syn: "crt on|off", desc: "toggle scanlines, vignette and flicker." },
  uptime: { syn: "uptime", desc: "how long this session has been open." },
  date: { syn: "date [-u]", desc: "print the date; -u for UTC. alias: time." },
  weather: { syn: "weather", desc: "conditions at base." },
  clear: { syn: "clear", desc: "wipe the session (also ctrl+l)." },
  sudo: { syn: "sudo <cmd>", desc: "nope." },
  rm: { syn: "rm -rf /", desc: "also nope." },
  who: { syn: "who", desc: "who is logged in." },
  vim: { syn: "vim", desc: "this is not an editor. alias: nano." },
  "42": { syn: "42", desc: "the answer." },
};

export const ALIASES: Record<string, string> = {
  me: "whoami",
  projects: "work",
  tree: "tech",
  opensource: "remote",
  mail: "contact",
  email: "contact",
  links: "social",
  fetch: "neofetch",
  htop: "top",
  phosphor: "theme",
  time: "date",
  nano: "vim",
  export: "env",
  "?": "help",
  hi: "hello",
  hey: "hello",
};

const CASE_SLUGS = caseStudies.map((p) => p.slug);

/** Everything tab completion knows about, including multi-word forms. */
export const COMMANDS: string[] = [
  ...Object.keys(MAN_PAGES),
  ...Object.keys(ALIASES).filter((a) => a !== "?"),
  "hello",
  "ls -la",
  "ls work",
  "ls repos",
  "cd work",
  "cd experience",
  "cd tech",
  "cd about",
  "cd repos",
  "cd contact",
  ...FILES.filter((f) => !f.endsWith("/")).map((f) => `cat ${f}`),
  ...CASE_SLUGS.map((s) => `cat work/${s}.md`),
  ...CASE_SLUGS.map((s) => `open ${s}`),
  ...PHOSPHORS.map((p) => `theme ${p}`),
  "crt on",
  "crt off",
  "history -c",
  "curl -I",
  "curl /api/projects",
  "date -u",
  "sh how_i_work.sh",
];

const FORTUNES = [
  "measure twice, ship once.",
  "the best debugger is a clean room and a long walk.",
  "if it works, it ships; if it ships, it scales; if it scales, you made it.",
  "code is read more often than it is written.",
  "automate the boring, delegate the impossible.",
  "a fallback chain is a love letter to your users.",
  "first make it work, then make it fast, then make it pretty.",
  "prototype in a day, polish in a week, ship it forever.",
];

/* ------------------------------------------------------------------ */
/* the process table used by `top` (re-rendered by the component)        */

export function topTable(tick: number): string[] {
  const procs = [
    ["1", "vardhan", "react-19"],
    ["7", "vardhan", "vite/8"],
    ["42", "root", "phosphor-driver"],
    ["88", "vardhan", "matrix-rain"],
    ["101", "vardhan", "statusline.vim"],
    ["404", "nobody", "self-doubt.d"],
    ["1337", "vardhan", "ship-it"],
  ];
  const rows = procs.map(([pid, user, name], i) => {
    const cpu = (Math.abs(Math.sin(tick * 0.9 + i * 1.7)) * (i === 6 ? 60 : 24) + (i === 6 ? 30 : 1)).toFixed(1);
    const mem = ((hash(name) % 400) / 10 + 2).toFixed(1);
    return [pid, user, cpu.padStart(5), mem.padStart(5), name];
  });
  return [
    `top - ${new Date().toTimeString().slice(0, 8)} up ${uptime()}, 1 user, load average: 0.42, 0.37, 0.31`,
    `Tasks: ${procs.length} total, 1 running, ${procs.length - 1} sleeping · phosphor: ${getPhosphor()}`,
    "",
    ...cols([["PID", "USER", "%CPU", "%MEM", "COMMAND"], ...rows]),
  ];
}

/* ------------------------------------------------------------------ */
/* the engine                                                           */

function runCmd(cmdRaw: string, arg: string, ctx: ShellCtx): ShellResult {
  const lines: Line[] = [];
  const effects: ShellEffect[] = [];
  const push = (t: string, c = "") => lines.push(L(t, c));
  const rows = (r: string[][], c = "green") => cols(r).forEach((t) => push(t, `row ${c}`));
  const argv = arg ? arg.split(/\s+/) : [];
  const cmd = ALIASES[cmdRaw] ?? cmdRaw;

  const catFile = (file: string) => {
    const f = file.replace(/^\.\//, "").replace(/^~\//, "");
    const m = /^work\/([a-z0-9-]+)(?:\.md)?$/.exec(f);
    if (m) {
      const p = caseStudies.find((x) => x.slug === m[1]);
      if (!p) {
        push(`cat: work/${m[1]}: no such case study`, "red");
        push(`try: ${CASE_SLUGS.map((s) => `work/${s}.md`).join("  ")}`, "dim");
        return;
      }
      push(`# ${p.name} — ${p.tagline}`, "cyan b");
      push(`${p.description}`);
      push("");
      push("## problem", "amber");
      push(p.problem, "dim");
      push("## approach", "amber");
      push(p.approach, "dim");
      push("## decisions", "amber");
      p.decisions.forEach((d) => push(`+ ${d.title}`, "green"));
      push("## outcome", "amber");
      push(p.outcome, "dim");
      push("");
      push(`open ${p.slug}  # full case study · open ${p.slug} src  # repo${p.live ? ` · open ${p.slug} live` : ""}`, "dim");
      return;
    }
    switch (f) {
      case "about.txt":
        push("┌─ about.txt", "cyan");
        push(site.headline);
        push(site.subheadline);
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
        rows(techGroups.map((g) => [g.label.toLowerCase() + "/", g.items.join(", ")]));
        push("└─ end of file", "cyan");
        break;
      case "how_i_work.sh":
        push("┌─ how_i_work.sh", "cyan");
        push("#!/usr/bin/env bash", "green");
        process.forEach((s) => push(`# ${s.step} ${s.label.toLowerCase().padEnd(10)} — ${s.text}`));
        push('echo "pipeline: healthy"', "green");
        push("└─ end of file", "cyan");
        break;
      case "resume.pdf":
        push("resume.pdf is binary — opening it in a new tab.", "amber");
        effects.push({ type: "open", url: site.resume });
        break;
      default: {
        push(`cat: ${file || "(no file)"}: no such file`, "red");
        const guess = closest(file, FILES);
        push(guess ? `did you mean: cat ${guess}` : `try: ${FILES.join(", ")}`, "dim");
      }
    }
  };

  switch (cmd) {
    case "":
      break;
    case "help": {
      push("available commands — `man <cmd>` for details, tab completes, | pipes into grep/head/tail/wc/sort", "cyan");
      const groups: [string, string[]][] = [
        ["navigate", ["work", "experience", "tech", "about", "remote", "contact", "cd", "open"]],
        ["read", ["ls", "cat", "whoami", "stats", "social", "resume", "neofetch", "history", "man"]],
        ["network", ["ping", "curl", "ssh", "exit"]],
        ["play", ["snake", "top", "sl", "matrix", "cowsay", "banner", "fortune", "42"]],
        ["display", ["theme", "crt", "clear", "uptime", "date", "weather"]],
      ];
      groups.forEach(([g, cmds]) => {
        push(`  ${g}`, "amber");
        rows(cmds.map((c) => ["    " + c, MAN_PAGES[c]?.desc ?? ""]), "");
      });
      push("  keys", "amber");
      rows([
        ["    ` or ?", "focus this terminal from anywhere"],
        ["    :", "vim command line — :work, :e mac, :theme amber, :q"],
        ["    j / k · gg · G", "vim-style scrolling"],
        ["    tab / ↑↓ / ctrl+l", "completion / history / clear"],
      ], "dim");
      break;
    }
    case "whoami":
      push("sree_vardhan_v", "green b");
      push(site.role, "amber");
      push(`${site.fullName} · b.tech CSE @ nmam institute · ${site.location}`, "dim");
      push(site.intro);
      break;
    case "pwd":
      push(ctx.remote ? "/home/vardhan" : "/home/vardhan/portfolio", "green");
      break;
    case "ls": {
      const long = argv.some((a) => /^-\w*l/.test(a));
      const dir = argv.find((a) => !a.startsWith("-"))?.replace(/\/$/, "") ?? ".";
      if (dir === "work" || dir === "./work") {
        push(`~/work — ${caseStudies.length} case studies`, "cyan");
        rows(caseStudies.map((p) => [p.number, `${p.slug}/`, p.live ? "live" : "src", p.tagline]));
        push("open <slug> to read one · cat work/<slug>.md for a summary", "dim");
        break;
      }
      if (dir === "repos" || dir === "./repos") {
        push(`~/repos — ${fallbackRepos.length} public`, "cyan");
        rows(fallbackRepos.map((r) => [r.name, r.language ?? "—", r.description.slice(0, 60)]));
        break;
      }
      if (dir !== "." && dir !== "~") {
        push(`ls: cannot access '${dir}': no such directory`, "red");
        push("try: ls work · ls repos", "dim");
        break;
      }
      if (!long) {
        push(FILES.join("  "), "green");
        break;
      }
      const d = today();
      rows([
        ["drwxr-xr-x", "vardhan", "4.0K", d, "work/"],
        ["drwxr-xr-x", "vardhan", "4.0K", d, "repos/"],
        ["-rw-r--r--", "vardhan", "1.2K", d, "about.txt"],
        ["-rw-r--r--", "vardhan", `${experience.length * 212}B`, d, "experience.log"],
        ["-rw-r--r--", "vardhan", `${techGroups.reduce((n, g) => n + g.items.length, 0) * 14}B`, d, "skills.tree"],
        ["-rwxr-xr-x", "vardhan", "512B", d, "how_i_work.sh"],
        ["-rw-r--r--", "vardhan", "148K", d, "resume.pdf"],
      ]);
      break;
    }
    case "cd": {
      const target = argv[0]?.replace(/\/$/, "") ?? "";
      const map: Record<string, string> = { work: "work", experience: "experience", tech: "tech", skills: "tech", about: "about", repos: "opensource", contact: "contact", process: "process" };
      if (target === "" || target === "~" || target === "..") {
        push("~", "green");
        effects.push({ type: "scroll", id: "hero" });
      } else if (map[target]) {
        push(`~/${target}`, "cyan");
        effects.push({ type: "scroll", id: map[target] });
      } else {
        push(`cd: ${target}: no such directory`, "red");
        push(`try: cd ${Object.keys(map).join(" · cd ")}`, "dim");
      }
      break;
    }
    case "work":
      push("opening  ~/work", "cyan");
      effects.push({ type: "scroll", id: "work" });
      break;
    case "experience":
      push("tailing  ~/experience.log", "cyan");
      effects.push({ type: "scroll", id: "experience" });
      break;
    case "tech":
      push("rendering  ~/skills.tree", "cyan");
      effects.push({ type: "scroll", id: "tech" });
      break;
    case "about":
      push("rendering  ~/about.txt", "cyan");
      effects.push({ type: "scroll", id: "about" });
      break;
    case "remote":
      push("git remote -v               # repos", "cyan");
      effects.push({ type: "scroll", id: "opensource" });
      break;
    case "contact":
      push(`opening mail session → ${site.email}`, "cyan");
      effects.push({ type: "scroll", id: "contact" });
      break;
    case "sh":
    case "how_i_work.sh":
      push("executing  ./how_i_work.sh --pipeline", "cyan");
      effects.push({ type: "scroll", id: "process" });
      break;
    case "open": {
      const slug = argv[0]?.replace(/^work\//, "").replace(/\.md$/, "").replace(/\/$/, "");
      const what = argv[1] ?? "";
      if (!slug) {
        push("usage: open <slug> [live|src]", "amber");
        push(`slugs: ${CASE_SLUGS.join(", ")}`, "dim");
        break;
      }
      const p = caseStudies.find((x) => x.slug === slug || slugOf(x.name) === slug) ?? caseStudies.find((x) => x.slug.startsWith(slug));
      if (!p) {
        push(`open: ${slug}: not a case study`, "red");
        push(`try: ${CASE_SLUGS.join(", ")}`, "dim");
        break;
      }
      if (what === "live") {
        if (!p.live) { push(`${p.name} has no live deployment — opening the repo instead`, "amber"); effects.push({ type: "open", url: p.github }); }
        else { push(`opening ${p.live}`, "green"); effects.push({ type: "open", url: p.live }); }
      } else if (what === "src" || what === "repo" || what === "github") {
        push(`opening ${p.github}`, "green");
        effects.push({ type: "open", url: p.github });
      } else {
        push(`opening ~/work/${p.slug}/README.md`, "cyan");
        effects.push({ type: "navigate", to: `/terminal/work/${p.slug}` });
      }
      break;
    }
    case "social":
      rows([["github", site.github], ["linkedin", site.linkedin], ["email", site.email]]);
      push("open with: open <name>? no — click the links in ~/contact, or `curl -I`.", "dim");
      break;
    case "resume":
      push("fetching  ~/resume.pdf", "cyan");
      push(site.resume, "green");
      effects.push({ type: "download", url: site.resume, name: "sree-vardhan-v-resume.pdf" });
      break;
    case "neofetch":
      push(
        `        ██╗   ██╗
        ██║   ██║    vardhan@${ctx.remote ? "remote" : HOST}
        ██║   ██║    ───────────────────────────
        ╚██████╔╝    OS:       portfolio_os ${OS_VERSION} x64
         ╚═════╝     Kernel:   react-19
                     Shell:    bash 5.2
                     Uptime:   ${uptime()}
                     DE:       CRT 60Hz ${getPhosphor()} phosphor${getCrt() ? "" : " (overlays off)"}
                     Location: ${site.location}
                     Role:     ${site.role.toLowerCase()}`,
        "green"
      );
      push("type 'help' to explore the rest.", "dim");
      break;
    case "cat":
      catFile(arg);
      break;
    case "echo":
      push(arg.replace(/^"(.*)"$/, "$1"));
      break;
    case "env":
      rows([
        ["USER", "vardhan"],
        ["HOST", ctx.remote ? "remote" : HOST],
        ["SHELL", "/bin/bash"],
        ["EDITOR", "vim"],
        ["PHOSPHOR", getPhosphor()],
        ["CRT", getCrt() ? "on" : "off"],
        ["OS_VERSION", OS_VERSION],
        ["LOCATION", site.location],
        ["STATUS", "building"],
      ].map(([k, v]) => [`${k}=`, v]), "green");
      break;
    case "alias":
      rows(Object.entries(ALIASES).map(([a, c]) => [`alias ${a}`, `='${c}'`]), "green");
      break;
    case "whatis":
    case "man": {
      const target = ALIASES[argv[0] ?? ""] ?? argv[0];
      if (!target) {
        push("usage: man <command>", "amber");
        push("try: man ls · man open · man snake", "dim");
        break;
      }
      const page = MAN_PAGES[target];
      if (!page) {
        push(`man: no manual entry for ${argv[0]}`, "red");
        break;
      }
      if (cmd === "whatis") {
        push(`${target} — ${page.desc}`, "green");
        break;
      }
      push(`${target.toUpperCase()}(1)`.padEnd(30) + "portfolio_os manual", "dim");
      push("NAME", "amber");
      push(`    ${target} — ${page.desc}`);
      push("SYNOPSIS", "amber");
      push(`    ${page.syn}`, "green");
      const aliases = Object.entries(ALIASES).filter(([, c]) => c === target).map(([a]) => a);
      if (aliases.length) {
        push("ALIASES", "amber");
        push(`    ${aliases.join(", ")}`);
      }
      break;
    }
    case "matrix": {
      push("wake up, neo…", "dim");
      const KATA = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜ012";
      for (let i = 0; i < 9; i++) {
        let s = "";
        const n = 38 + Math.floor(Math.random() * 28);
        for (let j = 0; j < n; j++) s += Math.random() < 0.62 ? KATA[Math.floor(Math.random() * KATA.length)] : " ";
        push(s, "green");
      }
      push("status: following the white rabbit", "dim");
      break;
    }
    case "cowsay": {
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
    }
    case "ping": {
      const host = argv[0] ?? "vardhan-v-portfilo.vercel.app";
      const ip = pseudoIp(host);
      push(`PING ${host} (${ip}): 56 data bytes`, "dim");
      const times: number[] = [];
      let t = 8 + (hash(host) % 30);
      for (let i = 0; i < 4; i++) {
        t += Math.random() * 3 - 1.5;
        times.push(t);
        push(`64 bytes from ${ip}: icmp_seq=${i} ttl=${57 + (i % 2)} time=${t.toFixed(1)} ms`, "dim");
      }
      const min = Math.min(...times), max = Math.max(...times), avg = times.reduce((a, b) => a + b, 0) / times.length;
      push(`--- ${host} ping statistics ---`, "dim");
      push("4 packets transmitted, 4 received, 0.0% packet loss", "green");
      push(`round-trip min/avg/max = ${min.toFixed(1)}/${avg.toFixed(1)}/${max.toFixed(1)} ms`, "green");
      break;
    }
    case "curl": {
      const headersOnly = argv.includes("-I") || argv.includes("-i");
      const path = argv.find((a) => a.startsWith("/")) ?? "/";
      push("HTTP/2 200", "green");
      push(`date: ${new Date().toUTCString()}`, "dim");
      push(`content-type: ${path.startsWith("/api") ? "application/json" : "text/plain"}; charset=utf-8`, "dim");
      push(`x-powered-by: portfolio_os/${OS_VERSION}`, "dim");
      if (headersOnly) break;
      push("");
      if (path === "/api/projects") {
        push("[", "cyan");
        caseStudies.forEach((p, i) => {
          push(`  { "id": ${Number(p.number)}, "slug": "${p.slug}", "name": "${p.name}", "live": ${p.live ? `"${p.live}"` : "null"}, "tech": [${p.tech.slice(0, 4).map((t) => `"${t}"`).join(", ")}] }${i < caseStudies.length - 1 ? "," : ""}`, "cyan");
        });
        push("]", "cyan");
      } else if (path.startsWith("/api")) {
        push(`{ "error": "no route ${path}", "routes": ["/api/projects"] }`, "red");
      } else {
        push(site.headline, "cyan");
        push(site.subheadline, "dim");
        push("status: accepting interesting problems", "amber");
      }
      break;
    }
    case "ssh": {
      if (ctx.remote) { push("already connected. type exit to close the session.", "dim"); break; }
      const target = argv[0] ?? "vardhan@remote";
      push(`ssh ${target}`, "dim");
      push("connecting… key accepted (ed25519)", "dim");
      push(`Welcome to portfolio_os ${OS_VERSION} (GNU/Linux 6.9 x86_64)`, "green");
      push(`  * last login: ${new Date(sessionStart()).toUTCString()} from ${pseudoIp(target)}`, "dim");
      push("  * motd: everything here is public; consistent state.", "dim");
      push("the prompt is remote now — `exit` to come back.", "amber");
      effects.push({ type: "remote", on: true });
      break;
    }
    case "exit":
      if (ctx.remote) {
        push("logout", "dim");
        push("Connection to remote closed.", "green");
        effects.push({ type: "remote", on: false });
      } else {
        push("this is not a chat-ssh. press f5 to reboot, or `:q` for the editions page.", "dim");
      }
      break;
    case "uptime":
      push(`up ${uptime()}, 1 user, load: building_products`, "green");
      break;
    case "fortune":
      push(`fortune: ${FORTUNES[Math.floor(Math.random() * FORTUNES.length)]}`, "amber");
      break;
    case "banner": {
      const t = (arg || "vardhan").slice(0, 12);
      bannerRows(t).forEach((r) => push(r, "row green"));
      break;
    }
    case "history": {
      if (argv[0] === "-c") {
        push("history cleared", "dim");
        effects.push({ type: "history-clear" });
        break;
      }
      const h = ctx.history;
      if (h.length === 0) { push("history: empty", "dim"); break; }
      rows(h.map((c, i) => [String(i + 1).padStart(3), c]), "green");
      push("!n re-runs an entry · history -c clears", "dim");
      break;
    }
    case "stats": {
      const skills = techGroups.reduce((s, g) => s + g.items.length, 0);
      const data: [string, number][] = [
        ["case studies", caseStudies.length],
        ["also built", otherWork.length],
        ["public repos", fallbackRepos.length],
        ["roles logged", experience.length],
        ["skills indexed", skills],
        ["certifications", certifications.length],
      ];
      const max = Math.max(...data.map(([, n]) => n));
      push("portfolio metrics", "cyan");
      rows(data.map(([k, n]) => [k, bar(n, max), String(n)]), "green");
      push("skills by directory", "cyan");
      const gmax = Math.max(...techGroups.map((g) => g.items.length));
      rows(techGroups.map((g) => [g.label.toLowerCase(), bar(g.items.length, gmax, 12), String(g.items.length)]), "dim");
      break;
    }
    case "date": {
      const d = new Date();
      push(argv.includes("-u") ? d.toUTCString() : d.toString().slice(0, 33), "amber");
      break;
    }
    case "weather":
      push(`${site.location.split(",")[0]} · 31°C · clear · humidity 42% · wind: shipping`, "amber");
      break;
    case "hello":
      push("hello, visitor. type 'help' to see what I can do.", "green");
      break;
    case "rm":
      push("nice try. nothing was deleted (exit status: 0).", "amber");
      push("this terminal is sandboxed; so is your ego.", "dim");
      break;
    case "sudo":
      push("user 99 is NOT in the sudoers file. this incident will be reported.", "red");
      break;
    case "who":
      push(`visitor   pts/0   ${new Date(sessionStart()).toTimeString().slice(0, 5)}   (you)`, "green");
      push("vardhan   tty1    always  (building)", "green");
      break;
    case "vim":
      push("this is a portfolio, not a text editor. (0 saved changes)", "red");
      push("but `:` works — try :help", "dim");
      break;
    case "42":
      push("the answer to life, the universe, and everything.", "amber");
      break;
    case "theme": {
      if (!arg) {
        push(`current phosphor: ${getPhosphor()}`, "green");
        push(`usage: theme <${PHOSPHORS.join(" | ")}>`, "dim");
        break;
      }
      const p = arg.toLowerCase();
      if (!isPhosphor(p)) {
        push(`theme: unknown phosphor '${arg}'`, "red");
        push(`try: ${PHOSPHORS.join(", ")}`, "dim");
        break;
      }
      setPhosphor(p);
      push(`phosphor set to ${p}. persisted for this browser.`, "green");
      effects.push({ type: "announce", text: `phosphor ${p}` });
      break;
    }
    case "crt": {
      const on = argv[0] === "on" ? true : argv[0] === "off" ? false : !getCrt();
      setCrt(on);
      push(`crt overlays ${on ? "on" : "off"} — scanlines, vignette, flicker.`, on ? "green" : "amber");
      effects.push({ type: "announce", text: `crt ${on ? "on" : "off"}` });
      break;
    }
    case "top":
      effects.push({ type: "top" });
      break;
    case "sl":
      push("sl: you meant ls. enjoy the ride.", "dim");
      effects.push({ type: "sl" });
      break;
    case "snake":
      effects.push({ type: "snake" });
      break;
    case "clear":
      effects.push({ type: "clear" });
      break;
    default:
      push(`bash: ${cmdRaw}: command not found`, "red");
      push("type 'help' for the manual.", "dim");
  }
  return { lines, effects };
}

/* ------------------------------------------------------------------ */
/* pipes                                                                */

function applyFilter(lines: Line[], stage: string): Line[] {
  const [f, ...rest] = stage.trim().split(/\s+/);
  const a = rest.join(" ");
  switch (f) {
    case "grep": {
      const invert = rest[0] === "-v";
      const pat = (invert ? rest.slice(1) : rest).join(" ").replace(/^["'](.*)["']$/, "$1").toLowerCase();
      if (!pat) return [L("grep: missing pattern", "red")];
      const out = lines.filter((l) => l.text.toLowerCase().includes(pat) !== invert);
      return out.length ? out : [L(`grep: no match for "${pat}"`, "dim")];
    }
    case "head": {
      const n = Number(a.replace("-n", "").trim()) || 5;
      return lines.slice(0, n);
    }
    case "tail": {
      const n = Number(a.replace("-n", "").trim()) || 5;
      return lines.slice(-n);
    }
    case "wc":
      return [L(`${lines.length}`, "green")];
    case "sort":
      return [...lines].sort((x, y) => x.text.localeCompare(y.text));
    case "uniq": {
      const seen = new Set<string>();
      return lines.filter((l) => (seen.has(l.text) ? false : (seen.add(l.text), true)));
    }
    default:
      return [L(`bash: ${f}: not a filter — try grep, head, tail, wc, sort`, "red")];
  }
}

/** Run one chained line ("a; b && c | grep x"). Effects are collected across all commands. */
export function runLine(raw: string, ctx: ShellCtx): ShellResult {
  const chains = raw.split(/\s*(?:;|&&)\s*/).map((c) => c.trim()).filter(Boolean);
  const lines: Line[] = [];
  const effects: ShellEffect[] = [];
  for (const chain of chains) {
    const stages = chain.split(/\s*\|\s*/);
    const [first, ...filters] = stages;
    const m = /^(\S+)\s*(.*)$/.exec(first) ?? [first, first, ""];
    const cmd = m[1].toLowerCase();
    const arg = m[2].trim();
    lines.push(L(`$ ${chain}`, "cmd"));
    const r = runCmd(cmd, arg, ctx);
    let out = r.lines;
    for (const f of filters) out = applyFilter(out, f);
    lines.push(...out);
    effects.push(...r.effects);
  }
  return { lines, effects };
}

/** Tab completion over the whole input prefix. */
export function complete(input: string): { matches: string[]; value?: string } {
  const q = input.replace(/^\s+/, "");
  if (!q) return { matches: [] };
  const lower = q.toLowerCase();
  const pool = COMMANDS.filter((c) => c.startsWith(lower) && c !== lower);
  if (pool.length === 0) return { matches: [] };
  if (pool.length === 1) return { matches: pool, value: pool[0] + " " };
  // longest common prefix
  let lcp = pool[0];
  for (const c of pool) while (!c.startsWith(lcp)) lcp = lcp.slice(0, -1);
  return { matches: pool, value: lcp.length > lower.length ? lcp : undefined };
}

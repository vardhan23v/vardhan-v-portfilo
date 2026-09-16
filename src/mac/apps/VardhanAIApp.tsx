import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { site } from "../data/site";
import { featuredProjects, type Project } from "../data/projects";
import { skillCategories } from "../data/skills";
import { experience, education, certifications } from "../data/experience";
import { useWindowManager, type AppId } from "../hooks/useWindowManager";

const SUGGESTED = [
  "Tell me about HPL Auction",
  "How can I contact him?",
  "What is VardhanOS?",
  "Open Settings",
];

interface Answer { text: string; open?: AppId; }

const OPEN_APPS: Record<string, AppId> = {
  overview: "overview", home: "overview", main: "overview",
  about: "about", "about-mac": "about-mac",
  projects: "projects", project: "projects", portfolio: "projects", work: "projects",
  experience: "experience", skills: "skills", tech: "skills", stack: "skills",
  achievements: "achievements", education: "achievements",
  contact: "contact", finder: "finder", terminal: "terminal",
  settings: "settings", preferences: "settings", ai: "vardhan-ai",
  "vardhan-ai": "vardhan-ai", assistant: "vardhan-ai", messages: "vardhan-ai", notes: "notes", photos: "photos",
};

function projectText(p: Project): string {
  const highlights = p.features.slice(0, 3).join(" · ");
  return `${p.name} — ${p.tagline} ${p.problem} Built with ${p.tech.join(
    ", "
  )}. ${highlights}. ${p.github ? `[GitHub](${p.github})` : ""} ${
    p.live ? `[Live](${p.live})` : ""
  } — [Open Projects](app:projects)`;
}

/** Rule-based answer engine over real portfolio data. */
function answer(q: string): Answer {
  const norm = q
    .toLowerCase()
    .replace(/[?.!]/g, "")
    .replace(/[’']/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const openMatch = norm.match(/^(?:open|launch|start|show me|take me to|go to)\s+(.+)$/);
  if (openMatch) {
    const key = openMatch[1].trim().replace(/\s+/g, "-");
    if (OPEN_APPS[key]) {
      return { text: `Opening ${openMatch[1].trim()}…`, open: OPEN_APPS[key] };
    }
    const proj = featuredProjects.find(
      (p) =>
        p.name.toLowerCase() === openMatch[1].trim() ||
        p.slug.replace(/-/g, " ") === openMatch[1].trim()
    );
    if (proj) return { text: projectText(proj) };
    return {
      text: `I can open an app or pull up a project — try "open settings", "open finder", or ask about a project by name.`,
    };
  }

  const proj = featuredProjects.find(
    (p) =>
      norm.includes(p.name.toLowerCase()) ||
      norm.includes(p.slug.replace(/-/g, " "))
  );
  if (proj) return { text: projectText(proj) };

  if (/(projects|built|work|portfolio|apps|applications)/.test(norm)) {
    const names = featuredProjects.slice(0, 5).map((p) => p.name).join(", ");
    return {
      text: `Vardhan has shipped ${featuredProjects.length} featured projects, including ${names} — plus more on GitHub. [Open Projects](app:projects) for the full build notes.`,
    };
  }

  if (/(stack|tech|skill|frontend|backend|language|tool)/.test(norm)) {
    const fe = skillCategories
      .find((c) => c.label === "Frontend")
      ?.items.slice(0, 6)
      .map((i) => i.name)
      .join(", ");
    const be = skillCategories
      .find((c) => c.label === "Backend")
      ?.items.slice(0, 4)
      .map((i) => i.name)
      .join(", ");
    return {
      text: `Core stack: ${fe}. Backend: ${be}. For AI he uses Muse Spark, DeepSeek, Groq + MCP tooling. [Open Skills](app:skills) has the full list.`,
    };
  }

  if (/(experience|intern|job|role|work history)/.test(norm)) {
    const roles = experience
      .map((e) => `${e.role} @ ${e.company} (${e.period})`)
      .join(" · ");
    return { text: `${roles}. [Open Experience](app:experience)` };
  }

  if (/(education|degree|college|school|university|certif|achievement|award)/.test(norm)) {
    const edu = education
      .map((e) => `${e.degree} — ${e.school} (${e.period})`)
      .join(" · ");
    const cert = certifications.slice(0, 4).join(", ");
    return {
      text: `Education: ${edu}. Certifications: ${cert}. [Open Achievements](app:achievements)`,
    };
  }

  if (/(contact|email|hire|reach|mail|social|linkedin|github|resume|cv)/.test(norm)) {
    return {
      text: `You can reach Vardhan at [${site.email}](mailto:${site.email}), on [GitHub](${site.github}) or [LinkedIn](${site.linkedin}), or grab the [resume](${site.resume}). He's based in ${site.location}.`,
    };
  }

  if (/(deploy|live|host|website|production|vercel|where can i see)/.test(norm)) {
    return {
      text: `Vardhan ships on Vercel — this very Vardhan OS runs live at [vardhan-v-portfilo.vercel.app/mac](https://vardhan-v-portfilo.vercel.app/mac). Open [About This Mac](app:about-mac) for the system rundown.`,
    };
  }

  if (/(who|about|vardhan|what is this|what's this|os|macos|made with|built with|how does|is this|this site)/.test(norm)) {
    return {
      text: `${site.name} — ${site.title}. ${site.tagline} Based in ${site.location}. VardhanOS itself is a React + TypeScript take on macOS — open [About This Mac](app:about-mac) or the [Projects](app:projects) app to see what he ships.`,
    };
  }

  return {
    text: `I mostly know portfolio facts — try asking about projects, a specific project ("Tell me about HPL Auction"), tech stack, experience, education, or how to contact Vardhan.`,
  };
}

/** Render `[label](target)` links; `app:` targets navigate inside the OS. */
function RichText({ text }: { text: string }) {
  const { openWindow } = useWindowManager();
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return (
    <>
      {parts.map((part, i) => {
        const m = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
        if (!m) return <span key={i}>{part}</span>;
        const [label, target] = [m[1], m[2]];
        if (target.startsWith("app:")) {
          return (
            <button
              key={i}
              className="aiapp__link"
              onClick={() => openWindow(target.slice(4) as AppId)}
            >
              {label}
            </button>
          );
        }
        return (
          <a key={i} className="aiapp__link" href={target} target="_blank" rel="noreferrer">
            {label}
          </a>
        );
      })}
    </>
  );
}

interface Msg { id: number; from: "me" | "them"; text: string; reaction?: string; at: number }
const CONTACTS = [
  { id: "vardhan", name: "Vardhan", initials: "SV", sub: "Ask about projects, stack, work", hue: 225 },
  { id: "projects", name: "Projects bot", initials: "PB", sub: "Type a project name", hue: 28 },
];
const REACTIONS = ["❤️", "👍", "😂", "‼️", "❓"];

/** Messages: an iMessage-style front end over the rule-based intent engine. */
export function VardhanAIApp() {
  const { openWindow } = useWindowManager();
  const [contact, setContact] = useState(CONTACTS[0].id);
  const [threads, setThreads] = useState<Record<string, Msg[]>>({});
  const [value, setValue] = useState("");
  const [typing, setTyping] = useState(false);
  const [picker, setPicker] = useState<number | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const msgs = threads[contact] ?? [];
  const c = CONTACTS.find((x) => x.id === contact)!;

  useEffect(() => { bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" }); }, [msgs.length, typing]);

  const push = (m: Omit<Msg, "id" | "at">) => setThreads((t) => ({ ...t, [contact]: [...(t[contact] ?? []).slice(-40), { ...m, id: Date.now() + Math.random(), at: Date.now() }] }));

  const ask = (q: string) => {
    const query = q.trim();
    if (!query || typing) return;
    push({ from: "me", text: query });
    setValue("");
    const res = answer(contact === "projects" ? `tell me about ${query}` : query);
    setTyping(true);
    const delay = Math.min(1800, 500 + res.text.length * 6);
    window.setTimeout(() => {
      setTyping(false);
      push({ from: "them", text: res.text });
      if (res.open) openWindow(res.open);
    }, delay);
  };
  const react = (id: number, r: string) => { setThreads((t) => ({ ...t, [contact]: (t[contact] ?? []).map((m) => (m.id === id ? { ...m, reaction: m.reaction === r ? undefined : r } : m)) })); setPicker(null); };
  const stamp = (t: number) => new Date(t).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="msgs">
      <aside className="msgs__side">
        <div className="msgs__side-head"><span className="mac-caps">Pinned</span></div>
        {CONTACTS.map((k) => {
          const last = (threads[k.id] ?? []).slice(-1)[0];
          return (
            <button key={k.id} className={`msgs__contact${contact === k.id ? " is-active" : ""}`} onClick={() => setContact(k.id)}>
              <span className="msgs__avatar" style={{ "--h": k.hue } as React.CSSProperties}>{k.initials}</span>
              <span className="msgs__contact-text"><b>{k.name}</b><span>{last ? last.text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").slice(0, 40) : k.sub}</span></span>
              {last && <time>{stamp(last.at)}</time>}
            </button>
          );
        })}
      </aside>
      <div className="msgs__main">
        <div className="msgs__head">
          <span className="msgs__avatar msgs__avatar--lg" style={{ "--h": c.hue } as React.CSSProperties}>{c.initials}</span>
          <span><b>{c.name}</b><em>{typing ? "typing…" : "iMessage · local, no API key"}</em></span>
        </div>
        <div className="msgs__body" ref={bodyRef} aria-live="polite" onClick={() => setPicker(null)}>
          {msgs.length === 0 && (
            <div className="msgs__hint">
              <span className="mac-caps">Today</span>
              <p>Ask about projects, stack, experience, education or how to reach Vardhan. Double-click a bubble to react.</p>
            </div>
          )}
          {msgs.map((m, i) => (
            <div key={m.id} className={`msgs__row msgs__row--${m.from}`}>
              <div className={`msgs__bubble${m.reaction ? " has-reaction" : ""}`} onDoubleClick={(e) => { e.stopPropagation(); setPicker(m.id); }}>
                <RichText text={m.text} />
                {m.reaction && <span className="msgs__reaction">{m.reaction}</span>}
                {picker === m.id && (
                  <div className="msgs__picker" onClick={(e) => e.stopPropagation()}>
                    {REACTIONS.map((r) => <button key={r} onClick={() => react(m.id, r)}>{r}</button>)}
                  </div>
                )}
              </div>
              {m.from === "me" && i === msgs.length - 1 && !typing && <span className="msgs__status">Delivered</span>}
            </div>
          ))}
          {typing && <div className="msgs__row msgs__row--them"><div className="msgs__bubble msgs__typing"><i /><i /><i /></div></div>}
        </div>
        <div className="aiapp__suggest">
          {SUGGESTED.map((s) => <button key={s} className="aiapp__chip" onClick={() => ask(s)}>{s}</button>)}
        </div>
        <form className="msgs__row-input" onSubmit={(e) => { e.preventDefault(); ask(value); }}>
          <input className="aiapp__input" value={value} onChange={(e) => setValue(e.target.value)} placeholder={`Message ${c.name}…`} aria-label="Message" />
          <button className="msgs__send" type="submit" aria-label="Send" disabled={!value.trim()}><Send /></button>
        </form>
      </div>
    </div>
  );
}

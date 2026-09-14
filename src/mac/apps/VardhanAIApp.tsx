import { useState } from "react";
import { Sparkles, Send } from "lucide-react";
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
  "vardhan-ai": "vardhan-ai", assistant: "vardhan-ai",
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
      text: `Vardhan ships on Vercel — this very VardhanOS runs live at [vardhan23v.dev](https://vardhan23v.dev/mac). Open [About This Mac](app:about-mac) for the system rundown.`,
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

/** Phase-6 Vardhan AI: rule-based intent engine + real navigation.
 *  All facts come from portfolio data; links are interactive. */
export function VardhanAIApp() {
  const { openWindow } = useWindowManager();
  const [msgs, setMsgs] = useState<{ q: string; a: string }[]>([]);
  const [value, setValue] = useState("");

  const ask = (q: string) => {
    const query = q.trim();
    if (!query) return;
    const res = answer(query);
    if (res.open) openWindow(res.open);
    setMsgs((m) => [...m.slice(-20), { q: query, a: res.text }]);
    setValue("");
  };

  return (
    <div className="aiapp">
      <div className="aiapp__head">
        <Sparkles /> <span>Vardhan AI</span>
        <em>local preview</em>
      </div>
      <div className="aiapp__body" aria-live="polite">
        {msgs.length === 0 && (
          <div className="aiapp__hint">
            Ask about projects, stack, experience, education, or how to contact
            Vardhan — <RichText text="[book via mail](mailto:23vvardhan@gmail.com)" />
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i}>
            <div className="aiapp__q">{m.q}</div>
            <div className="aiapp__a">
              <RichText text={m.a} />
            </div>
          </div>
        ))}
      </div>
      <div className="aiapp__suggest">
        {SUGGESTED.map((s) => (
          <button key={s} className="aiapp__chip" onClick={() => ask(s)}>
            {s}
          </button>
        ))}
      </div>
      <form
        className="aiapp__row"
        onSubmit={(e) => {
          e.preventDefault();
          ask(value);
        }}
      >
        <input
          className="aiapp__input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ask about Vardhan…"
          aria-label="Ask Vardhan AI"
        />
        <button className="mac-btn mac-btn--primary" type="submit" aria-label="Send">
          <Send style={{ width: 14, height: 14 }} />
        </button>
      </form>
    </div>
  );
}
import { useState } from "react";
import { Sparkles, Send } from "lucide-react";
import { site } from "../data/site";
import { featuredProjects } from "../data/projects";
import { skillCategories } from "../data/skills";
import { experience } from "../data/experience";

const SUGGESTED = [
  "What projects has Vardhan built?",
  "What is his tech stack?",
  "Tell me about HPL Auction.",
  "How can I contact him?",
];

function answer(q: string): string {
  const t = q.toLowerCase();
  if (/(project|built|work|app)/.test(t)) {
    const names = featuredProjects.slice(0, 5).map((p) => p.name).join(", ");
    return `Vardhan has shipped ${featuredProjects.length} featured projects, including ${names} — plus ${13}+ more on GitHub. Open the Projects app or Finder for details.`;
  }
  if (/(stack|tech|skill|frontend|backend|language)/.test(t)) {
    const fe = skillCategories.find((c) => c.label === "Frontend")?.items.map((i) => i.name).slice(0, 5).join(", ");
    return `Core stack: ${fe}, with Node.js/Express on the backend and Muse Spark, DeepSeek, Groq + MCP for AI features. See the Skills app for the full list.`;
  }
  if (/(hpl|auction|cricket)/.test(t)) {
    const p = featuredProjects.find((x) => x.slug === "hpl-auction");
    return p ? `HPL Auction — ${p.tagline} ${p.problem}` : "HPL Auction is a live cricket auction platform with real-time WebSocket bidding.";
  }
  if (/(contact|email|hire|reach)/.test(t)) {
    return `You can reach Vardhan at ${site.email}, or open the Contact app. He's based in ${site.location}.`;
  }
  if (/(experience|intern|job|role)/.test(t)) {
    return experience.map((e) => `${e.role} @ ${e.company}`).join(" · ");
  }
  if (/(who|about|vardhan)/.test(t)) {
    return `${site.name} — ${site.title}. ${site.tagline}`;
  }
  return "I can answer from the portfolio data — try asking about projects, tech stack, experience, or contact.";
}

/** Phase-1 Vardhan AI: rule-based answers over real portfolio data.
 *  UI + architecture ready for a provider plug-in later (no client keys). */
export function VardhanAIApp() {
  const [msgs, setMsgs] = useState<{ q: string; a: string }[]>([]);
  const [value, setValue] = useState("");

  const ask = (q: string) => {
    const query = q.trim();
    if (!query) return;
    setMsgs((m) => [...m.slice(-20), { q: query, a: answer(query) }]);
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
          <div className="aiapp__hint">Ask about projects, stack, experience, or contact.</div>
        )}
        {msgs.map((m, i) => (
          <div key={i}>
            <div className="aiapp__q">{m.q}</div>
            <div className="aiapp__a">{m.a}</div>
          </div>
        ))}
      </div>
      <div className="aiapp__suggest">
        {SUGGESTED.map((s) => (
          <button key={s} className="aiapp__chip" onClick={() => ask(s)}>{s}</button>
        ))}
      </div>
      <form className="aiapp__row" onSubmit={(e) => { e.preventDefault(); ask(value); }}>
        <input className="aiapp__input" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Ask about Vardhan…" aria-label="Ask Vardhan AI" />
        <button className="mac-btn mac-btn--primary" type="submit" aria-label="Send"><Send style={{ width: 14, height: 14 }} /></button>
      </form>
    </div>
  );
}

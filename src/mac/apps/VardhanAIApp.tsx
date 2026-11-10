import { useEffect, useRef, useState } from "react";
import { RotateCcw, Send, Square, Trash2 } from "lucide-react";
import { useWindowManager, type AppId } from "../hooks/useWindowManager";
import { localIntent } from "../lib/aiIntents";
import { useChat, type ChatMessage } from "../../lib/ai/useChat";
import { followUps } from "../../lib/ai/followups";
import { Markdown } from "../../components/ai/Markdown";
import { SourceReferences } from "../../components/ai/SourceReferences";

const SUGGESTED = [
  "Tell me about HPL Auction",
  "How can I contact him?",
  "What is VardhanOS?",
  "Open Settings",
];

const CONTACTS = [
  { id: "vardhan", name: "Vardhan", initials: "SV", sub: "Ask about projects, stack, work", hue: 225 },
  { id: "projects", name: "Projects bot", initials: "PB", sub: "Type a project name", hue: 28 },
] as const;
type ContactId = (typeof CONTACTS)[number]["id"];
const REACTIONS = ["❤️", "👍", "😂", "‼️", "❓"];

const plain = (s: string) => s.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\[\d+(?:,\s*\d+)*\]/g, "").replace(/[*_`]/g, "");

/**
 * Messages: an iMessage-style front end. Navigation intents ("open settings") are handled
 * locally; every factual question goes to the same /api/chat RAG backend as the global assistant.
 */
export function VardhanAIApp() {
  const { openWindow } = useWindowManager();
  const threads = { vardhan: useChat("mac"), projects: useChat("mac") };
  const [contact, setContact] = useState<ContactId>("vardhan");
  const [value, setValue] = useState("");
  const [picker, setPicker] = useState<string | null>(null);
  const [reactions, setReactions] = useState<Record<string, string>>({});
  const bodyRef = useRef<HTMLDivElement>(null);
  const chat = threads[contact];
  const msgs = chat.messages;
  const c = CONTACTS.find((x) => x.id === contact)!;
  const last = msgs[msgs.length - 1];
  const next = followUps(msgs);
  const chips = next.length ? next : SUGGESTED;
  const typing = last?.role === "assistant" && last.status === "streaming" && !last.content;

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs.length, last?.content]);

  const stamp = (m: ChatMessage) => new Date(m.at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const ask = (q: string) => {
    const query = q.trim();
    if (!query || chat.busy) return;
    setValue("");
    const local = localIntent(query);
    if (local) {
      chat.addLocal(query, local.text);
      if (local.open) openWindow(local.open);
      return;
    }
    chat.send(contact === "projects" && !/\b(project|tell|what|how|why|explain)\b/i.test(query) ? `Tell me about the project ${query}` : query);
  };

  const react = (id: string, r: string) => {
    setReactions((x) => ({ ...x, [id]: x[id] === r ? "" : r }));
    setPicker(null);
  };

  return (
    <div className="msgs">
      <aside className="msgs__side">
        <div className="msgs__side-head"><span className="mac-caps">Pinned</span></div>
        {CONTACTS.map((k) => {
          const lastMsg = threads[k.id].messages.slice(-1)[0];
          return (
            <button key={k.id} className={`msgs__contact${contact === k.id ? " is-active" : ""}`} onClick={() => setContact(k.id)}>
              <span className="msgs__avatar" style={{ "--h": k.hue } as React.CSSProperties}>{k.initials}</span>
              <span className="msgs__contact-text"><b>{k.name}</b><span>{lastMsg?.content ? plain(lastMsg.content).slice(0, 40) : k.sub}</span></span>
              {lastMsg && <time>{stamp(lastMsg)}</time>}
            </button>
          );
        })}
      </aside>
      <div className="msgs__main">
        <div className="msgs__head">
          <span className="msgs__avatar msgs__avatar--lg" style={{ "--h": c.hue } as React.CSSProperties}>{c.initials}</span>
          <span><b>{c.name}</b><em>{typing ? "typing…" : "iMessage · answers cite portfolio, GitHub & resume"}</em></span>
          {msgs.length > 0 && (
            <button type="button" className="msgs__clear" onClick={chat.clear} aria-label="Clear conversation" title="Clear conversation" style={{ marginLeft: "auto" }}>
              <Trash2 aria-hidden width={14} height={14} />
            </button>
          )}
        </div>
        {/* Click-outside dismisses the reaction picker; the picker's own buttons are the keyboard path. */}
        <div className="msgs__body" ref={bodyRef} aria-live="polite" role="presentation" onClick={() => setPicker(null)}>
          {msgs.length === 0 && (
            <div className="msgs__hint">
              <span className="mac-caps">Today</span>
              <p>Ask about projects, stack, experience, education or how to reach Vardhan. Double-click a bubble to react.</p>
            </div>
          )}
          {msgs.map((m, i) => {
            const reaction = reactions[m.id];
            const from = m.role === "user" ? "me" : "them";
            if (m.role === "assistant" && m.status === "streaming" && !m.content) return null;
            return (
              <div key={m.id} className={`msgs__row msgs__row--${from}`}>
                <div className={`msgs__bubble${reaction ? " has-reaction" : ""}`} onDoubleClick={(e) => { e.stopPropagation(); setPicker(m.id); }}>
                  {m.role === "user" ? (
                    <span>{m.content}</span>
                  ) : (
                    <Markdown text={m.content} onAppLink={(t) => openWindow(t as AppId)} citations={new Set((m.sources ?? []).map((s) => s.n))} />
                  )}
                  {m.status === "error" && (
                    <span className="msgs__error" role="alert">
                      {m.error}{" "}
                      <button type="button" className="aiapp__link" onClick={() => chat.retry(m.id)}><RotateCcw aria-hidden width={11} height={11} /> Retry</button>
                    </span>
                  )}
                  {m.sources && m.sources.length > 0 && <SourceReferences sources={m.sources} />}
                  {reaction && <span className="msgs__reaction">{reaction}</span>}
                  {picker === m.id && (
                    <div className="msgs__picker" onClick={(e) => e.stopPropagation()}>
                      {REACTIONS.map((r) => <button key={r} onClick={() => react(m.id, r)}>{r}</button>)}
                    </div>
                  )}
                </div>
                {m.role === "user" && i === msgs.length - 1 && <span className="msgs__status">Delivered</span>}
              </div>
            );
          })}
          {typing && <div className="msgs__row msgs__row--them"><div className="msgs__bubble msgs__typing"><i /><i /><i /></div></div>}
        </div>
        <div className="aiapp__suggest">
          {chips.map((s) => <button key={s} className="aiapp__chip" onClick={() => ask(s)} disabled={chat.busy}>{s}</button>)}
        </div>
        <form className="msgs__row-input" onSubmit={(e) => { e.preventDefault(); ask(value); }}>
          <input className="aiapp__input" value={value} onChange={(e) => setValue(e.target.value)} placeholder={`Message ${c.name}…`} aria-label="Message" maxLength={1500} />
          {chat.busy ? (
            <button className="msgs__send" type="button" aria-label="Stop" onClick={chat.stop}><Square /></button>
          ) : (
            <button className="msgs__send" type="submit" aria-label="Send" disabled={!value.trim()}><Send /></button>
          )}
        </form>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Trash2, Lock, Globe } from "lucide-react";
import { site } from "../data/site";
import { status } from "../data/status";
import { featuredProjects } from "../data/projects";
import { experience, education, certifications } from "../data/experience";
import { skillCategories, exploring } from "../data/skills";
import { renderMarkdown } from "../lib/markdown";

interface Note { id: string; title: string; body: string; updated: number; kind: "public" | "private" }
const KEY = "mac-notes";

function publicNotes(): Note[] {
  const t = Date.parse("2026-09-15T12:00:00+05:30");
  const n: Note[] = [
    { id: "about", kind: "public", updated: t, title: "About me", body:
`# ${site.name}
**${site.title}** · ${site.location}

> ${site.tagline}

I build AI-powered web applications, developer tools and full-stack products — not prototypes, but systems that ship with source.

## Now
- ${status.detail}
- ${status.availability}

## Currently exploring
${exploring.map((e) => `- **${e.name}** — ${e.note}`).join("\n")}

[GitHub](${site.github}) · [LinkedIn](${site.linkedin}) · [Email](mailto:${site.email})` },
    { id: "how", kind: "public", updated: t - 3600e3, title: "How I ship", body:
`# How I ship
1. **Understand** — read the real problem before writing a line.
2. **Design** — the smallest honest architecture that can grow.
3. **Build** — TypeScript end-to-end, AI-assisted, human-reviewed.
4. **Ship** — deploy early, watch it break, fix it fast.

\`frontend → api → database → llm → product\`

- [x] Rebuild the macOS edition as Vardhan OS 2.0
- [x] Landing page redesign
- [ ] Write the case studies
- [ ] Record demo videos for the flagship projects` },
    { id: "stack", kind: "public", updated: t - 7200e3, title: "Stack", body:
`# Stack
${skillCategories.map((c) => `## ${c.label}\n${c.items.map((i) => `\`${i.name}\``).join(" ")}`).join("\n\n")}` },
    { id: "cv", kind: "public", updated: t - 9000e3, title: "Experience & education", body:
`# Experience
${experience.map((e) => `## ${e.role} — ${e.company}\n*${e.period}*\n${e.points.map((p) => `- ${p}`).join("\n")}`).join("\n\n")}

---

# Education
${education.map((e) => `- **${e.school}** — ${e.degree} (${e.period})`).join("\n")}

# Certifications
${certifications.map((c) => `- ${c}`).join("\n")}` },
    ...featuredProjects.map((p, i) => ({
      id: `p-${p.slug}`, kind: "public" as const, updated: t - (i + 4) * 3600e3, title: p.name, body:
`# ${p.emoji} ${p.name}
*${p.tagline}*

## The problem
${p.problem}

## What it does
${p.features.map((f) => `- ${f}`).join("\n")}

## Stack
${p.tech.map((x) => `\`${x}\``).join(" ")}

[Source on GitHub](${p.github})${p.live ? ` · [Live](${p.live})` : ""}` })),
  ];
  return n;
}

function loadPrivate(): Note[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
function savePrivate(n: Note[]) {
  try { localStorage.setItem(KEY, JSON.stringify(n)); } catch { /* ignore */ }
}
const when = (t: number) => new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

/** Notes: public notes from portfolio data + private notes saved in this browser. */
export function NotesApp() {
  const pub = useMemo(publicNotes, []);
  const [priv, setPriv] = useState<Note[]>(loadPrivate);
  const [sel, setSel] = useState<string>(pub[0].id);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(false);
  useEffect(() => savePrivate(priv), [priv]);

  const all = [...priv, ...pub];
  const list = all.filter((n) => !q.trim() || (n.title + n.body).toLowerCase().includes(q.toLowerCase()));
  const note = all.find((n) => n.id === sel) ?? list[0];

  const create = () => {
    const n: Note = { id: `n-${Date.now()}`, kind: "private", updated: Date.now(), title: "New note", body: "# New note\nWrite in **markdown** — lists, `code`, [links](https://), and task lists:\n- [ ] first thing\n" };
    setPriv((p) => [n, ...p]);
    setSel(n.id);
    setEditing(true);
  };
  const update = (body: string) => {
    if (!note || note.kind !== "private") return;
    const title = (body.match(/^#\s*(.+)$/m)?.[1] ?? body.split("\n")[0] ?? "Untitled").replace(/[*_`]/g, "").trim() || "Untitled";
    setPriv((p) => p.map((n) => (n.id === note.id ? { ...n, body, title, updated: Date.now() } : n)));
  };
  const remove = () => {
    if (!note || note.kind !== "private") return;
    setPriv((p) => p.filter((n) => n.id !== note.id));
    setSel(pub[0].id);
    setEditing(false);
  };
  const toggleTask = (ln: number) => {
    if (!note) return;
    const lines = note.body.split("\n");
    lines[ln] = lines[ln].replace(/\[( |x|X)\]/, (m) => (m === "[ ]" ? "[x]" : "[ ]"));
    const body = lines.join("\n");
    if (note.kind === "private") update(body);
    else {
      // public notes: keep toggles in session only
      pub.forEach((n) => { if (n.id === note.id) n.body = body; });
      setQ((s) => s); // re-render
      setSel(note.id);
    }
  };

  return (
    <div className="notesapp">
      <aside className="notesapp__side">
        <div className="notesapp__tools">
          <label className="notesapp__search"><Search /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" aria-label="Search notes" /></label>
          <button className="notesapp__new" onClick={create} aria-label="New note" title="New note"><Plus /></button>
        </div>
        {priv.length > 0 && <div className="notesapp__group mac-caps"><Lock /> On this Mac</div>}
        {list.filter((n) => n.kind === "private").map((n) => (
          <button key={n.id} className={`notesapp__item${note?.id === n.id ? " is-active" : ""}`} onClick={() => { setSel(n.id); setEditing(false); }}>
            <span className="notesapp__title">{n.title}</span>
            <span className="notesapp__meta">{when(n.updated)} · {n.body.replace(/[#*`>[\]-]/g, "").split("\n").filter(Boolean)[1]?.slice(0, 32) ?? "…"}</span>
          </button>
        ))}
        <div className="notesapp__group mac-caps"><Globe /> Vardhan</div>
        {list.filter((n) => n.kind === "public").map((n) => (
          <button key={n.id} className={`notesapp__item${note?.id === n.id ? " is-active" : ""}`} onClick={() => { setSel(n.id); setEditing(false); }}>
            <span className="notesapp__title">{n.title}</span>
            <span className="notesapp__meta">{when(n.updated)} · {n.body.replace(/[#*`>[\]-]/g, "").split("\n").filter(Boolean)[1]?.slice(0, 32) ?? "…"}</span>
          </button>
        ))}
      </aside>
      <div className="notesapp__main">
        {note ? (
          <>
            <div className="notesapp__bar">
              <span className="mac-caps">{note.kind === "private" ? "private · saved in this browser" : "public"} · {when(note.updated)}</span>
              {note.kind === "private" && (
                <span className="notesapp__actions">
                  <button className="mac-btn mac-btn--ghost" onClick={() => setEditing((e) => !e)}>{editing ? "Done" : "Edit"}</button>
                  <button className="mac-btn mac-btn--ghost" onClick={remove} aria-label="Delete note"><Trash2 /></button>
                </span>
              )}
            </div>
            {editing && note.kind === "private" ? (
              <textarea className="notesapp__editor" value={note.body} onChange={(e) => update(e.target.value)} spellCheck={false} aria-label="Note body" />
            ) : (
              <article className="notesapp__doc md" key={note.id + note.body.length}>{renderMarkdown(note.body, toggleTask)}</article>
            )}
          </>
        ) : (
          <div className="notesapp__empty">No notes match.</div>
        )}
      </div>
    </div>
  );
}

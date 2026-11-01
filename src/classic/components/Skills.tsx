import { useState } from "react";
import { skillCategories } from "../data/skills";

const FIRST = 6;
import { usedIn } from "../data/stats";

/** Small line glyphs drawn for this page, one per category; decorative. */
const GLYPH: Record<string, string> = {
  Languages: "M8 7 3 12l5 5M16 7l5 5-5 5M14 4l-4 16",
  Frontend: "M3 5h18v14H3zM3 9h18M7 7h.01M10 7h.01",
  Backend: "M4 4h16v6H4zM4 14h16v6H4zM8 7h.01M8 17h.01",
  Databases: "M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
  "AI / LLM": "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z",
  "Cloud & Tools": "M7 18a4 4 0 0 1-.6-8A6 6 0 0 1 18 9a4.5 4.5 0 0 1-.5 9z",
};

export function Skills() {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  return (
    <section className="skills" id="skills" aria-labelledby="skills-h2">
      <div className="wrap">
        <div className="section-head">
          <h2 className="h2" id="skills-h2">Skills</h2>
          <p className="section-sub">Grouped the way the projects above use them. The small number shows how many projects use it.</p>
        </div>
        <dl className="skills-list">
          {skillCategories.map((c) => (
            <div className="skill-row" key={c.label}>
              <dt>
                <svg className="skill-glyph" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d={GLYPH[c.label] ?? GLYPH.Languages} /></svg>
                {c.label}
              </dt>
              <dd>
                <span className="sr-only">{c.items.map((s) => (usedIn(s.name) ? `${s.name} (used in ${usedIn(s.name)} projects)` : s.name)).join(", ")}</span>
                <span className="chips" aria-hidden="true">
                  {(open[c.label] ? c.items : c.items.slice(0, FIRST)).map((s, w) => (
                    <span className="chip sk-word" key={s.name} style={{ "--w": w } as React.CSSProperties}>{s.name}{usedIn(s.name) > 1 && <b className="chip-n">{usedIn(s.name)}</b>}</span>
                  ))}
                </span>
                {c.items.length > FIRST && (
                  <button type="button" className="chip chip-more" aria-expanded={!!open[c.label]} onClick={() => setOpen((o) => ({ ...o, [c.label]: !o[c.label] }))}>
                    {open[c.label] ? "Show less" : `+${c.items.length - FIRST} more`}
                  </button>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

import { skillCategories, exploring } from "../data/skills";
import { SectionHead } from "./SectionHead";
import { Reveal } from "../hooks/useReveal";
import { Icon, type IconName } from "../lib/icons";
import "./Skills.css";

const techGlyphs: Record<string, string> = {
  js: "</>",
  ts: "TS",
  py: "PY",
  java: "JV",
  c: "C",
  sql: "SQL",
  html: "5",
  css: "3",
  react: "⚛",
  next: "N",
  vite: "V",
  responsive: "⇱",
  dom: "◈",
  node: "●",
  express: "Ex",
  rest: "↔",
  jwt: "◉",
  mongo: "🍃",
  mysql: "SQL",
  postgres: "🐘",
  prisma: "P",
  gemini: "✦",
  claude: "◆",
  groq: "⚡",
  llm: "∞",
  prompt: "›_",
  agent: "◌",
  mcp: "MCP",
  git: "Git",
  gh: "GH",
  vercel: "▲",
  vscode: "VS",
  postman: "Pm",
};

function glyphFor(name: string) {
  return { name, glyph: techGlyphs[name] ?? name.slice(0, 2).toUpperCase() };
}

function CategoryGlyph({ icon }: { icon: string }) {
  const Glyph = Icon[icon as IconName];
  return <Glyph width={19} height={19} />;
}

export function Skills() {
  return (
    <section id="skills">
      <div className="container">
        <SectionHead
          eyebrow="Tech Stack"
          title={<>Tools I <span className="grad-text">actually build with</span></>}
          sub="No percentage bars — just the languages, frameworks, and AI APIs I've shipped real applications with."
        />

        <div className="skills-grid">
          {skillCategories.map((cat, i) => (
            <Reveal key={cat.label} as="div" className="skill-cat" delay={i % 3 === 0 ? "reveal-d0" : undefined}>
              <div className="skill-cat-header">
                <span className="skill-cat-icon" aria-hidden="true">
                  <CategoryGlyph icon={cat.icon} />
                </span>
                <h3>{cat.label}</h3>
              </div>
              <div className="skill-chips">
                {cat.items.map((item, j) => (
                  <span
                    key={item.name}
                    className="skill-chip"
                    style={{ "--cd": `${j * 34}ms` } as React.CSSProperties}
                  >
                    <span className="skill-chip-glyph" aria-hidden="true">
                      {glyphFor(item.icon).glyph}
                    </span>
                    {item.name}
                  </span>
                ))}
              </div>
            </Reveal>
          ))}

          <Reveal className="skill-cat skill-exploring">
            <div className="skill-cat-header">
              <span className="skill-cat-icon" aria-hidden="true">
                <Icon.book width={19} height={19} />
              </span>
              <h3>Currently Exploring</h3>
            </div>
            <ul className="exploring-list">
              {exploring.map((e) => (
                <li key={e.name}>
                  <span className="exploring-dot" aria-hidden="true" />
                  <div>
                    <strong>{e.name}</strong>
                    <span>{e.note}</span>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
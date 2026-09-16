import { SectionHead } from "./SectionHead";
import { Reveal } from "../hooks/useReveal";
import { Icon } from "../lib/icons";
import "./About.css";

const strengths = [
  { icon: "sparkles", title: "Generative AI", text: "LLM integration, prompt design, agents and MCP tooling." },
  { icon: "server", title: "Full-stack", text: "React frontends, Node.js APIs, and databases wired end-to-end." },
  { icon: "rocket", title: "Product thinker", text: "I ship working applications, not just demos and tutorials." },
] as const;

function StrengthGlyph({ icon }: { icon: string }) {
  const Glyph = Icon[icon as keyof typeof Icon];
  return <Glyph width={20} height={20} />;
}

export function About() {
  return (
    <section id="about">
      <div className="container">
        <SectionHead eyebrow="About"
          index="01" title="Builder first, student second" />

        <div className="about-grid">
          <Reveal>
            <div className="about-card">
              <p className="about-lead">
                I'm a Computer Science undergraduate at <strong>NMAM Institute of Technology</strong>{" "}
                focused on full-stack development and AI-integrated applications.
              </p>
              <p>
                I enjoy building products across the stack — from React interfaces and Node.js APIs to
                databases and LLM integrations. I've built AI-powered developer tools, a Chrome
                extension generator, career platforms, and full-stack web applications using
                technologies such as React, Node.js, MongoDB, MySQL, Gemini, Claude, and Groq.
              </p>
              <p>
                I'm particularly interested in <span className="about-accent">Generative AI</span>,{" "}
                <span className="about-accent">AI agents</span>,{" "}
                <span className="about-accent">developer tooling</span>, and products that solve real
                problems.
              </p>
            </div>
          </Reveal>

          <div className="about-strengths">
            {strengths.map((s, i) => (
              <Reveal key={s.title} delay={`reveal-d${i + 1}`}>
                <div className="about-strength">
                  <span className="about-strength-icon" aria-hidden="true">
                    <StrengthGlyph icon={s.icon} />
                  </span>
                  <div>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
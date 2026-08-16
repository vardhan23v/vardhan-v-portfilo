import { Reveal } from "../hooks/useReveal";
import "./Principles.css";

const principles = [
  { label: "Build", text: "Turn ideas into working products." },
  { label: "Understand", text: "Learn the systems behind the abstractions." },
  { label: "Ship", text: "Move projects from prototype to something people can use." },
];

export function Principles() {
  return (
    <section className="principles" aria-label="How I approach work">
      <div className="container">
        <Reveal>
          <div className="principles-grid">
            <h2 className="principles-title">I like building things end-to-end.</h2>
            <p className="principles-text">
              I work across the stack — from React interfaces and Node.js APIs to databases
              and LLM integrations. Most of my learning happens through building real
              products, breaking them, improving them, and shipping them.
            </p>
            <ol className="principles-list">
              {principles.map((p, i) => (
                <li key={p.label}>
                  <span className="principles-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="principles-label">{p.label}</span>
                  <span className="principles-copy">{p.text}</span>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
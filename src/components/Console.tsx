import { useEffect, useRef, useState } from "react";
import { site } from "../data/site";
import "./Console.css";

const lines = [
  "> initializing application",
  "> connecting services",
  "> integrating LLM",
  "> testing API",
  "> deploying",
  "✓ production ready",
];

const flow = ["Frontend", "API", "Data", "LLM", "Product"];

export function Console() {
  const [visible, setVisible] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let i = 1;
    const timer = window.setInterval(() => {
      setVisible(i++);
      if (i > lines.length) window.clearInterval(timer);
    }, 240);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div
      className="console"
      role="img"
      aria-label="Build console: initializing application, connecting services, integrating LLM, testing API, deploying, production ready. Stack: frontend to API to data to LLM to product."
    >
      <div className="console-bar">
        <span className="console-title">{site.githubUser}@dev — ~/build-product</span>
      </div>
      <div className="console-body" aria-hidden="true">
        <p className="console-prompt">
          <span className="console-user">vardhan@dev</span> <span className="console-path">~/</span> <span className="console-cmd">./build-product</span>
        </p>
        {lines.map((l, i) => (
          <p
            key={l}
            className={`console-line ${i <= visible ? "console-line-in" : ""} ${l.startsWith("✓") ? "console-ok" : ""}`}
            style={{ transitionDelay: `${i * 35}ms` }}
          >
            {l}
          </p>
        ))}
      </div>
      <div className="console-flow" aria-hidden="true">
        {flow.map((f, i) => (
          <span key={f} className="console-flow-step">
            {f}
            {i < flow.length - 1 && <em className="console-flow-arrow">→</em>}
          </span>
        ))}
      </div>
    </div>
  );
}
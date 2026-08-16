import { useEffect, useRef, useState } from "react";
import "./Terminal.css";

const steps = [
  { text: "$ vardhan build --ai", prefix: "", prompt: true },
  { text: "Initializing AI...", prefix: "▶", dim: true },
  { text: "Connecting LLM...", prefix: "▶", dim: true },
  { text: "Building application...", prefix: "▶", dim: true },
  { text: "Deploying...", prefix: "▶", dim: true },
  { text: "✓ shipped", prefix: "", ok: true },
];

export function Terminal() {
  const [visible, setVisible] = useState(0);
  const [typing, setTyping] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let idx = 1;
    const timer = window.setInterval(() => {
      setVisible(idx);
      setTyping(step => !step);
      idx += 1;
      if (idx > steps.length) window.clearInterval(timer);
    }, 560);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="terminal" role="img" aria-label="Animated terminal showing: vardhan build --ai — Initializing AI, Connecting LLM, Building application, Deploying, shipped">
      <div className="terminal-bar">
        <span className="terminal-dot terminal-dot-r" />
        <span className="terminal-dot terminal-dot-y" />
        <span className="terminal-dot terminal-dot-g" />
        <span className="terminal-title">vardhan — build.sh</span>
        <span className="terminal-status" aria-hidden="true">
          <span className="terminal-pulse" /> building
        </span>
      </div>
      <div className="terminal-body">
        {steps.map((s, i) => {
          const show = i <= visible;
          const isTyping = typing && i === visible && i > 0;
          return (
            <div
              key={s.text}
              className={`terminal-line ${show ? "terminal-line-in" : ""} ${s.ok ? "terminal-ok" : ""} ${s.dim ? "terminal-dim" : ""}`}
              style={{ transitionDelay: `${i * 40}ms` }}
            >
              {s.prompt && <span className="terminal-prompt">$</span>}
              {!s.prompt && <span className="terminal-arrow">▸</span>}
              <span className="terminal-text">
                {s.text}
                {isTyping && <span className="terminal-cursor" aria-hidden="true" />}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
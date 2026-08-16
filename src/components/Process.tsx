import { process } from "../data/experience";
import { Reveal } from "../hooks/useReveal";
import "./Process.css";

export function Process() {
  return (
    <section className="process" id="process" aria-label="How I work">
      <div className="container">
        <Reveal>
          <header className="section-head">
            <span className="section-index">03 — How I work</span>
            <h2 className="section-title">A consistent path, from brief to shipped.</h2>
          </header>
        </Reveal>

        <div className="process-row">
          {process.map((p, i) => (
            <Reveal key={p.step} className="process-step">
              <div className="process-step-head">
                <span className="process-num">{p.step}</span>
                {i < process.length - 1 && <span className="process-connector" aria-hidden="true" />}
              </div>
              <h3 className="process-label">{p.label}</h3>
              <p className="process-text">{p.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
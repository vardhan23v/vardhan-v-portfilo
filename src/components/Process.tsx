import { process } from "../data/experience";
import { Reveal } from "../hooks/useReveal";

const steps = [
  "Understand",
  "Design",
  "Build",
  "Test",
  "Ship",
];

export function Process() {
  return (
    <section className="section" id="process" aria-labelledby="proc-title">
      <div className="container">
        <Reveal>
          <div className="sec-head" style={{ marginBottom: 40 }}>
            <span className="eyebrow">process</span>
            <h2 className="sec-title" id="proc-title">
              How I work
            </h2>
            <p className="sec-sub">Five stages, in order. Shortcuts don't survive production.</p>
          </div>
        </Reveal>

        <div className="proc-grid" role="list" aria-label="My process, five stages">
          {process.map((s, i) => (
            <Reveal key={s.step}>
              <div className="proc-card" role="listitem">
                <div className="proc-step">{s.step}</div>
                <h3>{steps[i]}</h3>
                <p>{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
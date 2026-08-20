import { process } from "../data/experience";
import { Reveal } from "../hooks/useReveal";
import { TypeCmd } from "./TypeCmd";

export function Process() {
  return (
    <section className="section" id="process" aria-labelledby="proc-title">
      <div className="container">
        <div className="shell">
          <Reveal>
            <div className="shell-head">
              <TypeCmd cmd="sh ./how_i_work.sh --pipeline" />
              <h2 className="shell-title" id="proc-title">
                HOW_I_WORK <span className="dim">// 5 stages</span>
              </h2>
            </div>
          </Reveal>

          <Reveal>
            <div className="pipe-grid" role="list" aria-label="My process, five stages">
              {process.map((s, i) => (
                <div className="pipe-node" role="listitem" key={s.step} data-spot style={{ "--i": i } as React.CSSProperties}>
                  <div className="pipe-step">{s.step}</div>
                  <div className="pipe-label">
                    {s.label.toLowerCase()}
                    <span className="bracket">/</span>
                  </div>
                  <div className="pipe-text">{s.text.toLowerCase()}</div>
                </div>
              ))}
            </div>
            <div className="pipe-ok">
              <span className="ok">●</span>
              <span>pipeline status: healthy — order matters, shortcuts don't last.</span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
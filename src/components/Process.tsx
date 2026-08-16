import { process } from "../data/experience";
import { Reveal } from "../hooks/useReveal";

export function Process() {
  return (
    <section className="section" id="process" aria-labelledby="proc-title">
      <div className="container">
        <div className="shell">
          <Reveal>
            <div className="shell-head">
              <span className="cmdline">
                <span className="dollar">$</span> sh ./how_i_work.sh --pipeline
              </span>
              <h2 className="shell-title" id="proc-title">
                HOW_I_WORK <span className="dim">// 5 stages</span>
              </h2>
            </div>
          </Reveal>

          <Reveal>
            <div className="pipe-grid" role="list" aria-label="My process, five stages">
              {process.map((s) => (
                <div className="pipe-node" role="listitem" key={s.step}>
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
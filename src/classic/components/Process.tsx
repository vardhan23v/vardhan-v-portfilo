import { process } from "../../terminal/data/experience";

/** How I work: the same five stages the Terminal edition lists, as a numbered path. */
export function Process() {
  return (
    <section className="process" id="process" aria-labelledby="process-h2">
      <div className="wrap">
        <div className="section-head">
          <h2 className="h2" id="process-h2">How I work</h2>
          <p className="section-sub">Five stages every project above went through, from the question to the deploy.</p>
        </div>
        <ol className="process-list">
          {process.map((s, i) => (
            <li className="process-step" key={s.step} style={{ "--bob": i } as React.CSSProperties}>
              <span className="process-n" aria-hidden="true">{s.step}</span>
              <h3 className="process-label">{s.label}</h3>
              <p className="process-text">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

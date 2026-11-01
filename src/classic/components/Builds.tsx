import { useState } from "react";
import { otherProjects } from "../data/projects";

const FIRST = 0;

/** Smaller open-source builds, shown as a compact index (same list the other editions show). */
export function Builds() {
  const [all, setAll] = useState(false);
  const list = all ? otherProjects : otherProjects.slice(0, FIRST);
  return (
    <div className="builds">
      <h3 className="h3">Smaller builds <span className="filter-n">{otherProjects.length}</span></h3>
      <p className="meta">Weekend projects, coursework and experiments, all on GitHub.</p>
      {list.length > 0 && <ul className="builds-list" id="builds-list">
        {list.map((p) => (
          <li className="build" key={p.github}>
            <div className="build-head">
              <a className="build-name" href={p.live ?? p.github} target="_blank" rel="noopener noreferrer">{p.name}<span className="sr-only"> (opens in a new tab)</span></a>
              <a className="build-src" href={p.github} target="_blank" rel="noopener noreferrer">Source<span className="sr-only"> for {p.name} on GitHub (opens in a new tab)</span></a>
            </div>
            <p className="build-desc">{p.description}</p>
            <p className="meta">{p.tech.slice(0, 4).join(" · ")}</p>
          </li>
        ))}
      </ul>}
      {otherProjects.length > FIRST && (
        <button type="button" className="btn btn--secondary more-toggle" aria-expanded={all} aria-controls="builds-list" onClick={() => setAll((v) => !v)}>
          {all ? "Show fewer builds" : `Show ${otherProjects.length} smaller builds`}
        </button>
      )}
    </div>
  );
}

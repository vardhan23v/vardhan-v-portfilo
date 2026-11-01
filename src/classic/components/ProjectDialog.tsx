import { useEffect, useRef } from "react";
import { CATEGORY_LABEL, type Project } from "../data/projects";
import { KEY_WORK, CREDIT } from "../content";
import { Link } from "react-router-dom";
import { caseStudyPath, hasCaseStudy } from "../../work/links";

/** The full breakdown of one project in a native modal dialog, with previous and next. */
export function ProjectDialog({ list, index, onIndex, onClose }: { list: Project[]; index: number | null; onIndex: (i: number) => void; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const p = index === null ? null : list[index];
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (p && !d.open) d.showModal();
    if (!p && d.open) d.close();
  }, [p]);
  const step = (dir: number) => index !== null && onIndex((index + dir + list.length) % list.length);
  return (
    <dialog ref={ref} className="pd" aria-labelledby="pd-title" onClose={onClose} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {p && (
        <div className="pd-inner">
          <div className="pd-top">
            <p className="feature-cat">{CATEGORY_LABEL[p.category]} · {index! + 1} of {list.length}</p>
            <button type="button" className="pd-close" onClick={onClose} aria-label="Close project details">×</button>
          </div>
          <h2 className="pd-title" id="pd-title">{p.name}</h2>
          <p className="feature-tag">{p.tagline}</p>
          <h3 className="pd-h">The problem</h3>
          <p className="pd-text">{p.problem}</p>
          {KEY_WORK[p.slug] && <><h3 className="pd-h">What I built</h3><p className="pd-text">{KEY_WORK[p.slug]}</p></>}
          <h3 className="pd-h">Features</h3>
          <ul className="xp-points">{p.features.map((f) => <li key={f}>{f}</li>)}</ul>
          <h3 className="pd-h">Stack</h3>
          <ul className="chips">{p.tech.map((t) => <li className="chip" key={t}>{t}</li>)}</ul>
          {CREDIT[p.slug] && <p className="meta pd-credit">{CREDIT[p.slug]}</p>}
          <div className="pd-foot">
            <p className="links">
              {p.live && <a className="link" href={p.live} target="_blank" rel="noopener noreferrer">Live app<span className="sr-only"> (opens in a new tab)</span></a>}
              <a className="link" href={p.github} target="_blank" rel="noopener noreferrer">Source<span className="sr-only"> on GitHub (opens in a new tab)</span></a>
              {hasCaseStudy(p.slug) && <Link className="link" to={caseStudyPath(p.slug)} state={{ from: "/classic" }}>Read the case study</Link>}
            </p>
            <div className="pd-nav">
              <button type="button" className="btn btn--secondary" onClick={() => step(-1)}>← Previous</button>
              <button type="button" className="btn btn--secondary" onClick={() => step(1)}>Next →</button>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}

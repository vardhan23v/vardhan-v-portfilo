import { useEffect, useRef, useState } from "react";
import { CATEGORY_LABEL, type Project } from "../data/projects";
import { KEY_WORK, CREDIT } from "../content";
import { Link } from "react-router-dom";
import { caseStudyPath, hasCaseStudy } from "../../work/links";
import { aboutProject, askAssistant } from "../../lib/ai/ask";
import { prefetchEdition } from "../../lib/editionLoaders";
import { Icon } from "../lib/icons";

/** The full breakdown of one project in a native modal dialog, with previous and next. */
export function ProjectDialog({ list, index, onIndex, onClose }: { list: Project[]; index: number | null; onIndex: (i: number) => void; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const p = index === null ? null : list[index];
  // The last project stays rendered while the dialog fades out (classic.css), so the exit never shows an empty box.
  const [shown, setShown] = useState<{ p: Project; index: number } | null>(null);
  if (p && index !== null && (shown?.p !== p || shown.index !== index)) setShown({ p, index });
  // Which way the last step went (1 next, -1 previous); 0 on open, so the content only slides on a step.
  const [dir, setDir] = useState(0);
  const [wasOpen, setWasOpen] = useState(false);
  if (Boolean(p) !== wasOpen) { setWasOpen(Boolean(p)); if (p) setDir(0); }
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (p && !d.open) d.showModal();
    if (!p && d.open) d.close();
  }, [p]);
  // Each project starts at the top of its text.
  useEffect(() => { if (index !== null) ref.current?.scrollTo({ top: 0 }); }, [index]);
  const step = (by: number) => { if (index === null) return; setDir(by); onIndex((index + by + list.length) % list.length); };
  const cur = shown?.p;
  const at = shown?.index ?? 0;
  return (
    <dialog ref={ref} className="pd" aria-labelledby="pd-title" onClose={onClose} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {cur && (
        <div className="pd-inner">
          <div className="pd-top">
            <p className="feature-cat">{CATEGORY_LABEL[cur.category]} · {at + 1} of {list.length}</p>
            <button type="button" className="pd-close" onClick={onClose} aria-label="Close project details"><Icon.close width={20} height={20} /></button>
          </div>
          {/* Focus stays on Previous / Next; the new project is announced instead. */}
          <p className="sr-only" aria-live="polite">{dir !== 0 ? `${cur.name}, ${at + 1} of ${list.length}` : ""}</p>
          <div className="pd-body" key={cur.slug} data-dir={dir !== 0 ? String(dir) : undefined}>
            <h2 className="pd-title" id="pd-title">{cur.name}</h2>
            <p className="feature-tag">{cur.tagline}</p>
            <h3 className="pd-h">The problem</h3>
            <p className="pd-text">{cur.problem}</p>
            {KEY_WORK[cur.slug] && <><h3 className="pd-h">What I built</h3><p className="pd-text">{KEY_WORK[cur.slug]}</p></>}
            <h3 className="pd-h">Features</h3>
            <ul className="xp-points">{cur.features.map((f) => <li key={f}>{f}</li>)}</ul>
            <h3 className="pd-h">Stack</h3>
            <ul className="chips">{cur.tech.map((t) => <li className="chip" key={t}>{t}</li>)}</ul>
            {CREDIT[cur.slug] && <p className="meta pd-credit">{CREDIT[cur.slug]}</p>}
          </div>
          <div className="pd-foot">
            <p className="links">
              {cur.live && <a className="link" href={cur.live} target="_blank" rel="noopener noreferrer">Live app<span className="sr-only"> (opens in a new tab)</span></a>}
              <a className="link" href={cur.github} target="_blank" rel="noopener noreferrer">Source<span className="sr-only"> on GitHub (opens in a new tab)</span></a>
              {hasCaseStudy(cur.slug) && (
                <Link className="link" to={caseStudyPath(cur.slug)} state={{ from: "/classic" }} onMouseEnter={() => prefetchEdition(caseStudyPath(cur.slug))} onFocus={() => prefetchEdition(caseStudyPath(cur.slug))} onTouchStart={() => prefetchEdition(caseStudyPath(cur.slug))}>Read the case study</Link>
              )}
              {/* A modal dialog makes the rest of the page inert, so it closes before the assistant opens. */}
              <button type="button" className="link link-btn" data-ask-ai onClick={() => { onClose(); askAssistant(aboutProject(cur.name)); }}>Ask AI<span className="sr-only"> about {cur.name}</span> <span aria-hidden="true" className="ask-spark">✦</span></button>
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

import { SOURCE_LABEL, type SourceRef } from "../../lib/ai/types";

/** The sources the answer actually cited — titles, category, repo/section and the real URL. */
export function SourceReferences({ sources, highlight }: { sources: SourceRef[]; highlight?: number | null }) {
  if (!sources.length) return null;
  return (
    <details className="pa-sources" open={highlight != null || undefined}>
      <summary>{sources.length} source{sources.length === 1 ? "" : "s"}</summary>
      <ol>
        {sources.map((s) => {
          const where = [s.repo, s.path ?? s.section].filter(Boolean).join(" · ");
          const body = (
            <>
              <span className="pa-sources__n">{s.n}</span>
              <span className="pa-sources__text">
                <span className="pa-sources__title">{s.title}</span>
                <span className="pa-sources__meta">
                  {SOURCE_LABEL[s.category]}{where ? ` · ${where}` : ""}{` · chunk ${s.chunkIndex + 1}`}
                </span>
              </span>
            </>
          );
          return (
            <li key={s.chunkId} id={`pa-src-${s.chunkId}`} className={highlight === s.n ? "is-hl" : undefined}>
              {s.url ? <a href={s.url} target="_blank" rel="noopener noreferrer">{body}</a> : <span>{body}</span>}
            </li>
          );
        })}
      </ol>
    </details>
  );
}

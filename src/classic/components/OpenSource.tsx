import { contributions, ossStats, statusLabel, OSS_AS_OF } from "../data/opensource";

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** One line from the data: merged work first, then what is still in review, per project. */
function intro() {
  const parts = contributions.map((c) => {
    const merged = c.prs.filter((p) => p.status === "merged").length;
    const open = c.prs.length - merged;
    const bits: string[] = [];
    if (merged) bits.push(`${plural(merged, "merged pull request", "merged pull requests")} to ${c.project}`);
    if (open) bits.push(`${open} in review at ${c.project}`);
    return bits.join(", ");
  });
  return `${parts.join(", ")}.`;
}

const asOf = new Date(`${OSS_AS_OF}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** Pull requests to other people's open-source projects, as GitHub reported them on OSS_AS_OF. */
export function OpenSource() {
  return (
    <section className="oss" id="open-source" aria-labelledby="oss-h2">
      <div className="wrap">
        <div className="section-head">
          <h2 className="h2" id="oss-h2">Open source</h2>
          <p className="section-sub">
            {intro()} <span className="oss-asof">Status as of {asOf}.</span>
          </p>
        </div>
        <ul className="oss-list" aria-label={`${plural(ossStats.projects, "project", "projects")}, ${plural(ossStats.prs, "pull request", "pull requests")}`}>
          {contributions.map((c) => (
            <li className="oss-card" key={c.repo}>
              <div className="oss-top">
                <h3 className="oss-name">
                  <a href={c.homepage} target="_blank" rel="noopener noreferrer">{c.project}<span className="sr-only"> (opens in a new tab)</span></a>
                </h3>
                <p className="oss-meta">
                  <a className="oss-repo" href={c.url} target="_blank" rel="noopener noreferrer">{c.repo}<span className="sr-only"> on GitHub (opens in a new tab)</span></a>
                  <span className="oss-stars"><span aria-hidden="true">★ </span>{c.stars}<span className="sr-only"> stars</span></span>
                </p>
              </div>
              <p className="oss-about">{c.about}</p>
              <ul className="oss-prs">
                {c.prs.map((p) => (
                  <li className="oss-pr" key={p.number}>
                    <span className="oss-num">#{p.number}</span>
                    <a className="oss-title" href={p.url} target="_blank" rel="noopener noreferrer">{p.title}<span className="sr-only"> (pull request, opens in a new tab)</span></a>
                    <span className={`oss-pill oss-pill--${p.status}`}>{statusLabel(p.status)}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

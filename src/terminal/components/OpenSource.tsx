import { fallbackRepos } from "../data/tech";
import { contributions, ossStats, statusLabel, OSS_AS_OF } from "../../classic/data/opensource";
import { Reveal } from "../hooks/useReveal";
import { TypeCmd } from "./TypeCmd";

export function OpenSource() {
  const list = fallbackRepos;
  const line = "static mirror · github.com/vardhan23v";

  return (
    <section className="section" id="opensource" aria-labelledby="os-title">
      <div className="container">
        <div className="shell">
          <Reveal>
            <div className="shell-head">
              <TypeCmd cmd="git remote -v" suffix={<span className="bracket"> # ./repos/</span>} />
              <h2 className="shell-title" id="os-title">
                OPEN_SOURCE <span className="dim">// all public</span>
              </h2>
            </div>
            <p className="shell-sub">
              <span className="chip">github.com/vardhan23v</span> — everything is public. consistent state.
            </p>
          </Reveal>

          <Reveal>
            <div className="term">
              <div className="term-bar" aria-hidden="true">
                <span className="term-dot r" />
                <span className="term-dot a" />
                <span className="term-dot g" />
                <span className="term-title">
                  <b>vardhan@folio</b>:~$ remote -v <span className="bracket">[{line}]</span>
                </span>
              </div>
              <div className="term-body">
                <div className="remote-list">
                  {list.map((r, i) => (
                    <a className="remote-item" key={r.name} href={r.url} target="_blank" rel="noopener noreferrer" data-spot style={{ "--i": i } as React.CSSProperties}>
                      <span className="remote-id">
                        <span className="remote-name">{r.name}</span>
                        <span className="remote-url">{r.url.replace("https://github.com/", "")}</span>
                      </span>
                      <span className="rl">{r.description ? r.description : "(no description)"}</span>
                      <span className={`remote-lang lang-${(r.language ?? "").toLowerCase()}`}>
                        <i aria-hidden="true" />
                        {r.language ?? "—"}
                      </span>
                      <span className="remote-go" aria-hidden="true">↗</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <div className="term oss-term">
              <div className="term-bar" aria-hidden="true">
                <span className="term-dot r" />
                <span className="term-dot a" />
                <span className="term-dot g" />
                <span className="term-title">
                  <b>vardhan@folio</b>:~$ git log --author=vardhan23v --all-repos{" "}
                  <span className="bracket">[upstream]</span>
                </span>
              </div>
              <div className="term-body">
                <h3 className="oss-head">
                  <span className="green">$</span> git log --author=vardhan23v --all-repos --oneline
                </h3>
                <p className="oss-sum">
                  # {ossStats.prs} pull requests to {ossStats.projects} upstream projects ·{" "}
                  <span className="oss-merged">{ossStats.merged} merged</span> ·{" "}
                  <span className="oss-open">{ossStats.open} in review</span>
                </p>
                {contributions.map((c, ci) => (
                  <div className="oss-proj" key={c.repo}>
                    <p className="oss-repo">
                      <span className="oss-star" aria-hidden="true">*</span>{" "}
                      <a href={c.url} target="_blank" rel="noopener noreferrer" className="oss-repo-link">
                        {c.project}
                        <span className="oss-slug">({c.repo})</span>
                      </a>{" "}
                      <span className="oss-stars">★ {c.stars}</span>
                    </p>
                    <p className="oss-about"># {c.about}</p>
                    <ul className="oss-prs" aria-label={`pull requests to ${c.project}`}>
                      {c.prs.map((pr, i) => (
                        <li key={pr.number} className="oss-pr-row" style={{ "--i": ci * 3 + i } as React.CSSProperties}>
                          <a className="oss-pr" href={pr.url} target="_blank" rel="noopener noreferrer" data-spot>
                            <span className="oss-num">#{pr.number}</span>
                            <span className="oss-title">{pr.title}</span>
                            <span className={`oss-status is-${pr.status}`}>[{statusLabel(pr.status)}]</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <p className="oss-foot"># statuses as of {OSS_AS_OF} · run <span className="green">contributions</span> in the shell for the same log</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
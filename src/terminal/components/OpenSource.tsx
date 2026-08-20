import { fallbackRepos } from "../data/tech";
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
                    <div className="remote-item" key={r.name} data-spot style={{ "--i": i } as React.CSSProperties}>
                      <span className="remote-name">{r.name}</span>
                      <span className="rl">
                        {r.description ? r.description : "(no description)"}
                      </span>
                      <span className="remote-lang">{r.language ?? "—"}</span>
                      <span className="remote-url">
                        <a href={r.url} target="_blank" rel="noopener noreferrer" className="tlink">
                          {r.url.replace("https://", "")}
                        </a>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
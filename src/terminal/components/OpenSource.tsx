import { useEffect, useState } from "react";
import { fallbackRepos } from "../data/tech";
import { Reveal } from "../hooks/useReveal";

const GITHUB_API = "https://api.github.com/users/vardhan23v/repos?sort=updated&per_page=8&type=public";

type Repo = { name: string; description: string; language: string | null; url: string };

type ApiRepo = { name: string; description: string; language: string | null; html_url: string };

export function OpenSource() {
  const [repos, setRepos] = useState<Repo[] | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch(GITHUB_API, { signal: ctrl.signal })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((d: ApiRepo[]) =>
        setRepos(
          d
            .filter((x) => x.name !== "vardhan-v-portfilo")
            .map(({ name, description, language, html_url }) => ({ name, description, language, url: html_url }))
        )
      )
      .catch(() => setErr(true));
    return () => ctrl.abort();
  }, []);

  const list = repos ?? fallbackRepos;
  const line = repos ? "live · api.github.com" : err ? "api unreachable · static mirror" : "fetching · api.github.com";

  return (
    <section className="section" id="opensource" aria-labelledby="os-title">
      <div className="container">
        <div className="shell">
          <Reveal>
            <div className="shell-head">
              <span className="cmdline">
                <span className="dollar">$</span> git remote -v <span className="bracket"># ./repos/</span>
              </span>
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
                  {list.map((r) => (
                    <div className="remote-item" key={r.name}>
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
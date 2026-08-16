import { useEffect, useState } from "react";
import { fallbackRepos } from "../data/tech";
import { Reveal } from "../hooks/useReveal";

const GITHUB_API = "https://api.github.com/users/vardhan23v/repos?sort=updated&per_page=8&type=public";

type Repo = { name: string; description: string; language: string | null; url: string };

type ApiRepo = { name: string; description: string; language: string | null; html_url: string };

const langColor: Record<string, string> = {
  JavaScript: "#fbbf24",
  TypeScript: "#38bdf8",
  Python: "#34d399",
  Shell: "#a3a3b8",
  HTML: "#f97316",
  CSS: "#818cf8",
};

const nameColors = [
  "linear-gradient(135deg, #a78bfa, #6366f1)",
  "linear-gradient(135deg, #22d3ee, #3b82f6)",
  "linear-gradient(135deg, #34d399, #0d9488)",
  "linear-gradient(135deg, #f472b6, #db2777)",
  "linear-gradient(135deg, #fbbf24, #f97316)",
  "linear-gradient(135deg, #818cf8, #d946ef)",
];

const initial = (name: string) => name.slice(0, 1).toUpperCase();

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
  const status = repos
    ? "Live from the GitHub API"
    : err
      ? "GitHub API unreachable — showing static mirror"
      : "Fetching from GitHub API…";

  return (
    <section className="section" id="opensource" aria-labelledby="os-title">
      <div className="container">
        <div className="sec-row">
          <Reveal>
            <div className="sec-head">
              <span className="eyebrow">
                <span className="dot" aria-hidden="true" />
                open source
              </span>
              <h2 className="sec-title" id="os-title">
                Everything is public
              </h2>
              <p className="sec-sub">
                Newest repositories first — pull requests welcome. <span style={{ color: "var(--text-3)" }}>{status}</span>
              </p>
            </div>
          </Reveal>
        </div>

        <div className="repo-grid">
          {list.map((r, i) => (
            <Reveal key={r.name}>
              <a className="repo-card" href={r.url} target="_blank" rel="noopener noreferrer">
                <div className="repo-top">
                  <span className="repo-name">
                    <span className="fi" style={{ background: nameColors[i % nameColors.length] }} aria-hidden="true">
                      {initial(r.name)}
                    </span>
                    {r.name}
                  </span>
                  <span className="tlink" style={{ fontSize: 13 }}>
                    open ↗
                  </span>
                </div>
                <p className="repo-desc">{r.description || "No description yet."}</p>
                <div className="repo-meta">
                  {r.language && (
                    <span className="lang">
                      <span
                        className="ld"
                        style={{
                          background: langColor[r.language] ?? "#a3a3b8",
                          color: langColor[r.language] ?? "#a3a3b8",
                        }}
                        aria-hidden="true"
                      />
                      {r.language}
                    </span>
                  )}
                  <span>public</span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
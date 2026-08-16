import { useEffect, useState } from "react";
import { site } from "../data/site";
import { fallbackRepos } from "../data/tech";
import { Reveal } from "../hooks/useReveal";
import "./OpenSource.css";

const colors: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Python: "#3572a5",
};

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h9M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface RepoRow {
  name: string;
  description: string;
  language: string;
  url: string;
}

export function OpenSource() {
  const [repos, setRepos] = useState<RepoRow[]>(fallbackRepos);

  useEffect(() => {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), 7000);
    (async () => {
      try {
        const res = await fetch(
          `https://api.github.com/users/${site.githubUser}/repos?sort=pushed&per_page=100`,
          { signal: ac.signal }
        );
        if (!res.ok) throw new Error("github api");
        const all = (await res.json()) as {
          name: string;
          description: string | null;
          language: string | null;
          fork: boolean;
          stargazers_count: number;
          html_url: string;
        }[];
        if (all.length === 0) throw new Error("empty");
        const top = all
          .filter((r) => !r.fork)
          .sort((a, b) => b.stargazers_count - a.stargazers_count || a.name.localeCompare(b.name))
          .slice(0, 6)
          .map((r) => ({
            name: r.name,
            description: r.description?.split("\n")[0] ?? "No description provided.",
            language: r.language ?? "Unknown",
            url: r.html_url,
          }));
        setRepos(top);
      } catch {
        /* fallback list stands */
      }
    })();
    return () => {
      clearTimeout(timer);
      ac.abort();
    };
  }, []);

  return (
    <section id="open-source">
      <div className="container">
        <Reveal>
          <header className="section-head">
            <span className="section-index">06 — Open source & experiments</span>
            <h2 className="section-title">Most projects start as experiments.</h2>
            <p className="section-sub">
              They evolve into working products. Every repository on my GitHub is public —
              including the ones still failing in interesting ways.
            </p>
          </header>
        </Reveal>

        <div className="oss-list">
          {repos.map((r) => (
            <a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer" className="oss-row">
              <div className="oss-name">
                <span className="oss-lang" style={{ "--lc": colors[r.language] ?? "#818cf8" } as React.CSSProperties} aria-hidden="true" />
                {r.name}
              </div>
              <div className="oss-desc">{r.description}</div>
              <div className="oss-meta">
                <span className="oss-lang-label">{r.language}</span>
                <span className="oss-ext" aria-hidden="true">
                  ↗
                </span>
              </div>
            </a>
          ))}
        </div>

        <Reveal>
          <p className="oss-more">
            <a href={site.github} target="_blank" rel="noopener noreferrer" className="link-arrow">
              Explore everything on GitHub <Arrow />
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
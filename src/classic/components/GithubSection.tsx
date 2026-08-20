import { useEffect, useRef, useState } from "react";
import { site } from "../data/site";
import { SectionHead } from "./SectionHead";
import { Reveal } from "../hooks/useReveal";
import { Icon } from "../lib/icons";
import "./GithubSection.css";

interface RepoItem {
  name: string;
  description: string;
  language: string;
  stars: number;
  url: string;
}

const fallbackRepos: RepoItem[] = [
  { name: "extension-AI", description: "Build Chrome Extensions with plain-English prompts. Gemini 2.0 Flash & Groq Llama 3.3.", language: "JavaScript", stars: 2, url: "https://github.com/vardhan23v/extension-AI" },
  { name: "codereviewer", description: "AI code review with structured feedback on bugs, quality, performance, and security.", language: "JavaScript", stars: 1, url: "https://github.com/vardhan23v/codereviewer" },
  { name: "Vard-AI", description: "Voice-first AI assistant with streaming (Groq), MCP tools, and Supabase auth.", language: "TypeScript", stars: 1, url: "https://github.com/vardhan23v/Vard-AI" },
  { name: "Disastermind-ai", description: "Multi-agent AI emergency response platform with live tactical visualization.", language: "TypeScript", stars: 0, url: "https://github.com/vardhan23v/Disastermind-ai" },
  { name: "campus-compass", description: "Full-stack college discovery and comparison platform. Next.js 16 + PostgreSQL.", language: "TypeScript", stars: 0, url: "https://github.com/vardhan23v/campus-compass" },
  { name: "career-forge-pro", description: "AI-powered resume builder and career toolkit with Gemini.", language: "JavaScript", stars: 0, url: "https://github.com/vardhan23v/career-forge-pro" },
];

const languageColors: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Python: "#3572A5",
};

const PER_PAGE = 100;

export function GithubSection() {
  const [repos, setRepos] = useState<RepoItem[]>(fallbackRepos);
  const [repoCount, setRepoCount] = useState(32);
  const [followers, setFollowers] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [run, setRun] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const followersNum = Number((followers ?? "30").replace(/[^0-9]/g, ""));

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setRun(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const totalStars = repos.reduce((sum, r) => sum + r.stars, 0);

  const [display, setDisplay] = useState({ repos: 0, stars: 0, followers: 0 });

  useEffect(() => {
    if (!run) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay({ repos: repoCount, stars: totalStars, followers: followersNum });
      return;
    }
    const targets = { repos: repoCount, stars: totalStars, followers: followersNum };
    const t0 = performance.now();
    const dur = 1200;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setDisplay({
        repos: Math.round(e * targets.repos),
        stars: Math.round(e * targets.stars),
        followers: Math.round(e * targets.followers),
      });
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, repoCount, totalStars, followersNum]);

  useEffect(() => {
    const ac = new AbortController();
    const timeout = window.setTimeout(() => ac.abort(), 8000);

    (async () => {
      try {
        const [userRes, repoRes] = await Promise.all([
          fetch(`https://api.github.com/users/${site.githubUser}`, { signal: ac.signal }),
          fetch(`https://api.github.com/users/${site.githubUser}/repos?sort=pushed&per_page=${PER_PAGE}`, {
            signal: ac.signal,
          }),
        ]);
        if (!userRes.ok || !repoRes.ok) throw new Error("github api failed");

        const user = (await userRes.json()) as { public_repos: number; followers: number };
        const all = (await repoRes.json()) as {
          name: string;
          description: string | null;
          language: string | null;
          stargazers_count: number;
          fork: boolean;
          html_url: string;
        }[];

        if (all.length === 0) throw new Error("no repos");

        setRepoCount(user.public_repos);
        setFollowers(user.followers.toLocaleString("en-IN"));
        const top = all
          .filter((r) => !r.fork)
          .slice()
          .sort((a, b) => b.stargazers_count - a.stargazers_count || a.name.localeCompare(b.name))
          .slice(0, 6)
          .map((r) => ({
            name: r.name,
            description: r.description ?? "No description provided.",
            language: r.language ?? "Unknown",
            stars: r.stargazers_count,
            url: r.html_url,
          }));
        setRepos(top);
      } catch {
        setFailed(true);
      }
    })();

    return () => {
      window.clearTimeout(timeout);
      ac.abort();
    };
  }, []);

  return (
    <section id="github">
      <div className="container">
        <SectionHead
          eyebrow="Building in Public"
          title={<>Learning by <span className="grad-text">shipping</span></>}
          sub="Most of my learning happens by building. Explore my projects, experiments, and work with AI-powered development."
        />

        <Reveal>
          <div className="gh-card card">
            <div className="gh-stats" ref={statsRef}>
              <div className="gh-stat">
                <Icon.folder width={20} height={20} />
                <strong>{display.repos}</strong>
                <span>repositories</span>
              </div>
              <div className="gh-stat">
                <Icon.star width={20} height={20} />
                <strong>{display.stars}</strong>
                <span>stars earned</span>
              </div>
              <div className="gh-stat">
                <Icon.user width={20} height={20} />
                <strong>{display.followers.toLocaleString("en-IN")}</strong>
                <span>followers</span>
              </div>
              <div className="gh-stat gh-stat-link">
                <Icon.github width={20} height={20} />
                <a href={site.github} target="_blank" rel="noopener noreferrer">
                  vardhan23v <Icon.external width={14} height={14} />
                </a>
              </div>
            </div>

            {failed && (
              <p className="gh-live-note">
                Live GitHub stats unavailable right now — showing the latest snapshot.{" "}
                <a href={site.github} target="_blank" rel="noopener noreferrer">
                  Check GitHub
                </a>{" "}
                for current activity.
              </p>
            )}

            <div className="gh-repos">
              {repos.map((r, i) => (
                <a
                  key={r.name}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gh-repo"
                  style={{ transitionDelay: `${i * 45}ms` }}
                >
                  <div className="gh-repo-top">
                    <span className="gh-repo-name">
                      <Icon.folder width={15} height={15} />
                      {r.name}
                    </span>
                    <span className="gh-repo-star">
                      <Icon.star width={13} height={13} />
                      {r.stars}
                    </span>
                  </div>
                  <p className="gh-repo-desc">{r.description}</p>
                  <span
                    className="gh-repo-lang"
                    style={
                      { "--lc": languageColors[r.language] ?? "#8b5cf6" } as React.CSSProperties
                    }
                  >
                    {r.language}
                  </span>
                </a>
              ))}
            </div>

            <div className="gh-cta">
              <a href={site.github} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                <Icon.github width={17} height={17} /> Explore all repositories
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
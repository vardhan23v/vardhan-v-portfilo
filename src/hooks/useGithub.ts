import { useEffect, useState } from "react";
import { site } from "../classic/data/site";

export interface GithubStats {
  followers: number;
  repos: number;
  loading: boolean;
}

const FALLBACK: GithubStats = { followers: 30, repos: 39, loading: false };
const CACHE_KEY = "mac-github-stats";
const CACHE_TTL = 1000 * 60 * 30; // 30 min, per-session-ish

interface CacheEntry {
  at: number;
  followers: number;
  repos: number;
}

/**
 * Live GitHub stats with session caching + static fallback.
 * Never throws, never blocks — falls back to 30 followers / 39 repos.
 */
export function useGithub(): GithubStats {
  const [stats, setStats] = useState<GithubStats>({ ...FALLBACK, loading: true });

  useEffect(() => {
    let cancelled = false;
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (raw) {
        const c = JSON.parse(raw) as CacheEntry;
        if (Date.now() - c.at < CACHE_TTL) {
          setStats({ followers: c.followers, repos: c.repos, loading: false });
          return;
        }
      }
    } catch {
      /* storage unavailable */
    }

    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 6000);
    fetch(`https://api.github.com/users/${site.githubUser}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        clearTimeout(t);
        if (cancelled || !j) {
          if (!cancelled) setStats({ ...FALLBACK });
          return;
        }
        const next = {
          followers: typeof j.followers === "number" ? j.followers : FALLBACK.followers,
          repos: typeof j.public_repos === "number" ? j.public_repos : FALLBACK.repos,
        };
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), ...next }));
        } catch {
          /* ignore */
        }
        setStats({ ...next, loading: false });
      })
      .catch(() => {
        clearTimeout(t);
        if (!cancelled) setStats({ ...FALLBACK });
      });
    return () => {
      cancelled = true;
      clearTimeout(t);
      ctrl.abort();
    };
  }, []);

  return stats;
}

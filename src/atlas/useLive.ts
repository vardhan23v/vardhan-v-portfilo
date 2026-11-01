import { useEffect, useState } from "react";
import { site } from "../classic/data/site";
import { featuredProjects } from "../classic/data/projects";
import { cachedJson } from "./cachedFetch";

export interface Repo { name: string; description: string | null; language: string | null; stars: number; pushed: string; url: string; homepage: string | null }
type Live<T> = { status: "loading" } | { status: "ok"; data: T } | { status: "failed" };

interface ApiRepo { name: string; description: string | null; language: string | null; stargazers_count: number; pushed_at: string; html_url: string; homepage: string | null; fork: boolean; archived: boolean }

/** Repos already drawn as summits, and the portfolio itself, are left out of the field survey. */
const SHOWN = new Set([...featuredProjects.map((p) => p.github.toLowerCase()), `https://github.com/${site.githubUser}/vardhan-v-portfilo`]);

/** The most recently pushed public repos that are not forks or summits. */
export function useRepos(limit = 9): Live<Repo[]> {
  const [state, setState] = useState<Live<Repo[]>>({ status: "loading" });
  useEffect(() => {
    let live = true;
    cachedJson<ApiRepo[]>("atlas-repos", `https://api.github.com/users/${site.githubUser}/repos?sort=pushed&per_page=40`).then((list) => {
      if (!live) return;
      const repos = Array.isArray(list)
        ? list
            .filter((r) => !r.fork && !r.archived && !SHOWN.has(r.html_url.toLowerCase()) && r.name.toLowerCase() !== site.githubUser.toLowerCase())
            .slice(0, limit)
            .map((r) => ({ name: r.name, description: r.description, language: r.language, stars: r.stargazers_count, pushed: r.pushed_at, url: r.html_url, homepage: r.homepage || null }))
        : null;
      setState(repos?.length ? { status: "ok", data: repos } : { status: "failed" });
    });
    return () => {
      live = false;
    };
  }, [limit]);
  return state;
}

export interface Day { date: string; count: number }
export interface Activity { total: number; days: Day[]; weeks: { start: string; count: number }[]; active: number; longest: number; busiest: { start: string; count: number } }

/** Turns the daily calendar into the figures the elevation sheet shows; all computed, none stored. */
export function summarise(total: number, days: Day[]): Activity {
  const weeks: { start: string; count: number }[] = [];
  days.forEach((d, i) => {
    if (i % 7 === 0) weeks.push({ start: d.date, count: 0 });
    weeks[weeks.length - 1].count += d.count;
  });
  let run = 0, longest = 0, active = 0;
  for (const d of days) {
    if (d.count > 0) { active++; run++; longest = Math.max(longest, run); } else run = 0;
  }
  const busiest = weeks.reduce((a, w) => (w.count > a.count ? w : a), weeks[0] ?? { start: "", count: 0 });
  return { total, days, weeks, active, longest, busiest };
}

/** Last year's contribution calendar from the public github-contributions-api service. */
export function useContributions(): Live<Activity> {
  const [state, setState] = useState<Live<Activity>>({ status: "loading" });
  useEffect(() => {
    let live = true;
    cachedJson<{ total?: { lastYear?: number }; contributions?: Day[] }>("atlas-contrib", `https://github-contributions-api.jogruber.de/v4/${site.githubUser}?y=last`).then((j) => {
      if (!live) return;
      const days = j?.contributions?.filter((d) => typeof d.count === "number" && typeof d.date === "string");
      setState(days?.length ? { status: "ok", data: summarise(j?.total?.lastYear ?? days.reduce((a, d) => a + d.count, 0), days) } : { status: "failed" });
    });
    return () => {
      live = false;
    };
  }, []);
  return state;
}

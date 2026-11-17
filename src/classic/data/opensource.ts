/**
 * Pull requests to other people's open-source projects. Statuses are as GitHub reported them on
 * OSS_AS_OF; refresh with `npm run oss` (scripts/oss-refresh.mjs). Closed-unmerged PRs are left out.
 */
export type PrStatus = "merged" | "open";

export interface ContributionPr {
  number: number;
  title: string;
  url: string;
  status: PrStatus;
  /** Opened (YYYY-MM-DD). */
  opened: string;
  /** Merged (YYYY-MM-DD), when merged. */
  merged?: string;
}

export interface Contribution {
  project: string;
  repo: string;
  url: string;
  homepage: string;
  /** Rounded star count shown as context, e.g. "372k". */
  stars: string;
  about: string;
  prs: ContributionPr[];
}

export const OSS_AS_OF = "2026-11-18";

export const contributions: Contribution[] = [
  {
    project: "roadmap.sh",
    repo: "nilbuild/developer-roadmap",
    url: "https://github.com/nilbuild/developer-roadmap",
    homepage: "https://roadmap.sh",
    stars: "372k",
    about: "Interactive developer roadmaps and guides. Contributed to the API Design roadmap.",
    prs: [
      { number: 10437, title: "Improve Error Handling / Retries topic in API Design roadmap", url: "https://github.com/nilbuild/developer-roadmap/pull/10437", status: "merged", opened: "2026-10-12", merged: "2026-10-13" },
      { number: 10438, title: "Explain idempotency keys in API Design Idempotency topic", url: "https://github.com/nilbuild/developer-roadmap/pull/10438", status: "merged", opened: "2026-10-12", merged: "2026-10-13" },
      { number: 10439, title: "Add webhook reliability to API Design Webhooks vs Polling topic", url: "https://github.com/nilbuild/developer-roadmap/pull/10439", status: "merged", opened: "2026-10-12", merged: "2026-10-13" },
    ],
  },
  {
    project: "Cline",
    repo: "cline/cline",
    url: "https://github.com/cline/cline",
    homepage: "https://cline.bot",
    stars: "72k",
    about: "Autonomous coding agent as an SDK, IDE extension or CLI. Bug fixes in core and desktop.",
    prs: [
      { number: 15175, title: "fix(core): time out unanswered hook capability requests", url: "https://github.com/cline/cline/pull/15175", status: "open", opened: "2026-10-18" },
      { number: 15176, title: "fix(core): preserve context limits from model source catalogs", url: "https://github.com/cline/cline/pull/15176", status: "open", opened: "2026-10-18" },
      { number: 15177, title: "fix(desktop): persist the sidebar session sort mode", url: "https://github.com/cline/cline/pull/15177", status: "open", opened: "2026-10-18" },
    ],
  },
];

const allPrs = contributions.flatMap((c) => c.prs);
export const ossStats = {
  projects: contributions.length,
  prs: allPrs.length,
  merged: allPrs.filter((p) => p.status === "merged").length,
  open: allPrs.filter((p) => p.status === "open").length,
};

/** "merged" / "in review" — never claims more than GitHub does. */
export const statusLabel = (s: PrStatus) => (s === "merged" ? "merged" : "in review");

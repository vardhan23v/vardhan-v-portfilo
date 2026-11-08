import { describe, expect, it, vi } from "vitest";
import { GitHubClient, buildGitHubDocuments, isExcludedPath, scrubSecrets, selectFiles } from "../api/_lib/ingest/github";

describe("GitHub file selection", () => {
  it.each([
    "node_modules/react/index.js", "dist/app.js", "build/main.js", "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
    ".env", ".env.local", "config/secrets.json", "public/logo.png", "assets/font.woff2", "app.min.js", "src/generated/types.ts", "server.pem",
  ])("excludes %s", (p) => expect(isExcludedPath(p)).toBe(true));

  it("prefers README/docs, manifests and entry-point source, skipping tests and big files", () => {
    const tree = [
      { path: "README.md", type: "blob" as const, sha: "1", size: 900 },
      { path: "docs/architecture.md", type: "blob" as const, sha: "2", size: 900 },
      { path: "package.json", type: "blob" as const, sha: "3", size: 300 },
      { path: "src/server.ts", type: "blob" as const, sha: "4", size: 2000 },
      { path: "src/util.test.ts", type: "blob" as const, sha: "5", size: 2000 },
      { path: "src/huge.ts", type: "blob" as const, sha: "6", size: 900_000 },
      { path: "node_modules/x/index.js", type: "blob" as const, sha: "7", size: 10 },
    ];
    const picked = selectFiles(tree).map((f) => f.path);
    expect(picked).toEqual(["README.md", "docs/architecture.md", "package.json", "src/server.ts"]);
  });

  it("scrubs credentials from file contents", () => {
    const out = scrubSecrets(`const key = "gsk_abcdefghijklmnopqrst";\nAPI_KEY=supersecretvalue123\n`);
    expect(out).not.toContain("gsk_abc");
    expect(out).not.toContain("supersecretvalue123");
  });
});

function repo(name: string, extra: Record<string, unknown> = {}) {
  return { name, full_name: `vardhan23v/${name}`, html_url: `https://github.com/vardhan23v/${name}`, description: `${name} desc`, homepage: null, topics: ["ai"], language: "TypeScript", fork: false, archived: false, private: false, default_branch: "main", pushed_at: "2026-10-01T00:00:00Z", stargazers_count: 1, ...extra };
}

describe("GitHub sync", () => {
  it("paginates, skips forks, and is incremental by tree SHA", async () => {
    const page1 = Array.from({ length: 100 }, (_, i) => repo(`r${i}`, { fork: i > 0 }));
    const page2 = [repo("last")];
    const calls: string[] = [];
    const fetchImpl = vi.fn(async (url: string) => {
      calls.push(url);
      const u = new URL(url);
      if (u.pathname.endsWith("/repos") && u.searchParams.get("page") === "1") return Response.json(page1);
      if (u.pathname.endsWith("/repos")) return Response.json(page2);
      if (u.pathname.endsWith("/languages")) return Response.json({ TypeScript: 900, CSS: 100 });
      if (u.pathname.includes("/git/trees/")) return Response.json({ sha: `tree-${u.pathname.split("/")[3]}`, tree: [{ path: "README.md", type: "blob", sha: "b1", size: 50 }] });
      if (u.pathname.includes("/contents/")) return new Response("# Readme\nHello world");
      return new Response("nope", { status: 404 });
    });
    const client = new GitHubClient({ fetchImpl: fetchImpl as unknown as typeof fetch });
    const first = await buildGitHubDocuments(client, "vardhan23v", new Map());
    expect(first.repos).toBe(2);
    expect(first.docs.map((d) => d.sourceId).sort()).toEqual(["github:last:README.md", "github:last:overview", "github:r0:README.md", "github:r0:overview"]);
    const overview = first.docs.find((d) => d.sourceId === "github:r0:overview")!;
    expect(overview.content).toContain("TypeScript 90%");
    expect(overview.sourceUrl).toBe("https://github.com/vardhan23v/r0");

    const again = await buildGitHubDocuments(client, "vardhan23v", new Map([["github:r0:overview", "tree-r0"], ["github:last:overview", "tree-last"]]));
    expect(again.docs).toEqual([]);
    expect(again.skipped.sort()).toEqual(["last", "r0"]);
  });

  it("waits out a short rate-limit reset and fails fast on a long one", async () => {
    let n = 0;
    const short = vi.fn(async () => (n++ === 0
      ? new Response("", { status: 403, headers: { "x-ratelimit-remaining": "0", "x-ratelimit-reset": String(Math.floor(Date.now() / 1000)) } })
      : Response.json([])));
    await expect(new GitHubClient({ fetchImpl: short as unknown as typeof fetch }).listPublicRepos("u")).resolves.toEqual([]);
    const long = vi.fn(async () => new Response("", { status: 403, headers: { "x-ratelimit-remaining": "0", "x-ratelimit-reset": String(Math.floor(Date.now() / 1000) + 3600) } }));
    await expect(new GitHubClient({ fetchImpl: long as unknown as typeof fetch }).listPublicRepos("u")).rejects.toMatchObject({ code: "github_rate_limited" });
  });
});

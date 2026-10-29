/**
 * Smoke test: build output must boot on every route without a page error,
 * without console errors, and with the right <title>.
 *
 *   npm run build && npm run smoke
 *
 * Starts `vite preview` on :4173 itself and kills it on exit.
 */
import { spawn } from "node:child_process";
import { launch } from "./lib/browser.mjs";

const PORT = 4173;
const BASE = `http://localhost:${PORT}`;

/** route → substring (or regexp) the document title must contain. */
const ROUTES = [
  ["/", "Sree Vardhan V |"],
  ["/terminal", "Terminal —"],
  ["/classic", "Classic —"],
  ["/paper", "Paper —"],
  ["/aurora", "Aurora —"],
  ["/forge", "Forge —"],
  ["/mac?noboot=1", "macOS —"],
  // Title is either the Terminal edition's or (after the SEO pass) "<name> — case study | …".
  ["/terminal/work/extension-ai", /Extension AI/],
  ["/nope", "Not found —"],
];

/* Noise we do not treat as failures: third-party/analytics beacons and the GitHub API being rate-limited. */
const IGNORED_CONSOLE = [/api\.github\.com/, /vercel-insights|va\.vercel-scripts|speed-insights/, /favicon/, /net::ERR_/];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForServer(url, timeoutMs = 30000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    try {
      const r = await fetch(url);
      if (r.ok) return;
    } catch {
      /* not up yet */
    }
    await sleep(200);
  }
  throw new Error(`preview server did not start on ${url}`);
}

const preview = spawn("npx", ["vite", "preview", "--port", String(PORT), "--strictPort"], {
  stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env, FORCE_COLOR: "0" },
});
let previewLog = "";
preview.stdout.on("data", (d) => (previewLog += d));
preview.stderr.on("data", (d) => (previewLog += d));
const stopPreview = () => {
  if (!preview.killed) preview.kill("SIGTERM");
};
process.on("exit", stopPreview);
process.on("SIGINT", () => process.exit(130));

let browser;
let failures = 0;
const rows = [];

try {
  await waitForServer(BASE + "/");
  browser = await launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  for (const [route, expectTitle] of ROUTES) {
    const pageErrors = [];
    const consoleErrors = [];
    const onPageError = (e) => pageErrors.push(String(e?.message ?? e));
    const onConsole = (m) => {
      if (m.type() !== "error") return;
      const text = m.text();
      if (IGNORED_CONSOLE.some((re) => re.test(text))) return;
      consoleErrors.push(text);
    };
    page.on("pageerror", onPageError);
    page.on("console", onConsole);

    let title = "";
    let navError = "";
    try {
      await page.goto(BASE + route, { waitUntil: "networkidle0", timeout: 30000 });
      // Let lazy chunks + RouteSeo settle.
      await page.waitForFunction(() => !!document.querySelector("#root")?.childElementCount, { timeout: 10000 }).catch(() => {});
      await sleep(400);
      title = await page.title();
    } catch (e) {
      navError = String(e?.message ?? e);
    }
    page.off("pageerror", onPageError);
    page.off("console", onConsole);

    const titleOk = expectTitle instanceof RegExp ? expectTitle.test(title) : title.includes(expectTitle);
    const ok = !navError && titleOk && pageErrors.length === 0 && consoleErrors.length === 0;
    if (!ok) failures++;
    rows.push({
      route,
      status: ok ? "ok" : "FAIL",
      title: title.slice(0, 60),
      pageErrors: pageErrors.length,
      consoleErrors: consoleErrors.length,
      detail: navError || (!titleOk ? `expected title to match ${expectTitle}` : "") || pageErrors[0] || consoleErrors[0] || "",
    });
  }
} catch (e) {
  failures++;
  rows.push({ route: "(setup)", status: "FAIL", title: "", pageErrors: 0, consoleErrors: 0, detail: String(e?.message ?? e) });
  if (previewLog) console.error(previewLog.trim());
} finally {
  await browser?.close().catch(() => {});
  stopPreview();
}

console.table(rows);
console.log(failures === 0 ? `\nSMOKE PASS (${rows.length} routes)` : `\nSMOKE: ${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);

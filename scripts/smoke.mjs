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
  ["/atlas", "Atlas —"],
  // Title is either the Terminal edition's or (after the SEO pass) "<name> — case study | …".
  ["/terminal/work/extension-ai", /Extension AI/],
  ["/work/extension-ai", "Extension AI — case study"],
  ["/work/nope", "Not found —"],
  ["/nope", "Not found —"],
];

/* Noise we do not treat as failures: third-party/analytics beacons and the GitHub API being rate-limited. */
const IGNORED_CONSOLE = [/api\.github\.com/, /vercel-insights|va\.vercel-scripts|speed-insights|\/_vercel\//, /favicon/, /net::ERR_/, /\/api\/chat/];

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
      // Resource errors carry the URL in location(), not in the text (e.g. Vercel's /_vercel/insights script, absent off-Vercel).
      const url = m.location()?.url ?? "";
      if (IGNORED_CONSOLE.some((re) => re.test(text) || re.test(url))) return;
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

    // The global assistant launcher must be present on every route.
    const hasLauncher = !navError && (await page.$(".pa-launcher").catch(() => null)) !== null;
    if (!hasLauncher && !navError) navError = "assistant launcher missing";
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

  /* ---- Assistant UI: open, keyboard, error state (no /api under vite preview), mobile sheet ---- */
  const check = (name, ok, detail = "") => {
    if (!ok) failures++;
    rows.push({ route: `assistant: ${name}`, status: ok ? "ok" : "FAIL", title: "", pageErrors: 0, consoleErrors: 0, detail });
  };
  const ai = await browser.newPage();
  const aiErrors = [];
  ai.on("pageerror", (e) => aiErrors.push(String(e?.message ?? e)));
  const SCENARIOS = [
    ["desktop", { width: 1280, height: 800 }, "/classic"],
    ["mobile", { width: 375, height: 812, isMobile: true, hasTouch: true }, "/paper"],
    ["mac", { width: 1280, height: 800 }, "/mac?noboot=1"],
  ];
  for (const [label, vp, route] of SCENARIOS) {
    await ai.setViewport(vp);
    await ai.goto(BASE + route, { waitUntil: "networkidle0", timeout: 30000 });
    await ai.waitForSelector(".pa-launcher", { timeout: 10000 });
    await ai.click(".pa-launcher");
    await ai.waitForSelector(".pa-panel", { timeout: 5000 });
    // Measure the panel at rest, not partway through its entrance.
    await ai.waitForFunction(() => document.querySelector(".pa-panel")?.getAnimations().every((a) => a.playState === "finished"), { timeout: 3000 });
    const focused = await ai.evaluate(() => document.activeElement?.id);
    check(`${label} opens with input focused`, focused === "pa-input-field", `focus=${focused}`);
    const box = await ai.$eval(".pa-panel", (el) => {
      const r = el.getBoundingClientRect();
      return { l: r.left, r: r.right, t: r.top, b: r.bottom, w: innerWidth, h: innerHeight };
    });
    const inside = box.l >= 0 && box.r <= box.w + 0.5 && box.t >= 0 && box.b <= box.h + 0.5;
    check(`${label} panel fits viewport`, inside, JSON.stringify(box));
    if (label === "mobile") check("mobile panel is a full-width sheet", Math.abs(box.r - box.l - box.w) < 1, `${box.r - box.l} vs ${box.w}`);
    if (label === "desktop") {
      await ai.click(".pa-suggest button");
      await ai.waitForSelector(".pa-error p", { timeout: 10000 }).catch(() => {});
      const err = await ai.$eval(".pa-error p", (el) => el.textContent).catch(() => "");
      check("error state + retry when backend is absent", Boolean(err) && (await ai.$(".pa-error button")) !== null, err);
      await ai.click('button[aria-label="Clear conversation"]');
      check("clear conversation", (await ai.$$(".pa-msg")).length === 0);
      await ai.focus("#pa-input-field");
      const before = await ai.evaluate(() => location.pathname);
      await ai.keyboard.type("1 what is his stack");
      await ai.keyboard.press("Enter");
      await sleep(300);
      check("digits typed in the panel don't trigger edition shortcuts", (await ai.evaluate(() => location.pathname)) === before);
      check("Enter sends a message", (await ai.$$(".pa-msg--me")).length === 1);
      await ai.focus("#pa-input-field");
      await ai.keyboard.press("Escape");
      await ai.waitForSelector(".pa-panel", { hidden: true, timeout: 1000 }).catch(() => {});
      // "Ask AI" on a project card opens the panel and asks about that project.
      await ai.$eval("[data-ask-ai]", (el) => el.click());
      await ai.waitForSelector(".pa-panel:not(.is-closing)", { timeout: 3000 }).catch(() => {});
      const askedQ = await ai.$$eval(".pa-msg--me", (els) => els.at(-1)?.textContent ?? "");
      check("Ask AI on a project opens the panel with a question", askedQ.startsWith("Tell me about "), askedQ);
      await ai.focus("#pa-input-field");
    }
    await ai.keyboard.press("Escape");
    // The panel stays mounted for its exit animation; 1s also catches a close that never finishes.
    const closed = await ai.waitForSelector(".pa-panel", { hidden: true, timeout: 1000 }).then(() => true, () => false);
    const back = await ai.evaluate(() => document.activeElement?.classList.contains("pa-launcher"));
    check(`${label} Escape closes and returns focus`, closed && back, `closed=${closed} focus=${back}`);
  }
  check("no page errors during assistant checks", aiErrors.length === 0, aiErrors[0] ?? "");
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

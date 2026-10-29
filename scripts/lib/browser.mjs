/**
 * One place to launch a browser for every QA script.
 *
 * Order of preference:
 *   1. `PUPPETEER_EXECUTABLE_PATH` (explicit override, e.g. Brave or system Chrome)
 *   2. Puppeteer's bundled Chrome (`npx puppeteer browsers install chrome` if missing)
 *   3. A local Brave / Google Chrome / Chromium install (macOS paths)
 */
import { existsSync } from "node:fs";
import puppeteer from "puppeteer";

const LOCAL_BROWSERS = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
];

export async function resolveExecutable() {
  const env = process.env.PUPPETEER_EXECUTABLE_PATH;
  if (env) {
    if (!existsSync(env)) throw new Error(`PUPPETEER_EXECUTABLE_PATH not found: ${env}`);
    return env;
  }
  try {
    // Sync in older Puppeteer, a Promise since v25 — await handles both.
    const bundled = await puppeteer.executablePath();
    if (typeof bundled === "string" && bundled && existsSync(bundled)) return bundled;
  } catch {
    /* no bundled browser */
  }
  const local = LOCAL_BROWSERS.find((p) => existsSync(p));
  if (local) return local;
  throw new Error(
    "No browser found. Run `npx puppeteer browsers install chrome` or set PUPPETEER_EXECUTABLE_PATH."
  );
}

/** `puppeteer.launch()` with sensible headless defaults; `opts` are merged over them (args are concatenated). */
export async function launch(opts = {}) {
  const { args = [], ...rest } = opts;
  return puppeteer.launch({
    executablePath: await resolveExecutable(),
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage", ...args],
    ...rest,
  });
}

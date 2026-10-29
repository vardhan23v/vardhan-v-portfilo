#!/usr/bin/env node
/**
 * Capture real interface screenshots of every featured project's live deployment.
 *
 *   node scripts/capture-shots.mjs            # all featured projects with a `live` URL
 *   node scripts/capture-shots.mjs vard-ai    # only the given slug(s)
 *
 * Writes JPEGs (≤ 400 kB each) to public/shots/<slug>/{desktop,desktop-2,phone}.jpg
 * and an index at public/shots/index.json. Never logs in, never types, dismisses nothing.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { launch } from "./lib/browser.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "shots");
const DATA = join(ROOT, "src", "classic", "data", "projects.ts");

const NAV_TIMEOUT = 25_000;
const SETTLE_MS = 2_500;
const MAX_BYTES = 400 * 1024;
const QUALITY = 82;
const MAX_WIDTH = 1440;

const DESKTOP = { width: 1440, height: 900, deviceScaleFactor: 1 };
const PHONE = { width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true };
const PHONE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

/** Pull `{ slug, live }` for each entry of `featuredProjects` without compiling TS. */
async function readFeatured() {
  const src = await readFile(DATA, "utf8");
  const start = src.indexOf("export const featuredProjects");
  const end = src.indexOf("export interface MiniProject", start);
  const block = src.slice(start, end);
  const out = [];
  for (const entry of block.split(/\n  \{\n/).slice(1)) {
    const slug = entry.match(/^\s*slug:\s*"([^"]+)"/m)?.[1];
    const live = entry.match(/^\s*live:\s*"([^"]+)"/m)?.[1];
    if (slug) out.push({ slug, live });
  }
  return out;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function settle(page) {
  try {
    await page.waitForNetworkIdle({ idleTime: 500, timeout: 10_000 });
  } catch {
    /* still loading something — go on after the fixed wait */
  }
  await sleep(SETTLE_MS);
}

/** Screenshot with the requested quality, stepping it down until the JPEG fits under MAX_BYTES. */
async function shoot(page, file) {
  let quality = QUALITY;
  let buf;
  for (;;) {
    buf = await page.screenshot({ type: "jpeg", quality, fullPage: false });
    if (buf.length <= MAX_BYTES || quality <= 40) break;
    quality -= 10;
  }
  await writeFile(file, buf);
  return { bytes: buf.length, quality };
}

async function withTimeout(promise, ms, label) {
  let t;
  const timeout = new Promise((_, rej) => {
    t = setTimeout(() => rej(new Error(`${label}: timed out after ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(t);
  }
}

async function captureProject(browser, { slug, live }) {
  const dir = join(OUT, slug);
  await mkdir(dir, { recursive: true });
  const result = { slug, live, title: null, files: [], errors: [] };

  // Desktop: landing + scrolled.
  {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(NAV_TIMEOUT);
    page.setDefaultTimeout(NAV_TIMEOUT);
    await page.setViewport(DESKTOP);
    try {
      await withTimeout(
        (async () => {
          const res = await page.goto(live, { waitUntil: "domcontentloaded" });
          if (res && res.status() >= 400) result.errors.push(`desktop: HTTP ${res.status()}`);
          await settle(page);
          result.title = await page.title().catch(() => null);
          result.finalUrl = page.url();
          const d = await shoot(page, join(dir, "desktop.jpg"));
          result.files.push({ name: "desktop.jpg", ...d });
          console.log(`  ✓ ${slug}/desktop.jpg (${d.bytes} B, q${d.quality}) title="${result.title}"`);

          await page.evaluate(() => window.scrollTo({ top: 900, behavior: "instant" }));
          await sleep(1_200);
          const scrolled = await page.evaluate(() => window.scrollY);
          if (scrolled > 100) {
            const d2 = await shoot(page, join(dir, "desktop-2.jpg"));
            result.files.push({ name: "desktop-2.jpg", ...d2 });
            console.log(`  ✓ ${slug}/desktop-2.jpg (${d2.bytes} B, q${d2.quality}) scrollY=${scrolled}`);
          } else {
            console.log(`  – ${slug}/desktop-2.jpg skipped: page does not scroll (scrollY=${scrolled})`);
          }
        })(),
        NAV_TIMEOUT + 20_000,
        `${slug} desktop`
      );
    } catch (e) {
      result.errors.push(`desktop: ${e.message}`);
      console.log(`  ✗ ${slug} desktop: ${e.message}`);
    } finally {
      await page.close().catch(() => {});
    }
  }

  // Phone.
  {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(NAV_TIMEOUT);
    page.setDefaultTimeout(NAV_TIMEOUT);
    await page.setUserAgent(PHONE_UA);
    await page.setViewport(PHONE);
    try {
      await withTimeout(
        (async () => {
          const res = await page.goto(live, { waitUntil: "domcontentloaded" });
          if (res && res.status() >= 400) result.errors.push(`phone: HTTP ${res.status()}`);
          await settle(page);
          const d = await shoot(page, join(dir, "phone.jpg"));
          result.files.push({ name: "phone.jpg", ...d });
          console.log(`  ✓ ${slug}/phone.jpg (${d.bytes} B, q${d.quality})`);
        })(),
        NAV_TIMEOUT + 15_000,
        `${slug} phone`
      );
    } catch (e) {
      result.errors.push(`phone: ${e.message}`);
      console.log(`  ✗ ${slug} phone: ${e.message}`);
    } finally {
      await page.close().catch(() => {});
    }
  }

  return result;
}

async function main() {
  const only = new Set(process.argv.slice(2));
  const projects = (await readFeatured()).filter((p) => p.live && (only.size === 0 || only.has(p.slug)));
  const skipped = (await readFeatured()).filter((p) => !p.live);
  for (const p of skipped) console.log(`– ${p.slug}: no live URL, skipped`);

  await mkdir(OUT, { recursive: true });
  const browser = await launch({ args: [`--window-size=${MAX_WIDTH},900`] });
  const index = {};
  try {
    for (const p of projects) {
      console.log(`\n${p.slug} → ${p.live}`);
      const r = await captureProject(browser, p);
      index[p.slug] = {
        live: r.live,
        finalUrl: r.finalUrl ?? null,
        title: r.title,
        files: r.files.map((f) => f.name),
        ...(r.errors.length ? { errors: r.errors } : {}),
      };
    }
  } finally {
    await browser.close();
  }

  // Merge into existing index so partial reruns (by slug) keep other entries.
  let existing = {};
  try {
    existing = JSON.parse(await readFile(join(OUT, "index.json"), "utf8"));
  } catch {
    /* first run */
  }
  const merged = { ...existing, ...index };
  await writeFile(join(OUT, "index.json"), JSON.stringify(merged, null, 2) + "\n");
  console.log(`\nWrote ${join(OUT, "index.json")} (${Object.keys(merged).length} projects)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

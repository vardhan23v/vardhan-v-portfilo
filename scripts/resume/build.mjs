/**
 * Renders scripts/resume/resume.html to public/resume/resume.pdf (one A4 page).
 *   node scripts/resume/build.mjs
 * Facts come from src/classic/data/*; edit resume.html when they change.
 */
import { fileURLToPath, pathToFileURL } from "node:url";
import { launch } from "../lib/browser.mjs";

const html = pathToFileURL(fileURLToPath(new URL("./resume.html", import.meta.url))).href;
const out = fileURLToPath(new URL("../../public/resume/resume.pdf", import.meta.url));
const browser = await launch();
try {
  const page = await browser.newPage();
  await page.goto(html, { waitUntil: "load" });
  await page.pdf({ path: out, format: "A4", printBackground: true, preferCSSPageSize: true });
  const pages = await page.evaluate(() => Math.ceil(document.documentElement.scrollHeight / (297 * 96 / 25.4 - 2 * 12 * 96 / 25.4)));
  console.log(`wrote ${out} (~${pages} page${pages > 1 ? "s" : ""})`);
} finally {
  await browser.close();
}

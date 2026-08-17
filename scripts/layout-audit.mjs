import puppeteer from "puppeteer-core";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const base = process.env.BASE || "http://localhost:4173";
const routes = ["/", "/terminal", "/classic", "/paper", "/aurora"];
const viewports = [
  [1440, 900],
  [390, 844],
];
let failures = 0;
const chk = (l, c) => {
  if (!c) {
    console.log("FAIL:", l);
    failures++;
  }
};

for (const [w, h] of viewports) {
  const profile = mkdtempSync(join(tmpdir(), "audit-"));
  const b = await puppeteer.launch({
    executablePath: "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    headless: true,
    args: ["--no-sandbox", `--user-data-dir=${profile}`],
  });
  const p = await b.newPage();
  await p.setViewport({ width: w, height: h });
  for (const route of routes) {
    await p.goto(base + route, { waitUntil: "networkidle0" });
    await sleep(2000);
    const audit = await p.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const issues = [];
      const seen = new Set();
      for (const el of document.querySelectorAll("a,button,span,h1,h2,h3,p,div,time,header,nav,footer,ul,li,input")) {
        if (seen.has(el)) continue;
        seen.add(el);
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        const s = getComputedStyle(el);
        if (s.position === "fixed") continue;
        const cls = el.className?.toString?.() || "";
        if (/au-blob|hero-neural|bg-grid|bg-glow/.test(cls)) continue;
        let clipped = false;
        let a = el.parentElement;
        while (a) {
          const os = getComputedStyle(a);
          if (os.overflowX === "hidden" || os.overflowX === "clip") { clipped = true; break; }
          a = a.parentElement;
        }
        if (clipped) continue;
        if (r.right > vw + 2) {
          const cls = el.className?.toString?.().slice(0, 40) || el.tagName;
          const txt = (el.textContent || "").slice(0, 30).replace(/\s+/g, " ");
          issues.push(`RIGHT-OFFSCREEN ${el.tagName}.${cls} right=${Math.round(r.right)} text="${txt}"`);
        }
        if (r.left < -2) {
          const cls = el.className?.toString?.().slice(0, 40) || el.tagName;
          issues.push(`LEFT-OFFSCREEN ${el.tagName}.${cls} left=${Math.round(r.left)}`);
        }
      }
      return { vw, issues };
    });
    for (const i of audit.issues) {
      chk(`${w}px ${route}: ${i}`, false);
    }
    // switcher present
    const hasSw = await p.evaluate(() => !!document.querySelector(".iswitcher"));
    chk(`${w}px ${route}: switcher present`, hasSw);
    // no horizontal scroll
    const hScroll = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    chk(`${w}px ${route}: no h-scroll (got +${hScroll})`, hScroll <= 0);
  }
  await b.close();
  rmSync(profile, { recursive: true, force: true });
}

console.log(failures === 0 ? "LAYOUT AUDIT PASS" : failures + " FAILURES");

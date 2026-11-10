import { launch } from "./lib/browser.mjs";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const profile = mkdtempSync(join(tmpdir(), "tilt-"));
const b = await launch({ args: [`--user-data-dir=${profile}`] });
const p = await b.newPage();
await p.setViewport({ width: 1440, height: 900 });
let f = 0;
const chk = (l, c) => {
  if (!c) {
    console.log("FAIL:", l);
    f++;
  }
};

await p.goto("http://localhost:4173/", { waitUntil: "networkidle0" });
await p.waitForSelector(".edition-card", { timeout: 10000 });
await p.evaluate(() => document.querySelector(".edition-card").scrollIntoView({ block: "center" }));
await sleep(1000);
const card = await p.evaluate(() => {
  const el = document.querySelector(".edition-card");
  const r = el.getBoundingClientRect();
  return { x: r.x, y: r.y, w: r.width, h: r.height };
});
// move to top-right corner of first card
await p.mouse.move(card.x + card.w - 12, card.y + 12);
await sleep(400);
const tilt = await p.evaluate(() => {
  const el = document.querySelector(".edition-card");
  return { rx: el.style.getPropertyValue("--rx"), ry: el.style.getPropertyValue("--ry") };
});
chk(`landing tilt vars set (rx=${tilt.rx} ry=${tilt.ry})`, tilt.rx !== "" && tilt.ry !== "" && Math.abs(parseFloat(tilt.rx)) > 0.5 && Math.abs(parseFloat(tilt.ry)) > 0.5);
await p.mouse.move(card.x + card.w / 2, card.y + card.h / 2);
await sleep(400);
const center = await p.evaluate(() => {
  const el = document.querySelector(".edition-card");
  return { rx: el.style.getPropertyValue("--rx"), ry: el.style.getPropertyValue("--ry") };
});
chk("center => near-zero tilt", (Math.abs(parseFloat(center.rx) || 0) < 0.5 && Math.abs(parseFloat(center.ry) || 0) < 0.5));
await p.mouse.move(10, 10);
await sleep(400);
const reset = await p.evaluate(() => {
  const el = document.querySelector(".edition-card");
  return { rx: el.style.getPropertyValue("--rx"), ry: el.style.getPropertyValue("--ry") };
});
chk("leave => vars cleared", reset.rx === "" && reset.ry === "");

// reduced motion: no tilt
await p.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
await p.goto("http://localhost:4173/", { waitUntil: "networkidle0" });
await p.waitForSelector(".edition-card", { timeout: 10000 });
await sleep(800);
await p.mouse.move(card.x + card.w - 12, card.y + 12);
await sleep(400);
const rm = await p.evaluate(() => {
  const el = document.querySelector(".edition-card");
  return { rx: el.style.getPropertyValue("--rx"), ry: el.style.getPropertyValue("--ry") };
});
chk("reduced-motion => no tilt vars", rm.rx === "" && rm.ry === "");

// aurora cards
await p.emulateMediaFeatures([]);
await p.goto("http://localhost:4173/aurora", { waitUntil: "networkidle0" });
await p.waitForSelector(".au-card", { timeout: 10000 });
await sleep(800);
await p.evaluate(() => document.querySelector(".au-card").scrollIntoView({ block: "center" }));
await sleep(800);
const au = await p.evaluate(() => {
  const el = document.querySelector(".au-card");
  const r = el.getBoundingClientRect();
  return { x: r.x + r.width - 12, y: r.y + 12 };
});
await p.mouse.move(au.x, au.y);
await sleep(600);
const auTilt = await p.evaluate(() => document.querySelector(".au-card").style.getPropertyValue("--ry"));
chk("aurora tilt set", Math.abs(parseFloat(auTilt)) > 0.5);
await p.mouse.move(40, 860, { steps: 12 });
await sleep(500);
const auClear = await p.evaluate(() => document.querySelector(".au-card").style.getPropertyValue("--ry"));
chk("aurora exit => vars cleared", auClear === "");

// classic featured screenshots: useEffects writes --tx/--ty (-1..1); CSS applies the tilt on hover only
await p.goto("http://localhost:4173/classic", { waitUntil: "networkidle0" });
await p.waitForSelector(".feature .shot-frame", { timeout: 10000 });
await sleep(800);
await p.evaluate(() => document.querySelector(".feature .shot-frame").scrollIntoView({ block: "center" }));
await sleep(1200);
const cl = await p.evaluate(() => {
  const el = document.querySelector(".feature .shot-frame");
  const r = el.getBoundingClientRect();
  return { x: r.x + r.width - 12, y: r.y + 12 };
});
await p.mouse.move(cl.x, cl.y, { steps: 6 });
await sleep(600);
const clTilt = await p.evaluate(() => document.querySelector(".feature .shot-frame").style.getPropertyValue("--tx"));
chk("classic tilt set", Math.abs(parseFloat(clTilt)) > 0.5);
await p.mouse.move(40, 860, { steps: 12 });
await sleep(500);
const clHover = await p.evaluate(() => document.querySelector(".feature .shot-frame").matches(":hover"));
chk("classic exit => tilt released (not hovered)", clHover === false);

console.log(f === 0 ? "3D TILT CHECKS PASS" : f + " FAILURES");
await b.close();
rmSync(profile, { recursive: true, force: true });
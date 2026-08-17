import puppeteer from "puppeteer-core";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const profile = mkdtempSync(join(tmpdir(), "shot-"));
const b = await puppeteer.launch({
  executablePath: "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
  headless: true,
  args: ["--no-sandbox", `--user-data-dir=${profile}`],
});
const p = await b.newPage();
await p.setViewport({ width: (Number(process.argv[3]) || 1440), height: (Number(process.argv[4]) || 1000) });
await p.goto("http://localhost:4173/" + (process.argv[2] || ""), { waitUntil: "networkidle0" });
await sleep(2800);
await p.screenshot({ path: process.argv[5] || "/tmp/shot.png" });
await b.close();
rmSync(profile, { recursive: true, force: true });
console.log("saved");

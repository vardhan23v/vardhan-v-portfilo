import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
  headless: "new",
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});

const url = process.env.PROBE_URL || "http://localhost:4173/forge";
await page.goto(url, { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 1200));

const report = {};

report.pulse = await page.evaluate(() => {
  const pulse = document.querySelector(".fg-pipe-pulse");
  return !!pulse && getComputedStyle(pulse, "::before").animationName === "fg-pipe-flow";
});

report.ledeSwaps = await page.evaluate(async () => {
  const el = document.querySelector(".fg-lede .fg-lede-swap");
  if (!el) return -1;
  const first = el.textContent;
  await new Promise((r) => setTimeout(r, 4400));
  const now = document.querySelector(".fg-lede .fg-lede-swap");
  return first !== now.textContent ? 1 : 0;
});

const rowBox = await page.evaluate(() => {
  const r = document.querySelectorAll(".fg-pipe-row")[1];
  const b = r.getBoundingClientRect();
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
});
await page.mouse.move(rowBox.x, rowBox.y, { steps: 4 });
await new Promise((r) => setTimeout(r, 300));
report.trace = await page.evaluate(() =>
  [...document.querySelectorAll(".fg-pipe-row")].map((r) => r.className)
);
await page.mouse.move(10, 10, { steps: 4 });
await new Promise((r) => setTimeout(r, 200));
report.traceCleared = await page.evaluate(() =>
  [...document.querySelectorAll(".fg-pipe-row")].map((r) => r.className)
);

await page.evaluate(async () => {
  document.querySelector(".fg-stats").scrollIntoView({ block: "center" });
  await new Promise((r) => setTimeout(r, 1300));
});
report.stats = await page.evaluate(() => {
  const labels = [...document.querySelectorAll(".fg-stat-label")].map((e) => e.textContent);
  const values = [...document.querySelectorAll(".fg-stat-value")].map((e) => e.textContent.trim());
  return { labels, values };
});

report.glint = await page.evaluate(() => !!document.querySelector(".fg-hero-heading.fg-glint"));

report.footerReveal = await page.evaluate(() => {
  const f = document.querySelector(".fg-foot");
  return f && f.classList.contains("fg-reveal");
});

report.hscroll = await page.evaluate(
  () => document.documentElement.scrollWidth - document.documentElement.clientWidth
);

console.log(JSON.stringify(report, null, 2));
console.log("ERRORS:", JSON.stringify(errors));
await browser.close();
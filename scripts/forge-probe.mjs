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

report.eyebrows = await page.evaluate(() =>
  [...document.querySelectorAll(".fg-sec-eyebrow")].map((e) => e.textContent.trim())
);

report.context = await page.evaluate(() =>
  [...document.querySelectorAll(".fg-context span")].map((e) => e.textContent)
);

report.shimmer = await page.evaluate(() => {
  const h = document.querySelector(".fg-hero-heading");
  return getComputedStyle(h).animationName;
});

report.bgDrift = await page.evaluate(() => {
  const bg = document.querySelector(".fg-bg");
  return getComputedStyle(bg, "::before").animationName;
});

report.grid = await page.evaluate(() => !!document.querySelector(".fg-bg .fg-grid"));

report.stackHues = await page.evaluate(() =>
  [...document.querySelectorAll(".fg-stack-card")].map((c) => c.style.getPropertyValue("--hc"))
);

report.stackDescs = await page.evaluate(() =>
  [...document.querySelectorAll(".fg-stack-desc")].map((e) => e.textContent)
);

report.emojiWatermarks = await page.evaluate(() =>
  [...document.querySelectorAll(".fg-proj-emoji")].map((e) => e.textContent)
);

report.contactGlow = await page.evaluate(() =>
  getComputedStyle(document.querySelector(".fg-contact"), "::before").animationName
);

report.hscroll = await page.evaluate(
  () => document.documentElement.scrollWidth - document.documentElement.clientWidth
);

await page.screenshot({ path: "/tmp/forge-hero.png" });
await page.evaluate(() => {
  document.querySelector("#stack").scrollIntoView();
});
await new Promise((r) => setTimeout(r, 900));
await page.screenshot({ path: "/tmp/forge-stack.png" });
await page.evaluate(() => {
  document.querySelector("#work").scrollIntoView({ block: "start" });
  window.scrollBy(0, 900);
});
await new Promise((r) => setTimeout(r, 900));
await page.screenshot({ path: "/tmp/forge-work.png" });
await page.evaluate(() => {
  document.querySelector("#contact").scrollIntoView();
});
await new Promise((r) => setTimeout(r, 900));
await page.screenshot({ path: "/tmp/forge-contact.png" });

console.log(JSON.stringify(report, null, 2));
console.log("ERRORS:", JSON.stringify(errors));
await browser.close();
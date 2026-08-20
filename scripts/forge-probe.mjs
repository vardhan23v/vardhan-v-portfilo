import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
  headless: "new",
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});

const url = process.env.PROBE_URL || "http://localhost:4173/forge";
await page.goto(url, { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 1200));

const report = {};

// enriched cards
report.cards = await page.evaluate(() => {
  const cards = [...document.querySelectorAll(".fg-proj-card")];
  return cards.map((c) => ({
    problem: !!c.querySelector(".fg-proj-problem"),
    features: c.querySelectorAll(".fg-proj-features li").length,
    ai: c.querySelector(".fg-proj-ai")?.textContent.trim() ?? null,
    tech: c.querySelectorAll(".fg-proj-tech span").length,
    links: [...c.querySelectorAll(".fg-proj-link")].map((a) => a.textContent.trim()),
  }));
});

// nav links + spy ids resolve
report.nav = await page.evaluate(() => {
  const links = [...document.querySelectorAll(".fg-nav-links a[href^='#']")];
  return links.map((a) => {
    const id = a.getAttribute("href").slice(1);
    return { label: a.textContent.trim(), target: id, exists: !!document.getElementById(id) };
  });
});

// contact CTAs
report.contact = await page.evaluate(() => {
  const ctas = [...document.querySelectorAll(".fg-contact .fg-ctas a, .fg-contact .fg-ctas .lb-m-btn")];
  return ctas.map((a) => ({ text: a.textContent.trim(), href: a.getAttribute("href") ?? "" }));
});

// title + meta
report.seo = await page.evaluate(() => ({
  title: document.title,
  desc: document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "",
}));

// h-scroll across breakpoints
for (const w of [320, 375, 390, 430, 768, 1024, 1440]) {
  await page.setViewport({ width: w, height: 900 });
  await page.goto(url, { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 700));
  report[`vp${w}`] = await page.evaluate(() => {
    const d = document.documentElement;
    const hs = d.scrollWidth - d.clientWidth;
    const hero = document.querySelector(".fg-hero");
    const chips = document.querySelector(".fg-context");
    const ctaRow = document.querySelector(".fg-ctas");
    let ctaOverflow = false;
    if (ctaRow) {
      const r = ctaRow.getBoundingClientRect();
      ctaOverflow = r.right > d.clientWidth + 1;
    }
    return { hscroll: hs, heroFits: hero ? hero.getBoundingClientRect().width <= d.clientWidth : true, ctaOverflow, chips: chips ? chips.getBoundingClientRect().right <= d.clientWidth + 1 : true };
  });
}

// keyboard: tab reaches project links
await page.setViewport({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 1000));
await page.evaluate(() => {
  document.querySelector("#work").scrollIntoView({ block: "start" });
  window.scrollBy(0, 400);
});
await new Promise((r) => setTimeout(r, 700));
report.keyboard = await page.evaluate(async () => {
  const first = document.querySelector(".fg-proj-card a");
  first.focus();
  const active = document.activeElement === first;
  const focusable = document.querySelectorAll(".fg-proj-card a, .fg-proj-card .fg-proj-link").length;
  return { firstProjectLinkFocusable: active, projectLinks: focusable };
});

console.log(JSON.stringify(report, null, 2));
console.log("ERRORS:", JSON.stringify(errors));
await browser.close();
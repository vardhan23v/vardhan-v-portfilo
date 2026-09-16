import puppeteer from "puppeteer-core";
const exe = "/Users/vardhu/.cache/puppeteer/chrome/mac_arm-153.0.8010.47/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function check(base, label, motion) {
  const b = await puppeteer.launch({ executablePath: exe, headless: true, args: ["--no-sandbox", "--window-size=1440,900"] });
  const p = await b.newPage();
  await p.setViewport({ width: 1440, height: 900 });
  if (motion) await p.evaluateOnNewDocument((m) => { try { localStorage.setItem("motion", m); } catch {} }, motion);
  await p.evaluateOnNewDocument(() => { window.__vt = 0; const o = document.startViewTransition?.bind(document); if (o) document.startViewTransition = (cb) => { window.__vt++; return o(cb); }; });
  await p.goto(base + "/", { waitUntil: "networkidle0" });
  await sleep(1200);
  const r = { label };
  r.reducedMotion = await p.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches);
  r.dataMotion = await p.evaluate(() => document.documentElement.getAttribute("data-motion"));
  r.runningAnimations = await p.evaluate(() => document.getAnimations().length);
  r.revealTop = await p.evaluate(() => [document.querySelectorAll("[data-reveal].is-in, [data-land-reveal].is-in, .edition-tilt.is-in").length, document.querySelectorAll("[data-reveal], [data-land-reveal]").length]);
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.6));
  await sleep(900);
  r.revealAfterScroll = await p.evaluate(() => [document.querySelectorAll("[data-reveal].is-in, [data-land-reveal].is-in, .edition-tilt.is-in").length, document.querySelectorAll("[data-reveal], [data-land-reveal]").length]);
  // hover tilt on a card
  const card = await p.$(".edition-card");
  const box = await card.boundingBox();
  await p.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.3);
  await sleep(120);
  await p.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.7, { steps: 5 });
  await sleep(200);
  r.tilt = await p.evaluate(() => { const c = document.querySelector(".edition-card"); return { rx: c.style.getPropertyValue("--rx"), transform: getComputedStyle(c).transform.slice(0, 40) }; });
  // magnet on cta
  await p.evaluate(() => window.scrollTo(0, 0)); await sleep(400);
  const cta = await p.$(".l-cta"); const cb = await cta.boundingBox();
  await p.mouse.move(cb.x + 5, cb.y + 5); await sleep(80); await p.mouse.move(cb.x + cb.width - 5, cb.y + cb.height - 5, { steps: 6 }); await sleep(250);
  r.magnet = await p.evaluate(() => { const c = document.querySelector(".l-cta"); return { inline: c.style.transform, mx: c.style.getPropertyValue("--mx"), computed: getComputedStyle(c).transform.slice(0, 40) }; });
  // stage skin transition + marquee running
  r.marquee = await p.evaluate(() => getComputedStyle(document.querySelector(".land-marquee-track")).animationName);
  // click Paper card → view transition + portal
  const paper = await p.$(".edition-card.ed-paper");
  await p.evaluate(() => document.querySelector(".edition-card.ed-paper").scrollIntoView({ block: "center" })); await sleep(500);
  const pb2 = await paper.boundingBox();
  await p.mouse.click(pb2.x + pb2.width / 2, pb2.y + pb2.height / 2);
  await sleep(150);
  r.portal = await p.evaluate(() => !!document.querySelector(".ed-portal"));
  await sleep(1500);
  r.afterClick = await p.evaluate(() => ({ path: location.pathname, vt: window.__vt }));
  // switcher navigation from paper → aurora
  await p.evaluate(() => document.querySelector('a.iswitcher-item[href="/aurora"]')?.click());
  await sleep(1200);
  r.afterSwitch = await p.evaluate(() => ({ path: location.pathname, vt: window.__vt, htmlClass: document.documentElement.className }));
  r.auroraReveals = await p.evaluate(() => [document.querySelectorAll(".au-reveal.is-in").length, document.querySelectorAll(".au-reveal").length]);
  await b.close();
  return r;
}
const out = [];
// usage: node scripts/motion-check.mjs [baseUrl] — runs once following the OS setting and once with the site override "on".
const base = process.argv[2] || "https://vardhan-v-portfilo.vercel.app";
for (const [label, motion] of [["default (unset)", null], ["follow system", "auto"], ["off", "off"]]) {
  try { out.push(await check(base, label, motion)); } catch (e) { out.push({ label, error: String(e).slice(0, 200) }); }
}
console.log(JSON.stringify(out, null, 1));

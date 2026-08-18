import puppeteer from "puppeteer-core";
import { createServer } from "vite";

const server = await createServer({ server: { port: 5199 }, logLevel: "error" });
await server.listen();

const b = await puppeteer.launch({
  executablePath: "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
  headless: true,
  args: ["--no-sandbox"],
});

const viewports = [
  { w: 1920, h: 1080 },
  { w: 1440, h: 900 },
  { w: 1280, h: 800 },
  { w: 1024, h: 900 },
  { w: 768, h: 900 },
  { w: 700, h: 900 },
  { w: 640, h: 900 },
  { w: 390, h: 844 },
];

for (const { w, h } of viewports) {
  const p = await b.newPage();
  await p.setViewport({ width: w, height: h });
  await p.goto("http://localhost:5199/cosmos", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 800));

  const geo = await p.evaluate(() => {
    const q = (s) => document.querySelector(s);
    const r = (s) => {
      const el = q(s);
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return { top: Math.round(b.top), bottom: Math.round(b.bottom), h: Math.round(b.height) };
    };
    const silTop = r(".co-sil")?.top ?? -1;
    const panelBottom = r(".co-panel")?.bottom ?? -1;
    return {
      titleVNav: r(".co-title").top > r(".co-nav").bottom,
      silOverlapsPanel: silTop < panelBottom,
      silTop,
      panelBottom,
      ccSvgShown: getComputedStyle(q(".co-constellation svg")).display !== "none",
      ccListShown: getComputedStyle(q(".co-cc-list")).display !== "none",
      ccChips: q(".co-cc-chip") ? getComputedStyle(q(".co-cc-chip")).fontSize : null,
      hScroll: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      skipLink: !!q(".co-skip"),
      navIsNav: q(".co-nav")?.tagName === "NAV",
      mainTag: q("main") ? q("main").tagName : null,
    };
  });

  console.log(`${w}x${h}`, JSON.stringify(geo));
  await p.close();
}

const lp = await b.newPage();
await lp.setViewport({ width: 1440, height: 900 });
await lp.goto("http://localhost:5199/", { waitUntil: "networkidle0" });
const tiles = await lp.evaluate(() => {
  const els = [...document.querySelectorAll(".edition-tilt > *")];
  const first = els[0]?.getBoundingClientRect();
  const fourth = els[3]?.getBoundingClientRect();
  return {
    count: els.length,
    tileW: Math.round(first.width),
    firstTop: Math.round(first.top),
    fourthTop: Math.round(fourth.top),
    sameRow3: Math.abs(Math.round(first.top) - Math.round(els[2].getBoundingClientRect().top)) < 4,
    hScroll: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
});
console.log("LANDING 1440x900", JSON.stringify(tiles));
await lp.close();

await b.close();
await server.close();
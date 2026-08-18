import puppeteer from "puppeteer-core";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await puppeteer.launch({ executablePath: "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser", headless: true, args: ["--no-sandbox"] });
const p = await b.newPage();
let bad = 0;
for (const [w, h] of [[375, 812], [390, 844], [768, 1024], [1024, 768], [1440, 900]]) {
  await p.setViewport({ width: w, height: h });
  for (const route of ["/", "/paper", "/aurora", "/classic", "/terminal", "/forge"]) {
    await p.goto("http://localhost:4173" + route, { waitUntil: "networkidle0" });
    await sleep(300);
    if (route !== "/terminal") await p.waitForFunction(() => !document.querySelector(".boot"), { timeout: 5000 }).catch(() => {});
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 0) { console.log(`OVERFLOW ${w}px ${route}: +${overflow}px`); bad++; }
  }
}
console.log(bad === 0 ? "NO HORIZONTAL OVERFLOW AT 375/390/768/1024/1440" : bad + " overflows");
await b.close();

import puppeteer from "puppeteer-core";

const b = await puppeteer.launch({
  executablePath: "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
  headless: true,
  args: ["--no-sandbox"],
});
const p = await b.newPage();
const base = "https://vardhan-v-portfilo.vercel.app";
let f = 0;
const chk = (l, c) => {
  if (!c) {
    console.log("FAIL:", l);
    f++;
  }
};
const txt = (sel) =>
  p.evaluate((s) => (document.querySelector(s)?.textContent ?? "").replace(/\s+/g, " "), sel);
const bodyTxt = () => p.evaluate(() => document.body.innerText.replace(/\s+/g, " "));

await p.goto(base + "/", { waitUntil: "networkidle0" });
await p.waitForSelector(".edition-grid", { timeout: 10000 });
chk("h1", await p.evaluate(() => /One\s*portfolio\.\s*Five\s*interfaces\./.test(document.querySelector("h1")?.textContent ?? "")));
chk("what", (await bodyTxt()).includes("I build AI-powered products and full-stack systems."));
chk("bar", (await bodyTxt()).includes("command palette"));
chk("cta primary", await p.evaluate(() => document.body.innerText.includes("View selected work")));
chk("cta github", await p.evaluate(() => !!document.querySelector('a[href="https://github.com/vardhan23v"][target="_blank"]')));
chk("pipeline", await p.evaluate(() => (document.querySelector(".landing-pipeline")?.textContent ?? "").includes("frontend") && (document.querySelector(".landing-pipeline")?.textContent ?? "").includes("product")));

await p.goto(base + "/paper", { waitUntil: "networkidle0" });
await p.waitForSelector(".paper-eng-btn", { timeout: 10000 });
chk(
  "paper resume button readable",
  await p.evaluate(() => {
    const btn = document.querySelector(".paper-btn-primary");
    const cs = getComputedStyle(btn);
    return cs.color !== cs.backgroundColor && btn.getBoundingClientRect().width > 100;
  })
);
chk(
  "paper order",
  await p.evaluate(() => {
    const t = document.querySelector("#work")?.innerText || "";
    return t.indexOf("Extension AI") < t.indexOf("DriveNest") && !t.includes("Campus Compass");
  })
);
await p.evaluate(() => document.querySelector(".paper-eng-btn").click());
await p.waitForSelector(".paper-eng-body", { timeout: 5000 });
chk(
  "paper expander opens",
  await p.evaluate(() => document.querySelector(".paper-eng-btn").getAttribute("aria-expanded") === "true")
);

await p.goto(base + "/aurora", { waitUntil: "networkidle0" });
await p.waitForSelector(".au-ft", { timeout: 10000 });
await p.evaluate(() => document.querySelector(".au-eng-btn").click());
await p.waitForSelector(".au-eng-body", { timeout: 5000 });
chk("aurora expander opens", await p.evaluate(() => !!document.querySelector(".au-eng-body")));

await p.goto(base + "/forge", { waitUntil: "networkidle0" });
await p.waitForSelector(".forge-root", { timeout: 10000 });
chk(
  "forge hero heading",
  await p.evaluate(() => /Where\s*code\s*meets\s*intelligence\./.test(document.querySelector(".fg-hero-heading")?.textContent ?? ""))
);
chk(
  "forge pipeline",
  await p.evaluate(() => (document.querySelector(".fg-pipe-foot")?.textContent ?? "").includes("product"))
);
chk(
  "forge work stack",
  await p.evaluate(() => document.querySelectorAll(".fg-proj-wrap").length === 6)
);
chk(
  "forge contact pill",
  await p.evaluate(() => /Let.*build something\./.test(document.querySelector(".fg-contact .fg-heading")?.textContent ?? ""))
);

await p.goto(base + "/terminal", { waitUntil: "networkidle0" });
await p.waitForFunction(() => document.querySelector(".terminal-root") && !document.querySelector(".boot"), { timeout: 20000 });
chk("terminal prompt", (await bodyTxt()).includes("SELECTED_PROJECTS"));

await p.goto(base + "/classic", { waitUntil: "networkidle0" });
await p.waitForSelector(".hero", { timeout: 10000 });
chk("classic alive", (await bodyTxt()).includes("vardhan build --ai"));
chk("classic no campus", !(await bodyTxt()).includes("Campus Compass"));

console.log(f === 0 ? "LIVE PRODUCTION CHECK PASS" : f + " FAILURES");
await b.close();
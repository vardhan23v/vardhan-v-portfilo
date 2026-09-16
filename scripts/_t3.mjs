import puppeteer from "puppeteer-core";
const exe = "/Users/vardhu/.cache/puppeteer/chrome/mac_arm-153.0.8010.47/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const out = process.argv[2]; const base = process.argv[3] || "http://localhost:4173";
const b = await puppeteer.launch({ executablePath: exe, headless: true, args: ["--no-sandbox"] });
const errors = [];
const mk = async (w, h, booted = true) => { const p = await b.newPage(); await p.setViewport({ width: w, height: h }); p.on("pageerror", (e) => errors.push(String(e).slice(0, 200))); p.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 200)); }); if (booted) await p.evaluateOnNewDocument(() => { try { sessionStorage.setItem("folio.booted", "1"); } catch {} }); return p; };
const r = {};
// boot fade
const pb = await mk(1440, 900, false);
await pb.goto(base + "/terminal", { waitUntil: "domcontentloaded" }); await sleep(300);
r.bootFocus = await pb.evaluate(() => document.activeElement?.className);
await pb.keyboard.press("Enter"); await sleep(120);
r.bootDoneClass = await pb.evaluate(() => !!document.querySelector(".boot.done"));
await sleep(700); r.bootGone = await pb.evaluate(() => !document.querySelector(".boot"));
await pb.close();
const p = await mk(1440, 900);
await p.goto(base + "/terminal", { waitUntil: "networkidle0" }); await sleep(600);
const run = async (cmd, wait = 400) => { await p.click(".shell-input"); await p.evaluate(() => { const i = document.querySelector(".shell-input"); i.value = ""; }); await p.keyboard.type(cmd); await p.keyboard.press("Enter"); await sleep(wait); return p.evaluate(() => [...document.querySelectorAll(".shell-ln")].slice(-14).map((e) => e.textContent)); };
r.lsla = (await run("ls -la")).slice(-8, -5);
r.lswork = (await run("ls work")).slice(-4, -2);
r.cat = (await run("cat work/vard-ai.md")).slice(-13, -10);
r.pipe = (await run("ls work | grep ai")).slice(-4);
r.cowsay = (await run("cowsay Hello World")).slice(-8, -7);
r.banner = (await run("banner AB1")).slice(-5, -3);
r.man = (await run("man open")).slice(-5, -2);
r.ping = (await run("ping example.org")).slice(-2);
r.curl = (await run("curl /api/projects")).slice(-3, -1);
await run("ssh"); r.remotePrompt = await p.evaluate(() => document.querySelector(".shell-entry .prompt").textContent);
await run("exit"); r.backPrompt = await p.evaluate(() => document.querySelector(".shell-entry .prompt").textContent);
await run("stats"); r.stats = (await p.evaluate(() => [...document.querySelectorAll(".shell-ln")].slice(-9, -7).map((e) => e.textContent)));
await run("top", 1200); r.top = await p.evaluate(() => document.querySelector(".term-title").textContent); await sleep(3500);
r.topDone = (await p.evaluate(() => [...document.querySelectorAll(".shell-ln")].slice(-1).map((e) => e.textContent)))[0];
await run("sl", 100); r.train = await p.evaluate(() => !!document.querySelector(".shell-train")); await sleep(3400);
await run("snake", 300); r.snakeOn = await p.evaluate(() => document.querySelector(".shell-win").className);
await p.keyboard.press("ArrowDown"); await sleep(400); await p.keyboard.press("ArrowRight"); await sleep(400);
r.snakeBoard = (await p.evaluate(() => [...document.querySelectorAll(".shell-ln")].slice(-12, -11).map((e) => e.textContent)))[0];
await p.keyboard.press("q"); await sleep(200);
r.snakeQuit = (await p.evaluate(() => [...document.querySelectorAll(".shell-ln")].slice(-1).map((e) => e.textContent)))[0];
r.crtBefore = await p.evaluate(() => document.querySelector(".terminal-root").dataset.crt);
await run("crt off"); r.crtAfter = await p.evaluate(() => [document.querySelector(".terminal-root").dataset.crt, document.querySelector(".sl-msg")?.textContent]);
await run("crt on");
// history persisted across reload
await p.reload({ waitUntil: "networkidle0" }); await sleep(500);
r.historyAfterReload = (await run("history | tail -3")).slice(-4, -1);
await run("!1"); r.bang = (await p.evaluate(() => [...document.querySelectorAll(".shell-ln.cmd")].slice(-1).map((e) => e.textContent)))[0];
// open → case study
await run("open vard-ai", 1500); r.openPath = await p.evaluate(() => location.pathname);
await p.evaluate(() => document.activeElement?.blur());
await p.keyboard.press("]"); await sleep(1200); r.nextPath = await p.evaluate(() => location.pathname);
await p.keyboard.press("["); await sleep(1200); r.prevPath = await p.evaluate(() => location.pathname);
await p.screenshot({ path: `${out}/t3-case.png`, fullPage: true });
// legacy slug redirect
await p.goto(base + "/terminal/work/code-reviewer", { waitUntil: "networkidle0" }); await sleep(800); r.legacy = await p.evaluate(() => location.pathname);
// :set nocrt and contact
await p.goto(base + "/terminal#contact", { waitUntil: "networkidle0" }); await sleep(800);
await p.keyboard.press(":"); await sleep(120); await p.keyboard.type("set nocrt"); await p.keyboard.press("Enter"); await sleep(300);
r.setNocrt = await p.evaluate(() => document.querySelector(".terminal-root").dataset.crt);
await p.type("#cf-from", "not-an-email"); await p.click(".mail-form .btn-solid"); await sleep(200);
r.contactErr = await p.evaluate(() => [document.querySelector("#cf-status")?.textContent, document.querySelector("#cf-from")?.getAttribute("aria-invalid")]);
await p.evaluate(() => { document.querySelector("#cf-from").value = ""; }); await p.type("#cf-from", "me@x.io"); await p.type("#cf-subject", "Hi"); await sleep(200);
r.preview = await p.evaluate(() => document.querySelector(".mail-preview-body")?.textContent.split("\n").slice(0, 3));
await p.screenshot({ path: `${out}/t3-contact.png`, clip: { x: 0, y: 0, width: 1440, height: 900 } });
// section screenshots
await p.goto(base + "/terminal", { waitUntil: "networkidle0" }); await sleep(500);
const H = await p.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < H; y += 700) { await p.evaluate((y) => window.scrollTo(0, y), y); await sleep(120); }
await p.evaluate(() => window.scrollTo(0, 0)); await sleep(2500);
r.boxes = await p.evaluate(() => Object.fromEntries([...document.querySelectorAll("main section[id], footer")].map(s => [s.id || "footer", [Math.round(s.getBoundingClientRect().top + scrollY), Math.round(s.getBoundingClientRect().height)]])));
await p.screenshot({ path: `${out}/t3-full.png`, fullPage: true });
// amber + mobile
const m = await mk(390, 844);
await m.evaluateOnNewDocument(() => { try { localStorage.setItem("folio.phosphor", "amber"); } catch {} });
await m.goto(base + "/terminal", { waitUntil: "networkidle0" }); await sleep(800);
r.mobW = await m.evaluate(() => document.documentElement.scrollWidth);
await m.evaluate(() => document.getElementById("contact").scrollIntoView()); await sleep(700);
await m.screenshot({ path: `${out}/t3-mob-contact.png` });
await m.evaluate(() => document.getElementById("about").scrollIntoView()); await sleep(700);
await m.screenshot({ path: `${out}/t3-mob-about.png` });
// reduced motion
const rm = await mk(1440, 900);
await rm.evaluateOnNewDocument(() => { try { localStorage.setItem("motion", "off"); } catch {} });
await rm.goto(base + "/terminal", { waitUntil: "networkidle0" }); await sleep(600);
await rm.click(".shell-input"); await rm.keyboard.type("snake"); await rm.keyboard.press("Enter"); await sleep(300);
r.reducedSnake = (await rm.evaluate(() => [...document.querySelectorAll(".shell-ln")].slice(-1).map((e) => e.textContent)))[0];
r.reducedSweep = await rm.evaluate(() => getComputedStyle(document.querySelector(".crt-sweep")).display);
console.log(JSON.stringify(r, null, 1)); console.log("errors:", errors.length ? errors : "none");
await b.close();

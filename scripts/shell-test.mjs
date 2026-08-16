import puppeteer from "puppeteer-core";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await puppeteer.launch({
  executablePath: "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
  headless: true,
  args: ["--no-sandbox"],
});
const p = await b.newPage();
p.on("dialog", (d) => d.accept());
await p.goto("http://localhost:4173/terminal", { waitUntil: "networkidle0" });
await p.waitForSelector(".shell-input", { timeout: 8000 });
await p.waitForFunction(() => !document.querySelector(".boot"), { timeout: 8000 });
await p.evaluate(() => { window.open = () => null; });

const text = () => p.$eval(".shell-lines", (el) => el.innerText);
const val = () => p.$eval(".shell-input", (el) => el.value);
const waitOut = async (frag, timeoutMs = 4000) => {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    if ((await text()).includes(frag)) return true;
    await sleep(80);
  }
  return false;
};
const run = async (cmd, frag) => {
  await p.click(".shell-input");
  await p.keyboard.type(cmd, { delay: 4 });
  await p.keyboard.press("Enter");
  await waitOut(frag);
};
const clear = async () => {
  await p.evaluate(() => {
    const el = document.querySelector(".shell-input");
    if (el) {
      el.focus();
      el.select();
    }
  });
  await p.keyboard.press("Backspace");
  await sleep(30);
};

let fails = 0;
const check = (name, cond) => {
  console.log((cond ? "ok  " : "FAIL") + " " + name);
  if (!cond) fails++;
};

await run("help", "available commands");
let t = await text();
check("help lists neofetch", t.includes("neofetch / fetch"));
check("help lists cat <file>", t.includes("cat <file>"));
check("help lists backtick hint", t.includes("focus this terminal"));
check("help lists tab/history hint", t.includes("command history"));

await run("neofetch", "vardhan@folio");
t = await text();
check("neofetch ascii", t.includes("portfolio_os"));
check("neofetch kernel", t.includes("Kernel:"));
check("neofetch uptime", t.includes("Uptime:"));
check("neofetch location", t.includes("Kurnool"));

await run("social", "linkedin");
t = await text();
check("social github", t.includes("github.com/vardhan23v"));
check("social linkedin", t.includes("linkedin.com/in/vardhan-v23"));
check("social opens tabs", t.includes("opening github + linkedin"));

await run("cat skills.tree", "ai / llm");
t = await text();
check("cat skills.tree → tools group", t.includes("tools"));
check("cat skills.tree end", t.includes("end of file"));

await run("cat experience.log", "OxCode");
t = await text();
check("cat experience.log → zetheta", t.includes("Zetheta"));
check("cat experience.log end", t.includes("end of file"));

await run("cat how_i_work.sh", "shebang");
t = await text();
check("cat how_i_work.sh → pipeline", t.includes("pipeline: healthy"));
check("cat how_i_work.sh 5 stages", t.includes("# 05 ship"));

await run("cat about.txt", "NMAM");
t = await text();
check("cat about.txt → certifications", t.includes("postgresql developer"));

await run("cat missing.txt", "no such file");
t = await text();
check("cat missing.txt → try list", t.includes("try: about.txt"));

await run("cowsay", "(oo)");
t = await text();
check("cowsay default msg", t.includes("portfolio cow"));

await run("cowsay hello there", "< hello there >");

await run("matrix", "white rabbit");

await run("ping", "3 received");
t = await text();
check("ping 0% loss", t.includes("0% packet loss"));

await run("ping vardhan.dev", "vardhan.dev");

await run("resume", "sree-vardhan-v-resume.pdf");
t = await text();
check("resume link printed", t.includes("/resume/resume.pdf"));
check("resume no placeholder hint", !t.includes("placeholder"));

await run("vim", "not a text editor");

await run("42", "answer to life");

await run("rm -rf /", "sandboxed");

await clear();
await p.keyboard.type("neo");
await p.keyboard.press("Tab");
await sleep(40);
check("tab: neo→neofetch ", (await val()) === "neofetch ");

await clear();
await p.keyboard.type("cat ");
await p.keyboard.type("sk");
await sleep(60);
await p.keyboard.press("Tab");
await sleep(40);
check("tab: cat sk→skills.tree", (await val()) === "cat skills.tree ");

await clear();
await p.keyboard.type("cat exp");
await sleep(60);
await p.keyboard.press("Tab");
await sleep(40);
check("tab: cat exp→experience.log", (await val()) === "cat experience.log ");
await p.keyboard.press("Enter");
await waitOut("experience.log");

await clear();
await p.keyboard.press("ArrowUp");
await sleep(40);
check("arrowUp recalls experience.log", (await val()).includes("experience.log"));
for (let i = 0; i < 14; i++) {
  await p.keyboard.press("ArrowUp");
  await sleep(15);
}
check("arrowUp deep recall skills.tree", (await val()).includes("skills.tree"));
for (let i = 0; i < 15; i++) {
  await p.keyboard.press("ArrowDown");
  await sleep(15);
}
check("arrowDown back to empty", (await val()) === "");

await p.evaluate(() => document.activeElement.blur());
await p.keyboard.press("Backquote");
await sleep(60);
const focused = await p.evaluate(() => document.activeElement.className);
check("backquote focuses shell-input", focused.includes("shell-input"));

await run("ls ; date", "ls ; date");
check("chained ls ; date output", (await text()).includes("experience.log"));

await run("clear", "");
await sleep(400);
t = await text();
check("clear wipes session", t === "");

await b.close();
console.log(fails === 0 ? "\nALL PASS" : `\n${fails} FAILURES`);
process.exit(fails === 0 ? 0 : 1);
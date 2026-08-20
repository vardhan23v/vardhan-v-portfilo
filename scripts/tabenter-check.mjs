import puppeteer from "puppeteer-core";

const b = await puppeteer.launch({
  executablePath: "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
  headless: true,
  args: ["--no-sandbox"],
});
const p = await b.newPage();
const base = process.env.BASE || "http://localhost:4173";

let f = 0;
const chk = (l, c) => {
  if (!c) {
    console.log("FAIL:", l);
    f++;
  }
};

await p.goto(base + "/", { waitUntil: "networkidle0" });
await p.waitForSelector(".edition-grid", { timeout: 15000 });

// Tab to a specific edition card by index (1-based; the hero CTAs come first).
const tabTo = async (cf) => {
  for (let i = 0; i < cf; i++) {
    await p.keyboard.press("Tab");
  }
  return p.evaluate(
    () =>
      document.activeElement?.tagName +
      ":" +
      (document.activeElement?.getAttribute("aria-label") || "")
  );
};

// Tab until the Terminal edition card link is focused (robust to tab-order changes).
const tabToTerminal = async () => {
  for (let i = 0; i < 40; i++) {
    await p.keyboard.press("Tab");
    const href = await p.evaluate(
      () => document.activeElement?.getAttribute?.("href") || ""
    );
    if (href === "/terminal") return true;
  }
  return false;
};

chk("terminal card reachable by keyboard", await tabToTerminal());
await p.keyboard.press("Enter");
await p.waitForFunction(() => location.pathname === "/terminal", { timeout: 8000 });
chk("tab+enter -> /terminal", true);

await p.goto(base + "/", { waitUntil: "networkidle0" });
await p.waitForSelector(".edition-grid", { timeout: 15000 });

await tabTo(1); // "View selected work" CTA
await p.keyboard.press("Enter");
await new Promise((r) => setTimeout(r, 500));
chk("tab+enter on CTA scrolls to editions", await p.evaluate(() => location.hash === "#editions"));

console.log((base.includes("vercel") ? "LIVE " : "") + (f === 0 ? "TAB+ENTER CHECKS PASS" : f + " FAILURES"));
await b.close();
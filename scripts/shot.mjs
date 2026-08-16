import puppeteer from "puppeteer-core";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await puppeteer.launch({ executablePath: "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser", headless: true, args: ["--no-sandbox"] });
const p = await b.newPage();
await p.setViewport({ width: (Number(process.argv[3]) || 1440), height: (Number(process.argv[4]) || 1000) });
await p.goto("http://localhost:4173/" + (process.argv[2] || ""), { waitUntil: "networkidle0" });
await p.screenshot({ path: process.argv[5] || "/tmp/shot.png" });
await b.close();
console.log("saved");

import fs from "node:fs";
import path from "node:path";
import postcss from "postcss";
import pw from "postcss-prefixwrap";

const prefixwrap = pw.default ?? pw;

const JOBS = [
  { dir: "src/classic", prefix: ".classic-root" },
  { dir: "src/terminal", prefix: ".terminal-root" },
];

const postFix = (css, r) =>
  css
    .split(r + " body::before").join(r + "::before")
    .split(r + " body::after").join(r + "::after")
    .split(r + " body,").join("body,")
    .split(r + " body {").join("body, " + r + " {")
    .split(r + " html").join("html")
    .split(r + " :root").join(r)
    .split(":root {").join(r + " {");

let count = 0;
for (const job of JOBS) {
  const files = [];
  const walk = (d) =>
    fs.readdirSync(d).forEach((f) => {
      const p = path.join(d, f);
      if (fs.statSync(p).isDirectory()) walk(p);
      else if (f.endsWith(".css")) files.push(p);
    });
  walk(job.dir);
  for (const file of files) {
    const src = fs.readFileSync(file, "utf8");
    const result = postcss([prefixwrap(job.prefix)]).process(src, { from: file });
    let out = result.css;
    if (file.endsWith(path.join("styles", "global.css"))) out = postFix(out, job.prefix);
    fs.writeFileSync(file, out);
    count++;
  }
}
console.log("scoped files:", count);
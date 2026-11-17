/**
 * Refreshes PR statuses in src/classic/data/opensource.ts from GitHub (needs the `gh` CLI, logged in).
 *   npm run oss
 * Merged PRs get status "merged" and a merged date; open ones stay "open". A PR that was closed
 * without merging is reported so you can remove it by hand.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const file = fileURLToPath(new URL("../src/classic/data/opensource.ts", import.meta.url));
let src = readFileSync(file, "utf8");
const d = new Date();
const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const re = /\{ number: (\d+), title: "[^"]*", url: "https:\/\/github\.com\/([^/]+\/[^/]+)\/pull\/\d+", status: "(merged|open)"[^}]*\}/g;

let changed = 0;
for (const m of [...src.matchAll(re)]) {
  const [line, num, repo, status] = m;
  const pr = JSON.parse(execFileSync("gh", ["api", `repos/${repo}/pulls/${num}`], { encoding: "utf8" }));
  if (pr.state === "closed" && !pr.merged) { console.warn(`! ${repo}#${num} was closed without merging; remove it from opensource.ts`); continue; }
  const next = pr.merged ? "merged" : "open";
  console.log(`${repo}#${num}: ${status} -> ${next}`);
  if (next !== status) {
    let upd = line.replace(`status: "${status}"`, `status: "${next}"`);
    if (pr.merged && !/merged: "/.test(upd)) upd = upd.replace(/ \}$/, `, merged: "${pr.merged_at.slice(0, 10)}" }`);
    src = src.replace(line, upd);
    changed++;
  }
}
src = src.replace(/export const OSS_AS_OF = "[^"]*";/, `export const OSS_AS_OF = "${today}";`);
writeFileSync(file, src);
console.log(`${changed} status change(s); OSS_AS_OF = ${today}`);

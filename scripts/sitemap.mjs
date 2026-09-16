// Generates dist/sitemap.xml (and refreshes public/sitemap.xml) from the edition list + terminal work slugs.
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const SITE = "https://vardhan-v-portfilo.vercel.app";
const editions = [...readFileSync("src/editions.ts", "utf8").matchAll(/to: "(\/[a-z-]+)"/g)].map((m) => m[1]);
const work = existsSync("src/terminal/data/work.ts")
  ? [...readFileSync("src/terminal/data/work.ts", "utf8").matchAll(/slug: "([a-z0-9-]+)"/g)].map((m) => `/terminal/work/${m[1]}`)
  : [];
const today = new Date().toISOString().slice(0, 10);
const urls = [
  { loc: "/", priority: "1.0" },
  ...editions.map((p) => ({ loc: p, priority: "0.8" })),
  ...work.map((p) => ({ loc: p, priority: "0.5" })),
];
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE}${u.loc}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>${u.priority}</priority></url>`).join("\n")}
</urlset>
`;
for (const out of ["public/sitemap.xml", "dist/sitemap.xml"]) if (existsSync(out.split("/")[0])) writeFileSync(out, xml);
console.log(`sitemap: ${urls.length} urls`);

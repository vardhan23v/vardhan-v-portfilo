// Generates dist/sitemap.xml (and refreshes public/sitemap.xml) from the shared route table in src/seo.ts.
import { writeFileSync, existsSync } from "node:fs";
import { loadSeo } from "./seo-routes.mjs";

const { SEO_ROUTES, canonicalUrl } = await loadSeo();
const today = new Date().toISOString().slice(0, 10);
const priority = (path) => (path === "/" ? "1.0" : path.startsWith("/terminal/work/") ? "0.5" : "0.8");
const urls = SEO_ROUTES
  .filter((r) => r.path === r.canonicalPath) // skip aliases such as /editions → /
  .map((r) => ({ loc: canonicalUrl(r), priority: priority(r.path) }));
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>${u.priority}</priority></url>`).join("\n")}
</urlset>
`;
for (const out of ["public/sitemap.xml", "dist/sitemap.xml"]) if (existsSync(out.split("/")[0])) writeFileSync(out, xml);
console.log(`sitemap: ${urls.length} urls`);

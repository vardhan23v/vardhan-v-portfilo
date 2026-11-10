// Static prerender: after `vite build`, write one dist/<path>/index.html per route with that
// route's <title>, description, canonical, og:* and twitter:* baked in, plus dist/404.html.
// No browser involved — this is a string rewrite of dist/index.html, so crawlers and link
// previewers get the right meta without JavaScript. React still hydrates the same shell.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { loadSeo } from "./seo-routes.mjs";

const DIST = "dist";
const template = readFileSync(join(DIST, "index.html"), "utf8");
const { SEO_ROUTES, NOT_FOUND_SEO, canonicalUrl, themeColorFor, EDITION_SURFACE, editionKey } = await loadSeo();

const escapeHtml = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Replace the `content` of a <meta> matched by attribute (name= or property=). Tags may span lines. */
const setMeta = (html, attr, key, value) => {
  const re = new RegExp(`(<meta\\s[^>]*?${attr}="${key}"[^>]*?content=")[^"]*(")`, "s");
  const alt = new RegExp(`(<meta\\s[^>]*?content=")[^"]*("[^>]*?${attr}="${key}")`, "s");
  if (re.test(html)) return html.replace(re, `$1${escapeHtml(value)}$2`);
  if (alt.test(html)) return html.replace(alt, `$1${escapeHtml(value)}$2`);
  throw new Error(`prerender: <meta ${attr}="${key}"> not found in dist/index.html`);
};

const SHELL_BG = "background:linear-gradient(165deg,#0b0f1a,#151a38 55%,#0c1a24)";

/**
 * Paint the route's own surface from the first byte: html background (overscroll, the splash
 * React shows next) and the static shell, so a cold load goes shell → splash → edition in one
 * colour instead of navy → navy → cream. Visual only; the shell's content is unchanged.
 */
const tintShell = (html, path) => {
  const key = editionKey(path);
  if (key === "landing" || key === "notfound") return html; // these keep the gradient wall
  const [bg, scheme] = EDITION_SURFACE[key];
  if (!html.includes(SHELL_BG)) throw new Error("prerender: static shell background not found in dist/index.html");
  html = html.replace(SHELL_BG, `background:${bg}`);
  html = html.replace("</head>", `  <style>html{background:${bg};color-scheme:${scheme}}</style>\n  </head>`);
  if (scheme === "light") {
    // dark-on-light inks for the shell copy (the landing palette is unreadable on cream)
    const shell = html.slice(html.indexOf('<div class="shell"'), html.indexOf("</noscript>"));
    const tinted = shell.replaceAll("color:#f2f3f8", "color:#1b1a17").replaceAll("color:#a9afc3", "color:#4a463f")
      .replaceAll("color:#8690ab", "color:#6b655c").replaceAll("color:#6ea8ff", "color:#be4b2a");
    html = html.replace(shell, tinted);
  }
  return html;
};

const render = ({ title, description, url, themeColor, path = "/", noindex = false, keepShellFont = false }) => {
  let html = tintShell(template, path);
  // The loading shell's headline is set in Fraunces. Only the landing page goes on to use both of
  // its files, so every other route shows it in the fallback serif and skips the download.
  if (!keepShellFont) html = html.replace("font-family:'Fraunces Variable',Fraunces,Georgia,serif;", "font-family:Georgia,serif;");
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`);
  html = setMeta(html, "name", "description", description);
  html = setMeta(html, "name", "theme-color", themeColor);
  html = setMeta(html, "property", "og:title", title);
  html = setMeta(html, "property", "og:description", description);
  html = setMeta(html, "property", "og:url", url);
  html = setMeta(html, "name", "twitter:title", title);
  html = setMeta(html, "name", "twitter:description", description);
  html = html.replace(/(<link\s+rel="canonical"\s+href=")[^"]*(")/, `$1${escapeHtml(url)}$2`);
  if (noindex) html = html.replace(/(\s*)<link rel="canonical"/, `$1<meta name="robots" content="noindex" />$1<link rel="canonical"`);
  return html;
};

const write = (file, html) => {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
};

let count = 0;
for (const route of SEO_ROUTES) {
  const html = render({
    title: route.title,
    description: route.description,
    url: canonicalUrl(route),
    themeColor: themeColorFor(route.path),
    path: route.path,
    keepShellFont: route.path === "/",
  });
  const file = route.path === "/" ? join(DIST, "index.html") : join(DIST, route.path, "index.html");
  write(file, html);
  count++;
}

write(
  join(DIST, "404.html"),
  render({ ...NOT_FOUND_SEO, url: canonicalUrl({ canonicalPath: "/" }), themeColor: themeColorFor("/404"), path: "/404", noindex: true })
);

console.log(`prerender: ${count} routes + 404.html`);

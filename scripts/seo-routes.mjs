// Loads the route/SEO table from src/seo.ts for Node build scripts.
//
// src/seo.ts (and the data files it imports) use extensionless TS imports, which Node's
// built-in type stripping cannot resolve — so we let Vite bundle it as a tiny SSR module
// into a temp dir and import() the result. No browser, no extra deps.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "vite";

/** @returns {Promise<typeof import("../src/seo.ts")>} */
export async function loadSeo() {
  const outDir = mkdtempSync(join(tmpdir(), "portfolio-seo-"));
  try {
    await build({
      configFile: false,
      logLevel: "silent",
      publicDir: false,
      build: { ssr: "src/seo.ts", outDir, emptyOutDir: true, copyPublicDir: false },
    });
    return await import(pathToFileURL(join(outDir, "seo.js")).href);
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
}

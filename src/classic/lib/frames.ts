import type { Project } from "../data/projects";

/** Every capture the project has, deduplicated, in the order it was shot. */
export function framesOf(p: Project): string[] {
  const list = p.screenshots && p.screenshots.length ? p.screenshots : p.cover ? [p.cover] : [];
  return [...new Set(list)];
}

/** The live URL when the site allows itself to be framed. */
export const embeddable = (p: Project) => (p.live && p.embed !== false ? p.live : undefined);

/** "https://extension-ai-five.vercel.app/" → "extension-ai-five.vercel.app". */
export const hostOf = (url: string) => { try { return new URL(url).host; } catch { return url; } };

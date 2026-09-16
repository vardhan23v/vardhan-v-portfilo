import { site } from "./site";

/** Editable "now" strip shown in the widgets panel and the overview masthead. */
export const status = {
  headline: "Now building",
  detail: "AI agents with MCP tool use and streaming TypeScript backends.",
  availability: site.availability,
  since: "2026",
} as const;

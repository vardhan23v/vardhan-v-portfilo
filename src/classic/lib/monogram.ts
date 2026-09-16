/** Two-letter mark from a project name: "Extension AI" → "EA", "Vard AI" → "VA", "SEM5" → "SE". */
export function monogram(name: string): string {
  const words = name.replace(/[^A-Za-z0-9 ]/g, " ").trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

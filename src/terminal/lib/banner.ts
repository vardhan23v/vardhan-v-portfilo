/** Tiny 5-row block font for the hero banner (figlet-style, no dependency). */
const GLYPHS: Record<string, string[]> = {
  V: ["█   █", "█   █", "█   █", " █ █ ", "  █  "],
  A: [" ███ ", "█   █", "█████", "█   █", "█   █"],
  R: ["████ ", "█   █", "████ ", "█  █ ", "█   █"],
  D: ["████ ", "█   █", "█   █", "█   █", "████ "],
  H: ["█   █", "█   █", "█████", "█   █", "█   █"],
  N: ["█   █", "██  █", "█ █ █", "█  ██", "█   █"],
  ".": ["     ", "     ", "     ", "     ", "  █  "],
  " ": ["   ", "   ", "   ", "   ", "   "],
};

export function banner(text: string): string {
  const rows = ["", "", "", "", ""];
  for (const ch of text.toUpperCase()) {
    const g = GLYPHS[ch];
    for (let r = 0; r < 5; r++) rows[r] += (g ? g[r] : ch.padEnd(5)) + " ";
  }
  return rows.map((r) => r.replace(/\s+$/, "")).join("\n");
}

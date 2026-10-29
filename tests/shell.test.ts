import { describe, expect, it } from "vitest";
import { runLine, complete, COMMANDS, type ShellCtx } from "../src/terminal/lib/shell";
import { caseStudies } from "../src/terminal/data/work";

const ctx = (): ShellCtx => ({ history: [], remote: false });
const run = (line: string) => runLine(line, ctx());
const text = (line: string) => run(line).lines.map((l) => l.text).join("\n");

describe("terminal shell", () => {
  it("echoes the command line first", () => {
    const { lines } = run("help");
    expect(lines[0]).toMatchObject({ text: "$ help", cls: "cmd" });
  });

  it("help lists the command groups", () => {
    const out = text("help");
    expect(out).toContain("available commands");
    for (const group of ["navigate", "read", "network", "play", "display"]) expect(out).toContain(group);
    expect(out).toContain("whoami");
  });

  it("whoami prints the handle", () => {
    const out = text("whoami");
    expect(out).toContain("sree_vardhan_v");
  });

  it("ls work lists every case study", () => {
    const out = text("ls work");
    expect(out).toContain(`${caseStudies.length} case studies`);
    for (const cs of caseStudies) expect(out).toContain(`${cs.slug}/`);
  });

  it("stats prints the portfolio metrics", () => {
    const out = text("stats");
    expect(out).toContain("portfolio metrics");
    expect(out).toContain("case studies");
    expect(out).toContain("public repos");
  });

  it("rejects unknown commands with an error line", () => {
    const { lines, effects } = run("definitely-not-a-command");
    const err = lines.find((l) => l.cls === "red");
    expect(err?.text).toContain("command not found");
    expect(effects).toEqual([]);
  });

  it("pipes into grep", () => {
    const out = text("ls work | grep extension-ai");
    expect(out).toContain("extension-ai/");
    expect(out).not.toContain("ai-code-reviewer/");
  });

  it("tab-completes a unique prefix", () => {
    expect(complete("whoa")).toEqual({ matches: ["whoami"], value: "whoami " });
    expect(COMMANDS).toContain("neofetch");
  });
});

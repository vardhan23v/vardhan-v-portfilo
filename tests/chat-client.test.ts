import { describe, expect, it, vi } from "vitest";
import { ChatError, parseEventStream, prepareHistory, streamAnswer } from "../src/lib/ai/chatService";
import { parseInline, parseMarkdown, safeHref } from "../src/lib/ai/markdown";
import { localIntent } from "../src/mac/lib/aiIntents";
import { featuredProjects } from "../src/classic/data/projects";
import { streamChat } from "../api/_lib/chat";
import { RAG_CFG, ScriptedLLM, indexedPortfolio } from "./rag-helpers";

/** A body that arrives in awkward byte-sized pieces, splitting frames and UTF-8 sequences. */
function chunkedBody(text: string, size = 5) {
  const bytes = new TextEncoder().encode(text);
  return new ReadableStream<Uint8Array>({
    start(c) { for (let i = 0; i < bytes.length; i += size) c.enqueue(bytes.slice(i, i + size)); c.close(); },
  });
}

describe("streaming client", () => {
  it("parses SSE frames split across chunks", async () => {
    const raw = 'data: {"type":"token","text":"Héllo "}\n\ndata: {"type":"token","text":"wörld"}\n\ndata: {"type":"done","supported":true}\n\n';
    const events = [];
    for await (const e of parseEventStream(chunkedBody(raw, 3))) events.push(e);
    expect(events.map((e) => (e.type === "token" ? e.text : e.type)).join("")).toBe("Héllo wörlddone");
  });

  it("streams tokens end-to-end from the server pipeline with citations", async () => {
    const deps = await indexedPortfolio();
    const llm = new ScriptedLLM("Extension AI generates Chrome extensions [1].");
    const fetchImpl = vi.fn(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body));
      return new Response(streamChat(body, { ...deps, llm, cfg: RAG_CFG }), { status: 200, headers: { "Content-Type": "text/event-stream" } });
    });
    const seen: string[] = [];
    const r = await streamAnswer({
      messages: [{ role: "user", content: "Tell me about Extension AI" }],
      sessionId: "session1234",
      surface: "mac",
      fetchImpl: fetchImpl as unknown as typeof fetch,
      onToken: (_d, full) => seen.push(full),
    });
    expect(seen.length).toBeGreaterThan(2);
    expect(r.text).toBe("Extension AI generates Chrome extensions [1].");
    expect(r.sources).toHaveLength(1);
    expect(r.supported).toBe(true);
  });

  it("surfaces server errors and missing backends as ChatError", async () => {
    const err429 = vi.fn(async () => Response.json({ error: { code: "rate_limited", message: "Slow down" } }, { status: 429 }));
    await expect(streamAnswer({ messages: [{ role: "user", content: "x" }], sessionId: "session1234", surface: "global", fetchImpl: err429 as unknown as typeof fetch })).rejects.toMatchObject({ code: "rate_limited", message: "Slow down" });
    const notFound = vi.fn(async () => new Response("<html>", { status: 404 }));
    await expect(streamAnswer({ messages: [{ role: "user", content: "x" }], sessionId: "session1234", surface: "global", fetchImpl: notFound as unknown as typeof fetch })).rejects.toBeInstanceOf(ChatError);
    const cut = vi.fn(async () => new Response(chunkedBody('data: {"type":"token","text":"half"}\n\n'), { status: 200 }));
    await expect(streamAnswer({ messages: [{ role: "user", content: "x" }], sessionId: "session1234", surface: "global", fetchImpl: cut as unknown as typeof fetch })).rejects.toMatchObject({ code: "stream" });
  });

  it("keeps conversation context bounded and user-first", () => {
    const many = Array.from({ length: 21 }, (_, i) => ({ role: (i % 2 ? "assistant" : "user") as "user" | "assistant", content: `m${i}` }));
    const h = prepareHistory(many);
    expect(h.length).toBeLessThanOrEqual(12);
    expect(h[0].role).toBe("user");
    expect(h.at(-1)!.content).toBe("m20");
  });
});

describe("markdown", () => {
  it("only links safe URLs", () => {
    expect(safeHref("javascript:alert(1)")).toBeNull();
    expect(safeHref("data:text/html,x")).toBeNull();
    expect(safeHref("//evil.com")).toBeNull();
    expect(safeHref("https://github.com/vardhan23v")).toBe("https://github.com/vardhan23v");
    expect(safeHref("app:projects")).toBe("app:projects");
    expect(parseInline("[x](javascript:alert(1))")).toEqual([{ t: "text", v: "x" }, { t: "text", v: ")" }]);
  });
  it("parses lists, bold, code and citations", () => {
    const b = parseMarkdown("**Stack** [1]\n\n- React `19`\n- Node [2, 3]");
    expect(b[0]).toEqual({ t: "p", c: [{ t: "strong", c: [{ t: "text", v: "Stack" }] }, { t: "text", v: " " }, { t: "cite", n: 1 }] });
    expect(b[1].t).toBe("ul");
  });
});

describe("macOS AI local navigation intents", () => {
  it.each([
    ["open projects", "projects"], ["Open Settings", "settings"], ["open terminal", "terminal"],
    ["go to experience", "experience"], ["show skills", "skills"], ["open achievements", "achievements"],
    ["launch the finder app", "finder"],
  ])("%s → %s", (q, app) => expect(localIntent(q)?.open).toBe(app));

  it("opens a project by name with its real links", () => {
    const p = featuredProjects[0];
    const r = localIntent(`open ${p.name}`)!;
    expect(r.open).toBe("projects");
    expect(r.text).toContain(p.github);
  });

  it("sends factual questions to the RAG backend", () => {
    expect(localIntent("Tell me about HPL Auction")).toBeNull();
    expect(localIntent("How can I contact him?")).toBeNull();
    expect(localIntent("open the pod bay doors")).toBeNull();
  });
});

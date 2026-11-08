import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RateLimiter } from "../api/_lib/rateLimit";
import { parseChatRequest } from "../api/_lib/validation";
import { resetConfigCache } from "../api/_lib/config";
import { requireAdmin } from "../api/_lib/auth";
import { redact } from "../api/_lib/errors";
import { redactPhones } from "../api/_lib/ingest/pdf";

const ORIGIN = "https://vardhan-v-portfilo.vercel.app";
const ENV_KEYS = ["GROQ_API_KEY", "ADMIN_TOKEN", "CRON_SECRET", "RATE_LIMIT_PER_MINUTE", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];

function chatReq(body: unknown, init: { origin?: string; type?: string; ip?: string } = {}) {
  return new Request("https://vardhan-v-portfilo.vercel.app/api/chat", {
    method: "POST",
    headers: { "Content-Type": init.type ?? "application/json", Origin: init.origin ?? ORIGIN, "x-forwarded-for": init.ip ?? "1.2.3.4" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}
const valid = (content = "Tell me about Extension AI", sessionId = "session1234") => ({ messages: [{ role: "user", content }], sessionId, surface: "global" });

describe("chat request validation", () => {
  it("accepts a well-formed request and strips control/bidi characters", () => {
    const r = parseChatRequest(valid("hi‮there\u0007"));
    expect(r.messages[0].content).toBe("hithere");
  });
  it.each([
    ["no messages", { messages: [], sessionId: "session1234" }],
    ["bad role", { messages: [{ role: "system", content: "x" }], sessionId: "session1234" }],
    ["last turn not user", { messages: [{ role: "user", content: "a" }, { role: "assistant", content: "b" }], sessionId: "session1234" }],
    ["bad session id", { messages: [{ role: "user", content: "a" }], sessionId: "../../etc" }],
    ["too long", valid("x".repeat(1501))],
    ["too many turns", { messages: Array.from({ length: 13 }, () => ({ role: "user", content: "a" })), sessionId: "session1234" }],
  ])("rejects %s", (_n, body) => {
    expect(() => parseChatRequest(body)).toThrow();
  });
});

describe("rate limiter", () => {
  it("limits per minute, then recovers", () => {
    let t = 0;
    const rl = new RateLimiter(3, 100, () => t);
    for (let i = 0; i < 3; i++) rl.hit(["ip:a"]);
    expect(() => rl.hit(["ip:a"])).toThrow(/too quickly/);
    expect(() => rl.hit(["ip:b"])).not.toThrow();
    t += 60_001;
    expect(() => rl.hit(["ip:a"])).not.toThrow();
  });
  it("enforces a daily cap and limits by session as well as IP", () => {
    let t = 0;
    const rl = new RateLimiter(100, 2, () => t);
    rl.hit(["ip:a", "s:1"]);
    rl.hit(["ip:b", "s:1"]);
    expect(() => rl.hit(["ip:c", "s:1"])).toThrow(/Daily/);
  });
});

describe("/api/chat handler", () => {
  const saved: Record<string, string | undefined> = {};
  beforeEach(() => {
    for (const k of ENV_KEYS) { saved[k] = process.env[k]; delete process.env[k]; }
    process.env.RATE_LIMIT_PER_MINUTE = "3";
    resetConfigCache();
    vi.resetModules();
  });
  afterEach(() => {
    for (const k of ENV_KEYS) { if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k]; }
    resetConfigCache();
  });

  it("rejects foreign origins (CORS)", async () => {
    const { POST } = await import("../api/chat");
    const res = await POST(chatReq(valid(), { origin: "https://evil.example" }));
    expect(res.status).toBe(403);
    expect(res.headers.get("access-control-allow-origin")).toBeNull();
  });

  it("answers preflight for allowed origins only", async () => {
    const { OPTIONS } = await import("../api/chat");
    const ok = OPTIONS(new Request(`${ORIGIN}/api/chat`, { method: "OPTIONS", headers: { Origin: ORIGIN } }));
    expect(ok.status).toBe(204);
    expect(ok.headers.get("access-control-allow-origin")).toBe(ORIGIN);
    const bad = OPTIONS(new Request(`${ORIGIN}/api/chat`, { method: "OPTIONS", headers: { Origin: "https://evil.example" } }));
    expect(bad.status).toBe(403);
  });

  it("requires JSON, caps body size and validates", async () => {
    const { POST } = await import("../api/chat");
    expect((await POST(chatReq("hello", { type: "text/plain" }))).status).toBe(415);
    expect((await POST(chatReq("{not json"))).status).toBe(400);
    expect((await POST(chatReq({ ...valid(), pad: "x".repeat(40_000) }))).status).toBe(413);
    const bad = await POST(chatReq({ messages: [{ role: "system", content: "x" }], sessionId: "session1234" }));
    expect(bad.status).toBe(400);
    expect(bad.headers.get("x-content-type-options")).toBe("nosniff");
    expect(bad.headers.get("cache-control")).toBe("no-store");
  });

  it("rate limits by IP with 429 + Retry-After", async () => {
    const { POST } = await import("../api/chat");
    const codes: number[] = [];
    for (let i = 0; i < 4; i++) codes.push((await POST(chatReq(valid("hi", `sess${i}abcdef`), { ip: "9.9.9.9" }))).status);
    // First three pass validation + limiter and stop at "not configured" (no Groq key in tests).
    expect(codes.slice(0, 3)).toEqual([503, 503, 503]);
    expect(codes[3]).toBe(429);
  });

  it("returns a sanitized error when not configured", async () => {
    const { POST } = await import("../api/chat");
    const res = await POST(chatReq(valid()));
    const body = await res.json();
    expect(res.status).toBe(503);
    expect(body.error.message).toBe("The assistant is not configured yet.");
  });
});

describe("admin authentication", () => {
  const req = (auth?: string) => new Request("https://x/api/admin/sync", { headers: auth ? { Authorization: auth } : {} });
  beforeEach(() => { delete process.env.ADMIN_TOKEN; delete process.env.CRON_SECRET; resetConfigCache(); });
  afterEach(() => { delete process.env.ADMIN_TOKEN; delete process.env.CRON_SECRET; resetConfigCache(); });

  it("is disabled when no secret is configured", () => {
    expect(() => requireAdmin(req("Bearer anything"))).toThrow(/not configured/);
  });
  it("accepts only the exact admin token or cron secret", () => {
    process.env.ADMIN_TOKEN = "a".repeat(32);
    process.env.CRON_SECRET = "c".repeat(20);
    resetConfigCache();
    expect(requireAdmin(req(`Bearer ${"a".repeat(32)}`))).toBe("admin");
    expect(requireAdmin(req(`Bearer ${"c".repeat(20)}`))).toBe("cron");
    expect(() => requireAdmin(req(`Bearer ${"a".repeat(31)}`))).toThrow(/Unauthorized/);
    expect(() => requireAdmin(req())).toThrow(/Unauthorized/);
  });
  it("public visitors cannot trigger sync, upload or status", async () => {
    process.env.ADMIN_TOKEN = "a".repeat(32);
    resetConfigCache();
    vi.resetModules();
    const sync = await import("../api/admin/sync");
    const resume = await import("../api/admin/resume");
    const status = await import("../api/admin/status");
    expect((await sync.GET(req())).status).toBe(401);
    expect((await sync.POST(new Request("https://x/api/admin/sync", { method: "POST", body: "{}", headers: { "Content-Type": "application/json" } }))).status).toBe(401);
    expect((await resume.POST(new Request("https://x/api/admin/resume", { method: "POST", body: "%PDF-", headers: { "Content-Type": "application/pdf" } }))).status).toBe(401);
    expect((await status.GET(req("Bearer wrong"))).status).toBe(401);
  });
  it("upload requires a PDF content type even for admins", async () => {
    process.env.ADMIN_TOKEN = "a".repeat(32);
    resetConfigCache();
    const resume = await import("../api/admin/resume");
    const res = await resume.POST(new Request("https://x/api/admin/resume", { method: "POST", body: "hello", headers: { "Content-Type": "text/plain", Authorization: `Bearer ${"a".repeat(32)}` } }));
    expect(res.status).toBe(415);
  });
});

describe("sanitization", () => {
  it("redacts secrets from logs", () => {
    expect(redact("failed with gsk_abcdefghijklmnop and Bearer xyz.123")).toBe("failed with [redacted] and Bearer [redacted]");
  });
  it("removes phone numbers from resume text but keeps years", () => {
    expect(redactPhones("+91 98859 23035 | 2024 — 2028")).toBe("[phone removed] | 2024 — 2028");
  });
});

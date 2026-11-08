import { z } from "zod";
import { CHAT_LIMITS } from "../../src/lib/ai/types.js";
import { AppError } from "./errors.js";

// Strip control characters (except newline/tab) that can smuggle hidden instructions.
// eslint-disable-next-line no-control-regex
const clean = (s: string) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮⁦-⁩]/g, "").trim();

export const chatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().transform(clean).pipe(z.string().min(1).max(CHAT_LIMITS.maxMessageChars * 3)),
      }),
    )
    .min(1)
    .max(CHAT_LIMITS.maxMessages),
  sessionId: z.string().regex(/^[A-Za-z0-9_-]{8,64}$/),
  surface: z.enum(["global", "mac"]).default("global"),
}).superRefine((v, ctx) => {
  const last = v.messages[v.messages.length - 1];
  if (last.role !== "user") ctx.addIssue({ code: "custom", message: "Last message must be from the user." });
  if (last.content.length > CHAT_LIMITS.maxMessageChars) ctx.addIssue({ code: "custom", message: "Message is too long." });
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;

export function parseChatRequest(body: unknown): ChatRequest {
  const r = chatRequestSchema.safeParse(body);
  if (!r.success) {
    const tooLong = r.error.issues.some((i) => /too long|too_big/i.test(i.message + i.code));
    throw new AppError(400, "invalid_request", tooLong ? `Messages are limited to ${CHAT_LIMITS.maxMessageChars} characters.` : "Invalid chat request.");
  }
  return r.data;
}

export const syncRequestSchema = z.object({
  sources: z.array(z.enum(["portfolio", "github", "resume"])).min(1).default(["portfolio", "github", "resume"]),
  /** Re-embed even when content hashes are unchanged. */
  force: z.boolean().default(false),
});

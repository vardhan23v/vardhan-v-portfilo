/**
 * Wire types shared by the browser chat service and the /api/chat serverless function.
 * Keep this file dependency-free: it is imported from both src/ and api/.
 */
export type SourceType = "portfolio" | "github" | "resume";

export const SOURCE_LABEL: Record<SourceType, string> = {
  portfolio: "Portfolio",
  github: "GitHub",
  resume: "Resume",
};

/** One retrieved chunk that was actually placed in the model's context. */
export interface SourceRef {
  /** Citation number used in the answer, e.g. [1]. */
  n: number;
  chunkId: string;
  title: string;
  category: SourceType;
  url?: string;
  /** Portfolio section ("project", "experience" …) or resume section. */
  section?: string;
  /** GitHub repository name, when the source is a repository file. */
  repo?: string;
  path?: string;
  chunkIndex: number;
  similarity: number;
}

export type ChatRole = "user" | "assistant";

export interface ChatTurn {
  role: ChatRole;
  content: string;
}

export type ChatSurface = "global" | "mac";

export interface ChatRequestBody {
  messages: ChatTurn[];
  sessionId: string;
  surface: ChatSurface;
}

/** Server-sent events emitted by /api/chat, one JSON object per `data:` line. */
export type ChatStreamEvent =
  | { type: "sources"; sources: SourceRef[] }
  | { type: "token"; text: string }
  | { type: "done"; supported: boolean }
  | { type: "error"; code: string; message: string };

export const UNSUPPORTED_ANSWER =
  "I don't have verified information about that in Vardhan's portfolio. Please contact him for more details.";

export const CHAT_LIMITS = {
  maxMessageChars: 1500,
  maxMessages: 12,
  maxBodyBytes: 32 * 1024,
} as const;

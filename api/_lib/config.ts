import { z } from "zod";

/** Server-only configuration. Never import this from src/ — nothing here may reach the browser. */
const schema = z.object({
  GROQ_API_KEY: z.string().min(1).optional(),
  GROQ_MODEL: z.string().default("openai/gpt-oss-120b"),
  GROQ_FALLBACK_MODEL: z.string().default("openai/gpt-oss-20b"),
  GROQ_BACKUP_MODEL: z.string().default("qwen/qwen3.8-27b"),
  GROQ_TIMEOUT_MS: z.coerce.number().int().positive().default(25_000),

  EMBEDDING_PROVIDER: z.enum(["openai", "hash"]).default("openai"),
  EMBEDDING_API_KEY: z.string().min(1).optional(),
  EMBEDDING_BASE_URL: z.string().url().default("https://api.openai.com/v1"),
  EMBEDDING_MODEL: z.string().default("text-embedding-3-small"),
  EMBEDDING_DIMENSIONS: z.coerce.number().int().positive().default(1024),

  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  GITHUB_USERNAME: z.string().default("vardhan23v"),
  GITHUB_TOKEN: z.string().min(1).optional(),

  ADMIN_TOKEN: z.string().min(24).optional(),
  CRON_SECRET: z.string().min(16).optional(),

  SITE_URL: z.string().url().default("https://vardhan-v-portfilo.vercel.app"),
  ALLOWED_ORIGINS: z.string().default(""),

  RAG_TOP_K: z.coerce.number().int().min(1).max(20).default(7),
  RAG_SIMILARITY_THRESHOLD: z.coerce.number().min(0).max(1).default(0.3),
  RAG_CHUNK_TOKENS: z.coerce.number().int().min(100).default(700),
  RAG_CHUNK_OVERLAP: z.coerce.number().int().min(0).default(100),
  RAG_MAX_CONTEXT_TOKENS: z.coerce.number().int().min(500).default(2800),

  RATE_LIMIT_PER_MINUTE: z.coerce.number().int().positive().default(10),
  RATE_LIMIT_PER_DAY: z.coerce.number().int().positive().default(150),
});

export type ServerConfig = z.infer<typeof schema>;

let cached: ServerConfig | null = null;

export function getConfig(env: Record<string, string | undefined> = process.env): ServerConfig {
  if (env === process.env && cached) return cached;
  // Treat empty strings as unset so a blank Vercel variable falls back to the default.
  const clean = Object.fromEntries(Object.entries(env).filter(([, v]) => v !== undefined && v !== ""));
  const parsed = schema.parse(clean);
  if (env === process.env) cached = parsed;
  return parsed;
}

export function resetConfigCache() {
  cached = null;
}

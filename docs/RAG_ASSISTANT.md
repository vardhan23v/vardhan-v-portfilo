# Vardhan AI: RAG portfolio assistant

Vardhan AI answers visitors' questions from three verified sources: the portfolio's own TypeScript data, Vardhan's public GitHub repositories, and his resume. Each answer cites the chunks it used.

There are two surfaces and one backend:

| Surface | Where | Code |
|---|---|---|
| Global floating assistant | Every edition (bottom-left launcher) | `src/components/ai/*` mounted in `src/App.tsx` |
| macOS Messages app | `/mac` → Vardhan AI | `src/mac/apps/VardhanAIApp.tsx` |
| Shared client and types | Both surfaces | `src/lib/ai/{chatService,useChat,types,markdown}.ts` |
| Serverless API | Vercel `api/` | `api/chat.ts`, `api/admin/{sync,resume,status}.ts`, `api/_lib/*` |

## Pipeline

```
question → normalize → embed → pgvector search (top K×4, threshold)
        → exact project-name boost + source-preference boost → relative cut-off
        → dedupe + token budget → top K (5) → numbered <source> blocks
        → Groq (streamed) → SSE tokens → cited sources → done
```

- **No evidence, no model call.** If nothing passes the similarity threshold, the API streams the fixed answer *"I don't have verified information about that in Vardhan's portfolio. Please contact him for more details."* and does not call Groq.
- **Citations are filtered.** Sources are sent after the answer, and only the ones whose `[n]` appears in it. A citation number the model was never given is dropped, and an "unsupported" reply carries no sources.
- **Prompt-injection defenses:**
  - Retrieved text is wrapped in `<source>` blocks and marked as untrusted data.
  - Delimiter-breaking tags are stripped, and lines that read like instructions are prefixed as quoted text.
  - Control and bidi characters are removed from user input.
  - The system rules forbid following instructions found in sources.
- **Navigation stays local.** In the macOS app, "open projects / settings / terminal / experience / skills / achievements" (and "open <project>") are handled in `src/mac/lib/aiIntents.ts` without a network call.

## Knowledge sources

| Source | Built from | Incremental key |
|---|---|---|
| `portfolio` | `src/classic/data/{site,projects,experience,skills}.ts`, plus case studies from `src/terminal/data/work.ts` | Content hash per document |
| `github` | GitHub REST API: repo metadata, topics, languages, README/docs, manifests and up to 6 entry-point source files per repo | Git tree SHA per repo; unchanged repos are skipped |
| `resume` | `public/resume/resume.pdf` (fetched from `SITE_URL`), split into sections; phone numbers removed | Content hash per section |
| `resume` (upload) | `POST /api/admin/resume` (admin only); the text is indexed but the file is never stored | Replaced on each upload |

GitHub sync skips forks and private repos. It also skips these paths: `node_modules`, `dist`, `build`, generated folders, lockfiles, `.env*`, keys/secrets, binaries/media, minified files and files over 60 KB. Credential-looking strings are redacted before embedding. Listing is paginated (100 per page). On a rate limit, sync waits if the reset is under 60 seconds; otherwise it fails that source cleanly and the next run picks it up.

## 1. Supabase setup

1. Create a Supabase project. Then go to **Database → Extensions** and make sure `vector` is available. The migration enables it.
2. Run the migration in one of two ways:
   - **Dashboard:** open **SQL Editor**, paste `supabase/migrations/20261107000000_portfolio_rag.sql`, and run it.
   - **CLI:**
     ```bash
     supabase link --project-ref <ref>
     ```
     ```bash
     supabase db push
     ```
3. Copy **Project URL** → `SUPABASE_URL`, and **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`. Both are server-only.

The migration creates:

- **Tables:** `documents`, `document_chunks` (`vector(1024)` with an HNSW cosine index), `ingestion_jobs`, `chat_sessions` and `chat_messages`. All IDs are UUIDs, with JSONB metadata, `updated_at` triggers and GIN metadata indexes.
- **Function:** `match_document_chunks(...)`. It runs as security invoker with a fixed `search_path`, and only `service_role` may execute it.
- **Access control:** RLS is enabled on every table with no policies, and table grants are revoked from `anon` and `authenticated`. The public anon key cannot read the knowledge base or the chat logs.

> Changing embedding dimensions? Add a migration like `20261108000000_embeddings_1024.sql` that changes the column and function argument and set `EMBEDDING_DIMENSIONS` to match, then run a forced re-sync.

## 2. Groq

Create a key at console.groq.com and set `GROQ_API_KEY`. The model comes from `GROQ_MODEL` (default `openai/gpt-oss-120b`). When it is rate-limited, chat moves to `GROQ_FALLBACK_MODEL` (default `openai/gpt-oss-20b`), then `GROQ_BACKUP_MODEL` (default `qwen/qwen3.8-27b`).

The provider is `api/_lib/llm/groq.ts`, behind the `LLMProvider` interface in `api/_lib/llm/types.ts`. To switch vendors, add another implementation. The provider handles:

- **Streaming**
- **Timeouts:** `GROQ_TIMEOUT_MS`
- **Retries:** two, with backoff, on 408/409/429/5xx. Groq's own 429 becomes a friendly "busy" message.
- **Error handling:** raw errors are sanitized and never shown to visitors.

## 3. Embeddings

Embeddings are independent of Groq. `api/_lib/embeddings/openai.ts` works with any OpenAI-compatible `/embeddings` endpoint. Production uses Jina `jina-embeddings-v3` at 1024 dimensions through `https://api.jina.ai/v1`. Each provider implements `embedText()`, `embedDocuments()` and `getDimensions()`, and returned dimensions are checked against the config.

`EMBEDDING_PROVIDER=hash` is a deterministic offline embedder for tests and local experiments only. It is **not** for production.

## 4. GitHub token (recommended)

Create a fine-grained personal access token with **Public repositories (read-only)** and no other permissions, then set it as `GITHUB_TOKEN`. Without a token, sync still works but is limited to 60 requests/hour.

## 5. Admin token and ingestion

Generate an admin token:

```bash
openssl rand -hex 32
```

Set it as `ADMIN_TOKEN`. Then run the first full sync:

```bash
curl -X POST https://vardhan-v-portfilo.vercel.app/api/admin/sync -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" -d '{"sources":["portfolio","resume","github"]}'
```

To sync one source, or to force a full re-embed:

```bash
curl -X POST https://vardhan-v-portfilo.vercel.app/api/admin/sync -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" -d '{"sources":["github"],"force":true}'
```

To upload a resume PDF (max 5 MB, `%PDF` magic bytes checked):

```bash
curl -X POST https://vardhan-v-portfilo.vercel.app/api/admin/resume -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/pdf" --data-binary @resume.pdf
```

To check index health (document counts, chunk count, last jobs, active config):

```bash
curl https://vardhan-v-portfilo.vercel.app/api/admin/status -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Automatic indexing:** `vercel.json` schedules `GET /api/admin/sync` daily at 03:00 UTC. Vercel sends `Authorization: Bearer $CRON_SECRET`, so set `CRON_SECRET` in the project. Each run is incremental, so after you edit `src/classic/data/*` and deploy, the next run re-embeds only what changed. To index immediately, run the manual sync above. Cron can only `GET` (incremental). Forced syncs and uploads need `ADMIN_TOKEN`.

## 6. Local development

`npm run dev` (Vite) serves only the frontend. With no `/api`, the assistant shows a friendly "isn't available on this deployment yet" error with Retry. To run the functions locally:

```bash
npm i -g vercel
```

```bash
vercel link
```

```bash
vercel env pull .env.local
```

```bash
vercel dev
```

Then trigger a sync against `http://localhost:3000/api/admin/sync` with your admin token.

## 7. Vercel deployment checklist

1. Run the Supabase migration (step 1).
2. In Vercel → Project → Settings → Environment Variables, set (Production + Preview):
   - **Required:** `GROQ_API_KEY`, `EMBEDDING_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_TOKEN`, `CRON_SECRET`
   - **Optional:** `GITHUB_TOKEN`, `GROQ_MODEL`, `GROQ_FALLBACK_MODEL`, `GROQ_BACKUP_MODEL`, `ALLOWED_ORIGINS` (preview/custom domains), `RAG_*`, `RATE_LIMIT_*`
   - **None** of these may start with `VITE_`.
3. Deploy. `api/*.ts` become Node serverless functions automatically. Folders starting with `_` are not routes.
4. Run the first manual sync (step 5) and check `/api/admin/status`.
5. Ask the global assistant and the macOS Messages app a project question, and confirm the answer streams with sources.
6. Ask something off-portfolio, such as "what's his salary?", and confirm the "no verified information" reply.

## Security summary

- **Request limits:** Zod validation on every body; a 32 KB cap on chat bodies; at most 12 turns, each user message capped at 1,500 characters.
- **Rate limiting:** per IP hash and per session (default 10/min, 150/day). The limiter is per function instance, which bounds bursts. Swap in a shared store such as Upstash if a global limit is ever needed.
- **CORS:** allows `SITE_URL`, `ALLOWED_ORIGINS` and, outside production, localhost. Other origins get 403.
- **Headers:** responses send `nosniff`, `DENY` framing, a `default-src 'none'` CSP and `no-store`.
- **Admin auth:** admin routes require a bearer token, compared in constant time. Admin is disabled entirely when no token is configured. Cron can only run incremental syncs.
- **Error handling:** visitors see sanitized public messages. Server logs redact keys and bearer tokens.
- **Database:** no SQL is built from user input, and only the fixed `match_document_chunks` RPC is called.

## Tests

```bash
npm test -- --run
```

This covers embeddings, chunking, incremental ingestion, retrieval relevance and exact project matching, citations, unsupported questions, prompt injection, SSE streaming (frames split mid-UTF-8), API validation, CORS, size limits, rate limiting, admin auth, GitHub filtering/pagination/rate limits, resume PDF parsing and macOS navigation intents.

```bash
npm run smoke
```

This checks every route boots with the launcher present, plus assistant UI checks on desktop, a 375 px mobile sheet and `/mac`:

- Focus and Escape behaviour
- Enter to send
- Digits typed in the panel don't switch editions
- The error and retry state
- Clearing the conversation

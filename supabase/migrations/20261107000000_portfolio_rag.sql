-- Portfolio RAG assistant: knowledge store + chat log.
-- Embedding dimension (1536) must match EMBEDDING_DIMENSIONS on the server.

create extension if not exists vector;
create extension if not exists pgcrypto;

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  source_type text not null check (source_type in ('portfolio', 'github', 'resume')),
  source_id text not null,               -- stable key, e.g. "portfolio:project:extension-ai", "github:repo/path"
  title text not null,
  source_url text,
  content_hash text not null,            -- sha256 of the normalized content
  version text,                          -- commit SHA / blob SHA where available
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_type, source_id)
);

create table if not exists public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  chunk_index int not null,
  content text not null,
  token_count int not null,
  content_hash text not null,
  embedding vector(1536) not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (document_id, chunk_index)
);

create table if not exists public.ingestion_jobs (
  id uuid primary key default gen_random_uuid(),
  source_type text not null,
  status text not null default 'running' check (status in ('running', 'succeeded', 'failed')),
  stats jsonb not null default '{}'::jsonb,
  error text,
  metadata jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  client_session_id text not null unique,
  ip_hash text,
  surface text,                          -- "global" | "mac"
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  sources jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists documents_source_type_idx on public.documents (source_type);
create index if not exists documents_metadata_idx on public.documents using gin (metadata);
create index if not exists document_chunks_document_idx on public.document_chunks (document_id);
create index if not exists document_chunks_metadata_idx on public.document_chunks using gin (metadata);
create index if not exists document_chunks_embedding_idx on public.document_chunks
  using hnsw (embedding vector_cosine_ops);
create index if not exists chat_messages_session_idx on public.chat_messages (session_id, created_at);

create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;

do $$
declare t text;
begin
  foreach t in array array['documents','document_chunks','ingestion_jobs','chat_sessions','chat_messages'] loop
    execute format('drop trigger if exists %I_touch on public.%I', t, t);
    execute format('create trigger %I_touch before update on public.%I for each row execute function public.touch_updated_at()', t, t);
  end loop;
end $$;

-- Similarity search. SECURITY INVOKER + fixed search_path; only service_role may execute it.
create or replace function public.match_document_chunks(
  query_embedding vector(1536),
  match_count int default 5,
  similarity_threshold float default 0.3,
  filter_source_types text[] default null
)
returns table (
  chunk_id uuid,
  document_id uuid,
  content text,
  chunk_metadata jsonb,
  title text,
  source_type text,
  source_url text,
  document_metadata jsonb,
  similarity float
)
language sql stable security invoker set search_path = public, extensions as $$
  select c.id, d.id, c.content, c.metadata, d.title, d.source_type, d.source_url, d.metadata,
         1 - (c.embedding <=> query_embedding) as similarity
  from public.document_chunks c
  join public.documents d on d.id = c.document_id
  where (filter_source_types is null or d.source_type = any(filter_source_types))
    and 1 - (c.embedding <=> query_embedding) >= similarity_threshold
  order by c.embedding <=> query_embedding
  limit least(greatest(match_count, 1), 50);
$$;

revoke all on function public.match_document_chunks(vector, int, float, text[]) from public, anon, authenticated;
grant execute on function public.match_document_chunks(vector, int, float, text[]) to service_role;

-- RLS on, no policies: anon/authenticated get nothing. service_role bypasses RLS.
alter table public.documents enable row level security;
alter table public.document_chunks enable row level security;
alter table public.ingestion_jobs enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;

revoke all on public.documents, public.document_chunks, public.ingestion_jobs,
  public.chat_sessions, public.chat_messages from anon, authenticated;

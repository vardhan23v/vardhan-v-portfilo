-- Switch embeddings to 1024 dimensions (Jina jina-embeddings-v3). Safe while document_chunks is empty;
-- existing chunks are cleared because vectors of a different size cannot be converted.
-- Afterwards set EMBEDDING_DIMENSIONS=1024 and run a forced sync.
delete from public.document_chunks;
delete from public.documents;
drop index if exists public.document_chunks_embedding_idx;
alter table public.document_chunks alter column embedding type vector(1024);
create index document_chunks_embedding_idx on public.document_chunks using hnsw (embedding vector_cosine_ops);

drop function if exists public.match_document_chunks(vector, int, float, text[]);
create or replace function public.match_document_chunks(
  query_embedding vector(1024),
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

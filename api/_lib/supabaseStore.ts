import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { SourceType } from "../../src/lib/ai/types.js";
import type { ServerConfig } from "./config.js";
import { AppError } from "./errors.js";
import type { ChunkInput, ChunkMatch, KnowledgeDocument, KnowledgeStore, StoredDocument, TermHit } from "./store.js";

/** Supabase/pgvector store. Uses the service-role key, which only exists in server env. */
export class SupabaseStore implements KnowledgeStore {
  private readonly db: SupabaseClient;

  constructor(url: string, serviceRoleKey: string) {
    this.db = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  }

  private check<T>(r: { data: T; error: { message: string } | null }, what: string): T {
    if (r.error) console.error(`[store] ${what}: ${r.error.message}`);
    if (r.error) throw new AppError(502, "store_error", "The knowledge base is unavailable.", { cause: new Error(`${what}: ${r.error.message}`) });
    return r.data;
  }

  async listDocuments(sourceType: SourceType): Promise<StoredDocument[]> {
    const rows = this.check(await this.db.from("documents").select("id, source_type, source_id, content_hash, version").eq("source_type", sourceType), "listDocuments") ?? [];
    return rows.map((r) => ({ id: r.id, sourceType: r.source_type, sourceId: r.source_id, contentHash: r.content_hash, version: r.version }));
  }

  async replaceDocument(doc: KnowledgeDocument & { contentHash: string }, chunks: ChunkInput[]): Promise<string> {
    const row = this.check(
      await this.db.from("documents").upsert(
        { source_type: doc.sourceType, source_id: doc.sourceId, title: doc.title, source_url: doc.sourceUrl ?? null, content_hash: doc.contentHash, version: doc.version ?? null, metadata: doc.metadata },
        { onConflict: "source_type,source_id" },
      ).select("id").single(),
      "upsert document",
    );
    const id = (row as { id: string }).id;
    this.check(await this.db.from("document_chunks").delete().eq("document_id", id), "delete chunks");
    for (let i = 0; i < chunks.length; i += 100) {
      const batch = chunks.slice(i, i + 100).map((c) => ({
        document_id: id, chunk_index: c.chunkIndex, content: c.content, token_count: c.tokenCount,
        content_hash: c.contentHash, embedding: JSON.stringify(c.embedding), metadata: c.metadata,
      }));
      this.check(await this.db.from("document_chunks").upsert(batch, { onConflict: "document_id,chunk_index" }), "insert chunks");
    }
    return id;
  }

  async deleteDocuments(ids: string[]) {
    if (ids.length) this.check(await this.db.from("documents").delete().in("id", ids), "delete documents");
  }

  async matchChunks(embedding: number[], opts: { count: number; threshold: number; sourceTypes?: SourceType[] }): Promise<ChunkMatch[]> {
    const rows = this.check(
      await this.db.rpc("match_document_chunks", {
        query_embedding: JSON.stringify(embedding),
        match_count: opts.count,
        similarity_threshold: opts.threshold,
        filter_source_types: opts.sourceTypes ?? null,
      }),
      "match",
    ) as Record<string, unknown>[] | null;
    return (rows ?? []).map((r) => ({
      chunkId: r.chunk_id as string, documentId: r.document_id as string, content: r.content as string,
      chunkMetadata: (r.chunk_metadata ?? {}) as Record<string, unknown>, title: r.title as string,
      sourceType: r.source_type as SourceType, sourceUrl: r.source_url as string | null,
      documentMetadata: (r.document_metadata ?? {}) as Record<string, unknown>, similarity: Number(r.similarity),
    }));
  }

  async findTerm(term: string, limit: number): Promise<TermHit[]> {
    const pattern = `%${term.replace(/[\\%_]/g, "\\$&")}%`;
    const rows = this.check(
      await this.db.from("document_chunks").select("content, documents!inner(title, source_type, metadata)").ilike("content", pattern).limit(limit),
      "find term",
    ) as unknown as { content: string; documents: { title: string; source_type: SourceType; metadata: Record<string, unknown> } }[] | null;
    return (rows ?? []).map((r) => ({ title: r.documents.title, content: r.content, sourceType: r.documents.source_type, metadata: r.documents.metadata ?? {} }));
  }

  async startJob(sourceType: string, metadata: Record<string, unknown> = {}) {
    const r = this.check(await this.db.from("ingestion_jobs").insert({ source_type: sourceType, metadata }).select("id").single(), "start job");
    return (r as { id: string }).id;
  }

  async finishJob(id: string, status: "succeeded" | "failed", stats: Record<string, unknown>, error?: string) {
    this.check(await this.db.from("ingestion_jobs").update({ status, stats, error: error ?? null, finished_at: new Date().toISOString() }).eq("id", id), "finish job");
  }

  async status() {
    const counts: Record<string, number> = {};
    for (const t of ["portfolio", "github", "resume"]) {
      const r = await this.db.from("documents").select("id", { count: "exact", head: true }).eq("source_type", t);
      counts[t] = r.count ?? 0;
    }
    const chunks = (await this.db.from("document_chunks").select("id", { count: "exact", head: true })).count ?? 0;
    const jobs = this.check(await this.db.from("ingestion_jobs").select("source_type, status, stats, error, started_at, finished_at").order("started_at", { ascending: false }).limit(10), "jobs");
    return { documents: counts, chunks, lastJobs: jobs };
  }

  async logChat(e: { clientSessionId: string; ipHash: string; surface: string; question: string; answer: string; sources: unknown[] }) {
    const s = await this.db.from("chat_sessions").upsert({ client_session_id: e.clientSessionId, ip_hash: e.ipHash, surface: e.surface }, { onConflict: "client_session_id" }).select("id").single();
    if (s.error || !s.data) return;
    await this.db.from("chat_messages").insert([
      { session_id: s.data.id, role: "user", content: e.question },
      { session_id: s.data.id, role: "assistant", content: e.answer, sources: e.sources },
    ]);
  }
}

export function createStore(cfg: ServerConfig): KnowledgeStore {
  if (!cfg.SUPABASE_URL || !cfg.SUPABASE_SERVICE_ROLE_KEY) throw new AppError(503, "not_configured", "The assistant is not configured yet.");
  return new SupabaseStore(cfg.SUPABASE_URL, cfg.SUPABASE_SERVICE_ROLE_KEY);
}

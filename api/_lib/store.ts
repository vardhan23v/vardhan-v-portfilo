import type { SourceType } from "../../src/lib/ai/types.js";

export interface KnowledgeDocument {
  sourceType: SourceType;
  sourceId: string;
  title: string;
  sourceUrl?: string;
  content: string;
  version?: string;
  metadata: Record<string, unknown>;
}

export interface StoredDocument {
  id: string;
  sourceType: SourceType;
  sourceId: string;
  contentHash: string;
  version?: string | null;
}

export interface ChunkInput {
  chunkIndex: number;
  content: string;
  tokenCount: number;
  contentHash: string;
  embedding: number[];
  metadata: Record<string, unknown>;
}

export interface ChunkMatch {
  chunkId: string;
  documentId: string;
  content: string;
  chunkMetadata: Record<string, unknown>;
  title: string;
  sourceType: SourceType;
  sourceUrl?: string | null;
  documentMetadata: Record<string, unknown>;
  similarity: number;
}

export interface KnowledgeStore {
  listDocuments(sourceType: SourceType): Promise<StoredDocument[]>;
  /** Insert/update the document row and replace all of its chunks. Returns the document id. */
  replaceDocument(doc: KnowledgeDocument & { contentHash: string }, chunks: ChunkInput[]): Promise<string>;
  deleteDocuments(ids: string[]): Promise<void>;
  matchChunks(embedding: number[], opts: { count: number; threshold: number; sourceTypes?: SourceType[] }): Promise<ChunkMatch[]>;
  startJob(sourceType: string, metadata?: Record<string, unknown>): Promise<string>;
  finishJob(id: string, status: "succeeded" | "failed", stats: Record<string, unknown>, error?: string): Promise<void>;
  status(): Promise<Record<string, unknown>>;
  logChat?(entry: { clientSessionId: string; ipHash: string; surface: string; question: string; answer: string; sources: unknown[] }): Promise<void>;
}

/** In-process store with cosine similarity — used by tests and EMBEDDING_PROVIDER=hash local runs. */
export class MemoryStore implements KnowledgeStore {
  docs = new Map<string, StoredDocument & KnowledgeDocument>();
  chunks = new Map<string, (ChunkInput & { id: string; documentId: string })[]>();
  jobs: { id: string; status: string; stats: Record<string, unknown> }[] = [];
  private seq = 0;
  private id() { return `00000000-0000-4000-8000-${String(++this.seq).padStart(12, "0")}`; }

  async listDocuments(sourceType: SourceType) {
    return [...this.docs.values()].filter((d) => d.sourceType === sourceType);
  }
  async replaceDocument(doc: KnowledgeDocument & { contentHash: string }, chunks: ChunkInput[]) {
    const existing = [...this.docs.values()].find((d) => d.sourceType === doc.sourceType && d.sourceId === doc.sourceId);
    const id = existing?.id ?? this.id();
    this.docs.set(id, { ...doc, id });
    this.chunks.set(id, chunks.map((c) => ({ ...c, id: this.id(), documentId: id })));
    return id;
  }
  async deleteDocuments(ids: string[]) {
    for (const id of ids) { this.docs.delete(id); this.chunks.delete(id); }
  }
  async matchChunks(embedding: number[], opts: { count: number; threshold: number; sourceTypes?: SourceType[] }) {
    const out: ChunkMatch[] = [];
    for (const [docId, list] of this.chunks) {
      const d = this.docs.get(docId)!;
      if (opts.sourceTypes && !opts.sourceTypes.includes(d.sourceType)) continue;
      for (const c of list) {
        const sim = cosine(embedding, c.embedding);
        if (sim < opts.threshold) continue;
        out.push({ chunkId: c.id, documentId: docId, content: c.content, chunkMetadata: c.metadata, title: d.title, sourceType: d.sourceType, sourceUrl: d.sourceUrl, documentMetadata: d.metadata, similarity: sim });
      }
    }
    return out.sort((a, b) => b.similarity - a.similarity).slice(0, opts.count);
  }
  async startJob() { const id = this.id(); this.jobs.push({ id, status: "running", stats: {} }); return id; }
  async finishJob(id: string, status: "succeeded" | "failed", stats: Record<string, unknown>) {
    const j = this.jobs.find((x) => x.id === id); if (j) { j.status = status; j.stats = stats; }
  }
  async status() {
    const counts: Record<string, number> = {};
    for (const d of this.docs.values()) counts[d.sourceType] = (counts[d.sourceType] ?? 0) + 1;
    return { documents: counts, chunks: [...this.chunks.values()].reduce((n, l) => n + l.length, 0), lastJobs: this.jobs.slice(-5) };
  }
}

export function cosine(a: number[], b: number[]) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

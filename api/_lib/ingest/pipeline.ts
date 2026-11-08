import type { SourceType } from "../../../src/lib/ai/types.js";
import { chunkText, estimateTokens } from "../chunking.js";
import type { EmbeddingProvider } from "../embeddings/types.js";
import { sha256 } from "../hash.js";
import type { KnowledgeDocument, KnowledgeStore } from "../store.js";

export interface IngestStats { sourceType: SourceType; seen: number; embedded: number; unchanged: number; deleted: number; chunks: number }

export function documentHash(d: KnowledgeDocument) {
  return sha256(JSON.stringify([d.title, d.sourceUrl ?? "", d.content, d.metadata]));
}

/**
 * Incremental ingestion: a document is re-chunked and re-embedded only when its content hash
 * changed (or `force`). Documents of this source type that were not seen are pruned — unless
 * `keep(sourceId)` says they belong to a part of the source that was intentionally skipped.
 */
export async function ingestDocuments(
  sourceType: SourceType,
  docs: KnowledgeDocument[],
  deps: { store: KnowledgeStore; embedder: EmbeddingProvider },
  opts: { force?: boolean; chunkTokens: number; overlapTokens: number; prune?: boolean; keep?: (sourceId: string) => boolean },
): Promise<IngestStats> {
  const stats: IngestStats = { sourceType, seen: 0, embedded: 0, unchanged: 0, deleted: 0, chunks: 0 };
  const existing = new Map((await deps.store.listDocuments(sourceType)).map((d) => [d.sourceId, d]));
  const seen = new Set<string>();

  for (const doc of docs) {
    if (seen.has(doc.sourceId)) continue;
    seen.add(doc.sourceId);
    stats.seen++;
    const contentHash = documentHash(doc);
    if (!opts.force && existing.get(doc.sourceId)?.contentHash === contentHash) { stats.unchanged++; continue; }

    const pieces = chunkText(doc.content, { chunkTokens: opts.chunkTokens, overlapTokens: opts.overlapTokens });
    if (!pieces.length) continue;
    // Prefix each chunk with its title so a chunk from the middle of a README still embeds as "about this repo".
    const texts = pieces.map((p) => `${doc.title}\n\n${p}`);
    const vectors = await deps.embedder.embedDocuments(texts);
    await deps.store.replaceDocument(
      { ...doc, contentHash },
      texts.map((t, i) => ({
        chunkIndex: i,
        content: t,
        tokenCount: estimateTokens(t),
        contentHash: sha256(t),
        embedding: vectors[i],
        metadata: { ...pickChunkMeta(doc.metadata), chunkIndex: i, chunkCount: texts.length },
      })),
    );
    stats.embedded++;
    stats.chunks += texts.length;
  }

  if (opts.prune !== false) {
    const stale = [...existing.values()].filter((d) => !seen.has(d.sourceId) && !(opts.keep?.(d.sourceId) ?? false));
    await deps.store.deleteDocuments(stale.map((d) => d.id));
    stats.deleted = stale.length;
  }
  return stats;
}

function pickChunkMeta(m: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const k of ["section", "project", "repo", "path", "kind"]) if (m[k] !== undefined) out[k] = m[k];
  return out;
}

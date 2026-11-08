#!/usr/bin/env bash
# Stores your free Jina API key as the embedding key, redeploys a preview and runs the sync.
# Get a key (free, no card): https://jina.ai/embeddings (key shown on the page)
# Usage: bash scripts/use-gemini-and-sync.sh
set -euo pipefail
read -r -s -p "Jina API key (jina_...): " K; echo
K=$(printf %s "$K" | grep -Eo 'jina_[0-9A-Za-z_-]+' | head -1 || true)
[ -z "$K" ] && { echo "That doesn't look like a Jina key (should start with jina_)."; exit 1; }
npx vercel env rm EMBEDDING_API_KEY --yes >/dev/null 2>&1 || true
npx vercel env add EMBEDDING_API_KEY --environment production,preview --sensitive --yes --value "$K" >/dev/null
echo "✓ key saved; deploying preview…"
URL=$(npx vercel deploy --yes 2>/dev/null | grep -Eo 'https://[a-z0-9-]+\.vercel\.app' | head -1)
git checkout -- public/sitemap.xml 2>/dev/null || true
echo "✓ deployed: $URL"
bash scripts/admin-sync.sh "$URL"

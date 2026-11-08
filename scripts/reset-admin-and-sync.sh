#!/usr/bin/env bash
# Replaces ADMIN_TOKEN with a fresh one, redeploys a preview, and runs the first sync with it.
# The token is printed once at the end — save it in your password manager.
# Usage: bash scripts/reset-admin-and-sync.sh
set -euo pipefail
T=$(openssl rand -hex 32)
npx vercel env rm ADMIN_TOKEN --yes >/dev/null 2>&1 || true
npx vercel env add ADMIN_TOKEN --environment production,preview --sensitive --yes --value "$T" >/dev/null
echo "✓ ADMIN_TOKEN replaced; deploying preview…"
URL=$(npx vercel deploy --yes 2>/dev/null | grep -Eo 'https://[a-z0-9-]+\.vercel\.app' | head -1)
git checkout -- public/sitemap.xml 2>/dev/null || true
echo "✓ deployed: $URL"
echo "Syncing (can take a minute)…"
npx vercel curl "$URL/api/admin/sync" -- -s -X POST \
  -H "authorization: Bearer $T" -H 'content-type: application/json' -d '{}'
echo
echo
echo "Preview: $URL"
umask 077; printf %s "$T" > .admin-token
echo "ADMIN_TOKEN saved to .admin-token (gitignored)"

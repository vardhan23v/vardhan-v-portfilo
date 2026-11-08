#!/usr/bin/env bash
# Runs the RAG ingestion on a deployment. Prompts for ADMIN_TOKEN (hidden).
# Usage: bash scripts/admin-sync.sh <deployment-url>
set -euo pipefail
URL="${1:?deployment url}"
if [ -s .admin-token ]; then T=$(cat .admin-token); else read -r -s -p "ADMIN_TOKEN: " T; echo; fi
T=$(printf %s "$T" | grep -Eo '[0-9a-f]{64}' | tail -1 || true)
echo "(token length: ${#T})"
npx vercel curl "$URL/api/admin/sync" -- -s -X POST \
  -H "authorization: Bearer $T" -H 'content-type: application/json' -d '{}'
echo

#!/usr/bin/env bash
# Prompts for each secret (hidden input) and stores it in Vercel for production + preview.
# Usage: bash scripts/set-vercel-secrets.sh
set -euo pipefail

add() { # name value sensitivity
  npx vercel env rm "$1" --yes >/dev/null 2>&1 || true
  npx vercel env add "$1" --environment production,preview "$3" --yes --value "$2" >/dev/null
  echo "  ✓ $1"
}

ask() { local v; read -r -s -p "$1: " v; echo >&2; printf '%s' "$v"; }

GROQ=$(ask "Groq API key (gsk_...)")
OPENAI=$(ask "OpenAI API key (sk-...)")
read -r -p "Supabase project URL (https://xxxx.supabase.co): " SBURL
SBKEY=$(ask "Supabase secret key (sb_secret_...)")
GH=$(ask "GitHub token (optional, Enter to skip)")

add GROQ_API_KEY "$GROQ" --sensitive
add EMBEDDING_API_KEY "$OPENAI" --sensitive
add SUPABASE_URL "$SBURL" --no-sensitive
add SUPABASE_SERVICE_ROLE_KEY "$SBKEY" --sensitive
[ -n "$GH" ] && add GITHUB_TOKEN "$GH" --sensitive

ADMIN=$(openssl rand -hex 32)
add ADMIN_TOKEN "$ADMIN" --sensitive
add CRON_SECRET "$(openssl rand -hex 32)" --sensitive

echo
echo "ADMIN_TOKEN (save this in your password manager, it is not shown again):"
echo "$ADMIN"

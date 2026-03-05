#!/bin/bash
# Test script to reset articles and run summarization
# This script reads from .env.local automatically

# Load .env.local file
if [ -f ".env.local" ]; then
    export $(grep -v '^#' .env.local | xargs)
    echo "✅ Loaded .env.local"
else
    echo "❌ Error: .env.local file not found"
    exit 1
fi

# Convert VITE_SUPABASE_URL to SUPABASE_URL if needed
if [ -z "$SUPABASE_URL" ] && [ -n "$VITE_SUPABASE_URL" ]; then
    export SUPABASE_URL="$VITE_SUPABASE_URL"
fi

# Check required variables
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local"
    exit 1
fi

echo "=== Step 1: Fix null fields in existing articles ==="
deno run --allow-env --allow-net --allow-read scripts/fix-null-fields.ts

echo ""
echo "=== Step 2: Reset articles to draft status ==="
deno run --allow-env --allow-net --allow-read scripts/reset-articles-to-draft.ts

echo ""
echo "=== Step 3: Run summarize-articles edge function ==="
curl -X POST "${SUPABASE_URL}/functions/v1/summarize-articles" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{}'

echo ""
echo "✅ Done! Check your dashboard for updated articles."

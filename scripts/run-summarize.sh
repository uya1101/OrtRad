#!/bin/bash
# Test script to reset articles and run summarization

# Set your Supabase project URL and keys
SUPABASE_URL="${SUPABASE_URL:-}"
SERVICE_ROLE_KEY="${SERVICE_ROLE_KEY:-}"

if [ -z "$SUPABASE_URL" ] || [ -z "$SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: Please set SUPABASE_URL and SERVICE_ROLE_KEY environment variables"
    echo "   Example: export SUPABASE_URL=https://your-project.supabase.co"
    echo "            export SERVICE_ROLE_KEY=your-service-role-key"
    exit 1
fi

echo "=== Step 1: Fix null fields in existing articles ==="
deno run --allow-env --allow-net scripts/fix-null-fields.ts

echo ""
echo "=== Step 2: Reset articles to draft status ==="
deno run --allow-env --allow-net scripts/reset-articles-to-draft.ts

echo ""
echo "=== Step 3: Run summarize-articles edge function ==="
curl -X POST "${SUPABASE_URL}/functions/v1/summarize-articles" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{}'

echo ""
echo "✅ Done! Check your dashboard for updated articles."

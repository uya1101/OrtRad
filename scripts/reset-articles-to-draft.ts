/**
 * Reset articles to draft status for testing summarize-articles function
 *
 * This script sets articles without summary/categories back to draft status
 * so summarize-articles edge function can process them.
 *
 * Usage:
 * Run: deno run --allow-env --allow-net --allow-read scripts/reset-articles-to-draft.ts
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Load .env.local file
const envPath = '.env.local';
let supabaseUrl = Deno.env.get('SUPABASE_URL');
let supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

try {
  const envContent = await Deno.readTextFile(envPath);
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=').trim();
    if (key && value && !key.startsWith('#')) {
      // Handle both VITE_SUPABASE_URL and SUPABASE_URL
      if (key === 'VITE_SUPABASE_URL') {
        supabaseUrl = value;
      } else if (key === 'SUPABASE_URL') {
        supabaseUrl = value;
      } else if (key === 'SUPABASE_SERVICE_ROLE_KEY') {
        supabaseKey = value;
      }
    }
  });
} catch (error) {
  console.log('ℹ️  .env.local not found, using environment variables');
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
  Deno.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetArticlesToDraft() {
  console.log('🔍 Finding articles without summaries...');

  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, source, status, summary_ja, summary_en, categories')
    .or('summary_ja.is.null,summary_en.is.null,categories.is.null');

  if (error) {
    console.error('❌ Error fetching articles:', error);
    Deno.exit(1);
  }

  console.log(`✅ Found ${articles?.length || 0} articles without complete summaries/categories`);

  if (!articles || articles.length === 0) {
    console.log('✨ All articles are already complete!');
    return;
  }

  let updated = 0;
  let failed = 0;

  for (const article of articles) {
    try {
      const { error: updateError } = await supabase
        .from('articles')
        .update({
          status: 'draft',
          categories: article.categories || [],
          updated_at: new Date().toISOString(),
        })
        .eq('id', article.id);

      if (updateError) {
        console.error(`❌ Failed to update ${article.id}:`, updateError);
        failed++;
      } else {
        console.log(`✅ Reset to draft: ${article.title?.substring(0, 50)}...`);
        updated++;
      }
    } catch (error) {
      console.error(`❌ Error processing ${article.id}:`, error);
      failed++;
    }
  }

  console.log('\n=== Summary ===');
  console.log(`✅ Updated: ${updated} articles`);
  console.log(`❌ Failed: ${failed} articles`);

  if (updated > 0) {
    console.log('\n📝 Next steps:');
    console.log('1. Run summarize-articles edge function:');
    console.log('   curl -X POST https://your-project.supabase.co/functions/v1/summarize-articles \\');
    console.log('     -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"');
    console.log('2. Or run daily pipeline:');
    console.log('   curl -X POST https://your-project.supabase.co/functions/v1/run-daily-pipeline \\');
    console.log('     -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"');
  }
}

resetArticlesToDraft();

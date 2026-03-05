/**
 * Fix null fields in existing articles
 *
 * This script fixes articles with null categories, authors, or tags
 * by setting them to empty arrays.
 *
 * Usage:
 * Run: deno run --allow-env --allow-net --allow-read scripts/fix-null-fields.ts
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

async function fixNullFields() {
  console.log('🔍 Finding articles with null fields...');

  // Find articles with null categories, authors, or tags
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, categories, authors, tags, is_rt_relevant, trend_score')
    .or('categories.is.null,authors.is.null,tags.is.null,is_rt_relevant.is.null,trend_score.is.null');

  if (error) {
    console.error('❌ Error fetching articles:', error);
    Deno.exit(1);
  }

  console.log(`✅ Found ${articles?.length || 0} articles with null fields`);

  if (!articles || articles.length === 0) {
    console.log('✨ All articles have correct field values!');
    return;
  }

  let updated = 0;
  let failed = 0;

  for (const article of articles) {
    try {
      const { error: updateError } = await supabase
        .from('articles')
        .update({
          categories: article.categories || [],
          authors: article.authors || [],
          tags: article.tags || [],
          is_rt_relevant: article.is_rt_relevant || false,
          trend_score: article.trend_score ?? 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', article.id);

      if (updateError) {
        console.error(`❌ Failed to update ${article.id}:`, updateError);
        failed++;
      } else {
        console.log(`✅ Fixed: ${article.title?.substring(0, 50)}...`);
        updated++;
      }
    } catch (error) {
      console.error(`❌ Error processing ${article.id}:`, error);
      failed++;
    }
  }

  console.log('\n=== Summary ===');
  console.log(`✅ Fixed: ${updated} articles`);
  console.log(`❌ Failed: ${failed} articles`);
  console.log('\n✨ Frontend should now work correctly without crashes!');
}

fixNullFields();

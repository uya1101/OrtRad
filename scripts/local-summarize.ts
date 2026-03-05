/**
 * Local article summarization script
 *
 * This script runs locally to generate summaries and categories,
 * then updates the database directly. This avoids Edge Functions resource limits.
 *
 * Usage: deno run --allow-env --allow-net --allow-read scripts/local-summarize.ts
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Load .env.local file
const envPath = '.env.local';
let supabaseUrl = Deno.env.get('VITE_SUPABASE_URL') || Deno.env.get('SUPABASE_URL') || '';
let supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
let geminiKey = Deno.env.get('GEMINI_API_KEY') || '';

console.log('🔧 Configuration Check:');
console.log(`  - Supabase URL: ${supabaseUrl ? 'SET' : 'MISSING'}`);
console.log(`  - Supabase Key: ${supabaseKey ? 'SET (length=' + supabaseKey.length + ')' : 'MISSING'}`);
console.log(`  - Gemini Key: ${geminiKey ? 'SET (length=' + geminiKey.length + ')' : 'MISSING'}`);

try {
  const envContent = await Deno.readTextFile(envPath);
  console.log(`📄 Reading ${envPath}...`);
  const lines = envContent.split('\n');

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;  // Skip empty lines

    // Check for key-value pairs
    const equalIndex = line.indexOf('=');
    if (equalIndex === -1) {
      console.log(`  ⚠️  Skipping line ${index + 1}: no '=' found - "${trimmedLine.substring(0, 50)}..."`);
      return;
    }

    const key = line.substring(0, equalIndex).trim();
    const value = line.substring(equalIndex + 1).trim();

    // Skip comments and empty keys
    if (!key || key.startsWith('#') || key.startsWith('→')) return;

    if (key === 'VITE_SUPABASE_URL' || key === 'SUPABASE_URL') {
      supabaseUrl = value;
      console.log(`  ✅ Set supabaseUrl from ${key}`);
    } else if (key === 'SUPABASE_SERVICE_ROLE_KEY') {
      supabaseKey = value;
      console.log(`  ✅ Set supabaseKey from ${key}`);
    } else if (key === 'GEMINI_API_KEY') {
      geminiKey = value;
      console.log(`  ✅ Set geminiKey from ${key}`);
    }
  });

  console.log(`📊 Parsed ${Object.keys({ supabaseUrl: !!supabaseUrl, supabaseKey: !!supabaseKey, geminiKey: !!geminiKey }).length} variables`);
} catch (error) {
  console.error('❌ Error reading .env.local:', error);
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Supabase URL or Key is missing. Check .env.local file.');
  Deno.exit(1);
}

if (!geminiKey) {
  console.error('❌ Error: Gemini API Key is missing. Check .env.local file.');
  Deno.exit(1);
}

// Validate Supabase URL format
if (!supabaseUrl.startsWith('https://')) {
  console.error('❌ Error: Supabase URL must start with https://');
  Deno.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Gemini API configuration
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Valid categories
const VALID_CATEGORIES = [
  'general_orthopedics',
  'imaging_diagnostics',
  'fracture',
  'bone_density',
  'ai_technology',
  'surgical_technique',
  'guideline',
  'rehabilitation'
];

// Processing configuration
const REQUEST_DELAY_MS = 5000; // 5 seconds between requests
const MAX_RETRIES = 3;

interface GeminiRequest {
  contents: Array<{
    parts: Array<{
      text: string;
    }>;
  }>;
  generationConfig?: {
    temperature: number;
    topP: number;
    maxOutputTokens: number;
  };
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

interface ArticleSummary {
  id: string;
  title: string;
  journal: string | null;
  abstract: string | null;
}

interface ParsedSummary {
  title_ja: string;
  summary_en: string;
  summary_ja: string;
  categories: string[];
  tags: string[];
  is_rt_relevant: boolean;
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getDraftArticles(): Promise<ArticleSummary[]> {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('id, title, journal, abstract')
      .eq('status', 'draft')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('❌ Error fetching draft articles:', error);
    return [];
  }
}

function buildPrompt(article: ArticleSummary): string {
  return `You are a medical research summarizer specializing in orthopedic surgery and radiology.
You serve radiologic technologists, orthopedic surgeons, and medical students.

Given the following research article, respond ONLY with valid JSON (no markdown, no code blocks):
{
  "title_ja": "日本語タイトル",
  "summary_en": "3-line English summary. Line 1: Main finding. Line 2: Method/Context. Line 3: Clinical significance.",
  "summary_ja": "3行の日本語要約。1行目: 主要な発見。2行目: 方法/背景。3行目: 臨床的意義。",
  "categories": ["array of matching categories from: ${VALID_CATEGORIES.join(', ')}"],
  "tags": ["3-5 relevant English keywords"],
  "is_rt_relevant": true or false (true if relevant to radiologic technologists: imaging techniques, radiation dose, image quality, positioning, CT/MRI/X-ray protocols)
}

Article:
Title: ${article.title}
Journal: ${article.journal || 'Unknown'}
Abstract: ${article.abstract || 'Not available'}
`;
}

function extractJsonFromResponse(text: string): string | null {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return jsonMatch[0];
    }

    const arrayMatch = text.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      return arrayMatch[0];
    }

    return null;
  } catch (error) {
    console.error('Error extracting JSON from response:', error);
    return null;
  }
}

function validateSummary(summary: any): summary is ParsedSummary {
  return (
    typeof summary === 'object' &&
    summary !== null &&
    typeof summary.title_ja === 'string' &&
    typeof summary.summary_en === 'string' &&
    typeof summary.summary_ja === 'string' &&
    Array.isArray(summary.categories) &&
    Array.isArray(summary.tags) &&
    typeof summary.is_rt_relevant === 'boolean'
  );
}

function validateCategories(categories: string[]): string[] {
  return categories.filter((cat): cat is string =>
    typeof cat === 'string' && VALID_CATEGORIES.includes(cat)
  );
}

async function callGeminiAPI(
  article: ArticleSummary,
  temperature: number
): Promise<{ success: boolean; summary?: ParsedSummary; error?: string }> {
  try {
    const prompt = buildPrompt(article);
    const requestBody: GeminiRequest = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature,
        topP: 0.8,
        maxOutputTokens: 1024
      }
    };

    const url = `${GEMINI_API_URL}?key=${geminiKey}`;
    console.log(`🌐 Calling Gemini API...`);
    console.log(`   URL: ${GEMINI_API_URL}/...`);
    console.log(`   Article: ${article.title.substring(0, 40)}...`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log(`   Response status: ${response.status}`);
    console.log(`   Response headers: ${Object.fromEntries(response.headers.entries())}`);

    if (!response.ok) {
      if (response.status === 429) {
        return { success: false, error: 'RATE_LIMIT (429: Too Many Requests)' };
      }
      const errorText = await response.text();
      console.error(`   Error body: ${errorText}`);
      return { success: false, error: `Gemini API error: ${response.status} - ${errorText}` };
    }

    const data = await response.json() as GeminiResponse;
    const contentText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    console.log(`   Content length: ${contentText?.length || 0} characters`);

    if (!contentText) {
      return { success: false, error: 'Empty response from Gemini' };
    }

    const jsonText = extractJsonFromResponse(contentText);
    if (!jsonText) {
      console.error(`   Could not extract JSON from response. First 200 chars: ${contentText.substring(0, 200)}`);
      return { success: false, error: 'Could not extract JSON from response' };
    }

    const summary = JSON.parse(jsonText);
    console.log(`   Generated summary for: ${summary.title_ja?.substring(0, 30)}...`);

    if (!validateSummary(summary)) {
      console.error(`   Invalid summary structure: ${JSON.stringify(summary).substring(0, 200)}...`);
      return { success: false, error: 'Invalid summary structure' };
    }

    summary.categories = validateCategories(summary.categories);

    if (!Array.isArray(summary.tags)) {
      summary.tags = [];
    }

    return { success: true, summary };
  } catch (error) {
    console.error('❌ Error calling Gemini API:', error);
    return { success: false, error: String(error) };
  }
}

async function summarizeArticle(
  article: ArticleSummary
): Promise<{ success: boolean; summary?: ParsedSummary; error?: string }> {
  let temperature = 0.3;
  let lastError = '';

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const result = await callGeminiAPI(article, temperature);

    if (result.success) {
      return result;
    }

    if (result.error === 'RATE_LIMIT') {
      console.log('Rate limit hit, waiting 60 seconds...');
      await sleep(60000);
      continue;
    }

    lastError = result.error || 'Unknown error';

    temperature = Math.min(temperature + 0.1, 1.0);

    console.log(`Attempt ${attempt + 1}/${MAX_RETRIES} failed (${lastError}), retrying with temperature ${temperature}...`);
  }

  return { success: false, error: `Failed after ${MAX_RETRIES} attempts: ${lastError}` };
}

async function updateArticle(
  id: string,
  summary: ParsedSummary
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('articles')
      .update({
        title_ja: summary.title_ja,
        summary_en: summary.summary_en,
        summary_ja: summary.summary_ja,
        categories: summary.categories,
        tags: summary.tags,
        is_rt_relevant: summary.is_rt_relevant,
        status: 'published',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error(`Error updating article ${id}:`, error);
    return false;
  }
}

async function processArticles() {
  console.log('🔍 Fetching draft articles...');

  const articles = await getDraftArticles();

  if (articles.length === 0) {
    console.log('✨ No draft articles to process');
    return;
  }

  console.log(`✅ Found ${articles.length} draft articles to process`);

  let processed = 0;
  let published = 0;
  const errors: { id: string; error: string }[] = [];

  for (const article of articles) {
    console.log(`Processing article: ${article.title.substring(0, 50)}...`);

    const result = await summarizeArticle(article);
    processed++;

    if (result.success && result.summary) {
      const updated = await updateArticle(article.id, result.summary);

      if (updated) {
        published++;
        console.log(`✅ Published: ${article.title.substring(0, 50)}...`);
      } else {
        console.error(`✗ Failed to update: ${article.title.substring(0, 50)}`);
        errors.push({ id: article.id, error: 'Database update failed' });
      }
    } else {
      console.error(`✗ Failed to summarize: ${article.title.substring(0, 50)} - ${result.error}`);
      errors.push({ id: article.id, error: result.error || 'Unknown error' });
    }

    await sleep(REQUEST_DELAY_MS);
  }

  console.log('\n=== Summary ===');
  console.log(`✅ Processed: ${processed} articles`);
  console.log(`✅ Published: ${published} articles`);
  console.log(`❌ Failed: ${errors.length} articles`);

  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach(e => {
      console.log(`  - ${e.id}: ${e.error}`);
    });
  }

  console.log('\n✨ Done! Articles should now be visible on the site.');
}

// Main execution
console.log('🚀 Starting local summarization...\n');
processArticles();

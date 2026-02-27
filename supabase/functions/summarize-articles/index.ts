import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { supabase } from '../_shared/supabase-client.ts';
import { logCollectionResult } from '../_shared/logger.ts';

// Gemini API configuration
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Valid categories from database
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

// Rate limiting: 15 requests per minute
const REQUEST_DELAY_MS = 4000; // 4 seconds = 15 RPM with safety margin
const MAX_ARTICLES_PER_RUN = 20;
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
      .limit(MAX_ARTICLES_PER_RUN);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching draft articles:', error);
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
    // Try to find JSON between curly braces
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return jsonMatch[0];
    }

    // Try to find JSON array
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
  temperature: number,
  apiKey: string
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

    const url = `${GEMINI_API_URL}?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      if (response.status === 429) {
        // Rate limit error
        return { success: false, error: 'RATE_LIMIT' };
      }
      const errorText = await response.text();
      return { success: false, error: `Gemini API error: ${response.status} - ${errorText}` };
    }

    const data = await response.json() as GeminiResponse;
    const contentText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!contentText) {
      return { success: false, error: 'Empty response from Gemini' };
    }

    // Extract JSON from response
    const jsonText = extractJsonFromResponse(contentText);
    if (!jsonText) {
      return { success: false, error: 'Could not extract JSON from response' };
    }

    const summary = JSON.parse(jsonText);

    // Validate summary structure
    if (!validateSummary(summary)) {
      return { success: false, error: 'Invalid summary structure' };
    }

    // Validate categories
    summary.categories = validateCategories(summary.categories);

    // Ensure tags array
    if (!Array.isArray(summary.tags)) {
      summary.tags = [];
    }

    return { success: true, summary };
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return { success: false, error: String(error) };
  }
}

async function summarizeArticle(
  article: ArticleSummary,
  apiKey: string
): Promise<{ success: boolean; summary?: ParsedSummary; error?: string }> {
  let temperature = 0.3;
  let lastError = '';

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const result = await callGeminiAPI(article, temperature, apiKey);

    if (result.success) {
      return result;
    }

    if (result.error === 'RATE_LIMIT') {
      // Wait 60 seconds for rate limit
      console.log('Rate limit hit, waiting 60 seconds...');
      await sleep(60000);
      continue;
    }

    lastError = result.error || 'Unknown error';

    // Increase temperature slightly for retry
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

serve(async (req) => {
  console.log('summarize-articles function invoked');
  const startTime = Date.now();

  try {
    // Only allow POST from Supabase cron
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check authorization
    const authHeader = req.headers.get('authorization');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (authHeader !== `Bearer ${serviceKey}`) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiKey) {
      console.error('GEMINI_API_KEY not set');
      return new Response(
        JSON.stringify({ error: 'Gemini API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Step 1: Get draft articles
    console.log('Fetching draft articles...');
    const articles = await getDraftArticles();

    if (articles.length === 0) {
      console.log('No draft articles to process');
      await logCollectionResult('summarize-articles', 'completed', 0, 0);
      return new Response(
        JSON.stringify({ message: 'No draft articles to process', processed: 0, published: 0 }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${articles.length} draft articles to process`);

    // Step 2: Process each article
    let processed = 0;
    let published = 0;
    const errors: { id: string; error: string }[] = [];

    for (const article of articles) {
      console.log(`Processing article: ${article.title.substring(0, 50)}...`);

      // Summarize article with Gemini
      const result = await summarizeArticle(article, geminiKey);
      processed++;

      if (result.success && result.summary) {
        // Update article
        const updated = await updateArticle(article.id, result.summary);

        if (updated) {
          published++;
          console.log(`✓ Published article: ${article.id}`);
        } else {
          console.error(`✗ Failed to update article: ${article.id}`);
          errors.push({ id: article.id, error: 'Database update failed' });
        }
      } else {
        console.error(`✗ Failed to summarize article: ${article.id} - ${result.error}`);
        errors.push({ id: article.id, error: result.error || 'Unknown error' });
      }

      // Rate limiting delay
      await sleep(REQUEST_DELAY_MS);
    }

    const duration = Date.now() - startTime;
    console.log(`Summarization completed in ${duration}ms`);

    // Log results
    await logCollectionResult(
      'summarize-articles',
      'completed',
      processed,
      published
    );

    return new Response(
      JSON.stringify({
        message: 'Summarization completed',
        processed,
        published,
        errors: errors.length,
        duration_ms: duration,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('Error in summarize-articles:', error);

    // Log error
    await logCollectionResult('summarize-articles', 'failed', 0, 0, String(error));

    return new Response(
      JSON.stringify({
        error: String(error),
        duration_ms: duration,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

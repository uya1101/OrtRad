import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { supabase } from '../_shared/supabase-client.ts';
import { logCollectionResult } from '../_shared/logger.ts';

// Gemini API configuration
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface TrendKeyword {
  keyword_en: string;
  keyword_ja: string;
  count: number;
}

interface ParsedTrend {
  keyword_en: string;
  keyword_ja: string;
  count: number;
}

async function getRecentKeywords(): Promise<Map<string, number>> {
  try {
    // Get articles from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
      .from('articles')
      .select('tags, categories')
      .eq('status', 'published')
      .gte('published_at', sevenDaysAgo.toISOString());

    if (error) throw error;

    const keywordCount = new Map<string, number>();

    for (const article of data || []) {
      // Count tags
      const tags = article.tags || [];
      for (const tag of tags) {
        const count = keywordCount.get(tag) || 0;
        keywordCount.set(tag, count + 1);
      }

      // Count categories
      const categories = article.categories || [];
      for (const category of categories) {
        const count = keywordCount.get(category) || 0;
        keywordCount.set(category, count + 1);
      }
    }

    return keywordCount;
  } catch (error) {
    console.error('Error fetching recent keywords:', error);
    return new Map();
  }
}

function getTopKeywords(keywordCount: Map<string, number>, limit: number): TrendKeyword[] {
  const sorted = Array.from(keywordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);

  return sorted.map(([keyword, count]) => ({
    keyword_en: keyword,
    keyword_ja: keyword, // Will be translated by Gemini
    count,
  }));
}

function buildTrendPrompt(keywords: TrendKeyword[]): string {
  const keywordList = keywords.map(k => k.keyword_en).join(', ');

  return `Based on these keywords from recent orthopedic/radiology research papers,
identify the top 10 trending topics. For each, provide English and Japanese names.

Keywords: ${keywordList}

Respond ONLY with valid JSON (no markdown, no code blocks):
[
  {"keyword_en": "...", "keyword_ja": "...", "count": number},
  ...
]`;
}

function extractJsonFromResponse(text: string): string | null {
  try {
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

function validateTrend(trend: any): trend is ParsedTrend {
  return (
    typeof trend === 'object' &&
    trend !== null &&
    typeof trend.keyword_en === 'string' &&
    typeof trend.keyword_ja === 'string' &&
    typeof trend.count === 'number'
  );
}

async function callGeminiAPI(
  keywords: TrendKeyword[],
  apiKey: string
): Promise<{ success: boolean; trends?: ParsedTrend[]; error?: string }> {
  try {
    const prompt = buildTrendPrompt(keywords);
    const requestBody = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.5,
        topP: 0.9,
        maxOutputTokens: 2048
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

    const data = await response.json();
    const contentText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!contentText) {
      return { success: false, error: 'Empty response from Gemini' };
    }

    // Extract JSON from response
    const jsonText = extractJsonFromResponse(contentText);
    if (!jsonText) {
      return { success: false, error: 'Could not extract JSON from response' };
    }

    const trends = JSON.parse(jsonText);

    // Validate each trend
    if (!Array.isArray(trends)) {
      return { success: false, error: 'Response is not an array' };
    }

    const validTrends = trends.filter(validateTrend);
    if (validTrends.length === 0) {
      return { success: false, error: 'No valid trends in response' };
    }

    return { success: true, trends: validTrends };
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return { success: false, error: String(error) };
  }
}

async function saveTrends(
  trends: ParsedTrend[],
  periodStart: Date,
  periodEnd: Date
): Promise<number> {
  try {
    // Calculate date range (last 7 days)
    const startDate = periodStart.toISOString().split('T')[0];
    const endDate = periodEnd.toISOString().split('T')[0];

    // Delete existing trends for the same period
    const { error: deleteError } = await supabase
      .from('trend_keywords')
      .delete()
      .gte('period_start', startDate)
      .lte('period_end', endDate);

    if (deleteError) {
      console.error('Error deleting existing trends:', deleteError);
    }

    // Insert new trends
    const insertData = trends.map(trend => ({
      keyword_en: trend.keyword_en,
      keyword_ja: trend.keyword_ja,
      count: trend.count,
      period_start: startDate,
      period_end: endDate,
    }));

    const { error: insertError } = await supabase
      .from('trend_keywords')
      .insert(insertData);

    if (insertError) throw insertError;

    return trends.length;
  } catch (error) {
    console.error('Error saving trends:', error);
    return 0;
  }
}

async function generateTrends(
  apiKey: string
): Promise<{ success: boolean; trends?: number; error?: string }> {
  // Step 1: Get recent keywords
  console.log('Fetching recent keywords...');
  const keywordCount = await getRecentKeywords();

  if (keywordCount.size === 0) {
    console.log('No keywords found in recent articles');
    return { success: true, trends: 0 };
  }

  // Step 2: Get top 20 keywords
  const topKeywords = getTopKeywords(keywordCount, 20);
  console.log(`Top keywords: ${topKeywords.map(k => `${k.keyword_en}(${k.count})`).join(', ')}`);

  // Step 3: Call Gemini API for trend analysis
  console.log('Analyzing trends with Gemini...');
  const result = await callGeminiAPI(topKeywords, apiKey);

  if (!result.success || !result.trends) {
    return { success: false, error: result.error || 'Failed to generate trends' };
  }

  // Step 4: Save trends
  console.log(`Saving ${result.trends.length} trends...`);
  const periodEnd = new Date();
  const periodStart = new Date();
  periodStart.setDate(periodStart.getDate() - 7);

  const saved = await saveTrends(result.trends, periodStart, periodEnd);

  return { success: true, trends: saved };
}

serve(async (req) => {
  console.log('generate-trends function invoked');
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

    // Generate and save trends
    const result = await generateTrends(geminiKey);

    const duration = Date.now() - startTime;
    console.log(`Trend generation completed in ${duration}ms`);

    // Log results
    await logCollectionResult(
      'generate-trends',
      result.success ? 'completed' : 'failed',
      0,
      result.trends || 0,
      result.error
    );

    return new Response(
      JSON.stringify({
        message: result.success ? 'Trends generated successfully' : 'Trend generation failed',
        trends: result.trends,
        error: result.error,
        duration_ms: duration,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('Error in generate-trends:', error);

    // Log error
    await logCollectionResult('generate-trends', 'failed', 0, 0, String(error));

    return new Response(
      JSON.stringify({
        error: String(error),
        duration_ms: duration,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

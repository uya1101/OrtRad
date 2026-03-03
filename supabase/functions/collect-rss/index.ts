import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { supabase, insertArticle } from '../_shared/supabase-client.ts';
import { parseRssFeed, createHash } from '../_shared/xml-parser.ts';
import { RSS_FEEDS } from '../_shared/constants.ts';
import { logCollectionResult } from '../_shared/logger.ts';

async function fetchRssFeed(url: string, timeoutMs = 10000): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'OrtRad/1.0 (+https://ortrad.com)',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Failed to fetch RSS feed: ${url} - ${response.status}`);
      return null;
    }

    return await response.text();
  } catch (error) {
    console.error(`Error fetching RSS feed: ${url}`, error);
    return null;
  }
}

function parseRssDate(dateStr: string | null): string | null {
  if (!dateStr) return null;

  try {
    // Try parsing common date formats
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }

    return null;
  } catch (error) {
    return null;
  }
}

function stripHtmlTags(html: string | null): string {
  if (!html) return '';

  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

async function processFeed(feed: {
  source: string;
  name: string;
  url: string;
  type: 'rss' | 'atom';
}): Promise<{ found: number; new: number; error?: string }> {
  try {
    console.log(`Processing feed: ${feed.name} (${feed.source})`);

    // Fetch RSS feed
    const xmlText = await fetchRssFeed(feed.url);
    if (!xmlText) {
      return { found: 0, new: 0, error: 'Failed to fetch feed' };
    }

    // Parse RSS feed
    const items = parseRssFeed(xmlText, feed.source);
    console.log(`Parsed ${items.length} items from ${feed.name}`);

    if (items.length === 0) {
      return { found: 0, new: 0 };
    }

    // Store articles
    let found = items.length;
    let inserted = 0;

    for (const item of items) {
      try {
        // Generate source_id from URL hash or guid
        const sourceId = item.guid || createHash(item.link);

        // Parse published date
        const publishedAt = parseRssDate(item.pubDate);

        // Strip HTML from description for abstract
        const abstract = item.description ? stripHtmlTags(item.description) : null;

        const result = await insertArticle({
          title: item.title,
          authors: [], // RSS feeds typically don't have author info in a structured format
          journal: feed.name,
          source: feed.source,
          source_id: sourceId,
          source_url: item.link,
          published_at: publishedAt,
          abstract: abstract,
          status: 'draft',
        });

        if (result.success) {
          inserted++;
        }
      } catch (error) {
        console.error(`Error storing article from ${feed.name}:`, error);
      }
    }

    return { found, new: inserted };
  } catch (error) {
    console.error(`Error processing feed ${feed.name}:`, error);
    return { found: 0, new: 0, error: String(error) };
  }
}

serve(async (req) => {
  console.log('collect-rss function invoked');

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
    const serviceKey = Deno.env.get('SERVICE_ROLE_KEY');

    if (!serviceKey) {
      console.error('SERVICE_ROLE_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (authHeader !== `Bearer ${serviceKey}`) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Process each feed
    const results: {
      source: string;
      name: string;
      found: number;
      new: number;
      error?: string;
    }[] = [];

    for (const feed of RSS_FEEDS) {
      const result = await processFeed(feed);
      results.push({
        source: feed.source,
        name: feed.name,
        ...result,
      });

      // Log each feed result
      await logCollectionResult(
        feed.source,
        result.error ? 'failed' : 'completed',
        result.found,
        result.new,
        result.error
      );
    }

    // Aggregate results
    const totalFound = results.reduce((sum, r) => sum + r.found, 0);
    const totalNew = results.reduce((sum, r) => sum + r.new, 0);
    const errors = results.filter(r => r.error).length;

    return new Response(
      JSON.stringify({
        message: 'RSS collection completed',
        sources: results,
        summary: {
          total_sources: results.length,
          total_found: totalFound,
          total_new: totalNew,
          errors,
        },
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in collect-rss:', error);

    // Log error
    await logCollectionResult('rss', 'failed', 0, 0, String(error));

    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

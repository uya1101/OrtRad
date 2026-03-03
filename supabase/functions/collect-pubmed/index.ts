import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { supabase, insertArticle, ArticleInput } from '../_shared/supabase-client.ts';
import { parsePubmedXml, ParsedArticle } from '../_shared/xml-parser.ts';
import { logCollectionResult } from '../_shared/logger.ts';

// PubMed API base URLs
const ESEARCH_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi';
const EFETCH_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi';

// Rate limiting: 3 requests per second (400ms delay = 2.5 req/s for safety margin)
const REQUEST_DELAY_MS = 400;
const BATCH_SIZE = 10;

interface PubmedSearchResult {
  esearchresult: {
    idlist: string[];
    count: string;
  };
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getSearchKeywords(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', 'pubmed_keywords')
      .single();

    if (error || !data) {
      console.warn('Could not fetch pubmed_keywords, using defaults');
      return ['orthopedic surgery', 'musculoskeletal imaging'];
    }

    const value = data.value as { queries?: string[] };
    return value.queries || ['orthopedic surgery', 'musculoskeletal imaging'];
  } catch (error) {
    console.error('Error fetching search keywords:', error);
    return ['orthopedic surgery', 'musculoskeletal imaging'];
  }
}

async function searchPubmed(keywords: string[]): Promise<string[]> {
  try {
    // Combine keywords with OR
    const searchTerm = keywords.map(k => `"${k}"`).join(' OR ');
    const params = new URLSearchParams({
      db: 'pubmed',
      term: searchTerm,
      retmax: '30',
      sort: 'date',
      datetype: 'pdat',
      reldate: '7', // Last 7 days
      retmode: 'json',
    });

    const response = await fetch(`${ESEARCH_URL}?${params}`);
    if (!response.ok) {
      throw new Error(`PubMed E-search failed: ${response.status}`);
    }

    const data = await response.json() as PubmedSearchResult;
    const pmids = data.esearchresult?.idlist || [];

    console.log(`Found ${pmids.length} articles for keywords: ${keywords.join(', ')}`);

    return pmids;
  } catch (error) {
    console.error('Error searching PubMed:', error);
    return [];
  }
}

async function fetchPubmedArticles(pmids: string[]): Promise<ParsedArticle[]> {
  const articles: ParsedArticle[] = [];

  // Process in batches
  for (let i = 0; i < pmids.length; i += BATCH_SIZE) {
    const batch = pmids.slice(i, i + BATCH_SIZE);
    console.log(`Fetching batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(pmids.length / BATCH_SIZE)}: ${batch.length} PMIDs`);

    try {
      const params = new URLSearchParams({
        db: 'pubmed',
        id: batch.join(','),
        retmode: 'xml',
      });

      const response = await fetch(`${EFETCH_URL}?${params}`);
      if (!response.ok) {
        console.error(`Failed to fetch batch ${i}: ${response.status}`);
        continue;
      }

      const xmlText = await response.text();
      const parsed = parsePubmedXml(xmlText);

      articles.push(...parsed);

      // Rate limiting
      await sleep(REQUEST_DELAY_MS);
    } catch (error) {
      console.error(`Error fetching batch ${i}:`, error);
    }
  }

  return articles;
}

async function storeArticles(articles: ParsedArticle[]): Promise<{ found: number; new: number }> {
  let found = articles.length;
  let inserted = 0;

  for (const article of articles) {
    try {
      const result = await insertArticle({
        title: article.title,
        authors: article.authors || [],
        journal: article.journal,
        source: 'pubmed',
        source_id: article.source_id,
        source_url: article.source_url,
        published_at: article.published_at,
        abstract: article.abstract,
        status: 'draft',
      });

      if (result.success) {
        inserted++;
      }
    } catch (error) {
      console.error('Error storing article:', error);
    }
  }

  return { found, new: inserted };
}

serve(async (req) => {
  console.log('collect-pubmed function invoked');

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

    // Step 1: Get search keywords from admin_settings
    const keywords = await getSearchKeywords();

    // Step 2: Search PubMed for article IDs
    const pmids = await searchPubmed(keywords);

    if (pmids.length === 0) {
      await logCollectionResult('pubmed', 'completed', 0, 0);
      return new Response(
        JSON.stringify({ message: 'No articles found', found: 0, new: 0 }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Step 3: Fetch article details in batches
    const articles = await fetchPubmedArticles(pmids);

    if (articles.length === 0) {
      await logCollectionResult('pubmed', 'completed', pmids.length, 0);
      return new Response(
        JSON.stringify({ message: 'No articles parsed', found: 0, new: 0 }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Step 4: Store articles with duplicate check
    const result = await storeArticles(articles);

    // Step 5: Log result
    await logCollectionResult('pubmed', 'completed', result.found, result.new);

    return new Response(
      JSON.stringify({
        message: 'Collection completed',
        source: 'pubmed',
        found: result.found,
        new: result.new,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in collect-pubmed:', error);

    // Log error
    await logCollectionResult('pubmed', 'failed', 0, 0, String(error));

    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

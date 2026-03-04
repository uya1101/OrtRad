import { createClient } from 'npm:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

export const supabase = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export interface ArticleInput {
  title: string;
  title_ja?: string | null;
  authors?: string[];
  journal?: string | null;
  source: string;
  source_id: string;
  source_url?: string | null;
  published_at?: string | null;
  abstract?: string | null;
  summary_en?: string | null;
  summary_ja?: string | null;
  categories?: string[];
  tags?: string[];
  is_rt_relevant?: boolean;
  trend_score?: number;
  status?: 'draft' | 'published' | 'archived';
}

export async function insertArticle(article: ArticleInput): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    // Check for duplicates
    const { data: existing } = await supabase
      .from('articles')
      .select('id')
      .eq('source_id', article.source_id)
      .eq('source', article.source)
      .single();

    if (existing) {
      return { success: false, error: 'Article already exists' };
    }

    // Insert new article with default values
    const { data, error } = await supabase
      .from('articles')
      .insert({
        ...article,
        status: article.status || 'draft',
        categories: article.categories || [],
        authors: article.authors || [],
        tags: article.tags || [],
        is_rt_relevant: article.is_rt_relevant || false,
        trend_score: article.trend_score || 0,
      })
      .select('id')
      .single();

    if (error) throw error;

    return { success: true, id: data?.id };
  } catch (error) {
    console.error('Error inserting article:', error);
    return { success: false, error: String(error) };
  }
}

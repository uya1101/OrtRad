import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Article } from '../types/article';

export interface UseArticlesParams {
  page?: number;
  limit?: number;
  source?: string;
  category?: string;
  isRtRelevant?: boolean;
  search?: string;
  lang?: 'en' | 'ja';
}

export interface UseArticlesReturn {
  articles: Article[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  hasMore: boolean;
}

export function useArticles(params: UseArticlesParams = {}): UseArticlesReturn {
  const {
    page = 1,
    limit = 20,
    source,
    category,
    isRtRelevant,
    search,
    lang = 'ja'
  } = params;

  const [articles, setArticles] = useState<Article[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('articles')
        .select('*', { count: 'exact' })
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      // Apply filters
      if (source) {
        query = query.eq('source', source);
      }

      if (category) {
        query = query.contains('categories', [category]);
      }

      if (isRtRelevant !== undefined) {
        query = query.eq('is_rt_relevant', isRtRelevant);
      }

      if (search) {
        query = query.textSearch('title', search, {
          type: 'websearch',
          config: 'english'
        });
      }

      // Calculate range
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      setArticles(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, source, category, isRtRelevant, search]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const hasMore = (page - 1) * limit + articles.length < totalCount;

  return {
    articles,
    totalCount,
    isLoading,
    error,
    refetch: fetchArticles,
    hasMore,
  };
}

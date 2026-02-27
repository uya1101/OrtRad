import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Article } from '../types/article';

export interface SearchParams {
  query: string;
  sources: string[];
  categories: string[];
  isRtRelevant: boolean | null;
  dateFrom: Date | null;
  dateTo: Date | null;
  sortBy: 'date' | 'relevance' | 'trend_score';
  lang: 'ja' | 'en';
}

export interface UseSearchResult {
  articles: Article[];
  totalCount: number;
  isLoading: boolean;
  searchParams: SearchParams;
  setSearchParams: (params: Partial<SearchParams>) => void;
  resetSearch: () => void;
  hasMore: boolean;
}

const SEARCH_CACHE_KEY = 'search_cache_';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  data: Article[];
  totalCount: number;
  timestamp: number;
}

function getCachedResult(key: string): CacheEntry | null {
  try {
    const cached = localStorage.getItem(`${SEARCH_CACHE_KEY}${key}`);
    if (!cached) return null;
    const entry = JSON.parse(cached);
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      localStorage.removeItem(`${SEARCH_CACHE_KEY}${key}`);
      return null;
    }
    return entry;
  } catch {
    return null;
  }
}

function setCachedResult(key: string, data: Article[], totalCount: number): void {
  try {
    const entry: CacheEntry = {
      data,
      totalCount,
      timestamp: Date.now(),
    };
    localStorage.setItem(`${SEARCH_CACHE_KEY}${key}`, JSON.stringify(entry));
  } catch {
    // Ignore cache errors
  }
}

export function useSearch(page: number = 1, limit: number = 20): UseSearchResult {
  const [urlSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [articles, setArticles] = useState<Article[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [triggerSearch, setTriggerSearch] = useState(0);

  // Parse URL params to search params
  const searchParams: SearchParams = useMemo(() => {
    return {
      query: urlSearchParams.get('q') || '',
      sources: urlSearchParams.get('source')?.split(',').filter(Boolean) || [],
      categories: urlSearchParams.get('category')?.split(',').filter(Boolean) || [],
      isRtRelevant: urlSearchParams.get('rt') === '1' ? true : null,
      dateFrom: urlSearchParams.get('from') ? new Date(urlSearchParams.get('from')!) : null,
      dateTo: urlSearchParams.get('to') ? new Date(urlSearchParams.get('to')!) : null,
      sortBy: (urlSearchParams.get('sort') as 'date' | 'relevance' | 'trend_score') || 'date',
      lang: (urlSearchParams.get('lang') as 'ja' | 'en') || 'ja',
    };
  }, [urlSearchParams]);

  const setSearchParams = useCallback((params: Partial<SearchParams>) => {
    const newParams = new URLSearchParams(urlSearchParams);

    if (params.query !== undefined) {
      if (params.query) newParams.set('q', params.query);
      else newParams.delete('q');
    }
    if (params.sources !== undefined) {
      if (params.sources.length > 0) newParams.set('source', params.sources.join(','));
      else newParams.delete('source');
    }
    if (params.categories !== undefined) {
      if (params.categories.length > 0) newParams.set('category', params.categories.join(','));
      else newParams.delete('category');
    }
    if (params.isRtRelevant !== undefined) {
      if (params.isRtRelevant) newParams.set('rt', '1');
      else newParams.delete('rt');
    }
    if (params.dateFrom !== undefined) {
      if (params.dateFrom) newParams.set('from', params.dateFrom.toISOString().split('T')[0]);
      else newParams.delete('from');
    }
    if (params.dateTo !== undefined) {
      if (params.dateTo) newParams.set('to', params.dateTo.toISOString().split('T')[0]);
      else newParams.delete('to');
    }
    if (params.sortBy !== undefined) {
      newParams.set('sort', params.sortBy);
    }
    if (params.lang !== undefined) {
      newParams.set('lang', params.lang);
    }

    const queryString = newParams.toString();
    navigate(`/search${queryString ? `?${queryString}` : ''}`, { replace: true });
  }, [urlSearchParams, navigate]);

  const resetSearch = useCallback(() => {
    navigate('/search', { replace: true });
  }, [navigate]);

  // Fetch articles based on search params
  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);

      try {
        // Build cache key
        const cacheKey = `${searchParams.query}_${searchParams.sources.join(',')}_${searchParams.categories.join(',')}_${searchParams.isRtRelevant}_${searchParams.dateFrom?.toISOString()}_${searchParams.dateTo?.toISOString()}_${searchParams.sortBy}_${page}_${limit}`;

        // Check cache
        const cached = getCachedResult(cacheKey);
        if (cached && page === 1) {
          setArticles(cached.data);
          setTotalCount(cached.totalCount);
          setIsLoading(false);
          return;
        }

        let query = supabase
          .from('articles')
          .select('*', { count: 'exact' })
          .eq('status', 'published');

        // Full-text search
        if (searchParams.query) {
          if (searchParams.lang === 'ja') {
            // Japanese: use ILIKE on title_ja and summary_ja
            query = query.or(`title_ja.ilike.%${searchParams.query}%,summary_ja.ilike.%${searchParams.query}%`);
          } else {
            // English: use full-text search
            query = query.textSearch('title', searchParams.query);
          }
        }

        // Source filter (array contains)
        if (searchParams.sources.length > 0) {
          query = query.in('source', searchParams.sources);
        }

        // Category filter (array contains)
        if (searchParams.categories.length > 0) {
          query = query.contains('categories', searchParams.categories);
        }

        // RT relevance filter
        if (searchParams.isRtRelevant) {
          query = query.eq('is_rt_relevant', true);
        }

        // Date range filter
        if (searchParams.dateFrom) {
          query = query.gte('published_at', searchParams.dateFrom.toISOString());
        }
        if (searchParams.dateTo) {
          query = query.lte('published_at', searchParams.dateTo.toISOString());
        }

        // Sort
        switch (searchParams.sortBy) {
          case 'date':
            query = query.order('published_at', { ascending: false, nullsFirst: false });
            break;
          case 'relevance':
            // Relevance is based on ts_rank (PostgreSQL full-text search rank)
            query = query.order('published_at', { ascending: false, nullsFirst: false });
            break;
          case 'trend_score':
            query = query.order('trend_score', { ascending: false, nullsFirst: false });
            break;
        }

        // Pagination
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        const { data, error, count } = await query;

        if (error) {
          console.error('Search error:', error);
          setArticles([]);
          setTotalCount(0);
        } else {
          const fetchedArticles = data || [];
          setArticles(page === 1 ? fetchedArticles : prev => [...prev, ...fetchedArticles]);
          setTotalCount(count || 0);

          // Cache results for first page
          if (page === 1) {
            setCachedResult(cacheKey, fetchedArticles, count || 0);
          }
        }
      } catch (error) {
        console.error('Search fetch error:', error);
        setArticles([]);
        setTotalCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [searchParams, page, limit, triggerSearch]);

  const hasMore = useMemo(() => {
    return !isLoading && articles.length < totalCount;
  }, [isLoading, articles.length, totalCount]);

  return {
    articles,
    totalCount,
    isLoading,
    searchParams,
    setSearchParams,
    resetSearch,
    hasMore,
  };
}

export function useSearchHistory(): {
  history: string[];
  addHistory: (query: string) => void;
  clearHistory: () => void;
  removeHistory: (query: string) => void;
} {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('search_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {
      setHistory([]);
    }
  }, []);

  const addHistory = useCallback((query: string) => {
    if (!query.trim()) return;
    setHistory(prev => {
      const newHistory = [query, ...prev.filter(h => h !== query)].slice(0, 10);
      localStorage.setItem('search_history', JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem('search_history');
  }, []);

  const removeHistory = useCallback((query: string) => {
    setHistory(prev => {
      const newHistory = prev.filter(h => h !== query);
      localStorage.setItem('search_history', JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  return { history, addHistory, clearHistory, removeHistory };
}

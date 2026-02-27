import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TrendKeyword } from '../types/trend';
import { useTranslation } from 'react-i18next';

export interface UseTrendsReturn {
  trends: TrendKeyword[];
  isLoading: boolean;
  error: string | null;
}

export function useTrends(): UseTrendsReturn {
  const { t } = useTranslation('common');
  const [trends, setTrends] = useState<TrendKeyword[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrends() {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('trend_keywords')
          .select('*')
          .order('count', { ascending: false })
          .limit(10);

        if (error) throw error;

        setTrends(data || []);
      } catch (err) {
        console.error('Error fetching trends:', err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    }

    fetchTrends();
  }, []);

  return { trends, isLoading, error };
}

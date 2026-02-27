import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Category } from '../types/category';

export interface UseCategoriesReturn {
  categories: Category[];
  isLoading: boolean;
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    async function fetchCategories() {
      setIsLoading(true);

      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('sort_order', { ascending: true });

        if (error) throw error;

        setCategories(data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return { categories, isLoading };
}

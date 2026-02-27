import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please check your environment variables.');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

export type Database = {
  public: {
    Tables: {
      articles: {
        Row: {
          id: string;
          title: string;
          title_ja: string;
          authors: string[];
          journal: string;
          source: string;
          source_id: string;
          source_url: string;
          published_at: string;
          abstract: string | null;
          summary_en: string | null;
          summary_ja: string | null;
          categories: string[];
          tags: string[];
          is_rt_relevant: boolean;
          trend_score: number;
          status: 'draft' | 'published' | 'archived';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          title_ja: string;
          authors: string[];
          journal: string;
          source: string;
          source_id: string;
          source_url: string;
          published_at: string;
          abstract?: string | null;
          summary_en?: string | null;
          summary_ja?: string | null;
          categories?: string[];
          tags?: string[];
          is_rt_relevant?: boolean;
          trend_score?: number;
          status?: 'draft' | 'published' | 'archived';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          title_ja?: string;
          authors?: string[];
          journal?: string;
          source?: string;
          source_id?: string;
          source_url?: string;
          published_at?: string;
          abstract?: string | null;
          summary_en?: string | null;
          summary_ja?: string | null;
          categories?: string[];
          tags?: string[];
          is_rt_relevant?: boolean;
          trend_score?: number;
          status?: 'draft' | 'published' | 'archived';
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          slug: string;
          name_en: string;
          name_ja: string;
          icon: string | null;
          sort_order: number;
        };
        Insert: {
          id?: string;
          slug: string;
          name_en: string;
          name_ja: string;
          icon?: string | null;
          sort_order?: number;
        };
        Update: {
          id?: string;
          slug?: string;
          name_en?: string;
          name_ja?: string;
          icon?: string | null;
          sort_order?: number;
        };
      };
      trend_keywords: {
        Row: {
          id: string;
          keyword_en: string;
          keyword_ja: string;
          count: number;
          period_start: string;
          period_end: string;
        };
        Insert: {
          id?: string;
          keyword_en: string;
          keyword_ja: string;
          count?: number;
          period_start: string;
          period_end: string;
        };
        Update: {
          id?: string;
          keyword_en?: string;
          keyword_ja?: string;
          count?: number;
          period_start?: string;
          period_end?: string;
        };
      };
      collection_logs: {
        Row: {
          id: string;
          source: string;
          status: 'pending' | 'running' | 'completed' | 'failed';
          articles_found: number;
          articles_new: number;
          error_message: string | null;
          started_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          source: string;
          status?: 'pending' | 'running' | 'completed' | 'failed';
          articles_found?: number;
          articles_new?: number;
          error_message?: string | null;
          started_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          source?: string;
          status?: 'pending' | 'running' | 'completed' | 'failed';
          articles_found?: number;
          articles_new?: number;
          error_message?: string | null;
          started_at?: string;
          completed_at?: string | null;
        };
      };
      admin_settings: {
        Row: {
          id: string;
          key: string;
          value: Record<string, any>;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: Record<string, any>;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: Record<string, any>;
          updated_at?: string;
        };
      };
    };
  };
};

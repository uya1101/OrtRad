export type ArticleStatus = 'draft' | 'published' | 'archived';

export interface Article {
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
  status: ArticleStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateArticleInput {
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
  status?: ArticleStatus;
}

export interface UpdateArticleInput extends Partial<CreateArticleInput> {
  id: string;
}

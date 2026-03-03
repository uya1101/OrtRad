export interface Article {
  id: string
  title: string
  abstract: string | null
  authors: string[]
  journal: string | null
  published_at: string | null
  source: 'rss' | 'pubmed'
  category: string | null
  status: 'draft' | 'published' | 'archived'
  url: string | null
  rt_relevance: number | null
  created_at: string
  updated_at: string
  tags?: string[]
}

export interface CollectionLog {
  id: string
  source: 'rss' | 'pubmed'
  status: 'success' | 'error'
  articles_collected: number | null
  error_message: string | null
  started_at: string
  completed_at: string | null
}

export interface ArticleFilters {
  page: number
  limit: number
  source?: 'rss' | 'pubmed' | 'all'
  status?: 'draft' | 'published' | 'archived'
  search?: string
}

export interface ArticlesResponse {
  articles: Article[]
  total: number | null
}

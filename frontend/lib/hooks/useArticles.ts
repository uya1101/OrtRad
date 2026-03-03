import { useState, useEffect } from 'react'
import { Article, ArticleFilters, ArticlesResponse } from '@/lib/supabase/types'

export function useArticles(filters: Partial<ArticleFilters>) {
  const [articles, setArticles] = useState<Article[]>([])
  const [total, setTotal] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchArticles() {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        params.append('page', String(filters.page || 1))
        params.append('limit', String(filters.limit || 20))
        if (filters.source && filters.source !== 'all') {
          params.append('source', filters.source)
        }
        if (filters.status) {
          params.append('status', filters.status)
        }
        if (filters.search) {
          params.append('search', filters.search)
        }

        const response = await fetch(`/api/articles?${params.toString()}`)
        if (!response.ok) {
          throw new Error('Failed to fetch articles')
        }

        const data: ArticlesResponse = await response.json()
        setArticles(data.articles)
        setTotal(data.total)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [filters.page, filters.limit, filters.source, filters.status, filters.search])

  return { articles, total, loading, error }
}

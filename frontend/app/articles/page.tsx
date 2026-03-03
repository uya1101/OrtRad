'use client'

import { useState } from 'react'
import { useArticles } from '@/lib/hooks/useArticles'
import { ArticleList } from '@/components/dashboard/ArticleList'
import { SourceFilter } from '@/components/dashboard/SourceFilter'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'

export default function ArticlesPage() {
  const [page, setPage] = useState(1)
  const [source, setSource] = useState<'all' | 'rss' | 'pubmed'>('all')
  const [search, setSearch] = useState('')

  const { articles, total, loading } = useArticles({
    page,
    limit: 20,
    source,
    status: 'published',
    search: search || undefined,
  })

  const totalPages = total ? Math.ceil(total / 20) : 1

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-text-primary mb-6">
        記事一覧
      </h1>

      <Card padding="md" className="mb-6">
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-3">
            <Input
              type="search"
              placeholder="タイトルや要約で検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
            />
            <button
              type="submit"
              className="px-6 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors"
            >
              検索
            </button>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <SourceFilter activeSource={source} onSourceChange={(s) => { setSource(s); setPage(1) }} />
        <p className="text-sm text-text-secondary">
          全 {total?.toLocaleString() || 0} 件の記事
        </p>
      </div>

      <ArticleList
        articles={articles}
        loading={loading}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  )
}

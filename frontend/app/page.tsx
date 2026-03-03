'use client'

import { useState } from 'react'
import { useArticles } from '@/lib/hooks/useArticles'
import { ArticleList } from '@/components/dashboard/ArticleList'
import { SourceFilter } from '@/components/dashboard/SourceFilter'
import { TrendKeywords } from '@/components/dashboard/TrendKeywords'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'

export default function HomePage() {
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

  // Mock trend keywords - in production, these would come from analytics
  const trendKeywords = ['整形外科', '脊椎', '人工関節', '放射線治療', 'MRI', 'CT', '骨粗鬆症', 'スポーツ医学']

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-text-primary mb-2">
          OrtRad
        </h1>
        <p className="text-text-secondary text-lg">
          整形外科・放射線科関連の最新論文・記事
        </p>
      </div>

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

      <div className="space-y-4 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <SourceFilter activeSource={source} onSourceChange={(s) => { setSource(s); setPage(1) }} />
          <p className="text-sm text-text-secondary">
            全 {total?.toLocaleString() || 0} 件の記事
          </p>
        </div>

        <TrendKeywords keywords={trendKeywords} />
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

'use client'

import { useState } from 'react'
import { useArticles } from '@/lib/hooks/useArticles'
import { ArticleList } from '@/components/dashboard/ArticleList'
import { Input } from '@/components/ui/Input'
import { Search } from 'lucide-react'

export default function SearchPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { articles, total, loading } = useArticles({
    page,
    limit: 20,
    status: 'published',
    search: search || undefined,
  })

  const totalPages = total ? Math.ceil(total / 20) : 1

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-text-primary mb-6">
        記事検索
      </h1>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
          <Input
            type="search"
            placeholder="タイトルや要約で検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12"
            fullWidth
          />
        </div>
        <button
          type="submit"
          className="w-full mt-3 px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors"
        >
          検索
        </button>
      </form>

      {search && (
        <>
          <p className="text-sm text-text-secondary mb-4">
            "{search}" の検索結果: {total?.toLocaleString() || 0} 件
          </p>

          <ArticleList
            articles={articles}
            loading={loading}
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}

      {!search && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <p className="text-text-secondary text-lg">
            キーワードを入力して検索してください
          </p>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { useArticles } from '@/lib/hooks/useArticles'
import { ArticleList } from '@/components/dashboard/ArticleList'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { PageLoader } from '@/components/ui/LoadingSpinner'

export default function AdminArticlesPage() {
  const [page, setPage] = useState(1)
  const { articles, total, loading } = useArticles({
    page,
    limit: 20,
    status: 'published',
  })

  const totalPages = total ? Math.ceil(total / 20) : 1

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-text-primary">記事管理</h1>
        </div>

        <Card padding="md">
          <CardHeader>
            <CardTitle>統計</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-2xl font-bold text-text-primary">{total || 0}</p>
                <p className="text-sm text-text-secondary">公開記事数</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-accent">-</p>
                <p className="text-sm text-text-secondary">下書き</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-warning">-</p>
                <p className="text-sm text-text-secondary">アーカイブ</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-success">-</p>
                <p className="text-sm text-text-secondary">高RT関連性</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <ArticleList
          articles={articles}
          loading={loading}
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </AdminLayout>
  )
}

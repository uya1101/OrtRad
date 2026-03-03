import { Article } from '@/lib/supabase/types'
import { ArticleMeta } from './ArticleMeta'
import { Card } from '@/components/ui/Card'
import { ExternalLink } from 'lucide-react'

interface ArticleDetailProps {
  article: Article
}

export function ArticleDetail({ article }: ArticleDetailProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <Card padding="lg" className="mb-6">
        <ArticleMeta article={article} />

        <h1 className="text-3xl font-bold text-text-primary mb-6">
          {article.title}
        </h1>

        {article.abstract && (
          <div className="prose prose-invert max-w-none">
            <h2 className="text-xl font-semibold text-text-primary mb-3">要約</h2>
            <p className="text-text-secondary leading-relaxed">
              {article.abstract}
            </p>
          </div>
        )}

        {article.url && (
          <div className="mt-8 pt-6 border-t border-background-tertiary">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors"
            >
              原文を読む
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </Card>

      <Card padding="md">
        <h2 className="text-lg font-semibold text-text-primary mb-4">関連情報</h2>
        <div className="space-y-2 text-sm text-text-secondary">
          <div className="flex justify-between">
            <span>作成日時</span>
            <span className="text-text-primary">
              {new Date(article.created_at).toLocaleString('ja-JP')}
            </span>
          </div>
          <div className="flex justify-between">
            <span>更新日時</span>
            <span className="text-text-primary">
              {new Date(article.updated_at).toLocaleString('ja-JP')}
            </span>
          </div>
          {article.rt_relevance !== null && (
            <div className="flex justify-between">
              <span>RT関連性スコア</span>
              <span className="text-primary font-semibold">
                {Math.round(article.rt_relevance * 100)}%
              </span>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

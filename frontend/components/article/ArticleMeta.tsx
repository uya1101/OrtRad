import { Article } from '@/lib/supabase/types'
import { Badge } from '@/components/ui/Badge'
import { formatDate, formatDateTime } from '@/lib/utils/format'

interface ArticleMetaProps {
  article: Article
}

export function ArticleMeta({ article }: ArticleMetaProps) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Badge variant="primary" size="md">
          {article.source.toUpperCase()}
        </Badge>
        <Badge variant={article.status === 'published' ? 'success' : 'warning'} size="md">
          {article.status === 'published' ? '公開済み' : article.status === 'draft' ? '下書き' : 'アーカイブ'}
        </Badge>
        {article.rt_relevance !== null && article.rt_relevance > 0.5 && (
          <Badge variant="success" size="md">
            RT関連性 {Math.round(article.rt_relevance * 100)}%
          </Badge>
        )}
        {article.category && (
          <Badge variant="default" size="md">
            {article.category}
          </Badge>
        )}
      </div>

      <div className="space-y-2 mb-4 text-sm text-text-secondary">
        {article.journal && (
          <p>
            <span className="font-medium text-text-primary">ジャーナル:</span> {article.journal}
          </p>
        )}
        {article.published_at && (
          <p>
            <span className="font-medium text-text-primary">公開日:</span> {formatDate(article.published_at)}
          </p>
        )}
        {article.authors && article.authors.length > 0 && (
          <p>
            <span className="font-medium text-text-primary">著者:</span>{' '}
            {article.authors.join(', ')}
          </p>
        )}
      </div>

      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {article.tags.map((tag) => (
            <Badge key={tag} variant="default" size="sm">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </>
  )
}

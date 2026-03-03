import { Article } from '@/lib/supabase/types'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatRelativeTime, formatDate } from '@/lib/utils/format'
import Link from 'next/link'

interface ArticleCardProps {
  article: Article
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Card hover padding="md" className="h-full flex flex-col">
      <Link href={`/articles/${article.id}`}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge variant="primary" size="sm">
            {article.source.toUpperCase()}
          </Badge>
          {article.rt_relevance !== null && article.rt_relevance > 0.5 && (
            <Badge variant="success" size="sm">
              RT関連性 {Math.round(article.rt_relevance * 100)}%
            </Badge>
          )}
        </div>

        <h3 className="text-lg font-semibold text-text-primary line-clamp-2 mb-2 hover:text-accent transition-colors">
          {article.title}
        </h3>

        {article.journal && (
          <p className="text-sm text-text-secondary mb-1">{article.journal}</p>
        )}

        {article.authors && article.authors.length > 0 && (
          <p className="text-sm text-text-muted mb-2 line-clamp-1">
            {article.authors.slice(0, 3).join(', ')}
            {article.authors.length > 3 && ' et al.'}
          </p>
        )}

        {article.abstract && (
          <p className="text-sm text-text-secondary line-clamp-3 mb-3 flex-grow">
            {article.abstract}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-text-muted mt-auto pt-2 border-t border-background-tertiary">
          <time dateTime={article.published_at || article.created_at}>
            {article.published_at ? formatRelativeTime(article.published_at) : formatDate(article.created_at)}
          </time>
          {article.category && (
            <Badge variant="default" size="sm">
              {article.category}
            </Badge>
          )}
        </div>
      </Link>
    </Card>
  )
}

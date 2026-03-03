import { Badge } from '@/components/ui/Badge'

interface TrendKeywordsProps {
  keywords: string[]
}

export function TrendKeywords({ keywords }: TrendKeywordsProps) {
  if (keywords.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2">
      <span className="text-sm text-text-secondary">トレンドキーワード:</span>
      {keywords.slice(0, 5).map((keyword) => (
        <Badge key={keyword} variant="primary" size="sm" className="cursor-pointer hover:bg-accent/30">
          {keyword}
        </Badge>
      ))}
    </div>
  )
}

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

interface DashboardStatsProps {
  totalArticles: number
  todayArticles: number
  lastCollectionStatus: 'success' | 'error' | 'idle'
  lastCollectionTime?: Date
}

export function DashboardStats({
  totalArticles,
  todayArticles,
  lastCollectionStatus,
  lastCollectionTime,
}: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card padding="md">
        <CardHeader>
          <CardTitle className="text-base text-text-secondary">総記事数</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-text-primary">{totalArticles.toLocaleString()}</p>
        </CardContent>
      </Card>

      <Card padding="md">
        <CardHeader>
          <CardTitle className="text-base text-text-secondary">今日の新着</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-accent">{todayArticles.toLocaleString()}</p>
        </CardContent>
      </Card>

      <Card padding="md">
        <CardHeader>
          <CardTitle className="text-base text-text-secondary">最後の収集</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Badge
              variant={lastCollectionStatus === 'success' ? 'success' : lastCollectionStatus === 'error' ? 'error' : 'default'}
              size="md"
            >
              {lastCollectionStatus === 'success' ? '成功' : lastCollectionStatus === 'error' ? 'エラー' : '待機中'}
            </Badge>
            {lastCollectionTime && (
              <p className="text-sm text-text-muted">
                {lastCollectionTime.toLocaleString('ja-JP')}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { CollectionLog } from '@/lib/supabase/types'
import { formatDateTime } from '@/lib/utils/format'

interface LogsTableProps {
  logs: CollectionLog[]
}

export function LogsTable({ logs }: LogsTableProps) {
  if (logs.length === 0) {
    return (
      <Card padding="md">
        <CardHeader>
          <CardTitle>収集ログ</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-text-secondary text-sm">ログがありません</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card padding="md">
      <CardHeader>
        <CardTitle>収集ログ</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-background-tertiary">
                <th className="text-left py-2 px-3 text-text-secondary font-medium">ソース</th>
                <th className="text-left py-2 px-3 text-text-secondary font-medium">ステータス</th>
                <th className="text-left py-2 px-3 text-text-secondary font-medium">収集数</th>
                <th className="text-left py-2 px-3 text-text-secondary font-medium">開始時間</th>
                <th className="text-left py-2 px-3 text-text-secondary font-medium">終了時間</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-background-tertiary/50 hover:bg-background-tertiary/20">
                  <td className="py-2 px-3">
                    <Badge variant="primary" size="sm">
                      {log.source.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-2 px-3">
                    <Badge
                      variant={log.status === 'success' ? 'success' : 'error'}
                      size="sm"
                    >
                      {log.status === 'success' ? '成功' : 'エラー'}
                    </Badge>
                  </td>
                  <td className="py-2 px-3 text-text-primary">
                    {log.articles_collected ?? '-'}
                  </td>
                  <td className="py-2 px-3 text-text-secondary">
                    {formatDateTime(log.started_at)}
                  </td>
                  <td className="py-2 px-3 text-text-secondary">
                    {log.completed_at ? formatDateTime(log.completed_at) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

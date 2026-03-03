import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { useCollection } from '@/lib/hooks/useCollection'
import { useState } from 'react'
import { AlertCircle, CheckCircle } from 'lucide-react'

export function CollectionTrigger() {
  const { triggerCollection, loading, error, success, clearMessages } = useCollection()
  const [lastTriggered, setLastTriggered] = useState<'rss' | 'pubmed' | null>(null)

  const handleTrigger = async (source: 'rss' | 'pubmed') => {
    clearMessages()
    try {
      await triggerCollection(source)
      setLastTriggered(source)
    } catch (err) {
      // Error is already handled by hook
    }
  }

  return (
    <Card padding="md">
      <CardHeader>
        <CardTitle>データ収集トリガー</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            新しい記事を収集するには、以下のボタンをクリックしてください。
          </p>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              loading={loading === 'rss'}
              onClick={() => handleTrigger('rss')}
            >
              RSSから収集
            </Button>
            <Button
              variant="primary"
              loading={loading === 'pubmed'}
              onClick={() => handleTrigger('pubmed')}
            >
              PubMedから収集
            </Button>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-error/10 border border-error/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2 p-3 bg-success/10 border border-success/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <p className="text-sm text-success">{success}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

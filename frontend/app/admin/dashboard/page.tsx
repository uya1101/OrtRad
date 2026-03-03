'use client'

import { AdminLayout } from '@/components/layout/AdminLayout'
import { DashboardStats } from '@/components/admin/DashboardStats'
import { CollectionTrigger } from '@/components/admin/CollectionTrigger'
import { LogsTable } from '@/components/admin/LogsTable'
import { CollectionLog } from '@/lib/supabase/types'
import { supabase } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { PageLoader } from '@/components/ui/LoadingSpinner'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalArticles: 0,
    todayArticles: 0,
    lastCollectionStatus: 'idle' as 'success' | 'error' | 'idle',
    lastCollectionTime: undefined as Date | undefined,
  })
  const [logs, setLogs] = useState<CollectionLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch total articles
        const { count: totalCount } = await supabase
          .from('articles')
          .select('*', { count: 'exact', head: true })

        // Fetch today's articles
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const { count: todayCount } = await supabase
          .from('articles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', today.toISOString())

        // Fetch recent logs
        const { data: logsData } = await supabase
          .from('collection_logs')
          .select('*')
          .order('started_at', { ascending: false })
          .limit(10)

        setStats({
          totalArticles: totalCount || 0,
          todayArticles: todayCount || 0,
          lastCollectionStatus: logsData && logsData.length > 0 ? logsData[0].status : 'idle',
          lastCollectionTime: logsData && logsData.length > 0 ? new Date(logsData[0].started_at) : undefined,
        })
        setLogs(logsData || [])
      } catch (error) {
        console.error('Failed to fetch admin data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <AdminLayout>
        <PageLoader />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-text-primary">管理ダッシュボード</h1>

        <DashboardStats
          totalArticles={stats.totalArticles}
          todayArticles={stats.todayArticles}
          lastCollectionStatus={stats.lastCollectionStatus}
          lastCollectionTime={stats.lastCollectionTime}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CollectionTrigger />
          <LogsTable logs={logs} />
        </div>
      </div>
    </AdminLayout>
  )
}

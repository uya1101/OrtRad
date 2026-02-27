import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { T } from '../../constants/tokens';
import { supabase } from '../../lib/supabase';
import Dot from '../../components/common/Dot';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  runCollectionPipeline,
  runSummarization,
} from '../../lib/edgeFunctions';

interface StatCard {
  label: string;
  value: string | number;
  color: string;
  icon: string;
}

interface CollectionLog {
  id: number;
  source: string;
  status: string;
  fetched_count: number;
  new_count: number;
  error_message: string | null;
  created_at: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [recentLogs, setRecentLogs] = useState<CollectionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [{ count: totalArticles }, { count: todayArticles }, { count: publishedCount },
        { count: draftCount }, { count: archivedCount }] = await Promise.all([
        supabase.from('articles').select('*', { count: 'exact', head: true }),
        supabase.from('articles').select('*', { count: 'exact', head: true }).gte('created_at', new Date().toISOString().split('T')[0]),
        supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
        supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'archived'),
      ]);

      const { data: sourceData } = await supabase.from('articles').select('source').not('source', 'is', null);
      const sourceCounts = sourceData?.reduce((acc: Record<string, number>, item) => {
        acc[item.source] = (acc[item.source] || 0) + 1;
        return acc;
      }, {}) || {};

      const { data: logsData } = await supabase
        .from('collection_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setStats([
        { label: 'TOTAL_ARTICLES', value: totalArticles || 0, color: T.neonBlue, icon: '📄' },
        { label: 'TODAY_NEW', value: todayArticles || 0, color: T.neonTeal, icon: '🆕' },
        { label: 'PUBLISHED', value: publishedCount || 0, color: '#22c55e', icon: '✅' },
        { label: 'DRAFT', value: draftCount || 0, color: T.textDim, icon: '📝' },
        { label: 'ARCHIVED', value: archivedCount || 0, color: T.neonAmber, icon: '📦' },
        { label: 'PUBMED', value: sourceCounts['pubmed'] || 0, color: '#8b5cf6', icon: '🔬' },
        { label: 'JAAOS', value: sourceCounts['jaaos'] || 0, color: '#06b6d4', icon: '📚' },
        { label: 'RADIOLOGY', value: sourceCounts['radiology'] || 0, color: '#ec4899', icon: '🏥' },
      ]);

      setRecentLogs(logsData || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRunPipeline = useCallback(async () => {
    setActionLoading('pipeline');
    const result = await runCollectionPipeline();
    if (result.success) {
      await fetchDashboardData();
    }
    setActionLoading(null);
  }, [fetchDashboardData]);

  const handleSummarize = useCallback(async () => {
    setActionLoading('summarize');
    const result = await runSummarization();
    if (result.success) {
      await fetchDashboardData();
    }
    setActionLoading(null);
  }, [fetchDashboardData]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success': return T.neonTeal;
      case 'error': return T.neonCoral;
      case 'running': return T.neonAmber;
      default: return T.textDim;
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 100 }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 style={{
          fontFamily: "'Rajdhani',sans-serif", fontWeight: 700,
          fontSize: '1.8rem', color: T.textPrimary,
          letterSpacing: '0.05em', marginBottom: 8,
        }}>
          DASHBOARD
        </h1>
        <p style={{
          fontFamily: "'Share Tech Mono',monospace",
          fontSize: '0.55rem', color: T.textDim,
          letterSpacing: '0.06em', textTransform: 'uppercase',
          marginBottom: 32,
        }}>
          System Overview and Quick Actions
        </p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            style={{ padding: '20px', background: 'rgba(8,15,30,0.60)', border: `1px solid ${T.border}`, borderRadius: 12 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: '1.5rem' }}>{stat.icon}</span>
              <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.5rem', color: T.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {stat.label.replace('_', ' ')}
              </span>
            </div>
            <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: '2rem', color: stat.color }}>
              {stat.value}
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, fontSize: '1.1rem', color: T.textPrimary, letterSpacing: '0.05em', marginBottom: 16 }}>
          QUICK ACTIONS
        </h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleRunPipeline} disabled={!!actionLoading}
            style={{ padding: '12px 20px', background: actionLoading === 'pipeline' ? 'rgba(56,189,248,0.3)' : `linear-gradient(135deg,${T.neonBlue},${T.neonTeal})`,
              border: actionLoading === 'pipeline' ? `1px solid ${T.neonBlue}` : 'none', borderRadius: 8,
              cursor: actionLoading ? 'not-allowed' : 'pointer', fontFamily: "'Share Tech Mono',monospace",
              fontSize: '0.6rem', letterSpacing: '0.08em', color: actionLoading === 'pipeline' ? T.neonBlue : '#050b14', fontWeight: 600, transition: 'all 0.2s ease',
            }}
          >
            {actionLoading === 'pipeline' ? 'RUNNING...' : '🚀 RUN COLLECTION PIPELINE'}
          </motion.button>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSummarize} disabled={!!actionLoading}
            style={{ padding: '12px 20px', background: actionLoading === 'summarize' ? 'rgba(45,212,191,0.3)' : 'rgba(45,212,191,0.1)',
              border: actionLoading === 'summarize' ? `1px solid ${T.neonTeal}` : `1px solid ${T.border}`, borderRadius: 8,
              cursor: actionLoading ? 'not-allowed' : 'pointer', fontFamily: "'Share Tech Mono',monospace",
              fontSize: '0.6rem', letterSpacing: '0.08em', color: actionLoading === 'summarize' ? T.neonTeal : T.textSecond, transition: 'all 0.2s ease',
            }}
          >
            {actionLoading === 'summarize' ? 'PROCESSING...' : '✨ RUN AI SUMMARIZATION'}
          </motion.button>
        </div>
      </div>

      <div>
        <h2 style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, fontSize: '1.1rem', color: T.textPrimary, letterSpacing: '0.05em', marginBottom: 16 }}>
          RECENT COLLECTION LOGS
        </h2>
        <div style={{ background: 'rgba(8,15,30,0.40)', border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden' }}>
          {recentLogs.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: T.textDim, fontFamily: "'Share Tech Mono',monospace", fontSize: '0.55rem' }}>
              NO_COLLECTION_LOGS
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(5,11,20,0.60)', borderBottom: `1px solid ${T.border}` }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontFamily: "'Share Tech Mono',monospace", fontSize: '0.5rem', color: T.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' }}>SOURCE</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontFamily: "'Share Tech Mono',monospace", fontSize: '0.5rem', color: T.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' }}>STATUS</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontFamily: "'Share Tech Mono',monospace", fontSize: '0.5rem', color: T.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' }}>FETCHED</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontFamily: "'Share Tech Mono',monospace", fontSize: '0.5rem', color: T.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' }}>NEW</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontFamily: "'Share Tech Mono',monospace", fontSize: '0.5rem', color: T.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' }}>TIME</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: `1px solid ${T.border}22` }}>
                    <td style={{ padding: '12px 16px', fontFamily: "'Share Tech Mono',monospace", fontSize: '0.55rem', color: T.textSecond }}>
                      {log.source.toUpperCase()}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Dot color={getStatusColor(log.status)} label={log.status.toUpperCase()} />
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: "'Share Tech Mono',monospace", fontSize: '0.55rem', color: T.textSecond }}>
                      {log.fetched_count}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: "'Share Tech Mono',monospace", fontSize: '0.55rem', color: log.new_count > 0 ? T.neonTeal : T.textDim }}>
                      +{log.new_count}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: "'Share Tech Mono',monospace", fontSize: '0.5rem', color: T.textDim }}>
                      {new Date(log.created_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

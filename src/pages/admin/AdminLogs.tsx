import React, { useState, useEffect } from 'react';
import { T } from '../../constants/tokens';
import { supabase } from '../../lib/supabase';

interface CollectionLog {
  id: number;
  source: string;
  status: string;
  fetched_count: number;
  new_count: number;
  error_message: string | null;
  created_at: string;
}

export default function AdminLogs() {
  const [logs, setLogs] = useState<CollectionLog[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  useEffect(() => {
    fetchLogs();
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, [statusFilter, sourceFilter, dateFrom, dateTo]);

  const fetchLogs = async () => {
    let query = supabase.from('collection_logs').select('*').order('created_at', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }
    if (sourceFilter !== 'all') {
      query = query.eq('source', sourceFilter);
    }
    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    const { data } = await query;
    setLogs(data || []);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success': return '#22c55e';
      case 'error': return '#ef4444';
      case 'running': return '#f59e0b';
      default: return T.textDim;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div>
      <h1 style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: '1.8rem', color: T.textPrimary, letterSpacing: '0.05em', marginBottom: 8 }}>
        COLLECTION LOGS
      </h1>
      <p style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.55rem', color: T.textDim, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 24 }}>
        View Collection History and Status
      </p>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '10px 14px', background: 'rgba(8,15,30,0.60)', border: `1px solid ${T.border}`, borderRadius: 6, color: T.textPrimary }}>
          <option value="all">All Status</option>
          <option value="success">Success</option>
          <option value="error">Error</option>
          <option value="running">Running</option>
        </select>
        <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} style={{ padding: '10px 14px', background: 'rgba(8,15,30,0.60)', border: `1px solid ${T.border}`, borderRadius: 6, color: T.textPrimary }}>
          <option value="all">All Sources</option>
          <option value="pubmed">PubMed</option>
          <option value="rss">RSS</option>
        </select>
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={{ padding: '10px 14px', background: 'rgba(8,15,30,0.60)', border: `1px solid ${T.border}`, borderRadius: 6, color: T.textPrimary }} />
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={{ padding: '10px 14px', background: 'rgba(8,15,30,0.60)', border: `1px solid ${T.border}`, borderRadius: 6, color: T.textPrimary }} />
      </div>

      {/* Logs Table */}
      <div style={{ background: 'rgba(8,15,30,0.40)', border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(5,11,20,0.60)', borderBottom: `1px solid ${T.border}` }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontFamily: "'Share Tech Mono',monospace", fontSize: '0.5rem', color: T.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                TIMESTAMP
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontFamily: "'Share Tech Mono',monospace", fontSize: '0.5rem', color: T.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                SOURCE
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontFamily: "'Share Tech Mono',monospace", fontSize: '0.5rem', color: T.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                STATUS
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'right', fontFamily: "'Share Tech Mono',monospace", fontSize: '0.5rem', color: T.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                FETCHED
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'right', fontFamily: "'Share Tech Mono',monospace", fontSize: '0.5rem', color: T.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                NEW
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontFamily: "'Share Tech Mono',monospace", fontSize: '0.5rem', color: T.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                ERROR
              </th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} style={{ borderBottom: `1px solid ${T.border}22` }}>
                <td style={{ padding: '12px 16px', fontFamily: "'Share Tech Mono',monospace", fontSize: '0.5rem', color: T.textSecond }}>
                  {formatDate(log.created_at)}
                </td>
                <td style={{ padding: '12px 16px', fontFamily: "'Share Tech Mono',monospace", fontSize: '0.55rem', color: T.textSecond }}>
                  {log.source.toUpperCase()}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ padding: '4px 10px', background: `${getStatusColor(log.status)}22`, borderRadius: 4, color: getStatusColor(log.status), fontSize: '0.5rem', fontFamily: "'Share Tech Mono',monospace" }}>
                    {log.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: "'Share Tech Mono',monospace", fontSize: '0.55rem', color: T.textSecond }}>
                  {log.fetched_count}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: "'Share Tech Mono',monospace", fontSize: '0.55rem', color: log.new_count > 0 ? '#22c55e' : T.textSecond }}>
                  +{log.new_count}
                </td>
                <td style={{ padding: '12px 16px', fontFamily: "'Share Tech Mono',monospace", fontSize: '0.5rem', color: log.error_message ? T.neonCoral : T.textSecond, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {log.error_message || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

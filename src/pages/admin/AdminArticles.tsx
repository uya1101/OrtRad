import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { T } from '../../constants/tokens';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/common/LoadingSpinner';

interface Article {
  id: string;
  title: string;
  title_ja: string | null;
  source: string;
  status: 'draft' | 'published' | 'archived';
  published_at: string | null;
  is_rt_relevant: boolean;
}

export default function AdminArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchArticles = useCallback(async () => {
    try {
      let query = supabase.from('articles').select('*').order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (sourceFilter !== 'all') {
        query = query.eq('source', sourceFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, statusFilter, sourceFilter]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    setSelectedIds(selectedIds.length === articles.length ? [] : articles.map(a => a.id));
  };

  const handleBulkStatus = async (status: 'draft' | 'published' | 'archived') => {
    if (selectedIds.length === 0) return;
    const { error } = await supabase.from('articles').update({ status }).in('id', selectedIds);
    if (!error) {
      await fetchArticles();
      setSelectedIds([]);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (!error) {
      await fetchArticles();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return T.neonTeal;
      case 'draft': return T.textDim;
      case 'archived': return T.neonAmber;
      default: return T.textSecond;
    }
  };

  const getSourceLabel = (source: string) => {
    const labels: Record<string, string> = {
      pubmed: 'PubMed',
      jaaos: 'JAAOS',
      radiology: 'Radiology',
      eur_radiology: 'Eur Radiol',
      rsna: 'RSNA',
    };
    return labels[source] || source;
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
        <h1 style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: '1.8rem', color: T.textPrimary, letterSpacing: '0.05em', marginBottom: 8 }}>
          ARTICLE MANAGEMENT
        </h1>
        <p style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.55rem', color: T.textDim, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 24 }}>
          Manage, Edit, and Organize Articles
        </p>
      </motion.div>

      {/* Filters & Actions */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search articles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1, minWidth: 200, padding: '10px 14px',
            background: 'rgba(8,15,30,0.60)', border: `1px solid ${T.border}`,
            borderRadius: 6, color: T.textPrimary,
            fontFamily: "'Share Tech Mono',monospace", fontSize: '0.55rem',
          }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '10px 14px', background: 'rgba(8,15,30,0.60)', border: `1px solid ${T.border}`, borderRadius: 6, color: T.textPrimary }}
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          style={{ padding: '10px 14px', background: 'rgba(8,15,30,0.60)', border: `1px solid ${T.border}`, borderRadius: 6, color: T.textPrimary }}
        >
          <option value="all">All Sources</option>
          <option value="pubmed">PubMed</option>
          <option value="jaaos">JAAOS</option>
          <option value="radiology">Radiology</option>
          <option value="eur_radiology">Eur Radiol</option>
          <option value="rsna">RSNA</option>
        </select>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div style={{ marginBottom: 20, display: 'flex', gap: 8 }}>
          <span style={{ padding: '6px 12px', background: 'rgba(56,189,248,0.1)', borderRadius: 4, fontSize: '0.55rem', color: T.neonBlue }}>
            {selectedIds.length} selected
          </span>
          <button onClick={() => handleBulkStatus('published')} style={{ padding: '6px 14px', background: 'rgba(34,197,94,0.1)', border: `1px solid ${T.border}`, borderRadius: 6, color: T.textSecond, fontSize: '0.55rem' }}>
            Mark Published
          </button>
          <button onClick={() => handleBulkStatus('archived')} style={{ padding: '6px 14px', background: 'rgba(251,146,60,0.1)', border: `1px solid ${T.border}`, borderRadius: 6, color: T.textSecond, fontSize: '0.55rem' }}>
            Archive
          </button>
        </div>
      )}

      {/* Articles Table */}
      <div style={{ background: 'rgba(8,15,30,0.40)', border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(5,11,20,0.60)', borderBottom: `1px solid ${T.border}` }}>
              <th style={{ padding: '12px 16px', width: '40px', textAlign: 'center' }}>
                <input type="checkbox" checked={selectedIds.length === articles.length && articles.length > 0} onChange={handleSelectAll} style={{ width: 16, height: 16 }} />
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontFamily: "'Share Tech Mono',monospace", fontSize: '0.5rem', color: T.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                TITLE
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontFamily: "'Share Tech Mono',monospace", fontSize: '0.5rem', color: T.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                SOURCE
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontFamily: "'Share Tech Mono',monospace", fontSize: '0.5rem', color: T.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                STATUS
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontFamily: "'Share Tech Mono',monospace", fontSize: '0.5rem', color: T.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                RT
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'right', fontFamily: "'Share Tech Mono',monospace", fontSize: '0.5rem', color: T.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                PUBLISHED
              </th>
              <th style={{ padding: '12px 16px', width: '120px', textAlign: 'right', fontFamily: "'Share Tech Mono',monospace", fontSize: '0.5rem', color: T.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr
                key={article.id}
                style={{ borderBottom: `1px solid ${T.border}22`, background: selectedIds.includes(article.id) ? 'rgba(56,189,248,0.05)' : 'transparent' }}
              >
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <input type="checkbox" checked={selectedIds.includes(article.id)} onChange={() => handleSelect(article.id)} style={{ width: 16, height: 16 }} />
                </td>
                <td style={{ padding: '12px 16px', fontFamily: "'Noto Sans JP',sans-serif", fontSize: '0.85rem', color: T.textSecond }}>
                  {article.title.substring(0, 30)}
                  {article.title.length > 30 && '...'}
                </td>
                <td style={{ padding: '12px 16px', fontFamily: "'Share Tech Mono',monospace", fontSize: '0.55rem', color: T.textSecond }}>
                  {getSourceLabel(article.source)}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <span style={{ padding: '4px 10px', background: `${getStatusColor(article.status)}22`, borderRadius: 4, color: getStatusColor(article.status), fontSize: '0.5rem', fontFamily: "'Share Tech Mono',monospace" }}>
                    {article.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  {article.is_rt_relevant && <span style={{ color: T.neonTeal }}>✓</span>}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: "'Share Tech Mono',monospace", fontSize: '0.5rem', color: T.textSecond }}>
                  {article.published_at ? new Date(article.published_at).toLocaleDateString('ja-JP') : '-'}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <button onClick={() => handleDelete(article.id)} style={{ padding: '4px 8px', background: 'rgba(239,68,68,0.1)', border: `1px solid ${T.border}`, borderRadius: 4, color: T.neonCoral, fontSize: '0.5rem', cursor: 'pointer' }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

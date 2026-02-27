import React, { useState, useEffect } from 'react';
import { T } from '../../constants/tokens';
import { supabase } from '../../lib/supabase';

interface AdminSetting {
  key: string;
  value: unknown;
}

export default function AdminSettings() {
  const [collectionLimit, setCollectionLimit] = useState('100');
  const [scheduleTime, setScheduleTime] = useState('00:00');
  const [geminiTemperature, setGeminiTemperature] = useState('0.7');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const [{ data: limitData }, { data: timeData }, { data: tempData }] = await Promise.all([
      supabase.from('admin_settings').select('*').eq('key', 'collection_limit').single(),
      supabase.from('admin_settings').select('*').eq('key', 'schedule_time').single(),
      supabase.from('admin_settings').select('*').eq('key', 'gemini_temperature').single(),
    ]);

    if (limitData) setCollectionLimit(String(limitData.value || '100'));
    if (timeData) setScheduleTime(String(timeData.value || '00:00'));
    if (tempData) setGeminiTemperature(String(tempData.value || '0.7'));
    setIsLoading(false);
  };

  const handleSave = async (key: string, value: unknown) => {
    await supabase.from('admin_settings').upsert({ key, value });
    alert('Setting saved!');
  };

  const handleExportCSV = async () => {
    const { data } = await supabase.from('articles').select('*').eq('status', 'published');
    if (!data) return;

    const headers = ['ID', 'Title', 'Source', 'Published Date', 'Categories', 'Tags'];
    const rows = data.map(a => [
      a.id,
      a.title,
      a.source,
      a.published_at,
      a.categories?.join('; ') || '',
      a.tags?.join('; ') || '',
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ortrad-articles-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleDeleteAllArticles = async () => {
    if (!confirm('⚠️ WARNING: This will delete ALL articles. Are you sure?')) return;
    if (!confirm('⚠️ FINAL WARNING: This action cannot be undone!')) return;

    await supabase.from('articles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    alert('All articles deleted!');
  };

  const handleClearLogs = async () => {
    if (!confirm('Clear all collection logs?')) return;
    await supabase.from('collection_logs').delete().neq('id', 0);
    alert('Logs cleared!');
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: '1.8rem', color: T.textPrimary, letterSpacing: '0.05em', marginBottom: 8 }}>
        SETTINGS
      </h1>
      <p style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.55rem', color: T.textDim, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 32 }}>
        Configure System Parameters
      </p>

      {/* Collection Settings */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, fontSize: '1.1rem', color: T.textPrimary, marginBottom: 16 }}>
          COLLECTION SETTINGS
        </h2>
        <div style={{ background: 'rgba(8,15,30,0.40)', border: `1px solid ${T.border}`, borderRadius: 10, padding: 24 }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontFamily: "'Share Tech Mono',monospace", fontSize: '0.5rem', color: T.textDim, marginBottom: 8 }}>
              Collection Limit per Run (Display Only)
            </label>
            <input type="number" value={collectionLimit} onChange={(e) => setCollectionLimit(e.target.value)} style={{ width: 150, padding: '10px 14px', background: 'rgba(8,15,30,0.60)', border: `1px solid ${T.border}`, borderRadius: 6, color: T.textPrimary, fontSize: '0.9rem' }} />
            <p style={{ fontSize: '0.5rem', color: T.textDim, marginTop: 4 }}>
              Note: Actual scheduling is handled by Supabase Cron jobs
            </p>
          </div>
          <div>
            <label style={{ display: 'block', fontFamily: "'Share Tech Mono',monospace", fontSize: '0.5rem', color: T.textDim, marginBottom: 8 }}>
              Scheduled Collection Time (Display Only)
            </label>
            <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} style={{ padding: '10px 14px', background: 'rgba(8,15,30,0.60)', border: `1px solid ${T.border}`, borderRadius: 6, color: T.textPrimary, fontSize: '0.9rem' }} />
          </div>
        </div>
      </div>

      {/* AI Settings */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, fontSize: '1.1rem', color: T.textPrimary, marginBottom: 16 }}>
          AI SETTINGS
        </h2>
        <div style={{ background: 'rgba(8,15,30,0.40)', border: `1px solid ${T.border}`, borderRadius: 10, padding: 24 }}>
          <div>
            <label style={{ display: 'block', fontFamily: "'Share Tech Mono',monospace", fontSize: '0.5rem', color: T.textDim, marginBottom: 8 }}>
              Gemini Temperature (0.0 - 1.0)
            </label>
            <input type="number" step="0.1" min="0" max="1" value={geminiTemperature} onChange={(e) => setGeminiTemperature(e.target.value)} style={{ width: 150, padding: '10px 14px', background: 'rgba(8,15,30,0.60)', border: `1px solid ${T.border}`, borderRadius: 6, color: T.textPrimary, fontSize: '0.9rem' }} />
            <p style={{ fontSize: '0.5rem', color: T.textDim, marginTop: 4 }}>
              Lower = more focused, Higher = more creative
            </p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div>
        <h2 style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, fontSize: '1.1rem', color: T.neonCoral, marginBottom: 16 }}>
          ⚠️ DANGER ZONE
        </h2>
        <div style={{ background: 'rgba(239,68,68,0.1)', border: `1px solid ${T.neonCoral}`, borderRadius: 10, padding: 24 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button onClick={handleExportCSV} style={{ padding: '12px 20px', background: 'rgba(56,189,248,0.1)', border: `1px solid ${T.border}`, borderRadius: 8, color: T.textSecond, fontSize: '0.6rem', cursor: 'pointer' }}>
              📥 Export All Articles (CSV)
            </button>
            <button onClick={handleDeleteAllArticles} style={{ padding: '12px 20px', background: 'rgba(239,68,68,0.2)', border: `1px solid ${T.neonCoral}`, borderRadius: 8, color: T.neonCoral, fontSize: '0.6rem', cursor: 'pointer' }}>
              🗑️ Delete All Articles
            </button>
            <button onClick={handleClearLogs} style={{ padding: '12px 20px', background: 'rgba(239,68,68,0.2)', border: `1px solid ${T.neonCoral}`, borderRadius: 8, color: T.neonCoral, fontSize: '0.6rem', cursor: 'pointer' }}>
              🗑️ Clear All Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { T } from '../../constants/tokens';
import { supabase } from '../../lib/supabase';

interface RSSSource {
  id: string;
  name: string;
  url: string;
  slug: string;
  is_active: boolean;
}

export default function AdminSources() {
  const [rssSources, setRssSources] = useState<RSSSource[]>([]);
  const [pubmedKeywords, setPubmedKeywords] = useState<string>('');
  const [newSource, setNewSource] = useState({ name: '', url: '', slug: '' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [{ data: rssData }, { data: settingsData }] = await Promise.all([
      supabase.from('rss_sources').select('*'),
      supabase.from('admin_settings').select('*').eq('key', 'pubmed_keywords').single(),
    ]);
    setRssSources(rssData || []);
    if (settingsData) {
      setPubmedKeywords(settingsData.value as string || '');
    }
  };

  const handleToggleSource = async (id: string, isActive: boolean) => {
    await supabase.from('rss_sources').update({ is_active: !isActive }).eq('id', id);
    fetchData();
  };

  const handleAddRSS = async () => {
    if (!newSource.name || !newSource.url || !newSource.slug) return;
    await supabase.from('rss_sources').insert(newSource);
    setNewSource({ name: '', url: '', slug: '' });
    fetchData();
  };

  const handleDeleteRSS = async (id: string) => {
    await supabase.from('rss_sources').delete().eq('id', id);
    fetchData();
  };

  const handleSaveKeywords = async () => {
    await supabase.from('admin_settings').upsert({ key: 'pubmed_keywords', value: pubmedKeywords });
    alert('Saved!');
  };

  return (
    <div>
      <h1 style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: '1.8rem', color: T.textPrimary, letterSpacing: '0.05em', marginBottom: 8 }}>
        SOURCE MANAGEMENT
      </h1>
      <p style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.55rem', color: T.textDim, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 32 }}>
        Manage RSS Sources and Collection Settings
      </p>

      {/* RSS Sources */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, fontSize: '1.1rem', color: T.textPrimary, marginBottom: 16 }}>
          RSS SOURCES
        </h2>
        <div style={{ background: 'rgba(8,15,30,0.40)', border: `1px solid ${T.border}`, borderRadius: 10, padding: 20, marginBottom: 20 }}>
          {rssSources.map((source) => (
            <div key={source.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${T.border}22` }}>
              <div>
                <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.6rem', color: T.textSecond }}>
                  {source.name} ({source.slug})
                </div>
                <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.5rem', color: T.textDim, marginTop: 4 }}>
                  {source.url}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => handleToggleSource(source.id, source.is_active)} style={{ padding: '6px 14px', background: source.is_active ? 'rgba(34,197,94,0.1)' : 'rgba(156,163,175,0.1)', border: `1px solid ${T.border}`, borderRadius: 6, color: T.textSecond, fontSize: '0.55rem' }}>
                  {source.is_active ? 'Active' : 'Inactive'}
                </button>
                <button onClick={() => handleDeleteRSS(source.id)} style={{ padding: '6px 14px', background: 'rgba(239,68,68,0.1)', border: `1px solid ${T.border}`, borderRadius: 6, color: T.neonCoral, fontSize: '0.55rem' }}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add New RSS Source */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontFamily: "'Share Tech Mono',monospace", fontSize: '0.5rem', color: T.textDim, marginBottom: 6 }}>NAME</label>
            <input value={newSource.name} onChange={(e) => setNewSource({ ...newSource, name: e.target.value })} style={{ width: '100%', padding: '10px 14px', background: 'rgba(8,15,30,0.60)', border: `1px solid ${T.border}`, borderRadius: 6, color: T.textPrimary, fontSize: '0.55rem' }} />
          </div>
          <div style={{ flex: 2 }}>
            <label style={{ display: 'block', fontFamily: "'Share Tech Mono',monospace", fontSize: '0.5rem', color: T.textDim, marginBottom: 6 }}>RSS URL</label>
            <input value={newSource.url} onChange={(e) => setNewSource({ ...newSource, url: e.target.value })} style={{ width: '100%', padding: '10px 14px', background: 'rgba(8,15,30,0.60)', border: `1px solid ${T.border}`, borderRadius: 6, color: T.textPrimary, fontSize: '0.55rem' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontFamily: "'Share Tech Mono',monospace", fontSize: '0.5rem', color: T.textDim, marginBottom: 6 }}>SLUG</label>
            <input value={newSource.slug} onChange={(e) => setNewSource({ ...newSource, slug: e.target.value })} style={{ width: '100%', padding: '10px 14px', background: 'rgba(8,15,30,0.60)', border: `1px solid ${T.border}`, borderRadius: 6, color: T.textPrimary, fontSize: '0.55rem' }} />
          </div>
          <button onClick={handleAddRSS} style={{ padding: '10px 20px', background: `linear-gradient(135deg,${T.neonBlue},${T.neonTeal})`, border: 'none', borderRadius: 8, color: '#050b14', fontSize: '0.6rem', fontWeight: 600 }}>
            Add Source
          </button>
        </div>
      </div>

      {/* PubMed Keywords */}
      <div>
        <h2 style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, fontSize: '1.1rem', color: T.textPrimary, marginBottom: 16 }}>
          PUBMED KEYWORDS
        </h2>
        <div style={{ background: 'rgba(8,15,30,0.40)', border: `1px solid ${T.border}`, borderRadius: 10, padding: 20 }}>
          <label style={{ display: 'block', fontFamily: "'Share Tech Mono',monospace", fontSize: '0.5rem', color: T.textDim, marginBottom: 6 }}>
            Search Keywords (comma-separated)
          </label>
          <textarea
            value={pubmedKeywords}
            onChange={(e) => setPubmedKeywords(e.target.value)}
            placeholder="orthopedic, radiology, imaging, fractures..."
            rows={4}
            style={{
              width: '100%', padding: '12px',
              background: 'rgba(8,15,30,0.60)', border: `1px solid ${T.border}`, borderRadius: 8,
              color: T.textPrimary, fontFamily: "'Noto Sans JP',sans-serif", fontSize: '0.9rem',
              resize: 'vertical', marginBottom: 12,
            }}
          />
          <button onClick={handleSaveKeywords} style={{ padding: '10px 24px', background: `linear-gradient(135deg,${T.neonBlue},${T.neonTeal})`, border: 'none', borderRadius: 8, color: '#050b14', fontSize: '0.6rem', fontWeight: 600 }}>
            Save Keywords
          </button>
        </div>
      </div>
    </div>
  );
}

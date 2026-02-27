import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { T } from '../../constants/tokens';
import { SearchParams } from '../../hooks/useSearch';

const SOURCES = ['pubmed', 'jaaos', 'radiology', 'eur_radiology', 'rsna'] as const;
const CATEGORIES = ['general_orthopedics', 'imaging_diagnostics', 'fracture', 'bone_density', 'ai_technology', 'surgical_technique', 'guideline', 'rehabilitation'] as const;

interface AdvancedFilterProps {
  searchParams: SearchParams;
  onParamsChange: (params: Partial<SearchParams>) => void;
}

export default function AdvancedFilter({ searchParams, onParamsChange }: AdvancedFilterProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchParams.sources.length > 0) count++;
    if (searchParams.categories.length > 0) count++;
    if (searchParams.isRtRelevant) count++;
    if (searchParams.dateFrom || searchParams.dateTo) count++;
    return count;
  }, [searchParams]);

  const toggleSource = useCallback((source: string) => {
    const newSources = searchParams.sources.includes(source)
      ? searchParams.sources.filter(s => s !== source)
      : [...searchParams.sources, source];
    onParamsChange({ sources: newSources });
  }, [searchParams.sources, onParamsChange]);

  const toggleCategory = useCallback((category: string) => {
    const newCategories = searchParams.categories.includes(category)
      ? searchParams.categories.filter(c => c !== category)
      : [...searchParams.categories, category];
    onParamsChange({ categories: newCategories });
  }, [searchParams.categories, onParamsChange]);

  const toggleRtRelevant = useCallback(() => {
    onParamsChange({ isRtRelevant: searchParams.isRtRelevant ? null : true });
  }, [searchParams.isRtRelevant, onParamsChange]);

  const resetFilters = useCallback(() => {
    onParamsChange({
      sources: [],
      categories: [],
      isRtRelevant: null,
      dateFrom: null,
      dateTo: null,
      sortBy: 'date',
    });
  }, [onParamsChange]);

  return (
    <div>
      {/* Toggle button */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 14px',
          background: isExpanded ? 'rgba(56,189,248,0.12)' : 'rgba(56,189,248,0.06)',
          border: `1px solid ${isExpanded ? T.neonBlue : T.border}`,
          borderRadius: 8,
          cursor: 'pointer',
          fontFamily: "'Share Tech Mono',monospace",
          fontSize: '0.6rem',
          color: isExpanded ? T.neonBlue : T.textSecond,
          letterSpacing: '0.08em',
          transition: 'all 0.2s ease',
        }}
      >
        <span>{isExpanded ? '▼' : '▶'}</span>
        <span>{t('search.advanced_filters')}</span>
        {activeFilterCount > 0 && (
          <span style={{
            padding: '2px 8px',
            background: T.neonTeal,
            borderRadius: 10,
            color: '#050b14',
            fontWeight: 600,
            fontSize: '0.5rem',
          }}>
            {activeFilterCount}
          </span>
        )}
      </motion.button>

      {/* Expanded panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              padding: '20px',
              marginTop: 12,
              background: 'rgba(8,15,30,0.60)',
              border: `1px solid ${T.border}`,
              borderRadius: 10,
            }}>
              {/* Source filter */}
              <div style={{ marginBottom: 20 }}>
                <div style={{
                  fontFamily: "'Share Tech Mono',monospace",
                  fontSize: '0.55rem',
                  color: T.neonBlue,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: 10,
                }}>
                  {t('search.all_sources')}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {SOURCES.map(source => (
                    <motion.button
                      key={source}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => toggleSource(source)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '8px 14px',
                        background: searchParams.sources.includes(source)
                          ? 'rgba(56,189,248,0.15)'
                          : 'rgba(56,189,248,0.05)',
                        border: searchParams.sources.includes(source)
                          ? `1px solid ${T.neonBlue}`
                          : `1px solid ${T.border}`,
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontFamily: "'Share Tech Mono',monospace",
                        fontSize: '0.55rem',
                        color: searchParams.sources.includes(source) ? T.neonBlue : T.textSecond,
                        letterSpacing: '0.06em',
                        transition: 'all 0.2s ease',
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span style={{
                        width: 16,
                        height: 16,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: searchParams.sources.includes(source) ? T.neonBlue : 'transparent',
                        borderRadius: 3,
                        color: searchParams.sources.includes(source) ? '#050b14' : T.textDim,
                      }}>
                        {searchParams.sources.includes(source) ? '✓' : ''}
                      </span>
                      <span>{t(`sources.${source}`)}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Category filter */}
              <div style={{ marginBottom: 20 }}>
                <div style={{
                  fontFamily: "'Share Tech Mono',monospace",
                  fontSize: '0.55rem',
                  color: T.neonTeal,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: 10,
                }}>
                  {t('search.all_categories')}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {CATEGORIES.map(category => (
                    <motion.button
                      key={category}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => toggleCategory(category)}
                      style={{
                        padding: '6px 12px',
                        background: searchParams.categories.includes(category)
                          ? 'rgba(45,212,191,0.15)'
                          : 'rgba(45,212,191,0.05)',
                        border: searchParams.categories.includes(category)
                          ? `1px solid ${T.neonTeal}`
                          : `1px solid ${T.border}`,
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontFamily: "'Noto Sans JP',sans-serif",
                        fontSize: '0.8rem',
                        color: searchParams.categories.includes(category) ? T.neonTeal : T.textSecond,
                        transition: 'all 0.2s ease',
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {searchParams.categories.includes(category) ? '✓' : '+'} {t(`categories.${category}`)}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* RT filter */}
              <div style={{ marginBottom: 20 }}>
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={toggleRtRelevant}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 16px',
                    background: searchParams.isRtRelevant
                      ? `linear-gradient(135deg,${T.neonTeal},${T.neonCoral})`
                      : 'rgba(56,189,248,0.05)',
                    border: searchParams.isRtRelevant
                      ? `1px solid ${T.neonTeal}`
                      : `1px solid ${T.border}`,
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontFamily: "'Noto Sans JP',sans-serif",
                    fontSize: '0.9rem',
                    color: searchParams.isRtRelevant ? '#050b14' : T.textSecond,
                    transition: 'all 0.2s ease',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span style={{
                    width: 20,
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: searchParams.isRtRelevant ? 'rgba(255,255,255,0.3)' : 'transparent',
                    borderRadius: 4,
                  }}>
                    {searchParams.isRtRelevant ? '☑' : '☐'}
                  </span>
                  <span>{t('search.rt_only')}</span>
                </motion.button>
              </div>

              {/* Date range filter */}
              <div style={{ marginBottom: 20 }}>
                <div style={{
                  fontFamily: "'Share Tech Mono',monospace",
                  fontSize: '0.55rem',
                  color: T.textDim,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: 10,
                }}>
                  {t('search.date_range')}
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <label style={{
                      display: 'block',
                      fontFamily: "'Share Tech Mono',monospace",
                      fontSize: '0.5rem',
                      color: T.textDim,
                      marginBottom: 6,
                    }}>
                      {t('search.date_from')}
                    </label>
                    <input
                      type="date"
                      value={searchParams.dateFrom ? searchParams.dateFrom.toISOString().split('T')[0] : ''}
                      onChange={(e) => {
                        onParamsChange({
                          dateFrom: e.target.value ? new Date(e.target.value) : null,
                        });
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: 'rgba(8,15,30,0.60)',
                        border: `1px solid ${T.border}`,
                        borderRadius: 6,
                        color: T.textPrimary,
                        fontFamily: "'Share Tech Mono',monospace",
                        fontSize: '0.75rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <label style={{
                      display: 'block',
                      fontFamily: "'Share Tech Mono',monospace",
                      fontSize: '0.5rem',
                      color: T.textDim,
                      marginBottom: 6,
                    }}>
                      {t('search.date_to')}
                    </label>
                    <input
                      type="date"
                      value={searchParams.dateTo ? searchParams.dateTo.toISOString().split('T')[0] : ''}
                      onChange={(e) => {
                        onParamsChange({
                          dateTo: e.target.value ? new Date(e.target.value) : null,
                        });
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: 'rgba(8,15,30,0.60)',
                        border: `1px solid ${T.border}`,
                        borderRadius: 6,
                        color: T.textPrimary,
                        fontFamily: "'Share Tech Mono',monospace",
                        fontSize: '0.75rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Sort options */}
              <div style={{ marginBottom: 20 }}>
                <div style={{
                  fontFamily: "'Share Tech Mono',monospace",
                  fontSize: '0.55rem',
                  color: T.textDim,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: 10,
                }}>
                  {t('search.sort_by')}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['date', 'relevance', 'trend_score'] as const).map(sortBy => (
                    <motion.button
                      key={sortBy}
                      onClick={() => onParamsChange({ sortBy })}
                      style={{
                        padding: '8px 14px',
                        background: searchParams.sortBy === sortBy
                          ? `linear-gradient(135deg,${T.neonBlue},${T.neonTeal})`
                          : 'rgba(56,189,248,0.05)',
                        border: searchParams.sortBy === sortBy
                          ? `1px solid ${T.neonBlue}`
                          : `1px solid ${T.border}`,
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontFamily: "'Share Tech Mono',monospace",
                        fontSize: '0.55rem',
                        color: searchParams.sortBy === sortBy ? '#050b14' : T.textSecond,
                        letterSpacing: '0.06em',
                        transition: 'all 0.2s ease',
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {t(`search.sort_${sortBy}`)}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Reset button */}
              {activeFilterCount > 0 && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={resetFilters}
                  style={{
                    padding: '10px 20px',
                    background: 'rgba(248,113,113,0.1)',
                    border: `1px solid ${T.neonCoral}`,
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontFamily: "'Share Tech Mono',monospace",
                    fontSize: '0.6rem',
                    color: T.neonCoral,
                    letterSpacing: '0.08em',
                    transition: 'all 0.2s ease',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t('search.reset_filters')}
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

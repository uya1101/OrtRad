import React, { useState, useCallback, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { T } from '../constants/tokens';
import Background from '../components/layout/Background';
import Header from '../components/layout/Header';
import Dot from '../components/common/Dot';
import ArticleCard from '../components/dashboard/ArticleCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SearchBar from '../components/search/SearchBar';
import AdvancedFilter from '../components/search/AdvancedFilter';
import { useSearch } from '../hooks/useSearch';
import { useTranslation } from 'react-i18next';

// Memoized components for performance
const MemoizedArticleCard = memo(ArticleCard);

export default function SearchPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const [page, setPage] = useState(1);
  const {
    articles,
    totalCount,
    isLoading,
    searchParams,
    setSearchParams,
    resetSearch,
    hasMore,
  } = useSearch(page, 20);

  // Initialize search term from URL params
  useEffect(() => {
    setSearchTerm(searchParams.query);
  }, [searchParams.query]);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setPage(1);
  }, []);

  const handleSearchBarChange = useCallback((value: string) => {
    setSearchTerm(value);
    setPage(1);
    // Update query param with debounce
    const timer = setTimeout(() => {
      setSearchParams({ query: value });
    }, 300);
    return () => clearTimeout(timer);
  }, [setSearchParams]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      setPage(p => p + 1);
    }
  }, [hasMore, isLoading]);

  const handleReset = useCallback(() => {
    resetSearch();
    setSearchTerm('');
    setPage(1);
  }, [resetSearch]);

  const activeFilterCount = [
    searchParams.sources.length,
    searchParams.categories.length,
    searchParams.isRtRelevant ? 1 : 0,
    searchParams.dateFrom || searchParams.dateTo ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div style={{ background: T.bgBase, minHeight: "100vh", position: "relative" }}>
      <Background />
      <Header />

      {/* Search Bar (Fixed Top) */}
      <div style={{
        position: "fixed", top: 80, left: 0, right: 0, zIndex: 900,
        background: "rgba(5,11,20,0.96)",
        backdropFilter: "blur(20px) saturate(180%)",
        borderBottom: `1px solid ${T.border}`,
        padding: "16px 24px",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          {/* Search Bar */}
          <div style={{ marginBottom: 12 }}>
            <SearchBar
              value={searchTerm}
              onChange={handleSearchBarChange}
              onSearch={handleSearch}
              placeholder={t('search.placeholder')}
              autoFocus
            />
          </div>

          {/* Advanced Filter */}
          <div>
            <AdvancedFilter
              searchParams={searchParams}
              onParamsChange={(params) => {
                setSearchParams(params);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <main style={{
        position: "relative", zIndex: 10,
        paddingTop: "220px",
        paddingBottom: "40px",
        minHeight: "calc(100vh - 220px)",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>
          {/* Search Status */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 20, minHeight: 60,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Dot color={T.neonGreen} label="SEARCH_READY" />
              <span style={{
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: "0.58rem", color: T.textDim,
                letterSpacing: "0.1em", textTransform: "uppercase",
              }}>
                {searchParams.query
                  ? t('search.searching_for', { query: searchParams.query })
                  : t('search.enter_keyword')}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {activeFilterCount > 0 && (
                <span style={{
                  fontFamily: "'Share Tech Mono',monospace",
                  fontSize: "0.52rem", color: T.neonBlue,
                  padding: "4px 10px",
                  background: "rgba(56,189,248,0.1)",
                  borderRadius: 4,
                }}>
                  {activeFilterCount} filters
                </span>
              )}
              <span style={{
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: "0.55rem", color: T.textDim,
              }}>
                {totalCount} results
              </span>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && articles.length === 0 && (
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 60 }}>
              <LoadingSpinner />
            </div>
          )}

          {/* Results */}
          <AnimatePresence>
            {!isLoading && articles.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "16px",
                }}
              >
                {articles.map((article, index) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <MemoizedArticleCard article={article} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* No Results */}
          {!isLoading && !searchParams.query && articles.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: "60px 20px", textAlign: "center",
                background: "rgba(6,12,24,0.50)",
                border: `1px solid ${T.border}`,
                borderRadius: 14,
              }}
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={T.neonBlue} strokeWidth="1.5" style={{ marginBottom: 16 }}>
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
                <path d="M11 8v2m0 4v2" />
              </svg>
              <h3 style={{
                fontFamily: "'Rajdhani',sans-serif", fontWeight: 700,
                fontSize: "1.3rem", color: T.textPrimary, letterSpacing: "0.1em",
                margin: "0 0 12px 0",
              }}>
                {t('search.enter_keyword')}
              </h3>
              <p style={{
                fontFamily: "'Noto Sans JP',sans-serif",
                fontSize: "0.9rem", color: T.textSecond,
                lineHeight: 1.6, margin: 0,
              }}>
                キーワードを入力して記事を検索してください
              </p>
            </motion.div>
          )}

          {!isLoading && searchParams.query && articles.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: "60px 20px", textAlign: "center",
                background: "rgba(6,12,24,0.50)",
                border: `1px solid ${T.border}`,
                borderRadius: 14,
              }}
            >
              <h3 style={{
                fontFamily: "'Rajdhani',sans-serif", fontWeight: 700,
                fontSize: "1.5rem", color: T.textPrimary, letterSpacing: "0.1em",
                margin: "0 0 16px 0",
              }}>
                {t('search.no_results')}
              </h3>
              <p style={{
                fontFamily: "'Noto Sans JP',sans-serif",
                fontSize: "0.9rem", color: T.textSecond,
                lineHeight: 1.6, margin: "0 0 24px 0",
              }}>
                {t('search.no_results_message', { query: searchParams.query })}
              </p>
              <button
                onClick={handleReset}
                style={{
                  padding: "10px 20px",
                  background: `linear-gradient(135deg,${T.neonBlue},${T.neonTeal})`,
                  border: "none", borderRadius: 8, cursor: "pointer",
                  fontFamily: "'Share Tech Mono',monospace",
                  fontSize: "0.65rem", letterSpacing: "0.08em",
                  color: "#050b14", fontWeight: 700,
                }}
              >
                {t('search.reset_filters')}
              </button>
            </motion.div>
          )}

          {/* Load More Button */}
          {hasMore && articles.length > 0 && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 32 }}>
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleLoadMore}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isLoading}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 24px",
                  background: "rgba(56,189,248,0.08)",
                  border: `1px solid ${T.border}`,
                  borderRadius: 8, cursor: isLoading ? "not-allowed" : "pointer",
                  fontFamily: "'Share Tech Mono',monospace",
                  fontSize: "0.65rem", letterSpacing: "0.08em",
                  color: T.textSecond,
                  transition: "all 0.2s ease",
                  opacity: isLoading ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.background = "rgba(56,189,248,0.15)";
                    e.currentTarget.style.borderColor = T.neonBlue;
                    e.currentTarget.style.color = T.neonBlue;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.background = "rgba(56,189,248,0.08)";
                    e.currentTarget.style.borderColor = T.border;
                    e.currentTarget.style.color = T.textSecond;
                  }
                }}
              >
                <span>{t('dashboard.load_more')}</span>
                <span>↓</span>
              </motion.button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

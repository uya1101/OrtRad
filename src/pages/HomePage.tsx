import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { T } from '../constants/tokens';
import Background from '../components/layout/Background';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Dot from '../components/common/Dot';
import TypingText from '../components/hero/TypingText';
import TrendKeywords from '../components/dashboard/TrendKeywords';
import RTHighlight from '../components/dashboard/RTHighlight';
import ArticleList from '../components/dashboard/ArticleList';
import SourceFilter from '../components/dashboard/SourceFilter';
import CategoryFilter from '../components/dashboard/CategoryFilter';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useArticles } from '../hooks/useArticles';
import { useTrends } from '../hooks/useTrends';
import { useCategories } from '../hooks/useCategories';
import { useLanguage } from '../hooks/useLanguage';

export default function HomePage() {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [page, setPage] = useState(1);

  // Get filters from URL params
  const urlSource = searchParams.get('source') || null;
  const urlCategory = searchParams.get('category') || null;

  // Local filter state
  const [selectedSource, setSelectedSource] = useState<string | null>(urlSource);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(urlCategory);
  const [loadingMore, setLoadingMore] = useState(false);

  // Sync URL params with local state
  useEffect(() => {
    if (urlSource) setSelectedSource(urlSource);
    if (urlCategory) setSelectedCategory(urlCategory);
  }, [urlSource, urlCategory]);

  // Update URL when filters change
  const updateURLParams = useCallback(() => {
    const params = new URLSearchParams();
    if (selectedSource) params.set('source', selectedSource);
    if (selectedCategory) params.set('category', selectedCategory);
    const queryString = params.toString();
    navigate(`/search${queryString ? `?${queryString}` : ''}`, { replace: false });
  }, [selectedSource, selectedCategory, navigate]);

  // Fetch articles with filters
  const { articles, totalCount, isLoading: articlesLoading, refetch: refetchArticles, hasMore } = useArticles({
    page,
    limit: 20,
    source: selectedSource || undefined,
    category: selectedCategory || undefined,
  });

  const { trends, isLoading: trendsLoading } = useTrends();
  const { categories, isLoading: categoriesLoading } = useCategories();

  // Refetch when filters change
  useEffect(() => {
    refetchArticles();
    setPage(1);
  }, [selectedSource, selectedCategory, refetchArticles]);

  const handleSourceChange = useCallback((source: string | null) => {
    setSelectedSource(source);
    updateURLParams();
  }, [updateURLParams]);

  const handleCategoryChange = useCallback((category: string | null) => {
    setSelectedCategory(category);
    updateURLParams();
  }, [updateURLParams]);

  const handleLoadMore = useCallback(() => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    setPage(p => p + 1);
    setLoadingMore(false);
  }, [hasMore, loadingMore]);

  const isLoading = articlesLoading || trendsLoading || categoriesLoading;

  // Get typing text based on language
  const typingWords = lang === 'ja'
    ? ['整形外科領域の最前線', '骨密度・DXA解析', 'MRI金属アーチファクト対策', 'CTプロトコル最適化', 'XP撮影ポジショニング']
    : ['Orthopedic Frontline', 'Bone Density DXA Analysis', 'MRI Metal Artifact Mitigation', 'CT Protocol Optimization', 'X-ray Positioning'];

  return (
    <div style={{ background: T.bgBase, minHeight: "100vh", position: "relative" }}>
      <Background />
      <Header />

      {/* Hero Section */}
      <section style={{
        position: "relative", zIndex: 10, minHeight: "60vh",
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "100px 24px 80px", maxWidth: 1300, margin: "0 auto",
      }}>
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: "center" }}
          >
            {/* Status bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <Dot color={T.neonGreen} label="SYSTEM ONLINE" />
              <span style={{
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: "0.57rem", color: T.textDim,
                letterSpacing: "0.13em", textTransform: "uppercase",
              }}>
                {t('dashboard.system_version')}
              </span>
            </div>

            {/* Title with typing effect */}
            <h1 style={{
              fontFamily: "'Rajdhani',sans-serif", fontWeight: 700,
              fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.1, marginBottom: 16,
              color: T.textPrimary, letterSpacing: "0.04em",
            }}>
              <span className="hero-title-main" style={{ display: "block" }}>
                OrtRad<span style={{ color: T.neonBlue }}>.</span>Hub
              </span>
            </h1>

            <div className="hero-desc" style={{
              fontFamily: "'Noto Sans JP',sans-serif",
              fontSize: "clamp(0.95rem, 2.2vw, 1.3rem)", fontWeight: 500,
              letterSpacing: "0.04em", minHeight: "1.8em",
              color: T.textSecond, marginBottom: 32,
            }}>
              <TypingText words={typingWords} />
            </div>

            <p style={{
              fontFamily: "'Noto Sans JP',sans-serif", fontSize: "0.87rem",
              color: T.textSecond, lineHeight: 1.9, maxWidth: 600, margin: "0 auto",
            }}>
              {t('hero.description')}
            </p>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Trend Keywords */}
      <TrendKeywords trends={trends} isLoading={trendsLoading} />

      {/* RT Highlight */}
      <RTHighlight articles={articles} isLoading={isLoading} />

      {/* Filters */}
      <section style={{
        position: "relative", zIndex: 10, padding: "0 24px 20px", maxWidth: 1300, margin: "0 auto",
      }}>
        <div style={{
          display: "flex", flexDirection: "column", gap: 16,
        }}>
          {/* Source Filter */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ width: 12, height: "1px", background: `linear-gradient(90deg,${T.neonBlue},transparent)`, boxShadow: `0 0 4px ${T.neonBlue}` }} />
              <span style={{
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: "0.55rem", color: T.neonBlue, letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}>
                {t('dashboard.filter_by_source')}
              </span>
            </div>
            <SourceFilter
              sources={['all', 'pubmed', 'jaaos', 'radiology', 'eur_radiology', 'rsna']}
              selectedSource={selectedSource}
              onSourceChange={handleSourceChange}
            />
          </div>

          {/* Category Filter */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ width: 12, height: "1px", background: `linear-gradient(90deg,${T.neonTeal},transparent)`, boxShadow: `0 0 4px ${T.neonTeal}` }} />
              <span style={{
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: "0.55rem", color: T.neonTeal, letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}>
                {t('dashboard.filter_by_category')}
              </span>
            </div>
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />
          </div>
        </div>
      </section>

      {/* Article List */}
      <ArticleList
        articles={articles}
        isLoading={isLoading && articles.length === 0}
        hasMore={hasMore}
        totalCount={totalCount}
        onLoadMore={handleLoadMore}
      />

      <Footer />
    </div>
  );
}

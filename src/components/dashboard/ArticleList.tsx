import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T } from '../../constants/tokens';
import ArticleCard from './ArticleCard';

interface ArticleListProps {
  articles: any[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  totalCount: number;
}

export default function ArticleList({ articles, isLoading, hasMore, onLoadMore, totalCount }: ArticleListProps) {
  return (
    <section style={{ position: "relative", zIndex: 10, padding: "0 24px 60px", maxWidth: 1300, margin: "0 auto" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 12, marginBottom: 20,
      }}>
        <div style={{ width: 20, height: "1.5px", background: `linear-gradient(90deg,${T.neonBlue},transparent)`, boxShadow: `0 0 6px ${T.neonBlue}` }} />
        <span style={{ color: T.neonBlue, fontSize: "0.58rem" }}>◆</span>
        <span style={{
          fontFamily: "'Rajdhani',sans-serif", fontWeight: 700,
          fontSize: "1.25rem", letterSpacing: "0.1em",
          textTransform: "uppercase", color: T.textPrimary,
        }}>
          LATEST ARTICLES<span style={{ color: T.neonBlue }}>.</span>
        </span>
        <span style={{
          fontFamily: "'Share Tech Mono',monospace",
          fontSize: "0.58rem", color: T.textDim,
        }}>
          ({totalCount} total)
        </span>
      </div>

      {isLoading && articles.length === 0 ? (
        <div style={{
          display: "flex", justifyContent: "center", alignItems: "center",
          minHeight: 200, background: "rgba(6,12,24,0.60)",
          border: `1px solid ${T.border}`,
          borderRadius: 14,
        }}>
          <span style={{
            fontFamily: "'Share Tech Mono',monospace",
            fontSize: "0.6rem", color: T.textSecond,
            letterSpacing: "0.1em", textTransform: "uppercase",
          }}>
            LOADING_ARTICLES...
          </span>
        </div>
      ) : (
        <>
          {/* Desktop: 2 columns */}
          <div className="article-grid-desktop" style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "20px",
          }}>
            <AnimatePresence mode="popLayout">
              {articles.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  style={{ position: "relative" }}
                >
                  <ArticleCard article={article} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Mobile: 1 column */}
          <div className="article-grid-mobile" style={{
            display: "none",
            gap: "16px",
          }}>
            <AnimatePresence mode="popLayout">
              {articles.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  style={{ position: "relative" }}
                >
                  <ArticleCard article={article} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <style>{`
            @media (max-width: 768px) {
              .article-grid-desktop { display: none !important; }
              .article-grid-mobile { display: flex !important; flex-direction: column; }
            }
          `}</style>
        </>
      )}

      {/* Load More Button */}
      {hasMore && articles.length > 0 && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 32 }}>
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onLoadMore}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 24px",
              background: "rgba(56,189,248,0.08)",
              border: `1px solid ${T.border}`,
              borderRadius: 8, cursor: "pointer",
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: "0.65rem", letterSpacing: "0.08em",
              color: T.textSecond,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(56,189,248,0.15)";
              e.currentTarget.style.borderColor = T.neonBlue;
              e.currentTarget.style.color = T.neonBlue;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(56,189,248,0.08)";
              e.currentTarget.style.borderColor = T.border;
              e.currentTarget.style.color = T.textSecond;
            }}
          >
            <span>LOAD MORE ARTICLES</span>
            <span style={{ fontSize: "0.7rem" }}>↓</span>
          </motion.button>
        </div>
      )}

      {/* No Results */}
      {!isLoading && articles.length === 0 && (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
          padding: "60px 20px", textAlign: "center",
          background: "rgba(6,12,24,0.50)",
          border: `1px solid ${T.border}`,
          borderRadius: 14,
        }}>
          <span style={{
            fontFamily: "'Rajdhani',sans-serif", fontWeight: 700,
            fontSize: "1.5rem", color: T.textPrimary, letterSpacing: "0.1em",
          }}>
            NO_ARTICLES_FOUND
          </span>
          <span style={{
            fontFamily: "'Noto Sans JP',sans-serif",
            fontSize: "0.9rem", color: T.textSecond,
          }}>
            検索条件に一致する記事が見つかりませんでした。
          </span>
        </div>
      )}

      {/* Loading State (for subsequent pages) */}
      {isLoading && articles.length > 0 && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 32 }}>
          <span style={{
            fontFamily: "'Share Tech Mono',monospace",
            fontSize: "0.6rem", color: T.neonTeal,
            letterSpacing: "0.1em", textTransform: "uppercase",
          }}>
            LOADING_MORE...
          </span>
        </div>
      )}
    </section>
  );
}

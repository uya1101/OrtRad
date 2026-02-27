import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { T } from '../../constants/tokens';
import { Article } from '../../types/article';
import Corners from '../common/Corners';
import { useLanguage } from '../../hooks/useLanguage';
import { format } from 'date-fns';

interface ArticleCardProps {
  article: Article;
}

// Category colors
const CATEGORY_COLORS: Record<string, string> = {
  general_orthopedics: T.neonBlue,
  imaging_diagnostics: T.neonTeal,
  fracture: T.neonAmber,
  bone_density: T.neonPurple,
  ai_technology: '#f97316',
  surgical_technique: '#ef4444',
  guideline: '#22c55e',
  rehabilitation: '#10b981',
};

// Source labels
const SOURCE_LABELS: Record<string, string> = {
  pubmed: 'PubMed',
  jaaos: 'JAAOS',
  radiology: 'Radiology',
  eur_radiology: 'Eur Radiol',
  rsna: 'RSNA',
};

const ArticleCard = memo(function ArticleCard({ article }: ArticleCardProps) {
  const { getArticleField, formatDate, lang } = useLanguage();

  const title = getArticleField(article, 'title') as string;
  const summary = getArticleField(article, 'summary_ja') as string;

  const authorsText = article.authors && article.authors.length > 0
    ? article.authors.slice(0, 3).join(', ') + (article.authors.length > 3 ? ` ${lang === 'ja' ? '他' : 'et al.'}` : '')
    : 'Unknown';

  const formattedDate = article.published_at ? formatDate(article.published_at) : 'N/A';

  const categoryColors = article.categories.map(cat => CATEGORY_COLORS[cat] || T.neonBlue);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Link
        to={`/article/${article.id}`}
        style={{ textDecoration: 'none', display: 'block' }}
      >
        <div
          style={{
            position: "relative",
            background: "rgba(8,15,30,0.80)",
            border: `1px solid ${T.border}`,
            borderRadius: 12,
            overflow: "hidden",
            transition: "all 0.28s ease",
          }}
          onMouseEnter={(e) => {
            const card = e.currentTarget;
            card.style.borderColor = `${T.neonBlue}66`;
            card.style.transform = "translateY(-4px)";
            card.style.boxShadow = `0 12px 32px ${T.neonBlue}22, 0 0 0 1px ${T.neonBlue}18`;
          }}
          onMouseLeave={(e) => {
            const card = e.currentTarget;
            card.style.borderColor = T.border;
            card.style.transform = "translateY(0)";
            card.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)";
          }}
        >
          <Corners size={12} th={1} op={0.5} />

          {/* Top gradient line */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "1.5px",
            background: `linear-gradient(90deg,transparent,${T.neonBlue},transparent)`,
          }} />

          {/* Category indicator */}
          {article.is_rt_relevant && (
            <div style={{
              position: "absolute", top: 8, right: 8,
              background: `linear-gradient(135deg,${T.neonTeal},${T.neonCoral})`,
              padding: "4px 10px", borderRadius: 4,
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: "0.5rem", color: "#fff",
              letterSpacing: "0.08em", fontWeight: 700,
              boxShadow: `0 0 8px ${T.neonCoral}44`,
            }}>
              RT
            </div>
          )}

          {/* Source badge */}
          <div style={{
            position: "absolute", top: 8, left: 8,
            background: "rgba(56,189,248,0.1)",
            padding: "4px 8px", borderRadius: 4,
            fontFamily: "'Share Tech Mono',monospace",
            fontSize: "0.5rem", color: T.neonBlue,
            letterSpacing: "0.08em", fontWeight: 600,
          }}>
            {SOURCE_LABELS[article.source] || article.source.toUpperCase()}
          </div>

          <div style={{ position: "relative", zIndex: 1, padding: "16px" }}>
            {/* Title */}
            <h3 style={{
              fontFamily: "'Rajdhani',sans-serif", fontWeight: 600,
              fontSize: "1.05rem", lineHeight: 1.3, marginBottom: 8,
              color: T.textPrimary, display: "-webkit-box",
              WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}>
              {title}
            </h3>

            {/* Authors */}
            <p style={{
              fontFamily: "'Noto Sans JP',sans-serif",
              fontSize: "0.75rem", color: T.textDim,
              marginBottom: 10, lineHeight: 1.4,
            }}>
              <span style={{ color: T.textSecond, fontWeight: 500 }}>{lang === 'ja' ? '著者:' : 'Authors:'}</span> {authorsText}
            </p>

            {/* Journal and Date */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: "0.58rem", color: T.textDim,
              }}>
                {article.journal || 'Unknown'}
              </span>
              <span style={{ color: T.border }}>|</span>
              <span style={{
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: "0.58rem", color: T.neonTeal,
              }}>
                {formattedDate}
              </span>
            </div>

            {/* Summary */}
            <div style={{
              background: "rgba(56,189,248,0.04)",
              borderRadius: 8, padding: "12px", marginBottom: 12,
            }}>
              <p style={{
                fontFamily: "'Noto Sans JP',sans-serif",
                fontSize: "0.78rem", color: T.textSecond,
                lineHeight: 1.6, margin: 0,
              }}>
                {summary || (lang === 'ja' ? '要約はありません' : 'No summary available')}
              </p>
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                {article.tags.slice(0, 5).map((tag, i) => (
                  <motion.span
                    key={`${tag}-${i}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05, duration: 0.2 }}
                    style={{
                      fontFamily: "'Share Tech Mono',monospace",
                      fontSize: "0.55rem", letterSpacing: "0.06em",
                      padding: "4px 10px", borderRadius: 4,
                      background: "rgba(56,189,248,0.08)",
                      color: T.textSecond,
                      border: `1px solid ${T.border}`,
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(56,189,248,0.16)";
                      e.currentTarget.style.borderColor = T.neonBlue;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(56,189,248,0.08)";
                      e.currentTarget.style.borderColor = T.border;
                    }}
                  >
                    #{tag}
                  </motion.span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

export default ArticleCard;

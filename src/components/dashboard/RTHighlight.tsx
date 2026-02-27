import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { T } from '../../constants/tokens';
import { Article } from '../../types/article';
import Corners from '../common/Corners';
import { useLanguage } from '../../hooks/useLanguage';

interface RTHighlightProps {
  articles: Article[];
  isLoading: boolean;
}

function ArticleItem({ article, index }: { article: Article; index: number }) {
  const { getLocalizedField } = useLanguage();

  const authorsText = article.authors.length > 0
    ? article.authors.slice(0, 3).join(', ') + (article.authors.length > 3 ? ' et al.' : '')
    : 'Unknown';

  const formattedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' })
    : 'N/A';

  return (
    <Link to={`/article/${article.id}`}>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        style={{
          display: "block", textDecoration: "none",
          padding: "14px 18px",
          borderBottom: `1px solid ${T.border}`,
          background: index % 2 === 0 ? "rgba(8,15,30,0.40)" : "rgba(6,12,24,0.30)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(56,189,248,0.12)";
          e.currentTarget.style.borderColor = T.neonBlue;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = index % 2 === 0 ? "rgba(8,15,30,0.40)" : "rgba(6,12,24,0.30)";
          e.currentTarget.style.borderColor = T.border;
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <div style={{
            minWidth: 30, height: 30,
            background: `linear-gradient(135deg,${T.neonBlue}aa,${T.neonTeal}aa)`,
            borderRadius: 6,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <span style={{
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: "0.65rem",
              color: "#050b14", fontWeight: 700,
            }}>
              RT
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              fontFamily: "'Rajdhani',sans-serif",
              fontWeight: 600, fontSize: "0.95rem",
              color: T.textPrimary, lineHeight: 1.3, marginBottom: 4,
            }}>
              {getLocalizedField(article.title, article.title_ja || article.title)}
            </h3>
            <p style={{
              fontFamily: "'Noto Sans JP',sans-serif",
              fontSize: "0.78rem", color: T.textSecond,
              lineHeight: 1.5, marginBottom: 6,
            }}>
              {article.summary_ja || article.summary_en || '要約なし'}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: "0.65rem" }}>
              <span style={{ color: T.textDim }}>
                {article.journal} · {formattedDate}
              </span>
              <span style={{ color: T.textDim }}>·</span>
              <span style={{ color: T.neonTeal }}>
                {authorsText}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export default function RTHighlight({ articles, isLoading }: RTHighlightProps) {
  const rtArticles = articles.filter(a => a.is_rt_relevant).slice(0, 5);

  if (isLoading) {
    return (
      <section style={{ position: "relative", zIndex: 10, padding: "0 24px 40px", maxWidth: 1300, margin: "0 auto" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 12, marginBottom: 20,
        }}>
          <div style={{ width: 20, height: "1.5px", background: `linear-gradient(90deg,${T.neonTeal},transparent)`, boxShadow: `0 0 6px ${T.neonTeal}` }} />
          <span style={{ color: T.neonTeal, fontSize: "0.58rem" }}>◆</span>
          <span style={{
            fontFamily: "'Rajdhani',sans-serif", fontWeight: 700,
            fontSize: "1.25rem", letterSpacing: "0.1em",
            textTransform: "uppercase", color: T.textPrimary,
          }}>
            RT HIGHLIGHT<span style={{ color: T.neonTeal }}>.</span>
          </span>
        </div>
        <div style={{
          background: "rgba(6,12,24,0.60)",
          border: `1px solid ${T.border}`,
          borderRadius: 14, padding: "40px",
          textAlign: "center",
          color: T.textDim,
          fontFamily: "'Share Tech Mono',monospace",
          fontSize: "0.6rem",
        }}>
          LOADING_RT_ARTICLES...
        </div>
      </section>
    );
  }

  return (
    <section style={{ position: "relative", zIndex: 10, padding: "0 24px 40px", maxWidth: 1300, margin: "0 auto" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 12, marginBottom: 20,
      }}>
        <div style={{ width: 20, height: "1.5px", background: `linear-gradient(90deg,${T.neonTeal},transparent)`, boxShadow: `0 0 6px ${T.neonTeal}` }} />
        <span style={{ color: T.neonTeal, fontSize: "0.58rem" }}>◆</span>
        <span style={{
          fontFamily: "'Rajdhani',sans-serif", fontWeight: 700,
          fontSize: "1.25rem", letterSpacing: "0.1em",
          textTransform: "uppercase", color: T.textPrimary,
        }}>
          RT HIGHLIGHT<span style={{ color: T.neonTeal }}>.</span>
        </span>
      </div>

      <div style={{
        position: "relative",
        background: "rgba(6,12,24,0.70)",
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        overflow: "hidden",
      }}>
        <Corners size={16} th={1.2} op={0.7} />
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg,transparent,${T.neonTeal} 40%,${T.neonBlue} 60%,transparent)`,
          opacity: 0.6,
        }} />

        {rtArticles.length > 0 ? (
          rtArticles.map((article, index) => (
            <ArticleItem key={article.id} article={article} index={index} />
          ))
        ) : (
          <div style={{
            padding: "30px", textAlign: "center",
            color: T.textDim,
            fontFamily: "'Noto Sans JP',sans-serif",
            fontSize: "0.85rem",
          }}>
            放射線技師向けのハイライト記事はありません
          </div>
        )}
      </div>
    </section>
  );
}

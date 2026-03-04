import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { T } from '../constants/tokens';
import Background from '../components/layout/Background';
import Header from '../components/layout/Header';
import Dot from '../components/common/Dot';
import Corners from '../components/common/Corners';
import { supabase } from '../lib/supabase';
import { Article } from '../types/article';
import { useLanguage } from '../hooks/useLanguage';
import { useArticles } from '../hooks/useArticles';

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

const SOURCE_LABELS: Record<string, string> = {
  pubmed: 'PubMed',
  jaaos: 'JAAOS',
  radiology: 'Radiology',
  eur_radiology: 'Eur Radiol',
  rsna: 'RSNA',
};

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, lang, getArticleField, formatDate } = useLanguage();
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);

  const { articles, isLoading } = useArticles({ limit: 3 });

  const [article, setArticle] = useState<Article | null>(null);

  const fetchArticle = useCallback(async () => {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching article:', error);
      return;
    }

    if (!data) {
      navigate('/');
      return;
    }

    setArticle(data);

    // Fetch related articles (same category)
    if (data.categories && data.categories.length > 0) {
      const { data: relatedData } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .contains('categories', [data.categories[0]])
        .neq('id', id)
        .order('published_at', { ascending: false })
        .limit(3);

      if (!relatedData?.error) {
        setRelatedArticles(relatedData || []);
      }
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  // Memoized computed values
  const authorsText = useMemo(() => {
    if (!article?.authors || article.authors.length === 0) return 'Unknown';
    const mainAuthors = article.authors.slice(0, 3).join(', ');
    const suffix = article.authors.length > 3 ? ` ${t('article.et_al')}` : '';
    return mainAuthors + suffix;
  }, [article?.authors, t]);

  const formattedDate = useMemo(() => {
    return article?.published_at ? formatDate(article.published_at) : 'N/A';
  }, [article?.published_at, formatDate]);

  const title = useMemo(() => {
    return article ? getArticleField(article, 'title') as string : '';
  }, [article, getArticleField]);

  const categoryColors = useMemo(() => {
    return (article?.categories || []).map((cat, i) => {
      const colors = [T.neonBlue, T.neonTeal, T.neonPurple, T.neonAmber];
      return CATEGORY_COLORS[cat] || colors[i % colors.length] || T.neonBlue;
    });
  }, [article?.categories]);

  if (isLoading && !article) {
    return (
      <div style={{ background: T.bgBase, minHeight: "100vh", position: "relative" }}>
        <Background />
        <Header />
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          minHeight: "calc(100vh - 100px)", padding: "24px",
        }}>
          <span style={{
            fontFamily: "'Share Tech Mono',monospace",
            fontSize: "0.6rem", color: T.neonBlue,
            letterSpacing: "0.1em", textTransform: "uppercase",
          }}>
            {t('article.loading_article')}
          </span>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div style={{ background: T.bgBase, minHeight: "100vh", position: "relative" }}>
        <Background />
        <Header />
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          minHeight: "calc(100vh - 100px)", padding: "24px",
        }}>
          <span style={{
            fontFamily: "'Rajdhani',sans-serif", fontWeight: 700,
            fontSize: "1.5rem", color: T.textPrimary,
          }}>
            {t('article.not_found')}
          </span>
          <Link to="/" style={{ marginTop: 16 }}>
            <button style={{
              padding: "10px 20px",
              background: `linear-gradient(135deg,${T.neonBlue},${T.neonTeal})`,
              border: "none", borderRadius: 8, cursor: "pointer",
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: "0.65rem", color: "#050b14",
              letterSpacing: "0.08em", fontWeight: 700,
            }}>
              {t('article.return_home')}
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: T.bgBase, minHeight: "100vh", position: "relative" }}>
      <Background />
      <Header />

      {/* Status bar */}
      <div style={{
        position: "fixed", top: 62, left: 0, right: 0, zIndex: 999,
        background: "rgba(5,11,20,0.94)",
        backdropFilter: "blur(22px) saturate(180%)",
        borderBottom: `1px solid ${T.border}`,
        padding: "8px 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Dot color={T.neonGreen} label={t('article.article_view')} />
          <span style={{
            fontFamily: "'Share Tech Mono',monospace",
            fontSize: "0.55rem", color: T.textDim,
            letterSpacing: "0.1em", textTransform: "uppercase",
          }}>
            {SOURCE_LABELS[article.source] || article.source.toUpperCase()}
          </span>
        </div>
        <span style={{
          fontFamily: "'Share Tech Mono',monospace",
          fontSize: "0.57rem", color: T.neonBlue, letterSpacing: "0.1em",
        }}>
          {formattedDate}
        </span>
      </div>

      {/* Article Content */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          position: "relative", zIndex: 10,
          padding: "100px 24px 60px", maxWidth: 900, margin: "0 auto",
        }}
      >
        {/* Title */}
        <h1 style={{
          fontFamily: "'Rajdhani',sans-serif", fontWeight: 700,
          fontSize: "clamp(1.5rem, 4vw, 2.2rem)", lineHeight: 1.2, marginBottom: 8,
          color: T.textPrimary, letterSpacing: "0.03em",
        }}>
          {article.title}
        </h1>

        {/* Japanese Title if different */}
        {article.title_ja && lang === 'ja' && (
          <h2 style={{
            fontFamily: "'Noto Sans JP',sans-serif", fontWeight: 500,
            fontSize: "clamp(1.1rem, 3vw, 1.4rem)", lineHeight: 1.4, marginBottom: 20,
            color: T.textSecond,
          }}>
            {article.title_ja}
          </h2>
        )}

        {/* Metadata */}
        <div style={{
          display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 24,
          padding: "16px 20px",
          background: "rgba(8,15,30,0.50)",
          border: `1px solid ${T.border}`,
          borderRadius: 10,
        }}>
          {/* Authors */}
          <div style={{ flex: "1 1 200px" }}>
            <span style={{
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: "0.55rem", color: T.textDim, letterSpacing: "0.08em",
              textTransform: "uppercase", display: "block", marginBottom: 6,
            }}>
              {t('article.authors')}
            </span>
            <span style={{
              fontFamily: "'Noto Sans JP',sans-serif",
              fontSize: "0.85rem", color: T.textSecond, lineHeight: 1.5,
            }}>
              {authorsText}
            </span>
          </div>

          {/* Journal */}
          <div style={{ flex: "1 1 150px" }}>
            <span style={{
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: "0.55rem", color: T.textDim, letterSpacing: "0.08em",
              textTransform: "uppercase", display: "block", marginBottom: 6,
            }}>
              {t('article.journal')}
            </span>
            <span style={{
              fontFamily: "'Noto Sans JP',sans-serif",
              fontSize: "0.85rem", color: T.textSecond, lineHeight: 1.5,
            }}>
              {article.journal || t('article.unknown')}
            </span>
          </div>

          {/* Published Date */}
          <div style={{ flex: "1 1 120px" }}>
            <span style={{
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: "0.55rem", color: T.textDim, letterSpacing: "0.08em",
              textTransform: "uppercase", display: "block", marginBottom: 6,
            }}>
              {t('article.published')}
            </span>
            <span style={{
              fontFamily: "'Noto Sans JP',sans-serif",
              fontSize: "0.85rem", color: T.textSecond, lineHeight: 1.5,
            }}>
              {formattedDate}
            </span>
          </div>
        </div>

        {/* RT Badge */}
        {article.is_rt_relevant && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8, marginBottom: 24,
            padding: "8px 16px",
            background: `rgba(45,212,191,0.1)`,
            border: `1px solid ${T.neonTeal}`,
            borderRadius: 6,
            alignSelf: "flex-start",
          }}>
            <span style={{
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: "0.6rem", color: T.neonTeal, letterSpacing: "0.1em",
              fontWeight: 700,
            }}>
              {t('article.rt_badge')}
            </span>
            <span style={{
              fontFamily: "'Noto Sans JP',sans-serif",
              fontSize: "0.8rem", color: T.neonTeal,
            }}>
              {t('article.rt_description')}
            </span>
          </div>
        )}

        {/* Abstract */}
        {article.abstract && (
          <div style={{ marginBottom: 32 }}>
            <h3 style={{
              fontFamily: "'Rajdhani',sans-serif", fontWeight: 600,
              fontSize: "1rem", color: T.neonBlue, marginBottom: 12,
            }}>
              {t('article.abstract')}
            </h3>
            <div style={{
              padding: "20px", background: "rgba(8,15,30,0.40)",
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              lineHeight: 1.7,
            }}>
              <p style={{
                fontFamily: "'Noto Sans JP',sans-serif",
                fontSize: "0.9rem", color: T.textSecond,
                margin: 0,
              }}>
                {article.abstract}
              </p>
            </div>
          </div>
        )}

        {/* AI Summaries */}
        <div style={{ marginBottom: 32 }}>
          {/* English Summary */}
          {(article.summary_en || (!article.summary_ja && !article.summary_en)) && (
            <div style={{ marginBottom: 20 }}>
              <h3 style={{
                fontFamily: "'Rajdhani',sans-serif", fontWeight: 600,
                fontSize: "1rem", color: T.neonTeal, marginBottom: 12,
              }}>
                {t('article.summary_en')}
              </h3>
              <div style={{
                padding: "20px", background: "rgba(8,15,30,0.40)",
                border: `1px solid ${T.border}`,
                borderRadius: 10, lineHeight: 1.8,
              }}>
                <p style={{
                  fontFamily: "'Noto Sans JP',sans-serif",
                  fontSize: "0.9rem", color: T.textSecond,
                  margin: 0, whiteSpace: "pre-wrap",
                }}>
                  {article.summary_en || article.abstract || t('article.summary_not_available')}
                </p>
              </div>
            </div>
          )}

          {/* Japanese Summary */}
          {(article.summary_ja || lang === 'ja') && (
            <div>
              <h3 style={{
                fontFamily: "'Rajdhani',sans-serif", fontWeight: 600,
                fontSize: "1rem", color: T.neonBlue, marginBottom: 12,
              }}>
                {t('article.summary_ja')}
              </h3>
              <div style={{
                padding: "20px", background: "rgba(8,15,30,0.40)",
                border: `1px solid ${T.border}`,
                borderRadius: 10, lineHeight: 1.8,
              }}>
                <p style={{
                  fontFamily: "'Noto Sans JP',sans-serif",
                  fontSize: "0.9rem", color: T.textSecond,
                  margin: 0, whiteSpace: "pre-wrap",
                }}>
                  {article.summary_ja || t('article.summary_generating')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Categories */}
        {article.categories && article.categories.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h3 style={{
              fontFamily: "'Rajdhani',sans-serif", fontWeight: 600,
              fontSize: "1rem", color: T.neonBlue, marginBottom: 12,
            }}>
              カテゴリ / Categories
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {(article.categories || []).map((cat, i) => (
                <span key={cat} style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "6px 14px", borderRadius: 6,
                  background: `${categoryColors[i]}22`,
                  border: `1px solid ${categoryColors[i]}`,
                  fontFamily: "'Share Tech Mono',monospace",
                  fontSize: "0.6rem", color: categoryColors[i], letterSpacing: "0.08em",
                }}>
                  {cat}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Source Link */}
        {article.source_url && (
          <div style={{ textAlign: "center", marginTop: 40, marginBottom: 24 }}>
            <a
              href={article.source_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "12px 24px",
                background: "rgba(56,189,248,0.08)",
                border: `1px solid ${T.border}`,
                borderRadius: 8, cursor: "pointer",
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: "0.65rem", color: T.textSecond, letterSpacing: "0.08em",
                textDecoration: "none",
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
              <span>→</span>
              <span>{t('article.original')}</span>
            </a>
          </div>
        )}

        {/* Back Button */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Link to="/" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "10px 20px",
            background: "rgba(56,189,248,0.04)",
            border: `1px solid ${T.border}`,
            borderRadius: 6, cursor: "pointer",
            textDecoration: "none",
            fontFamily: "'Share Tech Mono',monospace",
            fontSize: "0.6rem", color: T.textSecond, letterSpacing: "0.08em",
            transition: "all 0.2s ease",
          }}>
            <span>←</span>
            <span>{t('article.return_dashboard')}</span>
          </Link>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div style={{
            borderTop: `1px solid ${T.border}`,
            paddingTop: 32,
          }}>
            <h3 style={{
              fontFamily: "'Rajdhani',sans-serif", fontWeight: 700,
              fontSize: "1.1rem", letterSpacing: "0.08em",
              color: T.textPrimary, marginBottom: 20,
            }}>
              {t('article.related_articles')}
            </h3>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px",
            }}>
              {relatedArticles.map((rel) => (
                <Link
                  key={rel.id}
                  to={`/article/${rel.id}`}
                  style={{ textDecoration: "none", display: "block" }}
                >
                  <div style={{
                    padding: "16px", background: "rgba(8,15,30,0.50)",
                    border: `1px solid ${T.border}`,
                    borderRadius: 10,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = T.neonBlue;
                    e.currentTarget.style.transform = "translateY(-4px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = T.border;
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                  >
                    <h4 style={{
                      fontFamily: "'Rajdhani',sans-serif", fontWeight: 600,
                      fontSize: "0.85rem", color: T.textPrimary, lineHeight: 1.3,
                      marginBottom: 6,
                      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}>
                      {getArticleField(rel, 'title') as string}
                    </h4>
                    <p style={{
                      fontFamily: "'Noto Sans JP',sans-serif",
                      fontSize: "0.75rem", color: T.textSecond, lineHeight: 1.4,
                      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                      overflow: "hidden", margin: 0,
                    }}>
                      {getArticleField(rel, 'summary_ja') as string || rel.abstract?.substring(0, 150) || t('article.not_available')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </motion.main>
    </div>
  );
}

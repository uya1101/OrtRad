import React from 'react';
import { motion } from 'framer-motion';
import { T } from '../../constants/tokens';
import { TrendKeyword } from '../../types/trend';
import { useLanguage } from '../../hooks/useLanguage';

interface TrendKeywordsProps {
  trends: TrendKeyword[];
  isLoading: boolean;
}

export default function TrendKeywords({ trends, isLoading }: TrendKeywordsProps) {
  const { getLocalizedField } = useLanguage();

  if (isLoading) {
    return (
      <div style={{
        position: "relative", zIndex: 10,
        background: "rgba(6,12,24,0.60)",
        border: `1px solid ${T.border}`,
        borderRadius: 14, padding: "20px 24px",
        backdropFilter: "blur(18px)",
        minHeight: 120,
      }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
          <span style={{
            fontFamily: "'Share Tech Mono',monospace",
            fontSize: "0.58rem",
            color: T.textDim,
          }}>LOADING_TREND_DATA...</span>
        </div>
      </div>
    );
  }

  return (
    <section style={{ position: "relative", zIndex: 10, padding: "0 24px 40px", maxWidth: 1300, margin: "0 auto" }}>
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
          TRENDS<span style={{ color: T.neonBlue }}>.</span>
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          display: "flex", flexWrap: "wrap", gap: 8,
        }}
      >
        {trends.map((trend, index) => (
          <motion.button
            key={t.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onClick={() => {
              // TODO: Filter articles by keyword
              console.log('Filter by keyword:', trend.keyword_en);
            }}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 14px",
              background: "rgba(8,15,30,0.70)",
              border: `1px solid ${T.border}`,
              borderRadius: 20, cursor: "pointer",
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: "0.6rem",
              color: T.textSecond, letterSpacing: "0.08em",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = T.neonBlue;
              e.currentTarget.style.background = "rgba(56,189,248,0.14)";
              e.currentTarget.style.color = T.neonBlue;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = T.border;
              e.currentTarget.style.background = "rgba(8,15,30,0.70)";
              e.currentTarget.style.color = T.textSecond;
            }}
          >
            <span style={{ color: T.neonTeal }}>#{t.count}</span>
            <span>{getLocalizedField(trend.keyword_en, trend.keyword_ja)}</span>
          </motion.button>
        ))}
      </motion.div>
    </section>
  );
}

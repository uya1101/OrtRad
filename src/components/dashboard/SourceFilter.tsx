import React from 'react';
import { motion } from 'framer-motion';
import { T } from '../../constants/tokens';

interface SourceFilterProps {
  sources: string[];
  selectedSource: string | null;
  onSourceChange: (source: string | null) => void;
}

const SOURCE_LABELS: Record<string, string> = {
  all: 'ALL SOURCES',
  pubmed: 'PUBMED',
  jaaos: 'JAAOS',
  radiology: 'RADIOLOGY',
  eur_radiology: 'EUR RADIOL',
  rsna: 'RSNA',
};

export default function SourceFilter({ sources, selectedSource, onSourceChange }: SourceFilterProps) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {sources.map((source, index) => (
        <motion.button
          key={source}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => onSourceChange(source === 'all' ? null : source)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 14px",
            background: selectedSource === (source === 'all' ? null : source)
              ? `linear-gradient(135deg,${T.neonBlue},${T.neonTeal})`
              : "rgba(56,189,248,0.06)",
            border: selectedSource === (source === 'all' ? null : source)
              ? `1px solid ${T.neonBlue}`
              : `1px solid ${T.border}`,
            borderRadius: 6, cursor: "pointer",
            fontFamily: "'Share Tech Mono',monospace",
            fontSize: "0.58rem", letterSpacing: "0.08em",
            color: selectedSource === (source === 'all' ? null : source) ? "#050b14" : T.textSecond,
            transition: "all 0.2s ease",
            boxShadow: selectedSource === (source === 'all' ? null : source)
              ? `0 0 12px ${T.neonBlue}44, inset 0 0 0 1px rgba(255,255,255,0.2)`
              : "none",
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span style={{ color: selectedSource === (source === 'all' ? null : source) ? T.neonTeal : "inherit" }}>
            ●
          </span>
          {SOURCE_LABELS[source.toUpperCase()] || source.toUpperCase()}
        </motion.button>
      ))}
    </div>
  );
}

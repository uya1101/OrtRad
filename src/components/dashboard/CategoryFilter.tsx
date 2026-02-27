import React from 'react';
import { motion } from 'framer-motion';
import { T } from '../../constants/tokens';
import { Category } from '../../types/category';
import ModalityCard from '../modalities/ModalityCard';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

export default function CategoryFilter({ categories, selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
      {/* All option */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => onCategoryChange(null)}
        style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
          padding: "10px 16px",
          background: selectedCategory === null
            ? `linear-gradient(135deg,${T.neonBlue},${T.neonTeal})`
            : "rgba(56,189,248,0.06)",
          border: selectedCategory === null
            ? `1px solid ${T.neonBlue}`
            : `1px solid ${T.border}`,
          borderRadius: 10, cursor: "pointer",
          transition: "all 0.2s ease",
          minWidth: 100,
        }}
        onMouseEnter={(e) => {
          if (selectedCategory !== null) {
            e.currentTarget.style.background = "rgba(56,189,248,0.12)";
            e.currentTarget.style.borderColor = T.neonBlue;
          }
        }}
        onMouseLeave={(e) => {
          if (selectedCategory !== null) {
            e.currentTarget.style.background = "rgba(56,189,248,0.06)";
            e.currentTarget.style.borderColor = T.border;
          }
        }}
      >
        <span style={{
          fontFamily: "'Rajdhani',sans-serif", fontWeight: 600,
          fontSize: "0.85rem", color: selectedCategory === null ? "#fff" : T.textSecond,
        }}>
          ALL
        </span>
        <span style={{
          fontFamily: "'Share Tech Mono',monospace",
          fontSize: "0.52rem", color: selectedCategory === null ? "rgba(255,255,255,0.8)" : T.textDim,
        }}>
          ({categories.reduce((sum, c) => sum + 0, 0)})
        </span>
      </motion.button>

      {/* Categories */}
      {categories.map((category, index) => (
        <motion.div
          key={category.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.08 }}
        >
          <ModalityCard
            mod={{
              id: category.id,
              code: `CAT-${String(category.sort_order).padStart(3, '0')}`,
              label: category.name_en.toUpperCase().slice(0, 3),
              name: category.name_ja,
              nameEn: category.name_en,
              color: T.neonBlue,
              glow: "rgba(56,189,248,0.15)",
              icon: (color: string) => (
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="12" stroke={color} strokeWidth="1.5" />
                  <circle cx="16" cy="16" r="6" stroke={color} strokeWidth="1" opacity={0.6} />
                  <circle cx="16" cy="16" r="2" fill={color} />
                </svg>
              ),
              status: selectedCategory === category.id ? "ACTIVE" : "STANDBY",
              kpi: [{ l: "articles", v: "0" }],
              params: [],
              tags: [],
              topics: [category.name_ja],
              stream: [],
            }}
            idx={index}
          />
          <div style={{ textAlign: "center", marginTop: 8 }}>
            <motion.button
              onClick={() => onCategoryChange(category.id)}
              style={{
                padding: "6px 12px",
                background: selectedCategory === category.id
                  ? `linear-gradient(135deg,${T.neonBlue},${T.neonTeal})`
                  : "rgba(56,189,248,0.06)",
                border: selectedCategory === category.id
                  ? `1px solid ${T.neonBlue}`
                  : `1px solid ${T.border}`,
                borderRadius: 4, cursor: "pointer",
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: "0.5rem", letterSpacing: "0.08em",
                color: selectedCategory === category.id ? "#fff" : T.textSecond,
                transition: "all 0.2s ease",
              }}
            >
              {selectedCategory === category.id ? '✓' : '+'}
            </motion.button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

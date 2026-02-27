import React, { useState } from 'react';
import { T } from '../../constants/tokens';

interface TagChipProps {
  label: string;
}

export default function TagChip({ label }: TagChipProps) {
  const [h, setH] = useState(false);
  return (
    <span onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
      display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 11px",
      borderRadius: 4,
      border: `1px solid ${h ? "rgba(56,189,248,0.50)" : "rgba(56,189,248,0.22)"}`,
      background: h ? "rgba(56,189,248,0.12)" : "rgba(56,189,248,0.045)",
      fontFamily: "'Share Tech Mono',monospace", fontSize: "0.63rem",
      color: h ? T.neonBlue : T.textSecond, letterSpacing: "0.1em", cursor: "default",
      transition: "all 0.18s ease",
      boxShadow: h ? "0 0 12px rgba(56,189,248,0.22)" : "none",
    }}>
      <span style={{ color: T.neonBlue, opacity: 0.75 }}>◆</span>{label}
    </span>
  );
}

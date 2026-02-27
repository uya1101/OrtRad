import React, { useState } from 'react';
import { T } from '../../constants/tokens';

interface HudBtnProps {
  label: string;
  icon?: React.ReactNode | string;
  primary?: boolean;
  onClick?: () => void;
  small?: boolean;
}

export default function HudBtn({ label, icon, primary = false, onClick, small = false }: HudBtnProps) {
  const [h, setH] = useState(false);
  const pad = small ? "6px 13px" : "9px 18px";

  return (
    <button
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      onClick={onClick}
      style={{
        position: "relative", overflow: "hidden",
        display: "flex", alignItems: "center", gap: 7,
        borderRadius: 8, padding: pad, cursor: "pointer",
        fontFamily: "'Share Tech Mono',monospace",
        fontSize: small ? "0.62rem" : "0.68rem",
        letterSpacing: "0.09em", transition: "all 0.22s ease",
        background: primary
          ? (h ? `linear-gradient(135deg,${T.neonBlue},${T.neonTeal})` : `linear-gradient(135deg,rgba(56,189,248,0.85),rgba(45,212,191,0.75))`)
          : (h ? "rgba(56,189,248,0.14)" : "rgba(56,189,248,0.06)"),
        border: primary
          ? (h ? `1px solid ${T.neonBlue}` : "1px solid transparent")
          : `1px solid ${h ? T.neonBlue : T.border}`,
        color: primary ? "#050b14" : (h ? T.neonBlue : T.textSecond),
        boxShadow: h
          ? (primary
              ? `0 0 20px rgba(56,189,248,0.55), 0 0 40px rgba(56,189,248,0.20), inset 0 1px 0 rgba(255,255,255,0.25)`
              : `0 0 14px rgba(56,189,248,0.28), 0 0 28px rgba(56,189,248,0.10), inset 0 0 0 1px rgba(56,189,248,0.35)`)
          : (primary ? `0 4px 18px rgba(56,189,248,0.20)` : "none"),
        transform: h ? "translateY(-2px)" : "none",
        fontWeight: primary ? 700 : 400,
      }}
    >
      {h && (
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.12) 50%,transparent 60%)",
          animation: "cardScanH 0.6s ease forwards",
          pointerEvents: "none",
        }} />
      )}
      {icon && <span style={{ lineHeight: 1, display: "flex", alignItems: "center" }}>{icon}</span>}
      {label}
    </button>
  );
}

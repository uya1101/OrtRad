import React from 'react';
import { T } from '../../constants/tokens';

interface DotProps {
  color?: string;
  label?: string;
}

export default function Dot({ color = T.neonGreen, label }: DotProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ position: "relative", width: 8, height: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, boxShadow: `0 0 7px ${color}` }} />
        <div style={{ position: "absolute", inset: "-2px", borderRadius: "50%", background: color, opacity: 0.28, animation: "ringPulse 2s ease-out infinite" }} />
      </div>
      {label && <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: "0.6rem", color, letterSpacing: "0.12em" }}>{label}</span>}
    </div>
  );
}

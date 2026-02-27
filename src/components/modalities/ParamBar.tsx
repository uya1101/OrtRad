import React from 'react';
import { T } from '../../constants/tokens';

interface ParamBarProps {
  n: string;
  val: number;
  max: number;
  unit: string;
  c: string;
  active: boolean;
}

export default function ParamBar({ n, val, max, unit, c, active }: ParamBarProps) {
  const pct = Math.round((val / max) * 100);

  return (
    <div style={{ marginBottom: 13 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: "0.6rem", color: T.textSecond, letterSpacing: "0.08em" }}>{n}</span>
        <span style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: "0.72rem", color: c, letterSpacing: "0.05em" }}>
          {val} <span style={{ opacity: 0.75 }}>{unit}</span>
        </span>
      </div>
      <div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,0.055)", overflow: "hidden", position: "relative" }}>
        {[25, 50, 75].map(p => (
          <div key={p} style={{
            position: "absolute", top: 0, bottom: 0, left: `${p}%`, width: 1,
            background: "rgba(255,255,255,0.12)", zIndex: 1,
          }} />
        ))}
        <div style={{
          height: "100%", borderRadius: 99,
          background: `linear-gradient(90deg,${c}cc,${c})`,
          boxShadow: `0 0 10px ${c}66`,
          width: active ? `${pct}%` : "0%",
          transition: active ? "width 1.4s cubic-bezier(0.25,1,0.5,1) 0.1s" : "none",
          position: "relative", zIndex: 2,
        }} />
      </div>
    </div>
  );
}

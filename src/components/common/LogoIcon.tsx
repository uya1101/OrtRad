import React from 'react';

interface LogoIconProps {
  size?: number;
}

export default function LogoIcon({ size = 40 }: LogoIconProps) {
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <div style={{ position: "absolute", inset: "-6px", borderRadius: "50%", border: "1.5px solid rgba(56,189,248,0.30)", animation: "ringPulse 2.6s ease-out infinite" }} />
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="18" fill="#0b1526" stroke="#38bdf8" strokeWidth="1.2" />
        <circle cx="20" cy="20" r="13" fill="none" stroke="#38bdf8" strokeWidth="0.9" opacity={0.6} />
        <circle cx="20" cy="20" r="7" fill="none" stroke="#2dd4bf" strokeWidth="0.8" opacity={0.8} />
        <circle cx="20" cy="20" r="3" fill="#38bdf8" />
        {[[20, 2, 20, 9], [20, 31, 20, 38], [2, 20, 9, 20], [31, 20, 38, 20]].map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#38bdf8" strokeWidth="1" opacity={0.7} />
        ))}
        <path d="M20 20 L33 20 A13 13 0 0 1 27 30.6 Z"
          fill="rgba(56,189,248,0.1)" stroke="#2dd4bf" strokeWidth="0.5"
          style={{ transformOrigin: "20px 20px", animation: "radarSpin 4s linear infinite" }} />
      </svg>
    </div>
  );
}

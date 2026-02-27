import React from 'react';
import { T } from '../../constants/tokens';

export default function Background() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
      <div style={{
        position: "absolute", inset: 0, background: `
        radial-gradient(ellipse 80% 65% at 5% 4%,   rgba(56,189,248,0.09) 0%, transparent 65%),
        radial-gradient(ellipse 55% 50% at 95% 90%, rgba(45,212,191,0.07) 0%, transparent 60%),
        radial-gradient(ellipse 45% 38% at 52% 50%, rgba(56,189,248,0.03) 0%, transparent 70%)
      `}} />
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", animation: "gridPulse 6s ease-in-out infinite" }}
        xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <defs>
          <pattern id="gs" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M48 0L0 0 0 48" fill="none" stroke="rgba(56,189,248,0.065)" strokeWidth="0.5" />
          </pattern>
          <pattern id="gl" width="240" height="240" patternUnits="userSpaceOnUse">
            <path d="M240 0L0 0 0 240" fill="none" stroke="rgba(56,189,248,0.115)" strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#gs)" />
        <rect width="100%" height="100%" fill="url(#gl)" />
      </svg>
      <div style={{
        position: "absolute", left: 0, right: 0, height: 2,
        background: "linear-gradient(90deg,transparent 0%,rgba(56,189,248,0.50) 50%,transparent 100%)",
        animation: "scanline 11s linear infinite", opacity: 0.4,
      }} />
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 320,
        background: `linear-gradient(to top,${T.bgBase},transparent)`
      }} />
    </div>
  );
}

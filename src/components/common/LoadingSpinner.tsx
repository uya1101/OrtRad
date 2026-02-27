import React from 'react';
import { T } from '../../constants/tokens';

interface LoadingSpinnerProps {
  size?: number;
  text?: string;
}

export default function LoadingSpinner({ size = 32, text }: LoadingSpinnerProps) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
      padding: 24,
    }}>
      <div style={{
        position: "relative", width: size, height: size,
      }}>
        {/* Spinning ring */}
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          border: "2px solid transparent",
          borderTop: `2px solid ${T.neonBlue}`,
          borderRight: `2px solid ${T.neonBlue}`,
          animation: "spin 1s linear infinite",
        }} />
        {/* Inner ring */}
        <div style={{
          position: "absolute", inset: size * 0.25, borderRadius: "50%",
          border: "1px solid transparent",
          borderBottom: `1px solid ${T.neonTeal}`,
          animation: "spin-reverse 1.5s linear infinite",
        }} />
        {/* Center dot */}
        <div style={{
          position: "absolute", inset: size * 0.4, borderRadius: "50%",
          background: T.neonBlue,
          boxShadow: `0 0 8px ${T.neonBlue}`,
        }} />
      </div>
      {text && (
        <span style={{
          fontFamily: "'Share Tech Mono',monospace",
          fontSize: "0.6rem",
          color: T.textSecond,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}>
          {text}
        </span>
      )}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>
    </div>
  );
}

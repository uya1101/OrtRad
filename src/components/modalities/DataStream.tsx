import React from 'react';

interface DataStreamProps {
  lines: string[];
  color: string;
}

export default function DataStream({ lines, color }: DataStreamProps) {
  const doubled = [...lines, ...lines];

  return (
    <div style={{ overflow: "hidden", height: 106, position: "relative" }}>
      <div style={{ animation: "dataScroll 6.5s linear infinite" }}>
        {doubled.map((l, i) => (
          <div key={`${l}-${i}`} style={{
            fontFamily: "'Share Tech Mono',monospace",
            fontSize: "0.57rem", color, opacity: 0.72,
            letterSpacing: "0.09em", lineHeight: "15px", padding: "1.5px 0",
          }}>{l}</div>
        ))}
      </div>
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 28,
        background: `linear-gradient(to top,rgba(8,15,30,0.80),transparent)`,
        pointerEvents: "none",
      }} />
    </div>
  );
}

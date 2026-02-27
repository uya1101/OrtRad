import React from 'react';
import { T } from '../../constants/tokens';

interface TopicRowProps {
  text: string;
  color: string;
  idx: number;
  vis: boolean;
}

export default function TopicRow({ text, color, idx, vis }: TopicRowProps) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 11,
      opacity: vis ? 1 : 0,
      transform: vis ? "translateX(0)" : "translateX(-16px)",
      transition: `opacity 0.45s ease ${0.2 + idx * 0.09}s, transform 0.45s ease ${0.2 + idx * 0.09}s`,
    }}>
      <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: "0.62rem", color, marginTop: 2, flexShrink: 0, opacity: 0.85 }}>▶</span>
      <span style={{ fontFamily: "'Noto Sans JP',sans-serif", fontSize: "0.77rem", color: T.textSecond, lineHeight: 1.7, wordBreak: "break-word" }}>{text}</span>
    </div>
  );
}

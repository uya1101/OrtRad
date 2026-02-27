import React from 'react';
import { T } from '../../constants/tokens';

interface CornersProps {
  color?: string;
  size?: number;
  th?: number;
  op?: number;
}

export default function Corners({ color = T.neonBlue, size = 14, th = 1.5, op = 0.7 }: CornersProps) {
  const s = `${size}px`;
  const mk = (t: string | null, r: string | null, b: string | null, l: string | null, bt: boolean, bb: boolean, bl: boolean, br: boolean) => ({
    position: "absolute" as const, top: t, right: r, bottom: b, left: l,
    width: s, height: s, opacity: op,
    animation: "cornerFlicker 5s infinite",
    borderTop: bt ? `${th}px solid ${color}` : "none",
    borderBottom: bb ? `${th}px solid ${color}` : "none",
    borderLeft: bl ? `${th}px solid ${color}` : "none",
    borderRight: br ? `${th}px solid ${color}` : "none",
  });

  return (
    <>
      <div style={mk("0", null, null, "0", true, false, true, false)} />
      <div style={mk("0", "0", null, null, true, false, false, true)} />
      <div style={mk(null, null, "0", "0", false, true, true, false)} />
      <div style={mk(null, "0", "0", null, false, true, false, true)} />
    </>
  );
}

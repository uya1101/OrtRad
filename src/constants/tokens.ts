export const T = {
  bgBase: "#050b14",
  bgSurface: "#070d1a",
  bgElevated: "#0b1526",
  bgCard: "rgba(8,15,30,0.80)",
  neonBlue: "#38bdf8",
  neonTeal: "#2dd4bf",
  neonGreen: "#4ade80",
  neonAmber: "#fbbf24",
  neonPurple: "#a78bfa",
  neonCoral: "#fb7185",
  textPrimary: "#e8f4ff",
  textSecond: "#90c4e4",
  textDim: "#5a8ab0",
  border: "rgba(56,189,248,0.16)",
  borderHi: "rgba(56,189,248,0.42)",
} as const;

export type Token = typeof T;

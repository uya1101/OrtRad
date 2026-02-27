import React from 'react';
import { T } from '../../constants/tokens';
import Corners from '../common/Corners';
import HudBtn from '../common/HudBtn';
import TypingText from './TypingText';
import TagChip from './TagChip';

interface Stat {
  v: string;
  u: string;
  l: string;
}

export default function Hero() {
  const WORDS = ["整形外科領域の最前線", "骨密度・DXA解析", "MRI金属アーチファクト対策", "CTプロトコル最適化", "XP撮影ポジショニング"];
  const TAGS = ["XP 単純撮影", "MDCT", "MRI 1.5T / 3T", "骨密度 DEXA", "関節造影", "SAR管理", "MARS 撮影法", "k-space", "DWI拡散強調"];
  const STATS: Stat[] = [{ v: "4", u: "種", l: "対応モダリティ" }, { v: "120", u: "+", l: "プロトコル DB" }, { v: "24h", u: "", l: "リアルタイム更新" }, { v: "Pro", u: "", l: "放射線技師専用" }];

  return (
    <section style={{
      position: "relative", zIndex: 10, minHeight: "100vh",
      display: "flex", flexDirection: "column", justifyContent: "center",
      padding: "120px 24px 80px", maxWidth: 1300, margin: "0 auto",
    }}>
      <div className="hero-hud" style={{
        position: "relative",
        background: "rgba(6,12,24,0.60)",
        border: `1px solid ${T.border}`,
        borderRadius: 16, padding: "50px 52px 46px",
        backdropFilter: "blur(24px)",
        overflow: "hidden",
        animation: "heroFadeUp 0.7s ease both 0.1s",
        opacity: 0, animationFillMode: "forwards",
        boxShadow: "inset 0 1px 0 rgba(56,189,248,0.12), inset 0 -1px 0 rgba(56,189,248,0.06), 0 24px 80px rgba(0,0,0,0.6)",
      }}>
        <Corners size={20} th={1.5} op={0.85} />

        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg,transparent,${T.neonBlue} 40%,${T.neonTeal} 60%,transparent)`,
          animation: "borderScan 4s linear infinite",
          backgroundSize: "200% 100%",
          boxShadow: "0 0 12px rgba(56,189,248,0.45)",
        }} />

        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='52'%3E%3Cpolygon points='30,1 59,15 59,37 30,51 1,37 1,15' fill='none' stroke='rgba(56,189,248,0.035)' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: "60px 52px", opacity: 0.8,
        }} />

        <div style={{
          display: "flex", alignItems: "center", gap: 10, marginBottom: 16,
          animation: "heroFadeUp 0.5s ease both 0.3s", opacity: 0, animationFillMode: "forwards",
        }}>
          <div style={{ width: 30, height: "1.5px", background: `linear-gradient(90deg,${T.neonBlue},transparent)`, boxShadow: `0 0 6px ${T.neonBlue}` }} />
          <span style={{
            fontFamily: "'Share Tech Mono',monospace", fontSize: "0.66rem",
            letterSpacing: "0.22em", color: T.neonTeal, textTransform: "uppercase",
          }}>ORTHOPEDIC RADIOLOGY · KNOWLEDGE SYSTEM</span>
        </div>

        <h1 style={{
          fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, lineHeight: 1.05, marginBottom: 14,
          animation: "heroFadeUp 0.6s ease both 0.4s", opacity: 0, animationFillMode: "forwards",
        }}>
          <span className="hero-title-main" style={{
            display: "block", fontSize: "clamp(2.3rem,5.5vw,4.2rem)",
            color: T.textPrimary, letterSpacing: "0.04em",
          }}>IMAGING INTEL</span>
          <span className="hero-title-accent" style={{
            display: "block", fontSize: "clamp(1.9rem,4.5vw,3.4rem)",
            color: T.neonBlue, letterSpacing: "0.06em",
            animation: "glowPulse 3.5s ease-in-out infinite",
          }}>HUB</span>
        </h1>

        <div className="hero-desc" style={{
          fontFamily: "'Rajdhani',sans-serif",
          fontSize: "clamp(0.95rem,2.2vw,1.3rem)", fontWeight: 500,
          letterSpacing: "0.04em", marginBottom: 20, minHeight: "2.2em",
          color: T.textSecond,
          animation: "heroFadeUp 0.5s ease both 0.55s", opacity: 0, animationFillMode: "forwards",
        }}>
          <TypingText words={WORDS} />
        </div>

        <p style={{
          fontFamily: "'Noto Sans JP',sans-serif", fontSize: "0.87rem",
          color: T.textSecond, lineHeight: 1.9, maxWidth: 680, marginBottom: 26,
          animation: "heroFadeUp 0.5s ease both 0.65s", opacity: 0, animationFillMode: "forwards",
        }}>
          整形外科に特化した放射線技師のための知識武装プラットフォーム。XP・CT・MRI・骨密度検査における
          最新研究、撮影プロトコル、症例解析をリアルタイムで提供。
        </p>

        <div style={{
          display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 30,
          animation: "heroFadeUp 0.5s ease both 0.75s", opacity: 0, animationFillMode: "forwards",
        }}>
          {TAGS.map(t => <TagChip key={t} label={t} />)}
        </div>

        <div className="cta-row" style={{
          display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 40,
          animation: "heroFadeUp 0.5s ease both 0.85s", opacity: 0, animationFillMode: "forwards",
        }}>
          <HudBtn primary label="ナレッジDBにアクセス" icon="→" />
          <HudBtn label="最新ニュースを見る" icon="◎" />
        </div>

        <div className="stat-badges" style={{
          display: "flex", gap: 12, flexWrap: "wrap",
          borderTop: `1px solid rgba(56,189,248,0.12)`,
          paddingTop: 26,
          animation: "heroFadeUp 0.5s ease both 0.9s", opacity: 0, animationFillMode: "forwards",
        }}>
          {STATS.map(s => (
            <div key={s.l} style={{
              position: "relative",
              background: "rgba(10,19,36,0.75)",
              border: `1px solid rgba(56,189,248,0.20)`,
              borderRadius: 10, padding: "12px 18px", minWidth: 92,
              backdropFilter: "blur(14px)",
              boxShadow: "inset 0 1px 0 rgba(56,189,248,0.10)",
            }}>
              <Corners size={9} th={1} op={0.45} />
              <div style={{
                fontFamily: "'Rajdhani',sans-serif", fontWeight: 700,
                fontSize: "1.5rem", color: T.neonBlue, lineHeight: 1,
                textShadow: "0 0 16px rgba(56,189,248,0.50)",
              }}>
                {s.v}<span style={{ fontSize: "0.76rem", color: T.neonTeal }}>{s.u}</span>
              </div>
              <div style={{
                fontFamily: "'Share Tech Mono',monospace", fontSize: "0.57rem",
                color: T.textSecond, letterSpacing: "0.12em", marginTop: 4,
                textTransform: "uppercase",
              }}>{s.l}</div>
            </div>
          ))}
        </div>

        <div className="hero-silhouette" style={{
          position: "absolute", right: 48, top: "50%", transform: "translateY(-52%)",
          width: 195, height: 195, opacity: 0.065,
          animation: "floatY 6.5s ease-in-out infinite", pointerEvents: "none",
        }}>
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {[90, 68, 46, 24].map((r, i) => (
              <circle key={i} cx="100" cy="100" r={r} stroke={T.neonBlue}
                strokeWidth={i === 0 ? 2 : i === 1 ? 1.5 : 1}
                opacity={i === 3 ? 0.55 : 1} />
            ))}
            <circle cx="100" cy="100" r="8" fill={T.neonBlue} />
            {[[100, 10, 100, 30], [100, 170, 100, 190], [10, 100, 30, 100], [170, 100, 190, 100]].map(([x1, y1, x2, y2], i) => (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={T.neonBlue} strokeWidth="1.5" />
            ))}
          </svg>
        </div>
      </div>

      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginTop: 32,
        animation: "heroFadeUp 0.5s ease both 1.4s", opacity: 0, animationFillMode: "forwards",
      }}>
        <span style={{
          fontFamily: "'Share Tech Mono',monospace", fontSize: "0.57rem",
          color: T.textDim, letterSpacing: "0.18em",
        }}>SCROLL TO EXPLORE</span>
        {[0, 0.3, 0.6].map(d => (
          <div key={d} style={{
            width: 1, height: 10,
            background: `linear-gradient(to bottom,${T.neonBlue},transparent)`,
            animation: `scrollDrop 1.8s ease-in-out ${d}s infinite`,
            marginTop: d === 0 ? 0 : -6,
          }} />
        ))}
      </div>
    </section>
  );
}

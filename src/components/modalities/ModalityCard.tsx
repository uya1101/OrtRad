import React, { useState } from 'react';
import { T } from '../../constants/tokens';
import useReveal from '../../hooks/useReveal';
import Corners from '../common/Corners';
import DataStream from './DataStream';
import ParamBar from './ParamBar';
import TopicRow from './TopicRow';
import { Modality, ModalityParam } from '../../constants/modalities';

interface ModalityCardProps {
  mod: Modality;
  idx: number;
}

export default function ModalityCard({ mod, idx }: ModalityCardProps) {
  const [ref, vis] = useReveal(0.10);
  const [tab, setTab] = useState("topics");
  const [hov, setHov] = useState(false);
  const [scanAnim, setScanAnim] = useState(false);

  const delay = `${0.06 + (idx % 2) * 0.15}s`;

  const handleMouseEnter = () => { setHov(true); setScanAnim(true); };
  const handleMouseLeave = () => { setHov(false); setTimeout(() => setScanAnim(false), 600); };

  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(48px)",
      transition: `opacity 0.70s ease ${delay}, transform 0.70s cubic-bezier(0.22,1,0.36,1) ${delay}`,
    }}>
      <div
        className="mc-inner"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          borderColor: hov ? `${mod.color}66` : T.border,
          boxShadow: hov
            ? `0 12px 48px ${mod.glow}, 0 0 0 1px ${mod.color}28, inset 0 1px 0 ${mod.color}20`
            : "0 4px 28px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)",
          position: "relative",
          background: "rgba(8,15,30,0.80)",
          border: `1px solid ${T.border}`,
          borderRadius: 14,
          overflow: "hidden",
          backdropFilter: "blur(18px)",
          transition: "all 0.28s ease",
        }}
      >
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg,transparent 0%,${mod.color} 50%,transparent 100%)`,
          opacity: hov ? 1 : 0.45,
          transition: "opacity 0.28s ease",
          boxShadow: hov ? `0 0 14px ${mod.color}` : "none",
          animation: hov ? "borderGlow 1.8s ease-in-out infinite" : "none",
        }} />

        {scanAnim && (
          <div style={{
            position: "absolute", top: 0, bottom: 0, width: "40%",
            background: `linear-gradient(90deg,transparent,${mod.color}14,transparent)`,
            animation: "cardScanH 0.7s ease forwards",
            pointerEvents: "none", zIndex: 0,
          }} />
        )}

        <Corners color={mod.color} size={14} th={1.2} op={hov ? 0.85 : 0.55} />

        <div style={{ position: "relative", zIndex: 1, padding: "20px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.055)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flexShrink: 0, transition: "filter 0.28s ease", filter: hov ? `drop-shadow(0 0 12px ${mod.color}88)` : `drop-shadow(0 0 6px ${mod.color}44)` }}>
                {mod.icon(mod.color)}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: "0.57rem", color: mod.color, letterSpacing: "0.14em", opacity: 0.82 }}>{mod.code}</span>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    fontFamily: "'Share Tech Mono',monospace", fontSize: "0.54rem",
                    letterSpacing: "0.1em", padding: "2px 8px", borderRadius: 99,
                    background: `${mod.color}18`, border: `1px solid ${mod.color}44`, color: mod.color,
                    animation: mod.status === "ACTIVE" ? "statusBlink 3s ease-in-out infinite" : "none",
                    boxShadow: `0 0 8px ${mod.color}30`,
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: mod.color, boxShadow: `0 0 6px ${mod.color}` }} />
                    {mod.status}
                  </span>
                </div>
                <div style={{
                  fontFamily: "'Rajdhani',sans-serif", fontWeight: 700,
                  fontSize: "1.5rem", letterSpacing: "0.06em", lineHeight: 1.1,
                  color: T.textPrimary,
                  transition: "text-shadow 0.28s ease",
                  textShadow: hov ? `0 0 18px ${mod.color}66` : "none",
                }}>{mod.label}</div>
                <div style={{ fontFamily: "'Noto Sans JP',sans-serif", fontSize: "0.7rem", color: T.textSecond, marginTop: 2 }}>{mod.name}</div>
                <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: "0.53rem", color: T.textDim, letterSpacing: "0.08em", textTransform: "uppercase" }}>{mod.nameEn}</div>
              </div>
            </div>
            <div className="card-stream" style={{ width: 90, flexShrink: 0 }}>
              <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: "0.5rem", color: T.textDim, letterSpacing: "0.1em", display: "block", marginBottom: 4 }}>LIVE_PARAM</span>
              <DataStream lines={mod.stream} color={mod.color} />
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            {mod.kpi.map(k => (
              <div key={k.l} style={{
                flex: "1 1 76px",
                background: "rgba(255,255,255,0.028)",
                border: `1px solid rgba(255,255,255,0.065)`,
                borderRadius: 8, padding: "8px 11px",
                transition: "border-color 0.22s ease",
                borderColor: hov ? `${mod.color}30` : "rgba(255,255,255,0.065)",
              }}>
                <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: "0.95rem", color: mod.color, lineHeight: 1 }}>{k.v}</div>
                <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: "0.52rem", color: T.textDim, letterSpacing: "0.08em", marginTop: 4, textTransform: "uppercase" }}>{k.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.055)", position: "relative", zIndex: 1 }}>
          {[{ k: "topics", l: "📋 主要トピック" }, { k: "params", l: "⚙️ パラメータ" }].map(t => (
            <button key={t.k} onClick={() => setTab(t.k)} style={{
              flex: 1, padding: "9px 10px", border: "none", cursor: "pointer",
              fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, fontSize: "0.73rem",
              letterSpacing: "0.08em", textTransform: "uppercase",
              transition: "background 0.2s ease, color 0.2s ease",
              background: tab === t.k ? `${mod.color}12` : "transparent",
              color: tab === t.k ? mod.color : T.textDim,
              borderBottom: tab === t.k ? `2px solid ${mod.color}` : "2px solid transparent",
              boxShadow: tab === t.k ? `inset 0 -1px 0 ${mod.color}` : "none",
            }}>{t.l}</button>
          ))}
        </div>

        <div style={{ padding: "16px 20px 18px", minHeight: 178, position: "relative", zIndex: 1 }}>
          {tab === "topics"
            ? mod.topics.map((tp, i) => <TopicRow key={tp} text={tp} color={mod.color} idx={i} vis={vis} />)
            : mod.params.map((p: ModalityParam) => <ParamBar key={p.n} {...p} active={vis && tab === "params"} />)
          }
        </div>

        <div style={{ padding: "0 20px 16px", display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", position: "relative", zIndex: 1 }}>
          {mod.tags.map(t => (
            <span key={t} style={{
              fontFamily: "'Share Tech Mono',monospace", fontSize: "0.58rem",
              color: mod.color, letterSpacing: "0.08em", padding: "3px 8px", borderRadius: 4,
              background: `${mod.color}12`, border: `1px solid ${mod.color}30`,
              transition: "box-shadow 0.2s ease",
              boxShadow: hov ? `0 0 6px ${mod.color}30` : "none",
            }}>{t}</span>
          ))}
          <span style={{ marginLeft: "auto", fontFamily: "'Share Tech Mono',monospace", fontSize: "0.56rem", color: T.textDim, flexShrink: 0 }}>
            → 詳細を見る
          </span>
        </div>
      </div>
    </div>
  );
}

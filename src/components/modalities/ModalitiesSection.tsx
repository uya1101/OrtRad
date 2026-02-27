import React from 'react';
import { T } from '../../constants/tokens';
import useReveal from '../../hooks/useReveal';
import Corners from '../common/Corners';
import HudBtn from '../common/HudBtn';
import ModalityCard from './ModalityCard';
import { MODALITIES } from '../../constants/modalities';

interface SectionHeadProps {
  label: string;
}

function SectionHead({ label }: SectionHeadProps) {
  const [ref, vis] = useReveal(0.3);
  return (
    <div ref={ref} style={{
      display: "flex", alignItems: "center", gap: 12, marginBottom: 28,
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(22px)",
      transition: "opacity 0.6s ease, transform 0.6s ease",
      overflow: "hidden",
    }}>
      <div style={{ width: 28, height: "1.5px", flexShrink: 0, background: `linear-gradient(90deg,${T.neonBlue},transparent)`, boxShadow: `0 0 6px ${T.neonBlue}` }} />
      <span style={{ color: T.neonBlue, fontSize: "0.58rem", flexShrink: 0 }}>◆</span>
      <span style={{
        fontFamily: "'Rajdhani',sans-serif", fontWeight: 700,
        fontSize: "clamp(1.25rem,3vw,1.8rem)", letterSpacing: "0.1em",
        textTransform: "uppercase", flexShrink: 0,
        color: T.textPrimary,
      }}>
        {label}<span style={{ color: T.neonBlue }}> .</span>
      </span>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${T.border},transparent)`, minWidth: 0 }} />
      <span className="section-label-right" style={{
        fontFamily: "'Share Tech Mono',monospace", fontSize: "0.55rem",
        color: T.textDim, flexShrink: 0, letterSpacing: "0.1em",
      }}>SYS/MODALITY_DB</span>
    </div>
  );
}

export default function ModalitiesSection() {
  const [descRef, descVis] = useReveal(0.2);
  const [ctaRef, ctaVis] = useReveal(0.22);

  return (
    <section id="modalities" style={{ position: "relative", zIndex: 10, padding: "0 24px 100px", maxWidth: 1300, margin: "0 auto" }}>
      <SectionHead label="MODALITY DATABASE" />

      <div ref={descRef} style={{
        marginBottom: 28,
        opacity: descVis ? 1 : 0,
        transform: descVis ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s",
      }}>
        <p style={{ fontFamily: "'Noto Sans JP',sans-serif", fontSize: "0.85rem", color: T.textSecond, lineHeight: 1.95, maxWidth: 760 }}>
          整形外科に特化した4種のモダリティ情報を統合管理。各領域の最新プロトコル・臨床トピック・
          撮影パラメータをリアルタイムで提供します。タブ切替でトピック一覧とパラメータ詳細を確認できます。
        </p>
      </div>

      <div className="modality-grid">
        {MODALITIES.map((mod, i) => <ModalityCard key={mod.id} mod={mod} idx={i} />)}
      </div>

      <div ref={ctaRef} style={{
        marginTop: 44, padding: "32px 36px",
        background: "rgba(7,13,24,0.70)",
        border: `1px solid ${T.border}`,
        borderRadius: 14, backdropFilter: "blur(18px)",
        position: "relative", overflow: "hidden",
        display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 22,
        boxShadow: "inset 0 1px 0 rgba(56,189,248,0.10), 0 8px 40px rgba(0,0,0,0.4)",
        opacity: ctaVis ? 1 : 0,
        transform: ctaVis ? "translateY(0)" : "translateY(30px)",
        transition: "opacity 0.65s ease, transform 0.65s ease",
      }}>
        <Corners size={15} th={1} op={0.48} />
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "1.5px",
          background: `linear-gradient(90deg,transparent,${T.neonTeal} 40%,${T.neonBlue} 60%,transparent)`,
          opacity: 0.6,
          boxShadow: `0 0 10px rgba(45,212,191,0.35)`,
        }} />
        <div>
          <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: "1.2rem", letterSpacing: "0.06em", marginBottom: 6, color: T.textPrimary }}>
            さらに深く学ぶ<span style={{ color: T.neonBlue }}> —</span>
          </div>
          <p style={{ fontFamily: "'Noto Sans JP',sans-serif", fontSize: "0.82rem", color: T.textSecond, lineHeight: 1.85, maxWidth: 520 }}>
            各モダリティの詳細プロトコル集、症例ライブラリ、最新文献レビューはナレッジDBセクションでご確認いただけます。
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <HudBtn primary label="ナレッジDBへ" icon="→" />
          <HudBtn label="最新論文を見る" icon="◎" />
        </div>
      </div>
    </section>
  );
}

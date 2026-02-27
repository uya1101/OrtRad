import { T } from './tokens';
import { JSX } from 'react';

export type IconFunction = (color: string) => JSX.Element;

export const XP_ICON: IconFunction = c => (
  <svg width="48" height="48" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="4" width="36" height="44" rx="3" stroke={c} strokeWidth="1.5" opacity={0.8} />
    <rect x="13" y="9" width="26" height="13" rx="1.5" stroke={c} strokeWidth="1" opacity={0.5} />
    <circle cx="26" cy="15.5" r="4" stroke={c} strokeWidth="1.2" opacity={0.7} />
    <path d="M16 29 Q20 24 26 29 Q32 34 36 29" stroke={c} strokeWidth="1.3" fill="none" opacity={0.7} />
    <line x1="14" y1="36" x2="38" y2="36" stroke={c} strokeWidth="1" opacity={0.4} />
    <line x1="14" y1="40" x2="28" y2="40" stroke={c} strokeWidth="1" opacity={0.35} />
    <line x1="26" y1="4" x2="26" y2="9" stroke={c} strokeWidth="2" />
    <line x1="26" y1="44" x2="26" y2="48" stroke={c} strokeWidth="2" />
    <line x1="8" y1="26" x2="4" y2="26" stroke={c} strokeWidth="1.5" opacity={0.6} />
    <line x1="44" y1="26" x2="48" y2="26" stroke={c} strokeWidth="1.5" opacity={0.6} />
  </svg>
);

export const CT_ICON: IconFunction = c => (
  <svg width="48" height="48" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="26" cy="26" r="21" stroke={c} strokeWidth="1.5" opacity={0.8} />
    <circle cx="26" cy="26" r="14" stroke={c} strokeWidth="1" opacity={0.5} />
    <circle cx="26" cy="26" r="6" stroke={c} strokeWidth="1.2" />
    <circle cx="26" cy="26" r="2" fill={c} />
    <rect x="3" y="24" width="6" height="4" rx="1" fill={c} opacity={0.8} />
    <rect x="43" y="24" width="6" height="4" rx="1" fill={c} opacity={0.8} />
    <path d="M26 5 L26 17" stroke={c} strokeWidth="1.5" strokeDasharray="2 2" />
    <path d="M26 35 L26 47" stroke={c} strokeWidth="1.5" strokeDasharray="2 2" />
    <path d="M9  9  L18 18" stroke={c} strokeWidth="1" opacity={0.4} />
    <path d="M34 34 L43 43" stroke={c} strokeWidth="1" opacity={0.4} />
    <path d="M43 9  L34 18" stroke={c} strokeWidth="1" opacity={0.4} />
    <path d="M18 34 L9  43" stroke={c} strokeWidth="1" opacity={0.4} />
  </svg>
);

export const MRI_ICON: IconFunction = c => (
  <svg width="48" height="48" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="26" cy="26" rx="22" ry="12" stroke={c} strokeWidth="1.5" opacity={0.85} />
    <ellipse cx="26" cy="26" rx="22" ry="12" stroke={c} strokeWidth="1" transform="rotate(60 26 26)" opacity={0.4} />
    <ellipse cx="26" cy="26" rx="22" ry="12" stroke={c} strokeWidth="1" transform="rotate(-60 26 26)" opacity={0.4} />
    <circle cx="26" cy="26" r="5.5" stroke={c} strokeWidth="1.4" />
    <circle cx="26" cy="26" r="2" fill={c} opacity={0.9} />
    <path d="M8 19 Q12 26 8 33" stroke={c} strokeWidth="1.5" fill="none" opacity={0.6} />
    <path d="M44 19 Q40 26 44 33" stroke={c} strokeWidth="1.5" fill="none" opacity={0.6} />
  </svg>
);

export const DEXA_ICON: IconFunction = c => (
  <svg width="48" height="48" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="8" width="32" height="36" rx="3" stroke={c} strokeWidth="1.5" opacity={0.8} />
    <path d="M17 17 Q21 12 26 17 Q31 22 35 17" stroke={c} strokeWidth="1.3" fill="none" />
    <path d="M17 25 Q21 20 26 25 Q31 30 35 25" stroke={c} strokeWidth="1.3" fill="none" opacity={0.65} />
    <line x1="10" y1="31" x2="42" y2="31" stroke={c} strokeWidth="0.8" opacity={0.35} />
    <rect x="15" y="35" width="22" height="5" rx="1.5" stroke={c} strokeWidth="1" opacity={0.7} />
    <rect x="15" y="35" width="13" height="5" rx="1.5" fill={c} opacity={0.35} />
    <line x1="26" y1="8" x2="26" y2="4" stroke={c} strokeWidth="2" />
    <line x1="26" y1="44" x2="26" y2="48" stroke={c} strokeWidth="2" />
  </svg>
);

export interface ModalityParam {
  n: string;
  val: number;
  max: number;
  unit: string;
  c: string;
}

export interface ModalityKpi {
  l: string;
  v: string;
}

export interface Modality {
  id: string;
  code: string;
  label: string;
  name: string;
  nameEn: string;
  color: string;
  glow: string;
  icon: IconFunction;
  status: string;
  kpi: ModalityKpi[];
  params: ModalityParam[];
  tags: string[];
  topics: string[];
  stream: string[];
}

export const MODALITIES: Modality[] = [
  {
    id: "xp", code: "MOD-001", label: "XP", name: "単純撮影", nameEn: "Plain Radiography",
    color: T.neonBlue, glow: "rgba(56,189,248,0.22)", icon: XP_ICON, status: "ACTIVE",
    kpi: [{ l: "線量管理(DRL)", v: "5.0 mGy" }, { l: "空間分解能", v: "4.0 lp/mm" }, { l: "対象領域", v: "骨格・体幹" }],
    params: [
      { n: "管電圧", val: 80, max: 150, unit: "kVp", c: T.neonBlue },
      { n: "管電流", val: 200, max: 400, unit: "mA", c: T.neonTeal },
      { n: "照射野最適化", val: 75, max: 100, unit: "%", c: T.neonGreen },
    ],
    tags: ["DR", "CR", "グリッド", "AEC", "ポジショニング"],
    topics: [
      "脊椎側弯計測（Cobb角）の精度管理プロトコル",
      "股関節インプラント術後X線評価の標準化",
      "Pelvis AP撮影における線量低減テクニック",
      "四肢骨折の2方向撮影：ポジショニング必須条件",
    ],
    stream: ["kVp: 080", "mAs: 040", "SID: 180cm", "FOV: 43×43", "Grid: 12:1", "AEC: ON", "DR板: 43×43", "Dose: 5mGy"],
  },
  {
    id: "ct", code: "MOD-002", label: "CT", name: "コンピュータ断層撮影", nameEn: "Computed Tomography",
    color: T.neonTeal, glow: "rgba(45,212,191,0.22)", icon: CT_ICON, status: "ACTIVE",
    kpi: [{ l: "CTDIvol", v: "≤8 mGy" }, { l: "スライス厚", v: "0.5 mm" }, { l: "再構成", v: "MPR/VR" }],
    params: [
      { n: "管電圧", val: 120, max: 150, unit: "kVp", c: T.neonTeal },
      { n: "ピッチ", val: 60, max: 100, unit: "0.6", c: T.neonBlue },
      { n: "線量指標", val: 82, max: 100, unit: "DLP%", c: T.neonGreen },
    ],
    tags: ["MDCT", "MPR", "VR", "金属低減", "カーネル", "Iterative"],
    topics: [
      "整形外科金属インプラントのMARアルゴリズム比較（iMAR vs O-MAR）",
      "低管電圧CTによる被曝低減プロトコル：骨盤・腰椎",
      "骨折3D再構成とVRレンダリングパラメータ最適化",
      "Dynamic CTによる関節運動解析：足関節・膝関節",
    ],
    stream: ["kVp: 120", "Pitch: 0.6", "CTDI: 8.2", "DLP: 120", "Kernel: B30", "Recon: 0.5", "MAR: ON", "Iter: 3"],
  },
  {
    id: "mri", code: "MOD-003", label: "MRI", name: "磁気共鳴画像", nameEn: "Magnetic Resonance Imaging",
    color: T.neonPurple, glow: "rgba(167,139,250,0.22)", icon: MRI_ICON, status: "ACTIVE",
    kpi: [{ l: "磁場強度", v: "1.5 / 3T" }, { l: "SAR制限", v: "<2 W/kg" }, { l: "SNR向上", v: "並列受信" }],
    params: [
      { n: "TR", val: 70, max: 100, unit: "×10ms", c: T.neonPurple },
      { n: "TE", val: 45, max: 100, unit: "ms", c: T.neonBlue },
      { n: "FA", val: 90, max: 100, unit: "°", c: T.neonTeal },
    ],
    tags: ["TSE", "STIR", "MARS", "DWI", "k-space", "並列受信", "SEMAC"],
    topics: [
      "金属インプラント周囲のMARS撮影法（SEMAC・MARS徹底比較）",
      "3T-MRIにおけるSAR管理と高速撮像プロトコル設計",
      "膝関節半月板評価：PD-FS vs 3D-DESS 最適化",
      "DWI-EPIの幾何学的歪み補正：reversed-PE法の実践",
    ],
    stream: ["TR: 4500ms", "TE: 80ms", "Flip: 90°", "ETL: 16", "BW: 250", "NEX: 2", "GRAPPA: 2", "TR2: 800"],
  },
  {
    id: "dexa", code: "MOD-004", label: "DEXA", name: "骨密度検査", nameEn: "Dual-Energy X-ray Absorptiometry",
    color: T.neonAmber, glow: "rgba(251,191,36,0.20)", icon: DEXA_ICON, status: "STANDBY",
    kpi: [{ l: "精度(CV%)", v: "<1.0%" }, { l: "計測部位", v: "L1-L4" }, { l: "Tスコア閾値", v: "-2.5" }],
    params: [
      { n: "骨密度(BMD)", val: 68, max: 100, unit: "%", c: T.neonAmber },
      { n: "Tスコア推定", val: 55, max: 100, unit: "%", c: T.neonCoral },
      { n: "検査精度", val: 92, max: 100, unit: "%", c: T.neonGreen },
    ],
    tags: ["DXA", "Tスコア", "Zスコア", "腰椎AP", "大腿骨近位部", "骨粗鬆症"],
    topics: [
      "腰椎DXA計測における椎体形態異常・アーティファクトへの対応",
      "大腿骨近位部計測の標準化：Ward三角・大転子・頚部の精度比較",
      "小児・若年者ZスコアとTスコアの使い分け：ISCD最新ガイドライン",
      "QCT vs DXA：部位別精度比較と臨床応用の考え方",
    ],
    stream: ["E1: 070kVp", "E2: 140kVp", "BMD: 0.82", "T-score: -1.2", "Z-score: +0.4", "CV: 0.9%", "Fan: 7°", "Rate: 60%"],
  },
];

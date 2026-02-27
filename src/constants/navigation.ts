export interface NavItem {
  label: string;
  sub: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "XP / 骨密度", sub: "PLAIN·DEXA" },
  { label: "CT", sub: "COMPUTED_TOMO" },
  { label: "MRI", sub: "MAGNETIC_RES" },
  { label: "プロトコル", sub: "PROTOCOLS" },
  { label: "ナレッジ", sub: "KNOWLEDGE_DB" },
];

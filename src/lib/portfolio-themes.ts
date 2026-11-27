export type CoverMode = "pastel" | "vibrant" | "dark";
export type CoverPattern =
  | "classic-ribbon"
  | "geometric-blocks"
  | "grid-studio"
  | "wave-artistic"
  | "minimal-frame";
export type AvatarFrameStyle = "rounded" | "circle" | "polaroid" | "arch" | "sharp";
export type BadgeShape = "rounded" | "pill" | "tag" | "minimal";
export type PortfolioFontId = "sarabun" | "prompt" | "kanit" | "matchanamphung" | "hamsters";
export type AccentSticker = "sparkle" | "palette" | "crown" | "star" | "heart" | "none";
export type PaperTexture = "clean" | "dots" | "grid";

export interface PortfolioDesignSettings {
  presetId: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  coverMode: CoverMode;
  coverPattern: CoverPattern;
  avatarFrame: AvatarFrameStyle;
  badgeShape: BadgeShape;
  fontFamily: PortfolioFontId;
  sticker: AccentSticker;
  paperTexture: PaperTexture;
  ribbonText: string;
  coverTitleText: string;
  coverTagline: string;
  showRibbon: boolean;
}

export interface PortfolioThemePreset {
  id: string;
  name: string;
  subtitle: string;
  design: Partial<PortfolioDesignSettings> & {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    coverMode: CoverMode;
  };
}

export const DEFAULT_PORTFOLIO_DESIGN: PortfolioDesignSettings = {
  presetId: "sunset-orange",
  primaryColor: "#f26532",
  secondaryColor: "#13426b",
  accentColor: "#f59e0b",
  coverMode: "pastel",
  coverPattern: "classic-ribbon",
  avatarFrame: "rounded",
  badgeShape: "rounded",
  fontFamily: "sarabun",
  sticker: "sparkle",
  paperTexture: "clean",
  ribbonText: "PORTFOLIO",
  coverTitleText: "PORTFOLIO",
  coverTagline: "",
  showRibbon: true,
};

export const PORTFOLIO_THEME_PRESETS: PortfolioThemePreset[] = [
  {
    id: "sunset-orange",
    name: "Sunset Classic",
    subtitle: "ส้ม-กรมท่า (ต้นฉบับ)",
    design: {
      primaryColor: "#f26532",
      secondaryColor: "#13426b",
      accentColor: "#f59e0b",
      coverMode: "pastel",
      coverPattern: "classic-ribbon",
      avatarFrame: "rounded",
      badgeShape: "rounded",
      fontFamily: "sarabun",
      sticker: "sparkle",
      paperTexture: "clean",
    },
  },
  {
    id: "cyber-violet",
    name: "Cyber Neon",
    subtitle: "ม่วงนีออน-ไซเบอร์",
    design: {
      primaryColor: "#7c3aed",
      secondaryColor: "#312e81",
      accentColor: "#06b6d4",
      coverMode: "dark",
      coverPattern: "grid-studio",
      avatarFrame: "rounded",
      badgeShape: "tag",
      fontFamily: "prompt",
      sticker: "sparkle",
      paperTexture: "grid",
    },
  },
  {
    id: "midnight-gold",
    name: "Midnight Gold",
    subtitle: "กรมท่าเข้ม-ทองหรูหรา",
    design: {
      primaryColor: "#d97706",
      secondaryColor: "#0f172a",
      accentColor: "#f59e0b",
      coverMode: "dark",
      coverPattern: "minimal-frame",
      avatarFrame: "sharp",
      badgeShape: "rounded",
      fontFamily: "kanit",
      sticker: "crown",
      paperTexture: "clean",
    },
  },
  {
    id: "ocean-teal",
    name: "Ocean Teal",
    subtitle: "เทอร์ควอยซ์-น้ำทะเล",
    design: {
      primaryColor: "#0d9488",
      secondaryColor: "#0f2942",
      accentColor: "#14b8a6",
      coverMode: "pastel",
      coverPattern: "wave-artistic",
      avatarFrame: "rounded",
      badgeShape: "pill",
      fontFamily: "prompt",
      sticker: "sparkle",
      paperTexture: "dots",
    },
  },
  {
    id: "sakura-rose",
    name: "Sakura Rose",
    subtitle: "ชมพูซากุระละมุน",
    design: {
      primaryColor: "#e11d48",
      secondaryColor: "#881337",
      accentColor: "#fb7185",
      coverMode: "pastel",
      coverPattern: "wave-artistic",
      avatarFrame: "arch",
      badgeShape: "pill",
      fontFamily: "prompt",
      sticker: "heart",
      paperTexture: "dots",
    },
  },
  {
    id: "electric-cobalt",
    name: "Cobalt Tech",
    subtitle: "น้ำเงินไฟฟ้า-สายเทค",
    design: {
      primaryColor: "#2563eb",
      secondaryColor: "#1e3a8a",
      accentColor: "#38bdf8",
      coverMode: "vibrant",
      coverPattern: "geometric-blocks",
      avatarFrame: "rounded",
      badgeShape: "tag",
      fontFamily: "kanit",
      sticker: "star",
      paperTexture: "grid",
    },
  },
  {
    id: "crimson-studio",
    name: "Crimson Studio",
    subtitle: "แดงอาร์ต-ชาร์โคล",
    design: {
      primaryColor: "#dc2626",
      secondaryColor: "#18181b",
      accentColor: "#f97316",
      coverMode: "dark",
      coverPattern: "geometric-blocks",
      avatarFrame: "polaroid",
      badgeShape: "tag",
      fontFamily: "kanit",
      sticker: "palette",
      paperTexture: "clean",
    },
  },
  {
    id: "emerald-mint",
    name: "Emerald Sage",
    subtitle: "เขียวมรกต-มินต์",
    design: {
      primaryColor: "#059669",
      secondaryColor: "#064e3b",
      accentColor: "#10b981",
      coverMode: "pastel",
      coverPattern: "grid-studio",
      avatarFrame: "rounded",
      badgeShape: "pill",
      fontFamily: "sarabun",
      sticker: "sparkle",
      paperTexture: "clean",
    },
  },
  {
    id: "pastel-lavender",
    name: "Lavender Pop",
    subtitle: "ม่วงพาสเทล-ชมพู",
    design: {
      primaryColor: "#9333ea",
      secondaryColor: "#581c87",
      accentColor: "#ec4899",
      coverMode: "pastel",
      coverPattern: "classic-ribbon",
      avatarFrame: "circle",
      badgeShape: "pill",
      fontFamily: "prompt",
      sticker: "star",
      paperTexture: "dots",
    },
  },
  {
    id: "matcha-earth",
    name: "Matcha Minimal",
    subtitle: "มัทฉะ-มินิมอลญี่ปุ่น",
    design: {
      primaryColor: "#4d7c0f",
      secondaryColor: "#365314",
      accentColor: "#ca8a04",
      coverMode: "pastel",
      coverPattern: "minimal-frame",
      avatarFrame: "arch",
      badgeShape: "minimal",
      fontFamily: "sarabun",
      sticker: "none",
      paperTexture: "clean",
    },
  },
  {
    id: "monochrome-ink",
    name: "Mono Gallery",
    subtitle: "ขาว-ดำ แกลเลอรีเท่ๆ",
    design: {
      primaryColor: "#18181b",
      secondaryColor: "#27272a",
      accentColor: "#52525b",
      coverMode: "dark",
      coverPattern: "minimal-frame",
      avatarFrame: "sharp",
      badgeShape: "minimal",
      fontFamily: "prompt",
      sticker: "none",
      paperTexture: "grid",
    },
  },
  {
    id: "coral-pop",
    name: "Coral Sunset",
    subtitle: "คอรัล-ทองสดใส",
    design: {
      primaryColor: "#f43f5e",
      secondaryColor: "#9f1239",
      accentColor: "#f59e0b",
      coverMode: "vibrant",
      coverPattern: "geometric-blocks",
      avatarFrame: "polaroid",
      badgeShape: "rounded",
      fontFamily: "kanit",
      sticker: "palette",
      paperTexture: "dots",
    },
  },
];

export const FONT_OPTIONS: { id: PortfolioFontId; label: string; sample: string; css: string }[] = [
  { id: "sarabun", label: "Sarabun (ทางการ)", sample: "กขค ABC", css: "var(--font-sarabun), 'Sarabun', sans-serif" },
  { id: "prompt", label: "Prompt (โมเดิร์น)", sample: "กขค ABC", css: "var(--font-prompt), 'Prompt', sans-serif" },
  { id: "kanit", label: "Kanit (คมเท่)", sample: "กขค ABC", css: "var(--font-kanit), 'Kanit', sans-serif" },
  { id: "matchanamphung", label: "มัจฉาน้ำผึ้ง (ลายมือ)", sample: "กขค ABC", css: "'Matchanamphung', var(--font-prompt), sans-serif" },
  { id: "hamsters", label: "Hamsters (น่ารัก)", sample: "กขค ABC", css: "'FH Hamsters', var(--font-prompt), sans-serif" },
];

export function resolvePortfolioDesign(raw?: Partial<PortfolioDesignSettings> | null): PortfolioDesignSettings {
  return {
    ...DEFAULT_PORTFOLIO_DESIGN,
    ...(raw || {}),
    primaryColor: raw?.primaryColor || DEFAULT_PORTFOLIO_DESIGN.primaryColor,
    secondaryColor: raw?.secondaryColor || DEFAULT_PORTFOLIO_DESIGN.secondaryColor,
    accentColor: raw?.accentColor || DEFAULT_PORTFOLIO_DESIGN.accentColor,
    ribbonText: raw?.ribbonText !== undefined ? raw.ribbonText : DEFAULT_PORTFOLIO_DESIGN.ribbonText,
    coverTitleText: raw?.coverTitleText !== undefined ? raw.coverTitleText : DEFAULT_PORTFOLIO_DESIGN.coverTitleText,
    coverTagline: raw?.coverTagline !== undefined ? raw.coverTagline : DEFAULT_PORTFOLIO_DESIGN.coverTagline,
    showRibbon: raw?.showRibbon !== undefined ? raw.showRibbon : DEFAULT_PORTFOLIO_DESIGN.showRibbon,
  };
}

export function getFontCss(fontId: PortfolioFontId): string {
  return FONT_OPTIONS.find((f) => f.id === fontId)?.css || FONT_OPTIONS[0].css;
}

function parseHex(hex: string): [number, number, number] {
  const clean = (hex || "#f26532").replace("#", "").trim();
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean.padEnd(6, "0").slice(0, 6);
  const num = parseInt(full, 16);
  if (Number.isNaN(num)) return [242, 101, 50];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

export function hexToRgba(hex: string, alpha: number): string {
  const [r, g, b] = parseHex(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function mixHex(hexA: string, hexB: string, weightB: number): string {
  const [r1, g1, b1] = parseHex(hexA);
  const [r2, g2, b2] = parseHex(hexB);
  const w = Math.max(0, Math.min(1, weightB));
  const r = Math.round(r1 * (1 - w) + r2 * w);
  const g = Math.round(g1 * (1 - w) + g2 * w);
  const b = Math.round(b1 * (1 - w) + b2 * w);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

export function getContrastText(hex: string): string {
  const [r, g, b] = parseHex(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? "#0f172a" : "#ffffff";
}

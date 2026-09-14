export interface ArtAvatarPreset {
  id: string;
  name: string;
  category: string;
  iconEmoji: string;
  colorBg: string;
  colorBorder: string;
  colorText: string;
  gradientFrom: string;
  gradientTo: string;
  description: string;
}

export const ART_AVATAR_PRESETS: ArtAvatarPreset[] = [
  {
    id: "art-brush",
    name: "พู่กันสีน้ำ",
    category: "จิตรกรรม",
    iconEmoji: "🖌️",
    colorBg: "bg-rose-50",
    colorBorder: "border-rose-200",
    colorText: "text-rose-600",
    gradientFrom: "from-rose-500",
    gradientTo: "to-pink-500",
    description: "หัวพู่กันขนนุ่มสำหรับงานระบายสีน้ำและสีโปสเตอร์",
  },
  {
    id: "art-palette",
    name: "จานสีไม้",
    category: "อุปกรณ์ศิลป์",
    iconEmoji: "🎨",
    colorBg: "bg-amber-50",
    colorBorder: "border-amber-200",
    colorText: "text-amber-600",
    gradientFrom: "from-amber-500",
    gradientTo: "to-orange-500",
    description: "จานสีคลาสสิกรวมเฉดสีสายรุ้งสร้างสรรค์",
  },
  {
    id: "art-pencil",
    name: "ดินสอ EE สเก็ตช์",
    category: "วาดเส้น (Drawing)",
    iconEmoji: "✏️",
    colorBg: "bg-stone-100",
    colorBorder: "border-stone-300",
    colorText: "text-stone-800",
    gradientFrom: "from-stone-700",
    gradientTo: "to-gray-900",
    description: "ดินสอไส้เข้มดำสนิทสำหรับดรออิ้งและแรเงา",
  },
  {
    id: "art-tube",
    name: "หลอดสีอะคริลิก",
    category: "จิตรกรรม",
    iconEmoji: "🧪",
    colorBg: "bg-cyan-50",
    colorBorder: "border-cyan-200",
    colorText: "text-cyan-600",
    gradientFrom: "from-cyan-500",
    gradientTo: "to-blue-500",
    description: "หลอดสีอะคริลิกเนื้อแน่นสดใสกันน้ำ",
  },
  {
    id: "art-toy",
    name: "หุ่นอาร์ตทอย",
    category: "ประติมากรรมร่วมสมัย",
    iconEmoji: "🧸",
    colorBg: "bg-purple-50",
    colorBorder: "border-purple-200",
    colorText: "text-purple-600",
    gradientFrom: "from-purple-500",
    gradientTo: "to-indigo-500",
    description: "โมเดล Art Toy ตัวจิ๋วสไตล์ดีไซเนอร์รุ่นใหม่",
  },
  {
    id: "art-easel",
    name: "ขาตั้งวาดภาพ",
    category: "สตูดิโอ",
    iconEmoji: "🖼️",
    colorBg: "bg-emerald-50",
    colorBorder: "border-emerald-200",
    colorText: "text-emerald-600",
    gradientFrom: "from-emerald-500",
    gradientTo: "to-teal-500",
    description: "ขาตั้งผ้าใบแคนวาสพร้อมผลงานชิ้นเอก",
  },
  {
    id: "art-tote",
    name: "กระเป๋าผ้าเพ้นท์",
    category: "งานคราฟต์ DIY",
    iconEmoji: "👜",
    colorBg: "bg-orange-50",
    colorBorder: "border-orange-200",
    colorText: "text-orange-600",
    gradientFrom: "from-orange-500",
    gradientTo: "to-amber-500",
    description: "กระเป๋าผ้าแคนวาสลวดลายแฮนด์เมดรักษ์โลก",
  },
  {
    id: "art-beret",
    name: "หมวกเบเรต์ & แว่นตา",
    category: "เอกลักษณ์ศิลปิน",
    iconEmoji: "👨‍🎨",
    colorBg: "bg-sky-50",
    colorBorder: "border-sky-200",
    colorText: "text-sky-600",
    gradientFrom: "from-sky-500",
    gradientTo: "to-blue-600",
    description: "สไตล์ศิลปินคลาสสิก อบอุ่นและเปี่ยมแรงบันดาลใจ",
  },
];

export function getArtAvatarById(id?: string | null): ArtAvatarPreset | undefined {
  if (!id) return undefined;
  return ART_AVATAR_PRESETS.find((p) => p.id === id);
}

/**
 * Returns user avatar display data:
 * - If it's a data:image or http url -> returns as image src
 * - If it matches an ArtAvatarPreset ID -> returns preset details
 * - Otherwise falls back to initials
 */
export function resolveUserAvatar(avatarValue?: string | null, userName?: string | null) {
  if (!avatarValue) {
    const initial = (userName || "A").trim().charAt(0).toUpperCase();
    return {
      type: "initials" as const,
      value: initial,
      preset: undefined,
    };
  }

  if (avatarValue.startsWith("data:image/") || avatarValue.startsWith("http://") || avatarValue.startsWith("https://")) {
    return {
      type: "image" as const,
      value: avatarValue,
      preset: undefined,
    };
  }

  const preset = getArtAvatarById(avatarValue);
  if (preset) {
    return {
      type: "preset" as const,
      value: preset.iconEmoji,
      preset,
    };
  }

  const initial = (userName || "A").trim().charAt(0).toUpperCase();
  return {
    type: "initials" as const,
    value: initial,
    preset: undefined,
  };
}

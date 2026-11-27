"use client";

import React from "react";
import {
  Sparkles,
  Shuffle,
  RotateCcw,
  Palette,
  Type,
  Layout,
  Frame,
  Tag,
  Sticker,
  Grid,
  Check,
} from "lucide-react";
import {
  PortfolioDesignSettings,
  PORTFOLIO_THEME_PRESETS,
  DEFAULT_PORTFOLIO_DESIGN,
  FONT_OPTIONS,
  CoverMode,
  CoverPattern,
  AvatarFrameStyle,
  BadgeShape,
  AccentSticker,
  PaperTexture,
  mixHex,
} from "@/lib/portfolio-themes";

interface PortfolioDesignPanelProps {
  design: PortfolioDesignSettings;
  onChange: (next: PortfolioDesignSettings) => void;
}

const QUICK_SWATCHES = [
  "#f26532",
  "#e11d48",
  "#9333ea",
  "#7c3aed",
  "#2563eb",
  "#0d9488",
  "#059669",
  "#d97706",
  "#dc2626",
  "#18181b",
];

const COVER_MODE_OPTIONS: { id: CoverMode; label: string; desc: string }[] = [
  { id: "pastel", label: "พาสเทลสว่าง", desc: "นุ่มนวลสะอาดตา" },
  { id: "vibrant", label: "สีสดโดดเด่น", desc: "ไล่สีสะดุดตา" },
  { id: "dark", label: "ปกเข้มพรีเมียม", desc: "เท่ล้ำมีมิติ" },
];

const COVER_PATTERN_OPTIONS: { id: CoverPattern; label: string }[] = [
  { id: "classic-ribbon", label: "โค้งคลาสสิก" },
  { id: "geometric-blocks", label: "เรขาคณิตเท่ๆ" },
  { id: "grid-studio", label: "กริดสตูดิโอ" },
  { id: "wave-artistic", label: "คลื่นศิลปะ" },
  { id: "minimal-frame", label: "กรอบนิตยสาร" },
];

const AVATAR_FRAME_OPTIONS: { id: AvatarFrameStyle; label: string }[] = [
  { id: "rounded", label: "มุมมน" },
  { id: "circle", label: "วงกลม" },
  { id: "arch", label: "ซุ้มโค้ง" },
  { id: "polaroid", label: "โพลารอยด์" },
  { id: "sharp", label: "เหลี่ยมคม" },
];

const BADGE_SHAPE_OPTIONS: { id: BadgeShape; label: string }[] = [
  { id: "rounded", label: "มุมมน" },
  { id: "pill", label: "แคปซูล" },
  { id: "tag", label: "แท็บแถบสี" },
  { id: "minimal", label: "เส้นขีดใต้" },
];

const STICKER_OPTIONS: { id: AccentSticker; label: string; emoji: string }[] = [
  { id: "sparkle", label: "วิ้งค์ 4 แฉก", emoji: "✦" },
  { id: "palette", label: "จานสีศิลปะ", emoji: "🎨" },
  { id: "crown", label: "มงกุฎ", emoji: "👑" },
  { id: "star", label: "ดาว", emoji: "★" },
  { id: "heart", label: "หัวใจ", emoji: "♥" },
  { id: "none", label: "ไม่ใส่", emoji: "—" },
];

const PAPER_TEXTURE_OPTIONS: { id: PaperTexture; label: string }[] = [
  { id: "clean", label: "ขาวเรียบ" },
  { id: "dots", label: "จุดไข่ปลา" },
  { id: "grid", label: "กริดบาง" },
];

export default function PortfolioDesignPanel({
  design,
  onChange,
}: PortfolioDesignPanelProps) {
  const applyPreset = (presetId: string) => {
    const preset = PORTFOLIO_THEME_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    onChange({
      ...design,
      ...preset.design,
      presetId: preset.id,
    });
  };

  const handleRandomize = () => {
    const otherPresets = PORTFOLIO_THEME_PRESETS.filter((p) => p.id !== design.presetId);
    const pool = otherPresets.length > 0 ? otherPresets : PORTFOLIO_THEME_PRESETS;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    const randomCover =
      COVER_PATTERN_OPTIONS[Math.floor(Math.random() * COVER_PATTERN_OPTIONS.length)].id;
    const randomAvatar =
      AVATAR_FRAME_OPTIONS[Math.floor(Math.random() * AVATAR_FRAME_OPTIONS.length)].id;
    onChange({
      ...design,
      ...picked.design,
      presetId: picked.id,
      coverPattern: picked.design.coverPattern || randomCover,
      avatarFrame: picked.design.avatarFrame || randomAvatar,
    });
  };

  const handleResetDesign = () => {
    onChange({ ...DEFAULT_PORTFOLIO_DESIGN });
  };

  const updateField = <K extends keyof PortfolioDesignSettings>(
    key: K,
    value: PortfolioDesignSettings[K],
    markCustom = false
  ) => {
    onChange({
      ...design,
      [key]: value,
      presetId: markCustom ? "custom" : design.presetId,
    });
  };

  return (
    <div className="space-y-5 text-xs">
      {/* Top Action Bar: Randomize & Reset */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleRandomize}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer no-min-h"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>สุ่มธีมเท่ๆ</span>
        </button>
        <button
          type="button"
          onClick={handleResetDesign}
          className="inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition-colors cursor-pointer no-min-h"
          title="คืนค่าดีไซน์เริ่มต้น"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>ค่าเดิม</span>
        </button>
      </div>

      {/* 1. Curated Cool Color Themes */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>ชุดธีมสีเท่ๆ สำเร็จรูป ({PORTFOLIO_THEME_PRESETS.length} แบบ)</span>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {PORTFOLIO_THEME_PRESETS.map((preset) => {
            const isActive = design.presetId === preset.id;
            const d = preset.design;
            const previewBg =
              d.coverMode === "dark"
                ? `linear-gradient(135deg, #0f172a 0%, ${mixHex("#0f172a", d.primaryColor, 0.45)} 100%)`
                : d.coverMode === "vibrant"
                  ? `linear-gradient(135deg, ${d.primaryColor} 0%, ${d.secondaryColor} 100%)`
                  : `linear-gradient(135deg, #ffffff 0%, ${mixHex("#ffffff", d.primaryColor, 0.22)} 100%)`;

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.id)}
                className={`group relative text-left p-2 rounded-xl border transition-all cursor-pointer no-min-h ${
                  isActive
                    ? "border-slate-900 bg-slate-50 ring-2 ring-slate-900/15 shadow-xs"
                    : "border-slate-200 hover:border-slate-400 bg-white"
                }`}
              >
                {/* Mini Theme Preview Bar */}
                <div
                  className="h-7 rounded-lg mb-1.5 px-2 flex items-center justify-between border border-black/5 overflow-hidden"
                  style={{ background: previewBg }}
                >
                  <div className="flex items-center gap-1">
                    <span
                      className="w-3 h-3 rounded-full border border-white/70 shadow-2xs"
                      style={{ backgroundColor: d.primaryColor }}
                    />
                    <span
                      className="w-3 h-3 rounded-full border border-white/70 shadow-2xs"
                      style={{ backgroundColor: d.secondaryColor }}
                    />
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-white/70 shadow-2xs"
                      style={{ backgroundColor: d.accentColor }}
                    />
                  </div>
                  {d.coverMode === "dark" && (
                    <span className="text-[9px] font-extrabold px-1 py-0.2 rounded bg-black/40 text-white">
                      DARK
                    </span>
                  )}
                  {d.coverMode === "vibrant" && (
                    <span className="text-[9px] font-extrabold px-1 py-0.2 rounded bg-white/25 text-white">
                      POP
                    </span>
                  )}
                </div>

                <div className="font-bold text-[11px] text-slate-800 truncate leading-tight">
                  {preset.name}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {preset.subtitle}
                </div>

                {isActive && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-xs">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Cover Color Mode */}
      <div className="space-y-2 pt-3 border-t border-slate-100">
        <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-teal-600" />
          <span>โทนหน้าปก (Cover Style)</span>
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          {COVER_MODE_OPTIONS.map((m) => {
            const active = design.coverMode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => updateField("coverMode", m.id, true)}
                className={`p-2 rounded-xl border text-center transition-all cursor-pointer no-min-h ${
                  active
                    ? "border-teal-600 bg-teal-50/80 text-teal-900 font-bold shadow-2xs"
                    : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
                }`}
              >
                <div className="text-[11px] font-bold leading-tight">{m.label}</div>
                <div className="text-[9px] text-slate-400 mt-0.5">{m.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Custom DIY Color Pickers */}
      <div className="space-y-2.5 pt-3 border-t border-slate-100">
        <span className="font-extrabold text-slate-800 block">
          ปรับสีเองได้อิสระ (Custom Colors)
        </span>

        {/* Quick Primary Swatches */}
        <div className="flex flex-wrap gap-1.5">
          {QUICK_SWATCHES.map((hex) => (
            <button
              key={hex}
              type="button"
              onClick={() => updateField("primaryColor", hex, true)}
              className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 cursor-pointer no-min-h ${
                design.primaryColor.toLowerCase() === hex.toLowerCase()
                  ? "border-slate-900 scale-110 ring-2 ring-slate-900/20"
                  : "border-white shadow-xs"
              }`}
              style={{ backgroundColor: hex }}
              title={`ใช้สีหลัก ${hex}`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <label className="p-2 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col items-center gap-1 cursor-pointer hover:border-slate-300">
            <input
              type="color"
              value={design.primaryColor}
              onChange={(e) => updateField("primaryColor", e.target.value, true)}
              className="w-8 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
            />
            <span className="text-[10px] font-bold text-slate-700">สีหลัก</span>
          </label>

          <label className="p-2 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col items-center gap-1 cursor-pointer hover:border-slate-300">
            <input
              type="color"
              value={design.secondaryColor}
              onChange={(e) => updateField("secondaryColor", e.target.value, true)}
              className="w-8 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
            />
            <span className="text-[10px] font-bold text-slate-700">สีหัวหมวด</span>
          </label>

          <label className="p-2 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col items-center gap-1 cursor-pointer hover:border-slate-300">
            <input
              type="color"
              value={design.accentColor}
              onChange={(e) => updateField("accentColor", e.target.value, true)}
              className="w-8 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
            />
            <span className="text-[10px] font-bold text-slate-700">สีไฮไลต์</span>
          </label>
        </div>
      </div>

      {/* 4. Cover Pattern */}
      <div className="space-y-2 pt-3 border-t border-slate-100">
        <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
          <Layout className="w-3.5 h-3.5 text-indigo-600" />
          <span>ลวดลายตกแต่งหัวปก</span>
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {COVER_PATTERN_OPTIONS.map((pat) => {
            const active = design.coverPattern === pat.id;
            return (
              <button
                key={pat.id}
                type="button"
                onClick={() => updateField("coverPattern", pat.id)}
                className={`px-2.5 py-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer no-min-h ${
                  active
                    ? "border-indigo-600 bg-indigo-50 text-indigo-900"
                    : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
                }`}
              >
                {pat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Avatar Frame & Badge Shape */}
      <div className="space-y-2 pt-3 border-t border-slate-100">
        <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
          <Frame className="w-3.5 h-3.5 text-rose-600" />
          <span>กรอบรูปผู้สมัคร</span>
        </span>
        <div className="flex flex-wrap gap-1.5">
          {AVATAR_FRAME_OPTIONS.map((fr) => {
            const active = design.avatarFrame === fr.id;
            return (
              <button
                key={fr.id}
                type="button"
                onClick={() => updateField("avatarFrame", fr.id)}
                className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer no-min-h ${
                  active
                    ? "border-rose-500 bg-rose-50 text-rose-800"
                    : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
                }`}
              >
                {fr.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Section Badge Shape */}
      <div className="space-y-2 pt-3 border-t border-slate-100">
        <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-amber-600" />
          <span>ทรงป้ายชื่อหมวดหมู่</span>
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {BADGE_SHAPE_OPTIONS.map((sh) => {
            const active = design.badgeShape === sh.id;
            return (
              <button
                key={sh.id}
                type="button"
                onClick={() => updateField("badgeShape", sh.id)}
                className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer no-min-h ${
                  active
                    ? "border-amber-500 bg-amber-50 text-amber-900"
                    : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
                }`}
              >
                {sh.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 7. Font Selector */}
      <div className="space-y-2 pt-3 border-t border-slate-100">
        <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 text-sky-600" />
          <span>ฟอนต์ในแฟ้มสะสมผลงาน</span>
        </span>
        <div className="space-y-1.5">
          {FONT_OPTIONS.map((f) => {
            const active = design.fontFamily === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => updateField("fontFamily", f.id)}
                className={`w-full px-3 py-2 rounded-xl border flex items-center justify-between transition-all cursor-pointer no-min-h ${
                  active
                    ? "border-sky-600 bg-sky-50/80 text-sky-900"
                    : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                }`}
              >
                <span className="text-[11px] font-bold">{f.label}</span>
                <span className="text-xs font-semibold" style={{ fontFamily: f.css }}>
                  {f.sample}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 8. Sticker & Paper Texture */}
      <div className="space-y-2.5 pt-3 border-t border-slate-100">
        <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
          <Sticker className="w-3.5 h-3.5 text-pink-600" />
          <span>สติกเกอร์มุมการ์ด & พื้นกระดาษ</span>
        </span>

        <div className="grid grid-cols-3 gap-1.5">
          {STICKER_OPTIONS.map((st) => {
            const active = design.sticker === st.id;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => updateField("sticker", st.id)}
                className={`px-2 py-1.5 rounded-lg border text-[10.5px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer no-min-h ${
                  active
                    ? "border-pink-500 bg-pink-50 text-pink-900"
                    : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
                }`}
              >
                <span>{st.emoji}</span>
                <span className="truncate">{st.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 pt-1">
          <Grid className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <div className="grid grid-cols-3 gap-1.5 flex-1">
            {PAPER_TEXTURE_OPTIONS.map((pt) => {
              const active = design.paperTexture === pt.id;
              return (
                <button
                  key={pt.id}
                  type="button"
                  onClick={() => updateField("paperTexture", pt.id)}
                  className={`px-2 py-1.5 rounded-lg border text-[10.5px] font-bold transition-all cursor-pointer no-min-h ${
                    active
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
                  }`}
                >
                  {pt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 9. Custom Cover Text & Ribbon */}
      <div className="space-y-2.5 pt-3 border-t border-slate-100">
        <span className="font-extrabold text-slate-800 block">
          ปรับข้อความตกแต่งหน้าปก
        </span>
        <div className="space-y-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <div>
            <span className="text-[10px] text-slate-500 block mb-0.5">
              หัวข้อใหญ่บนหน้าปก
            </span>
            <input
              type="text"
              value={design.coverTitleText}
              onChange={(e) => updateField("coverTitleText", e.target.value)}
              placeholder="PORTFOLIO"
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-bold text-slate-800 text-xs outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <span className="text-[10px] text-slate-500 block mb-0.5">
              แท็กคำโปรยเก๋ๆ (ไม่บังคับ)
            </span>
            <input
              type="text"
              value={design.coverTagline}
              onChange={(e) => updateField("coverTagline", e.target.value)}
              placeholder="เช่น ART & DESIGN • CREATIVE EDITION"
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={design.showRibbon}
                onChange={(e) => updateField("showRibbon", e.target.checked)}
                className="w-3.5 h-3.5 rounded text-teal-600"
              />
              <span className="text-[11px] font-bold text-slate-700">แสดงริบบิ้นขวา</span>
            </label>
            {design.showRibbon && (
              <input
                type="text"
                value={design.ribbonText}
                onChange={(e) => updateField("ribbonText", e.target.value)}
                placeholder="PORTFOLIO"
                className="w-28 px-2 py-1 rounded-lg border border-slate-200 bg-white font-bold text-slate-800 text-[11px] text-center outline-none focus:border-teal-500"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

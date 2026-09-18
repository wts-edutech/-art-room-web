"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Type, 
  Check, 
  Sparkles, 
  RotateCcw, 
  X, 
  ChevronUp, 
  Palette,
  Heart,
  BookOpen
} from "lucide-react";

export interface FontOption {
  id: string;
  name: string;
  subName: string;
  family: string;
  previewClass: string;
  category: "มาตรฐาน" | "วัยรุ่นหัวกลม" | "ลายมือ";
  tagColor?: string;
}

export const FONTS_LIST: FontOption[] = [
  // 1. ฟอนต์มาตรฐานระดับชาติ
  {
    id: "prompt",
    name: "พร้อมท์ (Prompt)",
    subName: "ฟอนต์มาตรฐานเว็บ สะอาดตา ทันสมัย",
    family: "'Prompt', sans-serif",
    previewClass: "font-preview-prompt",
    category: "มาตรฐาน",
    tagColor: "bg-blue-50 text-blue-700 border-blue-200"
  },
  {
    id: "sarabun",
    name: "สารบรรณ (Sarabun)",
    subName: "ฟอนต์ทางการมาตรฐานชาติ อ่านง่าย เรียบร้อย",
    family: "'Sarabun', sans-serif",
    previewClass: "font-preview-sarabun",
    category: "มาตรฐาน",
    tagColor: "bg-emerald-50 text-emerald-700 border-emerald-200"
  },
  {
    id: "kanit",
    name: "คณิต (Kanit)",
    subName: "ฟอนต์หัวข้อสไตล์ศิลปะ มีพลัง คมชัด",
    family: "'Kanit', sans-serif",
    previewClass: "font-preview-kanit",
    category: "มาตรฐาน",
    tagColor: "bg-indigo-50 text-indigo-700 border-indigo-200"
  },

  // 2. ฟอนต์ลายมือวัยรุ่น & หัวกลมยอดนิยม
  {
    id: "matchanamphung",
    name: "มัทฉะน้ำผึ้ง (Matchanamphung)",
    subName: "ฟอนต์วัยรุ่น หัวกลม น่ารักสดใส",
    family: "'Matchanamphung', 'Prompt', sans-serif",
    previewClass: "font-preview-matchanamphung",
    category: "วัยรุ่นหัวกลม",
    tagColor: "bg-pink-50 text-pink-700 border-pink-200"
  },
  {
    id: "hamsters",
    name: "แฮมสเตอร์ (FH Hamsters)",
    subName: "ลายเส้นดินสอน่ารัก ซุกซน อบอุ่น",
    family: "'FH Hamsters', 'Prompt', sans-serif",
    previewClass: "font-preview-hamsters",
    category: "ลายมือ",
    tagColor: "bg-amber-50 text-amber-700 border-amber-200"
  },
  {
    id: "kancha-easy",
    name: "KanchaEasy",
    subName: "ฟอนต์ลายมือกัญชาอีซี่ ลายเส้นฟรีสไตล์",
    family: "'KanchaEasy', 'Prompt', sans-serif",
    previewClass: "font-preview-kancha-easy",
    category: "ลายมือ",
    tagColor: "bg-teal-50 text-teal-700 border-teal-200"
  },
  {
    id: "ebwriter",
    name: "นักเขียน (EBWriter)",
    subName: "สไตล์ลายมือนักเขียน เรียบง่าย มีเสน่ห์",
    family: "'EBWriter', 'Prompt', sans-serif",
    previewClass: "font-preview-ebwriter",
    category: "ลายมือ",
    tagColor: "bg-purple-50 text-purple-700 border-purple-200"
  },
  {
    id: "mali",
    name: "มะลิ (Mali)",
    subName: "ลายมือหัวกลมวัยรุ่น ยอดนิยมตลอดกาล",
    family: "'Mali', cursive, sans-serif",
    previewClass: "font-preview-mali",
    category: "วัยรุ่นหัวกลม",
    tagColor: "bg-rose-50 text-rose-700 border-rose-200"
  },
  {
    id: "itim",
    name: "ไอติม (Itim)",
    subName: "ฟอนต์หัวกลมนุ่มนวล สบายตา น่ารักมาก",
    family: "'Itim', cursive, sans-serif",
    previewClass: "font-preview-itim",
    category: "วัยรุ่นหัวกลม",
    tagColor: "bg-orange-50 text-orange-700 border-orange-200"
  },
];

const STORAGE_KEY = "artroom_selected_font";

// Deep Override Function: Immediately forces the chosen font across all tags & classes on the page
export function applyActiveFont(fontFamily: string) {
  if (typeof document === "undefined") return;

  // 1. Set CSS variable and inline style on html root and body
  document.documentElement.style.setProperty("--user-font", fontFamily);
  document.documentElement.style.fontFamily = fontFamily;
  if (document.body) {
    document.body.style.fontFamily = fontFamily;
  }

  // 2. Ensure Google Fonts stylesheet is present in <head>
  if (!document.getElementById("artroom-google-fonts-link")) {
    const fontLink = document.createElement("link");
    fontLink.id = "artroom-google-fonts-link";
    fontLink.rel = "stylesheet";
    fontLink.href = "https://fonts.googleapis.com/css2?family=Itim&family=Kanit:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,600;1,700&family=Mali:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Prompt:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&family=Sarabun:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,600;1,700&display=swap";
    document.head.appendChild(fontLink);
  }

  // 3. Inject or update deep dynamic style tag in <head>
  let styleEl = document.getElementById("artroom-dynamic-font-override") as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "artroom-dynamic-font-override";
    document.head.appendChild(styleEl);
  }

  // Universal deep override: Forces font across every text element, heading, div, span, button, input
  styleEl.textContent = `
    :root, html, body {
      --user-font: ${fontFamily};
      font-family: ${fontFamily} !important;
    }

    body,
    body *:not([class*="font-preview-"]):not([class*="lucide"]):not(svg):not(path) {
      font-family: ${fontFamily} !important;
    }

    /* Individual preview lines inside font switcher */
    .font-preview-prompt { font-family: 'Prompt', sans-serif !important; }
    .font-preview-sarabun { font-family: 'Sarabun', sans-serif !important; }
    .font-preview-kanit { font-family: 'Kanit', sans-serif !important; }
    .font-preview-matchanamphung { font-family: 'Matchanamphung', 'Prompt', sans-serif !important; }
    .font-preview-hamsters { font-family: 'FH Hamsters', 'Prompt', sans-serif !important; }
    .font-preview-kancha-easy { font-family: 'KanchaEasy', 'Prompt', sans-serif !important; }
    .font-preview-ebwriter { font-family: 'EBWriter', 'Prompt', sans-serif !important; }
    .font-preview-mali { font-family: 'Mali', cursive, sans-serif !important; }
    .font-preview-itim { font-family: 'Itim', cursive, sans-serif !important; }
  `;
}

export default function FontSelectorDropdown() {
  const [selectedFontId, setSelectedFontId] = useState<string>("prompt");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"ทั้งหมด" | "มาตรฐาน" | "วัยรุ่นหัวกลม" | "ลายมือ">("ทั้งหมด");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Helper to read font from cookie
  const getFontCookie = (): string | null => {
    if (typeof document === "undefined") return null;
    try {
      const match = document.cookie.match(/(?:^|;\s*)artroom_selected_font=([^;]*)/);
      return match ? decodeURIComponent(match[1]) : null;
    } catch {
      return null;
    }
  };

  // On mount: Restore saved font from cookie or localStorage
  useEffect(() => {
    try {
      const saved = getFontCookie() || localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const found = FONTS_LIST.find((f) => f.id === saved);
        if (found) {
          setSelectedFontId(found.id);
          applyActiveFont(found.family);
          return;
        }
      }
    } catch (e) {
      console.warn("Could not read font from storage:", e);
    }
    // Default fallback
    applyActiveFont("'Prompt', sans-serif");
  }, []);

  // Handle font selection: Instant live update + local and cookie persistence
  const handleSelectFont = (font: FontOption) => {
    setSelectedFontId(font.id);
    applyActiveFont(font.family);
    try {
      localStorage.setItem(STORAGE_KEY, font.id);
      // Save to document.cookie (1-year expiration, SameSite=Lax)
      document.cookie = `artroom_selected_font=${encodeURIComponent(font.id)}; path=/; max-age=31536000; SameSite=Lax`;
    } catch (e) {
      console.warn("Could not save font to storage:", e);
    }
  };

  // Reset to default Prompt
  const handleReset = () => {
    const defaultFont = FONTS_LIST[0];
    handleSelectFont(defaultFont);
  };

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on ESC
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const currentFont = FONTS_LIST.find((f) => f.id === selectedFontId) || FONTS_LIST[0];

  const filteredFonts = activeTab === "ทั้งหมด" 
    ? FONTS_LIST 
    : FONTS_LIST.filter(f => f.category === activeTab);

  return (
    <div ref={dropdownRef} className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-50 select-none">
      {/* 1. Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center gap-2 sm:gap-2.5 px-3 py-2.5 sm:px-4 sm:py-3 rounded-full shadow-lg transition-all duration-300 cursor-pointer active:scale-95 border backdrop-blur-md ${
          isOpen
            ? "bg-slate-900 text-white border-slate-700 shadow-slate-900/30 scale-105"
            : "bg-white/95 hover:bg-white text-slate-800 border-slate-200/90 shadow-slate-300/40 hover:shadow-xl hover:border-orange-300"
        }`}
        title="คลิกเพื่อสลับฟอนต์ของเว็บไซต์แบบเรียลไทม์"
        aria-label="เปลี่ยนฟอนต์เว็บไซต์"
      >
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xs group-hover:rotate-12 transition-transform">
          <Type className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </div>

        <div className="text-left leading-none pr-1">
          <span className="block text-[9px] sm:text-[10px] font-medium text-slate-400 uppercase tracking-wider">
            ฟอนต์เว็บ
          </span>
          <span className="block text-xs font-bold text-slate-800 group-hover:text-orange-600 transition-colors mt-0.5 max-w-[85px] sm:max-w-[120px] truncate">
            {currentFont.name.split(" ")[0]}
          </span>
        </div>

        <ChevronUp
          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 transition-transform duration-300 ${
            isOpen ? "rotate-180 text-white" : "group-hover:text-orange-500"
          }`}
        />
      </button>

      {/* 2. Popover Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute bottom-14 sm:bottom-16 left-0 w-[calc(100vw-2rem)] max-w-sm sm:w-96 bg-white/98 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/90 p-4 animate-in fade-in slide-in-from-bottom-3 duration-200 overflow-hidden"
          style={{ maxHeight: "min(72vh, 560px)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-orange-100 text-orange-600">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 leading-tight">
                  เลือกฟอนต์ของเว็บไซต์
                </h3>
                <p className="text-[11px] text-slate-500">
                  คลิกแล้วเปลี่ยนตัวอักษรทันทีทั้งเว็บ 100%
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleReset}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="รีเซ็ตเป็นฟอนต์มาตรฐาน Prompt"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="ปิด"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1 mb-2.5 pb-2 border-b border-slate-100 overflow-x-auto">
            {(["ทั้งหมด", "มาตรฐาน", "วัยรุ่นหัวกลม", "ลายมือ"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab
                    ? "bg-orange-500 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Font List Options (Scrollable) */}
          <div className="space-y-1.5 overflow-y-auto max-h-[52vh] pr-1 -mr-1 py-1">
            {filteredFonts.map((font) => {
              const isSelected = selectedFontId === font.id;
              return (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => handleSelectFont(font)}
                  className={`w-full text-left p-3 rounded-2xl transition-all duration-150 flex items-center justify-between gap-3 cursor-pointer border ${
                    isSelected
                      ? "bg-gradient-to-r from-orange-50 to-amber-50/90 border-orange-300 text-orange-950 shadow-xs ring-2 ring-orange-400/40"
                      : "bg-white hover:bg-slate-50/90 border-slate-100 hover:border-slate-200 text-slate-800"
                  }`}
                >
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 leading-tight">
                        {font.name}
                      </span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${font.tagColor || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                        {font.category}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 truncate">
                      {font.subName}
                    </p>

                    {/* Handwriting Preview Line rendered with its own font */}
                    <div className="pt-1">
                      <span className={`text-base block text-slate-700 leading-snug tracking-wide ${font.previewClass}`}>
                        ศิลปะสร้างสรรค์ ART ROOM 123
                      </span>
                    </div>
                  </div>

                  {/* Active Indicator */}
                  <div className="shrink-0 pl-1">
                    {isSelected ? (
                      <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-slate-200 group-hover:border-slate-300" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer Info */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>บันทึกจำค่าไว้ในเครื่องอัตโนมัติ</span>
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="text-orange-600 hover:text-orange-700 font-semibold hover:underline cursor-pointer"
            >
              คืนค่าเริ่มต้น
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

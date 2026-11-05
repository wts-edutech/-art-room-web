"use client";

import Image from "next/image";
import { Sparkles, Trophy, ChevronRight, HelpCircle, Flame } from "lucide-react";
import { GamificationStats } from "@/lib/gamification";

interface ArtToyCompanionCardProps {
  stats: GamificationStats;
  onOpenGallery: () => void;
}

export default function ArtToyCompanionCard({
  stats,
  onOpenGallery,
}: ArtToyCompanionCardProps) {
  const { currentToy, nextToy, progressPercentToNext, coinsNeededForNext, totalCoins, rankTitle, rankIcon, unlockedAllStages } = stats;

  return (
    <div className={`rounded-2xl border p-4 shadow-sm relative overflow-hidden transition-all group ${
      currentToy.glowEffect 
        ? "bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-rose-500/15 border-amber-300 ring-2 ring-amber-400/30"
        : "bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-rose-500/10 border-amber-200/80"
    }`}>
      {/* Background Decorative Sparkles */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br from-orange-400/20 to-amber-300/20 rounded-full blur-xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        {/* Left: Art Toy Avatar & Identity */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div 
            onClick={onOpenGallery}
            className={`relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden shrink-0 bg-white border-2 shadow-md group-hover:scale-105 transition-transform cursor-pointer ${
              currentToy.glowEffect ? "border-amber-400 ring-4 ring-amber-300/40 animate-pulse" : "border-amber-300"
            }`}
            title="คลิกเพื่อเปิดคลัง Art Toy ศิลปิน"
          >
            <Image
              src={currentToy.image}
              alt={currentToy.name}
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-amber-500/90 text-white text-[9px] font-extrabold shadow-2xs backdrop-blur-xs">
              Lv.{currentToy.level}
            </div>
            {currentToy.glowEffect && (
              <div className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-orange-600/90 text-white text-[8px] font-bold shadow-xs">
                MAX 👑
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentToy.color}`}>
                {currentToy.badge}
              </span>
              <span className="text-[11px] font-bold text-gray-700 bg-white/90 px-2 py-0.5 rounded-full border border-gray-200 shadow-2xs">
                {rankIcon} {rankTitle}
              </span>
            </div>

            <h3 className="text-base font-bold font-kanit text-gray-900 truncate mt-1 flex items-center gap-1.5">
              <span>{currentToy.name}</span>
              {currentToy.glowEffect && (
                <Sparkles className="w-4 h-4 text-amber-500 animate-spin-slow shrink-0" />
              )}
            </h3>

            <p className="text-xs text-gray-500 font-light truncate max-w-xs sm:max-w-md">
              {currentToy.description}
            </p>
          </div>
        </div>

        {/* Right: Coins & Progress to Next Form */}
        <div className="w-full sm:w-auto flex flex-col items-stretch sm:items-end gap-2 shrink-0">
          <div className="flex items-center justify-between sm:justify-end gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs">
              <span className="text-sm">🪙</span>
              <span className="font-extrabold text-sm font-kanit">{totalCoins}</span>
              <span className="text-[10px] font-medium opacity-90">Coins</span>
            </div>

            <button
              type="button"
              onClick={onOpenGallery}
              className="inline-flex items-center gap-1 text-xs font-bold text-orange-700 hover:text-orange-800 bg-orange-100/80 hover:bg-orange-200/80 px-3 py-1.5 rounded-xl border border-orange-200 transition-colors cursor-pointer"
            >
              <span>ดูคลัง Art Toy</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Progress Bar to Next Evolution */}
          {nextToy ? (
            <div className="w-full sm:w-56 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-gray-600">
                <span className="font-medium text-orange-700">ร่างถัดไป: {nextToy.name.split(" ")[0]}</span>
                <span className="font-mono font-bold text-gray-700">{progressPercentToNext}%</span>
              </div>
              <div className="w-full h-2 bg-amber-100/80 rounded-full overflow-hidden border border-amber-200/60 p-[1px]">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentToNext}%` }}
                />
              </div>
              <div className="text-[10px] text-gray-400 text-right">
                ขาดอีก <strong className="text-orange-600 font-bold">{coinsNeededForNext}</strong> Coins เพื่อปลดล็อก
              </div>
            </div>
          ) : (
            <div className="text-xs font-bold text-amber-900 bg-gradient-to-r from-amber-100 to-orange-100 px-3 py-1.5 rounded-xl border border-amber-300 shadow-2xs flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600 animate-bounce" /> 
              <span>พิชิตร่างสุดยอดประจำเทอมแล้ว! 🌟</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

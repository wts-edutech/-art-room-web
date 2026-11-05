"use client";

import { useState } from "react";
import Image from "next/image";
import { 
  X, 
  Sparkles, 
  Trophy, 
  Lock, 
  CheckCircle2, 
  Coins, 
  Palette, 
  HelpCircle,
  ChevronRight,
  Flame
} from "lucide-react";
import { 
  ART_TOY_SERIES, 
  GamificationStats, 
  ArtToyStage,
  ArtToySeries 
} from "@/lib/gamification";

interface ArtToyGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GamificationStats;
  selectedSeriesId: string;
  onSelectSeries: (seriesId: string) => void;
}

export default function ArtToyGalleryModal({
  isOpen,
  onClose,
  stats,
  selectedSeriesId,
  onSelectSeries,
}: ArtToyGalleryModalProps) {
  if (!isOpen) return null;

  const currentSeries = ART_TOY_SERIES[selectedSeriesId] || ART_TOY_SERIES.red;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 via-amber-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
                <Sparkles className="w-6 h-6 animate-spin-slow" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-kanit text-gray-900 flex items-center gap-2">
                  คลัง Art Toy ศิลปิน
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-sans font-bold flex items-center gap-1">
                    🪙 {stats.totalCoins} แต้มสะสม
                  </span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  สะสมเหรียญจากแบบทดสอบและการส่งงานศิลปะ เพื่อปลดล็อกวิวัฒนาการอาร์ตทอย
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-white/80 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Series Switcher Tabs */}
          <div className="flex gap-2 mt-4 pt-2 border-t border-amber-200/50">
            {Object.values(ART_TOY_SERIES).map((series) => {
              const isSelected = series.id === selectedSeriesId;
              return (
                <button
                  key={series.id}
                  onClick={() => onSelectSeries(series.id)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-white text-gray-900 shadow-sm border border-gray-200 font-kanit"
                      : "text-gray-600 hover:bg-white/50"
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${series.accentColor}`} />
                  <span className="truncate">{series.name.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Active Series Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/50 to-orange-50/50 border border-amber-100/80 flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-gray-900 font-kanit">
                {currentSeries.name}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {currentSeries.theme}
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[11px] font-semibold text-orange-600 block">ร่างปัจจุบัน</span>
              <span className="text-xs font-extrabold text-gray-900 font-kanit">
                {stats.currentToy.name}
              </span>
            </div>
          </div>

          {/* Evolution Timeline List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 px-1">
              เส้นทางการเติบโต (Evolution Path)
            </h4>

            {currentSeries.stages.map((stage, idx) => {
              const isUnlocked = stats.totalCoins >= stage.minCoins;
              const isCurrent = stats.currentToy.level === stage.level;

              return (
                <div
                  key={stage.level}
                  className={`relative flex items-center gap-4 p-3.5 sm:p-4 rounded-2xl border transition-all ${
                    isCurrent
                      ? "bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/30 shadow-md"
                      : isUnlocked
                      ? "bg-white border-gray-200 hover:border-gray-300 shadow-2xs"
                      : "bg-gray-50/60 border-dashed border-gray-200 opacity-60"
                  }`}
                >
                  {/* Avatar / Art Toy Image */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shrink-0 bg-white border border-gray-100 shadow-xs flex items-center justify-center">
                    <Image
                      src={stage.image}
                      alt={stage.name}
                      fill
                      className={`object-cover transition-transform duration-300 ${
                        !isUnlocked ? "filter grayscale blur-[1px]" : "hover:scale-105"
                      }`}
                      unoptimized
                    />
                    {!isUnlocked && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                        <Lock className="w-5 h-5 drop-shadow" />
                      </div>
                    )}
                    {isCurrent && (
                      <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-amber-500 text-white text-[9px] font-extrabold shadow-xs">
                        ใช้อยู่
                      </div>
                    )}
                  </div>

                  {/* Stage Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${stage.color}`}>
                        {stage.badge}
                      </span>
                      {isUnlocked ? (
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> ปลดล็อกแล้ว
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                          ต้องใช้ 🪙 {stage.minCoins} Coins
                        </span>
                      )}
                    </div>

                    <h5 className="text-sm sm:text-base font-bold font-kanit text-gray-900 truncate">
                      {stage.name}
                    </h5>
                    <p className="text-xs text-gray-500 font-light line-clamp-2 mt-0.5">
                      {stage.description}
                    </p>
                  </div>

                  {/* Progress Indicator */}
                  <div className="hidden sm:flex flex-col items-end justify-center shrink-0 pl-2">
                    {isUnlocked ? (
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="text-right">
                        <span className="text-[10px] font-semibold text-gray-400 block">ขาดอีก</span>
                        <span className="text-xs font-extrabold text-orange-600 font-mono">
                          {Math.max(0, stage.minCoins - stats.totalCoins)}
                        </span>
                        <span className="text-[9px] text-gray-400 block">แต้ม</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* How to Earn Coins Info */}
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-blue-900 space-y-2">
            <h5 className="text-xs font-bold flex items-center gap-1.5 text-blue-950 font-kanit">
              <HelpCircle className="w-4 h-4 text-blue-600" /> วิธีสะสมแต้ม Art Coins:
            </h5>
            <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside font-light">
              <li>
                <strong className="font-semibold text-blue-900">ทำแบบทดสอบ (Quiz):</strong> ข้อละ 10 Coins (ทำคะแนนเต็มรับโบนัสเพิ่ม +50 Coins)
              </li>
              <li>
                <strong className="font-semibold text-blue-900">ส่งงานศิลปะ (Artwork):</strong> ได้เหรียญตามคะแนนที่ครูประเมิน (เช่น 10 คะแนน = 100 Coins)
              </li>
              <li>
                <strong className="font-semibold text-blue-900">ส่งงานตรงเวลา (On-Time):</strong> รับเหรียญโบนัสความตรงต่อเวลาเพิ่ม +20 Coins
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500 font-light">
            อันดับยศ: <strong className="font-bold text-gray-800">{stats.rankIcon} {stats.rankTitle}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-sm cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}


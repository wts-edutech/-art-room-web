"use client";

import React, { useEffect } from "react";
import { Sparkles, HeartHandshake, X } from "lucide-react";
import { PROFANITY_ALERT_MESSAGE } from "@/lib/profanity-filter";

interface ProfanityAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export default function ProfanityAlertModal({
  isOpen,
  onClose,
  message = PROFANITY_ALERT_MESSAGE,
}: ProfanityAlertModalProps) {
  // Listen for Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Modal Container */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="profanity-modal-title"
        className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-rose-100/90 text-center overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-rose-100/40 to-amber-100/20 rounded-full blur-2xl pointer-events-none -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-amber-100/30 to-orange-100/20 rounded-full blur-2xl pointer-events-none -ml-16 -mb-16" />

        {/* Close Icon Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors cursor-pointer"
          title="ปิดหน้าต่าง"
        >
          <X className="w-4 h-4" />
        </button>

        {/* SweetAlert-style Gentle Animated Icon */}
        <div className="relative mx-auto mb-4 w-18 h-18 rounded-full bg-gradient-to-tr from-rose-50 to-amber-50 border-2 border-rose-200/80 flex items-center justify-center shadow-xs">
          <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-rose-500 to-orange-400 text-white flex items-center justify-center shadow-md shadow-rose-500/25">
            <HeartHandshake className="w-7 h-7" />
          </div>
          {/* Subtle sparkle decoration */}
          <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Title */}
        <h3 
          id="profanity-modal-title"
          className="text-lg sm:text-xl font-black text-gray-900 tracking-tight mb-3"
        >
          เพื่อบรรยากาศการเรียนรู้ที่ดี 🎨✨
        </h3>

        {/* Polite Notice Message */}
        <p className="text-xs sm:text-[13.5px] text-gray-700 leading-relaxed font-normal bg-rose-50/60 border border-rose-100/80 rounded-2xl p-4 mb-4 text-left sm:text-center">
          {message}
        </p>

        {/* Friendly Sub-encouragement */}
        <p className="text-[11px] sm:text-xs text-gray-400 font-light mb-6">
          ศิลปะงอกงามจากพลังบวกและมิตรภาพ ร่วมกันส่งต่อถ้อยคำดีๆ ให้เพื่อนๆ และคุณครูกันนะคะ
        </p>

        {/* Action Button */}
        <button
          type="button"
          onClick={onClose}
          autoFocus
          className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 hover:from-rose-600 hover:via-orange-600 hover:to-amber-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-orange-500/25 active:scale-98 transition-all cursor-pointer"
        >
          เข้าใจแล้ว ปรับแก้ข้อความ
        </button>
      </div>
    </div>
  );
}

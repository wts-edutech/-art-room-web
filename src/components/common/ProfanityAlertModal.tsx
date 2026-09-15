"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen for Escape key and lock body scroll
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div 
      style={{ zIndex: 999999 }}
      className="fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      {/* Backdrop overlay clickable to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container - Clean & Minimal */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="profanity-modal-title"
        style={{ zIndex: 1000000 }}
        className="relative w-full max-w-md bg-white rounded-2xl p-6 sm:p-7 shadow-2xl border border-gray-200/80 text-center animate-in zoom-in-95 duration-150"
      >
        {/* Close Icon Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-xl transition-colors cursor-pointer"
          title="ปิดหน้าต่าง"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Minimal Clean Icon */}
        <div className="w-13 h-13 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-3.5 shadow-2xs">
          <HeartHandshake className="w-6 h-6" />
        </div>

        {/* Title */}
        <h3 
          id="profanity-modal-title"
          className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight mb-3.5"
        >
          แจ้งเตือนการใช้ถ้อยคำ
        </h3>

        {/* Notice Message Box - High Contrast & Easy to Read */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-5 mb-5 text-center">
          <p className="text-sm sm:text-[15px] font-normal text-gray-800 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Action Button - Solid, Clear, High-Contrast */}
        <button
          type="button"
          onClick={onClose}
          autoFocus
          className="w-full py-3 px-6 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-sm sm:text-base font-bold shadow-sm transition-all active:scale-98 cursor-pointer"
        >
          เข้าใจแล้ว ปรับแก้ข้อความ
        </button>
      </div>
    </div>,
    document.body
  );
}

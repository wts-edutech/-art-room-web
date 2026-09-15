"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { HeartHandshake, X } from "lucide-react";
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
      className="fixed inset-0 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-150"
    >
      {/* Backdrop overlay clickable to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card - Clean, Elegant & Minimalist */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="profanity-modal-title"
        style={{ zIndex: 1000000 }}
        className="relative w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 text-center animate-in zoom-in-95 duration-150"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors cursor-pointer outline-none"
          title="ปิดหน้าต่าง"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Minimal Circle Icon Badge */}
        <div 
          style={{ width: "52px", height: "52px" }}
          className="rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-3.5 shrink-0"
        >
          <HeartHandshake className="w-6 h-6 stroke-[2]" />
        </div>

        {/* Title */}
        <h3 
          id="profanity-modal-title"
          className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight mb-2.5"
        >
          เพื่อบรรยากาศการเรียนรู้ที่ดี
        </h3>

        {/* Message Content - Clean, Breathable, Easy to Read */}
        <div className="bg-amber-50/40 rounded-2xl p-4 sm:p-5 mb-6 border border-amber-100/70 text-center">
          <p className="text-sm sm:text-[14.5px] font-normal text-gray-700 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Action Button - Soft, Modern, No Harsh Outlines */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 px-6 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-sm sm:text-base font-semibold shadow-xs hover:shadow transition-all outline-none focus:outline-none focus:ring-2 focus:ring-orange-400/40 cursor-pointer active:scale-98"
        >
          เข้าใจแล้ว ปรับแก้ข้อความ
        </button>
      </div>
    </div>,
    document.body
  );
}

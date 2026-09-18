"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";

interface HomeWelcomePopupProps {
  /** Optional override to force open modal */
  forceOpen?: boolean;
}

export default function HomeWelcomePopup({ forceOpen }: HomeWelcomePopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowToday, setDontShowToday] = useState(false);
  const [userState, setUserState] = useState<{
    isLoggedIn: boolean;
    name: string;
    role: string;
    studentId?: string;
    classroom?: string;
  }>({
    isLoggedIn: false,
    name: "",
    role: "",
  });

  const checkUserData = () => {
    if (typeof window === "undefined") return;
    const name = localStorage.getItem("artroom_author_name") || "";
    const role = localStorage.getItem("artroom_role") || "";
    const studentId = localStorage.getItem("artroom_student_id") || "";
    const classroom = localStorage.getItem("artroom_classroom") || "";

    setUserState({
      isLoggedIn: Boolean(name && (role === "student" || role === "guest" || studentId)),
      name,
      role,
      studentId,
      classroom,
    });
  };

  useEffect(() => {
    checkUserData();

    // Check if user dismissed it for today
    const dismissedUntil = localStorage.getItem("artroom_welcome_popup_dismissed_until");
    const isDismissed = dismissedUntil && Date.now() < Number(dismissedUntil);

    // Check query params if just logged in (e.g. ?welcome=1)
    const urlParams = new URLSearchParams(window.location.search);
    const hasWelcomeParam = urlParams.get("welcome") === "1" || urlParams.get("login") === "success";

    if (forceOpen || hasWelcomeParam || !isDismissed) {
      // Clean smooth popup appearance
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 400);
      return () => clearTimeout(timer);
    }

    // Global event listener to trigger popup manually if needed
    const handleOpenEvent = () => {
      checkUserData();
      setIsOpen(true);
    };

    window.addEventListener("openHomeWelcomePopup", handleOpenEvent);
    return () => {
      window.removeEventListener("openHomeWelcomePopup", handleOpenEvent);
    };
  }, [forceOpen]);

  const handleClose = () => {
    if (dontShowToday) {
      // 24 hours expiry in ms
      const expiry = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem("artroom_welcome_popup_dismissed_until", String(expiry));
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 bg-black/45 backdrop-blur-[2px] animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
    >
      {/* Click outside to close */}
      <div 
        className="fixed inset-0" 
        onClick={handleClose} 
        aria-label="ปิดหน้าต่าง" 
      />

      {/* Main insKru-Style Cute Popup Card */}
      <div className="relative w-full max-w-[430px] bg-white rounded-[28px] sm:rounded-[32px] shadow-2xl p-6 sm:p-8 z-10 animate-in zoom-in-95 duration-300 text-center font-['Mali',cursive,sans-serif] select-none border border-gray-100/80">
        
        {/* Subtle Close '✕' Button at top-right */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors p-1.5 rounded-full hover:bg-gray-100"
          aria-label="ปิด"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" strokeWidth={2} />
        </button>

        {/* 1. Top School Emblem */}
        <div className="flex justify-center pt-1 mb-2.5">
          <img 
            src="/school-logo.png" 
            alt="ตราโรงเรียนวชิรธรรมสาธิต" 
            className="w-14 h-14 sm:w-16 sm:h-16 object-contain hover:scale-105 transition-transform drop-shadow-xs"
          />
        </div>

        {/* 2. Cute Headline */}
        <h2 className="text-base sm:text-[19px] font-bold text-gray-800 tracking-tight leading-snug px-2 mb-2 font-['Mali',cursive,sans-serif]">
          {userState.isLoggedIn ? (
            <span>ยินดีต้อนรับสู่ห้องเรียนศิลปะ ART ROOM</span>
          ) : (
            <span>ยินดีต้อนรับสู่ห้องเรียนศิลปะ ART ROOM</span>
          )}
        </h2>

        {/* 3. Cute Cartoon Kids Art Illustration */}
        <div className="my-2.5 sm:my-3.5 flex justify-center">
          <div className="w-56 sm:w-64 max-w-full overflow-hidden rounded-2xl bg-white">
            <img
              src="/images/cute-art-welcome.jpg"
              alt="เด็กๆ วาดภาพศิลปะอย่างมีความสุข"
              className="w-full h-auto object-contain hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        {/* 4. Subtitle / Friendly Message */}
        <div className="text-xs sm:text-[13.5px] text-gray-600 leading-relaxed font-normal max-w-xs mx-auto mb-5 font-['Mali',cursive,sans-serif]">
          {userState.isLoggedIn ? (
            <p>
              สวัสดีจ้า <strong className="text-gray-800 font-bold">{userState.name || "นักเรียน ว.ธ."}</strong> {userState.classroom ? `(${userState.classroom})` : ""} ✨<br />
              พร้อมมาร่วมสนุกและสร้างสรรค์ผลงานศิลปะชิ้นเอกแล้วหรือยัง?
            </p>
          ) : (
            <p>
              เรียนรู้เทคนิคสีน้ำ สีไม้ สีโปสเตอร์ และวาดเส้น EE<br />
              ส่งงานและทำแบบทดสอบออนไลน์ได้ง่ายๆ ที่นี่เลย!
            </p>
          )}

          {/* เส้นแบ่งด้านบนชื่อผู้ออกแบบ */}
          <div className="w-44 sm:w-52 border-t border-gray-200 mx-auto my-2.5" />

          <p className="text-[11.5px] sm:text-xs text-gray-500 font-medium">
            ออกแบบและพัฒนาเว็บไซต์โดย นางสาวสีวลี ยืนยาว
          </p>
        </div>

        {/* 5. Golden-Yellow Pill Action Button */}
        <div className="flex flex-col items-center gap-2">
          {userState.isLoggedIn ? (
            <Link
              href="/materials"
              onClick={handleClose}
              className="w-auto inline-flex items-center justify-center px-8 sm:px-10 py-2.5 sm:py-3 rounded-full bg-[#FFB703] hover:bg-[#FFA200] active:scale-95 text-[#2B1700] text-sm sm:text-base font-bold shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <span>ไปลุยห้องเรียนศิลปะกันเลย</span>
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={handleClose}
              className="w-auto inline-flex items-center justify-center px-8 sm:px-10 py-2.5 sm:py-3 rounded-full bg-[#FFB703] hover:bg-[#FFA200] active:scale-95 text-[#2B1700] text-sm sm:text-base font-bold shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <span>เข้าสู่ระบบห้องเรียนศิลปะ</span>
            </Link>
          )}

          {/* Secondary Dismiss Link for Guests */}
          {!userState.isLoggedIn && (
            <button
              type="button"
              onClick={handleClose}
              className="text-[11px] sm:text-xs text-gray-400 hover:text-gray-600 underline mt-1 transition-colors cursor-pointer"
            >
              เข้าชมเว็บไซต์โดยไม่ต้องเข้าสู่ระบบ
            </button>
          )}
        </div>

        {/* 6. Subtle "Don't show again today" Checkbox */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-center">
          <label className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-400 cursor-pointer select-none hover:text-gray-600 transition-colors">
            <input
              type="checkbox"
              checked={dontShowToday}
              onChange={(e) => setDontShowToday(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-[#FFB703] border-gray-300 focus:ring-[#FFB703] cursor-pointer"
            />
            <span>ไม่ต้องแสดงป๊อปอัปนี้อีกในวันนี้</span>
          </label>
        </div>

      </div>
    </div>
  );
}

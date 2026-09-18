"use client";

import { useRouter } from "next/navigation";
import { Lock, ArrowLeft, LogIn } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface GuestBlockModalProps {
  redirectPath?: string;
  title?: string;
  description?: string;
  instruction?: string;
  badgeText?: string;
}

export default function GuestBlockModal({ 
  redirectPath = "/materials",
  title = "พื้นที่เฉพาะนักเรียน",
  description = "คลังสื่อการสอนและเอกสารใบงานเปิดให้เข้าใช้งานเฉพาะบัญชีนักเรียน โรงเรียนวชิรธรรมสาธิต เท่านั้น",
  instruction = "กรุณาเข้าสู่ระบบด้วยรหัสประจำตัวนักเรียน 5 หลัก เพื่อเข้าถึงเนื้อหาบทเรียนและใบงาน",
  badgeText = "สงวนสิทธิ์เฉพาะนักเรียน"
}: GuestBlockModalProps) {
  const router = useRouter();

  const handleSwitchToStudent = () => {
    router.push(`/login?tab=student&redirect=${encodeURIComponent(redirectPath)}&notice=student_only`);
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFA]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 pt-28 pb-16">
        {/* Compact & Elegant Card */}
        <div className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-7 border border-zinc-200/90 shadow-lg shadow-zinc-900/5 text-center transition-all">
          
          {/* Subtle Icon */}
          <div className="mx-auto w-12 h-12 rounded-2xl bg-zinc-100 border border-zinc-200/80 flex items-center justify-center text-zinc-700 mb-4 shadow-xs">
            <Lock className="w-5 h-5 text-zinc-700" />
          </div>

          {/* Status Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-[11px] font-medium tracking-wide mb-2.5 border border-zinc-200/60">
            <span>{badgeText}</span>
          </div>

          {/* Heading */}
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight mb-2">
            {title}
          </h1>

          {/* Description */}
          <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed font-normal mb-5 max-w-sm mx-auto">
            {description}
          </p>

          {/* Clean Account Status Box */}
          <div className="bg-zinc-50/80 border border-zinc-200/80 rounded-xl p-3.5 text-xs text-left mb-5 space-y-1.5">
            <div className="flex items-center justify-between text-zinc-500 pb-1.5 border-b border-zinc-200/60 text-[11px]">
              <span>สถานะบัญชีปัจจุบัน:</span>
              <span className="font-semibold text-zinc-700">บุคคลทั่วไป (Guest)</span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed pt-0.5">
              {instruction}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleGoHome}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              กลับหน้าหลัก
            </button>
            <button
              onClick={handleSwitchToStudent}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-medium shadow-sm transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              เข้าสู่ระบบนักเรียน
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

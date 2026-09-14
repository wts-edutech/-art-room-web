"use client";

import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowLeft, LogIn, Sparkles } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface GuestBlockModalProps {
  redirectPath?: string;
}

export default function GuestBlockModal({ redirectPath = "/materials" }: GuestBlockModalProps) {
  const router = useRouter();

  const handleSwitchToStudent = () => {
    router.push(`/login?tab=student&redirect=${encodeURIComponent(redirectPath)}&notice=student_only`);
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF8]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 pt-32 pb-24">
        {/* Modal Backdrop Card */}
        <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/80 shadow-2xl shadow-amber-500/10 text-center overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute -top-20 -left-20 w-48 h-48 bg-amber-200/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-red-200/30 rounded-full blur-3xl pointer-events-none" />

          {/* Icon Badge */}
          <div className="relative mx-auto w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-red-500 p-0.5 shadow-lg shadow-amber-500/25 mb-6">
            <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center">
              <ShieldAlert className="w-10 h-10 text-amber-600" />
            </div>
            <div className="absolute -top-1 -right-1 p-1 bg-amber-400 rounded-full text-white shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Title & Tag */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-3">
            <span>🔒 เฉพาะนักเรียนเท่านั้น</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3 tracking-tight">
            สิทธิ์การเข้าถึงจำกัด
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6 font-light">
            คลังสื่อการสอน วิดีทัศน์ และศูนย์ดาวน์โหลดใบงาน PDF 
            สงวนสิทธิ์เปิดให้เข้าใช้งานเฉพาะ <span className="font-semibold text-gray-900">บัญชีนักเรียน</span> เท่านั้น 
            เนื่องจากขณะนี้คุณกำลังเข้าสู่ระบบในฐานะ <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">บุคคลทั่วไป (Guest)</span>
          </p>

          {/* Instruction Box */}
          <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-4 text-xs sm:text-sm text-amber-900 text-left mb-6 space-y-1.5">
            <p className="font-bold flex items-center gap-1.5">
              💡 วิธีเข้าใช้งานสำหรับนักเรียน:
            </p>
            <ul className="list-disc list-inside space-y-1 text-amber-800/90 pl-1">
              <li>คลิกปุ่ม <strong>"สลับเข้าสู่ระบบด้วยรหัสนักเรียน"</strong> ด้านล่าง</li>
              <li>กรอกรหัสประจำตัวนักเรียน 5 หลัก (เช่น 50001)</li>
              <li>ใช้รหัสผ่านรูปแบบ <code className="bg-white/80 px-1.5 py-0.5 rounded border border-amber-200 font-mono text-xs">[รหัสนักเรียน]@wts</code></li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleGoHome}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              กลับสู่หน้าหลัก
            </button>
            <button
              onClick={handleSwitchToStudent}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white text-sm font-bold shadow-md shadow-red-500/20 transition-all cursor-pointer scale-[1.01]"
            >
              <LogIn className="w-4 h-4" />
              สลับเป็นบัญชีนักเรียน
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home, MessageSquare } from "lucide-react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Art Room Root Error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] w-full flex items-center justify-center p-4 sm:p-6 select-none">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-xl text-center relative overflow-hidden">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-red-500" />

        {/* Error icon */}
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-6 shadow-xs border border-red-100">
          <AlertTriangle className="w-8 h-8" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold font-heading text-gray-900 mb-2">
          เกิดข้อผิดพลาดในการแสดงผล
        </h2>
        <p className="text-gray-500 text-sm font-light mb-6 leading-relaxed">
          ระบบพบข้อขัดข้องชั่วคราว คุณสามารถกดปุ่มเพื่อลองใหม่อีกครั้ง หรือกลับไปที่หน้าหลัก
        </p>

        {error.digest && (
          <div className="mb-6 p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-[11px] font-mono text-gray-400 truncate">
            รหัสอ้างอิง: {error.digest}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md shadow-red-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>ลองใหม่อีกครั้ง</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm active:scale-95 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>กลับหน้าหลัก</span>
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 text-xs text-gray-400">
          <span>มีปัญหาการใช้งาน? </span>
          <Link
            href="/contact"
            className="text-red-600 font-medium hover:underline inline-flex items-center gap-1"
          >
            <MessageSquare className="w-3 h-3 inline" />
            ติดต่อผู้ดูแลห้องเรียน
          </Link>
        </div>
      </div>
    </div>
  );
}

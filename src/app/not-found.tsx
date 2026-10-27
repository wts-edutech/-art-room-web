import Link from "next/link";
import { Palette, Home, BookOpen, Upload, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] w-full flex items-center justify-center p-4 sm:p-6 select-none">
      <div className="max-w-lg w-full bg-white/90 backdrop-blur-md rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-xl text-center relative overflow-hidden">
        {/* Decorative background gradient */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-red-100/50 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-rose-100/50 rounded-full blur-2xl pointer-events-none" />

        {/* 404 Headline */}
        <div className="relative mb-6">
          <span className="text-7xl sm:text-8xl font-black font-heading text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 leading-none">
            404
          </span>
          <div className="w-12 h-12 rounded-2xl bg-white shadow-md border border-gray-100 flex items-center justify-center absolute -top-2 -right-2 mx-auto rotate-12">
            <Palette className="w-6 h-6 text-red-500" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-gray-900 mb-3">
          ไม่พบหน้าที่คุณต้องการ
        </h1>
        <p className="text-gray-500 text-sm sm:text-base font-light mb-8 leading-relaxed max-w-sm mx-auto">
          หน้าที่คุณกำลังค้นหาอาจถูกย้าย เปลี่ยนชื่อ หรือไม่มีอยู่ในระบบ Art Room แล้ว
        </p>

        {/* Main Action */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-600/25 active:scale-95 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>กลับสู่หน้าแรก</span>
          </Link>
          <Link
            href="/materials"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm active:scale-95 transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span>คลังสื่อการสอน</span>
          </Link>
        </div>

        {/* Quick Links */}
        <div className="pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400 mb-3 font-medium">เมนูยอดนิยมที่อาจสนใจ</p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <Link
              href="/artworks"
              className="px-3 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
            >
              🎨 ผลงานนักเรียน
            </Link>
            <Link
              href="/submissions"
              className="px-3 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
            >
              📤 ส่งงานศิลปะ
            </Link>
            <Link
              href="/ideas"
              className="px-3 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
            >
              💡 ห้องสมุดไอเดีย
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

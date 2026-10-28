"use client";

import Link from "next/link";
import { BookOpen, Upload, Palette, Lightbulb, Trophy, Sparkles } from "lucide-react";

export default function QuickMenuSection() {
  const quickLinks = [
    {
      title: "สื่อการสอน",
      subtitle: "คลิป & ใบงาน",
      href: "/materials",
      icon: <BookOpen className="w-5 h-5 text-blue-600" />,
      bg: "bg-blue-50/90 group-hover:bg-blue-100/90 border-blue-100",
      accent: "text-blue-600",
    },
    {
      title: "ส่งงาน",
      subtitle: "อัปโหลดการบ้าน",
      href: "/submissions",
      icon: <Upload className="w-5 h-5 text-orange-600" />,
      bg: "bg-orange-50/90 group-hover:bg-orange-100/90 border-orange-100",
      accent: "text-orange-600",
      badge: "NEW",
    },
    {
      title: "ผลงานนักเรียน",
      subtitle: "แกลเลอรีสร้างสรรค์",
      href: "/artworks",
      icon: <Palette className="w-5 h-5 text-rose-600" />,
      bg: "bg-rose-50/90 group-hover:bg-rose-100/90 border-rose-100",
      accent: "text-rose-600",
    },
    {
      title: "รางวัลชนะเลิศ",
      subtitle: "เกียรติยศนักเรียน",
      href: "/awards",
      icon: <Trophy className="w-5 h-5 text-amber-600" />,
      bg: "bg-amber-50/90 group-hover:bg-amber-100/90 border-amber-100",
      accent: "text-amber-600",
    },
    {
      title: "แชร์ไอเดีย",
      subtitle: "ชุมชนศิลปะ",
      href: "/ideas",
      icon: <Lightbulb className="w-5 h-5 text-emerald-600" />,
      bg: "bg-emerald-50/90 group-hover:bg-emerald-100/90 border-emerald-100",
      accent: "text-emerald-600",
    },
  ];

  return (
    <section className="w-full px-4 sm:px-6 py-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <h2 className="text-xs sm:text-sm font-bold text-gray-700 tracking-wide font-heading uppercase">
            เมนูลัดเข้าถึงด่วน (Quick Access)
          </h2>
        </div>
        <span className="text-[11px] text-gray-400 font-medium hidden sm:inline-block">
          คลิกเพื่อไปยังส่วนที่ต้องการทันที
        </span>
      </div>

      {/* Responsive Horizontal Scroll on Mobile, Clean Grid on Tablet/Desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3.5">
        {quickLinks.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className="flex flex-col sm:flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-100 shadow-xs hover:shadow-md hover:-translate-y-1 active:scale-95 transition-all duration-200 group cursor-pointer relative overflow-hidden"
          >
            {item.badge && (
              <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-gradient-to-r from-red-600 to-rose-600 text-white text-[8px] font-black rounded-full border border-white shadow-2xs">
                {item.badge}
              </span>
            )}

            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-2xs transition-transform duration-300 group-hover:scale-110 mb-2 ${item.bg}`}
            >
              {item.icon}
            </div>

            <span className="text-xs sm:text-sm font-bold text-gray-800 text-center leading-tight truncate w-full group-hover:text-red-600 transition-colors">
              {item.title}
            </span>
            <span className="text-[10px] text-gray-400 text-center leading-tight mt-0.5 truncate w-full font-light">
              {item.subtitle}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

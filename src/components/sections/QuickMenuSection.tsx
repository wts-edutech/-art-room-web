"use client";

import Link from "next/link";
import { BookOpen, Upload, Palette, Lightbulb } from "lucide-react";

export default function QuickMenuSection() {
  const quickLinks = [
    {
      title: "สื่อการสอน",
      href: "/materials",
      icon: <BookOpen className="w-5 h-5 text-blue-600" />,
      bg: "bg-blue-50 hover:bg-blue-100/80 border-blue-100/80",
    },
    {
      title: "ส่งงาน",
      href: "/submissions",
      icon: <Upload className="w-5 h-5 text-orange-600" />,
      bg: "bg-orange-50 hover:bg-orange-100/80 border-orange-100/80",
      badge: "NEW",
    },
    {
      title: "ผลงานนักเรียน",
      href: "/artworks",
      icon: <Palette className="w-5 h-5 text-rose-600" />,
      bg: "bg-rose-50 hover:bg-rose-100/80 border-rose-100/80",
    },
    {
      title: "แชร์ไอเดีย",
      href: "/ideas",
      icon: <Lightbulb className="w-5 h-5 text-amber-600" />,
      bg: "bg-amber-50 hover:bg-amber-100/80 border-amber-100/80",
    },
  ];

  return (
    <section className="w-full px-4 py-2.5 max-w-lg mx-auto">
      <div className="grid grid-cols-4 gap-2">
        {quickLinks.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className="flex flex-col items-center justify-center p-2 rounded-2xl bg-white border border-gray-100/90 shadow-2xs hover:shadow-sm active:scale-95 transition-all group cursor-pointer"
          >
            <div className="relative">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-2xs transition-transform group-hover:scale-105 ${item.bg}`}
              >
                {item.icon}
              </div>
              {item.badge && (
                <span className="absolute -top-1 -right-1.5 px-1 py-[0.5px] bg-red-500 text-white text-[7.5px] font-black rounded-full border border-white shadow-2xs">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[11px] font-medium text-gray-700 mt-1.5 leading-tight truncate text-center w-full">
              {item.title}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

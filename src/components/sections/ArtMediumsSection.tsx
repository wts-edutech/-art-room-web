"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

export default function ArtMediumsSection() {
  const mediums = [
    {
      title: "จิตรกรรมสีน้ำ",
      englishTitle: "Watercolor Painting",
      description: "เทคนิคการระบายสีน้ำแบบโปร่งแสง สร้างความนุ่มนวลและมิติแห่งจินตนาการ",
      techniques: ["ระบายเปียกบนเปียก (Wet-on-Wet)", "ระบายเปียกบนแห้ง (Wet-on-Dry)", "การเว้นขาวและเกลี่ยน้ำหนัก"],
      color: "from-rose-500 to-red-600",
      lightBg: "bg-rose-50/80 border-rose-200/80",
      badgeColor: "bg-rose-100 text-rose-700",
      icon: "🎨",
      categoryParam: "watercolor",
    },
    {
      title: "จิตรกรรมสีไม้",
      englishTitle: "Colored Pencil Art",
      description: "ศิลปะการลงน้ำหนักและเกลี่ยสีไม้ด้วยความประณีต ให้รายละเอียดคมชัดเสมือนจริง",
      techniques: ["การไล่น้ำหนัก 7 ระดับ", "การสานเส้นไขว้ (Cross-Hatching)", "การผสมผสานวรรณะสี"],
      color: "from-amber-500 to-orange-600",
      lightBg: "bg-amber-50/80 border-amber-200/80",
      badgeColor: "bg-amber-100 text-amber-700",
      icon: "✏️",
      categoryParam: "colored_pencil",
    },
    {
      title: "จิตรกรรมสีโปสเตอร์",
      englishTitle: "Poster Color Art",
      description: "การใช้สีทึบแสงสร้างสรรค์งานกราฟิกและภาพประกอบ สีสันสดใส ชัดเจน โดดเด่น",
      techniques: ["การระบายสีเรียบเนียน (Flat Wash)", "ทฤษฎีวงล้อสีและการจับคู่สี", "การจัดองค์ประกอบภาพ"],
      color: "from-blue-600 to-indigo-600",
      lightBg: "bg-blue-50/80 border-blue-200/80",
      badgeColor: "bg-blue-100 text-blue-700",
      icon: "🖌️",
      categoryParam: "poster_color",
    },
    {
      title: "วาดเส้นด้วยดินสอ EE",
      englishTitle: "Pencil Drawing & Shading",
      description: "พื้นฐานสำคัญของงานศิลปะทุกแขนง ฝึกทักษะการมองสัดส่วน แสงเงา และระยะทัศนียภาพ",
      techniques: ["การจับดินสอ EE อย่างถูกวิธี", "การแรเงาน้ำหนักแสงและเงา", "ทัศนียภาพ (Perspective 1 & 2 จุด)"],
      color: "from-slate-700 to-gray-900",
      lightBg: "bg-slate-50/80 border-slate-200/80",
      badgeColor: "bg-slate-200 text-slate-800",
      icon: "📐",
      categoryParam: "drawing_ee",
    },
  ];

  return (
    <section className="py-14 sm:py-20 bg-transparent">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-semibold mb-3 border border-red-100 select-none">
              <Sparkles className="w-3.5 h-3.5" />
              <span>หลักสูตรสื่อการสอน 4 ทักษะหลัก</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black font-heading text-gray-900 tracking-tight">
              ค้นพบสไตล์ศิลปะ<span className="text-red-600">ที่คุณชื่นชอบ</span>
            </h2>
            <p className="text-gray-600 text-sm sm:text-lg mt-2 font-normal">
              เรียนรู้ผ่านวิดีโอสาธิตขั้นตอนทีละสเต็ป พร้อมใบงานสำหรับฝึกฝนด้วยตัวเอง
            </p>
          </div>

          <Link
            href="/materials"
            className="inline-flex items-center gap-2 text-sm sm:text-base font-bold text-red-600 hover:text-red-700 group shrink-0"
          >
            <span>ดูสื่อการสอนทั้งหมด</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Swipeable on mobile with snap scroll, Grid on tablet & desktop */}
        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 overflow-x-auto pb-4 md:pb-0 snap-x snap-mandatory scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {mediums.map((item, index) => (
            <div
              key={index}
              className={`min-w-[280px] sm:min-w-[320px] md:min-w-0 snap-center rounded-3xl p-5 sm:p-6 bg-white/95 backdrop-blur-md border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden`}
            >
              {/* Subtle accent glow line at top */}
              <div className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${item.color}`} />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl select-none">{item.icon}</span>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${item.badgeColor} uppercase tracking-wider`}>
                    {item.englishTitle.split(" ")[0]}
                  </span>
                </div>

                <h3 className="text-xl font-black font-heading text-gray-900 mb-0.5 group-hover:text-red-600 transition-colors">
                  {item.title}
                </h3>
                <span className="text-[11px] text-gray-400 font-medium block mb-3">
                  {item.englishTitle}
                </span>

                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-4 font-light">
                  {item.description}
                </p>

                {/* Technique bullets */}
                <div className="space-y-1.5 mb-6 pt-3 border-t border-gray-100">
                  {item.techniques.map((tech, tIdx) => (
                    <div key={tIdx} className="flex items-center gap-2 text-[11px] sm:text-xs text-gray-600 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span className="truncate">{tech}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href="/materials"
                className="w-full py-2.5 px-4 rounded-xl bg-gray-50 hover:bg-red-50 group-hover:bg-red-600 text-gray-700 group-hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 shadow-2xs"
              >
                <span>เข้าสู่บทเรียน</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

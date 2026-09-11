"use client";

import { useState } from "react";
import { Info, ChevronDown, ChevronUp, Image as ImageIcon, Smartphone, Square, CheckCircle2 } from "lucide-react";

export default function PRImageGuide() {
  const [isOpen, setIsOpen] = useState(true);

  const guides = [
    {
      title: "ภาพ Banner หัวข้อข่าว (Hero Image)",
      size: "1200 x 630 px",
      ratio: "1.91:1 (แนวนอน)",
      icon: ImageIcon,
      color: "from-blue-500 to-indigo-600",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
      previewAspect: "aspect-[1.91/1]",
      benefit: "เป็นขนาดมาตรฐาน 1.91:1 ที่ดีที่สุด เมื่อนำลิงก์ข่าวไปแชร์บน Facebook, LINE หรือ X (Twitter) ภาพพรีวิวจะแสดงผลได้เต็ม สวยงาม ไม่โดนตัดขอบ",
    },
    {
      title: "ภาพโปสเตอร์ / แผ่นพับ PR (Infographic / Poster)",
      size: "1200 x 1600 px (3:4) หรือ 1080 x 1350 px (4:5)",
      ratio: "3:4 หรือ 4:5 (แนวตั้ง)",
      icon: Smartphone,
      color: "from-amber-500 to-orange-600",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
      previewAspect: "aspect-[3/4]",
      benefit: "เหมาะสำหรับภาพแนวตั้งที่มีข้อความรายละเอียดงานเยอะๆ อ่านง่าย สบายตาบนหน้าจอมือถือ",
    },
    {
      title: "ภาพอัลบั้ม / ภาพเล่าเรื่อง (Square)",
      size: "1200 x 1200 px",
      ratio: "1:1 (จัตุรัส)",
      icon: Square,
      color: "from-emerald-500 to-teal-600",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      previewAspect: "aspect-square",
      benefit: "เหมาะสำหรับรูปประกอบเนื้อหาข่าวที่ต้องการเน้นรูปกิจกรรม หรือจัดเรียงเป็นช่องกริดในบทความ",
    },
  ];

  return (
    <div className="bg-gradient-to-br from-slate-50 to-indigo-50/40 rounded-2xl border border-indigo-100/80 p-4 mb-4 shadow-sm overflow-hidden">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between cursor-pointer select-none group"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              ขนาดรูปภาพ PR ที่แนะนำ
              <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                มาตรฐานเว็บ & โซเชียล
              </span>
            </h4>
            <p className="text-xs text-gray-500">คลิกเพื่อ {isOpen ? "ย่อเก็บ" : "ดูคำแนะนำขนาดภาพที่เหมาะสม"}</p>
          </div>
        </div>
        <button 
          type="button"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-white/60 transition-colors"
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 pt-3 border-t border-indigo-100/60 space-y-3">
          {guides.map((g, idx) => {
            const Icon = g.icon;
            return (
              <div 
                key={idx} 
                className="bg-white/90 backdrop-blur-sm rounded-xl p-3 border border-gray-100/80 shadow-xs hover:border-indigo-200 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${g.color} text-white flex items-center justify-center shadow-xs flex-shrink-0`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-gray-900">{g.title}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${g.badgeColor} flex-shrink-0`}>
                    {g.ratio}
                  </span>
                </div>

                <div className="text-xs font-semibold text-indigo-950 bg-indigo-50/50 px-2.5 py-1 rounded-lg mb-1.5 flex items-center gap-1.5">
                  <span className="text-[11px] text-indigo-500 font-normal">ขนาดแนะนำ:</span>
                  <span className="font-mono text-indigo-700 font-bold">{g.size}</span>
                </div>

                <p className="text-[11px] leading-relaxed text-gray-600 flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="font-semibold text-gray-700">ข้อดี: </strong>
                    {g.benefit}
                  </span>
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

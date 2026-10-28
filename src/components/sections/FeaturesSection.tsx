"use client";

import { Palette, Lightbulb, Smile, BookOpen, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function FeaturesSection() {
  const features = [
    {
      title: "เรียนสนุก ไม่เครียด",
      tagline: "Fun & Joyful Learning",
      description: "คลาสเรียนที่ออกแบบมาให้ผู้เรียนได้สนุกกับการปลดปล่อยจินตนาการ ค้นพบตัวเองผ่านศิลปะโดยไม่มีข้อจำกัด",
      icon: <Smile className="w-8 h-8 text-rose-600 transition-transform duration-500 group-hover:scale-110" />,
      color: "bg-rose-50 text-rose-600 group-hover:bg-rose-100",
      borderAccent: "group-hover:border-rose-200",
      gradient: "from-rose-500/10 to-red-500/5",
    },
    {
      title: "เข้าใจง่าย Step-by-Step",
      tagline: "Clear & Simple Tutorials",
      description: "อธิบายเทคนิคและขั้นตอนต่างๆ อย่างละเอียดและเป็นกันเอง เริ่มต้นจากศูนย์ก็สามารถสร้างงานสวยงามได้",
      icon: <Lightbulb className="w-8 h-8 text-amber-500 transition-transform duration-500 group-hover:scale-110" />,
      color: "bg-amber-50 text-amber-600 group-hover:bg-amber-100",
      borderAccent: "group-hover:border-amber-200",
      gradient: "from-amber-500/10 to-yellow-500/5",
    },
    {
      title: "หลากหลาย 4 เทคนิค",
      tagline: "4 Core Art Mediums",
      description: "ครอบคลุมทั้งสีน้ำ สีไม้ สีโปสเตอร์ และวาดเส้นดินสอ EE ตอบโจทย์ความชอบและความถนัดเฉพาะตัว",
      icon: <Palette className="w-8 h-8 text-blue-600 transition-transform duration-500 group-hover:scale-110" />,
      color: "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
      borderAccent: "group-hover:border-blue-200",
      gradient: "from-blue-500/10 to-indigo-500/5",
    },
    {
      title: "สื่อการสอนครบครัน",
      tagline: "Digital Library & Sheets",
      description: "รวบรวมไอเดีย ใบงาน แบบฝึกหัด และระบบส่งการบ้านออนไลน์ ให้ฝึกฝนและพัฒนาฝีมือได้ตลอด 24 ชม.",
      icon: <BookOpen className="w-8 h-8 text-emerald-600 transition-transform duration-500 group-hover:scale-110" />,
      color: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100",
      borderAccent: "group-hover:border-emerald-200",
      gradient: "from-emerald-500/10 to-teal-500/5",
    },
  ];

  return (
    <section id="features" className="py-16 sm:py-24 bg-transparent relative">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-semibold mb-3 border border-red-100 select-none">
            <Sparkles className="w-3.5 h-3.5" />
            <span>จุดเด่นของพื้นที่การเรียนรู้</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black font-heading text-gray-900 mb-4 tracking-tight">
            ทำไมต้องเรียนกับ <span className="text-red-600">Art Room</span>
          </h2>
          <p className="text-gray-600 text-sm sm:text-lg font-light max-w-2xl mx-auto">
            โรงเรียนคุณภาพ บริการด้วยหัวใจ ไม่ทิ้งใครคนใดไว้ข้างหลัง <br className="hidden md:block" />
            เราตั้งใจสร้างสรรค์สื่อการสอนที่ตอบโจทย์และเข้าถึงง่ายสำหรับทุกคน
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 bg-white/95 backdrop-blur-md rounded-3xl overflow-hidden p-6 sm:p-7 flex flex-col justify-between ${feature.borderAccent} relative`}
            >
              {/* Decorative gentle gradient fill on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

              <div className="relative z-10">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-colors duration-300 ${feature.color}`}
                >
                  {feature.icon}
                </div>
                <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase block mb-1">
                  {feature.tagline}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2.5 font-heading">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed font-light">
                  {feature.description}
                </p>
              </div>

              <div className="relative z-10 pt-4 mt-4 border-t border-gray-100 flex items-center text-xs font-semibold text-gray-400 group-hover:text-red-600 transition-colors">
                <span>เรียนรู้เพิ่มเติม</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

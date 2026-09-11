"use client";

import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

export default function NewsSection({ featuredNews }: { featuredNews?: any }) {
  const defaultFeatured = {
    title: "นิทรรศการศิลปกรรมนักเรียนประจำปี ART ROOM ANNUAL EXHIBITION 2026: ปลดปล่อยจินตนาการสู่โลกศิลปะร่วมสมัย",
    excerpt: "กลุ่มสาระการเรียนรู้ศิลปะ โรงเรียนวชิรธรรมสาธิต ขอเชิญชวนครู นักเรียน และผู้ปกครอง ร่วมชมนิทรรศการแสดงผลงานศิลปะยอดเยี่ยมประจำปีการศึกษา 2569 รวบรวมผลงานภาพวาด จิตรกรรม และดิจิทัลอาร์ตกว่า 150 ชิ้น",
    date: "10 พ.ย. 2569",
    source: "กลุ่มสาระฯ ศิลปะ",
    imageUrl: "/images/news/hero-exhibition.jpg",
    url: "/news"
  };

  const item = featuredNews || defaultFeatured;

  return (
    <section className="py-24 bg-transparent">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading text-gray-900 mb-4 tracking-tight">
              ข่าวสารและผลงานเด่น
            </h2>
            <p className="text-gray-600 text-lg font-light">
              อัปเดตเรื่องราวความภาคภูมิใจและผลงานที่โดดเด่นของนักเรียน
            </p>
          </div>
          <Link href="/news" className="inline-flex items-center gap-2 text-(--color-primary-500) font-medium hover:text-(--color-primary-400) transition-colors group">
            ดูข่าวสารทั้งหมด <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Use a div if there is no external URL, otherwise Link */}
          <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col lg:flex-row group-hover:-translate-y-1 relative group">
            
            {/* Image Section - Supports 1.91:1 Banner, 3:4/4:5 Poster, and 1:1 Square */}
            <div className="relative w-full lg:w-1/2 min-h-[280px] sm:min-h-[340px] lg:h-[420px] overflow-hidden bg-gray-950 flex items-center justify-center p-2">
              {/* Ambient backdrop blur */}
              {item.imageUrl && (
                <div 
                  className="absolute inset-0 bg-cover bg-center blur-xl opacity-40 scale-110 pointer-events-none"
                  style={{ backgroundImage: `url(${item.imageUrl})` }}
                />
              )}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10 pointer-events-none"></div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={item.imageUrl} 
                alt={item.title}
                className="relative z-10 max-h-full max-w-full object-contain transform group-hover:scale-105 transition-transform duration-700 ease-out rounded-xl drop-shadow-md"
                onError={(e) => (e.currentTarget.src = "https://placehold.co/1200x630/1e293b/ffffff?text=PR+News")}
              />
              <div className="absolute top-6 left-6 z-20">
                <span className="px-4 py-1.5 bg-black/60 backdrop-blur-md text-white text-sm font-medium rounded-full border border-white/20 shadow-sm">
                  Featured
                </span>
              </div>
            </div>

            {/* Content Section */}
            <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-gradient-to-br from-gray-900 to-black text-white relative overflow-hidden">
              {/* Decorative background circle */}
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors duration-500"></div>

              <div className="flex items-center gap-3 mb-6 text-gray-300 text-sm font-light relative z-10">
                <span className="font-medium text-white">{item.source}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                <span>{item.date}</span>
              </div>

              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold font-heading mb-6 leading-snug group-hover:text-blue-400 transition-colors duration-300 relative z-10">
                {item.title}
              </h3>
              
              <p className="text-gray-300 text-lg leading-relaxed font-light mb-8 line-clamp-4 relative z-10">
                {item.excerpt}
              </p>

              {item.url && (
                <div className="relative z-10">
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 font-medium rounded-xl hover:bg-gray-100 transition-colors shadow-sm">
                    อ่านบทความต้นฉบับ <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

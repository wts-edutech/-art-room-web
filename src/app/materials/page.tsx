"use client";

import { useState, useEffect, Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MaterialsList from "@/components/sections/MaterialsList";
import { DownloadItem } from "@/data/default-downloads";
import { Sparkles, BookOpen, FileText, Loader2 } from "lucide-react";

// In-memory cache for instant subsequent tab/page transitions (zero network lag)
let cachedLessons: any[] | null = null;
let cachedDownloads: DownloadItem[] | null = null;

export default function MaterialsPage() {
  const [allLessons, setAllLessons] = useState<any[]>(cachedLessons || []);
  const [allDownloads, setAllDownloads] = useState<DownloadItem[]>(cachedDownloads || []);
  const [isLoading, setIsLoading] = useState(!cachedLessons || !cachedDownloads);

  useEffect(() => {
    let isMounted = true;

    // Fetch fresh database records with no-store to avoid stale data
    Promise.all([
      fetch("/api/lessons?type=all", { cache: "no-store" })
        .then((res) => res.json())
        .catch(() => []),
      fetch("/api/downloads", { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => {
          if (data && Array.isArray(data.downloads)) return data.downloads;
          if (Array.isArray(data)) return data;
          return [];
        })
        .catch(() => []),
    ]).then(([lessonsData, downloadsData]) => {
      if (!isMounted) return;
      const validLessons = Array.isArray(lessonsData) ? lessonsData : [];
      const validDownloads = Array.isArray(downloadsData) ? downloadsData : [];

      cachedLessons = validLessons;
      cachedDownloads = validDownloads;

      setAllLessons(validLessons);
      setAllDownloads(validDownloads);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const totalLessons = allLessons.length;
  const totalDownloads = allDownloads.length;

  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col pt-20 sm:pt-28 pb-20 sm:pb-24 bg-white">
        {/* Modern Studio Showcase Hero Banner */}
        <section className="relative bg-transparent pt-6 pb-7 sm:pt-12 sm:pb-14 border-b border-gray-100/60">
          <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full bg-red-50/80 text-red-700 text-[11px] sm:text-sm font-bold mb-3 sm:mb-5 shadow-2xs border border-red-100">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
                <span>ศูนย์รวมสื่อการเรียนรู้และใบงานศิลปะ</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-2xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-2 sm:mb-4 tracking-tight leading-tight">
                คลังสื่อการสอน{" "}
                <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 py-0.5 sm:py-1">
                  Art Room
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xs sm:text-lg text-gray-600 font-light leading-relaxed mb-4 sm:mb-8 max-w-2xl mx-auto line-clamp-2 sm:line-clamp-none">
                รวบรวมสื่อวิดีทัศน์ เทคนิคการสร้างสรรค์ผลงานศิลปะ สไลด์การสอน และศูนย์ดาวน์โหลดใบงาน PDF 
                สำหรับนักเรียนทุกระดับชั้น เพื่อการเรียนรู้ทั้งในและนอกห้องเรียน
              </p>

              {/* Formal Fit-to-Text Compact Stats Pills */}
              <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-4 max-w-full mx-auto">
                {/* Lessons Pill */}
                <div className="inline-flex items-center gap-2 sm:gap-3 bg-white px-3.5 sm:px-5 py-1.5 sm:py-2.5 rounded-full border border-gray-300/90 shadow-2xs hover:border-red-300 transition-all">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                    <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <span className="text-[11px] sm:text-sm font-bold text-gray-700 whitespace-nowrap">บทเรียน & วิดีโอ</span>
                  <div className="flex items-center gap-1 bg-red-50 text-red-700 font-extrabold text-xs sm:text-base px-2 sm:px-2.5 py-0.5 rounded-full border border-red-100 min-w-[28px] justify-center">
                    {isLoading && totalLessons === 0 ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      <span>{totalLessons}</span>
                    )}
                    <span className="text-[10px] sm:text-[11px] font-normal text-red-500">รายการ</span>
                  </div>
                </div>

                {/* Downloads Pill */}
                <div className="inline-flex items-center gap-2 sm:gap-3 bg-white px-3.5 sm:px-5 py-1.5 sm:py-2.5 rounded-full border border-gray-300/90 shadow-2xs hover:border-emerald-300 transition-all">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                    <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <span className="text-[11px] sm:text-sm font-bold text-gray-700 whitespace-nowrap">ใบงาน PDF ดาวน์โหลด</span>
                  <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 font-extrabold text-xs sm:text-base px-2 sm:px-2.5 py-0.5 rounded-full border border-emerald-100 min-w-[28px] justify-center">
                    {isLoading && totalDownloads === 0 ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      <span>{totalDownloads}</span>
                    )}
                    <span className="text-[10px] sm:text-[11px] font-normal text-emerald-500">รายการ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Unified Feed Section */}
        <section className="container mx-auto px-4 sm:px-6 max-w-7xl pt-4 sm:pt-10 pb-16">
          {isLoading && totalLessons === 0 && totalDownloads === 0 ? (
            <div className="py-24 text-center text-gray-400">
              <Loader2 className="w-9 h-9 text-red-500 animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-700">กำลังโหลดคลังสื่อการสอนและใบงานล่าสุด...</p>
              <p className="text-xs text-gray-400 mt-1">กำลังดึงข้อมูลสื่อจริงจากระบบ</p>
            </div>
          ) : (
            <Suspense fallback={
              <div className="py-20 text-center text-gray-400">
                <Loader2 className="w-8 h-8 text-red-500 animate-spin mx-auto mb-3" />
                <p className="text-sm font-medium">กำลังเตรียมการแสดงผล...</p>
              </div>
            }>
              <MaterialsList 
                initialLessons={allLessons} 
                initialDownloads={allDownloads}
                basePath="/materials"
              />
            </Suspense>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Medal, Trophy, ArrowRight, Award } from "lucide-react";

export default function AwardsBanner({ awards: initialAwards }: { awards?: any[] }) {
  const [awardsList, setAwardsList] = useState<any[]>(initialAwards || []);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (initialAwards && initialAwards.length > 0) {
      setAwardsList(initialAwards);
      return;
    }

    fetch("/api/awards")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch awards");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setAwardsList(data);
        }
      })
      .catch((err) => {
        console.warn("AwardsBanner fetch error:", err);
      });
  }, [initialAwards]);

  // Filter valid awards (must have title or student)
  const validAwards = awardsList.filter((a) => a && (a.title || a.student));
  
  // Prioritize highlighted awards if any
  const highlights = validAwards.filter((a) => a.isHighlight).length > 0
    ? validAwards.filter((a) => a.isHighlight)
    : validAwards;

  useEffect(() => {
    if (highlights.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % highlights.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [highlights.length]);

  if (highlights.length === 0) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? highlights.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % highlights.length);
  };

  const current = highlights[currentIndex] || highlights[0];

  return (
    <section className="w-full py-10 sm:py-14 bg-transparent relative">
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl relative">
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <h2 className="text-xs sm:text-sm font-bold text-gray-800 tracking-wide font-heading uppercase flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>เกียรติยศและความภาคภูมิใจ (Hall of Fame)</span>
            </h2>
          </div>
          <Link
            href="/awards"
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 group"
          >
            <span>ดูทำเนียบรางวัลทั้งหมด</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Banner Card with Luxury Glassmorphism & Gold Accent */}
        <div className="relative rounded-3xl overflow-hidden bg-white/95 backdrop-blur-md border border-amber-200/60 shadow-lg shadow-amber-500/5 p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 sm:gap-8 group">
          {/* Subtle top gold accent bar */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500" />

          {/* Image Container with Ambient Backdrop */}
          <div className="w-full md:w-1/2 h-[220px] sm:h-[280px] rounded-2xl overflow-hidden border border-amber-100 bg-gray-950 flex items-center justify-center p-2 relative shrink-0">
            {current.imageUrl ? (
              <>
                <div
                  className="absolute inset-0 bg-cover bg-center blur-xl opacity-40 scale-125"
                  style={{ backgroundImage: `url(${current.imageUrl})` }}
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={current.id || currentIndex}
                  src={current.imageUrl}
                  alt={current.title || "ผลงานที่ได้รับรางวัล"}
                  className="relative z-10 max-h-full max-w-full object-contain rounded-xl drop-shadow-md transition-all duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-2">
                  <Medal className="w-8 h-8" />
                </div>
                <span className="text-sm font-bold text-gray-800 mb-1">
                  {current.awardLevel || "รางวัลระดับเหรียญทอง"}
                </span>
                <span className="text-xs text-gray-500 max-w-xs line-clamp-2">
                  {current.title}
                </span>
              </div>
            )}

            <div className="absolute top-3 left-3 z-20">
              <span className="px-3 py-1 rounded-full bg-amber-500/90 backdrop-blur-md text-white text-[11px] font-bold shadow-xs flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                <span>{current.year ? `ปีการศึกษา ${current.year}` : "รางวัลผลงานดีเด่น"}</span>
              </span>
            </div>
          </div>

          {/* Details Content */}
          <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-red-50 text-red-700 font-extrabold text-xs mb-3 border border-red-100 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
              ขอแสดงความยินดีกับ
            </span>

            <h3 className="text-xl sm:text-3xl font-black text-gray-900 mb-1 font-heading">
              {current.student}
            </h3>

            {current.grade && (
              <span className="text-xs text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-md font-semibold mb-3">
                ชั้น {current.grade}
              </span>
            )}

            <div className="text-base sm:text-xl font-black text-red-600 mb-1.5 font-heading">
              {current.awardLevel || "รางวัลชนะเลิศ"}
            </div>

            <p className="text-xs sm:text-sm font-medium text-gray-700 mb-4 line-clamp-2 leading-relaxed">
              {current.competitionLevel && (
                <span className="text-amber-700 font-bold mr-1">[{current.competitionLevel}]</span>
              )}
              {current.title}
            </p>

            {current.organization && (
              <span className="text-[11px] text-gray-500 bg-gray-100/90 px-3 py-1 rounded-lg">
                จัดโดย: {current.organization}
              </span>
            )}

            <div className="mt-5 flex items-center gap-2">
              <Link
                href="/awards"
                className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs active:scale-95"
              >
                <span>ดูรายละเอียด & เกียรติบัตร</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Navigation Controls */}
          {highlights.length > 1 && (
            <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 flex items-center gap-2 z-20">
              <span className="text-[11px] font-bold text-gray-400 mr-1 hidden sm:inline">
                {currentIndex + 1} / {highlights.length}
              </span>
              <button
                onClick={handlePrev}
                className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                aria-label="Previous Award"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                aria-label="Next Award"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

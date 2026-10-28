"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Medal } from "lucide-react";

export default function AwardsBanner({ awards }: { awards: any[] }) {
  // Fallback to all awards if no explicit highlights are set
  const highlights = awards.filter(a => a.isHighlight).length > 0 
    ? awards.filter(a => a.isHighlight) 
    : awards;
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (highlights.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % highlights.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [highlights.length]);

  if (highlights.length === 0) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? highlights.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % highlights.length);
  };

  const current = highlights[currentIndex];

  return (
    <div className="w-full bg-[#FDF9F1] py-8 sm:py-10 border-b border-red-100/60">
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl relative">
        {/* Banner Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-red-100 flex flex-col md:flex-row items-center gap-6 sm:gap-8">
          
          {/* Image Container */}
          <div className="w-full md:w-1/2 h-[240px] sm:h-[300px] rounded-xl overflow-hidden border border-red-100 bg-red-50/30 flex items-center justify-center p-2 relative flex-shrink-0">
            {current.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                key={current.id || currentIndex}
                src={current.imageUrl} 
                alt={current.title}
                className="max-h-full max-w-full object-contain rounded-lg drop-shadow-sm transition-all duration-300"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.parentElement?.querySelector('.img-fallback') as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}

            {/* Fallback Display if image is empty */}
            <div 
              className="img-fallback flex flex-col items-center justify-center p-4 text-center" 
              style={{ display: current.imageUrl ? 'none' : 'flex' }}
            >
              <div className="w-16 h-16 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-2">
                <Medal className="w-8 h-8" />
              </div>
              <span className="text-sm font-bold text-gray-800 mb-1">{current.awardLevel || "ผลงานนักเรียน"}</span>
              <span className="text-xs text-gray-500 max-w-xs line-clamp-2">{current.title}</span>
            </div>
          </div>
          
          {/* Details Content */}
          <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
            <span className="inline-block bg-red-700 text-white px-4 py-1 rounded-full font-bold text-xs sm:text-sm mb-3">
              ขอแสดงความยินดีกับ
            </span>
            
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
              {current.student}
            </h2>
            
            <span className="text-xs text-gray-500 mb-3 font-medium">นักเรียนที่ได้รับรางวัล</span>
            
            <div className="text-lg sm:text-xl font-bold text-red-700 mb-1">
              {current.awardLevel || "รางวัล"}
            </div>
            
            <div className="text-sm sm:text-base font-semibold text-gray-800 mb-3 line-clamp-2">
              {current.competitionLevel && `${current.competitionLevel} `}
              {current.title}
            </div>
            
            {current.organization && (
              <span className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-md">
                จัดโดย {current.organization}
              </span>
            )}
          </div>
        </div>

        {/* Navigation Arrows */}
        {highlights.length > 1 && (
          <>
            <button 
              onClick={handlePrev}
              className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 bg-white hover:bg-red-50 text-red-700 rounded-full flex items-center justify-center shadow-md border border-gray-200 transition-all z-20"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={handleNext}
              className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 bg-white hover:bg-red-50 text-red-700 rounded-full flex items-center justify-center shadow-md border border-gray-200 transition-all z-20"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

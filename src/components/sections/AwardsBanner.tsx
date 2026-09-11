"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function AwardsBanner({ awards }: { awards: any[] }) {
  const highlights = awards.filter(a => a.isHighlight);
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
    <div className="w-full relative bg-[#F8F9FA] py-12 overflow-hidden">
      {/* Background blurred image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 blur-xl scale-110"
        style={{ backgroundImage: `url(${current.imageUrl})`, transition: 'background-image 0.5s ease-in-out' }}
      />
      
      {/* Background overlay */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-6xl">
        <div className="flex flex-col md:flex-row items-center gap-8 bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-10 shadow-xl border border-white/50">
          
          {/* Image */}
          <div className="w-full md:w-1/2 aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border-4 border-green-700/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={current.imageUrl} 
              alt={current.title}
              className="w-full h-full object-cover"
              onError={(e) => (e.currentTarget.src = "https://placehold.co/800x600/eeeeee/999999?text=Image+Not+Found")}
            />
          </div>
          
          {/* Content */}
          <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="bg-green-700 text-white px-6 py-2 rounded-full font-bold text-lg sm:text-xl shadow-md mb-6 w-full md:w-auto text-center">
              ขอแสดงความยินดีกับ
            </div>
            
            <div className="bg-blue-100 text-blue-800 px-6 py-2 rounded-full font-bold text-xl sm:text-2xl mb-4 border border-blue-200">
              {current.student}
            </div>
            
            <div className="text-gray-600 mb-2 font-medium">นักเรียนที่ได้รับรางวัล</div>
            
            <h2 className="text-2xl sm:text-3xl font-bold text-green-700 mb-2 leading-tight">
              {current.awardLevel || "รางวัล"}
            </h2>
            
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 leading-tight">
              {current.competitionLevel && `${current.competitionLevel} `}
              {current.title}
            </h3>
            
            {current.organization && (
              <p className="text-gray-600 font-medium bg-gray-100 px-4 py-2 rounded-lg">
                จัดโดย {current.organization}
              </p>
            )}
          </div>
        </div>

        {/* Navigation Arrows */}
        {highlights.length > 1 && (
          <>
            <button 
              onClick={handlePrev}
              className="absolute left-0 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/80 hover:bg-white text-green-700 rounded-full flex items-center justify-center shadow-lg transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-0 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/80 hover:bg-white text-green-700 rounded-full flex items-center justify-center shadow-lg transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {highlights.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all shadow-sm ${
                    idx === currentIndex ? "bg-green-700 w-6" : "bg-white/80 hover:bg-white"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

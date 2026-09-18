"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { 
  ImageIcon, 
  Eye, 
  Filter, 
  GraduationCap, 
  Sparkles, 
  X, 
  Maximize2, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight,
  Palette
} from "lucide-react";

export default function ArtworksGallery() {
  const [artworks, setArtworks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ทั้งหมด");
  const [selectedArtwork, setSelectedArtwork] = useState<any | null>(null);

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const res = await fetch("/api/artworks");
        const data = await res.json();
        if (Array.isArray(data)) {
          // Normalize studentName, grade, technique, dimensions from database
          const normalized = data.map((item: any) => ({
            ...item,
            studentName: item.studentName || item.author || "ไม่ระบุชื่อ",
            grade: item.grade || item.year || "ทั่วไป",
            technique: item.technique || "",
            dimensions: item.dimensions || "",
          }));
          setArtworks(normalized);
        }
      } catch (error) {
        console.error("Failed to fetch artworks", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArtworks();
  }, []);

  // Extract unique grades for filters
  const grades = useMemo(() => {
    const uniqueGrades = Array.from(
      new Set(artworks.map((a) => a.grade).filter(Boolean))
    );
    return ["ทั้งหมด", ...uniqueGrades.sort()];
  }, [artworks]);

  const filteredArtworks = useMemo(() => {
    if (activeFilter === "ทั้งหมด") return artworks;
    return artworks.filter((a) => a.grade === activeFilter);
  }, [artworks, activeFilter]);

  // Index of currently selected artwork within the filtered list
  const selectedIndex = useMemo(() => {
    if (!selectedArtwork) return -1;
    return filteredArtworks.findIndex((a) => a.id === selectedArtwork.id);
  }, [selectedArtwork, filteredArtworks]);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (filteredArtworks.length <= 1 || selectedIndex === -1) return;
    const prevIdx = selectedIndex > 0 ? selectedIndex - 1 : filteredArtworks.length - 1;
    setSelectedArtwork(filteredArtworks[prevIdx]);
  }, [filteredArtworks, selectedIndex]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (filteredArtworks.length <= 1 || selectedIndex === -1) return;
    const nextIdx = selectedIndex < filteredArtworks.length - 1 ? selectedIndex + 1 : 0;
    setSelectedArtwork(filteredArtworks[nextIdx]);
  }, [filteredArtworks, selectedIndex]);

  // Touch Swipe navigation for mobile & iPad
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches && e.touches[0]) {
      setTouchStartX(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    if (e.changedTouches && e.changedTouches[0]) {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchEndX - touchStartX;
      if (diff > 45) {
        handlePrev();
      } else if (diff < -45) {
        handleNext();
      }
    }
    setTouchStartX(null);
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!selectedArtwork) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedArtwork(null);
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [selectedArtwork, handlePrev, handleNext]);

  // Extract initial letter for student avatar
  const getStudentInitial = (name?: string) => {
    if (!name || name === "ไม่ระบุชื่อ") return "ศ";
    const clean = name.replace(/^(เด็กชาย|เด็กหญิง|นาย|นางสาว|ด\.ช\.|ด\.ญ\.)\s*/, "");
    return clean.charAt(0) || name.charAt(0) || "ศ";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-200 border-t-pink-500"></div>
      </div>
    );
  }

  if (artworks.length === 0) {
    return null; // Don't show the section if no artworks exist yet
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-7xl mt-6 pb-16">
      {/* Header and Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/25">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-2xl font-bold font-heading text-gray-900 tracking-tight">
              ผลงานล่าสุด
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              แสดงผลงาน {filteredArtworks.length} รายการ
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Filter className="w-4 h-4 text-gray-400 mr-1 shrink-0" />
          {grades.map((grade) => (
            <button
              key={grade}
              onClick={() => setActiveFilter(grade)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                activeFilter === grade
                  ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md shadow-pink-500/20 font-semibold"
                  : "bg-white text-gray-600 hover:bg-pink-50/50 hover:text-pink-600 border border-gray-200/80"
              }`}
            >
              {grade === "ทั้งหมด" ? "ทั้งหมด" : grade.startsWith("ม.") ? `ชั้น ${grade}` : grade}
            </button>
          ))}
        </div>
      </div>

      {/* Artworks Masonry Grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
        {filteredArtworks.map((artwork) => {
          const studentName = artwork.studentName || artwork.author || "ไม่ระบุชื่อ";
          const gradeDisplay = artwork.grade || artwork.year || "ทั่วไป";
          const classroomText = gradeDisplay.startsWith("ม.") ? `ชั้น ${gradeDisplay}` : gradeDisplay;

          return (
            <div 
              key={artwork.id} 
              onClick={() => setSelectedArtwork(artwork)}
              className="break-inside-avoid group cursor-pointer"
            >
              <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-[0_4px_24px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(236,72,153,0.16)] transition-all duration-500 group-hover:-translate-y-2 relative flex flex-col">
                
                {/* Artwork Image Container */}
                <div className="w-full aspect-[4/5] max-h-[440px] bg-slate-900/5 relative overflow-hidden flex items-center justify-center">
                  {/* Floating Classroom Badge */}
                  <div className="absolute top-3.5 right-3.5 z-10 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md shadow-sm border border-pink-100 text-pink-600 font-bold text-xs flex items-center gap-1.5 transition-transform duration-300 group-hover:scale-105">
                    <GraduationCap className="w-3.5 h-3.5 text-pink-500" />
                    <span>{classroomText}</span>
                  </div>

                  {/* Artwork Image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={artwork.imageUrl} 
                    alt={artwork.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 block"
                    onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400/eeeeee/999999?text=Image+Not+Found")}
                  />

                  {/* Hover Overlay with Preview CTA */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="transform translate-y-3 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-75 bg-white/90 backdrop-blur-md text-slate-800 px-4 py-2 rounded-full flex items-center gap-2 text-xs font-semibold shadow-xl hover:bg-white">
                      <Maximize2 className="w-3.5 h-3.5 text-pink-600" /> คลิกดูรูปภาพขนาดเต็ม
                    </div>
                  </div>
                </div>

                {/* Card Details */}
                <div className="p-5 bg-white flex flex-col justify-between flex-1">
                  <div>
                    <h4 className="font-bold font-heading text-base sm:text-lg text-gray-900 mb-2 group-hover:text-pink-600 transition-colors line-clamp-2 leading-snug">
                      {artwork.title}
                    </h4>

                    {/* Technique & Dimensions Tags */}
                    {(artwork.technique || artwork.dimensions) && (
                      <div className="flex flex-wrap items-center gap-1.5 mb-3">
                        {artwork.technique && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-orange-50 text-orange-700 border border-orange-100/90 px-2 py-0.5 rounded-lg">
                            <Palette className="w-3 h-3 text-orange-500 shrink-0" />
                            {artwork.technique}
                          </span>
                        )}
                        {artwork.dimensions && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200/80 px-2 py-0.5 rounded-lg">
                            <Maximize2 className="w-3 h-3 text-slate-400 shrink-0" />
                            {artwork.dimensions}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Student & Classroom Information */}
                  <div className="flex items-center gap-3 mt-1 pt-3.5 border-t border-gray-100">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-500 to-orange-400 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 ring-2 ring-pink-100">
                      {getStudentInitial(studentName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 truncate group-hover:text-pink-600 transition-colors">
                        {studentName}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5 truncate">
                        <span className="inline-flex items-center gap-1 text-pink-600 font-medium bg-pink-50 px-2 py-0.5 rounded-md text-[11px] border border-pink-100/60">
                          <GraduationCap className="w-3 h-3 text-pink-500 shrink-0" />
                          {classroomText}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-400 text-[11px] truncate">ศิลปินนักเรียน</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {filteredArtworks.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-600">ไม่มีผลงานในระดับชั้นนี้</h3>
          <p className="text-xs text-gray-400 mt-1">ลองเลือกตัวกรองระดับชั้นอื่นเพื่อดูผลงานเพิ่มเติม</p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Lightbox / Full-size Image Preview Modal Dialog */}
      {/* ========================================================================= */}
      {selectedArtwork && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedArtwork(null)}
        >
          {/* Modal Container */}
          <div 
            className="relative max-w-5xl w-full bg-slate-900 border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-slate-900/90 backdrop-blur-md z-10 shrink-0">
              <div className="flex items-center gap-3 min-w-0 pr-4">
                <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-heading font-bold text-base sm:text-lg text-white truncate">
                    {selectedArtwork.title}
                  </h3>
                  {(selectedArtwork.technique || selectedArtwork.dimensions) && (
                    <div className="flex items-center gap-2 text-xs mt-0.5 flex-wrap">
                      {selectedArtwork.technique && (
                        <span className="inline-flex items-center gap-1 text-orange-300 font-medium">
                          <Palette className="w-3 h-3 text-orange-400" />
                          {selectedArtwork.technique}
                        </span>
                      )}
                      {selectedArtwork.technique && selectedArtwork.dimensions && (
                        <span className="text-white/30">•</span>
                      )}
                      {selectedArtwork.dimensions && (
                        <span className="inline-flex items-center gap-1 text-slate-300 font-medium">
                          <Maximize2 className="w-3 h-3 text-slate-400" />
                          ขนาด {selectedArtwork.dimensions}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {selectedArtwork.imageUrl && (
                  <a
                    href={selectedArtwork.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs transition-colors flex items-center gap-1.5 px-3 font-medium cursor-pointer"
                    title="เปิดรูปภาพต้นฉบับในแท็บใหม่"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">เปิดรูปต้นฉบับ</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedArtwork(null)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="ปิดหน้าต่าง (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Image Body with Nav Arrows & Touch Swipe */}
            <div 
              className="relative flex-1 min-h-[300px] flex items-center justify-center p-2 sm:p-6 bg-black/40 overflow-hidden touch-pan-y"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* Prev Button */}
              {filteredArtworks.length > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-1.5 sm:left-6 z-20 p-2 sm:p-3 rounded-full bg-black/60 hover:bg-pink-600 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-lg"
                  title="ดูผลงานก่อนหน้า (ลูกศรซ้าย หรือปัดขวา)"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
                </button>
              )}

              {/* Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedArtwork.imageUrl}
                alt={selectedArtwork.title}
                className="max-h-[60vh] sm:max-h-[66vh] w-auto max-w-full object-contain rounded-xl shadow-2xl select-none"
                onError={(e) => (e.currentTarget.src = "https://placehold.co/800x600/222222/ffffff?text=Image+Not+Found")}
              />

              {/* Next Button */}
              {filteredArtworks.length > 1 && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-1.5 sm:right-6 z-20 p-2 sm:p-3 rounded-full bg-black/60 hover:bg-pink-600 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-lg"
                  title="ดูผลงานถัดไป (ลูกศรขวา หรือปัดซ้าย)"
                >
                  <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
                </button>
              )}
            </div>

            {/* Modal Bottom Metadata Bar */}
            <div className="px-5 py-4 bg-slate-900 border-t border-white/10 shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                
                {/* Author & Artwork Info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-orange-400 text-white flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-white/20 shrink-0">
                    {getStudentInitial(selectedArtwork.studentName)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-bold text-sm sm:text-base">
                        {selectedArtwork.studentName || selectedArtwork.author || "ไม่ระบุชื่อ"}
                      </span>
                      <span className="inline-flex items-center gap-1 text-pink-300 font-semibold bg-pink-500/20 px-2.5 py-0.5 rounded-full text-xs border border-pink-500/30">
                        <GraduationCap className="w-3 h-3" />
                        {selectedArtwork.grade?.startsWith("ม.") 
                          ? `ชั้น ${selectedArtwork.grade}` 
                          : selectedArtwork.grade || selectedArtwork.year || "ทั่วไป"}
                      </span>
                      {selectedArtwork.technique && (
                        <span className="inline-flex items-center gap-1 text-orange-300 font-medium bg-orange-500/20 px-2.5 py-0.5 rounded-full text-xs border border-orange-500/30">
                          <Palette className="w-3 h-3 text-orange-400" />
                          {selectedArtwork.technique}
                        </span>
                      )}
                      {selectedArtwork.dimensions && (
                        <span className="inline-flex items-center gap-1 text-slate-300 font-medium bg-white/10 px-2.5 py-0.5 rounded-full text-xs border border-white/15">
                          <Maximize2 className="w-3 h-3 text-slate-400" />
                          {selectedArtwork.dimensions}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-xs mt-0.5">
                      ผลงานสร้างสรรค์ศิลปะ นักเรียนกลุ่มสาระการเรียนรู้ศิลปะ โรงเรียนวชิรธรรมสาธิต
                    </p>
                  </div>
                </div>

                {/* Counter & Close CTA */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t border-white/5 sm:border-0">
                  {filteredArtworks.length > 1 && (
                    <span className="text-xs text-slate-400 font-medium">
                      {selectedIndex + 1} จาก {filteredArtworks.length} ชิ้น
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedArtwork(null)}
                    className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    ปิดหน้าต่าง
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Palette, ArrowRight, Eye, Sparkles, X, ChevronLeft, ChevronRight } from "lucide-react";

export default function HomeArtworksPreview() {
  const [artworks, setArtworks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeItem, setActiveItem] = useState<any | null>(null);

  useEffect(() => {
    fetch("/api/artworks")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch artworks");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Take top 8 latest artworks
          setArtworks(data.slice(0, 8));
        }
      })
      .catch((err) => {
        console.warn("HomeArtworksPreview fetch error:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (!isLoading && artworks.length === 0) {
    return null; // Don't show empty block if no artworks exist
  }

  return (
    <section className="py-14 sm:py-20 bg-transparent relative">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-semibold mb-3 border border-rose-100 select-none">
              <Palette className="w-3.5 h-3.5" />
              <span>แกลเลอรีผลงานยอดเยี่ยม</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black font-heading text-gray-900 tracking-tight">
              พื้นที่แสดงพลังสร้างสรรค์ <br />
              <span className="bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                ผลงานศิลปะนักเรียน
              </span>
            </h2>
            <p className="text-gray-600 text-sm sm:text-lg mt-2 font-normal">
              รวบรวมผลงานภาพวาด จิตรกรรม และผลงานสร้างสรรค์จากนักเรียนทุกระดับชั้น
            </p>
          </div>

          <Link
            href="/artworks"
            className="inline-flex items-center gap-2 text-sm sm:text-base font-bold text-red-600 hover:text-red-700 group shrink-0"
          >
            <span>ชมนิทรรศการออนไลน์ทั้งหมด</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Artworks Horizontal Carousel on mobile, Grid on tablet/desktop */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 overflow-x-auto pb-4 md:pb-0 snap-x snap-mandatory scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            {artworks.map((item, idx) => (
              <div
                key={item.id || idx}
                onClick={() => setActiveItem(item)}
                className="min-w-[240px] sm:min-w-[280px] md:min-w-0 snap-center rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group cursor-pointer flex flex-col"
              >
                {/* Image Container with Ambient Backdrop */}
                <div className="relative aspect-square w-full overflow-hidden bg-gray-950 flex items-center justify-center p-2">
                  {item.imageUrl && (
                    <div
                      className="absolute inset-0 bg-cover bg-center blur-lg opacity-35 scale-125"
                      style={{ backgroundImage: `url(${item.imageUrl})` }}
                    />
                  )}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.title || "ผลงานนักเรียน"}
                    className="relative z-10 max-h-full max-w-full object-contain rounded-xl group-hover:scale-105 transition-transform duration-500 drop-shadow-sm"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10 pointer-events-none" />

                  {/* Overlay Quick Peek Icon */}
                  <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-xs">
                    <span className="w-10 h-10 rounded-full bg-white/95 text-gray-900 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                      <Eye className="w-5 h-5 text-red-600" />
                    </span>
                  </div>

                  {item.technique && (
                    <span className="absolute bottom-2 left-2 z-20 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-medium border border-white/20">
                      {item.technique}
                    </span>
                  )}
                </div>

                {/* Info details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base line-clamp-1 group-hover:text-red-600 transition-colors font-heading">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                      โดย: {item.studentName || item.author || "นักเรียนวชิรธรรมสาธิต"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-100 text-[11px] text-gray-400">
                    <span className="font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                      {item.grade || "ทั่วไป"}
                    </span>
                    <span>{item.year || "2569"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Lightbox for Full HD Preview */}
        {activeItem && (
          <div
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setActiveItem(null)}
          >
            <div
              className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveItem(null)}
                className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/50 hover:bg-black text-white flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative aspect-4/3 w-full bg-gray-950 flex items-center justify-center p-3">
                {activeItem.imageUrl && (
                  <div
                    className="absolute inset-0 bg-cover bg-center blur-2xl opacity-40 scale-125"
                    style={{ backgroundImage: `url(${activeItem.imageUrl})` }}
                  />
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeItem.imageUrl}
                  alt={activeItem.title}
                  className="relative z-10 max-h-full max-w-full object-contain rounded-xl drop-shadow-md"
                />
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-gray-900 font-heading">
                      {activeItem.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      สร้างสรรค์โดย:{" "}
                      <span className="font-semibold text-gray-900">
                        {activeItem.studentName || activeItem.author}
                      </span>{" "}
                      ({activeItem.grade || "ทั่วไป"})
                    </p>
                  </div>
                  {activeItem.technique && (
                    <span className="px-3 py-1 rounded-full bg-red-50 text-red-600 font-bold text-xs shrink-0 border border-red-100">
                      {activeItem.technique}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-gray-100">
                  <Link
                    href="/artworks"
                    className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors"
                  >
                    <span>ดูแกลเลอรีเต็ม</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

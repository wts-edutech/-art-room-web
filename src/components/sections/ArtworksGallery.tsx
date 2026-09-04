"use client";

import { useState, useEffect, useMemo } from "react";
import { ImageIcon, Eye, Filter } from "lucide-react";

export default function ArtworksGallery() {
  const [artworks, setArtworks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ทั้งหมด");

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const res = await fetch("/api/artworks");
        const data = await res.json();
        setArtworks(data);
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
    const uniqueGrades = Array.from(new Set(artworks.map(a => a.grade).filter(Boolean)));
    return ["ทั้งหมด", ...uniqueGrades.sort()];
  }, [artworks]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-200 border-t-pink-500"></div>
      </div>
    );
  }

  const filteredArtworks = activeFilter === "ทั้งหมด" 
    ? artworks 
    : artworks.filter(a => a.grade === activeFilter);

  if (artworks.length === 0) {
    return null; // Don't show the section if no artworks
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-7xl mt-8 pb-12">
      {/* Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/30">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold font-heading text-gray-900 tracking-tight">
              ผลงานล่าสุด
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Filter className="w-5 h-5 text-gray-400 mr-2 shrink-0" />
          {grades.map(grade => (
            <button
              key={grade}
              onClick={() => setActiveFilter(grade)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                activeFilter === grade
                  ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md shadow-pink-500/20 transform scale-105"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-pink-200"
              }`}
            >
              {grade}
            </button>
          ))}
        </div>
      </div>

      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
        {filteredArtworks.map((artwork) => (
          <div key={artwork.id} className="break-inside-avoid group cursor-pointer">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(236,72,153,0.15)] transition-all duration-500 group-hover:-translate-y-2 relative">
              
              <div className="w-full bg-gray-100 relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={artwork.imageUrl} 
                  alt={artwork.title} 
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400/eeeeee/999999?text=Image+Not+Found")}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100 bg-white/20 backdrop-blur-md border border-white/40 text-white px-6 py-2.5 rounded-full flex items-center gap-2 font-medium">
                    <Eye className="w-4 h-4" /> ดูผลงาน
                  </div>
                </div>
              </div>

              <div className="p-6 relative bg-white">
                <div className="absolute -top-6 right-6 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-10 border border-gray-50">
                  <span className="text-pink-500 font-bold text-sm">{artwork.grade || "ทั่วไป"}</span>
                </div>
                
                <h4 className="font-bold font-heading text-xl text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-pink-500 transition-all line-clamp-2">
                  {artwork.title}
                </h4>
                
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs uppercase shadow-inner">
                    {artwork.studentName ? artwork.studentName.charAt(0) : "U"}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="text-sm font-medium text-gray-700 truncate">{artwork.studentName || "ไม่ระบุชื่อ"}</div>
                    <div className="text-xs text-gray-400">ศิลปินนักเรียน</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredArtworks.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-500">ไม่มีผลงานในหมวดหมู่นี้</h3>
        </div>
      )}
    </div>
  );
}

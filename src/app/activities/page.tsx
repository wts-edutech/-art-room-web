"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { 
  Sparkles, 
  Search, 
  Calendar, 
  MapPin, 
  Images, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  ExternalLink, 
  Clock, 
  Tag, 
  ArrowRight,
  Maximize2
} from "lucide-react";

// Helper to extract all images from activity
function getAllImages(activity: any): string[] {
  const list: string[] = [];
  if (activity.imageUrl && typeof activity.imageUrl === 'string' && activity.imageUrl.trim()) {
    list.push(activity.imageUrl.trim());
  }
  if (activity.images) {
    if (Array.isArray(activity.images)) {
      activity.images.forEach((img: any) => {
        if (typeof img === 'string' && img.trim() && !list.includes(img.trim())) {
          list.push(img.trim());
        }
      });
    } else if (typeof activity.images === 'string' && activity.images.trim()) {
      try {
        const parsed = JSON.parse(activity.images);
        if (Array.isArray(parsed)) {
          parsed.forEach((img: any) => {
            if (typeof img === 'string' && img.trim() && !list.includes(img.trim())) {
              list.push(img.trim());
            }
          });
        }
      } catch {}
    }
  }
  return list.length > 0 ? list : ["https://placehold.co/800x600/eeeeee/999999?text=Image+Not+Found"];
}

const CATEGORIES = [
  "ทั้งหมด",
  "เวิร์กช็อป / อบรม",
  "นิทรรศการ / พิเศษ",
  "ประกวด / แข่งขัน",
  "การเรียนการสอน",
  "สำคัญ / ส่งงาน / สอบ",
];

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
  const [activeModalActivity, setActiveModalActivity] = useState<any | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await fetch("/api/activities");
        if (res.ok) {
          const data = await res.json();
          setActivities(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to fetch activities:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, []);

  // Filter activities
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const matchCategory = selectedCategory === "ทั้งหมด" || 
        act.category === selectedCategory ||
        (selectedCategory.includes("เวิร์กช็อป") && act.category?.includes("เวิร์กช็อป")) ||
        (selectedCategory.includes("นิทรรศการ") && act.category?.includes("นิทรรศการ")) ||
        (selectedCategory.includes("ประกวด") && act.category?.includes("ประกวด")) ||
        (selectedCategory.includes("การเรียน") && act.category?.includes("การเรียน"));

      const matchSearch = !searchTerm ||
        act.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.date?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchCategory && matchSearch;
    });
  }, [activities, selectedCategory, searchTerm]);

  const openActivityModal = (activity: any) => {
    setActiveModalActivity(activity);
    setActiveImageIndex(0);
  };

  const modalImages = activeModalActivity ? getAllImages(activeModalActivity) : [];

  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col pt-24 pb-24 min-h-screen bg-[#FDFBF7]">
        
        {/* Hero Header Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-orange-50/70 via-red-50/30 to-transparent pt-12 pb-10 border-b border-orange-100/40">
          <div className="container mx-auto px-4 sm:px-6 max-w-7xl text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100/80 border border-orange-200 text-orange-800 text-xs sm:text-sm font-semibold mb-4 shadow-2xs">
              <Images className="w-4 h-4 text-orange-600" />
              <span>แกลเลอรีประมวลภาพกิจกรรมศิลปะ | Photo Gallery & Projects</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight mb-4 font-heading">
              ประมวลภาพกิจกรรมศิลปะ
            </h1>
            <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto font-light leading-relaxed">
              ภาพบรรยากาศการเรียนการสอน กิจกรรมเวิร์กช็อป นิทรรศการ และความประทับใจของนักเรียนกลุ่มสาระการเรียนรู้ศิลปะ โรงเรียนวชิรธรรมสาธิต
            </p>

            {/* Notice Link to Calendar on News Page */}
            <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/90 border border-orange-200/80 shadow-2xs text-xs text-gray-600">
              <Calendar className="w-3.5 h-3.5 text-orange-600" />
              <span>ต้องการดูปฏิทินและกำหนดการกิจกรรม?</span>
              <Link 
                href="/news" 
                className="font-bold text-orange-600 hover:text-orange-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                ดูปฏิทินกิจกรรมได้ที่หน้าข่าวสาร <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Search & Filter Bar */}
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text"
                  placeholder="ค้นหาภาพกิจกรรม สถานที่ หรือวันจัดงาน..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-sm shadow-xs transition-all"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Categories Pills */}
            <div className="flex items-center justify-center flex-wrap gap-2 mt-5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-orange-500 text-white shadow-md shadow-orange-200 font-bold"
                      : "bg-white text-gray-600 hover:bg-gray-100/80 border border-gray-200/80"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery Content Section (Full-Width Responsive Grid) */}
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl py-12">
          
          {/* Header row */}
          <div className="flex items-center justify-between mb-8 border-b border-gray-200/70 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 font-heading flex items-center gap-2">
                <span className="w-2.5 h-6 bg-orange-500 rounded-full"></span>
                {selectedCategory === "ทั้งหมด" ? "อัลบั้มภาพกิจกรรมทั้งหมด" : `หมวดหมู่: ${selectedCategory}`}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                พบทั้งหมด {filteredActivities.length} อัลบั้มกิจกรรม
              </p>
            </div>
          </div>

          {/* Loading Skeleton */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white rounded-3xl overflow-hidden border border-gray-100 p-4 space-y-4 animate-pulse">
                  <div className="h-60 bg-gray-200 rounded-2xl" />
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-gray-200 max-w-xl mx-auto my-8">
              <Images className="w-14 h-14 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-800 mb-1">ยังไม่มีประมวลภาพกิจกรรมในหมวดหมู่นี้</h3>
              <p className="text-sm text-gray-500 mb-5 font-light">คุณสามารถเปลี่ยนคำค้นหา หรือเลือกดูหมวดหมู่อื่นๆ ได้</p>
              <button 
                onClick={() => { setSelectedCategory("ทั้งหมด"); setSearchTerm(""); }}
                className="px-5 py-2.5 bg-orange-500 text-white text-xs font-bold rounded-xl hover:bg-orange-600 transition-colors shadow-xs cursor-pointer"
              >
                ดูภาพกิจกรรมทั้งหมด
              </button>
            </div>
          ) : (
            /* Full Width Responsive 3-Column Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredActivities.map((act: any) => {
                const images = getAllImages(act);
                const cover = images[0];
                const hasMultipleImages = images.length > 1;

                return (
                  <div 
                    key={act.id}
                    onClick={() => openActivityModal(act)}
                    className="bg-white rounded-3xl overflow-hidden border border-gray-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full cursor-pointer group"
                  >
                    {/* Cover Image */}
                    <div className="relative w-full h-64 sm:h-72 bg-gray-900 overflow-hidden">
                      {/* Blurred backdrop for irregular ratio images */}
                      <div 
                        className="absolute inset-0 bg-cover bg-center blur-md opacity-40 scale-110 pointer-events-none"
                        style={{ backgroundImage: `url(${cover})` }}
                      />
                      
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={cover} 
                        alt={act.title}
                        className="relative z-10 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => (e.currentTarget.src = "https://placehold.co/800x600/eeeeee/999999?text=Image+Not+Found")}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 opacity-60 group-hover:opacity-80 transition-opacity z-10" />

                      {/* Top Badges */}
                      <div className="absolute top-3.5 left-3.5 z-20 flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/90 backdrop-blur-md text-gray-800 shadow-xs">
                          {act.category || "กิจกรรม"}
                        </span>
                      </div>

                      {/* Multiple Images Counter Badge */}
                      {hasMultipleImages && (
                        <div className="absolute top-3.5 right-3.5 z-20">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/70 backdrop-blur-md text-white flex items-center gap-1 shadow-xs">
                            <Images className="w-3 h-3" />
                            +{images.length} รูป
                          </span>
                        </div>
                      )}

                      {/* Date & Location overlay */}
                      <div className="absolute bottom-3.5 left-3.5 right-3.5 z-20 text-white flex flex-wrap items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-black/50 backdrop-blur-sm text-[11px]">
                          <Calendar className="w-3 h-3 text-orange-400" />
                          {act.date}
                        </span>
                        {act.location && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-black/50 backdrop-blur-sm text-[11px]">
                            <MapPin className="w-3 h-3 text-red-400" />
                            {act.location}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors font-heading leading-snug line-clamp-2">
                          {act.title}
                        </h3>
                        {act.description && (
                          <p className="text-gray-500 text-xs sm:text-sm mt-2 font-light line-clamp-3 leading-relaxed">
                            {act.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                        <span className="text-gray-400 font-medium">คลิกเพื่อดูอัลบั้มภาพ</span>
                        <span className="inline-flex items-center gap-1 text-orange-600 font-bold group-hover:translate-x-1 transition-transform">
                          เปิดชมภาพ <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Photo Album Lightbox Modal */}
        {activeModalActivity && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setActiveModalActivity(null)}
          >
            <div 
              className="bg-white rounded-3xl overflow-hidden max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-white/20 animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 bg-gray-50/80">
                <div className="min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800">
                      {activeModalActivity.category || "กิจกรรม"}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-orange-500" />
                      {activeModalActivity.date}
                    </span>
                    {activeModalActivity.location && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-red-500" />
                        {activeModalActivity.location}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate font-heading">
                    {activeModalActivity.title}
                  </h3>
                </div>

                <button 
                  onClick={() => setActiveModalActivity(null)}
                  className="w-9 h-9 rounded-full bg-gray-200/70 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
                
                {/* Main Large Image Display */}
                <div className="relative w-full h-[320px] sm:h-[440px] rounded-2xl overflow-hidden bg-gray-950 flex items-center justify-center shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={modalImages[activeImageIndex]} 
                    alt={`${activeModalActivity.title} - ${activeImageIndex + 1}`}
                    className="max-h-full max-w-full object-contain rounded-xl"
                  />

                  {/* Previous / Next Arrow Controls */}
                  {modalImages.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : modalImages.length - 1))}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer shadow-md"
                        title="ภาพก่อนหน้า"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveImageIndex((prev) => (prev < modalImages.length - 1 ? prev + 1 : 0))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer shadow-md"
                        title="ภาพถัดไป"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                      
                      <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/60 text-white text-xs font-mono">
                        {activeImageIndex + 1} / {modalImages.length}
                      </div>
                    </>
                  )}
                </div>

                {/* Thumbnails strip */}
                {modalImages.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1">
                    {modalImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                          activeImageIndex === idx 
                            ? "border-orange-500 ring-2 ring-orange-500/40 scale-95" 
                            : "border-gray-200 opacity-70 hover:opacity-100"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt={`thumb ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Description & Details */}
                {activeModalActivity.description && (
                  <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      รายละเอียดกิจกรรม
                    </h4>
                    <p className="text-gray-700 text-sm font-light leading-relaxed whitespace-pre-line">
                      {activeModalActivity.description}
                    </p>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

      </main>
      <Footer />
    </>
  );
}

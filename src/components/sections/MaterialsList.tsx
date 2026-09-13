"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Search, BookOpen, Video, Image as ImageIcon, Star, Grid, 
  Download, ExternalLink, GraduationCap, FileText, Presentation, 
  Filter, CheckCircle2, ArrowRight, X, Sparkles
} from "lucide-react";
import { DownloadItem } from "@/data/default-downloads";

interface MaterialsListProps {
  initialLessons: any[];
  initialDownloads?: DownloadItem[];
  basePath?: string;
}

export default function MaterialsList({ 
  initialLessons = [], 
  initialDownloads = [], 
  basePath = "/materials" 
}: MaterialsListProps) {
  const searchParams = useSearchParams();
  const urlType = searchParams.get("type");
  const urlGrade = searchParams.get("grade");

  const [downloads, setDownloads] = useState<DownloadItem[]>(initialDownloads);
  const [selectedGrade, setSelectedGrade] = useState<string>(urlGrade || "all");
  const [selectedMediaType, setSelectedMediaType] = useState<string>(urlType || "all");
  const [activeCategory, setActiveCategory] = useState<string>("ทั้งหมด");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Sync with searchParams if they change
  useEffect(() => {
    if (urlType) setSelectedMediaType(urlType);
    if (urlGrade) setSelectedGrade(urlGrade);
  }, [urlType, urlGrade]);

  // Fetch dynamic downloads from API
  useEffect(() => {
    fetch("/api/downloads")
      .then(res => res.json())
      .then((data: any) => {
        if (data && Array.isArray(data.downloads) && data.downloads.length > 0) {
          setDownloads(data.downloads);
        }
      })
      .catch(() => {});
  }, []);

  const grades = [
    { id: "all", label: "ทุกระดับชั้น" },
    { id: "m1", label: "ม.1" },
    { id: "m2", label: "ม.2" },
    { id: "m3", label: "ม.3" },
    { id: "m4", label: "ม.4" },
    { id: "m5", label: "ม.5" },
    { id: "m6", label: "ม.6" },
  ];

  const mediaTypes = [
    { id: "all", label: "✨ สื่อทั้งหมด" },
    { id: "video", label: "🎬 วิดีทัศน์ (YouTube)" },
    { id: "pdf", label: "📄 ใบงาน & ชีตสรุป (PDF)" },
    { id: "canva", label: "🎨 สไลด์สื่อการสอน (Canva/PPT)" },
    { id: "image", label: "🖼️ สื่อภาพและเทคนิค" },
  ];

  const categories = [
    { id: "ทั้งหมด", label: "หมวดหมู่ทั้งหมด", icon: <Grid className="w-4 h-4" /> },
    { id: "สื่อวิดีทัศน์", label: "สื่อวิดีทัศน์", icon: <Video className="w-4 h-4 text-red-500" /> },
    { id: "ใบงาน", label: "ใบงานและแบบฝึกหัด", icon: <FileText className="w-4 h-4 text-emerald-500" /> },
    { id: "ใบความรู้", label: "ใบความรู้และชีตสรุป", icon: <BookOpen className="w-4 h-4 text-blue-500" /> },
    { id: "สื่อภาพ", label: "สื่อภาพและเทคนิค", icon: <ImageIcon className="w-4 h-4 text-amber-500" /> },
    { id: "คู่มือ", label: "คู่มือและเกณฑ์ประเมิน", icon: <CheckCircle2 className="w-4 h-4 text-purple-500" /> },
  ];

  // Combine lessons and downloads into a unified items array
  const unifiedItems = useMemo(() => {
    const items: any[] = [];

    // 1. Add Lessons
    (Array.isArray(initialLessons) ? initialLessons : []).forEach(lesson => {
      const isVideo = Boolean(lesson.videoId) || lesson.category === "สื่อวิดีทัศน์";
      const isPdf = Boolean(lesson.fileUrl) || lesson.category === "สื่อเอกสาร PDF";
      const isCanva = Boolean(lesson.fileUrl?.includes("canva"));

      let mediaType = "general";
      if (isVideo) mediaType = "video";
      else if (isCanva) mediaType = "canva";
      else if (isPdf) mediaType = "pdf";
      else if (lesson.category === "สื่อภาพ") mediaType = "image";

      items.push({
        id: `lesson-${lesson.id}`,
        rawId: lesson.id,
        isWorksheet: false,
        title: lesson.title,
        description: lesson.description || "",
        category: lesson.category || "สื่อวิดีทัศน์",
        grade: lesson.grade || (lesson.type === "m3" ? "m3" : lesson.type === "m4" ? "m4" : "all"),
        mediaType,
        imageUrl: lesson.imageUrl,
        videoId: lesson.videoId,
        fileUrl: lesson.fileUrl,
        attachmentName: lesson.attachmentName,
        views: lesson.views || 0,
        createdAt: lesson.createdAt || "",
      });
    });

    // 2. Add PDF Downloads / Worksheets
    (Array.isArray(downloads) ? downloads : []).forEach(dl => {
      items.push({
        id: `dl-${dl.id}`,
        rawId: dl.id,
        isWorksheet: true,
        title: dl.title,
        description: dl.description || "",
        category: dl.category || "ใบงาน",
        grade: dl.grade || "all",
        mediaType: "pdf",
        fileName: dl.fileName || "worksheet.pdf",
        fileSize: dl.fileSize || "1.5 MB",
        fileUrl: dl.fileUrl,
        downloadsCount: dl.downloadsCount || 0,
        createdAt: "",
      });
    });

    return items;
  }, [initialLessons, downloads]);

  // Filter logic
  const filteredItems = useMemo(() => {
    return unifiedItems.filter(item => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (item.title || "").toLowerCase().includes(q);
        const matchDesc = (item.description || "").toLowerCase().includes(q);
        if (!matchTitle && !matchDesc) return false;
      }

      // 2. Grade filter
      if (selectedGrade !== "all") {
        if (item.grade !== "all" && item.grade !== selectedGrade) return false;
      }

      // 3. Media Type filter
      if (selectedMediaType !== "all") {
        if (item.mediaType !== selectedMediaType) return false;
      }

      // 4. Category filter
      if (activeCategory !== "ทั้งหมด") {
        if (activeCategory === "ใบงาน" && item.isWorksheet && item.category === "แบบฝึกหัด") {
          // matches
        } else if (item.category !== activeCategory) {
          return false;
        }
      }

      return true;
    });
  }, [unifiedItems, searchQuery, selectedGrade, selectedMediaType, activeCategory]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
      {/* Mobile Sidebar Toggle Button */}
      <button 
        onClick={() => setIsMobileSidebarOpen(true)}
        className="lg:hidden w-full bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between shadow-xs cursor-pointer hover:border-red-300"
      >
        <div className="flex items-center gap-2 font-bold text-gray-800 text-sm">
          <Filter className="w-4 h-4 text-red-600" />
          <span>ตัวกรองหมวดหมู่เนื้อหา</span>
        </div>
        <span className="text-xs font-bold bg-red-50 text-red-600 px-3 py-1 rounded-full border border-red-100">
          {activeCategory}
        </span>
      </button>

      {/* Mobile Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 z-[60] backdrop-blur-xs" 
          onClick={() => setIsMobileSidebarOpen(false)} 
        />
      )}

      {/* Left Sidebar Filter */}
      <aside className={`fixed inset-y-0 left-0 z-[70] w-[300px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:w-64 lg:shadow-none lg:bg-transparent lg:z-0 flex-shrink-0 flex flex-col h-full lg:h-auto ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100 lg:hidden">
          <span className="font-heading font-bold text-lg text-gray-900">ตัวกรองสื่อการสอน</span>
          <button 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-sm"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 lg:p-0 space-y-6 lg:sticky lg:top-36">
          {/* Quick Search Box */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-red-500" /> ค้นหาสื่อ / ใบงาน
            </h3>
            <div className="relative">
              <input
                type="text"
                placeholder="ชื่อสื่อ, หัวข้อ, เทคนิค..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-3.5 pr-8 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-xs transition-all text-gray-800"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Categories Filter */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3 border-b border-gray-100 pb-2.5 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-red-500" /> หมวดหมู่เนื้อหา
            </h3>
            <ul className="space-y-1">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-left text-xs font-medium cursor-pointer ${
                      activeCategory === cat.id
                        ? "bg-red-50 text-red-600 font-bold border border-red-100 shadow-xs"
                        : "text-gray-600 hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span className="flex-1">{cat.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      {/* Right Main Feed Area */}
      <div className="flex-1 w-full space-y-6">
        {/* 1. Grade Selector Bar (ม.1 - ม.6) */}
        <div className="bg-white p-3 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-red-500" /> เลือกระดับชั้นเรียน:
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              พบ {filteredItems.length} รายการ
            </span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {grades.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGrade(g.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedGrade === g.id
                    ? "bg-red-600 text-white shadow-md shadow-red-500/20 scale-[1.02]"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200/70"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Media Type Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {mediaTypes.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMediaType(m.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedMediaType === m.id
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        {/* 3. Unified Feed Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 px-4 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <Search className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-gray-800 mb-1">ไม่พบสื่อการสอนหรือใบงานในหมวดหมู่นี้</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
              ลองกดเลือกดูระดับชั้นอื่น หรือกดรีเซ็ตตัวกรองเพื่อดูสื่อการสอนทั้งหมด
            </p>
            <button
              onClick={() => {
                setSelectedGrade("all");
                setSelectedMediaType("all");
                setActiveCategory("ทั้งหมด");
                setSearchQuery("");
              }}
              className="px-4 py-2 bg-red-50 text-red-600 font-bold text-xs rounded-xl hover:bg-red-100 transition-colors"
            >
              รีเซ็ตตัวกรองทั้งหมด
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredItems.map((item: any) => {
              const gradeLabel = item.grade && item.grade !== "all" 
                ? grades.find(g => g.id === item.grade)?.label 
                : "ทุกระดับชั้น";

              // A. WORKSHEET / PDF CARD
              if (item.isWorksheet || item.mediaType === "pdf") {
                return (
                  <div 
                    key={item.id} 
                    className="bg-white rounded-3xl p-5 border border-emerald-100/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 relative overflow-hidden"
                  >
                    {/* Top Decorative Gradient Accent */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500" />

                    <div>
                      {/* Card Header: Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1">
                          <FileText className="w-3 h-3 text-emerald-600" />
                          <span>ใบงาน PDF</span>
                        </span>
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md text-[11px] font-semibold">
                          {gradeLabel}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
                        {item.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-500 text-xs line-clamp-2 mb-4 leading-relaxed font-light">
                        {item.description || "เอกสารประกอบการเรียนรู้และใบงานศิลปะ"}
                      </p>

                      {/* File Metadata Box */}
                      <div className="bg-gray-50/80 rounded-2xl p-3 mb-4 border border-gray-100 flex items-center justify-between text-xs">
                        <div className="truncate pr-2">
                          <p className="font-semibold text-gray-700 truncate text-[11px]">{item.fileName || "เอกสารแนบ"}</p>
                          <p className="text-[10px] text-gray-400">{item.fileSize || "1.5 MB"} • PDF Document</p>
                        </div>
                        {item.downloadsCount !== undefined && item.downloadsCount > 0 && (
                          <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded shrink-0">
                            📥 {item.downloadsCount}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Button: Direct Download */}
                    <a
                      href={item.fileUrl}
                      download={item.fileName || "worksheet.pdf"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full min-h-[42px] py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <Download className="w-4 h-4" />
                      <span>ดาวน์โหลดใบงาน PDF</span>
                    </a>
                  </div>
                );
              }

              // B. VIDEO LESSON / CANVA CARD
              const hasVideo = Boolean(item.videoId);
              const isCanva = item.mediaType === "canva" || item.fileUrl?.includes("canva");

              return (
                <div 
                  key={item.id} 
                  className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
                >
                  <div>
                    {/* Video/Image Thumbnail Container */}
                    <Link href={`${basePath}/detail?id=${item.rawId}`} className="block w-full aspect-video bg-gray-100 rounded-2xl mb-4 relative overflow-hidden group/thumb">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={
                          item.imageUrl 
                            ? item.imageUrl 
                            : hasVideo 
                              ? `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg` 
                              : "https://placehold.co/600x400/FFF7ED/EA580C?text=Art+Lesson"
                        } 
                        alt={item.title} 
                        className="w-full h-full object-cover transform group-hover/thumb:scale-105 transition-transform duration-500"
                        onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400/FFF7ED/EA580C?text=Art+Lesson")}
                      />

                      {/* Grade Badge */}
                      <div className="absolute top-2.5 left-2.5 bg-red-600 text-white px-2.5 py-0.5 rounded-lg text-[11px] font-bold shadow-xs">
                        {gradeLabel}
                      </div>

                      {/* Format Badge */}
                      <div className="absolute top-2.5 right-2.5 bg-black/75 backdrop-blur-xs text-white px-2.5 py-0.5 rounded-lg text-[10px] font-semibold flex items-center gap-1 shadow-xs">
                        {isCanva ? (
                          <>
                            <Presentation className="w-3 h-3 text-purple-300" />
                            <span>สไลด์</span>
                          </>
                        ) : hasVideo ? (
                          <>
                            <Video className="w-3 h-3 text-red-400" />
                            <span>วิดีโอ</span>
                          </>
                        ) : (
                          <span>บทเรียน</span>
                        )}
                      </div>
                    </Link>

                    {/* Title */}
                    <Link href={`${basePath}/detail?id=${item.rawId}`}>
                      <h3 className="text-base font-bold text-gray-900 mb-1.5 line-clamp-2 group-hover:text-red-600 transition-colors leading-snug">
                        {item.title}
                      </h3>
                    </Link>

                    {/* Description */}
                    <p className="text-gray-500 mb-4 line-clamp-2 text-xs leading-relaxed font-light">
                      {item.description || "สื่อการสอนศิลปะโดยกลุ่มสาระการเรียนรู้ศิลปะ โรงเรียนวชิรธรรมสาธิต"}
                    </p>
                  </div>

                  {/* Card Action */}
                  <div className="pt-3 border-t border-gray-100">
                    <Link 
                      href={`${basePath}/detail?id=${item.rawId}`} 
                      className="text-white font-bold inline-flex items-center justify-center w-full min-h-[42px] gap-1.5 text-xs sm:text-sm bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 rounded-xl transition-all shadow-sm active:scale-98"
                    >
                      <span>เข้าสู่บทเรียน</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

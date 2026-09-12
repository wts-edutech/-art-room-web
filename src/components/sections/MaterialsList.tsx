"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, BookOpen, Video, Image as ImageIcon, Star, Grid, Download, ExternalLink, GraduationCap, FileText, Presentation } from "lucide-react";

interface MaterialsListProps {
  initialLessons: any[];
  basePath?: string;
}

export default function MaterialsList({ initialLessons = [], basePath = "/materials" }: MaterialsListProps) {
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [selectedMediaType, setSelectedMediaType] = useState<string>("all");
  const [activeCategory, setActiveCategory] = useState<string>("ทั้งหมด");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

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
    { id: "all", label: "สื่อทุกรูปแบบ", icon: <Grid className="w-3.5 h-3.5" /> },
    { id: "video", label: "วิดีทัศน์ (YouTube)", icon: <Video className="w-3.5 h-3.5 text-red-500" /> },
    { id: "pdf", label: "ใบงาน / ชีตสรุป (PDF)", icon: <FileText className="w-3.5 h-3.5 text-emerald-500" /> },
    { id: "canva", label: "สไลด์สื่อการสอน (Canva/PPT)", icon: <Presentation className="w-3.5 h-3.5 text-purple-500" /> },
  ];

  const categories = [
    { id: "ทั้งหมด", label: "หมวดหมู่ทั้งหมด", icon: <Grid className="w-4 h-4" /> },
    { id: "สื่อวิดีทัศน์", label: "สื่อวิดีทัศน์", icon: <Video className="w-4 h-4" /> },
    { id: "สื่อภาพ", label: "สื่อภาพและเทคนิค", icon: <ImageIcon className="w-4 h-4" /> },
    { id: "สื่อแนะนำ", label: "สื่อแนะนำพิเศษ", icon: <Star className="w-4 h-4" /> },
    { id: "สื่อเอกสาร PDF", label: "เอกสารและใบงาน", icon: <BookOpen className="w-4 h-4" /> },
  ];

  // Helper to normalize grade matching
  const matchesGrade = (lesson: any, gradeId: string) => {
    if (gradeId === "all") return true;
    if (lesson.grade === gradeId) return true;
    // Fallback to legacy type ('m3', 'm4')
    if (lesson.type === gradeId) return true;
    return false;
  };

  // Helper to normalize mediaType matching
  const matchesMediaType = (lesson: any, mediaId: string) => {
    if (mediaId === "all") return true;
    if (lesson.mediaType === mediaId) return true;
    if (mediaId === "video" && (lesson.videoId || lesson.category === "สื่อวิดีทัศน์")) return true;
    if (mediaId === "pdf" && (lesson.fileUrl || lesson.category === "สื่อเอกสาร PDF")) return true;
    if (mediaId === "canva" && lesson.fileUrl?.includes("canva")) return true;
    return false;
  };

  const filteredLessons = useMemo(() => {
    return (Array.isArray(initialLessons) ? initialLessons : []).filter((lesson) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = lesson.title?.toLowerCase().includes(q);
        const matchDesc = lesson.description?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc) return false;
      }

      // Grade
      if (!matchesGrade(lesson, selectedGrade)) return false;

      // Media Type
      if (!matchesMediaType(lesson, selectedMediaType)) return false;

      // Category Sidebar
      if (activeCategory !== "ทั้งหมด") {
        if (lesson.category !== activeCategory) return false;
      }

      return true;
    });
  }, [initialLessons, searchQuery, selectedGrade, selectedMediaType, activeCategory]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsMobileSidebarOpen(true)}
        className="lg:hidden w-full bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between shadow-xs"
      >
        <div className="flex items-center gap-2 font-bold text-gray-800">
          <Search className="w-5 h-5 text-red-600" />
          <span>ค้นหาและกรองหมวดหมู่</span>
        </div>
        <span className="text-xs font-semibold bg-red-50 text-red-600 px-3 py-1 rounded-full border border-red-100">
          {activeCategory}
        </span>
      </button>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-[60] backdrop-blur-xs" 
          onClick={() => setIsMobileSidebarOpen(false)} 
        />
      )}

      {/* Sidebar Filter */}
      <aside className={`fixed inset-y-0 left-0 z-[70] w-[300px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:w-64 lg:shadow-none lg:bg-transparent lg:z-0 flex-shrink-0 flex flex-col h-full lg:h-auto ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100 lg:hidden">
          <span className="font-heading font-black text-xl text-gray-900">ตัวกรองสื่อการสอน</span>
          <button 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
          >
            <span className="text-xl font-bold">&times;</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 lg:p-0 space-y-6 lg:sticky lg:top-36">
          {/* Quick Search Box */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Search className="w-4 h-4 text-red-500" /> ค้นหาบทเรียน
            </h3>
            <div className="relative">
              <input
                type="text"
                placeholder="ชื่อบทเรียน, เทคนิค, สี..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-3 pr-8 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-xs transition-all"
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

          {/* Category Filter */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
            <h3 className="text-sm font-bold text-gray-800 mb-3 border-b border-gray-100 pb-2 flex items-center gap-2">
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
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left text-xs sm:text-sm font-medium ${
                      activeCategory === cat.id
                        ? "bg-red-50 text-red-600 font-bold border border-red-100 shadow-2xs"
                        : "text-gray-600 hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    <span className={activeCategory === cat.id ? "text-red-500" : "text-gray-400"}>
                      {cat.icon}
                    </span>
                    <span className="flex-1">{cat.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      {/* Main Content Area with Grade & Media Selector Tabs */}
      <div className="flex-1 w-full space-y-6">
        
        {/* 1. Grade Selector Bar (ม.1 - ม.6) */}
        <div className="bg-gray-50/80 p-2.5 rounded-2xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-red-500" /> แถบเลือกระดับชั้นเรียน:
            </span>
            <span className="text-[11px] text-gray-500">
              พบ {filteredLessons.length} บทเรียน
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
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200/80"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Media Format Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {mediaTypes.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMediaType(m.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedMediaType === m.id
                  ? "bg-gray-900 text-white shadow-xs"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {m.icon}
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        {/* 3. Lessons Grid */}
        {filteredLessons.length === 0 ? (
          <div className="text-center py-20 px-4 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <Search className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-gray-800 mb-1">ยังไม่พบสื่อการสอนในระดับชั้นหรือหมวดหมู่นี้</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
              คุณครูกำลังทยอยอัปโหลดเนื้อหาเพิ่มเติม หรือลองกดเลือกดูระดับชั้นอื่น
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
            {filteredLessons.map((lesson: any) => {
              const gradeLabel = lesson.grade ? grades.find(g => g.id === lesson.grade)?.label : (lesson.type === 'm3' ? 'ม.3' : lesson.type === 'm4' ? 'ม.4' : 'ทุกระดับชั้น');
              const hasVideo = Boolean(lesson.videoId);
              const hasFile = Boolean(lesson.fileUrl);
              const isCanva = lesson.fileUrl?.includes("canva");

              return (
                <div 
                  key={lesson.id} 
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col h-full group hover:-translate-y-0.5"
                >
                  {/* Thumbnail Container */}
                  <div className="w-full aspect-video bg-gray-100 rounded-xl mb-4 relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={
                        lesson.imageUrl 
                          ? lesson.imageUrl 
                          : hasVideo 
                            ? `https://img.youtube.com/vi/${lesson.videoId}/hqdefault.jpg` 
                            : hasFile 
                              ? "https://placehold.co/600x400/fff1f2/e11d48?text=PDF+Worksheet" 
                              : "https://placehold.co/600x400/f8fafc/64748b?text=Art+Lesson"
                      } 
                      alt={lesson.title} 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400/f8fafc/64748b?text=Art+Lesson")}
                    />

                    {/* Grade Badge */}
                    <div className="absolute top-2.5 left-2.5 bg-red-600 text-white px-2.5 py-0.5 rounded-lg text-[11px] font-bold shadow-xs">
                      {gradeLabel || "ศิลปะ"}
                    </div>

                    {/* Media Type Icon Badge */}
                    <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-xs text-white px-2 py-0.5 rounded-lg text-[10px] font-semibold flex items-center gap-1 shadow-xs">
                      {isCanva ? (
                        <>
                          <Presentation className="w-3 h-3 text-purple-400" />
                          <span>Canva</span>
                        </>
                      ) : hasFile ? (
                        <>
                          <FileText className="w-3 h-3 text-emerald-400" />
                          <span>PDF</span>
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
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold font-heading text-gray-900 mb-1.5 line-clamp-2 group-hover:text-red-600 transition-colors">
                    {lesson.title}
                  </h3>
                  <p className="text-gray-500 mb-4 line-clamp-2 text-xs leading-relaxed font-light">
                    {lesson.description || "สื่อการสอนศิลปะโดยกลุ่มสาระการเรียนรู้ศิลปะ โรงเรียนวชิรธรรมสาธิต"}
                  </p>

                  {/* Actions & Links */}
                  <div className="mt-auto pt-3 border-t border-gray-100 flex flex-col gap-2">
                    {hasFile && (
                      <a 
                        href={lesson.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 py-2 px-3 rounded-xl transition-colors border border-emerald-200/60"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{lesson.attachmentName || "ดาวน์โหลดใบงาน/เอกสารแนบ"}</span>
                      </a>
                    )}

                    <Link 
                      href={`${basePath}/detail?id=${lesson.id}`} 
                      className="text-white font-bold inline-flex items-center justify-center w-full min-h-[42px] gap-1.5 text-xs sm:text-sm bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-xs active:scale-98"
                    >
                      <span>เข้าสู่บทเรียน</span>
                      <span className="text-base leading-none">&rarr;</span>
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

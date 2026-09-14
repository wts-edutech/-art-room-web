"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Search, BookOpen, Video, Image as ImageIcon, Star, Grid, 
  Download, ExternalLink, GraduationCap, FileText, Presentation, 
  Filter, CheckCircle2, ArrowRight, X, Sparkles, Eye, CloudDownload,
  Loader2
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
  const [previewItem, setPreviewItem] = useState<any | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ title: string; message: string; type: "success" | "loading" | "info" } | null>(null);
  const [downloadCounts, setDownloadCounts] = useState<Record<string, number>>({});

  const handleView = (item: any) => {
    setPreviewItem(item);
  };

  const handleDownload = async (e: React.MouseEvent, item: any) => {
    e.preventDefault();
    e.stopPropagation();

    if (downloadingId) return;

    setDownloadingId(item.id);
    const targetFileName = item.fileName || (item.mediaType === "video" ? "lesson_video.mp4" : `${item.title}.pdf`);

    setToast({
      title: "กำลังเริ่มดาวน์โหลด...",
      message: `เตรียมไฟล์: ${targetFileName}`,
      type: "loading"
    });

    // Optimistically increment download count
    setDownloadCounts(prev => ({
      ...prev,
      [item.id]: (prev[item.id] ?? item.downloadsCount ?? 0) + 1
    }));

    // Trigger API download count increment
    if (item.rawId) {
      fetch(`/api/downloads?id=${encodeURIComponent(item.rawId)}`, { method: "PATCH" }).catch(() => {});
    }

    try {
      if (item.fileUrl) {
        const response = await fetch(item.fileUrl, { mode: "cors" });
        if (response.ok) {
          const blob = await response.blob();
          const blobUrl = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = blobUrl;
          link.download = targetFileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
        } else {
          throw new Error("Direct link fallback");
        }
      }
    } catch {
      // Fallback for cross-origin URLs
      const link = document.createElement("a");
      link.href = item.fileUrl || "#";
      link.setAttribute("download", targetFileName);
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    setTimeout(() => {
      setToast({
        title: "ดาวน์โหลดเรียบร้อยแล้ว!",
        message: `บันทึกไฟล์ ${targetFileName} เรียบร้อยแล้ว`,
        type: "success"
      });
      setDownloadingId(null);
      setTimeout(() => setToast(null), 3500);
    }, 700);
  };

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
    { id: "ทั้งหมด", label: "หมวดหมู่ทั้งหมด", icon: <Grid className="w-5 h-5 text-gray-700" /> },
    { id: "สื่อวิดีทัศน์", label: "สื่อวิดีทัศน์", icon: <Video className="w-5 h-5 text-red-500" /> },
    { id: "ใบงาน", label: "ใบงานและแบบฝึกหัด", icon: <FileText className="w-5 h-5 text-emerald-500" /> },
    { id: "ใบความรู้", label: "ใบความรู้และชีตสรุป", icon: <BookOpen className="w-5 h-5 text-blue-500" /> },
    { id: "สื่อภาพ", label: "สื่อภาพและเทคนิค", icon: <ImageIcon className="w-5 h-5 text-amber-500" /> },
    { id: "คู่มือ", label: "คู่มือและเกณฑ์ประเมิน", icon: <CheckCircle2 className="w-5 h-5 text-purple-500" /> },
  ];

  // Combine lessons and downloads into a unified items array
  const unifiedItems = useMemo(() => {
    const items: any[] = [];

    // 1. Add Lessons
    (Array.isArray(initialLessons) ? initialLessons : []).forEach(lesson => {
      const isVideo = Boolean(lesson.videoId) || lesson.category === "สื่อวิดีทัศน์";
      const isPdf = Boolean(lesson.fileUrl) || lesson.category === "สื่อเอกสาร PDF";
      const isCanva = Boolean(lesson.fileUrl?.includes("canva"));

      let mediaType = "video";
      if (isVideo) mediaType = "video";
      else if (isCanva) mediaType = "canva";
      else if (isPdf) mediaType = "pdf";
      else if (lesson.category === "สื่อภาพ") mediaType = "image";

      items.push({
        id: `lesson-${lesson.id}`,
        rawId: lesson.id,
        isWorksheet: mediaType === "pdf",
        title: lesson.title,
        description: lesson.description || "",
        category: lesson.category || "สื่อวิดีทัศน์",
        topic: lesson.topic || (isVideo ? "จุด & เส้น" : "ศิลปะสร้างสรรค์"),
        grade: lesson.grade || (lesson.type === "m3" ? "m3" : lesson.type === "m4" ? "m4" : "all"),
        mediaType,
        imageUrl: lesson.imageUrl,
        videoId: lesson.videoId,
        fileUrl: lesson.fileUrl,
        fileName: lesson.attachmentName || "lesson_material.pdf",
        attachmentName: lesson.attachmentName,
        views: lesson.views || 0,
        downloadsCount: lesson.views || 342,
        orderIndex: lesson.orderIndex ?? 100,
        createdAt: lesson.createdAt || "",
      });
    });

    // 2. Add PDF Downloads / Worksheets / Seed Videos
    (Array.isArray(downloads) ? downloads : []).forEach(dl => {
      const isVideo = dl.mediaType === "video" || dl.category === "สื่อวิดีทัศน์";
      items.push({
        id: `dl-${dl.id}`,
        rawId: dl.id,
        isWorksheet: dl.mediaType === "pdf" || (!dl.mediaType && !isVideo),
        title: dl.title,
        description: dl.description || "",
        category: dl.category || (isVideo ? "สื่อวิดีทัศน์" : "ใบงาน"),
        topic: dl.topic || (isVideo ? "จุด & เส้น" : "จุด & เส้น"),
        grade: dl.grade || "all",
        mediaType: dl.mediaType || (isVideo ? "video" : "pdf"),
        imageUrl: dl.imageUrl,
        videoId: dl.videoId,
        fileName: dl.fileName || (isVideo ? "lesson_video.mp4" : "worksheet.pdf"),
        fileSize: dl.fileSize || "1.5 MB",
        fileUrl: dl.fileUrl,
        downloadsCount: dl.downloadsCount || 0,
        orderIndex: dl.orderIndex ?? 50,
        createdAt: "",
      });
    });

    // Sort items by orderIndex so dl-1, v-1, dl-2 display first matching Image 2
    return items.sort((a, b) => (a.orderIndex ?? 999) - (b.orderIndex ?? 999));
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
      <aside className={`fixed inset-y-0 left-0 z-[70] w-[300px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:w-72 lg:shadow-none lg:bg-transparent lg:z-0 flex-shrink-0 flex flex-col h-full lg:h-auto ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
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
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
            <h3 className="text-sm sm:text-[15px] font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Search className="w-4 h-4 text-red-500" /> 
              <span>ค้นหาสื่อ / ใบงาน</span>
            </h3>
            <div className="relative">
              <input
                type="text"
                placeholder="ชื่อสื่อ, หัวข้อ, เทคนิค..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-4 pr-9 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-sm sm:text-[15px] transition-all text-gray-800 placeholder:text-gray-400"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Categories Filter */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
            <h3 className="text-sm sm:text-[15px] font-bold text-gray-900 mb-3.5 border-b border-gray-100 pb-3 flex items-center gap-2">
              <GraduationCap className="w-4.5 h-4.5 text-red-500" /> 
              <span>หมวดหมู่เนื้อหา</span>
            </h3>
            <ul className="space-y-1.5">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left text-sm sm:text-[15px] cursor-pointer ${
                      activeCategory === cat.id
                        ? "bg-red-50 text-red-600 font-bold border border-red-100 shadow-xs"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50 border border-transparent font-medium"
                    }`}
                  >
                    <span className="shrink-0">{cat.icon}</span>
                    <span className="flex-1 font-heading">{cat.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      {/* Right Main Feed Area */}
      <div className="flex-1 w-full space-y-6">
        {/* Results Header */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>สื่อการสอน{activeCategory !== "ทั้งหมด" ? ` (${activeCategory})` : ""}</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-100 text-red-700">
              {filteredItems.length} รายการ
            </span>
          </h2>
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
              const isVideo = item.mediaType === "video" || item.category === "สื่อวิดีทัศน์";
              const isRedTitle = item.title.includes("เทคนิค") || item.title.includes("Value Scale");

              return (
                <div 
                  key={item.id} 
                  className="bg-white rounded-[24px] sm:rounded-[28px] overflow-hidden border border-gray-100/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
                >
                  <div>
                    {/* Top Cover Thumbnail / ART ROOM Video Cover */}
                    <div className="relative w-full aspect-[16/10] bg-gray-100 overflow-hidden">
                      {isVideo && (!item.imageUrl || item.id === "dl-v-1" || item.rawId === "v-1" || item.title.includes("เส้นสร้างสรรค์")) ? (
                        /* Coral-Crimson Red Cover with centered bold white ART ROOM */
                        <div className="w-full h-full bg-gradient-to-r from-[#FF2B5E] via-[#FF3B69] to-[#FF4B72] flex items-center justify-center relative select-none">
                          <span className="text-white font-extrabold text-2xl sm:text-3xl tracking-widest font-heading drop-shadow-xs">
                            ART ROOM
                          </span>
                        </div>
                      ) : (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img 
                          src={
                            item.imageUrl 
                              ? item.imageUrl 
                              : item.videoId 
                                ? `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`
                                : "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=800&auto=format&fit=crop"
                          } 
                          alt={item.title} 
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => (e.currentTarget.src = "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=800&auto=format&fit=crop")}
                        />
                      )}

                      {/* Top-Left Badge: Topic (e.g. จุด & เส้น, น้ำหนัก & แสงเงา) */}
                      <div className="absolute top-3.5 left-3.5">
                        <span className="bg-white/95 backdrop-blur-xs text-gray-900 font-bold text-xs px-3.5 py-1.5 rounded-full shadow-xs">
                          {item.topic || (isVideo ? "จุด & เส้น" : "จุด & เส้น")}
                        </span>
                      </div>

                      {/* Top-Right Badge: Format (วิดีโอสอน or ใบงาน PDF) */}
                      <div className="absolute top-3.5 right-3.5">
                        {isVideo ? (
                          <span className="bg-white/95 backdrop-blur-xs text-[#2563EB] font-bold text-xs px-3 py-1.5 rounded-full shadow-xs flex items-center gap-1.5">
                            <Video className="w-3.5 h-3.5 fill-[#2563EB] text-[#2563EB]" />
                            <span>วิดีโอสอน</span>
                          </span>
                        ) : (
                          <span className="bg-white/95 backdrop-blur-xs text-[#DC2626] font-bold text-xs px-3 py-1.5 rounded-full shadow-xs flex items-center gap-1.5">
                            <span className="bg-[#DC2626] text-white text-[9px] font-black px-1 py-0.5 rounded-[3px] uppercase leading-none">PDF</span>
                            <span>ใบงาน PDF</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Content Area */}
                    <div className="p-5 sm:p-6 pb-2">
                      {/* Title */}
                      <h3 
                        className={`text-base sm:text-lg font-bold mb-2 line-clamp-1 leading-snug transition-colors ${
                          isRedTitle 
                            ? "text-[#DC2626]" 
                            : "text-gray-900 group-hover:text-red-600"
                        }`}
                        title={item.title}
                      >
                        {item.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-500 text-xs sm:text-[13px] line-clamp-2 mb-4 leading-relaxed font-light">
                        {item.description || "สื่อการสอนศิลปะโดยกลุ่มสาระการเรียนรู้ศิลปะ โรงเรียนวชิรธรรมสาธิต"}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-gray-50 flex items-center justify-between">
                    {/* Left: Downloads Count */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 font-normal">
                      <Download className="w-3.5 h-3.5 text-gray-400" />
                      <span>{downloadCounts[item.id] ?? item.downloadsCount ?? 342} ครั้ง</span>
                    </div>

                    {/* Right: Actions [ 👁 ดู ] and [ ☁ ดาวน์โหลด ] */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleView(item)}
                        className="px-3.5 py-1.5 rounded-full bg-gray-100/90 hover:bg-gray-200 text-gray-700 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-2xs"
                        title="ดูตัวอย่างเอกสารหรือบทเรียน"
                      >
                        <Eye className="w-3.5 h-3.5 text-gray-600" />
                        <span>ดู</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDownload(e, item)}
                        disabled={downloadingId === item.id}
                        className="px-3.5 py-1.5 rounded-full bg-[#FFF0F3] hover:bg-[#FFE4E8] text-[#E11D48] text-xs font-semibold flex items-center gap-1.5 transition-all border border-pink-100/80 active:scale-95 cursor-pointer shadow-2xs disabled:opacity-75"
                        title="ดาวน์โหลดไฟล์ลงเครื่อง"
                      >
                        {downloadingId === item.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E11D48]" />
                        ) : (
                          <CloudDownload className="w-3.5 h-3.5 text-[#E11D48]" />
                        )}
                        <span>{downloadingId === item.id ? "กำลังโหลด..." : "ดาวน์โหลด"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Interactive Preview Modal */}
      {previewItem && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setPreviewItem(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2.5 min-w-0 pr-4">
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                  previewItem.mediaType === "video" || previewItem.videoId 
                    ? "bg-blue-50 text-blue-600 border border-blue-100" 
                    : "bg-red-50 text-red-600 border border-red-100"
                }`}>
                  {previewItem.category || "สื่อการสอน"}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate" title={previewItem.title}>
                  {previewItem.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 bg-[#FBFBFC]">
              {/* If Video: Embedded YouTube Player */}
              {(previewItem.mediaType === "video" || previewItem.videoId) ? (
                <div className="space-y-4">
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-md">
                    {previewItem.videoId ? (
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${previewItem.videoId}?autoplay=1`}
                        title={previewItem.title}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-white bg-slate-900 p-6 text-center">
                        <Video className="w-12 h-12 text-red-500 mb-2" />
                        <p className="text-sm font-semibold">วิดีโอประกอบการเรียนรู้ศิลปะ</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-gray-800">คำอธิบายบทเรียน</h4>
                      {previewItem.rawId && (
                        <Link
                          href={`${basePath}/detail?id=${previewItem.rawId}`}
                          className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"
                        >
                          <span>ดูหน้าบทเรียนเต็ม</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                    <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed">
                      {previewItem.description || "สื่อการสอนศิลปะโดยกลุ่มสาระการเรียนรู้ศิลปะ โรงเรียนวชิรธรรมสาธิต"}
                    </p>
                  </div>
                </div>
              ) : (
                /* If Document / Worksheet PDF */
                <div className="space-y-4">
                  {/* File Meta Info Bar */}
                  <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-gray-800 truncate">
                          {previewItem.fileName || "worksheet.pdf"}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                          <span>ขนาด: {previewItem.fileSize || "1.4 MB"}</span>
                          <span>•</span>
                          <span>ดาวน์โหลดแล้ว: {downloadCounts[previewItem.id] ?? previewItem.downloadsCount ?? 0} ครั้ง</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={previewItem.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                        <span>เปิดแท็บใหม่</span>
                      </a>
                    </div>
                  </div>

                  {/* Document Preview Frame */}
                  <div className="w-full h-[45vh] sm:h-[50vh] rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-inner relative flex flex-col items-center justify-center">
                    {previewItem.fileUrl ? (
                      <iframe
                        src={`${previewItem.fileUrl}#toolbar=0`}
                        title={previewItem.title}
                        className="w-full h-full border-0"
                      />
                    ) : (
                      <div className="text-center p-6 text-gray-400">
                        <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-xs">ตัวอย่างเอกสารใบงาน</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
                    <h4 className="text-xs font-bold text-gray-800 mb-1">รายละเอียดเอกสาร</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {previewItem.description || "เอกสารประกอบการเรียนการสอนรายวิชาทัศนศิลป์ กลุ่มสาระการเรียนรู้ศิลปะ โรงเรียนวชิรธรรมสาธิต"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 sm:px-6 py-3.5 border-t border-gray-100 bg-white flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>

              <button
                type="button"
                onClick={(e) => handleDownload(e, previewItem)}
                disabled={downloadingId === previewItem.id}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-red-200 transition-all active:scale-95 cursor-pointer disabled:opacity-75"
              >
                {downloadingId === previewItem.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CloudDownload className="w-4 h-4" />
                )}
                <span>{downloadingId === previewItem.id ? "กำลังเตรียมดาวน์โหลด..." : "ดาวน์โหลดไฟล์เอกสาร"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-pink-100 animate-in slide-in-from-bottom-5 duration-300">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
            toast.type === "loading" ? "bg-rose-50 text-[#E11D48]" : "bg-emerald-50 text-emerald-600"
          }`}>
            {toast.type === "loading" ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#E11D48]" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900">{toast.title}</p>
            <p className="text-[11px] text-gray-500 max-w-xs truncate">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

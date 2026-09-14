"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { 
  Search, Plus, X, Share2, Check, ArrowUpDown, 
  Sparkles, FileText, Palette, Layers, Video, 
  BookOpen, Compass, Folder, Grid, Lock 
} from "lucide-react";

interface IdeaItem {
  id: string;
  title: string;
  description: string;
  category?: string;
  authorName: string;
  authorEmail?: string;
  coverImageUrl?: string;
  files?: any[];
  link?: string;
  status: string;
  createdAt: string;
  commentsCount?: number;
  comments?: any[];
}

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<IdeaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
  const [sortBy, setSortBy] = useState<"latest" | "comments">("latest");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const router = useRouter();

  const categories = [
    { label: "ทั้งหมด", icon: <Grid className="w-3.5 h-3.5" /> },
    { label: "ใบงาน", icon: <FileText className="w-3.5 h-3.5" /> },
    { label: "รูปภาพ", icon: <Palette className="w-3.5 h-3.5" /> },
    { label: "กิจกรรม", icon: <Layers className="w-3.5 h-3.5" /> },
    { label: "วีดีโอ", icon: <Video className="w-3.5 h-3.5" /> },
    { label: "สื่อการสอน", icon: <BookOpen className="w-3.5 h-3.5" /> },
    { label: "เกมส์", icon: <Compass className="w-3.5 h-3.5" /> },
    { label: "ทั่วไป", icon: <Folder className="w-3.5 h-3.5" /> },
  ];

  useEffect(() => {
    // Check login status
    const authorName = localStorage.getItem("artroom_author_name");
    setIsLoggedIn(!!authorName);

    // Fetch approved ideas
    fetch("/api/ideas")
      .then((res) => res.json())
      .then((data: any) => {
        setIdeas(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch ideas:", error);
        setIdeas([]);
        setIsLoading(false);
      });
  }, []);

  const handleShareClick = () => {
    if (!isLoggedIn) {
      setShowGuestModal(true);
    } else {
      router.push("/ideas/new");
    }
  };

  const handleCopyLink = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/ideas/detail?id=${id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  const filteredAndSortedIdeas = useMemo(() => {
    const list = ideas.filter((idea) => {
      const matchesSearch =
        (idea.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (idea.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (idea.authorName || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "ทั้งหมด" ||
        idea.category === selectedCategory ||
        (!idea.category && selectedCategory === "ทั่วไป");
      return matchesSearch && matchesCategory;
    });

    return list.sort((a, b) => {
      if (sortBy === "comments") {
        const countA = a.commentsCount || (Array.isArray(a.comments) ? a.comments.length : 0);
        const countB = b.commentsCount || (Array.isArray(b.comments) ? b.comments.length : 0);
        return countB - countA;
      }
      // Latest default
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [ideas, searchTerm, selectedCategory, sortBy]);

  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col pt-32 pb-24 min-h-screen bg-[#FCFBF8]">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          {/* Header Section */}
          <div className="text-center mb-10 max-w-3xl mx-auto">
            {/* Subtle Studio Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 text-xs font-medium mb-4 border border-zinc-200/80 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-zinc-600" />
              <span>คลังแลกเปลี่ยนแนวคิดและแรงบันดาลใจศิลปะ</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-zinc-900 mb-3 tracking-tight">
              ห้องสมุดไอเดียสร้างสรรค์
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-zinc-500 max-w-2xl mx-auto font-normal leading-relaxed mb-6">
              พื้นที่แลกเปลี่ยนแนวทางการสร้างสรรค์ สื่อการเรียนรู้ ใบงาน และเทคนิคทางศิลปะ <br className="hidden sm:inline" />
              ร่วมแบ่งปันโดยคุณครูและนักเรียน โรงเรียนวชิรธรรมสาธิต
            </p>
            
            {/* Action Button */}
            <div className="flex items-center justify-center gap-3">
              <button 
                onClick={handleShareClick} 
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-sm rounded-xl transition-all shadow-sm hover:shadow cursor-pointer"
              >
                <Plus className="w-4 h-4" /> ร่วมแบ่งปันแนวคิดใหม่
              </button>
            </div>
          </div>

          {/* Search & Filter Control Bar */}
          <div className="max-w-4xl mx-auto mb-8 space-y-3.5">
            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-zinc-400" />
              </div>
              <input
                type="text"
                placeholder="ค้นหาหัวข้อ, สื่อการเรียนรู้, ใบงาน หรือชื่อผู้แบ่งปัน..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 pl-11 pr-11 rounded-xl border border-zinc-200 bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 outline-none transition-all shadow-2xs text-sm text-zinc-800 placeholder-zinc-400"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Pills & Sort Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
                {categories.map((cat) => (
                  <button
                    key={cat.label}
                    onClick={() => setSelectedCategory(cat.label)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                      selectedCategory === cat.label
                        ? "bg-zinc-900 text-white shadow-xs"
                        : "bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>

              {/* Sorting Selector */}
              <div className="flex items-center gap-2 self-end md:self-auto shrink-0 bg-white px-3 py-1.5 rounded-xl border border-zinc-200 shadow-2xs text-xs text-zinc-600">
                <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-zinc-400 font-normal">จัดเรียง:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "latest" | "comments")}
                  className="bg-transparent text-xs font-medium text-zinc-700 outline-none cursor-pointer"
                >
                  <option value="latest">ล่าสุด</option>
                  <option value="comments">ความคิดเห็นมากที่สุด</option>
                </select>
              </div>
            </div>
          </div>

          {/* Ideas Grid */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 flex items-center gap-2">
                <span>แนวคิดทั้งหมด</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200/60">
                  {filteredAndSortedIdeas.length} รายการ
                </span>
              </h2>
            </div>
            
            {isLoading ? (
              <div className="flex flex-col justify-center items-center h-64 gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-zinc-300 border-t-zinc-700"></div>
                <p className="text-xs text-zinc-400">กำลังโหลดข้อมูล...</p>
              </div>
            ) : filteredAndSortedIdeas.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 sm:p-12 text-center shadow-2xs border border-zinc-200/80 max-w-md mx-auto">
                <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center mx-auto mb-3.5 text-zinc-500 border border-zinc-200/60">
                  <Folder className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-800 mb-1.5">ยังไม่พบข้อมูลในหมวดหมู่นี้</h3>
                <p className="text-zinc-500 text-xs sm:text-sm mb-5 font-normal leading-relaxed">
                  {searchTerm ? "ไม่พบข้อมูลที่ตรงกับคำค้นหา กรุณาลองค้นหาด้วยคำอื่น" : "ร่วมเป็นส่วนหนึ่งในการส่งต่อแรงบันดาลใจและแบ่งปันแนวคิดสร้างสรรค์"}
                </p>
                <button
                  onClick={handleShareClick}
                  className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-xl transition-all shadow-2xs cursor-pointer"
                >
                  + ร่วมแบ่งปันแนวคิดแรก
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedIdeas.map((idea) => {
                  const commentCount = idea.commentsCount !== undefined 
                    ? idea.commentsCount 
                    : (Array.isArray(idea.comments) ? idea.comments.length : 0);
                  const filesCount = Array.isArray(idea.files) ? idea.files.length : 0;
                  const isCopied = copiedId === idea.id;

                  return (
                    <div 
                      key={idea.id} 
                      className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-2xs hover:shadow-md border border-zinc-200/80 transition-all duration-200 hover:-translate-y-0.5"
                    >
                      <Link href={`/ideas/detail?id=${idea.id}`} className="block relative aspect-[4/3] w-full bg-zinc-100 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={idea.coverImageUrl || "https://placehold.co/800x600/F4F4F5/71717A?text=Art+Idea"} 
                          alt={idea.title}
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                          onError={(e) => (e.currentTarget.src = "https://placehold.co/800x600/F4F4F5/71717A?text=Art+Idea")}
                        />
                        
                        {/* Badges on Cover */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                          {idea.category && (
                            <span className="bg-white/95 backdrop-blur-md px-2.5 py-0.5 rounded-md text-[11px] font-medium text-zinc-800 shadow-2xs border border-zinc-200/80">
                              {idea.category}
                            </span>
                          )}
                        </div>

                        {filesCount > 0 && (
                          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-[11px] font-medium text-white shadow-2xs flex items-center gap-1">
                            📎 {filesCount} ไฟล์
                          </div>
                        )}
                      </Link>
                      
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <Link href={`/ideas/detail?id=${idea.id}`}>
                            <h3 className="text-base font-bold text-zinc-900 mb-1.5 line-clamp-2 group-hover:text-zinc-600 transition-colors leading-snug">
                              {idea.title}
                            </h3>
                          </Link>
                          <p className="text-zinc-500 text-xs line-clamp-2 mb-4 font-normal leading-relaxed">
                            {idea.description}
                          </p>
                        </div>
                        
                        <div className="pt-3.5 border-t border-zinc-100 mt-2">
                          <div className="flex items-center justify-between mb-3.5 text-xs text-zinc-500">
                            <span className="font-medium text-zinc-700 truncate max-w-[140px]">{idea.authorName}</span>
                            <div className="flex items-center gap-2 text-[11px]">
                              <span>💬 {commentCount}</span>
                              <button
                                onClick={(e) => handleCopyLink(e, idea.id)}
                                title="คัดลอกลิงก์แชร์"
                                className="w-7 h-7 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors cursor-pointer"
                              >
                                {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Share2 className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>

                          <Link href={`/ideas/detail?id=${idea.id}`} className="block">
                            <div className="w-full text-center py-2 bg-zinc-50 hover:bg-zinc-900 text-zinc-700 hover:text-white font-medium text-xs rounded-xl border border-zinc-200/60 transition-all duration-150">
                              ดูรายละเอียดแนวคิด →
                            </div>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      {/* Guest Login Modal */}
      {showGuestModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity">
          <div className="bg-white rounded-2xl p-6 sm:p-7 max-w-sm w-full relative shadow-xl border border-zinc-200 text-center animate-in fade-in zoom-in-95 duration-150">
            <button 
              onClick={() => setShowGuestModal(false)}
              className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-full transition-all cursor-pointer text-xs"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 border border-zinc-200/80 flex items-center justify-center text-zinc-700 mx-auto mb-4">
              <Lock className="w-5 h-5 text-zinc-700" />
            </div>

            <h3 className="text-lg font-bold text-zinc-900 mb-1.5 tracking-tight">เข้าสู่ระบบเพื่อร่วมแบ่งปัน</h3>
            <p className="text-zinc-500 text-xs leading-relaxed font-normal mb-5">
              กรุณาเข้าสู่ระบบเพื่อร่วมแบ่งปันแนวคิด สื่อการสอน หรือร่วมแสดงความคิดเห็น
            </p>

            <div className="flex flex-col gap-2">
              <Link href="/login?redirect=/ideas/new" className="w-full">
                <button className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs sm:text-sm rounded-xl transition-all shadow-xs cursor-pointer">
                  เข้าสู่ระบบ
                </button>
              </Link>
              <button
                onClick={() => setShowGuestModal(false)}
                className="w-full py-2 text-zinc-500 hover:text-zinc-700 font-medium text-xs transition-colors cursor-pointer"
              >
                ไว้คราวหลัง
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StudentVideoShowcase from "@/components/ideas/StudentVideoShowcase";
import { Lightbulb, Search, Plus, X, Share2, Check, ArrowUpDown, MessageCircle } from "lucide-react";

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
  isFeatured?: number | boolean;
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
    "ทั้งหมด",
    "ใบงาน",
    "รูปภาพ",
    "กิจกรรม",
    "วีดีโอ",
    "สื่อการสอน",
    "เกมส์",
    "ทั่วไป",
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
        {/* Header Section */}
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-3xl text-white mb-6 shadow-lg shadow-orange-500/20 transform hover:scale-105 transition-transform">
              <Lightbulb className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
              ห้องสมุดไอเดียศิลปะ
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
              คลังไอเดีย สื่อการสอน ใบงาน และกิจกรรมสร้างสรรค์ <br className="hidden sm:inline" />
              แบ่งปันโดยคุณครูและนักเรียน ชุมชนศิลปะ Art Room
            </p>
            
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={handleShareClick} 
                className="px-8 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-full transition-all duration-200 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 flex items-center gap-2 text-base"
              >
                <Plus className="w-5 h-5" /> ร่วมแบ่งปันไอเดียใหม่
              </button>
            </div>
          </div>

          {/* Student Creative Video & DIY Showcase (Inspiring Young Creators) */}
          <StudentVideoShowcase />

          {/* Search & Filter Control Bar */}
          <div className="max-w-4xl mx-auto mb-12">
            {/* Row 1: Search Input + Sorting Selector */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search Input */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-4.5 w-4.5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="ค้นหาไอเดีย สื่อการสอน กิจกรรม หรือชื่อผู้แบ่งปัน..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-12 sm:h-13 pl-11 pr-11 rounded-2xl border border-gray-200 bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 outline-none transition-all shadow-2xs text-sm text-gray-800 placeholder-gray-400 font-normal"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Sorting Selector */}
              <div className="flex items-center gap-1.5 shrink-0 bg-white px-3.5 h-12 sm:h-13 rounded-2xl border border-gray-200 shadow-2xs text-xs sm:text-sm">
                <ArrowUpDown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="text-xs text-gray-400 font-normal">เรียง:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "latest" | "comments")}
                  className="bg-transparent text-xs sm:text-sm font-normal text-gray-700 outline-none cursor-pointer pr-1"
                >
                  <option value="latest">ไอเดียล่าสุด</option>
                  <option value="comments">ความคิดเห็นมากที่สุด</option>
                </select>
              </div>
            </div>

            {/* Row 2: Category Filter Pills (Generously Spaced & Elegant) */}
            <div className="mt-8 sm:mt-10">
              <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none sm:flex-wrap">
                <span className="text-xs text-gray-400 font-normal shrink-0 mr-1 hidden sm:inline">
                  หมวดหมู่:
                </span>
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      data-active={isSelected ? "true" : "false"}
                      onClick={() => setSelectedCategory(cat)}
                      style={{
                        backgroundColor: isSelected ? "#ffb300" : "#f3f4f6",
                        color: isSelected ? "#ffffff" : "#374151",
                        border: "none",
                        outline: "none",
                        boxShadow: "none",
                      }}
                      className={`category-btn px-4 py-2 rounded-xl text-xs sm:text-sm font-normal tracking-tight transition-all duration-200 cursor-pointer active:scale-95 hover:-translate-y-0.5 whitespace-nowrap border-0 shrink-0 ${
                        isSelected
                          ? "is-selected bg-[#ffb300] text-white shadow-xs font-medium"
                          : "bg-gray-100 text-gray-700 hover:bg-amber-100/60 hover:text-amber-900"
                      }`}
                    >
                      <span style={{ color: isSelected ? "#ffffff" : "inherit" }}>{cat}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>



          {/* Ideas Grid */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span>
                  {selectedCategory !== "ทั้งหมด"
                    ? `ไอเดียหมวด${selectedCategory}`
                    : sortBy === "latest"
                      ? "ไอเดียล่าสุด"
                      : "ไอเดียทั้งหมด"}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700">
                  {filteredAndSortedIdeas.length} รายการ
                </span>
              </h2>
            </div>
            
            {isLoading ? (
              <div className="flex flex-col justify-center items-center h-64 gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-200 border-t-orange-500"></div>
                <p className="text-sm text-gray-400">กำลังโหลดไอเดีย...</p>
              </div>
            ) : filteredAndSortedIdeas.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 max-w-xl mx-auto">
                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-orange-400">
                  <Lightbulb className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">ไม่พบไอเดียในหมวดหมู่นี้</h3>
                <p className="text-gray-500 text-sm mb-6">
                  {searchTerm ? "ลองค้นหาด้วยคำอื่น หรือเลือกหมวดหมู่อื่นดูนะ" : "ยังไม่มีไอเดียในหมวดหมู่นี้ ร่วมเป็นคนแรกที่แบ่งปันไอเดียดีๆ กันเลย!"}
                </p>
                <button
                  onClick={handleShareClick}
                  className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-all shadow-sm"
                >
                  + แบ่งปันไอเดียตอนนี้
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {filteredAndSortedIdeas.map((idea) => {
                  const commentCount = idea.commentsCount !== undefined 
                    ? idea.commentsCount 
                    : (Array.isArray(idea.comments) ? idea.comments.length : 0);
                  const filesCount = Array.isArray(idea.files) ? idea.files.length : 0;
                  const isCopied = copiedId === idea.id;

                  return (
                    <div 
                      key={idea.id} 
                      className="group flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100/80 transition-all duration-300 hover:-translate-y-1.5"
                    >
                      <Link href={`/ideas/detail?id=${idea.id}`} className="block relative aspect-[4/3] w-full bg-gray-100 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={idea.coverImageUrl || "https://placehold.co/800x600/FFF7ED/EA580C?text=Art+Idea"} 
                          alt={idea.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => (e.currentTarget.src = "https://placehold.co/800x600/FFF7ED/EA580C?text=Art+Idea")}
                        />
                        
                        {/* Badges on Cover */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                          {idea.category && (
                            <span className="bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-orange-600 shadow-sm border border-orange-100">
                              {idea.category}
                            </span>
                          )}
                        </div>

                        {filesCount > 0 && (
                          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold text-white shadow-sm flex items-center gap-1">
                            📎 {filesCount} ไฟล์
                          </div>
                        )}
                      </Link>
                      
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <Link href={`/ideas/detail?id=${idea.id}`}>
                            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-500 transition-colors leading-snug">
                              {idea.title}
                            </h3>
                          </Link>
                          <p className="text-gray-500 text-sm line-clamp-2 mb-4 font-normal leading-relaxed">
                            {idea.description}
                          </p>
                        </div>
                        
                        <div className="pt-4 border-t border-gray-100 mt-2 space-y-3">
                          <div className="flex items-center justify-between">
                            <Link
                              href={`/teachers/profile?name=${encodeURIComponent(idea.authorName || "ครูสลิน")}`}
                              className="group/author flex items-center gap-2.5 min-w-0 cursor-pointer"
                              title="ดูโปรไฟล์คุณครู"
                            >
                              <div className="w-8 h-8 rounded-full bg-[#ffb300] text-white flex items-center justify-center font-bold text-sm uppercase shrink-0 shadow-xs transition-transform duration-200 group-hover/author:scale-110">
                                {(idea.authorName || "ส").charAt(0)}
                              </div>
                              <span className="text-[14px] sm:text-[15px] font-semibold text-gray-800 truncate transition-all duration-200 group-hover/author:scale-105 group-hover/author:text-[#1E3A8A] origin-left inline-block">
                                {idea.authorName || "ครูสลิน"}
                              </span>
                            </Link>

                            <div className="flex items-center gap-3 shrink-0">
                              <div className="flex items-center gap-1.5 text-sm text-gray-600 font-medium">
                                <MessageCircle className="w-4 h-4 text-[#a855f7] fill-[#a855f7]/20" />
                                <span>{commentCount}</span>
                              </div>
                              <button
                                onClick={(e) => handleCopyLink(e, idea.id)}
                                className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-colors shadow-xs ${
                                  isCopied
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                                    : "bg-gray-50/70 border-gray-200/80 text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                                }`}
                                title="คัดลอกลิงก์แชร์"
                              >
                                {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          <Link
                            href={`/ideas/detail?id=${idea.id}`}
                            className="w-full block py-3 rounded-2xl bg-[#FFF9F2] hover:bg-[#FEEFD8] text-[#FF4500] hover:text-[#E03E00] font-bold text-sm text-center transition-all duration-200 border border-orange-100/50"
                          >
                            ดูรายละเอียดไอเดีย →
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full relative shadow-2xl border border-white/20 animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowGuestModal(false)}
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center bg-gray-50 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-4 mt-2">
              <div className="flex justify-center mb-2 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/images/login-mascot.png"
                  alt="Login Mascot"
                  className="w-40 h-40 object-contain animate-bounce relative z-10" 
                  style={{ animationDuration: '3s' }}
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              </div>
              <h3 className="text-2xl font-black text-[#1E3A8A] mb-2 tracking-tight">เข้าสู่ระบบก่อนน้า~</h3>
              <p className="text-gray-500 text-sm font-medium mb-2">เพื่อร่วมแบ่งปันไอเดียดีๆ ให้เพื่อนๆ และคุณครู</p>
            </div>
            <div className="flex flex-col gap-3 px-2 pb-2">
              <Link href="/login?redirect=/ideas/new" className="w-full group">
                <button className="w-full py-3.5 bg-gradient-to-r from-orange-400 to-yellow-400 hover:from-orange-500 hover:to-yellow-500 text-white font-bold text-lg rounded-full transition-all shadow-md shadow-orange-500/20 group-hover:-translate-y-0.5">
                  เข้าสู่ระบบ
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

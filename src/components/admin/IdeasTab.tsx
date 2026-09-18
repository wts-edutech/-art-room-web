"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { 
  Trash2, Lightbulb, CheckCircle, XCircle, Image as ImageIcon, 
  Eye, Link as LinkIcon, Search, MessageSquare, Download, Clock, AlertTriangle, Star,
  Palette, ChevronDown, X, Maximize2
} from "lucide-react";

interface AdminIdeaItem {
  id: string;
  title: string;
  description: string;
  category?: string;
  authorName: string;
  authorEmail?: string;
  coverImageUrl?: string;
  files?: any[];
  link?: string;
  status: 'pending' | 'approved' | 'rejected';
  isFeatured?: number | boolean;
  createdAt: string;
  commentsCount?: number;
  comments?: any[];
}

export default function IdeasTab() {
  const [ideasList, setIdeasList] = useState<AdminIdeaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewIdea, setPreviewIdea] = useState<AdminIdeaItem | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ideas?admin=true");
      const data = await res.json();
      setIdeasList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch ideas", error);
      setIdeasList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openPreview = async (idea: AdminIdeaItem) => {
    setPreviewIdea(idea);
    setIsLoadingDetail(true);
    try {
      const res = await fetch(`/api/ideas/${idea.id}`);
      if (res.ok) {
        const fullData: AdminIdeaItem = (await res.json()) as AdminIdeaItem;
        setPreviewIdea(fullData);
      }
    } catch (e) {
      console.error("Failed to fetch full idea detail", e);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleUpdateIdeaStatus = async (id: string, status: 'pending' | 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/ideas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setIdeasList(prev => prev.map(item => item.id === id ? { ...item, status } : item));
        if (previewIdea && previewIdea.id === id) {
          setPreviewIdea({ ...previewIdea, status });
        }
      } else {
        alert("ไม่สามารถอัปเดตสถานะได้");
      }
    } catch (error) {
      console.error("Failed to update idea status", error);
    }
  };

  const handleDeleteIdea = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบไอเดียนี้? ข้อมูลและคอมเมนต์ทั้งหมดจะถูกลบถาวร")) return;
    try {
      const res = await fetch(`/api/ideas/${id}`, { method: "DELETE" });
      if (res.ok) {
        setIdeasList(prev => prev.filter(item => item.id !== id));
        if (previewIdea && previewIdea.id === id) {
          setPreviewIdea(null);
        }
      } else {
        alert("ไม่สามารถลบไอเดียได้");
      }
    } catch (error) {
      console.error("Failed to delete idea", error);
    }
  };

  const handleDeleteCommentInPreview = async (commentId: string) => {
    if (!previewIdea) return;
    if (!confirm("ต้องการลบความคิดเห็นนี้ใช่หรือไม่?")) return;

    try {
      const res = await fetch(`/api/ideas/${previewIdea.id}/comment?commentId=${commentId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setPreviewIdea({
          ...previewIdea,
          comments: (previewIdea.comments || []).filter((c: any) => c.id !== commentId)
        });
      } else {
        alert("ไม่สามารถลบความคิดเห็นได้");
      }
    } catch (e) {
      alert("เกิดข้อผิดพลาดในการลบความคิดเห็น");
    }
  };

  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    const newFeatured = !currentFeatured;
    try {
      const res = await fetch(`/api/ideas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: newFeatured ? 1 : 0 })
      });
      if (res.ok) {
        setIdeasList(prev => prev.map(item => item.id === id ? { ...item, isFeatured: newFeatured ? 1 : 0 } : item));
        if (previewIdea && previewIdea.id === id) {
          setPreviewIdea({ ...previewIdea, isFeatured: newFeatured ? 1 : 0 });
        }
      } else {
        alert("ไม่สามารถเปลี่ยนสถานะแนะนำได้");
      }
    } catch (error) {
      console.error("Failed to toggle featured status", error);
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = ideasList.length;
    const pending = ideasList.filter(i => i.status === 'pending').length;
    const approved = ideasList.filter(i => i.status === 'approved').length;
    const rejected = ideasList.filter(i => i.status === 'rejected').length;
    const featured = ideasList.filter(i => Boolean(i.isFeatured)).length;
    return { total, pending, approved, rejected, featured };
  }, [ideasList]);

  // Filtered list
  const filteredIdeas = useMemo(() => {
    return ideasList.filter(idea => {
      const matchStatus = filterStatus === "all" 
        ? true 
        : filterStatus === "featured"
        ? Boolean(idea.isFeatured)
        : idea.status === filterStatus;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        (idea.title || "").toLowerCase().includes(q) ||
        (idea.authorName || "").toLowerCase().includes(q) ||
        (idea.category || "").toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }, [ideasList, filterStatus, searchQuery]);

  return (
    <>
      <div className="space-y-6">
        {/* Stat Summary Cards - Luxury Sleek Design */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          {/* All */}
          <div 
            onClick={() => setFilterStatus("all")}
            role="button"
            tabIndex={0}
            className={`group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden ${
              filterStatus === "all" 
                ? "bg-gradient-to-br from-white via-orange-50/40 to-amber-50/30 border-orange-400 shadow-md shadow-orange-500/10 ring-2 ring-orange-400/20" 
                : "bg-white border-slate-200/80 hover:border-orange-200 hover:shadow-xs hover:-translate-y-0.5"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-500 tracking-wide">ไอเดียทั้งหมด</span>
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                filterStatus === "all" ? "bg-orange-500 text-white shadow-2xs" : "bg-slate-100 text-slate-400 group-hover:text-orange-500 group-hover:bg-orange-50"
              }`}>
                <Lightbulb className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-800 tracking-tight font-kanit">
              {stats.total}
            </div>
            <div className={`mt-2 h-1 rounded-full transition-all ${
              filterStatus === "all" ? "bg-gradient-to-r from-orange-500 to-amber-400 w-10" : "bg-transparent group-hover:bg-slate-200 w-6"
            }`} />
          </div>

          {/* Featured */}
          <div 
            onClick={() => setFilterStatus("featured")}
            role="button"
            tabIndex={0}
            className={`group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden ${
              filterStatus === "featured" 
                ? "bg-gradient-to-br from-amber-50/80 via-yellow-50/40 to-white border-amber-400 shadow-md shadow-amber-500/10 ring-2 ring-amber-400/20" 
                : "bg-white border-slate-200/80 hover:border-amber-200 hover:shadow-xs hover:-translate-y-0.5"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-amber-800 tracking-wide flex items-center gap-1">
                แนะนำใหม่
              </span>
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                filterStatus === "featured" ? "bg-amber-500 text-white shadow-2xs" : "bg-amber-50 text-amber-500 group-hover:bg-amber-100"
              }`}>
                <Star className="w-3.5 h-3.5 fill-current" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-900 tracking-tight font-kanit">
              {stats.featured}
            </div>
            <div className={`mt-2 h-1 rounded-full transition-all ${
              filterStatus === "featured" ? "bg-gradient-to-r from-amber-500 to-yellow-400 w-10" : "bg-transparent group-hover:bg-amber-200 w-6"
            }`} />
          </div>

          {/* Pending */}
          <div 
            onClick={() => setFilterStatus("pending")}
            role="button"
            tabIndex={0}
            className={`group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden ${
              filterStatus === "pending" 
                ? "bg-gradient-to-br from-amber-50/70 via-orange-50/30 to-white border-amber-400 shadow-md shadow-amber-500/10 ring-2 ring-amber-400/20" 
                : "bg-white border-slate-200/80 hover:border-amber-200 hover:shadow-xs hover:-translate-y-0.5"
            }`}
          >
            {stats.pending > 0 && (
              <span className="absolute top-2.5 right-2.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
            )}
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-amber-800 tracking-wide">รอตรวจสอบ</span>
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                filterStatus === "pending" ? "bg-amber-500 text-white shadow-2xs" : "bg-amber-50 text-amber-600 group-hover:bg-amber-100"
              }`}>
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-900 tracking-tight font-kanit">
              {stats.pending}
            </div>
            <div className={`mt-2 h-1 rounded-full transition-all ${
              filterStatus === "pending" ? "bg-gradient-to-r from-amber-500 to-orange-400 w-10" : "bg-transparent group-hover:bg-amber-200 w-6"
            }`} />
          </div>

          {/* Approved */}
          <div 
            onClick={() => setFilterStatus("approved")}
            role="button"
            tabIndex={0}
            className={`group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden ${
              filterStatus === "approved" 
                ? "bg-gradient-to-br from-emerald-50/70 via-teal-50/30 to-white border-emerald-400 shadow-md shadow-emerald-500/10 ring-2 ring-emerald-400/20" 
                : "bg-white border-slate-200/80 hover:border-emerald-200 hover:shadow-xs hover:-translate-y-0.5"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-emerald-800 tracking-wide">อนุมัติแล้ว</span>
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                filterStatus === "approved" ? "bg-emerald-500 text-white shadow-2xs" : "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100"
              }`}>
                <CheckCircle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-900 tracking-tight font-kanit">
              {stats.approved}
            </div>
            <div className={`mt-2 h-1 rounded-full transition-all ${
              filterStatus === "approved" ? "bg-gradient-to-r from-emerald-500 to-teal-400 w-10" : "bg-transparent group-hover:bg-emerald-200 w-6"
            }`} />
          </div>

          {/* Rejected */}
          <div 
            onClick={() => setFilterStatus("rejected")}
            role="button"
            tabIndex={0}
            className={`group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden ${
              filterStatus === "rejected" 
                ? "bg-gradient-to-br from-rose-50/70 via-red-50/30 to-white border-rose-400 shadow-md shadow-rose-500/10 ring-2 ring-rose-400/20" 
                : "bg-white border-slate-200/80 hover:border-rose-200 hover:shadow-xs hover:-translate-y-0.5"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-rose-800 tracking-wide">ไม่อนุมัติ</span>
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                filterStatus === "rejected" ? "bg-rose-500 text-white shadow-2xs" : "bg-rose-50 text-rose-600 group-hover:bg-rose-100"
              }`}>
                <XCircle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-rose-900 tracking-tight font-kanit">
              {stats.rejected}
            </div>
            <div className={`mt-2 h-1 rounded-full transition-all ${
              filterStatus === "rejected" ? "bg-gradient-to-r from-rose-500 to-red-400 w-10" : "bg-transparent group-hover:bg-rose-200 w-6"
            }`} />
          </div>
        </div>

        {/* Main Ideas Management Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          {/* Header & Filter Bar */}
          <div className="p-5 md:p-6 border-b border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between bg-gradient-to-r from-slate-50/80 via-white to-orange-50/20 gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 rounded-2xl flex items-center justify-center text-white shadow-sm shadow-orange-500/25 shrink-0">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-800 tracking-tight">
                  จัดการห้องสมุดไอเดีย
                </h2>
                <p className="text-xs text-slate-400 font-normal mt-0.5">
                  ตรวจสอบ อนุมัติ ปักหมุดแนะนำ และดูแลความคิดเห็นจากครูและนักเรียน
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search Bar */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="ค้นหาไอเดีย หรือชื่อผู้แบ่งปัน..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-8 rounded-xl border border-slate-200/90 focus:border-orange-500 focus:ring-3 focus:ring-orange-500/10 outline-none text-xs bg-white transition-all placeholder:text-slate-400 font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter Dropdown */}
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="h-10 px-3.5 rounded-xl border border-slate-200/90 focus:border-orange-500 focus:ring-3 focus:ring-orange-500/10 outline-none text-xs bg-white text-slate-700 font-medium cursor-pointer shadow-2xs transition-all pr-8 appearance-none"
                >
                  <option value="all">สถานะ: ทั้งหมด ({stats.total})</option>
                  <option value="featured">⭐ แนะนำไอเดียใหม่ ({stats.featured})</option>
                  <option value="pending">⏳ รอตรวจสอบ ({stats.pending})</option>
                  <option value="approved">✓ อนุมัติแล้ว ({stats.approved})</option>
                  <option value="rejected">✕ ไม่อนุมัติ ({stats.rejected})</option>
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ChevronDown className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Table View */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="text-center py-20 text-slate-400">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-300 border-t-orange-600 mx-auto mb-3"></div>
                <p className="text-xs font-medium">กำลังโหลดข้อมูลไอเดีย...</p>
              </div>
            ) : filteredIdeas.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-400 flex items-center justify-center mx-auto mb-3 border border-orange-100">
                  <Lightbulb className="w-7 h-7" />
                </div>
                <p className="text-sm font-bold text-slate-700">ไม่พบข้อมูลไอเดีย</p>
                <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนเงื่อนไขการค้นหาหรือตัวกรองสถานะ</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4 w-20">หน้าปก</th>
                    <th className="py-3.5 px-4">หัวข้อไอเดีย</th>
                    <th className="py-3.5 px-4">ผู้แบ่งปัน</th>
                    <th className="py-3.5 px-4">ไฟล์ / คอมเมนต์</th>
                    <th className="py-3.5 px-4">สถานะ</th>
                    <th className="py-3.5 px-4 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredIdeas.map((idea) => {
                    const filesCount = Array.isArray(idea.files) ? idea.files.length : 0;
                    const hasCover = Boolean(idea.coverImageUrl && !brokenImages[idea.id]);
                    return (
                      <tr key={idea.id} className="hover:bg-orange-50/20 transition-all duration-150 group">
                        {/* Cover image */}
                        <td className="py-3 px-4">
                          <div className="w-14 h-11 rounded-xl overflow-hidden border border-slate-200/80 shadow-2xs relative bg-gradient-to-br from-slate-100 to-slate-200 flex-shrink-0">
                            {hasCover ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img 
                                src={idea.coverImageUrl} 
                                alt={idea.title} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={() => setBrokenImages(prev => ({ ...prev, [idea.id]: true }))}
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 text-orange-400">
                                <Palette className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Title & category & date */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-800 text-sm line-clamp-1 group-hover:text-orange-600 transition-colors">
                            {idea.title}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                            {idea.category && (
                              <span className="bg-orange-50 text-orange-700 border border-orange-200/60 px-2 py-0.5 rounded-md font-semibold text-[10px]">
                                {idea.category}
                              </span>
                            )}
                            <span className="text-[11px] text-slate-400">
                              • {new Date(idea.createdAt).toLocaleDateString('th-TH')}
                            </span>
                          </div>
                        </td>

                        {/* Author */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">
                              {idea.authorName ? idea.authorName.charAt(0) : "U"}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-slate-800 truncate">{idea.authorName}</div>
                              {idea.authorEmail && (
                                <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{idea.authorEmail}</div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Engagement */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100/80 text-slate-600 text-[11px] font-medium border border-slate-200/60">
                              📎 {filesCount}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100/80 text-slate-600 text-[11px] font-medium border border-slate-200/60">
                              💬 {idea.commentsCount || 0}
                            </span>
                          </div>
                        </td>

                        {/* Status badge */}
                        <td className="py-3 px-4">
                          <div className="flex flex-col items-start gap-1">
                            {idea.status === 'pending' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
                                <Clock className="w-3 h-3 text-amber-500" /> รอตรวจสอบ
                              </span>
                            )}
                            {idea.status === 'approved' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                                <CheckCircle className="w-3 h-3 text-emerald-500" /> อนุมัติแล้ว
                              </span>
                            )}
                            {idea.status === 'rejected' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200 shadow-2xs">
                                <XCircle className="w-3 h-3 text-rose-500" /> ไม่อนุมัติ
                              </span>
                            )}
                            {Boolean(idea.isFeatured) && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-900 border border-amber-300 shadow-2xs">
                                <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> แนะนำไอเดีย
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4">
                          <div className="flex justify-end items-center gap-1">
                            {/* Featured toggle */}
                            <button
                              onClick={() => handleToggleFeatured(idea.id, Boolean(idea.isFeatured))}
                              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                                Boolean(idea.isFeatured)
                                  ? "text-amber-700 bg-amber-100 hover:bg-amber-200 border border-amber-300 shadow-2xs"
                                  : "text-slate-400 bg-slate-50 hover:bg-amber-50 hover:text-amber-600 border border-slate-200/60"
                              }`}
                              title={Boolean(idea.isFeatured) ? "ปลดออกจากแนะนำไอเดียใหม่" : "ปักหมุดแนะนำไอเดียใหม่"}
                            >
                              <Star className={`w-3.5 h-3.5 ${Boolean(idea.isFeatured) ? "fill-amber-500 text-amber-500" : ""}`} />
                            </button>

                            {/* Preview */}
                            <button 
                              onClick={() => openPreview(idea)} 
                              className="w-8 h-8 rounded-xl text-orange-600 bg-orange-50 hover:bg-orange-100 border border-orange-200/60 shadow-2xs flex items-center justify-center transition-all"
                              title="ตรวจสอบรายละเอียด"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Approve */}
                            {idea.status !== 'approved' && (
                              <button 
                                onClick={() => handleUpdateIdeaStatus(idea.id, 'approved')} 
                                className="w-8 h-8 rounded-xl text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 shadow-2xs flex items-center justify-center transition-all"
                                title="อนุมัติไอเดียนี้"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Reject */}
                            {idea.status !== 'rejected' && (
                              <button 
                                onClick={() => handleUpdateIdeaStatus(idea.id, 'rejected')} 
                                className="w-8 h-8 rounded-xl text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 shadow-2xs flex items-center justify-center transition-all"
                                title="ไม่อนุมัติไอเดียนี้"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Delete */}
                            <button 
                              onClick={() => handleDeleteIdea(idea.id)} 
                              className="w-8 h-8 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent flex items-center justify-center transition-all"
                              title="ลบถาวร"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Preview & Moderation Modal */}
      {previewIdea && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center border border-orange-100 shadow-2xs">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">ตรวจสอบและดูแลไอเดีย</h3>
                  <p className="text-xs text-slate-400">ตรวจสอบเนื้อหา ไฟล์แนบ และความคิดเห็นของผู้ใช้</p>
                </div>
              </div>
              <button 
                onClick={() => setPreviewIdea(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors text-sm"
              >
                ✕
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/40 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Cover Image - Fits screen with ambient blur and click-to-zoom */}
                <div>
                  <div 
                    onClick={() => previewIdea.coverImageUrl && setLightboxImage(previewIdea.coverImageUrl)}
                    className="relative min-h-[220px] max-h-80 w-full bg-slate-900/5 rounded-2xl overflow-hidden border border-slate-200 shadow-2xs flex items-center justify-center group cursor-zoom-in"
                    title="คลิกเพื่อดูภาพขยายเต็มจอ"
                  >
                    {previewIdea.coverImageUrl ? (
                      <>
                        {/* Ambient blur */}
                        <div 
                          className="absolute inset-0 scale-125 blur-2xl opacity-25 pointer-events-none"
                          style={{
                            backgroundImage: `url(${previewIdea.coverImageUrl})`,
                            backgroundPosition: "center",
                            backgroundSize: "cover",
                          }}
                        />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={previewIdea.coverImageUrl} 
                          alt="Cover" 
                          className="relative max-h-80 w-auto max-w-full object-contain rounded-xl transition-transform duration-200 group-hover:scale-[1.02]" 
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-semibold text-xs gap-1.5 backdrop-blur-[1px]">
                          <Maximize2 className="w-4 h-4" />
                          <span>ดูภาพขยายเต็มจอ</span>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-48 flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 text-orange-400 gap-2">
                        <Palette className="w-8 h-8" />
                        <span className="text-xs font-medium text-slate-400">ไม่มีรูปภาพหน้าปก</span>
                      </div>
                    )}
                    {previewIdea.category && (
                      <span className="absolute top-3 left-3 bg-orange-500 text-white font-bold text-xs px-3 py-1 rounded-full shadow-sm z-10">
                        {previewIdea.category}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Right: Info */}
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-800 leading-snug">{previewIdea.title}</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      ผู้แบ่งปัน: <strong className="text-slate-800 font-semibold">{previewIdea.authorName}</strong>
                      {previewIdea.authorEmail && <span className="ml-1 text-slate-400">({previewIdea.authorEmail})</span>}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      วันที่สร้าง: {new Date(previewIdea.createdAt).toLocaleDateString('th-TH')}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-700 mb-1.5">รายละเอียดเนื้อหา:</h4>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 text-slate-700 text-xs whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                      {previewIdea.description}
                    </div>
                  </div>

                  {previewIdea.link && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 mb-1.5">ลิงก์ที่เกี่ยวข้อง:</h4>
                      <a 
                        href={previewIdea.link.startsWith('http') ? previewIdea.link : `https://${previewIdea.link}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-xl border border-orange-100 hover:bg-orange-100 transition-colors text-xs font-medium break-all"
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                        <span>{previewIdea.link}</span>
                      </a>
                    </div>
                  )}

                  {previewIdea.files && previewIdea.files.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 mb-1.5">ไฟล์แนบ ({previewIdea.files.length} ไฟล์):</h4>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto">
                        {previewIdea.files.map((file: any, index: number) => (
                          <a 
                            key={index}
                            href={file.url}
                            download={file.name || `attachment-${index + 1}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl hover:border-orange-400 transition-colors text-xs"
                          >
                            <span className="truncate font-medium text-slate-800">{file.name}</span>
                            <Download className="w-3.5 h-3.5 text-orange-500 shrink-0 ml-2" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Comments Moderation Inside Modal */}
              <div className="pt-4 border-t border-slate-200">
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-orange-500" />
                  <span>ความคิดเห็นทั้งหมด ({previewIdea.comments?.length || 0})</span>
                </h4>

                {isLoadingDetail ? (
                  <p className="text-xs text-slate-400">กำลังโหลดความคิดเห็น...</p>
                ) : previewIdea.comments && previewIdea.comments.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {previewIdea.comments.map((comment: any) => (
                      <div key={comment.id} className="flex items-start justify-between p-3 bg-white border border-slate-200 rounded-xl text-xs">
                        <div>
                          <div className="font-bold text-slate-800 flex items-center gap-2">
                            <span>{comment.authorName}</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('th-TH') : ''}
                            </span>
                          </div>
                          <p className="text-slate-600 mt-1 whitespace-pre-wrap">{comment.text}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteCommentInPreview(comment.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors ml-3"
                          title="ลบความคิดเห็นที่ไม่เหมาะสมนี้"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">ยังไม่มีความคิดเห็นในไอเดียนี้</p>
                )}
              </div>
            </div>

            {/* Modal Footer with Actions */}
            <div className="p-5 sm:p-6 border-t border-slate-100 bg-white flex flex-wrap justify-between items-center gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">สถานะปัจจุบัน:</span>
                {previewIdea.status === 'pending' && <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">รอตรวจสอบ</span>}
                {previewIdea.status === 'approved' && <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">อนุมัติแล้ว</span>}
                {previewIdea.status === 'rejected' && <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">ไม่อนุมัติ</span>}
              </div>
              
              <div className="flex items-center gap-2">
                {previewIdea.status !== 'rejected' && (
                  <Button 
                    variant="outline" 
                    onClick={() => handleUpdateIdeaStatus(previewIdea.id, 'rejected')}
                    className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 text-xs rounded-xl"
                  >
                    <XCircle className="w-4 h-4 mr-1.5" /> ไม่อนุมัติ
                  </Button>
                )}
                {previewIdea.status !== 'approved' && (
                  <Button 
                    onClick={() => handleUpdateIdeaStatus(previewIdea.id, 'approved')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl shadow-xs"
                  >
                    <CheckCircle className="w-4 h-4 mr-1.5" /> อนุมัติไอเดียนี้
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => handleToggleFeatured(previewIdea.id, Boolean(previewIdea.isFeatured))}
                  className={`text-xs rounded-xl ${
                    Boolean(previewIdea.isFeatured)
                      ? "border-amber-400 bg-amber-50 text-amber-800 hover:bg-amber-100 font-bold"
                      : "border-slate-200 text-slate-700 hover:bg-amber-50 hover:text-amber-700"
                  }`}
                >
                  <Star className={`w-4 h-4 mr-1.5 ${Boolean(previewIdea.isFeatured) ? "fill-amber-500 text-amber-500" : ""}`} />
                  {Boolean(previewIdea.isFeatured) ? "ปลดจากแนะนำ" : "ปักหมุดแนะนำ"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDeleteIdea(previewIdea.id)}
                  className="border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 text-xs rounded-xl"
                >
                  <Trash2 className="w-4 h-4 mr-1" /> ลบ
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox for Artwork Cover Image */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer animate-in fade-in duration-150"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-6 right-6 text-white/80 hover:text-white p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            title="ปิดภาพขยาย"
          >
            <X className="w-6 h-6" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxImage}
            alt="Fullscreen preview"
            className="max-h-[92vh] max-w-[95vw] object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-150"
          />
        </div>
      )}
    </>
  );
}

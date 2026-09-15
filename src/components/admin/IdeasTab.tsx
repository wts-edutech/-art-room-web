"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { 
  Trash2, Lightbulb, CheckCircle, XCircle, Image as ImageIcon, 
  Eye, Link as LinkIcon, Search, MessageSquare, Download, Clock, AlertTriangle, Star 
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
        {/* Stat Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div 
            onClick={() => setFilterStatus("all")}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              filterStatus === "all" 
                ? "bg-orange-50/70 border-orange-300 ring-2 ring-orange-400/20" 
                : "bg-white border-gray-100 hover:border-gray-200"
            }`}
          >
            <p className="text-xs font-semibold text-gray-500 mb-1">ไอเดียทั้งหมด</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>

          <div 
            onClick={() => setFilterStatus("featured")}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              filterStatus === "featured" 
                ? "bg-amber-50/90 border-amber-400 ring-2 ring-amber-400/25" 
                : "bg-white border-gray-100 hover:border-gray-200"
            }`}
          >
            <p className="text-xs font-semibold text-amber-700 mb-1 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> แนะนำไอเดียใหม่
            </p>
            <p className="text-2xl font-bold text-amber-900">{stats.featured}</p>
          </div>

          <div 
            onClick={() => setFilterStatus("pending")}
            className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
              filterStatus === "pending" 
                ? "bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/20" 
                : "bg-white border-gray-100 hover:border-gray-200"
            }`}
          >
            {stats.pending > 0 && (
              <span className="absolute top-3 right-3 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
            )}
            <p className="text-xs font-semibold text-amber-700 mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> รอตรวจสอบ
            </p>
            <p className="text-2xl font-bold text-amber-900">{stats.pending}</p>
          </div>

          <div 
            onClick={() => setFilterStatus("approved")}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              filterStatus === "approved" 
                ? "bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-400/20" 
                : "bg-white border-gray-100 hover:border-gray-200"
            }`}
          >
            <p className="text-xs font-semibold text-emerald-700 mb-1 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> อนุมัติแล้ว
            </p>
            <p className="text-2xl font-bold text-emerald-900">{stats.approved}</p>
          </div>

          <div 
            onClick={() => setFilterStatus("rejected")}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              filterStatus === "rejected" 
                ? "bg-red-50/70 border-red-300 ring-2 ring-red-400/20" 
                : "bg-white border-gray-100 hover:border-gray-200"
            }`}
          >
            <p className="text-xs font-semibold text-red-700 mb-1 flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" /> ไม่อนุมัติ
            </p>
            <p className="text-2xl font-bold text-red-900">{stats.rejected}</p>
          </div>
        </div>

        {/* Main Ideas Management Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header & Filter Bar */}
          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row items-stretch md:items-center justify-between bg-gray-50/40 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 font-bold shadow-sm">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">จัดการห้องสมุดไอเดีย</h2>
                <p className="text-xs text-gray-500">ตรวจสอบ อนุมัติ และจัดการไอเดียจากครูและนักเรียน</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อไอเดีย, ผู้แบ่งปัน..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 outline-none text-xs bg-white"
                />
              </div>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-10 px-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none text-xs bg-white font-medium text-gray-700 cursor-pointer"
              >
                <option value="all">สถานะ: ทั้งหมด ({stats.total})</option>
                <option value="featured">⭐ แนะนำไอเดียใหม่ ({stats.featured})</option>
                <option value="pending">รอตรวจสอบ ({stats.pending})</option>
                <option value="approved">อนุมัติแล้ว ({stats.approved})</option>
                <option value="rejected">ไม่อนุมัติ ({stats.rejected})</option>
              </select>
            </div>
          </div>
          
          {/* Table View */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="text-center py-16 text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-300 border-t-orange-600 mx-auto mb-2"></div>
                <p className="text-xs">กำลังโหลดข้อมูลไอเดีย...</p>
              </div>
            ) : filteredIdeas.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Lightbulb className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-medium text-gray-600">ไม่พบข้อมูลไอเดีย</p>
                <p className="text-xs text-gray-400 mt-1">ลองเปลี่ยนเงื่อนไขการค้นหาหรือตัวกรองสถานะ</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/75 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <th className="p-4 w-16">หน้าปก</th>
                    <th className="p-4">หัวข้อไอเดีย</th>
                    <th className="p-4">ผู้แบ่งปัน</th>
                    <th className="p-4">ไฟล์ / คอมเมนต์</th>
                    <th className="p-4">สถานะ</th>
                    <th className="p-4 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {filteredIdeas.map((idea) => {
                    const filesCount = Array.isArray(idea.files) ? idea.files.length : 0;
                    return (
                      <tr key={idea.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="p-4">
                          <div className="w-14 h-11 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-sm flex-shrink-0">
                            {idea.coverImageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={idea.coverImageUrl} alt={idea.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <ImageIcon className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-gray-900 text-sm line-clamp-1 group-hover:text-orange-600 transition-colors">
                            {idea.title}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                            {idea.category && (
                              <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded-xl font-semibold text-[11px]">
                                {idea.category}
                              </span>
                            )}
                            <span>• {new Date(idea.createdAt).toLocaleDateString('th-TH')}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-xs font-semibold text-gray-800">{idea.authorName}</div>
                          {idea.authorEmail && <div className="text-[11px] text-gray-400">{idea.authorEmail}</div>}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-xl font-medium">
                              📎 {filesCount}
                            </span>
                            <span className="text-gray-500 flex items-center gap-1 font-medium">
                              💬 {idea.commentsCount || 0}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col items-start gap-1">
                            {idea.status === 'pending' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                <Clock className="w-3 h-3" /> รอตรวจสอบ
                              </span>
                            )}
                            {idea.status === 'approved' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle className="w-3 h-3" /> อนุมัติแล้ว
                              </span>
                            )}
                            {idea.status === 'rejected' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                                <XCircle className="w-3 h-3" /> ไม่อนุมัติ
                              </span>
                            )}
                            {Boolean(idea.isFeatured) && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> แนะนำไอเดีย
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end items-center gap-1.5">
                            <button
                              onClick={() => handleToggleFeatured(idea.id, Boolean(idea.isFeatured))}
                              className={`p-2 rounded-xl transition-colors ${
                                Boolean(idea.isFeatured)
                                  ? "text-amber-700 bg-amber-100 hover:bg-amber-200 border border-amber-300"
                                  : "text-gray-400 bg-gray-100 hover:bg-amber-50 hover:text-amber-600"
                              }`}
                              title={Boolean(idea.isFeatured) ? "ปลดออกจากแนะนำไอเดียใหม่" : "ปักหมุดแนะนำไอเดียใหม่"}
                            >
                              <Star className={`w-4 h-4 ${Boolean(idea.isFeatured) ? "fill-amber-500 text-amber-500" : ""}`} />
                            </button>
                            <button 
                              onClick={() => openPreview(idea)} 
                              className="p-2 rounded-xl text-orange-500 bg-orange-50 hover:bg-orange-100 transition-colors"
                              title="ตรวจสอบรายละเอียด"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {idea.status !== 'approved' && (
                              <button 
                                onClick={() => handleUpdateIdeaStatus(idea.id, 'approved')} 
                                className="p-2 rounded-xl text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                                title="อนุมัติไอเดียนี้"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            {idea.status !== 'rejected' && (
                              <button 
                                onClick={() => handleUpdateIdeaStatus(idea.id, 'rejected')} 
                                className="p-2 rounded-xl text-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors"
                                title="ไม่อนุมัติไอเดียนี้"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button 
                              onClick={() => handleDeleteIdea(idea.id)} 
                              className="p-2 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                              title="ลบถาวร"
                            >
                              <Trash2 className="w-4 h-4" />
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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-xl font-bold text-gray-900">ตรวจสอบและดูแลไอเดีย</h3>
                <p className="text-xs text-gray-500">ตรวจสอบเนื้อหา ไฟล์แนบ และความคิดเห็นของผู้ใช้</p>
              </div>
              <button 
                onClick={() => setPreviewIdea(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50/40 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Cover Image */}
                <div>
                  <div className="aspect-video bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative">
                    {previewIdea.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={previewIdea.coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                        <ImageIcon className="w-8 h-8" />
                        <span className="text-xs">ไม่มีรูปภาพหน้าปก</span>
                      </div>
                    )}
                    {previewIdea.category && (
                      <span className="absolute top-3 left-3 bg-orange-500 text-white font-bold text-xs px-3 py-1 rounded-full shadow">
                        {previewIdea.category}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Right: Info */}
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-gray-900 leading-snug">{previewIdea.title}</h2>
                    <p className="text-xs text-gray-500 mt-1">
                      ผู้แบ่งปัน: <strong className="text-gray-800 font-semibold">{previewIdea.authorName}</strong>
                      {previewIdea.authorEmail && <span className="ml-1 text-gray-400">({previewIdea.authorEmail})</span>}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      วันที่สร้าง: {new Date(previewIdea.createdAt).toLocaleDateString('th-TH')}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-gray-700 mb-1">รายละเอียดเนื้อหา:</h4>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 text-gray-700 text-xs whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                      {previewIdea.description}
                    </div>
                  </div>

                  {previewIdea.link && (
                    <div>
                      <h4 className="text-xs font-bold text-gray-700 mb-1">ลิงก์ที่เกี่ยวข้อง:</h4>
                      <a 
                        href={previewIdea.link.startsWith('http') ? previewIdea.link : `https://${previewIdea.link}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-2xl border border-orange-100 hover:bg-orange-100 transition-colors text-xs font-medium break-all"
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                        <span>{previewIdea.link}</span>
                      </a>
                    </div>
                  )}

                  {previewIdea.files && previewIdea.files.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-gray-700 mb-1">ไฟล์แนบ ({previewIdea.files.length} ไฟล์):</h4>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto">
                        {previewIdea.files.map((file: any, index: number) => (
                          <a 
                            key={index}
                            href={file.url}
                            download={file.name || `attachment-${index + 1}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-xl hover:border-orange-400 transition-colors text-xs"
                          >
                            <span className="truncate font-medium text-gray-800">{file.name}</span>
                            <Download className="w-3.5 h-3.5 text-orange-500 shrink-0 ml-2" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Comments Moderation Inside Modal */}
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-orange-500" />
                  <span>ความคิดเห็นทั้งหมด ({previewIdea.comments?.length || 0})</span>
                </h4>

                {isLoadingDetail ? (
                  <p className="text-xs text-gray-400">กำลังโหลดความคิดเห็น...</p>
                ) : previewIdea.comments && previewIdea.comments.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {previewIdea.comments.map((comment: any) => (
                      <div key={comment.id} className="flex items-start justify-between p-3 bg-white border border-gray-200 rounded-xl text-xs">
                        <div>
                          <div className="font-bold text-gray-800 flex items-center gap-2">
                            <span>{comment.authorName}</span>
                            <span className="text-[10px] text-gray-400 font-normal">
                              {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('th-TH') : ''}
                            </span>
                          </div>
                          <p className="text-gray-600 mt-1 whitespace-pre-wrap">{comment.text}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteCommentInPreview(comment.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-colors ml-3"
                          title="ลบความคิดเห็นที่ไม่เหมาะสมนี้"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">ยังไม่มีความคิดเห็นในไอเดียนี้</p>
                )}
              </div>
            </div>

            {/* Modal Footer with Actions */}
            <div className="p-6 border-t border-gray-100 bg-white flex flex-wrap justify-between items-center gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">สถานะปัจจุบัน:</span>
                {previewIdea.status === 'pending' && <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">รอตรวจสอบ</span>}
                {previewIdea.status === 'approved' && <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">อนุมัติแล้ว</span>}
                {previewIdea.status === 'rejected' && <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">ไม่อนุมัติ</span>}
              </div>
              
              <div className="flex items-center gap-2">
                {previewIdea.status !== 'rejected' && (
                  <Button 
                    variant="outline" 
                    onClick={() => handleUpdateIdeaStatus(previewIdea.id, 'rejected')}
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 text-xs"
                  >
                    <XCircle className="w-4 h-4 mr-1.5" /> ไม่อนุมัติ
                  </Button>
                )}
                {previewIdea.status !== 'approved' && (
                  <Button 
                    onClick={() => handleUpdateIdeaStatus(previewIdea.id, 'approved')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                  >
                    <CheckCircle className="w-4 h-4 mr-1.5" /> อนุมัติไอเดียนี้
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => handleToggleFeatured(previewIdea.id, Boolean(previewIdea.isFeatured))}
                  className={`text-xs ${
                    Boolean(previewIdea.isFeatured)
                      ? "border-amber-400 bg-amber-50 text-amber-800 hover:bg-amber-100 font-bold"
                      : "border-gray-200 text-gray-700 hover:bg-amber-50 hover:text-amber-700"
                  }`}
                >
                  <Star className={`w-4 h-4 mr-1.5 ${Boolean(previewIdea.isFeatured) ? "fill-amber-500 text-amber-500" : ""}`} />
                  {Boolean(previewIdea.isFeatured) ? "ปลดจากแนะนำ" : "ปักหมุดแนะนำ"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDeleteIdea(previewIdea.id)}
                  className="border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 text-xs"
                >
                  <Trash2 className="w-4 h-4 mr-1" /> ลบ
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

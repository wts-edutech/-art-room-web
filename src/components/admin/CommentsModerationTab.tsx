"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  MessageSquare, Trash2, Search, AlertTriangle, CheckCircle2, 
  RefreshCw, Filter, ExternalLink, ShieldAlert, Sparkles,
  GraduationCap, ShieldCheck, User, MessageCircle, AlertCircle,
  Clock, ArrowUpDown
} from "lucide-react";
import { resolveUserAvatar } from "@/lib/art-avatars";

interface CommentModerationItem {
  id: string;
  lessonId: string;
  author: string;
  authorEmail?: string;
  authorImage?: string;
  text: string;
  time: string;
  isFlagged?: boolean;
  flaggedWord?: string;
}

export default function CommentsModerationTab() {
  const [comments, setComments] = useState<CommentModerationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "flagged" | "ideas" | "lessons">("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/comments?admin=true&lessonId=all");
      if (res.ok) {
        const data = await res.json();
        setComments(Array.isArray(data) ? data : []);
      } else {
        setComments([]);
      }
    } catch (err) {
      console.error("Failed to fetch comments", err);
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = comments.length;
    const flagged = comments.filter((c) => c.isFlagged).length;
    const ideas = comments.filter((c) => c.lessonId === "ideas-hub").length;
    const lessons = comments.filter((c) => c.lessonId !== "ideas-hub").length;
    return { total, flagged, ideas, lessons };
  }, [comments]);

  // Filter and search
  const filteredComments = useMemo(() => {
    return comments.filter((comment) => {
      // Category filter
      if (activeFilter === "flagged" && !comment.isFlagged) return false;
      if (activeFilter === "ideas" && comment.lessonId !== "ideas-hub") return false;
      if (activeFilter === "lessons" && comment.lessonId === "ideas-hub") return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const textMatch = (comment.text || "").toLowerCase().includes(query);
        const authorMatch = (comment.author || "").toLowerCase().includes(query);
        const lessonMatch = (comment.lessonId || "").toLowerCase().includes(query);
        const flaggedMatch = (comment.flaggedWord || "").toLowerCase().includes(query);
        return textMatch || authorMatch || lessonMatch || flaggedMatch;
      }

      return true;
    });
  }, [comments, activeFilter, searchQuery]);

  // Format date
  const formatTime = (timeStr?: string) => {
    if (!timeStr) return "-";
    try {
      const d = new Date(timeStr);
      return new Intl.DateTimeFormat("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
    } catch {
      return timeStr;
    }
  };

  // Delete single comment
  const handleDeleteComment = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบความคิดเห็นนี้? การดำเนินการนี้ไม่สามารถยกเลิกได้")) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/comments?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== id));
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        showToast("success", "ลบความคิดเห็นเรียบร้อยแล้ว");
      } else {
        showToast("error", "ไม่สามารถลบความคิดเห็นได้ กรุณาลองใหม่อีกครั้ง");
      }
    } catch (err) {
      console.error("Delete error:", err);
      showToast("error", "เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setDeletingId(null);
    }
  };

  // Bulk delete selected
  const handleBulkDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`คุณต้องการลบความคิดเห็นที่เลือกจำนวน ${selectedIds.size} รายการใช่หรือไม่?`)) {
      return;
    }

    setIsBulkDeleting(true);
    const idsToDelete = Array.from(selectedIds);
    try {
      const res = await fetch("/api/comments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: idsToDelete }),
      });

      if (res.ok) {
        setComments((prev) => prev.filter((c) => !selectedIds.has(c.id)));
        setSelectedIds(new Set());
        showToast("success", `ลบความคิดเห็นจำนวน ${idsToDelete.length} รายการสำเร็จแล้ว`);
      } else {
        showToast("error", "ไม่สามารถลบความคิดเห็นได้ กรุณาลองใหม่อีกครั้ง");
      }
    } catch (err) {
      console.error("Bulk delete error:", err);
      showToast("error", "เกิดข้อผิดพลาดในการลบความคิดเห็น");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Bulk delete all flagged
  const handleCleanAllFlagged = async () => {
    const flaggedItems = comments.filter((c) => c.isFlagged);
    if (flaggedItems.length === 0) {
      alert("ไม่พบความคิดเห็นที่มีข้อความสุ่มเสี่ยงในระบบขณะนี้");
      return;
    }

    if (!confirm(`ต้องการล้างข้อความที่มีคำไม่สุภาพ/สุ่มเสี่ยงทั้งหมดจำนวน ${flaggedItems.length} รายการใช่หรือไม่?`)) {
      return;
    }

    setIsBulkDeleting(true);
    const idsToDelete = flaggedItems.map((c) => c.id);
    try {
      const res = await fetch("/api/comments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: idsToDelete }),
      });

      if (res.ok) {
        setComments((prev) => prev.filter((c) => !c.isFlagged));
        showToast("success", `ล้างข้อความสุ่มเสี่ยงจำนวน ${idsToDelete.length} รายการเรียบร้อยแล้ว`);
      } else {
        showToast("error", "เกิดข้อผิดพลาดในการล้างข้อความ");
      }
    } catch (err) {
      console.error("Clean all flagged error:", err);
      showToast("error", "ไม่สามารถล้างข้อความได้");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Toggle selection
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllFiltered = () => {
    if (selectedIds.size === filteredComments.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredComments.map((c) => c.id)));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-sm font-semibold transition-all ${
          notification.type === "success" 
            ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
            : "bg-red-50 text-red-800 border-red-200"
        }`}>
          {notification.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-orange-500/15 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold mb-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Moderation & Security Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              จัดการความคิดเห็น & บอร์ดสนทนา
            </h1>
            <p className="text-orange-50 text-xs sm:text-sm mt-1 max-w-2xl font-light">
              คัดกรอง ตรวจจับคำไม่สุภาพ และควบคุมดูแลความเรียบร้อยของข้อความทั้งหมดในห้องเรียนศิลปะ Art Room
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={fetchComments}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              <span>รีเฟรช</span>
            </button>
            {stats.flagged > 0 && (
              <button
                onClick={handleCleanAllFlagged}
                disabled={isBulkDeleting}
                className="px-4 py-2.5 rounded-2xl bg-white text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
                <span>ล้างคำหยาบทั้งหมด ({stats.flagged})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Total */}
        <div 
          onClick={() => setActiveFilter("all")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeFilter === "all" 
              ? "bg-orange-50 border-orange-300 ring-2 ring-orange-400/20 shadow-sm" 
              : "bg-white border-gray-100 hover:border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">ความคิดเห็นทั้งหมด</span>
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">{stats.total}</div>
          <span className="text-[11px] text-gray-400">จากทุกกระดานในระบบ</span>
        </div>

        {/* Card 2: Flagged / Inappropriate */}
        <div 
          onClick={() => setActiveFilter("flagged")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeFilter === "flagged" 
              ? "bg-red-50 border-red-300 ring-2 ring-red-400/20 shadow-sm" 
              : "bg-white border-gray-100 hover:border-red-100"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-red-600">ข้อความสุ่มเสี่ยง / คำหยาบ</span>
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-red-600">{stats.flagged}</div>
          <span className="text-[11px] text-red-400 font-medium">ตรวจพบถ้อยคำไม่เหมาะสม</span>
        </div>

        {/* Card 3: Ideas Hub */}
        <div 
          onClick={() => setActiveFilter("ideas")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeFilter === "ideas" 
              ? "bg-amber-50 border-amber-300 ring-2 ring-amber-400/20 shadow-sm" 
              : "bg-white border-gray-100 hover:border-amber-100"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-700">กระดานแชร์ไอเดีย</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">{stats.ideas}</div>
          <span className="text-[11px] text-amber-600">หน้า /ideas</span>
        </div>

        {/* Card 4: Lessons */}
        <div 
          onClick={() => setActiveFilter("lessons")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeFilter === "lessons" 
              ? "bg-blue-50 border-blue-300 ring-2 ring-blue-400/20 shadow-sm" 
              : "bg-white border-gray-100 hover:border-blue-100"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-700">บทเรียน & คลังสื่อ</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">{stats.lessons}</div>
          <span className="text-[11px] text-blue-500">บทเรียน ม.3, ม.4 และอื่นๆ</span>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        {/* Toolbar Bar */}
        <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === "all"
                  ? "bg-gray-900 text-white shadow-xs"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              ทั้งหมด ({stats.total})
            </button>
            <button
              onClick={() => setActiveFilter("flagged")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeFilter === "flagged"
                  ? "bg-red-600 text-white shadow-xs shadow-red-600/20"
                  : "bg-red-50 text-red-600 hover:bg-red-100"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>สุ่มเสี่ยง / คำหยาบ ({stats.flagged})</span>
            </button>
            <button
              onClick={() => setActiveFilter("ideas")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === "ideas"
                  ? "bg-amber-500 text-white shadow-xs shadow-amber-500/20"
                  : "bg-amber-50 text-amber-700 hover:bg-amber-100"
              }`}
            >
              แชร์ไอเดีย ({stats.ideas})
            </button>
            <button
              onClick={() => setActiveFilter("lessons")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === "lessons"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100"
              }`}
            >
              บทเรียน ({stats.lessons})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาข้อความ, ชื่อผู้โพสต์..."
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-800 placeholder-gray-400 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
              >
                ล้าง
              </button>
            )}
          </div>
        </div>

        {/* Bulk Action Bar (when selected) */}
        {selectedIds.size > 0 && (
          <div className="bg-amber-50 border-b border-amber-100 px-6 py-3 flex items-center justify-between gap-4 animate-in fade-in">
            <span className="text-xs font-bold text-amber-900">
              เลือกความคิดเห็นอยู่ {selectedIds.size} รายการ
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedIds(new Set())}
                className="px-3 py-1.5 rounded-lg bg-white border border-amber-200 text-xs font-semibold text-gray-600 hover:bg-amber-100 transition-colors"
              >
                ยกเลิกการเลือก
              </button>
              <button
                onClick={handleBulkDeleteSelected}
                disabled={isBulkDeleting}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ลบ {selectedIds.size} รายการที่เลือก</span>
              </button>
            </div>
          </div>
        )}

        {/* Comments Feed List */}
        <div className="divide-y divide-gray-100">
          {isLoading ? (
            <div className="py-20 text-center text-gray-400 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-orange-500" />
              <p className="text-xs font-medium">กำลังโหลดรายการความคิดเห็น...</p>
            </div>
          ) : filteredComments.length === 0 ? (
            <div className="py-20 text-center text-gray-400 space-y-3">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto text-gray-300">
                <MessageSquare className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold text-gray-600">ไม่พบความคิดเห็นที่ตรงตามเงื่อนไข</p>
              <p className="text-xs text-gray-400">
                {searchQuery ? "ลองเปลี่ยนคำค้นหาใหม่อีกครั้ง" : "ระบบยังไม่มีความคิดเห็นในหมวดหมู่นี้"}
              </p>
            </div>
          ) : (
            filteredComments.map((comment) => {
              const isSelected = selectedIds.has(comment.id);
              const isDeleting = deletingId === comment.id;
              const resolvedAvatar = resolveUserAvatar(comment.authorImage, comment.author);
              const isIdeasHub = comment.lessonId === "ideas-hub";
              const isTeacher = comment.author.includes("ครู") || comment.author.includes("อาจารย์");
              const isAdmin = comment.author.includes("(Admin)");

              return (
                <div
                  key={comment.id}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row items-start gap-4 transition-all duration-150 ${
                    comment.isFlagged
                      ? "bg-red-50/40 hover:bg-red-50/70"
                      : isSelected
                        ? "bg-orange-50/40 hover:bg-orange-50/60"
                        : "hover:bg-gray-50/70"
                  }`}
                >
                  {/* Select Checkbox */}
                  <div className="pt-1 shrink-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(comment.id)}
                      className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400 cursor-pointer"
                    />
                  </div>

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-white shadow-xs border border-gray-200 flex items-center justify-center shrink-0">
                    {resolvedAvatar.type === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={resolvedAvatar.value} alt={comment.author} className="w-full h-full object-cover" />
                    ) : resolvedAvatar.type === "preset" ? (
                      <span className="text-lg select-none">{resolvedAvatar.value}</span>
                    ) : (
                      <span className="text-xs font-bold text-gray-700">{resolvedAvatar.value}</span>
                    )}
                  </div>

                  {/* Comment Details */}
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Header Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-gray-900">
                          {comment.author}
                        </span>

                        {/* Role Badge */}
                        {isAdmin ? (
                          <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-red-600" />
                            <span>ผู้ดูแลระบบ</span>
                          </span>
                        ) : isTeacher ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                            <GraduationCap className="w-3 h-3 text-emerald-700" />
                            <span>คุณครู</span>
                          </span>
                        ) : (
                          <span className="text-[10px] bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded-md">
                            นักเรียน/ทั่วไป
                          </span>
                        )}

                        {/* Source Board Badge */}
                        <a
                          href={isIdeasHub ? "/ideas" : `/materials`}
                          target="_blank"
                          rel="noreferrer"
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1 hover:underline ${
                            isIdeasHub
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          <span>{isIdeasHub ? "💡 กระดานแชร์ไอเดีย" : `🎨 ${comment.lessonId}`}</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </a>

                        {/* Flagged Warning Badge */}
                        {comment.isFlagged && (
                          <span className="text-[10px] bg-red-600 text-white font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs animate-pulse">
                            <AlertTriangle className="w-3 h-3" />
                            <span>พบคำสุ่มเสี่ยง: &quot;{comment.flaggedWord || "คำไม่สุภาพ"}&quot;</span>
                          </span>
                        )}
                      </div>

                      {/* Time */}
                      <span className="text-[11px] text-gray-400 font-light flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(comment.time)}
                      </span>
                    </div>

                    {/* Text Body */}
                    <div className={`p-3 rounded-xl text-xs sm:text-sm leading-relaxed ${
                      comment.isFlagged 
                        ? "bg-red-50 text-red-900 border border-red-200/80 font-medium" 
                        : "bg-gray-50 text-gray-800 border border-gray-100"
                    }`}>
                      {comment.text}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="shrink-0 flex sm:flex-col items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      disabled={isDeleting}
                      className="px-3 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-red-600 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-2xs"
                      title="ลบความคิดเห็นนี้ถาวร"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isDeleting ? "กำลังลบ..." : "ลบข้อความ"}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        {filteredComments.length > 0 && (
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>แสดงผล {filteredComments.length} จากทั้งหมด {comments.length} รายการ</span>
            <button
              onClick={selectAllFiltered}
              className="font-semibold text-orange-600 hover:text-orange-700 cursor-pointer"
            >
              {selectedIds.size === filteredComments.length ? "ยกเลิกการเลือกทั้งหมด" : "เลือกทั้งหมดในหน้านี้"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

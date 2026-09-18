"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Trash2, 
  Plus, 
  Pencil, 
  Newspaper, 
  Calendar as CalendarIcon, 
  ExternalLink, 
  Clock, 
  MapPin, 
  Search, 
  Tag,
  AlertCircle
} from "lucide-react";
import CalendarView, { Activity } from "@/components/ui/CalendarView";
import PRImageGuide from "./PRImageGuide";
import { optimizeImageToFile } from "@/lib/image-optimizer";

export default function NewsTab() {
  const [subTab, setSubTab] = useState<"news" | "calendar">("news");

  // News states
  const [newsList, setNewsList] = useState<any[]>([]);
  const [newsTitle, setNewsTitle] = useState("");
  const [newsExcerpt, setNewsExcerpt] = useState("");
  const [newsSource, setNewsSource] = useState("Art Room");
  const [newsDate, setNewsDate] = useState("");
  const [newsImageUrl, setNewsImageUrl] = useState("");
  const [newsImageFile, setNewsImageFile] = useState<File | null>(null);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [isNewsLoading, setIsNewsLoading] = useState(true);

  // Activities / Calendar states
  const [activitiesList, setActivitiesList] = useState<Activity[]>([]);
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(true);
  const [calendarSearch, setCalendarSearch] = useState("");

  const fetchNewsData = async () => {
    setIsNewsLoading(true);
    try {
      const res = await fetch("/api/news");
      const data = await res.json();
      setNewsList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch news", error);
      setNewsList([]);
    } finally {
      setIsNewsLoading(false);
    }
  };

  const fetchActivitiesData = async () => {
    setIsActivitiesLoading(true);
    try {
      const res = await fetch("/api/activities");
      const data = await res.json();
      setActivitiesList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch activities", error);
      setActivitiesList([]);
    } finally {
      setIsActivitiesLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsData();
    fetchActivitiesData();
  }, []);

  // News handlers
  const handleAddNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle || !newsExcerpt || !newsDate) return;
    if (!editingNewsId && !newsImageFile && !newsImageUrl) {
      alert("กรุณาเลือกรูปภาพข่าวสาร");
      return;
    }
    
    const formData = new FormData();
    if (editingNewsId) formData.append("id", editingNewsId);
    formData.append("title", newsTitle);
    formData.append("excerpt", newsExcerpt);
    formData.append("source", newsSource);
    formData.append("date", newsDate);
    
    if (newsImageFile) {
      const compressed = await optimizeImageToFile(newsImageFile, { maxWidth: 1600, maxHeight: 1600, quality: 0.82 });
      formData.append("image", compressed);
    } else if (newsImageUrl) {
      formData.append("imageUrl", newsImageUrl);
    }

    try {
      const method = editingNewsId ? "PUT" : "POST";
      const res = await fetch("/api/news", {
        method,
        body: formData,
      });
      if (res.ok) {
        resetNewsForm();
        fetchNewsData();
      } else {
        const err = (await res.json()) as any;
        alert(err.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (error) {
      console.error("Failed to save news", error);
      alert("ไม่สามารถบันทึกข่าวสารได้");
    }
  };

  const resetNewsForm = () => {
    setNewsTitle("");
    setNewsExcerpt("");
    setNewsSource("Art Room");
    setNewsDate("");
    setNewsImageUrl("");
    setNewsImageFile(null);
    setEditingNewsId(null);
    const fileInput = document.getElementById("newsImageInput") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleEditNews = (news: any) => {
    setNewsTitle(news.title);
    setNewsExcerpt(news.excerpt);
    setNewsSource(news.source || "Art Room");
    setNewsDate(news.date);
    setNewsImageUrl(news.imageUrl);
    setNewsImageFile(null);
    setEditingNewsId(news.id);
  };

  const handleDeleteNews = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบข่าวสารนี้?")) return;
    try {
      const res = await fetch(`/api/news?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchNewsData();
    } catch (error) {
      console.error("Failed to delete news", error);
    }
  };

  const handleDeleteActivity = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบกิจกรรมนี้ออกจากปฏิทิน?")) return;
    try {
      const res = await fetch(`/api/activities?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchActivitiesData();
    } catch (error) {
      console.error("Failed to delete activity", error);
    }
  };

  // Filtered activities for the list view below the calendar
  const filteredActivities = useMemo(() => {
    if (!calendarSearch.trim()) return activitiesList;
    const q = calendarSearch.toLowerCase();
    return activitiesList.filter(act => 
      act.title.toLowerCase().includes(q) ||
      (act.category && act.category.toLowerCase().includes(q)) ||
      (act.location && act.location.toLowerCase().includes(q)) ||
      (act.date && act.date.toLowerCase().includes(q))
    );
  }, [activitiesList, calendarSearch]);

  const colorBadgeMap: Record<string, { bg: string; text: string; label: string }> = {
    red: { bg: "bg-red-50 text-red-700 border-red-200", text: "text-red-600", label: "สำคัญ/สอบ" },
    orange: { bg: "bg-orange-50 text-orange-700 border-orange-200", text: "text-orange-600", label: "เวิร์กช็อป" },
    blue: { bg: "bg-blue-50 text-blue-700 border-blue-200", text: "text-blue-600", label: "การเรียนการสอน" },
    green: { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", text: "text-emerald-600", label: "นิทรรศการ" },
    purple: { bg: "bg-purple-50 text-purple-700 border-purple-200", text: "text-purple-600", label: "ประกวด" }
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setSubTab("news")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              subTab === "news"
                ? "bg-white text-orange-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Newspaper className="w-4 h-4 text-orange-500" />
            <span>ข่าวสารประชาสัมพันธ์</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              subTab === "news" ? "bg-orange-100 text-orange-700" : "bg-slate-200 text-slate-600"
            }`}>
              {newsList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab("calendar")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              subTab === "calendar"
                ? "bg-white text-orange-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CalendarIcon className="w-4 h-4 text-orange-500" />
            <span>ปฏิทินกิจกรรมศิลปะ</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              subTab === "calendar" ? "bg-orange-100 text-orange-700" : "bg-slate-200 text-slate-600"
            }`}>
              {activitiesList.length}
            </span>
          </button>
        </div>

        {/* Live Preview Shortcut */}
        <Link
          href="/news"
          target="_blank"
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-orange-600 hover:bg-orange-50/70 border border-slate-200 transition-colors shrink-0"
        >
          <span>เปิดดูหน้าข่าวสาร & ปฏิทินจริง</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </Link>
      </div>

      {/* SUB-TAB 1: NEWS MANAGEMENT */}
      {subTab === "news" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* News Form Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 sticky top-8">
              <div className="flex items-center gap-2 mb-5 border-b border-slate-100 pb-3.5">
                {editingNewsId ? <Pencil className="w-4 h-4 text-orange-500" /> : <Plus className="w-4 h-4 text-orange-500" />}
                <h2 className="text-base font-bold text-slate-800">
                  {editingNewsId ? "แก้ไขข่าวสาร" : "เพิ่มข่าวสารใหม่"}
                </h2>
              </div>
              <form onSubmit={handleAddNews} className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">หัวข้อข่าวสาร</label>
                  <input type="text" required value={newsTitle} onChange={(e) => setNewsTitle(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-xs bg-white" placeholder="ระบุหัวข้อข่าวสาร" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">เนื้อหาย่อ</label>
                  <textarea required value={newsExcerpt} onChange={(e) => setNewsExcerpt(e.target.value)} className="w-full h-20 p-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-xs resize-none bg-white leading-relaxed" placeholder="ระบุเนื้อหาย่อสรุป..." />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">แหล่งที่มา / ผู้เขียน</label>
                  <input type="text" value={newsSource} onChange={(e) => setNewsSource(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-xs bg-white" placeholder="เช่น กลุ่มสาระการเรียนรู้ศิลปะ" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">วันที่ (เช่น 6 พ.ย. 2568)</label>
                  <input type="text" required value={newsDate} onChange={(e) => setNewsDate(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-xs bg-white" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    รูปภาพปกข่าว {editingNewsId && <span className="text-[11px] font-normal text-slate-400">(ไม่ต้องเลือกหากใช้รูปเดิม)</span>}
                  </label>

                  {/* PR Image Guidelines Box */}
                  <PRImageGuide />

                  <div className="relative border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-orange-50/30 hover:border-orange-300 transition-colors rounded-2xl p-5 text-center cursor-pointer overflow-hidden group">
                    <input 
                      id="newsImageInput"
                      type="file" 
                      accept="image/jpeg, image/jpg, image/png, image/webp"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setNewsImageFile(e.target.files[0]);
                        } else {
                          setNewsImageFile(null);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center justify-center relative z-0">
                      <span className="text-xl mb-1">📰</span>
                      <p className="text-slate-700 font-semibold text-xs mb-0.5 group-hover:text-orange-600 transition-colors">คลิกหรือลากไฟล์ภาพมาที่นี่</p>
                      <p className="text-slate-400 text-[11px]">รองรับ JPG, PNG, WebP (Banner 1.91:1, โปสเตอร์ 3:4)</p>
                    </div>
                  </div>
                  
                  {newsImageFile ? (
                    <div className="mt-3 relative w-full aspect-video flex items-center justify-center bg-slate-100 rounded-xl overflow-hidden border border-slate-200 p-2 shadow-inner">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={URL.createObjectURL(newsImageFile)} alt="preview" className="max-h-full w-auto max-w-full object-contain rounded-lg" />
                    </div>
                  ) : editingNewsId && newsImageUrl ? (
                    <div className="mt-3 relative w-full aspect-video flex items-center justify-center bg-slate-100 rounded-xl overflow-hidden border border-slate-200 p-2 shadow-inner">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={newsImageUrl} alt="preview" className="max-h-full w-auto max-w-full object-contain rounded-lg" onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400/eeeeee/999999?text=Image+Not+Found")} />
                      <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-md font-semibold">รูปเดิม</div>
                    </div>
                  ) : null}
                </div>
                
                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  <Button type="submit" className="flex-1 h-9 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs">
                    {editingNewsId ? "บันทึกการแก้ไข" : "เพิ่มข่าวสาร"}
                  </Button>
                  {editingNewsId && (
                    <Button type="button" variant="outline" onClick={resetNewsForm} className="rounded-xl px-3.5 h-9 border-slate-200 text-xs">ยกเลิก</Button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* News List Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-5 border-b border-slate-100 pb-3.5">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold shadow-2xs">
                  <Newspaper className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">รายการข่าวสาร ({newsList.length})</h2>
                  <p className="text-[11px] text-slate-400">ข่าวสารและประกาศประชาสัมพันธ์ห้องเรียนศิลปะ</p>
                </div>
              </div>
              {isNewsLoading ? (
                <div className="text-center py-16 text-slate-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-300 border-t-orange-600 mx-auto mb-2"></div>
                  <p className="text-xs font-medium">กำลังโหลด...</p>
                </div>
              ) : newsList.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <Newspaper className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-700">ไม่มีข้อมูลข่าวสาร</p>
                  <p className="text-xs text-slate-400 mt-1">เพิ่มข่าวสารและประชาสัมพันธ์ใหม่จากแบบฟอร์มด้านข้าง</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(Array.isArray(newsList) ? newsList : []).map((news) => (
                    <div key={news.id} className="flex flex-col sm:flex-row gap-3.5 p-3.5 bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-orange-200 transition-all duration-200 group">
                      <div className="w-full sm:w-36 h-28 sm:h-24 bg-slate-100 relative rounded-xl overflow-hidden shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={news.imageUrl} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400/eeeeee/999999?text=Image+Not+Found")} />
                      </div>
                      <div className="flex-1 flex flex-col justify-center min-w-0">
                        <h3 className="font-bold text-slate-800 truncate mb-0.5 text-xs sm:text-sm group-hover:text-orange-600 transition-colors" title={news.title}>{news.title}</h3>
                        <p className="text-[11px] text-slate-400 mb-1 truncate">{news.date} • {news.source}</p>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{news.excerpt}</p>
                      </div>
                      <div className="flex sm:flex-col justify-end sm:justify-center gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <button onClick={() => handleEditNews(news)} className="h-7.5 px-3 sm:px-0 sm:w-7.5 rounded-lg flex items-center justify-center text-xs font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 transition-colors active:scale-95" title="แก้ไข">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDeleteNews(news.id)} className="h-7.5 px-3 sm:px-0 sm:w-7.5 rounded-lg flex items-center justify-center text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors active:scale-95" title="ลบ">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: CALENDAR MANAGEMENT */}
      {subTab === "calendar" && (
        <div className="space-y-6">
          {/* Calendar Guidance Banner */}
          <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-rose-50 rounded-3xl p-5 border border-orange-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-bold shadow-md shadow-orange-500/20 shrink-0">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-800 font-kanit">
                  ระบบจัดการปฏิทินกิจกรรมศิลปะ (แสดงในหน้าข่าวสาร /news)
                </h3>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  คลิกที่ช่องวันที่ในปฏิทิน หรือกดปุ่ม <strong>+</strong> ในแต่ละวัน เพื่อเพิ่ม แก้ไข หรือลบกำหนดการส่งงาน กิจกรรม และเวิร์กช็อป
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-orange-700 bg-white/80 px-3 py-1.5 rounded-xl border border-orange-200 shadow-2xs shrink-0">
              <span>รวม {activitiesList.length} กิจกรรม</span>
            </div>
          </div>

          {/* Interactive Admin Calendar */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6 overflow-hidden">
            <CalendarView 
              activities={activitiesList} 
              isAdmin={true}
              onRefresh={fetchActivitiesData}
              onActivityAdded={() => fetchActivitiesData()}
              onActivityUpdated={() => fetchActivitiesData()}
              onActivityDeleted={() => fetchActivitiesData()}
            />
          </div>

          {/* Activity Events Summary & Quick Management */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-800 font-kanit flex items-center gap-2">
                  <Tag className="w-4 h-4 text-orange-500" />
                  รายการกิจกรรมทั้งหมดในปฏิทิน ({filteredActivities.length})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  ค้นหาและตรวจสอบกำหนดการกิจกรรมศิลปะทั้งหมดในระบบ
                </p>
              </div>

              {/* Search filter */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={calendarSearch}
                  onChange={(e) => setCalendarSearch(e.target.value)}
                  placeholder="ค้นหากิจกรรม, หมวดหมู่, วันที่..."
                  className="w-full h-9 pl-8 pr-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-xs bg-white"
                />
              </div>
            </div>

            {isActivitiesLoading ? (
              <div className="text-center py-12 text-slate-400">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-300 border-t-orange-600 mx-auto mb-2"></div>
                <p className="text-xs font-medium">กำลังโหลดรายการกิจกรรม...</p>
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-semibold text-slate-600">ไม่พบรายการกิจกรรม</p>
                <p className="text-[11px] text-slate-400 mt-0.5">คลิกที่ช่องวันที่ในปฏิทินด้านบนเพื่อเพิ่มกิจกรรมใหม่</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredActivities.map((act) => {
                  const colorBadge = colorBadgeMap[act.color || "red"] || colorBadgeMap.red;
                  return (
                    <div 
                      key={act.id} 
                      className="p-4 bg-slate-50/60 rounded-2xl border border-slate-200/80 hover:border-orange-300 hover:bg-orange-50/20 transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${colorBadge.bg}`}>
                            {act.category || colorBadge.label}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3 text-slate-400" />
                            {act.date}
                          </span>
                        </div>

                        <h4 className="font-bold text-slate-800 text-xs sm:text-sm line-clamp-1 group-hover:text-orange-600 transition-colors" title={act.title}>
                          {act.title}
                        </h4>

                        {act.description && (
                          <p className="text-slate-600 text-xs mt-1 line-clamp-2 leading-relaxed">
                            {act.description}
                          </p>
                        )}

                        <div className="mt-2.5 flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                          {act.time && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {act.time}
                            </span>
                          )}
                          {act.location && (
                            <span className="flex items-center gap-1 truncate max-w-[150px]" title={act.location}>
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {act.location}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-200/70 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">
                          {act.imageUrl ? "📷 มีรูปภาพประกอบ" : "📄 ข้อความกำหนดการ"}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteActivity(act.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="ลบกิจกรรม"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

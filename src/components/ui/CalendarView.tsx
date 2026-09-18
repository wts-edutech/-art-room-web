"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  MapPin,
  X,
  Eye,
  Plus,
  Clock,
  Pencil,
  Trash2,
  Tag,
  AlertCircle,
  Check,
  ImageIcon,
  Upload,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Activity {
  id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  location?: string;
  category?: string;
  color?: string; // "red" | "orange" | "blue" | "green" | "purple"
  imageUrl?: string;
  images?: string;
}

interface CalendarViewProps {
  activities: Activity[];
  onActivityClick?: (activity: Activity) => void;
  onDateClick?: (dateStr: string, thaiDateStr: string, activitiesOnDay: Activity[]) => void;
  onActivityAdded?: (newActivity: Activity) => void;
  onActivityUpdated?: (updatedActivity: Activity) => void;
  onActivityDeleted?: (deletedId: string) => void;
  onRefresh?: () => void;
  isAdmin?: boolean;
}

const MONTH_NAMES = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];
const DAY_NAMES = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];

const COLOR_OPTIONS = [
  { id: "red", label: "สำคัญ / ส่งงาน / สอบ", bg: "bg-red-500", lightBg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  { id: "orange", label: "เวิร์กช็อป / อบรม", bg: "bg-orange-500", lightBg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  { id: "blue", label: "การเรียนการสอน", bg: "bg-blue-500", lightBg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  { id: "green", label: "นิทรรศการ / พิเศษ", bg: "bg-emerald-500", lightBg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  { id: "purple", label: "ประกวด / แข่งขัน", bg: "bg-purple-500", lightBg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" }
];

export default function CalendarView({ 
  activities: initialActivities, 
  onActivityClick, 
  onDateClick, 
  onActivityAdded,
  onActivityUpdated,
  onActivityDeleted,
  onRefresh,
  isAdmin = false 
}: CalendarViewProps) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Modal State for managing events on a specific day
  const [activeModalDate, setActiveModalDate] = useState<{
    dateStr: string;
    thaiDateStr: string;
    day: number;
  } | null>(null);

  // Form states inside modal
  const [formTitle, setFormTitle] = useState("");
  const [formTime, setFormTime] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formColor, setFormColor] = useState("red");
  const [formCategory, setFormCategory] = useState("สำคัญ / ส่งงาน / สอบ");
  const [formDesc, setFormDesc] = useState("");
  const [formImageFile, setFormImageFile] = useState<File | null>(null);
  const [formImagePreview, setFormImagePreview] = useState<string | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Synchronize initialActivities prop
  useEffect(() => {
    setActivities(initialActivities);
  }, [initialActivities]);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday

  const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

  // Helper to format date as YYYY-MM-DD
  const formatDateStr = (y: number, m: number, d: number) => {
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  };

  const today = new Date();
  const todayStr = formatDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  // Smart matching for activities: Support YYYY-MM-DD, DD/MM/YYYY, and Thai string dates
  const activitiesByDate = useMemo(() => {
    const map: Record<string, Activity[]> = {};
    const SHORT_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

    activities.forEach(act => {
      if (!act.date) return;
      const dateText = String(act.date).trim();

      // 1. Direct YYYY-MM-DD check
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateText)) {
        if (!map[dateText]) map[dateText] = [];
        map[dateText].push(act);
        return;
      }

      // 2. Direct DD/MM or DD/MM/YYYY check
      const dmyMatch = dateText.match(/^(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?$/);
      if (dmyMatch) {
        let d = parseInt(dmyMatch[1], 10);
        let m = parseInt(dmyMatch[2], 10);
        let y = dmyMatch[3] ? parseInt(dmyMatch[3], 10) : currentYear;
        if (m > 12 && d <= 12) {
          const temp = d;
          d = m;
          m = temp;
        }
        if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
          if (y < 100) y += 2000;
          if (y > 2400) y -= 543;
          const key = formatDateStr(y, m - 1, d);
          if (!map[key]) map[key] = [];
          map[key].push(act);
          return;
        }
      }

      // 3. Parse Thai month (full or short)
      let matchedMonth = -1;
      MONTH_NAMES.forEach((m, idx) => {
        if (dateText.includes(m)) matchedMonth = idx;
      });
      if (matchedMonth === -1) {
        SHORT_MONTHS.forEach((m, idx) => {
          if (dateText.includes(m)) matchedMonth = idx;
        });
      }

      // Parse Thai year (e.g. 2569 -> 2026)
      const thaiYearMatch = dateText.match(/25\d{2}/);
      const ceYearMatch = dateText.match(/20\d{2}/);
      const parsedYear = thaiYearMatch 
        ? parseInt(thaiYearMatch[0], 10) - 543 
        : (ceYearMatch ? parseInt(ceYearMatch[0], 10) : currentYear);

      // Parse date ranges like "15-22"
      const rangeMatch = dateText.match(/(\d{1,2})\s*[-–—ถึง]+\s*(\d{1,2})/);
      if (rangeMatch && matchedMonth !== -1) {
        const startDay = parseInt(rangeMatch[1], 10);
        const endDay = parseInt(rangeMatch[2], 10);
        for (let d = startDay; d <= endDay; d++) {
          const key = formatDateStr(parsedYear, matchedMonth, d);
          if (!map[key]) map[key] = [];
          map[key].push(act);
        }
        return;
      }

      // Single day like "18"
      const singleDayMatch = dateText.match(/(?:^|\s|วันที่)?(\d{1,2})\s*(?:[ก-๙]+|\s|$)/) || dateText.match(/(\d{1,2})/);
      if (singleDayMatch && matchedMonth !== -1) {
        const day = parseInt(singleDayMatch[1], 10);
        const key = formatDateStr(parsedYear, matchedMonth, day);
        if (!map[key]) map[key] = [];
        map[key].push(act);
      }
    });

    return map;
  }, [activities, currentYear]);

  const blanks = Array.from({ length: firstDay }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Open modal for a day
  const handleOpenDayModal = (day: number, startWithForm = false) => {
    const dateStr = formatDateStr(currentYear, currentMonth, day);
    const thaiDateStr = `${day} ${MONTH_NAMES[currentMonth]} ${currentYear + 543}`;
    const dayActivities = activitiesByDate[dateStr] || [];

    setActiveModalDate({ dateStr, thaiDateStr, day });
    resetForm();
    setShowAddForm(startWithForm || dayActivities.length === 0);

    onDateClick?.(dateStr, thaiDateStr, dayActivities);
  };

  const resetForm = () => {
    setFormTitle("");
    setFormTime("");
    setFormLocation("");
    setFormColor("red");
    setFormCategory("สำคัญ / ส่งงาน / สอบ");
    setFormDesc("");
    setFormImageFile(null);
    setFormImagePreview(null);
    setEditingEventId(null);
  };

  const handleEditEvent = (act: Activity) => {
    setEditingEventId(act.id);
    setFormTitle(act.title);
    setFormTime(act.time || "");
    setFormLocation(act.location || "");
    setFormColor(act.color || "red");
    setFormCategory(act.category || "สำคัญ / ส่งงาน / สอบ");
    setFormDesc(act.description || "");
    setFormImagePreview(act.imageUrl || null);
    setShowAddForm(true);
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("คุณต้องการลบกิจกรรมนี้ออกจากปฏิทินใช่หรือไม่?")) return;
    try {
      const res = await fetch(`/api/activities?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setActivities(prev => prev.filter(a => a.id !== id));
        onActivityDeleted?.(id);
        onRefresh?.();
      } else {
        alert("ไม่สามารถลบกิจกรรมได้");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("เกิดข้อผิดพลาดในการลบกิจกรรม");
    }
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !activeModalDate) return;

    setIsSubmitting(true);
    try {
      let imageUrl = formImagePreview || "";

      // If user uploaded a new image file
      if (formImageFile) {
        const formData = new FormData();
        formData.append("image", formImageFile);
        formData.append("title", formTitle);
        formData.append("date", activeModalDate.thaiDateStr);
        formData.append("time", formTime);
        formData.append("location", formLocation);
        formData.append("category", formCategory);
        formData.append("color", formColor);
        formData.append("description", formDesc);
        if (editingEventId) formData.append("id", editingEventId);

        const method = editingEventId ? "PUT" : "POST";
        const res = await fetch("/api/activities", { method, body: formData });
        if (res.ok) {
          const saved = await res.json();
          if (editingEventId) {
            setActivities(prev => prev.map(a => a.id === editingEventId ? { ...a, ...saved } : a));
            onActivityUpdated?.(saved);
          } else {
            setActivities(prev => [saved, ...prev]);
            onActivityAdded?.(saved);
          }
          onRefresh?.();
          resetForm();
          setShowAddForm(false);
          setIsSubmitting(false);
          return;
        }
      }

      // JSON payload for fast text note saving
      const payload: any = {
        title: formTitle.trim(),
        date: activeModalDate.thaiDateStr,
        time: formTime.trim(),
        location: formLocation.trim(),
        category: formCategory,
        color: formColor,
        description: formDesc.trim(),
        imageUrl: imageUrl || null
      };

      if (editingEventId) {
        payload.id = editingEventId;
        const res = await fetch("/api/activities", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const updated = await res.json();
          setActivities(prev => prev.map(a => a.id === editingEventId ? { ...a, ...payload } : a));
          onActivityUpdated?.(payload);
          onRefresh?.();
          resetForm();
          setShowAddForm(false);
        } else {
          alert("ไม่สามารถบันทึกการแก้ไขได้");
        }
      } else {
        const res = await fetch("/api/activities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const created = await res.json();
          setActivities(prev => [created, ...prev]);
          onActivityAdded?.(created);
          onRefresh?.();
          resetForm();
          setShowAddForm(false);
        } else {
          alert("ไม่สามารถเพิ่มกิจกรรมได้");
        }
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("เกิดข้อผิดพลาดในการบันทึกกิจกรรม");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEventColorStyle = (colorId?: string) => {
    const found = COLOR_OPTIONS.find(c => c.id === colorId);
    return found || COLOR_OPTIONS[0];
  };

  const modalDayActivities = activeModalDate 
    ? (activitiesByDate[activeModalDate.dateStr] || [])
    : [];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden w-full select-none shadow-2xs">
      
      {/* Calendar Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 border-b border-gray-100 bg-white gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center text-red-600 shrink-0">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black font-kanit text-[#03071C] leading-tight">
              {MONTH_NAMES[currentMonth]} {currentYear + 543}
            </h2>
            <p className="text-xs text-gray-400 font-light">
              ปฏิทินกิจกรรมศิลปะ โรงเรียนวชิรธรรมสาธิต
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          {isAdmin && (
            <button
              type="button"
              onClick={() => handleOpenDayModal(today.getDate(), true)}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs mr-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>พิมพ์เพิ่มกิจกรรม</span>
            </button>
          )}

          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            <button 
              type="button"
              onClick={prevMonth}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white transition-colors text-gray-600 cursor-pointer"
              title="เดือนก่อนหน้า"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              type="button"
              onClick={() => setCurrentDate(new Date())}
              className="px-2.5 h-7 rounded-lg font-bold text-xs hover:bg-white transition-colors text-gray-700 cursor-pointer"
              title="กลับสู่วันนี้"
            >
              วันนี้
            </button>
            <button 
              type="button"
              onClick={nextMonth}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white transition-colors text-gray-600 cursor-pointer"
              title="เดือนถัดไป"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="p-3 sm:p-5 bg-white">
        {/* Day Name Headers */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
          {DAY_NAMES.map((day, i) => (
            <div 
              key={day} 
              className={`text-center text-xs font-bold uppercase tracking-wider py-1 ${
                i === 0 || i === 6 ? "text-red-500" : "text-gray-400"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid Cells */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {blanks.map(blank => (
            <div key={`blank-${blank}`} className="min-h-[70px] sm:min-h-[105px] rounded-xl bg-gray-50/40 border border-transparent" />
          ))}
          
          {days.map(day => {
            const dateStr = formatDateStr(currentYear, currentMonth, day);
            const dayActivities = activitiesByDate[dateStr] || [];
            const isToday = dateStr === todayStr;
            const hasActivity = dayActivities.length > 0;
            
            return (
              <div 
                key={day} 
                onClick={() => handleOpenDayModal(day, false)}
                className={`relative group flex flex-col justify-between min-h-[70px] sm:min-h-[105px] rounded-xl p-1.5 sm:p-2 transition-all cursor-pointer border ${
                  isToday 
                    ? "bg-red-50/30 border-red-300 ring-1 ring-red-400" 
                    : hasActivity 
                      ? "bg-white border-gray-300 hover:border-red-400 hover:bg-red-50/10" 
                      : "bg-white border-gray-100 hover:border-gray-300 hover:bg-gray-50/60"
                }`}
                title={`วันที่ ${day} ${MONTH_NAMES[currentMonth]} ${currentYear + 543}${
                  hasActivity ? ` • มี ${dayActivities.length} กิจกรรม (คลิกเพื่อดูหรือแก้ไข)` : " (คลิกเพื่อเพิ่มกิจกรรม)"
                }`}
              >
                {/* Top Row: Day Number & Admin Quick Add Plus */}
                <div className="w-full flex justify-between items-center">
                  <span 
                    className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-colors ${
                      isToday 
                        ? "bg-red-600 text-white font-black" 
                        : hasActivity 
                          ? "text-gray-900 font-extrabold" 
                          : "text-gray-600"
                    }`}
                  >
                    {day}
                  </span>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDayModal(day, true);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md bg-red-50 hover:bg-red-600 text-red-600 hover:text-white transition-all cursor-pointer"
                      title="พิมพ์เพิ่มกิจกรรมในวันนี้"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Event Pills Area inside Cell */}
                <div className="w-full space-y-1 mt-1 flex-1 flex flex-col justify-start">
                  {dayActivities.slice(0, 2).map((act) => {
                    const colorStyle = getEventColorStyle(act.color);
                    return (
                      <div
                        key={act.id}
                        className={`w-full text-left px-1.5 py-0.5 rounded-md text-[10px] sm:text-[11px] font-semibold truncate border flex items-center gap-1 transition-transform group-hover:scale-[1.02] ${colorStyle.lightBg} ${colorStyle.text} ${colorStyle.border}`}
                        title={`${act.time ? act.time + ' ' : ''}${act.title}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${colorStyle.bg}`} />
                        <span className="truncate">
                          {act.time ? `${act.time} ` : ""}{act.title}
                        </span>
                      </div>
                    );
                  })}

                  {dayActivities.length > 2 && (
                    <div className="text-[9.5px] font-bold text-gray-500 text-center bg-gray-100 py-0.5 rounded">
                      +อีก {dayActivities.length - 2} รายการ
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend / Category Tags Footer */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {COLOR_OPTIONS.map(c => (
              <span key={c.id} className="flex items-center gap-1.5 text-gray-600 text-[11px]">
                <span className={`w-2 h-2 rounded-full ${c.bg}`} />
                <span>{c.label}</span>
              </span>
            ))}
          </div>

          <span className="text-[11px] text-gray-400">
            {isAdmin ? "💡 คลิกที่ช่องวันที่เพื่อพิมพ์บันทึก แก้ไข หรือลบกิจกรรม" : "คลิกที่ช่องวันที่เพื่อดูรายละเอียดกิจกรรม"}
          </span>
        </div>
      </div>

      {/* DAY ACTIVITY MANAGER MODAL */}
      {activeModalDate && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setActiveModalDate(null)}
        >
          <div 
            className="bg-white rounded-2xl border border-gray-200 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Top Header */}
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50 sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black font-kanit text-gray-900 leading-tight">
                    กิจกรรมประจำวันที่ {activeModalDate.thaiDateStr}
                  </h3>
                  <p className="text-xs text-gray-500 font-light">
                    {modalDayActivities.length > 0 
                      ? `มีทั้งหมด ${modalDayActivities.length} กิจกรรมในวันนี้` 
                      : "ยังไม่มีกิจกรรมในวันนี้ สามารถพิมพ์เพิ่มได้ทันที"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveModalDate(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-6">
              
              {/* Existing Activities on this Date */}
              {modalDayActivities.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      รายการกิจกรรมในวันนี้ ({modalDayActivities.length})
                    </h4>
                    {isAdmin && !showAddForm && (
                      <button
                        type="button"
                        onClick={() => {
                          resetForm();
                          setShowAddForm(true);
                        }}
                        className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>เพิ่มอีกหนึ่งกิจกรรม</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    {modalDayActivities.map((act) => {
                      const colorStyle = getEventColorStyle(act.color);
                      return (
                        <div
                          key={act.id}
                          className="p-4 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            {act.imageUrl && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={act.imageUrl}
                                alt={act.title}
                                className="w-14 h-14 rounded-lg object-cover border border-gray-100 shrink-0"
                              />
                            )}

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${colorStyle.lightBg} ${colorStyle.text} ${colorStyle.border}`}>
                                  {act.category || "กิจกรรม"}
                                </span>
                                {act.time && (
                                  <span className="text-xs font-mono font-semibold text-gray-600 flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-gray-400" />
                                    {act.time}
                                  </span>
                                )}
                                {act.location && (
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-red-500" />
                                    {act.location}
                                  </span>
                                )}
                              </div>

                              <h5 className="text-sm font-bold text-gray-900 font-kanit leading-snug">
                                {act.title}
                              </h5>

                              {act.description && (
                                <p className="text-xs text-gray-600 font-light mt-1 line-clamp-2">
                                  {act.description}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          {isAdmin && (
                            <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 w-full sm:w-auto justify-end">
                              <button
                                type="button"
                                onClick={() => handleEditEvent(act)}
                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="แก้ไขกิจกรรมนี้"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteEvent(act.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="ลบกิจกรรมนี้"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Form Section: Add / Edit Activity (Only for Admin) */}
              {isAdmin && (
                <div>
                  {!showAddForm && modalDayActivities.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => {
                        resetForm();
                        setShowAddForm(true);
                      }}
                      className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 hover:border-red-400 text-gray-600 hover:text-red-600 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer bg-gray-50/50"
                    >
                      <Plus className="w-4 h-4" />
                      <span>พิมพ์เพิ่มกิจกรรมในวันนี้</span>
                    </button>
                  ) : (
                    <form onSubmit={handleSaveEvent} className="p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-3.5">
                      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                        <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                          {editingEventId ? <Pencil className="w-3.5 h-3.5 text-red-600" /> : <Plus className="w-3.5 h-3.5 text-red-600" />}
                          <span>{editingEventId ? "แก้ไขข้อมูลกิจกรรม" : "พิมพ์ข้อมูลกิจกรรมใหม่"}</span>
                        </span>
                        {modalDayActivities.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              resetForm();
                              setShowAddForm(false);
                            }}
                            className="text-xs text-gray-400 hover:text-gray-600"
                          >
                            ยกเลิก
                          </button>
                        )}
                      </div>

                      {/* Title */}
                      <div>
                        <label className="text-xs font-semibold text-gray-700 block mb-1">
                          ชื่อกิจกรรม / หัวข้อบันทึก <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formTitle}
                          onChange={e => setFormTitle(e.target.value)}
                          placeholder="เช่น เวิร์กช็อปวาดสีน้ำ ม.3, ส่งภาพประกวด..."
                          className="w-full h-9 px-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-xs bg-white"
                        />
                      </div>

                      {/* Time & Location Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-semibold text-gray-700">ช่วงเวลา</label>
                            <button
                              type="button"
                              onClick={() => setFormTime("ตลอดวัน")}
                              className="text-[10px] text-red-600 hover:underline cursor-pointer"
                            >
                              ตลอดวัน
                            </button>
                          </div>
                          <input
                            type="text"
                            value={formTime}
                            onChange={e => setFormTime(e.target.value)}
                            placeholder="เช่น 08:30 - 11:30 น."
                            className="w-full h-9 px-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-xs bg-white"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-gray-700 block mb-1">สถานที่</label>
                          <input
                            type="text"
                            value={formLocation}
                            onChange={e => setFormLocation(e.target.value)}
                            placeholder="เช่น ห้องปฏิบัติการศิลปะ 1"
                            className="w-full h-9 px-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-xs bg-white"
                          />
                        </div>
                      </div>

                      {/* Category & Color Selector */}
                      <div>
                        <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                          หมวดหมู่และแท็กสี
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                          {COLOR_OPTIONS.map(c => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setFormColor(c.id);
                                setFormCategory(c.label);
                              }}
                              className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all text-left cursor-pointer ${
                                formColor === c.id 
                                  ? `${c.lightBg} ${c.text} border-red-400 font-bold ring-1 ring-red-400`
                                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                              }`}
                            >
                              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${c.bg}`} />
                              <span className="truncate text-[11px]">{c.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Description / Note */}
                      <div>
                        <label className="text-xs font-semibold text-gray-700 block mb-1">
                          รายละเอียดเพิ่มเติม / โน้ตบันทึก
                        </label>
                        <textarea
                          value={formDesc}
                          onChange={e => setFormDesc(e.target.value)}
                          placeholder="รายละเอียดของกิจกรรม กำหนดการ หรือสิ่งที่ต้องเตรียม..."
                          rows={2}
                          className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-xs bg-white resize-none"
                        />
                      </div>

                      {/* Optional Photo Upload */}
                      <div>
                        <label className="text-xs font-semibold text-gray-700 block mb-1">
                          รูปภาพประกอบกิจกรรม (ไม่บังคับ)
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="file"
                            id="modalActivityImageFile"
                            accept="image/*"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setFormImageFile(file);
                                setFormImagePreview(URL.createObjectURL(file));
                              }
                            }}
                            className="text-xs file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-200 hover:file:bg-gray-300 cursor-pointer"
                          />
                          {formImagePreview && (
                            <button
                              type="button"
                              onClick={() => {
                                setFormImageFile(null);
                                setFormImagePreview(null);
                                const input = document.getElementById("modalActivityImageFile") as HTMLInputElement;
                                if (input) input.value = "";
                              }}
                              className="text-[11px] text-red-500 hover:underline cursor-pointer"
                            >
                              ลบรูปภาพ
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Submit Buttons */}
                      <div className="pt-2 flex items-center justify-end gap-2">
                        {editingEventId && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={resetForm}
                            className="text-xs h-9 rounded-xl border-gray-200"
                          >
                            ยกเลิกการแก้ไข
                          </Button>
                        )}
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold h-9 px-5 rounded-xl border-0 cursor-pointer flex items-center gap-1.5 shadow-xs"
                        >
                          {isSubmitting ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          <span>{editingEventId ? "บันทึกการแก้ไข" : "บันทึกกิจกรรมลงปฏิทิน"}</span>
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

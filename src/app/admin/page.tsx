"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Award, Image as ImageIcon, Newspaper, Calendar, Users, LogOut, LayoutDashboard, Lightbulb, Info, ChevronRight, X, GraduationCap, FolderDown } from "lucide-react";

// Import tabs
import LessonsTab from "@/components/admin/LessonsTab";
import M3LessonsTab from "@/components/admin/M3LessonsTab";
import M4LessonsTab from "@/components/admin/M4LessonsTab";
import AwardsTab from "@/components/admin/AwardsTab";
import ArtworksTab from "@/components/admin/ArtworksTab";
import NewsTab from "@/components/admin/NewsTab";
import ActivitiesTab from "@/components/admin/ActivitiesTab";
import StudentsTab from "@/components/admin/StudentsTab";
import GuestsTab from "@/components/admin/GuestsTab";
import TestimonialsTab from "@/components/admin/TestimonialsTab";
import IdeasTab from "@/components/admin/IdeasTab";
import TeachersTab from "@/components/admin/TeachersTab";
import DownloadsTab from "@/components/admin/DownloadsTab";

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "lessons" | "m3Lessons" | "m4Lessons" | "artworks" | "awards" | "news" | "activities" | "students" | "guests" | "testimonials" | "ideas" | "teachers" | "downloads"
  >("lessons");
  const [visitorStats, setVisitorStats] = useState({ total: 0, today: 0 });
  const [isPRBannerDismissed, setIsPRBannerDismissed] = useState(false);
  const [isTeachersEnabled, setIsTeachersEnabled] = useState(false);
  const [isM3Enabled, setIsM3Enabled] = useState(true);
  const [isM4Enabled, setIsM4Enabled] = useState(true);

  useEffect(() => {
    fetch("/api/visitors")
      .then(res => res.json())
      .then(data => {
        const todayStr = new Date().toISOString().split('T')[0];
        setVisitorStats({
          total: data.total || 0,
          today: data.daily?.[todayStr] || 0
        });
      })
      .catch(err => console.error("Failed to fetch visitors:", err));

    fetch("/api/teachers/status")
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.enabled === "boolean") {
          setIsTeachersEnabled(data.enabled);
        }
      })
      .catch(() => {});

    fetch("/api/m3-lessons/status")
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.enabled === "boolean") {
          setIsM3Enabled(data.enabled);
        }
      })
      .catch(() => {});

    fetch("/api/m4-lessons/status")
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.enabled === "boolean") {
          setIsM4Enabled(data.enabled);
        }
      })
      .catch(() => {});
  }, [activeTab]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  return (
    <div className="flex h-screen bg-gray-50 font-prompt">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 text-gray-800 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold text-xl shadow-inner overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/school-logo.png" alt="School Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-lg tracking-tight">Admin System Art room</span>
          </div>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-3">Menu</p>
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab("lessons")}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                activeTab === "lessons" 
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" 
                  : "text-gray-500 hover:text-orange-600 hover:bg-orange-50"
              }`}
            >
              <BookOpen className="w-5 h-5" />
              จัดการคลังสื่อ Art Room (ทั่วไป)
            </button>
            <button
              onClick={() => setActiveTab("m3Lessons")}
              className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all ${
                activeTab === "m3Lessons" 
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" 
                  : "text-gray-500 hover:text-orange-600 hover:bg-orange-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5" />
                <span>จัดการบทเรียน ม.3</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isM3Enabled 
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200" 
                  : "bg-gray-100 text-gray-500 border border-gray-200"
              }`}>
                {isM3Enabled ? "เปิด" : "ปิด"}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("m4Lessons")}
              className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all ${
                activeTab === "m4Lessons" 
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" 
                  : "text-gray-500 hover:text-orange-600 hover:bg-orange-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5" />
                <span>จัดการบทเรียน ม.4</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isM4Enabled 
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200" 
                  : "bg-gray-100 text-gray-500 border border-gray-200"
              }`}>
                {isM4Enabled ? "เปิด" : "ปิด"}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("awards")}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                activeTab === "awards" 
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" 
                  : "text-gray-500 hover:text-orange-600 hover:bg-orange-50"
              }`}
            >
              <Award className="w-5 h-5" />
              จัดการรางวัลที่ได้รับ
            </button>
            <button
              onClick={() => setActiveTab("artworks")}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                activeTab === "artworks" 
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" 
                  : "text-gray-500 hover:text-orange-600 hover:bg-orange-50"
              }`}
            >
              <ImageIcon className="w-5 h-5" />
              จัดการผลงานนักเรียน
            </button>
            <button
              onClick={() => setActiveTab("news")}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                activeTab === "news" 
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" 
                  : "text-gray-500 hover:text-orange-600 hover:bg-orange-50"
              }`}
            >
              <Newspaper className="w-5 h-5" />
              จัดการข่าวสาร
            </button>
            <button
              onClick={() => setActiveTab("activities")}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                activeTab === "activities" 
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" 
                  : "text-gray-500 hover:text-orange-600 hover:bg-orange-50"
              }`}
            >
              <Calendar className="w-5 h-5" />
              จัดการกิจกรรม
            </button>
            <button
              onClick={() => setActiveTab("students")}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                activeTab === "students" 
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" 
                  : "text-gray-500 hover:text-orange-600 hover:bg-orange-50"
              }`}
            >
              <Users className="w-5 h-5" />
              จัดการฐานข้อมูลนักเรียน
            </button>
            <button
              onClick={() => setActiveTab("guests")}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                activeTab === "guests" 
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" 
                  : "text-gray-500 hover:text-orange-600 hover:bg-orange-50"
              }`}
            >
              <Users className="w-5 h-5" />
              ฐานข้อมูลบุคคลทั่วไป
            </button>
            <button
              onClick={() => setActiveTab("teachers")}
              className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all ${
                activeTab === "teachers" 
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" 
                  : "text-gray-500 hover:text-orange-600 hover:bg-orange-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <GraduationCap className="w-5 h-5" />
                <span>จัดการทำเนียบครู</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isTeachersEnabled 
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200" 
                  : "bg-gray-100 text-gray-500 border border-gray-200"
              }`}>
                {isTeachersEnabled ? "เปิด" : "ปิด"}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("testimonials")}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                activeTab === "testimonials" 
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" 
                  : "text-gray-500 hover:text-orange-600 hover:bg-orange-50"
              }`}
            >
              <BookOpen className="w-5 h-5" />
              จัดการรีวิวรุ่นพี่
            </button>
            <button
              onClick={() => setActiveTab("ideas")}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                activeTab === "ideas" 
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" 
                  : "text-gray-500 hover:text-orange-600 hover:bg-orange-50"
              }`}
            >
              <Lightbulb className="w-5 h-5" />
              จัดการไอเดีย
            </button>
            <button
              onClick={() => setActiveTab("downloads")}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                activeTab === "downloads" 
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" 
                  : "text-gray-500 hover:text-orange-600 hover:bg-orange-50"
              }`}
            >
              <FolderDown className="w-5 h-5" />
              จัดการคลังดาวน์โหลด
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-gray-100 text-gray-900 p-4 flex justify-between items-center">
          <div className="font-bold flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/school-logo.png" alt="School Logo" className="w-6 h-6 object-cover rounded-full bg-white" />
            Admin System Art room
          </div>
          <button onClick={handleLogout} className="p-2 text-red-600"><LogOut className="w-5 h-5" /></button>
        </div>

        <div className="p-6 md:p-10 max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <LayoutDashboard className="w-8 h-8 text-orange-500" />
              {activeTab === "lessons" && "จัดการคลังสื่อการสอน Art Room (Lessons)"}
              {activeTab === "m3Lessons" && "จัดการบทเรียน ม.3 (M3 Lessons)"}
              {activeTab === "m4Lessons" && "จัดการบทเรียน ม.4 (M4 Lessons)"}
              {activeTab === "awards" && "จัดการรางวัลที่ได้รับ (Awards)"}
              {activeTab === "artworks" && "จัดการผลงานนักเรียน (Artworks)"}
              {activeTab === "ideas" && "จัดการไอเดีย (Ideas)"}
              {activeTab === "news" && "จัดการข่าวสาร (News)"}
              {activeTab === "activities" && "จัดการกิจกรรม (Activities)"}
              {activeTab === "students" && "จัดการรายชื่อนักเรียน (Students)"}
              {activeTab === "guests" && "ฐานข้อมูลบุคคลทั่วไปและผู้ปกครอง (Guests)"}
              {activeTab === "teachers" && "จัดการทำเนียบครูผู้สอน (Teachers)"}
              {activeTab === "testimonials" && "จัดการรีวิวรุ่นพี่ (Testimonials)"}
              {activeTab === "downloads" && "จัดการคลังดาวน์โหลดและเปิด/ปิดระดับชั้น (Downloads)"}
            </h1>
            <p className="text-gray-500 mt-2 font-light">
              ระบบหลังบ้านสำหรับเพิ่ม ลบ และแก้ไขข้อมูลเว็บไซต์
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-orange-500 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">ผู้เข้าชมทั้งหมด</p>
                <h3 className="text-2xl font-bold text-gray-900">{visitorStats.total.toLocaleString()}</h3>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">ผู้เข้าชมวันนี้</p>
                <h3 className="text-2xl font-bold text-gray-900">{visitorStats.today.toLocaleString()}</h3>
              </div>
            </div>
          </div>

          {/* PR Guidelines Overview Banner */}
          {!isPRBannerDismissed && (
            <div className="mb-8 bg-gradient-to-r from-red-900 via-stone-900 to-gray-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-red-300 text-xs font-semibold mb-3 border border-white/10">
                    <Info className="w-3.5 h-3.5" /> สำหรับผู้ดูแลระบบ (Admin)
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">
                    ระบบข่าวสารประชาสัมพันธ์รองรับสัดส่วนมาตรฐาน
                  </h3>
                  <p className="text-gray-300 text-xs sm:text-sm font-light leading-relaxed">
                    สามารถเพิ่มหรือแก้ไขข่าวสารใหม่ผ่านระบบแอดมิน โดยหน้าระบบรองรับทั้งภาพ Banner แนวนอน 1.91:1, โปสเตอร์แนวตั้ง 3:4 / 4:5 และภาพจัตุรัส 1:1 ได้อย่างสมบูรณ์แบบ
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <button 
                    onClick={() => {
                      setActiveTab("news");
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md hover:shadow-red-600/30 cursor-pointer"
                  >
                    ไปยังระบบจัดการข่าวสาร (NewsTab) <ChevronRight className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setIsPRBannerDismissed(true)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                    title="ปิดการแจ้งเตือน"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Tabs */}
          <div className="flex md:hidden space-x-2 mb-8 bg-white p-1 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
            <button
              onClick={() => setActiveTab("lessons")}
              className={`flex-1 flex-shrink-0 min-w-[100px] flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === "lessons" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <BookOpen className="w-4 h-4" /> บทเรียน
            </button>
            <button
              onClick={() => setActiveTab("m3Lessons")}
              className={`flex-1 flex-shrink-0 min-w-[100px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                activeTab === "m3Lessons" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>ม.3</span>
              <span className={`text-[9px] font-bold px-1 rounded ${
                isM3Enabled ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-600"
              }`}>
                {isM3Enabled ? "เปิด" : "ปิด"}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("m4Lessons")}
              className={`flex-1 flex-shrink-0 min-w-[100px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                activeTab === "m4Lessons" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>ม.4</span>
              <span className={`text-[9px] font-bold px-1 rounded ${
                isM4Enabled ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-600"
              }`}>
                {isM4Enabled ? "เปิด" : "ปิด"}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("awards")}
              className={`flex-1 flex-shrink-0 min-w-[100px] flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === "awards" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Award className="w-4 h-4" /> รางวัล
            </button>
            <button
              onClick={() => setActiveTab("artworks")}
              className={`flex-1 flex-shrink-0 min-w-[100px] flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === "artworks" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <ImageIcon className="w-4 h-4" /> ผลงาน
            </button>
            <button
              onClick={() => setActiveTab("news")}
              className={`flex-1 flex-shrink-0 min-w-[100px] flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === "news" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Newspaper className="w-4 h-4" /> ข่าวสาร
            </button>
            <button
              onClick={() => setActiveTab("activities")}
              className={`flex-1 flex-shrink-0 min-w-[100px] flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === "activities" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Calendar className="w-4 h-4" /> กิจกรรม
            </button>
            <button
              onClick={() => setActiveTab("teachers")}
              className={`flex-1 flex-shrink-0 min-w-[100px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                activeTab === "teachers" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>ทำเนียบครู</span>
              <span className={`text-[9px] font-bold px-1 rounded ${
                isTeachersEnabled ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-600"
              }`}>
                {isTeachersEnabled ? "เปิด" : "ปิด"}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("downloads")}
              className={`flex-1 flex-shrink-0 min-w-[100px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                activeTab === "downloads" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <FolderDown className="w-3.5 h-3.5" />
              <span>คลังดาวน์โหลด</span>
            </button>
          </div>

          {/* Render Active Tab Content */}
          {activeTab === "lessons" && <LessonsTab />}
          {activeTab === "m3Lessons" && <M3LessonsTab />}
          {activeTab === "m4Lessons" && <M4LessonsTab />}
          {activeTab === "awards" && <AwardsTab />}
          {activeTab === "artworks" && <ArtworksTab />}
          {activeTab === "news" && <NewsTab />}
          {activeTab === "activities" && <ActivitiesTab />}
          {activeTab === "students" && <StudentsTab />}
          {activeTab === "guests" && <GuestsTab />}
          {activeTab === "teachers" && <TeachersTab />}
          {activeTab === "testimonials" && <TestimonialsTab />}
          {activeTab === "ideas" && <IdeasTab />}
          {activeTab === "downloads" && <DownloadsTab />}

        </div>
      </main>
    </div>
  );
}

"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  BookOpen, 
  Award, 
  Image as ImageIcon, 
  Newspaper, 
  Calendar, 
  Users, 
  LogOut, 
  LayoutDashboard, 
  Lightbulb, 
  Info, 
  ChevronRight, 
  X, 
  GraduationCap, 
  FolderDown, 
  School, 
  ClipboardList, 
  BookCheck, 
  HelpCircle, 
  Sparkles, 
  Camera, 
  Inbox, 
  MessageSquare, 
  KeyRound,
  Menu,
  Search,
  CheckCircle2,
  Shield,
  Layers,
  ChevronDown
} from "lucide-react";

// Import tabs
import SubmissionsCenterTab from "@/components/admin/teaching/SubmissionsCenterTab";
import TeachingSetupTab from "@/components/admin/teaching/TeachingSetupTab";
import AssignmentsTab from "@/components/admin/teaching/AssignmentsTab";
import GradingTab from "@/components/admin/teaching/GradingTab";
import QuizzesTab from "@/components/admin/teaching/QuizzesTab";

import AwardsTab from "@/components/admin/AwardsTab";
import ArtworksTab from "@/components/admin/ArtworksTab";
import NewsTab from "@/components/admin/NewsTab";
import ActivitiesTab from "@/components/admin/ActivitiesTab";
import StudentsTab from "@/components/admin/StudentsTab";
import GuestsTab from "@/components/admin/GuestsTab";
import TestimonialsTab from "@/components/admin/TestimonialsTab";
import IdeasTab from "@/components/admin/IdeasTab";
import TeachersTab from "@/components/admin/TeachersTab";
import HeroButtonTab from "@/components/admin/HeroButtonTab";
import CommentsModerationTab from "@/components/admin/CommentsModerationTab";
import AdminSecurityTab from "@/components/admin/AdminSecurityTab";
import DownloadsTab from "@/components/admin/DownloadsTab";

type AdminTabKey = 
  | "submissionsCenter" 
  | "teachingSetup" 
  | "assignments" 
  | "grading" 
  | "quizzes" 
  | "downloads" 
  | "artworks" 
  | "awards" 
  | "news" 
  | "activities" 
  | "students" 
  | "guests" 
  | "testimonials" 
  | "ideas" 
  | "teachers" 
  | "heroButton" 
  | "comments" 
  | "adminSecurity";

interface AdminMenuItem {
  key: AdminTabKey;
  label: string;
  sublabel?: string;
  icon: any;
  badge?: string;
  isSpecial?: boolean;
}

interface AdminMenuCategory {
  id: string;
  title: string;
  icon: any;
  items: AdminMenuItem[];
}

const ADMIN_CATEGORIES: AdminMenuCategory[] = [
  {
    id: "teaching",
    title: "ระบบการสอน & ส่งงาน",
    icon: School,
    items: [
      { key: "submissionsCenter", label: "ศูนย์ส่งงาน & แจ้งเตือน", sublabel: "Submissions & Notifications", icon: Inbox, badge: "NEW", isSpecial: true },
      { key: "teachingSetup", label: "1. โครงสร้างการสอน", sublabel: "ปีการศึกษา / วิชา / ห้องเรียน", icon: School },
      { key: "assignments", label: "2. มอบหมายงาน", sublabel: "Assignments", icon: ClipboardList },
      { key: "grading", label: "3. ตรวจงาน & ให้คะแนน", sublabel: "Evaluation & Scoring", icon: BookCheck },
      { key: "quizzes", label: "4. แบบทดสอบก่อนเรียน", sublabel: "Pre-tests & Reports", icon: HelpCircle },
      { key: "downloads", label: "5. สื่อการสอน & ใบงาน (AI)", sublabel: "AI Material Studio & Files", icon: FolderDown, isSpecial: true },
    ]
  },
  {
    id: "artworks",
    title: "ผลงาน & กิจกรรมศิลปะ",
    icon: Award,
    items: [
      { key: "awards", label: "จัดการรางวัลที่ได้รับ", sublabel: "Awards", icon: Award },
      { key: "artworks", label: "จัดการผลงานนักเรียน", sublabel: "Artworks Gallery", icon: ImageIcon },
      { key: "ideas", label: "จัดการห้องสมุดไอเดีย", sublabel: "Ideas Library", icon: Lightbulb },
      { key: "news", label: "จัดการข่าวสาร & ปฏิทิน", sublabel: "News & Calendar", icon: Newspaper },
      { key: "activities", label: "จัดการภาพกิจกรรม", sublabel: "Activities Gallery", icon: Camera },
    ]
  },
  {
    id: "users",
    title: "ผู้ใช้งาน & ข้อมูล",
    icon: Users,
    items: [
      { key: "students", label: "ฐานข้อมูลนักเรียน", sublabel: "Students Database", icon: Users },
      { key: "teachers", label: "ทำเนียบครูผู้สอน", sublabel: "Teachers Profile & Awards", icon: GraduationCap },
      { key: "testimonials", label: "จัดการรีวิวรุ่นพี่", sublabel: "Testimonials", icon: BookOpen },
      { key: "guests", label: "ฐานข้อมูลบุคคลทั่วไป", sublabel: "Guests & Visitors", icon: Users },
      { key: "comments", label: "จัดการความคิดเห็น & บอร์ด", sublabel: "Comments Moderation", icon: MessageSquare },
    ]
  },
  {
    id: "security",
    title: "การตั้งค่า & ความปลอดภัย",
    icon: Shield,
    items: [
      { key: "heroButton", label: "ตั้งค่าปุ่ม AI Art Model", sublabel: "Hero Section Link", icon: Sparkles, isSpecial: true },
      { key: "adminSecurity", label: "ศูนย์ความปลอดภัย & Master PIN", sublabel: "เปลี่ยนรหัส / เตะอุปกรณ์ / K1234", icon: KeyRound, badge: "Master", isSpecial: true },
    ]
  }
];

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTabKey>("submissionsCenter");
  const [gradingAssignmentId, setGradingAssignmentId] = useState<string | undefined>(undefined);
  const [visitorStats, setVisitorStats] = useState({ total: 0, today: 0 });
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [selectedMobileCategory, setSelectedMobileCategory] = useState<string>("all");
  const [mobileSearch, setMobileSearch] = useState("");

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
  }, [activeTab]);

  const handleLogout = () => {
    try {
      localStorage.removeItem("artroom_role");
      localStorage.removeItem("artroom_author_name");
      localStorage.removeItem("artroom_user_role");
      localStorage.removeItem("artroom_author_email");
      localStorage.removeItem("artroom_avatar");
    } catch {}

    document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    document.cookie = "session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    window.location.href = "/api/admin/logout";
  };

  const handleSelectTab = (key: AdminTabKey) => {
    setActiveTab(key);
    setIsMobileDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Flat list of all items
  const allMenuItems = useMemo(() => {
    return ADMIN_CATEGORIES.flatMap(cat => cat.items);
  }, []);

  const activeItemInfo = useMemo(() => {
    return allMenuItems.find(item => item.key === activeTab);
  }, [allMenuItems, activeTab]);

  // Filtered items for mobile drawer search
  const filteredDrawerCategories = useMemo(() => {
    if (!mobileSearch.trim()) return ADMIN_CATEGORIES;
    const term = mobileSearch.toLowerCase();
    return ADMIN_CATEGORIES.map(cat => ({
      ...cat,
      items: cat.items.filter(item => 
        item.label.toLowerCase().includes(term) || 
        (item.sublabel && item.sublabel.toLowerCase().includes(term)) ||
        cat.title.toLowerCase().includes(term)
      )
    })).filter(cat => cat.items.length > 0);
  }, [mobileSearch]);

  // Filtered items for horizontal mobile scrollbar
  const visibleMobilePills = useMemo(() => {
    if (selectedMobileCategory === "all") return allMenuItems;
    const cat = ADMIN_CATEGORIES.find(c => c.id === selectedMobileCategory);
    return cat ? cat.items : allMenuItems;
  }, [selectedMobileCategory, allMenuItems]);

  return (
    <div className="flex h-screen bg-gray-50 font-prompt overflow-hidden">
      {/* ============================================================ */}
      {/* ===== DESKTOP SIDEBAR (Visible md+) ===== */}
      {/* ============================================================ */}
      <aside className="w-64 bg-white border-r border-gray-100 text-gray-800 flex flex-col hidden md:flex shrink-0">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold text-xl shadow-inner overflow-hidden border border-gray-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/school-logo.png" alt="School Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight font-kanit block text-gray-900 leading-tight">Admin Art Room</span>
              <span className="text-[10px] text-gray-400 font-medium">โรงเรียนวชิรธรรมสาธิต</span>
            </div>
          </div>
        </div>
        
        <div className="p-3.5 flex-1 overflow-y-auto space-y-5">
          {ADMIN_CATEGORIES.map((category) => {
            const CategoryIcon = category.icon;
            return (
              <div key={category.id} className="space-y-1">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2.5 flex items-center gap-1.5 mb-1.5">
                  <CategoryIcon className="w-3.5 h-3.5 text-orange-500" />
                  <span>{category.title}</span>
                </p>
                <nav className="space-y-0.5">
                  {category.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.key;
                    return (
                      <button
                        key={item.key}
                        onClick={() => handleSelectTab(item.key)}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all text-xs font-semibold cursor-pointer ${
                          isActive
                            ? item.isSpecial
                              ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20"
                              : "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                            : "text-gray-600 hover:text-orange-600 hover:bg-orange-50/80"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 truncate">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            isActive ? "bg-white/20 text-white" : "bg-orange-100 text-orange-700"
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
            );
          })}
        </div>

        <div className="p-3 border-t border-gray-100 bg-gray-50/50">
          <button 
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors text-xs font-semibold cursor-pointer active:scale-98"
          >
            <LogOut className="w-4 h-4" />
            ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* ===== MOBILE NAVIGATION DRAWER (Slide-out menu for mobile) ===== */}
      {/* ============================================================ */}
      {isMobileDrawerOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-[9998] animate-in fade-in duration-200"
          onClick={() => setIsMobileDrawerOpen(false)}
        />
      )}

      <div 
        className={`md:hidden fixed top-0 left-0 bottom-0 w-[320px] max-w-[88vw] bg-white z-[9999] shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${
          isMobileDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1 shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/school-logo.png" alt="School Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="font-bold text-sm font-kanit leading-tight">Admin System Art Room</h2>
              <p className="text-[10px] text-white/80">ระบบจัดการสารสนเทศ (17 เมนู)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(false)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Search */}
        <div className="p-3 border-b border-gray-100 bg-gray-50/80">
          <div className="relative">
            <input
              type="text"
              value={mobileSearch}
              onChange={(e) => setMobileSearch(e.target.value)}
              placeholder="ค้นหาเมนูแอดมินทั้งหมด..."
              className="w-full h-9 pl-8 pr-3 rounded-xl border border-gray-200 bg-white text-xs font-medium outline-none focus:border-orange-500"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            {mobileSearch && (
              <button 
                type="button"
                onClick={() => setMobileSearch("")} 
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Drawer Menu List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {filteredDrawerCategories.map((category) => {
            const CategoryIcon = category.icon;
            return (
              <div key={category.id} className="space-y-1">
                <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <CategoryIcon className="w-3.5 h-3.5 text-orange-500" />
                  <span>{category.title}</span>
                  <span className="ml-auto text-[10px] text-gray-400 font-normal">({category.items.length})</span>
                </div>
                <div className="space-y-1">
                  {category.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.key;
                    return (
                      <button
                        key={item.key}
                        onClick={() => handleSelectTab(item.key)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left cursor-pointer ${
                          isActive
                            ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20"
                            : "text-gray-700 hover:bg-orange-50 hover:text-orange-600 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold leading-tight truncate">{item.label}</p>
                            {item.sublabel && (
                              <p className={`text-[10px] leading-tight truncate mt-0.5 ${isActive ? "text-white/80" : "text-gray-400"}`}>
                                {item.sublabel}
                              </p>
                            )}
                          </div>
                        </div>

                        {item.badge && (
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            isActive ? "bg-white text-orange-600 font-extrabold" : "bg-orange-100 text-orange-700"
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Drawer Footer */}
        <div className="p-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>ออกจากระบบ</span>
          </button>
          <span className="text-[10px] text-gray-400">ART ROOM v2.0</span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* ===== MAIN CONTENT AREA ===== */}
      {/* ============================================================ */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* Modern Sticky Mobile Header */}
        <div className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 px-3 py-2.5 flex items-center justify-between shadow-2xs">
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-50 text-orange-700 font-bold text-xs border border-orange-200 shadow-2xs active:scale-95 transition-all cursor-pointer"
          >
            <Menu className="w-4 h-4" />
            <span>เมนูระบบ ({allMenuItems.length})</span>
          </button>

          <div className="flex items-center gap-1.5 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/school-logo.png" alt="School Logo" className="w-6 h-6 object-cover rounded-full bg-white border border-gray-200" />
            <span className="font-bold text-xs truncate font-kanit text-gray-800">Admin System</span>
          </div>

          <button 
            type="button" 
            onClick={handleLogout} 
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
            title="ออกจากระบบ"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 sm:p-6 md:p-8 max-w-[1650px] w-full mx-auto space-y-5">
          {/* Executive Luxury Header Bar */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 border border-gray-200/80 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-500 to-orange-600 text-white flex items-center justify-center font-bold shadow-md shadow-orange-500/20 shrink-0">
                {activeItemInfo ? <activeItemInfo.icon className="w-5 h-5 sm:w-6 sm:h-6" /> : <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] sm:text-[11px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full uppercase tracking-wider border border-orange-200/60">
                    Art Room System
                  </span>
                  <span className="text-[11px] text-gray-400">• โรงเรียนวชิรธรรมสาธิต</span>
                </div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 tracking-tight font-kanit mt-1 leading-snug">
                  {activeItemInfo ? activeItemInfo.label : "ระบบบริหารจัดการข้อมูล"}
                </h1>
                <p className="text-gray-500 text-[11px] sm:text-xs mt-0.5 truncate">
                  {activeItemInfo?.sublabel || "ระบบบริหารจัดการข้อมูลทางวิชาการและสารสนเทศเว็บไซต์ห้องเรียนศิลปะ"}
                </p>
              </div>
            </div>

            {/* Compact Luxury Visitor Metric Badges */}
            <div className="flex items-center gap-2 sm:gap-3 self-start lg:self-center shrink-0 flex-wrap">
              <div className="bg-gray-50/80 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-2 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div>
                  <p className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-wider">ผู้เข้าชมทั้งหมด</p>
                  <p className="text-sm sm:text-base font-bold font-kanit text-gray-900 leading-none mt-0.5">
                    {visitorStats.total.toLocaleString()} <span className="text-xs font-normal text-gray-500">คน</span>
                  </p>
                </div>
              </div>

              <div className="bg-emerald-50/50 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl border border-emerald-200/80 shadow-2xs flex items-center gap-2 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div>
                  <p className="text-[9px] sm:text-[10px] text-emerald-700 font-bold uppercase tracking-wider">เข้าชมวันนี้</p>
                  <p className="text-sm sm:text-base font-bold font-kanit text-emerald-800 leading-none mt-0.5">
                    {visitorStats.today.toLocaleString()} <span className="text-xs font-normal text-emerald-600">คน</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* ===== MOBILE EXPANDED CATEGORY FILTER & SWIPEABLE TABS ===== */}
          {/* ============================================================ */}
          <div className="md:hidden space-y-2.5 bg-white p-3 rounded-2xl border border-gray-200/80 shadow-2xs">
            {/* Top Category Filter Selector */}
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-gray-100">
              <span className="text-[11px] font-bold text-gray-600 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-orange-500" />
                <span>หมวดหมู่เมนู:</span>
              </span>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(true)}
                className="text-[11px] text-orange-600 font-bold flex items-center gap-1 cursor-pointer hover:underline"
              >
                <span>ดูทั้งหมด (17)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Category Quick Pills */}
            <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: "all", label: "ทั้งหมด (17)" },
                { id: "teaching", label: "🎓 ระบบสอน (6)" },
                { id: "artworks", label: "🎨 ผลงาน (5)" },
                { id: "users", label: "👥 ผู้ใช้ (5)" },
                { id: "security", label: "🔐 ปลอดภัย (2)" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedMobileCategory(cat.id)}
                  className={`flex-shrink-0 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                    selectedMobileCategory === cat.id
                      ? "bg-gray-900 text-white shadow-xs"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200/80"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Horizontal Swipeable Tab Carousel */}
            <div className="flex space-x-1.5 overflow-x-auto pt-1 pb-1 scrollbar-none">
              {visibleMobilePills.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleSelectTab(item.key)}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20 font-bold"
                        : "bg-slate-50 border border-slate-200 text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                        isActive ? "bg-white text-orange-600" : "bg-orange-200 text-orange-800"
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ============================================================ */}
          {/* ===== RENDER ACTIVE TAB COMPONENT ===== */}
          {/* ============================================================ */}
          <div className="transition-all duration-150">
            {activeTab === "submissionsCenter" && <SubmissionsCenterTab />}
            {activeTab === "teachingSetup" && <TeachingSetupTab />}
            {activeTab === "assignments" && (
              <AssignmentsTab
                onGoToGrading={(id) => {
                  setGradingAssignmentId(id);
                  setActiveTab("grading");
                }}
              />
            )}
            {activeTab === "grading" && (
              <GradingTab preselectedAssignmentId={gradingAssignmentId} />
            )}
            {activeTab === "quizzes" && <QuizzesTab />}
            {activeTab === "downloads" && <DownloadsTab />}
            {activeTab === "awards" && <AwardsTab />}
            {activeTab === "artworks" && <ArtworksTab />}
            {activeTab === "news" && <NewsTab />}
            {activeTab === "activities" && <ActivitiesTab />}
            {activeTab === "students" && <StudentsTab />}
            {activeTab === "guests" && <GuestsTab />}
            {activeTab === "teachers" && <TeachersTab />}
            {activeTab === "testimonials" && <TestimonialsTab />}
            {activeTab === "ideas" && <IdeasTab />}
            {activeTab === "comments" && <CommentsModerationTab />}
            {activeTab === "heroButton" && <HeroButtonTab />}
            {activeTab === "adminSecurity" && <AdminSecurityTab />}
          </div>
        </div>
      </main>
    </div>
  );
}


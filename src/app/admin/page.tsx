"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Award, Image as ImageIcon, Newspaper, Calendar, Users, LogOut, LayoutDashboard, Lightbulb, Info, ChevronRight, X, GraduationCap, FolderDown, School, ClipboardList, BookCheck, HelpCircle, Sparkles, Camera, Inbox, MessageSquare, KeyRound } from "lucide-react";

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

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "submissionsCenter" | "teachingSetup" | "assignments" | "grading" | "quizzes" | "artworks" | "awards" | "news" | "activities" | "students" | "guests" | "testimonials" | "ideas" | "teachers" | "heroButton" | "comments" | "adminSecurity"
  >("submissionsCenter");
  const [gradingAssignmentId, setGradingAssignmentId] = useState<string | undefined>(undefined);
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
          {/* Section 1: Academic & Assignments */}
          <div className="mb-6">
            <p className="text-[11px] font-bold text-orange-600 uppercase tracking-wider mb-2 px-3 flex items-center gap-1.5">
              <School className="w-3.5 h-3.5" /> ระบบการสอน & ส่งงาน
            </p>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab("submissionsCenter")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-xs font-semibold ${
                  activeTab === "submissionsCenter" 
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20" 
                    : "text-gray-700 hover:text-orange-600 hover:bg-orange-50"
                }`}
              >
                <Inbox className="w-4 h-4" />
                <span>ศูนย์ส่งงาน & แจ้งเตือน (Submissions)</span>
              </button>
              <button
                onClick={() => setActiveTab("teachingSetup")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-xs font-semibold ${
                  activeTab === "teachingSetup" 
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" 
                    : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                }`}
              >
                <School className="w-4 h-4" />
                <span>1. โครงสร้างการสอน (ปี/วิชา/ห้อง)</span>
              </button>
              <button
                onClick={() => setActiveTab("assignments")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-xs font-semibold ${
                  activeTab === "assignments" 
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" 
                    : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                <span>2. มอบหมายงาน (Assignments)</span>
              </button>
              <button
                onClick={() => {
                  setGradingAssignmentId(undefined);
                  setActiveTab("grading");
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-xs font-semibold ${
                  activeTab === "grading" 
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" 
                    : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                }`}
              >
                <BookCheck className="w-4 h-4" />
                <span>3. ตรวจงาน & ให้คะแนน</span>
              </button>
              <button
                onClick={() => setActiveTab("quizzes")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-xs font-semibold ${
                  activeTab === "quizzes" 
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" 
                    : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>4. แบบทดสอบ (Pre-test)</span>
              </button>
            </nav>
          </div>

          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">การจัดการเว็บไซต์</p>
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("awards")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-xs font-semibold ${
                activeTab === "awards" 
                  ? "bg-orange-500 text-white shadow-xs shadow-orange-500/20" 
                  : "text-slate-600 hover:text-orange-600 hover:bg-orange-50/70"
              }`}
            >
              <Award className="w-4 h-4" />
              <span>จัดการรางวัลที่ได้รับ</span>
            </button>
            <button
              onClick={() => setActiveTab("artworks")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-xs font-semibold ${
                activeTab === "artworks" 
                  ? "bg-orange-500 text-white shadow-xs shadow-orange-500/20" 
                  : "text-slate-600 hover:text-orange-600 hover:bg-orange-50/70"
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>จัดการผลงานนักเรียน</span>
            </button>
            <button
              onClick={() => setActiveTab("news")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-xs font-semibold ${
                activeTab === "news" 
                  ? "bg-orange-500 text-white shadow-xs shadow-orange-500/20" 
                  : "text-slate-600 hover:text-orange-600 hover:bg-orange-50/70"
              }`}
            >
              <Newspaper className="w-4 h-4" />
              <span>จัดการข่าวสาร & ปฏิทิน</span>
            </button>
            <button
              onClick={() => setActiveTab("activities")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-xs font-semibold ${
                activeTab === "activities" 
                  ? "bg-orange-500 text-white shadow-xs shadow-orange-500/20" 
                  : "text-slate-600 hover:text-orange-600 hover:bg-orange-50/70"
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>จัดการภาพกิจกรรม</span>
            </button>
            <button
              onClick={() => setActiveTab("students")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-xs font-semibold ${
                activeTab === "students" 
                  ? "bg-orange-500 text-white shadow-xs shadow-orange-500/20" 
                  : "text-slate-600 hover:text-orange-600 hover:bg-orange-50/70"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>จัดการฐานข้อมูลนักเรียน</span>
            </button>
            <button
              onClick={() => setActiveTab("guests")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-xs font-semibold ${
                activeTab === "guests" 
                  ? "bg-orange-500 text-white shadow-xs shadow-orange-500/20" 
                  : "text-slate-600 hover:text-orange-600 hover:bg-orange-50/70"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>ฐานข้อมูลบุคคลทั่วไป</span>
            </button>
            <button
              onClick={() => setActiveTab("teachers")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-xs font-semibold ${
                activeTab === "teachers" 
                  ? "bg-orange-500 text-white shadow-xs shadow-orange-500/20" 
                  : "text-slate-600 hover:text-orange-600 hover:bg-orange-50/70"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Teacher Profile & Awards</span>
            </button>
            <button
              onClick={() => setActiveTab("testimonials")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-xs font-semibold ${
                activeTab === "testimonials" 
                  ? "bg-orange-500 text-white shadow-xs shadow-orange-500/20" 
                  : "text-slate-600 hover:text-orange-600 hover:bg-orange-50/70"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>จัดการรีวิวรุ่นพี่</span>
            </button>
            <button
              onClick={() => setActiveTab("ideas")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-xs font-semibold ${
                activeTab === "ideas" 
                  ? "bg-orange-500 text-white shadow-xs shadow-orange-500/20" 
                  : "text-slate-600 hover:text-orange-600 hover:bg-orange-50/70"
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              <span>จัดการไอเดีย</span>
            </button>
            <button
              onClick={() => setActiveTab("comments")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-xs font-semibold ${
                activeTab === "comments" 
                  ? "bg-orange-500 text-white shadow-xs shadow-orange-500/20" 
                  : "text-slate-600 hover:text-orange-600 hover:bg-orange-50/70"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>จัดการความคิดเห็น & บอร์ด</span>
            </button>
            <button
              onClick={() => setActiveTab("heroButton")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-xs font-semibold ${
                activeTab === "heroButton" 
                  ? "bg-red-600 text-white shadow-xs shadow-red-600/20" 
                  : "text-slate-600 hover:text-red-600 hover:bg-red-50/70"
              }`}
            >
              <Sparkles className="w-4 h-4 text-red-500" />
              <span>ตั้งค่าปุ่ม AI Art Model</span>
            </button>
            <button
              onClick={() => setActiveTab("adminSecurity")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-xs font-semibold ${
                activeTab === "adminSecurity" 
                  ? "bg-amber-500 text-white shadow-xs shadow-amber-500/20" 
                  : "text-slate-600 hover:text-amber-600 hover:bg-amber-50/70"
              }`}
            >
              <KeyRound className="w-4 h-4 text-amber-500" />
              <span>ตั้งค่ารหัสผ่านแอดมิน</span>
            </button>
          </nav>
        </div>

        <div className="p-3 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors text-xs font-semibold"
          >
            <LogOut className="w-4 h-4" />
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

        <div className="p-4 sm:p-6 md:p-8 max-w-[1650px] w-full mx-auto space-y-6">
          {/* Executive Luxury Header Bar */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200/80 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-500 to-orange-600 text-white flex items-center justify-center font-bold shadow-md shadow-orange-500/20 shrink-0">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-orange-200/60">
                    Art Room System
                  </span>
                  <span className="text-xs text-gray-400">• โรงเรียนวชิรธรรมสาธิต</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight font-kanit mt-1">
                  {activeTab === "submissionsCenter" && "ศูนย์รวมข้อมูลส่งงาน & ระบบแจ้งเตือนอีเมล (Submissions & Notifications)"}
                  {activeTab === "teachingSetup" && "โครงสร้างการจัดการเรียนการสอน (Curriculum Setup)"}
                  {activeTab === "assignments" && "ระบบจัดการภาระงานและชิ้นงาน (Assignments)"}
                  {activeTab === "grading" && "ระบบตรวจผลงานและบันทึกคะแนน (Evaluation)"}
                  {activeTab === "quizzes" && "ระบบแบบทดสอบก่อนเรียนและรายงานคะแนน (Pre-tests & Reports)"}
                  {activeTab === "awards" && "จัดการรางวัลที่ได้รับ (Awards)"}
                  {activeTab === "artworks" && "จัดการผลงานนักเรียน (Artworks)"}
                  {activeTab === "ideas" && "จัดการห้องสมุดไอเดียสร้างสรรค์ (Ideas Library)"}
                  {activeTab === "news" && "จัดการข่าวสารและปฏิทินกิจกรรม (News & Calendar)"}
                  {activeTab === "activities" && "จัดการอัลบั้มภาพกิจกรรม (Activity Gallery)"}
                  {activeTab === "students" && "จัดการรายชื่อและสถิติการเข้าใช้นักเรียน (Students)"}
                  {activeTab === "guests" && "ฐานข้อมูลบุคคลทั่วไปและผู้ปกครอง (Guests)"}
                  {activeTab === "teachers" && "จัดการทำเนียบครูผู้สอน (Teachers)"}
                  {activeTab === "testimonials" && "จัดการรีวิวและเสียงตอบรับจากรุ่นพี่ (Testimonials)"}
                  {activeTab === "heroButton" && "ตั้งค่าปุ่ม AI Art Model (Hero Section Management)"}
                  {activeTab === "adminSecurity" && "ตั้งค่ารหัสผ่านผู้ดูแลระบบ (Admin Password Security)"}
                </h1>
                <p className="text-gray-500 text-xs mt-0.5">
                  ระบบบริหารจัดการข้อมูลทางวิชาการและสารสนเทศเว็บไซต์ห้องเรียนศิลปะ
                </p>
              </div>
            </div>

            {/* Compact Luxury Visitor Metric Badges */}
            <div className="flex items-center gap-2.5 sm:gap-3 self-start lg:self-center shrink-0">
              <div className="bg-gray-50/80 px-4 py-2.5 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">ผู้เข้าชมทั้งหมด</p>
                  <p className="text-base font-bold font-kanit text-gray-900 leading-none mt-0.5">
                    {visitorStats.total.toLocaleString()} <span className="text-xs font-normal text-gray-500">คน</span>
                  </p>
                </div>
              </div>

              <div className="bg-emerald-50/50 px-4 py-2.5 rounded-2xl border border-emerald-200/80 shadow-2xs flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">เข้าชมวันนี้</p>
                  <p className="text-base font-bold font-kanit text-emerald-800 leading-none mt-0.5">
                    {visitorStats.today.toLocaleString()} <span className="text-xs font-normal text-emerald-600">คน</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Tabs */}
          <div className="flex md:hidden space-x-1.5 mb-6 bg-white p-1.5 rounded-2xl shadow-2xs border border-slate-200 overflow-x-auto">
            {[
              { key: "submissionsCenter", label: "ศูนย์ส่งงาน", icon: Inbox },
              { key: "assignments", label: "มอบหมายงาน", icon: ClipboardList },
              { key: "grading", label: "ตรวจงาน", icon: BookCheck },
              { key: "quizzes", label: "แบบทดสอบ", icon: HelpCircle },
              { key: "teachingSetup", label: "โครงสร้างสอน", icon: School },
              { key: "awards", label: "รางวัล", icon: Award },
              { key: "artworks", label: "ผลงาน", icon: ImageIcon },
              { key: "ideas", label: "ไอเดีย", icon: Lightbulb },
              { key: "news", label: "ข่าว & ปฏิทิน", icon: Newspaper },
              { key: "activities", label: "ภาพกิจกรรม", icon: Camera },
              { key: "students", label: "นักเรียน", icon: Users },
              { key: "teachers", label: "ทำเนียบครู", icon: GraduationCap },
              { key: "testimonials", label: "รีวิวรุ่นพี่", icon: BookOpen },
              { key: "guests", label: "บุคคลทั่วไป", icon: Users },
              { key: "heroButton", label: "ปุ่ม AI Model", icon: Sparkles },
              { key: "adminSecurity", label: "รหัสผ่านแอดมิน", icon: KeyRound },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === key
                    ? "bg-orange-500 text-white shadow-xs shadow-orange-500/20"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Render Active Tab Content */}
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
      </main>
    </div>
  );
}

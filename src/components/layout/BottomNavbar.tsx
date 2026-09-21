"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  Upload,
  Lightbulb,
  Menu,
  X,
  Trophy,
  Palette,
  Newspaper,
  CalendarDays,
  GraduationCap,
  PhoneCall,
  Building2,
  Landmark,
  User,
  LogOut,
  Settings,
  Sparkles,
  ChevronRight,
  LogIn
} from "lucide-react";
import ProfileSettingsModal from "@/components/modals/ProfileSettingsModal";
import { resolveUserAvatar } from "@/lib/art-avatars";
import { performGlobalLogout } from "@/lib/client-auth";

export default function BottomNavbar() {
  const pathname = usePathname();
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isTeachersEnabled, setIsTeachersEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);

  const updateUserData = () => {
    setUserName(localStorage.getItem("artroom_author_name"));
    setUserRole(localStorage.getItem("artroom_role"));
    setUserAvatar(localStorage.getItem("artroom_avatar"));
  };

  useEffect(() => {
    setMounted(true);
    updateUserData();
    window.addEventListener("artroom_profile_updated", updateUserData);
    window.addEventListener("storage", updateUserData);

    fetch("/api/teachers/status")
      .then((res) => res.json())
      .then((data: any) => {
        if (data && typeof data.enabled === "boolean") {
          setIsTeachersEnabled(data.enabled);
        }
      })
      .catch(() => {});

    return () => {
      window.removeEventListener("artroom_profile_updated", updateUserData);
      window.removeEventListener("storage", updateUserData);
    };
  }, []);

  // Close more menu when pathname changes
  useEffect(() => {
    setIsMoreMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    setIsMoreMenuOpen(false);
    await performGlobalLogout("/");
  };

  // Hide on admin pages (admin has its own dedicated mobile bar)
  if (pathname?.startsWith("/admin")) return null;
  if (!mounted) return null;

  const isHomeActive = pathname === "/";
  const isMaterialsActive = pathname.startsWith("/materials");
  const isSubmissionsActive = pathname.startsWith("/submissions") || pathname.startsWith("/submit-work");
  const isIdeasActive = pathname.startsWith("/ideas");
  const isMoreActive = isMoreMenuOpen || (
    !isHomeActive && !isMaterialsActive && !isSubmissionsActive && !isIdeasActive
  );

  const resolvedAvatar = resolveUserAvatar(userAvatar, userName);

  return (
    <>
      {/* ============================================================ */}
      {/* ===== 5-BUTTON BOTTOM NAVIGATION BAR (Fixed Mobile) ===== */}
      {/* ============================================================ */}
      <nav
        className="bottom-nav fixed bottom-0 inset-x-0 z-[90] lg:hidden select-none"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="mx-auto sm:max-w-[480px] bg-white/95 backdrop-blur-xl border-t border-gray-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] sm:border sm:border-gray-200/80 sm:rounded-t-2xl sm:shadow-[0_-4px_24px_rgba(0,0,0,0.12)]">
          <div className="grid grid-cols-5 h-14 items-center">
            {/* 1. หน้าแรก */}
            <Link
              href="/"
              className={`flex flex-col items-center justify-center h-full gap-0.5 transition-all active:scale-95 cursor-pointer ${
                isHomeActive ? "text-red-600 font-bold" : "text-gray-500 hover:text-gray-800 font-medium"
              }`}
            >
              <div className={`relative flex items-center justify-center ${isHomeActive ? "scale-110" : ""}`}>
                <Home className="w-5 h-5" />
                {isHomeActive && <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-red-500" />}
              </div>
              <span className="bottom-nav-label text-[10px] leading-tight truncate">หน้าแรก</span>
            </Link>

            {/* 2. สื่อการสอน */}
            <Link
              href="/materials"
              className={`flex flex-col items-center justify-center h-full gap-0.5 transition-all active:scale-95 cursor-pointer ${
                isMaterialsActive ? "text-red-600 font-bold" : "text-gray-500 hover:text-gray-800 font-medium"
              }`}
            >
              <div className={`relative flex items-center justify-center ${isMaterialsActive ? "scale-110" : ""}`}>
                <BookOpen className="w-5 h-5" />
                {isMaterialsActive && <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-red-500" />}
              </div>
              <span className="bottom-nav-label text-[10px] leading-tight truncate">สื่อการสอน</span>
            </Link>

            {/* 3. ส่งงาน (NEW) */}
            <Link
              href="/submissions"
              className={`flex flex-col items-center justify-center h-full gap-0.5 transition-all active:scale-95 cursor-pointer ${
                isSubmissionsActive ? "text-red-600 font-bold" : "text-gray-500 hover:text-gray-800 font-medium"
              }`}
            >
              <div className={`relative flex items-center justify-center ${isSubmissionsActive ? "scale-110" : ""}`}>
                <Upload className="w-5 h-5" />
                <span className="absolute -top-1.5 -right-2.5 px-1 py-0.2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[8px] font-extrabold rounded-full scale-90 shadow-2xs">
                  NEW
                </span>
              </div>
              <span className="bottom-nav-label text-[10px] leading-tight truncate">ส่งงาน</span>
            </Link>

            {/* 4. แชร์ไอเดีย */}
            <Link
              href="/ideas"
              className={`flex flex-col items-center justify-center h-full gap-0.5 transition-all active:scale-95 cursor-pointer ${
                isIdeasActive ? "text-red-600 font-bold" : "text-gray-500 hover:text-gray-800 font-medium"
              }`}
            >
              <div className={`relative flex items-center justify-center ${isIdeasActive ? "scale-110" : ""}`}>
                <Lightbulb className="w-5 h-5" />
                {isIdeasActive && <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-red-500" />}
              </div>
              <span className="bottom-nav-label text-[10px] leading-tight truncate">แชร์ไอเดีย</span>
            </Link>

            {/* 5. เมนูทั้งหมด (More Bottom Sheet) */}
            <button
              type="button"
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              className={`flex flex-col items-center justify-center h-full gap-0.5 transition-all active:scale-95 cursor-pointer ${
                isMoreActive ? "text-red-600 font-bold" : "text-gray-500 hover:text-gray-800 font-medium"
              }`}
            >
              <div className={`relative flex items-center justify-center ${isMoreActive ? "scale-110" : ""}`}>
                {isMoreMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                {isMoreActive && !isMoreMenuOpen && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-red-500" />
                )}
              </div>
              <span className="bottom-nav-label text-[10px] leading-tight truncate">เมนูทั้งหมด</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ============================================================ */}
      {/* ===== ALL-IN-ONE MORE MENU BOTTOM SHEET ===== */}
      {/* ============================================================ */}
      {isMoreMenuOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-[99990] animate-in fade-in duration-200"
            onClick={() => setIsMoreMenuOpen(false)}
          />

          <div
            className="lg:hidden fixed bottom-0 inset-x-0 bg-white rounded-t-3xl shadow-2xl z-[99991] max-h-[85vh] overflow-y-auto p-5 pb-8 animate-in slide-in-from-bottom duration-250 border-t border-gray-100 max-w-lg mx-auto"
            style={{ paddingBottom: "calc(4.5rem + env(safe-area-inset-bottom, 0px))" }}
          >
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />

            {/* Sheet Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center p-1 shadow-2xs border border-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/school-logo.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900 font-kanit leading-tight">
                    <span className="text-red-600">ART ROOM</span> เมนูระบบทั้งหมด
                  </h3>
                  <p className="text-[11px] text-gray-500">โรงเรียนวชิรธรรมสาธิต</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Group 1: ผลงาน & รางวัลศิลปะ */}
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
                  ผลงาน & รางวัลศิลปะ
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/awards"
                    onClick={() => setIsMoreMenuOpen(false)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-2xl border transition-all cursor-pointer ${
                      pathname.startsWith("/awards")
                        ? "bg-amber-50 border-amber-300 text-amber-900 shadow-2xs font-bold"
                        : "bg-gray-50 hover:bg-amber-50/40 border-gray-100 text-gray-800 font-medium"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs leading-tight truncate">รางวัลที่ได้รับ</p>
                      <p className="text-[9px] text-gray-400 leading-tight truncate mt-0.5">การประกวดแข่งขัน</p>
                    </div>
                  </Link>

                  <Link
                    href="/artworks"
                    onClick={() => setIsMoreMenuOpen(false)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-2xl border transition-all cursor-pointer ${
                      pathname.startsWith("/artworks")
                        ? "bg-rose-50 border-rose-300 text-rose-900 shadow-2xs font-bold"
                        : "bg-gray-50 hover:bg-rose-50/40 border-gray-100 text-gray-800 font-medium"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                      <Palette className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs leading-tight truncate">ผลงานนักเรียน</p>
                      <p className="text-[9px] text-gray-400 leading-tight truncate mt-0.5">แกลเลอรีสร้างสรรค์</p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Group 2: คลังสื่อ & องค์กร */}
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
                  คลังสื่อองค์กร
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="https://media-center.moe.go.th/Home"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsMoreMenuOpen(false)}
                    className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-gray-50 hover:bg-blue-50/50 border border-gray-100 text-gray-800 font-medium transition-all cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs leading-tight truncate">ศูนย์เรียนรู้ ศธ.</p>
                      <p className="text-[9px] text-gray-400 leading-tight truncate mt-0.5">กระทรวงศึกษาธิการ</p>
                    </div>
                  </Link>

                  <Link
                    href="https://elibrary-bacc.hibrary.me/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsMoreMenuOpen(false)}
                    className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-gray-50 hover:bg-purple-50/50 border border-gray-100 text-gray-800 font-medium transition-all cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                      <Landmark className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs leading-tight truncate">ห้องสมุด BACC</p>
                      <p className="text-[9px] text-gray-400 leading-tight truncate mt-0.5">หอศิลปวัฒนธรรมฯ</p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Group 3: ข้อมูล & เกี่ยวกับเรา */}
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
                  เกี่ยวกับเรา & ข้อมูล
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/news"
                    onClick={() => setIsMoreMenuOpen(false)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-2xl border transition-all cursor-pointer ${
                      pathname.startsWith("/news")
                        ? "bg-orange-50 border-orange-300 text-orange-900 shadow-2xs font-bold"
                        : "bg-gray-50 hover:bg-orange-50/40 border-gray-100 text-gray-800 font-medium"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                      <Newspaper className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs leading-tight truncate">ข่าวสารและประกาศ</p>
                      <p className="text-[9px] text-gray-400 leading-tight truncate mt-0.5">ประชาสัมพันธ์</p>
                    </div>
                  </Link>

                  <Link
                    href="/activities"
                    onClick={() => setIsMoreMenuOpen(false)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-2xl border transition-all cursor-pointer ${
                      pathname.startsWith("/activities")
                        ? "bg-pink-50 border-pink-300 text-pink-900 shadow-2xs font-bold"
                        : "bg-gray-50 hover:bg-pink-50/40 border-gray-100 text-gray-800 font-medium"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                      <CalendarDays className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs leading-tight truncate">กิจกรรมต่างๆ</p>
                      <p className="text-[9px] text-gray-400 leading-tight truncate mt-0.5">ภาพกิจกรรมศิลปะ</p>
                    </div>
                  </Link>

                  {isTeachersEnabled && (
                    <Link
                      href="/teachers"
                      onClick={() => setIsMoreMenuOpen(false)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-2xl border transition-all cursor-pointer ${
                        pathname.startsWith("/teachers")
                          ? "bg-indigo-50 border-indigo-300 text-indigo-900 shadow-2xs font-bold"
                          : "bg-gray-50 hover:bg-indigo-50/40 border-gray-100 text-gray-800 font-medium"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs leading-tight truncate">Teacher Profile</p>
                        <p className="text-[9px] text-gray-400 leading-tight truncate mt-0.5">ประวัติครูผู้สอน</p>
                      </div>
                    </Link>
                  )}

                  <Link
                    href="/contact"
                    onClick={() => setIsMoreMenuOpen(false)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-2xl border transition-all cursor-pointer ${
                      pathname === "/contact"
                        ? "bg-emerald-50 border-emerald-300 text-emerald-900 shadow-2xs font-bold"
                        : "bg-gray-50 hover:bg-emerald-50/40 border-gray-100 text-gray-800 font-medium"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs leading-tight truncate">ติดต่อเรา</p>
                      <p className="text-[9px] text-gray-400 leading-tight truncate mt-0.5">กลุ่มสาระฯ ศิลปะ</p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Group 4: บัญชีผู้ใช้งาน & การตั้งค่า */}
              <div className="pt-2 border-t border-gray-100">
                {userName ? (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        setIsProfileModalOpen(true);
                      }}
                      className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-200 text-left transition-all cursor-pointer hover:bg-orange-100/60 shadow-2xs"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-white shadow-2xs border border-orange-200 flex items-center justify-center shrink-0">
                        {resolvedAvatar.type === "image" ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={resolvedAvatar.value} alt={userName} className="w-full h-full object-cover" />
                        ) : resolvedAvatar.type === "preset" ? (
                          <span className="text-lg select-none">{resolvedAvatar.value}</span>
                        ) : (
                          <span className="text-xs font-bold text-orange-600">{resolvedAvatar.value}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-orange-600 font-bold uppercase">
                          {userRole === "teacher" || userRole === "admin" ? "ครูผู้สอน / ผู้ดูแลระบบ" : "นักเรียน / ผู้ใช้งาน"}
                        </p>
                        <p className="text-sm font-bold text-gray-900 truncate">{userName}</p>
                      </div>
                      <span className="text-xs text-orange-700 bg-white px-2.5 py-1 rounded-full shadow-2xs border border-orange-200 flex items-center gap-1 font-semibold">
                        <Settings className="w-3.5 h-3.5" /> ตั้งค่า
                      </span>
                    </button>

                    {(userRole === "teacher" || userRole === "admin") && (
                      <Link
                        href="/admin"
                        onClick={() => setIsMoreMenuOpen(false)}
                        className="w-full flex items-center justify-center gap-2 p-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-bold text-xs shadow-sm hover:from-red-700 hover:to-rose-700 transition-all cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>เข้าระบบหลังบ้าน (Admin System)</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 p-2.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>ออกจากระบบ</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsMoreMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-red-500/20 transition-all cursor-pointer active:scale-98"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>เข้าสู่ระบบ (Login)</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Global Profile Settings Modal */}
      <ProfileSettingsModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
}

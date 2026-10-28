"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSiteLogo } from "@/context/LogoContext";
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
  LogOut,
  Settings,
  Sparkles,
  ChevronDown,
  LogIn,
  ExternalLink,
  ShieldCheck,
  FolderOpen
} from "lucide-react";
import ProfileSettingsModal from "@/components/modals/ProfileSettingsModal";
import { resolveUserAvatar } from "@/lib/art-avatars";
import { performGlobalLogout } from "@/lib/client-auth";

export default function BottomNavbar() {
  const pathname = usePathname();
  const { logoSettings } = useSiteLogo();
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isTeachersEnabled, setIsTeachersEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isExamActive, setIsExamActive] = useState(false);

  // Detect exam mode to unmount BottomNavbar completely during active exam
  useEffect(() => {
    const checkExam = () => {
      setIsExamActive(document.body.classList.contains("exam-mode-active"));
    };
    checkExam();
    const observer = new MutationObserver(checkExam);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Accordion state inside full-screen menu
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    artworks: true, // Default open for quick access
    media: false,
    about: false,
  });

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

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

    const handleOpenMobileMenu = () => setIsMoreMenuOpen(true);
    window.addEventListener("openMobileMenu", handleOpenMobileMenu);

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
      window.removeEventListener("openMobileMenu", handleOpenMobileMenu);
    };
  }, []);

  // Lock body scroll when full-screen menu is open
  useEffect(() => {
    if (isMoreMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMoreMenuOpen]);

  // Close menu when pathname changes
  useEffect(() => {
    setIsMoreMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    setIsMoreMenuOpen(false);
    await performGlobalLogout("/");
  };

  // Hide on admin pages
  if (pathname?.startsWith("/admin")) return null;

  const isHomeActive = pathname === "/";
  const isMaterialsActive = pathname.startsWith("/materials");
  const isSubmissionsActive = pathname.startsWith("/submissions") || pathname.startsWith("/submit-work");
  const isIdeasActive = pathname.startsWith("/ideas");
  const isMoreActive = isMoreMenuOpen;

  const resolvedAvatar = resolveUserAvatar(userAvatar, userName);

  if (isExamActive) return null;

  return (
    <>
      {/* ============================================================ */}
      {/* ===== 5-BUTTON BOTTOM NAVIGATION BAR (Fixed Mobile) ===== */}
      {/* ============================================================ */}
      <nav
        className="bottom-nav fixed bottom-0 inset-x-0 z-[90] lg:hidden select-none bg-white/95 backdrop-blur-xl border-t border-gray-200/90"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="mx-auto sm:max-w-[480px]">
          <div className="grid grid-cols-5 h-14 items-center">
            {/* 1. หน้าแรก */}
            <Link
              href="/"
              className={`flex flex-col items-center justify-center h-full min-h-[44px] gap-0.5 transition-all active:scale-95 cursor-pointer ${
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
              className={`flex flex-col items-center justify-center h-full min-h-[44px] gap-0.5 transition-all active:scale-95 cursor-pointer ${
                isMaterialsActive ? "text-red-600 font-bold" : "text-gray-500 hover:text-gray-800 font-medium"
              }`}
            >
              <div className={`relative flex items-center justify-center ${isMaterialsActive ? "scale-110" : ""}`}>
                <BookOpen className="w-5 h-5" />
                {isMaterialsActive && <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-red-500" />}
              </div>
              <span className="bottom-nav-label text-[10px] leading-tight truncate">สื่อการสอน</span>
            </Link>

            {/* 3. ส่งงาน (SINGLE NEW BADGE) */}
            <Link
              href="/submissions"
              className={`flex flex-col items-center justify-center h-full min-h-[44px] gap-0.5 transition-all active:scale-95 cursor-pointer ${
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
              className={`flex flex-col items-center justify-center h-full min-h-[44px] gap-0.5 transition-all active:scale-95 cursor-pointer ${
                isIdeasActive ? "text-red-600 font-bold" : "text-gray-500 hover:text-gray-800 font-medium"
              }`}
            >
              <div className={`relative flex items-center justify-center ${isIdeasActive ? "scale-110" : ""}`}>
                <Lightbulb className="w-5 h-5" />
                {isIdeasActive && <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-red-500" />}
              </div>
              <span className="bottom-nav-label text-[10px] leading-tight truncate">แชร์ไอเดีย</span>
            </Link>

            {/* 5. เมนูทั้งหมด (Full-Screen Menu Opener) */}
            <button
              type="button"
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] gap-0.5 transition-all active:scale-95 cursor-pointer ${
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
      {/* ===== FULL-SCREEN MOBILE MENU OVERLAY (All Desktop Links) ===== */}
      {/* ============================================================ */}
      {isMoreMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 h-[100dvh] z-[99995] bg-white flex flex-col animate-in fade-in duration-200"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          {/* Top Bar with School Branding & Big Close Button */}
          <div className="h-16 px-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0 shadow-2xs">
            <Link 
              href="/" 
              onClick={() => setIsMoreMenuOpen(false)}
              className="flex items-center gap-2.5 min-w-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoSettings.logoUrl || "/artroom-logo.png"}
                alt={logoSettings.logoAlt || "Logo"}
                className={`w-11 h-11 sm:w-12 sm:h-12 object-contain shrink-0 ${
                  logoSettings.logoShape === "circle" ? "rounded-full" : logoSettings.logoShape === "square" ? "rounded-none" : "rounded-2xl"
                }`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/artroom-logo.png";
                }}
              />
              {logoSettings.showText && (
                <div className="flex flex-col justify-center min-w-0">
                  <span className="font-heading font-black text-lg tracking-tight leading-none">
                    <span className="text-red-600">{logoSettings.brandNamePrefix || "ART"} </span>
                    <span className="text-gray-900">{logoSettings.brandNameSuffix || "ROOM"}</span>
                  </span>
                  <span className="text-[9px] text-gray-500 font-semibold tracking-wider uppercase leading-tight mt-0.5 truncate">
                    {logoSettings.schoolName || "WACHIRATHAMMASATIT SCHOOL"}
                  </span>
                </div>
              )}
            </Link>

            {/* Big Close Button (>= 44px) */}
            <button
              type="button"
              onClick={() => setIsMoreMenuOpen(false)}
              aria-label="ปิดเมนู"
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 flex items-center justify-center text-gray-700 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3 pb-24">
            
            {/* User Account / Login Header Card (สี่เหลี่ยม มนๆ) */}
            <div className="p-3.5 bg-gradient-to-r from-gray-50 to-orange-50/40 rounded-xl border border-gray-200">
              {mounted && userName ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-white shadow-xs border border-orange-200 flex items-center justify-center shrink-0">
                      {resolvedAvatar.type === "image" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={resolvedAvatar.value} alt={userName} className="w-full h-full object-cover" />
                      ) : resolvedAvatar.type === "preset" ? (
                        <span className="text-2xl select-none">{resolvedAvatar.value}</span>
                      ) : (
                        <span className="text-sm font-bold text-orange-600">{resolvedAvatar.value}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-orange-600 bg-orange-100/80 px-2 py-0.5 rounded-md uppercase">
                          {userRole === "teacher" || userRole === "admin" ? "ครูผู้สอน / แอดมิน" : "นักเรียน"}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-gray-900 truncate mt-0.5">{userName}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-200/60">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        setIsProfileModalOpen(true);
                      }}
                      className="flex items-center justify-center gap-1.5 min-h-[44px] px-3 py-2 bg-white rounded-lg border border-gray-200 text-xs font-bold text-gray-700 active:scale-95 transition-all shadow-2xs cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-orange-600" />
                      <span>ตั้งค่าโปรไฟล์</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center justify-center gap-1.5 min-h-[44px] px-3 py-2 bg-white rounded-lg border border-red-200 text-xs font-bold text-red-600 active:scale-95 transition-all shadow-2xs cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>ออกจากระบบ</span>
                    </button>
                  </div>

                  {(userRole === "teacher" || userRole === "admin") && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMoreMenuOpen(false)}
                      className="w-full flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg font-bold text-xs shadow-xs active:scale-98 transition-all cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>เข้าสู่ระบบหลังบ้าน (Admin System)</span>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-left w-full sm:w-auto">
                    <p className="text-xs font-bold text-gray-800">เข้าสู่ระบบเพื่อส่งงานและบันทึกคะแนน</p>
                    <p className="text-[11px] text-gray-500">สำหรับนักเรียนและคุณครูโรงเรียนวชิรธรรมสาธิต</p>
                  </div>
                  <Link
                    href="/login"
                    onClick={() => setIsMoreMenuOpen(false)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs shadow-md shadow-red-500/20 active:scale-95 transition-all cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>เข้าสู่ระบบ (Login)</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Featured Red AI Art Model Button Card (สี่เหลี่ยม มนๆ) */}
            <Link
              href="https://wtscreativeaiart.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMoreMenuOpen(false)}
              className="flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-[#ff0f39] via-[#e6002e] to-[#ff2a51] text-white shadow-sm active:scale-98 transition-all cursor-pointer min-h-[52px]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-black text-xs sm:text-sm tracking-wide truncate">WTS CREATIVE AI ART MODEL</p>
                  <p className="text-[10px] text-white/80 leading-tight">โมเดลปัญญาประดิษฐ์สร้างภาพศิลปะ</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-white/80 shrink-0 ml-2" />
            </Link>

            {/* Main Navigation List (เฉพาะเมนูเพิ่มเติมที่ไม่ซ้ำกับแถบล่าง) */}
            <div className="space-y-2">

              {/* 1. ผลงานนักเรียน (Accordion with Submenus - สี่เหลี่ยม มนๆ) */}
              <div className="border border-gray-100 rounded-xl overflow-hidden bg-gray-50/60">
                <button
                  type="button"
                  onClick={() => toggleSection("artworks")}
                  className={`w-full flex items-center justify-between p-3 text-left transition-colors min-h-[48px] cursor-pointer ${
                    pathname.startsWith("/artworks") || pathname.startsWith("/awards") ? "text-red-600 font-bold bg-red-50/50" : "text-gray-800 font-semibold"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                      <Palette className="w-4 h-4" />
                    </div>
                    <span className="text-sm">ผลงานนักเรียน</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expandedSections.artworks ? "rotate-180 text-red-600" : ""}`} />
                </button>
                {expandedSections.artworks && (
                  <div className="px-3 pb-3 pt-1 space-y-1.5 bg-white/70 border-t border-gray-100">
                    <Link
                      href="/awards"
                      onClick={() => setIsMoreMenuOpen(false)}
                      className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors min-h-[44px] ${
                        pathname.startsWith("/awards") ? "bg-amber-50 text-amber-900 font-bold" : "hover:bg-amber-50/60 text-gray-700 font-semibold"
                      }`}
                    >
                      <div className="w-7 h-7 rounded-md bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                        <Trophy className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs leading-tight">รางวัลที่ได้รับ</p>
                        <p className="text-[10px] text-gray-400 leading-tight">ผลงานการประกวดและการแข่งขัน</p>
                      </div>
                    </Link>

                    <Link
                      href="/artworks"
                      onClick={() => setIsMoreMenuOpen(false)}
                      className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors min-h-[44px] ${
                        pathname.startsWith("/artworks") ? "bg-rose-50 text-rose-900 font-bold" : "hover:bg-rose-50/60 text-gray-700 font-semibold"
                      }`}
                    >
                      <div className="w-7 h-7 rounded-md bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                        <Palette className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs leading-tight">ผลงานนักเรียน</p>
                        <p className="text-[10px] text-gray-400 leading-tight">แกลเลอรีผลงานศิลปะสร้างสรรค์</p>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              {/* 6. คลังสื่อองค์กร (Accordion with External Links - สี่เหลี่ยม มนๆ) */}
              <div className="border border-gray-100 rounded-xl overflow-hidden bg-gray-50/60">
                <button
                  type="button"
                  onClick={() => toggleSection("media")}
                  className="w-full flex items-center justify-between p-3 text-left transition-colors min-h-[48px] cursor-pointer text-gray-800 font-semibold"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <span className="text-sm">คลังสื่อองค์กร</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expandedSections.media ? "rotate-180 text-red-600" : ""}`} />
                </button>
                {expandedSections.media && (
                  <div className="px-3 pb-3 pt-1 space-y-1.5 bg-white/70 border-t border-gray-100">
                    <Link
                      href="https://media-center.moe.go.th/Home"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsMoreMenuOpen(false)}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-blue-50/60 text-gray-700 font-semibold transition-colors min-h-[44px]"
                    >
                      <div className="w-7 h-7 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <Building2 className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs leading-tight">ศูนย์รวมการเรียนรู้ (ศธ.)</p>
                        <p className="text-[10px] text-gray-400 leading-tight">กระทรวงศึกษาธิการ</p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    </Link>

                    <Link
                      href="https://elibrary-bacc.hibrary.me/"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsMoreMenuOpen(false)}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-purple-50/60 text-gray-700 font-semibold transition-colors min-h-[44px]"
                    >
                      <div className="w-7 h-7 rounded-md bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                        <Landmark className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs leading-tight">ห้องสมุด หอศิลปวัฒนธรรมฯ</p>
                        <p className="text-[10px] text-gray-400 leading-tight">e-Library BACC กรุงเทพฯ</p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    </Link>
                  </div>
                )}
              </div>

              {/* 7. เกี่ยวกับเรา (Accordion: ข่าวสาร, กิจกรรม, ครู, ติดต่อ - สี่เหลี่ยม มนๆ) */}
              <div className="border border-gray-100 rounded-xl overflow-hidden bg-gray-50/60">
                <button
                  type="button"
                  onClick={() => toggleSection("about")}
                  className={`w-full flex items-center justify-between p-3 text-left transition-colors min-h-[48px] cursor-pointer ${
                    pathname.startsWith("/news") || pathname.startsWith("/activities") || pathname.startsWith("/teachers") || pathname === "/contact"
                      ? "text-red-600 font-bold bg-red-50/50"
                      : "text-gray-800 font-semibold"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                    <span className="text-sm">เกี่ยวกับเรา & ข้อมูล</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expandedSections.about ? "rotate-180 text-red-600" : ""}`} />
                </button>
                {expandedSections.about && (
                  <div className="px-3 pb-3 pt-1 space-y-1.5 bg-white/70 border-t border-gray-100">
                    <Link
                      href="/news"
                      onClick={() => setIsMoreMenuOpen(false)}
                      className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors min-h-[44px] ${
                        pathname.startsWith("/news") ? "bg-orange-50 text-orange-900 font-bold" : "hover:bg-orange-50/60 text-gray-700 font-semibold"
                      }`}
                    >
                      <div className="w-7 h-7 rounded-md bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                        <Newspaper className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs leading-tight">ข่าวสารและประกาศ</p>
                        <p className="text-[10px] text-gray-400 leading-tight">อัปเดตข่าวประชาสัมพันธ์</p>
                      </div>
                    </Link>

                    <Link
                      href="/activities"
                      onClick={() => setIsMoreMenuOpen(false)}
                      className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors min-h-[44px] ${
                        pathname.startsWith("/activities") ? "bg-pink-50 text-pink-900 font-bold" : "hover:bg-pink-50/60 text-gray-700 font-semibold"
                      }`}
                    >
                      <div className="w-7 h-7 rounded-md bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                        <CalendarDays className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs leading-tight">กิจกรรมต่างๆ</p>
                        <p className="text-[10px] text-gray-400 leading-tight">ภาพกิจกรรมศิลปะ</p>
                      </div>
                    </Link>

                    {isTeachersEnabled && (
                      <Link
                        href="/teachers"
                        onClick={() => setIsMoreMenuOpen(false)}
                        className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors min-h-[44px] ${
                          pathname.startsWith("/teachers") ? "bg-indigo-50 text-indigo-900 font-bold" : "hover:bg-indigo-50/60 text-gray-700 font-semibold"
                        }`}
                      >
                        <div className="w-7 h-7 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                          <GraduationCap className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs leading-tight">Teacher Profile & Awards</p>
                          <p className="text-[10px] text-gray-400 leading-tight">ประวัติและรางวัลครูผู้สอน</p>
                        </div>
                      </Link>
                    )}

                    <Link
                      href="/contact"
                      onClick={() => setIsMoreMenuOpen(false)}
                      className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors min-h-[44px] ${
                        pathname === "/contact" ? "bg-emerald-50 text-emerald-900 font-bold" : "hover:bg-emerald-50/60 text-gray-700 font-semibold"
                      }`}
                    >
                      <div className="w-7 h-7 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <PhoneCall className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs leading-tight">ติดต่อเรา</p>
                        <p className="text-[10px] text-gray-400 leading-tight">กลุ่มสาระฯ ศิลปะ ว.ธ.</p>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

            </div>

            {/* Extra Bottom Close Button (สี่เหลี่ยม มนๆ) */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsMoreMenuOpen(false)}
                className="w-full min-h-[48px] bg-gray-100 hover:bg-gray-200 active:scale-98 text-gray-700 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <X className="w-4 h-4" />
                <span>ปิดหน้าต่างเมนู</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Global Profile Settings Modal */}
      <ProfileSettingsModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
}

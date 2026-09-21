"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, LogOut, Calendar, Clock, Settings, User, Newspaper, CalendarDays, GraduationCap, PhoneCall, Trophy, Palette, Building2, Landmark } from "lucide-react";
import ProfileSettingsModal from "@/components/modals/ProfileSettingsModal";
import { resolveUserAvatar } from "@/lib/art-avatars";
import { performGlobalLogout, syncAuthWithServer } from "@/lib/client-auth";

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isArtworksOpen, setIsArtworksOpen] = useState(false);
  const [isOrgMediaOpen, setIsOrgMediaOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isTeachersEnabled, setIsTeachersEnabled] = useState(true);

  const updateUserData = () => {
    const name = localStorage.getItem("artroom_author_name");
    const role = localStorage.getItem("artroom_role");
    const avatar = localStorage.getItem("artroom_avatar");
    setUserName(name);
    setUserRole(role);
    setUserAvatar(avatar);
  };

  useEffect(() => {
    updateUserData();

    // Verify and sync with server session token
    syncAuthWithServer().then(() => {
      updateUserData();
    });

    // Listen for profile changes from ProfileSettingsModal or other tabs
    window.addEventListener("artroom_profile_updated", updateUserData);

    // Check if teachers directory is enabled by admin
    fetch('/api/teachers/status')
      .then(res => res.json())
      .then((data: any) => {
        if (data && typeof data.enabled === 'boolean') {
          setIsTeachersEnabled(data.enabled);
        }
      })
      .catch(() => {});

    return () => {
      window.removeEventListener("artroom_profile_updated", updateUserData);
    };
  }, []);

  // Close mobile drawer when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await performGlobalLogout("/");
  };

  const resolvedAvatar = resolveUserAvatar(userAvatar, userName);

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-white border-b border-gray-200 shadow-sm transition-all duration-300 pointer-events-auto">
      {/* Integrated LiveClock Bar — hidden on mobile <640px, shown sm+ */}
      <div className="navbar-clock-bar w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white h-8 overflow-hidden hidden sm:flex items-center">
        <div className="container mx-auto px-4 h-full flex items-center justify-center sm:justify-end gap-3 text-[10px] sm:text-xs font-medium">
          <NavbarLiveClock />
        </div>
      </div>

      {/* Main Navigation Bar (64px) */}
      <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Logo Section — compact on mobile */}
        <div className="flex items-center gap-2 sm:gap-3 h-full min-w-0 flex-shrink-0">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group min-w-0 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/school-logo.png" 
              alt="School Logo" 
              className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 object-contain group-hover:scale-105 transition-transform flex-shrink-0"
            />
            <div className="flex flex-col justify-center min-w-0">
              <span className="font-heading font-black text-[20px] sm:text-[24px] lg:text-[28px] tracking-[0.05em] leading-none truncate">
                <span className="text-[#FF0000]">ART </span>
                <span className="text-[#03071C]">ROOM</span>
              </span>
              <span className="font-sans text-[7.5px] sm:text-[8.5px] lg:text-[9.5px] text-gray-600 font-bold tracking-[0.02em] mt-0.5 text-center block w-full whitespace-nowrap hidden sm:block">
                WACHIRATHAMMASATIT SCHOOL
              </span>
            </div>
          </Link>
        </div>
        
        {/* Desktop Navigation (Visible on LG screens 1024px+) */}
        <nav className="hidden lg:flex items-center gap-3 lg:gap-4 xl:gap-6 text-[14px] lg:text-[15px] font-medium text-gray-700 h-full ml-4">
          {/* 1. หน้าแรก */}
          <Link 
            href="/" 
            className={`h-full flex items-center px-1 border-b-[3px] transition-colors whitespace-nowrap flex-shrink-0 ${pathname === "/" ? "border-red-500 text-red-500 font-bold" : "border-transparent hover:border-red-500 hover:text-red-500"}`}
          >
            หน้าแรก
          </Link>

          {/* 2. สื่อการสอน */}
          <Link 
            href="/materials" 
            className={`h-full flex items-center px-1 border-b-[3px] transition-colors whitespace-nowrap flex-shrink-0 ${pathname.startsWith("/materials") ? "border-red-500 text-red-500 font-bold" : "border-transparent hover:border-red-500 hover:text-red-500"}`}
          >
            สื่อการสอน
          </Link>

          {/* 3. ส่งงาน (NEW) */}
          <Link 
            href="/submissions" 
            className={`h-full flex items-center gap-1.5 px-1 border-b-[3px] transition-colors whitespace-nowrap flex-shrink-0 ${pathname.startsWith("/submissions") ? "border-red-500 text-red-500 font-bold" : "border-transparent hover:border-red-500 hover:text-red-500"}`}
          >
            <span>ส่งงาน</span>
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-orange-100 text-orange-700">NEW</span>
          </Link>

          {/* 4. ผลงานนักเรียน Dropdown Menu */}
          <div className="relative group h-full flex items-center flex-shrink-0">
            <Link 
              href="/artworks"
              className={`whitespace-nowrap flex items-center gap-1.5 px-1 h-full border-b-[3px] transition-colors focus:outline-none ${pathname.startsWith("/artworks") || pathname.startsWith("/awards") ? "border-red-500 text-red-500 font-bold" : "border-transparent hover:border-red-500 hover:text-red-500"}`}
            >
              ผลงานนักเรียน <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
            </Link>
            
            <div className="absolute top-full -left-4 pt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 py-2 px-1.5 flex flex-col gap-0.5">
                <Link 
                  href="/awards" 
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50/80 transition-colors group/item ${
                    pathname.startsWith("/awards") ? "bg-red-50 text-red-600 font-bold" : "text-gray-700 hover:text-red-600"
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 group-hover/item:scale-105 transition-transform">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-semibold leading-tight">รางวัลที่ได้รับ</span>
                    <span className="text-[11px] text-gray-400 font-normal leading-tight mt-0.5">ผลงานการประกวดและการแข่งขัน</span>
                  </div>
                </Link>
                <Link 
                  href="/artworks" 
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50/80 transition-colors group/item ${
                    pathname.startsWith("/artworks") ? "bg-red-50 text-red-600 font-bold" : "text-gray-700 hover:text-red-600"
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 group-hover/item:scale-105 transition-transform">
                    <Palette className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-semibold leading-tight">ผลงานนักเรียน</span>
                    <span className="text-[11px] text-gray-400 font-normal leading-tight mt-0.5">แกลเลอรีผลงานศิลปะสร้างสรรค์</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* 5. แชร์ไอเดีย */}
          <Link 
            href="/ideas" 
            className={`h-full flex items-center px-1 border-b-[3px] transition-colors whitespace-nowrap flex-shrink-0 ${pathname.startsWith("/ideas") ? "border-red-500 text-red-500 font-bold" : "border-transparent hover:border-red-500 hover:text-red-500"}`}
          >
            แชร์ไอเดีย
          </Link>

          {/* 6. คลังสื่อองค์กร Dropdown Menu */}
          <div className="relative group h-full flex items-center flex-shrink-0">
            <button 
              type="button"
              className="whitespace-nowrap flex items-center gap-1.5 px-1 h-full border-b-[3px] border-transparent hover:border-red-500 hover:text-red-500 transition-colors focus:outline-none cursor-pointer"
            >
              คลังสื่อองค์กร <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
            </button>
            
            <div className="absolute top-full -left-6 pt-2 w-72 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 py-2 px-1.5 flex flex-col gap-0.5">
                <Link 
                  href="https://media-center.moe.go.th/Home" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50/80 transition-colors group/item"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover/item:scale-105 transition-transform">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-semibold leading-tight text-gray-800 group-hover/item:text-red-600 transition-colors">ศูนย์รวมการเรียนรู้ (ศธ.)</span>
                    <span className="text-[11px] text-gray-400 font-normal leading-tight mt-0.5">กระทรวงศึกษาธิการ</span>
                  </div>
                </Link>
                <Link 
                  href="https://elibrary-bacc.hibrary.me/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50/80 transition-colors group/item"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 group-hover/item:scale-105 transition-transform">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-semibold leading-tight text-gray-800 group-hover/item:text-red-600 transition-colors">ห้องสมุด หอศิลปวัฒนธรรมฯ</span>
                    <span className="text-[11px] text-gray-400 font-normal leading-tight mt-0.5">e-Library BACC กรุงเทพมหานคร</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* 7. เกี่ยวกับเรา Dropdown Menu (รวม: ข่าวสาร, กิจกรรมต่างๆ, ทำเนียบครู, ติดต่อเรา) */}
          <div className="relative group h-full flex items-center flex-shrink-0">
            <button 
              type="button"
              className={`whitespace-nowrap flex items-center gap-1.5 px-1 h-full border-b-[3px] transition-colors focus:outline-none cursor-pointer ${
                pathname.startsWith("/news") || pathname.startsWith("/activities") || pathname.startsWith("/teachers") || pathname === "/contact"
                  ? "border-red-500 text-red-500 font-bold" 
                  : "border-transparent hover:border-red-500 hover:text-red-500 text-gray-700"
              }`}
            >
              <span>เกี่ยวกับเรา</span>
              <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
            </button>
            
            <div className="absolute top-full -left-6 pt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 py-2 px-1.5 flex flex-col gap-0.5">
                <Link 
                  href="/news" 
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50/80 transition-colors group/item ${
                    pathname.startsWith("/news") ? "bg-red-50 text-red-600 font-bold" : "text-gray-700 hover:text-red-600"
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 group-hover/item:scale-105 transition-transform">
                    <Newspaper className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-semibold leading-tight">ข่าวสารและประกาศ</span>
                    <span className="text-[11px] text-gray-400 font-normal leading-tight mt-0.5">อัปเดตข่าวประชาสัมพันธ์</span>
                  </div>
                </Link>

                <Link 
                  href="/activities" 
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50/80 transition-colors group/item ${
                    pathname.startsWith("/activities") ? "bg-red-50 text-red-600 font-bold" : "text-gray-700 hover:text-red-600"
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center shrink-0 group-hover/item:scale-105 transition-transform">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-semibold leading-tight">กิจกรรมต่างๆ</span>
                    <span className="text-[11px] text-gray-400 font-normal leading-tight mt-0.5">ปฏิทินและภาพกิจกรรมศิลปะ</span>
                  </div>
                </Link>

                {isTeachersEnabled && (
                  <Link 
                    href="/teachers" 
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50/80 transition-colors group/item ${
                      pathname.startsWith("/teachers") ? "bg-red-50 text-red-600 font-bold" : "text-gray-700 hover:text-red-600"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 group-hover/item:scale-105 transition-transform">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-semibold leading-tight">Teacher Profile & Awards</span>
                      <span className="text-[11px] text-gray-400 font-normal leading-tight mt-0.5">ประวัติและรางวัลครูผู้สอน</span>
                    </div>
                  </Link>
                )}

                <Link 
                  href="/contact" 
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50/80 transition-colors group/item ${
                    pathname === "/contact" ? "bg-red-50 text-red-600 font-bold" : "text-gray-700 hover:text-red-600"
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover/item:scale-105 transition-transform">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-semibold leading-tight">ติดต่อเรา</span>
                    <span className="text-[11px] text-gray-400 font-normal leading-tight mt-0.5">ช่องทางติดต่อกลุ่มสาระฯ ศิลปะ</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Right Section: User Profile / Login & Hamburger Button */}
        <div className="flex items-center gap-1.5 sm:gap-2 h-full flex-shrink-0 min-w-0">

          {userName ? (
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 min-w-0">
              {userRole === "teacher" || userRole === "admin" ? (
                <Link 
                  href="/admin" 
                  className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-full shadow-xs transition-colors whitespace-nowrap cursor-pointer"
                >
                  หลังบ้าน
                </Link>
              ) : null}
              {/* Clickable Profile Badge with Avatar */}
              <button 
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center gap-1.5 sm:gap-2 text-xs font-bold text-orange-700 bg-orange-50/90 hover:bg-orange-100/90 px-2 py-1 sm:pr-3 rounded-full border border-orange-200/80 shadow-2xs transition-all cursor-pointer active:scale-95 group"
                title="คลิกเพื่อตั้งค่าโปรไฟล์"
              >
                <div className="w-6 h-6 rounded-full overflow-hidden bg-white shadow-2xs border border-orange-200 flex items-center justify-center shrink-0">
                  {resolvedAvatar.type === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={resolvedAvatar.value} alt={userName || ""} className="w-full h-full object-cover" />
                  ) : resolvedAvatar.type === "preset" ? (
                    <span className="text-xs select-none">{resolvedAvatar.value}</span>
                  ) : (
                    <span className="text-[10px] font-bold text-orange-600">{resolvedAvatar.value}</span>
                  )}
                </div>
                <span className="max-w-[60px] sm:max-w-[100px] lg:max-w-[120px] truncate hidden sm:inline">{userName}</span>
                <Settings className="w-3 h-3 text-orange-400 group-hover:text-orange-600 transition-colors shrink-0" />
              </button>
              <button 
                onClick={handleLogout} 
                title="ออกจากระบบ" 
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors flex items-center justify-center cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link href="/login" className="flex items-center flex-shrink-0">
              <Button variant="default" className="whitespace-nowrap rounded-xl px-3 sm:px-4 h-9 sm:h-10 shadow-sm shadow-red-500/20 bg-[#ff0f39] hover:bg-[#e00028] text-white text-xs sm:text-sm font-medium transition-all duration-200 border-0 flex items-center gap-1.5 cursor-pointer active:scale-95">
                <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-2.5 h-2.5 text-[#ff0f39]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                เข้าสู่ระบบ
              </Button>
            </Link>
          )}

          {/* Mobile & Tablet Hamburger Button (<1024px) */}
          <button 
            className="flex lg:hidden p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 active:scale-95 rounded-xl transition-all items-center justify-center cursor-pointer flex-shrink-0"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="เมนูนำทาง"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer Overlay (<1024px) */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-[9998]" 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
      )}

      {/* Mobile Navigation Drawer (<1024px) */}
      <div 
        className={`lg:hidden fixed top-0 right-0 w-[310px] max-w-[88vw] h-screen bg-white z-[9999] transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/80">
          <span className="font-heading font-black text-xl text-gray-900 flex items-center gap-2">
            <span className="text-red-600">ART ROOM</span> เมนู
          </span>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 text-gray-500 hover:bg-gray-200/60 rounded-full transition-colors cursor-pointer"
            aria-label="ปิดเมนู"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1">
          {/* 1. หน้าแรก */}
          <Link 
            href="/" 
            className={`px-4 py-3 font-medium rounded-xl transition-colors cursor-pointer ${pathname === "/" ? "bg-red-50 text-red-600 font-bold" : "text-gray-700 hover:bg-gray-50"}`} 
            onClick={() => setIsMobileMenuOpen(false)}
          >
            หน้าแรก
          </Link>

          {/* 2. สื่อการสอน */}
          <Link 
            href="/materials" 
            className={`px-4 py-3 font-medium rounded-xl transition-colors cursor-pointer ${pathname.startsWith("/materials") ? "bg-red-50 text-red-600 font-bold" : "text-gray-700 hover:bg-gray-50"}`} 
            onClick={() => setIsMobileMenuOpen(false)}
          >
            สื่อการสอน
          </Link>

          {/* 3. ส่งงานนักเรียน */}
          <Link 
            href="/submissions" 
            className={`px-4 py-3 font-medium rounded-xl transition-colors cursor-pointer flex items-center justify-between ${pathname.startsWith("/submissions") ? "bg-red-50 text-red-600 font-bold" : "text-gray-700 hover:bg-gray-50"}`} 
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span>ส่งงานนักเรียน</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700">NEW</span>
          </Link>
          
          {/* 4. ผลงานนักเรียน Mobile Dropdown */}
          <div className="flex flex-col">
            <button 
              type="button"
              onClick={() => setIsArtworksOpen(!isArtworksOpen)}
              className="px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 rounded-xl flex items-center justify-between text-left cursor-pointer"
            >
              <span>ผลงานนักเรียน</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isArtworksOpen ? "rotate-180 text-red-600" : ""}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isArtworksOpen ? "max-h-32 opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
              <div className="ml-4 flex flex-col border-l-2 border-red-200 pl-2 space-y-1">
                <Link 
                  href="/awards" 
                  className={`px-3 py-2 flex items-center gap-2.5 font-medium text-sm rounded-lg cursor-pointer ${
                    pathname.startsWith("/awards") ? "text-red-600 font-bold bg-red-50/80" : "text-gray-600 hover:text-red-600 hover:bg-red-50/50"
                  }`} 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>รางวัลที่ได้รับ</span>
                </Link>
                <Link 
                  href="/artworks" 
                  className={`px-3 py-2 flex items-center gap-2.5 font-medium text-sm rounded-lg cursor-pointer ${
                    pathname.startsWith("/artworks") ? "text-red-600 font-bold bg-red-50/80" : "text-gray-600 hover:text-red-600 hover:bg-red-50/50"
                  }`} 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Palette className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>ผลงานนักเรียน</span>
                </Link>
              </div>
            </div>
          </div>

          {/* 5. แชร์ไอเดีย */}
          <Link 
            href="/ideas" 
            className={`px-4 py-3 font-medium rounded-xl transition-colors cursor-pointer ${pathname.startsWith("/ideas") ? "bg-red-50 text-red-600 font-bold" : "text-gray-700 hover:bg-gray-50"}`} 
            onClick={() => setIsMobileMenuOpen(false)}
          >
            แชร์ไอเดีย
          </Link>

          {/* 6. คลังสื่อองค์กร Mobile Dropdown */}
          <div className="flex flex-col">
            <button 
              type="button"
              onClick={() => setIsOrgMediaOpen(!isOrgMediaOpen)}
              className="px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 rounded-xl flex items-center justify-between text-left cursor-pointer"
            >
              <span>คลังสื่อองค์กร</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isOrgMediaOpen ? "rotate-180 text-red-600" : ""}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isOrgMediaOpen ? "max-h-36 opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
              <div className="ml-4 flex flex-col border-l-2 border-red-200 pl-2 space-y-1">
                <Link 
                  href="https://media-center.moe.go.th/Home" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="px-3 py-2 flex items-center gap-2.5 font-medium text-sm text-gray-600 hover:text-red-600 hover:bg-red-50/50 rounded-lg cursor-pointer" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Building2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>ศูนย์รวมการเรียนรู้ (ศธ.)</span>
                </Link>
                <Link 
                  href="https://elibrary-bacc.hibrary.me/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="px-3 py-2 flex items-center gap-2.5 font-medium text-sm text-gray-600 hover:text-red-600 hover:bg-red-50/50 rounded-lg cursor-pointer" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Landmark className="w-4 h-4 text-purple-500 shrink-0" />
                  <span>ห้องสมุด (BACC)</span>
                </Link>
              </div>
            </div>
          </div>

          {/* 7. เกี่ยวกับเรา Mobile Accordion */}
          <div className="flex flex-col">
            <button 
              type="button"
              onClick={() => setIsAboutOpen(!isAboutOpen)}
              className={`px-4 py-3 font-medium hover:bg-gray-50 rounded-xl flex items-center justify-between text-left cursor-pointer ${
                pathname.startsWith("/news") || pathname.startsWith("/activities") || pathname.startsWith("/teachers") || pathname === "/contact"
                  ? "text-red-600 font-bold bg-red-50/50"
                  : "text-gray-700"
              }`}
            >
              <span>เกี่ยวกับเรา</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isAboutOpen ? "rotate-180 text-red-600" : ""}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isAboutOpen ? "max-h-64 opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
              <div className="ml-4 flex flex-col border-l-2 border-red-200 pl-2 space-y-1">
                <Link 
                  href="/news" 
                  className={`px-3 py-2 flex items-center gap-2.5 font-medium text-sm rounded-lg cursor-pointer ${
                    pathname.startsWith("/news") ? "text-red-600 font-bold bg-red-50/80" : "text-gray-600 hover:text-red-600 hover:bg-red-50/50"
                  }`} 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Newspaper className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>ข่าวสารและประกาศ</span>
                </Link>
                <Link 
                  href="/activities" 
                  className={`px-3 py-2 flex items-center gap-2.5 font-medium text-sm rounded-lg cursor-pointer ${
                    pathname.startsWith("/activities") ? "text-red-600 font-bold bg-red-50/80" : "text-gray-600 hover:text-red-600 hover:bg-red-50/50"
                  }`} 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <CalendarDays className="w-4 h-4 text-pink-500 shrink-0" />
                  <span>กิจกรรมต่างๆ</span>
                </Link>
                {isTeachersEnabled && (
                  <Link 
                    href="/teachers" 
                    className={`px-3 py-2 flex items-center gap-2.5 font-medium text-sm rounded-lg cursor-pointer ${
                      pathname === "/teachers" ? "text-red-600 font-bold bg-red-50/80" : "text-gray-600 hover:text-red-600 hover:bg-red-50/50"
                    }`} 
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <GraduationCap className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>Teacher Profile & Awards</span>
                  </Link>
                )}
                <Link 
                  href="/contact" 
                  className={`px-3 py-2 flex items-center gap-2.5 font-medium text-sm rounded-lg cursor-pointer ${
                    pathname === "/contact" ? "text-red-600 font-bold bg-red-50/80" : "text-gray-600 hover:text-red-600 hover:bg-red-50/50"
                  }`} 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <PhoneCall className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>ติดต่อเรา</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Bottom Action */}
        <div className="p-4 border-t border-gray-100 safe-pb bg-gray-50/50">
          {userName ? (
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsProfileModalOpen(true);
                }}
                className="px-3.5 py-2.5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl text-orange-800 font-bold border border-orange-200 text-sm flex items-center gap-3 transition-colors cursor-pointer hover:bg-orange-100/60 shadow-2xs active:scale-98"
              >
                <div className="w-9 h-9 rounded-full overflow-hidden bg-white shadow-xs border border-orange-200 flex items-center justify-center shrink-0">
                  {resolvedAvatar.type === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={resolvedAvatar.value} alt={userName} className="w-full h-full object-cover" />
                  ) : resolvedAvatar.type === "preset" ? (
                    <span className="text-lg select-none">{resolvedAvatar.value}</span>
                  ) : (
                    <span className="text-xs font-bold text-orange-600">{resolvedAvatar.value}</span>
                  )}
                </div>
                <div className="flex-1 text-left truncate">
                  <div className="text-[11px] text-orange-500 font-normal">
                    โปรไฟล์ ({userRole === "student" ? "นักเรียน WTS" : "ผู้ปกครอง/ทั่วไป"})
                  </div>
                  <div className="font-bold truncate text-gray-900">{userName}</div>
                </div>
                <span className="text-xs text-orange-600 font-medium px-2.5 py-1 bg-white rounded-full shadow-2xs border border-orange-200 flex items-center gap-1">
                  <Settings className="w-3 h-3" /> ตั้งค่า
                </span>
              </button>

              {(userRole === "teacher" || userRole === "admin") && (
                <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full rounded-xl h-[44px] border-red-500 text-red-600 hover:bg-red-50 font-bold transition-colors cursor-pointer">
                    เข้าระบบหลังบ้าน (Admin)
                  </Button>
                </Link>
              )}
              <button 
                onClick={handleLogout} 
                className="w-full rounded-xl h-[44px] border border-gray-200 text-red-600 hover:bg-red-50 font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <LogOut className="w-4 h-4" /> ออกจากระบบ
              </button>
            </div>
          ) : (
            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="default" className="w-full rounded-xl h-[46px] shadow-sm bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer text-base active:scale-95">
                เข้าสู่ระบบ
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Global Profile Settings Modal */}
      <ProfileSettingsModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
    </header>
  );
}

// Isolated Live Clock Component to prevent Navbar re-rendering every second
function NavbarLiveClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) return null;

  const formatThaiDate = (date: Date) => {
    return new Intl.DateTimeFormat("th-TH", {
      timeZone: "Asia/Bangkok",
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const formatThaiTime = (date: Date) => {
    return new Intl.DateTimeFormat("th-TH", {
      timeZone: "Asia/Bangkok",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(date);
  };

  let formattedDate = formatThaiDate(time);
  if (formattedDate && !formattedDate.includes("พ.ศ.")) {
    const parts = formattedDate.split(" ");
    if (parts.length > 0) {
      const year = parts.pop();
      formattedDate = `${parts.join(" ")} พ.ศ. ${year}`;
    }
  }

  return (
    <>
      <div className="flex items-center gap-1.5">
        <Calendar className="w-3.5 h-3.5 text-white/90" />
        <span>{formattedDate}</span>
      </div>
      <div className="w-px h-3 bg-white/30"></div>
      <div className="flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-white/90" />
        <span className="font-bold tracking-wider">{formatThaiTime(time)} น.</span>
      </div>
    </>
  );
}


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

  const handleLogout = async () => {
    await performGlobalLogout("/");
  };

  const resolvedAvatar = resolveUserAvatar(userAvatar, userName);

  return (
    <header className="sticky top-0 left-0 right-0 w-full z-50 bg-[#FDF7F0] md:bg-white/95 md:backdrop-blur-md md:border-b md:border-gray-100 transition-all duration-300 pointer-events-auto">
      {/* Integrated LiveClock Bar — hidden on mobile <640px, shown sm+ */}
      <div className="navbar-clock-bar w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white h-8 overflow-hidden hidden sm:flex items-center">
        <div className="container mx-auto px-4 h-full flex items-center justify-center sm:justify-end gap-3 text-[10px] sm:text-xs font-medium">
          <NavbarLiveClock />
        </div>
      </div>

      {/* Main Navigation Bar (64px) */}
      <div className="max-w-[1700px] w-full mx-auto px-3 sm:px-4 lg:px-5 xl:px-8 h-16 flex items-center justify-between">
        
        {/* Logo Section — matching mockup */}
        <div className="flex items-center gap-2 sm:gap-2.5 xl:gap-3 h-full min-w-0 flex-shrink-0">
          <Link href="/" className="flex items-center gap-2.5 sm:gap-2.5 xl:gap-3 group min-w-0 flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-[#ff6b00] flex items-center justify-center text-white font-bold text-[10px] shrink-0">
              ART
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <span className="font-heading font-bold text-[16px] md:text-[20px] xl:text-[24px] tracking-tight leading-none text-gray-900">
                ART ROOM
              </span>
              <span className="hidden md:block text-[10px] text-gray-500 font-normal leading-tight mt-0.5 whitespace-nowrap">
                โรงเรียนวชิรธรรมสาธิต
              </span>
            </div>
          </Link>
        </div>
        
        {/* Desktop & iPad Navigation (Visible on screens 1024px+) */}
        <nav className="hidden lg:flex items-center gap-1.5 lg:gap-2 xl:gap-5 text-[12.5px] lg:text-[13px] xl:text-[14.5px] font-medium text-gray-700 h-full ml-1 lg:ml-2 xl:ml-4">
          {/* 1. หน้าแรก */}
          <Link 
            href="/" 
            className={`h-full flex items-center px-1 lg:px-1.5 xl:px-2 border-b-[3px] transition-colors whitespace-nowrap flex-shrink-0 ${pathname === "/" ? "border-red-500 text-red-500 font-bold" : "border-transparent hover:border-red-500 hover:text-red-500"}`}
          >
            หน้าแรก
          </Link>

          {/* 2. สื่อการสอน */}
          <Link 
            href="/materials" 
            className={`h-full flex items-center px-1 lg:px-1.5 xl:px-2 border-b-[3px] transition-colors whitespace-nowrap flex-shrink-0 ${pathname.startsWith("/materials") ? "border-red-500 text-red-500 font-bold" : "border-transparent hover:border-red-500 hover:text-red-500"}`}
          >
            สื่อการสอน
          </Link>

          {/* 3. ส่งงาน (NEW) */}
          <Link 
            href="/submissions" 
            className={`h-full flex items-center gap-1 px-1 lg:px-1.5 xl:px-2 border-b-[3px] transition-colors whitespace-nowrap flex-shrink-0 ${pathname.startsWith("/submissions") ? "border-red-500 text-red-500 font-bold" : "border-transparent hover:border-red-500 hover:text-red-500"}`}
          >
            <span>ส่งงาน</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-orange-100 text-orange-700">NEW</span>
          </Link>

          {/* 4. ผลงานนักเรียน Dropdown Menu */}
          <div className="relative group h-full flex items-center flex-shrink-0">
            <Link 
              href="/artworks"
              className={`whitespace-nowrap flex items-center gap-1 px-1 lg:px-1.5 xl:px-2 h-full border-b-[3px] transition-colors focus:outline-none ${pathname.startsWith("/artworks") || pathname.startsWith("/awards") ? "border-red-500 text-red-500 font-bold" : "border-transparent hover:border-red-500 hover:text-red-500"}`}
            >
              ผลงานนักเรียน <ChevronDown className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-180" />
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
            className={`h-full flex items-center px-1 lg:px-1.5 xl:px-2 border-b-[3px] transition-colors whitespace-nowrap flex-shrink-0 ${pathname.startsWith("/ideas") ? "border-red-500 text-red-500 font-bold" : "border-transparent hover:border-red-500 hover:text-red-500"}`}
          >
            แชร์ไอเดีย
          </Link>

          {/* 6. คลังสื่อองค์กร Dropdown Menu */}
          <div className="relative group h-full flex items-center flex-shrink-0">
            <button 
              type="button"
              className="whitespace-nowrap flex items-center gap-1 px-1 lg:px-1.5 xl:px-2 h-full border-b-[3px] border-transparent hover:border-red-500 hover:text-red-500 transition-colors focus:outline-none cursor-pointer"
            >
              คลังสื่อองค์กร <ChevronDown className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-180" />
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
              className={`whitespace-nowrap flex items-center gap-1 px-1 lg:px-1.5 xl:px-2 h-full border-b-[3px] transition-colors focus:outline-none cursor-pointer ${
                pathname.startsWith("/news") || pathname.startsWith("/activities") || pathname.startsWith("/teachers") || pathname === "/contact"
                  ? "border-red-500 text-red-500 font-bold" 
                  : "border-transparent hover:border-red-500 hover:text-red-500 text-gray-700"
              }`}
            >
              <span>เกี่ยวกับเรา</span>
              <ChevronDown className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-180" />
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
        <div className="flex items-center gap-1 sm:gap-2 h-full flex-shrink-0 min-w-0">

          {userName ? (
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 min-w-0">
              {userRole === "teacher" || userRole === "admin" ? (
                <Link 
                  href="/admin" 
                  className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-2.5 lg:px-3 py-1.5 rounded-full shadow-xs transition-colors whitespace-nowrap cursor-pointer"
                >
                  หลังบ้าน
                </Link>
              ) : null}
              {/* Clickable Profile Badge with Avatar */}
              <button 
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-[#ff6b00] bg-white cursor-pointer active:scale-95 overflow-hidden shadow-sm hover:scale-105 transition-transform"
                title="คลิกเพื่อตั้งค่าโปรไฟล์"
              >
                {resolvedAvatar.type === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={resolvedAvatar.value} alt={userName ?? ""} className="w-full h-full object-cover" />
                ) : resolvedAvatar.type === "preset" ? (
                  <span className="text-base select-none leading-none">{resolvedAvatar.value}</span>
                ) : (
                  <span className="text-xs font-bold text-[#ff6b00]">{resolvedAvatar.value}</span>
                )}
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
              <span className="whitespace-nowrap rounded-full px-3.5 py-1.5 border border-[#5b4be2] text-[#5b4be2] hover:bg-[#5b4be2]/5 text-xs font-semibold transition-all duration-200 cursor-pointer active:scale-95 shrink-0 font-kanit">
                เข้าสู่ระบบ
              </span>
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


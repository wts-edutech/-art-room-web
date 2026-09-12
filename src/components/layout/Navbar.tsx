"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, LogOut, Calendar, Clock } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMaterialsOpen, setIsMaterialsOpen] = useState(false);
  const [isActivitiesOpen, setIsActivitiesOpen] = useState(false);
  const [isArtworksOpen, setIsArtworksOpen] = useState(false);
  const [isOrgMediaOpen, setIsOrgMediaOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    const name = localStorage.getItem("artroom_author_name");
    const role = localStorage.getItem("artroom_role");
    if (name) setUserName(name);
    if (role) setUserRole(role);

    return () => clearInterval(interval);
  }, []);

  // Close mobile drawer when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // proceed with client-side cleanup
    }
    localStorage.removeItem("artroom_author_name");
    localStorage.removeItem("artroom_author_email");
    localStorage.removeItem("artroom_role");
    setUserName(null);
    window.location.reload();
  };

  // Format date and time in Thai with Buddhist Era (Asia/Bangkok timezone)
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

  let formattedDate = time ? formatThaiDate(time) : "";
  if (formattedDate && !formattedDate.includes("พ.ศ.")) {
    const parts = formattedDate.split(" ");
    if (parts.length > 0) {
      const year = parts.pop();
      formattedDate = `${parts.join(" ")} พ.ศ. ${year}`;
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-white border-b border-gray-200 shadow-sm transition-all duration-300 pointer-events-auto">
      {/* Integrated LiveClock Bar (Always 32px at very top, strictly unified with Navbar) */}
      <div className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white h-8 overflow-hidden flex items-center">
        <div className="container mx-auto px-4 h-full flex items-center justify-center sm:justify-end gap-3 text-[10px] sm:text-xs font-medium">
          {time && (
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
          )}
        </div>
      </div>

      {/* Main Navigation Bar (64px) */}
      <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Logo Section */}
        <div className="flex items-center gap-3 h-full flex-shrink-0">
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/school-logo.png" 
              alt="School Logo" 
              className="w-12 h-12 sm:w-14 sm:h-14 object-contain group-hover:scale-105 transition-transform flex-shrink-0"
            />
            <div className="flex flex-col justify-center flex-shrink-0">
              <span className="font-heading font-black text-[24px] sm:text-[28px] tracking-[0.05em] leading-none whitespace-nowrap">
                <span className="text-[#FF0000]">ART </span>
                <span className="text-[#03071C]">ROOM</span>
              </span>
              <span className="font-sans text-[8.5px] sm:text-[9.5px] text-gray-600 font-bold tracking-[0.02em] mt-0.5 text-center block w-full whitespace-nowrap">
                WACHIRATHAMMASATIT SCHOOL
              </span>
            </div>
          </Link>
        </div>
        
        {/* Desktop Navigation (Visible on XL screens 1280px+) */}
        <nav className="hidden xl:flex items-center gap-5 lg:gap-6 text-[15px] font-medium text-gray-700 h-full ml-4">
          <Link 
            href="/" 
            className={`h-full flex items-center px-1 border-b-[3px] transition-colors whitespace-nowrap flex-shrink-0 ${pathname === "/" ? "border-red-500 text-red-500" : "border-transparent hover:border-red-500 hover:text-red-500"}`}
          >
            หน้าแรก
          </Link>

          {/* Materials Dropdown Menu */}
          <div className="relative group h-full flex items-center flex-shrink-0">
            <Link 
              href="/materials"
              className={`whitespace-nowrap flex items-center gap-1.5 px-1 h-full border-b-[3px] transition-colors focus:outline-none ${pathname.startsWith("/materials") ? "border-red-500 text-red-500" : "border-transparent hover:border-red-500 hover:text-red-500"}`}
            >
              สื่อการสอน <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
            </Link>
            
            <div className="absolute top-full -left-4 pt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 py-2 flex flex-col">
                <Link 
                  href="/materials" 
                  className="px-4 py-2 hover:bg-gray-50 text-gray-700 hover:text-red-600 transition-colors whitespace-nowrap font-medium"
                >
                  คลังสื่อการสอน (ม.1 - ม.6)
                </Link>
                <Link 
                  href="/downloads" 
                  className="px-4 py-2 hover:bg-gray-50 text-gray-700 hover:text-emerald-600 transition-colors whitespace-nowrap font-medium flex items-center justify-between"
                >
                  <span>ศูนย์ดาวน์โหลดใบงาน</span>
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.5 rounded font-bold">PDF</span>
                </Link>
                <Link 
                  href="/materials/m3" 
                  className="px-4 py-2 hover:bg-gray-50 text-gray-700 hover:text-red-600 transition-colors whitespace-nowrap text-xs"
                >
                  สื่อการสอน (ม.3)
                </Link>
                <Link 
                  href="/materials/m4" 
                  className="px-4 py-2 hover:bg-gray-50 text-gray-700 hover:text-red-600 transition-colors whitespace-nowrap text-xs"
                >
                  สื่อการสอน (ม.4)
                </Link>
              </div>
            </div>
          </div>

          <Link 
            href="/news" 
            className={`h-full flex items-center px-1 border-b-[3px] transition-colors whitespace-nowrap flex-shrink-0 ${pathname.startsWith("/news") ? "border-red-500 text-red-500" : "border-transparent hover:border-red-500 hover:text-red-500"}`}
          >
            ข่าวสาร
          </Link>

          <Link 
            href="/ideas" 
            className={`h-full flex items-center px-1 border-b-[3px] transition-colors whitespace-nowrap flex-shrink-0 ${pathname.startsWith("/ideas") ? "border-red-500 text-red-500" : "border-transparent hover:border-red-500 hover:text-red-500"}`}
          >
            แชร์ไอเดีย
          </Link>

          {/* Artworks Dropdown Menu */}
          <div className="relative group h-full flex items-center flex-shrink-0">
            <Link 
              href="/artworks"
              className={`whitespace-nowrap flex items-center gap-1.5 px-1 h-full border-b-[3px] transition-colors focus:outline-none ${pathname.startsWith("/artworks") || pathname.startsWith("/awards") ? "border-red-500 text-red-500" : "border-transparent hover:border-red-500 hover:text-red-500"}`}
            >
              ผลงานนักเรียน <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
            </Link>
            
            <div className="absolute top-full -left-4 pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 py-2 flex flex-col">
                <Link 
                  href="/awards" 
                  className="px-4 py-2 hover:bg-gray-50 text-gray-700 hover:text-red-600 transition-colors whitespace-nowrap"
                >
                  รางวัลที่ได้รับ
                </Link>
                <Link 
                  href="/artworks" 
                  className="px-4 py-2 hover:bg-gray-50 text-gray-700 hover:text-red-600 transition-colors whitespace-nowrap"
                >
                  ผลงานนักเรียน
                </Link>
              </div>
            </div>
          </div>
          
          {/* Activities Dropdown Menu */}
          <div className="relative group h-full flex items-center flex-shrink-0">
            <Link 
              href="/activities"
              className={`whitespace-nowrap flex items-center gap-1.5 px-1 h-full border-b-[3px] transition-colors focus:outline-none ${pathname.startsWith("/activities") ? "border-red-500 text-red-500" : "border-transparent hover:border-red-500 hover:text-red-500"}`}
            >
              กิจกรรมต่างๆ <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
            </Link>
            
            <div className="absolute top-full -left-4 pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 py-2 flex flex-col">
                <Link 
                  href="/activities" 
                  className="px-4 py-2 hover:bg-gray-50 text-gray-700 hover:text-red-600 transition-colors whitespace-nowrap"
                >
                  ปฏิทินกิจกรรม
                </Link>
              </div>
            </div>
          </div>

          {/* ทำเนียบครู (ซ่อนไว้ก่อนตามคำสั่ง: จัดการในระบบหลังบ้าน ยังไม่เปิดแสดงในระบบหน้าบ้าน)
          <Link 
            href="/teachers" 
            className={`h-full flex items-center px-1 border-b-[3px] transition-colors whitespace-nowrap flex-shrink-0 ${pathname === "/teachers" ? "border-red-500 text-red-500" : "border-transparent hover:border-red-500 hover:text-red-500"}`}
          >
            ทำเนียบครู
          </Link>
          */}

          {/* Organization Media Dropdown Menu */}
          <div className="relative group h-full flex items-center flex-shrink-0">
            <button 
              className="whitespace-nowrap flex items-center gap-1.5 px-1 h-full border-b-[3px] border-transparent hover:border-red-500 hover:text-red-500 transition-colors focus:outline-none cursor-pointer"
            >
              คลังสื่อองค์กร <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
            </button>
            
            <div className="absolute top-full -left-4 pt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 py-2 flex flex-col">
                <Link 
                  href="https://media-center.moe.go.th/Home" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 hover:bg-gray-50 text-gray-700 hover:text-red-600 transition-colors text-sm"
                >
                  ศูนย์รวมการเรียนรู้ (กระทรวงศึกษาธิการ)
                </Link>
                <Link 
                  href="https://elibrary-bacc.hibrary.me/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 hover:bg-gray-50 text-gray-700 hover:text-red-600 transition-colors text-sm"
                >
                  ห้องสมุด หอศิลปวัฒนธรรมแห่งกรุงเทพมหานคร
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Right Section: Contact, User Profile / Login & Hamburger Button */}
        <div className="flex items-center gap-2 sm:gap-3 h-full flex-shrink-0">
          <Link 
            href="/contact" 
            className={`hidden xl:flex items-center px-1 h-full border-b-[3px] transition-colors text-[15px] font-medium whitespace-nowrap flex-shrink-0 ${pathname === "/contact" ? "border-red-500 text-red-500" : "border-transparent hover:border-red-500 hover:text-red-500 text-gray-700"}`}
          >
            ติดต่อเรา
          </Link>
          
          <div className="hidden xl:flex items-center h-4 w-px bg-gray-300 mx-1"></div>

          {userName ? (
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {userRole === "teacher" || userRole === "admin" ? (
                <Link 
                  href="/admin" 
                  className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-full shadow-xs transition-colors whitespace-nowrap cursor-pointer"
                >
                  หลังบ้าน
                </Link>
              ) : null}
              <div 
                className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 sm:px-3 py-1.5 rounded-full border border-orange-100 shadow-2xs max-w-[90px] sm:max-w-[130px] truncate cursor-default"
                title={userName}
              >
                {userName}
              </div>
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

          {/* Mobile & Tablet Hamburger Button (Screen width < 1280px) */}
          <button 
            className="xl:hidden p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 active:scale-95 rounded-xl transition-all flex items-center justify-center cursor-pointer flex-shrink-0"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="เมนูนำทาง"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Navigation Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="xl:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-[9998]" 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
      )}

      {/* Mobile & Tablet Navigation Drawer */}
      <div 
        className={`xl:hidden fixed top-0 right-0 w-[300px] max-w-[85vw] h-screen bg-white z-[9999] transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col ${
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
          <Link 
            href="/" 
            className={`px-4 py-3 font-medium rounded-xl transition-colors cursor-pointer ${pathname === "/" ? "bg-red-50 text-red-600 font-bold" : "text-gray-700 hover:bg-gray-50"}`} 
            onClick={() => setIsMobileMenuOpen(false)}
          >
            หน้าแรก
          </Link>
          
          {/* Materials Mobile Dropdown */}
          <div className="flex flex-col">
            <button 
              onClick={() => setIsMaterialsOpen(!isMaterialsOpen)}
              className="px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 rounded-xl flex items-center justify-between text-left cursor-pointer"
            >
              <span>สื่อการสอน</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isMaterialsOpen ? "rotate-180 text-red-600" : ""}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isMaterialsOpen ? "max-h-60 opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
              <div className="ml-4 flex flex-col border-l-2 border-red-200 pl-2 space-y-1">
                <Link href="/materials" className="px-3 py-2 text-gray-700 hover:text-red-600 font-medium text-sm rounded-lg hover:bg-red-50/50 cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}>
                  คลังสื่อการสอน (ม.1 - ม.6)
                </Link>
                <Link href="/downloads" className="px-3 py-2 text-emerald-600 hover:text-emerald-700 font-medium text-sm rounded-lg hover:bg-emerald-50/50 cursor-pointer flex items-center justify-between" onClick={() => setIsMobileMenuOpen(false)}>
                  <span>ศูนย์ดาวน์โหลดใบงาน</span>
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.5 rounded font-bold">PDF</span>
                </Link>
                <Link href="/materials/m3" className="px-3 py-2 text-gray-600 hover:text-red-600 font-medium text-xs rounded-lg hover:bg-red-50/50 cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}>
                  สื่อการสอน (ม.3)
                </Link>
                <Link href="/materials/m4" className="px-3 py-2 text-gray-600 hover:text-red-600 font-medium text-xs rounded-lg hover:bg-red-50/50 cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}>
                  สื่อการสอน (ม.4)
                </Link>
              </div>
            </div>
          </div>
          
          <Link 
            href="/news" 
            className={`px-4 py-3 font-medium rounded-xl transition-colors cursor-pointer ${pathname.startsWith("/news") ? "bg-red-50 text-red-600 font-bold" : "text-gray-700 hover:bg-gray-50"}`} 
            onClick={() => setIsMobileMenuOpen(false)}
          >
            ข่าวสาร
          </Link>

          <Link 
            href="/ideas" 
            className={`px-4 py-3 font-medium rounded-xl transition-colors cursor-pointer ${pathname.startsWith("/ideas") ? "bg-red-50 text-red-600 font-bold" : "text-gray-700 hover:bg-gray-50"}`} 
            onClick={() => setIsMobileMenuOpen(false)}
          >
            แชร์ไอเดีย
          </Link>
          
          {/* Artworks Mobile Dropdown */}
          <div className="flex flex-col">
            <button 
              onClick={() => setIsArtworksOpen(!isArtworksOpen)}
              className="px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 rounded-xl flex items-center justify-between text-left cursor-pointer"
            >
              <span>ผลงานนักเรียน</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isArtworksOpen ? "rotate-180 text-red-600" : ""}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isArtworksOpen ? "max-h-32 opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
              <div className="ml-4 flex flex-col border-l-2 border-red-200 pl-2 space-y-1">
                <Link href="/awards" className="px-3 py-2 text-gray-600 hover:text-red-600 font-medium text-sm rounded-lg hover:bg-red-50/50 cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}>
                  รางวัลที่ได้รับ
                </Link>
                <Link href="/artworks" className="px-3 py-2 text-gray-600 hover:text-red-600 font-medium text-sm rounded-lg hover:bg-red-50/50 cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}>
                  ผลงานนักเรียน
                </Link>
              </div>
            </div>
          </div>
          
          {/* Activities Mobile Dropdown */}
          <div className="flex flex-col">
            <button 
              onClick={() => setIsActivitiesOpen(!isActivitiesOpen)}
              className="px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 rounded-xl flex items-center justify-between text-left cursor-pointer"
            >
              <span>กิจกรรมต่างๆ</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isActivitiesOpen ? "rotate-180 text-red-600" : ""}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isActivitiesOpen ? "max-h-24 opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
              <div className="ml-4 flex flex-col border-l-2 border-red-200 pl-2 space-y-1">
                <Link href="/activities" className="px-3 py-2 text-gray-600 hover:text-red-600 font-medium text-sm rounded-lg hover:bg-red-50/50 cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}>
                  ปฏิทินกิจกรรม
                </Link>
              </div>
            </div>
          </div>

          {/* ทำเนียบครูผู้สอน (ซ่อนไว้ก่อนตามคำสั่ง: จัดการในระบบหลังบ้าน ยังไม่เปิดแสดงในระบบหน้าบ้าน)
          <Link 
            href="/teachers" 
            className={`px-4 py-3 font-medium rounded-xl transition-colors cursor-pointer ${pathname === "/teachers" ? "bg-red-50 text-red-600 font-bold" : "text-gray-700 hover:bg-gray-50"}`} 
            onClick={() => setIsMobileMenuOpen(false)}
          >
            ทำเนียบครูผู้สอน
          </Link>
          */}

          {/* Organization Media Mobile Dropdown */}
          <div className="flex flex-col">
            <button 
              onClick={() => setIsOrgMediaOpen(!isOrgMediaOpen)}
              className="px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 rounded-xl flex items-center justify-between text-left cursor-pointer"
            >
              <span>คลังสื่อองค์กร</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isOrgMediaOpen ? "rotate-180 text-red-600" : ""}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isOrgMediaOpen ? "max-h-36 opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
              <div className="ml-4 flex flex-col border-l-2 border-red-200 pl-2 space-y-1">
                <Link href="https://media-center.moe.go.th/Home" target="_blank" rel="noopener noreferrer" className="px-3 py-2 text-gray-600 hover:text-red-600 font-medium text-xs rounded-lg hover:bg-red-50/50 cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}>
                  ศูนย์รวมการเรียนรู้ (ศธ.)
                </Link>
                <Link href="https://elibrary-bacc.hibrary.me/" target="_blank" rel="noopener noreferrer" className="px-3 py-2 text-gray-600 hover:text-red-600 font-medium text-xs rounded-lg hover:bg-red-50/50 cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}>
                  ห้องสมุด (BACC)
                </Link>
              </div>
            </div>
          </div>
          
          <Link 
            href="/contact" 
            className={`px-4 py-3 font-medium rounded-xl transition-colors cursor-pointer ${pathname === "/contact" ? "bg-red-50 text-red-600 font-bold" : "text-gray-700 hover:bg-gray-50"}`} 
            onClick={() => setIsMobileMenuOpen(false)}
          >
            ติดต่อเรา
          </Link>
        </div>

        {/* Drawer Bottom Action */}
        <div className="p-4 border-t border-gray-100 safe-pb bg-gray-50/50">
          {userName ? (
            <div className="flex flex-col gap-2.5">
              <div className="px-4 py-2.5 bg-orange-50 rounded-xl text-orange-700 font-bold text-center border border-orange-200 text-sm truncate">
                สวัสดี, {userName}
              </div>
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
    </header>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, LogOut } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMaterialsOpen, setIsMaterialsOpen] = useState(false);
  const [isActivitiesOpen, setIsActivitiesOpen] = useState(false);
  const [isArtworksOpen, setIsArtworksOpen] = useState(false);
  const [isOrgMediaOpen, setIsOrgMediaOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const name = localStorage.getItem("artroom_author_name");
    const role = localStorage.getItem("artroom_role");
    if (name) {
      setUserName(name);
    }
    if (role) {
      setUserRole(role);
    }
  }, []);

  const handleLogout = async () => {
    // Clear session cookie via API
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // proceed with client-side cleanup even if API fails
    }
    localStorage.removeItem("artroom_author_name");
    localStorage.removeItem("artroom_author_email");
    localStorage.removeItem("artroom_role");
    setUserName(null);
    window.location.reload();
  };

  return (
    <div className="fixed top-8 w-full z-50 pointer-events-none">
      <header className="w-full bg-white border-b border-gray-200 shadow-sm pointer-events-auto transition-all duration-300">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 h-full">
            <Link href="/" className="flex items-center gap-3 group">
              <img 
                src="/school-logo.png" 
                alt="School Logo" 
                className="w-14 h-14 object-contain group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col justify-center">
                <span className="font-heading font-black text-[28px] tracking-[0.05em] leading-none">
                  <span className="text-[#FF0000]">ART </span>
                  <span className="text-[#03071C]">ROOM</span>
                </span>
                <span className="font-sans text-[9.5px] text-gray-600 font-bold tracking-[0.02em] mt-0.5 text-center block w-full">
                  WACHIRATHAMMASATIT SCHOOL
                </span>
              </div>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-[15px] font-medium text-gray-700 h-full ml-6">
            <Link 
              href="/" 
              className={`h-full flex items-center px-1 border-b-[3px] transition-colors ${pathname === "/" ? "border-red-500 text-red-500" : "border-transparent hover:border-red-500 hover:text-red-500"}`}
            >
              หน้าแรก
            </Link>
            {/* Materials Dropdown Menu */}
            <div className="relative group h-full flex items-center">
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
                    className="px-4 py-2 hover:bg-gray-50 text-gray-700 hover:text-(--color-primary-500) transition-colors"
                  >
                    Art Room by Students
                  </Link>
                  <Link 
                    href="/materials/m3" 
                    className="px-4 py-2 hover:bg-gray-50 text-gray-700 hover:text-(--color-primary-500) transition-colors"
                  >
                    สื่อการสอน (ม.3)
                  </Link>
                  <Link 
                    href="/materials/m4" 
                    className="px-4 py-2 hover:bg-gray-50 text-gray-700 hover:text-(--color-primary-500) transition-colors"
                  >
                    สื่อการสอน (ม.4)
                  </Link>
                </div>
              </div>
            </div>
            <Link 
              href="/news" 
              className={`h-full flex items-center px-1 border-b-[3px] transition-colors ${pathname.startsWith("/news") ? "border-red-500 text-red-500" : "border-transparent hover:border-red-500 hover:text-red-500"}`}
            >
              ข่าวสาร
            </Link>
            <Link 
              href="/ideas" 
              className={`h-full flex items-center px-1 border-b-[3px] transition-colors ${pathname.startsWith("/ideas") ? "border-red-500 text-red-500" : "border-transparent hover:border-red-500 hover:text-red-500"}`}
            >
              แชร์ไอเดีย
            </Link>
            {/* Artworks Dropdown Menu */}
            <div className="relative group h-full flex items-center">
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
                    className="px-4 py-2 hover:bg-gray-50 text-gray-700 hover:text-(--color-primary-500) transition-colors"
                  >
                    รางวัลที่ได้รับ
                  </Link>
                  <Link 
                    href="/artworks" 
                    className="px-4 py-2 hover:bg-gray-50 text-gray-700 hover:text-(--color-primary-500) transition-colors"
                  >
                    ผลงานนักเรียน
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Dropdown Menu */}
            <div className="relative group h-full flex items-center">
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
                    className="px-4 py-2 hover:bg-gray-50 text-gray-700 hover:text-(--color-primary-500) transition-colors"
                  >
                    ปฏิทินกิจกรรม
                  </Link>
                </div>
              </div>
            </div>

            {/* Organization Media Dropdown Menu */}
            <div className="relative group h-full flex items-center">
              <button 
                className="whitespace-nowrap flex items-center gap-1.5 px-1 h-full border-b-[3px] border-transparent hover:border-red-500 hover:text-red-500 transition-colors focus:outline-none"
              >
                คลังสื่อองค์กร <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
              </button>
              
              <div className="absolute top-full -left-4 pt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 py-2 flex flex-col">
                  <Link 
                    href="https://media-center.moe.go.th/Home" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-2 hover:bg-gray-50 text-gray-700 hover:text-(--color-primary-500) transition-colors text-sm"
                  >
                    ศูนย์รวมการเรียนรู้ (กระทรวงศึกษาธิการ)
                  </Link>
                  <Link 
                    href="https://elibrary-bacc.hibrary.me/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-2 hover:bg-gray-50 text-gray-700 hover:text-(--color-primary-500) transition-colors text-sm"
                  >
                    ห้องสมุด หอศิลปวัฒนธรรมแห่งกรุงเทพมหานคร
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          <div className="flex items-center gap-4 h-full">
            <Link 
              href="/contact" 
              className={`hidden lg:flex items-center px-1 h-full border-b-[3px] transition-colors text-[15px] font-medium ${pathname === "/contact" ? "border-red-500 text-red-500" : "border-transparent hover:border-red-500 hover:text-red-500 text-gray-700"}`}
            >
              ติดต่อเรา
            </Link>
            
            <div className="hidden sm:flex items-center h-4 w-px bg-gray-300 mx-1"></div>

            {userName ? (
              <div className="hidden sm:flex items-center gap-2">
                {userRole === "teacher" || userRole === "admin" ? (
                  <Link 
                    href="/admin" 
                    className="text-sm font-bold text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-full shadow-sm transition-colors mr-1"
                  >
                    ระบบหลังบ้าน
                  </Link>
                ) : null}
                <div 
                  className="text-sm font-bold text-orange-600 bg-orange-50 px-4 py-2 rounded-full border border-orange-100 shadow-sm max-w-[120px] truncate cursor-default"
                  title={userName}
                >
                  {userName}
                </div>
                <button onClick={handleLogout} title="ออกจากระบบ" className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors flex items-center justify-center">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link href="/login" className="hidden sm:block">
                <Button variant="default" className="whitespace-nowrap rounded-lg px-4 h-10 shadow-sm shadow-red-500/25 bg-[#ff0f39] hover:bg-[#e00028] text-white font-medium transition-all duration-200 border-0 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3 text-[#ff0f39]">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                  เข้าสู่ระบบ
                </Button>
              </Link>
            )}
            <button 
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black/50 z-[60]" 
            onClick={() => setIsMobileMenuOpen(false)} 
          />
        )}

        {/* Mobile Navigation Drawer */}
        <div 
          className={`md:hidden fixed top-0 right-0 w-[280px] h-screen bg-white z-[70] transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <span className="font-heading font-black text-xl">เมนู</span>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
            <Link href="/" className="px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 rounded-xl" onClick={() => setIsMobileMenuOpen(false)}>
              หน้าแรก
            </Link>
            
            {/* Materials Mobile Dropdown */}
            <div className="flex flex-col">
              <button 
                onClick={() => setIsMaterialsOpen(!isMaterialsOpen)}
                className="px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 rounded-xl flex items-center justify-between text-left"
              >
                สื่อการสอน <ChevronDown className={`w-4 h-4 transition-transform ${isMaterialsOpen ? "rotate-180" : ""}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${isMaterialsOpen ? "max-h-48 opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
                <div className="ml-4 flex flex-col border-l-2 border-gray-100 pl-2">
                  <Link href="/materials" className="px-4 py-2 text-gray-500 hover:text-(--color-primary-500) font-medium text-sm rounded-xl hover:bg-gray-50" onClick={() => setIsMobileMenuOpen(false)}>
                    Art Room by Students
                  </Link>
                  <Link href="/materials/m3" className="px-4 py-2 text-gray-500 hover:text-(--color-primary-500) font-medium text-sm rounded-xl hover:bg-gray-50" onClick={() => setIsMobileMenuOpen(false)}>
                    สื่อการสอน (ม.3)
                  </Link>
                  <Link href="/materials/m4" className="px-4 py-2 text-gray-500 hover:text-(--color-primary-500) font-medium text-sm rounded-xl hover:bg-gray-50" onClick={() => setIsMobileMenuOpen(false)}>
                    สื่อการสอน (ม.4)
                  </Link>
                </div>
              </div>
            </div>
            
            <Link href="/news" className="px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 rounded-xl" onClick={() => setIsMobileMenuOpen(false)}>
              ข่าวสาร
            </Link>
            <Link href="/ideas" className="px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 rounded-xl" onClick={() => setIsMobileMenuOpen(false)}>
              แชร์ไอเดีย
            </Link>
            
            {/* Artworks Mobile Dropdown */}
            <div className="flex flex-col">
              <button 
                onClick={() => setIsArtworksOpen(!isArtworksOpen)}
                className="px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 rounded-xl flex items-center justify-between text-left"
              >
                ผลงานนักเรียน <ChevronDown className={`w-4 h-4 transition-transform ${isArtworksOpen ? "rotate-180" : ""}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${isArtworksOpen ? "max-h-32 opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
                <div className="ml-4 flex flex-col border-l-2 border-gray-100 pl-2">
                  <Link href="/awards" className="px-4 py-2 text-gray-500 hover:text-(--color-primary-500) font-medium text-sm rounded-xl hover:bg-gray-50" onClick={() => setIsMobileMenuOpen(false)}>
                    รางวัลที่ได้รับ
                  </Link>
                  <Link href="/artworks" className="px-4 py-2 text-gray-500 hover:text-(--color-primary-500) font-medium text-sm rounded-xl hover:bg-gray-50" onClick={() => setIsMobileMenuOpen(false)}>
                    ผลงานนักเรียน
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Activities Mobile Dropdown */}
            <div className="flex flex-col">
              <button 
                onClick={() => setIsActivitiesOpen(!isActivitiesOpen)}
                className="px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 rounded-xl flex items-center justify-between text-left"
              >
                กิจกรรมต่างๆ <ChevronDown className={`w-4 h-4 transition-transform ${isActivitiesOpen ? "rotate-180" : ""}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${isActivitiesOpen ? "max-h-16 opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
                <div className="ml-4 flex flex-col border-l-2 border-gray-100 pl-2">
                  <Link href="/activities" className="px-4 py-2 text-gray-500 hover:text-(--color-primary-500) font-medium text-sm rounded-xl hover:bg-gray-50" onClick={() => setIsMobileMenuOpen(false)}>
                    ปฏิทินกิจกรรม
                  </Link>
                </div>
              </div>
            </div>

            {/* Organization Media Mobile Dropdown */}
            <div className="flex flex-col">
              <button 
                onClick={() => setIsOrgMediaOpen(!isOrgMediaOpen)}
                className="px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 rounded-xl flex items-center justify-between text-left"
              >
                คลังสือองค์กร <ChevronDown className={`w-4 h-4 transition-transform ${isOrgMediaOpen ? "rotate-180" : ""}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${isOrgMediaOpen ? "max-h-32 opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
                <div className="ml-4 flex flex-col border-l-2 border-gray-100 pl-2">
                  <Link href="https://media-center.moe.go.th/Home" target="_blank" className="px-4 py-2 text-gray-500 hover:text-(--color-primary-500) font-medium text-sm rounded-xl hover:bg-gray-50" onClick={() => setIsMobileMenuOpen(false)}>
                    ศูนย์รวมการเรียนรู้ (ศธ.)
                  </Link>
                  <Link href="https://elibrary-bacc.hibrary.me/" target="_blank" className="px-4 py-2 text-gray-500 hover:text-(--color-primary-500) font-medium text-sm rounded-xl hover:bg-gray-50" onClick={() => setIsMobileMenuOpen(false)}>
                    ห้องสมุด (BACC)
                  </Link>
                </div>
              </div>
            </div>
            
            <Link href="/contact" className="px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 rounded-xl" onClick={() => setIsMobileMenuOpen(false)}>
              ติดต่อเรา
            </Link>
          </div>

          <div className="p-4 border-t border-gray-100 safe-pb">
            {userName ? (
              <div className="flex flex-col gap-3">
                <div className="px-4 py-3 bg-orange-50 rounded-xl text-orange-600 font-bold text-center border border-orange-100 truncate">
                  สวัสดี, {userName}
                </div>
                {(userRole === "teacher" || userRole === "admin") && (
                  <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full rounded-xl h-[44px] border-red-500 text-red-500 hover:bg-red-50 font-bold transition-colors">
                      เข้าระบบหลังบ้าน
                    </Button>
                  </Link>
                )}
                <button onClick={handleLogout} className="w-full rounded-xl h-[44px] border border-red-200 text-red-500 hover:bg-red-50 font-bold transition-colors flex items-center justify-center gap-2">
                  <LogOut className="w-4 h-4" /> ออกจากระบบ
                </button>
              </div>
            ) : (
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="default" className="w-full rounded-xl h-[44px] shadow-sm bg-orange-500 hover:bg-orange-600 text-white font-bold">
                  เข้าสู่ระบบ
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}

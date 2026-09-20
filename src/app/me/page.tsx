"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import {
  User,
  Settings,
  LogOut,
  ChevronRight,
  Type,
  Check,
  RotateCcw,
  Palette,
  Sparkles,
  GraduationCap,
  Mail,
  Phone,
  ShieldCheck,
  Laptop,
  Smartphone,
  Tablet,
  Globe,
  Shield,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { resolveUserAvatar } from "@/lib/art-avatars";
import { performGlobalLogout } from "@/lib/client-auth";
import { FONTS_LIST, applyActiveFont } from "@/components/ui/FontSelectorDropdown";
import type { FontOption } from "@/components/ui/FontSelectorDropdown";
import ProfileSettingsModal from "@/components/modals/ProfileSettingsModal";

export default function MePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userGrade, setUserGrade] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Device Sessions state
  const [userSessions, setUserSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [kickingSessionId, setKickingSessionId] = useState<string | null>(null);

  const fetchUserSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await fetch("/api/auth/sessions");
      if (res.ok) {
        const data = await res.json();
        setUserSessions(data.sessions || []);
      }
    } catch (err) {
      console.error("Fetch user sessions error:", err);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleRevokeUserSession = async (sessionId: string) => {
    if (!confirm("คุณต้องการออกจากระบบอุปกรณ์นี้ใช่หรือไม่?")) return;
    setKickingSessionId(sessionId);
    try {
      const res = await fetch("/api/auth/sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      if (res.ok) {
        await fetchUserSessions();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setKickingSessionId(null);
    }
  };

  const handleRevokeOtherUserSessions = async () => {
    if (!confirm("คุณต้องการออกจากระบบอุปกรณ์อื่นทั้งหมดใช่หรือไม่?")) return;
    setLoadingSessions(true);
    try {
      const res = await fetch("/api/auth/sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allOthers: true }),
      });
      if (res.ok) {
        await fetchUserSessions();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    if (mounted && userName) {
      fetchUserSessions();
    }
  }, [mounted, userName]);

  const FONT_STORAGE_KEY = "artroom_selected_font";

  const loadUserData = () => {
    setUserName(localStorage.getItem("artroom_author_name"));
    setUserRole(localStorage.getItem("artroom_role"));
    setUserEmail(localStorage.getItem("artroom_author_email"));
    setUserPhone(localStorage.getItem("artroom_phone"));
    setUserAvatar(localStorage.getItem("artroom_avatar"));
    setUserGrade(localStorage.getItem("artroom_student_grade"));
  };

  useEffect(() => {
    setMounted(true);
    loadUserData();

    // Load saved font
    try {
      const cookieMatch = document.cookie.match(/(?:^|;\s*)artroom_selected_font=([^;]*)/);
      const saved = (cookieMatch ? decodeURIComponent(cookieMatch[1]) : null) || localStorage.getItem(FONT_STORAGE_KEY);
      if (saved) {
        const found = FONTS_LIST.find((f) => f.id === saved);
        if (found) setSelectedFontId(found.id);
      }
    } catch {}

    window.addEventListener("artroom_profile_updated", loadUserData);
    return () => window.removeEventListener("artroom_profile_updated", loadUserData);
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (mounted && !userName) {
      router.replace("/login");
    }
  }, [mounted, userName, router]);

  const handleSelectFont = (font: FontOption) => {
    setSelectedFontId(font.id);
    applyActiveFont(font.family);
    try {
      localStorage.setItem(FONT_STORAGE_KEY, font.id);
      document.cookie = `artroom_selected_font=${encodeURIComponent(font.id)}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {}
  };

  const handleResetFont = () => {
    const defaultFont = FONTS_LIST[0];
    handleSelectFont(defaultFont);
  };

  const handleLogout = async () => {
    await performGlobalLogout("/");
  };

  if (!mounted || !userName) {
    return (
      <>
        <Navbar />
        <main className="flex-1 flex items-center justify-center pt-24">
          <div className="animate-pulse text-gray-400 text-sm">กำลังโหลด...</div>
        </main>
      </>
    );
  }

  const resolvedAvatar = resolveUserAvatar(userAvatar, userName);
  const currentFont = FONTS_LIST.find((f) => f.id === selectedFontId) || FONTS_LIST[0];
  const filteredFonts = fontTab === "ทั้งหมด" ? FONTS_LIST : FONTS_LIST.filter(f => f.category === fontTab);

  const roleDisplay = userRole === "student" ? "นักเรียน WTS" 
    : userRole === "teacher" ? "ครูผู้สอน" 
    : userRole === "admin" ? "ผู้ดูแลระบบ" 
    : "บุคคลทั่วไป";

  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col pt-16 sm:pt-24 pb-4 px-4 sm:px-6 max-w-2xl mx-auto w-full">
        
        {/* ===== PROFILE SECTION ===== */}
        <section className="bg-gradient-to-br from-orange-50/80 via-amber-50/40 to-white rounded-2xl sm:rounded-3xl border border-orange-200/80 p-4 sm:p-6 mb-4">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white shadow-md border-2 border-white ring-3 ring-orange-300/70 flex items-center justify-center overflow-hidden shrink-0">
              {resolvedAvatar.type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={resolvedAvatar.value} alt={userName} className="w-full h-full object-cover" />
              ) : resolvedAvatar.type === "preset" ? (
                <span className="text-3xl sm:text-4xl select-none">{resolvedAvatar.value}</span>
              ) : (
                <span className="text-lg sm:text-xl font-bold text-orange-600">{resolvedAvatar.value}</span>
              )}
            </div>
            
            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-lg font-extrabold text-gray-900 truncate">{userName}</h1>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border mt-1 ${
                userRole === "student" ? "bg-amber-50 text-amber-800 border-amber-200" 
                : userRole === "teacher" || userRole === "admin" ? "bg-red-50 text-red-700 border-red-200"
                : "bg-blue-50 text-blue-700 border-blue-200"
              }`}>
                <GraduationCap className="w-3 h-3" />
                {roleDisplay}
              </span>
              {userGrade && (
                <p className="text-xs text-gray-500 mt-1">ชั้น {userGrade}</p>
              )}
            </div>
          </div>

          {/* Quick Info Rows */}
          <div className="mt-4 space-y-2">
            {userEmail && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="truncate">{userEmail}</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 ml-auto" />
              </div>
            )}
            {userPhone && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>{userPhone}</span>
              </div>
            )}
          </div>

          {/* Edit Profile Button */}
          <button
            type="button"
            onClick={() => setIsProfileModalOpen(true)}
            className="mt-4 w-full flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-orange-200 hover:bg-orange-50/50 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-sm font-bold text-gray-900">แก้ไขโปรไฟล์</span>
                <span className="block text-[11px] text-gray-400">เปลี่ยนชื่อ, รูปภาพ, รหัสผ่าน</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
          </button>
        </section>

        {/* ===== FONT SETTINGS SECTION ===== */}
        <section className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 p-4 sm:p-6 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                <Type className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">ฟอนต์เว็บไซต์</h2>
                <p className="text-[11px] text-gray-400">คลิกแล้วเปลี่ยนตัวอักษรทันทีทั้งเว็บ</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleResetFont}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              title="รีเซ็ตเป็นฟอนต์มาตรฐาน Prompt"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Current Font Display */}
          <div className="flex items-center gap-2 mb-3 p-2.5 rounded-xl bg-orange-50/60 border border-orange-200/60">
            <Palette className="w-4 h-4 text-orange-500 shrink-0" />
            <span className="text-xs font-semibold text-gray-700">กำลังใช้:</span>
            <span className="text-xs font-bold text-orange-700">{currentFont.name}</span>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1 mb-3 pb-2 border-b border-gray-100 overflow-x-auto">
            {(["ทั้งหมด", "มาตรฐาน", "วัยรุ่นหัวกลม", "ลายมือ"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFontTab(tab)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  fontTab === tab
                    ? "bg-orange-500 text-white shadow-xs"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Font List */}
          <div className="space-y-1.5 max-h-[40dvh] overflow-y-auto pr-1 -mr-1">
            {filteredFonts.map((font) => {
              const isSelected = selectedFontId === font.id;
              return (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => handleSelectFont(font)}
                  className={`w-full text-left p-3 rounded-2xl transition-all duration-150 flex items-center justify-between gap-3 cursor-pointer border ${
                    isSelected
                      ? "bg-gradient-to-r from-orange-50 to-amber-50/90 border-orange-300 text-orange-950 shadow-xs ring-2 ring-orange-400/40"
                      : "bg-white hover:bg-gray-50/90 border-gray-100 hover:border-gray-200 text-gray-800"
                  }`}
                >
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-gray-900 leading-tight truncate">
                        {font.name}
                      </span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${font.tagColor || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                        {font.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 truncate">{font.subName}</p>
                    <div className="pt-1">
                      <span className={`text-base block text-gray-700 leading-snug tracking-wide ${font.previewClass}`}>
                        ศิลปะสร้างสรรค์ ART ROOM 123
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 pl-1">
                    {isSelected ? (
                      <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-gray-200" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center gap-1 text-[11px] text-gray-400">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>บันทึกจำค่าไว้ในเครื่องอัตโนมัติ</span>
          </div>
        </section>

        {/* ===== LOGGED-IN DEVICES SECTION ===== */}
        <section className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 p-4 sm:p-6 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <Laptop className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">อุปกรณ์ที่เข้าสู่ระบบของคุณ</h2>
                <p className="text-[11px] text-gray-400">ตรวจสอบและลบอุปกรณ์แปลกปลอม</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={fetchUserSessions}
                disabled={loadingSessions}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                title="รีเฟรชอุปกรณ์"
              >
                <RefreshCw className={`w-4 h-4 ${loadingSessions ? 'animate-spin' : ''}`} />
              </button>
              {userSessions.length > 1 && (
                <button
                  type="button"
                  onClick={handleRevokeOtherUserSessions}
                  className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
                >
                  ลบอุปกรณ์อื่นทั้งหมด
                </button>
              )}
            </div>
          </div>

          {loadingSessions ? (
            <div className="py-6 flex justify-center text-gray-400 text-xs gap-2 items-center">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              กำลังโหลดข้อมูลอุปกรณ์...
            </div>
          ) : userSessions.length === 0 ? (
            <div className="py-4 text-center text-gray-400 text-xs bg-gray-50 rounded-xl border border-dashed border-gray-200">
              ไม่มีข้อมูลอุปกรณ์อื่นที่ล็อกอินอยู่
            </div>
          ) : (
            <div className="space-y-2">
              {userSessions.map((session: any) => (
                <div
                  key={session.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                    session.isCurrent
                      ? "bg-emerald-50/60 border-emerald-200 text-emerald-950"
                      : "bg-gray-50/80 border-gray-200 text-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      session.isCurrent ? "bg-emerald-100 text-emerald-700" : "bg-white text-gray-500 border border-gray-200"
                    }`}>
                      {session.deviceType === "mobile" ? (
                        <Smartphone className="w-4 h-4" />
                      ) : session.deviceType === "tablet" ? (
                        <Tablet className="w-4 h-4" />
                      ) : (
                        <Laptop className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold truncate">{session.os} • {session.browser}</span>
                        {session.isCurrent && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-white">
                            อุปกรณ์นี้
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400 flex items-center gap-2 mt-0.5">
                        <span className="font-mono">{session.ipAddress}</span>
                        <span>{session.location || "ประเทศไทย"}</span>
                      </div>
                    </div>
                  </div>

                  {!session.isCurrent && (
                    <button
                      type="button"
                      onClick={() => handleRevokeUserSession(session.id)}
                      disabled={kickingSessionId === session.id}
                      className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 border border-red-200 transition-colors shrink-0 cursor-pointer"
                      title="ลบอุปกรณ์นี้"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ===== LOGOUT SECTION ===== */}
        <section className="mb-6">
          {!showLogoutConfirm ? (
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl border border-red-200 text-red-600 hover:bg-red-50 font-bold text-sm transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              ออกจากระบบ
            </button>
          ) : (
            <div className="bg-red-50 rounded-2xl border border-red-200 p-4 space-y-3 animate-in fade-in duration-200">
              <p className="text-sm font-bold text-red-800 text-center">ยืนยันการออกจากระบบ?</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-colors cursor-pointer"
                >
                  ออกจากระบบ
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Admin shortcut */}
        {(userRole === "teacher" || userRole === "admin") && (
          <Link
            href="/admin"
            className="block mb-4 w-full text-center px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-colors"
          >
            เข้าระบบหลังบ้าน (Admin)
          </Link>
        )}
      </main>

      {/* Profile Settings Modal */}
      <ProfileSettingsModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
}

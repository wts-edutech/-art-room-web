"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Cookie, Settings2, X, ShieldCheck, Check, ChevronUp, ChevronDown } from "lucide-react";
import Link from "next/link";

type CookiePreferences = {
  essential: boolean;
  analytics: boolean;
  preferences: boolean;
  marketing: boolean;
};

const defaultPreferences: CookiePreferences = {
  essential: true,
  analytics: false,
  preferences: false,
  marketing: false,
};

export default function CookieConsent() {
  const pathname = usePathname();
  const [showBanner, setShowBanner] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);

  // Read cookie helper
  const getConsentCookie = (): CookiePreferences | null => {
    if (typeof document === "undefined") return null;
    try {
      const match = document.cookie.match(/(?:^|;\s*)artroom_cookie_consent=([^;]*)/);
      if (match && match[1]) {
        return JSON.parse(decodeURIComponent(match[1]));
      }
    } catch {}
    return null;
  };

  useEffect(() => {
    // 1. Restore saved preferences if any
    let hasSavedConsent = false;
    try {
      const fromCookie = getConsentCookie();
      if (fromCookie) {
        setPreferences(fromCookie);
        hasSavedConsent = true;
      } else {
        const saved = localStorage.getItem("artroom_cookie_consent");
        if (saved) {
          setPreferences(JSON.parse(saved));
          hasSavedConsent = true;
        }
      }
    } catch (e) {
      console.warn("Could not read cookie preferences:", e);
    }

    // 2. เด้งเฉพาะหน้าแรก (pathname === "/") เพียง 1 ครั้งในการเข้าสู่ระบบ/เข้าชม ไม่ถามซ้ำ
    const isHandled =
      hasSavedConsent ||
      localStorage.getItem("artroom_cookie_consent_handled") === "true" ||
      sessionStorage.getItem("artroom_cookie_consent_shown") === "true";

    if (pathname === "/" && !isHandled) {
      sessionStorage.setItem("artroom_cookie_consent_shown", "true");
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  const savePreferences = (prefs: CookiePreferences) => {
    try {
      localStorage.setItem("artroom_cookie_consent", JSON.stringify(prefs));
      localStorage.setItem("artroom_cookie_consent_handled", "true");
      sessionStorage.setItem("artroom_cookie_consent_shown", "true");
      document.cookie = `artroom_cookie_consent=${encodeURIComponent(JSON.stringify(prefs))}; path=/; max-age=31536000; SameSite=Lax`;
    } catch (e) {
      console.warn("Could not write cookie preferences:", e);
    }

    setPreferences(prefs);
    setShowBanner(false);
    setIsExpanded(false);
    
    window.dispatchEvent(new CustomEvent("cookieConsentUpdated", { detail: prefs }));
  };

  const handleAcceptAll = () => {
    savePreferences({ essential: true, analytics: true, preferences: true, marketing: true });
  };

  const handleRejectNonEssential = () => {
    savePreferences({ essential: true, analytics: false, preferences: false, marketing: false });
  };

  const handleSaveExpandedSettings = () => {
    savePreferences(preferences);
  };

  const handleDismiss = () => {
    // ปิดและบันทึกค่าความยินยอมขั้นพื้นฐาน จดจำไว้ไม่ให้เด้งถามซ้ำ
    savePreferences(preferences);
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === "essential") return;
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    const handleOpen = () => {
      setShowBanner(true);
      setIsExpanded(true);
    };
    window.addEventListener("openCookieSettings", handleOpen);
    return () => window.removeEventListener("openCookieSettings", handleOpen);
  }, []);

  return (
    <>
      {/* Slide-up Bottom Notification Bar — sits above bottom nav on mobile */}
      {showBanner && (
        <div 
          className="fixed inset-x-0 z-[95] p-2.5 sm:p-4 pointer-events-none animate-in slide-in-from-bottom-full duration-500 ease-out"
          style={{ bottom: "calc(3.5rem + env(safe-area-inset-bottom, 0px))" }}
        >
          <div className="max-w-5xl mx-auto bg-white/98 backdrop-blur-2xl border border-slate-200/90 shadow-2xl rounded-2xl sm:rounded-3xl pointer-events-auto transition-all max-h-[60dvh] overflow-y-auto">
            <div className="p-4 sm:p-5 space-y-3.5">
            {/* Main Bar Top Row */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              {/* Notice Info */}
              <div className="flex items-start gap-3.5 flex-1">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                  <Cookie className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                      PDPA Cookie Notice
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 font-kanit">
                      การใช้งานคุกกี้บนเว็บไซต์ ART ROOM
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">
                    เว็บไซต์นี้ใช้คุกกี้เพื่อพัฒนาประสบการณ์การใช้งาน จดจำฟอนต์ที่เลือก และวิเคราะห์การเข้าชม ท่านสามารถเลือกปรับแต่งหรือยอมรับคุกกี้ได้
                    <Link href="/cookie-policy" className="text-orange-600 hover:underline font-semibold ml-1">
                      นโยบายคุกกี้
                    </Link>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full md:w-auto flex-wrap sm:flex-nowrap justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Settings2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>ตั้งค่าคุกกี้</span>
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={handleRejectNonEssential}
                  className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  จำเป็นเท่านั้น
                </button>

                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>ยอมรับทั้งหมด</span>
                </button>

                <button
                  type="button"
                  onClick={handleDismiss}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer ml-1"
                  title="ปิดแถบแจ้งเตือน"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Expandable Granular Settings Panel */}
            {isExpanded && (
              <div className="pt-3 border-t border-slate-100 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <p className="text-[11px] text-slate-500">
                  เลือกประเภทคุกกี้ที่ท่านต้องการอนุญาตให้เว็บไซต์ใช้งาน:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {/* Essential */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-xs font-bold text-slate-800">จำเป็น (Essential)</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">ทำงานพื้นฐาน & ความปลอดภัย</p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                      เปิดตลอด
                    </span>
                  </div>

                  {/* Preferences */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-slate-800">จดจำฟอนต์ (Preferences)</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">จดจำฟอนต์และธีมที่ท่านเลือก</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.preferences}
                      onChange={() => togglePreference("preferences")}
                      className="w-4 h-4 accent-orange-500 rounded cursor-pointer mt-1 shrink-0"
                    />
                  </div>

                  {/* Analytics */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-slate-800">สถิติ (Analytics)</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">สถิติผู้เข้าชมเว็บไซต์</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={() => togglePreference("analytics")}
                      className="w-4 h-4 accent-orange-500 rounded cursor-pointer mt-1 shrink-0"
                    />
                  </div>

                  {/* Marketing */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-slate-800">ประชาสัมพันธ์ (Notice)</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">ข่าวสารกิจกรรมนักเรียน</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={() => togglePreference("marketing")}
                      className="w-4 h-4 accent-orange-500 rounded cursor-pointer mt-1 shrink-0"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleSaveExpandedSettings}
                    className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    บันทึกการตั้งค่าที่เลือก
                  </button>
                </div>
              </div>
            )}
          </div>
          </div>
        </div>
      )}
    </>
  );
}

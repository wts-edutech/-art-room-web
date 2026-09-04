"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie, Settings2, X, ShieldCheck } from "lucide-react";
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
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);

  useEffect(() => {
    const saved = localStorage.getItem("artroom_cookie_consent");
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch (e) {
        setShowBanner(true);
      }
    } else {
      setShowBanner(true);
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem("artroom_cookie_consent", JSON.stringify(prefs));
    setPreferences(prefs);
    setShowBanner(false);
    setShowSettings(false);
    
    // In a real app, you would dispatch an event here to notify other scripts (like Google Analytics) 
    // that consent has changed so they can enable/disable themselves.
    window.dispatchEvent(new CustomEvent("cookieConsentUpdated", { detail: prefs }));
  };

  const handleAcceptAll = () => {
    savePreferences({ essential: true, analytics: true, preferences: true, marketing: true });
  };

  const handleRejectNonEssential = () => {
    savePreferences({ essential: true, analytics: false, preferences: false, marketing: false });
  };

  const handleSaveSettings = () => {
    savePreferences(preferences);
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === "essential") return;
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      {/* Floating Settings Button (visible when banner is closed) */}
      {!showBanner && !showSettings && (
        <button
          onClick={() => setShowSettings(true)}
          className="fixed bottom-4 left-4 z-40 p-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-gray-200 text-gray-600 hover:text-red-500 hover:bg-red-50 transition-all duration-300 group"
          title="ตั้งค่าคุกกี้"
        >
          <Cookie className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Main Consent Banner */}
      {showBanner && !showSettings && (
        <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 pointer-events-none animate-in slide-in-from-bottom-10 duration-500">
          <div className="max-w-6xl mx-auto bg-white/95 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-2xl p-6 pointer-events-auto flex flex-col lg:flex-row items-center gap-6">
            
            <div className="flex items-start gap-4 flex-1">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 mt-1">
                <Cookie className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h4 className="text-gray-900 font-bold font-heading text-lg mb-2">
                  การจัดการคุกกี้
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed max-w-3xl">
                  เว็บไซต์นี้ใช้คุกกี้เพื่อพัฒนาประสบการณ์การใช้งาน วิเคราะห์การเข้าชม และจดจำการตั้งค่าของผู้ใช้ คุณสามารถอ่านเพิ่มเติมได้ที่ 
                  <Link href="/cookie-policy" className="text-red-500 hover:underline mx-1 font-medium">นโยบายคุกกี้</Link> 
                  และ 
                  <Link href="/privacy-policy" className="text-red-500 hover:underline mx-1 font-medium">นโยบายความเป็นส่วนตัว</Link>
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto flex-shrink-0">
              <Button 
                variant="outline" 
                onClick={() => setShowSettings(true)}
                className="w-full sm:w-auto rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Settings2 className="w-4 h-4 mr-2" />
                ตั้งค่าคุกกี้
              </Button>
              <Button 
                variant="outline"
                onClick={handleRejectNonEssential}
                className="w-full sm:w-auto rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                ปฏิเสธคุกกี้ที่ไม่จำเป็น
              </Button>
              <Button 
                onClick={handleAcceptAll} 
                className="w-full sm:w-auto rounded-xl bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/20"
              >
                ยอมรับทั้งหมด
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[110] bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-[calc(100vw-32px)] md:w-full md:max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="p-6 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Settings2 className="w-6 h-6 text-red-500" />
                <h3 className="font-heading font-bold text-xl text-gray-900">ตั้งค่าความยินยอมคุกกี้</h3>
              </div>
              <button 
                onClick={() => setShowBanner(true)} 
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-gray-50/50">
              <p className="text-sm text-gray-600">
                คุณสามารถเลือกเปิดหรือปิดการใช้งานคุกกี้ได้ตามความต้องการของคุณ ยกเว้นคุกกี้ที่จำเป็นซึ่งไม่สามารถปิดได้
              </p>

              {/* Essential */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
                <div className="mt-1">
                  <ShieldCheck className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-gray-900">คุกกี้ที่จำเป็น (Essential)</h4>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">เปิดใช้งานเสมอ</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    คุกกี้เหล่านี้มีความจำเป็นต่อการทำงานของเว็บไซต์ เพื่อให้เว็บไซต์สามารถทำงานได้ตามปกติและปลอดภัย ไม่สามารถปิดการใช้งานได้
                  </p>
                </div>
              </div>

              {/* Analytics */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
                <div className="mt-1">
                  <input 
                    type="checkbox" 
                    id="analytics"
                    checked={preferences.analytics}
                    onChange={() => togglePreference("analytics")}
                    className="w-5 h-5 rounded border-gray-300 text-red-500 focus:ring-red-500 cursor-pointer"
                  />
                </div>
                <label htmlFor="analytics" className="flex-1 cursor-pointer">
                  <h4 className="font-bold text-gray-900 mb-1">คุกกี้เพื่อการวิเคราะห์ (Analytics)</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    ช่วยให้เราเข้าใจว่าผู้ใช้งานมีปฏิสัมพันธ์กับเว็บไซต์อย่างไร โดยรวบรวมและรายงานข้อมูลโดยไม่ระบุตัวตน เพื่อนำไปพัฒนาเว็บไซต์ให้ดีขึ้น
                  </p>
                </label>
              </div>

              {/* Preferences */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
                <div className="mt-1">
                  <input 
                    type="checkbox" 
                    id="preferences"
                    checked={preferences.preferences}
                    onChange={() => togglePreference("preferences")}
                    className="w-5 h-5 rounded border-gray-300 text-red-500 focus:ring-red-500 cursor-pointer"
                  />
                </div>
                <label htmlFor="preferences" className="flex-1 cursor-pointer">
                  <h4 className="font-bold text-gray-900 mb-1">คุกกี้เพื่อการจดจำการตั้งค่า (Preferences)</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    ช่วยให้เว็บไซต์จดจำตัวเลือกของคุณ (เช่น ชื่อผู้ใช้ ภาษา หรือภูมิภาค) เพื่อมอบประสบการณ์การใช้งานที่เป็นส่วนตัวมากขึ้น
                  </p>
                </label>
              </div>

              {/* Marketing */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
                <div className="mt-1">
                  <input 
                    type="checkbox" 
                    id="marketing"
                    checked={preferences.marketing}
                    onChange={() => togglePreference("marketing")}
                    className="w-5 h-5 rounded border-gray-300 text-red-500 focus:ring-red-500 cursor-pointer"
                  />
                </div>
                <label htmlFor="marketing" className="flex-1 cursor-pointer">
                  <h4 className="font-bold text-gray-900 mb-1">คุกกี้เพื่อการตลาด (Marketing)</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    ใช้เพื่อติดตามพฤติกรรมผู้ใช้บนเว็บไซต์ต่างๆ เพื่อแสดงโฆษณาที่เกี่ยวข้องและน่าสนใจสำหรับผู้ใช้แต่ละราย
                  </p>
                </label>
              </div>

            </div>

            <div className="p-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-end gap-3 bg-white">
              <Button 
                variant="outline" 
                onClick={handleRejectNonEssential}
                className="w-full sm:w-auto rounded-xl border-gray-300 text-gray-700"
              >
                ปฏิเสธทั้งหมด
              </Button>
              <Button 
                onClick={handleSaveSettings} 
                className="w-full sm:w-auto rounded-xl bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/20"
              >
                บันทึกการตั้งค่า
              </Button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

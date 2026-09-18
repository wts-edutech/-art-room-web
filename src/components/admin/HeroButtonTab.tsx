"use client";

import { useState, useEffect } from "react";
import { 
  Sparkles, 
  ExternalLink, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Link as LinkIcon, 
  Type, 
  Compass,
  Layers,
  Maximize2,
  Minimize2,
  Sliders,
  ArrowRight
} from "lucide-react";

interface AiModelButtonSettings {
  title: string;
  url: string;
  openInNewTab: boolean;
  isEnabled: boolean;
  buttonSize: "compact" | "normal" | "spacious";
  updatedAt?: string;
}

const DEFAULT_SETTINGS: AiModelButtonSettings = {
  title: "WTS CREATIVE AI ART MODEL",
  url: "https://wtscreativeaiart.netlify.app/",
  openInNewTab: true,
  isEnabled: true,
  buttonSize: "compact",
};

export default function HeroButtonTab() {
  const [settings, setSettings] = useState<AiModelButtonSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/settings/ai-model");
      if (res.ok) {
        const data = await res.json();
        setSettings({
          title: data.title || DEFAULT_SETTINGS.title,
          url: data.url || DEFAULT_SETTINGS.url,
          openInNewTab: data.openInNewTab !== undefined ? data.openInNewTab : true,
          isEnabled: data.isEnabled !== undefined ? data.isEnabled : true,
          buttonSize: data.buttonSize || "compact",
          updatedAt: data.updatedAt,
        });
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/settings/ai-model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json();

      if (res.ok) {
        setStatusMessage({
          type: "success",
          text: data.message || "บันทึกการตั้งค่าปุ่มเรียบร้อยแล้ว!",
        });
        setSettings(prev => ({ ...prev, updatedAt: data.settings?.updatedAt }));
        setTimeout(() => setStatusMessage(null), 5000);
      } else {
        setStatusMessage({
          type: "error",
          text: data.error || "เกิดข้อผิดพลาดในการบันทึก",
        });
      }
    } catch {
      setStatusMessage({
        type: "error",
        text: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefault = () => {
    if (confirm("คุณต้องการคืนค่าปุ่มเป็นค่าเริ่มต้นที่พอดีกับตัวอักษรหรือไม่?")) {
      setSettings(DEFAULT_SETTINGS);
    }
  };

  // Dynamic classes for button size & fit
  const getButtonSizeStyles = (size: "compact" | "normal" | "spacious") => {
    switch (size) {
      case "normal":
        return "px-7 py-3 text-sm sm:text-base";
      case "spacious":
        return "px-9 py-3.5 text-base sm:text-lg";
      case "compact":
      default:
        // กระชับ พอดีกับตัวอักษรอย่างสวยงาม ไม่เทอะทะ
        return "px-5 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm md:text-[15px]";
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Notification */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 text-sm font-medium animate-in fade-in duration-300 ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 shadow-xs"
              : "bg-red-50 text-red-800 border-red-200 shadow-xs"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Container: Live Realtime Preview & Quick Actions */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-2xs space-y-5">
        {/* Top bar inside card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-200/60 text-red-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                ตัวอย่างการแสดงผลจริง (Live Realtime Preview)
              </h3>
              <p className="text-xs text-gray-400">
                จุดสีแดงถูกปรับขนาดให้พอดีกับตัวอักษร ไม่เบี้ยว ไม่เทอะทะ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
              settings.isEnabled 
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                : "bg-gray-100 text-gray-500 border border-gray-200"
            }`}>
              {settings.isEnabled ? "• กำลังเปิดแสดงผล" : "• ปิดซ่อนปุ่ม"}
            </span>

            <button
              type="button"
              onClick={handleResetToDefault}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
              title="คืนค่าเป็นปุ่มสีแดงขนาดพอดีตัวอักษร"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              คืนค่าเริ่มต้น
            </button>
          </div>
        </div>

        {/* Hero Preview Canvas */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-[#fbfbfb] p-8 md:p-12 flex flex-col items-center justify-center min-h-[190px]">
          {/* Subtle Grid Pattern Background */}
          <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_70%,transparent_100%)]"></div>

          <div className="relative z-10 flex flex-col items-center text-center max-w-xl">
            <p className="text-[11px] text-gray-400 mb-3.5 font-medium tracking-wide">
              [ ตัวอย่างปุ่มสีแดงเสมือนจริงบนหน้าแรก — สัดส่วนพอดีกับตัวอักษร ]
            </p>

            {settings.isEnabled ? (
              <div className="inline-flex items-center group my-2">
                {/* Main AI Art Button - สีแดงธรรมดา ไม่เน้นเงา */}
                <div 
                  className={`inline-flex items-center justify-center gap-2.5 sm:gap-3 rounded-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold uppercase tracking-wider cursor-pointer transition-colors duration-200 ${getButtonSizeStyles(settings.buttonSize)}`}
                >
                  {/* AI Sparkle Icon Badge */}
                  <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/20 shrink-0">
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                  </span>

                  {/* Button Title */}
                  <span className="font-bold tracking-wider text-white select-none whitespace-nowrap">
                    {settings.title || "WTS CREATIVE AI ART MODEL"}
                  </span>

                  {/* Interactive Arrow Badge */}
                  <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-black/15 text-white group-hover:bg-white group-hover:text-red-600 transition-colors duration-200 shrink-0">
                    <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-4 px-6 rounded-2xl bg-gray-100 border border-dashed border-gray-300 text-gray-400 text-xs flex items-center gap-2">
                <EyeOff className="w-4 h-4" />
                ปุ่มนี้ถูกปิดการแสดงผลอยู่ (จะไม่ปรากฏบนหน้าแรก)
              </div>
            )}

            {settings.isEnabled && (
              <p className="text-[11px] text-gray-400 mt-3.5 flex items-center gap-1.5">
                <LinkIcon className="w-3 h-3 text-red-500" />
                ลิงก์ปลายทาง: <span className="text-red-600 font-mono underline truncate max-w-[260px] sm:max-w-md">{settings.url || "(ยังไม่ได้ระบุลิงก์)"}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-2xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
            <Sliders className="w-4 h-4 text-red-600" />
            ปรับแต่งข้อความ ลิงก์ และสัดส่วนปุ่ม
          </h3>
          {settings.updatedAt && (
            <span className="text-[11px] text-gray-400">
              อัปเดตล่าสุด: {new Date(settings.updatedAt).toLocaleString("th-TH")}
            </span>
          )}
        </div>

        {/* Row 1: Text and URL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Field: Button Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-red-600" />
              ข้อความบนปุ่ม (Button Text)
            </label>
            <input
              type="text"
              value={settings.title}
              onChange={(e) => setSettings({ ...settings, title: e.target.value })}
              placeholder="WTS CREATIVE AI ART MODEL"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-kanit transition-all text-gray-800"
            />
            <p className="text-[11px] text-gray-400">
              ข้อความที่ต้องการแสดงกึ่งกลางปุ่มสีแดง
            </p>
          </div>

          {/* Field: Destination URL */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-red-600" />
                ลิงก์ปลายทาง (Target URL)
              </label>
              {settings.url && (
                <a
                  href={settings.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-red-600 hover:text-red-700 font-medium inline-flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3" />
                  ทดสอบเปิดลิงก์
                </a>
              )}
            </div>
            <input
              type="url"
              value={settings.url}
              onChange={(e) => setSettings({ ...settings, url: e.target.value })}
              placeholder="https://wtscreativeaiart.netlify.app/"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-mono transition-all text-gray-800"
            />
            <p className="text-[11px] text-gray-400">
              URL เว็บไซต์ปลายทาง (เช่น https://wtscreativeaiart.netlify.app/)
            </p>
          </div>
        </div>

        {/* Row 2: Button Fit & Size Options */}
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-red-600" />
            ระดับความพอดีของกรอบสีแดงกับตัวอักษร (Button Fit & Size)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: "compact",
                title: "กระชับ พอดีตัวอักษร (แนะนำ)",
                desc: "กรอบสีแดงโอบรอบตัวอักษรอย่างลงตัว ไม่หนาหรือเทอะทะ",
                icon: Minimize2,
              },
              {
                id: "normal",
                title: "ขนาดมาตรฐาน",
                desc: "ระยะขอบปานกลาง สบายตาและสมดุล",
                icon: Sliders,
              },
              {
                id: "spacious",
                title: "กว้างเด่นชัด",
                desc: "ปุ่มขนาดใหญ่พิเศษ เพิ่มความโดดเด่นสะดุดตา",
                icon: Maximize2,
              },
            ].map((opt) => {
              const IconComponent = opt.icon;
              const isSelected = settings.buttonSize === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSettings({ ...settings, buttonSize: opt.id as any })}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "border-red-500 bg-red-50/60 shadow-xs ring-2 ring-red-500/20"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <IconComponent className={`w-4 h-4 ${isSelected ? "text-red-600" : "text-gray-400"}`} />
                        <span className={`text-xs font-bold ${isSelected ? "text-red-900" : "text-gray-800"}`}>
                          {opt.title}
                        </span>
                      </div>
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        isSelected ? "border-red-600 bg-red-600" : "border-gray-300"
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      {opt.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 3: Option Toggles */}
        <div className="pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Toggle: Open In New Tab */}
          <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-gray-200 hover:bg-gray-50/70 transition-colors cursor-pointer">
            <input
              type="checkbox"
              checked={settings.openInNewTab}
              onChange={(e) => setSettings({ ...settings, openInNewTab: e.target.checked })}
              className="mt-1 w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500 cursor-pointer"
            />
            <div>
              <p className="text-xs font-bold text-gray-800">เปิดลิงก์ในแท็บใหม่ (Open in new tab)</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                คลิกแล้วเปิดเว็บในหน้าต่างใหม่ โดยไม่ปิดหน้าเว็บโรงเรียน
              </p>
            </div>
          </label>

          {/* Toggle: Enable / Disable Button */}
          <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-gray-200 hover:bg-gray-50/70 transition-colors cursor-pointer">
            <input
              type="checkbox"
              checked={settings.isEnabled}
              onChange={(e) => setSettings({ ...settings, isEnabled: e.target.checked })}
              className="mt-1 w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500 cursor-pointer"
            />
            <div>
              <p className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                {settings.isEnabled ? (
                  <>
                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    <span>เปิดแสดงผลปุ่มบนหน้าแรก</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-gray-400" />
                    <span>ซ่อนปุ่มชั่วคราว</span>
                  </>
                )}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                สามารถซ่อนหรือนำปุ่มกลับมาแสดงได้ทันที
              </p>
            </div>
          </label>
        </div>

        {/* Submit Bar */}
        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            * บันทึกแล้วระบบจะอัปเดตสัดส่วนปุ่มและลิงก์บนหน้าแรกทันที
          </p>

          <button
            type="submit"
            disabled={isSaving || isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#ff0f39] hover:bg-[#e00028] text-white font-bold text-sm shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Image as ImageIcon, 
  Upload, 
  RotateCcw, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  Type, 
  Layers, 
  Maximize2, 
  Sparkles, 
  Palette,
  ZoomIn
} from "lucide-react";
import { LogoSettings, DEFAULT_LOGO_SETTINGS, useSiteLogo } from "@/context/LogoContext";
import { optimizeImageToDataUrl } from "@/lib/image-optimizer";

export default function SiteLogoSettingsSection() {
  const { refreshLogoSettings } = useSiteLogo();
  const [settings, setSettings] = useState<LogoSettings>(DEFAULT_LOGO_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [previewTheme, setPreviewTheme] = useState<"light" | "dark" | "gradient">("light");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCurrentSettings();
  }, []);

  const fetchCurrentSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/settings/logo");
      if (res.ok) {
        const data = await res.json();
        setSettings({
          logoUrl: data.logoUrl || DEFAULT_LOGO_SETTINGS.logoUrl,
          logoAlt: data.logoAlt || DEFAULT_LOGO_SETTINGS.logoAlt,
          brandNamePrefix: data.brandNamePrefix || DEFAULT_LOGO_SETTINGS.brandNamePrefix,
          brandNameSuffix: data.brandNameSuffix || DEFAULT_LOGO_SETTINGS.brandNameSuffix,
          schoolName: data.schoolName || DEFAULT_LOGO_SETTINGS.schoolName,
          showText: data.showText !== undefined ? Boolean(data.showText) : true,
          logoShape: data.logoShape || "rounded",
          logoSize: data.logoSize || "large",
          customSize: typeof data.customSize === "number" ? data.customSize : (data.logoSize === "compact" ? 44 : data.logoSize === "large" ? 72 : 56),
          logoScale: typeof data.logoScale === "number" ? data.logoScale : 100,
          updatedAt: data.updatedAt,
        });
      }
    } catch (err) {
      console.error("Failed to fetch logo settings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const currentSize = settings.customSize ?? (
    settings.logoSize === "compact" ? 44 :
    settings.logoSize === "large" ? 72 : 56
  );
  const currentScale = settings.logoScale ?? 100;

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง (PNG, WebP, JPG หรือ SVG)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("ขนาดไฟล์ภาพใหญ่เกิน 10MB กรุณาเลือกภาพที่มีขนาดเล็กลง");
      return;
    }

    setIsOptimizing(true);
    try {
      const isPng = file.type === "image/png" || file.name.toLowerCase().endsWith(".png");
      const isSvg = file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");

      if (isSvg) {
        const reader = new FileReader();
        reader.onload = () => {
          setSettings((prev) => ({
            ...prev,
            logoUrl: reader.result as string,
          }));
          setIsOptimizing(false);
        };
        reader.readAsDataURL(file);
        return;
      }

      const optimized = await optimizeImageToDataUrl(file, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.95,
        mimeType: isPng ? "image/png" : "image/webp",
        autoTrimBorders: false,
      });

      setSettings((prev) => ({
        ...prev,
        logoUrl: optimized,
      }));
    } catch (err) {
      console.error("Image optimization error:", err);
      const reader = new FileReader();
      reader.onload = () => {
        setSettings((prev) => ({
          ...prev,
          logoUrl: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleResetToDefault = () => {
    if (confirm("ต้องการคืนค่ากลับไปใช้รูปตราโรงเรียนวชิรธรรมสาธิตแบบเดิมใช่หรือไม่?")) {
      setSettings(DEFAULT_LOGO_SETTINGS);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/settings/logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json();

      if (res.ok) {
        setStatusMessage({
          type: "success",
          text: data.message || "บันทึกการตั้งค่ารูปโลโก้เรียบร้อยแล้ว!",
        });
        setSettings((prev) => ({ ...prev, updatedAt: data.settings?.updatedAt }));

        await refreshLogoSettings();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("artroom_logo_updated", { detail: data.settings }));
        }

        setTimeout(() => setStatusMessage(null), 5000);
      } else {
        setStatusMessage({
          type: "error",
          text: data.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
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

  const getLogoShapeClasses = (shape: "square" | "circle" | "rounded") => {
    switch (shape) {
      case "circle":
        return "rounded-full";
      case "square":
        return "rounded-none";
      case "rounded":
      default:
        return "rounded-2xl";
    }
  };

  const setCustomSize = (size: number) => {
    const clamped = Math.max(32, Math.min(160, size));
    setSettings((prev) => ({
      ...prev,
      customSize: clamped,
      logoSize: clamped <= 48 ? "compact" : clamped >= 72 ? "large" : "normal",
    }));
  };

  const setCustomScale = (scale: number) => {
    const clamped = Math.max(90, Math.min(180, scale));
    setSettings((prev) => ({
      ...prev,
      logoScale: clamped,
    }));
  };

  return (
    <div className="bg-gradient-to-br from-orange-50/60 via-amber-50/30 to-white rounded-3xl p-6 sm:p-8 border border-orange-200/80 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-orange-200/70">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-orange-500/20 shrink-0">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-gray-950 font-kanit">
                ตั้งค่าตราสัญลักษณ์ & โลโก้โรงเรียน (Site Logo & School Brand)
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-900 text-[10px] font-extrabold">
                อัตลักษณ์เว็บไซต์
              </span>
            </div>
            <p className="text-xs text-orange-950/70">
              อัปโหลดตราโรงเรียน ปรับขนาดได้เองตามใจชอบ (มีช่องสไลเดอร์และระบุ px) ปรับทรงมน หรือชื่อสังกัด โดยจะมีผลต่อ Navbar ทันที
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetToDefault}
          className="self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white hover:bg-orange-50 border border-orange-200 rounded-xl transition-all cursor-pointer shadow-2xs active:scale-95"
          title="คืนค่าเป็นตราโรงเรียนวชิรธรรมสาธิตแบบดั้งเดิม"
        >
          <RotateCcw className="w-3.5 h-3.5 text-orange-600" />
          <span>คืนค่าเริ่มต้น</span>
        </button>
      </div>

      {/* Status Alert Notification */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 text-xs sm:text-sm font-medium animate-in fade-in duration-300 ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-200 shadow-xs"
              : "bg-red-50 text-red-900 border-red-200 shadow-xs"
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

      {/* Realtime Live Preview Canvas */}
      <div className="bg-white/95 rounded-2xl p-5 border border-orange-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-orange-600" />
              <span>ตัวอย่างการแสดงผลจริงบน Navbar (Live Realtime Preview):</span>
            </span>
            <span className="text-[11px] font-mono text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
              {currentSize}px • ซูม {currentScale}%
            </span>
          </div>

          {/* Theme Selector for Preview */}
          <div className="inline-flex items-center p-0.5 bg-gray-100 rounded-xl text-[11px] font-medium text-gray-600">
            <button
              type="button"
              onClick={() => setPreviewTheme("light")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                previewTheme === "light" ? "bg-white text-gray-900 shadow-xs font-bold" : "hover:text-gray-900"
              }`}
            >
              สว่าง
            </button>
            <button
              type="button"
              onClick={() => setPreviewTheme("gradient")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                previewTheme === "gradient" ? "bg-white text-gray-900 shadow-xs font-bold" : "hover:text-gray-900"
              }`}
            >
              ครีม
            </button>
            <button
              type="button"
              onClick={() => setPreviewTheme("dark")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                previewTheme === "dark" ? "bg-gray-800 text-white shadow-xs font-bold" : "hover:text-gray-900"
              }`}
            >
              มืด
            </button>
          </div>
        </div>

        {/* Live Simulation Canvas */}
        <div
          className={`relative overflow-hidden rounded-2xl border transition-all duration-300 p-4 sm:p-6 flex flex-col items-center justify-center ${
            previewTheme === "dark"
              ? "bg-gray-950 border-gray-800 text-white"
              : previewTheme === "gradient"
              ? "bg-[#FDF7F0] border-orange-200/50 text-gray-900"
              : "bg-white border-gray-200 text-gray-900"
          }`}
        >
          {/* Header Simulation Bar */}
          <div
            className={`w-full max-w-2xl border rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between transition-all duration-150 ${
              previewTheme === "dark"
                ? "bg-gray-900/90 border-gray-800 shadow-md"
                : "bg-white/95 border-gray-200 shadow-xs"
            }`}
            style={{ minHeight: `${Math.max(68, currentSize + 16)}px` }}
          >
            {/* Logo and Brand Title Component */}
            <div className="flex items-center gap-3 sm:gap-4 group select-none">
              <div 
                className={`relative flex items-center justify-center shrink-0 overflow-hidden transition-all duration-150 ${
                  getLogoShapeClasses(settings.logoShape)
                }`}
                style={{
                  width: `${currentSize}px`,
                  height: `${currentSize}px`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={settings.logoUrl || "/school-logo.png"}
                  alt={settings.logoAlt || "ตราโรงเรียน"}
                  className="w-full h-full object-contain shrink-0 transition-transform duration-150"
                  style={{
                    transform: currentScale !== 100 ? `scale(${currentScale / 100})` : undefined,
                    transformOrigin: "center center",
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/school-logo.png";
                  }}
                />
              </div>

              {settings.showText && (
                <div className="flex flex-col justify-center min-w-0">
                  <span className="font-heading font-black text-[18px] sm:text-[22px] tracking-tight leading-none">
                    <span className="text-red-600">{settings.brandNamePrefix || "ART"} </span>
                    <span className={previewTheme === "dark" ? "text-white" : "text-gray-900"}>
                      {settings.brandNameSuffix || "ROOM"}
                    </span>
                  </span>
                  <span
                    className={`text-[9.5px] sm:text-[10.5px] font-bold tracking-wider uppercase truncate mt-1 ${
                      previewTheme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {settings.schoolName || "WACHIRATHAMMASATIT SCHOOL"}
                  </span>
                </div>
              )}
            </div>

            {/* Dummy nav menu items */}
            <div className="hidden md:flex items-center gap-3 text-xs font-semibold text-gray-400">
              <span className="text-red-500 font-bold">หน้าแรก</span>
              <span>สื่อการสอน</span>
              <span>ส่งงาน</span>
              <span>ผลงาน</span>
            </div>
          </div>

          <p className="text-[11px] text-gray-400 mt-3 text-center">
            [ ตัวอย่างการแสดงผลสัดส่วนจริงบนแถบนำทาง (Navbar) — เลื่อนแถบด้านล่างเพื่อขยายใหญ่ได้ตามที่ต้องการ ]
          </p>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-orange-200/90 p-5 sm:p-6 space-y-6">
        
        {/* ============================================================ */}
        {/* SECTION 1: CUSTOM SIZE SLIDER & NUMBER INPUT (ตามคำขอของผู้ใช้) */}
        {/* ============================================================ */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-orange-50/70 via-amber-50/50 to-orange-50/30 border-2 border-orange-300/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-orange-200/60">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold shadow-xs">
                <Maximize2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 font-kanit">
                  ช่องปรับขยายขนาดโลโก้ได้เอง (Custom Logo Size Slider)
                </h4>
                <p className="text-[11px] text-gray-500">
                  เลื่อนแถบสไลเดอร์ หรือกรอกตัวเลข px โดยตรงเพื่อขยายขนาดให้ใหญ่สะใจได้ทันที
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="text-xs text-gray-600 font-bold">ขนาด:</span>
              <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border-2 border-orange-400 shadow-2xs">
                <input
                  type="number"
                  min="32"
                  max="160"
                  value={currentSize}
                  onChange={(e) => setCustomSize(Number(e.target.value) || 32)}
                  className="w-14 text-center font-mono font-black text-sm text-orange-600 outline-none"
                />
                <span className="text-xs font-bold text-gray-400 font-mono">px</span>
              </div>
            </div>
          </div>

          {/* Interactive Range Slider */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 font-mono">
              <span>32px (กะทัดรัด)</span>
              <span className="text-xs font-extrabold text-orange-600 font-kanit">
                ขนาดปัจจุบัน: {currentSize} พิกเซล
              </span>
              <span>150px (ใหญ่ยักษ์เต็มตา)</span>
            </div>

            <input
              type="range"
              min="32"
              max="150"
              step="2"
              value={currentSize}
              onChange={(e) => setCustomSize(Number(e.target.value))}
              className="w-full h-3 bg-orange-100 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:accent-orange-600 transition-all"
            />
          </div>

          {/* Quick Preset Buttons */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block">
              เลือกขนาดด่วนสำเร็จรูป:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {[
                { size: 44, label: "กะทัดรัด (44px)" },
                { size: 56, label: "มาตรฐาน (56px)" },
                { size: 72, label: "ใหญ่เด่นชัด (72px)" },
                { size: 90, label: "ใหญ่พิเศษ (90px)" },
                { size: 110, label: "จัมโบ้เต็มตา (110px)" },
                { size: 130, label: "ใหญ่สุดตา (130px)" },
              ].map((opt) => (
                <button
                  key={opt.size}
                  type="button"
                  onClick={() => setCustomSize(opt.size)}
                  className={`py-2 px-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center ${
                    currentSize === opt.size
                      ? "border-orange-500 bg-orange-500 text-white font-bold shadow-xs scale-102"
                      : "border-orange-200 bg-white text-gray-700 hover:bg-orange-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* ============================================================ */}
          {/* INNER GRAPHIC ZOOM / FILL SLIDER (แก้ปัญหาขอบขาวรูปการ์ตูน) */}
          {/* ============================================================ */}
          <div className="pt-3 border-t border-orange-200/60 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <ZoomIn className="w-3.5 h-3.5 text-amber-600" />
                <span>ซูมขยายรูปภาพด้านใน (Crop/Zoom Inner Graphic)</span>
              </label>
              <span className="text-[11px] font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                ซูม {currentScale}%
              </span>
            </div>

            <p className="text-[11px] text-gray-500">
              * หากรูปที่คุณอัปโหลดมีขอบขาวว่างๆ ล้อมรอบตัวการ์ตูน สามารถเลื่อนแถบนี้เพื่อซูมให้ตัวการ์ตูนขยายเต็มกรอบแบบไม่มีขอบขาวได้
            </p>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="100"
                max="160"
                step="5"
                value={currentScale}
                onChange={(e) => setCustomScale(Number(e.target.value))}
                className="flex-1 h-2.5 bg-amber-100 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-600"
              />
              <div className="flex items-center gap-1">
                {[100, 115, 130, 145].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setCustomScale(pct)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border ${
                      currentScale === pct
                        ? "bg-amber-500 text-white border-amber-500"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-amber-50"
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Logo Image Upload Dropzone */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-orange-600" />
              อัปโหลดรูปภาพตราโรงเรียน/โลโก้ใหม่
            </span>
            <span className="text-[11px] text-gray-400 font-normal">
              รองรับ PNG (แนะนำพื้นหลังโปร่งใส), WebP, JPG, SVG
            </span>
          </label>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-orange-200 hover:border-orange-500 bg-orange-50/20 hover:bg-orange-50/40 rounded-2xl p-5 sm:p-6 flex flex-col items-center justify-center gap-2.5 cursor-pointer transition-all group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/webp,image/jpeg,image/svg+xml"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />

            <div className="w-12 h-12 rounded-2xl bg-white border border-orange-200 shadow-2xs flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
              {isOptimizing ? (
                <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className="w-5 h-5" />
              )}
            </div>

            <div className="text-center">
              <p className="text-xs sm:text-sm font-bold text-gray-800">
                {isOptimizing ? "กำลังประมวลผลรูปภาพ..." : "ลากรูปภาพมาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์"}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                ขนาดสูงสุด 10MB (ระบบปรับขนาดและบีบอัดให้อัตโนมัติ เพื่อความเร็วสูงสุด)
              </p>
            </div>
          </div>

          {/* Direct URL or Base64 Input */}
          <div className="pt-1">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={settings.logoUrl}
                onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                placeholder="หรือกรอก URL รูปภาพ เช่น /school-logo.png หรือ https://..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-xs font-mono text-gray-700"
              />
              <button
                type="button"
                onClick={() => setSettings({ ...settings, logoUrl: "/school-logo.png" })}
                className="px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
              >
                ใช้รูปดั้งเดิม
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: Logo Shape Selector */}
        <div className="space-y-1.5 pt-2 border-t border-gray-100">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            รูปทรงกรอบ (Logo Shape)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "rounded", label: "ขอบมน (Rounded)" },
              { id: "circle", label: "วงกลม (Circle)" },
              { id: "square", label: "จัตุรัสเดิม (Square)" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSettings({ ...settings, logoShape: opt.id as any })}
                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center ${
                  settings.logoShape === opt.id
                    ? "border-orange-500 bg-orange-50 text-orange-900 ring-2 ring-orange-500/20 font-bold"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section 4: Brand Text Settings */}
        <div className="space-y-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-orange-600" />
              ข้อความชื่อข้างโลโก้ (Brand Title & School Name)
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showText}
                onChange={(e) => setSettings({ ...settings, showText: e.target.checked })}
                className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500 cursor-pointer"
              />
              <span className="text-xs font-semibold text-gray-700">แสดงข้อความข้างโลโก้</span>
            </label>
          </div>

          {settings.showText && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-600">
                  คำนำหน้าชื่อ (สีแดง)
                </label>
                <input
                  type="text"
                  value={settings.brandNamePrefix}
                  onChange={(e) => setSettings({ ...settings, brandNamePrefix: e.target.value })}
                  placeholder="ART"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-xs font-bold text-red-600"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-600">
                  คำต่อท้ายชื่อ (สีดำ/ขาว)
                </label>
                <input
                  type="text"
                  value={settings.brandNameSuffix}
                  onChange={(e) => setSettings({ ...settings, brandNameSuffix: e.target.value })}
                  placeholder="ROOM"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-xs font-bold text-gray-800"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-600">
                  ชื่อโรงเรียนด้านล่าง
                </label>
                <input
                  type="text"
                  value={settings.schoolName}
                  onChange={(e) => setSettings({ ...settings, schoolName: e.target.value })}
                  placeholder="WACHIRATHAMMASATIT SCHOOL"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-xs font-medium text-gray-800"
                />
              </div>
            </div>
          )}

          {/* Alt text for SEO and Accessibility */}
          <div className="space-y-1 pt-1">
            <label className="block text-[11px] font-bold text-gray-600">
              คำอธิบายรูปภาพ (Alt Text สำหรับ SEO & การเข้าถึง)
            </label>
            <input
              type="text"
              value={settings.logoAlt}
              onChange={(e) => setSettings({ ...settings, logoAlt: e.target.value })}
              placeholder="ตราโรงเรียนวชิรธรรมสาธิต"
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-xs text-gray-700"
            />
          </div>
        </div>

        {/* Submit Actions Bar */}
        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-gray-400">
            * เมื่อกดบันทึก ขนาดโลโก้และการซูมภาพจะอัปเดตและแสดงผลทั่วทั้งเว็บไซต์ทันที
          </p>

          <button
            type="submit"
            disabled={isSaving || isLoading || isOptimizing}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

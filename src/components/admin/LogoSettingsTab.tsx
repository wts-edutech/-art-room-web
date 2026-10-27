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
  Eye, 
  Layers, 
  Maximize2, 
  Sparkles, 
  FileImage, 
  Trash2,
  ExternalLink,
  ShieldCheck,
  Check
} from "lucide-react";
import { LogoSettings, DEFAULT_LOGO_SETTINGS, useSiteLogo } from "@/context/LogoContext";
import { optimizeImageToDataUrl } from "@/lib/image-optimizer";

export default function LogoSettingsTab() {
  const { logoSettings: globalSettings, refreshLogoSettings } = useSiteLogo();
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
          logoSize: data.logoSize || "normal",
          updatedAt: data.updatedAt,
        });
      }
    } catch (err) {
      console.error("Failed to fetch logo settings:", err);
    } finally {
      setIsLoading(false);
    }
  };

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
      // For PNGs or SVGs, preserve transparency and clean edges
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
        quality: 0.90,
        mimeType: isPng ? "image/png" : "image/webp",
        autoTrimBorders: false,
      });

      setSettings((prev) => ({
        ...prev,
        logoUrl: optimized,
      }));
    } catch (err) {
      console.error("Image optimization error:", err);
      // Fallback to FileReader
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

        // Refresh global state & trigger event for real-time header/footer update
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

  // Helper classes for logo sizing
  const getLogoSizeClasses = (size: "compact" | "normal" | "large") => {
    switch (size) {
      case "compact":
        return "w-8 h-8 sm:w-9 sm:h-9";
      case "large":
        return "w-12 h-12 sm:w-14 sm:h-14";
      case "normal":
      default:
        return "w-9 h-9 sm:w-10 sm:h-10";
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
        return "rounded-xl";
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Alert Notification */}
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

      {/* Main Card: Realtime Live Preview */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200/60 text-orange-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                ตัวอย่างการแสดงผลจริง (Live Realtime Preview)
              </h3>
              <p className="text-xs text-gray-400">
                จำลองการแสดงผลรูปโลโก้และข้อความที่จะปรากฏบน Header และส่วนต่างๆ ของเว็บ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Background theme selector for preview */}
            <div className="inline-flex items-center p-1 bg-gray-100 rounded-xl text-xs font-medium text-gray-600">
              <button
                type="button"
                onClick={() => setPreviewTheme("light")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  previewTheme === "light" ? "bg-white text-gray-900 shadow-xs font-bold" : "hover:text-gray-900"
                }`}
              >
                สว่าง (White)
              </button>
              <button
                type="button"
                onClick={() => setPreviewTheme("gradient")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  previewTheme === "gradient" ? "bg-white text-gray-900 shadow-xs font-bold" : "hover:text-gray-900"
                }`}
              >
                ครีม (Warm Cream)
              </button>
              <button
                type="button"
                onClick={() => setPreviewTheme("dark")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  previewTheme === "dark" ? "bg-gray-800 text-white shadow-xs font-bold" : "hover:text-gray-900"
                }`}
              >
                มืด (Dark)
              </button>
            </div>

            <button
              type="button"
              onClick={handleResetToDefault}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
              title="คืนค่าเป็นตราโรงเรียนวชิรธรรมสาธิตแบบดั้งเดิม"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              คืนค่าเริ่มต้น
            </button>
          </div>
        </div>

        {/* Live Simulation Canvas */}
        <div
          className={`relative overflow-hidden rounded-2xl border transition-all duration-300 p-6 md:p-8 flex flex-col items-center justify-center min-h-[220px] ${
            previewTheme === "dark"
              ? "bg-gray-950 border-gray-800 text-white"
              : previewTheme === "gradient"
              ? "bg-[#FDF7F0] border-orange-200/50 text-gray-900"
              : "bg-white border-gray-200 text-gray-900"
          }`}
        >
          {/* Top Clock Bar simulation */}
          <div className="w-full max-w-2xl bg-gradient-to-r from-orange-500 to-pink-500 text-white text-[10px] font-medium px-4 py-1.5 rounded-t-xl flex items-center justify-between shadow-xs">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              ระบบออนไลน์ • โรงเรียนวชิรธรรมสาธิต
            </span>
            <span>Live Header Simulation</span>
          </div>

          {/* Header Bar simulation */}
          <div
            className={`w-full max-w-2xl border-x border-b rounded-b-xl px-5 py-3.5 flex items-center justify-between transition-all ${
              previewTheme === "dark"
                ? "bg-gray-900/90 border-gray-800 shadow-md"
                : "bg-white/95 border-gray-200 shadow-xs"
            }`}
          >
            {/* Logo and Brand Title Component */}
            <div className="flex items-center gap-2.5 sm:gap-3 group select-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={settings.logoUrl || "/school-logo.png"}
                alt={settings.logoAlt || "ตราโรงเรียน"}
                className={`${getLogoSizeClasses(settings.logoSize)} ${getLogoShapeClasses(
                  settings.logoShape
                )} object-contain shrink-0 transition-transform duration-200 group-hover:scale-105`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/school-logo.png";
                }}
              />

              {settings.showText && (
                <div className="flex flex-col justify-center min-w-0">
                  <span className="font-heading font-black text-[17px] md:text-[20px] tracking-tight leading-none">
                    <span className="text-red-600">{settings.brandNamePrefix || "ART"} </span>
                    <span className={previewTheme === "dark" ? "text-white" : "text-gray-900"}>
                      {settings.brandNameSuffix || "ROOM"}
                    </span>
                  </span>
                  <span
                    className={`text-[9px] md:text-[10px] font-bold tracking-wider uppercase truncate mt-0.5 ${
                      previewTheme === "dark" ? "text-gray-400" : "text-gray-400"
                    }`}
                  >
                    {settings.schoolName || "WACHIRATHAMMASATIT SCHOOL"}
                  </span>
                </div>
              )}
            </div>

            {/* Dummy nav menu items */}
            <div className="hidden sm:flex items-center gap-3 text-xs font-semibold text-gray-400">
              <span className="text-red-500 font-bold">หน้าแรก</span>
              <span>กิจกรรม</span>
              <span>ผลงาน</span>
              <span>สื่อการสอน</span>
            </div>
          </div>

          <p className="text-[11px] text-gray-400 mt-4 text-center">
            [ ตัวอย่างการแสดงผลสัดส่วนจริงบนแถบนำทาง (Navbar) — สามารถเปลี่ยนรูปโลโก้และข้อความประกอบได้อิสระ ]
          </p>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-2xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
            <Sliders className="w-4 h-4 text-orange-600" />
            ตั้งค่าและอัปโหลดรูปภาพโลโก้
          </h3>
          {settings.updatedAt && (
            <span className="text-[11px] text-gray-400">
              อัปเดตล่าสุด: {new Date(settings.updatedAt).toLocaleString("th-TH")}
            </span>
          )}
        </div>

        {/* Section 1: Logo Image Upload Dropzone */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-orange-600" />
              อัปโหลดรูปโลโก้ใหม่ (Logo Image)
            </span>
            <span className="text-[11px] text-gray-400 font-normal">
              รองรับ PNG (แนะนำพื้นโปร่งใส), WebP, JPG, SVG
            </span>
          </label>

          {/* Upload Drop Area */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-200 hover:border-orange-500 bg-orange-50/20 hover:bg-orange-50/40 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all group"
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

            <div className="w-14 h-14 rounded-2xl bg-white border border-orange-200/80 shadow-xs flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
              {isOptimizing ? (
                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className="w-6 h-6" />
              )}
            </div>

            <div className="text-center">
              <p className="text-sm font-bold text-gray-800">
                {isOptimizing ? "กำลังประมวลผลและลดขนาดภาพ..." : "ลากรูปภาพมาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                แนะนำขนาด 400x400 ถึง 800x800 พิกเซล รูปแบบไฟล์ PNG แบบโปร่งใส (Transparent)
              </p>
            </div>
          </div>

          {/* Or Paste URL */}
          <div className="pt-2">
            <label className="block text-[11px] font-bold text-gray-500 mb-1">
              หรือระบุ URL รูปภาพโลโก้โดยตรง:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={settings.logoUrl}
                onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                placeholder="/school-logo.png หรือ https://example.com/logo.png"
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-xs font-mono text-gray-800"
              />
              <button
                type="button"
                onClick={handleResetToDefault}
                className="px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer shrink-0"
              >
                ใช้ตราเดิม
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Logo Style & Dimensions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3 border-t border-gray-100">
          {/* Logo Size */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-orange-600" />
              ขนาดรูปโลโก้ (Logo Size)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "compact", label: "กะทัดรัด (36px)" },
                { id: "normal", label: "มาตรฐาน (40px)" },
                { id: "large", label: "เด่นชัด (52px)" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSettings({ ...settings, logoSize: opt.id as any })}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    settings.logoSize === opt.id
                      ? "border-orange-500 bg-orange-50 text-orange-900 ring-2 ring-orange-500/20"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Logo Shape */}
          <div className="space-y-1.5">
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
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    settings.logoShape === opt.id
                      ? "border-orange-500 bg-orange-50 text-orange-900 ring-2 ring-orange-500/20"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Brand Text Settings */}
        <div className="space-y-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-orange-600" />
              ข้อความชื่อเว็บข้างโลโก้ (Brand Title & School Name)
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-600">
                  คำนำหน้าชื่อ (สีแดง)
                </label>
                <input
                  type="text"
                  value={settings.brandNamePrefix}
                  onChange={(e) => setSettings({ ...settings, brandNamePrefix: e.target.value })}
                  placeholder="ART"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm font-bold text-red-600"
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
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm font-bold text-gray-800"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-600">
                  ชื่อโรงเรียนด้านล่าง (ตัวพิมพ์ใหญ่)
                </label>
                <input
                  type="text"
                  value={settings.schoolName}
                  onChange={(e) => setSettings({ ...settings, schoolName: e.target.value })}
                  placeholder="WACHIRATHAMMASATIT SCHOOL"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm font-medium text-gray-800"
                />
              </div>
            </div>
          )}

          {/* Alt text for SEO and Accessibility */}
          <div className="space-y-1 pt-1">
            <label className="block text-[11px] font-bold text-gray-600">
              คำอธิบายรูปภาพ (Alt Text สำหรับ SEO & Accessibility)
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
        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            * เมื่อบันทึกแล้ว ระบบจะอัปเดตโลโก้บนแถบนำทาง (Navbar) และส่วนต่างๆ ของเว็บไซต์ทันที
          </p>

          <button
            type="submit"
            disabled={isSaving || isLoading || isOptimizing}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

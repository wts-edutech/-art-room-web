"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Upload, 
  RotateCcw, 
  Save, 
  CheckCircle2, 
  Sliders, 
  ChevronUp, 
  Image as ImageIcon 
} from "lucide-react";
import { useSiteMascot, DEFAULT_MASCOT_SETTINGS, MascotSettings } from "@/context/MascotContext";
import { optimizeImageToDataUrl } from "@/lib/image-optimizer";
import { swalAlert, swalSuccess, swalError } from "@/lib/swal";

export default function MascotSettingsSection() {
  const { mascotSettings, refreshMascotSettings, resolvedMascotSrc } = useSiteMascot();
  const [settings, setSettings] = useState<MascotSettings>(DEFAULT_MASCOT_SETTINGS);
  const [previewSrc, setPreviewSrc] = useState<string>(resolvedMascotSrc);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mascotSettings) {
      setSettings(mascotSettings);
      setPreviewSrc(resolvedMascotSrc);
    }
  }, [mascotSettings, resolvedMascotSrc]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      swalAlert("กรุณาเลือกไฟล์ภาพ PNG, WebP, JPG หรือ SVG (แนะนำภาพพื้นหลังโปร่งใส PNG)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      swalAlert("ขนาดไฟล์ใหญ่เกิน 10MB กรุณาเลือกไฟล์ที่มีขนาดเล็กลง");
      return;
    }

    setIsOptimizing(true);
    try {
      const isPng = file.type === "image/png" || file.name.toLowerCase().endsWith(".png");
      const isSvg = file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");

      if (isSvg) {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          setSettings((prev) => ({ ...prev, mascotUrl: dataUrl }));
          setPreviewSrc(dataUrl);
          setIsOptimizing(false);
        };
        reader.readAsDataURL(file);
        return;
      }

      const dataUrl = await optimizeImageToDataUrl(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.9,
        outputType: isPng ? "image/png" : "image/webp",
      });
      setSettings((prev) => ({ ...prev, mascotUrl: dataUrl }));
      setPreviewSrc(dataUrl);
    } catch (err) {
      console.error("Failed to optimize mascot image:", err);
      swalError("ประมวลผลรูปภาพไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleResetDefault = () => {
    setSettings(DEFAULT_MASCOT_SETTINGS);
    setPreviewSrc(DEFAULT_MASCOT_SETTINGS.mascotUrl);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings/mascot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mascotUrl: settings.mascotUrl,
          mascotAlt: settings.mascotAlt || "Art Room Mascot",
          tooltipText: settings.tooltipText || "ขึ้นด้านบน",
          showTooltip: settings.showTooltip,
          size: settings.size || 64,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "บันทึกข้อมูลไม่สำเร็จ");

      await refreshMascotSettings();
      swalSuccess("บันทึกสำเร็จ!", "อัปเดตตัวการ์ตูนปุ่มเลื่อนขึ้นด้านบนเรียบร้อยแล้ว");
    } catch (err: any) {
      console.error(err);
      swalError("บันทึกไม่สำเร็จ", err?.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-kanit text-gray-900">
              ตัวการ์ตูนปุ่มเลื่อนขึ้นด้านบน (Mascot Back to Top)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              เปลี่ยนรูปตัวการ์ตูนมาสคอตที่มุมขวาล่างของเว็บ พร้อมปรับขนาดและข้อความ Tooltip
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefault}
            className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>คืนค่าเริ่มต้น</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-sm shadow-orange-500/25 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Settings Form */}
        <div className="lg:col-span-7 space-y-5">
          {/* Upload File Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              อัปโหลดรูปตัวการ์ตูนใหม่ (แนะนำไฟล์ PNG พื้นหลังโปร่งใส)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/webp,image/jpeg,image/svg+xml"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              disabled={isOptimizing}
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border-2 border-dashed border-orange-200 hover:border-orange-400 bg-orange-50/40 hover:bg-orange-50/80 text-orange-700 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{isOptimizing ? "กำลังย่อและปรับแต่งรูปภาพ..." : "คลิกเพื่อเลือกรูปตัวการ์ตูนใหม่จากเครื่อง"}</span>
            </button>
            <p className="text-[11px] text-gray-400 mt-1.5">
              รองรับไฟล์ PNG (ไดคัทโปร่งใส), WebP หรือ JPG (ระบบจะจัดเก็บไฟล์ขึ้น Cloudflare R2 โดยอัตโนมัติ)
            </p>
          </div>

          {/* Size Slider */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-orange-500" />
                <span>ขนาดตัวการ์ตูน (Width)</span>
              </label>
              <span className="text-xs font-mono font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-200">
                {settings.size || 64} px
              </span>
            </div>
            <input
              type="range"
              min={40}
              max={110}
              step={2}
              value={settings.size || 64}
              onChange={(e) => setSettings({ ...settings, size: Number(e.target.value) })}
              className="w-full accent-orange-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>กะทัดรัด (40px)</span>
              <span>ปกติ (64px)</span>
              <span>ใหญ่สะดุดตา (110px)</span>
            </div>
          </div>

          {/* Tooltip Setting */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700">
                แสดงข้อความแนะนำเมื่อนำเมาส์ไปชี้ (Tooltip)
              </label>
              <input
                type="checkbox"
                checked={settings.showTooltip}
                onChange={(e) => setSettings({ ...settings, showTooltip: e.target.checked })}
                className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
              />
            </div>

            {settings.showTooltip && (
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  ข้อความในป้าย Tooltip
                </label>
                <input
                  type="text"
                  value={settings.tooltipText}
                  onChange={(e) => setSettings({ ...settings, tooltipText: e.target.value })}
                  placeholder="เช่น ขึ้นด้านบน, เลื่อนขึ้นสุด"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right: Live Interactive Preview */}
        <div className="lg:col-span-5 bg-gradient-to-br from-gray-50 to-orange-50/30 rounded-3xl p-6 border border-gray-200/80 flex flex-col items-center justify-center min-h-[280px] relative overflow-hidden">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 absolute top-4 left-4 flex items-center gap-1">
            <ImageIcon className="w-3 h-3" /> ตัวอย่างแสดงผลจริง (Preview)
          </span>

          <div className="flex flex-col items-center justify-center relative mt-4">
            {/* Tooltip Preview */}
            {settings.showTooltip && (
              <div className="mb-2 px-2.5 py-0.5 rounded-full bg-gray-900/90 text-white text-[11px] font-bold font-kanit shadow-md flex items-center gap-1 animate-pulse">
                <ChevronUp className="w-3 h-3 text-orange-400" />
                <span>{settings.tooltipText || "ขึ้นด้านบน"}</span>
              </div>
            )}

            {/* Mascot Button Preview */}
            <div 
              className="relative transition-all duration-300 drop-shadow-[0_8px_16px_rgba(0,0,0,0.25)] hover:scale-105 group cursor-pointer"
              style={{
                width: `${settings.size || 64}px`,
                height: `${Math.round((settings.size || 64) * 1.25)}px`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewSrc}
                alt="Mascot Preview"
                className="w-full h-full object-contain filter select-none"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center shadow-md border-2 border-white">
                <ChevronUp className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </div>
          </div>

          <p className="text-[11px] text-gray-400 mt-5 text-center font-light">
            ปุ่มนี้จะลอยอยู่มุมขวาล่างของหน้าเว็บทุกหน้า (จะปรากฏขึ้นอัตโนมัติเมื่อผู้ใช้เลื่อนหน้าจอลงมาเกิน 300px)
          </p>
        </div>
      </div>
    </div>
  );
}


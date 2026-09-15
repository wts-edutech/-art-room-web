"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  X, RotateCw, FlipHorizontal, ZoomIn, ZoomOut, 
  Check, Sparkles, Sliders, RefreshCw, SunMedium, Contrast,
  Palette, Crop, Layers
} from "lucide-react";

export interface ImageEditorModalProps {
  isOpen: boolean;
  file: File | null;
  onClose: () => void;
  onSave: (editedFile: File) => void;
  title?: string;
  defaultAspectRatio?: "16:9" | "4:3" | "1:1" | "original";
}

type FilterPreset = "normal" | "vivid" | "warm" | "pop" | "bw" | "vintage";

export default function ImageEditorModal({
  isOpen,
  file,
  onClose,
  onSave,
  title = "ปรับแต่งรูปภาพ",
  defaultAspectRatio = "16:9",
}: ImageEditorModalProps) {
  const [rotation, setRotation] = useState<number>(0);
  const [isFlippedH, setIsFlippedH] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1);
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "4:3" | "1:1" | "original">(defaultAspectRatio);
  const [activeTab, setActiveTab] = useState<"crop" | "adjust" | "filter">("crop");

  // Adjustments
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [activeFilter, setActiveFilter] = useState<FilterPreset>("normal");

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);

  // Load image when file changes
  useEffect(() => {
    if (!file) {
      setImageSrc(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setImageSrc(objectUrl);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = objectUrl;
    img.onload = () => {
      imageObjRef.current = img;
      resetEdits();
    };

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const resetEdits = () => {
    setRotation(0);
    setIsFlippedH(false);
    setZoom(1);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setActiveFilter("normal");
    setAspectRatio(defaultAspectRatio);
  };

  const handleApplyFilter = (preset: FilterPreset) => {
    setActiveFilter(preset);
    switch (preset) {
      case "normal":
        setBrightness(100);
        setContrast(100);
        setSaturation(100);
        break;
      case "vivid":
        setBrightness(105);
        setContrast(115);
        setSaturation(135);
        break;
      case "warm":
        setBrightness(104);
        setContrast(105);
        setSaturation(115);
        break;
      case "pop":
        setBrightness(110);
        setContrast(125);
        setSaturation(120);
        break;
      case "bw":
        setBrightness(105);
        setContrast(125);
        setSaturation(0);
        break;
      case "vintage":
        setBrightness(108);
        setContrast(95);
        setSaturation(80);
        break;
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleFlip = () => {
    setIsFlippedH((prev) => !prev);
  };

  // Build filter string
  const getFilterString = () => {
    let filterStr = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    if (activeFilter === "vintage") {
      filterStr += " sepia(35%)";
    }
    return filterStr;
  };

  // Export edited image via Canvas
  const handleSave = async () => {
    if (!file || !imageObjRef.current) return;
    setIsProcessing(true);

    try {
      const img = imageObjRef.current;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Cannot get canvas context");
      }

      const isRotated90or270 = rotation === 90 || rotation === 270;
      const srcWidth = isRotated90or270 ? img.height : img.width;
      const srcHeight = isRotated90or270 ? img.width : img.height;

      // Determine output canvas size according to aspect ratio
      let targetRatio = srcWidth / srcHeight;
      if (aspectRatio === "16:9") targetRatio = 16 / 9;
      if (aspectRatio === "4:3") targetRatio = 4 / 3;
      if (aspectRatio === "1:1") targetRatio = 1 / 1;

      // Maximum bounded output dimension (max 1600px for web performance)
      const maxDim = 1600;
      let outWidth = Math.min(srcWidth, maxDim);
      let outHeight = Math.round(outWidth / targetRatio);

      if (outHeight > maxDim) {
        outHeight = maxDim;
        outWidth = Math.round(outHeight * targetRatio);
      }

      canvas.width = Math.max(outWidth, 200);
      canvas.height = Math.max(outHeight, 200);

      // Fill clean background (white)
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Enable high-quality smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Apply CSS-like filters
      ctx.filter = getFilterString();

      // Transform coordinate system to center
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);

      // Rotate
      ctx.rotate((rotation * Math.PI) / 180);

      // Flip horizontal
      if (isFlippedH) {
        ctx.scale(-1, 1);
      }

      // Zoom
      ctx.scale(zoom, zoom);

      // Calculate drawing dimensions (Cover to fill target aspect ratio)
      const drawRatio = img.width / img.height;
      const canvasRatio = isRotated90or270 
        ? canvas.height / canvas.width 
        : canvas.width / canvas.height;

      let drawW: number;
      let drawH: number;

      if (drawRatio > canvasRatio) {
        drawH = isRotated90or270 ? canvas.width : canvas.height;
        drawW = drawH * drawRatio;
      } else {
        drawW = isRotated90or270 ? canvas.height : canvas.width;
        drawH = drawW / drawRatio;
      }

      // Draw centered
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setIsProcessing(false);
            return;
          }

          // Use original filename or .jpg extension
          const originalName = file.name.replace(/\.[^/.]+$/, "");
          const editedFile = new File([blob], `${originalName}-edited.jpg`, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });

          setIsProcessing(false);
          onSave(editedFile);
          onClose();
        },
        "image/jpeg",
        0.92
      );
    } catch (err) {
      console.error("Error exporting edited image:", err);
      setIsProcessing(false);
    }
  };

  if (!isOpen || !file || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                {title}
              </h2>
              <p className="text-xs text-gray-500 font-light truncate max-w-xs sm:max-w-md">
                {file.name} • {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetEdits}
              className="px-3 py-1.5 rounded-xl border border-gray-200 hover:border-orange-300 text-xs font-semibold text-gray-600 hover:text-orange-600 flex items-center gap-1.5 transition-colors"
              title="รีเซ็ตค่าเริ่มต้น"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">รีเซ็ต</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-colors"
              title="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Work Area */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-gray-950">
          {/* Canvas / Preview Container */}
          <div className="flex-1 relative flex items-center justify-center p-4 sm:p-6 overflow-hidden min-h-[260px] sm:min-h-[380px] bg-radial from-gray-900 to-gray-950 select-none">
            {/* Visual Aspect Ratio Container */}
            <div 
              className={`relative overflow-hidden rounded-2xl shadow-2xl transition-all duration-200 flex items-center justify-center bg-gray-900 border border-white/10 ${
                aspectRatio === "16:9" 
                  ? "w-full max-w-[620px] aspect-video" 
                  : aspectRatio === "4:3"
                  ? "w-full max-w-[500px] aspect-4/3"
                  : aspectRatio === "1:1"
                  ? "w-full max-w-[420px] aspect-square"
                  : "w-full max-w-[620px] max-h-[380px]"
              }`}
            >
              {/* Blurred Ambient Background */}
              <div 
                className="absolute inset-0 scale-125 blur-2xl opacity-40 pointer-events-none"
                style={{
                  backgroundImage: `url(${imageSrc})`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                  filter: getFilterString(),
                }}
              />

              {/* Foreground Transformed Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageSrc}
                alt="Preview"
                className="relative max-w-full max-h-full object-cover transition-transform duration-100 will-change-transform shadow-lg"
                style={{
                  transform: `rotate(${rotation}deg) scaleX(${isFlippedH ? -1 : 1}) scale(${zoom})`,
                  filter: getFilterString(),
                }}
              />

              {/* Grid Overlay Guide */}
              <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-20 border border-white/40">
                <div className="border-r border-b border-white/40" />
                <div className="border-r border-b border-white/40" />
                <div className="border-b border-white/40" />
                <div className="border-r border-b border-white/40" />
                <div className="border-r border-b border-white/40" />
                <div className="border-b border-white/40" />
                <div className="border-r border-white/40" />
                <div className="border-r border-white/40" />
                <div />
              </div>

              {/* Ratio Badge */}
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white/90 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-white/10">
                สัดส่วน: {aspectRatio}
              </div>

              {/* Rotation / Flip Badges */}
              {(rotation !== 0 || isFlippedH || zoom > 1) && (
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                  {rotation !== 0 && (
                    <span className="bg-orange-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      หมุน {rotation}°
                    </span>
                  )}
                  {isFlippedH && (
                    <span className="bg-orange-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      พลิกกลับด้าน
                    </span>
                  )}
                  {zoom > 1 && (
                    <span className="bg-orange-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      ซูม {Math.round(zoom * 100)}%
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right/Bottom Control Panel */}
          <div className="w-full md:w-80 bg-white border-t md:border-t-0 md:border-l border-gray-100 flex flex-col justify-between">
            {/* Control Tabs */}
            <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-5">
              {/* Tab Navigation */}
              <div className="flex p-1 bg-gray-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab("crop")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === "crop"
                      ? "bg-white text-orange-600 shadow-xs"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <Crop className="w-3.5 h-3.5" />
                  <span>ครอบตัด & หมุน</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("adjust")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === "adjust"
                      ? "bg-white text-orange-600 shadow-xs"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>ปรับแสงสี</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("filter")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === "filter"
                      ? "bg-white text-orange-600 shadow-xs"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>ฟิลเตอร์</span>
                </button>
              </div>

              {/* TAB 1: CROP & ROTATE */}
              {activeTab === "crop" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Aspect Ratio Buttons */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">
                      สัดส่วนกรอบภาพ
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(["16:9", "4:3", "1:1", "original"] as const).map((ratio) => (
                        <button
                          key={ratio}
                          type="button"
                          onClick={() => setAspectRatio(ratio)}
                          className={`py-2 px-1 text-xs font-semibold rounded-xl border text-center transition-all ${
                            aspectRatio === ratio
                              ? "bg-orange-50 border-orange-500 text-orange-700 ring-2 ring-orange-500/10"
                              : "border-gray-200 text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          {ratio === "original" ? "ดั้งเดิม" : ratio}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Transform Buttons (Rotate & Flip) */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">
                      การหมุน & พลิกภาพ
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={handleRotate}
                        className="p-2.5 rounded-xl border border-gray-200 hover:border-orange-400 hover:bg-orange-50/50 text-gray-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                      >
                        <RotateCw className="w-4 h-4 text-orange-500" />
                        <span>หมุนขวา 90°</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleFlip}
                        className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                          isFlippedH
                            ? "border-orange-500 bg-orange-50 text-orange-700"
                            : "border-gray-200 hover:border-orange-400 hover:bg-orange-50/50 text-gray-700"
                        }`}
                      >
                        <FlipHorizontal className="w-4 h-4 text-orange-500" />
                        <span>พลิกแนวนอน</span>
                      </button>
                    </div>
                  </div>

                  {/* Zoom Slider */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-2">
                      <span>ซูมขยายภาพ</span>
                      <span className="text-orange-600 font-semibold">{Math.round(zoom * 100)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setZoom((prev) => Math.max(1, +(prev - 0.1).toFixed(1)))}
                        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900"
                        title="ซูมออก"
                      >
                        <ZoomOut className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="range"
                        min="1"
                        max="2.5"
                        step="0.05"
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="flex-1 accent-orange-500 cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => setZoom((prev) => Math.min(2.5, +(prev + 0.1).toFixed(1)))}
                        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900"
                        title="ซูมเข้า"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ADJUSTMENTS */}
              {activeTab === "adjust" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Brightness */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <SunMedium className="w-3.5 h-3.5 text-amber-500" />
                        ความสว่าง (Brightness)
                      </span>
                      <span className="text-gray-500">{brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="140"
                      value={brightness}
                      onChange={(e) => setBrightness(parseInt(e.target.value))}
                      className="w-full accent-orange-500 cursor-pointer"
                    />
                  </div>

                  {/* Contrast */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <Contrast className="w-3.5 h-3.5 text-blue-500" />
                        ความต่างระดับสี (Contrast)
                      </span>
                      <span className="text-gray-500">{contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="140"
                      value={contrast}
                      onChange={(e) => setContrast(parseInt(e.target.value))}
                      className="w-full accent-orange-500 cursor-pointer"
                    />
                  </div>

                  {/* Saturation */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5 text-rose-500" />
                        ความอิ่มตัวสี (Saturation)
                      </span>
                      <span className="text-gray-500">{saturation}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="180"
                      value={saturation}
                      onChange={(e) => setSaturation(parseInt(e.target.value))}
                      className="w-full accent-orange-500 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: FILTER PRESETS */}
              {activeTab === "filter" && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    โทนสีสำเร็จรูป (Color Presets)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "normal", name: "ปกติ", desc: "ภาพดั้งเดิม" },
                      { id: "vivid", name: "สดใส (Vivid)", desc: "สีเด่น คมชัด" },
                      { id: "warm", name: "อบอุ่น (Warm)", desc: "โทนสีอุ่นทอง" },
                      { id: "pop", name: "ป๊อปอาร์ต (Pop)", desc: "สีสันสดจัดจ้าน" },
                      { id: "bw", name: "ขาวดำ (B&W)", desc: "ขาวดำคลาสสิก" },
                      { id: "vintage", name: "วินเทจ (Vintage)", desc: "กลิ่นอายย้อนยุค" },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => handleApplyFilter(f.id as FilterPreset)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          activeFilter === f.id
                            ? "border-orange-500 bg-orange-50/70 ring-2 ring-orange-500/10"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <p className={`text-xs font-bold ${
                          activeFilter === f.id ? "text-orange-900" : "text-gray-800"
                        }`}>
                          {f.name}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{f.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Action Buttons */}
            <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50/70 space-y-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleSave}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-md hover:shadow-lg shadow-orange-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>กำลังบันทึกภาพ...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>บันทึกการแก้ไขรูปภาพ</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 text-center text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

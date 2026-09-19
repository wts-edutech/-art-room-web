"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { 
  ArrowLeft, Image as ImageIcon, FileText, Upload, Plus, X, 
  CheckCircle, AlertCircle, Sparkles, Video, Palette, ListOrdered, 
  ChevronDown, Check, RotateCw, Sliders, RefreshCw, Trash2, Eye, 
  Maximize2, Crop
} from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ImageEditorModal from "@/components/common/ImageEditorModal";

const MAX_COVER_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

interface CategoryOption {
  value: string;
  label: string;
  subtitle: string;
  emoji: string;
  tag?: string;
  tagColor?: string;
  iconBg: string;
}

const CATEGORY_OPTIONS: CategoryOption[] = [
  {
    value: "ทั่วไป",
    label: "ทั่วไป",
    subtitle: "เรื่องราวทั่วไป ข้อคิดเห็น และเนื้อหาศิลปะทั่วไป",
    emoji: "💡",
    iconBg: "bg-amber-100 text-amber-700",
  },
  {
    value: "วิธีทำ",
    label: "วิธีทำ DIY / ขั้นตอนการสร้างสรรค์",
    subtitle: "งานประดิษฐ์ สาธิตวิธีทำทีละขั้นตอน และเทคนิคศิลปะ",
    emoji: "🎨",
    tag: "ยอดนิยม",
    tagColor: "bg-rose-100 text-rose-700 border-rose-200",
    iconBg: "bg-rose-100 text-rose-700",
  },
  {
    value: "วีดีโอ",
    label: "วิดีทัศน์ / คลิปผลงาน",
    subtitle: "คลิปวิดีโอสาธิต ไทม์แลปส์ผลงาน หรือคลิปรีวิว",
    emoji: "🎥",
    tag: "วิดีโอ HD",
    tagColor: "bg-purple-100 text-purple-700 border-purple-200",
    iconBg: "bg-purple-100 text-purple-700",
  },
  {
    value: "โปรเจกต์",
    label: "โปรเจกต์สร้างสรรค์นักเรียน",
    subtitle: "ผลงานชิ้นเอก โครงงานศิลปะ และนิทรรศการสร้างสรรค์",
    emoji: "✨",
    tag: "แนะนำ",
    tagColor: "bg-amber-100 text-amber-800 border-amber-200",
    iconBg: "bg-amber-100 text-amber-700",
  },
  {
    value: "ใบงาน",
    label: "ใบงานและแบบฝึกหัด",
    subtitle: "เอกสารสำหรับดาวน์โหลด พิมพ์แจก และแบบฝึกปฏิบัติต่างๆ",
    emoji: "📄",
    iconBg: "bg-blue-100 text-blue-700",
  },
  {
    value: "รูปภาพ",
    label: "รูปภาพและผลงาน",
    subtitle: "ภาพวาด ลายเส้น งานจิตรกรรม และแกลเลอรีภาพถ่าย",
    emoji: "🖼️",
    iconBg: "bg-emerald-100 text-emerald-700",
  },
  {
    value: "กิจกรรม",
    label: "กิจกรรมสร้างสรรค์",
    subtitle: "กิจกรรมกลุ่ม เวิร์กช็อป และการทดลองในห้องเรียน",
    emoji: "🎭",
    iconBg: "bg-fuchsia-100 text-fuchsia-700",
  },
  {
    value: "สื่อการสอน",
    label: "สื่อและบทเรียน",
    subtitle: "สไลด์การสอน สื่อประกอบบทเรียน และคู่มือการเรียนรู้",
    emoji: "📚",
    iconBg: "bg-indigo-100 text-indigo-700",
  },
  {
    value: "เกมส์",
    label: "เกมและการเรียนรู้",
    subtitle: "เกมศิลปะ ควิซทายภาพ และกิจกรรมเชิงโต้ตอบแสนสนุก",
    emoji: "🎮",
    iconBg: "bg-orange-100 text-orange-700",
  },
];

export default function NewIdeaPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [materialsInput, setMaterialsInput] = useState("");
  const [stepsInput, setStepsInput] = useState("");
  const [category, setCategory] = useState("ทั่วไป");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const [coverFitMode, setCoverFitMode] = useState<"cover" | "contain">("contain");
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [editingTarget, setEditingTarget] = useState<"cover" | { type: "attachment"; index: number } | null>(null);
  const [isQuickRotating, setIsQuickRotating] = useState<boolean>(false);
  const [isAiEnhancing, setIsAiEnhancing] = useState<boolean>(false);
  const [attachmentPreviews, setAttachmentPreviews] = useState<Record<number, string>>({});

  const [files, setFiles] = useState<File[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [instantApprove, setInstantApprove] = useState(true);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [authorName, setAuthorName] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("artroom_author_name");
    const role = localStorage.getItem("artroom_role");
    
    if (!name) {
      router.push("/ideas");
      return;
    }
    
    setAuthorName(name);
    setIsAdmin(role === "admin");
  }, [router]);

  useEffect(() => {
    if (coverImage) {
      const objectUrl = URL.createObjectURL(coverImage);
      setCoverPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setCoverPreviewUrl(null);
    }
  }, [coverImage]);

  // Handle attachment image previews
  useEffect(() => {
    const newPreviews: Record<number, string> = {};
    files.forEach((file, index) => {
      if (file.type.startsWith("image/")) {
        newPreviews[index] = URL.createObjectURL(file);
      }
    });
    setAttachmentPreviews(newPreviews);
    return () => {
      Object.values(newPreviews).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const currentOption = CATEGORY_OPTIONS.find((c) => c.value === category) || CATEGORY_OPTIONS[0];

  // 1-Click AI Auto Enhance for Cover Image
  const handleAiAutoEnhanceCover = async () => {
    if (!coverImage || isAiEnhancing || isQuickRotating) return;
    setIsAiEnhancing(true);
    try {
      const url = URL.createObjectURL(coverImage);
      const img = new Image();
      img.src = url;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.filter = "contrast(115%) saturate(118%) brightness(103%)";
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const originalName = coverImage.name.replace(/\.[^/.]+$/, "");
              const enhancedFile = new File([blob], `${originalName}-ai-enhanced.jpg`, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              setCoverImage(enhancedFile);
            }
            setIsAiEnhancing(false);
          },
          "image/jpeg",
          0.92
        );
      } else {
        setIsAiEnhancing(false);
      }
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("AI enhance failed:", err);
      setIsAiEnhancing(false);
    }
  };

  // Quick 1-click rotate cover image 90 degrees
  const handleQuickRotateCover = async () => {
    if (!coverImage || isQuickRotating || isAiEnhancing) return;
    setIsQuickRotating(true);
    try {
      const url = URL.createObjectURL(coverImage);
      const img = new Image();
      img.src = url;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.height;
      canvas.height = img.width;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((90 * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const originalName = coverImage.name.replace(/\.[^/.]+$/, "");
              const rotatedFile = new File([blob], `${originalName}.jpg`, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              setCoverImage(rotatedFile);
            }
            setIsQuickRotating(false);
          },
          "image/jpeg",
          0.92
        );
      } else {
        setIsQuickRotating(false);
      }
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Quick rotate failed:", err);
      setIsQuickRotating(false);
    }
  };

  // Save changes from ImageEditorModal
  const handleEditorSave = (editedFile: File) => {
    if (editingTarget === "cover") {
      setCoverImage(editedFile);
    } else if (editingTarget && editingTarget.type === "attachment") {
      const updated = [...files];
      updated[editingTarget.index] = editedFile;
      setFiles(updated);
    }
    setIsEditorOpen(false);
    setEditingTarget(null);
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg("");
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_COVER_SIZE) {
        setErrorMsg("รูปภาพหน้าปกต้องมีขนาดไม่เกิน 10 MB");
        return;
      }
      setCoverImage(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg("");
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (files.length + selectedFiles.length > 5) {
        setErrorMsg("อัปโหลดไฟล์แนบได้สูงสุดไม่เกิน 5 ไฟล์");
        return;
      }
      const oversized = selectedFiles.find(f => f.size > MAX_FILE_SIZE);
      if (oversized) {
        setErrorMsg(`ไฟล์ "${oversized.name}" มีขนาดเกิน 10 MB กรุณาเลือกไฟล์ที่เล็กลง`);
        return;
      }
      setFiles([...files, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    
    if (!title.trim() || !description.trim() || !coverImage) {
      setErrorMsg("กรุณากรอกหัวข้อ รายละเอียด และอัปโหลดรูปภาพหน้าปกให้ครบถ้วน");
      return;
    }

    setIsSubmitting(true);
    
    let finalDescription = description.trim();
    if (materialsInput.trim()) {
      const matList = materialsInput.split('\n').map(m => m.trim()).filter(Boolean);
      if (matList.length > 0) {
        finalDescription += `\n\n### 🎨 อุปกรณ์ที่ต้องเตรียม (Materials)\n` + matList.map(m => `• ${m}`).join('\n');
      }
    }
    if (stepsInput.trim()) {
      const stepList = stepsInput.split('\n').map(s => s.trim()).filter(Boolean);
      if (stepList.length > 0) {
        finalDescription += `\n\n### 📝 ขั้นตอนวิธีทำ (Step-by-Step)\n` + stepList.map((s, idx) => `${idx + 1}. ${s}`).join('\n');
      }
    }

    const finalLink = videoUrl.trim() || link.trim();

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", finalDescription);
    formData.append("category", category);
    if (finalLink) formData.append("link", finalLink);
    formData.append("authorName", authorName);
    formData.append("authorEmail", localStorage.getItem("artroom_author_email") || "");
    formData.append("coverImage", coverImage);

    if (isAdmin && instantApprove) {
      formData.append("status", "approved");
    }
    
    files.forEach(file => {
      formData.append("files", file);
    });

    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setSuccessMsg("แบ่งปันไอเดียสำเร็จแล้ว! ไอเดียของคุณจะขึ้นแสดงในแชร์ไอเดียทันที");
        setTimeout(() => {
          router.push("/ideas");
        }, 1500);
      } else {
        const data = (await res.json().catch(() => ({}))) as any;
        setErrorMsg(data.error || "เกิดข้อผิดพลาดในการส่งข้อมูล");
        setIsSubmitting(false);
      }
    } catch (error) {
      setErrorMsg("เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <ProtectedRoute>
        <main className="flex-1 flex flex-col pt-32 pb-24 min-h-screen bg-[#FCFBF8]">
          <div className="container mx-auto px-4 max-w-3xl">
            <Link 
              href="/ideas" 
              className="inline-flex items-center text-gray-500 hover:text-orange-600 font-medium mb-6 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> 
              กลับไปหน้าห้องสมุดไอเดีย
            </Link>

            <div className="bg-white rounded-3xl p-6 sm:p-10 md:p-12 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between pb-6 mb-8 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                      แบ่งปันไอเดียใหม่
                    </h1>
                    <p className="text-sm text-gray-500">โดย: <span className="font-semibold text-orange-600">{authorName}</span></p>
                  </div>
                </div>
              </div>
              
              {errorMsg && (
                <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
                  <span>{errorMsg}</span>
                </div>
              )}
            
              {successMsg && (
                <div className="mb-6 p-4 rounded-2xl bg-green-50 border border-green-200 text-green-800 text-sm font-medium flex items-center gap-2 animate-in fade-in">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    ชื่อไอเดีย / หัวข้อ <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="เช่น ใบงานระบายสีวงล้อสี, สื่อการสอนแม่สีและสีคู่ตรงข้าม"
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all text-gray-800"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-gray-800">
                      หมวดหมู่สื่อ / กิจกรรม <span className="text-red-500">*</span>
                    </label>
                    <span className="text-xs text-orange-600 font-medium hidden sm:flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      เลือกประเภทผลงานที่ตรงใจ
                    </span>
                  </div>

                  {/* Custom Creative Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      id="category-dropdown-trigger"
                      onClick={() => setIsDropdownOpen((prev) => !prev)}
                      aria-haspopup="listbox"
                      aria-expanded={isDropdownOpen}
                      className={`w-full min-h-[58px] px-4 py-2.5 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all duration-200 bg-white ${
                        isDropdownOpen
                          ? "border-orange-500 ring-4 ring-orange-500/15 shadow-lg shadow-orange-500/10"
                          : "border-gray-200 hover:border-orange-400 hover:shadow-xs"
                      }`}
                    >
                      {/* Current Selected Option Display */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${currentOption.iconBg} shadow-xs`}
                        >
                          {currentOption.emoji}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-sm sm:text-base leading-tight truncate">
                              {currentOption.label}
                            </span>
                            {currentOption.tag && (
                              <span
                                className={`text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full border ${currentOption.tagColor}`}
                              >
                                {currentOption.tag}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 font-light truncate mt-0.5">
                            {currentOption.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* Right Indicator / Chevron */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="hidden sm:inline-block text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200/70">
                          เลือกหมวด
                        </span>
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 text-gray-600 transition-transform duration-200 ${
                            isDropdownOpen ? "rotate-180 bg-orange-100 text-orange-600" : ""
                          }`}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </button>

                    {/* Custom Animated Dropdown Menu Panel */}
                    {isDropdownOpen && (
                      <div
                        className="absolute left-0 right-0 top-full mt-2 z-40 bg-white/95 backdrop-blur-md rounded-2xl border border-orange-200/90 shadow-2xl shadow-orange-950/15 p-2 animate-in fade-in zoom-in-95 duration-150"
                        role="listbox"
                      >
                        {/* Header inside popup */}
                        <div className="flex items-center justify-between px-3 py-2 mb-1 border-b border-gray-100">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                            <span>เลือกหมวดหมู่ที่เหมาะสมกับผลงานของคุณ</span>
                          </div>
                          <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                            {CATEGORY_OPTIONS.length} หมวดหมู่
                          </span>
                        </div>

                        {/* Options List */}
                        <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-orange-200 scrollbar-track-transparent">
                          {CATEGORY_OPTIONS.map((opt) => {
                            const isSelected = category === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => {
                                  setCategory(opt.value);
                                  setIsDropdownOpen(false);
                                }}
                                className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between gap-3 transition-all duration-150 group ${
                                  isSelected
                                    ? "bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/5 border border-orange-300/80 shadow-xs"
                                    : "hover:bg-orange-50/60 border border-transparent hover:border-orange-200/60 hover:translate-x-1"
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 ${opt.iconBg} transition-transform group-hover:scale-110 shadow-xs`}
                                  >
                                    {opt.emoji}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`text-sm font-bold leading-tight truncate ${
                                          isSelected
                                            ? "text-orange-950"
                                            : "text-gray-800 group-hover:text-orange-600"
                                        }`}
                                      >
                                        {opt.label}
                                      </span>
                                      {opt.tag && (
                                        <span
                                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${opt.tagColor}`}
                                        >
                                          {opt.tag}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-500 font-light truncate mt-0.5">
                                      {opt.subtitle}
                                    </p>
                                  </div>
                                </div>

                                <div className="shrink-0 pl-2">
                                  {isSelected ? (
                                    <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-xs">
                                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    </div>
                                  ) : (
                                    <div className="w-5 h-5 rounded-full border border-gray-200 group-hover:border-orange-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {/* Footer hint */}
                        <div className="mt-2 pt-2 border-t border-gray-100 px-3 flex items-center justify-between text-[11px] text-gray-400">
                          <span>💡 ช่วยให้เพื่อนครูและนักเรียนค้นพบผลงานได้ง่ายขึ้น</span>
                          <button
                            type="button"
                            onClick={() => setIsDropdownOpen(false)}
                            className="text-gray-500 hover:text-gray-700 font-semibold hover:underline"
                          >
                            ปิด
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Video URL Input (Inspiring Young Creators) */}
                <div className="p-5 rounded-2xl bg-orange-50/50 border border-orange-200/70 space-y-3">
                  <div className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-orange-500" />
                    <span className="text-sm font-bold text-gray-800">
                      คลิปวิดีโอผลงาน หรือวิธีทำ (YouTube Video URL)
                    </span>
                    <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">แนะนำ</span>
                  </div>
                  <input 
                    type="url" 
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="เช่น https://www.youtube.com/watch?v=... หรือ https://youtu.be/..."
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all text-gray-800 text-sm"
                  />
                  <p className="text-xs text-gray-500 font-light">
                    หากใส่ลิงก์ YouTube ระบบจะแปลงเป็นเครื่องเล่นวิดีโอ HD ให้เปิดดูได้ทันทีในหน้าไอเดีย
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    รายละเอียดไอเดีย <span className="text-red-500">*</span>
                  </label>
                  <textarea 
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="อธิบายขั้นตอนการจัดกิจกรรม วัตถุประสงค์ วิธีการนำสื่อไปใช้งาน หรือคำแนะนำสำหรับเพื่อนๆ และคุณครู..."
                    className="w-full h-32 p-4 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all resize-none text-gray-800 leading-relaxed"
                  />
                </div>

                {/* Materials & Steps (Optional Structured Inputs) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                      <Palette className="w-4 h-4 text-amber-500" />
                      อุปกรณ์ที่ต้องเตรียม (ถ้ามี)
                    </label>
                    <textarea 
                      value={materialsInput}
                      onChange={(e) => setMaterialsInput(e.target.value)}
                      placeholder="พิมพ์อุปกรณ์แต่ละชิ้นแยกบรรทัด เช่น&#10;กระเป๋าผ้าแคนวาส&#10;สีอะคริลิก 3 แม่สี&#10;พู่กันเบอร์ 6"
                      className="w-full h-28 p-3.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all resize-none text-gray-800 text-xs sm:text-sm leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                      <ListOrdered className="w-4 h-4 text-blue-500" />
                      ขั้นตอนวิธีทำทีละข้อ (ถ้ามี)
                    </label>
                    <textarea 
                      value={stepsInput}
                      onChange={(e) => setStepsInput(e.target.value)}
                      placeholder="พิมพ์ขั้นตอนแต่ละข้อแยกบรรทัด เช่น&#10;ร่างแบบลวดลายลงบนผ้า&#10;ลงสีพื้นหลังแล้วรอให้แห้ง&#10;ตัดเส้นเก็บรายละเอียด"
                      className="w-full h-28 p-3.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all resize-none text-gray-800 text-xs sm:text-sm leading-relaxed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    ลิงก์ภายนอก / เว็บไซต์ที่เกี่ยวข้อง (ถ้ามี)
                  </label>
                  <input 
                    type="url" 
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="เช่น https://www.canva.com/design/... หรือ https://drive.google.com/..."
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all text-gray-800 text-sm"
                  />
                </div>

                {/* Cover Image Upload & Interactive Preview */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-gray-800 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-orange-500" />
                      รูปภาพหน้าปก <span className="text-red-500">*</span>
                    </label>
                    <span className="text-xs text-gray-400">
                      แนะนำขนาด 16:9 หรือ 800x600 px (สูงสุด 10 MB)
                    </span>
                  </div>

                  {coverPreviewUrl && coverImage ? (
                    <div className="bg-gradient-to-b from-gray-50/70 to-white rounded-3xl border border-gray-200/90 p-4 sm:p-5 shadow-xs space-y-4 animate-in fade-in duration-150">
                      {/* File Info & Fit Mode Switcher */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-lg">
                            รูปหน้าปก
                          </span>
                          <span className="text-xs font-bold text-gray-800 truncate max-w-[160px] sm:max-w-xs">
                            {coverImage.name}
                          </span>
                          <span className="text-[11px] text-gray-400 font-mono">
                            {(coverImage.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>

                        {/* Fit Mode Toggle */}
                        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-medium">
                          <button
                            type="button"
                            onClick={() => setCoverFitMode("cover")}
                            className={`px-2.5 py-1 rounded-lg transition-all ${
                              coverFitMode === "cover"
                                ? "bg-white text-orange-600 font-bold shadow-xs"
                                : "text-gray-500 hover:text-gray-900"
                            }`}
                          >
                            เต็มกรอบ 16:9
                          </button>
                          <button
                            type="button"
                            onClick={() => setCoverFitMode("contain")}
                            className={`px-2.5 py-1 rounded-lg transition-all ${
                              coverFitMode === "contain"
                                ? "bg-white text-orange-600 font-bold shadow-xs"
                                : "text-gray-500 hover:text-gray-900"
                            }`}
                          >
                            เห็นภาพเต็ม
                          </button>
                        </div>
                      </div>

                      {/* Visual Preview Box */}
                      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-gray-950 border border-gray-200/80 shadow-inner flex items-center justify-center group">
                        {/* Ambient Blurred Background (for contain mode) */}
                        {coverFitMode === "contain" && (
                          <div 
                            className="absolute inset-0 scale-125 blur-2xl opacity-40 pointer-events-none"
                            style={{
                              backgroundImage: `url(${coverPreviewUrl})`,
                              backgroundPosition: "center",
                              backgroundSize: "cover",
                            }}
                          />
                        )}

                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={coverPreviewUrl} 
                          alt="Cover Preview" 
                          className={`relative max-w-full max-h-full transition-all duration-200 ${
                            coverFitMode === "cover" 
                              ? "w-full h-full object-cover" 
                              : "object-contain"
                          }`}
                        />

                        {/* Tag overlay */}
                        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white/90 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-white/10">
                          {coverFitMode === "cover" ? "มุมมอง: เต็มกรอบ 16:9" : "มุมมอง: สัดส่วนจริง"}
                        </div>
                      </div>

                      {/* Interactive Editing Toolbar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* 1-Click AI Auto Enhance */}
                          <button
                            type="button"
                            disabled={isAiEnhancing || isQuickRotating}
                            onClick={handleAiAutoEnhanceCover}
                            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 hover:opacity-95 text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            title="AI ช่วยปรับแสงเงา สีสัน และความคมชัดของภาพหน้าปกให้อัตโนมัติในคลิกเดียว"
                          >
                            <Sparkles className={`w-3.5 h-3.5 text-yellow-200 ${isAiEnhancing ? "animate-spin" : ""}`} />
                            <span>{isAiEnhancing ? "กำลังปรับ..." : "✨ AI ปรับภาพสวย"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingTarget("cover");
                              setIsEditorOpen(true);
                            }}
                            className="px-3.5 py-2 rounded-xl bg-white hover:bg-orange-50 text-gray-800 hover:text-orange-600 border border-gray-300 hover:border-orange-300 text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Sliders className="w-3.5 h-3.5 text-orange-500" />
                            <span>ปรับแต่ง & ครอบตัดภาพ</span>
                          </button>

                          <button
                            type="button"
                            disabled={isQuickRotating || isAiEnhancing}
                            onClick={handleQuickRotateCover}
                            className="px-3 py-2 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50/40 text-gray-700 text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                            title="หมุนตามเข็มนาฬิกา 90 องศา"
                          >
                            <RotateCw className={`w-3.5 h-3.5 text-orange-500 ${isQuickRotating ? "animate-spin" : ""}`} />
                            <span>หมุน 90°</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => coverFileInputRef.current?.click()}
                            className="px-3 py-2 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600 text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-gray-400" />
                            <span>เปลี่ยนรูป</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => setCoverImage(null)}
                          className="px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 text-xs font-semibold transition-colors flex items-center gap-1.5 ml-auto cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>ลบรูปภาพ</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="relative w-full h-48 border-2 border-dashed border-gray-300 hover:border-orange-400 bg-gray-50/60 hover:bg-orange-50/20 rounded-3xl transition-all group overflow-hidden cursor-pointer flex flex-col items-center justify-center text-center p-6 shadow-xs">
                      <input 
                        ref={coverFileInputRef}
                        type="file" 
                        accept="image/*"
                        onChange={handleCoverChange}
                        className="hidden"
                      />
                      <div className="w-14 h-14 rounded-2xl bg-orange-100/80 text-orange-500 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-xs">
                        <ImageIcon className="w-7 h-7" />
                      </div>
                      <p className="text-base font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
                        คลิกเพื่อเลือกรูปภาพหน้าปก
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        รองรับ JPG, PNG, WEBP (สูงสุด 10 MB) • สามารถปรับแต่ง ครอบตัด และหมุนภาพได้ทันทีหลังเลือก
                      </p>
                    </label>
                  )}

                  {/* Hidden file input for "เปลี่ยนรูป" */}
                  {coverPreviewUrl && (
                    <input 
                      ref={coverFileInputRef}
                      type="file" 
                      accept="image/*"
                      onChange={handleCoverChange}
                      className="hidden"
                    />
                  )}
                </div>

                {/* File Attachments with Image Preview Thumbnails & Editing */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-gray-800 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-500" />
                      ไฟล์แนบประกอบ (ใบงาน / เอกสาร / สื่อนำเสนอ / รูปเพิ่มเติม)
                    </label>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {files.length}/5 ไฟล์
                    </span>
                  </div>
                  
                  {files.length < 5 && (
                    <label className="relative w-full h-18 border-2 border-dashed border-gray-300 hover:border-blue-400 bg-gray-50/60 hover:bg-blue-50/20 rounded-2xl transition-all group flex items-center justify-center cursor-pointer px-4">
                      <input 
                        type="file" 
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <div className="flex items-center gap-2 text-gray-500 group-hover:text-blue-600 transition-colors">
                        <Upload className="w-5 h-5 text-blue-500" />
                        <span className="text-sm font-medium">คลิกเพื่อเลือกไฟล์แนบ (PDF, Word, PPTX, รูปภาพ ฯลฯ ขนาดไม่เกิน 10MB ต่อไฟล์)</span>
                      </div>
                    </label>
                  )}

                  {files.length > 0 && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {files.map((file, index) => {
                        const isImage = file.type.startsWith("image/");
                        const previewUrl = attachmentPreviews[index];

                        return (
                          <div 
                            key={index} 
                            className="flex items-center justify-between p-3 bg-white border border-gray-200 hover:border-gray-300 rounded-2xl shadow-xs transition-all group"
                          >
                            <div className="flex items-center gap-3 overflow-hidden min-w-0">
                              {isImage && previewUrl ? (
                                <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-gray-200 shrink-0 bg-gray-100">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img 
                                    src={previewUrl} 
                                    alt={file.name} 
                                    className="w-full h-full object-cover" 
                                  />
                                </div>
                              ) : (
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                                  <FileText className="w-6 h-6" />
                                </div>
                              )}
                              
                              <div className="truncate min-w-0">
                                <p className="text-xs font-bold text-gray-800 truncate">{file.name}</p>
                                <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-0.5">
                                  <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                  {isImage && (
                                    <span className="text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded text-[10px]">
                                      รูปภาพ
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0 ml-2">
                              {isImage && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingTarget({ type: "attachment", index });
                                    setIsEditorOpen(true);
                                  }}
                                  className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                                  title="ปรับแต่งรูปภาพแนบนี้"
                                >
                                  <Sliders className="w-4 h-4" />
                                </button>
                              )}
                              <button 
                                type="button" 
                                onClick={() => removeFile(index)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="ลบไฟล์นี้"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Admin Instant Publish Option */}
                {isAdmin && (
                  <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-amber-900">สิทธิ์ผู้ดูแลระบบ (Admin)</p>
                        <p className="text-xs text-amber-700">อนุมัติและเผยแพร่ลงหน้าเว็บทันที ไม่ต้องรอตรวจสอบ</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={instantApprove} 
                        onChange={(e) => setInstantApprove(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>
                )}
                
                <div className="pt-6 border-t border-gray-100">
                  <button 
                    type="submit" 
                    disabled={isSubmitting || successMsg.length > 0}
                    className="w-full h-14 rounded-2xl text-base font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25 disabled:opacity-50 transition-all flex items-center justify-center cursor-pointer hover:-translate-y-0.5"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>กำลังบันทึกและส่งข้อมูล...</span>
                      </div>
                    ) : (
                      <span>{isAdmin && instantApprove ? "เผยแพร่ไอเดียทันที" : "ส่งไอเดียเพื่อตรวจสอบ"}</span>
                    )}
                  </button>
                  <p className="text-center text-xs text-gray-400 mt-4">
                    {isAdmin && instantApprove 
                      ? "ไอเดียนี้จะแสดงผลในหน้าห้องสมุดไอเดียทันทีหลังจากส่ง" 
                      : "ไอเดียจะถูกส่งให้คุณครูหรือผู้ดูแลระบบตรวจสอบก่อนเผยแพร่สู่สาธารณะ"}
                  </p>
                </div>
              </form>
            </div>
          </div>
        </main>
      </ProtectedRoute>

      {/* Interactive Image Editor Modal */}
      <ImageEditorModal
        isOpen={isEditorOpen}
        file={
          editingTarget === "cover"
            ? coverImage
            : editingTarget?.type === "attachment"
            ? files[editingTarget.index]
            : null
        }
        title={
          editingTarget === "cover"
            ? "ปรับแต่งและครอบตัดรูปภาพหน้าปก"
            : "ปรับแต่งรูปภาพไฟล์แนบ"
        }
        defaultAspectRatio={editingTarget === "cover" ? "16:9" : "original"}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingTarget(null);
        }}
        onSave={handleEditorSave}
      />

      <Footer />
    </>
  );
}

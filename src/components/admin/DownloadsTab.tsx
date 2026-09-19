"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { 
  FolderDown, 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  X, 
  Upload, 
  ExternalLink, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff,
  Layers,
  FileCheck2,
  Lock,
  Unlock,
  SlidersHorizontal
} from "lucide-react";

import AiMaterialStudioModal from "./materials/AiMaterialStudioModal";
import MaterialLivePreviewModal from "./materials/MaterialLivePreviewModal";

export interface DownloadItem {
  id: string;
  title: string;
  description: string;
  category: string;
  grade: string;
  fileName: string;
  fileSize: string;
  fileUrl: string;
  imageUrl?: string;
  topic?: string;
  mediaType?: string;
  content?: string;
  downloadsCount: number;
  orderIndex: number;
  createdAt?: string;
}

export interface GradeSettings {
  m1: boolean;
  m2: boolean;
  m3: boolean;
  m4: boolean;
  m5: boolean;
  m6: boolean;
}

const GRADE_CONFIG = [
  { id: "m1", label: "มัธยมศึกษาปีที่ 1 (ม.1)", short: "ม.1" },
  { id: "m2", label: "มัธยมศึกษาปีที่ 2 (ม.2)", short: "ม.2" },
  { id: "m3", label: "มัธยมศึกษาปีที่ 3 (ม.3)", short: "ม.3" },
  { id: "m4", label: "มัธยมศึกษาปีที่ 4 (ม.4)", short: "ม.4" },
  { id: "m5", label: "มัธยมศึกษาปีที่ 5 (ม.5)", short: "ม.5" },
  { id: "m6", label: "มัธยมศึกษาปีที่ 6 (ม.6)", short: "ม.6" },
];

const CATEGORY_OPTIONS = [
  "แบบฝึกหัด",
  "ใบความรู้",
  "เกณฑ์การประเมิน",
  "คู่มือ",
  "ข้อสอบ/แบบทดสอบ",
  "สื่อการเรียนรู้",
];

export default function DownloadsTab() {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [gradeSettings, setGradeSettings] = useState<GradeSettings>({
    m1: false,
    m2: false,
    m3: true,
    m4: true,
    m5: false,
    m6: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingGrades, setIsSavingGrades] = useState(false);
  const [saveGradeSuccess, setSaveGradeSuccess] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGradeFilter, setSelectedGradeFilter] = useState("all");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");

  // AI Studio & Live Preview States
  const [isAiStudioOpen, setIsAiStudioOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewMaterial, setPreviewMaterial] = useState<any | null>(null);
  const [publishSuccessMsg, setPublishSuccessMsg] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("แบบฝึกหัด");
  const [grade, setGrade] = useState("all");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("1.5 MB");
  const [fileUrl, setFileUrl] = useState("");
  const [orderIndex, setOrderIndex] = useState(1);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch Data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/downloads");
      const data = await res.json();
      if (data) {
        if (Array.isArray(data.downloads)) {
          setDownloads(data.downloads);
        }
        if (data.gradeSettings) {
          setGradeSettings(data.gradeSettings);
        }
      }
    } catch (error) {
      console.error("Failed to fetch downloads", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute document count per grade
  const gradeCounts = useMemo(() => {
    const counts: Record<string, number> = {
      m1: 0,
      m2: 0,
      m3: 0,
      m4: 0,
      m5: 0,
      m6: 0,
    };
    downloads.forEach((item) => {
      const g = item.grade?.toLowerCase();
      if (counts[g] !== undefined) {
        counts[g]++;
      }
    });
    return counts;
  }, [downloads]);

  // Toggle single grade switch
  const handleToggleGrade = async (gradeKey: keyof GradeSettings) => {
    const newSettings = {
      ...gradeSettings,
      [gradeKey]: !gradeSettings[gradeKey],
    };
    setGradeSettings(newSettings);
    await saveGradeSettings(newSettings);
  };

  // Save grade availability to backend
  const saveGradeSettings = async (settings: GradeSettings) => {
    setIsSavingGrades(true);
    setSaveGradeSuccess(false);
    try {
      const res = await fetch("/api/downloads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_grades",
          gradeSettings: settings,
        }),
      });
      if (res.ok) {
        setSaveGradeSuccess(true);
        setTimeout(() => setSaveGradeSuccess(false), 3000);
      } else {
        alert("ไม่สามารถบันทึกการตั้งค่าระดับชั้นได้ กรุณาลองใหม่อีกครั้ง");
      }
    } catch (e) {
      console.error(e);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsSavingGrades(false);
    }
  };

  // Auto close empty grades
  const handleAutoCloseEmptyGrades = async () => {
    const newSettings: GradeSettings = {
      m1: gradeCounts.m1 > 0,
      m2: gradeCounts.m2 > 0,
      m3: gradeCounts.m3 > 0,
      m4: gradeCounts.m4 > 0,
      m5: gradeCounts.m5 > 0,
      m6: gradeCounts.m6 > 0,
    };
    setGradeSettings(newSettings);
    await saveGradeSettings(newSettings);
  };

  // Open all grades
  const handleOpenAllGrades = async () => {
    const newSettings: GradeSettings = {
      m1: true,
      m2: true,
      m3: true,
      m4: true,
      m5: true,
      m6: true,
    };
    setGradeSettings(newSettings);
    await saveGradeSettings(newSettings);
  };

  // Filtered downloads for admin list
  const filteredDownloads = useMemo(() => {
    return downloads.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title?.toLowerCase().includes(q);
        const matchDesc = item.description?.toLowerCase().includes(q);
        const matchCat = item.category?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchCat) return false;
      }
      if (selectedGradeFilter !== "all" && item.grade !== selectedGradeFilter) {
        return false;
      }
      if (selectedCategoryFilter !== "all" && item.category !== selectedCategoryFilter) {
        return false;
      }
      return true;
    });
  }, [downloads, searchQuery, selectedGradeFilter, selectedCategoryFilter]);

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setCategory("แบบฝึกหัด");
    setGrade("all");
    setFileName("");
    setFileSize("1.5 MB");
    setFileUrl("");
    setOrderIndex(downloads.length + 1);
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (item: DownloadItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description || "");
    setCategory(item.category || "แบบฝึกหัด");
    setGrade(item.grade || "all");
    setFileName(item.fileName || "");
    setFileSize(item.fileSize || "1.0 MB");
    setFileUrl(item.fileUrl || "");
    setOrderIndex(item.orderIndex || 1);
    setIsModalOpen(true);
  };

  // Delete item
  const handleDelete = async (id: string, itemTitle: string) => {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบเอกสาร "${itemTitle}"?`)) return;
    try {
      const res = await fetch(`/api/downloads?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDownloads((prev) => prev.filter((d) => d.id !== id));
      } else {
        const err = await res.json();
        alert(`เกิดข้อผิดพลาด: ${err.error || "ไม่สามารถลบเอกสารได้"}`);
      }
    } catch (e) {
      console.error(e);
      alert("เกิดข้อผิดพลาดในการลบเอกสาร");
    }
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Auto fill filename & size
    setFileName(file.name);
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    setFileSize(`${sizeInMB} MB`);

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setFileUrl(data.url);
      } else {
        alert(data.error || "อัปโหลดไฟล์ไม่สำเร็จ กรุณากรอกลิงก์ตรงด้วยตนเอง");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("อัปโหลดไฟล์ล้มเหลว กรุณาระบุลิงก์ตรงภายนอก");
    } finally {
      setIsUploading(false);
    }
  };

  // Submit Modal
  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !fileUrl.trim()) {
      alert("กรุณากรอกชื่อเอกสารและลิงก์ดาวน์โหลดไฟล์ให้ครบถ้วน");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        // PUT
        const res = await fetch("/api/downloads", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingId,
            title: title.trim(),
            description: description.trim(),
            category,
            grade,
            fileName: fileName.trim() || `${title}.pdf`,
            fileSize: fileSize.trim() || "1.0 MB",
            fileUrl: fileUrl.trim(),
            orderIndex: Number(orderIndex) || 0,
          }),
        });

        if (res.ok) {
          setIsModalOpen(false);
          fetchData();
        } else {
          const err = await res.json();
          alert(`อัปเดตไม่สำเร็จ: ${err.error || "ข้อผิดพลาดของเซิร์ฟเวอร์"}`);
        }
      } else {
        // POST
        const res = await fetch("/api/downloads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            category,
            grade,
            fileName: fileName.trim() || `${title}.pdf`,
            fileSize: fileSize.trim() || "1.0 MB",
            fileUrl: fileUrl.trim(),
            orderIndex: Number(orderIndex) || 0,
          }),
        });

        if (res.ok) {
          setIsModalOpen(false);
          fetchData();
        } else {
          const err = await res.json();
          alert(`บันทึกไม่สำเร็จ: ${err.error || "ข้อผิดพลาดของเซิร์ฟเวอร์"}`);
        }
      }
    } catch (e) {
      console.error(e);
      alert("เกิดข้อผิดพลาดในการบันทึกเอกสาร");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handlers for AI Studio & Live Preview
  const handleOpenPreviewFromAi = (generatedMaterial: any) => {
    setPreviewMaterial(generatedMaterial);
    setIsPreviewOpen(true);
  };

  const handleOpenPreviewForExisting = (item: DownloadItem) => {
    setPreviewMaterial({
      ...item,
      recommendedImageUrl: item.imageUrl,
      suggestedFileName: item.fileName,
      contentMarkdown: item.content,
      aiPersonaName: "Art Room Studio"
    });
    setIsPreviewOpen(true);
  };

  const handleConfirmPublish = async (materialData: any) => {
    const isEdit = downloads.some((d) => d.id === materialData.id);
    const method = isEdit ? "PUT" : "POST";

    const payload = {
      id: materialData.id || `dl_${Date.now()}`,
      title: materialData.title,
      description: materialData.description,
      category: materialData.category,
      grade: materialData.grade,
      fileName: materialData.fileName,
      fileSize: materialData.fileSize || "1.5 MB",
      fileUrl: materialData.fileUrl || "https://pdfobject.com/pdf/sample.pdf",
      imageUrl: materialData.imageUrl || materialData.recommendedImageUrl,
      topic: materialData.topic,
      mediaType: materialData.mediaType || "pdf",
      content: materialData.content || materialData.contentMarkdown,
      orderIndex: Number(materialData.orderIndex) || downloads.length + 1
    };

    const res = await fetch("/api/downloads", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "เกิดข้อผิดพลาดในการเผยแพร่");
    }

    setPublishSuccessMsg(`เผยแพร่ "${payload.title}" ขึ้นหน้าเว็บจริงเรียบร้อยแล้ว!`);
    setTimeout(() => setPublishSuccessMsg(null), 4000);
    fetchData();
  };

  // Seed / Reset default items
  const handleSeedDefaults = async () => {
    if (!confirm("คุณต้องการคืนค่าข้อมูลสื่อการสอน ใบงาน และคู่มือการเรียน ให้เป็นชุดเริ่มต้นใช่หรือไม่?")) return;
    try {
      const res = await fetch("/api/downloads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_default_data" }),
      });
      if (res.ok) {
        alert("คืนค่าชุดสื่อการสอนดั้งเดิมสำเร็จเรียบร้อยแล้ว!");
        fetchData();
      } else {
        alert("ไม่สามารถคืนค่าชุดข้อมูลเริ่มต้นได้");
      }
    } catch (e) {
      console.error(e);
      alert("เกิดข้อผิดพลาดในการโหลดชุดข้อมูล");
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. GRADE ON/OFF CONTROL SWITCHBOARD */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold mb-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-red-600" />
              <span>ระบบสวิตช์เปิด-ปิดการแสดงผลระดับชั้น (Grade Controls)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              เปิด/ปิด ม. ที่ไม่มีเอกสาร หรือยังไม่พร้อมให้บริการ
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 font-light max-w-2xl">
              เลือกเปิดหรือปิดระดับชั้น (ม.1 - ม.6) ได้อิสระ ระดับชั้นที่ปิดจะแสดงสถานะ <span className="font-semibold text-amber-600">ปิดชั่วคราว / กำลังจัดทำ</span> บนหน้าเว็บไซต์ ให้นักเรียนรับทราบอย่างถูกต้อง
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleAutoCloseEmptyGrades}
              disabled={isSavingGrades}
              className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="ตรวจสอบระดับชั้นที่มี 0 เอกสาร และปิดให้อัตโนมัติ"
            >
              <EyeOff className="w-3.5 h-3.5 text-amber-700" />
              ปิด ม. ที่ไม่มีเอกสารอัตโนมัติ
            </button>
            <button
              onClick={handleOpenAllGrades}
              disabled={isSavingGrades}
              className="px-3.5 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-gray-600" />
              เปิดทุกระดับชั้น
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {saveGradeSuccess && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>บันทึกการตั้งค่าเปิด-ปิดระดับชั้นเรียบร้อยแล้ว การเปลี่ยนแปลงจะมีผลทันทีบนหน้าเว็บไซต์</span>
          </div>
        )}

        {/* 6 Cards Grid (M.1 - M.6) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {GRADE_CONFIG.map((g) => {
            const key = g.id as keyof GradeSettings;
            const isOpen = Boolean(gradeSettings[key]);
            const count = gradeCounts[g.id] || 0;

            return (
              <div
                key={g.id}
                className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                  isOpen
                    ? "bg-gradient-to-br from-emerald-50/50 via-white to-emerald-50/20 border-emerald-200 shadow-xs"
                    : "bg-gradient-to-br from-gray-50 via-white to-gray-50/50 border-gray-200 opacity-90"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">ระดับชั้น</span>
                    <h3 className="font-bold text-gray-900 text-base">{g.label}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-xs px-2 py-0.5 rounded-xl font-medium ${
                        count > 0 ? "bg-orange-50 text-orange-600" : "bg-gray-100 text-gray-500"
                      }`}>
                        {count} เอกสารเฉพาะชั้น
                      </span>
                      {count === 0 && (
                        <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-xl border border-amber-100">
                          ไม่มีเอกสาร
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                    isOpen 
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300/60" 
                      : "bg-gray-200 text-gray-600 border border-gray-300"
                  }`}>
                    {isOpen ? (
                      <>
                        <Unlock className="w-3 h-3 text-emerald-600" />
                        <span>เปิด</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3 text-gray-500" />
                        <span>ปิด</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Toggle Button */}
                <div className="pt-3 border-t border-gray-100/80 flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-light">
                    {isOpen ? "แสดงบนหน้าดาวน์โหลด" : "ปิดชั่วคราว (ยังไม่มีเอกสาร)"}
                  </span>

                  <button
                    onClick={() => handleToggleGrade(key)}
                    disabled={isSavingGrades}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isOpen ? "bg-emerald-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isOpen ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. WORKSHEETS & DOCUMENTS MANAGEMENT */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-bold mb-2">
              <FolderDown className="w-3.5 h-3.5 text-orange-500" />
              <span>รายการเอกสารทั้งหมด ({downloads.length} รายการ)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              จัดการใบงาน คู่มือ และเกณฑ์การประเมิน
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              onClick={() => setIsAiStudioOpen(true)}
              className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl shadow-md shadow-orange-500/20 gap-2 cursor-pointer font-bold text-xs sm:text-sm px-4 py-2 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>✨ AI ออกแบบสื่อการสอน (AI Studio)</span>
            </Button>
            <Button
              onClick={handleOpenCreateModal}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl gap-1.5 cursor-pointer font-semibold text-xs sm:text-sm px-3.5 py-2"
            >
              <Plus className="w-4 h-4 text-orange-600" /> เพิ่มเอกสารด้วยตนเอง
            </Button>
            {downloads.length === 0 && (
              <Button
                onClick={handleSeedDefaults}
                variant="outline"
                className="rounded-xl gap-1.5 cursor-pointer text-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> โหลดเอกสารเริ่มต้น (6 รายการ)
              </Button>
            )}
          </div>
        </div>

        {/* Feedback Alert for Publishing */}
        {publishSuccessMsg && (
          <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{publishSuccessMsg}</span>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อเอกสาร หรือคำอธิบาย..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <select
              value={selectedGradeFilter}
              onChange={(e) => setSelectedGradeFilter(e.target.value)}
              className="w-full h-10 px-3 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:bg-white transition-all"
            >
              <option value="all">ระดับชั้น: ทั้งหมด</option>
              <option value="m1">ม.1</option>
              <option value="m2">ม.2</option>
              <option value="m3">ม.3</option>
              <option value="m4">ม.4</option>
              <option value="m5">ม.5</option>
              <option value="m6">ม.6</option>
            </select>
          </div>

          <div>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="w-full h-10 px-3 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:bg-white transition-all"
            >
              <option value="all">หมวดหมู่: ทั้งหมด</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Documents List */}
        {isLoading ? (
          <div className="text-center py-16 text-gray-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-red-500" />
            <p className="text-xs">กำลังโหลดข้อมูลเอกสาร...</p>
          </div>
        ) : filteredDownloads.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50 p-6">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <h4 className="font-bold text-gray-700 text-sm">ไม่พบเอกสารตามเงื่อนไขที่เลือก</h4>
            <p className="text-xs text-gray-400 mt-1">ลองเปลี่ยนคำค้นหา หรือกดปุ่ม &quot;เพิ่มเอกสารใหม่&quot; ด้านบน</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
            {filteredDownloads.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 hover:bg-gray-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  {item.imageUrl ? (
                    <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200 shadow-2xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {item.topic && (
                        <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded-xl border border-orange-200/60">
                          {item.topic}
                        </span>
                      )}
                      <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-xl">
                        {item.grade === "all" ? "ทุกระดับชั้น" : item.grade.toUpperCase()}
                      </span>
                      <span className="bg-gray-100 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded-xl">
                        {item.category}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {item.fileSize || "1.0 MB"}
                      </span>
                      <span className="text-[11px] text-emerald-600 font-medium">
                        ดาวน์โหลดแล้ว {item.downloadsCount || 0} ครั้ง
                      </span>
                    </div>

                    <h4 className="font-bold text-gray-900 text-sm sm:text-base">
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="text-xs text-gray-500 line-clamp-1 mt-0.5 font-light">
                        {item.description}
                      </p>
                    )}
                    <p className="text-[11px] text-gray-400 font-mono mt-1 break-all">
                      ไฟล์: {item.fileName || "document.pdf"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-center flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenPreviewForExisting(item)}
                    className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-2xl transition-colors cursor-pointer"
                    title="เปิดแสดงตัวอย่าง (Live Preview)"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-colors"
                    title="เปิดดูไฟล์ต้นฉบับ"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-2xl transition-colors cursor-pointer"
                    title="แก้ไขเอกสาร"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.title)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-colors cursor-pointer"
                    title="ลบเอกสาร"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                  <FolderDown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">
                    {editingId ? "แก้ไขข้อมูลเอกสาร" : "เพิ่มเอกสาร / ใบงานใหม่"}
                  </h3>
                  <p className="text-xs text-gray-400">ระบบคลังดาวน์โหลดสำหรับนักเรียนและครู</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitModal} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  ชื่อเอกสาร / หัวข้อใบงาน <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ใบงานที่ 1: การแรเงาและน้ำหนักแสงเงา"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  คำอธิบายสั้นๆ / วัตถุประสงค์
                </label>
                <textarea
                  rows={2}
                  placeholder="เช่น แบบฝึกปฏิบัติการลงน้ำหนัก 7 ระดับ สำหรับนักเรียนเริ่มต้น"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    ระดับชั้น <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl focus:border-red-500 focus:outline-none"
                  >
                    <option value="all">ทุกระดับชั้น (All)</option>
                    <option value="m1">ม.1</option>
                    <option value="m2">ม.2</option>
                    <option value="m3">ม.3</option>
                    <option value="m4">ม.4</option>
                    <option value="m5">ม.5</option>
                    <option value="m6">ม.6</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    หมวดหมู่ <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl focus:border-red-500 focus:outline-none"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    ขนาดไฟล์ (เช่น 1.5 MB)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น 1.5 MB"
                    value={fileSize}
                    onChange={(e) => setFileSize(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    ลำดับการแสดงผล (Order)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={orderIndex}
                    onChange={(e) => setOrderIndex(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  ชื่อไฟล์สำหรับดาวน์โหลด
                </label>
                <input
                  type="text"
                  placeholder="เช่น worksheet_01_shading.pdf"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700">
                    ลิงก์ดาวน์โหลดไฟล์ (PDF / Google Drive) <span className="text-red-500">*</span>
                  </label>
                  <label className="text-[11px] text-red-600 hover:text-red-700 font-bold cursor-pointer flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>{isUploading ? "กำลังอัปโหลด..." : "อัปโหลดไฟล์จากเครื่อง"}</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                </div>
                <input
                  type="url"
                  required
                  placeholder="https://... หรืออัปโหลดไฟล์ด้านบน"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl focus:border-red-500 focus:outline-none"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  สามารถวางลิงก์ตรง PDF หรือลิงก์แชร์จาก Google Drive (ตั้งค่าสิทธิ์ &quot;ทุกคนที่มีลิงก์ดูได้&quot;)
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl text-xs cursor-pointer"
                >
                  ยกเลิก
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold px-5 cursor-pointer"
                >
                  {isSubmitting ? "กำลังบันทึก..." : editingId ? "บันทึกการแก้ไข" : "เพิ่มเอกสาร"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Material Studio Modal */}
      <AiMaterialStudioModal
        isOpen={isAiStudioOpen}
        onClose={() => setIsAiStudioOpen(false)}
        onOpenPreview={handleOpenPreviewFromAi}
      />

      {/* Live Preview Modal before Publishing */}
      <MaterialLivePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        material={previewMaterial}
        onConfirmPublish={handleConfirmPublish}
      />
    </div>
  );
}

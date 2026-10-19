"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Trash2, 
  Plus, 
  Pencil, 
  Calendar, 
  Camera, 
  ImageIcon, 
  Star, 
  Award, 
  FileText, 
  Check, 
  ExternalLink, 
  FileUp, 
  Loader2, 
  Sparkles,
  X
} from "lucide-react";

import { optimizeImageToFile } from "@/lib/image-optimizer";
import { GRADE_GROUPS } from "@/lib/constants/grades";

const AWARD_LEVELS = [
  "รางวัลชนะเลิศอันดับ 1 (เหรียญทอง)",
  "รางวัลชนะเลิศ",
  "รางวัลรองชนะเลิศอันดับที่ 1",
  "รางวัลรองชนะเลิศอันดับที่ 2",
  "รางวัลยอดเยี่ยม",
  "รางวัลระดับเหรียญทอง",
  "รางวัลระดับเหรียญเงิน",
  "รางวัลระดับเหรียญทองแดง",
  "รางวัลชมเชย",
  "รางวัลเข้าร่วม",
  "ผ่านการคัดเลือก",
  "อื่นๆ",
];

const COMPETITION_LEVELS = [
  "ระดับสถานศึกษา/กลุ่มโรงเรียนฯ",
  "ระดับเขตพื้นที่/ระดับจังหวัด",
  "ระดับภาค/ระดับกลุ่มสถานศึกษา",
  "ระดับชาติ/ประเทศ",
  "ระดับนานาชาติ",
  "อื่นๆ",
];

// Helper to convert Thai date string into standard DD/MM/YYYY and 4-digit BE Year
function parseThaiDateToStandard(thaiDateStr: string): { formattedDate: string; year: string } {
  if (!thaiDateStr) {
    const curYear = (new Date().getFullYear() + 543).toString();
    return { formattedDate: "", year: curYear };
  }

  // Check if year 25xx is in the string
  const yearMatch = thaiDateStr.match(/\b(25\d{2})\b/);
  const year = yearMatch ? yearMatch[1] : (new Date().getFullYear() + 543).toString();

  // If already DD/MM/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(thaiDateStr.trim())) {
    return { formattedDate: thaiDateStr.trim(), year };
  }

  // Extract day number (1-31)
  const dayMatch = thaiDateStr.match(/\b([1-9]|[12]\d|3[01])\b/);
  const day = dayMatch ? dayMatch[1].padStart(2, "0") : "01";

  // Match Thai month name
  const monthMap: Record<string, string> = {
    "มกรา": "01", "กุมภา": "02", "มีนา": "03", "เมษา": "04", "พฤษภา": "05", "มิถุนา": "06",
    "กรกฎา": "07", "สิงหา": "08", "กันยา": "09", "ตุลา": "10", "พฤศจิกา": "11", "ธันวา": "12"
  };
  let month = "01";
  for (const [key, val] of Object.entries(monthMap)) {
    if (thaiDateStr.includes(key)) {
      month = val;
      break;
    }
  }

  return {
    formattedDate: `${day}/${month}/${year}`,
    year
  };
}

export default function ActivitiesTab() {
  const [activitiesList, setActivitiesList] = useState<any[]>([]);
  const [activityTitle, setActivityTitle] = useState("");
  const [activityDesc, setActivityDesc] = useState("");
  const [activityDate, setActivityDate] = useState("");
  const [activityTime, setActivityTime] = useState("");
  const [activityLocation, setActivityLocation] = useState("");
  const [activityCategory, setActivityCategory] = useState("ทั่วไป");
  const [activityColor, setActivityColor] = useState("red");
  const [activityImageUrl, setActivityImageUrl] = useState("");
  const [activityImageFiles, setActivityImageFiles] = useState<File[]>([]);
  const [activityExistingImages, setActivityExistingImages] = useState<string[]>([]);
  const [coverImageId, setCoverImageId] = useState<string>("");
  
  // Certificate states (รองรับทั้งไฟล์และลิงก์)
  const [activityCertificateUrl, setActivityCertificateUrl] = useState("");
  const [activityCertificateFile, setActivityCertificateFile] = useState<File | null>(null);

  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Awards sync tracking & Modal
  const [isSendingAward, setIsSendingAward] = useState(false);
  const [sentAwardIds, setSentAwardIds] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<{ id: string; title: string; text: string } | null>(null);

  // Send to Awards Customization Modal State
  const [awardModalData, setAwardModalData] = useState<{
    activity: any;
    title: string;
    student: string;
    grade: string;
    awardLevel: string;
    competitionLevel: string;
    year: string;
    date: string;
    organization: string;
    description: string;
    imageUrl: string;
    certificateUrl: string;
    isHighlight: boolean;
  } | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/activities");
      const data = await res.json();
      setActivitiesList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch", error);
      setActivitiesList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityTitle || !activityDate) return;

    // Check if adding duplicate activity title & date without editing mode
    if (!editingActivityId) {
      const duplicate = activitiesList.find(
        (a) => a.title?.trim() === activityTitle.trim() && a.date?.trim() === activityDate.trim()
      );
      if (duplicate) {
        const proceed = confirm(
          `⚠️ พบกิจกรรม "${activityTitle}" ในวันที่เดียวกันนี้อยู่ในระบบแล้ว\n\nต้องการเพิ่มเป็นกิจกรรมใหม่อีกรายการหนึ่งใช่หรือไม่?\n\n(หากต้องการแก้ไขกิจกรรมเดิม กรุณากด "ยกเลิก" แล้วไปกดปุ่ม "✏️ แก้ไข" ที่การ์ดกิจกรรมนั้นแทน)`
        );
        if (!proceed) return;
      }
    }
    
    setIsSubmitting(true);
    const formData = new FormData();
    if (editingActivityId) formData.append("id", editingActivityId);
    formData.append("title", activityTitle);
    formData.append("description", activityDesc || "");
    formData.append("date", activityDate);
    formData.append("time", activityTime || "");
    formData.append("location", activityLocation || "");
    formData.append("category", activityCategory || "ทั่วไป");
    formData.append("color", activityColor || "red");
    
    // Process new images
    for (let i = 0; i < activityImageFiles.length; i++) {
      const file = activityImageFiles[i];
      const compressed = await optimizeImageToFile(file, { maxWidth: 1600, maxHeight: 1600, quality: 0.82 });
      formData.append("images", compressed);
      if (coverImageId === `new-${i}` || (!coverImageId && i === 0 && activityExistingImages.length === 0)) {
        formData.append("image", compressed);
      }
    }

    // Process existing images
    activityExistingImages.forEach((url, i) => {
      formData.append("existingImages", url);
      if (coverImageId === `existing-${i}` || (!coverImageId && i === 0)) {
        formData.append("imageUrl", url);
      }
    });

    // Process certificate (file or url)
    if (activityCertificateFile) {
      const isImg = activityCertificateFile.type.startsWith("image/");
      if (isImg) {
        const compressedCert = await optimizeImageToFile(activityCertificateFile, { maxWidth: 1600, maxHeight: 1600, quality: 0.82 });
        formData.append("certificate", compressedCert);
      } else {
        formData.append("certificate", activityCertificateFile);
      }
    } else if (activityCertificateUrl) {
      formData.append("certificateUrl", activityCertificateUrl);
    }

    try {
      const method = editingActivityId ? "PUT" : "POST";
      const res = await fetch("/api/activities", {
        method,
        body: formData,
      });
      if (res.ok) {
        resetActivityForm();
        fetchData();
      } else {
        const err = (await res.json()) as any;
        alert(err.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (error) {
      console.error("Failed to save activity", error);
      alert("ไม่สามารถบันทึกกิจกรรมได้");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetActivityForm = () => {
    setActivityTitle("");
    setActivityDesc("");
    setActivityDate("");
    setActivityTime("");
    setActivityLocation("");
    setActivityCategory("ทั่วไป");
    setActivityColor("red");
    setActivityImageUrl("");
    setActivityImageFiles([]);
    setActivityExistingImages([]);
    setCoverImageId("");
    setActivityCertificateUrl("");
    setActivityCertificateFile(null);
    setEditingActivityId(null);
    const fileInput = document.getElementById("activityImageInput") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
    const certInput = document.getElementById("activityCertFileInput") as HTMLInputElement;
    if (certInput) certInput.value = "";
  };

  const handleEditActivity = (activity: any) => {
    setActivityTitle(activity.title || "");
    setActivityDesc(activity.description || "");
    setActivityDate(activity.date || "");
    setActivityTime(activity.time || "");
    setActivityLocation(activity.location || "");
    setActivityCategory(activity.category || "ทั่วไป");
    setActivityColor(activity.color || "red");
    setActivityImageUrl(activity.imageUrl || "");
    setActivityCertificateUrl(activity.certificateUrl || activity.certificate_url || "");
    setActivityCertificateFile(null);
    setActivityImageFiles([]);
    
    let existing: string[] = [];
    try {
      existing = activity.images ? (typeof activity.images === "string" ? JSON.parse(activity.images) : activity.images) : [];
    } catch {
      if (activity.imageUrl) existing = [activity.imageUrl];
    }
    if (activity.imageUrl && !existing.includes(activity.imageUrl)) {
      existing.unshift(activity.imageUrl);
    }
    setActivityExistingImages(existing);
    
    // Set initial cover image ID based on imageUrl
    if (activity.imageUrl) {
      const idx = existing.indexOf(activity.imageUrl);
      if (idx !== -1) setCoverImageId(`existing-${idx}`);
      else if (existing.length > 0) setCoverImageId(`existing-0`);
    } else if (existing.length > 0) {
      setCoverImageId(`existing-0`);
    } else {
      setCoverImageId("");
    }
    
    setEditingActivityId(activity.id);
    window.scrollTo({ top: 150, behavior: "smooth" });
  };

  const handleDeleteActivity = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบกิจกรรมนี้?")) return;
    try {
      const res = await fetch(`/api/activities?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Failed to delete activity", error);
    }
  };

  // Open Send to Awards Customization Modal
  const handleOpenSendToAwardsModal = (activity: any) => {
    const { formattedDate, year } = parseThaiDateToStandard(activity.date || "");

    // Choose primary cover image
    let cover = activity.imageUrl || "";
    if (!cover && activity.images) {
      try {
        const parsed = typeof activity.images === "string" ? JSON.parse(activity.images) : activity.images;
        if (Array.isArray(parsed) && parsed.length > 0) cover = parsed[0];
      } catch {}
    }

    setAwardModalData({
      activity,
      title: activity.title || "กิจกรรมศิลปะ",
      student: "นักเรียนตัวแทนโรงเรียนวชิรธรรมสาธิต",
      grade: "ม.3/1",
      awardLevel: "รางวัลชนะเลิศ",
      competitionLevel: "ระดับชาติ/ประเทศ",
      year: year || "2568",
      date: formattedDate || activity.date || "",
      organization: activity.location || "กลุ่มสาระการเรียนรู้ศิลปะ โรงเรียนวชิรธรรมสาธิต",
      description: activity.description || "",
      imageUrl: cover,
      certificateUrl: activity.certificateUrl || activity.certificate_url || "",
      isHighlight: true,
    });
  };

  // Confirm sending verified data to Awards
  const handleConfirmSendToAwards = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!awardModalData) return;
    if (!awardModalData.title || !awardModalData.student) {
      alert("กรุณาระบุชื่อกิจกรรมและชื่อนักเรียน");
      return;
    }

    setIsSendingAward(true);
    try {
      const formData = new FormData();
      formData.append("title", awardModalData.title.trim());
      formData.append("student", awardModalData.student.trim());
      formData.append("grade", awardModalData.grade.trim());
      formData.append("description", awardModalData.description || "");
      formData.append("year", awardModalData.year.trim());
      formData.append("date", awardModalData.date.trim());
      formData.append("awardLevel", awardModalData.awardLevel.trim());
      formData.append("competitionLevel", awardModalData.competitionLevel.trim());
      formData.append("organization", awardModalData.organization.trim());
      formData.append("isHighlight", awardModalData.isHighlight ? "true" : "false");

      if (awardModalData.imageUrl) {
        formData.append("imageUrl", awardModalData.imageUrl);
      }
      if (awardModalData.certificateUrl) {
        formData.append("certificateUrl", awardModalData.certificateUrl);
      }

      const res = await fetch("/api/awards", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setSentAwardIds((prev) => ({ ...prev, [awardModalData.activity.id]: true }));
        setToastMessage({
          id: awardModalData.activity.id,
          title: awardModalData.title,
          text: `🏆 บันทึกผลงานของ "${awardModalData.student}" เข้าสู่ "หน้ารางวัลที่ได้รับ" เรียบร้อยแล้ว!`
        });
        setAwardModalData(null);
        setTimeout(() => setToastMessage(null), 8000);
      } else {
        const err = (await res.json()) as any;
        alert(err.error || "เกิดข้อผิดพลาดในการส่งข้อมูลไปหน้ารางวัล");
      }
    } catch (err: any) {
      console.error("Failed to send award:", err);
      alert("ไม่สามารถบันทึกผลงานได้: " + (err?.message || ""));
    } finally {
      setIsSendingAward(false);
    }
  };

  const totalImagesCount = activityExistingImages.length + activityImageFiles.length;

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold shrink-0">
              <Check className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold truncate">{toastMessage.text}</p>
              <p className="text-[11px] text-emerald-100 font-light truncate">
                กิจกรรม: {toastMessage.title} (ข้อมูลรูปภาพ เกียรติบัตร และระดับรางวัลแสดงใน /awards ทันที)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="/awards"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-white text-emerald-900 text-xs font-bold hover:bg-emerald-50 transition-colors inline-flex items-center gap-1 shadow-xs"
            >
              <span>เปิดดูหน้ารางวัล</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="p-1 rounded-full hover:bg-white/20 text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Information Banner */}
      <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-100/50 rounded-2xl p-4 sm:p-5 border border-orange-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold shadow-sm shadow-orange-500/20 shrink-0">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold font-kanit text-gray-900">
              จัดการอัลบั้มภาพกิจกรรม &amp; นิทรรศการ (Photo Gallery Showcase)
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              อัปโหลดภาพกิจกรรมได้หลายรูป เลือกรูปหน้าปก/โปรไฟล์ แนบเกียรติบัตร และกดส่งไปเป็นผลงานในหน้ารางวัลได้ทันที
            </p>
          </div>
        </div>
        <div className="text-xs text-orange-700 bg-white/90 border border-orange-200/90 rounded-xl px-3 py-1.5 font-medium shrink-0 flex items-center gap-1.5 shadow-2xs">
          <Award className="w-3.5 h-3.5 text-amber-500" />
          <span>เชื่อมต่อกับระบบ <strong>หน้ารางวัลที่ได้รับ (/awards)</strong> อัตโนมัติ</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Form Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-5 shadow-2xs border border-gray-200 sticky top-4">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                {editingActivityId ? <Pencil className="text-orange-500 w-4 h-4" /> : <Plus className="text-orange-500 w-4 h-4" />}
                <h2 className="text-sm sm:text-base font-bold font-kanit text-gray-900">
                  {editingActivityId ? "แก้ไขกิจกรรม" : "เพิ่มกิจกรรมใหม่"}
                </h2>
              </div>
              {editingActivityId && (
                <button
                  type="button"
                  onClick={resetActivityForm}
                  className="text-xs text-gray-400 hover:text-gray-600 font-medium"
                >
                  ล้างฟอร์ม
                </button>
              )}
            </div>

            <form onSubmit={handleAddActivity} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">หัวข้อกิจกรรม *</label>
                <input 
                  type="text" 
                  required 
                  value={activityTitle} 
                  onChange={(e) => setActivityTitle(e.target.value)} 
                  placeholder="เช่น การแข่งขันออกแบบลายผ้า..."
                  className="w-full h-9 px-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-xs" 
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">รายละเอียดกิจกรรม *</label>
                <textarea 
                  required 
                  value={activityDesc} 
                  onChange={(e) => setActivityDesc(e.target.value)} 
                  placeholder="รายละเอียดกิจกรรม กำหนดการ เช่น ในหัวข้อ โชคดีทีแมว..."
                  className="w-full h-20 p-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none resize-none text-xs" 
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">วันที่ (เช่น 12 ตุลาคม 2566) *</label>
                <input 
                  type="text" 
                  required 
                  value={activityDate} 
                  onChange={(e) => setActivityDate(e.target.value)} 
                  placeholder="เช่น วันเสาร์ ที่ 30 สิงหาคม 2568"
                  className="w-full h-9 px-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-xs" 
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">สถานที่ (ไม่บังคับ)</label>
                <input 
                  type="text" 
                  value={activityLocation} 
                  onChange={(e) => setActivityLocation(e.target.value)} 
                  placeholder="เช่น ณ มหาวิทยาลัยเทคโนโลยีราชมงคลกรุงเทพ" 
                  className="w-full h-9 px-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-xs" 
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">เวลา (เช่น 09:00 - 12:00 น.)</label>
                  <input 
                    type="text" 
                    value={activityTime} 
                    onChange={(e) => setActivityTime(e.target.value)} 
                    placeholder="เช่น 09:00 หรือ ตลอดวัน" 
                    className="w-full h-9 px-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-xs" 
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">หมวดหมู่กิจกรรม</label>
                  <input 
                    type="text" 
                    value={activityCategory} 
                    onChange={(e) => setActivityCategory(e.target.value)} 
                    placeholder="เช่น ทั่วไป, ประกวด, เวิร์กช็อป" 
                    className="w-full h-9 px-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-xs" 
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">สีแถบกิจกรรมในปฏิทิน</label>
                <div className="flex gap-1.5 items-center flex-wrap">
                  {[
                    { id: "red", label: "แดง (สำคัญ/สอบ)", bg: "bg-red-500", border: "border-red-500" },
                    { id: "orange", label: "ส้ม (เวิร์กช็อป)", bg: "bg-orange-500", border: "border-orange-500" },
                    { id: "blue", label: "น้ำเงิน (เรียนการสอน)", bg: "bg-blue-500", border: "border-blue-500" },
                    { id: "green", label: "เขียว (นิทรรศการ)", bg: "bg-emerald-500", border: "border-emerald-500" },
                    { id: "purple", label: "ม่วง (ประกวด)", bg: "bg-purple-500", border: "border-purple-500" }
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setActivityColor(c.id)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium border transition-all cursor-pointer ${
                        activityColor === c.id 
                          ? `${c.border} bg-gray-100 font-bold ring-2 ring-offset-1 ring-orange-400` 
                          : "border-gray-200 hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${c.bg}`} />
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION: รูปภาพกิจกรรม (เพิ่มได้หลายรูป & เลือกรูปโปรไฟล์/หน้าปก) */}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-orange-500" />
                    <span>รูปภาพกิจกรรม (เพิ่มได้หลายรูป)</span>
                  </label>
                  {totalImagesCount > 0 && (
                    <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                      รวม {totalImagesCount} รูป
                    </span>
                  )}
                </div>

                {/* Dropzone with cumulative image addition */}
                <div className="relative border-2 border-dashed border-orange-300 bg-orange-50/40 hover:bg-orange-50/70 transition-colors rounded-2xl p-4 text-center cursor-pointer overflow-hidden group">
                  <input 
                    id="activityImageInput"
                    type="file" 
                    multiple
                    accept="image/*,image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        const newFiles = Array.from(e.target.files);
                        setActivityImageFiles((prev) => [...prev, ...newFiles]);
                        // If no cover chosen yet, auto select the first one
                        if (!coverImageId && activityExistingImages.length === 0) {
                          setCoverImageId("new-0");
                        }
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center justify-center relative z-0">
                    <div className="w-9 h-9 bg-orange-500/10 text-orange-600 rounded-xl flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                      <Plus className="w-5 h-5" />
                    </div>
                    <p className="text-slate-800 font-bold text-xs group-hover:text-orange-600 transition-colors">
                      คลิกหรือลากไฟล์ภาพมาที่นี่ (เพิ่มได้เรื่อยๆ)
                    </p>
                    <p className="text-slate-400 text-[10px] mt-0.5">
                      JPG, PNG, WebP (เลือกหลายรูปได้พร้อมกัน)
                    </p>
                  </div>
                </div>

                {/* Image Previews with Profile/Cover Indicator */}
                {totalImagesCount > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-[11px] text-gray-500 flex items-center gap-1 font-medium">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span>แตะที่ปุ่ม <strong className="text-orange-600">"ตั้งเป็นรูปโปรไฟล์/หน้าปก"</strong> เพื่อเลือกรูปหลัก</span>
                    </p>

                    <div className="grid grid-cols-3 gap-2">
                      {/* Existing Images */}
                      {activityExistingImages.map((url, i) => {
                        const isCover = coverImageId === `existing-${i}` || (!coverImageId && i === 0);
                        return (
                          <div 
                            key={`existing-${i}`} 
                            className={`relative aspect-square bg-gray-950 rounded-xl overflow-hidden border-2 transition-all flex items-center justify-center group ${
                              isCover ? "border-orange-500 ring-2 ring-orange-500/40 shadow-sm" : "border-gray-200 opacity-90 hover:opacity-100"
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={url} 
                              alt={`existing ${i}`} 
                              className="max-h-full max-w-full object-contain" 
                              onError={(e) => (e.currentTarget.src = "https://placehold.co/400x400/eeeeee/999999?text=Error")} 
                            />
                            
                            {/* Cover Badge */}
                            {isCover ? (
                              <div className="absolute top-1 left-1 bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-sm z-20">
                                <Star className="w-2.5 h-2.5 fill-white" />
                                <span>รูปโปรไฟล์</span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setCoverImageId(`existing-${i}`)}
                                className="absolute bottom-1 inset-x-1 bg-black/80 hover:bg-orange-500 text-white text-[9px] py-1 rounded-md font-bold transition-all z-20 shadow-xs cursor-pointer"
                              >
                                ตั้งเป็นโปรไฟล์
                              </button>
                            )}

                            {/* Delete Button */}
                            <button 
                              type="button" 
                              onClick={() => {
                                setActivityExistingImages((prev) => prev.filter((_, idx) => idx !== i));
                                if (coverImageId === `existing-${i}`) setCoverImageId("");
                              }} 
                              className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow-sm z-20 cursor-pointer"
                              title="ลบรูปนี้"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        );
                      })}

                      {/* New Uploaded Images */}
                      {activityImageFiles.map((file, i) => {
                        const isCover = coverImageId === `new-${i}` || (!coverImageId && activityExistingImages.length === 0 && i === 0);
                        return (
                          <div 
                            key={`new-${i}`} 
                            className={`relative aspect-square bg-gray-950 rounded-xl overflow-hidden border-2 transition-all flex items-center justify-center group ${
                              isCover ? "border-orange-500 ring-2 ring-orange-500/40 shadow-sm" : "border-emerald-300 opacity-90 hover:opacity-100"
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={URL.createObjectURL(file)} 
                              alt={`new ${i}`} 
                              className="max-h-full max-w-full object-contain" 
                            />
                            
                            {/* Cover Badge */}
                            {isCover ? (
                              <div className="absolute top-1 left-1 bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-sm z-20">
                                <Star className="w-2.5 h-2.5 fill-white" />
                                <span>รูปโปรไฟล์</span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setCoverImageId(`new-${i}`)}
                                className="absolute bottom-1 inset-x-1 bg-black/80 hover:bg-orange-500 text-white text-[9px] py-1 rounded-md font-bold transition-all z-20 shadow-xs cursor-pointer"
                              >
                                ตั้งเป็นโปรไฟล์
                              </button>
                            )}

                            {/* Delete Button */}
                            <button 
                              type="button" 
                              onClick={() => {
                                setActivityImageFiles((prev) => prev.filter((_, idx) => idx !== i));
                                if (coverImageId === `new-${i}`) setCoverImageId("");
                              }} 
                              className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow-sm z-20 cursor-pointer"
                              title="ลบรูปนี้"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION: แนบเกียรติบัตร (Certificate) */}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>เกียรติบัตรกิจกรรม (Certificate)</span>
                    <span className="text-[11px] font-normal text-slate-400">(ไม่บังคับ)</span>
                  </label>
                  {activityCertificateUrl && (
                    <a
                      href={activityCertificateUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-amber-600 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>ดูเกียรติบัตร</span>
                    </a>
                  )}
                </div>

                <div className="space-y-2">
                  {/* File Upload Button */}
                  <label className="w-full py-2 px-3 rounded-xl border border-dashed border-amber-300 hover:border-amber-400 bg-amber-50/40 hover:bg-amber-50 text-amber-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors active:scale-98">
                    <FileUp className="w-3.5 h-3.5 text-amber-600" />
                    <span>
                      {activityCertificateFile || activityCertificateUrl 
                        ? "📎 เปลี่ยนไฟล์เกียรติบัตรใหม่" 
                        : "📎 อัปโหลดไฟล์เกียรติบัตร (รูปภาพ หรือ PDF)"}
                    </span>
                    <input
                      id="activityCertFileInput"
                      type="file"
                      accept="image/*,.pdf,application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setActivityCertificateFile(file);
                          setActivityCertificateUrl(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </label>

                  {/* Attached Certificate Card */}
                  {(activityCertificateFile || activityCertificateUrl) && (
                    <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        {activityCertificateFile?.type === "application/pdf" || activityCertificateUrl.endsWith(".pdf") ? (
                          <FileText className="w-5 h-5 text-amber-600 shrink-0" />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={activityCertificateUrl}
                            alt="Certificate"
                            className="w-8 h-8 rounded object-cover border border-amber-200 shrink-0 bg-white"
                            onError={(e) => (e.currentTarget.style.display = "none")}
                          />
                        )}
                        <div className="truncate">
                          <span className="font-bold truncate block">
                            {activityCertificateFile ? activityCertificateFile.name : "เกียรติบัตรที่แนบไว้"}
                          </span>
                          <span className="text-[10px] text-amber-600">
                            {activityCertificateFile ? `${(activityCertificateFile.size / 1024 / 1024).toFixed(2)} MB` : "พร้อมเชื่อมโยง"}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setActivityCertificateFile(null);
                          setActivityCertificateUrl("");
                          const input = document.getElementById("activityCertFileInput") as HTMLInputElement;
                          if (input) input.value = "";
                        }}
                        className="text-amber-700 hover:text-red-600 p-1 shrink-0 cursor-pointer"
                        title="ลบเกียรติบัตรนี้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* URL Input */}
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 block mb-0.5">
                      หรือ วางลิงก์เกียรติบัตร (Google Drive / ลิงก์ตรง):
                    </label>
                    <input
                      type="url"
                      value={activityCertificateUrl && !activityCertificateUrl.startsWith("blob:") && !activityCertificateUrl.startsWith("data:") ? activityCertificateUrl : ""}
                      onChange={(e) => {
                        setActivityCertificateUrl(e.target.value);
                        setActivityCertificateFile(null);
                      }}
                      placeholder="https://drive.google.com/file/d/... หรือ URL เกียรติบัตร"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 focus:border-amber-400 outline-none bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 h-9 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold cursor-pointer shadow-2xs"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : editingActivityId ? (
                    "บันทึกการแก้ไข"
                  ) : (
                    "เพิ่มกิจกรรม"
                  )}
                </Button>
                {editingActivityId && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={resetActivityForm} 
                    className="h-9 rounded-xl px-3 border-gray-200 text-xs font-medium cursor-pointer"
                  >
                    ยกเลิก
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Activity List Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-2xs border border-gray-200 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
              <h2 className="text-sm sm:text-base font-bold font-kanit text-gray-900 flex items-center gap-2">
                <Calendar className="text-orange-500 w-4 h-4" /> 
                รายการกิจกรรมทั้งหมด
              </h2>
              <span className="text-xs font-semibold text-gray-600 bg-white px-2.5 py-1 rounded-full border border-gray-200 shadow-2xs">
                {activitiesList.length} รายการ
              </span>
            </div>

            {isLoading ? (
              <div className="text-center py-12 text-gray-400 text-xs font-medium">กำลังโหลดข้อมูล...</div>
            ) : activitiesList.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-xs font-medium">ไม่มีข้อมูลกิจกรรมในระบบ</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5 p-4 sm:p-5">
                {(Array.isArray(activitiesList) ? activitiesList : []).map((activity) => {
                  const colorKey = activity.color || "red";
                  const colorBadge = {
                    red: "bg-red-100 text-red-800 border-red-200",
                    orange: "bg-orange-100 text-orange-800 border-orange-200",
                    blue: "bg-blue-100 text-blue-800 border-blue-200",
                    green: "bg-emerald-100 text-emerald-800 border-emerald-200",
                    purple: "bg-purple-100 text-purple-800 border-purple-200",
                  }[colorKey] || "bg-red-100 text-red-800 border-red-200";

                  // Extract images count
                  let imgCount = 0;
                  try {
                    const parsed = activity.images ? (typeof activity.images === "string" ? JSON.parse(activity.images) : activity.images) : [];
                    imgCount = Array.isArray(parsed) ? parsed.length : (activity.imageUrl ? 1 : 0);
                  } catch {
                    imgCount = activity.imageUrl ? 1 : 0;
                  }

                  const cert = activity.certificateUrl || activity.certificate_url;
                  const isSent = sentAwardIds[activity.id];

                  return (
                    <div key={activity.id} className="flex flex-col bg-white rounded-xl overflow-hidden border border-gray-200 shadow-2xs hover:shadow-xs transition-all group justify-between">
                      <div>
                        {activity.imageUrl ? (
                          <div className="w-full h-36 bg-gray-950 relative overflow-hidden flex items-center justify-center">
                            {/* Ambient blur */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={activity.imageUrl} 
                              alt="" 
                              className="absolute inset-0 w-full h-full object-cover blur-sm opacity-30 scale-110 pointer-events-none" 
                            />
                            {/* Main uncropped cover photo */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={activity.imageUrl} 
                              alt={activity.title} 
                              className="relative z-10 max-h-full max-w-full object-contain p-1 group-hover:scale-102 transition-transform duration-300" 
                              onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400/eeeeee/999999?text=Image+Not+Found")} 
                            />
                            <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-xs text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-2xs z-20">
                              {activity.date}
                            </div>
                            
                            <div className="absolute top-2 right-2 flex items-center gap-1 z-20">
                              {imgCount > 1 && (
                                <span className="bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                                  📷 {imgCount}
                                </span>
                              )}
                              {activity.category && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${colorBadge}`}>
                                  {activity.category}
                                </span>
                              )}
                            </div>

                            {activity.location && (
                              <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-md truncate z-20">
                                📍 {activity.location}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-full h-24 bg-gradient-to-r from-gray-50 to-gray-100 p-3 flex flex-col justify-between border-b border-gray-100 relative">
                            <div className="flex justify-between items-start gap-2">
                              <span className="bg-white/95 text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded-md border border-gray-200">
                                📅 {activity.date}
                              </span>
                              {activity.category && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${colorBadge}`}>
                                  {activity.category}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-gray-600 font-medium">
                              {activity.time && <span>⏰ {activity.time}</span>}
                              {activity.location && <span className="truncate">📍 {activity.location}</span>}
                            </div>
                          </div>
                        )}

                        <div className="p-3.5">
                          <div className="flex items-center gap-1.5 mb-1">
                            <h3 className="font-bold font-kanit text-gray-900 truncate text-xs sm:text-sm" title={activity.title}>
                              {activity.title}
                            </h3>
                          </div>
                          {activity.description && (
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-2">
                              {activity.description}
                            </p>
                          )}

                          {/* Certificate Badge if attached */}
                          {cert && (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold mb-1">
                              <Award className="w-3 h-3 text-amber-500" />
                              <span>แนบเกียรติบัตรแล้ว</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="p-3.5 pt-0 space-y-2">
                        {/* Send to Awards Button (Opens Customization Dialog) */}
                        <button 
                          type="button"
                          onClick={() => handleOpenSendToAwardsModal(activity)} 
                          className={`w-full py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
                            isSent
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100"
                              : "bg-amber-500 hover:bg-amber-600 text-white active:scale-98"
                          }`}
                          title="ส่งข้อมูลกิจกรรมนี้ไปยัง 'หน้ารางวัลที่ได้รับ' (/awards) พร้อมระบุชื่อนักเรียนและระดับรางวัล"
                        >
                          {isSent ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>✓ ส่งไปหน้ารางวัลแล้ว (คลิกเพื่อแก้ไข/ส่งเพิ่ม)</span>
                            </>
                          ) : (
                            <>
                              <Award className="w-3.5 h-3.5" />
                              <span>🏆 ส่งไปเป็นผลงานรางวัล</span>
                            </>
                          )}
                        </button>

                        <div className="flex gap-2 border-t border-gray-100 pt-2">
                          <button 
                            type="button"
                            onClick={() => handleEditActivity(activity)} 
                            className="flex-1 h-7.5 rounded-lg flex items-center justify-center text-xs font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3 h-3 mr-1" /> แก้ไข
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleDeleteActivity(activity.id)} 
                            className="h-7.5 px-2.5 rounded-lg flex items-center justify-center text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                            title="ลบกิจกรรม"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Send to Awards Confirmation & Verification Modal */}
      {awardModalData && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setAwardModalData(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold font-kanit text-gray-900 leading-tight">
                    ส่งข้อมูลไปยัง "หน้ารางวัลที่ได้รับ" (/awards)
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    ตรวจเช็คและระบุชื่อนักเรียน/ระดับรางวัล เพื่อให้ข้อมูลแสดงตรงกันอย่างสมบูรณ์
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setAwardModalData(null)}
                className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 text-gray-500 flex items-center justify-center transition-colors cursor-pointer border border-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleConfirmSendToAwards} className="p-4 sm:p-5 overflow-y-auto space-y-3.5 text-xs">
              
              {/* Linked Activity Preview */}
              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 flex items-center gap-3">
                {awardModalData.imageUrl ? (
                  <div className="w-14 h-14 rounded-xl bg-gray-950 overflow-hidden shrink-0 border border-gray-300 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={awardModalData.imageUrl} alt="" className="max-h-full max-w-full object-contain" />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-gray-200 text-gray-400 flex items-center justify-center shrink-0">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-orange-600 bg-orange-100/70 px-2 py-0.5 rounded-md inline-block mb-0.5">
                    ดึงข้อมูลจากกิจกรรม
                  </span>
                  <p className="font-bold font-kanit text-gray-900 truncate">{awardModalData.title}</p>
                  <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                    <span>📅 {awardModalData.date}</span>
                    {awardModalData.certificateUrl && (
                      <span className="text-amber-600 font-bold flex items-center gap-0.5">
                        <Award className="w-3 h-3" /> แนบเกียรติบัตรแล้ว
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 1. Student Name */}
              <div>
                <label className="font-bold text-gray-800 block mb-1">
                  ชื่อนักเรียน / ผู้ได้รับรางวัล <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  required
                  value={awardModalData.student}
                  onChange={(e) => setAwardModalData({ ...awardModalData, student: e.target.value })}
                  placeholder="เช่น เด็กหญิงโชคดี มีแมว หรือ คณะนักเรียนตัวแทน"
                  className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none text-xs bg-white font-medium"
                />
              </div>

              {/* 2. Grade Level & Award Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-800 block mb-1">ระดับชั้นเรียน</label>
                  <select 
                    value={awardModalData.grade}
                    onChange={(e) => setAwardModalData({ ...awardModalData, grade: e.target.value })}
                    className="w-full h-9 px-2.5 rounded-xl border border-gray-300 focus:border-amber-500 outline-none text-xs bg-white cursor-pointer font-medium"
                  >
                    <option value="">-- เลือกระดับชั้นเรียน --</option>
                    {GRADE_GROUPS.map((group) => (
                      <optgroup key={group.level} label={group.label}>
                        <option value={group.level}>ทั้งระดับชั้น ({group.level})</option>
                        {group.rooms.map((room) => (
                          <option key={room} value={room}>{room}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">ระดับรางวัลที่ได้รับ</label>
                  <select 
                    value={awardModalData.awardLevel}
                    onChange={(e) => setAwardModalData({ ...awardModalData, awardLevel: e.target.value })}
                    className="w-full h-9 px-2.5 rounded-xl border border-gray-300 focus:border-amber-500 outline-none text-xs bg-white cursor-pointer font-medium"
                  >
                    {AWARD_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 3. Competition Level & Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-800 block mb-1">ระดับการแข่งขัน</label>
                  <select 
                    value={awardModalData.competitionLevel}
                    onChange={(e) => setAwardModalData({ ...awardModalData, competitionLevel: e.target.value })}
                    className="w-full h-9 px-2.5 rounded-xl border border-gray-300 focus:border-amber-500 outline-none text-xs bg-white cursor-pointer font-medium"
                  >
                    {COMPETITION_LEVELS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">ปี พ.ศ. (เช่น 2568)</label>
                  <input 
                    type="text" 
                    value={awardModalData.year}
                    onChange={(e) => setAwardModalData({ ...awardModalData, year: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-amber-500 outline-none text-xs bg-white font-mono"
                  />
                </div>
              </div>

              {/* 4. Title & Organization */}
              <div>
                <label className="font-bold text-gray-800 block mb-1">ชื่อกิจกรรม / ผลงานรางวัล *</label>
                <input 
                  type="text" 
                  required
                  value={awardModalData.title}
                  onChange={(e) => setAwardModalData({ ...awardModalData, title: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-amber-500 outline-none text-xs bg-white font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-gray-800 block mb-1">หน่วยงานที่จัด / สถานที่</label>
                <input 
                  type="text" 
                  value={awardModalData.organization}
                  onChange={(e) => setAwardModalData({ ...awardModalData, organization: e.target.value })}
                  placeholder="เช่น มหาวิทยาลัยเทคโนโลยีราชมงคลกรุงเทพ"
                  className="w-full h-9 px-3 rounded-xl border border-gray-300 focus:border-amber-500 outline-none text-xs bg-white"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                <Button
                  type="submit"
                  disabled={isSendingAward}
                  className="flex-1 h-10 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  {isSendingAward ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                      <span>กำลังบันทึกเข้าหน้ารางวัล...</span>
                    </>
                  ) : (
                    <>
                      <Award className="w-4 h-4 mr-1.5" />
                      <span>ยืนยันบันทึกส่งไปหน้ารางวัลทันที</span>
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAwardModalData(null)}
                  className="h-10 rounded-xl px-4 border-gray-300 text-xs font-semibold cursor-pointer"
                >
                  ยกเลิก
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

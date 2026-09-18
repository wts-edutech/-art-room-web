"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Pencil, Award, Star, FileText, Loader2, Calendar, LayoutGrid, Grid2X2, Search, X } from "lucide-react";
import PRImageGuide from "./PRImageGuide";
import { optimizeImageToFile } from "@/lib/image-optimizer";
import { GRADE_GROUPS } from "@/lib/constants/grades";

// Helper to convert DD/MM/YYYY (BE) or YYYY-MM-DD to YYYY-MM-DD for HTML date input
function toIsoDate(dateStr: string): string {
  if (!dateStr) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
    const [d, m, y] = dateStr.split("/");
    let year = parseInt(y, 10);
    if (year > 2500) year -= 543;
    const mm = m.padStart(2, "0");
    const dd = d.padStart(2, "0");
    return `${year}-${mm}-${dd}`;
  }
  return "";
}

// Helper to convert YYYY-MM-DD to DD/MM/YYYY (BE)
function toThaiDateString(isoDateStr: string): string {
  if (!isoDateStr || !/^\d{4}-\d{2}-\d{2}$/.test(isoDateStr)) return isoDateStr;
  const [y, m, d] = isoDateStr.split("-");
  const beYear = parseInt(y, 10) + 543;
  return `${d}/${m}/${beYear}`;
}

export default function AwardsTab() {
  const [awards, setAwards] = useState<any[]>([]);
  const [awardTitle, setAwardTitle] = useState("");
  const [awardStudent, setAwardStudent] = useState("");
  const [awardGrade, setAwardGrade] = useState("");
  const [awardDescription, setAwardDescription] = useState("");
  const [awardYear, setAwardYear] = useState("");
  const [awardDate, setAwardDate] = useState("");
  const [awardLevel, setAwardLevel] = useState("");
  const [competitionLevel, setCompetitionLevel] = useState("");
  const [organization, setOrganization] = useState("");
  const [isHighlight, setIsHighlight] = useState(false);
  const [awardImageUrl, setAwardImageUrl] = useState("");
  const [awardImageFile, setAwardImageFile] = useState<File | null>(null);
  const [awardCertificateUrl, setAwardCertificateUrl] = useState("");
  const [awardCertificateFile, setAwardCertificateFile] = useState<File | null>(null);
  const [editingAwardId, setEditingAwardId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cardSize, setCardSize] = useState<"compact" | "normal">("compact");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/awards");
      const data = await res.json();
      setAwards(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch", error);
      setAwards([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddAward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!awardTitle || !awardStudent) return;
    
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      if (editingAwardId) formData.append("id", editingAwardId);
      formData.append("title", awardTitle);
      formData.append("student", awardStudent);
      formData.append("grade", awardGrade);
      formData.append("description", awardDescription);
      formData.append("year", awardYear);
      formData.append("date", awardDate);
      formData.append("awardLevel", awardLevel);
      formData.append("competitionLevel", competitionLevel);
      formData.append("organization", organization);
      formData.append("isHighlight", isHighlight.toString());
      
      // Auto-compress image before upload to prevent D1 size limit errors
      if (awardImageFile) {
        const compressedImage = await optimizeImageToFile(awardImageFile, { maxWidth: 1200, maxHeight: 1200, quality: 0.75 });
        formData.append("image", compressedImage);
      } else if (awardImageUrl) {
        formData.append("imageUrl", awardImageUrl);
      }

      // Auto-compress certificate before upload
      if (awardCertificateFile) {
        const compressedCert = await optimizeImageToFile(awardCertificateFile, { maxWidth: 1200, maxHeight: 1200, quality: 0.75 });
        formData.append("certificate", compressedCert);
      } else if (awardCertificateUrl) {
        formData.append("certificateUrl", awardCertificateUrl);
      }

      const method = editingAwardId ? "PUT" : "POST";
      const url = editingAwardId ? `/api/awards/${editingAwardId}` : "/api/awards";
      const res = await fetch(url, {
        method,
        body: formData,
      });
      if (res.ok) {
        resetAwardForm();
        fetchData();
      } else {
        const err = (await res.json()) as any;
        alert(err.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง");
      }
    } catch (error: any) {
      console.error("Failed to save award", error);
      alert(error?.message ? `เกิดข้อผิดพลาด: ${error.message}` : "ไม่สามารถบันทึกผลงานได้");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAwardForm = () => {
    setAwardTitle("");
    setAwardStudent("");
    setAwardGrade("");
    setAwardDescription("");
    setAwardYear("");
    setAwardDate("");
    setAwardLevel("");
    setCompetitionLevel("");
    setOrganization("");
    setIsHighlight(false);
    setAwardImageUrl("");
    setAwardImageFile(null);
    setAwardCertificateUrl("");
    setAwardCertificateFile(null);
    setEditingAwardId(null);
    const fileInput = document.getElementById("awardImageInput") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
    const certInput = document.getElementById("awardCertInput") as HTMLInputElement;
    if (certInput) certInput.value = "";
  };

  const handleEditAward = (award: any) => {
    setAwardTitle(award.title || "");
    setAwardStudent(award.student || "");
    setAwardGrade(award.grade || "");
    setAwardDescription(award.description || "");
    setAwardYear(award.year || "");
    setAwardDate(award.date || "");
    setAwardLevel(award.awardLevel || "");
    setCompetitionLevel(award.competitionLevel || "");
    setOrganization(award.organization || "");
    setIsHighlight(!!award.isHighlight);
    setAwardImageUrl(award.imageUrl || "");
    setAwardImageFile(null);
    setAwardCertificateUrl(award.certificateUrl || "");
    setAwardCertificateFile(null);
    setEditingAwardId(award.id);
  };

  const handleDeleteAward = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบผลงานนี้?")) return;
    try {
      const res = await fetch(`/api/awards/${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Failed to delete award", error);
    }
  };

  const filteredAwards = useMemo(() => {
    return (Array.isArray(awards) ? awards : []).filter((award) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        (award.title || "").toLowerCase().includes(q) ||
        (award.student || "").toLowerCase().includes(q) ||
        (award.awardLevel || "").toLowerCase().includes(q) ||
        (award.competitionLevel || "").toLowerCase().includes(q) ||
        (award.date || "").toLowerCase().includes(q) ||
        (award.year || "").toLowerCase().includes(q)
      );
    });
  }, [awards, searchQuery]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Award Form Section */}
      <div className="xl:col-span-1">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-8">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
            {editingAwardId ? <Pencil className="text-orange-500" /> : <Plus className="text-orange-500" />}
            <h2 className="text-lg font-bold text-gray-900">
              {editingAwardId ? "แก้ไขรางวัล" : "เพิ่มรางวัลใหม่"}
            </h2>
          </div>
          <form onSubmit={handleAddAward} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5 mb-1">
                <Calendar className="w-4 h-4 text-orange-500" />
                วันที่รับรางวัล / วันที่จัดกิจกรรม
              </label>
              <input 
                type="date" 
                value={toIsoDate(awardDate)} 
                onChange={(e) => {
                  const isoVal = e.target.value;
                  if (isoVal) {
                    const thaiFormatted = toThaiDateString(isoVal);
                    setAwardDate(thaiFormatted);
                    const parts = isoVal.split("-");
                    if (parts.length === 3) {
                      setAwardYear((parseInt(parts[0], 10) + 543).toString());
                    }
                  } else {
                    setAwardDate("");
                  }
                }} 
                className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-sm bg-white cursor-pointer" 
              />
              {awardDate && (
                <p className="text-xs text-orange-600 mt-1 font-medium">
                  วันที่เลือก: {awardDate}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">ปี พ.ศ. ที่ได้รับ (เช่น 2569)</label>
              <input type="text" value={awardYear} onChange={(e) => setAwardYear(e.target.value)} placeholder="คำนวณให้อัตโนมัติจากปฏิทิน" className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">ชื่อกิจกรรม *</label>
              <input type="text" required value={awardTitle} onChange={(e) => setAwardTitle(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">ชื่อนักเรียน *</label>
              <input type="text" required value={awardStudent} onChange={(e) => setAwardStudent(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">ระดับชั้นเรียน (ม.1 - ม.6 รวม 14 ห้อง)</label>
              <select 
                value={awardGrade} 
                onChange={(e) => setAwardGrade(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-sm bg-white cursor-pointer"
              >
                <option value="">-- เลือกระดับชั้นเรียน (ม.1/1 - ม.6/14) --</option>
                {GRADE_GROUPS.map((group) => (
                  <optgroup key={group.level} label={group.label}>
                    {group.rooms.map((room) => (
                      <option key={room} value={room}>
                        {room}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">ระดับรางวัล/ผลงาน</label>
              <select value={awardLevel} onChange={(e) => setAwardLevel(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-sm bg-white">
                <option value="">-- เลือกระดับรางวัล --</option>
                <option value="รางวัลชนะเลิศอันดับ 1 (เหรียญทอง)">รางวัลชนะเลิศอันดับ 1 (เหรียญทอง)</option>
                <option value="รางวัลชนะเลิศ">รางวัลชนะเลิศ</option>
                <option value="รางวัลรองชนะเลิศอันดับที่ 1">รางวัลรองชนะเลิศอันดับที่ 1</option>
                <option value="รางวัลรองชนะเลิศอันดับที่ 2">รางวัลรองชนะเลิศอันดับที่ 2</option>
                <option value="รางวัลยอดเยี่ยม">รางวัลยอดเยี่ยม</option>
                <option value="รางวัลระดับเหรียญทอง">รางวัลระดับเหรียญทอง</option>
                <option value="รางวัลระดับเหรียญเงิน">รางวัลระดับเหรียญเงิน</option>
                <option value="รางวัลระดับเหรียญทองแดง">รางวัลระดับเหรียญทองแดง</option>
                <option value="รางวัลชมเชย">รางวัลชมเชย</option>
                <option value="รางวัลเข้าร่วม">รางวัลเข้าร่วม</option>
                <option value="ผ่านการคัดเลือก">ผ่านการคัดเลือก</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">ระดับการแข่งขัน</label>
              <select value={competitionLevel} onChange={(e) => setCompetitionLevel(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-sm bg-white">
                <option value="">-- เลือกระดับการแข่งขัน --</option>
                <option value="ระดับสถานศึกษา/กลุ่มโรงเรียนฯ">ระดับสถานศึกษา/กลุ่มโรงเรียนฯ</option>
                <option value="ระดับเขตพื้นที่/ระดับจังหวัด">ระดับเขตพื้นที่/ระดับจังหวัด</option>
                <option value="ระดับภาค/ระดับกลุ่มสถานศึกษา">ระดับภาค/ระดับกลุ่มสถานศึกษา</option>
                <option value="ระดับชาติ/ประเทศ">ระดับชาติ/ประเทศ</option>
                <option value="ระดับนานาชาติ">ระดับนานาชาติ</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">หน่วยงานที่จัด (เช่น EduPLOYS)</label>
              <input type="text" value={organization} onChange={(e) => setOrganization(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">รายละเอียดกิจกรรม</label>
              <textarea value={awardDescription} onChange={(e) => setAwardDescription(e.target.value)} className="w-full h-24 p-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-sm resize-none" />
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-xl border border-orange-100">
              <input 
                type="checkbox" 
                id="isHighlight" 
                checked={isHighlight} 
                onChange={(e) => setIsHighlight(e.target.checked)}
                className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
              />
              <label htmlFor="isHighlight" className="text-sm font-medium text-orange-900 cursor-pointer">
                แสดงผลเป็นแบนเนอร์เด่นในหน้ารางวัล
              </label>
            </div>

            {/* รูปภาพผลงาน / Banner */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                🖼️ รูปภาพผลงาน/ภาพบรรยากาศ {editingAwardId && <span className="text-xs font-normal text-gray-500">(ไม่ต้องเลือกหากใช้รูปเดิม)</span>}
              </label>
              
              <PRImageGuide />

              <div className="relative border-2 border-dashed border-indigo-300 bg-indigo-50/50 hover:bg-indigo-50 transition-colors rounded-2xl p-4 text-center cursor-pointer overflow-hidden group">
                <input 
                  id="awardImageInput"
                  type="file" 
                  accept="image/jpeg, image/jpg, image/png, image/webp"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setAwardImageFile(e.target.files[0]);
                    } else {
                      setAwardImageFile(null);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center justify-center relative z-0">
                  <p className="text-indigo-900 font-medium text-sm mb-1 group-hover:text-orange-600 transition-colors">คลิกหรือลากไฟล์ภาพผลงานมาที่นี่</p>
                  <p className="text-indigo-400 text-xs">รองรับ JPG, PNG, WebP</p>
                </div>
              </div>
              
              {/* Image Preview with Clear/Change buttons */}
              {awardImageFile || (editingAwardId && awardImageUrl) ? (
                <div className="mt-2 relative w-full h-36 flex items-center justify-center bg-gray-900/5 rounded-xl overflow-hidden border border-gray-200 p-2 group shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={awardImageFile ? URL.createObjectURL(awardImageFile) : awardImageUrl} 
                    alt="preview" 
                    className="h-full w-auto max-w-full object-contain rounded-lg" 
                    onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400/eeeeee/999999?text=Image+Not+Found")}
                  />
                  
                  {/* Status Overlay */}
                  <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-md font-semibold">
                    {awardImageFile ? "รูปใหม่ที่เลือก" : "รูปเดิม"}
                  </div>

                  {/* Action Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                    <button
                      type="button"
                      onClick={() => document.getElementById("awardImageInput")?.click()}
                      className="px-3 py-1.5 bg-white text-gray-800 rounded-lg text-xs font-bold hover:bg-gray-100 shadow-md transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5 text-orange-500" />
                      เปลี่ยนรูป
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAwardImageFile(null);
                        setAwardImageUrl("");
                        const fileInput = document.getElementById("awardImageInput") as HTMLInputElement;
                        if (fileInput) fileInput.value = "";
                      }}
                      className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 shadow-md transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      ลบรูปนี้
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {/* เกียรติบัตร (Certificate) Upload Input */}
            <div className="pt-2 border-t border-gray-100">
              <label className="text-sm font-medium text-red-700 flex items-center gap-1.5 mb-2">
                📜 เกียรติบัตร (ไฟล์รูปภาพเกียรติบัตร) {editingAwardId && <span className="text-xs font-normal text-gray-500">(ไม่ต้องเลือกหากใช้เดิม)</span>}
              </label>

              <div className="relative border-2 border-dashed border-red-300 bg-red-50/40 hover:bg-red-50 transition-colors rounded-2xl p-4 text-center cursor-pointer overflow-hidden group">
                <input 
                  id="awardCertInput"
                  type="file" 
                  accept="image/jpeg, image/jpg, image/png, image/webp"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setAwardCertificateFile(e.target.files[0]);
                    } else {
                      setAwardCertificateFile(null);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center justify-center relative z-0">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <FileText className="w-5 h-5 text-red-600" />
                    <span className="text-xs font-bold text-red-700">อัปโหลดเกียรติบัตร</span>
                  </div>
                  <p className="text-gray-700 font-medium text-xs group-hover:text-red-600 transition-colors">คลิกหรือลากไฟล์ภาพเกียรติบัตรมาวาง</p>
                  <p className="text-gray-400 text-[11px]">ไฟล์รูปภาพ JPG, PNG, WebP</p>
                </div>
              </div>
              
              {/* Certificate Preview with Clear/Change buttons */}
              {awardCertificateFile || (editingAwardId && awardCertificateUrl) ? (
                <div className="mt-2 relative w-full h-36 flex items-center justify-center bg-red-950/5 rounded-xl overflow-hidden border border-red-200 p-2 group shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={awardCertificateFile ? URL.createObjectURL(awardCertificateFile) : awardCertificateUrl} 
                    alt="certificate preview" 
                    className="h-full w-auto max-w-full object-contain rounded-lg" 
                    onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400/eeeeee/999999?text=Cert+Not+Found")}
                  />
                  
                  {/* Status Overlay */}
                  <div className="absolute top-2 left-2 bg-red-700 text-white text-[10px] px-2 py-0.5 rounded-md font-semibold">
                    {awardCertificateFile ? "เกียรติบัตรใหม่ที่เลือก" : "เกียรติบัตรเดิม"}
                  </div>

                  {/* Action Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                    <button
                      type="button"
                      onClick={() => document.getElementById("awardCertInput")?.click()}
                      className="px-3 py-1.5 bg-white text-gray-800 rounded-lg text-xs font-bold hover:bg-gray-100 shadow-md transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5 text-red-600" />
                      เปลี่ยนเกียรติบัตร
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAwardCertificateFile(null);
                        setAwardCertificateUrl("");
                        const certInput = document.getElementById("awardCertInput") as HTMLInputElement;
                        if (certInput) certInput.value = "";
                      }}
                      className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 shadow-md transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      ลบเกียรติบัตร
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
            
            <div className="flex gap-2 pt-4 border-t border-gray-100">
              <Button type="submit" disabled={isSubmitting} className="flex-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    กำลังย่อขนาดภาพและบันทึก...
                  </>
                ) : (
                  editingAwardId ? "บันทึกการแก้ไข" : "เพิ่มข้อมูลรางวัล"
                )}
              </Button>
              {editingAwardId && (
                <Button type="button" variant="outline" onClick={resetAwardForm} className="rounded-xl px-4 border-gray-200">ยกเลิก</Button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Award List Section */}
      <div className="xl:col-span-2">
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100">
          {/* Header Bar with Count, Search and Size Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold shadow-2xs shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  รายการรางวัลทั้งหมด ({filteredAwards.length})
                </h2>
                <p className="text-[11px] text-slate-400">ผลงานและรางวัลเชิดชูเกียรติของนักเรียน</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Search Bar */}
              <div className="relative w-40 sm:w-52">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="ค้นหารางวัล, ชื่อนักเรียน..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-8 pl-8 pr-7 rounded-xl border border-slate-200 text-xs bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Density Toggle (ขนาดเล็ก / ขนาดกลาง) */}
              <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setCardSize("compact")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-all ${
                    cardSize === "compact"
                      ? "bg-white text-orange-600 shadow-2xs font-bold"
                      : "text-slate-500 hover:text-slate-800 font-medium"
                  }`}
                  title="ขนาดกะทัดรัด (เล็ก)"
                >
                  <Grid2X2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">ขนาดเล็ก</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCardSize("normal")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-all ${
                    cardSize === "normal"
                      ? "bg-white text-orange-600 shadow-2xs font-bold"
                      : "text-slate-500 hover:text-slate-800 font-medium"
                  }`}
                  title="ขนาดมาตรฐาน"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">ขนาดกลาง</span>
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-16 text-slate-400">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-300 border-t-orange-600 mx-auto mb-2"></div>
              <p className="text-xs font-medium">กำลังโหลดข้อมูลรางวัล...</p>
            </div>
          ) : filteredAwards.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Award className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">ไม่พบข้อมูลรางวัล</p>
              <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนคำค้นหาหรือเพิ่มรางวัลใหม่จากแบบฟอร์มด้านข้าง</p>
            </div>
          ) : (
            <div className={
              cardSize === "compact"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3"
                : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            }>
              {filteredAwards.map((award) => (
                <div 
                  key={award.id} 
                  className="flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-orange-200 transition-all duration-200 group"
                >
                  {/* Image container */}
                  <div className={`w-full ${cardSize === "compact" ? "h-36 sm:h-38" : "h-44 sm:h-48"} bg-slate-100 relative overflow-hidden shrink-0`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={award.imageUrl || "https://placehold.co/600x400/eeeeee/999999?text=No+Image"} 
                      alt={award.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400/eeeeee/999999?text=Image+Not+Found")} 
                    />
                    {award.isHighlight && (
                      <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-yellow-400 text-yellow-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                        <Star className="w-2.5 h-2.5 fill-current text-yellow-950" /> เด่น
                      </div>
                    )}
                    {award.certificateUrl && (
                      <div className="absolute bottom-2 left-2 bg-rose-600/95 backdrop-blur-2xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                        <FileText className="w-3 h-3" /> มีเกียรติบัตร
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className={`${cardSize === "compact" ? "p-3" : "p-3.5"} flex-1 flex flex-col`}>
                    <div className="text-[11px] text-rose-600 font-semibold mb-0.5">
                      {award.date || award.year || '-'}
                    </div>
                    <h3 
                      className="font-bold text-slate-800 line-clamp-1 mb-1 text-xs sm:text-sm group-hover:text-orange-600 transition-colors"
                      title={award.title}
                    >
                      {award.title}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium mb-2 truncate">
                      นักเรียน: <span className="text-slate-900 font-semibold">{award.student}</span>
                    </p>
                    
                    <div className="text-[10px] sm:text-[11px] text-slate-500 mt-auto bg-slate-50/90 p-2 rounded-xl border border-slate-100 space-y-0.5">
                      <div className="truncate"><strong>รางวัล:</strong> {award.awardLevel || '-'}</div>
                      <div className="truncate"><strong>ระดับ:</strong> {award.competitionLevel || '-'}</div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-1.5 mt-2.5 pt-2 border-t border-slate-100">
                      <button 
                        onClick={() => handleEditAward(award)} 
                        className="flex-1 h-7.5 rounded-lg flex items-center justify-center text-xs font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 transition-colors active:scale-95"
                      >
                        <Pencil className="w-3 h-3 mr-1" /> แก้ไข
                      </button>
                      <button 
                        onClick={() => handleDeleteAward(award.id)} 
                        className="flex-1 h-7.5 rounded-lg flex items-center justify-center text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors active:scale-95"
                      >
                        <Trash2 className="w-3 h-3 mr-1" /> ลบ
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

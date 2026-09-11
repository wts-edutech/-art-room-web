"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Pencil, Award, Star } from "lucide-react";


export default function AwardsTab() {
  const [awards, setAwards] = useState<any[]>([]);
  const [awardTitle, setAwardTitle] = useState("");
  const [awardStudent, setAwardStudent] = useState("");
  const [awardDescription, setAwardDescription] = useState("");
  const [awardYear, setAwardYear] = useState("");
  const [awardDate, setAwardDate] = useState("");
  const [awardLevel, setAwardLevel] = useState("");
  const [competitionLevel, setCompetitionLevel] = useState("");
  const [organization, setOrganization] = useState("");
  const [isHighlight, setIsHighlight] = useState(false);
  const [awardImageUrl, setAwardImageUrl] = useState("");
  const [awardImageFile, setAwardImageFile] = useState<File | null>(null);
  const [editingAwardId, setEditingAwardId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/awards");
      const data = await res.json();
      setAwards(data);
    } catch (error) {
      console.error("Failed to fetch", error);
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
    if (!editingAwardId && !awardImageFile && !awardImageUrl) {
      alert("กรุณาเลือกรูปภาพเกียรติบัตร/ผลงาน");
      return;
    }
    
    const formData = new FormData();
    if (editingAwardId) formData.append("id", editingAwardId);
    formData.append("title", awardTitle);
    formData.append("student", awardStudent);
    formData.append("description", awardDescription);
    formData.append("year", awardYear);
    formData.append("date", awardDate);
    formData.append("awardLevel", awardLevel);
    formData.append("competitionLevel", competitionLevel);
    formData.append("organization", organization);
    formData.append("isHighlight", isHighlight.toString());
    
    if (awardImageFile) {
      formData.append("image", awardImageFile);
    } else if (awardImageUrl) {
      formData.append("imageUrl", awardImageUrl);
    }

    try {
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
        const err = await res.json();
        alert(err.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (error) {
      console.error("Failed to save award", error);
      alert("ไม่สามารถบันทึกผลงานได้");
    }
  };

  const resetAwardForm = () => {
    setAwardTitle("");
    setAwardStudent("");
    setAwardDescription("");
    setAwardYear("");
    setAwardDate("");
    setAwardLevel("");
    setCompetitionLevel("");
    setOrganization("");
    setIsHighlight(false);
    setAwardImageUrl("");
    setAwardImageFile(null);
    setEditingAwardId(null);
    const fileInput = document.getElementById("awardImageInput") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleEditAward = (award: any) => {
    setAwardTitle(award.title || "");
    setAwardStudent(award.student || "");
    setAwardDescription(award.description || "");
    setAwardYear(award.year || "");
    setAwardDate(award.date || "");
    setAwardLevel(award.awardLevel || "");
    setCompetitionLevel(award.competitionLevel || "");
    setOrganization(award.organization || "");
    setIsHighlight(!!award.isHighlight);
    setAwardImageUrl(award.imageUrl);
    setAwardImageFile(null);
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

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      {/* Award Form Section */}
      <div className="xl:col-span-1">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-8">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
            {editingAwardId ? <Pencil className="text-blue-600" /> : <Plus className="text-blue-600" />}
            <h2 className="text-lg font-bold text-gray-900">
              {editingAwardId ? "แก้ไขรางวัล" : "เพิ่มรางวัลใหม่"}
            </h2>
          </div>
          <form onSubmit={handleAddAward} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">วันที่ (เช่น 25/07/2569)</label>
              <input type="text" value={awardDate} onChange={(e) => setAwardDate(e.target.value)} placeholder="วว/ดด/ปปปป" className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">ปีที่ได้รับ (เช่น 2569)</label>
              <input type="text" value={awardYear} onChange={(e) => setAwardYear(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">ชื่อกิจกรรม</label>
              <input type="text" required value={awardTitle} onChange={(e) => setAwardTitle(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">ชื่อนักเรียน</label>
              <input type="text" required value={awardStudent} onChange={(e) => setAwardStudent(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">ระดับรางวัล/ผลงาน (เช่น เหรียญทองแดง)</label>
              <input type="text" value={awardLevel} onChange={(e) => setAwardLevel(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">ระดับการแข่งขัน (เช่น ระดับชาติ)</label>
              <input type="text" value={competitionLevel} onChange={(e) => setCompetitionLevel(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">หน่วยงานที่จัด (เช่น EduPLOYS)</label>
              <input type="text" value={organization} onChange={(e) => setOrganization(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">รายละเอียดกิจกรรม</label>
              <textarea value={awardDescription} onChange={(e) => setAwardDescription(e.target.value)} className="w-full h-24 p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm resize-none" />
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
              <input 
                type="checkbox" 
                id="isHighlight" 
                checked={isHighlight} 
                onChange={(e) => setIsHighlight(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="isHighlight" className="text-sm font-medium text-blue-900 cursor-pointer">
                แสดงผลเป็นแบนเนอร์เด่นในหน้ารางวัล
              </label>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                รูปภาพแบนเนอร์/ผลงาน {editingAwardId && <span className="text-xs font-normal text-gray-500">(ไม่ต้องเลือกหากใช้รูปเดิม)</span>}
              </label>
              
              <div className="relative border-2 border-dashed border-indigo-300 bg-indigo-50/50 hover:bg-indigo-50 transition-colors rounded-2xl p-8 text-center cursor-pointer overflow-hidden group">
                <input 
                  id="awardImageInput"
                  type="file" 
                  accept="image/jpeg, image/jpg, image/png"
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
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <span className="text-4xl drop-shadow-sm">☁️</span>
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white shadow-md">
                      <span className="text-2xl drop-shadow-sm leading-none pb-1">⬆️</span>
                    </div>
                  </div>
                  <p className="text-indigo-900 font-medium text-sm mb-1 group-hover:text-blue-700 transition-colors">คลิกหรือลากไฟล์ภาพมาที่นี่</p>
                  <p className="text-indigo-400 text-xs">รองรับไฟล์ JPG, PNG (ไม่เกิน 10MB)</p>
                </div>
              </div>
              
              {/* Image Preview */}
              {awardImageFile ? (
                <div className="mt-3 relative w-full aspect-video bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={URL.createObjectURL(awardImageFile)} alt="preview" className="w-full h-full object-contain" />
                </div>
              ) : editingAwardId && awardImageUrl ? (
                <div className="mt-3 relative w-full aspect-video bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                   {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={awardImageUrl} alt="preview" className="w-full h-full object-contain" onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400/eeeeee/999999?text=Image+Not+Found")} />
                  <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md">รูปเดิม</div>
                </div>
              ) : null}
            </div>
            
            <div className="flex gap-2 pt-4 border-t border-gray-100">
              <Button type="submit" className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white">
                {editingAwardId ? "บันทึก" : "เพิ่ม"}
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
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
            <Award className="text-gray-400" />
            <h2 className="text-lg font-bold text-gray-900">รายการรางวัล ({awards.length})</h2>
          </div>
          {isLoading ? (
            <div className="text-center py-10 text-gray-400">กำลังโหลด...</div>
          ) : awards.length === 0 ? (
            <div className="text-center py-10 text-gray-400">ไม่มีข้อมูล</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Array.isArray(awards) ? awards : []).map((award) => (
                <div key={award.id} className="flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all">
                  <div className="w-full aspect-[3/2] bg-gray-100 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={award.imageUrl} alt={award.title} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400/eeeeee/999999?text=Image+Not+Found")} />
                    {award.isHighlight && (
                      <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded flex items-center gap-1 shadow-sm">
                        <Star className="w-3 h-3 fill-current" /> เด่น
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-gray-900 line-clamp-2 mb-1 text-sm">{award.title}</h3>
                    <p className="text-xs text-gray-500 truncate mb-1">นักเรียน: {award.student}</p>
                    <p className="text-[10px] text-gray-400 mt-auto">รางวัล: {award.awardLevel || '-'} | ระดับ: {award.competitionLevel || '-'}</p>
                    <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                      <button onClick={() => handleEditAward(award)} className="flex-1 h-8 rounded-lg flex items-center justify-center text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors">
                        <Pencil className="w-3 h-3 mr-1" /> แก้ไข
                      </button>
                      <button onClick={() => handleDeleteAward(award.id)} className="flex-1 h-8 rounded-lg flex items-center justify-center text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
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

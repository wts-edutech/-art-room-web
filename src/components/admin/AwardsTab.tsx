"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Pencil, Award } from "lucide-react";


export default function AwardsTab() {
  const [awards, setAwards] = useState<any[]>([]);
  const [awardDate, setAwardDate] = useState("");
  const [awardActivityName, setAwardActivityName] = useState("");
  const [awardName, setAwardName] = useState("");
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
    if (!awardDate || !awardActivityName) return;
    if (!editingAwardId && !awardImageFile && !awardImageUrl) {
      alert("กรุณาเลือกรูปภาพเกียรติบัตร/ผลงาน");
      return;
    }
    
    const formData = new FormData();
    if (editingAwardId) formData.append("id", editingAwardId);
    formData.append("date", awardDate);
    formData.append("activityName", awardActivityName);
    formData.append("award", awardName);
    
    if (awardImageFile) {
      formData.append("image", awardImageFile);
    } else if (awardImageUrl) {
      formData.append("imageUrl", awardImageUrl);
    }

    try {
      const method = editingAwardId ? "PUT" : "POST";
      const res = await fetch("/api/awards", {
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
    setAwardDate("");
    setAwardActivityName("");
    setAwardName("");
    setAwardImageUrl("");
    setAwardImageFile(null);
    setEditingAwardId(null);
    const fileInput = document.getElementById("awardImageInput") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleEditAward = (award: any) => {
    setAwardDate(award.date);
    setAwardActivityName(award.activityName);
    setAwardName(award.award || "");
    setAwardImageUrl(award.imageUrl);
    setAwardImageFile(null);
    setEditingAwardId(award.id);
  };

  const handleDeleteAward = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบผลงานนี้?")) return;
    try {
      const res = await fetch(`/api/awards?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Failed to delete award", error);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Award Form Section */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-8">
                  <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                    {editingAwardId ? <Pencil className="text-blue-600" /> : <Plus className="text-blue-600" />}
                    <h2 className="text-lg font-bold text-gray-900">
                      {editingAwardId ? "แก้ไขรางวัล" : "เพิ่มรางวัลใหม่"}
                    </h2>
                  </div>
                  <form onSubmit={handleAddAward} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">วันที่ (เช่น 24/5/2568)</label>
                      <input type="text" required value={awardDate} onChange={(e) => setAwardDate(e.target.value)} placeholder="วว/ดด/ปปปป" className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">รายการ (กิจกรรม/โครงการ)</label>
                      <input type="text" required value={awardActivityName} onChange={(e) => setAwardActivityName(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">รางวัลที่ได้รับ</label>
                      <input type="text" value={awardName} onChange={(e) => setAwardName(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        รูปภาพเกียรติบัตร {editingAwardId && <span className="text-xs font-normal text-gray-500">(ไม่ต้องเลือกหากใช้รูปเดิม)</span>}
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
              <div className="lg:col-span-2">
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
                    <div className="columns-1 sm:columns-2 gap-4 space-y-4">
                      {awards.map((award) => (
                        <div key={award.id} className="break-inside-avoid flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all">
                          <div className="w-full bg-gray-100 relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={award.imageUrl} alt={award.activityName} className="w-full h-auto object-cover" onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400/eeeeee/999999?text=Image+Not+Found")} />
                          </div>
                          <div className="p-4 flex-1 flex flex-col">
                            <h3 className="font-bold text-gray-900 truncate mb-1 text-sm">{award.activityName}</h3>
                            <p className="text-xs text-gray-500 truncate">รางวัล: {award.award}</p>
                            <p className="text-[10px] text-gray-400 mt-1">วันที่: {award.date}</p>
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

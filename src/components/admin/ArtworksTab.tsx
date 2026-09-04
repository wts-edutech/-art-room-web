"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Pencil, Image, Image as ImageIcon } from "lucide-react";


export default function ArtworksTab() {
  const [artworks, setArtworks] = useState<any[]>([]);
  const [artworkTitle, setArtworkTitle] = useState("");
  const [studentName, setStudentName] = useState("");
  const [grade, setGrade] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingArtworkId, setEditingArtworkId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/artworks");
      const data = await res.json();
      setArtworks(data);
    } catch (error) {
      console.error("Failed to fetch", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddArtwork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artworkTitle || !studentName) return;
    if (!editingArtworkId && !imageFile && !imageUrl) {
      alert("กรุณาเลือกรูปภาพผลงาน");
      return;
    }
    
    const formData = new FormData();
    if (editingArtworkId) formData.append("id", editingArtworkId);
    formData.append("title", artworkTitle);
    formData.append("studentName", studentName);
    formData.append("grade", grade);
    
    if (imageFile) {
      formData.append("image", imageFile);
    } else if (imageUrl) {
      formData.append("imageUrl", imageUrl);
    }

    try {
      const method = editingArtworkId ? "PUT" : "POST";
      const res = await fetch("/api/artworks", {
        method,
        body: formData,
      });
      if (res.ok) {
        resetArtworkForm();
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (error) {
      console.error("Failed to save artwork", error);
      alert("ไม่สามารถบันทึกผลงานได้");
    }
  };

  const resetArtworkForm = () => {
    setArtworkTitle("");
    setStudentName("");
    setGrade("");
    setImageUrl("");
    setImageFile(null);
    setEditingArtworkId(null);
    const fileInput = document.getElementById("artworkImageInput") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleEditArtwork = (artwork: any) => {
    setArtworkTitle(artwork.title);
    setStudentName(artwork.studentName);
    setGrade(artwork.grade || "");
    setImageUrl(artwork.imageUrl);
    setImageFile(null);
    setEditingArtworkId(artwork.id);
  };

  const handleDeleteArtwork = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบผลงานนี้?")) return;
    try {
      const res = await fetch(`/api/artworks?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Failed to delete artwork", error);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Artwork Form Section */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-8">
                  <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                    {editingArtworkId ? <Pencil className="text-blue-600" /> : <Plus className="text-blue-600" />}
                    <h2 className="text-lg font-bold text-gray-900">
                      {editingArtworkId ? "แก้ไขผลงาน" : "เพิ่มผลงานใหม่"}
                    </h2>
                  </div>
                  <form onSubmit={handleAddArtwork} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">ชื่อผลงาน</label>
                      <input type="text" required value={artworkTitle} onChange={(e) => setArtworkTitle(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">ชื่อนักเรียน</label>
                      <input type="text" required value={studentName} onChange={(e) => setStudentName(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">ระดับชั้น (ทางเลือก)</label>
                      <input type="text" value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        รูปภาพผลงาน {editingArtworkId && <span className="text-xs font-normal text-gray-500">(ไม่ต้องเลือกหากใช้รูปเดิม)</span>}
                      </label>
                      
                      <div className="relative border-2 border-dashed border-indigo-300 bg-indigo-50/50 hover:bg-indigo-50 transition-colors rounded-2xl p-8 text-center cursor-pointer overflow-hidden group">
                        <input 
                          id="artworkImageInput"
                          type="file" 
                          accept="image/jpeg, image/jpg, image/png"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setImageFile(e.target.files[0]);
                            } else {
                              setImageFile(null);
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
                      {imageFile ? (
                        <div className="mt-3 relative w-full aspect-video bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={URL.createObjectURL(imageFile)} alt="preview" className="w-full h-full object-contain" />
                        </div>
                      ) : editingArtworkId && imageUrl ? (
                        <div className="mt-3 relative w-full aspect-video bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                           {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={imageUrl} alt="preview" className="w-full h-full object-contain" onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400/eeeeee/999999?text=Image+Not+Found")} />
                          <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md">รูปเดิม</div>
                        </div>
                      ) : null}
                    </div>
                    
                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                      <Button type="submit" className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white">
                        {editingArtworkId ? "บันทึก" : "เพิ่ม"}
                      </Button>
                      {editingArtworkId && (
                        <Button type="button" variant="outline" onClick={resetArtworkForm} className="rounded-xl px-4 border-gray-200">ยกเลิก</Button>
                      )}
                    </div>
                  </form>
                </div>
              </div>

              {/* Artwork List Section */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                    <ImageIcon className="text-gray-400" />
                    <h2 className="text-lg font-bold text-gray-900">รายการผลงาน ({artworks.length})</h2>
                  </div>
                  {isLoading ? (
                    <div className="text-center py-10 text-gray-400">กำลังโหลด...</div>
                  ) : artworks.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">ไม่มีข้อมูล</div>
                  ) : (
                    <div className="columns-1 sm:columns-2 gap-4 space-y-4">
                      {artworks.map((artwork) => (
                        <div key={artwork.id} className="break-inside-avoid flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all">
                          <div className="w-full bg-gray-100 relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={artwork.imageUrl} alt={artwork.title} className="w-full h-auto object-cover" onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400/eeeeee/999999?text=Image+Not+Found")} />
                          </div>
                          <div className="p-4 flex-1 flex flex-col">
                            <h3 className="font-bold text-gray-900 truncate mb-1 text-sm">{artwork.title}</h3>
                            <p className="text-xs text-gray-500 truncate">{artwork.studentName}</p>
                            <p className="text-[10px] text-gray-400 mt-1">{artwork.grade}</p>
                            <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                              <button onClick={() => handleEditArtwork(artwork)} className="flex-1 h-8 rounded-lg flex items-center justify-center text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors">
                                <Pencil className="w-3 h-3 mr-1" /> แก้ไข
                              </button>
                              <button onClick={() => handleDeleteArtwork(artwork.id)} className="flex-1 h-8 rounded-lg flex items-center justify-center text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
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

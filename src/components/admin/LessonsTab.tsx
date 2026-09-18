"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Video, Pencil } from "lucide-react";


export default function LessonsTab() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoId, setVideoId] = useState("");
  const [category, setCategory] = useState("สื่อวิดีทัศน์");
  const [lessonImageFile, setLessonImageFile] = useState<File | null>(null);
  const [lessonImageUrl, setLessonImageUrl] = useState("");
  const [lessonPdfFile, setLessonPdfFile] = useState<File | null>(null);
  const [lessonPdfUrl, setLessonPdfUrl] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/lessons");
      const data = await res.json();
      setLessons(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch", error);
      setLessons([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    
    // Validation
    if (category !== "สื่อภาพ" && category !== "สื่อเอกสาร PDF" && !videoId) {
      alert("กรุณากรอกลิงก์ YouTube");
      return;
    }
    if (category === "สื่อเอกสาร PDF" && !editingId && !lessonPdfFile && !lessonPdfUrl) {
      alert("กรุณาเลือกไฟล์ PDF");
      return;
    }
    if (category === "สื่อภาพ" && !editingId && !lessonImageFile && !lessonImageUrl) {
      alert("กรุณาเลือกรูปภาพสื่อการสอน");
      return;
    }

    const formData = new FormData();
    if (editingId) formData.append("id", editingId);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    if (category === "สื่อเอกสาร PDF") {
      if (lessonPdfFile) formData.append("pdfFile", lessonPdfFile);
      else if (lessonPdfUrl) formData.append("pdfUrl", lessonPdfUrl);
    }
    
    if (category !== "สื่อภาพ" && category !== "สื่อเอกสาร PDF") {
      let finalVideoId = videoId;
      if (videoId.includes("v=")) {
        finalVideoId = videoId.split("v=")[1].split("&")[0];
      } else if (videoId.includes("youtu.be/")) {
        finalVideoId = videoId.split("youtu.be/")[1].split("?")[0];
      }
      formData.append("videoId", finalVideoId);
    } else {
      if (lessonImageFile) {
        formData.append("image", lessonImageFile);
      } else if (lessonImageUrl) {
        formData.append("imageUrl", lessonImageUrl);
      }
    }

    try {
      const method = editingId ? "PUT" : "POST";
      const res = await fetch("/api/lessons", {
        method,
        body: formData,
      });
      if (res.ok) {
        resetLessonForm();
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (error) {
      console.error("Failed to save lesson", error);
      alert("ไม่สามารถบันทึกบทเรียนได้");
    }
  };

  const resetLessonForm = () => {
    setTitle("");
    setDescription("");
    setVideoId("");
    setCategory("สื่อวิดีทัศน์");
    setLessonImageFile(null);
    setLessonImageUrl("");
    setLessonPdfFile(null);
    setLessonPdfUrl("");
    const pdfInput = document.getElementById("lessonPdfInput") as HTMLInputElement;
    if (pdfInput) pdfInput.value = "";
    setEditingId(null);
    const fileInput = document.getElementById("lessonImageInput") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleEditLesson = (lesson: any) => {
    setTitle(lesson.title);
    setDescription(lesson.description);
    setCategory(lesson.category || "สื่อวิดีทัศน์");
    setVideoId(lesson.videoId ? `https://youtube.com/watch?v=${lesson.videoId}` : "");
    setLessonImageUrl(lesson.imageUrl || "");
    setLessonImageFile(null);
    setEditingId(lesson.id);
  };

  const handleDeleteLesson = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบบทเรียนนี้?")) return;
    try {
      const res = await fetch(`/api/lessons?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Failed to delete lesson", error);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Lesson Form Section */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-8">
                  <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                    {editingId ? <Pencil className="text-orange-500" /> : <Plus className="text-orange-500" />}
                    <h2 className="text-lg font-bold text-gray-900">
                      {editingId ? "แก้ไขบทเรียน" : "เพิ่มบทเรียนใหม่"}
                    </h2>
                  </div>
                  <form onSubmit={handleAddLesson} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">หมวดหมู่</label>
                      <select 
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)} 
                        className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-sm bg-white"
                      >
                        <option value="สื่อวิดีทัศน์">สื่อวิดีทัศน์ (YouTube)</option>
                        <option value="สื่อภาพ">สื่อภาพ (อัปโหลดรูป)</option>
                        <option value="สื่อแนะนำ">สื่อแนะนำ</option>
                      <option value="สื่อเอกสาร PDF">สื่อเอกสาร PDF</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">ชื่อสื่อการสอน</label>
                      <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">รายละเอียด</label>
                      <textarea required value={description} onChange={(e) => setDescription(e.target.value)} className="w-full h-20 p-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-sm resize-none" />
                    </div>
                    
                    {category === "สื่อเอกสาร PDF" ? (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">ไฟล์ PDF *</label>
                        <input
                          type="file"
                          id="lessonPdfInput"
                          accept=".pdf"
                          onChange={(e) => setLessonPdfFile(e.target.files ? e.target.files[0] : null)}
                          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-600 hover:file:bg-red-100"
                        />
                        {lessonPdfUrl && !lessonPdfFile && (
                          <p className="text-sm text-green-600">ไฟล์ที่อัปโหลดไว้แล้ว: {lessonPdfUrl.split("/").pop()}</p>
                        )}
                      </div>
                    ) : category !== "สื่อภาพ" ? (
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">ลิงก์ YouTube (หรือ ID)</label>
                        <input type="text" required={category !== "สื่อภาพ"} value={videoId} onChange={(e) => setVideoId(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-sm" />
                      </div>
                    ) : (
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">
                          รูปภาพสื่อการสอน {editingId && <span className="text-xs font-normal text-gray-500">(ไม่ต้องเลือกหากใช้รูปเดิม)</span>}
                        </label>
                        <div className="relative border-2 border-dashed border-orange-300 bg-orange-50/50 hover:bg-orange-50 transition-colors rounded-2xl p-6 text-center cursor-pointer overflow-hidden group">
                          <input 
                            id="lessonImageInput"
                            type="file" 
                            accept="image/jpeg, image/jpg, image/png"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setLessonImageFile(e.target.files[0]);
                              } else {
                                setLessonImageFile(null);
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div className="flex flex-col items-center justify-center relative z-0">
                            <span className="text-2xl drop-shadow-sm mb-2">🖼️</span>
                            <p className="text-orange-900 font-medium text-sm mb-1 group-hover:text-orange-600 transition-colors">คลิกหรือลากไฟล์ภาพมาที่นี่</p>
                          </div>
                        </div>
                        {lessonImageFile ? (
                          <div className="mt-3 relative w-full aspect-video bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={URL.createObjectURL(lessonImageFile)} alt="preview" className="w-full h-full object-contain" />
                          </div>
                        ) : editingId && lessonImageUrl ? (
                          <div className="mt-3 relative w-full aspect-video bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={lessonImageUrl} alt="preview" className="w-full h-full object-contain" onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400/eeeeee/999999?text=Image+Not+Found")} />
                            <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-xl">รูปเดิม</div>
                          </div>
                        ) : null}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button type="submit" className="flex-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-white">
                        {editingId ? "บันทึก" : "เพิ่ม"}
                      </Button>
                      {editingId && (
                        <Button type="button" variant="outline" onClick={resetLessonForm} className="rounded-xl px-4 border-gray-200">ยกเลิก</Button>
                      )}
                    </div>
                  </form>
                </div>
              </div>

              {/* Lesson List Section */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                    <Video className="text-gray-400" />
                    <h2 className="text-lg font-bold text-gray-900">รายการสื่อการสอน ({lessons.length})</h2>
                  </div>
                  {isLoading ? (
                    <div className="text-center py-10 text-gray-400">กำลังโหลด...</div>
                  ) : lessons.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">ไม่มีข้อมูล</div>
                  ) : (
                    <div className="space-y-3">
                      {(Array.isArray(lessons) ? lessons : []).map((lesson) => (
                        <div key={lesson.id} className="flex gap-4 p-3 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group bg-gray-50/50">
                          <div className="w-32 h-20 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0 relative border border-gray-200/50">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={lesson.category === "สื่อภาพ" ? lesson.imageUrl : `https://img.youtube.com/vi/${lesson.videoId}/mqdefault.jpg`} 
                              alt="thumbnail" 
                              className="w-full h-full object-cover" 
                              onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400/eeeeee/999999?text=Image+Not+Found")}
                            />
                            <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-sm text-white text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                              {lesson.category || "สื่อวิดีทัศน์"}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0 py-1">
                            <h3 className="font-bold text-gray-900 truncate text-sm">{lesson.title}</h3>
                            <p className="text-xs text-gray-500 line-clamp-1 mt-1">{lesson.description}</p>
                            <div className="text-[10px] text-gray-400 mt-2 bg-white px-2 py-0.5 rounded border border-gray-100 inline-block">ID: {lesson.id}</div>
                          </div>
                          <div className="flex flex-col justify-center gap-1 flex-shrink-0 px-2">
                            <button onClick={() => handleEditLesson(lesson)} className="w-8 h-8 rounded-2xl flex items-center justify-center text-orange-500 hover:bg-orange-100 transition-colors" title="แก้ไข">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteLesson(lesson.id)} className="w-8 h-8 rounded-2xl flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors" title="ลบ">
                              <Trash2 className="w-4 h-4" />
                            </button>
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

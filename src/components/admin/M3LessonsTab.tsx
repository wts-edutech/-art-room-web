"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Video, Pencil, Eye, EyeOff } from "lucide-react";

export default function M3LessonsTab() {
  const [m3Lessons, setM3Lessons] = useState<any[]>([]);
  const [m3Title, setM3Title] = useState("");
  const [m3Description, setM3Description] = useState("");
  const [m3VideoId, setM3VideoId] = useState("");
  const [m3Category, setM3Category] = useState("สื่อวิดีทัศน์");
  const [m3LessonImageFile, setM3LessonImageFile] = useState<File | null>(null);
  const [m3LessonImageUrl, setM3LessonImageUrl] = useState("");
  const [m3LessonPdfFile, setM3LessonPdfFile] = useState<File | null>(null);
  const [m3LessonPdfUrl, setM3LessonPdfUrl] = useState("");
  const [editingM3Id, setEditingM3Id] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Front-end Visibility Status State
  const [isM3Enabled, setIsM3Enabled] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/m3-lessons");
      const data = await res.json();
      setM3Lessons(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch", error);
      setM3Lessons([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/m3-lessons/status");
      const data = await res.json();
      if (data && typeof data.enabled === "boolean") {
        setIsM3Enabled(data.enabled);
      }
    } catch (e) {
      console.error("Failed to fetch m3 lessons status", e);
    }
  };

  useEffect(() => {
    fetchData();
    fetchStatus();
  }, []);

  const handleToggleStatus = async () => {
    const nextState = !isM3Enabled;
    const confirmMsg = nextState 
      ? "คุณต้องการ 'เปิดใช้งาน' เมนูสื่อการสอน ม.3 ให้แสดงผลบนหน้าเว็บไซต์สาธารณะใช่หรือไม่?" 
      : "คุณต้องการ 'ปิด/ซ่อน' เมนูสื่อการสอน ม.3 ออกจากหน้าเว็บไซต์ชั่วคราวใช่หรือไม่?";

    if (!confirm(confirmMsg)) return;

    setIsTogglingStatus(true);
    try {
      const res = await fetch("/api/m3-lessons/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: nextState })
      });
      const data = await res.json();
      if (res.ok) {
        setIsM3Enabled(nextState);
        alert(data.message || (nextState ? "เปิดการแสดงผลในระบบหน้าบ้านเรียบร้อยแล้ว" : "ปิดการแสดงผลในระบบหน้าบ้านแล้ว"));
      } else {
        alert(data.error || "เกิดข้อผิดพลาดในการเปลี่ยนสถานะ");
      }
    } catch (e) {
      console.error("Toggle error", e);
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleAddM3Lesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!m3Title || !m3Description) return;
    
    // Validation
    if (m3Category !== "สื่อภาพ" && !m3VideoId) {
      alert("กรุณากรอกลิงก์ YouTube");
      return;
    }
    if (m3Category === "สื่อเอกสาร PDF" && !editingM3Id && !m3LessonPdfFile && !m3LessonPdfUrl) {
      alert("กรุณาเลือกไฟล์ PDF");
      return;
    }
    if (m3Category === "สื่อภาพ" && !editingM3Id && !m3LessonImageFile && !m3LessonImageUrl) {
      alert("กรุณาเลือกรูปภาพสื่อการสอน");
      return;
    }

    const formData = new FormData();
    if (editingM3Id) formData.append("id", editingM3Id);
    formData.append("title", m3Title);
    formData.append("description", m3Description);
    formData.append("m3Category", m3Category);
    
    if (m3Category !== "สื่อภาพ" && m3Category !== "สื่อเอกสาร PDF") {
      let finalVideoId = m3VideoId;
      if (m3VideoId.includes("v=")) {
        finalVideoId = m3VideoId.split("v=")[1].split("&")[0];
      } else if (m3VideoId.includes("youtu.be/")) {
        finalVideoId = m3VideoId.split("youtu.be/")[1].split("?")[0];
      }
      formData.append("m3VideoId", finalVideoId);
    } else {
      if (m3LessonImageFile) {
        formData.append("image", m3LessonImageFile);
      } else if (m3LessonImageUrl) {
        formData.append("imageUrl", m3LessonImageUrl);
      }
    }

    try {
      const res = await fetch("/api/m3-lessons", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        resetM3LessonForm();
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

  const resetM3LessonForm = () => {
    setM3Title("");
    setM3Description("");
    setM3VideoId("");
    setM3Category("สื่อวิดีทัศน์");
    setM3LessonImageFile(null);
    setM3LessonImageUrl("");
    setM3LessonPdfFile(null);
    setM3LessonPdfUrl("");
    const m3PdfInput = document.getElementById("m3LessonPdfInput") as HTMLInputElement;
    if (m3PdfInput) m3PdfInput.value = "";
    setEditingM3Id(null);
    const fileInput = document.getElementById("m3LessonImageInput") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleEditM3Lesson = (lesson: any) => {
    setM3Title(lesson.title || lesson.m3Title || "");
    setM3Description(lesson.description || lesson.m3Description || "");
    setM3Category(lesson.category || lesson.m3Category || "สื่อวิดีทัศน์");
    setM3VideoId(lesson.videoId || lesson.m3VideoId ? `https://youtube.com/watch?v=${lesson.videoId || lesson.m3VideoId}` : "");
    setM3LessonImageUrl(lesson.imageUrl || "");
    setM3LessonImageFile(null);
    setEditingM3Id(lesson.id);
  };

  const handleDeleteM3Lesson = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบบทเรียนนี้?")) return;
    try {
      const res = await fetch(`/api/m3-lessons?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Failed to delete lesson", error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Front-end Visibility Control Box (สวิตช์ เปิด-ปิด ระบบหน้าบ้าน) */}
      <div className={`p-6 sm:p-7 rounded-3xl border transition-all shadow-xs ${
        isM3Enabled 
          ? "bg-emerald-50/70 border-emerald-200" 
          : "bg-amber-50/70 border-amber-200"
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-start gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              isM3Enabled 
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/30" 
                : "bg-amber-500 text-white shadow-md shadow-amber-500/30"
            }`}>
              {isM3Enabled ? <Eye className="w-6 h-6" /> : <EyeOff className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  {isM3Enabled ? "เปิดการแสดงผลในระบบหน้าบ้านแล้ว" : "ปิดการแสดงผลหน้าบ้านชั่วคราว (ซ่อนอยู่)"}
                </h3>
                <span className={`text-xs font-bold px-3 py-0.5 rounded-full ${
                  isM3Enabled 
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300" 
                    : "bg-amber-100 text-amber-800 border border-amber-300"
                }`}>
                  {isM3Enabled ? "🟢 ออนไลน์สู่สาธารณะ" : "🔒 ซ่อนอยู่ (เฉพาะหลังบ้าน)"}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed max-w-2xl">
                {isM3Enabled
                  ? "ปุ่ม 'สื่อการสอน (ม.3)' กำลังแสดงอยู่บนแถบเมนูด้านบนและหน้าคลังสื่อการสอน บุคคลทั่วไปและนักเรียนสามารถเข้าชมได้ตามปกติ"
                  : "ปุ่ม 'สื่อการสอน (ม.3)' ถูกซ่อนไว้จากหน้าเว็บหลัก บุคคลทั่วไปจะไม่เห็นเมนูนี้ คุณครูสามารถจัดการและเพิ่มข้อมูลได้ เมื่อพร้อมให้กดเปิดสวิตช์"}
              </p>
            </div>
          </div>

          {/* Big Toggle Switch Button */}
          <button
            type="button"
            disabled={isTogglingStatus}
            onClick={handleToggleStatus}
            className={`h-12 px-6 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all cursor-pointer shadow-md self-start sm:self-center disabled:opacity-50 whitespace-nowrap flex-shrink-0 ${
              isM3Enabled
                ? "bg-red-600 hover:bg-red-700 text-white shadow-red-600/20"
                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
            }`}
          >
            {isTogglingStatus ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>กำลังบันทึก...</span>
              </div>
            ) : (
              <>
                <div className={`w-3 h-3 rounded-full ${isM3Enabled ? "bg-white animate-pulse" : "bg-emerald-200 animate-pulse"}`}></div>
                <span>{isM3Enabled ? "กดเพื่อปิด / ซ่อนหน้าบ้าน" : "กดเพื่อเปิดใช้งานหน้าบ้าน"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid Layout for Form and List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lesson Form Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-8">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
              {editingM3Id ? <Pencil className="text-orange-500" /> : <Plus className="text-orange-500" />}
              <h2 className="text-lg font-bold text-gray-900">
                {editingM3Id ? "แก้ไขบทเรียน ม.3" : "เพิ่มบทเรียน ม.3 ใหม่"}
              </h2>
            </div>
            <form onSubmit={handleAddM3Lesson} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">หมวดหมู่</label>
                <select 
                  value={m3Category} 
                  onChange={(e) => setM3Category(e.target.value)} 
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
                <input type="text" required value={m3Title} onChange={(e) => setM3Title(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">รายละเอียด</label>
                <textarea required value={m3Description} onChange={(e) => setM3Description(e.target.value)} className="w-full h-20 p-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-sm resize-none" />
              </div>
              
              {m3Category === "สื่อเอกสาร PDF" ? (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">ไฟล์ PDF *</label>
                  <input
                    type="file"
                    id="m3LessonPdfInput"
                    accept=".pdf"
                    onChange={(e) => setM3LessonPdfFile(e.target.files ? e.target.files[0] : null)}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-600 hover:file:bg-red-100"
                  />
                  {m3LessonPdfUrl && !m3LessonPdfFile && (
                    <p className="text-sm text-green-600">ไฟล์ที่อัปโหลดไว้แล้ว: {m3LessonPdfUrl.split("/").pop()}</p>
                  )}
                </div>
              ) : m3Category !== "สื่อภาพ" ? (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">ลิงก์ YouTube (หรือ ID)</label>
                  <input type="text" required={m3Category !== "สื่อภาพ"} value={m3VideoId} onChange={(e) => setM3VideoId(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-sm" />
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    รูปภาพสื่อการสอน {editingM3Id && <span className="text-xs font-normal text-gray-500">(ไม่ต้องเลือกหากใช้รูปเดิม)</span>}
                  </label>
                  <div className="relative border-2 border-dashed border-orange-300 bg-orange-50/50 hover:bg-orange-50 transition-colors rounded-2xl p-6 text-center cursor-pointer overflow-hidden group">
                    <input 
                      id="m3LessonImageInput"
                      type="file" 
                      accept="image/jpeg, image/jpg, image/png"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setM3LessonImageFile(e.target.files[0]);
                        } else {
                          setM3LessonImageFile(null);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center justify-center relative z-0">
                      <span className="text-2xl drop-shadow-sm mb-2">🖼️</span>
                      <p className="text-orange-900 font-medium text-sm mb-1 group-hover:text-orange-600 transition-colors">คลิกหรือลากไฟล์ภาพมาที่นี่</p>
                    </div>
                  </div>
                  {m3LessonImageFile ? (
                    <div className="mt-3 relative w-full aspect-video bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={URL.createObjectURL(m3LessonImageFile)} alt="preview" className="w-full h-full object-contain" />
                    </div>
                  ) : editingM3Id && m3LessonImageUrl ? (
                    <div className="mt-3 relative w-full aspect-video bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m3LessonImageUrl} alt="preview" className="w-full h-full object-contain" onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400/eeeeee/999999?text=Image+Not+Found")} />
                      <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-xl">รูปเดิม</div>
                    </div>
                  ) : null}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-white">
                  {editingM3Id ? "บันทึกการแก้ไข" : "เพิ่มบทเรียน ม.3"}
                </Button>
                {editingM3Id && (
                  <Button type="button" variant="outline" onClick={resetM3LessonForm} className="rounded-xl px-4 border-gray-200">ยกเลิก</Button>
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
              <h2 className="text-lg font-bold text-gray-900">รายการสื่อการสอน ม.3 ({m3Lessons.length})</h2>
            </div>
            {isLoading ? (
              <div className="text-center py-10 text-gray-400">กำลังโหลด...</div>
            ) : m3Lessons.length === 0 ? (
              <div className="text-center py-10 text-gray-400">ยังไม่มีบทเรียน ม.3</div>
            ) : (
              <div className="space-y-3">
                {(Array.isArray(m3Lessons) ? m3Lessons : []).map((lesson) => (
                  <div key={lesson.id} className="flex gap-4 p-3 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group bg-gray-50/50">
                    <div className="w-32 h-20 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0 relative border border-gray-200/50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={lesson.category === "สื่อภาพ" || lesson.m3Category === "สื่อภาพ" ? (lesson.imageUrl || "") : `https://img.youtube.com/vi/${lesson.videoId || lesson.m3VideoId}/mqdefault.jpg`} 
                        alt="thumbnail" 
                        className="w-full h-full object-cover" 
                        onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400/eeeeee/999999?text=Image+Not+Found")}
                      />
                      <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-sm text-white text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                        {lesson.category || lesson.m3Category || "สื่อวิดีทัศน์"}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 py-1">
                      <h3 className="font-bold text-gray-900 truncate text-sm">{lesson.title || lesson.m3Title}</h3>
                      <p className="text-xs text-gray-500 line-clamp-1 mt-1">{lesson.description || lesson.m3Description}</p>
                      <div className="text-[10px] text-gray-400 mt-2 bg-white px-2 py-0.5 rounded border border-gray-100 inline-block">ID: {lesson.id}</div>
                    </div>
                    <div className="flex flex-col justify-center gap-1 flex-shrink-0 px-2">
                      <button onClick={() => handleEditM3Lesson(lesson)} className="w-8 h-8 rounded-2xl flex items-center justify-center text-orange-500 hover:bg-orange-100 transition-colors" title="แก้ไข">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteM3Lesson(lesson.id)} className="w-8 h-8 rounded-2xl flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors" title="ลบ">
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
    </div>
  );
}

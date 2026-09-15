"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Video, Pencil, Eye, EyeOff } from "lucide-react";

export default function M4LessonsTab() {
  const [m4Lessons, setM4Lessons] = useState<any[]>([]);
  const [m4Title, setM4Title] = useState("");
  const [m4Description, setM4Description] = useState("");
  const [m4VideoId, setM4VideoId] = useState("");
  const [m4Category, setM4Category] = useState("สื่อวิดีทัศน์");
  const [m4LessonImageFile, setM4LessonImageFile] = useState<File | null>(null);
  const [m4LessonImageUrl, setM4LessonImageUrl] = useState("");
  const [m4LessonPdfFile, setM4LessonPdfFile] = useState<File | null>(null);
  const [m4LessonPdfUrl, setM4LessonPdfUrl] = useState("");
  const [editingM4Id, setEditingM4Id] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Front-end Visibility Status State
  const [isM4Enabled, setIsM4Enabled] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/m4-lessons");
      const data = await res.json();
      setM4Lessons(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch", error);
      setM4Lessons([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/m4-lessons/status");
      const data = await res.json();
      if (data && typeof data.enabled === "boolean") {
        setIsM4Enabled(data.enabled);
      }
    } catch (e) {
      console.error("Failed to fetch m4 lessons status", e);
    }
  };

  useEffect(() => {
    fetchData();
    fetchStatus();
  }, []);

  const handleToggleStatus = async () => {
    const nextState = !isM4Enabled;
    const confirmMsg = nextState 
      ? "คุณต้องการ 'เปิดใช้งาน' เมนูสื่อการสอน ม.4 ให้แสดงผลบนหน้าเว็บไซต์สาธารณะใช่หรือไม่?" 
      : "คุณต้องการ 'ปิด/ซ่อน' เมนูสื่อการสอน ม.4 ออกจากหน้าเว็บไซต์ชั่วคราวใช่หรือไม่?";

    if (!confirm(confirmMsg)) return;

    setIsTogglingStatus(true);
    try {
      const res = await fetch("/api/m4-lessons/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: nextState })
      });
      const data = await res.json();
      if (res.ok) {
        setIsM4Enabled(nextState);
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

  const handleAddM4Lesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!m4Title || !m4Description) return;
    
    // Validation
    if (m4Category !== "สื่อภาพ" && !m4VideoId) {
      alert("กรุณากรอกลิงก์ YouTube");
      return;
    }
    if (m4Category === "สื่อเอกสาร PDF" && !editingM4Id && !m4LessonPdfFile && !m4LessonPdfUrl) {
      alert("กรุณาเลือกไฟล์ PDF");
      return;
    }
    if (m4Category === "สื่อภาพ" && !editingM4Id && !m4LessonImageFile && !m4LessonImageUrl) {
      alert("กรุณาเลือกรูปภาพสื่อการสอน");
      return;
    }

    const formData = new FormData();
    if (editingM4Id) formData.append("id", editingM4Id);
    formData.append("title", m4Title);
    formData.append("description", m4Description);
    formData.append("m4Category", m4Category);
    
    if (m4Category !== "สื่อภาพ" && m4Category !== "สื่อเอกสาร PDF") {
      let finalVideoId = m4VideoId;
      if (m4VideoId.includes("v=")) {
        finalVideoId = m4VideoId.split("v=")[1].split("&")[0];
      } else if (m4VideoId.includes("youtu.be/")) {
        finalVideoId = m4VideoId.split("youtu.be/")[1].split("?")[0];
      }
      formData.append("m4VideoId", finalVideoId);
    } else {
      if (m4LessonImageFile) {
        formData.append("image", m4LessonImageFile);
      } else if (m4LessonImageUrl) {
        formData.append("imageUrl", m4LessonImageUrl);
      }
    }

    try {
      const res = await fetch("/api/m4-lessons", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        resetM4LessonForm();
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

  const resetM4LessonForm = () => {
    setM4Title("");
    setM4Description("");
    setM4VideoId("");
    setM4Category("สื่อวิดีทัศน์");
    setM4LessonImageFile(null);
    setM4LessonImageUrl("");
    setM4LessonPdfFile(null);
    setM4LessonPdfUrl("");
    const m4PdfInput = document.getElementById("m4LessonPdfInput") as HTMLInputElement;
    if (m4PdfInput) m4PdfInput.value = "";
    setEditingM4Id(null);
    const fileInput = document.getElementById("m4LessonImageInput") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleEditM4Lesson = (lesson: any) => {
    setM4Title(lesson.title || lesson.m4Title || "");
    setM4Description(lesson.description || lesson.m4Description || "");
    setM4Category(lesson.category || lesson.m4Category || "สื่อวิดีทัศน์");
    setM4VideoId(lesson.videoId || lesson.m4VideoId ? `https://youtube.com/watch?v=${lesson.videoId || lesson.m4VideoId}` : "");
    setM4LessonImageUrl(lesson.imageUrl || "");
    setM4LessonImageFile(null);
    setEditingM4Id(lesson.id);
  };

  const handleDeleteM4Lesson = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบบทเรียนนี้?")) return;
    try {
      const res = await fetch(`/api/m4-lessons?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Failed to delete lesson", error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Front-end Visibility Control Box (สวิตช์ เปิด-ปิด ระบบหน้าบ้าน) */}
      <div className={`p-6 sm:p-7 rounded-3xl border transition-all shadow-xs ${
        isM4Enabled 
          ? "bg-emerald-50/70 border-emerald-200" 
          : "bg-amber-50/70 border-amber-200"
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-start gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              isM4Enabled 
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/30" 
                : "bg-amber-500 text-white shadow-md shadow-amber-500/30"
            }`}>
              {isM4Enabled ? <Eye className="w-6 h-6" /> : <EyeOff className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  {isM4Enabled ? "เปิดการแสดงผลในระบบหน้าบ้านแล้ว" : "ปิดการแสดงผลหน้าบ้านชั่วคราว (ซ่อนอยู่)"}
                </h3>
                <span className={`text-xs font-bold px-3 py-0.5 rounded-full ${
                  isM4Enabled 
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300" 
                    : "bg-amber-100 text-amber-800 border border-amber-300"
                }`}>
                  {isM4Enabled ? "🟢 ออนไลน์สู่สาธารณะ" : "🔒 ซ่อนอยู่ (เฉพาะหลังบ้าน)"}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed max-w-2xl">
                {isM4Enabled
                  ? "ปุ่ม 'สื่อการสอน (ม.4)' กำลังแสดงอยู่บนแถบเมนูด้านบนและหน้าคลังสื่อการสอน บุคคลทั่วไปและนักเรียนสามารถเข้าชมได้ตามปกติ"
                  : "ปุ่ม 'สื่อการสอน (ม.4)' ถูกซ่อนไว้จากหน้าเว็บหลัก บุคคลทั่วไปจะไม่เห็นเมนูนี้ คุณครูสามารถจัดการและเพิ่มข้อมูลได้ เมื่อพร้อมให้กดเปิดสวิตช์"}
              </p>
            </div>
          </div>

          {/* Big Toggle Switch Button */}
          <button
            type="button"
            disabled={isTogglingStatus}
            onClick={handleToggleStatus}
            className={`h-12 px-6 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all cursor-pointer shadow-md self-start sm:self-center disabled:opacity-50 whitespace-nowrap flex-shrink-0 ${
              isM4Enabled
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
                <div className={`w-3 h-3 rounded-full ${isM4Enabled ? "bg-white animate-pulse" : "bg-emerald-200 animate-pulse"}`}></div>
                <span>{isM4Enabled ? "กดเพื่อปิด / ซ่อนหน้าบ้าน" : "กดเพื่อเปิดใช้งานหน้าบ้าน"}</span>
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
              {editingM4Id ? <Pencil className="text-orange-500" /> : <Plus className="text-orange-500" />}
              <h2 className="text-lg font-bold text-gray-900">
                {editingM4Id ? "แก้ไขบทเรียน ม.4" : "เพิ่มบทเรียน ม.4 ใหม่"}
              </h2>
            </div>
            <form onSubmit={handleAddM4Lesson} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">หมวดหมู่</label>
                <select 
                  value={m4Category} 
                  onChange={(e) => setM4Category(e.target.value)} 
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
                <input type="text" required value={m4Title} onChange={(e) => setM4Title(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">รายละเอียด</label>
                <textarea required value={m4Description} onChange={(e) => setM4Description(e.target.value)} className="w-full h-20 p-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-sm resize-none" />
              </div>
              
              {m4Category === "สื่อเอกสาร PDF" ? (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">ไฟล์ PDF *</label>
                  <input
                    type="file"
                    id="m4LessonPdfInput"
                    accept=".pdf"
                    onChange={(e) => setM4LessonPdfFile(e.target.files ? e.target.files[0] : null)}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-600 hover:file:bg-red-100"
                  />
                  {m4LessonPdfUrl && !m4LessonPdfFile && (
                    <p className="text-sm text-green-600">ไฟล์ที่อัปโหลดไว้แล้ว: {m4LessonPdfUrl.split("/").pop()}</p>
                  )}
                </div>
              ) : m4Category !== "สื่อภาพ" ? (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">ลิงก์ YouTube (หรือ ID)</label>
                  <input type="text" required={m4Category !== "สื่อภาพ"} value={m4VideoId} onChange={(e) => setM4VideoId(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-sm" />
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    รูปภาพสื่อการสอน {editingM4Id && <span className="text-xs font-normal text-gray-500">(ไม่ต้องเลือกหากใช้รูปเดิม)</span>}
                  </label>
                  <div className="relative border-2 border-dashed border-orange-300 bg-orange-50/50 hover:bg-orange-50 transition-colors rounded-2xl p-6 text-center cursor-pointer overflow-hidden group">
                    <input 
                      id="m4LessonImageInput"
                      type="file" 
                      accept="image/jpeg, image/jpg, image/png"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setM4LessonImageFile(e.target.files[0]);
                        } else {
                          setM4LessonImageFile(null);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center justify-center relative z-0">
                      <span className="text-2xl drop-shadow-sm mb-2">🖼️</span>
                      <p className="text-orange-900 font-medium text-sm mb-1 group-hover:text-orange-600 transition-colors">คลิกหรือลากไฟล์ภาพมาที่นี่</p>
                    </div>
                  </div>
                  {m4LessonImageFile ? (
                    <div className="mt-3 relative w-full aspect-video bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={URL.createObjectURL(m4LessonImageFile)} alt="preview" className="w-full h-full object-contain" />
                    </div>
                  ) : editingM4Id && m4LessonImageUrl ? (
                    <div className="mt-3 relative w-full aspect-video bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m4LessonImageUrl} alt="preview" className="w-full h-full object-contain" onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400/eeeeee/999999?text=Image+Not+Found")} />
                      <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-xl">รูปเดิม</div>
                    </div>
                  ) : null}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-white">
                  {editingM4Id ? "บันทึกการแก้ไข" : "เพิ่มบทเรียน ม.4"}
                </Button>
                {editingM4Id && (
                  <Button type="button" variant="outline" onClick={resetM4LessonForm} className="rounded-xl px-4 border-gray-200">ยกเลิก</Button>
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
              <h2 className="text-lg font-bold text-gray-900">รายการสื่อการสอน ม.4 ({m4Lessons.length})</h2>
            </div>
            {isLoading ? (
              <div className="text-center py-10 text-gray-400">กำลังโหลด...</div>
            ) : m4Lessons.length === 0 ? (
              <div className="text-center py-10 text-gray-400">ยังไม่มีบทเรียน ม.4</div>
            ) : (
              <div className="space-y-3">
                {(Array.isArray(m4Lessons) ? m4Lessons : []).map((lesson) => (
                  <div key={lesson.id} className="flex gap-4 p-3 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group bg-gray-50/50">
                    <div className="w-32 h-20 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0 relative border border-gray-200/50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={lesson.category === "สื่อภาพ" || lesson.m4Category === "สื่อภาพ" ? (lesson.imageUrl || "") : `https://img.youtube.com/vi/${lesson.videoId || lesson.m4VideoId}/mqdefault.jpg`} 
                        alt="thumbnail" 
                        className="w-full h-full object-cover" 
                        onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400/eeeeee/999999?text=Image+Not+Found")}
                      />
                      <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-sm text-white text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                        {lesson.category || lesson.m4Category || "สื่อวิดีทัศน์"}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 py-1">
                      <h3 className="font-bold text-gray-900 truncate text-sm">{lesson.title || lesson.m4Title}</h3>
                      <p className="text-xs text-gray-500 line-clamp-1 mt-1">{lesson.description || lesson.m4Description}</p>
                      <div className="text-[10px] text-gray-400 mt-2 bg-white px-2 py-0.5 rounded border border-gray-100 inline-block">ID: {lesson.id}</div>
                    </div>
                    <div className="flex flex-col justify-center gap-1 flex-shrink-0 px-2">
                      <button onClick={() => handleEditM4Lesson(lesson)} className="w-8 h-8 rounded-2xl flex items-center justify-center text-orange-500 hover:bg-orange-100 transition-colors" title="แก้ไข">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteM4Lesson(lesson.id)} className="w-8 h-8 rounded-2xl flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors" title="ลบ">
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

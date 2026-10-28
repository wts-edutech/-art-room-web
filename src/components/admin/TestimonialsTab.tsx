"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { 
  Trash2, 
  Plus, 
  Pencil, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Loader2, 
  UploadCloud, 
  RotateCcw 
} from "lucide-react";

import { optimizeImageToFile } from "@/lib/image-optimizer";

export default function TestimonialsTab() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [testimonialName, setTestimonialName] = useState("");
  const [testimonialUniv, setTestimonialUniv] = useState("");
  const [testimonialQuote, setTestimonialQuote] = useState("");
  const [testimonialImageUrl, setTestimonialImageUrl] = useState("");
  const [testimonialImageFile, setTestimonialImageFile] = useState<File | null>(null);
  const [testimonialUnivImageUrl, setTestimonialUnivImageUrl] = useState("");
  const [testimonialUnivImageFile, setTestimonialUnivImageFile] = useState<File | null>(null);
  const [editingTestimonialId, setEditingTestimonialId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPhotoRemoved, setIsPhotoRemoved] = useState(false);
  const [isUnivLogoRemoved, setIsUnivLogoRemoved] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const formRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/testimonials");
      const data = await res.json();
      setTestimonials(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch", error);
      setTestimonials([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testimonialName.trim() || !testimonialUniv.trim() || !testimonialQuote.trim()) {
      setStatusMessage({ type: "error", text: "กรุณากรอกข้อมูลชื่อ มหาวิทยาลัย และข้อความรีวิวให้ครบถ้วน" });
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);
    
    try {
      const formData = new FormData();
      if (editingTestimonialId) formData.append("id", editingTestimonialId);
      formData.append("name", testimonialName.trim());
      formData.append("university", testimonialUniv.trim());
      formData.append("quote", testimonialQuote.trim());
      
      // Handle Student Photo
      if (testimonialImageFile) {
        const compressed = await optimizeImageToFile(testimonialImageFile, { maxWidth: 1600, maxHeight: 1600, quality: 0.82 });
        formData.append("imageUrl", compressed);
      } else if (isPhotoRemoved) {
        formData.append("imageUrl", "__CLEAR__");
      } else if (testimonialImageUrl) {
        formData.append("imageUrl", testimonialImageUrl);
      }

      // Handle University Logo
      if (testimonialUnivImageFile) {
        const compressedUniv = await optimizeImageToFile(testimonialUnivImageFile, { maxWidth: 1600, maxHeight: 1600, quality: 0.82 });
        formData.append("univImageUrl", compressedUniv);
      } else if (isUnivLogoRemoved) {
        formData.append("univImageUrl", "__CLEAR__");
      } else if (testimonialUnivImageUrl) {
        formData.append("univImageUrl", testimonialUnivImageUrl);
      }

      const method = editingTestimonialId ? "PUT" : "POST";
      const res = await fetch("/api/testimonials", {
        method,
        body: formData,
      });

      const resData = await res.json().catch(() => ({}));

      if (res.ok) {
        setStatusMessage({
          type: "success",
          text: editingTestimonialId ? "บันทึกการแก้ไขรีวิวเรียบร้อยแล้ว!" : "เพิ่มข้อมูลรีวิวรุ่นพี่สำเร็จแล้ว!",
        });
        await fetchData();
        resetTestimonialForm();
      } else {
        setStatusMessage({
          type: "error",
          text: resData?.error || "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
        });
      }
    } catch (error) {
      console.error("Failed to save testimonial", error);
      setStatusMessage({
        type: "error",
        text: "เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetTestimonialForm = () => {
    setTestimonialName("");
    setTestimonialUniv("");
    setTestimonialQuote("");
    setTestimonialImageUrl("");
    setTestimonialImageFile(null);
    setTestimonialUnivImageUrl("");
    setTestimonialUnivImageFile(null);
    setIsPhotoRemoved(false);
    setIsUnivLogoRemoved(false);
    setEditingTestimonialId(null);
    const fileInput = document.getElementById("testimonialImageInput") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
    const univInput = document.getElementById("testimonialUnivImageInput") as HTMLInputElement;
    if (univInput) univInput.value = "";
  };

  const handleEditTestimonial = (testimonial: any) => {
    setStatusMessage(null);
    setTestimonialName(testimonial.name || "");
    setTestimonialUniv(testimonial.university || "");
    setTestimonialQuote(testimonial.quote || "");
    setTestimonialImageUrl(testimonial.imageUrl || "");
    setTestimonialImageFile(null);
    setTestimonialUnivImageUrl(testimonial.univImageUrl || "");
    setTestimonialUnivImageFile(null);
    setIsPhotoRemoved(false);
    setIsUnivLogoRemoved(false);
    setEditingTestimonialId(testimonial.id);

    // Smooth scroll to form
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleRemovePhoto = () => {
    setTestimonialImageFile(null);
    setTestimonialImageUrl("");
    setIsPhotoRemoved(true);
    const fileInput = document.getElementById("testimonialImageInput") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleRemoveUnivLogo = () => {
    setTestimonialUnivImageFile(null);
    setTestimonialUnivImageUrl("");
    setIsUnivLogoRemoved(true);
    const univInput = document.getElementById("testimonialUnivImageInput") as HTMLInputElement;
    if (univInput) univInput.value = "";
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบรีวิวนี้? การกระทำนี้ไม่สามารถย้อนกลับได้")) return;
    try {
      const res = await fetch(`/api/testimonials?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        if (editingTestimonialId === id) resetTestimonialForm();
        setStatusMessage({ type: "success", text: "ลบรีวิวเรียบร้อยแล้ว" });
        fetchData();
      } else {
        setStatusMessage({ type: "error", text: "ไม่สามารถลบรีวิวได้ กรุณาลองใหม่อีกครั้ง" });
      }
    } catch (error) {
      console.error("Failed to delete testimonial", error);
      setStatusMessage({ type: "error", text: "เกิดข้อผิดพลาดในการเชื่อมต่อ" });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-prompt">
      {/* Testimonial Form Section */}
      <div className="lg:col-span-1" ref={formRef}>
        <div className="bg-white rounded-2xl p-5 shadow-2xs border border-gray-200 sticky top-4">
          <div className="flex items-center justify-between gap-2 mb-4 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              {editingTestimonialId ? (
                <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
              )}
              <h2 className="text-sm sm:text-base font-bold font-kanit text-gray-900">
                {editingTestimonialId ? "แก้ไขรีวิว" : "เพิ่มรีวิวรุ่นพี่"}
              </h2>
            </div>
            {editingTestimonialId && (
              <span className="text-[11px] font-medium bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full border border-orange-200">
                โหมดแก้ไข
              </span>
            )}
          </div>

          {/* Status Message Notification */}
          {statusMessage && (
            <div className={`p-3 mb-3.5 rounded-xl text-xs flex items-center justify-between font-medium ${
              statusMessage.type === "success" 
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                : "bg-red-50 text-red-800 border border-red-200"
            }`}>
              <div className="flex items-center gap-2">
                {statusMessage.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
              <button 
                type="button" 
                onClick={() => setStatusMessage(null)}
                className="text-gray-400 hover:text-gray-600 ml-2"
                title="ปิด"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <form onSubmit={handleAddTestimonial} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">ชื่อรุ่นพี่ (เช่น พี่บอย)</label>
              <input 
                type="text" 
                required 
                value={testimonialName} 
                onChange={(e) => setTestimonialName(e.target.value)} 
                placeholder="ชื่อ-นามสกุล หรือชื่อเล่น"
                className="w-full h-9 px-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-xs transition-colors" 
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">มหาวิทยาลัย / คณะ / สถานะ</label>
              <input 
                type="text" 
                required 
                value={testimonialUniv} 
                onChange={(e) => setTestimonialUniv(e.target.value)} 
                placeholder="เช่น จุฬาลงกรณ์มหาวิทยาลัย คณะศิลปกรรมศาสตร์"
                className="w-full h-9 px-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-xs transition-colors" 
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">ข้อความรีวิว / คำแนะนำ</label>
              <textarea 
                required 
                value={testimonialQuote} 
                onChange={(e) => setTestimonialQuote(e.target.value)} 
                placeholder="ความรู้สึก ความประทับใจ หรือคำแนะนำรุ่นน้อง..."
                className="w-full h-24 p-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none resize-none text-xs leading-relaxed transition-colors" 
              />
            </div>

            {/* Student Photo Section */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                รูปภาพรุ่นพี่ {editingTestimonialId && <span className="text-[11px] font-normal text-slate-400">(เว้นว่างหากใช้รูปเดิม)</span>}
              </label>
              
              <div className="relative border border-dashed border-orange-200 bg-orange-50/40 hover:bg-orange-50/70 transition-colors rounded-xl p-3 text-center cursor-pointer overflow-hidden group">
                <input 
                  id="testimonialImageInput"
                  type="file" 
                  accept="image/*,image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setIsPhotoRemoved(false);
                      setTestimonialImageFile(e.target.files[0]);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex items-center justify-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center">
                    <UploadCloud className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-slate-700 font-semibold text-xs group-hover:text-orange-600 transition-colors">
                    {testimonialImageFile ? "เปลี่ยนรูปโปรไฟล์ใหม่" : "เลือกรูปโปรไฟล์รุ่นพี่"}
                  </span>
                </div>
              </div>
              
              {/* Image Preview & Delete Button */}
              {(testimonialImageFile || (!isPhotoRemoved && editingTestimonialId && testimonialImageUrl)) ? (
                <div className="mt-2.5 flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-2xs shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={testimonialImageFile ? URL.createObjectURL(testimonialImageFile) : testimonialImageUrl} 
                      alt="preview" 
                      className="w-full h-full object-cover" 
                      onError={(e) => (e.currentTarget.src = "https://placehold.co/150x150/eeeeee/999999?text=Image+Not+Found")}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-slate-800 truncate">
                      {testimonialImageFile ? testimonialImageFile.name : "รูปโปรไฟล์ปัจจุบัน"}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {testimonialImageFile ? `${(testimonialImageFile.size / 1024).toFixed(1)} KB` : "บันทึกอยู่ในระบบ"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="ลบรูปโปรไฟล์นี้"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : isPhotoRemoved ? (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-700">
                  <span className="text-[11px] font-medium">⚠️ จะลบรูปโปรไฟล์เมื่อกดบันทึก</span>
                  <button
                    type="button"
                    onClick={() => setIsPhotoRemoved(false)}
                    className="text-[10px] text-amber-800 underline hover:text-amber-900 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> ยกเลิกการลบ
                  </button>
                </div>
              ) : null}
            </div>

            {/* University Logo Section */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                ตรามหาวิทยาลัย / คณะ {editingTestimonialId && <span className="text-[11px] font-normal text-slate-400">(เว้นว่างหากใช้รูปเดิม)</span>}
              </label>
              
              <div className="relative border border-dashed border-gray-300 bg-gray-50/70 hover:bg-gray-100/80 transition-colors rounded-xl p-3 text-center cursor-pointer overflow-hidden group">
                <input 
                  id="testimonialUnivImageInput"
                  type="file" 
                  accept="image/*,image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setIsUnivLogoRemoved(false);
                      setTestimonialUnivImageFile(e.target.files[0]);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex items-center justify-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gray-200 text-gray-700 flex items-center justify-center">
                    <UploadCloud className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-slate-700 font-semibold text-xs group-hover:text-orange-600 transition-colors">
                    {testimonialUnivImageFile ? "เปลี่ยนตรามหาวิทยาลัยใหม่" : "เลือกรูปตรามหาวิทยาลัย (PNG)"}
                  </span>
                </div>
              </div>
              
              {/* Univ Image Preview & Delete Button */}
              {(testimonialUnivImageFile || (!isUnivLogoRemoved && editingTestimonialId && testimonialUnivImageUrl)) ? (
                <div className="mt-2.5 flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="relative w-12 h-12 bg-white rounded-lg overflow-hidden border border-gray-200 shadow-2xs flex justify-center items-center shrink-0 p-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={testimonialUnivImageFile ? URL.createObjectURL(testimonialUnivImageFile) : testimonialUnivImageUrl} 
                      alt="univ preview" 
                      className="max-h-full max-w-full object-contain" 
                      onError={(e) => (e.currentTarget.src = "https://placehold.co/150x150/eeeeee/999999?text=Logo+Not+Found")}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-slate-800 truncate">
                      {testimonialUnivImageFile ? testimonialUnivImageFile.name : "ตรามหาวิทยาลัยปัจจุบัน"}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {testimonialUnivImageFile ? `${(testimonialUnivImageFile.size / 1024).toFixed(1)} KB` : "บันทึกอยู่ในระบบ"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveUnivLogo}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="ลบตรามหาวิทยาลัยนี้"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : isUnivLogoRemoved ? (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-700">
                  <span className="text-[11px] font-medium">⚠️ จะลบตรามหาวิทยาลัยเมื่อกดบันทึก</span>
                  <button
                    type="button"
                    onClick={() => setIsUnivLogoRemoved(false)}
                    className="text-[10px] text-amber-800 underline hover:text-amber-900 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> ยกเลิกการลบ
                  </button>
                </div>
              ) : null}
            </div>
            
            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <Button 
                type="submit" 
                disabled={isSaving}
                className="flex-1 h-9 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>กำลังบันทึกข้อมูล...</span>
                  </>
                ) : (
                  <span>{editingTestimonialId ? "บันทึกการแก้ไข" : "เพิ่มรีวิว"}</span>
                )}
              </Button>
              {editingTestimonialId && (
                <Button 
                  type="button" 
                  variant="outline" 
                  disabled={isSaving}
                  onClick={resetTestimonialForm} 
                  className="h-9 rounded-xl px-3 border-gray-200 text-xs font-medium cursor-pointer"
                >
                  ยกเลิก
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
      
      {/* Testimonials List Section */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl shadow-2xs border border-gray-200 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
            <h2 className="text-sm sm:text-base font-bold font-kanit text-gray-900 flex items-center gap-2">
              <BookOpen className="text-orange-500 w-4 h-4" /> 
              รายการรีวิวทั้งหมด
            </h2>
            <span className="text-xs font-semibold text-gray-600 bg-white px-2.5 py-1 rounded-full border border-gray-200 shadow-2xs">
              {testimonials.length} รายการ
            </span>
          </div>
          {isLoading ? (
            <div className="text-center py-12 text-gray-400 text-xs font-medium flex flex-col items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
              <span>กำลังโหลดข้อมูลรีวิว...</span>
            </div>
          ) : testimonials.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs font-medium">ไม่มีข้อมูลรีวิวในระบบ</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {(Array.isArray(testimonials) ? testimonials : []).map((testimonial) => {
                const isSelected = editingTestimonialId === testimonial.id;
                return (
                  <div 
                    key={testimonial.id} 
                    className={`p-4 sm:p-5 transition-colors flex flex-col sm:flex-row gap-4 items-start ${
                      isSelected ? "bg-orange-50/60 ring-2 ring-orange-400/80 rounded-xl m-1.5" : "hover:bg-orange-50/20"
                    }`}
                  >
                    <div className="w-14 h-14 bg-gray-100 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-xs self-center sm:self-start">
                      {testimonial.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={testimonial.imageUrl} 
                          alt={testimonial.name} 
                          className="w-full h-full object-cover" 
                          onError={(e) => (e.currentTarget.src = "https://placehold.co/150x150/eeeeee/999999?text=No+Photo")}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 flex flex-col min-w-0 w-full">
                      <div className="flex justify-between items-start gap-2 mb-1.5">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold font-kanit text-gray-900 text-sm sm:text-base leading-snug">
                              {testimonial.name}
                            </h3>
                            {isSelected && (
                              <span className="text-[10px] font-semibold bg-orange-500 text-white px-2 py-0.5 rounded-full">
                                กำลังแก้ไข
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {testimonial.univImageUrl && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img 
                                src={testimonial.univImageUrl} 
                                alt="Univ Logo" 
                                className="w-4 h-4 object-contain inline-block shrink-0" 
                              />
                            )}
                            <p className="text-xs font-semibold text-orange-600 truncate">{testimonial.university}</p>
                          </div>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button 
                            onClick={() => handleEditTestimonial(testimonial)} 
                            className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                              isSelected ? "bg-orange-500 text-white shadow-xs" : "text-orange-600 bg-orange-50 hover:bg-orange-100"
                            }`}
                            title="แก้ไขรีวิว"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteTestimonial(testimonial.id)} 
                            className="h-7 w-7 rounded-lg flex items-center justify-center text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                            title="ลบรีวิว"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="relative mt-1">
                        <span className="text-3xl text-gray-200 absolute -top-3 -left-1 select-none font-serif leading-none">&ldquo;</span>
                        <p className="text-xs text-slate-600 relative z-10 pl-3 leading-relaxed break-words">{testimonial.quote}</p>
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
  );
}

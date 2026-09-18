"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Pencil, BookOpen } from "lucide-react";


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
    if (!testimonialName || !testimonialUniv || !testimonialQuote) return;
    
    try {
      const formData = new FormData();
      if (editingTestimonialId) formData.append("id", editingTestimonialId);
      formData.append("name", testimonialName);
      formData.append("university", testimonialUniv);
      formData.append("quote", testimonialQuote);
      
      if (testimonialImageFile) {
        const compressed = await optimizeImageToFile(testimonialImageFile, { maxWidth: 1600, maxHeight: 1600, quality: 0.82 });
        formData.append("image", compressed);
      } else if (testimonialImageUrl) {
        formData.append("imageUrl", testimonialImageUrl);
      }

      if (testimonialUnivImageFile) {
        const compressedUniv = await optimizeImageToFile(testimonialUnivImageFile, { maxWidth: 1600, maxHeight: 1600, quality: 0.82 });
        formData.append("univImageUrl", compressedUniv);
      } else if (testimonialUnivImageUrl) {
        formData.append("univImageUrl", testimonialUnivImageUrl);
      }

      const method = editingTestimonialId ? "PUT" : "POST";
      const res = await fetch("/api/testimonials", {
        method,
        body: formData,
      });

      if (res.ok) {
        fetchData();
        resetTestimonialForm();
      } else {
        alert("Failed to save testimonial");
      }
    } catch (error) {
      console.error("Failed to save testimonial", error);
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
    setEditingTestimonialId(null);
    const fileInput = document.getElementById("testimonialImageInput") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
    const univInput = document.getElementById("testimonialUnivImageInput") as HTMLInputElement;
    if (univInput) univInput.value = "";
  };

  const handleEditTestimonial = (testimonial: any) => {
    setTestimonialName(testimonial.name);
    setTestimonialUniv(testimonial.university);
    setTestimonialQuote(testimonial.quote);
    setTestimonialImageUrl(testimonial.imageUrl);
    setTestimonialImageFile(null);
    setTestimonialUnivImageUrl(testimonial.univImageUrl || "");
    setTestimonialUnivImageFile(null);
    setEditingTestimonialId(testimonial.id);
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบรีวิวนี้?")) return;
    try {
      const res = await fetch(`/api/testimonials?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Failed to delete testimonial", error);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-prompt">
      {/* Testimonial Form Section */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl p-5 shadow-2xs border border-gray-200 sticky top-4">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
            {editingTestimonialId ? <Pencil className="text-orange-500 w-4 h-4" /> : <Plus className="text-orange-500 w-4 h-4" />}
            <h2 className="text-sm sm:text-base font-bold font-kanit text-gray-900">
              {editingTestimonialId ? "แก้ไขรีวิว" : "เพิ่มรีวิวรุ่นพี่"}
            </h2>
          </div>
          <form onSubmit={handleAddTestimonial} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">ชื่อรุ่นพี่ (เช่น พี่บอย)</label>
              <input 
                type="text" 
                required 
                value={testimonialName} 
                onChange={(e) => setTestimonialName(e.target.value)} 
                placeholder="ชื่อ-นามสกุล หรือชื่อเล่น"
                className="w-full h-9 px-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-xs" 
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
                className="w-full h-9 px-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-xs" 
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">ข้อความรีวิว / คำแนะนำ</label>
              <textarea 
                required 
                value={testimonialQuote} 
                onChange={(e) => setTestimonialQuote(e.target.value)} 
                placeholder="ความรู้สึก ความประทับใจ หรือคำแนะนำรุ่นน้อง..."
                className="w-full h-20 p-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none resize-none text-xs leading-relaxed" 
              />
            </div>

            {/* Student Photo */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                รูปภาพรุ่นพี่ {editingTestimonialId && <span className="text-[11px] font-normal text-slate-400">(เว้นว่างหากใช้รูปเดิม)</span>}
              </label>
              
              <div className="relative border border-dashed border-orange-200 bg-orange-50/40 hover:bg-orange-50/70 transition-colors rounded-xl p-3 text-center cursor-pointer overflow-hidden group">
                <input 
                  id="testimonialImageInput"
                  type="file" 
                  accept="image/jpeg, image/jpg, image/png"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setTestimonialImageFile(e.target.files[0]);
                    } else {
                      setTestimonialImageFile(null);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex items-center justify-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-slate-700 font-semibold text-xs group-hover:text-orange-600 transition-colors">เลือกรูปโปรไฟล์รุ่นพี่</span>
                </div>
              </div>
              
              {/* Image Preview */}
              {testimonialImageFile ? (
                <div className="mt-2 relative w-16 h-16 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-2xs mx-auto">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={URL.createObjectURL(testimonialImageFile)} alt="preview" className="w-full h-full object-cover" />
                </div>
              ) : editingTestimonialId && testimonialImageUrl ? (
                <div className="mt-2 relative w-16 h-16 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-2xs mx-auto">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={testimonialImageUrl} alt="preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = "https://placehold.co/150x150/eeeeee/999999?text=Image+Not+Found")} />
                </div>
              ) : null}
            </div>

            {/* University Logo */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                ตรามหาวิทยาลัย / คณะ {editingTestimonialId && <span className="text-[11px] font-normal text-slate-400">(เว้นว่างหากใช้รูปเดิม)</span>}
              </label>
              
              <div className="relative border border-dashed border-gray-300 bg-gray-50/70 hover:bg-gray-100/80 transition-colors rounded-xl p-3 text-center cursor-pointer overflow-hidden group">
                <input 
                  id="testimonialUnivImageInput"
                  type="file" 
                  accept="image/jpeg, image/jpg, image/png"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setTestimonialUnivImageFile(e.target.files[0]);
                    } else {
                      setTestimonialUnivImageFile(null);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex items-center justify-center gap-2">
                  <span className="text-slate-700 font-semibold text-xs group-hover:text-orange-600 transition-colors">เลือกรูปตรามหาวิทยาลัย (PNG)</span>
                </div>
              </div>
              
              {/* Univ Image Preview */}
              {testimonialUnivImageFile ? (
                <div className="mt-2 relative w-20 h-14 bg-gray-50 rounded-xl overflow-hidden border border-gray-200 shadow-2xs flex justify-center items-center mx-auto p-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={URL.createObjectURL(testimonialUnivImageFile)} alt="preview" className="h-full w-auto object-contain" />
                </div>
              ) : editingTestimonialId && testimonialUnivImageUrl ? (
                <div className="mt-2 relative w-20 h-14 bg-gray-50 rounded-xl overflow-hidden border border-gray-200 shadow-2xs flex justify-center items-center mx-auto p-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={testimonialUnivImageUrl} alt="preview" className="h-full w-auto object-contain" />
                </div>
              ) : null}
            </div>
            
            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <Button type="submit" className="flex-1 h-9 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-xs">
                {editingTestimonialId ? "บันทึกการแก้ไข" : "เพิ่มรีวิว"}
              </Button>
              {editingTestimonialId && (
                <Button type="button" variant="outline" onClick={resetTestimonialForm} className="h-9 rounded-xl px-3 border-gray-200 text-xs font-medium">
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
            <div className="text-center py-12 text-gray-400 text-xs font-medium">กำลังโหลด...</div>
          ) : testimonials.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs font-medium">ไม่มีข้อมูลรีวิวในระบบ</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {(Array.isArray(testimonials) ? testimonials : []).map((testimonial) => (
                <div key={testimonial.id} className="p-4 sm:p-5 hover:bg-orange-50/30 transition-colors flex flex-col sm:flex-row gap-4 items-start">
                  <div className="w-14 h-14 bg-gray-100 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-xs self-center sm:self-start">
                    {testimonial.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={testimonial.imageUrl} alt={testimonial.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-1.5">
                      <div>
                        <h3 className="font-bold font-kanit text-gray-900 text-sm sm:text-base leading-snug">{testimonial.name}</h3>
                        <p className="text-xs font-semibold text-orange-600">{testimonial.university}</p>
                      </div>
                      <div className="flex gap-1.5">
                        <button 
                          onClick={() => handleEditTestimonial(testimonial)} 
                          className="h-7 w-7 rounded-lg flex items-center justify-center text-orange-600 bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer"
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
                      <p className="text-xs text-slate-600 relative z-10 pl-3 leading-relaxed">{testimonial.quote}</p>
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

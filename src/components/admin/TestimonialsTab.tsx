"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Pencil, BookOpen } from "lucide-react";


export default function TestimonialsTab() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [testimonialName, setTestimonialName] = useState("");
  const [testimonialUniv, setTestimonialUniv] = useState("");
  const [testimonialQuote, setTestimonialQuote] = useState("");
  const [testimonialImageUrl, setTestimonialImageUrl] = useState("");
  const [testimonialImageFile, setTestimonialImageFile] = useState<File | null>(null);
  const [editingTestimonialId, setEditingTestimonialId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/testimonials");
      const data = await res.json();
      setTestimonials(data);
    } catch (error) {
      console.error("Failed to fetch", error);
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
        formData.append("image", testimonialImageFile);
      } else if (testimonialImageUrl) {
        formData.append("imageUrl", testimonialImageUrl);
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
    setEditingTestimonialId(null);
    const fileInput = document.getElementById("testimonialImageInput") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleEditTestimonial = (testimonial: any) => {
    setTestimonialName(testimonial.name);
    setTestimonialUniv(testimonial.university);
    setTestimonialQuote(testimonial.quote);
    setTestimonialImageUrl(testimonial.imageUrl);
    setTestimonialImageFile(null);
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Testimonial Form Section */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-8">
                  <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                    {editingTestimonialId ? <Pencil className="text-blue-600" /> : <Plus className="text-blue-600" />}
                    <h2 className="text-lg font-bold text-gray-900">
                      {editingTestimonialId ? "แก้ไขรีวิว" : "เพิ่มรีวิวรุ่นพี่"}
                    </h2>
                  </div>
                  <form onSubmit={handleAddTestimonial} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">ชื่อรุ่นพี่ (เช่น พี่บอย)</label>
                      <input type="text" required value={testimonialName} onChange={(e) => setTestimonialName(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">มหาวิทยาลัย / คณะ / สถานะ</label>
                      <input type="text" required value={testimonialUniv} onChange={(e) => setTestimonialUniv(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">ข้อความรีวิว</label>
                      <textarea required value={testimonialQuote} onChange={(e) => setTestimonialQuote(e.target.value)} className="w-full h-24 p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none text-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        รูปภาพรุ่นพี่ {editingTestimonialId && <span className="text-xs font-normal text-gray-500">(ไม่ต้องเลือกหากใช้รูปเดิม)</span>}
                      </label>
                      
                      <div className="relative border-2 border-dashed border-indigo-300 bg-indigo-50/50 hover:bg-indigo-50 transition-colors rounded-2xl p-6 text-center cursor-pointer overflow-hidden group">
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
                        <div className="flex flex-col items-center justify-center relative z-0">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <span className="text-4xl drop-shadow-sm">👤</span>
                          </div>
                          <p className="text-indigo-900 font-medium text-sm mb-1 group-hover:text-blue-700 transition-colors">คลิกหรือลากรูปภาพมาที่นี่</p>
                          <p className="text-indigo-400 text-xs">ไฟล์รูปโปรไฟล์ (สี่เหลี่ยมจัตุรัสจะสวยที่สุด)</p>
                        </div>
                      </div>
                      
                      {/* Image Preview */}
                      {testimonialImageFile ? (
                        <div className="mt-3 relative w-full h-32 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-inner flex justify-center items-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={URL.createObjectURL(testimonialImageFile)} alt="preview" className="h-full w-auto object-cover" />
                        </div>
                      ) : editingTestimonialId && testimonialImageUrl ? (
                        <div className="mt-3 relative w-full h-32 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-inner flex justify-center items-center">
                           {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={testimonialImageUrl} alt="preview" className="h-full w-auto object-cover" onError={(e) => (e.currentTarget.src = "https://placehold.co/150x150/eeeeee/999999?text=Image+Not+Found")} />
                        </div>
                      ) : null}
                    </div>
                    
                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                      <Button type="submit" className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white">
                        {editingTestimonialId ? "บันทึก" : "เพิ่มรีวิว"}
                      </Button>
                      {editingTestimonialId && (
                        <Button type="button" variant="outline" onClick={resetTestimonialForm} className="rounded-xl px-4 border-gray-200">ยกเลิก</Button>
                      )}
                    </div>
                  </form>
                </div>
              </div>
              
              {/* Testimonials List Section */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <BookOpen className="text-blue-500 w-5 h-5" /> 
                      รายการรีวิวทั้งหมด
                    </h2>
                    <span className="text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                      ทั้งหมด {testimonials.length} รายการ
                    </span>
                  </div>
                  {isLoading ? (
                    <div className="text-center py-10 text-gray-400">กำลังโหลด...</div>
                  ) : testimonials.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">ไม่มีข้อมูลรีวิว</div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {(Array.isArray(testimonials) ? testimonials : []).map((testimonial) => (
                        <div key={testimonial.id} className="p-6 hover:bg-blue-50/30 transition-colors flex flex-col sm:flex-row gap-6 items-start">
                          <div className="w-20 h-20 bg-gray-100 rounded-full overflow-hidden flex-shrink-0 border-2 border-white shadow-sm self-center sm:self-start">
                            {testimonial.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={testimonial.imageUrl} alt={testimonial.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-bold text-gray-900 text-lg">{testimonial.name}</h3>
                                <p className="text-sm font-medium text-blue-600">{testimonial.university}</p>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => handleEditTestimonial(testimonial)} className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors">
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDeleteTestimonial(testimonial.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <div className="relative">
                              <span className="text-4xl text-gray-200 absolute -top-4 -left-2 select-none font-serif">"</span>
                              <p className="text-sm text-gray-600 relative z-10 pl-4">{testimonial.quote}</p>
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

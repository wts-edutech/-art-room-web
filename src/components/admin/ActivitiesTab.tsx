"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Pencil, Calendar, Camera, ImageIcon } from "lucide-react";

import { optimizeImageToFile } from "@/lib/image-optimizer";

export default function ActivitiesTab() {
  const [activitiesList, setActivitiesList] = useState<any[]>([]);
  const [activityTitle, setActivityTitle] = useState("");
  const [activityDesc, setActivityDesc] = useState("");
  const [activityDate, setActivityDate] = useState("");
  const [activityTime, setActivityTime] = useState("");
  const [activityLocation, setActivityLocation] = useState("");
  const [activityCategory, setActivityCategory] = useState("ทั่วไป");
  const [activityColor, setActivityColor] = useState("red");
  const [activityImageUrl, setActivityImageUrl] = useState("");
  const [activityImageFiles, setActivityImageFiles] = useState<File[]>([]);
  const [activityExistingImages, setActivityExistingImages] = useState<string[]>([]);
  const [coverImageId, setCoverImageId] = useState<string>("");
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/activities");
      const data = await res.json();
      setActivitiesList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch", error);
      setActivitiesList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityTitle || !activityDate) return;
    
    const formData = new FormData();
    if (editingActivityId) formData.append("id", editingActivityId);
    formData.append("title", activityTitle);
    formData.append("description", activityDesc || "");
    formData.append("date", activityDate);
    formData.append("time", activityTime || "");
    formData.append("location", activityLocation || "");
    formData.append("category", activityCategory || "ทั่วไป");
    formData.append("color", activityColor || "red");
    
    for (let i = 0; i < activityImageFiles.length; i++) {
      const file = activityImageFiles[i];
      const compressed = await optimizeImageToFile(file, { maxWidth: 1600, maxHeight: 1600, quality: 0.82 });
      formData.append("images", compressed);
      if (coverImageId === `new-${i}` || (!coverImageId && i === 0 && activityExistingImages.length === 0)) {
        formData.append("image", compressed);
      }
    }
    activityExistingImages.forEach((url, i) => {
      formData.append("existingImages", url);
      if (coverImageId === `existing-${i}` || (!coverImageId && i === 0)) {
        formData.append("imageUrl", url);
      }
    });

    try {
      const method = editingActivityId ? "PUT" : "POST";
      const res = await fetch("/api/activities", {
        method,
        body: formData,
      });
      if (res.ok) {
        resetActivityForm();
        fetchData();
      } else {
        const err = (await res.json()) as any;
        alert(err.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (error) {
      console.error("Failed to save activity", error);
      alert("ไม่สามารถบันทึกกิจกรรมได้");
    }
  };

  const resetActivityForm = () => {
    setActivityTitle("");
    setActivityDesc("");
    setActivityDate("");
    setActivityTime("");
    setActivityLocation("");
    setActivityCategory("ทั่วไป");
    setActivityColor("red");
    setActivityImageUrl("");
    setActivityImageFiles([]);
    setActivityExistingImages([]);
    setCoverImageId("");
    setEditingActivityId(null);
    const fileInput = document.getElementById("activityImageInput") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleEditActivity = (activity: any) => {
    setActivityTitle(activity.title || "");
    setActivityDesc(activity.description || "");
    setActivityDate(activity.date || "");
    setActivityTime(activity.time || "");
    setActivityLocation(activity.location || "");
    setActivityCategory(activity.category || "ทั่วไป");
    setActivityColor(activity.color || "red");
    setActivityImageUrl(activity.imageUrl || "");
    setActivityImageFiles([]);
    let existing: string[] = [];
    try {
      existing = activity.images ? JSON.parse(activity.images) : [];
    } catch(e) {
      if (activity.imageUrl) existing = [activity.imageUrl];
    }
    setActivityExistingImages(existing);
    
    // Set initial cover image ID based on imageUrl
    if (activity.imageUrl) {
      const idx = existing.indexOf(activity.imageUrl);
      if (idx !== -1) setCoverImageId(`existing-${idx}`);
      else if (existing.length > 0) setCoverImageId(`existing-0`);
    } else if (existing.length > 0) {
      setCoverImageId(`existing-0`);
    } else {
      setCoverImageId("");
    }
    
    setEditingActivityId(activity.id);
  };

  const handleDeleteActivity = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบกิจกรรมนี้?")) return;
    try {
      const res = await fetch(`/api/activities?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Failed to delete activity", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Information Banner */}
      <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-100/50 rounded-2xl p-4 sm:p-5 border border-orange-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold shadow-sm shadow-orange-500/20 shrink-0">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold font-kanit text-gray-900">
              จัดการอัลบั้มภาพกิจกรรม & นิทรรศการ (Photo Gallery Showcase)
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              อัปโหลดภาพกิจกรรม การประกวด นิทรรศการ และภาพบรรยากาศการเรียนรู้ที่จะแสดงในหน้า /activities
            </p>
          </div>
        </div>
        <div className="text-xs text-orange-700 bg-white/90 border border-orange-200/90 rounded-xl px-3 py-1.5 font-medium shrink-0 flex items-center gap-1.5 shadow-2xs">
          <span>📅 ส่วนปฏิทินกิจกรรมย้ายไปอยู่ที่แท็บ <strong>จัดการข่าวสาร & ปฏิทิน</strong> แล้ว</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Form Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-5 shadow-2xs border border-gray-200 sticky top-4">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
              {editingActivityId ? <Pencil className="text-orange-500 w-4 h-4" /> : <Plus className="text-orange-500 w-4 h-4" />}
              <h2 className="text-sm sm:text-base font-bold font-kanit text-gray-900">
                {editingActivityId ? "แก้ไขกิจกรรม" : "เพิ่มกิจกรรมใหม่"}
              </h2>
            </div>
            <form onSubmit={handleAddActivity} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">หัวข้อกิจกรรม</label>
                <input 
                  type="text" 
                  required 
                  value={activityTitle} 
                  onChange={(e) => setActivityTitle(e.target.value)} 
                  placeholder="เช่น นิทรรศการศิลปะร่วมสมัย..."
                  className="w-full h-9 px-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-xs" 
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">รายละเอียดกิจกรรม</label>
                <textarea 
                  required 
                  value={activityDesc} 
                  onChange={(e) => setActivityDesc(e.target.value)} 
                  placeholder="รายละเอียดกิจกรรม กำหนดการ..."
                  className="w-full h-20 p-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none resize-none text-xs" 
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">วันที่ (เช่น 12 ตุลาคม 2566)</label>
                <input 
                  type="text" 
                  required 
                  value={activityDate} 
                  onChange={(e) => setActivityDate(e.target.value)} 
                  placeholder="ระบุวันที่จัดกิจกรรม"
                  className="w-full h-9 px-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-xs" 
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">สถานที่ (ไม่บังคับ)</label>
                <input 
                  type="text" 
                  value={activityLocation} 
                  onChange={(e) => setActivityLocation(e.target.value)} 
                  placeholder="เช่น โรงเรียนวชิรธรรมสาธิต" 
                  className="w-full h-9 px-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-xs" 
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">เวลา (เช่น 09:00 - 12:00 น.)</label>
                  <input 
                    type="text" 
                    value={activityTime} 
                    onChange={(e) => setActivityTime(e.target.value)} 
                    placeholder="เช่น 09:00 หรือ ตลอดวัน" 
                    className="w-full h-9 px-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-xs" 
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">หมวดหมู่กิจกรรม</label>
                  <input 
                    type="text" 
                    value={activityCategory} 
                    onChange={(e) => setActivityCategory(e.target.value)} 
                    placeholder="เช่น สอบ, เวิร์กช็อป, ส่งงาน" 
                    className="w-full h-9 px-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-xs" 
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">สีแถบกิจกรรมในปฏิทิน</label>
                <div className="flex gap-2 items-center flex-wrap">
                  {[
                    { id: "red", label: "แดง (สำคัญ/สอบ)", bg: "bg-red-500", border: "border-red-500" },
                    { id: "orange", label: "ส้ม (เวิร์กช็อป)", bg: "bg-orange-500", border: "border-orange-500" },
                    { id: "blue", label: "น้ำเงิน (เรียนการสอน)", bg: "bg-blue-500", border: "border-blue-500" },
                    { id: "green", label: "เขียว (นิทรรศการ)", bg: "bg-emerald-500", border: "border-emerald-500" },
                    { id: "purple", label: "ม่วง (ประกวด)", bg: "bg-purple-500", border: "border-purple-500" }
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setActivityColor(c.id)}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                        activityColor === c.id 
                          ? `${c.border} bg-gray-100 font-bold ring-2 ring-offset-1 ring-red-400` 
                          : "border-gray-200 hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${c.bg}`} />
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  รูปภาพกิจกรรม <span className="text-[11px] font-normal text-slate-400">(ไม่บังคับ สามารถลงเฉพาะข้อความได้)</span>
                </label>
                
                <div className="relative border border-dashed border-orange-300 bg-orange-50/40 hover:bg-orange-50/70 transition-colors rounded-xl p-4 text-center cursor-pointer overflow-hidden group">
                  <input 
                    id="activityImageInput"
                    type="file" 
                    multiple
                    accept="image/jpeg, image/jpg, image/png"
                    onChange={(e) => {
                      if (e.target.files) {
                        setActivityImageFiles(Array.from(e.target.files));
                      } else {
                        setActivityImageFiles([]);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center justify-center relative z-0">
                    <div className="w-8 h-8 bg-orange-500/10 text-orange-600 rounded-xl flex items-center justify-center mb-1.5">
                      <Plus className="w-4 h-4" />
                    </div>
                    <p className="text-slate-800 font-semibold text-xs group-hover:text-orange-600 transition-colors">คลิกหรือลากไฟล์ภาพมาที่นี่</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">JPG, PNG (เลือกได้หลายรูป)</p>
                  </div>
                </div>
                
                {/* Image Preview */}
                {(activityImageFiles.length > 0 || activityExistingImages.length > 0) && (
                  <div className="mt-3 grid grid-cols-3 gap-1.5">
                    {activityExistingImages.map((url, i) => (
                      <div key={`existing-${i}`} className={`relative aspect-video bg-gray-100 rounded-lg overflow-hidden border ${coverImageId === `existing-${i}` ? 'border-orange-500 ring-2 ring-orange-500/30' : 'border-gray-200'}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`preview existing ${i}`} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400/eeeeee/999999?text=Image+Not+Found")} />
                        <div className="absolute top-1 left-1 bg-black/60 text-white text-[9px] px-1 py-0.2 rounded">รูปเดิม</div>
                        
                        {coverImageId !== `existing-${i}` && (
                          <button type="button" onClick={() => setCoverImageId(`existing-${i}`)} className="absolute bottom-0.5 left-0.5 right-0.5 bg-black/70 hover:bg-orange-500 text-white text-[9px] py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            ตั้งเป็นปก
                          </button>
                        )}
                        {coverImageId === `existing-${i}` && (
                          <div className="absolute bottom-0 left-0 right-0 bg-orange-500 text-white text-[9px] text-center py-0.5 font-medium">
                            รูปหน้าปก
                          </div>
                        )}

                        <button type="button" onClick={() => {
                          setActivityExistingImages(prev => prev.filter((_, idx) => idx !== i));
                          if (coverImageId === `existing-${i}`) setCoverImageId("");
                        }} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-80 hover:opacity-100 transition-opacity">
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                    {activityImageFiles.map((file, i) => (
                      <div key={`new-${i}`} className={`relative aspect-video bg-gray-100 rounded-lg overflow-hidden border ${coverImageId === `new-${i}` || (!coverImageId && activityExistingImages.length === 0 && i === 0) ? 'border-orange-500 ring-2 ring-orange-500/30' : 'border-emerald-200'}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={URL.createObjectURL(file)} alt={`preview new ${i}`} className="w-full h-full object-cover" />
                        <div className="absolute top-1 left-1 bg-emerald-600 text-white text-[9px] px-1 py-0.2 rounded">ใหม่</div>
                        
                        {coverImageId !== `new-${i}` && !(!coverImageId && activityExistingImages.length === 0 && i === 0) && (
                          <button type="button" onClick={() => setCoverImageId(`new-${i}`)} className="absolute bottom-0.5 left-0.5 right-0.5 bg-black/70 hover:bg-orange-500 text-white text-[9px] py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            ตั้งเป็นปก
                          </button>
                        )}
                        {(coverImageId === `new-${i}` || (!coverImageId && activityExistingImages.length === 0 && i === 0)) && (
                          <div className="absolute bottom-0 left-0 right-0 bg-orange-500 text-white text-[9px] text-center py-0.5 font-medium">
                            รูปหน้าปก
                          </div>
                        )}

                        <button type="button" onClick={() => {
                          setActivityImageFiles(prev => prev.filter((_, idx) => idx !== i));
                          if (coverImageId === `new-${i}`) setCoverImageId("");
                        }} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-80 hover:opacity-100 transition-opacity">
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <Button type="submit" className="flex-1 h-9 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold">
                  {editingActivityId ? "บันทึกการแก้ไข" : "เพิ่มกิจกรรม"}
                </Button>
                {editingActivityId && (
                  <Button type="button" variant="outline" onClick={resetActivityForm} className="h-9 rounded-xl px-3 border-gray-200 text-xs font-medium">
                    ยกเลิก
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Activity List Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-2xs border border-gray-200 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
              <h2 className="text-sm sm:text-base font-bold font-kanit text-gray-900 flex items-center gap-2">
                <Calendar className="text-orange-500 w-4 h-4" /> 
                รายการกิจกรรมทั้งหมด
              </h2>
              <span className="text-xs font-semibold text-gray-600 bg-white px-2.5 py-1 rounded-full border border-gray-200 shadow-2xs">
                {activitiesList.length} รายการ
              </span>
            </div>
            {isLoading ? (
              <div className="text-center py-12 text-gray-400 text-xs font-medium">กำลังโหลดข้อมูล...</div>
            ) : activitiesList.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-xs font-medium">ไม่มีข้อมูลกิจกรรมในระบบ</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5 p-4 sm:p-5">
                {(Array.isArray(activitiesList) ? activitiesList : []).map((activity) => {
                  const colorKey = activity.color || "red";
                  const colorBadge = {
                    red: "bg-red-100 text-red-800 border-red-200",
                    orange: "bg-orange-100 text-orange-800 border-orange-200",
                    blue: "bg-blue-100 text-blue-800 border-blue-200",
                    green: "bg-emerald-100 text-emerald-800 border-emerald-200",
                    purple: "bg-purple-100 text-purple-800 border-purple-200",
                  }[colorKey] || "bg-red-100 text-red-800 border-red-200";

                  return (
                    <div key={activity.id} className="flex flex-col bg-white rounded-xl overflow-hidden border border-gray-200 shadow-2xs hover:shadow-xs transition-all group">
                      {activity.imageUrl ? (
                        <div className="w-full h-36 bg-gray-100 relative overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={activity.imageUrl} 
                            alt={activity.title} 
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" 
                            onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400/eeeeee/999999?text=Image+Not+Found")} 
                          />
                          <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-xs text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-2xs">
                            {activity.date}
                          </div>
                          {activity.category && (
                            <div className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-md border ${colorBadge}`}>
                              {activity.category}
                            </div>
                          )}
                          {activity.location && (
                            <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-md truncate">
                              📍 {activity.location}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-full h-24 bg-gradient-to-r from-gray-50 to-gray-100 p-3 flex flex-col justify-between border-b border-gray-100 relative">
                          <div className="flex justify-between items-start gap-2">
                            <span className="bg-white/95 text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded-md border border-gray-200">
                              📅 {activity.date}
                            </span>
                            {activity.category && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${colorBadge}`}>
                                {activity.category}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-gray-600 font-medium">
                            {activity.time && <span>⏰ {activity.time}</span>}
                            {activity.location && <span className="truncate">📍 {activity.location}</span>}
                          </div>
                        </div>
                      )}

                      <div className="p-3.5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            {activity.time && !activity.imageUrl && (
                              <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                {activity.time}
                              </span>
                            )}
                            <h3 className="font-bold font-kanit text-gray-900 truncate text-xs sm:text-sm" title={activity.title}>
                              {activity.title}
                            </h3>
                          </div>
                          {activity.description && (
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                              {activity.description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 mt-3 pt-2.5 border-t border-gray-100">
                          <button 
                            onClick={() => handleEditActivity(activity)} 
                            className="flex-1 h-7.5 rounded-lg flex items-center justify-center text-xs font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3 h-3 mr-1" /> แก้ไข
                          </button>
                          <button 
                            onClick={() => handleDeleteActivity(activity.id)} 
                            className="h-7.5 px-2.5 rounded-lg flex items-center justify-center text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                            title="ลบกิจกรรม"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
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
    </div>
  );
}

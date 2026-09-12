"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Pencil, Calendar } from "lucide-react";
import CalendarView from "@/components/ui/CalendarView";

export default function ActivitiesTab() {
  const [activitiesList, setActivitiesList] = useState<any[]>([]);
  const [activityTitle, setActivityTitle] = useState("");
  const [activityDesc, setActivityDesc] = useState("");
  const [activityDate, setActivityDate] = useState("");
  const [activityLocation, setActivityLocation] = useState("");
  const [activityImageUrl, setActivityImageUrl] = useState("");
  const [activityImageFile, setActivityImageFile] = useState<File | null>(null);
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
    if (!activityTitle || !activityDesc || !activityDate) return;
    if (!editingActivityId && !activityImageFile && !activityImageUrl) {
      alert("กรุณาเลือกรูปภาพกิจกรรม");
      return;
    }
    
    const formData = new FormData();
    if (editingActivityId) formData.append("id", editingActivityId);
    formData.append("title", activityTitle);
    formData.append("description", activityDesc);
    formData.append("date", activityDate);
    formData.append("location", activityLocation);
    
    if (activityImageFile) {
      formData.append("image", activityImageFile);
    } else if (activityImageUrl) {
      formData.append("imageUrl", activityImageUrl);
    }

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
        const err = await res.json();
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
    setActivityLocation("");
    setActivityImageUrl("");
    setActivityImageFile(null);
    setEditingActivityId(null);
    const fileInput = document.getElementById("activityImageInput") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleEditActivity = (activity: any) => {
    setActivityTitle(activity.title);
    setActivityDesc(activity.description);
    setActivityDate(activity.date);
    setActivityLocation(activity.location || "");
    setActivityImageUrl(activity.imageUrl);
    setActivityImageFile(null);
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
    <div className="space-y-8">
              {/* Calendar Section */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Calendar className="text-blue-500 w-5 h-5" /> 
                    ปฏิทินกิจกรรม
                  </h2>
                </div>
                <div className="p-4 bg-gray-50/30">
                  <CalendarView activities={activitiesList} />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Activity Form Section */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-8">
                  <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                    {editingActivityId ? <Pencil className="text-blue-600" /> : <Plus className="text-blue-600" />}
                    <h2 className="text-lg font-bold text-gray-900">
                      {editingActivityId ? "แก้ไขกิจกรรม" : "เพิ่มกิจกรรมใหม่"}
                    </h2>
                  </div>
                  <form onSubmit={handleAddActivity} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">หัวข้อกิจกรรม</label>
                      <input type="text" required value={activityTitle} onChange={(e) => setActivityTitle(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">รายละเอียดกิจกรรม</label>
                      <textarea required value={activityDesc} onChange={(e) => setActivityDesc(e.target.value)} className="w-full h-24 p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none text-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">วันที่ (เช่น 12 ตุลาคม 2566)</label>
                      <input type="text" required value={activityDate} onChange={(e) => setActivityDate(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">สถานที่ (เช่น โรงเรียนวชิรธรรมสาธิต)</label>
                      <input type="text" value={activityLocation} onChange={(e) => setActivityLocation(e.target.value)} placeholder="ระบุสถานที่ (ไม่บังคับ)" className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        รูปภาพกิจกรรม {editingActivityId && <span className="text-xs font-normal text-gray-500">(ไม่ต้องเลือกหากใช้รูปเดิม)</span>}
                      </label>
                      
                      <div className="relative border-2 border-dashed border-indigo-300 bg-indigo-50/50 hover:bg-indigo-50 transition-colors rounded-2xl p-8 text-center cursor-pointer overflow-hidden group">
                        <input 
                          id="activityImageInput"
                          type="file" 
                          accept="image/jpeg, image/jpg, image/png"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setActivityImageFile(e.target.files[0]);
                            } else {
                              setActivityImageFile(null);
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
                      {activityImageFile ? (
                        <div className="mt-3 relative w-full aspect-video bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={URL.createObjectURL(activityImageFile)} alt="preview" className="w-full h-full object-contain" />
                        </div>
                      ) : editingActivityId && activityImageUrl ? (
                        <div className="mt-3 relative w-full aspect-video bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                           {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={activityImageUrl} alt="preview" className="w-full h-full object-contain" onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400/eeeeee/999999?text=Image+Not+Found")} />
                          <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md">รูปเดิม</div>
                        </div>
                      ) : null}
                    </div>
                    
                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                      <Button type="submit" className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white">
                        {editingActivityId ? "บันทึก" : "เพิ่ม"}
                      </Button>
                      {editingActivityId && (
                        <Button type="button" variant="outline" onClick={resetActivityForm} className="rounded-xl px-4 border-gray-200">ยกเลิก</Button>
                      )}
                    </div>
                  </form>
                </div>
              </div>
              {/* Activity List Section */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Calendar className="text-blue-500 w-5 h-5" /> 
                      รายการกิจกรรมทั้งหมด
                    </h2>
                    <span className="text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                      ทั้งหมด {activitiesList.length} รายการ
                    </span>
                  </div>
                  {isLoading ? (
                    <div className="text-center py-10 text-gray-400">กำลังโหลด...</div>
                  ) : activitiesList.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">ไม่มีข้อมูลกิจกรรม</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(Array.isArray(activitiesList) ? activitiesList : []).map((activity) => (
                        <div key={activity.id} className="flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all">
                          <div className="w-full h-40 bg-gray-100 relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={activity.imageUrl} alt={activity.title} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400/eeeeee/999999?text=Image+Not+Found")} />
                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                              {activity.date}
                            </div>
                          </div>
                          <div className="p-4 flex-1 flex flex-col">
                            <h3 className="font-bold text-gray-900 truncate mb-1 text-base">{activity.title}</h3>
                            <p className="text-sm text-gray-600 line-clamp-2">{activity.description}</p>
                            <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                              <button onClick={() => handleEditActivity(activity)} className="flex-1 h-8 rounded-lg flex items-center justify-center text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors">
                                <Pencil className="w-3 h-3 mr-1" /> แก้ไข
                              </button>
                              <button onClick={() => handleDeleteActivity(activity.id)} className="flex-1 h-8 rounded-lg flex items-center justify-center text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
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
            </div>
  );
}

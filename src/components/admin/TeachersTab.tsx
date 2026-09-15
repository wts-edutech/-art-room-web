"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  Plus, 
  Pencil, 
  Trash2, 
  Mail, 
  MapPin, 
  Palette, 
  Sparkles, 
  Search,
  X,
  Upload,
  RefreshCw,
  Eye,
  EyeOff,
  Globe,
  Lock
} from "lucide-react";

interface Teacher {
  id: string;
  name: string;
  role: string;
  position: string;
  grades: string;
  specialties: string;
  bio: string;
  imageUrl: string;
  email: string;
  roomLocation: string;
  orderIndex: number;
}

export default function TeachersTab() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Front-end Visibility Status State
  const [isTeachersEnabled, setIsTeachersEnabled] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [role, setRole] = useState("ครูผู้สอนกลุ่มสาระการเรียนรู้ศิลปะ");
  const [position, setPosition] = useState("ครูชำนาญการ");
  const [grades, setGrades] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [roomLocation, setRoomLocation] = useState("ห้องปฏิบัติการศิลปะ (อาคาร 2 ชั้น 3)");
  const [orderIndex, setOrderIndex] = useState(1);
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/teachers");
      const data = await res.json();
      setTeachers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch teachers", error);
      setTeachers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/teachers/status");
      const data = await res.json();
      if (data && typeof data.enabled === "boolean") {
        setIsTeachersEnabled(data.enabled);
      }
    } catch (e) {
      console.error("Failed to fetch teachers status", e);
    }
  };

  useEffect(() => {
    fetchData();
    fetchStatus();
  }, []);

  const handleToggleStatus = async () => {
    const nextState = !isTeachersEnabled;
    const confirmMsg = nextState 
      ? "คุณต้องการ 'เปิดใช้งาน' เมนูทำเนียบครู ให้แสดงผลบนหน้าเว็บไซต์สาธารณะใช่หรือไม่?" 
      : "คุณต้องการ 'ปิด/ซ่อน' เมนูทำเนียบครู ออกจากหน้าเว็บไซต์ชั่วคราวใช่หรือไม่?";

    if (!confirm(confirmMsg)) return;

    setIsTogglingStatus(true);
    try {
      const res = await fetch("/api/teachers/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: nextState })
      });
      const data = await res.json();
      if (res.ok) {
        setIsTeachersEnabled(nextState);
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

  const openAddModal = () => {
    setEditingId(null);
    setName("");
    setRole("ครูผู้สอนกลุ่มสาระการเรียนรู้ศิลปะ");
    setPosition("ครูชำนาญการ");
    setGrades("");
    setSpecialties("");
    setBio("");
    setEmail("");
    setRoomLocation("ห้องปฏิบัติการศิลปะ (อาคาร 2 ชั้น 3)");
    setOrderIndex(teachers.length + 1);
    setImageUrl("");
    setImageFile(null);
    setPreviewImage("");
    setIsModalOpen(true);
  };

  const openEditModal = (t: Teacher) => {
    setEditingId(t.id);
    setName(t.name || "");
    setRole(t.role || "ครูผู้สอนกลุ่มสาระการเรียนรู้ศิลปะ");
    setPosition(t.position || "ครูชำนาญการ");
    setGrades(t.grades || "");
    setSpecialties(t.specialties || "");
    setBio(t.bio || "");
    setEmail(t.email || "");
    setRoomLocation(t.roomLocation || "");
    setOrderIndex(t.orderIndex || 1);
    setImageUrl(t.imageUrl || "");
    setImageFile(null);
    setPreviewImage(t.imageUrl || "");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("กรุณากรอกชื่อ-นามสกุลครูผู้สอน");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      if (editingId) formData.append("id", editingId);
      formData.append("name", name.trim());
      formData.append("role", role.trim());
      formData.append("position", position.trim());
      formData.append("grades", grades.trim());
      formData.append("specialties", specialties.trim());
      formData.append("bio", bio.trim());
      formData.append("email", email.trim());
      formData.append("roomLocation", roomLocation.trim());
      formData.append("orderIndex", String(orderIndex));

      if (imageFile) {
        formData.append("image", imageFile);
      } else if (imageUrl) {
        formData.append("imageUrl", imageUrl.trim());
      }

      const method = editingId ? "PUT" : "POST";
      const res = await fetch("/api/teachers", {
        method,
        body: formData,
      });

      if (res.ok) {
        closeModal();
        fetchData();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (error) {
      console.error("Save teacher error:", error);
      alert("ไม่สามารถบันทึกข้อมูลครูผู้สอนได้");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, teacherName: string) => {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูล "${teacherName}"?`)) return;

    try {
      const res = await fetch(`/api/teachers?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      } else {
        alert("ไม่สามารถลบข้อมูลได้");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("เกิดข้อผิดพลาดในการลบข้อมูล");
    }
  };

  const handleSeedDefaults = async () => {
    if (!confirm("คุณต้องการโหลดข้อมูลตั้งต้น 3 ท่านหรือไม่? (ข้อมูลที่มีอยู่จะไม่สูญหาย)")) return;
    try {
      setIsLoading(true);
      const res = await fetch("/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seed" }),
      });
      if (res.ok) {
        fetchData();
      } else {
        alert("ไม่สามารถโหลดข้อมูลตั้งต้นได้");
      }
    } catch (error) {
      console.error("Seed error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTeachers = (Array.isArray(teachers) ? teachers : []).filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (t.name && t.name.toLowerCase().includes(q)) ||
      (t.role && t.role.toLowerCase().includes(q)) ||
      (t.position && t.position.toLowerCase().includes(q)) ||
      (t.grades && t.grades.toLowerCase().includes(q)) ||
      (t.specialties && t.specialties.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8">
      {/* Front-end Visibility Control Box (สวิตช์ เปิด-ปิด ระบบหน้าบ้าน) */}
      <div className={`p-6 sm:p-7 rounded-3xl border transition-all shadow-xs ${
        isTeachersEnabled 
          ? "bg-emerald-50/70 border-emerald-200" 
          : "bg-amber-50/70 border-amber-200"
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-start gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              isTeachersEnabled 
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/30" 
                : "bg-amber-500 text-white shadow-md shadow-amber-500/30"
            }`}>
              {isTeachersEnabled ? <Eye className="w-6 h-6" /> : <EyeOff className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  {isTeachersEnabled ? "เปิดการแสดงผลในระบบหน้าบ้านแล้ว" : "ปิดการแสดงผลหน้าบ้านชั่วคราว (ซ่อนอยู่)"}
                </h3>
                <span className={`text-xs font-bold px-3 py-0.5 rounded-full ${
                  isTeachersEnabled 
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300" 
                    : "bg-amber-100 text-amber-800 border border-amber-300"
                }`}>
                  {isTeachersEnabled ? "🟢 ออนไลน์สู่สาธารณะ" : "🔒 ซ่อนอยู่ (เฉพาะหลังบ้าน)"}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed max-w-2xl">
                {isTeachersEnabled
                  ? "ปุ่ม 'ทำเนียบครู' กำลังแสดงอยู่บนแถบเมนูด้านบนและส่วนท้ายเว็บไซต์ บุคคลทั่วไปและนักเรียนสามารถเข้าชมได้ตามปกติ"
                  : "ปุ่ม 'ทำเนียบครู' ถูกซ่อนไว้จากหน้าเว็บหลัก บุคคลทั่วไปจะไม่เห็นเมนูนี้ คุณครูสามารถจัดการและเพิ่มข้อมูลได้ เมื่อพร้อมให้กดเปิดสวิตช์"}
              </p>
            </div>
          </div>

          {/* Big Toggle Switch Button */}
          <button
            type="button"
            disabled={isTogglingStatus}
            onClick={handleToggleStatus}
            className={`h-12 px-6 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all cursor-pointer shadow-md self-start sm:self-center disabled:opacity-50 whitespace-nowrap flex-shrink-0 ${
              isTeachersEnabled
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
                <div className={`w-3 h-3 rounded-full ${isTeachersEnabled ? "bg-white animate-pulse" : "bg-emerald-200 animate-pulse"}`}></div>
                <span>{isTeachersEnabled ? "กดเพื่อปิด / ซ่อนหน้าบ้าน" : "กดเพื่อเปิดใช้งานหน้าบ้าน"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Top Header & Search Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold mb-2">
            <GraduationCap className="w-3.5 h-3.5 text-red-600" />
            <span>ระบบจัดการทำเนียบครูผู้สอนศิลปะ</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
            ทำเนียบครูและบุคลากร ({teachers.length} ท่าน)
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            จัดการรายชื่อ รูปถ่าย วิทยฐานะ ระดับชั้นที่สอน และข้อมูลการติดต่อของคณะครู
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={handleSeedDefaults}
            className="h-11 px-4 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
            title="โหลดข้อมูลครูตัวอย่าง 3 ท่าน"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>โหลดข้อมูลเริ่มต้น</span>
          </button>

          <Button
            onClick={openAddModal}
            className="h-11 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md shadow-red-600/20 flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มครูผู้สอน</span>
          </Button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ค้นหาชื่อคุณครู, วิทยฐานะ, ระดับชั้นที่สอน หรือความเชี่ยวชาญ..."
          className="w-full h-11 pl-11 pr-4 rounded-2xl border border-gray-200 bg-white text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
        />
      </div>

      {/* Teachers Cards Grid */}
      {isLoading ? (
        <div className="p-16 text-center text-gray-400 bg-white rounded-3xl border border-gray-100">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-medium">กำลังโหลดข้อมูลทำเนียบครู...</p>
        </div>
      ) : filteredTeachers.length === 0 ? (
        <div className="p-16 text-center text-gray-400 bg-white rounded-3xl border border-gray-100">
          <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-base font-bold text-gray-700">ไม่พบข้อมูลครูผู้สอน</p>
          <p className="text-xs text-gray-400 mt-1">กดปุ่ม &quot;เพิ่มครูผู้สอน&quot; หรือ &quot;โหลดข้อมูลเริ่มต้น&quot; เพื่อเริ่มต้นใช้งาน</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-3xl border border-gray-100 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col group"
            >
              {/* Card Photo & Badges */}
              <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.imageUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800"}
                  alt={t.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-xs">
                  {t.position || "ครูผู้สอน"}
                </div>
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                  ลำดับ {t.orderIndex || 1}
                </div>
              </div>

              {/* Card Details */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                  {t.name}
                </h3>
                <p className="text-xs font-semibold text-red-600 mb-3">
                  {t.role}
                </p>

                <div className="space-y-2 text-xs text-gray-600 mb-4">
                  {t.grades && (
                    <div className="flex items-start gap-2">
                      <GraduationCap className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span><strong>สอน:</strong> {t.grades}</span>
                    </div>
                  )}
                  {t.specialties && (
                    <div className="flex items-start gap-2">
                      <Palette className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span><strong>ความเชี่ยวชาญ:</strong> {t.specialties}</span>
                    </div>
                  )}
                  {t.roomLocation && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span>{t.roomLocation}</span>
                    </div>
                  )}
                  {t.email && (
                    <div className="flex items-start gap-2">
                      <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="font-mono text-gray-500">{t.email}</span>
                    </div>
                  )}
                </div>

                {t.bio && (
                  <p className="text-xs text-gray-500 italic bg-gray-50 p-2.5 rounded-xl border border-gray-100 mb-4 font-light line-clamp-2">
                    &ldquo;{t.bio}&rdquo;
                  </p>
                )}

                {/* Card Action Buttons */}
                <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(t)}
                    className="flex-1 h-9 rounded-xl bg-gray-50 hover:bg-orange-50 text-gray-700 hover:text-orange-500 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>แก้ไข</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(t.id, t.name)}
                    className="h-9 w-9 rounded-xl bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer"
                    title="ลบข้อมูล"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Teacher Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-gray-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">
                    {editingId ? "แก้ไขข้อมูลครูผู้สอน" : "เพิ่มครูผู้สอนใหม่"}
                  </h3>
                  <p className="text-xs text-gray-500">ข้อมูลทำเนียบกลุ่มสาระการเรียนรู้ศิลปะ</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-200/60 hover:text-gray-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider" htmlFor="teacherName">
                  ชื่อ - นามสกุลครูผู้สอน <span className="text-red-500">*</span>
                </label>
                <input
                  id="teacherName"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น ครูพิชญ์ชญา วงศ์ศิลป์"
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                />
              </div>

              {/* Role & Position */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700" htmlFor="teacherRole">
                    บทบาทหน้าที่ในกลุ่มสาระฯ <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="teacherRole"
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="เช่น หัวหน้ากลุ่มสาระฯ หรือ ครูผู้สอน"
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700" htmlFor="teacherPosition">
                    วิทยฐานะ / ตำแหน่ง
                  </label>
                  <select
                    id="teacherPosition"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all bg-white"
                  >
                    <option value="ครูเชี่ยวชาญพิเศษ (คศ.5)">ครูเชี่ยวชาญพิเศษ (คศ.5)</option>
                    <option value="ครูเชี่ยวชาญ (คศ.4)">ครูเชี่ยวชาญ (คศ.4)</option>
                    <option value="ครูชำนาญการพิเศษ (คศ.3)">ครูชำนาญการพิเศษ (คศ.3)</option>
                    <option value="ครูชำนาญการ (คศ.2)">ครูชำนาญการ (คศ.2)</option>
                    <option value="ครู (คศ.1)">ครู (คศ.1)</option>
                    <option value="ครูผู้ช่วย">ครูผู้ช่วย</option>
                    <option value="ครูอัตราจ้าง">ครูอัตราจ้าง</option>
                    <option value="เจ้าหน้าที่ประจำห้องปฏิบัติการ">เจ้าหน้าที่ประจำห้องปฏิบัติการ</option>
                  </select>
                </div>
              </div>

              {/* Grades Taught & Order Index */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-gray-700" htmlFor="teacherGrades">
                    ระดับชั้นที่รับผิดชอบการสอน
                  </label>
                  <input
                    id="teacherGrades"
                    type="text"
                    value={grades}
                    onChange={(e) => setGrades(e.target.value)}
                    placeholder="เช่น มัธยมศึกษาปีที่ 3 และ 6"
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700" htmlFor="teacherOrder">
                    ลำดับการแสดงผล
                  </label>
                  <input
                    id="teacherOrder"
                    type="number"
                    min={1}
                    value={orderIndex}
                    onChange={(e) => setOrderIndex(Number(e.target.value))}
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Specialties */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700" htmlFor="teacherSpecialties">
                  สาขาวิชา / ความเชี่ยวชาญพิเศษ
                </label>
                <input
                  id="teacherSpecialties"
                  type="text"
                  value={specialties}
                  onChange={(e) => setSpecialties(e.target.value)}
                  placeholder="เช่น จิตรกรรมสีน้ำ, วาดเส้น EE, Digital Art, ประติมากรรม"
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                />
              </div>

              {/* Room Location & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700" htmlFor="teacherRoom">
                    ห้องปฏิบัติการประจำ
                  </label>
                  <input
                    id="teacherRoom"
                    type="text"
                    value={roomLocation}
                    onChange={(e) => setRoomLocation(e.target.value)}
                    placeholder="เช่น ห้องศิลปะ 1 (อาคาร 2 ชั้น 3)"
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700" htmlFor="teacherEmail">
                    อีเมลสำหรับติดต่อ
                  </label>
                  <input
                    id="teacherEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="เช่น teacher@wts.ac.th"
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Teaching Philosophy / Bio */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700" htmlFor="teacherBio">
                  แนวทางการสอน / คติประจำใจ (Bio)
                </label>
                <textarea
                  id="teacherBio"
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="เช่น มุ่งเน้นการส่งเสริมให้นักเรียนค้นหาตัวตนผ่านงานศิลปะ และพัฒนาทักษะสู่เวทีระดับชาติ"
                  className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                />
              </div>

              {/* Photo Upload & URL */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                  <span>รูปถ่ายครูผู้สอน</span>
                  <span className="text-[11px] font-normal text-gray-400">อัปโหลดไฟล์ หรือใส่ลิงก์ URL</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <div className="sm:col-span-2 space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="block w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-2xl file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer"
                    />
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        if (!imageFile) setPreviewImage(e.target.value);
                      }}
                      placeholder="หรือใส่ลิงก์รูปภาพ เช่น https://..."
                      className="w-full h-9 px-3 rounded-2xl border border-gray-200 text-xs focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                    />
                  </div>

                  {/* Image Preview Box */}
                  <div className="flex items-center justify-center">
                    {previewImage ? (
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-gray-200 shadow-2xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 text-[10px]">
                        <Upload className="w-4 h-4 mb-1 text-gray-300" />
                        <span>ตัวอย่างภาพ</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                  className="h-11 px-5 rounded-xl text-sm font-semibold cursor-pointer"
                >
                  ยกเลิก
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-md shadow-red-600/20 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "กำลังบันทึก..." : editingId ? "บันทึกการแก้ไข" : "บันทึกข้อมูลครู"}
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  Plus, 
  Trash2, 
  Mail, 
  MapPin, 
  Palette, 
  Sparkles, 
  Upload, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Trophy, 
  Briefcase, 
  Image as ImageIcon, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  BookOpen,
  Calendar,
  Layers
} from "lucide-react";
import { optimizeImageToDataUrl } from "@/lib/image-optimizer";

interface EducationItem {
  id: string;
  level: string; // "ปริญญาตรี", "ปริญญาโท", "ปริญญาเอก", etc.
  degree: string; // เช่น "ศิลปศาสตรบัณฑิต (ศศ.บ.)"
  major: string; // เช่น "สาขาวิชาทัศนศิลป์ (จิตรกรรม)"
  institution: string; // เช่น "มหาวิทยาลัยศิลปากร"
  graduationYear: string; // เช่น "2556"
}

interface ExperienceItem {
  id: string;
  role: string; // เช่น "หัวหน้ากลุ่มสาระฯ ศิลปะ และครูผู้สอนทัศนศิลป์"
  workplace: string; // เช่น "โรงเรียนวชิรธรรมสาธิต"
  period: string; // เช่น "2561 - ปัจจุบัน"
  details: string; // รายละเอียดสังเขป
}

interface AwardItem {
  id: string;
  title: string; // เช่น "รางวัลครูผู้สอนดีเด่น กลุ่มสาระการเรียนรู้ศิลปะ ระดับเหรียญทอง"
  year: string; // เช่น "2566"
  issuer: string; // เช่น "สพม.กทม. เขต 2"
  imageUrl?: string; // รูปถ่ายตอนรับรางวัล หรือใบประกาศ
}

interface ActivityImageItem {
  id: string;
  title: string; // เช่น "กิจกรรม Workshop วาดเส้นและลงสีน้ำ"
  date?: string; // เช่น "14 ก.พ. 2567"
  imageUrl: string; // รูปภาพกิจกรรม
}

export default function TeachersTab() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Front-end Visibility Status
  const [isTeachersEnabled, setIsTeachersEnabled] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  // Profile Form States
  const [teacherId, setTeacherId] = useState("teacher-kae");
  const [name, setName] = useState("ครูชญานิษฐ์ ศิลป์ประเสริฐ (ครูเก๋)");
  const [role, setRole] = useState("หัวหน้ากลุ่มสาระการเรียนรู้ศิลปะ");
  const [position, setPosition] = useState("ครูชำนาญการพิเศษ");
  const [grades, setGrades] = useState("มัธยมศึกษาปีที่ 3 และ มัธยมศึกษาปีที่ 6");
  const [specialties, setSpecialties] = useState("ทัศนศิลป์, จิตรกรรมสีน้ำและสีน้ำมัน, การสร้างสรรค์สื่อผสม, การสอนศิลปะเพื่อพัฒนาทักษะชีวิต");
  const [bio, setBio] = useState("มุ่งเน้นการจุดประกายความคิดสร้างสรรค์ ส่งเสริมให้นักเรียนค้นพบเอกลักษณ์ของตนเองผ่านงานศิลปะ พร้อมเปิดโอกาสสู่เวทีการประกวดระดับประเทศและระดับสากล");
  const [email, setEmail] = useState("krukae.art@wts.ac.th");
  const [roomLocation, setRoomLocation] = useState("ห้องปฏิบัติการศิลปะ 1 (อาคาร 2 ชั้น 3)");
  const [imageUrl, setImageUrl] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Dynamic Lists
  const [educationList, setEducationList] = useState<EducationItem[]>([]);
  const [experienceList, setExperienceList] = useState<ExperienceItem[]>([]);
  const [awardsList, setAwardsList] = useState<AwardItem[]>([]);
  const [activityImagesList, setActivityImagesList] = useState<ActivityImageItem[]>([]);

  // Active sub-tab in manager
  const [activeSection, setActiveSection] = useState<"general" | "education" | "experience" | "awards" | "activities">("general");

  // Fetch Data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Front-end Visibility Status
      fetch("/api/teachers/status")
        .then(r => r.json())
        .then(d => setIsTeachersEnabled(!!d?.enabled))
        .catch(() => {});

      // 2. Fetch Teacher Profile Data
      const res = await fetch("/api/teachers");
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      
      if (list.length > 0) {
        // Match Kru Kae or take the first record
        const kae = list.find((t: any) => t.id === "teacher-kae" || t.name.includes("เก๋")) || list[0];
        setTeacherId(kae.id || "teacher-kae");
        setName(kae.name || "");
        setRole(kae.role || "หัวหน้ากลุ่มสาระการเรียนรู้ศิลปะ");
        setPosition(kae.position || "ครูชำนาญการพิเศษ");
        setGrades(kae.grades || "");
        setSpecialties(kae.specialties || "");
        setBio(kae.bio || "");
        setEmail(kae.email || "");
        setRoomLocation(kae.roomLocation || "");
        setImageUrl(kae.imageUrl || "");

        // Education
        if (Array.isArray(kae.education)) {
          setEducationList(kae.education);
        }
        // Experience
        if (Array.isArray(kae.experience)) {
          setExperienceList(kae.experience);
        }
        // Awards
        if (Array.isArray(kae.awards)) {
          setAwardsList(kae.awards);
        }
        // Activity Images
        if (Array.isArray(kae.activityImages)) {
          setActivityImagesList(kae.activityImages);
        }
      }
    } catch (error) {
      console.error("Failed to fetch teacher profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Front-end Visibility Toggle
  const handleToggleStatus = async () => {
    setIsTogglingStatus(true);
    const nextStatus = !isTeachersEnabled;
    try {
      const res = await fetch("/api/teachers/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: nextStatus }),
      });
      if (res.ok) {
        setIsTeachersEnabled(nextStatus);
      }
    } catch (err) {
      console.error("Failed to update visibility status:", err);
    } finally {
      setIsTogglingStatus(false);
    }
  };

  // Avatar Upload Handler
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      const optimized = await optimizeImageToDataUrl(file, { maxWidth: 1000, maxHeight: 1000, quality: 0.85 });
      setImageUrl(optimized);
    } catch (err) {
      console.error("Failed to optimize image:", err);
      alert("ไม่สามารถประมวลผลไฟล์รูปภาพได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // --- Education Handlers ---
  const handleAddEducation = () => {
    const newItem: EducationItem = {
      id: `edu-${Date.now()}`,
      level: educationList.length === 0 ? "ปริญญาตรี" : "ปริญญาโท",
      degree: "",
      major: "",
      institution: "",
      graduationYear: ""
    };
    setEducationList(prev => [...prev, newItem]);
  };

  const handleUpdateEducation = (id: string, field: keyof EducationItem, val: string) => {
    setEducationList(prev => prev.map(item => item.id === id ? { ...item, [field]: val } : item));
  };

  const handleDeleteEducation = (id: string) => {
    setEducationList(prev => prev.filter(item => item.id !== id));
  };

  // --- Experience Handlers ---
  const handleAddExperience = () => {
    const newItem: ExperienceItem = {
      id: `exp-${Date.now()}`,
      role: "",
      workplace: "โรงเรียนวชิรธรรมสาธิต",
      period: "",
      details: ""
    };
    setExperienceList(prev => [...prev, newItem]);
  };

  const handleUpdateExperience = (id: string, field: keyof ExperienceItem, val: string) => {
    setExperienceList(prev => prev.map(item => item.id === id ? { ...item, [field]: val } : item));
  };

  const handleDeleteExperience = (id: string) => {
    setExperienceList(prev => prev.filter(item => item.id !== id));
  };

  // --- Awards Handlers ---
  const handleAddAward = () => {
    const newItem: AwardItem = {
      id: `award-${Date.now()}`,
      title: "",
      year: `${new Date().getFullYear() + 543}`,
      issuer: "",
      imageUrl: ""
    };
    setAwardsList(prev => [...prev, newItem]);
  };

  const handleUpdateAward = (id: string, field: keyof AwardItem, val: string) => {
    setAwardsList(prev => prev.map(item => item.id === id ? { ...item, [field]: val } : item));
  };

  const handleAwardImageUpload = async (id: string, file: File) => {
    try {
      const dataUrl = await optimizeImageToDataUrl(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.82 });
      handleUpdateAward(id, "imageUrl", dataUrl);
    } catch (err) {
      console.error("Failed to optimize award image:", err);
    }
  };

  const handleDeleteAward = (id: string) => {
    setAwardsList(prev => prev.filter(item => item.id !== id));
  };

  // --- Activity Gallery Handlers ---
  const handleAddActivityImage = () => {
    const newItem: ActivityImageItem = {
      id: `act-${Date.now()}`,
      title: "",
      date: "",
      imageUrl: ""
    };
    setActivityImagesList(prev => [...prev, newItem]);
  };

  const handleUpdateActivityImage = (id: string, field: keyof ActivityImageItem, val: string) => {
    setActivityImagesList(prev => prev.map(item => item.id === id ? { ...item, [field]: val } : item));
  };

  const handleActivityImageFileUpload = async (id: string, file: File) => {
    try {
      const dataUrl = await optimizeImageToDataUrl(file, { maxWidth: 1400, maxHeight: 1400, quality: 0.82 });
      handleUpdateActivityImage(id, "imageUrl", dataUrl);
    } catch (err) {
      console.error("Failed to optimize activity image:", err);
    }
  };

  const handleDeleteActivityImage = (id: string) => {
    setActivityImagesList(prev => prev.filter(item => item.id !== id));
  };

  // --- Save All Changes ---
  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      alert("กรุณากรอกชื่อ-นามสกุล");
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    const payload = {
      id: teacherId || "teacher-kae",
      name: name.trim(),
      role: role.trim(),
      position: position.trim(),
      grades: grades.trim(),
      specialties: specialties.trim(),
      bio: bio.trim(),
      imageUrl: imageUrl.trim(),
      email: email.trim(),
      roomLocation: roomLocation.trim(),
      orderIndex: 1,
      education: educationList,
      experience: experienceList,
      awards: awardsList,
      activityImages: activityImagesList
    };

    try {
      const res = await fetch("/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        const err = await res.json();
        setSaveError(err?.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (err: any) {
      console.error("Error saving profile:", err);
      setSaveError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to default Kru Kae data
  const handleResetToDefault = async () => {
    if (!confirm("คุณต้องการโหลดข้อมูลตั้งต้นสมบูรณ์ของ 'ครูเก๋' หรือไม่? (ข้อมูลที่ยังไม่บันทึกจะถูกแทนที่)")) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seed" }),
      });
      if (res.ok) {
        await fetchData();
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Error resetting data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4 text-gray-500">
        <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
        <p className="text-sm font-medium">กำลังโหลดข้อมูลโปรไฟล์ครูผู้สอน...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner: Status & Quick Controls */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-2xs border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 shrink-0 shadow-2xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">
                  ART ROOM SYSTEM
                </span>
                <span className="text-xs text-gray-500">• โรงเรียนวชิรธรรมสาธิต</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black font-kanit text-gray-900 leading-tight">
                จัดการข้อมูลครูผู้สอน (ครูเก๋)
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 font-light">
                ระบบจัดการประวัติการศึกษา ประวัติการทำงาน รางวัล และรูปภาพกิจกรรมของครูผู้สอนศิลปะ
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
              title="รีเซ็ตเป็นข้อมูลตัวอย่างครูเก๋ที่สมบูรณ์"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>โหลดข้อมูลตั้งต้นครูเก๋</span>
            </button>

            <a
              href="/teachers"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
            >
              <span>ดูหน้าบ้าน (/teachers)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <Button
              type="button"
              onClick={() => handleSaveProfile()}
              disabled={isSaving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-xs inline-flex items-center gap-2 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>บันทึกข้อมูล</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Visibility Toggle Alert Bar */}
        <div className={`mt-5 p-3.5 sm:p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
          isTeachersEnabled 
            ? "bg-emerald-50/80 border-emerald-200 text-emerald-900" 
            : "bg-amber-50/80 border-amber-200 text-amber-900"
        }`}>
          <div className="flex items-center gap-3">
            {isTeachersEnabled ? (
              <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <Eye className="w-4 h-4" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                <EyeOff className="w-4 h-4" />
              </div>
            )}
            <div>
              <div className="text-xs sm:text-sm font-bold flex items-center gap-2">
                <span>{isTeachersEnabled ? "เปิดการแสดงผลหน้าบ้านแล้ว (สาธารณะ)" : "ปิดการแสดงผลหน้าบ้านชั่วคราว (ซ่อนอยู่)"}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-white/80 border">
                  {isTeachersEnabled ? "ทุกคนสามารถเข้าดูได้ที่ /teachers" : "เฉพาะแอดมินเท่านั้นที่แก้ไขได้"}
                </span>
              </div>
              <p className="text-xs opacity-80 mt-0.5 font-light">
                {isTeachersEnabled 
                  ? "นักเรียน ผู้ปกครอง และบุคคลภายนอกสามารถเปิดดูประวัติและผลงานของครูเก๋ได้แล้ว"
                  : "สามารถจัดเตรียมและตรวจสอบข้อมูลให้เรียบร้อยก่อนเปิดเผยแพร่สู่หน้าบ้านได้ตลอดเวลา"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleStatus}
            disabled={isTogglingStatus}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-2xs ${
              isTeachersEnabled
                ? "bg-white hover:bg-amber-100 text-amber-800 border border-amber-300"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            {isTogglingStatus 
              ? "กำลังเปลี่ยนสถานะ..." 
              : isTeachersEnabled 
                ? "กดเพื่อซ่อนหน้าบ้าน" 
                : "กดเพื่อเปิดใช้งานหน้าบ้าน"}
          </button>
        </div>

        {/* Success / Error Notification */}
        {saveSuccess && (
          <div className="mt-3 p-3 bg-emerald-100/90 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>บันทึกข้อมูลและอัปเดตโปรไฟล์ครูเก๋เรียบร้อยแล้ว!</span>
          </div>
        )}
        {saveError && (
          <div className="mt-3 p-3 bg-rose-100/90 text-rose-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{saveError}</span>
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {[
          { id: "general", label: "ข้อมูลทั่วไป & โปรไฟล์", icon: Palette, badge: null },
          { id: "education", label: "ประวัติการศึกษา (ตรี-โท)", icon: GraduationCap, badge: educationList.length },
          { id: "experience", label: "ประวัติการทำงาน", icon: Briefcase, badge: experienceList.length },
          { id: "awards", label: "รางวัลที่ได้รับ & รูปรับรางวัล", icon: Trophy, badge: awardsList.length },
          { id: "activities", label: "ภาพครูกับกิจกรรม", icon: ImageIcon, badge: activityImagesList.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSection(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-orange-500 text-white shadow-xs"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== null && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                  isActive ? "bg-white text-orange-600" : "bg-gray-200 text-gray-700"
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SECTION 1: ข้อมูลทั่วไป & โปรไฟล์ */}
      {activeSection === "general" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
          {/* Avatar Upload Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-2xs border border-gray-200 text-center sticky top-28">
              <h3 className="text-sm font-bold font-kanit text-gray-800 mb-4 flex items-center justify-center gap-1.5">
                <Palette className="w-4 h-4 text-orange-500" />
                <span>รูปโปรไฟล์ครูเก๋</span>
              </h3>

              <div className="relative w-44 h-44 mx-auto mb-4 rounded-full overflow-hidden border-4 border-orange-100 shadow-sm group bg-gray-50">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon className="w-12 h-12 mb-1" />
                    <span className="text-xs">ยังไม่มีรูปภาพ</span>
                  </div>
                )}

                {/* Upload Overlay */}
                <label className="absolute inset-0 bg-black/50 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Upload className="w-6 h-6 mb-1" />
                  <span className="text-xs font-bold">เปลี่ยนรูปภาพ</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={isUploadingAvatar}
                  />
                </label>
              </div>

              <div className="space-y-2">
                <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors border border-orange-200 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploadingAvatar ? "กำลังบีบอัดรูปภาพ..." : "อัปโหลดรูปภาพใหม่"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={isUploadingAvatar}
                  />
                </label>
                <p className="text-[11px] text-gray-400 font-light">
                  แนะนำรูปถ่ายหน้าตรง แนวตั้ง ขนาดไม่เกิน 5MB (ระบบบีบอัดภาพให้อัตโนมัติ)
                </p>
              </div>

              {/* Direct Image URL fallback */}
              <div className="mt-4 pt-4 border-t border-gray-100 text-left">
                <label className="text-[11px] font-semibold text-gray-500 block mb-1">หรือใส่ลิงก์รูปภาพ (URL):</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-orange-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Profile Form Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-2xs border border-gray-200 space-y-4">
              <h3 className="text-sm font-bold font-kanit text-gray-800 pb-2 border-b border-gray-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <span>ข้อมูลส่วนตัวและตำแหน่งงาน</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    ชื่อ-นามสกุล <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="เช่น ครูชญานิษฐ์ ศิลป์ประเสริฐ (ครูเก๋)"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">บทบาท / ตำแหน่งในกลุ่มสาระ</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="เช่น หัวหน้ากลุ่มสาระการเรียนรู้ศิลปะ"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:border-orange-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">วิทยฐานะ</label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:border-orange-500 outline-none bg-white"
                  >
                    <option value="ครูผู้ช่วย">ครูผู้ช่วย</option>
                    <option value="ครู">ครู (คศ.1)</option>
                    <option value="ครูชำนาญการ">ครูชำนาญการ (คศ.2)</option>
                    <option value="ครูชำนาญการพิเศษ">ครูชำนาญการพิเศษ (คศ.3)</option>
                    <option value="ครูเชี่ยวชาญ">ครูเชี่ยวชาญ (คศ.4)</option>
                    <option value="ครูเชี่ยวชาญพิเศษ">ครูเชี่ยวชาญพิเศษ (คศ.5)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">ระดับชั้นที่รับผิดชอบการสอน</label>
                  <input
                    type="text"
                    value={grades}
                    onChange={(e) => setGrades(e.target.value)}
                    placeholder="เช่น มัธยมศึกษาปีที่ 3 และ 6"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:border-orange-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">อีเมลติดต่อ (School Email)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="krukae.art@wts.ac.th"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:border-orange-500 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-700 block mb-1">ห้องปฏิบัติการ / สถานที่ทำงาน</label>
                  <input
                    type="text"
                    value={roomLocation}
                    onChange={(e) => setRoomLocation(e.target.value)}
                    placeholder="เช่น ห้องปฏิบัติการศิลปะ 1 (อาคาร 2 ชั้น 3)"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:border-orange-500 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    ความเชี่ยวชาญ / ทักษะเฉพาะทางศิลปะ
                  </label>
                  <input
                    type="text"
                    value={specialties}
                    onChange={(e) => setSpecialties(e.target.value)}
                    placeholder="เช่น จิตรกรรมสีน้ำ, ทัศนศิลป์, สื่อผสม, ศิลปะดิจิทัล"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:border-orange-500 outline-none"
                  />
                  <p className="text-[11px] text-gray-400 mt-1 font-light">
                    ใส่เครื่องหมายจุลภาค (,) คั่นระหว่างความเชี่ยวชาญเพื่อแสดงผลเป็นป้ายแท็ก
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    คติพจน์ / วิสัยทัศน์การจัดการเรียนการสอน (Bio)
                  </label>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="อธิบายแนวคิดในการพัฒนาผู้เรียน หรือความมุ่งมั่นในการสอนศิลปะ..."
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:border-orange-500 outline-none leading-relaxed font-light"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: ประวัติการศึกษา (เพิ่มได้ถึง ป.โท) */}
      {activeSection === "education" && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-2xs border border-gray-200 space-y-5 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold font-kanit text-gray-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-orange-500" />
                <span>ประวัติการศึกษา (Education History)</span>
              </h3>
              <p className="text-xs text-gray-500 font-light mt-0.5">
                บันทึกวุฒิการศึกษา สาขาวิชา สถาบัน และปีการศึกษาที่สำเร็จการศึกษา (เพิ่มได้ทั้ง ป.ตรี, ป.โท, ป.เอก)
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddEducation}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ เพิ่มวุฒิการศึกษา</span>
            </button>
          </div>

          {educationList.length === 0 ? (
            <div className="text-center py-12 px-4 bg-gray-50/70 rounded-2xl border border-dashed border-gray-200 text-gray-400">
              <GraduationCap className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium text-gray-600">ยังไม่มีข้อมูลประวัติการศึกษา</p>
              <p className="text-xs text-gray-400 mt-1">กดปุ่ม "+ เพิ่มวุฒิการศึกษา" ด้านบนเพื่อเริ่มบันทึกประวัติ ป.ตรี หรือ ป.โท</p>
            </div>
          ) : (
            <div className="space-y-4">
              {educationList.map((edu, idx) => (
                <div key={edu.id} className="p-4 sm:p-5 rounded-2xl bg-gray-50/80 border border-gray-200/90 relative group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">
                      ลำดับที่ {idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteEducation(edu.id)}
                      className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="ลบรายการนี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                    {/* Level */}
                    <div>
                      <label className="text-[11px] font-semibold text-gray-600 block mb-1">ระดับวุฒิ</label>
                      <select
                        value={edu.level}
                        onChange={(e) => handleUpdateEducation(edu.id, "level", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:border-orange-500 outline-none bg-white font-medium"
                      >
                        <option value="ปริญญาตรี">ปริญญาตรี</option>
                        <option value="ปริญญาโท">ปริญญาโท</option>
                        <option value="ปริญญาเอก">ปริญญาเอก</option>
                        <option value="ประกาศนียบัตรบัณฑิต">ประกาศนียบัตรบัณฑิต (ป.บัณฑิต)</option>
                        <option value="อนุปริญญา / ปวส.">อนุปริญญา / ปวส.</option>
                      </select>
                    </div>

                    {/* Degree */}
                    <div>
                      <label className="text-[11px] font-semibold text-gray-600 block mb-1">ชื่อวุฒิการศึกษา</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => handleUpdateEducation(edu.id, "degree", e.target.value)}
                        placeholder="เช่น ศศ.บ., ค.ม."
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:border-orange-500 outline-none bg-white"
                      />
                    </div>

                    {/* Major */}
                    <div>
                      <label className="text-[11px] font-semibold text-gray-600 block mb-1">สาขาวิชา / วิชาเอก</label>
                      <input
                        type="text"
                        value={edu.major}
                        onChange={(e) => handleUpdateEducation(edu.id, "major", e.target.value)}
                        placeholder="เช่น ทัศนศิลป์, ศิลปศึกษา"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:border-orange-500 outline-none bg-white"
                      />
                    </div>

                    {/* Institution */}
                    <div>
                      <label className="text-[11px] font-semibold text-gray-600 block mb-1">สถาบัน / มหาวิทยาลัย</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => handleUpdateEducation(edu.id, "institution", e.target.value)}
                        placeholder="เช่น มหาวิทยาลัยศิลปากร"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:border-orange-500 outline-none bg-white"
                      />
                    </div>

                    {/* Graduation Year */}
                    <div>
                      <label className="text-[11px] font-semibold text-gray-600 block mb-1">ปีการศึกษาที่จบ (พ.ศ.)</label>
                      <input
                        type="text"
                        value={edu.graduationYear}
                        onChange={(e) => handleUpdateEducation(edu.id, "graduationYear", e.target.value)}
                        placeholder="เช่น 2556"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:border-orange-500 outline-none bg-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: ประวัติการทำงาน */}
      {activeSection === "experience" && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-2xs border border-gray-200 space-y-5 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold font-kanit text-gray-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-orange-500" />
                <span>ประวัติการทำงานและประสบการณ์ (Work Experience)</span>
              </h3>
              <p className="text-xs text-gray-500 font-light mt-0.5">
                บันทึกประวัติการทำงานในโรงเรียนและประสบการณ์การสอนศิลปะ
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddExperience}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ เพิ่มประวัติการทำงาน</span>
            </button>
          </div>

          {experienceList.length === 0 ? (
            <div className="text-center py-12 px-4 bg-gray-50/70 rounded-2xl border border-dashed border-gray-200 text-gray-400">
              <Briefcase className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium text-gray-600">ยังไม่มีข้อมูลประวัติการทำงาน</p>
              <p className="text-xs text-gray-400 mt-1">กดปุ่ม "+ เพิ่มประวัติการทำงาน" เพื่อระบุประสบการณ์</p>
            </div>
          ) : (
            <div className="space-y-4">
              {experienceList.map((exp, idx) => (
                <div key={exp.id} className="p-4 sm:p-5 rounded-2xl bg-gray-50/80 border border-gray-200/90 relative group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                      ประสบการณ์ที่ {idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteExperience(exp.id)}
                      className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="ลบรายการนี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-3">
                    <div>
                      <label className="text-[11px] font-semibold text-gray-600 block mb-1">ตำแหน่ง / หน้าที่</label>
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => handleUpdateExperience(exp.id, "role", e.target.value)}
                        placeholder="เช่น ครูผู้สอนวิชาทัศนศิลป์"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:border-orange-500 outline-none bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-gray-600 block mb-1">หน่วยงาน / โรงเรียน</label>
                      <input
                        type="text"
                        value={exp.workplace}
                        onChange={(e) => handleUpdateExperience(exp.id, "workplace", e.target.value)}
                        placeholder="เช่น โรงเรียนวชิรธรรมสาธิต"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:border-orange-500 outline-none bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-gray-600 block mb-1">ช่วงเวลา (พ.ศ.)</label>
                      <input
                        type="text"
                        value={exp.period}
                        onChange={(e) => handleUpdateExperience(exp.id, "period", e.target.value)}
                        placeholder="เช่น 2561 - ปัจจุบัน"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:border-orange-500 outline-none bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-1">รายละเอียดผลงาน / หน้าที่รับผิดชอบสังเขป</label>
                    <textarea
                      rows={2}
                      value={exp.details}
                      onChange={(e) => handleUpdateExperience(exp.id, "details", e.target.value)}
                      placeholder="เช่น หัวหน้ากลุ่มสาระการเรียนรู้ศิลปะ, ผู้ดูแลโครงการห้องเรียนสร้างสรรค์ Art Room"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:border-orange-500 outline-none bg-white leading-relaxed font-light"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 4: รางวัลที่ได้รับ & รูปรับรางวัล */}
      {activeSection === "awards" && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-2xs border border-gray-200 space-y-5 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold font-kanit text-gray-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-orange-500" />
                <span>รางวัลที่ได้รับ & รูปรับรางวัล (Awards & Honors)</span>
              </h3>
              <p className="text-xs text-gray-500 font-light mt-0.5">
                บันทึกรางวัล เกียรติบัตร และแนบรูปถ่ายขณะรับรางวัลหรือภาพเกียรติบัตรเฉพาะรายการ
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddAward}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ เพิ่มรางวัล</span>
            </button>
          </div>

          {awardsList.length === 0 ? (
            <div className="text-center py-12 px-4 bg-gray-50/70 rounded-2xl border border-dashed border-gray-200 text-gray-400">
              <Trophy className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium text-gray-600">ยังไม่มีข้อมูลรางวัลที่ได้รับ</p>
              <p className="text-xs text-gray-400 mt-1">กดปุ่ม "+ เพิ่มรางวัล" เพื่อเริ่มบันทึกรางวัลและรูปถ่ายรับรางวัล</p>
            </div>
          ) : (
            <div className="space-y-4">
              {awardsList.map((award, idx) => (
                <div key={award.id} className="p-4 sm:p-5 rounded-2xl bg-gray-50/80 border border-gray-200/90 relative group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                      รางวัลที่ {idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteAward(award.id)}
                      className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="ลบรางวัลนี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
                    {/* Text Inputs */}
                    <div className="lg:col-span-3 space-y-3">
                      <div>
                        <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                          ชื่อรางวัล / ผลงานดีเด่น <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={award.title}
                          onChange={(e) => handleUpdateAward(award.id, "title", e.target.value)}
                          placeholder="เช่น รางวัลครูผู้สอนดีเด่น กลุ่มสาระการเรียนรู้ศิลปะ ระดับเหรียญทอง"
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:border-orange-500 outline-none bg-white font-medium"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-gray-600 block mb-1">ปี พ.ศ. ที่ได้รับ</label>
                          <input
                            type="text"
                            value={award.year}
                            onChange={(e) => handleUpdateAward(award.id, "year", e.target.value)}
                            placeholder="เช่น 2566"
                            className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:border-orange-500 outline-none bg-white font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-gray-600 block mb-1">หน่วยงาน / องค์กรที่มอบ</label>
                          <input
                            type="text"
                            value={award.issuer}
                            onChange={(e) => handleUpdateAward(award.id, "issuer", e.target.value)}
                            placeholder="เช่น สำนักงานเขตพื้นที่การศึกษามัธยมศึกษากรุงเทพมหานคร เขต 2"
                            className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:border-orange-500 outline-none bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Award Image Box */}
                    <div className="lg:col-span-1">
                      <label className="text-[11px] font-semibold text-gray-600 block mb-1">รูปถ่ายตอนรับรางวัล</label>
                      <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-dashed border-gray-300 hover:border-orange-400 bg-white flex flex-col items-center justify-center group transition-colors">
                        {award.imageUrl ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={award.imageUrl} alt={award.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                              <label className="px-2.5 py-1 bg-white text-gray-800 text-[11px] font-bold rounded-md cursor-pointer hover:bg-gray-100">
                                <span>เปลี่ยน</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) handleAwardImageUpload(award.id, f);
                                  }}
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => handleUpdateAward(award.id, "imageUrl", "")}
                                className="px-2 py-1 bg-rose-600 text-white text-[11px] font-bold rounded-md hover:bg-rose-700"
                              >
                                ลบรูป
                              </button>
                            </div>
                          </>
                        ) : (
                          <label className="flex flex-col items-center justify-center p-2 text-center cursor-pointer w-full h-full text-gray-400 hover:text-orange-500">
                            <Upload className="w-5 h-5 mb-1" />
                            <span className="text-[11px] font-bold">อัปโหลดรูปรับรางวัล</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleAwardImageUpload(award.id, f);
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 5: ภาพครูกับกิจกรรม */}
      {activeSection === "activities" && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-2xs border border-gray-200 space-y-5 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold font-kanit text-gray-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-orange-500" />
                <span>ภาพครูกับกิจกรรมที่อยากลง (Teacher Activity Gallery)</span>
              </h3>
              <p className="text-xs text-gray-500 font-light mt-0.5">
                อัปโหลดรูปถ่ายบรรยากาศการสอน ผลงานนักเรียน หรือภาพครูเก๋ร่วมกิจกรรมศิลปะต่างๆ
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddActivityImage}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ เพิ่มภาพกิจกรรม</span>
            </button>
          </div>

          {activityImagesList.length === 0 ? (
            <div className="text-center py-12 px-4 bg-gray-50/70 rounded-2xl border border-dashed border-gray-200 text-gray-400">
              <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium text-gray-600">ยังไม่มีรูปภาพกิจกรรม</p>
              <p className="text-xs text-gray-400 mt-1">กดปุ่ม "+ เพิ่มภาพกิจกรรม" เพื่ออัปโหลดภาพบรรยากาศการสอน</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {activityImagesList.map((act, idx) => (
                <div key={act.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col justify-between space-y-3 group">
                  {/* Photo Preview & Upload Box */}
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-900 border border-gray-200">
                    {act.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={act.imageUrl} alt={act.title} className="w-full h-full object-cover" />
                    ) : (
                      <label className="w-full h-full flex flex-col items-center justify-center text-gray-400 hover:text-orange-400 cursor-pointer bg-gray-100">
                        <Upload className="w-6 h-6 mb-1" />
                        <span className="text-xs font-bold">อัปโหลดรูปกิจกรรม</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleActivityImageFileUpload(act.id, f);
                          }}
                        />
                      </label>
                    )}

                    {/* Change Button Overlay if image exists */}
                    {act.imageUrl && (
                      <label className="absolute inset-0 bg-black/50 text-white text-xs font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <span>เปลี่ยนรูป</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleActivityImageFileUpload(act.id, f);
                          }}
                        />
                      </label>
                    )}

                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[10px] font-bold text-white">
                      รูปที่ {idx + 1}
                    </span>
                  </div>

                  {/* Caption & Date Input */}
                  <div className="space-y-2">
                    <div>
                      <label className="text-[11px] font-semibold text-gray-600 block mb-0.5">ชื่อกิจกรรม / คำบรรยายภาพ</label>
                      <input
                        type="text"
                        value={act.title}
                        onChange={(e) => handleUpdateActivityImage(act.id, "title", e.target.value)}
                        placeholder="เช่น กิจกรรม Workshop วาดเส้นริมสวน"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:border-orange-500 outline-none bg-white font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-gray-600 block mb-0.5">วันที่ / ปีที่จัดกิจกรรม</label>
                      <input
                        type="text"
                        value={act.date || ""}
                        onChange={(e) => handleUpdateActivityImage(act.id, "date", e.target.value)}
                        placeholder="เช่น 14 กุมภาพันธ์ 2567"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:border-orange-500 outline-none bg-white"
                      />
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteActivityImage(act.id)}
                    className="w-full py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-100 bg-rose-50 border border-rose-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ลบรูปกิจกรรมนี้</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Floating Bottom Action Bar */}
      <div className="fixed bottom-6 right-8 z-40">
        <Button
          type="button"
          onClick={() => handleSaveProfile()}
          disabled={isSaving}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm px-7 py-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-2.5 cursor-pointer scale-100 hover:scale-105"
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>กำลังบันทึกข้อมูล...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>บันทึกการเปลี่ยนแปลงทั้งหมด</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

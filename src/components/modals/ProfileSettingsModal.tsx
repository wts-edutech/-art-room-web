"use client";

import { useState, useEffect, useRef } from "react";
import { 
  X, Upload, Image as ImageIcon, Sparkles, Check, 
  User, Phone, Mail, GraduationCap, ShieldCheck, 
  Camera, Trash2, ArrowRight, Palette, RefreshCw
} from "lucide-react";
import { ART_AVATAR_PRESETS, getArtAvatarById, resolveUserAvatar, ArtAvatarPreset } from "@/lib/art-avatars";

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess?: () => void;
}

export default function ProfileSettingsModal({ isOpen, onClose, onSaveSuccess }: ProfileSettingsModalProps) {
  // User Profile State
  const [role, setRole] = useState<string>("student"); // student | guest | teacher | admin
  const [userRoleTitle, setUserRoleTitle] = useState<string>("นักเรียน");
  const [studentId, setStudentId] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [grade, setGrade] = useState<string>("ม.3");
  const [room, setRoom] = useState<string>("1");
  const [provider, setProvider] = useState<string>("Google");

  // Avatar Management State
  const [avatarValue, setAvatarValue] = useState<string>("");
  const [avatarMode, setAvatarMode] = useState<"preset" | "upload">("preset");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Save Status
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Load existing profile from localStorage on open
  useEffect(() => {
    if (!isOpen) return;

    setErrorMessage("");
    setSaveSuccess(false);

    const savedName = localStorage.getItem("artroom_author_name") || "";
    const savedEmail = localStorage.getItem("artroom_author_email") || "";
    const savedRole = localStorage.getItem("artroom_role") || "student";
    const savedUserRole = localStorage.getItem("artroom_user_role") || "ผู้ปกครองนักเรียน";
    const savedPhone = localStorage.getItem("artroom_phone") || "";
    const savedDisplayName = localStorage.getItem("artroom_display_name") || savedName;
    const savedAvatar = localStorage.getItem("artroom_avatar") || "";
    const savedGrade = localStorage.getItem("artroom_student_grade") || "ม.3/1";
    const savedProvider = localStorage.getItem("artroom_provider") || (savedEmail.includes("gmail") ? "Google" : "Facebook");

    setRole(savedRole);
    setUserRoleTitle(savedRole === "student" ? "นักเรียน WTS" : savedUserRole);
    setFullName(savedName);
    setDisplayName(savedDisplayName);
    setEmail(savedEmail);
    setPhone(savedPhone);
    setProvider(savedProvider);

    // Extract studentId if email is 12345@wachiratham.ac.th
    if (savedRole === "student") {
      const match = savedEmail.match(/^(\d{5})@/);
      if (match) setStudentId(match[1]);
      
      // Parse grade and room
      if (savedGrade.includes("/")) {
        const [g, r] = savedGrade.split("/");
        setGrade(g || "ม.3");
        setRoom(r || "1");
      } else {
        setGrade(savedGrade || "ม.3");
      }
    }

    // Determine initial avatar
    if (savedAvatar) {
      setAvatarValue(savedAvatar);
      if (savedAvatar.startsWith("data:") || savedAvatar.startsWith("http")) {
        setAvatarMode("upload");
      } else {
        setAvatarMode("preset");
      }
    } else {
      // Default: If student, select first preset, else social avatar
      if (savedRole === "student") {
        setAvatarValue("art-brush");
        setAvatarMode("preset");
      } else {
        // Auto-generate high-res provider avatar for guest if none
        const seed = encodeURIComponent(savedName || "Guest");
        const defaultSocialAvatar = `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=ffe4e6,ffedd5`;
        setAvatarValue(defaultSocialAvatar);
        setAvatarMode("upload");
      }
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Handle Image Upload with Client-Side Compression
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง (JPG, PNG, WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("ขนาดไฟล์ต้องไม่เกิน 5 MB");
      return;
    }

    setIsUploading(true);
    setErrorMessage("");

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resize image to max 400x400 for fast loading
        const canvas = document.createElement("canvas");
        const maxSize = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.88);
          setAvatarValue(compressedDataUrl);
          setAvatarMode("upload");
        }
        setIsUploading(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Save profile changes
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!fullName.trim()) {
      setErrorMessage("กรุณาระบุชื่อ-นามสกุล");
      return;
    }

    setIsSaving(true);

    try {
      const fullGrade = role === "student" ? `${grade}/${room}` : undefined;

      // 1. Sync to localStorage
      localStorage.setItem("artroom_author_name", fullName.trim());
      localStorage.setItem("artroom_display_name", (displayName || fullName).trim());
      if (phone.trim()) localStorage.setItem("artroom_phone", phone.trim());
      if (avatarValue) localStorage.setItem("artroom_avatar", avatarValue);
      if (fullGrade) localStorage.setItem("artroom_student_grade", fullGrade);

      // 2. Call API endpoint (safe background sync)
      await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: role === "student" ? studentId : undefined,
          name: fullName.trim(),
          displayName: (displayName || fullName).trim(),
          phone: phone.trim(),
          grade: fullGrade,
          avatar: avatarValue,
        }),
      }).catch(() => null);

      // 3. Dispatch global update event so Navbar & other components re-render immediately
      window.dispatchEvent(new Event("artroom_profile_updated"));

      setIsSaving(false);
      setSaveSuccess(true);

      setTimeout(() => {
        if (onSaveSuccess) onSaveSuccess();
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
      setIsSaving(false);
      setErrorMessage("เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง");
    }
  };

  if (!isOpen) return null;

  const currentResolvedAvatar = resolveUserAvatar(avatarValue, fullName);

  return (
    <div 
      className="fixed inset-0 z-[9999] overflow-y-auto bg-black/60 backdrop-blur-sm flex items-start sm:items-center justify-center p-3 sm:p-4 py-6 sm:py-8 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Floating Top-Right Close Button for Quick Exit on Any Screen */}
      <button 
        type="button" 
        onClick={onClose} 
        className="fixed top-3 right-3 sm:top-5 sm:right-6 z-[10000] bg-black/80 hover:bg-red-600 text-white px-3 py-1.5 rounded-full shadow-2xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold border border-white/20 active:scale-95 backdrop-blur-md"
        title="ปิดหน้าต่าง (Esc)"
      >
        <X className="w-3.5 h-3.5" />
        <span>ปิด (Esc)</span>
      </button>

      <div 
        className="bg-white rounded-3xl w-full max-w-4xl lg:max-w-5xl max-h-[88vh] flex flex-col min-h-0 shadow-2xl border border-orange-100 overflow-hidden animate-in zoom-in-95 duration-200 relative my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Sticky Header */}
        <div className="shrink-0 px-5 sm:px-6 py-3.5 bg-white/95 backdrop-blur-md border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-2xs">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-none flex items-center gap-2">
                <span>ตั้งค่าโปรไฟล์ผู้ใช้งาน</span>
                <span className={`text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  role === "student"
                    ? "bg-amber-50 text-amber-800 border-amber-200"
                    : "bg-blue-50 text-blue-800 border-blue-200"
                }`}>
                  {userRoleTitle}
                </span>
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-400 font-normal mt-0.5">
                ปรับแต่งข้อมูลส่วนตัวและรูปโปรไฟล์ในระบบ ART ROOM (แนวนอน พอดีกับหน้าจอ)
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-400 flex items-center justify-center transition-colors cursor-pointer"
            title="ปิดหน้าต่าง"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form wrapping 2-Column Horizontal Body & Sticky Footer */}
        <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Scrollable Body with 2-Column Grid */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 lg:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 items-start">
              
              {/* ================= LEFT COLUMN: AVATAR & PRESETS ================= */}
              <div className="space-y-3.5">
                {/* Avatar Showcase Card */}
                <div className="bg-gradient-to-br from-orange-50/70 via-amber-50/40 to-white rounded-2xl p-3.5 border border-orange-150/70 flex items-center gap-3.5">
                  {/* Current Active Avatar Circle */}
                  <div className="relative group shrink-0">
                    <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-white shadow-md border-3 border-white flex items-center justify-center overflow-hidden ring-3 ring-orange-200/60 transition-all">
                      {currentResolvedAvatar.type === "image" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={currentResolvedAvatar.value} 
                          alt={fullName} 
                          className="w-full h-full object-cover" 
                        />
                      ) : currentResolvedAvatar.type === "preset" ? (
                        <div className={`w-full h-full flex flex-col items-center justify-center ${currentResolvedAvatar.preset?.colorBg || "bg-orange-50"}`}>
                          <span className="text-3xl select-none animate-in zoom-in-75 duration-200">
                            {currentResolvedAvatar.value}
                          </span>
                        </div>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-orange-500 to-amber-400 text-white font-bold text-2xl flex items-center justify-center">
                          {currentResolvedAvatar.value}
                        </div>
                      )}
                    </div>

                    {/* Quick Camera Action Overlay */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center shadow-md transition-all active:scale-90 cursor-pointer border-2 border-white"
                      title="อัปโหลดรูปภาพใหม่"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Avatar Info & Mode Toggles */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 block">
                      รูปภาพประจำตัว (Avatar)
                    </span>
                    <h4 className="text-sm font-bold text-gray-900 truncate">
                      {displayName || fullName || "ผู้ใช้งาน Art Room"}
                    </h4>
                    <p className="text-[11px] text-gray-500 font-normal truncate">
                      {currentResolvedAvatar.type === "preset"
                        ? `ไอคอนศิลปะ: ${currentResolvedAvatar.preset?.name}`
                        : currentResolvedAvatar.type === "image"
                        ? "รูปภาพอัปโหลดส่วนตัว"
                        : "อักษรย่อเริ่มต้น"}
                    </p>

                    {/* Action Tabs */}
                    <div className="flex items-center gap-1.5 pt-0.5">
                      {role === "student" ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setAvatarMode("preset")}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                              avatarMode === "preset"
                                ? "bg-orange-600 text-white shadow-xs"
                                : "bg-white text-gray-600 hover:bg-orange-50 border border-gray-200"
                            }`}
                          >
                            <Palette className="w-3 h-3" />
                            <span>ไอคอนศิลปะ</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setAvatarMode("upload");
                              fileInputRef.current?.click();
                            }}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                              avatarMode === "upload"
                                ? "bg-orange-600 text-white shadow-xs"
                                : "bg-white text-gray-600 hover:bg-orange-50 border border-gray-200"
                            }`}
                          >
                            <Upload className="w-3 h-3" />
                            <span>อัปโหลดรูป</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white hover:bg-orange-50 text-gray-700 border border-gray-200 flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                          >
                            <Upload className="w-3 h-3 text-orange-500" />
                            <span>เปลี่ยนรูป</span>
                          </button>
                          {avatarValue && avatarValue.startsWith("data:") && (
                            <button
                              type="button"
                              onClick={() => {
                                const seed = encodeURIComponent(fullName || "Guest");
                                setAvatarValue(`https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=ffe4e6,ffedd5`);
                              }}
                              className="px-2 py-1 rounded-full text-[11px] font-normal text-gray-500 hover:text-red-600 hover:bg-red-50 flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>รีเซ็ต</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hidden File Input */}
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileChange}
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  className="hidden"
                />

                {/* Preset Art Avatars Selection Grid (8 แบบ) */}
                <div className="space-y-1.5 bg-gray-50/50 p-3 rounded-2xl border border-gray-150">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>เลือกอวาตาร์ไอคอนศิลปะ (8 แบบ)</span>
                    </label>
                    <span className="text-[10px] text-gray-400 font-normal">
                      คลิกเลือกทันที
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {ART_AVATAR_PRESETS.map((item) => {
                      const isSelected = avatarValue === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            setAvatarValue(item.id);
                            setAvatarMode("preset");
                          }}
                          className={`p-2 rounded-xl border transition-all cursor-pointer flex flex-col items-center text-center relative select-none ${
                            isSelected
                              ? `ring-2 ring-orange-500 bg-white shadow-sm ${item.colorBorder}`
                              : "bg-white/80 hover:bg-white hover:border-gray-300 border-gray-200"
                          }`}
                        >
                          {/* Checkmark */}
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-2xs">
                              <Check className="w-2 h-2 stroke-[3]" />
                            </div>
                          )}

                          <div className={`w-8 h-8 rounded-full ${item.colorBg} flex items-center justify-center text-base mb-1 shadow-2xs`}>
                            {item.iconEmoji}
                          </div>
                          <span className="text-[11px] font-bold text-gray-800 leading-tight truncate w-full">
                            {item.name}
                          </span>
                          <span className="text-[9px] text-gray-400 font-normal truncate w-full">
                            {item.category}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Upload Status / Hint */}
                {avatarMode === "upload" && (
                  <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/70 text-[11px] text-amber-800 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Upload className="w-3 h-3 text-amber-600" />
                      รองรับไฟล์ภาพ JPG, PNG, WebP (ย่อขนาดอัตโนมัติ)
                    </span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2 py-0.5 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] cursor-pointer"
                    >
                      เลือกไฟล์
                    </button>
                  </div>
                )}
              </div>

              {/* ================= RIGHT COLUMN: PROFILE DETAILS ================= */}
              <div className="space-y-3">
                <h4 className="text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-orange-500" />
                  <span>ข้อมูลประจำตัวผู้ใช้งาน</span>
                </h4>

                {/* Field 1: Full Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    ชื่อ - นามสกุลจริง <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="เช่น กฤตยชญ์ วงศ์สว่าง"
                    className="w-full h-9.5 px-3 rounded-xl border border-gray-200 bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 outline-none text-xs sm:text-sm text-gray-800 font-normal transition-all"
                    required
                  />
                </div>

                {/* Field 2: Display Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
                    <span>ชื่อแสดงผลในระบบ (Display Name)</span>
                    <span className="text-[10px] text-gray-400 font-normal">แสดงในคอมเมนต์</span>
                  </label>
                  <input 
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="เช่น อาร์ตี้ ม.3 หรือ ครูต้องใจ"
                    className="w-full h-9.5 px-3 rounded-xl border border-gray-200 bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 outline-none text-xs sm:text-sm text-gray-800 font-normal transition-all"
                  />
                </div>

                {/* Student Specific: Grade & Room */}
                {role === "student" && (
                  <div className="grid grid-cols-2 gap-2.5 bg-amber-50/40 p-2.5 rounded-xl border border-amber-100/80">
                    <div>
                      <label className="block text-xs font-bold text-amber-900 mb-1 flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                        <span>ระดับชั้น</span>
                      </label>
                      <select
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="w-full h-8.5 px-2.5 rounded-lg border border-amber-200 bg-white text-xs font-normal text-gray-800 outline-none cursor-pointer"
                      >
                        <option value="ม.3">มัธยมศึกษาปีที่ 3 (ม.3)</option>
                        <option value="ม.4">มัธยมศึกษาปีที่ 4 (ม.4)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-amber-900 mb-1">
                        ห้องเรียน
                      </label>
                      <select
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                        className="w-full h-8.5 px-2.5 rounded-lg border border-amber-200 bg-white text-xs font-normal text-gray-800 outline-none cursor-pointer"
                      >
                        {[...Array(14)].map((_, i) => (
                          <option key={i + 1} value={String(i + 1)}>
                            ห้อง {i + 1}
                          </option>
                        ))}
                      </select>
                    </div>

                    {studentId && (
                      <div className="col-span-2 flex items-center justify-between text-[11px] text-amber-800 pt-1 border-t border-amber-200/50">
                        <span className="font-normal">รหัสประจำตัวนักเรียน:</span>
                        <span className="font-mono font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
                          {studentId}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Contact Phone & Email Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      เบอร์โทรติดต่อ
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
                        <Phone className="w-3.5 h-3.5" />
                      </div>
                      <input 
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="เช่น 081-234-5678"
                        className="w-full h-9.5 pl-8 pr-2.5 rounded-xl border border-gray-200 bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 outline-none text-xs sm:text-sm text-gray-800 font-normal transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
                      <span>อีเมลบัญชี</span>
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                        <ShieldCheck className="w-3 h-3" /> ยืนยันแล้ว
                      </span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      <input 
                        type="email"
                        value={email}
                        disabled
                        className="w-full h-9.5 pl-8 pr-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs sm:text-sm text-gray-500 font-normal cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* Error Message Alert */}
                {errorMessage && (
                  <div className="p-2.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-normal animate-in fade-in">
                    ⚠️ {errorMessage}
                  </div>
                )}

                {/* Success Message Alert */}
                {saveSuccess && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-2 animate-in zoom-in-95">
                    <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span>บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว! ข้อมูลจะอัปเดตทันที</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modal Sticky Footer Actions Bar */}
          <div className="shrink-0 px-5 sm:px-6 py-3 bg-gray-50/95 backdrop-blur-md border-t border-gray-100 flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5">
            <div className="text-xs text-gray-400 font-normal hidden sm:flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
              <span>ข้อมูลจะถูกบันทึกและซิงค์ทันทีกับระบบ ART ROOM</span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs sm:text-sm font-normal text-gray-600 hover:bg-gray-200/60 transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>

              <button
                type="submit"
                disabled={isSaving || isUploading}
                className={`w-full sm:w-auto px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                  saveSuccess
                    ? "bg-emerald-600 shadow-emerald-500/25"
                    : "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/20"
                }`}
              >
                {isSaving ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    <span>กำลังบันทึก...</span>
                  </>
                ) : saveSuccess ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>บันทึกสำเร็จ</span>
                  </>
                ) : (
                  <>
                    <span>บันทึกการเปลี่ยนแปลง</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

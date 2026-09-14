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
    let savedUserRole = localStorage.getItem("artroom_user_role") || "ผู้ปกครองนักเรียน";
    if (savedUserRole.includes("ภายนอก")) {
      savedUserRole = "ครู / บุคลากรทางการศึกษา";
      localStorage.setItem("artroom_user_role", savedUserRole);
    }
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
        const [rawG, r] = savedGrade.split("/");
        let g = rawG.trim();
        if (g.includes("1")) g = "ม.1";
        else if (g.includes("2")) g = "ม.2";
        else if (g.includes("3")) g = "ม.3";
        else if (g.includes("4")) g = "ม.4";
        else if (g.includes("5")) g = "ม.5";
        else if (g.includes("6")) g = "ม.6";
        setGrade(g || "ม.3");
        setRoom(r || "1");
      } else {
        let g = savedGrade.trim();
        if (g.includes("1")) g = "ม.1";
        else if (g.includes("2")) g = "ม.2";
        else if (g.includes("3")) g = "ม.3";
        else if (g.includes("4")) g = "ม.4";
        else if (g.includes("5")) g = "ม.5";
        else if (g.includes("6")) g = "ม.6";
        setGrade(g || "ม.3");
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
        className="bg-white rounded-3xl w-full max-w-lg sm:max-w-xl max-h-[85vh] sm:max-h-[88vh] flex flex-col min-h-0 shadow-2xl border border-orange-100 overflow-hidden animate-in zoom-in-95 duration-200 relative my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Sticky Header */}
        <div className="shrink-0 px-4 sm:px-6 py-3.5 bg-white/95 backdrop-blur-md border-b border-gray-100 flex items-center justify-between">
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
                ปรับแต่งข้อมูลส่วนตัวและรูปโปรไฟล์ในระบบ ART ROOM
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

        {/* Modal Form wrapping Scrollable Body & Sticky Footer */}
        <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Scrollable Body */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Avatar Showcase & Selection Header */}
            <div className="bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-white rounded-2xl p-4 border border-orange-200/90 shadow-xs flex flex-col sm:flex-row items-center gap-4">
              {/* Current Active Avatar Circle */}
              <div className="relative group shrink-0">
                <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-white shadow-md border-3 border-white ring-4 ring-orange-300/80 flex items-center justify-center overflow-hidden transition-all">
                  {currentResolvedAvatar.type === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={currentResolvedAvatar.value} 
                      alt={fullName} 
                      className="w-full h-full object-cover" 
                    />
                  ) : currentResolvedAvatar.type === "preset" ? (
                    <div className={`w-full h-full flex flex-col items-center justify-center ${currentResolvedAvatar.preset?.colorBg || "bg-orange-50"} bg-gradient-to-br from-amber-50 to-rose-100`}>
                      <span className="text-4xl sm:text-5xl select-none filter drop-shadow-xs animate-in zoom-in-75 duration-200">
                        {currentResolvedAvatar.value}
                      </span>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-extrabold text-2xl sm:text-3xl flex items-center justify-center">
                      {currentResolvedAvatar.value}
                    </div>
                  )}
                </div>

                {/* Quick Camera Action Overlay with Vivid High-Contrast Styling */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ backgroundColor: '#ea580c', color: '#ffffff' }}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#ea580c] hover:bg-[#c2410c] text-white flex items-center justify-center shadow-md transition-all active:scale-90 cursor-pointer border-2 border-white ring-2 ring-orange-200"
                  title="อัปโหลดรูปภาพใหม่"
                >
                  <Camera className="w-4 h-4 text-white stroke-[2.5]" />
                </button>
              </div>

              {/* Avatar Info & Mode Toggles */}
              <div className="flex-1 text-center sm:text-left space-y-2">
                <div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-orange-100 text-orange-900 border border-orange-200 mb-1">
                    รูปภาพประจำตัว (Avatar)
                  </span>
                  <h4 className="text-base sm:text-lg font-extrabold text-gray-950 truncate">
                    {displayName || fullName || "ผู้ใช้งาน Art Room"}
                  </h4>
                  
                  {/* High-Contrast Active Status Tag */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/95 border border-orange-200 shadow-2xs text-xs font-semibold text-gray-800 mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span>
                      {currentResolvedAvatar.type === "preset"
                        ? `ใช้งานไอคอนศิลปะ: ${currentResolvedAvatar.preset?.name}`
                        : currentResolvedAvatar.type === "image"
                        ? "ใช้งานรูปภาพอัปโหลดส่วนตัว"
                        : "ใช้งานอักษรย่อเริ่มต้น"}
                    </span>
                  </div>
                </div>

                {/* Avatar Options Segmented Tabs for Students */}
                {role === "student" && (
                  <div className="inline-flex p-1 bg-amber-100/80 border border-amber-200/90 rounded-2xl gap-1 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setAvatarMode("preset")}
                      style={avatarMode === "preset" ? { backgroundColor: '#ea580c', color: '#ffffff' } : { backgroundColor: '#ffffff', color: '#374151' }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                        avatarMode === "preset"
                          ? "border-orange-600 shadow-sm"
                          : "border-transparent hover:bg-white text-gray-700"
                      }`}
                    >
                      <Palette className="w-3.5 h-3.5" />
                      <span>ไอคอนศิลปะ (8 แบบ)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAvatarMode("upload");
                        fileInputRef.current?.click();
                      }}
                      style={avatarMode === "upload" ? { backgroundColor: '#ea580c', color: '#ffffff' } : { backgroundColor: '#ffffff', color: '#374151' }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                        avatarMode === "upload"
                          ? "border-orange-600 shadow-sm"
                          : "border-transparent hover:bg-white text-gray-700"
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>อัปโหลดรูปส่วนตัว</span>
                    </button>
                  </div>
                )}

                {/* Guest Quick Actions */}
                {role !== "student" && (
                  <div className="flex items-center justify-center sm:justify-start gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{ backgroundColor: '#ffffff', color: '#1f2937' }}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-orange-50 text-gray-800 border border-gray-300 flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#ea580c]" />
                      <span>เปลี่ยนรูปภาพ</span>
                    </button>

                    {avatarValue && avatarValue.startsWith("data:") && (
                      <button
                        type="button"
                        onClick={() => {
                          const seed = encodeURIComponent(fullName || "Guest");
                          setAvatarValue(`https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=ffe4e6,ffedd5`);
                        }}
                        style={{ backgroundColor: '#ffffff', color: '#4b5563' }}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:text-red-600 hover:bg-red-50 border border-gray-200 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>รีเซ็ตรูปโซเชียล</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Hidden File Input for Device Image Upload */}
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleImageFileChange}
              accept="image/png,image/jpeg,image/webp,image/jpg"
              className="hidden"
            />

            {/* PRESET ART AVATARS SELECTION GRID (For Students & Enthusiasts) */}
            {(role === "student" || avatarMode === "preset") && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-[13px] font-semibold text-gray-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>เลือกอวาตาร์ไอคอนศิลปะสำเร็จรูป (Preset Art Avatars)</span>
                  </label>
                  <span className="text-[11px] text-gray-400 font-normal">
                    คลิกเพื่อเลือกทันที (8 แบบ)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
                  {ART_AVATAR_PRESETS.map((item) => {
                    const isSelected = avatarValue === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          setAvatarValue(item.id);
                          setAvatarMode("preset");
                        }}
                        style={isSelected ? { borderColor: '#ea580c', backgroundColor: '#fff7ed' } : undefined}
                        className={`p-2.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center relative ${
                          isSelected
                            ? "border-orange-500 bg-orange-50/80 shadow-md ring-2 ring-orange-300/60"
                            : "bg-white hover:bg-orange-50/40 hover:border-orange-200 border-gray-200 shadow-2xs"
                        }`}
                      >
                        {/* Active Indicator Checkmark */}
                        {isSelected && (
                          <div 
                            style={{ backgroundColor: '#ea580c', color: '#ffffff' }}
                            className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#ea580c] text-white flex items-center justify-center shadow-xs"
                          >
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}

                        <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl ${item.colorBg} flex items-center justify-center text-2xl mb-1.5 shadow-2xs border border-orange-100`}>
                          <span className="filter drop-shadow-xs">{item.iconEmoji}</span>
                        </div>
                        <span className="text-[12px] sm:text-[13px] font-bold text-gray-900 leading-tight">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-gray-600 font-medium mt-0.5 line-clamp-1">
                          {item.category}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* EDITABLE FIELDS SECTION */}
            <div className="space-y-3.5 pt-2 border-t border-gray-100">
              <h4 className="text-xs sm:text-[13px] font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-orange-500" />
                <span>ข้อมูลประจำตัวผู้ใช้งาน</span>
              </h4>

              {/* Field 1: Full Name */}
              <div>
                <label className="block text-xs sm:text-[13px] font-semibold text-gray-700 mb-1.5">
                  ชื่อ - นามสกุลจริง <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="เช่น กฤตยชญ์ วงศ์สว่าง"
                  className="w-full h-10 px-3.5 rounded-xl border border-gray-200 bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 outline-none text-[13px] sm:text-[13.5px] text-gray-800 font-normal leading-normal transition-all"
                  required
                />
              </div>

              {/* Field 2: Display Name (Optional / Social Alias) */}
              <div>
                <label className="block text-xs sm:text-[13px] font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
                  <span>ชื่อแสดงผลในระบบ (Display Name)</span>
                  <span className="text-[11px] text-gray-400 font-normal">ปรากฏในคอมเมนต์และไอเดีย</span>
                </label>
                <input 
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="เช่น อาร์ตี้ ม.3 หรือ ครูต้องใจ"
                  className="w-full h-10 px-3.5 rounded-xl border border-gray-200 bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 outline-none text-[13px] sm:text-[13.5px] text-gray-800 font-normal leading-normal transition-all"
                />
              </div>

              {/* STUDENT SPECIFIC: Grade & Room Status */}
              {role === "student" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-amber-50/50 p-3 sm:p-3.5 rounded-2xl border border-amber-200/70">
                  <div>
                    <label className="block text-xs sm:text-[13px] font-semibold text-amber-950 mb-1.5 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                      <span>ระดับชั้น</span>
                    </label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-amber-200 bg-white text-[13px] sm:text-[13.5px] font-normal text-gray-800 outline-none cursor-pointer focus:border-amber-400 focus:ring-2 focus:ring-amber-300/30"
                    >
                      <option value="ม.1">ชั้นมัธยมศึกษาปีที่ 1 (ม.1)</option>
                      <option value="ม.2">ชั้นมัธยมศึกษาปีที่ 2 (ม.2)</option>
                      <option value="ม.3">ชั้นมัธยมศึกษาปีที่ 3 (ม.3)</option>
                      <option value="ม.4">ชั้นมัธยมศึกษาปีที่ 4 (ม.4)</option>
                      <option value="ม.5">ชั้นมัธยมศึกษาปีที่ 5 (ม.5)</option>
                      <option value="ม.6">ชั้นมัธยมศึกษาปีที่ 6 (ม.6)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-[13px] font-semibold text-amber-950 mb-1.5">
                      ห้องเรียน
                    </label>
                    <select
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-amber-200 bg-white text-[13px] sm:text-[13.5px] font-normal text-gray-800 outline-none cursor-pointer focus:border-amber-400 focus:ring-2 focus:ring-amber-300/30"
                    >
                      {[...Array(14)].map((_, i) => (
                        <option key={i + 1} value={String(i + 1)}>
                          ห้อง {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>

                  {studentId && (
                    <div className="sm:col-span-2 flex items-center justify-between text-xs sm:text-[13px] text-amber-900 pt-1.5 border-t border-amber-200/60">
                      <span className="font-normal">รหัสประจำตัวนักเรียน:</span>
                      <span className="font-mono font-bold px-2.5 py-0.5 rounded-md bg-amber-100/90 text-amber-900 border border-amber-200">
                        {studentId}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Field 3: Phone Number (for contact / parents) */}
              <div>
                <label className="block text-xs sm:text-[13px] font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
                  <span>เบอร์โทรศัพท์สำหรับติดต่อ</span>
                  <span className="text-[11px] text-gray-400 font-normal">สำหรับประสานงานผลงาน/กิจกรรม</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <input 
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="เช่น 081-234-5678"
                    className="w-full h-10 pl-9 pr-3.5 rounded-xl border border-gray-200 bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 outline-none text-[13px] sm:text-[13.5px] text-gray-800 font-normal leading-normal transition-all"
                  />
                </div>
              </div>

              {/* Email Display (Read-Only) */}
              <div>
                <label className="block text-xs sm:text-[13px] font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
                  <span>อีเมลบัญชีที่ใช้งาน</span>
                  <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> ยืนยันแล้ว
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <input 
                    type="email"
                    value={email}
                    disabled
                    className="w-full h-10 pl-9 pr-3.5 rounded-xl border border-gray-200 bg-gray-50 text-[13px] sm:text-[13.5px] text-gray-500 font-normal cursor-not-allowed leading-normal"
                  />
                </div>
              </div>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-normal animate-in fade-in">
                ⚠️ {errorMessage}
              </div>
            )}

            {/* Success Message Alert */}
            {saveSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-2 animate-in zoom-in-95">
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว! ข้อมูลจะอัปเดตทันที</span>
              </div>
            )}
          </div>

          {/* Modal Sticky Footer Actions Bar */}
          <div className="shrink-0 px-4 sm:px-6 py-3 bg-gray-50/95 backdrop-blur-md border-t border-gray-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-normal text-gray-600 hover:bg-gray-200/60 transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              disabled={isSaving || isUploading}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
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
        </form>
      </div>
    </div>
  );
}

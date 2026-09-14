"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProfileSettingsModal from "@/components/modals/ProfileSettingsModal";
import { resolveUserAvatar } from "@/lib/art-avatars";
import { 
  User, Settings, GraduationCap, Phone, Mail, 
  ShieldCheck, Sparkles, BookOpen, Lightbulb, Heart, 
  Share2, ArrowRight, LogOut, ChevronRight
} from "lucide-react";

export default function ProfilePageClient() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [userRoleTitle, setUserRoleTitle] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [avatarValue, setAvatarValue] = useState<string>("");
  const [studentGrade, setStudentGrade] = useState<string>("ม.3/1");
  const [studentId, setStudentId] = useState<string>("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadProfile = () => {
    const name = localStorage.getItem("artroom_author_name") || "";
    const mail = localStorage.getItem("artroom_author_email") || "";
    const userRole = localStorage.getItem("artroom_role") || "";
    const roleTitle = localStorage.getItem("artroom_user_role") || "ผู้ปกครองนักเรียน";
    const tel = localStorage.getItem("artroom_phone") || "";
    const dName = localStorage.getItem("artroom_display_name") || name;
    const av = localStorage.getItem("artroom_avatar") || "";
    const grade = localStorage.getItem("artroom_student_grade") || "ม.3/1";

    setUserName(name);
    setDisplayName(dName);
    setEmail(mail);
    setRole(userRole);
    setUserRoleTitle(userRole === "student" ? "นักเรียน WTS" : roleTitle);
    setPhone(tel);
    setAvatarValue(av);
    setStudentGrade(grade);

    if (userRole === "student") {
      const match = mail.match(/^(\d{5})@/);
      if (match) setStudentId(match[1]);
    }

    setIsLoaded(true);
  };

  useEffect(() => {
    loadProfile();
    window.addEventListener("artroom_profile_updated", loadProfile);
    return () => window.removeEventListener("artroom_profile_updated", loadProfile);
  }, []);

  const resolvedAvatar = resolveUserAvatar(avatarValue, userName);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 rounded-full border-3 border-orange-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  // If not logged in, redirect or prompt to login
  if (!userName) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 pt-28 pb-16 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-200 text-center shadow-lg space-y-5">
            <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto shadow-xs">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">ยังไม่ได้เข้าสู่ระบบ</h2>
              <p className="text-sm text-gray-500 font-normal mt-1">
                กรุณาเข้าสู่ระบบเพื่อดูและจัดการข้อมูลโปรไฟล์ของคุณ
              </p>
            </div>
            <Link 
              href="/login"
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold transition-all shadow-md shadow-orange-500/20"
            >
              <span>เข้าสู่ระบบ</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#fafaf9] pt-28 pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs text-gray-400 font-normal">
            <Link href="/" className="hover:text-gray-700 transition-colors">หน้าแรก</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-700 font-medium">ข้อมูลโปรไฟล์ส่วนตัว</span>
          </div>

          {/* Profile Hero Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-orange-100/80 shadow-sm relative overflow-hidden">
            {/* Background Ambient Decorative Blob */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-orange-100/50 via-amber-100/30 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
              {/* Large Circular Avatar */}
              <div className="relative shrink-0 group">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white shadow-lg border-4 border-white flex items-center justify-center overflow-hidden ring-4 ring-orange-200/60">
                  {resolvedAvatar.type === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={resolvedAvatar.value} alt={userName} className="w-full h-full object-cover" />
                  ) : resolvedAvatar.type === "preset" ? (
                    <div className={`w-full h-full flex flex-col items-center justify-center ${resolvedAvatar.preset?.colorBg || "bg-orange-50"}`}>
                      <span className="text-5xl sm:text-6xl select-none">{resolvedAvatar.value}</span>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-orange-500 to-amber-400 text-white font-bold text-4xl flex items-center justify-center">
                      {resolvedAvatar.value}
                    </div>
                  )}
                </div>

                <button 
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                  className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer border-2 border-white"
                  title="แก้ไขโปรไฟล์"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>

              {/* Profile Details & Badges */}
              <div className="flex-1 text-center sm:text-left space-y-3">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className={`text-xs font-bold px-3 py-0.5 rounded-full border ${
                    role === "student"
                      ? "bg-amber-50 text-amber-800 border-amber-200"
                      : "bg-blue-50 text-blue-800 border-blue-200"
                  }`}>
                    {userRoleTitle}
                  </span>

                  {role === "student" && (
                    <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200 flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5" />
                      ชั้น {studentGrade}
                    </span>
                  )}

                  {studentId && (
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                      รหัส: {studentId}
                    </span>
                  )}
                </div>

                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                    {userName}
                  </h1>
                  {displayName && displayName !== userName && (
                    <p className="text-xs sm:text-sm text-gray-500 font-normal mt-0.5">
                      ชื่อแสดงผลในระบบ: <strong className="text-gray-800">{displayName}</strong>
                    </p>
                  )}
                </div>

                <p className="text-xs text-gray-500 font-light max-w-xl">
                  {role === "student"
                    ? "สมาชิกนักเรียนห้องเรียนศิลปะ โรงเรียนวชิรธรรมสาธิต เข้าร่วมกิจกรรมและสร้างสรรค์ผลงานศิลปะ"
                    : "ผู้ปกครอง / บุคคลทั่วไป ชุมชนศิลปะและการเรียนรู้เพื่อเด็กและเยาวชน Art Room"}
                </p>

                {/* Edit Button Trigger */}
                <div className="pt-1 flex items-center justify-center sm:justify-start gap-3">
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-orange-600/20 transition-all cursor-pointer active:scale-95"
                  >
                    <Settings className="w-4 h-4" />
                    <span>แก้ไขการตั้งค่าโปรไฟล์</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Account Information Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>ข้อมูลบัญชีผู้ใช้งาน</span>
              </h3>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500 font-normal">อีเมล:</span>
                  <span className="font-mono text-gray-800 font-medium">{email || "-"}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500 font-normal">เบอร์โทรศัพท์:</span>
                  <span className="text-gray-800 font-medium">{phone || "ยังไม่ได้ระบุ"}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500 font-normal">สถานะการยืนยัน:</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> ยืนยันตัวตนแล้ว
                  </span>
                </div>

                {role === "student" && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-500 font-normal">สังกัดสถาบัน:</span>
                    <span className="text-gray-800 font-medium">โรงเรียนวชิรธรรมสาธิต</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Links & Actions Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>การมีส่วนร่วมใน Art Room</span>
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <Link 
                  href="/ideas/new" 
                  className="p-3.5 rounded-2xl bg-orange-50/50 hover:bg-orange-50 border border-orange-100 text-left transition-all group"
                >
                  <Lightbulb className="w-5 h-5 text-orange-600 mb-1.5 group-hover:scale-110 transition-transform" />
                  <div className="text-xs font-bold text-gray-900">แชร์ไอเดียใหม่</div>
                  <div className="text-[11px] text-gray-500 font-normal">ร่วมแบ่งปันผลงาน</div>
                </Link>

                <Link 
                  href="/materials" 
                  className="p-3.5 rounded-2xl bg-amber-50/50 hover:bg-amber-50 border border-amber-100 text-left transition-all group"
                >
                  <BookOpen className="w-5 h-5 text-amber-600 mb-1.5 group-hover:scale-110 transition-transform" />
                  <div className="text-xs font-bold text-gray-900">คลังสื่อการสอน</div>
                  <div className="text-[11px] text-gray-500 font-normal">เรียนรู้เนื้อหาศิลปะ</div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Settings Modal */}
        <ProfileSettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
          onSaveSuccess={loadProfile}
        />
      </main>
      <Footer />
    </>
  );
}

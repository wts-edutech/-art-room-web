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
  Share2, ArrowRight, LogOut, ChevronRight, Bookmark,
  Download, Trash2
} from "lucide-react";
import { 
  getBookmarkedMaterials, 
  getBookmarkedIdeas, 
  removeMaterialBookmark, 
  removeIdeaBookmark, 
  BOOKMARKS_EVENT,
  BookmarkedMaterial,
  BookmarkedIdea
} from "@/lib/bookmarks";

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
  const [savedMaterials, setSavedMaterials] = useState<BookmarkedMaterial[]>([]);
  const [savedIdeas, setSavedIdeas] = useState<BookmarkedIdea[]>([]);
  const [activeCollectionTab, setActiveCollectionTab] = useState<"materials" | "ideas">("materials");

  const loadBookmarks = () => {
    setSavedMaterials(getBookmarkedMaterials());
    setSavedIdeas(getBookmarkedIdeas());
  };

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
    loadBookmarks();
    window.addEventListener("artroom_profile_updated", loadProfile);
    window.addEventListener(BOOKMARKS_EVENT, loadBookmarks);
    return () => {
      window.removeEventListener("artroom_profile_updated", loadProfile);
      window.removeEventListener(BOOKMARKS_EVENT, loadBookmarks);
    };
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

          {/* My Saved Collection (คลังที่บันทึกไว้ของฉัน) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">
                    คลังที่บันทึกไว้ของฉัน
                  </h3>
                  <p className="text-xs text-gray-500 font-light">
                    รวบรวมสื่อการสอน ใบงาน และไอเดียสร้างสรรค์ที่คุณกดบันทึกไว้
                  </p>
                </div>
              </div>

              {/* Collection Tabs Switcher */}
              <div className="flex items-center gap-1.5 bg-gray-100/80 p-1 rounded-2xl self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setActiveCollectionTab("materials")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeCollectionTab === "materials"
                      ? "bg-white text-gray-900 shadow-2xs"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>สื่อการสอน</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 text-[10px]">
                    {savedMaterials.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCollectionTab("ideas")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeCollectionTab === "ideas"
                      ? "bg-white text-gray-900 shadow-2xs"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>ไอเดียศิลปะ</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-orange-100 text-orange-700 text-[10px]">
                    {savedIdeas.length}
                  </span>
                </button>
              </div>
            </div>

            {/* Tab 1: Saved Materials */}
            {activeCollectionTab === "materials" && (
              <div>
                {savedMaterials.length === 0 ? (
                  <div className="py-12 text-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-6">
                    <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-400 flex items-center justify-center mx-auto mb-3">
                      <Heart className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-gray-800 mb-1">ยังไม่มีสื่อการสอนที่บันทึกไว้</p>
                    <p className="text-xs text-gray-500 mb-4 max-w-sm mx-auto font-light">
                      เมื่อคุณพบบทเรียน วิดีโอสอน หรือใบงานที่สนใจ สามารถกดบันทึกเพื่อเก็บไว้ดูในหน้านี้ได้
                    </p>
                    <Link
                      href="/materials"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm shadow-rose-600/20"
                    >
                      <span>สำรวจคลังสื่อการสอน</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedMaterials.map((item) => (
                      <div
                        key={item.id}
                        className="group flex flex-col justify-between bg-white rounded-2xl border border-gray-200/80 hover:border-rose-200 hover:shadow-md transition-all overflow-hidden p-4"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-100">
                              {item.category || "สื่อการสอน"}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeMaterialBookmark(item.id)}
                              className="text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                              title="ลบออกจากรายการที่บันทึก"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <h4 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-rose-600 transition-colors">
                            {item.title}
                          </h4>

                          {item.description && (
                            <p className="text-xs text-gray-500 line-clamp-2 font-light">
                              {item.description}
                            </p>
                          )}
                        </div>

                        <div className="pt-3 border-t border-gray-100 mt-3 flex items-center justify-between gap-2">
                          <Link
                            href={item.rawId ? `/materials/detail?id=${item.rawId}` : "/materials"}
                            className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
                          >
                            <span>เข้าสู่บทเรียน</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>

                          {item.fileUrl && (
                            <a
                              href={item.fileUrl}
                              download={item.fileName || "material.pdf"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                              title="ดาวน์โหลดเอกสาร"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Saved Ideas */}
            {activeCollectionTab === "ideas" && (
              <div>
                {savedIdeas.length === 0 ? (
                  <div className="py-12 text-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-6">
                    <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-400 flex items-center justify-center mx-auto mb-3">
                      <Lightbulb className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-gray-800 mb-1">ยังไม่มีไอเดียที่บันทึกไว้</p>
                    <p className="text-xs text-gray-500 mb-4 max-w-sm mx-auto font-light">
                      เมื่อพบไอเดียศิลปะหรือชิ้นงานสร้างสรรค์ที่ชอบ สามารถกดหัวใจเพื่อบันทึกไว้ในหน้านี้
                    </p>
                    <Link
                      href="/ideas"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-sm shadow-orange-600/20"
                    >
                      <span>สำรวจไอเดียศิลปะ</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedIdeas.map((idea) => (
                      <div
                        key={idea.id}
                        className="group flex flex-col justify-between bg-white rounded-2xl border border-gray-200/80 hover:border-orange-200 hover:shadow-md transition-all overflow-hidden p-4"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-100">
                              {idea.category || "ไอเดียศิลปะ"}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeIdeaBookmark(idea.id)}
                              className="text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                              title="ลบออกจากรายการที่บันทึก"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <h4 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors">
                            {idea.title}
                          </h4>

                          <p className="text-xs text-gray-500 line-clamp-2 font-light">
                            โดย: {idea.authorName}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-gray-100 mt-3 flex items-center justify-between gap-2">
                          <Link
                            href={`/ideas/detail?id=${idea.id}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors"
                          >
                            <span>ดูรายละเอียด</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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

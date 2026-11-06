"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { resolveUserAvatar } from "@/lib/art-avatars";
import {
  GraduationCap,
  Lightbulb,
  MessageSquare,
  FileCheck2,
  ClipboardCheck,
  Sparkles,
  Award,
  School,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Palette,
} from "lucide-react";

function TeacherMascotAvatar({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className}>
      <circle cx="60" cy="60" r="56" fill="#F4EFEA" />
      <path d="M22 118 C22 92 38 84 60 84 C82 84 98 92 98 118 Z" fill="#FFA8A4" />
      <polygon points="60,88 46,84 52,98" fill="#F87171" />
      <polygon points="60,88 74,84 68,98" fill="#F87171" />
      <circle cx="60" cy="106" r="2.5" fill="#FFFFFF" />
      <rect x="52" y="73" width="16" height="16" fill="#FFD8B8" rx="4" />
      <ellipse cx="60" cy="54" rx="30" ry="28" fill="#FFD8B8" />
      <circle cx="30" cy="56" r="7" fill="#FFD8B8" />
      <circle cx="90" cy="56" r="7" fill="#FFD8B8" />
      <ellipse cx="43" cy="60" rx="6.5" ry="3.8" fill="#FF8A8A" opacity="0.8" />
      <ellipse cx="77" cy="60" rx="6.5" ry="3.8" fill="#FF8A8A" opacity="0.8" />
      <path d="M52 63 C56 68 64 68 68 63" stroke="#1F2937" strokeWidth="2.4" strokeLinecap="round" />
      <rect x="37" y="46" width="19" height="16" rx="5.5" stroke="#1F2937" strokeWidth="2.5" fill="white" fillOpacity="0.2" />
      <rect x="64" y="46" width="19" height="16" rx="5.5" stroke="#1F2937" strokeWidth="2.5" fill="white" fillOpacity="0.2" />
      <path d="M56 53 L64 53" stroke="#1F2937" strokeWidth="2.5" />
      <circle cx="46.5" cy="53" r="2.3" fill="#1F2937" />
      <circle cx="73.5" cy="53" r="2.3" fill="#1F2937" />
      <path d="M41 41.5 C45 39.5 49 40.5 52 42.5" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
      <path d="M68 42.5 C71 40.5 75 39.5 79 41.5" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
      <path d="M29 49 C26 29 37 14 60 14 C83 14 94 29 91 49 C88 40 82 34 76 36 C71 27 62 24 54 27 C45 25 38 33 34 40 C32 43 31 46 29 49 Z" fill="#374151" />
      <path d="M35 36 C42 45 48 42 52 37 C56 44 62 44 66 38 C71 45 76 43 83 37 C81 48 76 50 71 46" fill="#374151" />
    </svg>
  );
}

interface StudentProfileData {
  id: string;
  name: string;
  classroom?: string;
  gradeLevel?: string;
  studentNumber?: number;
  avatar?: string;
  submissionsCount?: number;
  gradedCount?: number;
  totalSubScore?: number;
  quizzesCount?: number;
  totalQuizScore?: number;
  lastActiveAt?: string;
  recentSubmissions?: Array<{
    id: string;
    assignmentId: string;
    classroom: string;
    imageUrl?: string;
    concept?: string;
    score?: number;
    status?: string;
    submittedAt?: string;
  }>;
}

export default function TeacherProfileClient() {
  const searchParams = useSearchParams();
  const nameParam = searchParams.get("name") || "ครูสลิน";
  const studentIdParam = searchParams.get("studentId") || "";

  const [activeTab, setActiveTab] = useState<"profile" | "ideas" | "artworks">("profile");
  const [userIdeas, setUserIdeas] = useState<any[]>([]);
  const [studentProfile, setStudentProfile] = useState<StudentProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const studentQuery = studentIdParam
      ? `/api/students?id=${encodeURIComponent(studentIdParam)}`
      : `/api/students?name=${encodeURIComponent(nameParam)}`;

    Promise.all([
      fetch("/api/ideas").then((r) => r.json()).catch(() => []),
      fetch(studentQuery).then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ]).then(([ideasData, studentData]) => {
      if (!isMounted) return;

      if (Array.isArray(ideasData)) {
        const matched = ideasData.filter(
          (item) =>
            item.authorName?.trim().toLowerCase() === nameParam.trim().toLowerCase() ||
            (studentIdParam && item.authorStudentId === studentIdParam)
        );
        setUserIdeas(matched);

        // If studentData wasn't found directly by name, check if matched idea has authorStudentId
        if (!studentData && matched.length > 0 && matched[0].authorStudentId) {
          fetch(`/api/students?id=${encodeURIComponent(matched[0].authorStudentId)}`)
            .then((r) => (r.ok ? r.json() : null))
            .then((extraStudent) => {
              if (isMounted && extraStudent && extraStudent.id) {
                setStudentProfile(extraStudent);
              }
            })
            .catch(() => {});
        }
      }

      if (studentData && studentData.id) {
        setStudentProfile(studentData);
      } else {
        setStudentProfile(null);
      }

      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [nameParam, studentIdParam]);

  const isStudentPrefix = /^(เด็กชาย|เด็กหญิง|ด\.ช\.|ด\.ญ\.|นาย|นางสาว|น\.ส\.)/.test(nameParam.trim());
  const isStudent = Boolean(studentProfile || studentIdParam || isStudentPrefix);

  const effectiveAvatarRaw =
    studentProfile?.avatar ||
    userIdeas.find((i) => i.authorAvatar)?.authorAvatar ||
    "";
  const effectiveClassroom =
    studentProfile?.classroom ||
    userIdeas.find((i) => i.authorClassroom)?.authorClassroom ||
    "";
  const effectiveGradeLevel =
    studentProfile?.gradeLevel ||
    userIdeas.find((i) => i.authorGradeLevel)?.authorGradeLevel ||
    "";

  const resolvedAvatar = resolveUserAvatar(effectiveAvatarRaw, nameParam);
  const isTeacherSalin = !isStudent && (!nameParam || nameParam.includes("สลิน") || nameParam.includes("Admin"));

  const totalCommentsOnIdeas = userIdeas.reduce(
    (sum, item) => sum + (Number(item.commentsCount) || 0),
    0
  );
  const submissionsCount = studentProfile?.submissionsCount || 0;
  const quizzesCount = studentProfile?.quizzesCount || 0;
  const totalArtCoins =
    submissionsCount * 20 +
    (studentProfile?.gradedCount || 0) * 15 +
    Math.round((studentProfile?.totalSubScore || 0) * 2) +
    quizzesCount * 25 +
    userIdeas.length * 30;

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans text-gray-800 selection:bg-orange-100 selection:text-orange-900">
      <Navbar />

      {/* Top Profile Header */}
      <section className="bg-white border-b border-gray-200/80 pt-24 sm:pt-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <div className="mb-4">
            <Link
              href="/ideas"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 hover:text-orange-600 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>กลับไปหน้าห้องสมุดไอเดีย</span>
            </Link>
          </div>

          {/* Avatar & Author Info Row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6 pb-6">
            {/* Avatar Circle */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-orange-50 border-4 border-white ring-4 ring-orange-200/70 shadow-md">
              {isTeacherSalin && !effectiveAvatarRaw ? (
                <TeacherMascotAvatar className="w-full h-full" />
              ) : resolvedAvatar.type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolvedAvatar.value}
                  alt={nameParam}
                  className="w-full h-full object-cover"
                />
              ) : resolvedAvatar.type === "preset" ? (
                <div
                  className={`w-full h-full flex flex-col items-center justify-center ${
                    resolvedAvatar.preset?.colorBg || "bg-orange-50"
                  }`}
                >
                  <span className="text-5xl sm:text-6xl select-none">{resolvedAvatar.value}</span>
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-orange-500 to-amber-400 text-white font-bold text-4xl flex items-center justify-center">
                  {resolvedAvatar.value}
                </div>
              )}
            </div>

            {/* Name & Badges */}
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-xs font-bold px-3 py-0.5 rounded-full border inline-flex items-center gap-1.5 ${
                    isStudent
                      ? "bg-amber-50 text-amber-800 border-amber-200"
                      : "bg-emerald-50 text-emerald-800 border-emerald-200"
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>{isStudent ? "นักเรียนโรงเรียนวชิรธรรมสาธิต" : "คุณครูกลุ่มสาระการเรียนรู้ศิลปะ"}</span>
                </span>

                {effectiveClassroom && (
                  <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                    ชั้น {effectiveClassroom}
                  </span>
                )}

                {studentProfile?.studentNumber && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                    เลขที่ {studentProfile.studentNumber}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight truncate">
                {nameParam}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-600 font-medium">
                <span className="flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  ไอเดียที่แบ่งปัน <strong className="text-gray-900 font-bold">{userIdeas.length}</strong> รายการ
                </span>
                {isStudent && (
                  <span className="flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4 text-emerald-500" />
                    ผลงานที่ส่ง <strong className="text-gray-900 font-bold">{submissionsCount}</strong> ชิ้น
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-purple-500" />
                  ความคิดเห็นรวม <strong className="text-gray-900 font-bold">{totalCommentsOnIdeas}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-6 sm:gap-8 text-sm font-medium border-t border-gray-100 pt-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`pb-3 px-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "profile"
                  ? "text-orange-600 font-bold border-b-[3px] border-orange-500"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              ข้อมูลโปรไฟล์
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ideas")}
              className={`pb-3 px-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "ideas"
                  ? "text-orange-600 font-bold border-b-[3px] border-orange-500"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              ไอเดียที่แบ่งปัน ({userIdeas.length})
            </button>
            {isStudent && (studentProfile?.recentSubmissions?.length || 0) > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab("artworks")}
                className={`pb-3 px-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "artworks"
                    ? "text-orange-600 font-bold border-b-[3px] border-orange-500"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                ผลงานในชั้นเรียน ({studentProfile?.recentSubmissions?.length || 0})
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 py-8 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto">
          {isLoading ? (
            <div className="py-16 text-center text-gray-400">
              <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              กำลังโหลดข้อมูลโปรไฟล์...
            </div>
          ) : activeTab === "profile" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* LEFT COLUMN: ข้อมูลสังกัด & แต้มสะสม */}
              <div className="flex flex-col gap-4">
                <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs space-y-3">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                    <School className="w-4 h-4 text-orange-500" />
                    <span>ข้อมูลสังกัด</span>
                  </h3>
                  <div className="space-y-2 text-xs text-gray-700">
                    <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                      <span className="text-gray-500">สถานศึกษา:</span>
                      <span className="font-bold text-gray-900">โรงเรียนวชิรธรรมสาธิต</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                      <span className="text-gray-500">สถานะ:</span>
                      <span className="font-bold text-orange-700">
                        {isStudent ? "นักเรียนห้องเรียนศิลปะ" : "คุณครูผู้สอนวิชาทัศนศิลป์"}
                      </span>
                    </div>
                    {effectiveClassroom && (
                      <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                        <span className="text-gray-500">ห้องเรียน:</span>
                        <span className="font-bold text-gray-900">ชั้น {effectiveClassroom}</span>
                      </div>
                    )}
                    {effectiveGradeLevel && (
                      <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                        <span className="text-gray-500">ระดับชั้น:</span>
                        <span className="font-semibold text-gray-800">{effectiveGradeLevel}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-gray-500">อวาตาร์ประจำตัว:</span>
                      <span className="font-semibold text-gray-800 flex items-center gap-1">
                        <Palette className="w-3.5 h-3.5 text-orange-500" />
                        {resolvedAvatar.type === "preset"
                          ? resolvedAvatar.preset?.name || "ไอคอนศิลปะ"
                          : resolvedAvatar.type === "image"
                          ? "รูปโปรไฟล์ส่วนตัว"
                          : "อักษรย่อ"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Creative Points / Art Coins Card */}
                <div className="bg-gradient-to-br from-amber-50 via-orange-50/60 to-white rounded-2xl p-6 border border-orange-200/80 shadow-2xs text-center">
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[11px] font-bold mb-1">
                    <Sparkles className="w-3 h-3 text-orange-600" />
                    <span>คะแนนความสร้างสรรค์</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900">
                    Art Room Points
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    สะสมจากการส่งผลงานและแบ่งปันไอเดียศิลปะ
                  </p>
                  <div className="text-4xl sm:text-5xl font-black text-orange-600 mt-3 tracking-tight">
                    {totalArtCoins}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: สถิติการมีส่วนร่วมใน Art Room + ไอเดียล่าสุด */}
              <div className="md:col-span-2 flex flex-col gap-6">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4 text-orange-500" />
                    <span>สถิติการเรียนรู้และแบ่งปันใน Art Room</span>
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-3.5 sm:gap-4">
                    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-2xs flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <Lightbulb className="w-5 h-5 text-amber-500" />
                        <span className="text-xs text-gray-500 font-medium">ไอเดียที่แบ่งปัน</span>
                      </div>
                      <span className="text-xl font-black text-gray-900">{userIdeas.length}</span>
                    </div>

                    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-2xs flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <MessageSquare className="w-5 h-5 text-purple-500" />
                        <span className="text-xs text-gray-500 font-medium">ความคิดเห็นในไอเดีย</span>
                      </div>
                      <span className="text-xl font-black text-gray-900">{totalCommentsOnIdeas}</span>
                    </div>

                    {isStudent && (
                      <>
                        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-2xs flex items-center justify-between">
                          <div className="flex flex-col gap-1">
                            <FileCheck2 className="w-5 h-5 text-emerald-500" />
                            <span className="text-xs text-gray-500 font-medium">ชิ้นงานศิลปะที่ส่ง</span>
                          </div>
                          <span className="text-xl font-black text-gray-900">{submissionsCount}</span>
                        </div>

                        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-2xs flex items-center justify-between">
                          <div className="flex flex-col gap-1">
                            <ClipboardCheck className="w-5 h-5 text-sky-500" />
                            <span className="text-xs text-gray-500 font-medium">แบบทดสอบที่ทำ</span>
                          </div>
                          <span className="text-xl font-black text-gray-900">{quizzesCount}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Recent Ideas Preview in Profile Tab */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      <span>ไอเดียสร้างสรรค์ของ {nameParam}</span>
                    </h3>
                    {userIdeas.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setActiveTab("ideas")}
                        className="text-xs font-bold text-orange-600 hover:underline cursor-pointer"
                      >
                        ดูทั้งหมด ({userIdeas.length}) →
                      </button>
                    )}
                  </div>

                  {userIdeas.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center border border-gray-200/80">
                      <Lightbulb className="w-10 h-10 text-amber-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 font-medium">ยังไม่มีไอเดียที่เผยแพร่</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {userIdeas.slice(0, 4).map((idea) => (
                        <Link
                          key={idea.id}
                          href={`/ideas/detail?id=${idea.id}`}
                          className="group bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col"
                        >
                          <div className="aspect-video w-full bg-gray-100 relative overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={idea.coverImageUrl || "https://placehold.co/600x400/FFF7ED/EA580C?text=Art+Room"}
                              alt={idea.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {idea.category && (
                              <span className="absolute top-2.5 left-2.5 bg-white/95 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-orange-600 shadow-2xs">
                                {idea.category}
                              </span>
                            )}
                          </div>
                          <div className="p-4 flex-1 flex flex-col justify-between">
                            <h4 className="font-bold text-sm text-gray-900 group-hover:text-orange-600 line-clamp-2 transition-colors">
                              {idea.title}
                            </h4>
                            <div className="flex items-center justify-between text-xs text-gray-400 mt-3 pt-2 border-t border-gray-100">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(idea.createdAt || Date.now()).toLocaleDateString("th-TH", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                              <span className="text-orange-600 font-bold inline-flex items-center gap-1">
                                ดูไอเดีย <ArrowRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : activeTab === "ideas" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">
                  ไอเดียที่แบ่งปันโดย {nameParam} ({userIdeas.length})
                </h2>
                <Link
                  href="/ideas/new"
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-sm transition-all"
                >
                  + แบ่งปันไอเดียใหม่
                </Link>
              </div>

              {userIdeas.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-200/80">
                  <Lightbulb className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">ยังไม่มีไอเดียที่เผยแพร่</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userIdeas.map((idea) => (
                    <Link
                      key={idea.id}
                      href={`/ideas/detail?id=${idea.id}`}
                      className="group bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col"
                    >
                      <div className="aspect-video w-full bg-gray-100 relative overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={idea.coverImageUrl || "https://placehold.co/600x400/FFF7ED/EA580C?text=Art+Room"}
                          alt={idea.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <h3 className="font-bold text-gray-900 group-hover:text-orange-600 line-clamp-2 transition-colors">
                          {idea.title}
                        </h3>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(idea.createdAt || Date.now()).toLocaleDateString("th-TH", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Artworks Tab Content */
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                ผลงานศิลปะในชั้นเรียนของ {nameParam}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {(studentProfile?.recentSubmissions || []).map((sub) => (
                  <div
                    key={sub.id}
                    className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-2xs flex flex-col"
                  >
                    {sub.imageUrl && (
                      <div className="aspect-4/3 w-full bg-gray-100 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={sub.imageUrl}
                          alt={sub.concept || "ผลงานนักเรียน"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                      <p className="text-xs text-gray-700 line-clamp-2 font-medium">
                        {sub.concept || "ผลงานส่งในรายวิชาทัศนศิลป์"}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-100">
                        <span>ชั้น {sub.classroom}</span>
                        {sub.status === "graded" && sub.score !== null && sub.score !== undefined ? (
                          <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            ตรวจแล้ว ({sub.score} คะแนน)
                          </span>
                        ) : (
                          <span className="font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                            ส่งงานแล้ว
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

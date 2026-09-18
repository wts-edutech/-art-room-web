"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import GuestBlockModal from "@/components/modals/GuestBlockModal";
import SubmitWorkModal from "@/components/submissions/SubmitWorkModal";
import { performGlobalLogout, syncAuthWithServer } from "@/lib/client-auth";
import { 
  User, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  Edit3, 
  Award, 
  ExternalLink, 
  FileText, 
  BookOpen, 
  MessageSquareQuote,
  Sparkles,
  ChevronRight,
  LogOut,
  Layers,
  GraduationCap,
  Eye,
  X,
  Download,
  Maximize2,
  ZoomIn,
  ShieldAlert,
  HelpCircle,
  Lock,
  PlayCircle,
  LogIn,
  ArrowLeft,
  KeyRound,
  UserCheck,
  Palette,
  ClipboardList,
  Printer
} from "lucide-react";
import ExamLockModal from "@/components/submissions/ExamLockModal";
import StudentArtworkAlbum from "@/components/submissions/StudentArtworkAlbum";

export default function SubmissionsPage() {
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const role = localStorage.getItem("artroom_role");
    return role === "guest";
  });

  const [student, setStudent] = useState<{ id: string; name: string; classroom: string } | null>(() => {
    if (typeof window === "undefined") return null;
    const role = localStorage.getItem("artroom_role");
    if (role === "guest") return null; // Guests are strictly prohibited from accessing submissions

    const name = localStorage.getItem("artroom_author_name");
    const id = localStorage.getItem("artroom_student_id");
    const room = localStorage.getItem("artroom_classroom") || localStorage.getItem("artroom_student_grade") || "";
    if (name && id && role === "student") {
      return { id, name, classroom: room };
    }
    return null;
  });
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);

  // Classrooms for quick room selection if student's room is missing
  const [allClassrooms, setAllClassrooms] = useState<any[]>([]);
  const [isChangingRoom, setIsChangingRoom] = useState(false);
  const [newRoomSelect, setNewRoomSelect] = useState("");

  // Data states
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "missing" | "pending" | "graded" | "resubmit">("all");
  const [toDoFilter, setToDoFilter] = useState<"missing" | "all">("missing");
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Modal State
  const [modalAssignment, setModalAssignment] = useState<any | null>(null);
  const [previewSubmission, setPreviewSubmission] = useState<{ submission: any; assignment: any } | null>(null);
  const [isFullscreenView, setIsFullscreenView] = useState<boolean>(false);
  const [standaloneLightboxUrl, setStandaloneLightboxUrl] = useState<string | null>(null);
  const [portalView, setPortalView] = useState<"assignments" | "album">("assignments");

  // Quizzes / Pre-tests state
  const [activeQuizzes, setActiveQuizzes] = useState<any[]>([]);
  const [activeQuizToTake, setActiveQuizToTake] = useState<any | null>(null);

  // Auto-detect and resolve logged-in student seamlessly with real-time DB sync
  useEffect(() => {
    const resolveLoggedInStudent = async () => {
      try {
        setIsLoadingAuth(true);

        // 1. Direct synchronization with server authentication token
        const serverAuth = await syncAuthWithServer();

        if (serverAuth.user?.role === "guest") {
          setIsGuest(true);
          setStudent(null);
          setIsLoadingAuth(false);
          return;
        }

        let resolvedId = "";
        let resolvedName = "";
        let resolvedRoom = "";

        if (serverAuth.authenticated && serverAuth.user?.role === "student") {
          resolvedId = serverAuth.user.id || serverAuth.user.userId;
          resolvedName = serverAuth.user.name;
          resolvedRoom = serverAuth.user.classroom || "";
        } else {
          // 2. Client-side local verification fallback
          const localRole = localStorage.getItem("artroom_role");
          if (localRole === "guest") {
            setIsGuest(true);
            setStudent(null);
            setIsLoadingAuth(false);
            return;
          }

          const localId = localStorage.getItem("artroom_student_id");
          const localName = localStorage.getItem("artroom_author_name");
          const localRoom = localStorage.getItem("artroom_classroom") || localStorage.getItem("artroom_student_grade") || "";

          if (localRole === "student" && localId && localName) {
            resolvedId = localId;
            resolvedName = localName;
            resolvedRoom = localRoom;
          }
        }

        if (resolvedId) {
          // 3. Always fetch latest classroom directly from the students database table to bypass any stale localStorage
          try {
            const resFresh = await fetch(`/api/students?id=${encodeURIComponent(resolvedId)}`);
            if (resFresh.ok) {
              const freshData = await resFresh.json();
              if (freshData && freshData.classroom) {
                resolvedRoom = freshData.classroom;
                localStorage.setItem("artroom_classroom", freshData.classroom);
                localStorage.setItem("artroom_student_grade", freshData.classroom);
              }
              if (freshData && freshData.name) {
                resolvedName = freshData.name;
                localStorage.setItem("artroom_author_name", freshData.name);
              }
            }
          } catch (err) {
            console.warn("Could not fetch fresh student room from DB:", err);
          }

          setIsGuest(false);
          setStudent({
            id: resolvedId,
            name: resolvedName,
            classroom: resolvedRoom,
          });
        } else {
          setIsGuest(false);
          setStudent(null);
        }
      } catch (e) {
        console.error("Error resolving logged-in student:", e);
        setStudent(null);
      } finally {
        setIsLoadingAuth(false);
      }

      // Fetch classrooms for quick selector
      try {
        const resRooms = await fetch("/api/classrooms");
        if (resRooms.ok) {
          const dataRooms = await resRooms.json();
          setAllClassrooms(Array.isArray(dataRooms) ? dataRooms : []);
        }
      } catch (e) {
        console.error("Error fetching classrooms:", e);
      }
    };

    resolveLoggedInStudent();

    // Listen for profile changes from ProfileSettingsModal or other tabs
    window.addEventListener("artroom_profile_updated", resolveLoggedInStudent);
    return () => {
      window.removeEventListener("artroom_profile_updated", resolveLoggedInStudent);
    };
  }, []);

  // Fetch student's classroom assignments & submissions
  const loadStudentData = async (studentId: string, classroom: string) => {
    setIsLoadingData(true);
    try {
      let studentGrade = "";
      const gradeMatch = classroom ? classroom.match(/ม\.?\s*([1-6])/) : null;
      if (gradeMatch) {
        studentGrade = `ม.${gradeMatch[1]}`;
      } else if (classroom.includes("3") || classroom.includes("ม.3")) {
        studentGrade = "ม.3";
      } else if (classroom.includes("4") || classroom.includes("ม.4")) {
        studentGrade = "ม.4";
      }

      let assUrl = `/api/assignments?activeOnly=true`;
      if (classroom) {
        assUrl += `&classroom=${encodeURIComponent(classroom)}`;
      }
      if (studentId) {
        assUrl += `&studentId=${encodeURIComponent(studentId)}`;
      }

      let quizUrl = `/api/quizzes?activeOnly=true&studentId=${encodeURIComponent(studentId)}`;
      if (classroom) {
        quizUrl += `&classroom=${encodeURIComponent(classroom)}`;
      }
      if (studentGrade) {
        quizUrl += `&gradeLevel=${encodeURIComponent(studentGrade)}`;
      }

      const [resAss, resSub, resQuiz] = await Promise.all([
        fetch(assUrl),
        fetch(`/api/submissions?studentId=${encodeURIComponent(studentId)}`),
        fetch(quizUrl),
      ]);

      const [dataAss, dataSub, dataQuiz] = await Promise.all([
        resAss.ok ? resAss.json().catch(() => []) : [],
        resSub.ok ? resSub.json().catch(() => []) : [],
        resQuiz.ok ? resQuiz.json().catch(() => []) : [],
      ]);

      let assList = Array.isArray(dataAss) ? dataAss : [];

      // If no assignments found for specific classroom filter, fetch all active assignments
      // so student can always see and submit any assignment!
      if (assList.length === 0 && classroom) {
        try {
          const fallbackRes = await fetch(`/api/assignments?activeOnly=true`);
          if (fallbackRes.ok) {
            const fallbackData = await fallbackRes.json();
            if (Array.isArray(fallbackData) && fallbackData.length > 0) {
              assList = fallbackData;
            }
          }
        } catch {}
      }

      const subList = Array.isArray(dataSub) ? dataSub : [];
      const tempSubMap = new Map(subList.map((s: any) => [s.assignmentId, s]));
      const missingCount = assList.filter((a: any) => !tempSubMap.has(a.id) || tempSubMap.get(a.id)?.status === "resubmit").length;

      setAssignments(assList);
      setSubmissions(subList);
      setActiveQuizzes(Array.isArray(dataQuiz) ? dataQuiz : []);

      // Smart landing: if student has missing work -> To-Do tab, if all done -> Album tab
      if (missingCount > 0) {
        setPortalView("assignments");
      } else if (subList.length > 0) {
        setPortalView("album");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (student) {
      loadStudentData(student.id, student.classroom);
    }
  }, [student]);

  const handleUpdateClassroom = async () => {
    if (!newRoomSelect || !student) return;
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: student.id,
          name: student.name,
          classroom: newRoomSelect,
        }),
      });

      if (res.ok) {
        localStorage.setItem("artroom_classroom", newRoomSelect);
        localStorage.setItem("artroom_student_grade", newRoomSelect);
        setStudent((prev) => (prev ? { ...prev, classroom: newRoomSelect } : null));
        setIsChangingRoom(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    await performGlobalLogout("/submissions");
  };

  const subMap = new Map(submissions.map((s) => [s.assignmentId, s]));

  const isSubmissionGraded = (s: any) =>
    Boolean(s && (s.status === "graded" || (s.score !== null && s.score !== undefined && s.status !== "resubmit")));

  // Stats
  const totalCount = assignments.length;
  const gradedCount = assignments.filter((a) => isSubmissionGraded(subMap.get(a.id))).length;
  const pendingCount = assignments.filter(
    (a) => subMap.has(a.id) && !isSubmissionGraded(subMap.get(a.id)) && subMap.get(a.id)?.status !== "resubmit"
  ).length;
  const resubmitCount = assignments.filter((a) => subMap.get(a.id)?.status === "resubmit").length;
  const missingCount = assignments.filter((a) => !subMap.has(a.id)).length;
  const submittedWorksCount = assignments.filter((a) => {
    const sub = subMap.get(a.id);
    return Boolean(sub && (sub.imageUrl || sub.fileUrl));
  }).length;

  const actionNeededCount = assignments.filter((a) => !subMap.has(a.id) || subMap.get(a.id)?.status === "resubmit").length;

  // Filtered Assignments for To-Do Tab
  const toDoAssignments = assignments.filter((a) => {
    if (toDoFilter === "missing") {
      return !subMap.has(a.id) || subMap.get(a.id)?.status === "resubmit";
    }
    return true;
  });

  return (
    <>
      <Navbar />

      <main className="flex-1 min-h-screen bg-gray-50/50 pt-28 pb-20 relative">
        {/* Background art graphic */}
        <div
          className="absolute inset-0 z-0 opacity-25 pointer-events-none bg-fixed bg-center bg-cover mix-blend-multiply"
          style={{ backgroundImage: "url('/bg-art.jpg')" }}
        />

        <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-5xl">
          {/* Header Title */}
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-orange-50 text-orange-600 font-bold text-xs mb-3 border border-orange-200 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" /> ระบบส่งงานศิลปะออนไลน์
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-gray-900 tracking-tight">
              ส่งงานและตรวจคะแนน
            </h1>
            <p className="text-gray-500 mt-2 text-sm sm:text-base font-light">
              ติดตามภาระงาน ส่งภาพผลงานศิลปะ และรับฟังคำแนะนำจากคุณครูผู้สอน
            </p>
          </div>

          {/* AUTH STATE: LOGGED IN VS GUEST */}
          {isLoadingAuth ? (
            <div className="bg-white rounded-3xl p-12 text-center text-gray-400 border border-gray-100 shadow-sm">
              <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm">กำลังโหลดข้อมูลนักเรียน...</p>
            </div>
          ) : !student ? (
            /* Guest / Not Logged In Formal Access Guard */
            <div className="max-w-2xl w-full bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-900/5 overflow-hidden text-left mx-auto">
              {/* Institutional Color Stripe */}
              <div className="h-1.5 w-full bg-gradient-to-r from-red-700 via-red-800 to-amber-700" />

              {/* School Header */}
              <div className="p-6 sm:p-7 bg-slate-50/75 border-b border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src="/school-logo.png" 
                      alt="ตราโรงเรียนวชิรธรรมสาธิต" 
                      width={40}
                      height={40}
                      className="w-10 h-10 object-contain shrink-0" 
                    />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block mb-0.5">โรงเรียนวชิรธรรมสาธิต</span>
                    <p className="text-xs text-slate-500">ระบบส่งงานและตรวจคะแนนผลงานศิลปะออนไลน์</p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200/70 shrink-0">
                  <Lock className="w-3.5 h-3.5 text-red-600" />
                  <span>พื้นที่เฉพาะนักเรียน (Student Only)</span>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading mb-2 tracking-tight">
                    {isGuest
                      ? "แจ้งสถานะการเข้าใช้งานระบบ (สถานะผู้เยี่ยมชม)"
                      : "กรุณาเข้าสู่ระบบด้วยบัญชีนักเรียนเพื่อส่งงาน"}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light">
                    {isGuest
                      ? "สถานะผู้เยี่ยมชมสามารถร่วมแสดงความคิดเห็นในโซนแชร์ไอเดียได้ แต่สำหรับหน้าส่งงานและทำแบบทดสอบวิชาศิลปะนี้ สงวนสิทธิ์เฉพาะนักเรียนโรงเรียนวชิรธรรมสาธิตเท่านั้น"
                      : "ระบบจะตรวจสอบระดับชั้นและห้องเรียนจริงของคุณ เพื่อดึงรายการชิ้นงานศิลปะและแบบทดสอบที่คุณต้องส่งมาแสดงผลให้อัตโนมัติ"}
                  </p>
                </div>

                {/* Institutional Status & Policy Box */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200/70 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-2.5 gap-1">
                    <span className="text-slate-500 font-medium">ออกแบบและพัฒนาเว็บไซต์โดย:</span>
                    <span className="font-semibold text-slate-800">นางสาวสีวลี ยืนยาว</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-2.5 gap-1 bg-white">
                    <span className="text-slate-500 font-medium">สถานะบัญชีปัจจุบัน:</span>
                    <span className="font-semibold flex items-center gap-1.5">
                      {isGuest ? (
                        <span className="text-amber-700 flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5" />
                          ผู้เยี่ยมชม (Guest)
                        </span>
                      ) : (
                        <span className="text-slate-600 flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                          บุคคลทั่วไป (ยังไม่ได้เข้าสู่ระบบ)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-2.5 gap-1">
                    <span className="text-slate-500 font-medium">เงื่อนไขการเข้าใช้งาน:</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                      บัญชีนักเรียน (รหัสประจำตัวนักเรียน 5 หลัก)
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                  <Link
                    href="/login?tab=student&redirect=/submissions"
                    className="w-full sm:flex-1 h-11 px-5 rounded-xl bg-red-700 hover:bg-red-800 active:bg-red-900 text-white font-medium text-sm shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{isGuest ? "สลับไปเข้าสู่ระบบนักเรียน" : "เข้าสู่ระบบด้วยบัญชีนักเรียน"}</span>
                  </Link>

                  <Link
                    href="/"
                    className="w-full sm:w-auto h-11 px-5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4 text-slate-500" />
                    <span>กลับสู่หน้าหลัก</span>
                  </Link>
                </div>

                {/* Official Footnote / Compliance */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-400">
                  <span>* รหัสผ่านเริ่มต้นคือ รหัสนักเรียน 5 หลักตามด้วย @wts (เช่น 37743@wts)</span>
                  <span>ระบบสารสนเทศทางการศึกษาตามมาตรฐาน พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)</span>
                </div>
              </div>
            </div>
          ) : (
            /* LOGGED IN STUDENT PORTAL */
            <div className="space-y-5">
              {/* 1. Compact Student Profile Bar */}
              <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-orange-500/20 shrink-0">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base sm:text-lg font-bold text-gray-900 font-kanit">
                        {student.name}
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold font-mono bg-gray-100 text-gray-700">
                        {student.id}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-0.5">
                      {student.classroom ? (
                        <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-200">
                          ห้อง {student.classroom}
                        </span>
                      ) : (
                        <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                          ⚠️ ยังไม่ได้ระบุห้องเรียน
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => setIsChangingRoom(!isChangingRoom)}
                        className="text-gray-400 hover:text-orange-600 underline cursor-pointer text-[11px]"
                      >
                        {student.classroom ? "เปลี่ยนห้องเรียน" : "เลือกระบุห้องเรียนของคุณ"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Status Shortcuts & Logout */}
                <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  <div className="flex items-center gap-2">
                    {/* Badge 1: Missing Work Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setPortalView("assignments");
                        setToDoFilter("missing");
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        actionNeededCount > 0
                          ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 shadow-2xs"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                      title="คลิกเพื่อดูงานที่ยังไม่ได้ส่ง"
                    >
                      {actionNeededCount > 0 ? (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                      <span>ค้างส่ง {actionNeededCount} ชิ้น</span>
                    </button>

                    {/* Badge 2: Submitted Work Button */}
                    <button
                      type="button"
                      onClick={() => setPortalView("album")}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 shadow-2xs transition-all cursor-pointer"
                      title="คลิกเพื่อดูคลังผลงานศิลปะของคุณ"
                    >
                      <Palette className="w-3.5 h-3.5 text-emerald-600" />
                      <span>ส่งแล้ว {submittedWorksCount} ชิ้น</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="ออกจากระบบ"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Classroom Switcher Form */}
              {isChangingRoom && (
                <div className="bg-orange-50/80 border border-orange-200 rounded-3xl p-4 sm:p-5 animate-in fade-in duration-150">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <label className="text-xs font-bold text-orange-900 block mb-1">
                        เลือกห้องเรียนของคุณ (ระบบจะจำไว้สำหรับการส่งงานครั้งต่อๆ ไป)
                      </label>
                      <select
                        value={newRoomSelect}
                        onChange={(e) => setNewRoomSelect(e.target.value)}
                        className="h-10 px-3 rounded-xl bg-white border border-orange-200 text-sm font-semibold text-gray-800 outline-none w-full sm:w-64"
                      >
                        <option value="">-- เลือกห้องเรียน --</option>
                        {allClassrooms.map((c) => (
                          <option key={c.id} value={c.name}>
                            ห้อง {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleUpdateClassroom}
                        disabled={!newRoomSelect}
                        className="h-10 px-5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-sm active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                        style={{ backgroundColor: "#f97316", color: "#ffffff" }}
                      >
                        บันทึกห้องเรียน
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsChangingRoom(false)}
                        className="px-3 py-2 text-xs text-gray-500 hover:text-gray-800 cursor-pointer"
                      >
                        ยกเลิก
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Primary 2-Tab Switcher: งานที่ต้องส่ง vs คลังผลงานของฉัน */}
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2 bg-slate-100 p-1 sm:p-1.5 rounded-2xl border border-slate-200/80 shadow-inner">
                <button
                  type="button"
                  onClick={() => setPortalView("assignments")}
                  className={`py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl text-xs sm:text-sm md:text-base font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
                    portalView === "assignments"
                      ? "bg-white text-orange-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 shrink-0" />
                  <span className="truncate">
                    <span>🚨 งานที่ต้องส่ง</span>
                    <span className="hidden sm:inline font-normal text-xs text-slate-400 ml-1">(To-Do)</span>
                  </span>
                  {actionNeededCount > 0 ? (
                    <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-mono font-bold bg-rose-500 text-white shadow-2xs shrink-0">
                      {actionNeededCount}
                    </span>
                  ) : (
                    <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-mono font-bold bg-emerald-100 text-emerald-700 shrink-0">
                      ครบ
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setPortalView("album")}
                  className={`py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl text-xs sm:text-sm md:text-base font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
                    portalView === "album"
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20"
                      : "text-slate-600 hover:text-orange-600"
                  }`}
                >
                  <Palette className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  <span className="truncate">
                    <span>🎨 คลังผลงาน</span>
                    <span className="hidden sm:inline font-normal text-xs opacity-80 ml-1">(Portfolio)</span>
                  </span>
                  {submittedWorksCount > 0 && (
                    <span
                      className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-mono font-bold shrink-0 ${
                        portalView === "album" ? "bg-white text-orange-600" : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {submittedWorksCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Conditional Content based on portalView */}
              {portalView === "album" ? (
                <StudentArtworkAlbum
                  student={student}
                  assignments={assignments}
                  subMap={subMap}
                  onViewFullscreen={(url) => setStandaloneLightboxUrl(url)}
                  onOpenSubmitModal={(ass) => setModalAssignment(ass)}
                  onSwitchToAssignments={() => setPortalView("assignments")}
                />
              ) : (
                <>
                  {/* ACTIVE PRE-TESTS SECTION (WHEN RELEASED BY TEACHER) */}
              {activeQuizzes.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                        <BookOpen className="w-4 h-4" />
                      </span>
                      <h2 className="text-base font-bold text-gray-900 font-kanit">
                        แบบทดสอบออนไลน์ประจำวิชา (Online Exam)
                      </h2>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                      ระบบ Anti-Cheat ล็อคหน้าจอ
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {activeQuizzes.map((quiz) => {
                      const hasAttempted = Boolean(quiz.userAttempt);
                      const attempt = quiz.userAttempt;

                      return (
                        <div
                          key={quiz.id}
                          className={`relative overflow-hidden rounded-3xl p-5 sm:p-6 transition-all border ${
                            hasAttempted
                              ? "bg-gradient-to-br from-emerald-50/80 via-white to-white border-emerald-200 shadow-sm"
                              : "bg-gradient-to-br from-indigo-50/90 via-white to-orange-50/40 border-indigo-200 shadow-md hover:shadow-lg"
                          }`}
                        >
                          {/* Top Tag & Grade */}
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 rounded-xl bg-indigo-600 text-white text-xs font-bold font-kanit shadow-sm">
                                {quiz.code}
                              </span>
                              <span className="px-2.5 py-1 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold">
                                ระดับชั้น {quiz.gradeLevel}
                              </span>
                              <span className="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 text-xs font-medium border border-purple-100">
                                {quiz.title?.includes("ก่อนเรียน")
                                  ? "แบบทดสอบก่อนเรียน"
                                  : quiz.title?.includes("หลังเรียน")
                                  ? "แบบทดสอบหลังเรียน"
                                  : quiz.title?.includes("เก็บคะแนน")
                                  ? "แบบทดสอบเก็บคะแนน"
                                  : "แบบทดสอบออนไลน์"}
                              </span>
                            </div>

                            {hasAttempted ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                ทำแบบทดสอบแล้ว
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                เปิดให้ทำแบบทดสอบแล้ว
                              </span>
                            )}
                          </div>

                          {/* Quiz Title & Details */}
                          <div className="mb-4">
                            <h3 className="text-lg font-bold text-gray-900 font-kanit">
                              {quiz.title}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                              {quiz.description}
                            </p>
                          </div>

                          {/* Info Badges */}
                          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 py-2.5 px-3.5 rounded-2xl bg-white/80 border border-gray-100 mb-4">
                            <div className="flex items-center gap-1.5">
                              <FileText className="w-4 h-4 text-indigo-500" />
                              <span>จำนวน <strong>{quiz.totalQuestions}</strong> ข้อ (ปรนัย 4 ตัวเลือก)</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-amber-500" />
                              <span>เวลาทำ <strong>{quiz.timeLimitMinutes}</strong> นาที</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Award className="w-4 h-4 text-emerald-500" />
                              <span>คะแนนเต็ม <strong>{quiz.maxScore}</strong> คะแนน</span>
                            </div>
                          </div>

                          {/* Actions / Score Results */}
                          {hasAttempted ? (
                            <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                              <div>
                                <p className="text-xs font-medium text-emerald-800">ผลการทำแบบทดสอบของคุณ</p>
                                <div className="flex items-baseline gap-2 mt-1">
                                  <span className="text-2xl font-bold font-kanit text-emerald-700">
                                    {attempt.score}
                                  </span>
                                  <span className="text-sm font-semibold text-gray-500">
                                    / {attempt.totalQuestions} คะแนน
                                  </span>
                                  <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-900 font-bold ml-1">
                                    {Math.round((attempt.score / attempt.totalQuestions) * 100)}%
                                  </span>
                                </div>
                                {attempt.infractionsCount > 0 && (
                                  <p className="text-[11px] text-amber-700 font-medium mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    ตรวจพบการสลับหน้าจอ {attempt.infractionsCount} ครั้ง
                                  </p>
                                )}
                              </div>

                              <div className="text-left sm:text-right">
                                <span className="text-[11px] text-gray-400 block">
                                  ส่งคำตอบเมื่อ {new Date(attempt.submittedAt).toLocaleDateString("th-TH", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                                <span className="inline-block mt-1 text-[11px] font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                                  บันทึกคะแนนเข้าสู่ระบบแล้ว (ทำได้ 1 ครั้ง)
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                              <div className="flex items-start gap-2 text-xs text-amber-800">
                                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                <span>
                                  เมื่อกดปุ่มเริ่มทำแบบทดสอบ ระบบจะเข้าสู่โหมดเต็มจอและล็อคการสลับหน้าจอทันที (จับเวลา {quiz.timeLimitMinutes} นาที)
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => setActiveQuizToTake(quiz)}
                                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-red-600/20 active:scale-95 transition-all duration-150 cursor-pointer shrink-0"
                                style={{ backgroundColor: "#dc2626", color: "#ffffff" }}
                              >
                                <PlayCircle className="w-4 h-4 text-white shrink-0" />
                                <span className="text-white font-bold text-xs sm:text-sm">
                                  เริ่มทำแบบทดสอบ
                                </span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* To-Do Assignments Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                  <h3 className="text-base sm:text-lg font-bold font-kanit text-gray-900">
                    {toDoFilter === "missing" ? "ภาระงานที่ต้องส่ง / การบ้านค้างส่ง" : "รายการภาระงานศิลปะทั้งหมด"}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                    {toDoAssignments.length} รายการ
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs bg-gray-100 p-1 rounded-xl self-start sm:self-center">
                  <button
                    type="button"
                    onClick={() => setToDoFilter("missing")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      toDoFilter === "missing"
                        ? "bg-white text-rose-600 shadow-xs"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    เฉพาะงานค้างส่ง ({actionNeededCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setToDoFilter("all")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      toDoFilter === "all"
                        ? "bg-white text-orange-600 shadow-xs"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    ดูงานทั้งหมด ({totalCount})
                  </button>
                </div>
              </div>

              {/* Assignment Cards List */}
              <div className="space-y-4">
                {isLoadingData ? (
                  <div className="bg-white rounded-3xl p-12 text-center text-gray-400">
                    <p className="text-sm">กำลังโหลดรายการภาระงาน...</p>
                  </div>
                ) : toDoFilter === "missing" && actionNeededCount === 0 ? (
                  <div className="bg-gradient-to-br from-emerald-500/10 via-white to-teal-500/10 rounded-3xl p-8 sm:p-12 text-center border border-emerald-200 shadow-xs space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                      <CheckCircle2 className="w-9 h-9" />
                    </div>
                    <div className="max-w-md mx-auto space-y-1">
                      <h4 className="text-xl font-bold font-kanit text-gray-900">
                        🎉 ยอดเยี่ยมมาก! คุณไม่มีงานศิลปะที่ค้างส่งแล้ว
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-500 font-light">
                        ภาระงานทั้งหมดถูกส่งเรียบร้อยแล้ว คุณสามารถเข้าไปดูรูปผลงาน คะแนน และคำชมจากคุณครูในคลังผลงานได้เลย
                      </p>
                    </div>
                    <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setPortalView("album")}
                        className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-md shadow-orange-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                      >
                        <Palette className="w-4 h-4" />
                        <span>เปิดดูคลังผลงาน &amp; คะแนนสะสม</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setToDoFilter("all")}
                        className="px-4 py-2.5 rounded-2xl bg-white border border-gray-200 text-gray-600 hover:text-gray-900 font-semibold text-xs transition-colors cursor-pointer"
                      >
                        ดูรายการภาระงานทั้งหมด ({totalCount} ชิ้น)
                      </button>
                    </div>
                  </div>
                ) : toDoAssignments.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center text-gray-400 border border-gray-100">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-20 text-emerald-500" />
                    <p className="text-base font-bold text-gray-700">ไม่มีรายการงานในหมวดนี้</p>
                  </div>
                ) : (
                  toDoAssignments.map((assignment) => {
                    const sub = subMap.get(assignment.id);
                    const isDueExpired = assignment.dueDate ? new Date() > new Date(assignment.dueDate) : false;
                    const isNeedsResubmit = sub?.status === "resubmit";
                    const isSubmitted = Boolean(sub);
                    const isGraded = Boolean(sub && (sub.status === "graded" || (sub.score !== null && sub.score !== undefined)) && sub.status !== "resubmit");

                    return (
                      <div
                        key={assignment.id}
                        className={`rounded-2xl p-5 sm:p-6 border transition-all ${
                          isNeedsResubmit
                            ? "bg-rose-50/40 border-rose-200 shadow-sm"
                            : !isSubmitted
                            ? "bg-white border-orange-200/80 shadow-sm hover:shadow-md hover:border-orange-300"
                            : isGraded
                            ? "bg-white/90 border-emerald-100/80 shadow-xs"
                            : "bg-white/80 border-gray-100 shadow-xs"
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          {/* Left: Assignment Details */}
                          <div className="space-y-2 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              {assignment.subject && (
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">
                                  {assignment.subject.code ? `${assignment.subject.code} ${assignment.subject.name}` : (assignment.subject.name || assignment.subjectId)}
                                </span>
                              )}

                              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                                คะแนนเต็ม {assignment.maxScore} คะแนน
                              </span>

                              {assignment.dueDate && (
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                                    isDueExpired
                                      ? "bg-red-50 text-red-600 border border-red-200"
                                      : "bg-blue-50 text-blue-600 border border-blue-200"
                                  }`}
                                >
                                  <Clock className="w-3 h-3" />
                                  <span>กำหนดส่ง: {new Date(assignment.dueDate).toLocaleString("th-TH")}</span>
                                </span>
                              )}
                            </div>

                            <h3 className="text-base sm:text-lg font-bold font-kanit text-gray-900">
                              {assignment.title}
                            </h3>

                            {assignment.description && (
                              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light">
                                {assignment.description}
                              </p>
                            )}

                            {/* Teacher Resubmit Instruction if any */}
                            {isNeedsResubmit && (
                              <div className="p-3 rounded-xl bg-rose-100/70 border border-rose-200 text-xs text-rose-900 space-y-1">
                                <div className="flex items-center gap-1.5 font-bold text-rose-800">
                                  <AlertCircle className="w-4 h-4 text-rose-600" />
                                  <span>ครูแจ้งให้ส่งแก้ไขชิ้นงานนี้:</span>
                                </div>
                                <p className="font-light italic pl-5">&quot;{sub?.feedback || "กรุณาปรับปรุงชิ้นงานแล้วส่งภาพใหม่"}&quot;</p>
                              </div>
                            )}
                          </div>

                          {/* Right: Appropriately Sized Action Button */}
                          <div className="shrink-0 w-full sm:w-auto flex items-center justify-end">
                            {isNeedsResubmit ? (
                              <button
                                type="button"
                                onClick={() => setModalAssignment(assignment)}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow active:scale-95 transition-all cursor-pointer"
                                style={{ backgroundColor: "#dc2626", color: "#ffffff" }}
                              >
                                <Upload className="w-4 h-4" />
                                <span>ถ่ายรูปส่งแก้ไข</span>
                              </button>
                            ) : !isSubmitted ? (
                              <button
                                type="button"
                                onClick={() => setModalAssignment(assignment)}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow active:scale-95 transition-all cursor-pointer"
                                style={{ backgroundColor: "#dc2626", color: "#ffffff" }}
                              >
                                <Upload className="w-4 h-4" />
                                <span>ถ่ายรูปส่งงาน</span>
                              </button>
                            ) : isGraded ? (
                              <div className="flex items-center gap-2 justify-end">
                                <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>ตรวจแล้ว ({sub.score !== null && sub.score !== undefined ? `${sub.score}/${assignment.maxScore}` : "ให้คะแนนแล้ว"})</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPreviewSubmission({ assignment, submission: sub });
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 transition-colors cursor-pointer"
                                  title="ดูภาพผลงาน"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>ดูภาพผลงาน</span>
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 justify-end">
                                <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200">
                                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                                  <span>รอครูตรวจ</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setModalAssignment(assignment)}
                                  className="px-3 py-2 rounded-xl text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 border border-orange-200 cursor-pointer active:scale-95 transition-all"
                                >
                                  แก้ไข / ส่งใหม่
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>
    )}
  </div>
</main>

      {/* SUBMISSION MODAL */}
      {modalAssignment && student && (
        <SubmitWorkModal
          assignment={modalAssignment}
          student={student}
          existingSubmission={subMap.get(modalAssignment.id)}
          onClose={() => setModalAssignment(null)}
          onSuccess={() => {
            setModalAssignment(null);
            loadStudentData(student.id, student.classroom);
          }}
        />
      )}

      {/* ARTWORK PREVIEW MODAL / LIGHTBOX */}
      {previewSubmission && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setPreviewSubmission(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl sm:max-w-4xl w-full max-h-[94vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200 uppercase">
                  ผลงานศิลปะของฉัน
                </span>
                <h3 className="font-bold text-gray-900 text-lg sm:text-xl font-kanit mt-1">
                  {previewSubmission.assignment.title}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  ส่งเมื่อ: {new Date(previewSubmission.submission.submittedAt).toLocaleString("th-TH")}
                  {previewSubmission.submission.isLate && " • ส่งหลังกำหนด"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFullscreenView(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all cursor-pointer"
                  title="ดูแบบขยายเต็มจอ"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-gray-600" />
                  <span className="hidden sm:inline">ขยายเต็มจอ</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewSubmission(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 hover:text-gray-700 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  title="ปิดหน้าต่าง"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Artwork Image Container - Displays full dimensions without any cropping */}
            <div className="p-3 sm:p-6 bg-gray-900/5 flex flex-col items-center justify-center relative">
              <div className="relative group max-w-full flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewSubmission.submission.imageUrl}
                  alt={previewSubmission.assignment.title}
                  className="max-h-[72vh] w-auto max-w-full object-contain rounded-2xl shadow-md border border-gray-200 bg-white cursor-zoom-in transition-transform group-hover:scale-[1.01]"
                  onClick={() => setIsFullscreenView(true)}
                  title="คลิกเพื่อดูภาพขยายเต็มจอ"
                />
                <button
                  type="button"
                  onClick={() => setIsFullscreenView(true)}
                  className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/75 hover:bg-black/90 text-white text-xs font-bold backdrop-blur-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>ดูเต็มจอ</span>
                </button>
              </div>
              <p className="text-[11px] text-gray-500 mt-2.5 flex items-center gap-1 font-medium">
                <ZoomIn className="w-3 h-3 text-orange-600" />
                <span>แสดงภาพเต็มขนาดจริง 100% ตามต้นฉบับ • คลิกที่รูปภาพเพื่อเปิดโหมดเต็มจอ</span>
              </p>
            </div>

            {/* Details & Concept */}
            <div className="p-4 sm:p-6 space-y-4">
              {/* Score snippet if graded */}
              {isSubmissionGraded(previewSubmission.submission) && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
                  <div className="flex items-center gap-2 font-bold">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>คะแนนที่ได้รับ</span>
                  </div>
                  <span className="text-base font-extrabold font-kanit text-emerald-600">
                    {previewSubmission.submission.score} / {previewSubmission.assignment.maxScore}
                  </span>
                </div>
              )}

              {/* Concept & Technique if available */}
              {previewSubmission.submission.concept && (
                <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200/70 text-xs">
                  <span className="font-bold text-gray-800 block mb-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-orange-600" />
                    <span>แนวคิดและเทคนิคที่ใช้ (Concept & Technique)</span>
                  </span>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap font-light">
                    {previewSubmission.submission.concept}
                  </p>
                </div>
              )}

              {/* External link if available */}
              {previewSubmission.submission.externalLink && (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs">
                  <span className="font-semibold text-blue-900">ลิงก์ผลงานภายนอก (Canva/Drive):</span>
                  <a
                    href={previewSubmission.submission.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-bold inline-flex items-center gap-1 truncate max-w-[50%]"
                  >
                    <span>เปิดดูลิงก์</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <a
                  href={previewSubmission.submission.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={`artwork_${previewSubmission.assignment.title}.jpg`}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลดภาพต้นฉบับ</span>
                </a>

                <Button
                  type="button"
                  onClick={() => setPreviewSubmission(null)}
                  className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold cursor-pointer"
                >
                  ปิดหน้าต่าง
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX OVERLAY */}
      {isFullscreenView && previewSubmission && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200 cursor-zoom-out"
          onClick={() => setIsFullscreenView(false)}
        >
          <div 
            className="absolute top-4 inset-x-4 sm:inset-x-8 flex items-center justify-between z-10 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-white">
              <p className="font-bold text-xs sm:text-sm font-kanit">{previewSubmission.assignment.title}</p>
              <p className="text-[11px] text-gray-300">ผลงานต้นฉบับของนักเรียน</p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={previewSubmission.submission.imageUrl}
                download={`artwork_${previewSubmission.assignment.title}.jpg`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/20 backdrop-blur-md transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">ดาวน์โหลดภาพ</span>
              </a>
              <button
                type="button"
                onClick={() => setIsFullscreenView(false)}
                className="p-2 sm:px-4 sm:py-2 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs border border-white/20 backdrop-blur-md transition-all cursor-pointer flex items-center gap-1"
              >
                <X className="w-5 h-5" />
                <span className="hidden sm:inline">ปิด</span>
              </button>
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewSubmission.submission.imageUrl}
            alt={previewSubmission.assignment.title}
            className="max-w-[96vw] max-h-[88vh] object-contain rounded-xl shadow-2xl transition-all select-none"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* EXAM LOCK ANTI-CHEAT MODAL */}
      {activeQuizToTake && student && (
        <ExamLockModal
          quiz={activeQuizToTake}
          student={student}
          onClose={() => setActiveQuizToTake(null)}
          onSuccess={(_score) => {
            setActiveQuizToTake(null);
            loadStudentData(student.id, student.classroom);
          }}
        />
      )}

      {/* STANDALONE FULLSCREEN LIGHTBOX OVERLAY */}
      {standaloneLightboxUrl && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200 cursor-zoom-out"
          onClick={() => setStandaloneLightboxUrl(null)}
        >
          <div 
            className="absolute top-4 inset-x-4 sm:inset-x-8 flex items-center justify-between z-10 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-white">
              <p className="font-bold text-xs sm:text-sm font-kanit">ภาพถ่ายผลงานศิลปะต้นฉบับ</p>
              <p className="text-[11px] text-gray-300">ความละเอียดสูง</p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={standaloneLightboxUrl}
                download="student_artwork.jpg"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/20 backdrop-blur-md transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">ดาวน์โหลดภาพ</span>
              </a>
              <button
                type="button"
                onClick={() => setStandaloneLightboxUrl(null)}
                className="p-2 sm:px-4 sm:py-2 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs border border-white/20 backdrop-blur-md transition-all cursor-pointer flex items-center gap-1"
              >
                <X className="w-5 h-5" />
                <span className="hidden sm:inline">ปิด</span>
              </button>
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={standaloneLightboxUrl}
            alt="Full size artwork"
            className="max-w-[96vw] max-h-[88vh] object-contain rounded-xl shadow-2xl transition-all select-none"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <Footer />
    </>
  );
}

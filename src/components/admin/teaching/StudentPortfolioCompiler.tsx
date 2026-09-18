"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Users, 
  Search, 
  Palette, 
  Sparkles, 
  Printer, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Award, 
  Calendar, 
  BookOpen, 
  MessageSquare, 
  ExternalLink,
  Edit3,
  X,
  Maximize2,
  ChevronRight,
  Star,
  Save,
  RotateCw,
  FolderDown,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface StudentPortfolioCompilerProps {
  initialClassroom?: string;
}

export default function StudentPortfolioCompiler({ initialClassroom }: StudentPortfolioCompilerProps) {
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<string>(initialClassroom || "");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  // Student's submissions
  const [studentSubmissions, setStudentSubmissions] = useState<any[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Inline grading form state per submission id
  const [gradingState, setGradingState] = useState<Record<string, { score: string; feedback: string; status: string; isSaving: boolean; isSaved: boolean }>>({});
  const [featuredArtworks, setFeaturedArtworks] = useState<Record<string, boolean>>({});
  const [isPublishingArt, setIsPublishingArt] = useState<Record<string, boolean>>({});

  // Fetch initial metadata
  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [resRooms, resStudents, resAss] = await Promise.all([
          fetch("/api/classrooms"),
          fetch("/api/students"),
          fetch("/api/assignments"),
        ]);
        const [dataRooms, dataStudents, dataAss] = await Promise.all([
          resRooms.json(),
          resStudents.json(),
          resAss.json(),
        ]);

        const rList = Array.isArray(dataRooms) ? dataRooms : [];
        const sList = Array.isArray(dataStudents) ? dataStudents : [];
        const aList = Array.isArray(dataAss) ? dataAss : [];

        setClassrooms(rList);
        setStudents(sList);
        setAssignments(aList);

        if (!selectedClassroom && rList.length > 0) {
          setSelectedClassroom(rList[0].name || "ม.3/1");
        }
      } catch (err) {
        console.error("Failed to load portfolio metadata:", err);
      }
    };
    loadMeta();
  }, []);

  // Filter students based on classroom and search query
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchRoom = selectedClassroom ? (s.classroom || "").includes(selectedClassroom) : true;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        (s.name || "").toLowerCase().includes(q) || 
        String(s.id || "").toLowerCase().includes(q) ||
        String(s.studentNumber || "").includes(q);
      return matchRoom && matchSearch;
    });
  }, [students, selectedClassroom, searchQuery]);

  // Set default selected student if none selected or not in filtered list
  useEffect(() => {
    if (filteredStudents.length > 0 && (!selectedStudent || !filteredStudents.find(s => s.id === selectedStudent.id))) {
      handleSelectStudent(filteredStudents[0]);
    }
  }, [filteredStudents]);

  // Fetch student's submissions whenever selectedStudent changes
  const handleSelectStudent = async (studentObj: any) => {
    setSelectedStudent(studentObj);
    if (!studentObj) return;

    setIsLoadingSubmissions(true);
    try {
      const res = await fetch(`/api/submissions?studentId=${encodeURIComponent(studentObj.id)}`);
      if (res.ok) {
        const data = await res.json();
        const subs = Array.isArray(data) ? data : [];
        setStudentSubmissions(subs);

        // Initialize grading state
        const initialGrading: Record<string, any> = {};
        subs.forEach((sub: any) => {
          initialGrading[sub.id] = {
            score: sub.score !== null && sub.score !== undefined ? String(sub.score) : "",
            feedback: sub.feedback || "",
            status: sub.status || "graded",
            isSaving: false,
            isSaved: false,
          };
        });
        setGradingState(initialGrading);
      }
    } catch (err) {
      console.error("Failed to fetch student submissions:", err);
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  // Inline grading save
  const handleSaveInlineGrade = async (submissionId: string) => {
    const cur = gradingState[submissionId];
    if (!cur) return;

    setGradingState((prev) => ({
      ...prev,
      [submissionId]: { ...prev[submissionId], isSaving: true },
    }));

    try {
      const res = await fetch("/api/submissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: submissionId,
          score: cur.score !== "" ? parseFloat(cur.score) : null,
          feedback: cur.feedback,
          status: cur.status,
        }),
      });

      if (res.ok) {
        setGradingState((prev) => ({
          ...prev,
          [submissionId]: { ...prev[submissionId], isSaving: false, isSaved: true },
        }));
        setTimeout(() => {
          setGradingState((prev) => ({
            ...prev,
            [submissionId]: { ...prev[submissionId], isSaved: false },
          }));
        }, 3000);
      } else {
        alert("ไม่สามารถบันทึกคะแนนได้ กรุณาลองใหม่อีกครั้ง");
        setGradingState((prev) => ({
          ...prev,
          [submissionId]: { ...prev[submissionId], isSaving: false },
        }));
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
      setGradingState((prev) => ({
        ...prev,
        [submissionId]: { ...prev[submissionId], isSaving: false },
      }));
    }
  };

  // Feature artwork in public school gallery (/artworks)
  const handleFeatureInGallery = async (sub: any) => {
    if (!sub.imageUrl) return;
    setIsPublishingArt((prev) => ({ ...prev, [sub.id]: true }));

    try {
      const title = sub.assignment?.title || "ผลงานศิลปะนักเรียน";
      const author = selectedStudent.name;
      const grade = selectedStudent.classroom || "มัธยมศึกษา";

      const res = await fetch("/api/artworks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          author,
          imageUrl: sub.imageUrl,
          year: grade,
          technique: sub.concept || "ทัศนศิลป์",
          dimensions: "A3 / A4",
        }),
      });

      if (res.ok) {
        setFeaturedArtworks((prev) => ({ ...prev, [sub.id]: true }));
        alert(`นำผลงาน "${title}" ของ ${author} ไปแสดงในแกลเลอรีผลงานโรงเรียนเรียบร้อยแล้ว!`);
      } else {
        alert("ไม่สามารถเผยแพร่ผลงานได้");
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsPublishingArt((prev) => ({ ...prev, [sub.id]: false }));
    }
  };

  // Stats calculation for the selected student
  const studentStats = useMemo(() => {
    const totalArtworks = studentSubmissions.filter(s => s.imageUrl || s.fileUrl).length;
    const graded = studentSubmissions.filter(s => s.status === "graded");
    const totalScore = graded.reduce((acc, curr) => acc + (curr.score || 0), 0);
    const maxScore = graded.reduce((acc, curr) => acc + (curr.assignment?.maxScore || 10), 0);
    const pct = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    return { totalArtworks, gradedCount: graded.length, totalScore, maxScore, pct };
  }, [studentSubmissions]);

  return (
    <div className="space-y-6">
      {/* 1. Classroom & Search Selection Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              เลือกห้องเรียน:
            </label>
            <select
              value={selectedClassroom}
              onChange={(e) => setSelectedClassroom(e.target.value)}
              className="h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-bold text-slate-800 outline-none cursor-pointer"
            >
              <option value="">-- ทุกห้องเรียน --</option>
              {classrooms.map((c) => (
                <option key={c.id} value={c.name}>
                  ห้อง {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-bold text-slate-700 block mb-1">
              ค้นหานักเรียน (ชื่อ / เลขประจำตัว / เลขที่):
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="เช่น อดิเทพ หรือ 38231..."
                className="h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs text-slate-800 outline-none w-full"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center text-xs text-slate-500 font-medium">
          <span>พบ {filteredStudents.length} คนในห้องนี้</span>
          {selectedStudent && (
            <button
              type="button"
              onClick={() => setIsPrintModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์แฟ้มผลงานคนนี้</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Horizontal Student Quick Selector Strip */}
      {filteredStudents.length > 0 && (
        <div className="bg-white rounded-2xl p-2.5 border border-slate-200/80 shadow-2xs overflow-x-auto flex items-center gap-2 scrollbar-thin">
          {filteredStudents.map((st) => {
            const isSelected = selectedStudent?.id === st.id;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => handleSelectStudent(st)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-orange-500 text-white shadow-xs"
                    : "bg-slate-50 hover:bg-orange-50 text-slate-700 border border-slate-100"
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isSelected ? "bg-white/20 text-white" : "bg-orange-100 text-orange-600"
                }`}>
                  {st.studentNumber || st.name.charAt(0)}
                </span>
                <span className="font-kanit">{st.name}</span>
                <span className={`text-[10px] font-mono opacity-80 ${isSelected ? "text-white" : "text-slate-400"}`}>
                  ({st.id})
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* 3. Selected Student Individual Portfolio Compilation */}
      {!selectedStudent ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
          กรุณาเลือกนักเรียนเพื่อดูแฟ้มสะสมผลงานรายบุคคล
        </div>
      ) : (
        <div className="space-y-6">
          {/* Student Dossier Header Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 text-white flex items-center justify-center font-black text-2xl font-kanit shadow-md shadow-orange-500/20 shrink-0">
                {selectedStudent.studentNumber ?? selectedStudent.name.charAt(0)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold text-orange-800 bg-orange-50 px-2.5 py-0.5 rounded-lg border border-orange-200">
                    รหัส {selectedStudent.id}
                  </span>
                  <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                    ห้อง {selectedStudent.classroom || selectedClassroom}
                  </span>
                  {selectedStudent.studentNumber && (
                    <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                      เลขที่ {selectedStudent.studentNumber}
                    </span>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-kanit mt-1">
                  {selectedStudent.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  แฟ้มสะสมผลงานศิลปะรายบุคคล • รวบรวมงานส่งทุกชิ้นเพื่อการประเมินและคัดเลือกจัดแสดง
                </p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-3">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center min-w-[90px]">
                <span className="text-[11px] text-slate-500 block">ผลงานภาพ</span>
                <span className="text-lg font-black text-slate-900 font-kanit">
                  {studentStats.totalArtworks} ชิ้น
                </span>
              </div>
              <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200 text-center min-w-[90px]">
                <span className="text-[11px] text-emerald-800 block">ตรวจแล้ว</span>
                <span className="text-lg font-black text-emerald-800 font-kanit">
                  {studentStats.gradedCount} ชิ้น
                </span>
              </div>
              <div className="bg-orange-50/70 p-3 rounded-2xl border border-orange-200 text-center min-w-[100px]">
                <span className="text-[11px] text-orange-800 block">คะแนนสะสม</span>
                <span className="text-lg font-black text-orange-900 font-kanit">
                  {studentStats.totalScore} / {studentStats.maxScore || 10}
                </span>
              </div>
            </div>
          </div>

          {/* Submissions Gallery & Inline Grading */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-orange-500" />
                <h4 className="font-bold text-slate-900 text-base font-kanit">
                  รายการผลงานศิลปะที่ส่งทั้งหมด ({studentSubmissions.length} ชิ้นงาน)
                </h4>
              </div>
              <span className="text-xs text-slate-400">
                คุณครูสามารถให้คะแนน ใส่คำติชม หรือกดปักหมุดแสดงผลงานได้ทันที
              </span>
            </div>

            {isLoadingSubmissions ? (
              <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
                <RotateCw className="w-6 h-6 animate-spin mx-auto mb-2 text-orange-500" />
                กำลังโหลดผลงานของนักเรียน...
              </div>
            ) : studentSubmissions.length === 0 ? (
              <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200 space-y-2">
                <Palette className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="font-bold text-slate-600">นักเรียนคนนี้ยังไม่ได้ส่งชิ้นงานในระบบ</p>
                <p className="text-xs text-slate-400">เมื่อนักเรียนอัปโหลดภาพผลงาน ระบบจะแสดงรวมไว้ที่หน้านี้โดยอัตโนมัติ</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {studentSubmissions.map((sub) => {
                  const artworkImg = sub.imageUrl || sub.fileUrl;
                  const curGrade = gradingState[sub.id] || { score: "", feedback: "", status: "graded", isSaving: false, isSaved: false };
                  const isFeatured = featuredArtworks[sub.id];

                  return (
                    <div
                      key={sub.id}
                      className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      {/* Artwork Preview Box */}
                      <div
                        onClick={() => artworkImg && setLightboxImage(artworkImg)}
                        className="relative min-h-[220px] max-h-80 w-full bg-slate-900/5 flex items-center justify-center overflow-hidden cursor-zoom-in group"
                        title="คลิกเพื่อดูภาพผลงานขนาดเต็ม"
                      >
                        {artworkImg ? (
                          <>
                            {/* Ambient Blur */}
                            <div
                              className="absolute inset-0 scale-125 blur-2xl opacity-25 pointer-events-none"
                              style={{
                                backgroundImage: `url(${artworkImg})`,
                                backgroundPosition: "center",
                                backgroundSize: "cover",
                              }}
                            />
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={artworkImg}
                              alt={sub.assignment?.title || "ผลงาน"}
                              className="relative max-h-80 w-auto max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-semibold text-xs gap-1.5 backdrop-blur-[1px]">
                              <Maximize2 className="w-4 h-4" />
                              <span>ดูภาพขยายเต็มจอ</span>
                            </div>
                          </>
                        ) : (
                          <div className="p-8 text-center text-slate-400 text-xs">
                            ไม่มีภาพถ่ายผลงาน (ส่งเป็นลิงก์ภายนอก)
                          </div>
                        )}

                        {/* Top corner tags */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                          <span className="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-white/95 backdrop-blur-md text-slate-800 shadow-xs border border-slate-200">
                            {sub.assignment?.subject?.name || "วิชาศิลปะ"}
                          </span>
                          {sub.isLate && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                              ส่งหลังกำหนด
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content & Inline Grading Body */}
                      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h5 className="font-extrabold text-slate-900 text-base font-kanit leading-snug">
                              {sub.assignment?.title || sub.assignmentId}
                            </h5>
                          </div>

                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <Calendar className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              ส่งเมื่อ: {new Date(sub.submittedAt).toLocaleString("th-TH")}
                            </span>
                          </div>

                          {/* Student Concept */}
                          {sub.concept && (
                            <div className="p-3 rounded-2xl bg-orange-50/50 border border-orange-100 text-xs text-slate-700">
                              <span className="font-bold text-orange-600 block text-[10.5px] mb-0.5">
                                💡 แนวคิดและเทคนิคจากนักเรียน:
                              </span>
                              <p className="italic leading-relaxed">&quot;{sub.concept}&quot;</p>
                            </div>
                          )}

                          {/* External link */}
                          {sub.externalLink && (
                            <div>
                              <a
                                href={sub.externalLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>เปิดดูลิงก์ผลงานภายนอก (Drive / Canva)</span>
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Inline Grading Form */}
                        <div className="pt-3 border-t border-slate-100 space-y-3 bg-slate-50/60 p-3.5 rounded-2xl border">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <Award className="w-4 h-4 text-orange-500" />
                              <span>ประเมินคะแนน & ข้อเสนอแนะครู</span>
                            </label>

                            {/* Feature in Public Gallery Button */}
                            {artworkImg && (
                              <button
                                type="button"
                                disabled={isPublishingArt[sub.id] || isFeatured}
                                onClick={() => handleFeatureInGallery(sub)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                                  isFeatured
                                    ? "bg-amber-100 text-amber-800 border border-amber-300"
                                    : "bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-700 border border-slate-200"
                                }`}
                                title="นำภาพผลงานนี้ไปแสดงในหน้าแกลเลอรีผลงานศิลปะสาธารณะของโรงเรียน"
                              >
                                <Star className={`w-3 h-3 ${isFeatured ? "fill-amber-500 text-amber-500" : "text-amber-400"}`} />
                                <span>{isFeatured ? "แสดงในแกลเลอรีแล้ว" : "แสดงในแกลเลอรี"}</span>
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2.5">
                            <div>
                              <span className="text-[11px] text-slate-500 block mb-1">
                                คะแนน (เต็ม {sub.assignment?.maxScore || 10})
                              </span>
                              <input
                                type="number"
                                step="0.5"
                                min="0"
                                max={sub.assignment?.maxScore || 10}
                                value={curGrade.score}
                                onChange={(e) =>
                                  setGradingState((prev) => ({
                                    ...prev,
                                    [sub.id]: { ...prev[sub.id], score: e.target.value },
                                  }))
                                }
                                placeholder="เช่น 9.5"
                                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-orange-600 outline-none focus:border-orange-500"
                              />
                            </div>

                            <div>
                              <span className="text-[11px] text-slate-500 block mb-1">สถานะ</span>
                              <select
                                value={curGrade.status}
                                onChange={(e) =>
                                  setGradingState((prev) => ({
                                    ...prev,
                                    [sub.id]: { ...prev[sub.id], status: e.target.value },
                                  }))
                                }
                                className="w-full h-9 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none"
                              >
                                <option value="graded">✅ ตรวจแล้ว</option>
                                <option value="resubmit">🔄 ให้ส่งแก้ไข</option>
                                <option value="pending">⏳ ยังรอตรวจ</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <span className="text-[11px] text-slate-500 block mb-1">
                              คำติชม & ข้อเสนอแนะจากคุณครู
                            </span>
                            <textarea
                              rows={2}
                              value={curGrade.feedback}
                              onChange={(e) =>
                                setGradingState((prev) => ({
                                  ...prev,
                                  [sub.id]: { ...prev[sub.id], feedback: e.target.value },
                                }))
                              }
                              placeholder="เช่น ลายเส้นและน้ำหนักสีประณีตสวยงาม..."
                              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 outline-none focus:border-orange-500 leading-relaxed resize-none"
                            />
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10.5px] text-slate-400">
                              {curGrade.isSaved ? "✅ บันทึกแล้ว" : ""}
                            </span>
                            <button
                              type="button"
                              disabled={curGrade.isSaving}
                              onClick={() => handleSaveInlineGrade(sub.id)}
                              className="px-4 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                            >
                              <Save className="w-3.5 h-3.5" />
                              <span>{curGrade.isSaving ? "กำลังบันทึก..." : "บันทึกคะแนน"}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Fullscreen Lightbox for Artwork */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer animate-in fade-in duration-150"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-6 right-6 text-white/80 hover:text-white p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxImage}
            alt="Fullscreen artwork"
            className="max-h-[92vh] max-w-[95vw] object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-150"
          />
        </div>
      )}

      {/* 5. Printable Dossier Modal for Teacher */}
      {isPrintModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto print:p-0 print:bg-white print:static">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-100 p-6 sm:p-8 space-y-6 print:max-w-none print:shadow-none print:border-none print:p-0">
            {/* Modal Controls (Hidden in Print) */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-orange-600" />
                <h3 className="font-bold text-gray-900 text-lg font-kanit">
                  แบบพิมพ์รวมเล่มแฟ้มสะสมผลงานรายบุคคล: {selectedStudent.name}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>สั่งพิมพ์เอกสาร / บันทึกเป็น PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Layout */}
            <div className="space-y-6 text-gray-800">
              {/* Header */}
              <div className="flex items-center justify-between border-b-2 border-orange-500 pb-4">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/school-logo.png" alt="School Logo" className="w-14 h-14 object-contain" />
                  <div>
                    <h2 className="font-extrabold text-base sm:text-lg font-kanit text-gray-900 leading-tight">
                      กลุ่มสาระการเรียนรู้ศิลปะ โรงเรียนวชิรธรรมสาธิต
                    </h2>
                    <p className="text-xs text-gray-500">
                      แบบประเมินและรวบรวมแฟ้มสะสมผลงานศิลปะรายบุคคล (Individual Student Art Portfolio)
                    </p>
                  </div>
                </div>
                <div className="text-right text-xs text-gray-500 font-mono">
                  <span>วันที่ออกเอกสาร: {new Date().toLocaleDateString("th-TH")}</span>
                </div>
              </div>

              {/* Student Metadata */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-gray-500 block">ชื่อ-นามสกุล นักเรียน:</span>
                  <span className="font-bold text-gray-900 text-sm font-kanit">{selectedStudent.name}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">รหัสประจำตัว:</span>
                  <span className="font-mono font-bold text-gray-900 text-sm">{selectedStudent.id}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">ระดับชั้น/ห้องเรียน:</span>
                  <span className="font-bold text-orange-600 text-sm">
                    ห้อง {selectedStudent.classroom || selectedClassroom}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">คะแนนสะสมรวม:</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    {studentStats.totalScore} / {studentStats.maxScore || 10} ({studentStats.pct}%)
                  </span>
                </div>
              </div>

              {/* Works Grid */}
              <div className="space-y-6">
                <h4 className="font-bold text-gray-900 text-sm border-b border-gray-200 pb-1.5 flex items-center justify-between">
                  <span>รายการผลงานที่รวบรวม ({studentSubmissions.length} ชิ้นงาน)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {studentSubmissions.map((sub: any, idx: number) => (
                    <div
                      key={sub.id}
                      className="border border-gray-200 rounded-2xl p-3.5 space-y-2.5 bg-white break-inside-avoid"
                    >
                      <div className="aspect-[4/3] max-h-48 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={sub.imageUrl || sub.fileUrl}
                          alt={sub.assignment?.title || "ชิ้นงาน"}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-orange-600 uppercase">
                          ชิ้นงานที่ {idx + 1}: {sub.assignment?.subject?.name || "วิชาศิลปะ"}
                        </span>
                        <h5 className="font-bold text-gray-900 text-xs mt-0.5 leading-tight">
                          {sub.assignment?.title || sub.assignmentId}
                        </h5>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          ส่งเมื่อ: {new Date(sub.submittedAt).toLocaleDateString("th-TH")}
                        </p>
                      </div>

                      {sub.concept && (
                        <p className="text-[11px] text-gray-700 italic bg-gray-50 p-2 rounded-lg border border-gray-100">
                          &quot;{sub.concept}&quot;
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-1 text-xs border-t border-gray-100">
                        <span className="text-gray-500 font-medium">ผลการประเมิน:</span>
                        <span className="font-bold text-gray-900">
                          {sub.status === "graded"
                            ? `${sub.score} / ${sub.assignment?.maxScore || 10} คะแนน`
                            : "รอประเมิน"}
                        </span>
                      </div>

                      {sub.feedback && (
                        <div className="text-[10.5px] text-emerald-800 bg-emerald-50/70 p-2 rounded-lg border border-emerald-100">
                          <strong>คำติชมจากครู:</strong> {sub.feedback}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Signature Line */}
              <div className="pt-8 border-t border-gray-200 grid grid-cols-2 gap-8 text-center text-xs">
                <div>
                  <div className="h-12 border-b border-gray-300 w-48 mx-auto" />
                  <span className="block mt-2 font-medium text-gray-700">ลงชื่อนักเรียนเจ้าของผลงาน</span>
                  <span className="text-gray-400 text-[11px]">({selectedStudent.name})</span>
                </div>

                <div>
                  <div className="h-12 border-b border-gray-300 w-48 mx-auto" />
                  <span className="block mt-2 font-medium text-gray-700">ลงชื่อครูผู้สอน / ผู้ตรวจประเมิน</span>
                  <span className="text-gray-400 text-[11px]">(กลุ่มสาระการเรียนรู้ศิลปะ)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

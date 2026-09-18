"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ExternalLink, 
  FileText, 
  Image as ImageIcon, 
  Download, 
  Search, 
  FileSpreadsheet, 
  X, 
  Save, 
  Sparkles, 
  ChevronRight, 
  Filter, 
  Users, 
  RotateCw,
  Copy,
  Check,
  Share2,
  ListOrdered,
  Palette
} from "lucide-react";
import StudentPortfolioCompiler from "./StudentPortfolioCompiler";

export default function GradingTab({ preselectedAssignmentId }: { preselectedAssignmentId?: string }) {
  const [gradingMode, setGradingMode] = useState<"assignment" | "individual">("assignment");
  const [assignments, setAssignments] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter Selection
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>(preselectedAssignmentId || "");
  const [selectedClassroom, setSelectedClassroom] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "missing" | "pending" | "graded">("all");
  const [isCopied, setIsCopied] = useState(false);
  const [showDetailedMissing, setShowDetailedMissing] = useState(false);

  // Inspection & Grading Modal State
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [gradingScore, setGradingScore] = useState<string>("");
  const [gradingFeedback, setGradingFeedback] = useState<string>("");
  const [gradingStatus, setGradingStatus] = useState<string>("graded");
  const [isSaving, setIsSaving] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [resAss, resRooms, resStudents] = await Promise.all([
        fetch("/api/assignments"),
        fetch("/api/classrooms"),
        fetch("/api/students"),
      ]);

      const [dataAss, dataRooms, dataStudents] = await Promise.all([
        resAss.json(),
        resRooms.json(),
        resStudents.json(),
      ]);

      const assList = Array.isArray(dataAss) ? dataAss : [];
      setAssignments(assList);
      setClassrooms(Array.isArray(dataRooms) ? dataRooms : []);
      setStudents(Array.isArray(dataStudents) ? dataStudents : []);

      if (assList.length > 0 && !selectedAssignmentId) {
        setSelectedAssignmentId(assList[0].id);
        const rooms = assList[0].classroomsList;
        if (Array.isArray(rooms) && rooms.length > 0) {
          setSelectedClassroom(rooms[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    if (!selectedAssignmentId) return;
    try {
      let url = `/api/submissions?assignmentId=${selectedAssignmentId}`;
      if (selectedClassroom) url += `&classroom=${encodeURIComponent(selectedClassroom)}`;
      const res = await fetch(url);
      const data = await res.json();
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [selectedAssignmentId, selectedClassroom]);

  const currentAssignment = assignments.find((a) => a.id === selectedAssignmentId);

  // Available classrooms for current assignment
  const availableClassrooms = (() => {
    if (!currentAssignment || !currentAssignment.classroomsList || currentAssignment.classroomsList.length === 0) {
      return classrooms.map((c) => c.name);
    }
    return currentAssignment.classroomsList;
  })();

  // Filter students in selected classroom and sort by studentNumber (เลขที่ 1, 2, 3...)
  const currentClassStudents = students
    .filter((s) => {
      if (currentAssignment?.targetStudentsList && Array.isArray(currentAssignment.targetStudentsList) && currentAssignment.targetStudentsList.length > 0) {
        if (!currentAssignment.targetStudentsList.includes(s.id)) return false;
      }
      if (!selectedClassroom) return true;
      return s.classroom === selectedClassroom;
    })
    .sort((a, b) => {
      const numA = a.studentNumber !== null && a.studentNumber !== undefined ? Number(a.studentNumber) : 9999;
      const numB = b.studentNumber !== null && b.studentNumber !== undefined ? Number(b.studentNumber) : 9999;
      if (numA !== numB) return numA - numB;
      return (a.id || "").localeCompare(b.id || "", "th", { numeric: true });
    });

  const subMap = new Map(submissions.map((s) => [s.studentId, s]));

  // Missing and submitted student lists
  const missingStudents = currentClassStudents.filter((st) => !subMap.has(st.id));
  const submittedStudents = currentClassStudents.filter((st) => subMap.has(st.id));

  // Format roll numbers cleanly into ranges (e.g. "เลขที่ 1 - 35 (ทุกคน)" or "เลขที่ 1-3, 5, 8")
  const formatRollRanges = (missing: any[], total: number) => {
    if (missing.length === 0) return "";
    if (total > 0 && missing.length === total) {
      return `เลขที่ 1 - ${total} (ทุกคน)`;
    }
    const nums = missing
      .map((st, i) => (st.studentNumber !== null && st.studentNumber !== undefined ? Number(st.studentNumber) : i + 1))
      .filter((n) => !isNaN(n))
      .sort((a, b) => a - b);

    if (nums.length === 0) return "";

    const ranges: string[] = [];
    let start = nums[0];
    let prev = nums[0];

    for (let i = 1; i < nums.length; i++) {
      if (nums[i] === prev + 1) {
        prev = nums[i];
      } else {
        ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
        start = nums[i];
        prev = nums[i];
      }
    }
    ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
    return `เลขที่ ${ranges.join(", ")}`;
  };

  // Copy missing students list for LINE
  const handleCopyMissingList = () => {
    const roomText = selectedClassroom ? `ห้อง ${selectedClassroom}` : "ทุกห้องเรียน";
    const titleText = currentAssignment?.title || "งานวิชาศิลปะ";
    const dueText = currentAssignment?.dueDate ? new Date(currentAssignment.dueDate).toLocaleString("th-TH") : "ตามกำหนด";
    const rollSummary = formatRollRanges(missingStudents, currentClassStudents.length);

    const lines = [
      `📢 แจ้งเตือนส่งงาน: ${titleText}`,
      `🏫 ระดับชั้น/ห้อง: ${roomText}`,
      `❌ ยังไม่ส่งงาน (${missingStudents.length} จาก ${currentClassStudents.length} คน):`,
      `👉 สรุป: ${rollSummary}`,
      ``,
      `รายชื่อ:`,
      ...missingStudents.map((st, i) => `• เลขที่ ${st.studentNumber || (i + 1)}: ${st.name}`),
      ``,
      `⏰ กำหนดส่ง: ${dueText}`,
      `🌐 นักเรียนสามารถเข้าสู่ระบบส่งงานได้ที่: ${typeof window !== "undefined" ? window.location.origin : ""}/submissions`
    ];

    navigator.clipboard.writeText(lines.join("\n"));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Open Grading Modal
  const handleOpenGrading = (sub: any, fallbackStudent?: any) => {
    if (sub) {
      setSelectedSubmission(sub);
      setGradingScore(sub.score !== null && sub.score !== undefined ? String(sub.score) : "");
      setGradingFeedback(sub.feedback || "");
      setGradingStatus(sub.status === "resubmit" ? "resubmit" : "graded");
    } else if (fallbackStudent) {
      alert(`นักเรียน ${fallbackStudent.name} (เลขที่ ${fallbackStudent.studentNumber || "-"}) ยังไม่ได้ส่งงานนี้`);
    }
  };

  // Submit Grade
  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    setIsSaving(true);
    try {
      const effectiveStatus = (gradingStatus === "pending" && gradingScore !== "") ? "graded" : gradingStatus;
      const res = await fetch("/api/submissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedSubmission.id,
          score: gradingScore,
          feedback: gradingFeedback,
          status: effectiveStatus,
        }),
      });

      if (res.ok) {
        setSelectedSubmission(null);
        fetchSubmissions();
      } else {
        const err = await res.json();
        alert(err.error || "ไม่สามารถบันทึกคะแนนได้");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  // Export to Excel
  const handleExportExcel = async () => {
    if (!selectedAssignmentId) return;

    try {
      const res = await fetch(
        `/api/submissions/export?assignmentId=${selectedAssignmentId}&classroom=${encodeURIComponent(
          selectedClassroom || ""
        )}`
      );
      const data = await res.json();

      if (!res.ok || !data.reportData) {
        alert("ไม่สามารถสร้างรายงาน Excel ได้");
        return;
      }

      // Dynamic import XLSX on client
      const XLSX = await import("xlsx");

      const exportRows = data.reportData.map((r: any) => ({
        "เลขที่": r.studentNumber || r.orderNo,
        "รหัสนักเรียน": r.studentId,
        "ชื่อ - นามสกุล": r.studentName,
        "ห้องเรียน": r.classroom,
        "ชิ้นงาน": r.assignmentTitle,
        "คะแนนเต็ม": r.maxScore,
        "คะแนนที่ได้": r.score,
        "สถานะ": r.status,
        "การส่ง": r.isLate,
        "วันเวลาที่ส่ง": r.submittedAt,
        "ข้อเสนอแนะครู": r.feedback,
        "ลิงก์ผลงาน": r.hasLink,
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "สรุปคะแนน");

      const fileName = `คะแนน_${(data.assignment?.title || "งาน").replace(/[^a-zA-Z0-9ก-๙]/g, "_")}_${
        selectedClassroom || "ทุกห้อง"
      }.xlsx`;

      XLSX.writeFile(workbook, fileName);
    } catch (e) {
      console.error(e);
      alert("เกิดข้อผิดพลาดในการสร้างไฟล์ Excel");
    }
  };

  // Stats calculation
  const totalStudents = currentClassStudents.length;
  const submittedCount = submittedStudents.length;
  const gradedCount = currentClassStudents.filter((st) => subMap.get(st.id)?.status === "graded").length;
  const pendingCount = currentClassStudents.filter(
    (st) => subMap.has(st.id) && subMap.get(st.id)?.status !== "graded"
  ).length;
  const missingCount = missingStudents.length;

  return (
    <div className="space-y-4">
      {/* View Mode Toggle: ตรวจงานตามภาระงาน vs รวมผลงานรายบุคคล */}
      <div className="bg-white rounded-2xl p-2 border border-gray-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-gray-100/90 rounded-xl w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setGradingMode("assignment")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${
              gradingMode === "assignment"
                ? "bg-white text-orange-600 shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            1. ตรวจงานตามภาระงาน (By Assignment)
          </button>
          <button
            type="button"
            onClick={() => setGradingMode("individual")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${
              gradingMode === "individual"
                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Palette className="w-4 h-4" />
            2. รวมผลงานรายบุคคล (Individual Portfolios)
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                gradingMode === "individual" ? "bg-white/25 text-white" : "bg-orange-100 text-orange-700"
              }`}
            >
              ใหม่
            </span>
          </button>
        </div>

        <div className="text-xs text-gray-500 hidden md:flex items-center gap-2 pr-2">
          {gradingMode === "assignment" ? (
            <span>ตรวจผลงานแยกตามภาระงาน &amp; บันทึกคะแนนลงชีต</span>
          ) : (
            <span>รวบรวมแฟ้มสะสมงานศิลปะรายบุคคล ส่งออกพิมพ์ &amp; จัดแสดง</span>
          )}
        </div>
      </div>

      {gradingMode === "individual" ? (
        <StudentPortfolioCompiler initialClassroom={selectedClassroom} />
      ) : (
        <>
          {/* Filters Bar */}
          <div className="bg-white rounded-xl p-3 shadow-xs border border-gray-200/90 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Assignment Selector */}
          <div className="w-full sm:w-auto">
            <select
              value={selectedAssignmentId}
              onChange={(e) => {
                setSelectedAssignmentId(e.target.value);
                const a = assignments.find((x) => x.id === e.target.value);
                if (a && a.classroomsList && a.classroomsList.length > 0) {
                  setSelectedClassroom(a.classroomsList[0]);
                } else {
                  setSelectedClassroom("");
                }
              }}
              className="h-10 px-3 rounded-lg border border-gray-200 bg-white hover:border-gray-300 focus:border-orange-500 outline-none text-sm font-semibold text-gray-800 transition-colors cursor-pointer"
            >
              {assignments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title} ({a.maxScore} คะแนน)
                </option>
              ))}
            </select>
          </div>

          {/* Classroom Selector */}
          <div className="w-full sm:w-auto">
            <select
              value={selectedClassroom}
              onChange={(e) => setSelectedClassroom(e.target.value)}
              className="h-10 px-3 rounded-lg border border-gray-200 bg-white hover:border-gray-300 focus:border-orange-500 outline-none text-sm font-medium text-gray-800 transition-colors cursor-pointer"
            >
              <option value="">ทุกห้องเรียน</option>
              {availableClassrooms.map((roomName: string, idx: number) => (
                <option key={idx} value={roomName}>
                  ห้อง {roomName}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="w-full sm:w-60">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาชื่อ หรือ รหัสนักเรียน..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-3 rounded-lg border border-gray-200 bg-white hover:border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none text-sm text-gray-800 transition-colors placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Export Excel Button */}
        <div className="shrink-0 self-end md:self-center">
          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm shadow-2xs active:scale-95 transition-all cursor-pointer"
            title="ดาวน์โหลดคะแนนห้องนี้เป็น Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Status Segmented Tabs + Quick Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-1.5 rounded-xl border border-gray-200/90 shadow-xs">
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3.5 py-1.5 rounded-lg text-sm transition-all cursor-pointer ${
              statusFilter === "all"
                ? "bg-orange-500 text-white font-semibold shadow-xs"
                : "text-gray-600 hover:text-orange-600 hover:bg-orange-50 font-medium"
            }`}
          >
            ทั้งหมด <span className="opacity-75 font-mono text-xs ml-0.5">({totalStudents})</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("missing")}
            className={`px-3.5 py-1.5 rounded-lg text-sm transition-all cursor-pointer ${
              statusFilter === "missing"
                ? "bg-rose-500 text-white font-semibold shadow-2xs"
                : "text-gray-600 hover:text-rose-600 hover:bg-rose-50 font-medium"
            }`}
          >
            ยังไม่ส่ง <span className="opacity-75 font-mono text-xs ml-0.5">({missingCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("pending")}
            className={`px-3.5 py-1.5 rounded-lg text-sm transition-all cursor-pointer ${
              statusFilter === "pending"
                ? "bg-amber-500 text-white font-semibold shadow-2xs"
                : "text-gray-600 hover:text-amber-600 hover:bg-amber-50 font-medium"
            }`}
          >
            รอตรวจ <span className="opacity-75 font-mono text-xs ml-0.5">({pendingCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("graded")}
            className={`px-3.5 py-1.5 rounded-lg text-sm transition-all cursor-pointer ${
              statusFilter === "graded"
                ? "bg-emerald-600 text-white font-semibold shadow-2xs"
                : "text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 font-medium"
            }`}
          >
            ตรวจแล้ว <span className="opacity-75 font-mono text-xs ml-0.5">({gradedCount})</span>
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 text-xs text-gray-500 font-medium">
          <span>{selectedClassroom ? `ห้อง ${selectedClassroom}` : "ทุกห้อง"}</span>
          <span>•</span>
          <span>คะแนนเต็ม {currentAssignment?.maxScore || 10}</span>
          <button
            type="button"
            onClick={fetchSubmissions}
            className="p-1 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
            title="รีเฟรชข้อมูล"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Missing Students Notification Strip */}
      {selectedClassroom && (
        missingStudents.length > 0 ? (
          <div className="bg-gray-50/70 border border-gray-200/90 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-sm">
            <div className="flex items-start sm:items-center gap-2.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1 sm:mt-0" />
              <div className="text-gray-700 leading-normal">
                <span className="font-semibold text-gray-900">ยังไม่ส่งงาน {missingCount} คน:</span>{" "}
                <span className="font-mono text-rose-600 font-semibold">
                  {formatRollRanges(missingStudents, totalStudents)}
                </span>
                <button
                  type="button"
                  onClick={() => setShowDetailedMissing(!showDetailedMissing)}
                  className="ml-2 text-gray-400 hover:text-gray-700 underline text-xs cursor-pointer"
                >
                  {showDetailedMissing ? "ซ่อนรายชื่อ" : "ดูรายคน"}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyMissingList}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium text-xs shrink-0 self-end sm:self-auto transition-all cursor-pointer shadow-xs active:scale-95"
              title="คัดลอกรายชื่อส่งกลุ่ม LINE"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? "คัดลอกแล้ว" : "คัดลอกส่ง LINE"}</span>
            </button>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200/90 rounded-xl p-3 flex items-center gap-2 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>ห้อง {selectedClassroom} ส่งงานครบทุกคนแล้ว ({submittedCount}/{totalStudents} คน)</span>
          </div>
        )
      )}

      {/* Optional Expanded Detailed Chips */}
      {selectedClassroom && missingStudents.length > 0 && showDetailedMissing && (
        <div className="p-3 bg-white border border-gray-200/80 rounded-xl flex flex-wrap gap-1.5 animate-in fade-in duration-200">
          {missingStudents.map((st, i) => (
            <span
              key={st.id}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-700"
            >
              <span className="font-mono font-semibold text-rose-600">เลขที่ {st.studentNumber || (i + 1)}</span>
              <span className="font-normal text-gray-600">({st.name.split(" ")[0]})</span>
            </span>
          ))}
        </div>
      )}

      {/* Students Submissions Table */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200/90 overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/75 text-gray-500 uppercase tracking-wider sticky top-0 z-10 text-xs font-semibold border-b border-gray-100">
              <tr>
                <th className="px-4 py-2.5 font-semibold text-center w-14">เลขที่</th>
                <th className="px-4 py-2.5 font-semibold w-20">รหัส</th>
                <th className="px-5 py-2.5 font-semibold">ชื่อ - นามสกุล</th>
                <th className="px-4 py-2.5 font-semibold text-center">ห้อง</th>
                <th className="px-5 py-2.5 font-semibold">สถานะ</th>
                <th className="px-4 py-2.5 font-semibold text-center">ไฟล์แนบ</th>
                <th className="px-5 py-2.5 font-semibold text-center">คะแนน</th>
                <th className="px-5 py-2.5 font-semibold text-center">จัดการ</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-sm">
              {currentClassStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400 text-sm">
                    ไม่พบรายชื่อนักเรียนในห้องนี้ (กรุณาเลือกห้องเรียนที่มีนักเรียน หรือเพิ่มนักเรียนในระบบ)
                  </td>
                </tr>
              ) : (
                currentClassStudents
                  .filter((st) => {
                    const q = searchQuery.trim().toLowerCase();
                    const matchSearch =
                      !q ||
                      st.id.includes(q) ||
                      st.name.toLowerCase().includes(q) ||
                      (st.studentNumber && String(st.studentNumber).includes(q));

                    const sub = subMap.get(st.id);
                    if (statusFilter === "missing") return matchSearch && !sub;
                    if (statusFilter === "pending") return matchSearch && sub && sub.status !== "graded";
                    if (statusFilter === "graded") return matchSearch && sub && sub.status === "graded";
                    return matchSearch;
                  })
                  .map((student, idx) => {
                    const sub = subMap.get(student.id);
                    const seatNumber = student.studentNumber || (idx + 1);

                    return (
                      <tr
                        key={student.id}
                        className="hover:bg-gray-50/70 transition-colors"
                      >
                        {/* Roll / Seat Number (เลขที่) */}
                        <td className="px-4 py-2.5 text-center font-mono font-medium text-gray-700">
                          {seatNumber}
                        </td>

                        {/* Student ID */}
                        <td className="px-4 py-2.5 font-mono text-xs text-gray-500">
                          {student.id}
                        </td>

                        {/* Name */}
                        <td className="px-5 py-2.5 font-medium text-gray-900">
                          {student.name}
                        </td>

                        {/* Classroom */}
                        <td className="px-4 py-2.5 text-center text-xs text-gray-500">
                          {student.classroom || selectedClassroom || "-"}
                        </td>

                        {/* Submission Status */}
                        <td className="px-5 py-2.5">
                          {sub ? (
                            <div className="flex items-center gap-1.5">
                              {sub.status === "graded" ? (
                                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  ตรวจแล้ว
                                </span>
                              ) : sub.status === "resubmit" ? (
                                <span className="inline-flex items-center gap-1.5 text-xs text-rose-600 font-medium">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                  แจ้งแก้ไข
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 font-medium">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                  รอตรวจ
                                </span>
                              )}

                              {sub.isLate && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] bg-orange-50 text-orange-600 font-medium">
                                  ช้า
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                              ยังไม่ส่ง
                            </span>
                          )}
                        </td>

                        {/* Attachments Preview Icons */}
                        <td className="px-4 py-2.5 text-center">
                          {sub ? (
                            <div className="flex items-center justify-center gap-1.5">
                              {sub.imageUrl && (
                                <button
                                  type="button"
                                  onClick={() => setLightboxImage(sub.imageUrl)}
                                  className="w-7 h-7 rounded-lg overflow-hidden border border-gray-200 hover:border-gray-400 transition-colors cursor-pointer"
                                  title="คลิกดูภาพผลงาน"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={sub.imageUrl}
                                    alt="work"
                                    className="w-full h-full object-cover"
                                  />
                                </button>
                              )}

                              {sub.externalLink && (
                                <a
                                  href={sub.externalLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-7 h-7 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-colors"
                                  title="เปิดลิงก์ผลงาน"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}

                              {sub.fileUrl && (
                                <a
                                  href={sub.fileUrl}
                                  download={sub.fileName || "attachment"}
                                  className="w-7 h-7 rounded-lg text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 flex items-center justify-center transition-colors"
                                  title="ดาวน์โหลดไฟล์แนบ"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>

                        {/* Score */}
                        <td className="px-5 py-2.5 text-center">
                          {sub && sub.score !== null ? (
                            <span className="font-semibold text-xs sm:text-sm text-emerald-600 font-mono">
                              {sub.score} / {currentAssignment?.maxScore || 10}
                            </span>
                          ) : (
                            <span className="text-gray-300 font-mono text-xs">-</span>
                          )}
                        </td>

                        {/* Action Button */}
                        <td className="px-5 py-2.5 text-center">
                          {sub ? (
                            <button
                              type="button"
                              onClick={() => handleOpenGrading(sub)}
                              className="px-3 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium text-xs transition-colors cursor-pointer"
                            >
                              ตรวจงาน
                            </button>
                          ) : (
                            <span className="text-gray-300 text-xs">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECTION & GRADING MODAL */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 p-6 md:p-8 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <div>
                <h3 className="font-bold text-gray-900 text-xl font-kanit">
                  ตรวจงาน: {selectedSubmission.studentName} ({selectedSubmission.studentId})
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  ห้อง {selectedSubmission.classroom} • ส่งเมื่อ{" "}
                  {selectedSubmission.submittedAt
                    ? new Date(selectedSubmission.submittedAt).toLocaleString("th-TH")
                    : "-"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Submission Content Review */}
            <div className="space-y-4 mb-6">
              {/* Artwork Image */}
              {selectedSubmission.imageUrl && (
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">
                    ภาพถ่ายผลงานศิลปะ
                  </label>
                  <div
                    onClick={() => setLightboxImage(selectedSubmission.imageUrl)}
                    className="relative max-h-80 w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center cursor-zoom-in group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedSubmission.imageUrl}
                      alt="Student submission"
                      className="max-h-80 object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1.5">
                      <ImageIcon className="w-4 h-4" /> คลิกเพื่อดูภาพขยายเต็มจอ
                    </div>
                  </div>
                </div>
              )}

              {/* Concept & Technique Description */}
              {selectedSubmission.concept && (
                <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-100">
                  <label className="text-xs font-bold text-orange-900 block mb-1">
                    💡 แนวคิดผลงานและเทคนิคที่ใช้ (คำอธิบายจากนักเรียน)
                  </label>
                  <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-light">
                    "{selectedSubmission.concept}"
                  </p>
                </div>
              )}

              {/* External Link */}
              {selectedSubmission.externalLink && (
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-blue-900">ลิงก์ผลงานภายนอก</span>
                  </div>
                  <a
                    href={selectedSubmission.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    เปิดดูผลงาน
                  </a>
                </div>
              )}
            </div>

            {/* Grading Form */}
            <form onSubmit={handleSaveGrade} className="space-y-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Score Input */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">
                    คะแนนที่ได้ (เต็ม {currentAssignment?.maxScore || 10} คะแนน)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max={currentAssignment?.maxScore || 10}
                    required
                    value={gradingScore}
                    onChange={(e) => {
                      setGradingScore(e.target.value);
                      if (gradingStatus === "pending" && e.target.value !== "") {
                        setGradingStatus("graded");
                      }
                    }}
                    placeholder={`เช่น 9.5`}
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-orange-500 outline-none text-sm font-bold text-orange-600"
                  />
                </div>

                {/* Status Dropdown */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">
                    สถานะการตรวจ
                  </label>
                  <select
                    value={gradingStatus}
                    onChange={(e) => setGradingStatus(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-orange-500 outline-none text-sm font-semibold"
                  >
                    <option value="graded">✅ ตรวจแล้ว (ให้คะแนน)</option>
                    <option value="resubmit">🔄 ให้ส่งแก้ไขใหม่</option>
                    <option value="pending">⏳ ยังรอตรวจ</option>
                  </select>
                </div>
              </div>

              {/* Feedback Textarea */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">
                  ข้อเสนอแนะและคำติชมจากครู (Feedback)
                </label>
                <textarea
                  rows={3}
                  value={gradingFeedback}
                  onChange={(e) => setGradingFeedback(e.target.value)}
                  placeholder="เช่น ผลงานสวยงาม น้ำหนักแสงเงาชัดเจน พัฒนาเรื่องรายละเอียดด้านหน้าอีกนิดจะสมบูรณ์แบบมาก"
                  className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-orange-500 outline-none text-sm leading-relaxed"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedSubmission(null)}
                  className="h-11 rounded-xl border-gray-200 text-gray-600"
                >
                  ยกเลิก
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="h-11 px-6 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-md shadow-orange-500/20"
                >
                  {isSaving ? "กำลังบันทึก..." : "บันทึกคะแนน"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX FOR ARTWORK */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-6 right-6 text-white hover:text-red-400 p-3 bg-white/10 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxImage}
            alt="Zoomed artwork"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
        </>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import * as XLSX from "xlsx";
import { compareClassrooms } from "@/components/admin/StudentsTab";
import { swalToast, swalWarning } from "@/lib/swal";
import {
  Table2,
  Download,
  RefreshCw,
  Search,
  Users,
  CheckCircle2,
  AlertCircle,
  Award,
  Radio,
  Pause,
  FileSpreadsheet,
  Clock,
  HelpCircle,
  ClipboardList,
} from "lucide-react";

interface StudentRow {
  id: string;
  name: string;
  classroom: string | null;
  gradeLevel: string | null;
  studentNumber: number | null;
}

interface AssignmentCol {
  id: string;
  title: string;
  subjectId: string;
  classrooms: string[] | string | null;
  targetStudents: string[] | string | null;
  maxScore: number | null;
  dueDate: string | null;
  isActive: boolean | null;
}

interface QuizCol {
  id: string;
  code: string;
  title: string;
  gradeLevel: string;
  totalQuestions: number | null;
  maxScore: number | null;
  isActive: boolean | null;
  targetClassrooms: string[] | string | null;
}

interface SubmissionItem {
  id: string;
  assignmentId: string;
  studentId: string;
  classroom: string;
  score: number | null;
  status: string | null;
  isLate: boolean | null;
  submittedAt: string | null;
}

interface QuizAttemptItem {
  id: string;
  quizId: string;
  studentId: string;
  classroom: string;
  score: number;
  totalQuestions: number;
  submittedAt: string | null;
  status: string;
}

function parseJsonArray(val: unknown): string[] {
  let cur: unknown = val;
  for (let i = 0; i < 3; i++) {
    if (Array.isArray(cur)) return cur.map((v) => String(v).trim()).filter(Boolean);
    if (typeof cur === "string") {
      const trimmed = cur.trim();
      if (trimmed.startsWith("[") || trimmed.startsWith('"')) {
        try {
          cur = JSON.parse(trimmed);
          continue;
        } catch {
          break;
        }
      }
    }
    break;
  }
  return [];
}

function extractGradePrefix(roomOrGrade?: string | null): string {
  if (!roomOrGrade) return "";
  const m = roomOrGrade.match(/ม\.?\s*([1-6])/);
  return m ? `ม.${m[1]}` : roomOrGrade.trim();
}

export default function ScorebookTab() {
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const [students, setStudents] = useState<StudentRow[]>([]);
  const [assignments, setAssignments] = useState<AssignmentCol[]>([]);
  const [quizzes, setQuizzes] = useState<QuizCol[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttemptItem[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  const [selectedClassroom, setSelectedClassroom] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchScorebook = useCallback(async (silent: boolean = false) => {
    if (!silent) setIsRefreshing(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    try {
      const res = await fetch(`/api/admin/scorebook?_t=${Date.now()}`, {
        cache: "no-store",
        signal: controller.signal,
      });
      if (!res.ok) return;
      const data: any = await res.json();

      const stuList: StudentRow[] = Array.isArray(data.students) ? data.students : [];
      setStudents(stuList);
      setAssignments(Array.isArray(data.assignments) ? data.assignments : []);
      setQuizzes(Array.isArray(data.quizzes) ? data.quizzes : []);
      setSubmissions(Array.isArray(data.submissions) ? data.submissions : []);
      setQuizAttempts(Array.isArray(data.quizAttempts) ? data.quizAttempts : []);
      setSubjects(Array.isArray(data.subjects) ? data.subjects : []);

      setLastUpdated(
        new Date().toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );

      setSelectedClassroom((prev) => {
        if (prev) return prev;
        const rooms = Array.from(
          new Set(stuList.map((s) => (s.classroom || "").trim()).filter(Boolean))
        ).sort(compareClassrooms);
        return rooms[0] || "all";
      });
    } catch (err) {
      console.error("Scorebook fetch error:", err);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchScorebook(false);
  }, [fetchScorebook]);

  // Real-time Live Polling every 6 seconds when tab is visible
  useEffect(() => {
    if (!isLive) return;
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchScorebook(true);
      }
    }, 6000);
    return () => clearInterval(timer);
  }, [isLive, fetchScorebook]);

  const classroomOptions = useMemo(() => {
    const rooms = Array.from(
      new Set(students.map((s) => (s.classroom || "").trim()).filter(Boolean))
    ).sort(compareClassrooms);
    return rooms;
  }, [students]);

  const subjectMap = useMemo(() => {
    const m = new Map<string, any>();
    for (const s of subjects) m.set(s.id, s);
    return m;
  }, [subjects]);

  // Map newest submission per (studentId + assignmentId)
  const subLookup = useMemo(() => {
    const m = new Map<string, SubmissionItem>();
    for (const sub of submissions) {
      const key = `${sub.studentId}__${sub.assignmentId}`;
      if (!m.has(key)) {
        m.set(key, sub);
      }
    }
    return m;
  }, [submissions]);

  // Map best/latest quiz attempt per (studentId + quizId)
  const quizLookup = useMemo(() => {
    const m = new Map<string, QuizAttemptItem>();
    for (const att of quizAttempts) {
      const key = `${att.studentId}__${att.quizId}`;
      const existing = m.get(key);
      if (!existing || att.score > existing.score) {
        m.set(key, att);
      }
    }
    return m;
  }, [quizAttempts]);

  // Determine which assignments & quizzes apply to a given classroom
  const getColumnsForClassroom = useCallback(
    (room: string) => {
      const activeAssignments = assignments.filter((a) => a.isActive !== false);

      if (room === "all") {
        return {
          colsAssignments: activeAssignments,
          colsQuizzes: [] as QuizCol[],
        };
      }

      const roomGrade = extractGradePrefix(room);

      const colsAssignments = activeAssignments.filter((a) => {
        const rooms = parseJsonArray(a.classrooms);
        if (rooms.length > 0) {
          return rooms.includes(room);
        }
        const subj = subjectMap.get(a.subjectId);
        if (subj?.gradeLevel && roomGrade) {
          return extractGradePrefix(subj.gradeLevel) === roomGrade;
        }
        return true;
      });

      return { colsAssignments, colsQuizzes: [] as QuizCol[] };
    },
    [assignments, subjectMap]
  );

  const { colsAssignments, colsQuizzes } = useMemo(
    () => getColumnsForClassroom(selectedClassroom || "all"),
    [getColumnsForClassroom, selectedClassroom]
  );

  // Build rows for selected classroom & search query
  const computeRowsForClassroom = useCallback(
    (room: string, query: string) => {
      const { colsAssignments: rAss, colsQuizzes: rQuiz } = getColumnsForClassroom(room);
      const qLower = query.trim().toLowerCase();

      const filteredStudents = students
        .filter((st) => {
          if (room !== "all" && (st.classroom || "").trim() !== room) return false;
          if (qLower) {
            const matchName = (st.name || "").toLowerCase().includes(qLower);
            const matchId = (st.id || "").toLowerCase().includes(qLower);
            if (!matchName && !matchId) return false;
          }
          return true;
        })
        .sort((a, b) => {
          if (room === "all") {
            const rc = compareClassrooms(a.classroom, b.classroom);
            if (rc !== 0) return rc;
          }
          const numA = a.studentNumber ?? 9999;
          const numB = b.studentNumber ?? 9999;
          if (numA !== numB) return numA - numB;
          return a.id.localeCompare(b.id, "th", { numeric: true });
        });

      const rows = filteredStudents.map((st, idx) => {
        let earnedTotal = 0;
        let maxTotal = 0;
        let completedCount = 0;
        let totalTasks = 0;
        const missingTitles: string[] = [];

        const assignmentCells = rAss.map((ass) => {
          const targets = parseJsonArray(ass.targetStudents);
          const isTargeted = targets.length === 0 || targets.includes(st.id);
          const assMax = Number(ass.maxScore) || 10;

          if (!isTargeted) {
            return { assignmentId: ass.id, type: "exempt" as const, score: null, maxScore: assMax };
          }

          totalTasks += 1;
          maxTotal += assMax;
          const sub = subLookup.get(`${st.id}__${ass.id}`);

          if (!sub) {
            missingTitles.push(ass.title);
            return { assignmentId: ass.id, type: "missing" as const, score: null, maxScore: assMax };
          }

          if (sub.status === "resubmit") {
            missingTitles.push(`${ass.title} (ส่งแก้ไข)`);
            return { assignmentId: ass.id, type: "resubmit" as const, score: sub.score, maxScore: assMax };
          }

          completedCount += 1;
          if (sub.status === "graded" && sub.score !== null && sub.score !== undefined) {
            earnedTotal += Number(sub.score) || 0;
            return { assignmentId: ass.id, type: "graded" as const, score: Number(sub.score), maxScore: assMax };
          }

          return { assignmentId: ass.id, type: "pending" as const, score: null, maxScore: assMax };
        });

        const quizCells = rQuiz.map((qz) => {
          const qzMax = Number(qz.maxScore) || Number(qz.totalQuestions) || 20;
          totalTasks += 1;
          maxTotal += qzMax;

          const att = quizLookup.get(`${st.id}__${qz.id}`);
          if (!att) {
            missingTitles.push(`[แบบทดสอบ] ${qz.title}`);
            return { quizId: qz.id, type: "missing" as const, score: null, maxScore: qzMax };
          }

          completedCount += 1;
          earnedTotal += Number(att.score) || 0;
          return { quizId: qz.id, type: "completed" as const, score: Number(att.score), maxScore: qzMax };
        });

        const percentage = maxTotal > 0 ? Math.round((earnedTotal / maxTotal) * 1000) / 10 : 0;

        return {
          orderNo: st.studentNumber || idx + 1,
          student: st,
          assignmentCells,
          quizCells,
          completedCount,
          totalTasks,
          missingCount: missingTitles.length,
          missingTitles,
          earnedTotal: Math.round(earnedTotal * 10) / 10,
          maxTotal,
          percentage,
        };
      });

      return { rows, colsAssignments: rAss, colsQuizzes: rQuiz };
    },
    [students, getColumnsForClassroom, subLookup, quizLookup]
  );

  const { rows: tableRows } = useMemo(
    () => computeRowsForClassroom(selectedClassroom || "all", searchQuery),
    [computeRowsForClassroom, selectedClassroom, searchQuery]
  );

  // KPI summary
  const summaryStats = useMemo(() => {
    const total = tableRows.length;
    const allDone = tableRows.filter((r) => r.totalTasks > 0 && r.missingCount === 0).length;
    const hasMissing = tableRows.filter((r) => r.missingCount > 0).length;
    const avgScore =
      total > 0
        ? Math.round((tableRows.reduce((acc, r) => acc + r.earnedTotal, 0) / total) * 10) / 10
        : 0;
    return { total, allDone, hasMissing, avgScore };
  }, [tableRows]);

  // Excel Export (Multi-sheet: Scorebook + Missing Work Summary)
  const buildSheetDataForRoom = (room: string, query: string) => {
    const { rows, colsAssignments: rAss, colsQuizzes: rQuiz } = computeRowsForClassroom(room, query);

    const scoreRows = rows.map((r) => {
      const obj: Record<string, any> = {
        "เลขที่": r.orderNo,
        "รหัสนักเรียน": r.student.id,
        "ชื่อ-นามสกุล": r.student.name,
        "ห้องเรียน": r.student.classroom || "-",
      };

      r.assignmentCells.forEach((cell, i) => {
        const title = rAss[i]?.title || `ชิ้นงาน ${i + 1}`;
        const colName = `${title} (เต็ม ${cell.maxScore})`;
        if (cell.type === "exempt") obj[colName] = "ไม่ต้องส่ง";
        else if (cell.type === "missing") obj[colName] = "ยังไม่ส่ง";
        else if (cell.type === "resubmit") obj[colName] = "ให้ส่งแก้ไข";
        else if (cell.type === "pending") obj[colName] = "รอตรวจ";
        else obj[colName] = cell.score ?? 0;
      });

      r.quizCells.forEach((cell, i) => {
        const q = rQuiz[i];
        const colName = `[สอบ] ${q?.title || `ชุดที่ ${i + 1}`} (เต็ม ${cell.maxScore})`;
        obj[colName] = cell.type === "completed" ? cell.score ?? 0 : "ยังไม่สอบ";
      });

      obj["ส่งแล้ว (รายการ)"] = r.completedCount;
      obj["ค้างส่ง (รายการ)"] = r.missingCount;
      obj["คะแนนรวม"] = r.earnedTotal;
      obj["คะแนนเต็มรวม"] = r.maxTotal;
      obj["ร้อยละ (%)"] = r.percentage;

      return obj;
    });

    const missingRows = rows
      .filter((r) => r.missingCount > 0)
      .map((r) => ({
        "เลขที่": r.orderNo,
        "รหัสนักเรียน": r.student.id,
        "ชื่อ-นามสกุล": r.student.name,
        "ห้องเรียน": r.student.classroom || "-",
        "จำนวนงานที่ค้าง": r.missingCount,
        "รายการที่ยังไม่ส่ง / ยังไม่สอบ": r.missingTitles.join(", "),
      }));

    return { scoreRows, missingRows };
  };

  const handleExportCurrentRoom = () => {
    if (tableRows.length === 0) {
      swalWarning("ไม่มีข้อมูลนักเรียน", "กรุณาเลือกห้องเรียนที่มีรายชื่อนักเรียน");
      return;
    }

    const roomLabel = selectedClassroom === "all" ? "ทุกห้อง" : selectedClassroom;
    const { scoreRows, missingRows } = buildSheetDataForRoom(selectedClassroom || "all", searchQuery);

    const wb = XLSX.utils.book_new();
    const wsScores = XLSX.utils.json_to_sheet(scoreRows);
    XLSX.utils.book_append_sheet(wb, wsScores, `คะแนน_${roomLabel}`.replace(/[\\/?*[\]]/g, "_").slice(0, 31));

    const wsMissing = XLSX.utils.json_to_sheet(
      missingRows.length > 0
        ? missingRows
        : [{ "สถานะ": "นักเรียนในห้องนี้ส่งงานและทำแบบทดสอบครบทุกคนแล้ว" }]
    );
    XLSX.utils.book_append_sheet(wb, wsMissing, "สรุปงานค้างส่ง");

    const dateStr = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `รวมคะแนนรายบุคคล_${roomLabel.replace(/\//g, "-")}_${dateStr}.xlsx`);
    swalToast("ดาวน์โหลดไฟล์ Excel เรียบร้อยแล้ว", "success");
  };

  const handleExportAllRooms = () => {
    if (classroomOptions.length === 0) {
      swalWarning("ไม่มีข้อมูลห้องเรียน", "ยังไม่มีข้อมูลนักเรียนในระบบ");
      return;
    }

    const wb = XLSX.utils.book_new();
    const allMissing: any[] = [];

    for (const room of classroomOptions) {
      const { scoreRows, missingRows } = buildSheetDataForRoom(room, "");
      if (scoreRows.length > 0) {
        const ws = XLSX.utils.json_to_sheet(scoreRows);
        const safeSheetName = room.replace(/[\\/?*[\]]/g, "_").slice(0, 31);
        XLSX.utils.book_append_sheet(wb, ws, safeSheetName);
      }
      allMissing.push(...missingRows);
    }

    const wsMissing = XLSX.utils.json_to_sheet(
      allMissing.length > 0 ? allMissing : [{ "สถานะ": "นักเรียนทุกคนส่งงานครบแล้ว" }]
    );
    XLSX.utils.book_append_sheet(wb, wsMissing, "สรุปงานค้างส่งทั้งหมด");

    const dateStr = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `รวมคะแนนรายบุคคล_ทุกห้องเรียน_${dateStr}.xlsx`);
    swalToast("ดาวน์โหลดไฟล์ Excel รวมทุกห้องเรียบร้อยแล้ว", "success");
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-gray-200 p-12 flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-gray-500 font-medium">กำลังโหลดตารางรวมคะแนนรายบุคคล...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Top Control & Live Status Bar */}
      <div className="bg-white rounded-3xl border border-gray-200/90 p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
              <Table2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-gray-900 font-kanit">
                  ตารางรวมคะแนนรายบุคคล (Real-time Scorebook)
                </h2>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    isLive
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-gray-100 text-gray-600 border-gray-200"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isLive ? "bg-emerald-500 animate-pulse" : "bg-gray-400"
                    }`}
                  />
                  {isLive ? "LIVE อัปเดตอัตโนมัติ (6 วิ)" : "หยุดอัปเดตชั่วคราว"}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                <span>ดูสถานะส่งงาน-ไม่ส่งงาน และคะแนนชิ้นงานรายบุคคลแบบเรียลไทม์</span>
                {lastUpdated && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 font-mono">
                    <Clock className="w-3 h-3" /> อัปเดต {lastUpdated}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsLive((prev) => !prev)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                isLive
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                  : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {isLive ? <Pause className="w-3.5 h-3.5" /> : <Radio className="w-3.5 h-3.5" />}
              <span>{isLive ? "พัก Live" : "เปิด Live"}</span>
            </button>

            <button
              type="button"
              onClick={() => fetchScorebook(false)}
              disabled={isRefreshing}
              className="px-3 py-2 rounded-xl text-xs font-bold border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>รีเฟรช</span>
            </button>

            <button
              type="button"
              onClick={handleExportCurrentRoom}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>โหลด Excel ({selectedClassroom === "all" ? "ทั้งหมด" : selectedClassroom})</span>
            </button>

            <button
              type="button"
              onClick={handleExportAllRooms}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white shadow-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>โหลด Excel ทุกห้อง (แยกชีต)</span>
            </button>
          </div>
        </div>

        {/* Filter Bar: Classroom + Search */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-gray-100">
          <div className="md:col-span-4">
            <label className="text-[11px] font-bold text-gray-600 block mb-1">เลือกห้องเรียน</label>
            <select
              value={selectedClassroom}
              onChange={(e) => setSelectedClassroom(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-gray-50/70 focus:bg-white focus:border-orange-500 text-xs font-bold text-gray-800 outline-none"
            >
              {classroomOptions.map((room) => (
                <option key={room} value={room}>
                  ห้อง {room}
                </option>
              ))}
              <option value="all">แสดงทุกห้องเรียนรวมกัน ({students.length} คน)</option>
            </select>
          </div>

          <div className="md:col-span-8">
            <label className="text-[11px] font-bold text-gray-600 block mb-1">
              ค้นหานักเรียน (ชื่อ-นามสกุล หรือ รหัส 5 หลัก)
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="พิมพ์ชื่อ หรือ รหัสนักเรียน เช่น 37282..."
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-gray-200 bg-gray-50/70 focus:bg-white focus:border-orange-500 text-xs outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-gray-200/90 p-4 flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-gray-500 font-medium">นักเรียนที่แสดง</p>
            <p className="text-xl font-bold font-kanit text-gray-900">{summaryStats.total} คน</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-emerald-200/80 p-4 flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-emerald-700 font-medium">ส่งงานครบแล้ว</p>
            <p className="text-xl font-bold font-kanit text-emerald-700">{summaryStats.allDone} คน</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-rose-200/80 p-4 flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-rose-700 font-medium">ยังมีงานค้างส่ง</p>
            <p className="text-xl font-bold font-kanit text-rose-600">{summaryStats.hasMissing} คน</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-amber-200/80 p-4 flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-amber-700 font-medium">คะแนนรวมเฉลี่ย</p>
            <p className="text-xl font-bold font-kanit text-amber-700">{summaryStats.avgScore}</p>
          </div>
        </div>
      </div>

      {/* Scorebook Matrix Table */}
      <div className="bg-white rounded-3xl border border-gray-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-gray-50/90 border-b border-gray-200 text-[11px] font-bold text-gray-700">
                <th className="py-3 px-3 text-center w-12 sticky left-0 bg-gray-50 z-10 border-r border-gray-200/70">
                  เลขที่
                </th>
                <th className="py-3 px-3 w-20">รหัส</th>
                <th className="py-3 px-3 min-w-[180px]">ชื่อ-นามสกุล</th>
                {selectedClassroom === "all" && <th className="py-3 px-2.5 w-20 text-center">ห้อง</th>}

                {colsAssignments.map((ass, idx) => (
                  <th key={ass.id} className="py-3 px-2.5 text-center min-w-[105px] border-l border-gray-200/60">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="inline-flex items-center gap-1 text-[10px] text-orange-600 font-bold">
                        <ClipboardList className="w-3 h-3" /> งาน {idx + 1}
                      </span>
                      <span className="line-clamp-2 leading-tight text-gray-800" title={ass.title}>
                        {ass.title}
                      </span>
                      <span className="text-[10px] font-normal text-gray-400">
                        (เต็ม {ass.maxScore || 10})
                      </span>
                    </div>
                  </th>
                ))}

                {colsQuizzes.map((qz, idx) => (
                  <th key={qz.id} className="py-3 px-2.5 text-center min-w-[105px] border-l border-purple-200/60 bg-purple-50/30">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="inline-flex items-center gap-1 text-[10px] text-purple-700 font-bold">
                        <HelpCircle className="w-3 h-3" /> สอบ {idx + 1}
                      </span>
                      <span className="line-clamp-2 leading-tight text-gray-800" title={qz.title}>
                        {qz.title}
                      </span>
                      <span className="text-[10px] font-normal text-purple-500">
                        (เต็ม {qz.maxScore || qz.totalQuestions || 20})
                      </span>
                    </div>
                  </th>
                ))}

                <th className="py-3 px-3 text-center w-28 border-l border-gray-200 bg-orange-50/50 text-orange-900">
                  คะแนนรวม
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {tableRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5 + colsAssignments.length + colsQuizzes.length}
                    className="py-12 text-center text-gray-400 text-sm"
                  >
                    ไม่พบข้อมูลนักเรียนตามเงื่อนไขที่เลือก
                  </td>
                </tr>
              ) : (
                tableRows.map((row) => (
                  <tr key={row.student.id} className="hover:bg-orange-50/20 transition-colors">
                    <td className="py-2.5 px-3 text-center font-mono text-gray-500 sticky left-0 bg-white border-r border-gray-100">
                      {row.orderNo}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-gray-600 font-medium">{row.student.id}</td>
                    <td className="py-2.5 px-3 font-semibold text-gray-900">{row.student.name}</td>
                    {selectedClassroom === "all" && (
                      <td className="py-2.5 px-2.5 text-center">
                        <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[11px] font-medium">
                          {row.student.classroom || "-"}
                        </span>
                      </td>
                    )}

                    {row.assignmentCells.map((cell) => (
                      <td key={cell.assignmentId} className="py-2 px-2 text-center border-l border-gray-100">
                        {cell.type === "graded" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px]">
                            {cell.score}
                          </span>
                        )}
                        {cell.type === "pending" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 font-semibold text-[10px]">
                            รอตรวจ
                          </span>
                        )}
                        {cell.type === "resubmit" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-semibold text-[10px]">
                            ส่งแก้ไข
                          </span>
                        )}
                        {cell.type === "missing" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-gray-100 text-gray-500 text-[10px]">
                            ยังไม่ส่ง
                          </span>
                        )}
                        {cell.type === "exempt" && (
                          <span className="text-[10px] text-gray-300">-</span>
                        )}
                      </td>
                    ))}

                    {row.quizCells.map((cell) => (
                      <td key={cell.quizId} className="py-2 px-2 text-center border-l border-purple-100/70 bg-purple-50/10">
                        {cell.type === "completed" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 font-bold text-[11px]">
                            {cell.score}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-gray-100 text-gray-500 text-[10px]">
                            ยังไม่สอบ
                          </span>
                        )}
                      </td>
                    ))}

                    <td className="py-2.5 px-3 text-center border-l border-gray-100 bg-orange-50/20">
                      <div className="font-bold text-gray-900 font-kanit">
                        {row.earnedTotal}{" "}
                        <span className="text-[10px] font-normal text-gray-400">/ {row.maxTotal}</span>
                      </div>
                      <div className="text-[10px] text-orange-600 font-semibold">{row.percentage}%</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

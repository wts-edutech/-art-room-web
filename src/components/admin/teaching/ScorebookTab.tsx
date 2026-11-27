"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import * as XLSX from "xlsx";
import { compareClassrooms } from "@/components/admin/StudentsTab";
import ImageAnnotator, { AnnotatorImage } from "@/components/submissions/ImageAnnotator";
import { swalToast, swalWarning, swalError } from "@/lib/swal";
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
  MessageCircle,
  Copy,
  Check,
  Send,
  X,
  PenLine,
  Save,
  ExternalLink,
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
  studentName?: string | null;
  classroom: string;
  score: number | null;
  status: string | null;
  isLate: boolean | null;
  submittedAt: string | null;
}

function normalizeStudentName(name?: string | null): string {
  return (name || "")
    .trim()
    .toLowerCase()
    .replace(/^(นาย|นางสาว|น\.ส\.|นาง|เด็กชาย|ด\.ช\.|เด็กหญิง|ด\.ญ\.)\s*/, "")
    .replace(/\s+/g, "");
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
  const [isLive, setIsLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const [students, setStudents] = useState<StudentRow[]>([]);
  const [assignments, setAssignments] = useState<AssignmentCol[]>([]);
  const [quizzes, setQuizzes] = useState<QuizCol[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttemptItem[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  const [selectedClassroom, setSelectedClassroom] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loadError, setLoadError] = useState<string>("");
  const [isLineModalOpen, setIsLineModalOpen] = useState(false);
  const [lineTargetMode, setLineTargetMode] = useState<string>("all");
  const [excludedLineAssIds, setExcludedLineAssIds] = useState<Set<string>>(new Set());
  const [lineCustomText, setLineCustomText] = useState<string>("");
  const [copiedLine, setCopiedLine] = useState(false);

  // Quick Inline Grading & Stamp Modal State
  const [quickGradeTarget, setQuickGradeTarget] = useState<{
    student: StudentRow;
    assignment: AssignmentCol;
  } | null>(null);
  const [quickSubDetail, setQuickSubDetail] = useState<any | null>(null);
  const [loadingQuickSub, setLoadingQuickSub] = useState(false);
  const [quickScore, setQuickScore] = useState<string>("");
  const [quickStatus, setQuickStatus] = useState<string>("graded");
  const [quickFeedback, setQuickFeedback] = useState<string>("");
  const [isQuickSaving, setIsQuickSaving] = useState(false);
  const [isQuickAnnotating, setIsQuickAnnotating] = useState(false);
  const [quickPendingAnnotations, setQuickPendingAnnotations] = useState<Record<number, string | null>>({});
  const [quickActiveImgIdx, setQuickActiveImgIdx] = useState(0);

  const openQuickGradeModal = async (student: StudentRow, assignment: AssignmentCol) => {
    const sid = String(student.id || "").trim();
    const aid = String(assignment.id || "").trim();
    const cname = normalizeStudentName(student.name);
    const lightSub = submissions.find(
      (s) =>
        String(s.assignmentId || "").trim() === aid &&
        (String(s.studentId || "").trim() === sid || (cname && normalizeStudentName(s.studentName) === cname))
    );
    setQuickGradeTarget({ student, assignment });
    setQuickScore(
      lightSub?.score !== null && lightSub?.score !== undefined
        ? String(lightSub.score)
        : String(assignment.maxScore || 10)
    );
    setQuickStatus(lightSub?.status === "resubmit" ? "resubmit" : "graded");
    setQuickFeedback("");
    setQuickPendingAnnotations({});
    setQuickActiveImgIdx(0);
    setQuickSubDetail(null);
    setLoadingQuickSub(true);

    try {
      const res = await fetch(
        `/api/submissions?assignmentId=${encodeURIComponent(assignment.id)}&studentId=${encodeURIComponent(student.id)}&studentName=${encodeURIComponent(student.name)}&_t=${Date.now()}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const list = await res.json();
        const found = Array.isArray(list) && list.length > 0 ? list[0] : null;
        if (found) {
          setQuickSubDetail(found);
          if (found.score !== null && found.score !== undefined) {
            setQuickScore(String(found.score));
          }
          if (found.feedback) {
            setQuickFeedback(found.feedback);
          }
        }
      }
    } catch (e) {
      console.error("Failed to fetch quick submission detail:", e);
    } finally {
      setLoadingQuickSub(false);
    }
  };

  const handleSaveQuickGrade = async () => {
    if (!quickSubDetail?.id) return;
    setIsQuickSaving(true);
    try {
      const res = await fetch("/api/submissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: quickSubDetail.id,
          score: quickScore,
          status: quickStatus,
          feedback: quickFeedback,
          annotations: Object.keys(quickPendingAnnotations).length > 0 ? quickPendingAnnotations : undefined,
        }),
      });
      if (res.ok) {
        swalToast("บันทึกคะแนนเรียบร้อยแล้ว", "success");
        setQuickGradeTarget(null);
        setQuickSubDetail(null);
        fetchScorebook(true);
      } else {
        const err = await res.json().catch(() => ({}));
        swalError("บันทึกไม่สำเร็จ", err.error || "กรุณาลองใหม่อีกครั้ง");
      }
    } catch {
      swalError("เชื่อมต่อไม่สำเร็จ", "ไม่สามารถบันทึกคะแนนได้");
    } finally {
      setIsQuickSaving(false);
    }
  };

  const fetchScorebook = useCallback(async (silent: boolean = false, isRetry: boolean = false) => {
    if (!silent) setIsRefreshing(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);
    try {
      // On silent/background refresh, only reload submissions IF students & assignments are already loaded
      const useSubOnly = silent && students.length > 0 && assignments.length > 0;
      const url = useSubOnly
        ? `/api/admin/scorebook?submissionsOnly=1&_t=${Date.now()}`
        : `/api/admin/scorebook?_t=${Date.now()}`;
      const res = await fetch(url, {
        cache: "no-store",
        signal: controller.signal,
      });

      if (res.status === 401) {
        setLoadError("เซสชันผู้ดูแลระบบหมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง");
        if (typeof window !== "undefined") {
          window.location.href = "/admin/login";
        }
        return;
      }

      if (!res.ok) {
        if (!isRetry && !useSubOnly) {
          clearTimeout(timeoutId);
          await new Promise((r) => setTimeout(r, 600));
          return fetchScorebook(silent, true);
        }
        setLoadError(`โหลดข้อมูลไม่สำเร็จ (HTTP ${res.status}) กรุณากดปุ่มรีเฟรชอีกครั้ง`);
        return;
      }

      const data: any = await res.json();
      setLoadError("");

      const subList: SubmissionItem[] = Array.isArray(data.submissions) ? data.submissions : [];
      setSubmissions(subList);

      if (!data.submissionsOnly) {
        const stuList: StudentRow[] = Array.isArray(data.students) ? data.students : [];
        const assList: AssignmentCol[] = Array.isArray(data.assignments) ? data.assignments : [];
        setStudents(stuList);
        setAssignments(assList);
        setQuizzes(Array.isArray(data.quizzes) ? data.quizzes : []);
        setQuizAttempts(Array.isArray(data.quizAttempts) ? data.quizAttempts : []);
        setSubjects(Array.isArray(data.subjects) ? data.subjects : []);

        setSelectedClassroom((prev) => {
          if (prev) return prev;
          const taughtSet = new Set<string>();
          for (const a of assList) {
            if (a.isActive === false) continue;
            for (const r of parseJsonArray(a.classrooms)) taughtSet.add(r);
          }
          const rooms = (
            taughtSet.size > 0
              ? Array.from(taughtSet)
              : Array.from(new Set(stuList.map((s) => (s.classroom || "").trim()).filter(Boolean)))
          ).sort(compareClassrooms);
          return rooms[0] || "all";
        });
      }

      setLastUpdated(
        new Date().toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    } catch (err) {
      console.error("Scorebook fetch error:", err);
      if (!isRetry && !silent) {
        clearTimeout(timeoutId);
        await new Promise((r) => setTimeout(r, 700));
        return fetchScorebook(silent, true);
      }
      if (students.length === 0) {
        setLoadError("การเชื่อมต่อใช้เวลานานกว่าปกติ กรุณากดปุ่มรีเฟรชเพื่อโหลดข้อมูลตารางคะแนนใหม่");
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [students.length, assignments.length]);

  useEffect(() => {
    fetchScorebook(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-refresh submissions whenever teacher returns to this browser tab/window (e.g. from LINE)
  useEffect(() => {
    let lastFocusRefresh = Date.now();
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible" && Date.now() - lastFocusRefresh > 8_000) {
        lastFocusRefresh = Date.now();
        fetchScorebook(true);
      }
    };
    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);
    return () => {
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
    };
  }, [fetchScorebook]);

  // Optional Live Polling every 60 seconds when enabled & tab is visible (preserves D1 daily read quota)
  useEffect(() => {
    if (!isLive) return;
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchScorebook(true);
      }
    }, 60_000);
    return () => clearInterval(timer);
  }, [isLive, fetchScorebook]);

  const classroomOptions = useMemo(() => {
    const taughtSet = new Set<string>();
    for (const a of assignments) {
      if (a.isActive === false) continue;
      for (const r of parseJsonArray(a.classrooms)) {
        taughtSet.add(r);
      }
    }
    if (taughtSet.size > 0) {
      return Array.from(taughtSet).sort(compareClassrooms);
    }
    return Array.from(
      new Set(students.map((s) => (s.classroom || "").trim()).filter(Boolean))
    ).sort(compareClassrooms);
  }, [assignments, students]);

  const subjectMap = useMemo(() => {
    const m = new Map<string, any>();
    for (const s of subjects) m.set(s.id, s);
    return m;
  }, [subjects]);

  // Map newest submission per (trimmed studentId + assignmentId) AND normalized studentName fallback
  const { subLookup, subNameLookup } = useMemo(() => {
    const byId = new Map<string, SubmissionItem>();
    const byName = new Map<string, SubmissionItem>();
    for (const sub of submissions) {
      const sid = String(sub.studentId || "").trim();
      const aid = String(sub.assignmentId || "").trim();
      if (sid && aid) {
        const key = `${sid}__${aid}`;
        if (!byId.has(key)) byId.set(key, sub);
      }
      const cname = normalizeStudentName(sub.studentName);
      if (cname && aid) {
        const roomPrefix = (sub.classroom || "").trim();
        const nameRoomKey = `${roomPrefix}::${cname}__${aid}`;
        if (!byName.has(nameRoomKey)) byName.set(nameRoomKey, sub);
        const nameOnlyKey = `*::${cname}__${aid}`;
        if (!byName.has(nameOnlyKey)) byName.set(nameOnlyKey, sub);
      }
    }
    return { subLookup: byId, subNameLookup: byName };
  }, [submissions]);

  const getSubForStudentAndAssignment = useCallback(
    (st: StudentRow, assignmentId: string): SubmissionItem | undefined => {
      const sid = String(st.id || "").trim();
      const aid = String(assignmentId || "").trim();
      const direct = subLookup.get(`${sid}__${aid}`);
      if (direct) return direct;
      const cname = normalizeStudentName(st.name);
      if (!cname) return undefined;
      const room = (st.classroom || "").trim();
      return subNameLookup.get(`${room}::${cname}__${aid}`) || subNameLookup.get(`*::${cname}__${aid}`);
    },
    [subLookup, subNameLookup]
  );

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
          const sub = getSubForStudentAndAssignment(st, ass.id);

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
    [students, getColumnsForClassroom, getSubForStudentAndAssignment, quizLookup]
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

  // Missing count for current LINE modal selection (dynamic so header & dropdown stay 100% accurate)
  const lineMissingStats = useMemo(() => {
    const perAssMissing = colsAssignments.map((ass, idx) => {
      const cnt = tableRows.filter((r) => {
        const c = r.assignmentCells[idx];
        return c && (c.type === "missing" || c.type === "resubmit");
      }).length;
      return { ass, idx, missingCnt: cnt, submittedCnt: Math.max(0, tableRows.length - cnt) };
    });

    if (lineTargetMode === "all") {
      const activeIndices = colsAssignments
        .map((a, idx) => (!excludedLineAssIds.has(a.id) ? idx : -1))
        .filter((idx) => idx >= 0);

      const studentsWithMissing = tableRows
        .map((r) => {
          const titles: string[] = [];
          for (const idx of activeIndices) {
            const cell = r.assignmentCells[idx];
            const title = colsAssignments[idx]?.title || `งานที่ ${idx + 1}`;
            if (cell?.type === "missing") titles.push(title);
            else if (cell?.type === "resubmit") titles.push(`${title} (ส่งแก้ไข)`);
          }
          return { row: r, titles };
        })
        .filter((x) => x.titles.length > 0);

      return {
        perAssMissing,
        activeMissingCount: studentsWithMissing.length,
        studentsWithMissing,
      };
    }

    const assIdx = colsAssignments.findIndex((a) => a.id === lineTargetMode);
    const studentsWithMissing =
      assIdx >= 0
        ? tableRows
            .filter((r) => {
              const cell = r.assignmentCells[assIdx];
              return cell && (cell.type === "missing" || cell.type === "resubmit");
            })
            .map((r) => ({
              row: r,
              titles: [
                r.assignmentCells[assIdx]?.type === "resubmit"
                  ? `${colsAssignments[assIdx].title} (ส่งแก้ไข)`
                  : colsAssignments[assIdx].title,
              ],
            }))
        : [];

    return {
      perAssMissing,
      activeMissingCount: studentsWithMissing.length,
      studentsWithMissing,
    };
  }, [colsAssignments, tableRows, lineTargetMode, excludedLineAssIds]);

  // Build LINE reminder message whenever modal opens or mode/room/filter changes
  const generatedLineMessage = useMemo(() => {
    const roomLabel = selectedClassroom === "all" ? "ทุกห้องเรียน" : `ห้อง ${selectedClassroom}`;
    const todayStr = new Date().toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "2-digit",
    });

    if (lineTargetMode === "all") {
      const includedCount = colsAssignments.filter((a) => !excludedLineAssIds.has(a.id)).length;
      if (includedCount === 0) {
        return `กรุณาติ๊กเลือกชิ้นงานอย่างน้อย 1 ชิ้นด้านบนเพื่อสร้างรายชื่อนักเรียนค้างส่ง`;
      }
      const missingStudents = lineMissingStats.studentsWithMissing;
      if (missingStudents.length === 0) {
        return `✅ แจ้งผลส่งงานศิลปะ (${roomLabel})\nข้อมูล ณ วันที่ ${todayStr}\n\n🎉 นักเรียนทุกคนส่งงานที่เลือกครบทุกชิ้นแล้วครับ/ค่ะ!`;
      }
      const lines = [
        `📢 แจ้งเตือนติดตามงานค้างส่ง (${roomLabel})`,
        `📅 ข้อมูล ณ วันที่ ${todayStr} • ค้างส่ง ${missingStudents.length} จาก ${tableRows.length} คน`,
        ``,
        ...missingStudents.map(
          ({ row: r, titles }) =>
            `• เลขที่ ${r.orderNo} ${r.student.name}${selectedClassroom === "all" && r.student.classroom ? ` (${r.student.classroom})` : ""} — ขาด ${titles.length} งาน: ${titles.join(", ")}`
        ),
        ``,
        `📲 ส่งงานได้ที่เว็บไซต์ห้องเรียนศิลปะ: https://artroom-wts.com/submissions`,
      ];
      return lines.join("\n");
    }

    const assIdx = colsAssignments.findIndex((a) => a.id === lineTargetMode);
    const ass = assIdx >= 0 ? colsAssignments[assIdx] : null;
    if (!ass) return "";

    const missingForAss = lineMissingStats.studentsWithMissing;

    if (missingForAss.length === 0) {
      return `✅ แจ้งผลส่งงาน: ${ass.title} (${roomLabel})\n🎉 นักเรียนส่งงานนี้ครบทุกคนแล้วครับ/ค่ะ!`;
    }

    const lines = [
      `📢 แจ้งเตือนส่งงาน: ${ass.title}`,
      `🏫 ${roomLabel} • ยังไม่ส่ง ${missingForAss.length} จาก ${tableRows.length} คน`,
      ``,
      ...missingForAss.map(({ row: r }) => {
        const isResubmit = r.assignmentCells[assIdx]?.type === "resubmit";
        return `• เลขที่ ${r.orderNo} ${r.student.name}${isResubmit ? " (ส่งแก้ไข)" : ""}`;
      }),
      ``,
      `📲 ส่งงานได้ที่: https://artroom-wts.com/submissions`,
    ];
    return lines.join("\n");
  }, [selectedClassroom, lineTargetMode, tableRows.length, colsAssignments, excludedLineAssIds, lineMissingStats]);

  useEffect(() => {
    if (isLineModalOpen) {
      setLineCustomText(generatedLineMessage);
    }
  }, [isLineModalOpen, generatedLineMessage]);

  const handleCopyLineText = async () => {
    try {
      await navigator.clipboard.writeText(lineCustomText);
      setCopiedLine(true);
      swalToast("คัดลอกข้อความแจ้งเตือน LINE แล้ว", "success");
      setTimeout(() => setCopiedLine(false), 2000);
    } catch {
      swalWarning("คัดลอกไม่สำเร็จ", "กรุณากดคลุมข้อความแล้วคัดลอกด้วยตนเอง");
    }
  };

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
                  {isLive ? "LIVE อัปเดตอัตโนมัติ (60 วิ)" : "โหมดประหยัดโควต้า (กดรีเฟรชเอง)"}
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
              onClick={async () => {
                await fetchScorebook(students.length > 0 && assignments.length > 0);
                setExcludedLineAssIds(new Set());
                setLineTargetMode("all");
                setIsLineModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#06C755] hover:bg-[#05b34c] text-white shadow-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>แจ้งเตือน LINE ({summaryStats.hasMissing})</span>
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

      {loadError && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-rose-800 font-semibold">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{loadError}</span>
          </div>
          <button
            type="button"
            onClick={() => fetchScorebook(false)}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>ลองโหลดข้อมูลใหม่</span>
          </button>
        </div>
      )}

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
            <p className="text-[11px] text-emerald-700 font-medium">ส่งครบทุกชิ้นแล้ว ({colsAssignments.length} งาน)</p>
            <p className="text-xl font-bold font-kanit text-emerald-700">{summaryStats.allDone} คน</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-rose-200/80 p-4 flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-rose-700 font-medium">ค้างอย่างน้อย 1 ชิ้นงาน</p>
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

      {/* Per-Assignment Submission Breakdown Strip */}
      {colsAssignments.length > 0 && tableRows.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {colsAssignments.map((ass, idx) => {
            const submittedCnt = tableRows.filter((r) => {
              const c = r.assignmentCells[idx];
              return c && (c.type === "graded" || c.type === "pending");
            }).length;
            const missingCnt = tableRows.filter((r) => {
              const c = r.assignmentCells[idx];
              return c && (c.type === "missing" || c.type === "resubmit");
            }).length;
            return (
              <div
                key={ass.id}
                className="bg-white rounded-2xl border border-gray-200/90 px-3.5 py-2.5 flex items-center justify-between gap-2 shadow-2xs"
              >
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-orange-600">
                    งานที่ {idx + 1} • ส่งแล้ว {submittedCnt}/{tableRows.length} คน
                  </div>
                  <div className="text-xs font-bold text-gray-800 truncate" title={ass.title}>
                    {ass.title}
                  </div>
                </div>
                {missingCnt > 0 ? (
                  <button
                    type="button"
                    onClick={async () => {
                      await fetchScorebook(true);
                      setLineTargetMode(ass.id);
                      setIsLineModalOpen(true);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold shrink-0 cursor-pointer transition-colors"
                    title="คลิกเพื่อแจ้งเตือนทาง LINE เฉพาะคนที่ค้างงานชิ้นนี้"
                  >
                    ขาด {missingCnt} คน (แจ้ง LINE)
                  </button>
                ) : (
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold shrink-0">
                    ส่งครบแล้ว ✓
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Scorebook Matrix Table */}
      <div className="bg-white rounded-3xl border border-gray-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/90 border-b border-gray-200 text-[11px] font-bold text-gray-700">
                <th className="py-3 px-2.5 text-center w-11 sticky left-0 bg-gray-50 z-10 border-r border-gray-200/70">
                  เลขที่
                </th>
                <th className="py-3 px-2 w-16">รหัส</th>
                <th className="py-3 px-2.5 min-w-[155px]">ชื่อ-นามสกุล</th>
                {selectedClassroom === "all" && <th className="py-3 px-2 w-16 text-center">ห้อง</th>}

                {colsAssignments.map((ass, idx) => (
                  <th key={ass.id} className="py-2.5 px-2 text-center min-w-[96px] max-w-[150px] border-l border-gray-200/60">
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

                    {row.assignmentCells.map((cell, cIdx) => {
                      const assObj = colsAssignments[cIdx];
                      return (
                        <td key={cell.assignmentId} className="py-2 px-2 text-center border-l border-gray-100">
                          {cell.type === "graded" && (
                            <button
                              type="button"
                              onClick={() => assObj && openQuickGradeModal(row.student, assObj)}
                              title="คลิกเพื่อดูผลงาน / แก้ไขคะแนน"
                              className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-[11px] cursor-pointer transition-all active:scale-95"
                            >
                              {cell.score}
                            </button>
                          )}
                          {cell.type === "pending" && (
                            <button
                              type="button"
                              onClick={() => assObj && openQuickGradeModal(row.student, assObj)}
                              title="คลิกเพื่อตรวจงานและให้คะแนนทันที"
                              className="inline-flex items-center px-2 py-0.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300 font-bold text-[10px] cursor-pointer transition-all active:scale-95 shadow-2xs"
                            >
                              รอตรวจ
                            </button>
                          )}
                          {cell.type === "resubmit" && (
                            <button
                              type="button"
                              onClick={() => assObj && openQuickGradeModal(row.student, assObj)}
                              title="คลิกเพื่อดูผลงาน / แก้ไขสถานะ"
                              className="inline-flex items-center px-2 py-0.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-[10px] cursor-pointer transition-all active:scale-95"
                            >
                              ส่งแก้ไข
                            </button>
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
                      );
                    })}

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

      {/* LINE Reminder Modal */}
      {isLineModalOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsLineModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full max-h-[92dvh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-[#06C755] to-emerald-600 text-white flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <MessageCircle className="w-5 h-5 shrink-0" />
                <div className="min-w-0">
                  <h3 className="font-bold text-base font-kanit truncate">แจ้งเตือนงานค้างทาง LINE</h3>
                  <p className="text-[11px] text-white/90 truncate">
                    {selectedClassroom === "all" ? "ทุกห้องเรียน" : `ห้อง ${selectedClassroom}`} • ค้างส่ง{" "}
                    {lineMissingStats.activeMissingCount} จาก {summaryStats.total} คน
                    {lastUpdated ? ` (อัปเดต ${lastUpdated})` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => fetchScorebook(students.length > 0 && assignments.length > 0)}
                  disabled={isRefreshing}
                  title="ดึงสถานะส่งงานล่าสุดทันที"
                  className="px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                  <span>เช็คล่าสุด</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsLineModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 space-y-3.5 overflow-y-auto">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">
                  เลือกรูปแบบข้อความแจ้งเตือน
                </label>
                <select
                  value={lineTargetMode}
                  onChange={(e) => setLineTargetMode(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#06C755] text-xs font-bold text-gray-800 outline-none"
                >
                  <option value="all">
                    สรุปรวมงานค้างรายบุคคล ({lineTargetMode === "all" ? lineMissingStats.activeMissingCount : summaryStats.hasMissing} คน)
                  </option>
                  {lineMissingStats.perAssMissing.map(({ ass, idx, missingCnt, submittedCnt }) => (
                    <option key={ass.id} value={ass.id}>
                      เฉพาะงาน {idx + 1}: {ass.title} — {missingCnt > 0 ? `ยังไม่ส่ง ${missingCnt} คน` : `ส่งครบ ${submittedCnt}/${summaryStats.total} ✓`}
                    </option>
                  ))}
                </select>
              </div>

              {lineTargetMode === "all" && lineMissingStats.perAssMissing.length > 1 && (
                <div className="rounded-2xl border border-gray-200/90 bg-gray-50/70 p-3 space-y-1.5">
                  <div className="text-[11px] font-bold text-gray-700 flex items-center justify-between">
                    <span>เลือกชิ้นงานที่จะนำมานับรวม (ติ๊กออกได้หากงานล่าสุดยังไม่ถึงกำหนดส่ง):</span>
                  </div>
                  <div className="space-y-1">
                    {lineMissingStats.perAssMissing.map(({ ass, idx, missingCnt, submittedCnt }) => {
                      const isIncluded = !excludedLineAssIds.has(ass.id);
                      return (
                        <label
                          key={ass.id}
                          className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-white border border-gray-200/80 text-xs cursor-pointer hover:border-emerald-300 transition-colors"
                        >
                          <span className="flex items-center gap-2 min-w-0">
                            <input
                              type="checkbox"
                              checked={isIncluded}
                              onChange={() => {
                                setExcludedLineAssIds((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(ass.id)) next.delete(ass.id);
                                  else next.add(ass.id);
                                  return next;
                                });
                              }}
                              className="w-4 h-4 rounded accent-[#06C755] cursor-pointer shrink-0"
                            />
                            <span className="font-semibold text-gray-800 truncate">
                              งาน {idx + 1}: {ass.title}
                            </span>
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                              missingCnt > 0
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            {missingCnt > 0 ? `ขาด ${missingCnt} คน` : `ส่งครบ ${submittedCnt} คน ✓`}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-700">ข้อความที่จะส่งเข้ากลุ่ม LINE (แก้ไขได้)</label>
                  <span className="text-[10px] text-gray-400">{lineCustomText.length} ตัวอักษร</span>
                </div>
                <textarea
                  rows={8}
                  value={lineCustomText}
                  onChange={(e) => setLineCustomText(e.target.value)}
                  className="w-full p-3.5 rounded-2xl border border-gray-200 bg-gray-50/70 focus:bg-white focus:border-[#06C755] text-xs leading-relaxed text-gray-800 outline-none font-sans"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleCopyLineText}
                  className="w-full sm:flex-1 h-11 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  {copiedLine ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLine ? "คัดลอกเรียบร้อยแล้ว" : "คัดลอกข้อความ"}</span>
                </button>

                <a
                  href={`https://line.me/R/msg/text/?${encodeURIComponent(lineCustomText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:flex-1 h-11 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#06C755]/25 transition-all active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>เปิดแอป LINE เพื่อส่งทันที</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Inline Grading & Stamp Modal */}
      {quickGradeTarget && (
        <div
          className="fixed inset-0 z-[100] bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setQuickGradeTarget(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full max-h-[90dvh] overflow-y-auto shadow-2xl border border-gray-100 p-5 sm:p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100">
              <div>
                <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                  {quickGradeTarget.assignment.title} (เต็ม {quickGradeTarget.assignment.maxScore || 10})
                </span>
                <h3 className="font-bold text-gray-900 text-base sm:text-lg font-kanit mt-1.5">
                  ตรวจงาน: {quickGradeTarget.student.name} ({quickGradeTarget.student.id})
                </h3>
                <p className="text-xs text-gray-500">
                  ห้อง {quickGradeTarget.student.classroom || "-"} • เลขที่ {quickGradeTarget.student.studentNumber || "-"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuickGradeTarget(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingQuickSub ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs text-gray-500">
                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <span>กำลังโหลดผลงานของนักเรียน...</span>
              </div>
            ) : !quickSubDetail ? (
              <div className="py-8 text-center text-xs text-gray-400">ไม่พบข้อมูลงานที่ส่ง</div>
            ) : (
              <>
                {/* Artwork Image & Stamp Button */}
                {(() => {
                  const subImages: string[] =
                    Array.isArray(quickSubDetail.images) && quickSubDetail.images.length > 0
                      ? quickSubDetail.images
                      : quickSubDetail.imageUrl
                      ? [quickSubDetail.imageUrl]
                      : [];
                  const serverAnnotated: (string | null)[] = Array.isArray(quickSubDetail.annotatedImages)
                    ? quickSubDetail.annotatedImages
                    : [];
                  const annotatorImages: AnnotatorImage[] = subImages.map((orig, i) => {
                    const pending = quickPendingAnnotations[i];
                    const current =
                      pending !== undefined
                        ? pending === null
                          ? orig
                          : pending
                        : serverAnnotated[i] || orig;
                    return { originalUrl: orig, currentUrl: current };
                  });
                  const currentPreview = annotatorImages[quickActiveImgIdx]?.currentUrl || subImages[0];

                  return (
                    <>
                      {subImages.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-700">
                              ภาพถ่ายผลงานศิลปะ {subImages.length > 1 ? `(${quickActiveImgIdx + 1}/${subImages.length})` : ""}
                            </span>
                            <button
                              type="button"
                              onClick={() => setIsQuickAnnotating(true)}
                              className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
                            >
                              <PenLine className="w-3.5 h-3.5" />
                              <span>💮 ปั๊มตรวจ / เขียนบนภาพ</span>
                            </button>
                          </div>

                          <div className="rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 max-h-80 flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={currentPreview}
                              alt="ผลงานนักเรียน"
                              className="max-h-80 w-auto object-contain"
                            />
                          </div>

                          {subImages.length > 1 && (
                            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                              {subImages.map((_, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setQuickActiveImgIdx(idx)}
                                  className={`w-12 h-12 rounded-xl overflow-hidden border-2 cursor-pointer shrink-0 ${
                                    quickActiveImgIdx === idx ? "border-orange-500" : "border-gray-200 opacity-70"
                                  }`}
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={annotatorImages[idx]?.currentUrl || subImages[idx]}
                                    alt={`ภาพที่ ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {isQuickAnnotating && (
                        <ImageAnnotator
                          images={annotatorImages}
                          initialIndex={quickActiveImgIdx}
                          title={`ผลงานของ ${quickGradeTarget.student.name} (${quickGradeTarget.student.id})`}
                          onCancel={() => setIsQuickAnnotating(false)}
                          onDone={(changes) => {
                            setQuickPendingAnnotations((prev) => ({ ...prev, ...changes }));
                            setIsQuickAnnotating(false);
                          }}
                        />
                      )}
                    </>
                  );
                })()}

                {quickSubDetail.externalLink && (
                  <a
                    href={quickSubDetail.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold hover:bg-blue-100"
                  >
                    <span className="truncate">{quickSubDetail.externalLink}</span>
                    <ExternalLink className="w-4 h-4 shrink-0 ml-2" />
                  </a>
                )}

                {quickSubDetail.concept && (
                  <div className="p-3 rounded-xl bg-orange-50/60 border border-orange-100 text-xs text-gray-800">
                    <span className="font-bold text-orange-900 block mb-0.5">💡 แนวคิดผลงาน:</span>
                    {quickSubDetail.concept}
                  </div>
                )}

                {/* Score & Status Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      คะแนนที่ได้ (เต็ม {quickGradeTarget.assignment.maxScore || 10})
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min={0}
                      max={quickGradeTarget.assignment.maxScore || 10}
                      value={quickScore}
                      onChange={(e) => setQuickScore(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-orange-500 text-sm font-bold text-gray-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">สถานะการตรวจ</label>
                    <select
                      value={quickStatus}
                      onChange={(e) => setQuickStatus(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-orange-500 text-xs font-bold text-gray-800 outline-none"
                    >
                      <option value="graded">✅ ตรวจแล้ว (ให้คะแนน)</option>
                      <option value="resubmit">🔄 ให้ส่งแก้ไข (Resubmit)</option>
                      <option value="pending">⏳ รอตรวจ (Pending)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    ข้อเสนอแนะและคำติชมจากครู (Feedback)
                  </label>
                  <textarea
                    rows={2}
                    value={quickFeedback}
                    onChange={(e) => setQuickFeedback(e.target.value)}
                    placeholder="เช่น ผลงานสวยงาม น้ำหนักแสงเงาชัดเจน..."
                    className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-orange-500 text-xs outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setQuickGradeTarget(null)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveQuickGrade}
                    disabled={isQuickSaving}
                    className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isQuickSaving ? "กำลังบันทึก..." : "บันทึกคะแนน"}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  X, 
  MessageCircle, 
  Copy, 
  Check, 
  FileSpreadsheet, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Search, 
  Send,
  School,
  Share2,
  Calendar,
  Sparkles,
  BookOpen,
  FolderOpen
} from "lucide-react";
import * as XLSX from "xlsx";

export interface StudentRecord {
  id: string;
  name: string;
  classroom: string;
  studentNumber?: number;
}

export interface AssignmentItem {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  maxScore?: number;
  classroomsList?: string[];
  targetStudentsList?: string[];
  subjectCode?: string;
}

export interface SubmissionRecord {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName?: string;
  classroom?: string;
  score?: number;
  status?: string;
  submittedAt?: string;
}

interface AssignmentLineReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: AssignmentItem | null;
  assignments: AssignmentItem[];
  classrooms: { id: string; name: string }[];
  students: StudentRecord[];
  submissions: SubmissionRecord[];
  initialClassroom?: string;
  onSelectAssignment?: (assignment: AssignmentItem) => void;
}

const cleanName = (name: string) => {
  return (name || "")
    .trim()
    .toLowerCase()
    .replace(/^(นาย|นางสาว|น\.ส\.|นาง|เด็กชาย|ด\.ช\.|เด็กหญิง|ด\.ญ\.)\s*/, "")
    .replace(/\s+/g, "");
};

const normalizeRoom = (roomStr: string) => {
  if (!roomStr) return "";
  return roomStr.trim().replace(/^ห้อง\s*/, "").replace(/^ชั้น\s*/, "");
};

const isRoomMatch = (r1: string, r2: string) => {
  const n1 = normalizeRoom(r1);
  const n2 = normalizeRoom(r2);
  if (n1 === n2) return true;
  const c1 = n1.replace(/^ม\./, "");
  const c2 = n2.replace(/^ม\./, "");
  return c1 === c2;
};

// Format roll numbers cleanly into ranges (e.g. "เลขที่ 1 - 26 (ทุกคน)" or "เลขที่ 1-3, 5, 8")
const formatRollRanges = (missing: StudentRecord[], total: number) => {
  if (missing.length === 0) return "ไม่มี (ส่งครบแล้ว)";
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

export default function AssignmentLineReminderModal({
  isOpen,
  onClose,
  assignment,
  assignments,
  classrooms,
  students,
  submissions,
  initialClassroom = "all",
  onSelectAssignment,
}: AssignmentLineReminderModalProps) {
  const [activeAssignmentId, setActiveAssignmentId] = useState<string>(assignment?.id || "");

  useEffect(() => {
    if (assignment?.id) {
      setActiveAssignmentId(assignment.id);
    }
  }, [assignment?.id]);

  const currentAssignment = useMemo(() => {
    if (assignments && assignments.length > 0) {
      return assignments.find((a) => a.id === activeAssignmentId) || assignment;
    }
    return assignment;
  }, [assignments, activeAssignmentId, assignment]);

  // Target rooms for current assignment
  const targetRooms = useMemo(() => {
    if (currentAssignment?.classroomsList && currentAssignment.classroomsList.length > 0) {
      return currentAssignment.classroomsList;
    }
    if (classrooms && classrooms.length > 0) {
      return classrooms.map((c) => c.name);
    }
    return [];
  }, [currentAssignment, classrooms]);

  const [selectedRoom, setSelectedRoom] = useState<string>(
    initialClassroom && initialClassroom !== "all" && targetRooms.some((r) => isRoomMatch(r, initialClassroom))
      ? initialClassroom
      : targetRooms[0] || "all"
  );

  // When assignment changes, if selectedRoom is not valid for new assignment, reset to first room or "all"
  useEffect(() => {
    if (selectedRoom !== "all" && !targetRooms.some((r) => isRoomMatch(r, selectedRoom))) {
      setSelectedRoom(targetRooms[0] || "all");
    }
  }, [currentAssignment?.id, targetRooms, selectedRoom]);

  // Default deadline from assignment's dueDate if available
  const defaultDeadline = useMemo(() => {
    if (currentAssignment?.dueDate) {
      try {
        const d = new Date(currentAssignment.dueDate);
        return `ภายใน ${d.toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })} เวลา ${d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.`;
      } catch {
        return "ภายในวันนี้ เวลา 20:00 น.";
      }
    }
    return "ภายในวันนี้ เวลา 20:00 น.";
  }, [currentAssignment?.dueDate]);

  const [customDeadline, setCustomDeadline] = useState<string>(defaultDeadline);
  const [customNote, setCustomNote] = useState<string>("กรุณาเข้าสู่ระบบ Art Room เพื่อแนบไฟล์ภาพผลงาน หรือ Canva link ให้เรียบร้อยเพื่อบันทึกคะแนนเก็บ");
  const [studentSearch, setStudentSearch] = useState<string>("");
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());

  // Update deadline when switching assignment
  useEffect(() => {
    setCustomDeadline(defaultDeadline);
  }, [defaultDeadline]);

  // Filter students enrolled for this assignment and room
  const roomStudents = useMemo(() => {
    return students.filter((s) => {
      // If assignment has specific targetStudentsList
      if (currentAssignment?.targetStudentsList && Array.isArray(currentAssignment.targetStudentsList) && currentAssignment.targetStudentsList.length > 0) {
        if (!currentAssignment.targetStudentsList.includes(s.id)) return false;
      }
      if (selectedRoom === "all") {
        return targetRooms.length === 0 || targetRooms.some((r) => isRoomMatch(s.classroom, r));
      }
      return isRoomMatch(s.classroom, selectedRoom);
    }).sort((a, b) => {
      const roomCompare = a.classroom.localeCompare(b.classroom, undefined, { numeric: true });
      if (roomCompare !== 0) return roomCompare;
      if (a.studentNumber && b.studentNumber) return a.studentNumber - b.studentNumber;
      return a.id.localeCompare(b.id, undefined, { numeric: true });
    });
  }, [students, selectedRoom, targetRooms, currentAssignment]);

  // Set of submitted student IDs and cleanNames for this assignment in this room
  const { submittedIds, submittedNames } = useMemo(() => {
    const ids = new Set<string>();
    const names = new Set<string>();
    if (!currentAssignment) return { submittedIds: ids, submittedNames: names };

    submissions.forEach((sub) => {
      if (sub.assignmentId === currentAssignment.id) {
        if (selectedRoom === "all" || isRoomMatch(sub.classroom || "", selectedRoom)) {
          if (sub.studentId) ids.add(sub.studentId.trim());
          if (sub.studentName) names.add(cleanName(sub.studentName));
        }
      }
    });
    return { submittedIds: ids, submittedNames: names };
  }, [submissions, currentAssignment, selectedRoom]);

  // Unsubmitted students list
  const unsubmittedStudents = useMemo(() => {
    return roomStudents.filter((s) => {
      const idMatch = submittedIds.has(s.id.trim());
      const nameMatch = submittedNames.has(cleanName(s.name));
      return !(idMatch || nameMatch);
    });
  }, [roomStudents, submittedIds, submittedNames]);

  // Submitted students list
  const submittedStudents = useMemo(() => {
    return roomStudents.filter((s) => {
      const idMatch = submittedIds.has(s.id.trim());
      const nameMatch = submittedNames.has(cleanName(s.name));
      return idMatch || nameMatch;
    });
  }, [roomStudents, submittedIds, submittedNames]);

  // Sync selectedStudentIds whenever unsubmitted list changes
  useEffect(() => {
    const allIds = new Set(unsubmittedStudents.map((s) => s.id));
    setSelectedStudentIds(allIds);
  }, [unsubmittedStudents]);

  // Filtered unsubmitted students by search query
  const filteredUnsubmitted = useMemo(() => {
    if (!studentSearch.trim()) return unsubmittedStudents;
    const q = studentSearch.toLowerCase().trim();
    return unsubmittedStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.classroom.toLowerCase().includes(q) ||
        (s.studentNumber && s.studentNumber.toString().includes(q))
    );
  }, [unsubmittedStudents, studentSearch]);

  // Toggle single student checkbox
  const handleToggleStudent = (studentId: string) => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  };

  // Toggle select all unsubmitted students
  const handleSelectAll = (select: boolean) => {
    if (select) {
      setSelectedStudentIds(new Set(unsubmittedStudents.map((s) => s.id)));
    } else {
      setSelectedStudentIds(new Set());
    }
  };

  // Missing count per target room for badges
  const missingCountByRoom = useMemo(() => {
    const counts: Record<string, number> = {};
    if (!currentAssignment) return counts;

    targetRooms.forEach((room) => {
      const enrolled = students.filter((s) => {
        if (currentAssignment?.targetStudentsList && Array.isArray(currentAssignment.targetStudentsList) && currentAssignment.targetStudentsList.length > 0) {
          if (!currentAssignment.targetStudentsList.includes(s.id)) return false;
        }
        return isRoomMatch(s.classroom, room);
      });

      const roomSubIds = new Set<string>();
      const roomSubNames = new Set<string>();
      submissions.forEach((sub) => {
        if (sub.assignmentId === currentAssignment.id && isRoomMatch(sub.classroom || "", room)) {
          if (sub.studentId) roomSubIds.add(sub.studentId.trim());
          if (sub.studentName) roomSubNames.add(cleanName(sub.studentName));
        }
      });

      const missing = enrolled.filter((s) => {
        const idMatch = roomSubIds.has(s.id.trim());
        const nameMatch = roomSubNames.has(cleanName(s.name));
        return !(idMatch || nameMatch);
      }).length;

      counts[room] = missing;
    });
    return counts;
  }, [targetRooms, students, submissions, currentAssignment]);

  // Active students to be included in the LINE message
  const activeUnsubmittedList = useMemo(() => {
    return unsubmittedStudents.filter((s) => selectedStudentIds.has(s.id));
  }, [unsubmittedStudents, selectedStudentIds]);

  // Generate LINE Message text
  const lineMessage = useMemo(() => {
    if (!currentAssignment) return "";
    const roomTitle = selectedRoom === "all" ? `ทุกห้อง (${targetRooms.join(", ")})` : `ห้อง ${selectedRoom}`;
    const totalInClass = roomStudents.length;
    const doneCount = submittedStudents.length;
    const pendingCount = activeUnsubmittedList.length;
    const percentDone = totalInClass > 0 ? Math.round((doneCount / totalInClass) * 100) : 0;
    const rollSummary = formatRollRanges(activeUnsubmittedList, totalInClass);

    let studentListStr = "";
    if (activeUnsubmittedList.length === 0) {
      studentListStr = "🎉 ยอดเยี่ยมมาก! ทุกคนส่งงานครบแล้ว 100%";
    } else {
      if (selectedRoom === "all") {
        const byRoom: Record<string, StudentRecord[]> = {};
        activeUnsubmittedList.forEach((s) => {
          byRoom[s.classroom] = byRoom[s.classroom] || [];
          byRoom[s.classroom].push(s);
        });

        const lines: string[] = [];
        Object.entries(byRoom).forEach(([rm, stList]) => {
          lines.push(`\n📍 ห้อง ${rm} (${stList.length} คน):`);
          stList.forEach((s) => {
            const numStr = s.studentNumber ? `เลขที่ ${s.studentNumber}` : `รหัส ${s.id}`;
            lines.push(`  • ${numStr} - ${s.name}`);
          });
        });
        studentListStr = lines.join("\n");
      } else {
        studentListStr = activeUnsubmittedList
          .map((s, idx) => {
            const numStr = s.studentNumber ? `เลขที่ ${s.studentNumber}` : `#${idx + 1}`;
            return `${idx + 1}. ${numStr} - ${s.name} (${s.id})`;
          })
          .join("\n");
      }
    }

    return `📢 [แจ้งเตือน] นักเรียนที่ยังไม่ส่งภาระงาน/ชิ้นงาน
🎨 รายวิชาศิลปะ (ทัศนศิลป์)
📂 ภาระงาน: ${currentAssignment.title} (คะแนนเต็ม ${currentAssignment.maxScore || 10} คะแนน)
🏫 ระดับชั้น: ${roomTitle}

📊 สรุปภาพรวมห้องเรียน:
• ส่งแล้ว: ${doneCount} / ${totalInClass} คน (${percentDone}%)
• ค้างส่ง: ${pendingCount} คน
• สรุปเลขที่ค้าง: ${rollSummary}

⚠️ รายชื่อนักเรียนที่ค้างส่งงาน (${pendingCount} คน):
${studentListStr}

👉 เข้าสู่ระบบส่งงานได้ทันทีที่เว็บไซต์ Art Room:
🔗 https://artroom-wts.com/submissions

⏰ กำหนดส่ง: ${customDeadline}
${customNote ? `💬 ข้อความจากครูผู้สอน: ${customNote}\n` : ""}
ขอบคุณนักเรียนทุกคนที่ให้ความร่วมมือค่ะ/ครับ 🙏✨`;
  }, [
    currentAssignment,
    selectedRoom,
    targetRooms,
    activeUnsubmittedList,
    roomStudents.length,
    submittedStudents.length,
    customDeadline,
    customNote,
  ]);

  // Copy Message to Clipboard
  const handleCopyMessage = () => {
    navigator.clipboard.writeText(lineMessage);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Open LINE Share
  const handleShareToLine = () => {
    const encoded = encodeURIComponent(lineMessage);
    const lineUrl = `https://line.me/R/share?text=${encoded}`;
    window.open(lineUrl, "_blank");
  };

  // Export unsubmitted students to Excel
  const handleExportUnsubmittedExcel = () => {
    if (!currentAssignment || activeUnsubmittedList.length === 0) {
      alert("ไม่มีรายชื่อนักเรียนค้างส่งที่เลือก");
      return;
    }

    const rows = activeUnsubmittedList.map((s, idx) => ({
      "ลำดับ": idx + 1,
      "เลขที่": s.studentNumber || "-",
      "รหัสนักเรียน": s.id,
      "ชื่อ-นามสกุล": s.name,
      "ห้องเรียน": s.classroom,
      "ภาระงาน": currentAssignment.title,
      "คะแนนเต็ม": currentAssignment.maxScore || 10,
      "สถานะ": "ยังไม่ส่งงาน (ค้างส่ง)"
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "รายชื่อค้างส่งภาระงาน");
    const roomSlug = selectedRoom === "all" ? "รวมทุกห้อง" : selectedRoom.replace("/", "_");
    const safeTitle = currentAssignment.title.replace(/[\/\\?%*:|"<>]/g, "_").slice(0, 30);
    XLSX.writeFile(workbook, `นักเรียนค้างส่งงาน_${safeTitle}_${roomSlug}_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  if (!isOpen || !currentAssignment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-emerald-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#06C755] to-emerald-700 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 border border-white/20">
              <MessageCircle className="w-6 h-6 fill-white text-[#06C755]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold font-heading text-white leading-tight">
                  ระบบแจ้งเตือนทาง LINE (นักเรียนค้างส่งภาระงาน)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold border border-white/30 hidden sm:inline-block">
                  LINE Auto Reminder
                </span>
              </div>
              <p className="text-xs text-emerald-50 font-light truncate max-w-xl">
                ภาระงาน: {currentAssignment.title} (คะแนนเต็ม {currentAssignment.maxScore || 10} คะแนน)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer shrink-0"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Assignment Switcher Header Bar */}
        {assignments && assignments.length > 1 && (
          <div className="bg-emerald-900/95 text-white px-5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-emerald-600/40">
            <div className="flex items-center gap-2 shrink-0">
              <FolderOpen className="w-4 h-4 text-emerald-300" />
              <span className="font-bold text-xs text-emerald-100">สลับภาระงาน:</span>
            </div>
            <div className="flex-1 max-w-lg">
              <select
                value={currentAssignment.id}
                onChange={(e) => {
                  const newId = e.target.value;
                  setActiveAssignmentId(newId);
                  const found = assignments.find((a) => a.id === newId);
                  if (found && onSelectAssignment) {
                    onSelectAssignment(found);
                  }
                }}
                className="w-full bg-white text-gray-900 font-bold text-xs rounded-xl px-3 py-1.5 border border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 shadow-xs cursor-pointer truncate"
              >
                {assignments.map((a) => {
                  const cnt = submissions.filter((s) => s.assignmentId === a.id).length;
                  return (
                    <option key={a.id} value={a.id}>
                      {a.title} ({a.maxScore || 10} คะแนน) — [ส่งแล้ว {cnt} คน]
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-gray-800 text-xs">
          
          {/* 1. Classroom Selection Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <School className="w-4 h-4 text-emerald-600" />
                <span>เลือกห้องเรียนที่ต้องการแจ้งเตือน:</span>
              </span>
              <span className="text-[11px] text-gray-400">
                เปิดสอน {targetRooms.length} ห้อง
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
              <button
                type="button"
                onClick={() => setSelectedRoom("all")}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border text-xs ${
                  selectedRoom === "all"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-white text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 border-gray-200"
                }`}
              >
                <span>ทุกห้องเรียน</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  selectedRoom === "all" ? "bg-white/25 text-white" : "bg-gray-100 text-gray-600"
                }`}>
                  {Object.values(missingCountByRoom).reduce((a, b) => a + b, 0)} ค้าง
                </span>
              </button>

              {targetRooms.map((room) => {
                const missing = missingCountByRoom[room] ?? 0;
                const isSelected = selectedRoom === room;
                return (
                  <button
                    key={room}
                    type="button"
                    onClick={() => setSelectedRoom(room)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border text-xs ${
                      isSelected
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-white text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 border-gray-200"
                    }`}
                  >
                    <span>{room}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                        isSelected
                          ? "bg-white/25 text-white"
                          : missing > 0
                          ? "bg-red-50 text-red-600 border border-red-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {missing > 0 ? `${missing} คน` : "ครบ"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Progress Bento Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">นักเรียนทั้งหมด</span>
              <span className="text-lg font-black font-heading text-gray-900 block mt-0.5">
                {roomStudents.length} คน
              </span>
              <span className="text-[10px] text-gray-500 block">
                {selectedRoom === "all" ? "รวมทุกห้องที่มอบหมาย" : `ห้อง ${selectedRoom}`}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-100">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>ส่งงานแล้ว</span>
              </span>
              <span className="text-lg font-black font-heading text-emerald-800 block mt-0.5">
                {submittedStudents.length} คน
              </span>
              <span className="text-[10px] text-emerald-600 block">
                คิดเป็น {roomStudents.length > 0 ? Math.round((submittedStudents.length / roomStudents.length) * 100) : 0}%
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-red-50/80 border border-red-100">
              <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-red-600" />
                <span>ยังไม่ส่งงาน</span>
              </span>
              <span className="text-lg font-black font-heading text-red-800 block mt-0.5">
                {unsubmittedStudents.length} คน
              </span>
              <span className="text-[10px] text-red-600 block">
                ต้องติดตามส่งข้อความ
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-100/40 border border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block flex items-center gap-1">
                <MessageCircle className="w-3 h-3 text-emerald-600" />
                <span>เลือกส่งแจ้งเตือน</span>
              </span>
              <span className="text-lg font-black font-heading text-emerald-900 block mt-0.5">
                {selectedStudentIds.size} คน
              </span>
              <span className="text-[10px] text-emerald-700 block">
                พร้อมใส่ในข้อความ LINE
              </span>
            </div>
          </div>

          {/* 3. Main Split View: Left List of Missing Students | Right Live Preview Box */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Left: Unsubmitted Students Checklist (5 cols) */}
            <div className="lg:col-span-5 flex flex-col rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-2xs">
              <div className="p-3 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between gap-2">
                <span className="font-bold text-gray-800 text-xs flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-red-500" />
                  <span>รายชื่อนักเรียนค้างส่ง ({unsubmittedStudents.length} คน)</span>
                </span>

                <div className="flex items-center gap-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => handleSelectAll(true)}
                    className="text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    เลือกทั้งหมด
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={() => handleSelectAll(false)}
                    className="text-gray-500 font-medium hover:underline cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>

              {/* Search Box */}
              <div className="p-2 border-b border-gray-100">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="ค้นหาชื่อ, เลขที่ หรือรหัส..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Student Checklist Scroll Area */}
              <div className="flex-1 overflow-y-auto max-h-[300px] p-2 space-y-1 divide-y divide-gray-50">
                {filteredUnsubmitted.length === 0 ? (
                  <div className="py-8 text-center text-gray-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
                    <p className="font-semibold text-xs text-gray-700">ส่งงานครบทุกคนแล้ว!</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">ไม่มีรายชื่อนักเรียนค้างส่งในกลุ่มนี้</p>
                  </div>
                ) : (
                  filteredUnsubmitted.map((st) => {
                    const isChecked = selectedStudentIds.has(st.id);
                    return (
                      <label
                        key={st.id}
                        className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${
                          isChecked ? "bg-emerald-50/50 hover:bg-emerald-50" : "hover:bg-gray-50 opacity-60"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleStudent(st.id)}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 cursor-pointer"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-gray-900 truncate">
                                {st.studentNumber ? `เลขที่ ${st.studentNumber}` : ""} {st.name}
                              </span>
                            </div>
                            <div className="text-[10px] text-gray-400">
                              รหัส {st.id} • ห้อง {st.classroom}
                            </div>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[10px] font-bold border border-red-200 shrink-0">
                          ค้างส่ง
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right: Live Preview Box & Options (7 cols) */}
            <div className="lg:col-span-7 flex flex-col space-y-3">
              
              {/* Customizable Deadline & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>กำหนดเวลาส่ง (Deadline):</span>
                  </label>
                  <input
                    type="text"
                    value={customDeadline}
                    onChange={(e) => setCustomDeadline(e.target.value)}
                    placeholder="เช่น ภายในวันนี้ เวลา 20:00 น."
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-emerald-500 bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>ข้อความเพิ่มเติมจากครู:</span>
                  </label>
                  <input
                    type="text"
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="เช่น แนบภาพผลงานให้เรียบร้อย"
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-emerald-500 bg-white"
                  />
                </div>
              </div>

              {/* LINE Live Chat Bubble Preview */}
              <div className="flex-1 flex flex-col rounded-2xl border border-emerald-200 bg-[#849EB5]/10 p-3.5 relative overflow-hidden">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200/60">
                  <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-[#06C755] fill-[#06C755]" />
                    <span>ตัวอย่างข้อความแจ้งเตือนใน LINE (Live Preview)</span>
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">
                    {lineMessage.length} ตัวอักษร
                  </span>
                </div>

                {/* Simulated LINE Chat Bubble */}
                <div className="bg-white rounded-2xl rounded-tl-sm p-4 border border-emerald-100 shadow-xs font-sans text-xs text-gray-800 leading-relaxed overflow-y-auto max-h-[260px] whitespace-pre-wrap select-text selection:bg-emerald-100">
                  {lineMessage}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleExportUnsubmittedExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs shadow-2xs hover:shadow-xs transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>ดาวน์โหลด Excel รายชื่อค้างส่ง</span>
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopyMessage}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-gray-100 text-gray-800 font-bold text-xs border border-gray-300 shadow-2xs transition-all cursor-pointer active:scale-95"
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">คัดลอกเรียบร้อย!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-gray-600" />
                  <span>คัดลอกข้อความ LINE</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleShareToLine}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white font-bold text-xs shadow-md shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>ส่งเข้ากลุ่ม LINE ทันที</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

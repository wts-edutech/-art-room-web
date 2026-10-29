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
  BookOpen
} from "lucide-react";
import * as XLSX from "xlsx";

export interface StudentRecord {
  id: string;
  name: string;
  classroom: string;
  gradeLevel?: string;
  studentNumber?: number;
}

export interface QuizItem {
  id: string;
  code: string;
  title: string;
  gradeLevel: string;
  description?: string;
  totalQuestions: number;
  maxScore: number;
  timeLimitMinutes?: number;
  targetClassrooms?: string[];
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  studentName: string;
  classroom: string;
  score: number;
  totalQuestions: number;
  submittedAt: string;
}

interface QuizLineReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: QuizItem | null;
  attempts: QuizAttempt[];
  students: StudentRecord[];
  initialRoom?: string;
}

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

export default function QuizLineReminderModal({
  isOpen,
  onClose,
  quiz,
  attempts,
  students,
  initialRoom = "all",
}: QuizLineReminderModalProps) {
  if (!isOpen || !quiz) return null;

  // Available target rooms for this quiz
  const targetRooms = useMemo(() => {
    if (quiz.targetClassrooms && quiz.targetClassrooms.length > 0) {
      return quiz.targetClassrooms;
    }
    // Default 14 rooms for the grade
    const grade = quiz.gradeLevel || "ม.4";
    return Array.from({ length: 14 }, (_, i) => `${grade}/${i + 1}`);
  }, [quiz]);

  const [selectedRoom, setSelectedRoom] = useState<string>(
    initialRoom && initialRoom !== "all" && targetRooms.some(r => isRoomMatch(r, initialRoom))
      ? initialRoom
      : targetRooms[0] || "all"
  );

  const [customDeadline, setCustomDeadline] = useState<string>("ภายในวันนี้ เวลา 20:00 น.");
  const [customNote, setCustomNote] = useState<string>("กรุณาเข้าทำแบบทดสอบให้เรียบร้อยเพื่อบันทึกคะแนนเก็บและประเมินผลการเรียนรู้");
  const [studentSearch, setStudentSearch] = useState<string>("");
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());

  // Filter students by selected room
  const roomStudents = useMemo(() => {
    return students.filter((s) => {
      if (selectedRoom === "all") {
        return targetRooms.some((r) => isRoomMatch(s.classroom, r));
      }
      return isRoomMatch(s.classroom, selectedRoom);
    }).sort((a, b) => {
      const roomCompare = a.classroom.localeCompare(b.classroom, undefined, { numeric: true });
      if (roomCompare !== 0) return roomCompare;
      if (a.studentNumber && b.studentNumber) return a.studentNumber - b.studentNumber;
      return a.id.localeCompare(b.id, undefined, { numeric: true });
    });
  }, [students, selectedRoom, targetRooms]);

  // Set of submitted student IDs for this quiz in this room
  const submittedIds = useMemo(() => {
    const set = new Set<string>();
    attempts.forEach((att) => {
      if (att.quizId === quiz.id) {
        if (selectedRoom === "all" || isRoomMatch(att.classroom, selectedRoom)) {
          set.add(att.studentId.trim());
        }
      }
    });
    return set;
  }, [attempts, quiz.id, selectedRoom]);

  // Unsubmitted students list
  const unsubmittedStudents = useMemo(() => {
    return roomStudents.filter((s) => !submittedIds.has(s.id.trim()));
  }, [roomStudents, submittedIds]);

  // Submitted students list
  const submittedStudents = useMemo(() => {
    return roomStudents.filter((s) => submittedIds.has(s.id.trim()));
  }, [roomStudents, submittedIds]);

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
    targetRooms.forEach((room) => {
      const enrolled = students.filter((s) => isRoomMatch(s.classroom, room));
      const submitted = new Set(
        attempts.filter((a) => a.quizId === quiz.id && isRoomMatch(a.classroom, room)).map((a) => a.studentId.trim())
      );
      const missing = enrolled.filter((s) => !submitted.has(s.id.trim())).length;
      counts[room] = missing;
    });
    return counts;
  }, [targetRooms, students, attempts, quiz.id]);

  // Active students to be included in the LINE message
  const activeUnsubmittedList = useMemo(() => {
    return unsubmittedStudents.filter((s) => selectedStudentIds.has(s.id));
  }, [unsubmittedStudents, selectedStudentIds]);

  // Generate LINE Message text
  const lineMessage = useMemo(() => {
    const roomTitle = selectedRoom === "all" ? `ทุกห้อง (${targetRooms.join(", ")})` : `ห้อง ${selectedRoom}`;
    const quizTitle = `${quiz.gradeLevel} (${quiz.code}): ${quiz.title}`;

    let studentListStr = "";
    if (activeUnsubmittedList.length === 0) {
      studentListStr = "🎉 ยอดเยี่ยมมาก! ทุกคนทำแบบทดสอบครบแล้ว 100%";
    } else {
      // Group by room if "all"
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

    const totalInClass = roomStudents.length;
    const doneCount = submittedStudents.length;
    const pendingCount = activeUnsubmittedList.length;
    const percentDone = totalInClass > 0 ? Math.round((doneCount / totalInClass) * 100) : 0;

    return `📢 [แจ้งเตือน] นักเรียนที่ยังไม่ทำแบบทดสอบก่อนเรียน
🎨 รายวิชาศิลปะ (ทัศนศิลป์) ${quiz.code || ""}
📝 แบบทดสอบ: ${quizTitle}
🏫 ระดับชั้น: ${roomTitle}

📊 สรุปภาพรวมห้องเรียน:
• ส่งแล้ว: ${doneCount} / ${totalInClass} คน (${percentDone}%)
• ค้างทำ: ${pendingCount} คน

⚠️ รายชื่อนักเรียนที่ค้างทำแบบทดสอบ (${pendingCount} คน):
${studentListStr}

👉 เข้าทำแบบทดสอบได้ทันทีที่เว็บไซต์ Art Room:
🔗 https://artroom-wts.com/submissions

⏰ กำหนดเวลา: ${customDeadline}
${customNote ? `💬 ข้อความจากครูผู้สอน: ${customNote}\n` : ""}
ขอบคุณนักเรียนทุกคนที่ให้ความร่วมมือค่ะ/ครับ 🙏✨`;
  }, [
    quiz,
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
    if (activeUnsubmittedList.length === 0) {
      alert("ไม่มีรายชื่อนักเรียนค้างส่งที่เลือก");
      return;
    }

    const rows = activeUnsubmittedList.map((s, idx) => ({
      "ลำดับ": idx + 1,
      "เลขที่": s.studentNumber || "-",
      "รหัสนักเรียน": s.id,
      "ชื่อ-นามสกุล": s.name,
      "ห้องเรียน": s.classroom,
      "ระดับชั้น": quiz.gradeLevel,
      "รหัสวิชา": quiz.code,
      "แบบทดสอบ": quiz.title,
      "สถานะ": "ยังไม่ทำแบบทดสอบ (ค้างส่ง)"
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "รายชื่อค้างทำแบบทดสอบ");
    const roomSlug = selectedRoom === "all" ? "รวมทุกห้อง" : selectedRoom.replace("/", "_");
    XLSX.writeFile(workbook, `นักเรียนค้างทำแบบทดสอบ_${quiz.code}_${roomSlug}_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

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
                  ระบบแจ้งเตือนทาง LINE (นักเรียนค้างทำแบบทดสอบ)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold border border-white/30 hidden sm:inline-block">
                  LINE Auto Reminder
                </span>
              </div>
              <p className="text-xs text-emerald-50 font-light truncate max-w-xl">
                {quiz.gradeLevel} ({quiz.code}): {quiz.title}
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
                {selectedRoom === "all" ? "รวมทุกห้องที่เปิดสอบ" : `ห้อง ${selectedRoom}`}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-100">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>ทำแบบทดสอบแล้ว</span>
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
                <span>ยังไม่ทำแบบทดสอบ</span>
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
                  <span>รายชื่อนักเรียนค้างทำ ({unsubmittedStudents.length} คน)</span>
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

              {/* Filter Search */}
              <div className="p-2.5 border-b border-gray-100 bg-white">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="ค้นหาชื่อ, เลขที่ หรือรหัส..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Scrollable Checklist */}
              <div className="flex-1 overflow-y-auto max-h-[280px] p-2 space-y-1 divide-y divide-gray-50 scrollbar-thin">
                {filteredUnsubmitted.length === 0 ? (
                  <div className="py-12 text-center text-gray-400">
                    {unsubmittedStudents.length === 0 ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <p className="font-bold text-gray-700">ไม่มีนักเรียนค้างทำแบบทดสอบ!</p>
                        <p className="text-[11px] text-gray-400">ห้องเรียนนี้ทุกคนส่งงานครบถ้วน 100%</p>
                      </div>
                    ) : (
                      "ไม่พบข้อมูลนักเรียนที่ค้นหา"
                    )}
                  </div>
                ) : (
                  filteredUnsubmitted.map((s) => {
                    const isChecked = selectedStudentIds.has(s.id);
                    return (
                      <label
                        key={s.id}
                        onClick={() => handleToggleStudent(s.id)}
                        className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
                          isChecked ? "bg-red-50/60 text-gray-900 font-medium" : "hover:bg-gray-50 text-gray-500 opacity-60"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // handled by parent label onClick
                            className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer w-3.5 h-3.5"
                          />
                          <div className="truncate">
                            <div className="flex items-center gap-1.5">
                              {s.studentNumber && (
                                <span className="font-mono font-bold text-[10px] px-1.5 py-0.2 rounded-md bg-white border border-gray-200 text-gray-700">
                                  เลขที่ {s.studentNumber}
                                </span>
                              )}
                              <span className="font-bold text-xs truncate">{s.name}</span>
                            </div>
                            <span className="text-[10px] text-gray-400 block font-mono">
                              รหัส {s.id} • ห้อง {s.classroom}
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold text-red-600 bg-red-100/60 px-2 py-0.5 rounded-full shrink-0">
                          ค้างทำ
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right: Live Preview & Customizer (7 cols) */}
            <div className="lg:col-span-7 flex flex-col space-y-3.5">
              
              {/* Optional Customizer Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-600" />
                    <span>กำหนดเวลาส่ง (Deadline):</span>
                  </label>
                  <input
                    type="text"
                    value={customDeadline}
                    onChange={(e) => setCustomDeadline(e.target.value)}
                    placeholder="เช่น ภายในวันนี้ 20:00 น."
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-emerald-500 bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>ข้อความเพิ่มเติมจากครู:</span>
                  </label>
                  <input
                    type="text"
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="เช่น เพื่อนำไปบันทึกคะแนนเก็บ..."
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-emerald-500 bg-white"
                  />
                </div>
              </div>

              {/* Preview Box */}
              <div className="flex-1 flex flex-col rounded-2xl border border-emerald-200 bg-[#F6FDF9] overflow-hidden shadow-2xs">
                <div className="px-3.5 py-2.5 bg-emerald-100/60 border-b border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-950 text-xs">
                    <MessageCircle className="w-3.5 h-3.5 text-[#06C755] fill-[#06C755]" />
                    <span>ตัวอย่างข้อความแจ้งเตือนใน LINE (Live Preview)</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-mono">
                    {lineMessage.length} ตัวอักษร
                  </span>
                </div>

                <div className="p-3.5 flex-1 font-sans">
                  <textarea
                    readOnly
                    value={lineMessage}
                    rows={10}
                    className="w-full h-full min-h-[220px] bg-white border border-emerald-100 rounded-xl p-3 text-xs leading-relaxed text-gray-800 font-mono resize-none focus:outline-none shadow-2xs"
                  />
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="px-5 py-4 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          
          <button
            type="button"
            onClick={handleExportUnsubmittedExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            title="ส่งออกเฉพาะรายชื่อนักเรียนค้างส่งออกเป็นไฟล์ Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>ดาวน์โหลด Excel รายชื่อค้างส่ง</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyMessage}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer border ${
                isCopied
                  ? "bg-emerald-600 text-white border-emerald-600 scale-105"
                  : "bg-white text-gray-800 hover:bg-emerald-50 hover:text-emerald-800 border-gray-300"
              }`}
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>คัดลอกสำเร็จแล้ว!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-gray-500" />
                  <span>คัดลอกข้อความ LINE</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleShareToLine}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white text-xs font-black shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
              title="เปิดแอป LINE ทันทีเพื่อส่งข้อความนี้เข้ากลุ่มนักเรียน"
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

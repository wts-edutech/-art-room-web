"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { 
  Trash2, 
  Plus, 
  Users, 
  Search, 
  Upload, 
  AlertTriangle, 
  Clock, 
  FileSpreadsheet, 
  Eye, 
  EyeOff,
  RotateCcw, 
  CheckCircle2, 
  X, 
  Key, 
  BookOpen, 
  FileText,
  Filter,
  Check,
  ShieldCheck,
  Award,
  Star,
  LayoutGrid,
  List,
  ChevronRight,
  Sparkles,
  Globe,
  ExternalLink,
  Palette,
  Layers,
  Copy
} from "lucide-react";
import * as XLSX from "xlsx";

interface StudentData {
  id: string;
  name: string;
  classroom: string;
  gradeLevel?: string;
  studentNumber?: number | null;
  loginCount: number;
  lastLoginAt: string | null;
  submissionsCount: number;
  quizzesCount: number;
  lastActiveAt: string | null;
  password?: string | null;
}

interface AssignmentData {
  id: string;
  title: string;
  description?: string;
  classrooms?: string | string[] | null;
  dueDate?: string | null;
  maxScore?: number | null;
  isActive?: boolean | number;
}

interface QuizData {
  id: string;
  title: string;
  gradeLevel?: string | null;
  targetClassrooms?: string | string[] | null;
  isActive?: boolean | number;
  totalQuestions?: number;
  maxScore?: number;
}

function formatThaiDateTime(isoStr?: string | null) {
  if (!isoStr) return "ยังไม่เคยเข้าใช้งาน";
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    return d.toLocaleDateString("th-TH", {
      year: "2-digit",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }) + " น.";
  } catch {
    return isoStr;
  }
}

// Natural Classroom Sorting: ม.1/1 < ม.1/2 < ... < ม.1/14 < ม.2/1 < ... < ม.6/13
export function compareClassrooms(roomA?: string | null, roomB?: string | null): number {
  if (!roomA && !roomB) return 0;
  if (!roomA) return 1;
  if (!roomB) return -1;
  const cleanA = String(roomA).replace(/^ห้อง\s*/, "").trim();
  const cleanB = String(roomB).replace(/^ห้อง\s*/, "").trim();
  const matchA = cleanA.match(/(\d+)\/(\d+)/);
  const matchB = cleanB.match(/(\d+)\/(\d+)/);
  if (matchA && matchB) {
    const gradeA = parseInt(matchA[1], 10);
    const gradeB = parseInt(matchB[1], 10);
    if (gradeA !== gradeB) return gradeA - gradeB;
    const roomNumA = parseInt(matchA[2], 10);
    const roomNumB = parseInt(matchB[2], 10);
    return roomNumA - roomNumB;
  }
  return cleanA.localeCompare(cleanB, "th", { numeric: true });
}

// Default teaching classrooms based on assignments
const DEFAULT_TEACHING_ROOMS = [
  "ม.3/1", "ม.3/2", "ม.4/1", "ม.4/2", "ม.4/6", "ม.4/11",
  "ม.1/1", "ม.1/2", "ม.1/6", "ม.1/8", "ม.1/10", "ม.1/14"
];

export default function StudentsTab() {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [assignments, setAssignments] = useState<AssignmentData[]>([]);
  const [quizzes, setQuizzes] = useState<QuizData[]>([]);
  
  // Single Student Input States & Collapsible Form
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [studentIdInput, setStudentIdInput] = useState("");
  const [studentNameInput, setStudentNameInput] = useState("");
  const [studentClassroomInput, setStudentClassroomInput] = useState("");
  const [studentNumberInput, setStudentNumberInput] = useState("");
  
  // Search & Filter States
  const [searchStudentInput, setSearchStudentInput] = useState("");
  const [activeGradeTab, setActiveGradeTab] = useState<string>("teaching"); // 'teaching', 'all', 'ม.1', 'ม.2', 'ม.3', 'ม.4', 'ม.5', 'ม.6'
  const [selectedRoomFilter, setSelectedRoomFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all"); // 'all', 'active', 'inactive', 'has_submissions', 'has_quizzes'
  const [sortBy, setSortBy] = useState<"room_seat" | "seat" | "id" | "logins" | "lastLogin">("room_seat");
  const [viewMode, setViewMode] = useState<"table" | "room_grid">("table");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Teaching Rooms (starred)
  const [teachingRooms, setTeachingRooms] = useState<string[]>(DEFAULT_TEACHING_ROOMS);
  // Fold / collapse classrooms that the teacher does not teach (default: true)
  const [hideNonTeachingRooms, setHideNonTeachingRooms] = useState<boolean>(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("wts_teaching_classrooms");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTeachingRooms(parsed);
        }
      }
      const savedHide = localStorage.getItem("wts_hide_non_teaching");
      if (savedHide !== null) {
        setHideNonTeachingRooms(savedHide === "true");
      }
    } catch (e) {
      console.error("Failed to load teaching rooms from localStorage", e);
    }
  }, []);

  const toggleHideNonTeaching = () => {
    setHideNonTeachingRooms((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("wts_hide_non_teaching", String(next));
      } catch (e) {}
      return next;
    });
  };

  const toggleTeachingRoom = (room: string) => {
    setTeachingRooms((prev) => {
      const cleanRoom = room.replace(/^ห้อง\s*/, "").trim();
      const exists = prev.includes(cleanRoom);
      const next = exists ? prev.filter((r) => r !== cleanRoom) : [...prev, cleanRoom];
      try {
        localStorage.setItem("wts_teaching_classrooms", JSON.stringify(next));
      } catch (e) {
        console.error("Failed to save teaching rooms", e);
      }
      return next;
    });
  };

  const [isLoading, setIsLoading] = useState(true);

  // Student Detail Modal State
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [studentDetails, setStudentDetails] = useState<{
    submissions: any[];
    quizzes: any[];
    isLoading: boolean;
  }>({
    submissions: [],
    quizzes: [],
    isLoading: false,
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [resStud, resAss, resQuiz] = await Promise.all([
        fetch("/api/students"),
        fetch("/api/assignments"),
        fetch("/api/quizzes"),
      ]);
      const [dataStud, dataAss, dataQuiz] = await Promise.all([
        resStud.ok ? resStud.json().catch(() => []) : [],
        resAss.ok ? resAss.json().catch(() => []) : [],
        resQuiz.ok ? resQuiz.json().catch(() => []) : [],
      ]);
      setStudents(Array.isArray(dataStud) ? dataStud : []);
      setAssignments(Array.isArray(dataAss) ? dataAss : []);
      setQuizzes(Array.isArray(dataQuiz) ? dataQuiz : []);
    } catch (error) {
      console.error("Failed to fetch students data:", error);
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helpers for Frontend Linkage
  const getAssignmentsForRoom = (room: string) => {
    const cleanRoom = room.replace(/^ห้อง\s*/, "").trim();
    return assignments.filter((a) => {
      if (!a.classrooms) return true; // targeted to all rooms
      try {
        const parsed = typeof a.classrooms === "string" ? JSON.parse(a.classrooms) : a.classrooms;
        if (Array.isArray(parsed)) {
          if (parsed.length === 0) return true;
          return parsed.some((r) => String(r).replace(/^ห้อง\s*/, "").trim() === cleanRoom);
        }
      } catch {
        return String(a.classrooms).includes(cleanRoom);
      }
      return false;
    });
  };

  const getQuizzesForRoom = (room: string) => {
    const cleanRoom = room.replace(/^ห้อง\s*/, "").trim();
    const gradeMatch = cleanRoom.match(/^ม\.?(\d+)/);
    const grade = gradeMatch ? `ม.${gradeMatch[1]}` : "";

    return quizzes.filter((q) => {
      if (q.gradeLevel && grade && q.gradeLevel !== grade) return false;
      if (q.targetClassrooms) {
        try {
          const parsed = typeof q.targetClassrooms === "string" ? JSON.parse(q.targetClassrooms) : q.targetClassrooms;
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.some((r) => String(r).replace(/^ห้อง\s*/, "").trim() === cleanRoom);
          }
        } catch {}
      }
      return true;
    });
  };

  // Open Student Detail Modal
  const handleOpenStudentDetail = async (student: StudentData) => {
    setSelectedStudent(student);
    setStudentDetails({ submissions: [], quizzes: [], isLoading: true });

    try {
      const [resSub, resQuiz] = await Promise.all([
        fetch(`/api/submissions?studentId=${encodeURIComponent(student.id)}`),
        fetch(`/api/quizzes/attempts?studentId=${encodeURIComponent(student.id)}`),
      ]);

      const [dataSub, dataQuiz] = await Promise.all([
        resSub.ok ? resSub.json().catch(() => []) : [],
        resQuiz.ok ? resQuiz.json().catch(() => []) : [],
      ]);

      setStudentDetails({
        submissions: Array.isArray(dataSub) ? dataSub : [],
        quizzes: Array.isArray(dataQuiz) ? dataQuiz : [],
        isLoading: false,
      });
    } catch (err) {
      console.error("Error fetching student details:", err);
      setStudentDetails({ submissions: [], quizzes: [], isLoading: false });
    }
  };

  // Reset Student Password
  const handleResetPassword = async (studentId: string, studentName: string) => {
    const defaultPassword = `${studentId}@wts`;
    const confirmMsg = `ยืนยันการรีเซ็ตรหัสผ่านของนักเรียน:\n${studentName} (รหัส ${studentId})\n\nรหัสผ่านจะถูกรีเซ็ตกลับเป็นค่าเริ่มต้นคือ "${defaultPassword}"\nนักเรียนจะสามารถเข้าสู่ระบบด้วยรหัสดังกล่าวได้ทันที`;
    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch("/api/students", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: studentId,
          action: "resetPassword",
        }),
      });

      if (res.ok) {
        setStudents((prev) =>
          prev.map((s) => (s.id === studentId ? { ...s, password: null } : s))
        );
        setSelectedStudent((prev) =>
          prev && prev.id === studentId ? { ...prev, password: null } : prev
        );
        try {
          await navigator.clipboard.writeText(defaultPassword);
          setCopiedId(studentId);
          setTimeout(() => setCopiedId(null), 2500);
          alert(`รีเซ็ตรหัสผ่านของ ${studentName} สำเร็จ!\nรหัสผ่านเริ่มต้น: ${defaultPassword}\n(คัดลอกรหัสผ่านลงคลิปบอร์ดแล้ว พร้อมส่งให้นักเรียน)`);
        } catch {
          alert(`รีเซ็ตรหัสผ่านของ ${studentName} สำเร็จ!\nรหัสผ่านเริ่มต้นคือ: ${defaultPassword}`);
        }
      } else {
        const err = await res.json();
        alert(err.error || "ไม่สามารถรีเซ็ตรหัสผ่านได้");
      }
    } catch (err) {
      console.error("Failed to reset password:", err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  // Copy Default Password to Clipboard
  const handleCopyDefaultPassword = async (studentId: string) => {
    const defaultPwd = `${studentId}@wts`;
    try {
      await navigator.clipboard.writeText(defaultPwd);
      setCopiedId(studentId);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      prompt("คัดลอกรหัสผ่านเริ่มต้นของนักเรียน:", defaultPwd);
    }
  };

  // Add Single Student
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentIdInput || !studentNameInput) return;
    
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: studentIdInput, 
          name: studentNameInput,
          classroom: studentClassroomInput,
          studentNumber: studentNumberInput ? Number(studentNumberInput) : null,
        })
      });
      
      if (res.ok) {
        setStudentIdInput("");
        setStudentNameInput("");
        setStudentClassroomInput("");
        setStudentNumberInput("");
        fetchData();
        alert("เพิ่มนักเรียนสำเร็จ!");
      } else {
        const data = await res.json();
        alert(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error("Failed to add student", error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  // Delete Single Student
  const handleDeleteStudent = async (id: string, name: string) => {
    if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบนักเรียน:\n${name} (รหัส ${id}) ออกจากระบบ?`)) return;
    try {
      const res = await fetch(`/api/students?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      } else {
        alert("ไม่สามารถลบนักเรียนได้");
      }
    } catch (error) {
      console.error("Failed to delete student", error);
    }
  };

  // Delete All Students
  const handleDeleteAllStudents = async () => {
    const confirmation = prompt('คำเตือน: การกระทำนี้จะลบรายชื่อนักเรียนทั้งหมด! พิมพ์ "ยืนยันการลบ" เพื่อดำเนินการต่อ');
    if (confirmation !== 'ยืนยันการลบ') {
      if (confirmation !== null) alert("ยกเลิกการลบข้อมูลแล้ว");
      return;
    }
    
    try {
      const res = await fetch(`/api/students?action=deleteAll`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
        alert("ลบรายชื่อนักเรียนทั้งหมดเรียบร้อยแล้ว");
      } else {
        alert("ไม่สามารถลบข้อมูลได้");
      }
    } catch (error) {
      console.error("Failed to delete all students", error);
    }
  };

  // Upload Excel/CSV
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || file.type === "application/vnd.ms-excel" || file.type === "text/csv") {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const arrayBuffer = event.target?.result;
            if (!arrayBuffer) return;
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet) as any[];
            
            let addedCount = 0;
            for (const row of json) {
              if (!row.id || !row.name) continue;
              const formData = new FormData();
              formData.append("id", String(row.id));
              formData.append("name", String(row.name));
              const roomVal = row.classroom || row.room || row['ห้อง'] || row['ห้องเรียน'] || row['ชั้น/ห้อง'] || '';
              if (roomVal) formData.append("classroom", String(roomVal));
              const numVal = row.studentNumber || row.number || row['เลขที่'] || row['ลำดับ'] || row['no'] || row['seat_no'] || '';
              if (numVal) formData.append("studentNumber", String(numVal));
              
              await fetch("/api/students", {
                method: "POST",
                body: formData,
              });
              addedCount++;
            }
            
            alert(`เพิ่มนักเรียนจากไฟล์สำเร็จ ${addedCount} คน`);
            fetchData();
            e.target.value = "";
          } catch (error) {
            console.error("Error parsing Excel:", error);
            alert("เกิดข้อผิดพลาดในการอ่านไฟล์");
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        alert("รองรับเฉพาะไฟล์ .xlsx และ .xls และ .csv เท่านั้น");
        e.target.value = "";
      }
    }
  };

  // Export Filtered Students with Usage Stats to Excel
  const handleExportExcel = (specificRoom?: string) => {
    let exportList = filteredStudents;
    let roomLabel = "นักเรียนทั้งหมด";

    if (specificRoom) {
      const cleanTarget = specificRoom.replace(/^ห้อง\s*/, "").trim();
      exportList = students.filter(
        (s) => String(s.classroom || "").replace(/^ห้อง\s*/, "").trim() === cleanTarget
      );
      exportList.sort((a, b) => (a.studentNumber ?? 999) - (b.studentNumber ?? 999));
      roomLabel = `ห้อง_${cleanTarget.replace(/[\/\\:]/g, "-")}`;
    } else if (selectedRoomFilter !== "all") {
      roomLabel = `ห้อง_${selectedRoomFilter.replace(/[\/\\:]/g, "-")}`;
    } else if (activeGradeTab === "teaching") {
      roomLabel = "ห้องที่ครูสอน";
    } else if (activeGradeTab !== "all") {
      roomLabel = `ระดับชั้น_${activeGradeTab}`;
    }

    if (exportList.length === 0) {
      alert("ไม่มีข้อมูลสำหรับการส่งออก Excel");
      return;
    }

    const rows = exportList.map((s, idx) => ({
      "ลำดับ": idx + 1,
      "เลขที่": s.studentNumber ?? "-",
      "รหัสนักเรียน": s.id,
      "ห้องเรียน": s.classroom || "-",
      "ชื่อ - นามสกุล": s.name,
      "จำนวนครั้งที่เข้าใช้": s.loginCount || 0,
      "เวลาที่เข้าใช้งานล่าสุด": s.lastLoginAt ? formatThaiDateTime(s.lastLoginAt) : "ยังไม่เคยเข้าใช้งาน",
      "ส่งงานแล้ว (ชิ้น)": s.submissionsCount || 0,
      "ทำแบบทดสอบแล้ว (ชุด)": s.quizzesCount || 0,
      "สถานะการเข้าใช้งาน": (s.loginCount || 0) > 0 ? "เคยเข้าใช้งานแล้ว" : "ยังไม่เคยเข้าใช้งาน",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, roomLabel.slice(0, 31));
    XLSX.writeFile(workbook, `สถิตินักเรียน_${roomLabel}_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  // Extract all unique classrooms sorted naturally
  const uniqueClassrooms = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.classroom) set.add(String(s.classroom).trim());
    });
    return Array.from(set).sort(compareClassrooms);
  }, [students]);

  // Classroom Statistics Map (for Room Summary & Cards)
  const roomStatsMap = useMemo(() => {
    const map: Record<string, {
      classroom: string;
      total: number;
      active: number;
      inactive: number;
      totalLogins: number;
      withSubs: number;
      withQuizzes: number;
      activePct: number;
    }> = {};

    students.forEach((s) => {
      const r = String(s.classroom || "ไม่ระบุห้อง").replace(/^ห้อง\s*/, "").trim();
      if (!map[r]) {
        map[r] = {
          classroom: r,
          total: 0,
          active: 0,
          inactive: 0,
          totalLogins: 0,
          withSubs: 0,
          withQuizzes: 0,
          activePct: 0,
        };
      }
      map[r].total += 1;
      const logins = s.loginCount || 0;
      if (logins > 0) {
        map[r].active += 1;
        map[r].totalLogins += logins;
      } else {
        map[r].inactive += 1;
      }
      if ((s.submissionsCount || 0) > 0) map[r].withSubs += 1;
      if ((s.quizzesCount || 0) > 0) map[r].withQuizzes += 1;
    });

    Object.values(map).forEach((stat) => {
      stat.activePct = stat.total > 0 ? Math.round((stat.active / stat.total) * 100) : 0;
    });

    return map;
  }, [students]);

  // Classrooms belonging to active grade tab
  const gradeFilteredRooms = useMemo(() => {
    if (activeGradeTab === "teaching") {
      return uniqueClassrooms.filter((r) => teachingRooms.includes(r));
    }
    if (activeGradeTab === "all") {
      return uniqueClassrooms;
    }
    return uniqueClassrooms.filter((r) => r.startsWith(activeGradeTab + "/"));
  }, [uniqueClassrooms, activeGradeTab, teachingRooms]);

  // Separate into teaching rooms and other rooms for easy folding/collapsing
  const { teachingRoomsInView, otherRoomsInView } = useMemo(() => {
    const teaching: string[] = [];
    const other: string[] = [];
    gradeFilteredRooms.forEach((r) => {
      if (teachingRooms.includes(r)) {
        teaching.push(r);
      } else {
        other.push(r);
      }
    });
    return { teachingRoomsInView: teaching, otherRoomsInView: other };
  }, [gradeFilteredRooms, teachingRooms]);

  // Overall Usage Statistics KPIs
  const stats = useMemo(() => {
    const total = students.length;
    const active = students.filter((s) => (s.loginCount || 0) > 0).length;
    const inactive = total - active;
    const totalLogins = students.reduce((acc, curr) => acc + (curr.loginCount || 0), 0);
    const withSubs = students.filter((s) => (s.submissionsCount || 0) > 0).length;
    const withQuizzes = students.filter((s) => (s.quizzesCount || 0) > 0).length;
    const activePct = total > 0 ? Math.round((active / total) * 100) : 0;

    return { total, active, inactive, totalLogins, withSubs, withQuizzes, activePct };
  }, [students]);

  // Filtered & Sorted Students
  const filteredStudents = useMemo(() => {
    let list = students.filter((s) => {
      // 1. Search Query (id, name, classroom)
      if (searchStudentInput.trim()) {
        const q = searchStudentInput.toLowerCase().trim();
        const matchId = String(s.id || "").toLowerCase().includes(q);
        const matchName = String(s.name || "").toLowerCase().includes(q);
        const matchRoom = String(s.classroom || "").toLowerCase().includes(q);
        if (!matchId && !matchName && !matchRoom) return false;
      }

      // 2. Classroom Filter
      const studentRoom = String(s.classroom || "").replace(/^ห้อง\s*/, "").trim();
      if (selectedRoomFilter !== "all") {
        const normFilter = selectedRoomFilter.replace(/^ห้อง\s*/, "").trim();
        if (studentRoom !== normFilter) return false;
      } else {
        // If "all" is selected, scope to activeGradeTab
        if (activeGradeTab === "teaching") {
          if (!teachingRooms.includes(studentRoom)) return false;
        } else if (activeGradeTab !== "all") {
          if (!studentRoom.startsWith(activeGradeTab + "/")) return false;
        }
      }

      // 3. Status Filter
      if (selectedStatusFilter === "active" && (s.loginCount || 0) === 0) return false;
      if (selectedStatusFilter === "inactive" && (s.loginCount || 0) > 0) return false;
      if (selectedStatusFilter === "has_submissions" && (s.submissionsCount || 0) === 0) return false;
      if (selectedStatusFilter === "has_quizzes" && (s.quizzesCount || 0) === 0) return false;

      return true;
    });

    // Sorting: Default is "room_seat" (Natural Room Sort, then Seat 1..40)
    list.sort((a, b) => {
      if (sortBy === "room_seat") {
        const roomComp = compareClassrooms(a.classroom, b.classroom);
        if (roomComp !== 0) return roomComp;
        const seatA = a.studentNumber ?? 999;
        const seatB = b.studentNumber ?? 999;
        if (seatA !== seatB) return seatA - seatB;
        return a.id.localeCompare(b.id, "th", { numeric: true });
      }
      if (sortBy === "seat") {
        const seatA = a.studentNumber ?? 999;
        const seatB = b.studentNumber ?? 999;
        if (seatA !== seatB) return seatA - seatB;
        return compareClassrooms(a.classroom, b.classroom);
      }
      if (sortBy === "id") {
        return a.id.localeCompare(b.id, "th", { numeric: true });
      }
      if (sortBy === "logins") {
        return (b.loginCount || 0) - (a.loginCount || 0);
      }
      if (sortBy === "lastLogin") {
        const timeA = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0;
        const timeB = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0;
        return timeB - timeA;
      }
      return 0;
    });

    return list;
  }, [students, searchStudentInput, selectedRoomFilter, activeGradeTab, teachingRooms, selectedStatusFilter, sortBy]);

  return (
    <div className="space-y-6 font-prompt animate-in fade-in duration-200">
      {/* 1. Top Statistics KPI Cards (สถิติการเข้าใช้งานของนักเรียน) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">นักเรียนทั้งหมดในระบบ</p>
            <h4 className="text-2xl font-bold font-kanit text-gray-900 mt-0.5">
              {stats.total.toLocaleString()} คน
            </h4>
          </div>
        </div>

        {/* Active Students (เคยเข้าใช้แล้ว) */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-2xs flex items-center gap-4 bg-emerald-50/20">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs text-emerald-800 font-bold">เข้าใช้งานแล้ว</p>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                {stats.activePct}%
              </span>
            </div>
            <h4 className="text-2xl font-bold font-kanit text-emerald-700 mt-0.5">
              {stats.active.toLocaleString()} คน
            </h4>
          </div>
        </div>

        {/* Inactive Students (ยังไม่เคยเข้าใช้) */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">ยังไม่เคยเข้าใช้งาน</p>
            <h4 className="text-2xl font-bold font-kanit text-gray-700 mt-0.5">
              {stats.inactive.toLocaleString()} คน
            </h4>
          </div>
        </div>

        {/* Total Logins */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">การเข้าใช้งานสะสมรวม</p>
            <h4 className="text-2xl font-bold font-kanit text-blue-900 mt-0.5">
              {stats.totalLogins.toLocaleString()} ครั้ง
            </h4>
          </div>
        </div>
      </div>

      {/* 2. Main Content Section (Full-Width Balanced Layout) */}
      <div className="w-full">
        {/* The Main Student & Classroom Explorer Card (Full Widescreen) */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header with Title, Search, Add Student Button, and View Mode Switcher */}
          <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col md:flex-row items-stretch md:items-center justify-between bg-gray-50/50 gap-3.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-orange-600 shadow-2xs border border-gray-200 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900 font-kanit leading-tight">
                  ฐานข้อมูลและสถิติการเข้าใช้นักเรียน
                </h2>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  แสดง {filteredStudents.length} จาก {students.length} คน
                  {selectedRoomFilter !== "all" 
                    ? ` (ห้อง ${selectedRoomFilter})` 
                    : activeGradeTab === "teaching" 
                    ? " (ห้องที่ครูสอน)" 
                    : activeGradeTab !== "all" 
                    ? ` (${activeGradeTab})` 
                    : " (ทั้งโรงเรียน)"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {/* Search Bar */}
              <div className="relative w-full sm:w-56 md:w-64">
                <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อ, รหัส หรือห้อง..."
                  value={searchStudentInput}
                  onChange={(e) => setSearchStudentInput(e.target.value)}
                  className="w-full h-9 pl-10 pr-8 rounded-xl border border-gray-200 hover:border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none text-xs bg-white shadow-2xs transition-all placeholder:text-gray-400"
                />
                {searchStudentInput && (
                  <button
                    type="button"
                    onClick={() => setSearchStudentInput("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                    title="ล้างคำค้นหา"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Add Student Button (Opens Balanced Modal Dialog) */}
              <button
                type="button"
                onClick={() => setIsAddStudentOpen(true)}
                className="h-9 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20 shrink-0"
                title="เปิดแบบฟอร์มเพิ่มนักเรียนใหม่"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มนักเรียน</span>
              </button>

              {/* View Mode Switcher */}
              <div className="flex items-center p-0.5 rounded-xl bg-gray-200/80 border border-gray-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === "table"
                      ? "bg-white text-orange-600 shadow-2xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  title="มุมมองตารางรายชื่อนักเรียน"
                >
                  <List className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">ตารางรายชื่อ</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("room_grid")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === "room_grid"
                      ? "bg-white text-orange-600 shadow-2xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  title="มุมมองสรุปสถิติรายห้องเรียน"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">สรุปรายห้อง</span>
                </button>
              </div>
            </div>
          </div>

          {/* 1. Grade Level & Category Tabs Bar (Larger, High Readability & Fold Toggle) */}
          <div className="px-5 sm:px-6 py-3 sm:py-3.5 bg-gray-50/80 border-b border-gray-200/80 flex items-center justify-between gap-3 overflow-x-auto text-sm scrollbar-thin">
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              {/* Teaching Classes Tab */}
              <button
                type="button"
                onClick={() => {
                  setActiveGradeTab("teaching");
                  setSelectedRoomFilter("all");
                }}
                className={`h-10 px-4 sm:px-4.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 shadow-2xs ${
                  activeGradeTab === "teaching"
                    ? "bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/25 ring-2 ring-amber-400/40"
                    : "bg-white text-gray-700 hover:bg-amber-50/60 border border-gray-200"
                }`}
              >
                <Star className={`w-4 h-4 ${activeGradeTab === "teaching" ? "fill-white text-white" : "text-amber-500 fill-amber-400"}`} />
                <span>ห้องที่ฉันสอน ({teachingRooms.length})</span>
              </button>

              {/* All Classes Tab */}
              <button
                type="button"
                onClick={() => {
                  setActiveGradeTab("all");
                  setSelectedRoomFilter("all");
                }}
                className={`h-10 px-4 sm:px-4.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                  activeGradeTab === "all"
                    ? "bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/25 ring-2 ring-orange-400/40"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                ทุกระดับชั้น ({uniqueClassrooms.length} ห้อง)
              </button>

              {/* Grade Tabs ม.1 - ม.6 */}
              {["ม.1", "ม.2", "ม.3", "ม.4", "ม.5", "ม.6"].map((g) => {
                const roomCount = uniqueClassrooms.filter((r) => r.startsWith(g + "/")).length;
                const isActive = activeGradeTab === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      setActiveGradeTab(g);
                      setSelectedRoomFilter("all");
                    }}
                    className={`h-10 px-3.5 sm:px-4 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                      isActive
                        ? "bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/25 ring-2 ring-orange-400/40"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    <span>{g}</span>
                    <span className={`text-[11px] ml-1.5 px-1.5 py-0.5 rounded-full ${
                      isActive ? "bg-orange-600 text-white" : "bg-gray-100 text-gray-500"
                    }`}>
                      {roomCount}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Toggle Collapse Non-Teaching Rooms Button */}
            <div className="ml-auto shrink-0 pl-3">
              <button
                type="button"
                onClick={toggleHideNonTeaching}
                className={`h-10 px-3.5 sm:px-4 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 shadow-2xs ${
                  hideNonTeachingRooms
                    ? "bg-amber-100 text-amber-950 border border-amber-300 hover:bg-amber-200"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
                title={hideNonTeachingRooms ? "กำลังซ้อนห้องที่ไม่ได้สอนไว้ (คลิกเพื่อแสดงทั้งหมด)" : "คลิกเพื่อซ้อนห้องที่ไม่ได้สอนไว้ก่อน"}
              >
                {hideNonTeachingRooms ? (
                  <>
                    <EyeOff className="w-4 h-4 text-amber-700" />
                    <span>ซ้อนห้องที่ไม่ได้สอนไว้ (เปิดอยู่)</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 text-gray-500" />
                    <span>แสดงครบทุกห้อง</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 2. Quick Classroom Pills Bar (Larger, High Contrast, Foldable) */}
          <div className="px-5 sm:px-6 py-3 bg-white border-b border-gray-100 flex items-center gap-2 overflow-x-auto text-xs sm:text-sm scrollbar-thin">
            <span className="text-gray-500 text-xs font-bold uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              เลือกห้อง:
            </span>

            {/* All Classrooms Pill */}
            <button
              type="button"
              onClick={() => setSelectedRoomFilter("all")}
              className={`h-9.5 px-3.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shadow-2xs ${
                selectedRoomFilter === "all"
                  ? "bg-gray-900 text-white ring-2 ring-gray-900/30"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span>{activeGradeTab === "teaching" ? "ทั้งหมดที่สอน" : activeGradeTab === "all" ? "ทุกห้องเรียน" : `ทุกห้องใน ${activeGradeTab}`}</span>
            </button>

            {/* 1. Teaching Rooms (Always displayed first & prominently) */}
            {teachingRoomsInView.map((room) => {
              const isSelected = selectedRoomFilter === room;
              const count = roomStatsMap[room]?.total || 0;
              return (
                <button
                  key={room}
                  type="button"
                  onClick={() => setSelectedRoomFilter(room)}
                  className={`h-9.5 px-3.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                    isSelected
                      ? "bg-orange-500 text-white shadow-md shadow-orange-500/25 ring-2 ring-orange-500/40"
                      : "bg-amber-50/90 text-amber-950 hover:bg-amber-100 border border-amber-300/80 shadow-2xs"
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${isSelected ? "fill-white text-white" : "fill-amber-400 text-amber-500"}`} />
                  <span>ห้อง {room}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-md font-mono font-bold ${
                    isSelected ? "bg-orange-600 text-white" : "bg-amber-200/90 text-amber-900"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}

            {/* If teachingRoomsInView is empty in this grade tab, show notice or all rooms */}
            {teachingRoomsInView.length === 0 && otherRoomsInView.map((room) => {
              const isSelected = selectedRoomFilter === room;
              const count = roomStatsMap[room]?.total || 0;
              return (
                <button
                  key={room}
                  type="button"
                  onClick={() => setSelectedRoomFilter(room)}
                  className={`h-9.5 px-3.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 font-medium ${
                    isSelected
                      ? "bg-orange-500 text-white font-bold shadow-md shadow-orange-500/25 ring-2 ring-orange-500/40"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-2xs"
                  }`}
                >
                  <span>ห้อง {room}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-md font-mono font-bold ${
                    isSelected ? "bg-orange-600 text-white" : "bg-gray-200/80 text-gray-600"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}

            {/* 2. Non-Teaching Rooms (Folded or Expanded when teachingRooms exist) */}
            {teachingRoomsInView.length > 0 && otherRoomsInView.length > 0 && (
              <>
                {hideNonTeachingRooms ? (
                  <>
                    {/* If current selectedRoomFilter is one of otherRoomsInView, still render it so selection isn't lost */}
                    {selectedRoomFilter !== "all" && !teachingRooms.includes(selectedRoomFilter) && (
                      <button
                        type="button"
                        onClick={() => setSelectedRoomFilter(selectedRoomFilter)}
                        className="h-9.5 px-3.5 rounded-xl font-bold bg-orange-500 text-white shadow-md shadow-orange-500/25 ring-2 ring-orange-500/40 flex items-center gap-2 whitespace-nowrap"
                      >
                        <span>ห้อง {selectedRoomFilter}</span>
                        <span className="text-xs px-2 py-0.5 rounded-md font-mono font-bold bg-orange-600 text-white">
                          {roomStatsMap[selectedRoomFilter]?.total || 0}
                        </span>
                      </button>
                    )}

                    {/* Expand Action Pill */}
                    <button
                      type="button"
                      onClick={() => setHideNonTeachingRooms(false)}
                      className="h-9.5 px-3.5 rounded-xl text-xs font-bold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 border border-dashed border-gray-300 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0"
                      title="คลิกเพื่อแสดงห้องเรียนอื่นๆ ที่ไม่ได้สอน"
                    >
                      <EyeOff className="w-3.5 h-3.5 text-gray-500" />
                      <span>ซ้อนห้องที่ไม่ได้สอนไว้ ({otherRoomsInView.length} ห้อง)</span>
                      <span className="text-blue-600 font-bold underline ml-0.5">คลิกเพื่อดู ▾</span>
                    </button>
                  </>
                ) : (
                  <>
                    {otherRoomsInView.map((room) => {
                      const isSelected = selectedRoomFilter === room;
                      const count = roomStatsMap[room]?.total || 0;
                      return (
                        <button
                          key={room}
                          type="button"
                          onClick={() => setSelectedRoomFilter(room)}
                          className={`h-9.5 px-3.5 rounded-xl text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 font-medium ${
                            isSelected
                              ? "bg-orange-500 text-white font-bold shadow-md shadow-orange-500/25 ring-2 ring-orange-500/40"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-2xs"
                          }`}
                        >
                          <span>ห้อง {room}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-md font-mono font-bold ${
                            isSelected ? "bg-orange-600 text-white" : "bg-gray-200/80 text-gray-600"
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}

                    {/* Fold back Action Pill */}
                    <button
                      type="button"
                      onClick={() => setHideNonTeachingRooms(true)}
                      className="h-9.5 px-3 rounded-xl text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 shrink-0"
                      title="คลิกเพื่อซ้อนห้องที่ไม่ได้สอนไว้ก่อน"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-600" />
                      <span>ซ้อนห้องที่ไม่ได้สอน ▴</span>
                    </button>
                  </>
                )}
              </>
            )}
          </div>

          {/* 3. Room Summary & Frontend Connection Banner */}
          {selectedRoomFilter !== "all" && (() => {
            const cleanRoom = selectedRoomFilter.replace(/^ห้อง\s*/, "").trim();
            const roomAssignments = getAssignmentsForRoom(cleanRoom);
            const roomQuizzes = getQuizzesForRoom(cleanRoom);
            const gradeMatch = cleanRoom.match(/^ม\.?(\d+)/);
            const gradeNum = gradeMatch ? gradeMatch[1] : "";
            const currentRoomStat = roomStatsMap[cleanRoom] || {
              classroom: cleanRoom,
              total: 0,
              active: 0,
              inactive: 0,
              activePct: 0,
              withSubs: 0,
              withQuizzes: 0,
            };

            return (
              <div className="p-5 sm:p-6 bg-gradient-to-r from-orange-50/90 via-amber-50/40 to-blue-50/30 border-b border-orange-200 space-y-4 animate-in fade-in duration-200">
                {/* Top Row: Room title, metrics, and action buttons */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-orange-700 bg-orange-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        ข้อมูลประจำห้องเรียน
                      </span>
                      <h3 className="text-xl sm:text-2xl font-bold font-kanit text-gray-900 flex items-center gap-2">
                        <span>ห้อง {cleanRoom}</span>
                        <button
                          type="button"
                          onClick={() => toggleTeachingRoom(cleanRoom)}
                          className={`px-2.5 py-0.5 rounded-lg transition-colors cursor-pointer text-xs font-medium flex items-center gap-1 ${
                            teachingRooms.includes(cleanRoom)
                              ? "text-amber-700 bg-amber-100/90 border border-amber-300"
                              : "text-gray-500 hover:text-amber-600 hover:bg-amber-50 border border-gray-200"
                          }`}
                          title={teachingRooms.includes(cleanRoom) ? "คลิกเพื่อยกเลิกการปักหมุด" : "คลิกเพื่อปักหมุดเป็นห้องที่สอน"}
                        >
                          <Star className={`w-3.5 h-3.5 ${teachingRooms.includes(cleanRoom) ? "fill-amber-500 text-amber-500" : ""}`} />
                          <span className="text-[11px]">
                            {teachingRooms.includes(cleanRoom) ? "ห้องที่ฉันสอน ⭐" : "ปักหมุดห้องที่สอน"}
                          </span>
                        </button>
                      </h3>
                    </div>

                    {/* Room Metrics Chips */}
                    <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap text-xs pt-0.5">
                      <div className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 font-medium text-gray-700 shadow-2xs">
                        นักเรียน: <span className="font-bold text-gray-900">{currentRoomStat.total}</span> คน
                      </div>
                      <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 font-medium text-emerald-800 shadow-2xs">
                        เข้าใช้แล้ว: <span className="font-bold">{currentRoomStat.active}</span> คน ({currentRoomStat.activePct}%)
                      </div>
                      <div className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 font-medium text-gray-500 shadow-2xs">
                        ยังไม่เข้าใช้: <span className="font-bold">{currentRoomStat.inactive}</span> คน
                      </div>
                      <div className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 font-medium text-blue-800 shadow-2xs">
                        ส่งงานแล้ว: <span className="font-bold">{currentRoomStat.withSubs}</span> คน
                      </div>
                      <div className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 font-medium text-purple-800 shadow-2xs">
                        ทำแบบทดสอบ: <span className="font-bold">{currentRoomStat.withQuizzes}</span> คน
                      </div>
                    </div>
                  </div>

                  {/* Actions Right */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleExportExcel(cleanRoom)}
                      className="h-9 px-3.5 inline-flex items-center gap-1.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 cursor-pointer shadow-2xs transition-colors"
                      title={`ส่งออกสถิติเฉพาะนักเรียนห้อง ${cleanRoom}`}
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                      <span>ส่งออก Excel</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRoomFilter("all")}
                      className="h-9 px-3 inline-flex items-center gap-1 rounded-xl text-xs font-bold text-gray-600 bg-white hover:bg-gray-100 border border-gray-200 cursor-pointer shadow-2xs transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                      <span>ดูทุกห้อง</span>
                    </button>
                  </div>
                </div>

                {/* Bottom Row: Real-time Frontend Linkage (การเชื่อมโยงข้อมูลกับหน้าบ้านจริง) */}
                <div className="pt-3.5 border-t border-orange-200/70 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs bg-white/70 p-3.5 rounded-2xl">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                      <Globe className="w-4 h-4 text-blue-600" />
                      <span>ข้อมูลและภาระงานที่เชื่อมโยงกับหน้าบ้าน (Frontend Linkage):</span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap text-[11px]">
                      {/* Assignments on frontend */}
                      <span className="font-semibold text-gray-600">งานที่สั่ง ({roomAssignments.length}):</span>
                      {roomAssignments.length === 0 ? (
                        <span className="text-gray-400">ยังไม่มีงานที่มอบหมายเฉพาะห้องนี้</span>
                      ) : (
                        roomAssignments.map((a) => (
                          <span 
                            key={a.id}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 font-medium"
                          >
                            <FileText className="w-3 h-3 text-blue-600" />
                            <span>{a.title}</span>
                          </span>
                        ))
                      )}

                      {/* Quizzes on frontend */}
                      <span className="font-semibold text-gray-600 ml-2">แบบทดสอบ ({roomQuizzes.length}):</span>
                      {roomQuizzes.length === 0 ? (
                        <span className="text-gray-400">ไม่มีแบบทดสอบ</span>
                      ) : (
                        roomQuizzes.map((q) => (
                          <span 
                            key={q.id}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 font-medium"
                          >
                            <Award className="w-3 h-3 text-purple-600" />
                            <span>{q.title}</span>
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Direct Frontend View Buttons */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <a
                      href="/submissions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-8.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors shadow-2xs"
                      title="เปิดดูหน้าส่งงานและทำแบบทดสอบของนักเรียนบนหน้าเว็บ"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>เปิดดูหน้าบ้าน (/submissions)</span>
                      <ExternalLink className="w-3 h-3 text-blue-200" />
                    </a>

                    {(gradeNum === "3" || gradeNum === "4") && (
                      <a
                        href={`/materials/m${gradeNum}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-8.5 px-2.5 rounded-xl bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 font-medium text-xs inline-flex items-center gap-1 transition-colors"
                        title={`เปิดดูคลังสื่อการสอน ม.${gradeNum}`}
                      >
                        <BookOpen className="w-3.5 h-3.5 text-orange-600" />
                        <span>สื่อ ม.{gradeNum}</span>
                        <ExternalLink className="w-3 h-3 text-gray-400" />
                      </a>
                    )}

                    <a
                      href="/artworks"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-8.5 px-2.5 rounded-xl bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 font-medium text-xs inline-flex items-center gap-1 transition-colors"
                      title="เปิดดูแกลเลอรีผลงานนักเรียนหน้าบ้าน"
                    >
                      <Palette className="w-3.5 h-3.5 text-purple-600" />
                      <span>แกลเลอรีผลงาน</span>
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Filter Bar (Classroom, Status, Sort, Export Excel, Import, Delete) */}
          <div className="p-4 sm:p-5 bg-white border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Classroom Filter Select */}
              <select
                value={selectedRoomFilter}
                onChange={(e) => setSelectedRoomFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-medium bg-white focus:outline-none focus:border-orange-500 cursor-pointer shadow-2xs"
              >
                <option value="all">
                  {activeGradeTab === "teaching"
                    ? `ห้องที่ฉันสอนทั้งหมด (${teachingRooms.length} ห้อง)`
                    : activeGradeTab === "all"
                    ? `ทุกห้องเรียน (${uniqueClassrooms.length} ห้อง)`
                    : `ทุกห้องใน ${activeGradeTab} (${gradeFilteredRooms.length} ห้อง)`}
                </option>
                {gradeFilteredRooms.map((room) => (
                  <option key={room} value={room}>
                    ห้อง {room} ({roomStatsMap[room]?.total || 0} คน) {teachingRooms.includes(room) ? "⭐" : ""}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-medium bg-white focus:outline-none focus:border-orange-500 cursor-pointer shadow-2xs"
              >
                <option value="all">สถานะการเข้าใช้ทั้งหมด</option>
                <option value="active">🟢 เคยเข้าสู่ระบบแล้ว ({stats.active} คน)</option>
                <option value="inactive">⚪ ยังไม่เคยเข้าสู่ระบบ ({stats.inactive} คน)</option>
                <option value="has_submissions">📝 ส่งงานแล้ว ({stats.withSubs} คน)</option>
                <option value="has_quizzes">📋 ทำแบบทดสอบแล้ว ({stats.withQuizzes} คน)</option>
              </select>

              {/* Sort Selector: Default to "room_seat" */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-medium bg-white focus:outline-none focus:border-orange-500 cursor-pointer shadow-2xs text-gray-700 font-medium"
              >
                <option value="room_seat">เรียงตาม: ห้องเรียน & เลขที่ (แนะนำ)</option>
                <option value="seat">เรียงตาม: เลขที่ (1-40)</option>
                <option value="id">เรียงตาม: รหัสนักเรียน</option>
                <option value="logins">เรียงตาม: เข้าใช้มากที่สุด</option>
                <option value="lastLogin">เรียงตาม: เข้าใช้ล่าสุด</option>
              </select>
            </div>

            {/* Action Buttons: Export Excel & Import */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleExportExcel()}
                className="h-8 px-3.5 inline-flex items-center gap-1.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 cursor-pointer transition-colors shadow-2xs"
                title="ส่งออกสถิติของนักเรียนตามตัวกรองปัจจุบันเป็นไฟล์ Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  {selectedRoomFilter !== "all" ? `ส่งออกห้อง ${selectedRoomFilter} (Excel)` : "ส่งออกสถิติ (Excel)"}
                </span>
              </button>

              <div>
                <input 
                  type="file" 
                  id="excelUpload" 
                  accept=".xlsx, .xls, .csv" 
                  className="hidden" 
                  onChange={handleFileUpload}
                />
                <label 
                  htmlFor="excelUpload"
                  className="h-8 px-3.5 inline-flex items-center gap-1.5 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 cursor-pointer transition-colors shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>นำเข้า</span>
                </label>
              </div>
              
              <button 
                type="button"
                onClick={handleDeleteAllStudents}
                className="h-8 px-2.5 rounded-xl text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors shadow-2xs cursor-pointer"
                title="ล้างข้อมูลนักเรียนทั้งหมด"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          
          {/* View Content Area: Either Classroom Grid or Student Table */}
          {isLoading ? (
            <div className="p-16 text-center text-gray-400 text-xs">
              <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p>กำลังโหลดข้อมูลนักเรียน สถิติ และภาระงานหน้าบ้าน...</p>
            </div>
          ) : viewMode === "room_grid" ? (
            /* Classroom Summary Grid Mode (4 Columns Spacious & Balanced, with Fold Support) */
            <div className="p-5 sm:p-6 max-h-[680px] overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4.5">
                {(hideNonTeachingRooms && teachingRoomsInView.length > 0 ? teachingRoomsInView : gradeFilteredRooms).map((room) => {
                  const roomStat = roomStatsMap[room] || {
                    classroom: room,
                    total: 0,
                    active: 0,
                    inactive: 0,
                    activePct: 0,
                    withSubs: 0,
                    withQuizzes: 0,
                  };
                  const isTeaching = teachingRooms.includes(room);
                  const isSelected = selectedRoomFilter === room;
                  const roomAss = getAssignmentsForRoom(room);
                  const roomQz = getQuizzesForRoom(room);

                  return (
                    <div
                      key={room}
                      className={`rounded-2xl border p-4.5 bg-white transition-all shadow-2xs hover:shadow-md flex flex-col justify-between ${
                        isSelected
                          ? "border-orange-500 ring-2 ring-orange-500/20 bg-orange-50/15"
                          : isTeaching
                          ? "border-amber-200 bg-amber-50/20"
                          : "border-gray-200 hover:border-orange-300"
                      }`}
                    >
                      <div>
                        {/* Room Card Header */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-kanit font-bold text-base text-gray-900">
                              ห้อง {room}
                            </h4>
                            {isTeaching && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                ครูสอน
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleTeachingRoom(room)}
                            className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-amber-500 cursor-pointer transition-colors"
                            title={isTeaching ? "ยกเลิกการปักหมุดห้องที่สอน" : "ปักหมุดเป็นห้องที่ฉันสอน"}
                          >
                            <Star className={`w-4 h-4 ${isTeaching ? "text-amber-400 fill-amber-400" : ""}`} />
                          </button>
                        </div>

                        {/* Progress Bar of Active Logins */}
                        <div className="space-y-1.5 mb-3.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">เข้าใช้งานแล้ว</span>
                            <span className="font-bold text-gray-900 font-kanit">
                              {roomStat.active} / {roomStat.total} คน ({roomStat.activePct}%)
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 rounded-full ${
                                roomStat.activePct >= 80
                                  ? "bg-emerald-500"
                                  : roomStat.activePct >= 40
                                  ? "bg-amber-500"
                                  : "bg-orange-500"
                              }`}
                              style={{ width: `${Math.min(100, roomStat.activePct)}%` }}
                            />
                          </div>
                        </div>

                        {/* Frontend Curriculum & Activity Badges */}
                        <div className="grid grid-cols-2 gap-2 text-[11px] mb-3.5">
                          <div className="p-2 rounded-xl bg-blue-50/70 border border-blue-100 text-center">
                            <span className="text-blue-600 block text-[10px] font-medium">งานหน้าบ้าน</span>
                            <span className="font-bold text-blue-900 font-kanit text-sm">
                              {roomAss.length} ชิ้น
                            </span>
                          </div>
                          <div className="p-2 rounded-xl bg-purple-50/70 border border-purple-100 text-center">
                            <span className="text-purple-600 block text-[10px] font-medium">แบบทดสอบ</span>
                            <span className="font-bold text-purple-900 font-kanit text-sm">
                              {roomQz.length} ชุด
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-gray-500 px-1 mb-3.5">
                          <span>ส่งงานแล้ว: <strong className="text-gray-800">{roomStat.withSubs}</strong> คน</span>
                          <span>ทำข้อสอบแล้ว: <strong className="text-gray-800">{roomStat.withQuizzes}</strong> คน</span>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="pt-2.5 border-t border-gray-100 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRoomFilter(room);
                            setViewMode("table");
                          }}
                          className="flex-1 py-1.5 px-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-2xs cursor-pointer text-center transition-colors flex items-center justify-center gap-1"
                        >
                          <span>ดูรายชื่อ ({roomStat.total} คน)</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        
                        <a
                          href="/submissions"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 cursor-pointer shadow-2xs transition-colors"
                          title="เปิดดูหน้าส่งงานหน้าบ้าน (/submissions)"
                        >
                          <Globe className="w-4 h-4" />
                        </a>

                        <button
                          type="button"
                          onClick={() => handleExportExcel(room)}
                          className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-pointer shadow-2xs transition-colors"
                          title={`ส่งออก Excel ห้อง ${room}`}
                        >
                          <FileSpreadsheet className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Expand / Fold Notice in Classroom Grid */}
              {teachingRoomsInView.length > 0 && otherRoomsInView.length > 0 && (
                hideNonTeachingRooms ? (
                  <div className="p-4 rounded-2xl border border-dashed border-gray-300 bg-gray-50/80 text-center flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <EyeOff className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>ซ้อนห้องเรียนที่ไม่ได้สอนไว้ก่อน <strong>{otherRoomsInView.length}</strong> ห้อง</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHideNonTeachingRooms(false)}
                      className="h-8.5 px-3.5 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-xs font-bold text-blue-600 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>แสดงห้องที่ไม่ได้สอนทั้งหมด ({otherRoomsInView.length} ห้อง) ▾</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 flex items-center justify-between text-xs mt-4">
                    <span className="text-amber-900 font-medium">กำลังแสดงครบทุกห้อง ({gradeFilteredRooms.length} ห้อง)</span>
                    <button
                      type="button"
                      onClick={() => setHideNonTeachingRooms(true)}
                      className="text-amber-800 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>ซ้อนห้องที่ไม่ได้สอนไว้ก่อน ▴</span>
                    </button>
                  </div>
                )
              )}
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-16 text-center text-gray-400 text-xs">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">ไม่พบรายชื่อนักเรียนที่ตรงกับเงื่อนไขการค้นหา</p>
            </div>
          ) : (
            /* Student Table View (Full Widescreen & Clear Typography) */
            <div className="max-h-[640px] overflow-y-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="uppercase tracking-wider border-b border-gray-200 bg-gray-50 text-gray-600 text-[11px] font-bold sticky top-0 z-10">
                  <tr>
                    <th scope="col" className="px-3 py-3 font-bold text-center w-12">เลขที่</th>
                    <th scope="col" className="px-4 py-3 font-bold">รหัส</th>
                    <th scope="col" className="px-3 py-3 font-bold text-center">ห้อง</th>
                    <th scope="col" className="px-4 py-3 font-bold">ชื่อ - นามสกุล</th>
                    <th scope="col" className="px-4 py-3 font-bold">สถานะรหัสผ่าน</th>
                    <th scope="col" className="px-4 py-3 font-bold">สถิติการเข้าใช้</th>
                    <th scope="col" className="px-4 py-3 font-bold">ภาระงาน & กิจกรรมหน้าบ้าน</th>
                    <th scope="col" className="px-4 py-3 font-bold text-center w-24">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {filteredStudents.map((student) => {
                    const hasLoggedIn = (student.loginCount || 0) > 0;
                    const cleanStudentRoom = String(student.classroom || '').replace(/^ห้อง\s*/, '').trim();
                    const isTeaching = teachingRooms.includes(cleanStudentRoom);

                    return (
                      <tr key={student.id} className="hover:bg-orange-50/40 transition-colors group">
                        {/* Seat Number */}
                        <td className="px-3 py-3 text-center">
                          <span className="font-mono font-bold text-[11px] text-orange-800 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200/60">
                            {student.studentNumber !== null && student.studentNumber !== undefined ? student.studentNumber : "-"}
                          </span>
                        </td>

                        {/* Student ID */}
                        <td className="px-4 py-3 font-mono font-bold text-gray-900">
                          {student.id}
                        </td>

                        {/* Classroom */}
                        <td className="px-3 py-3 text-center">
                          <span className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded-md ${
                            isTeaching
                              ? "bg-amber-100 text-amber-900 border border-amber-200"
                              : "bg-gray-100 text-gray-700"
                          }`}>
                            {student.classroom || "-"}
                          </span>
                        </td>

                        {/* Name */}
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {student.name}
                        </td>

                        {/* Password Status & Reset */}
                        <td className="px-4 py-3">
                          {student.password ? (
                            <div className="flex flex-col gap-1">
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-semibold text-[11px] border border-amber-200/80 w-fit">
                                <Key className="w-3 h-3 text-amber-600" />
                                <span>ตั้งรหัสเองแล้ว</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => handleResetPassword(student.id, student.name)}
                                className="inline-flex items-center gap-1 text-[11px] text-amber-700 hover:text-amber-900 font-bold hover:underline cursor-pointer transition-colors"
                                title={`รีเซ็ตรหัสผ่านกลับเป็นค่าเริ่มต้น (${student.id}@wts)`}
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>รีเซ็ตเป็นค่าเริ่มต้น</span>
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-medium text-[11px] border border-emerald-200/80 w-fit">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                <span>รหัสเริ่มต้น</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyDefaultPassword(student.id)}
                                className="inline-flex items-center gap-1 text-[10px] text-gray-500 hover:text-orange-600 font-mono cursor-pointer transition-colors"
                                title="คลิกเพื่อคัดลอกรหัสผ่านเริ่มต้นส่งให้นักเรียน"
                              >
                                {copiedId === student.id ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    <span className="text-emerald-700 font-bold">คัดลอกแล้ว!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3 text-gray-400 hover:text-orange-600" />
                                    <span>{student.id}@wts</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Usage & Login Statistics */}
                        <td className="px-4 py-3">
                          {hasLoggedIn ? (
                            <div className="flex flex-col">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] w-fit">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                เข้าใช้ {student.loginCount} ครั้ง
                              </span>
                              <span className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-gray-400 shrink-0" />
                                <span>{formatThaiDateTime(student.lastLoginAt)}</span>
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium text-[11px] w-fit">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                ยังไม่เคยเข้าใช้
                              </span>
                              <span className="text-[10px] text-gray-400 mt-0.5">-</span>
                            </div>
                          )}
                        </td>

                        {/* Academic Activities (Submissions & Quizzes with clickable details) */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {(student.submissionsCount || 0) > 0 ? (
                              <button
                                type="button"
                                onClick={() => handleOpenStudentDetail(student)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                                title="คลิกเพื่อดูรายละเอียดและภาพชิ้นงานที่ส่ง"
                              >
                                <FileText className="w-3 h-3 text-blue-600" />
                                <span>ส่งงาน: {student.submissionsCount} ชิ้น ↗</span>
                              </button>
                            ) : (
                              <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-gray-50 text-gray-400 border border-gray-100">
                                ส่งงาน: 0
                              </span>
                            )}

                            {(student.quizzesCount || 0) > 0 ? (
                              <button
                                type="button"
                                onClick={() => handleOpenStudentDetail(student)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200 transition-colors cursor-pointer"
                                title="คลิกเพื่อดูคะแนนแบบทดสอบ"
                              >
                                <Award className="w-3 h-3 text-purple-600" />
                                <span>สอบ: {student.quizzesCount} ชุด</span>
                              </button>
                            ) : (
                              <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-gray-50 text-gray-400 border border-gray-100">
                                สอบ: 0
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {/* View Details Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenStudentDetail(student)}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-orange-600 hover:bg-orange-50 transition-colors cursor-pointer"
                              title="ดูประวัติและสถิติของนักเรียน"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Reset Password Button */}
                            <button
                              type="button"
                              onClick={() => handleResetPassword(student.id, student.name)}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                              title={`รีเซ็ตรหัสผ่านเป็น ${student.id}@wts`}
                            >
                              <Key className="w-4 h-4" />
                            </button>

                            {/* Delete Student Button */}
                            <button 
                              type="button"
                              onClick={() => handleDeleteStudent(student.id, student.name)} 
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer" 
                              title="ลบรายชื่อนักเรียน"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 3. MODAL: Add New Student (แบบฟอร์มเพิ่มนักเรียนใหม่ - ปรับขนาดกะทัดรัด สมดุล และดูดี) */}
      {isAddStudentOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddStudentOpen(false);
          }}
        >
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200 my-8">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold shadow-2xs shrink-0">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold font-kanit text-gray-900 leading-tight">
                    เพิ่มนักเรียนใหม่เข้าสู่ระบบ
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    รหัสผ่านเริ่มต้น: <code className="font-mono text-orange-700 font-bold bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">&#123;รหัสนักเรียน&#125;@wts</code>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddStudentOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
                title="ปิด"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddStudent} className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3.5">
                {/* Student ID */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 block">
                    รหัสประจำตัวนักเรียน <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={studentIdInput}
                    onChange={(e) => setStudentIdInput(e.target.value)}
                    placeholder="เช่น 12345 (5 หลัก)"
                    className="w-full h-10 px-3.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none font-mono text-xs text-gray-900 placeholder:text-gray-400 transition-all bg-white"
                  />
                </div>

                {/* Seat Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 block">
                    เลขที่
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={studentNumberInput}
                    onChange={(e) => setStudentNumberInput(e.target.value)}
                    placeholder="เช่น 1"
                    className="w-full h-10 px-3.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none font-mono text-xs text-gray-900 placeholder:text-gray-400 transition-all bg-white"
                  />
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">
                  ชื่อ - นามสกุล <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={studentNameInput}
                  onChange={(e) => setStudentNameInput(e.target.value)}
                  placeholder="เช่น เด็กชายรักดี เรียนเก่ง"
                  className="w-full h-10 px-3.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none text-xs text-gray-900 placeholder:text-gray-400 transition-all bg-white"
                />
              </div>

              {/* Classroom */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">
                  ห้องเรียน
                </label>
                <input
                  type="text"
                  value={studentClassroomInput}
                  onChange={(e) => setStudentClassroomInput(e.target.value)}
                  placeholder="เช่น ม.3/1 หรือ ม.4/11"
                  list="classroom-modal-options"
                  className="w-full h-10 px-3.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none font-mono text-xs text-gray-900 placeholder:text-gray-400 transition-all bg-white"
                />
                <datalist id="classroom-modal-options">
                  {uniqueClassrooms.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
                <p className="text-[11px] text-gray-400">
                  พิมพ์ชื่อห้อง หรือเลือกจากรายการห้องที่มีในโรงเรียน
                </p>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="h-10 px-4 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100 font-bold text-xs cursor-pointer transition-colors"
                >
                  ยกเลิก
                </button>
                <Button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs cursor-pointer shadow-md shadow-orange-500/20 transition-all"
                >
                  + บันทึกข้อมูลนักเรียน
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. MODAL: Student Detailed Usage, Submissions & History (สถิติและผลงานรายบุคคล) */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200 overflow-hidden max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-start justify-between bg-white shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-lg font-kanit">
                  {selectedStudent.studentNumber ?? selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-orange-800 bg-orange-50 px-2.5 py-0.5 rounded-md border border-orange-200">
                      {selectedStudent.id}
                    </span>
                    <span className="font-bold text-xs text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-md">
                      ห้อง {selectedStudent.classroom || "-"}
                    </span>
                    {selectedStudent.studentNumber && (
                      <span className="font-bold text-xs text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                        เลขที่ {selectedStudent.studentNumber}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 font-kanit mt-1">
                    {selectedStudent.name}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="/submissions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold hidden sm:inline-flex items-center gap-1 transition-colors"
                  title="เปิดดูหน้าส่งงานของนักเรียนบนหน้าบ้าน"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>หน้าส่งงานหน้าบ้าน</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 text-xs">
              {/* Usage Summary Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 text-center">
                  <span className="text-gray-500 block text-[11px]">การเข้าสู่ระบบ</span>
                  <span className="text-lg font-bold font-kanit text-gray-900 mt-0.5 block">
                    {selectedStudent.loginCount || 0} ครั้ง
                  </span>
                </div>

                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 text-center">
                  <span className="text-gray-500 block text-[11px]">ชิ้นงานที่ส่ง</span>
                  <span className="text-lg font-bold font-kanit text-blue-700 mt-0.5 block">
                    {studentDetails.submissions.length} ชิ้น
                  </span>
                </div>

                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 text-center">
                  <span className="text-gray-500 block text-[11px]">แบบทดสอบที่ทำ</span>
                  <span className="text-lg font-bold font-kanit text-purple-700 mt-0.5 block">
                    {studentDetails.quizzes.length} ชุด
                  </span>
                </div>

                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 text-center">
                  <span className="text-gray-500 block text-[11px]">สถานะบัญชี</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full inline-block mt-1 ${
                    (selectedStudent.loginCount || 0) > 0 
                      ? "bg-emerald-100 text-emerald-800" 
                      : "bg-gray-200 text-gray-600"
                  }`}>
                    {(selectedStudent.loginCount || 0) > 0 ? "เข้าใช้แล้ว" : "ยังไม่เคยเข้า"}
                  </span>
                </div>
              </div>

              {/* Account Security & Password info */}
              <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200/90 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-orange-200/60 pb-2.5">
                  <div className="flex items-center gap-2 text-orange-950 font-medium">
                    <Clock className="w-4 h-4 text-orange-600 shrink-0" />
                    <span>เข้าใช้งานล่าสุด:</span>
                    <strong className="text-orange-900">{formatThaiDateTime(selectedStudent.lastLoginAt)}</strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-gray-500">สถานะรหัสผ่าน:</span>
                    {selectedStudent.password ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 font-bold text-[10px]">
                        🔒 ตั้งรหัสผ่านเองแล้ว
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[10px]">
                        🟢 รหัสเริ่มต้น
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5">
                  <div className="text-[11px] text-orange-950 flex items-center gap-2">
                    <span className="text-gray-600">รหัสผ่านเริ่มต้น:</span>
                    <code className="px-2 py-1 rounded-lg bg-white border border-orange-200 font-mono font-bold text-gray-900 shadow-2xs">
                      {selectedStudent.id}@wts
                    </code>
                    <button
                      type="button"
                      onClick={() => handleCopyDefaultPassword(selectedStudent.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-orange-200 text-orange-700 hover:bg-orange-100/70 text-[11px] font-medium shadow-2xs cursor-pointer transition-colors"
                      title="คัดลอกรหัสผ่านเริ่มต้นส่งให้นักเรียน"
                    >
                      {copiedId === selectedStudent.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">คัดลอกแล้ว</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>คัดลอก</span>
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleResetPassword(selectedStudent.id, selectedStudent.name)}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-[11px] shadow-sm hover:from-amber-600 hover:to-orange-600 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>รีเซ็ตรหัสกลับค่าเริ่มต้น</span>
                  </button>
                </div>
              </div>

              {/* Submissions History with Artwork Preview */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>ชิ้นงานที่ส่งจากหน้าบ้าน ({studentDetails.submissions.length} รายการ)</span>
                  </h4>
                  <a
                    href="/artworks"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-blue-600 hover:underline inline-flex items-center gap-1 font-medium"
                  >
                    <span>ดูแกลเลอรีผลงานศิลปะ</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {studentDetails.isLoading ? (
                  <p className="text-gray-400 py-4 text-center">กำลังโหลดข้อมูลชิ้นงาน...</p>
                ) : studentDetails.submissions.length === 0 ? (
                  <p className="text-gray-400 py-4 text-center bg-gray-50 rounded-2xl border border-gray-100">
                    นักเรียนยังไม่ได้ส่งชิ้นงานในระบบ
                  </p>
                ) : (
                  <div className="space-y-3">
                    {studentDetails.submissions.map((sub: any) => {
                      const artworkUrl = sub.imageUrl || sub.fileUrl;
                      return (
                        <div key={sub.id} className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            {artworkUrl && (
                              <div className="w-14 h-14 rounded-xl bg-gray-200 overflow-hidden shrink-0 border border-gray-300">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={artworkUrl}
                                  alt={sub.assignmentTitle || "ชิ้นงาน"}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = "none";
                                  }}
                                />
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-gray-900 text-sm">{sub.assignmentTitle || sub.assignmentId}</p>
                              <span className="text-[11px] text-gray-500 block mt-0.5">
                                ส่งเมื่อ: {new Date(sub.submittedAt).toLocaleString("th-TH")}
                              </span>
                              {artworkUrl && (
                                <a
                                  href={artworkUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-blue-600 hover:underline inline-flex items-center gap-1 font-medium mt-1"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>เปิดดูภาพผลงานขนาดเต็ม</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                            </div>
                          </div>

                          <div className="text-left sm:text-right shrink-0">
                            <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                              sub.status === "graded" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                            }`}>
                              {sub.status === "graded" ? `คะแนน: ${sub.score} / ${sub.maxScore || 10}` : "รอครูตรวจ"}
                            </span>
                            {sub.feedback && (
                              <p className="text-[11px] text-gray-600 mt-1 italic max-w-xs">
                                &quot;{sub.feedback}&quot;
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Quizzes History */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-purple-600" />
                  <span>ประวัติการทำแบบทดสอบบนหน้าบ้าน ({studentDetails.quizzes.length} ชุด)</span>
                </h4>

                {studentDetails.isLoading ? (
                  <p className="text-gray-400 py-4 text-center">กำลังโหลดประวัติการสอบ...</p>
                ) : studentDetails.quizzes.length === 0 ? (
                  <p className="text-gray-400 py-4 text-center bg-gray-50 rounded-2xl border border-gray-100">
                    ยังไม่มีประวัติการทำแบบทดสอบ
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {studentDetails.quizzes.map((att: any) => (
                      <div key={att.id} className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between gap-2">
                        <div>
                          <p className="font-bold text-gray-900">{att.quizTitle || att.quizId}</p>
                          <span className="text-[11px] text-gray-500 block mt-0.5">
                            ส่งเมื่อ: {new Date(att.submittedAt).toLocaleString("th-TH")} • สลับหน้าจอ: {att.infractionsCount || 0} ครั้ง
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="px-3 py-1 rounded-full font-bold font-kanit text-xs bg-purple-100 text-purple-900">
                            {att.score} / {att.totalQuestions} คะแนน
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
              <a
                href="/submissions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>เปิดดูหน้าบ้านนักเรียน (/submissions)</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="px-5 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-100 cursor-pointer shadow-2xs"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

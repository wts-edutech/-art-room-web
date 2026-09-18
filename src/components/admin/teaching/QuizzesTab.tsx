"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  RotateCcw, 
  Download, 
  Search, 
  Filter, 
  Eye, 
  ShieldAlert, 
  Power,
  GraduationCap,
  Users,
  Award,
  FileSpreadsheet,
  X,
  Settings2,
  School,
  Edit3,
  Save,
  Check,
  CheckSquare,
  Square,
  PlusCircle,
  Plus,
  Trash2,
  BookOpen,
  FileText
} from "lucide-react";
import * as XLSX from "xlsx";

interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  studentName: string;
  classroom: string;
  score: number;
  totalQuestions: number;
  answers: string;
  infractionsCount: number;
  submittedAt: string;
  status: string;
}

interface QuizItem {
  id: string;
  code: string;
  title: string;
  gradeLevel: string;
  description: string;
  totalQuestions: number;
  maxScore: number;
  timeLimitMinutes: number;
  isActive: boolean;
  targetClassrooms?: string[];
}

const DEFAULT_SUBJECT_CODES: Record<string, string> = {
  "ม.1": "ศ21101",
  "ม.2": "ศ22101",
  "ม.3": "ศ23101",
  "ม.4": "ศ31101",
  "ม.5": "ศ32101",
  "ม.6": "ศ33101",
};

const ALL_GRADES = ["ม.1", "ม.2", "ม.3", "ม.4", "ม.5", "ม.6"];

export default function QuizzesTab() {
  const [quizzesList, setQuizzesList] = useState<QuizItem[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isToggling, setIsToggling] = useState<string | null>(null);

  // Filters
  const [selectedQuizFilter, setSelectedQuizFilter] = useState<string>("all");
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Target Classrooms Modal State
  const [targetRoomsModalQuiz, setTargetRoomsModalQuiz] = useState<QuizItem | null>(null);
  const [targetMode, setTargetMode] = useState<"all" | "selective">("all");
  const [selectedTargetRooms, setSelectedTargetRooms] = useState<string[]>([]);
  const [isSavingTargets, setIsSavingTargets] = useState<boolean>(false);

  // Preview & Edit Questions Modal State
  const [previewQuizData, setPreviewQuizData] = useState<any | null>(null);
  const [isLoadingQuizDetails, setIsLoadingQuizDetails] = useState<boolean>(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    questionText: string;
    choiceA: string;
    choiceB: string;
    choiceC: string;
    choiceD: string;
    correctAnswer: "A" | "B" | "C" | "D";
    explanation: string;
  }>({
    questionText: "",
    choiceA: "",
    choiceB: "",
    choiceC: "",
    choiceD: "",
    correctAnswer: "A",
    explanation: "",
  });
  const [isSavingQuestion, setIsSavingQuestion] = useState<boolean>(false);

  // Add New Question inside Preview Modal State
  const [isAddingQuestion, setIsAddingQuestion] = useState<boolean>(false);
  const [newQuestionForm, setNewQuestionForm] = useState<{
    questionText: string;
    choiceA: string;
    choiceB: string;
    choiceC: string;
    choiceD: string;
    correctAnswer: "A" | "B" | "C" | "D";
    explanation: string;
  }>({
    questionText: "",
    choiceA: "",
    choiceB: "",
    choiceC: "",
    choiceD: "",
    correctAnswer: "A",
    explanation: "",
  });
  const [isSavingNewQuestion, setIsSavingNewQuestion] = useState<boolean>(false);
  const [isDeletingQuestionId, setIsDeletingQuestionId] = useState<string | null>(null);

  // Create New Quiz Modal State
  const [isCreateQuizOpen, setIsCreateQuizOpen] = useState<boolean>(false);
  const [isCreatingQuiz, setIsCreatingQuiz] = useState<boolean>(false);
  const [createQuizForm, setCreateQuizForm] = useState<{
    gradeLevel: string;
    code: string;
    title: string;
    description: string;
    timeLimitMinutes: number;
    maxScore: number;
    targetMode: "all" | "selective";
    targetClassrooms: string[];
    isActive: boolean;
  }>({
    gradeLevel: "ม.3",
    code: "ศ23101",
    title: "",
    description: "",
    timeLimitMinutes: 15,
    maxScore: 10,
    targetMode: "all",
    targetClassrooms: [],
    isActive: true,
  });

  // Helper: Get standard 14 rooms for a given grade
  const getRoomsForGrade = (grade: string) => {
    const cleanGrade = grade || "ม.3";
    return Array.from({ length: 14 }, (_, i) => `${cleanGrade}/${i + 1}`);
  };

  // Fetch quizzes and attempts
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [qRes, aRes] = await Promise.all([
        fetch("/api/quizzes"),
        fetch("/api/quizzes/attempts"),
      ]);

      if (qRes.ok) {
        const qData = await qRes.json();
        setQuizzesList(qData);
      }
      if (aRes.ok) {
        const aData = await aRes.json();
        setAttempts(aData);
      }
    } catch (err) {
      console.error("Failed to load quiz admin data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Toggle active status
  const handleToggleQuiz = async (quizId: string, currentActive: boolean) => {
    try {
      setIsToggling(quizId);
      const res = await fetch("/api/quizzes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: quizId,
          isActive: !currentActive,
        }),
      });

      if (res.ok) {
        setQuizzesList((prev) =>
          prev.map((q) => (q.id === quizId ? { ...q, isActive: !currentActive } : q))
        );
      } else {
        const err = await res.json();
        alert(err.error || "ไม่สามารถเปลี่ยนสถานะได้");
      }
    } catch (err) {
      console.error("Error toggling quiz:", err);
    } finally {
      setIsToggling(null);
    }
  };

  // Delete Quiz
  const handleDeleteQuiz = async (quizId: string, quizTitle: string) => {
    const confirmMsg = `ยืนยันการลบแบบทดสอบ:\n"${quizTitle}"\n\nคำเตือน: ข้อมูลข้อสอบและประวัติการส่งคะแนนทั้งหมดในชุดนี้จะถูกลบถาวร`;
    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/quizzes?id=${encodeURIComponent(quizId)}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("ลบแบบทดสอบเรียบร้อยแล้ว");
        setQuizzesList((prev) => prev.filter((q) => q.id !== quizId));
        setAttempts((prev) => prev.filter((a) => a.quizId !== quizId));
        if (selectedQuizFilter === quizId) {
          setSelectedQuizFilter("all");
        }
      } else {
        const err = await res.json();
        alert(err.error || "ไม่สามารถลบแบบทดสอบได้");
      }
    } catch (err) {
      console.error("Error deleting quiz:", err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  // Open Target Classrooms Modal
  const openTargetRoomsModal = (quiz: QuizItem) => {
    setTargetRoomsModalQuiz(quiz);
    const current = Array.isArray(quiz.targetClassrooms) ? quiz.targetClassrooms : [];
    if (current.length === 0) {
      setTargetMode("all");
      setSelectedTargetRooms([]);
    } else {
      setTargetMode("selective");
      setSelectedTargetRooms(current);
    }
  };

  // Save Target Classrooms
  const handleSaveTargetRooms = async () => {
    if (!targetRoomsModalQuiz) return;
    try {
      setIsSavingTargets(true);
      const roomsToSave = targetMode === "all" ? [] : selectedTargetRooms;
      const res = await fetch("/api/quizzes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: targetRoomsModalQuiz.id,
          targetClassrooms: roomsToSave,
        }),
      });

      if (res.ok) {
        setQuizzesList((prev) =>
          prev.map((q) =>
            q.id === targetRoomsModalQuiz.id ? { ...q, targetClassrooms: roomsToSave } : q
          )
        );
        setTargetRoomsModalQuiz(null);
      } else {
        const err = await res.json();
        alert(err.error || "ไม่สามารถบันทึกการตั้งค่าห้องเรียนได้");
      }
    } catch (e) {
      console.error(e);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsSavingTargets(false);
    }
  };

  // Open Preview & Edit Questions Modal
  const handleOpenPreviewAndEdit = async (quiz: QuizItem) => {
    try {
      setIsLoadingQuizDetails(true);
      const res = await fetch(`/api/quizzes/${quiz.id}/questions?withAnswers=true`);
      if (res.ok) {
        const data = await res.json();
        setPreviewQuizData({
          ...quiz,
          questions: data.questions || [],
        });
        setEditingQuestionId(null);
        setIsAddingQuestion(false);
      } else {
        alert("ไม่สามารถดึงข้อมูลข้อสอบได้");
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsLoadingQuizDetails(false);
    }
  };

  // Start Editing a Question
  const handleStartEditQuestion = (q: any) => {
    setEditingQuestionId(q.id);
    setEditForm({
      questionText: q.questionText || "",
      choiceA: q.choiceA || "",
      choiceB: q.choiceB || "",
      choiceC: q.choiceC || "",
      choiceD: q.choiceD || "",
      correctAnswer: (q.correctAnswer || "A") as any,
      explanation: q.explanation || "",
    });
  };

  // Save Question Edits
  const handleSaveQuestion = async (q: any) => {
    if (!previewQuizData) return;
    if (
      !editForm.questionText.trim() ||
      !editForm.choiceA.trim() ||
      !editForm.choiceB.trim() ||
      !editForm.choiceC.trim() ||
      !editForm.choiceD.trim()
    ) {
      alert("กรุณากรอกโจทย์และตัวเลือก ก-ง ให้ครบถ้วน");
      return;
    }

    try {
      setIsSavingQuestion(true);
      const res = await fetch(`/api/quizzes/${previewQuizData.id}/questions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: q.id,
          questionText: editForm.questionText,
          choiceA: editForm.choiceA,
          choiceB: editForm.choiceB,
          choiceC: editForm.choiceC,
          choiceD: editForm.choiceD,
          correctAnswer: editForm.correctAnswer,
          explanation: editForm.explanation,
        }),
      });

      if (res.ok) {
        setPreviewQuizData((prev: any) => {
          if (!prev) return null;
          return {
            ...prev,
            questions: prev.questions.map((item: any) =>
              item.id === q.id
                ? {
                    ...item,
                    questionText: editForm.questionText,
                    choiceA: editForm.choiceA,
                    choiceB: editForm.choiceB,
                    choiceC: editForm.choiceC,
                    choiceD: editForm.choiceD,
                    correctAnswer: editForm.correctAnswer,
                    explanation: editForm.explanation,
                  }
                : item
            ),
          };
        });
        setEditingQuestionId(null);
      } else {
        const err = await res.json();
        alert(err.error || "ไม่สามารถบันทึกข้อสอบได้");
      }
    } catch (e) {
      console.error(e);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsSavingQuestion(false);
    }
  };

  // Add New Question to Existing Quiz
  const handleCreateQuestion = async () => {
    if (!previewQuizData) return;
    if (
      !newQuestionForm.questionText.trim() ||
      !newQuestionForm.choiceA.trim() ||
      !newQuestionForm.choiceB.trim() ||
      !newQuestionForm.choiceC.trim() ||
      !newQuestionForm.choiceD.trim()
    ) {
      alert("กรุณากรอกโจทย์และตัวเลือก ก-ง ให้ครบถ้วน");
      return;
    }

    try {
      setIsSavingNewQuestion(true);
      const res = await fetch(`/api/quizzes/${previewQuizData.id}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionText: newQuestionForm.questionText,
          choiceA: newQuestionForm.choiceA,
          choiceB: newQuestionForm.choiceB,
          choiceC: newQuestionForm.choiceC,
          choiceD: newQuestionForm.choiceD,
          correctAnswer: newQuestionForm.correctAnswer,
          explanation: newQuestionForm.explanation,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const createdQ = data.question;

        setPreviewQuizData((prev: any) => ({
          ...prev,
          totalQuestions: data.totalQuestions,
          questions: [...(prev.questions || []), createdQ],
        }));

        setQuizzesList((prev) =>
          prev.map((q) =>
            q.id === previewQuizData.id ? { ...q, totalQuestions: data.totalQuestions } : q
          )
        );

        // Reset form
        setNewQuestionForm({
          questionText: "",
          choiceA: "",
          choiceB: "",
          choiceC: "",
          choiceD: "",
          correctAnswer: "A",
          explanation: "",
        });
        setIsAddingQuestion(false);
      } else {
        const err = await res.json();
        alert(err.error || "ไม่สามารถเพิ่มข้อสอบใหม่ได้");
      }
    } catch (e) {
      console.error(e);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsSavingNewQuestion(false);
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (questionId: string, questionNumber: number) => {
    if (!previewQuizData) return;
    if (!confirm(`ยืนยันการลบข้อสอบข้อที่ ${questionNumber} หรือไม่?`)) return;

    try {
      setIsDeletingQuestionId(questionId);
      const res = await fetch(
        `/api/quizzes/${previewQuizData.id}/questions?questionId=${encodeURIComponent(questionId)}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        const data = await res.json();
        setPreviewQuizData((prev: any) => {
          const remaining = prev.questions
            .filter((item: any) => item.id !== questionId)
            .map((item: any, idx: number) => ({ ...item, questionNumber: idx + 1 }));
          return {
            ...prev,
            totalQuestions: data.totalQuestions,
            questions: remaining,
          };
        });

        setQuizzesList((prev) =>
          prev.map((q) =>
            q.id === previewQuizData.id ? { ...q, totalQuestions: data.totalQuestions } : q
          )
        );
      } else {
        const err = await res.json();
        alert(err.error || "ไม่สามารถลบข้อสอบได้");
      }
    } catch (e) {
      console.error(e);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsDeletingQuestionId(null);
    }
  };

  // Create New Quiz Submit
  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createQuizForm.title.trim() || !createQuizForm.code.trim()) {
      alert("กรุณากรอกชื่อแบบทดสอบและรหัสวิชา");
      return;
    }

    try {
      setIsCreatingQuiz(true);
      const targetRooms = createQuizForm.targetMode === "all" ? [] : createQuizForm.targetClassrooms;

      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: createQuizForm.title,
          code: createQuizForm.code,
          gradeLevel: createQuizForm.gradeLevel,
          description: createQuizForm.description || `แบบทดสอบเก็บคะแนน ${createQuizForm.code} ${createQuizForm.gradeLevel}`,
          timeLimitMinutes: createQuizForm.timeLimitMinutes,
          maxScore: createQuizForm.maxScore,
          targetClassrooms: targetRooms,
          isActive: createQuizForm.isActive,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        alert("สร้างแบบทดสอบใหม่เรียบร้อยแล้ว! คุณครูสามารถกด 'ดูข้อสอบ & แก้ไขโจทย์คำถาม' เพื่อเพิ่มคำถามได้ทันที");
        setQuizzesList((prev) => [data.quiz, ...prev]);
        setIsCreateQuizOpen(false);

        // Reset form
        setCreateQuizForm({
          gradeLevel: "ม.3",
          code: "ศ23101",
          title: "",
          description: "",
          timeLimitMinutes: 15,
          maxScore: 10,
          targetMode: "all",
          targetClassrooms: [],
          isActive: true,
        });

        // Automatically open question manager for this new quiz
        handleOpenPreviewAndEdit(data.quiz);
      } else {
        const err = await res.json();
        alert(err.error || "ไม่สามารถสร้างแบบทดสอบได้");
      }
    } catch (e) {
      console.error(e);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsCreatingQuiz(false);
    }
  };

  // Reset student attempt
  const handleResetAttempt = async (attempt: QuizAttempt) => {
    const confirmMsg = `ยืนยันการรีเซ็ตผลสอบของนักเรียน:\n${attempt.studentName} (รหัส ${attempt.studentId})\n\nการดำเนินการนี้จะลบคะแนนเดิม (${attempt.score}/${attempt.totalQuestions}) เพื่อให้นักเรียนสามารถเข้าทำข้อสอบใหม่ได้`;
    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/quizzes/attempts?id=${attempt.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("รีเซ็ตสิทธิ์ให้นักเรียนทำข้อสอบใหม่เรียบร้อยแล้ว");
        setAttempts((prev) => prev.filter((a) => a.id !== attempt.id));
      } else {
        const err = await res.json();
        alert(err.error || "ไม่สามารถรีเซ็ตผลสอบได้");
      }
    } catch (err) {
      console.error("Error resetting attempt:", err);
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (filteredAttempts.length === 0) {
      alert("ไม่มีข้อมูลสำหรับการส่งออก Excel");
      return;
    }

    const rows = filteredAttempts.map((att, idx) => {
      const quiz = quizzesList.find((q) => q.id === att.quizId);
      return {
        "ลำดับ": idx + 1,
        "รหัสนักเรียน": att.studentId,
        "ชื่อ-นามสกุล": att.studentName,
        "ห้องเรียน": att.classroom,
        "ระดับชั้น": quiz?.gradeLevel || "-",
        "รหัสวิชา": quiz?.code || "-",
        "ชื่อแบบทดสอบ": quiz?.title || att.quizId,
        "คะแนนที่ได้": att.score,
        "คะแนนเต็ม": att.totalQuestions,
        "ร้อยละ (%)": Math.round((att.score / att.totalQuestions) * 100),
        "สลับหน้าจอ (ครั้ง)": att.infractionsCount || 0,
        "วันเวลาที่ส่ง": new Date(att.submittedAt).toLocaleString("th-TH"),
        "สถานะ": att.status === "completed" ? "ปกติ" : att.status === "timed_out" ? "หมดเวลา" : "ส่งอัตโนมัติ (ฝ่าฝืน)"
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "คะแนนแบบทดสอบ");
    XLSX.writeFile(workbook, `คะแนนแบบทดสอบ_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  // Total questions in system
  const totalQuestionsInSystem = useMemo(() => {
    return quizzesList.reduce((acc, q) => acc + (q.totalQuestions || 0), 0);
  }, [quizzesList]);

  // Selected Quiz object
  const currentSelectedQuiz = useMemo(() => {
    return quizzesList.find((q) => q.id === selectedQuizFilter) || null;
  }, [quizzesList, selectedQuizFilter]);

  // Available rooms for filter dropdown
  const filterRooms = useMemo(() => {
    if (currentSelectedQuiz) {
      return getRoomsForGrade(currentSelectedQuiz.gradeLevel);
    }
    return [];
  }, [currentSelectedQuiz]);

  // Counts of submitted attempts per room
  const roomCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    attempts.forEach((a) => {
      if (selectedQuizFilter !== "all" && a.quizId !== selectedQuizFilter) return;
      const rawRoom = (a.classroom || "").trim();
      const normRoom = rawRoom.replace(/^ห้อง\s*/, "");
      counts[rawRoom] = (counts[rawRoom] || 0) + 1;
      counts[normRoom] = (counts[normRoom] || 0) + 1;
    });
    return counts;
  }, [attempts, selectedQuizFilter]);

  // Quiz Filter change handler
  const handleQuizFilterChange = (quizId: string) => {
    setSelectedQuizFilter(quizId);
    setSelectedRoomFilter("all");
  };

  // Filtered attempts
  const filteredAttempts = useMemo(() => {
    return attempts.filter((a) => {
      if (selectedQuizFilter !== "all" && a.quizId !== selectedQuizFilter) return false;
      if (selectedRoomFilter !== "all") {
        const normFilter = selectedRoomFilter.replace(/^ห้อง\s*/, "").trim();
        const normAttempt = (a.classroom || "").replace(/^ห้อง\s*/, "").trim();
        const isMatch =
          normAttempt === normFilter ||
          normAttempt === normFilter.replace("ม.", "") ||
          normFilter === normAttempt.replace("ม.", "");
        if (!isMatch) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = a.studentName.toLowerCase().includes(q);
        const matchId = a.studentId.toLowerCase().includes(q);
        const matchRoom = a.classroom.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchRoom) return false;
      }
      return true;
    });
  }, [attempts, selectedQuizFilter, selectedRoomFilter, searchQuery]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = attempts.length;
    const totalScore = attempts.reduce((acc, curr) => acc + curr.score, 0);
    const avg = total > 0 ? (totalScore / total).toFixed(1) : "0.0";
    const infractions = attempts.reduce((acc, curr) => acc + (curr.infractionsCount || 0), 0);
    return { total, avg, infractions };
  }, [attempts]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-prompt">
      {/* 1. Header Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">แบบทดสอบในระบบ</p>
            <h4 className="text-xl font-bold font-kanit text-gray-900 mt-0.5">
              {quizzesList.length} ชุด ({totalQuestionsInSystem} ข้อ)
            </h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">นักเรียนที่ทำแล้ว</p>
            <h4 className="text-xl font-bold font-kanit text-gray-900 mt-0.5">
              {stats.total} คน
            </h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">คะแนนเฉลี่ยรวม</p>
            <h4 className="text-xl font-bold font-kanit text-gray-900 mt-0.5">
              {stats.avg} คะแนน
            </h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">การสลับหน้าจอทั้งหมด</p>
            <h4 className="text-xl font-bold font-kanit text-gray-900 mt-0.5">
              {stats.infractions} ครั้ง
            </h4>
          </div>
        </div>
      </div>

      {/* 2. Real-time Release / Toggle Controls (การปล่อยแบบทดสอบ) */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold font-kanit text-gray-900 flex items-center gap-2">
              <Power className="w-5 h-5 text-orange-600" />
              <span>ระบบเปิด/ปิดการทำแบบทดสอบ (Release Controls)</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              ครูสามารถเปิด/ปิดระบบ สร้างแบบทดสอบเก็บคะแนนใหม่ และกำหนดห้องเรียนเฉพาะที่สอน เพื่อให้นักเรียนเข้าสอบได้
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCreateQuizOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold text-xs shadow-xs cursor-pointer transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ สร้างแบบทดสอบเก็บคะแนนใหม่</span>
            </button>
            <button
              type="button"
              onClick={fetchData}
              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
              title="รีเฟรชข้อมูล"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {quizzesList.map((quiz) => {
            const quizAttemptsCount = attempts.filter((a) => a.quizId === quiz.id).length;
            const targetRooms = Array.isArray(quiz.targetClassrooms) ? quiz.targetClassrooms : [];
            const hasTargetRooms = targetRooms.length > 0;

            const isFormative = quiz.title.includes("เก็บคะแนน");
            const isPretest = quiz.title.includes("ก่อนเรียน");
            const isPosttest = quiz.title.includes("หลังเรียน");

            return (
              <div
                key={quiz.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  quiz.isActive
                    ? "bg-emerald-50/40 border-emerald-300 shadow-2xs"
                    : "bg-gray-50/80 border-gray-200"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white border border-gray-200 font-mono text-orange-600">
                          {quiz.code} • {quiz.gradeLevel}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isFormative
                              ? "bg-amber-100 text-amber-800"
                              : isPretest
                              ? "bg-blue-100 text-blue-800"
                              : isPosttest
                              ? "bg-purple-100 text-purple-800"
                              : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {isFormative
                            ? "แบบทดสอบเก็บคะแนน"
                            : isPretest
                            ? "แบบทดสอบก่อนเรียน"
                            : isPosttest
                            ? "แบบทดสอบหลังเรียน"
                            : "แบบทดสอบออนไลน์"}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            quiz.isActive
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {quiz.isActive ? "● กำลังเปิดให้นักเรียนทำ" : "○ ปิดระบบ (ซ่อนจากนักเรียน)"}
                        </span>
                      </div>

                      <h4 className="font-bold text-gray-900 text-base font-kanit mt-2 leading-snug">
                        {quiz.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        {quiz.totalQuestions} ข้อ • คะแนนเต็ม {quiz.maxScore} คะแนน • เวลา {quiz.timeLimitMinutes} นาที
                      </p>
                    </div>

                    {/* Toggle Button */}
                    <button
                      type="button"
                      disabled={isToggling === quiz.id}
                      onClick={() => handleToggleQuiz(quiz.id, quiz.isActive)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-xs shrink-0 ${
                        quiz.isActive
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{quiz.isActive ? "เปิดอยู่ (คลิกปิด)" : "ปิดอยู่ (คลิกเปิด)"}</span>
                    </button>
                  </div>

                  {/* Target Classrooms Badge and Setting Button */}
                  <div className="mt-3.5 py-2.5 px-3.5 rounded-xl bg-white/80 border border-gray-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-gray-700 font-medium">
                      <School className="w-4 h-4 text-orange-600 shrink-0" />
                      <span>ห้องที่เปิดให้ทำ:</span>
                      {hasTargetRooms ? (
                        <span className="font-bold text-orange-800 bg-orange-100 px-2.5 py-0.5 rounded-md border border-orange-200">
                          เฉพาะ {targetRooms.length} ห้อง ({targetRooms.join(", ")})
                        </span>
                      ) : (
                        <span className="font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-200">
                          ทุกห้องในระดับชั้น {quiz.gradeLevel} (ทั้ง 14 ห้อง)
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => openTargetRoomsModal(quiz)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 hover:bg-orange-100/60 transition-colors cursor-pointer bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200"
                    >
                      <Settings2 className="w-3.5 h-3.5" />
                      <span>กำหนดห้องที่สอน</span>
                    </button>
                  </div>
                </div>

                {/* Actions: Question Edit & Delete Quiz */}
                <div className="mt-3.5 pt-3 border-t border-gray-200/60 flex items-center justify-between text-xs text-gray-600">
                  <span>ส่งแล้ว: <strong>{quizAttemptsCount}</strong> คน</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={isLoadingQuizDetails}
                      onClick={() => handleOpenPreviewAndEdit(quiz)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 font-bold border border-orange-200 cursor-pointer transition-colors shadow-2xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>ดูข้อสอบ & จัดการโจทย์ ({quiz.totalQuestions} ข้อ)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="ลบแบบทดสอบนี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Student Scores & Reports Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {/* Table Filters & Actions Header */}
        <div className="p-5 border-b border-gray-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหารหัส, ชื่อ หรือห้อง..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs w-48 sm:w-60 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Quiz Filter */}
            <select
              value={selectedQuizFilter}
              onChange={(e) => handleQuizFilterChange(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-medium bg-white focus:outline-none focus:border-orange-500 cursor-pointer shadow-2xs max-w-xs truncate"
            >
              <option value="all">แบบทดสอบทั้งหมด ({quizzesList.length} ชุด)</option>
              {quizzesList.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.gradeLevel}: {q.title} ({q.code})
                </option>
              ))}
            </select>

            {/* Classroom Filter */}
            <select
              value={selectedRoomFilter}
              onChange={(e) => setSelectedRoomFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-orange-200 hover:border-orange-400 text-xs font-medium bg-white focus:outline-none focus:border-orange-500 cursor-pointer shadow-2xs text-gray-800 transition-colors"
            >
              <option value="all">
                {currentSelectedQuiz
                  ? `ทุกห้องเรียน (${currentSelectedQuiz.gradeLevel} ทั้ง 14 ห้อง)`
                  : "ทุกห้องเรียน"}
              </option>

              {/* If specific quiz selected */}
              {currentSelectedQuiz && (
                filterRooms.map((room) => {
                  const cnt = roomCounts[room] || 0;
                  return (
                    <option key={room} value={room}>
                      ห้อง {room} {cnt > 0 ? `(${cnt} คน)` : ""}
                    </option>
                  );
                })
              )}

              {/* If All Quizzes selected: Group by all grades */}
              {!currentSelectedQuiz && (
                ALL_GRADES.map((grade) => (
                  <optgroup key={grade} label={`ระดับชั้น ${grade} (ห้อง 1-14)`}>
                    {getRoomsForGrade(grade).map((room) => {
                      const cnt = roomCounts[room] || 0;
                      return (
                        <option key={room} value={room}>
                          ห้อง {room} {cnt > 0 ? `(${cnt} คน)` : ""}
                        </option>
                      );
                    })}
                  </optgroup>
                ))
              )}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">
              แสดง {filteredAttempts.length} จาก {attempts.length} คน
            </span>
            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>ส่งออก Excel</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-700 uppercase">
              <tr>
                <th className="px-4 py-3 text-center w-12">#</th>
                <th className="px-4 py-3">รหัสนักเรียน</th>
                <th className="px-4 py-3">ชื่อ-นามสกุล</th>
                <th className="px-4 py-3">ห้อง</th>
                <th className="px-4 py-3">แบบทดสอบ</th>
                <th className="px-4 py-3 text-center">คะแนนที่ได้</th>
                <th className="px-4 py-3 text-center">สลับหน้าจอ (ครั้ง)</th>
                <th className="px-4 py-3">เวลาที่ส่ง</th>
                <th className="px-4 py-3 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400">
                    กำลังโหลดข้อมูลคะแนนสอบ...
                  </td>
                </tr>
              ) : filteredAttempts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400">
                    ยังไม่มีข้อมูลการส่งแบบทดสอบที่ตรงกับเงื่อนไข
                  </td>
                </tr>
              ) : (
                filteredAttempts.map((att, idx) => {
                  const quiz = quizzesList.find((q) => q.id === att.quizId);
                  const isHighInfraction = (att.infractionsCount || 0) >= 2;

                  return (
                    <tr key={att.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3 text-center text-gray-400 font-mono">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-gray-800">
                        {att.studentId}
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-900">
                        {att.studentName}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-lg bg-gray-100 font-mono text-[11px] font-semibold text-gray-700">
                          {att.classroom}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-gray-800">
                          {quiz ? `${quiz.gradeLevel} (${quiz.code}): ${quiz.title}` : att.quizId}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full font-bold font-kanit text-xs ${
                          att.score >= (att.totalQuestions * 0.75)
                            ? "bg-emerald-100 text-emerald-800"
                            : att.score >= (att.totalQuestions * 0.5)
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {att.score} / {att.totalQuestions}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {att.infractionsCount > 0 ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[11px] ${
                            isHighInfraction ? "bg-red-100 text-red-700" : "bg-amber-50 text-amber-700"
                          }`}>
                            <AlertTriangle className="w-3 h-3" />
                            {att.infractionsCount} ครั้ง
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[11px]">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-gray-500 whitespace-nowrap">
                        {new Date(att.submittedAt).toLocaleString("th-TH")}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleResetAttempt(att)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
                          title="ลบผลสอบเพื่อให้นักเรียนทำใหม่ได้"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>รีเซ็ตสิทธิ์</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. MODAL: Target Classrooms Setting (กำหนดห้องเรียนที่เปิดสอบ) */}
      {targetRoomsModalQuiz && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                  {targetRoomsModalQuiz.code} • {targetRoomsModalQuiz.gradeLevel}
                </span>
                <h3 className="text-lg font-bold text-gray-900 font-kanit mt-1">
                  กำหนดห้องเรียนที่เปิดให้ทำแบบทดสอบ
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  เลือกระดับชั้นและห้องเรียนที่ครูสอนเพื่อให้นักเรียนในห้องนั้นสามารถเข้าทำข้อสอบได้
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTargetRoomsModalQuiz(null)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Option 1: All rooms */}
              <label
                className={`p-4 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                  targetMode === "all"
                    ? "bg-orange-50/60 border-orange-300 ring-2 ring-orange-400/20"
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100/60"
                }`}
              >
                <input
                  type="radio"
                  name="targetMode"
                  checked={targetMode === "all"}
                  onChange={() => setTargetMode("all")}
                  className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                />
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    เปิดให้ทำทุกห้องเรียนในระดับชั้น {targetRoomsModalQuiz.gradeLevel}
                  </p>
                  <p className="text-xs text-gray-500">
                    นักเรียนทุกห้อง (ห้อง 1 ถึง 14 รวม 14 ห้อง) สามารถเข้าทำแบบทดสอบได้ทุกคน
                  </p>
                </div>
              </label>

              {/* Option 2: Specific rooms */}
              <label
                className={`p-4 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                  targetMode === "selective"
                    ? "bg-orange-50/60 border-orange-300 ring-2 ring-orange-400/20"
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100/60"
                }`}
              >
                <input
                  type="radio"
                  name="targetMode"
                  checked={targetMode === "selective"}
                  onChange={() => setTargetMode("selective")}
                  className="w-4 h-4 text-orange-600 focus:ring-orange-500 mt-0.5"
                />
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">
                    กำหนดเฉพาะห้องที่ครูสอน (เลือกได้หลายห้อง)
                  </p>
                  <p className="text-xs text-gray-500 mb-3">
                    เฉพาะนักเรียนในห้องที่เลือกเท่านั้นที่จะมองเห็นแบบทดสอบในระบบ
                  </p>

                  {/* Room Selection Checkboxes */}
                  {targetMode === "selective" && (
                    <div className="space-y-3 pt-2 border-t border-orange-200/60">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-700">
                          เลือกแล้ว {selectedTargetRooms.length} ห้อง:
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTargetRooms(getRoomsForGrade(targetRoomsModalQuiz.gradeLevel));
                            }}
                            className="text-[11px] font-bold text-orange-600 hover:underline cursor-pointer"
                          >
                            เลือกทั้งหมด 14 ห้อง
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            type="button"
                            onClick={() => setSelectedTargetRooms([])}
                            className="text-[11px] font-bold text-gray-500 hover:underline cursor-pointer"
                          >
                            ล้างการเลือก
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {getRoomsForGrade(targetRoomsModalQuiz.gradeLevel).map((room) => {
                          const isSelected = selectedTargetRooms.includes(room);
                          return (
                            <button
                              key={room}
                              type="button"
                              onClick={() => {
                                setSelectedTargetRooms((prev) =>
                                  prev.includes(room) ? prev.filter((r) => r !== room) : [...prev, room]
                                );
                              }}
                              className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                                isSelected
                                  ? "bg-orange-500 text-white border-orange-600 shadow-xs"
                                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                              }`}
                            >
                              <span>{room}</span>
                              {isSelected ? (
                                <Check className="w-3.5 h-3.5 text-white" />
                              ) : (
                                <Square className="w-3.5 h-3.5 text-gray-300" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </label>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setTargetRoomsModalQuiz(null)}
                className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-100 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={isSavingTargets || (targetMode === "selective" && selectedTargetRooms.length === 0)}
                onClick={handleSaveTargetRooms}
                className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingTargets ? "กำลังบันทึก..." : "บันทึกการตั้งค่าห้องเรียน"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: Preview & Question Editor (ดูชุดข้อสอบและแก้ไข/เพิ่มคำถาม) */}
      {previewQuizData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-start justify-between shrink-0 bg-white">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200 font-mono">
                    {previewQuizData.code} • {previewQuizData.gradeLevel}
                  </span>
                  <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                    จัดการคลังข้อสอบ ({previewQuizData.questions?.length || 0} ข้อ)
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 font-kanit mt-1.5">
                  {previewQuizData.title}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  ครูสามารถเพิ่มข้อสอบใหม่ แก้ไขโจทย์ หรือลบข้อสอบได้ทันที • ระบบจะปรับปรุงให้นักเรียนอัตโนมัติ
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingQuestion(!isAddingQuestion)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingQuestion ? "ปิดฟอร์มเพิ่มข้อสอบ" : "+ เพิ่มข้อสอบข้อใหม่"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewQuizData(null);
                    setEditingQuestionId(null);
                    setIsAddingQuestion(false);
                  }}
                  className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Questions List & Add Form */}
            <div className="p-5 overflow-y-auto space-y-4 bg-gray-50/50">
              {/* Form: Add New Question */}
              {isAddingQuestion && (
                <div className="bg-white p-5 rounded-2xl border-2 border-orange-500 shadow-lg space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <span className="px-3 py-1 rounded-xl bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5" />
                      <span>เพิ่มข้อสอบใหม่ (ข้อที่ {(previewQuizData.questions?.length || 0) + 1})</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddingQuestion(false)}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      ยกเลิก
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      ข้อความโจทย์คำถาม: *
                    </label>
                    <textarea
                      rows={3}
                      value={newQuestionForm.questionText}
                      onChange={(e) => setNewQuestionForm((prev) => ({ ...prev, questionText: e.target.value }))}
                      className="w-full p-3 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-medium"
                      placeholder="พิมพ์โจทย์คำถาม เช่น ทัศนธาตุหมายถึงอะไร?..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-700">
                      ตัวเลือกทั้ง 4 ตัวเลือก: *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { key: "A", field: "choiceA", label: "ก" },
                        { key: "B", field: "choiceB", label: "ข" },
                        { key: "C", field: "choiceC", label: "ค" },
                        { key: "D", field: "choiceD", label: "ง" },
                      ].map((c) => (
                        <div key={c.key} className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-orange-100 text-orange-800 font-bold text-xs flex items-center justify-center shrink-0">
                            {c.label}
                          </span>
                          <input
                            type="text"
                            value={(newQuestionForm as any)[c.field]}
                            onChange={(e) =>
                              setNewQuestionForm((prev) => ({ ...prev, [c.field]: e.target.value }))
                            }
                            className="flex-1 p-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                            placeholder={`พิมพ์ตัวเลือกข้อ ${c.label}...`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs font-bold text-emerald-900">
                      เลือกคำตอบที่ถูกต้อง (เฉลยข้อนี้): *
                    </span>
                    <div className="flex items-center gap-2">
                      {[
                        { key: "A", label: "ก" },
                        { key: "B", label: "ข" },
                        { key: "C", label: "ค" },
                        { key: "D", label: "ง" },
                      ].map((ans) => {
                        const isSelected = newQuestionForm.correctAnswer === ans.key;
                        return (
                          <button
                            key={ans.key}
                            type="button"
                            onClick={() =>
                              setNewQuestionForm((prev) => ({ ...prev, correctAnswer: ans.key as any }))
                            }
                            className={`w-8 h-8 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center ${
                              isSelected
                                ? "bg-emerald-600 text-white shadow-xs scale-105"
                                : "bg-white text-gray-700 border border-emerald-200 hover:bg-emerald-100"
                            }`}
                          >
                            {ans.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      คำอธิบายเฉลย (เหตุผลที่ข้อนี้ถูกต้อง):
                    </label>
                    <textarea
                      rows={2}
                      value={newQuestionForm.explanation}
                      onChange={(e) => setNewQuestionForm((prev) => ({ ...prev, explanation: e.target.value }))}
                      className="w-full p-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                      placeholder="พิมพ์คำอธิบายเหตุผลของเฉลยข้อนี้..."
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setIsAddingQuestion(false)}
                      className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold cursor-pointer"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="button"
                      disabled={isSavingNewQuestion}
                      onClick={handleCreateQuestion}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSavingNewQuestion ? "กำลังบันทึก..." : "บันทึกข้อสอบใหม่"}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Existing Questions List */}
              {previewQuizData.questions?.length === 0 && !isAddingQuestion && (
                <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-gray-900 font-kanit">
                    ยังไม่มีข้อสอบในชุดนี้
                  </h4>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    คลิกที่ปุ่ม "+ เพิ่มข้อสอบข้อใหม่" ด้านบนเพื่อเริ่มสร้างโจทย์คำถามและตัวเลือกสำหรับชุดนี้
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsAddingQuestion(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>เพิ่มข้อสอบข้อแรก</span>
                  </button>
                </div>
              )}

              {previewQuizData.questions?.map((q: any) => {
                const isEditing = editingQuestionId === q.id;

                if (isEditing) {
                  return (
                    <div
                      key={q.id}
                      className="bg-white p-5 rounded-2xl border-2 border-orange-400 shadow-md space-y-4 animate-in fade-in duration-150"
                    >
                      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <span className="px-3 py-1 rounded-xl bg-orange-500 text-white font-bold text-xs">
                          กำลังแก้ไขข้อที่ {q.questionNumber}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingQuestionId(null)}
                            className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold cursor-pointer"
                          >
                            ยกเลิก
                          </button>
                          <button
                            type="button"
                            disabled={isSavingQuestion}
                            onClick={() => handleSaveQuestion(q)}
                            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>{isSavingQuestion ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}</span>
                          </button>
                        </div>
                      </div>

                      {/* Question Textarea */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          ข้อความโจทย์คำถาม:
                        </label>
                        <textarea
                          rows={3}
                          value={editForm.questionText}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, questionText: e.target.value }))}
                          className="w-full p-3 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 leading-relaxed font-medium"
                          placeholder="พิมพ์โจทย์คำถาม..."
                        />
                      </div>

                      {/* Choices Grid */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-700">
                          ตัวเลือกทั้ง 4 ตัวเลือก:
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {[
                            { key: "A", field: "choiceA", label: "ก" },
                            { key: "B", field: "choiceB", label: "ข" },
                            { key: "C", field: "choiceC", label: "ค" },
                            { key: "D", field: "choiceD", label: "ง" },
                          ].map((c) => (
                            <div key={c.key} className="flex items-center gap-2">
                              <span className="w-7 h-7 rounded-lg bg-orange-100 text-orange-800 font-bold text-xs flex items-center justify-center shrink-0">
                                {c.label}
                              </span>
                              <input
                                type="text"
                                value={(editForm as any)[c.field]}
                                onChange={(e) =>
                                  setEditForm((prev) => ({ ...prev, [c.field]: e.target.value }))
                                }
                                className="flex-1 p-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                                placeholder={`ตัวเลือกข้อ ${c.label}...`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Correct Answer Selection */}
                      <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 flex flex-wrap items-center justify-between gap-3">
                        <span className="text-xs font-bold text-emerald-900">
                          เลือกคำตอบที่ถูกต้อง (เฉลยข้อนี้):
                        </span>
                        <div className="flex items-center gap-2">
                          {[
                            { key: "A", label: "ก" },
                            { key: "B", label: "ข" },
                            { key: "C", label: "ค" },
                            { key: "D", label: "ง" },
                          ].map((ans) => {
                            const isSelected = editForm.correctAnswer === ans.key;
                            return (
                              <button
                                key={ans.key}
                                type="button"
                                onClick={() =>
                                  setEditForm((prev) => ({ ...prev, correctAnswer: ans.key as any }))
                                }
                                className={`w-8 h-8 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center ${
                                  isSelected
                                    ? "bg-emerald-600 text-white shadow-xs scale-105"
                                    : "bg-white text-gray-700 border border-emerald-200 hover:bg-emerald-100"
                                }`}
                              >
                                {ans.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Explanation */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          คำอธิบายเฉลย (สำหรับครูและระบบตรวจ):
                        </label>
                        <textarea
                          rows={2}
                          value={editForm.explanation}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, explanation: e.target.value }))}
                          className="w-full p-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                          placeholder="พิมพ์คำอธิบายเหตุผลของข้อนี้..."
                        />
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={q.id}
                    className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 text-xs space-y-3 shadow-2xs hover:border-gray-300 transition-colors"
                  >
                    {/* Question Header & Edit/Delete Buttons */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-gray-900 text-sm flex items-start gap-2 flex-1">
                        <span className="px-2 py-0.5 rounded-lg bg-orange-100 text-orange-800 text-xs shrink-0 font-kanit">
                          ข้อ {q.questionNumber}
                        </span>
                        <span className="leading-relaxed">{q.questionText}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEditQuestion(q)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 font-bold text-xs cursor-pointer transition-colors shadow-2xs"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>แก้ไข</span>
                        </button>
                        <button
                          type="button"
                          disabled={isDeletingQuestionId === q.id}
                          onClick={() => handleDeleteQuestion(q.id, q.questionNumber)}
                          className="p-1.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                          title="ลบข้อนี้"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Choices Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {[
                        { key: "A", text: q.choiceA, label: "ก" },
                        { key: "B", text: q.choiceB, label: "ข" },
                        { key: "C", text: q.choiceC, label: "ค" },
                        { key: "D", text: q.choiceD, label: "ง" },
                      ].map((c) => {
                        const isCorrect = q.correctAnswer === c.key;
                        return (
                          <div
                            key={c.key}
                            className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                              isCorrect
                                ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-bold shadow-2xs"
                                : "bg-gray-50/60 border-gray-200 text-gray-700"
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                                isCorrect
                                  ? "bg-emerald-600 text-white"
                                  : "bg-gray-200 text-gray-600"
                              }`}
                            >
                              {c.label}
                            </span>
                            <span className="flex-1 leading-snug">{c.text}</span>
                            {isCorrect && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 ml-auto shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-[11px] text-gray-600">
                        <strong className="text-emerald-700">คำอธิบายเฉลย:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 flex items-center justify-between shrink-0 bg-white">
              <span className="text-xs text-gray-500 font-medium">
                ทั้งหมด {previewQuizData.questions?.length || 0} ข้อ
              </span>
              <button
                type="button"
                onClick={() => {
                  setPreviewQuizData(null);
                  setEditingQuestionId(null);
                  setIsAddingQuestion(false);
                }}
                className="px-6 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold cursor-pointer transition-colors"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: Create New Quiz (สร้างแบบทดสอบเก็บคะแนนใหม่) */}
      {isCreateQuizOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200 overflow-hidden max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-start justify-between shrink-0 bg-white">
              <div>
                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                  แบบทดสอบเก็บคะแนนระหว่างเรียน / ท้ายหน่วย
                </span>
                <h3 className="text-lg font-bold text-gray-900 font-kanit mt-1">
                  สร้างแบบทดสอบใหม่
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  ระบุรายละเอียดของแบบทดสอบ กำหนดห้องเรียน และเปิดให้นักเรียนทำได้ทันทีในคาบสอน
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateQuizOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleCreateQuiz} className="p-5 overflow-y-auto space-y-4 flex-1">
              {/* Grade Level Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  ระดับชั้น: *
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {ALL_GRADES.map((grade) => {
                    const isSelected = createQuizForm.gradeLevel === grade;
                    return (
                      <button
                        key={grade}
                        type="button"
                        onClick={() => {
                          setCreateQuizForm((prev) => ({
                            ...prev,
                            gradeLevel: grade,
                            code: DEFAULT_SUBJECT_CODES[grade] || prev.code,
                            targetClassrooms: [],
                          }));
                        }}
                        className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border text-center ${
                          isSelected
                            ? "bg-orange-600 text-white border-orange-600 shadow-xs"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {grade}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Code & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    รหัสวิชา: *
                  </label>
                  <input
                    type="text"
                    required
                    value={createQuizForm.code}
                    onChange={(e) => setCreateQuizForm((prev) => ({ ...prev, code: e.target.value }))}
                    className="w-full p-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-mono font-bold"
                    placeholder="เช่น ศ23101"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    ชื่อแบบทดสอบ: *
                  </label>
                  <input
                    type="text"
                    required
                    value={createQuizForm.title}
                    onChange={(e) => setCreateQuizForm((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full p-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-medium"
                    placeholder="เช่น แบบทดสอบเก็บคะแนน: เรื่องทัศนธาตุและการจัดองค์ประกอบ"
                  />
                </div>
              </div>

              {/* Quick Title Templates */}
              <div>
                <span className="text-[11px] text-gray-500 font-medium">เทมเพลตชื่อด่วน:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {[
                    "แบบทดสอบเก็บคะแนน: เรื่องทัศนธาตุ",
                    "แบบทดสอบเก็บคะแนน: เรื่องวงจรสีและการใช้สี",
                    "แบบทดสอบท้ายหน่วยที่ 1: การวาดเส้น",
                    "แบบทดสอบย่อยระหว่างเรียน",
                  ].map((tpl) => (
                    <button
                      key={tpl}
                      type="button"
                      onClick={() => setCreateQuizForm((prev) => ({ ...prev, title: tpl }))}
                      className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-orange-50 hover:text-orange-700 text-[11px] text-gray-600 transition-colors cursor-pointer border border-gray-200"
                    >
                      {tpl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  คำอธิบาย / คำชี้แจงสำหรับนักเรียน:
                </label>
                <textarea
                  rows={2}
                  value={createQuizForm.description}
                  onChange={(e) => setCreateQuizForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                  placeholder="เช่น ให้นักเรียนเลือกคำตอบที่ถูกต้องที่สุด มีเวลาทำ 15 นาที ระบบมีระบบ Anti-Cheat ล็อคหน้าจอ"
                />
              </div>

              {/* Time & Max Score */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    เวลาในการทำ (นาที): *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    required
                    value={createQuizForm.timeLimitMinutes}
                    onChange={(e) =>
                      setCreateQuizForm((prev) => ({ ...prev, timeLimitMinutes: Number(e.target.value) || 15 }))
                    }
                    className="w-full p-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    คะแนนเต็ม: *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    required
                    value={createQuizForm.maxScore}
                    onChange={(e) =>
                      setCreateQuizForm((prev) => ({ ...prev, maxScore: Number(e.target.value) || 10 }))
                    }
                    className="w-full p-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-bold"
                  />
                </div>
              </div>

              {/* Target Classrooms */}
              <div className="border border-gray-200 rounded-2xl p-3.5 space-y-3 bg-gray-50/50">
                <label className="block text-xs font-bold text-gray-800">
                  ห้องเรียนที่อนุญาตให้เข้าสอบ:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label
                    className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer text-xs ${
                      createQuizForm.targetMode === "all"
                        ? "bg-orange-50 border-orange-300 font-bold text-orange-900"
                        : "bg-white border-gray-200 text-gray-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="createTargetMode"
                      checked={createQuizForm.targetMode === "all"}
                      onChange={() => setCreateQuizForm((prev) => ({ ...prev, targetMode: "all" }))}
                      className="text-orange-600"
                    />
                    <span>เปิดให้ทุกห้องในระดับชั้น {createQuizForm.gradeLevel} (ทั้ง 14 ห้อง)</span>
                  </label>

                  <label
                    className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer text-xs ${
                      createQuizForm.targetMode === "selective"
                        ? "bg-orange-50 border-orange-300 font-bold text-orange-900"
                        : "bg-white border-gray-200 text-gray-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="createTargetMode"
                      checked={createQuizForm.targetMode === "selective"}
                      onChange={() => setCreateQuizForm((prev) => ({ ...prev, targetMode: "selective" }))}
                      className="text-orange-600"
                    />
                    <span>กำหนดเฉพาะห้องที่สอน</span>
                  </label>
                </div>

                {createQuizForm.targetMode === "selective" && (
                  <div className="space-y-2 pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-gray-700">
                        เลือกแล้ว {createQuizForm.targetClassrooms.length} ห้อง:
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setCreateQuizForm((prev) => ({
                              ...prev,
                              targetClassrooms: getRoomsForGrade(prev.gradeLevel),
                            }));
                          }}
                          className="font-bold text-orange-600 hover:underline cursor-pointer"
                        >
                          เลือกทั้งหมด 14 ห้อง
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          type="button"
                          onClick={() => setCreateQuizForm((prev) => ({ ...prev, targetClassrooms: [] }))}
                          className="text-gray-500 hover:underline cursor-pointer"
                        >
                          ล้างการเลือก
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                      {getRoomsForGrade(createQuizForm.gradeLevel).map((room) => {
                        const isSelected = createQuizForm.targetClassrooms.includes(room);
                        return (
                          <button
                            key={room}
                            type="button"
                            onClick={() => {
                              setCreateQuizForm((prev) => ({
                                ...prev,
                                targetClassrooms: prev.targetClassrooms.includes(room)
                                  ? prev.targetClassrooms.filter((r) => r !== room)
                                  : [...prev.targetClassrooms, room],
                              }));
                            }}
                            className={`p-1.5 rounded-lg border text-[11px] font-bold text-center transition-all cursor-pointer ${
                              isSelected
                                ? "bg-orange-500 text-white border-orange-600"
                                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                            }`}
                          >
                            {room}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Active Toggle Switch */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-emerald-950">
                    เปิดให้นักเรียนทำทันที (Active)
                  </p>
                  <p className="text-[11px] text-emerald-700">
                    เมื่อเปิดใช้งาน นักเรียนในห้องเรียนที่กำหนดจะมองเห็นแบบทดสอบและเริ่มทำได้ทันที
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCreateQuizForm((prev) => ({ ...prev, isActive: !prev.isActive }))}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    createQuizForm.isActive ? "bg-emerald-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white shadow-xs transition-transform transform ${
                      createQuizForm.isActive ? "translate-x-6.5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateQuizOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={
                    isCreatingQuiz ||
                    (createQuizForm.targetMode === "selective" && createQuizForm.targetClassrooms.length === 0)
                  }
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isCreatingQuiz ? "กำลังสร้าง..." : "สร้างแบบทดสอบ & เริ่มใส่ข้อสอบ"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

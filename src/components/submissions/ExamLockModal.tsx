"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { 
  ShieldAlert, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Maximize2, 
  ArrowRight, 
  ArrowLeft, 
  Send, 
  HelpCircle,
  X,
  Award
} from "lucide-react";

interface Question {
  id: string;
  questionNumber: number;
  questionText: string;
  choiceA: string;
  choiceB: string;
  choiceC: string;
  choiceD: string;
  imageUrl?: string | null;
}

interface ExamLockModalProps {
  quiz: {
    id: string;
    code: string;
    title: string;
    gradeLevel: string;
    totalQuestions: number;
    maxScore: number;
    timeLimitMinutes: number;
  };
  student: {
    id: string;
    name: string;
    classroom: string;
  };
  onClose: () => void;
  onSuccess: (score: number) => void;
}

export default function ExamLockModal({
  quiz,
  student,
  onClose,
  onSuccess,
}: ExamLockModalProps) {
  // Phase: 'intro' | 'exam' | 'submitting' | 'result'
  const [phase, setPhase] = useState<"intro" | "exam" | "submitting" | "result">("intro");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, "A" | "B" | "C" | "D">>({});
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<boolean>(false);

  // Anti-cheat states
  const [infractionsCount, setInfractionsCount] = useState<number>(0);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  const [warningReason, setWarningReason] = useState<string>("");
  const maxInfractions = 3;

  // Timer states (in seconds)
  const initialSeconds = (quiz.timeLimitMinutes || 30) * 60;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(initialSeconds);

  // Result state
  const [examResult, setExamResult] = useState<{
    score: number;
    totalQuestions: number;
    infractionsCount: number;
  } | null>(null);

  // Load questions when component mounts
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoadingQuestions(true);
        const res = await fetch(`/api/quizzes/${quiz.id}/questions`);
        const data = await res.json();
        if (data.questions && Array.isArray(data.questions)) {
          setQuestions(data.questions);
        }
      } catch (err) {
        console.error("Failed to load questions:", err);
      } finally {
        setIsLoadingQuestions(false);
      }
    };
    fetchQuestions();
  }, [quiz.id]);

  // Handle Fullscreen toggle
  const enterFullscreen = async () => {
    try {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
      } else if ((docEl as any).webkitRequestFullscreen) {
        await (docEl as any).webkitRequestFullscreen();
      }
    } catch (err) {
      console.warn("Fullscreen request denied or not supported:", err);
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn("Failed to exit fullscreen:", err);
    }
  };

  // Trigger Infraction handler
  const handleInfraction = useCallback((reason: string) => {
    if (phase !== "exam") return;

    setInfractionsCount((prev) => {
      const nextCount = prev + 1;
      setWarningReason(reason);
      setShowWarningModal(true);

      // Play alert beep safely via AudioContext
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass();
          if (audioCtx.state === "suspended") {
            audioCtx.resume().catch(() => {});
          }
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(440, audioCtx.currentTime);
          gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.3);
        }
      } catch {
        // audio context safely ignored if blocked by autoplay policy
      }

      return nextCount;
    });
  }, [phase]);

  // Anti-cheat Event Listeners during 'exam' phase
  useEffect(() => {
    if (phase !== "exam") return;

    // Detect mobile or touch device (iPhone, iPad, Android tablets/phones)
    const isTouchOrMobile = typeof window !== "undefined" && (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches ||
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    );

    // 1. Fullscreen change detection (enforced strictly on desktop browsers with full support)
    const handleFullscreenChange = () => {
      if (!isTouchOrMobile && !document.fullscreenElement) {
        handleInfraction("คุณได้ออกจากโหมดเต็มจอของหน้าต่างทำข้อสอบ");
      }
    };

    // 2. Visibility change (active on all platforms, catches tab switch or app switch 100% reliably)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleInfraction("ตรวจพบการสลับแท็บเบราว์เซอร์หรือสลับแอปพลิเคชัน");
      }
    };

    // 3. Window blur (on mobile, blur can be triggered by keyboard or scroll bounce; on desktop it detects clicking outside)
    const handleWindowBlur = () => {
      if (!isTouchOrMobile && !document.hidden) {
        handleInfraction("ตรวจพบการคลิกออกจากหน้าต่างข้อสอบหรือสลับโปรแกรม");
      }
    };

    // 4. Prevent inspect shortcuts and copy
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent F12, Ctrl+Shift+I, Ctrl+U, Alt+Tab hints, Ctrl+C, Ctrl+V
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "C" || e.key === "J")) ||
        (e.ctrlKey && (e.key === "u" || e.key === "U" || e.key === "p" || e.key === "P")) ||
        (e.altKey && e.key === "Tab")
      ) {
        e.preventDefault();
        handleInfraction("ไม่อนุญาตให้ใช้คีย์ลัดช่วยเหลือระหว่างการสอบ");
      }
    };

    // 5. Context menu prevent
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 6. Beforeunload warning
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "คุณกำลังทำข้อสอบอยู่ หากออกจากหน้านี้ ข้อสอบจะถูกส่งทันที";
      return e.returnValue;
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [phase, handleInfraction]);

  // Submit Exam handler
  const handleSubmitExam = useCallback(async (forcedStatus: "completed" | "timed_out" | "force_submitted" = "completed") => {
    setPhase("submitting");
    try {
      const res = await fetch("/api/quizzes/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: quiz.id,
          studentId: student.id,
          studentName: student.name,
          classroom: student.classroom,
          answers,
          infractionsCount,
          status: forcedStatus
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setExamResult({
          score: data.score,
          totalQuestions: data.totalQuestions || questions.length || 20,
          infractionsCount: data.infractionsCount || infractionsCount
        });
        setPhase("result");
        exitFullscreen();
        onSuccess(data.score);
      } else {
        alert(data.error || "เกิดข้อผิดพลาดในการส่งข้อสอบ");
        setPhase("exam");
      }
    } catch (err) {
      console.error("Error submitting exam:", err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย กรุณาลองใหม่อีกครั้ง");
      setPhase("exam");
    }
  }, [quiz.id, student, answers, infractionsCount, questions.length, onSuccess]);

  // Watch infractions limit
  useEffect(() => {
    if (infractionsCount >= maxInfractions && phase === "exam") {
      setShowWarningModal(false);
      alert(`⚠️ คุณได้ฝ่าฝืนสลับหน้าจอครบ ${maxInfractions} ครั้ง ระบบกำลังส่งข้อสอบอัตโนมัติ`);
      handleSubmitExam("force_submitted");
    }
  }, [infractionsCount, phase, handleSubmitExam]);

  // Timer countdown
  useEffect(() => {
    if (phase !== "exam") return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam("timed_out");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, handleSubmitExam]);

  // Start Exam
  const handleStartExam = async () => {
    await enterFullscreen();
    setPhase("exam");
  };

  // Answer selection
  const handleSelectChoice = (questionNum: number, choice: "A" | "B" | "C" | "D") => {
    setAnswers((prev) => ({
      ...prev,
      [questionNum]: choice
    }));
  };

  // Format MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const answeredCount = Object.keys(answers).length;
  const currentQuestion = questions[currentIdx];

  // ----------------------------------------------------
  // RENDER PHASE 1: INTRO / RULES MODAL
  // ----------------------------------------------------
  if (phase === "intro") {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 flex flex-col space-y-5 animate-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200 uppercase">
                  {quiz.code} • {quiz.gradeLevel}
                </span>
                <h3 className="font-bold text-gray-900 text-lg sm:text-xl font-kanit mt-0.5">
                  {quiz.title}
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Student Info Card */}
          <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-200/80 flex items-center justify-between text-xs text-gray-700">
            <span>ผู้สอบ: <strong className="text-gray-900">{student.name}</strong></span>
            <span className="font-mono font-bold text-orange-600">รหัส {student.id} • ห้อง {student.classroom}</span>
          </div>

          {/* Exam Rules & Anti-cheat conditions */}
          <div className="space-y-2.5 text-xs text-gray-700">
            <p className="font-bold text-gray-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>ข้อกำหนดและกติกาการสอบ (กรุณาอ่านให้เข้าใจก่อนเริ่มทำ):</span>
            </p>
            <ul className="space-y-1.5 list-disc list-inside text-gray-600 pl-1 leading-relaxed">
              <li>จำนวนข้อสอบทั้งหมด <strong>{quiz.totalQuestions} ข้อ</strong> (ปรนัย 4 ตัวเลือก ก, ข, ค, ง) คะแนนเต็ม {quiz.maxScore} คะแนน</li>
              <li>เวลาในการทำข้อสอบ <strong>{quiz.timeLimitMinutes} นาที</strong> (ระบบจะส่งข้อสอบอัตโนมัติเมื่อหมดเวลา)</li>
              <li>
                <span className="text-red-600 font-bold">ระบบล็อคหน้าจอ (Anti-Cheat):</span> เมื่อกดเริ่มทำ ระบบจะเข้าสู่โหมดเต็มจอ (Fullscreen) อัตโนมัติ <strong>ห้ามสลับแท็บ ห้ามย่อหน้าต่าง ห้ามคลิกออกนอกหน้าจอ</strong>
              </li>
              <li>
                หากตรวจพบการสลับแท็บหรือออกจากโหมดเต็มจอ ระบบจะแจ้งเตือนและบันทึกประวัติให้คุณครูทราบ <strong>หากฝ่าฝืนครบ {maxInfractions} ครั้ง ระบบจะส่งข้อสอบและยุติการสอบทันที</strong>
              </li>
              <li>ระบบไม่อนุญาตให้ใช้คีย์ลัด คัดลอก หรือคลิกขวาตลอดการสอบ</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 font-bold text-xs cursor-pointer"
            >
              ยกเลิก / ยังไม่พร้อม
            </button>

            <button
              type="button"
              onClick={handleStartExam}
              disabled={isLoadingQuestions || questions.length === 0}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs shadow-md shadow-red-600/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              style={{ backgroundColor: "#dc2626", color: "#ffffff" }}
            >
              <Maximize2 className="w-4 h-4" />
              <span>{isLoadingQuestions ? "กำลังโหลดข้อสอบ..." : "เข้าใจกติกาแล้ว • เริ่มทำแบบทดสอบ"}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER PHASE 4: RESULT MODAL (Completed)
  // ----------------------------------------------------
  if (phase === "result" && examResult) {
    const percentage = Math.round((examResult.score / examResult.totalQuestions) * 100);
    return (
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 text-center space-y-5 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <h3 className="text-xl font-bold font-kanit text-gray-900">
              ส่งแบบทดสอบก่อนเรียนเรียบร้อยแล้ว
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              ระบบได้ตรวจและบันทึกคะแนนของคุณส่งต่อไปยังคุณครูเรียบร้อยแล้ว
            </p>
          </div>

          {/* Score Box */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-200 text-emerald-950 space-y-1">
            <span className="text-xs font-semibold text-emerald-700 block">คะแนนที่ทำได้</span>
            <div className="text-4xl font-extrabold font-kanit text-emerald-600">
              {examResult.score} <span className="text-xl font-medium text-emerald-500">/ {examResult.totalQuestions}</span>
            </div>
            <div className="text-xs font-medium text-emerald-700 pt-1">
              คิดเป็น {percentage}% • แบบทดสอบก่อนเรียน
            </div>
          </div>

          {/* Infractions summary */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>ผู้สอบ: <strong className="text-gray-800">{student.name}</strong> (ห้อง {student.classroom})</p>
            <p className="text-[11px] text-gray-400">
              การสลับหน้าจอระหว่างสอบ: {examResult.infractionsCount} ครั้ง
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-md shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
          >
            เสร็จสิ้น • ปิดหน้าต่าง
          </button>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER PHASE 2 & 3: EXAM RUNNING / FULLSCREEN LOCKED
  // ----------------------------------------------------
  return (
    <div className="fixed inset-0 z-50 bg-gray-100 text-gray-900 flex flex-col select-none overflow-hidden font-sans">
      {/* 1. Locked Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
              {quiz.code} • โหมดล็อคหน้าจอ (Anti-Cheat)
            </span>
            <h1 className="text-xs sm:text-sm font-bold text-gray-900 truncate max-w-[200px] sm:max-w-md">
              {quiz.title}
            </h1>
          </div>
        </div>

        {/* Center: Timer Bar */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono font-bold text-xs sm:text-sm transition-colors ${
            secondsRemaining < 300 
              ? "bg-red-50 text-red-600 border-red-200 animate-pulse" 
              : "bg-gray-50 text-gray-700 border-gray-200"
          }`}>
            <Clock className="w-4 h-4 text-orange-500" />
            <span>{formatTime(secondsRemaining)}</span>
          </div>

          {/* Warning badge */}
          <div className="hidden md:flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>เตือน: {infractionsCount}/{maxInfractions}</span>
          </div>
        </div>

        {/* Right: Student name & Submit button */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right text-xs">
            <p className="font-bold text-gray-800 truncate max-w-[140px]">{student.name}</p>
            <p className="text-[10px] text-gray-500">ห้อง {student.classroom}</p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (answeredCount < questions.length) {
                if (confirm(`คุณยังตอบไม่ครบ (ตอบแล้ว ${answeredCount}/${questions.length} ข้อ)\nคุณแน่ใจหรือไม่ว่าต้องการส่งข้อสอบตอนนี้?`)) {
                  handleSubmitExam("completed");
                }
              } else {
                if (confirm("ยืนยันการส่งข้อสอบและตรวจคำตอบทันที?")) {
                  handleSubmitExam("completed");
                }
              }
            }}
            disabled={phase === "submitting"}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{phase === "submitting" ? "กำลังส่ง..." : "ส่งข้อสอบ"}</span>
          </button>
        </div>
      </header>

      {/* 2. Main Exam Layout: Question Navigator (Left) + Question Area (Right) */}
      <div 
        className="flex-1 flex flex-row overflow-hidden w-full"
        style={{ display: "flex", flexDirection: "row", height: "calc(100vh - 60px)" }}
      >
        {/* Sidebar Question Navigator (Left fixed 260px) */}
        <aside 
          className="bg-white border-r border-gray-200 p-4 shrink-0 flex flex-col justify-between overflow-y-auto"
          style={{ width: "260px", minWidth: "260px", maxWidth: "260px", height: "100%" }}
        >
          <div>
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-bold text-gray-700 flex items-center gap-1.5 font-kanit">
                <HelpCircle className="w-4 h-4 text-orange-500" />
                <span>แผนผังข้อสอบ ({questions.length} ข้อ)</span>
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                ทำแล้ว {answeredCount}/{questions.length}
              </span>
            </div>

            {/* Grid of 20 numbers: Always 5 columns */}
            <div 
              style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(5, minmax(0, 1fr))", 
                gap: "8px" 
              }}
            >
              {questions.map((q, idx) => {
                const isAnswered = Boolean(answers[q.questionNumber]);
                const isCurrent = currentIdx === idx;

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIdx(idx)}
                    className={`h-10 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer border ${
                      isCurrent
                        ? "ring-2 ring-orange-500 border-orange-500 bg-orange-50 text-orange-800 scale-105 shadow-xs font-extrabold"
                        : isAnswered
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {q.questionNumber}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 text-[11px] text-gray-500 space-y-2 mt-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-emerald-500 inline-block shrink-0" />
              <span>ตอบแล้ว ({answeredCount} ข้อ)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-gray-200 border border-gray-300 inline-block shrink-0" />
              <span>ยังไม่ตอบ ({questions.length - answeredCount} ข้อ)</span>
            </div>
          </div>
        </aside>

        {/* Main Question Display Area */}
        <main 
          className="flex-1 p-6 sm:p-10 overflow-y-auto flex flex-col justify-between"
          style={{ flex: "1 1 auto", height: "100%", overflowY: "auto" }}
        >
          <div className="max-w-3xl mx-auto w-full space-y-6">
            {currentQuestion ? (
              <>
                {/* Question Header */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <div className="flex items-center gap-2.5">
                    <span className="px-3.5 py-1 rounded-xl bg-orange-500 text-white font-bold text-xs font-kanit shadow-xs">
                      ข้อที่ {currentQuestion.questionNumber} จาก {questions.length}
                    </span>
                    {answers[currentQuestion.questionNumber] ? (
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> บันทึกคำตอบแล้ว
                      </span>
                    ) : (
                      <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 font-medium">
                        ยังไม่ได้เลือกคำตอบ
                      </span>
                    )}
                  </div>
                </div>

                {/* Question Text Box */}
                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-200 shadow-sm">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-relaxed font-kanit">
                    {currentQuestion.questionText}
                  </h2>
                </div>

                {/* 4 Choices */}
                <div className="space-y-3">
                  {[
                    { key: "A", text: currentQuestion.choiceA, label: "ก" },
                    { key: "B", text: currentQuestion.choiceB, label: "ข" },
                    { key: "C", text: currentQuestion.choiceC, label: "ค" },
                    { key: "D", text: currentQuestion.choiceD, label: "ง" },
                  ].map((choice) => {
                    const isSelected = answers[currentQuestion.questionNumber] === choice.key;

                    return (
                      <button
                        key={choice.key}
                        type="button"
                        onClick={() => handleSelectChoice(currentQuestion.questionNumber, choice.key as any)}
                        className={`w-full p-4 sm:p-5 rounded-2xl border text-left flex items-center gap-4 transition-all cursor-pointer ${
                          isSelected
                            ? "bg-orange-50 border-orange-500 text-orange-950 shadow-sm ring-2 ring-orange-500/20"
                            : "bg-white border-gray-200 hover:border-orange-300 hover:bg-orange-50/20 text-gray-800"
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl font-bold text-sm flex items-center justify-center shrink-0 border transition-colors ${
                          isSelected
                            ? "bg-orange-500 text-white border-orange-500 shadow-xs"
                            : "bg-gray-50 text-gray-700 border-gray-300"
                        }`}>
                          {choice.label}
                        </div>
                        <span className="text-sm sm:text-base font-medium leading-relaxed">
                          {choice.text}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-20 text-gray-400">
                กำลังโหลดข้อสอบ...
              </div>
            )}
          </div>

          {/* Navigation Controls (Prev / Next) */}
          <div className="max-w-3xl mx-auto w-full pt-6 border-t border-gray-200 flex items-center justify-between gap-3 mt-8">
            <button
              type="button"
              onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>ข้อก่อนหน้า</span>
            </button>

            <div className="text-xs text-gray-500 font-medium">
              ตอบแล้ว <strong>{answeredCount}</strong> จาก <strong>{questions.length}</strong> ข้อ
            </div>

            {currentIdx < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
                style={{ backgroundColor: "#f97316", color: "#ffffff" }}
              >
                <span>ข้อถัดไป</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (confirm("คุณทำถึงข้อสุดท้ายแล้ว ต้องการส่งข้อสอบและตรวจคำตอบทันทีหรือไม่?")) {
                    handleSubmitExam("completed");
                  }
                }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
                style={{ backgroundColor: "#059669", color: "#ffffff" }}
              >
                <Send className="w-3.5 h-3.5" />
                <span>ส่งข้อสอบ</span>
              </button>
            )}
          </div>
        </main>
      </div>

      {/* 3. Anti-Cheat Warning Popup (Infraction detected) */}
      {showWarningModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border-2 border-red-500 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center animate-bounce">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[11px] font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                การแจ้งเตือนความปลอดภัย (ครั้งที่ {infractionsCount} / {maxInfractions})
              </span>
              <h3 className="text-lg font-bold font-kanit text-gray-900 mt-2">
                ตรวจพบการออกจากหน้าต่างข้อสอบ!
              </h3>
              <p className="text-xs text-red-600 font-semibold mt-1">
                {warningReason}
              </p>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed font-light">
              ระบบไม่อนุญาตให้สลับแท็บ ย่อหน้าจอ หรือเปิดโปรแกรมอื่นในขณะทำแบบทดสอบ 
              หากตรวจพบการฝ่าฝืนครบ {maxInfractions} ครั้ง ระบบจะยุติและส่งข้อสอบของคุณทันที
            </p>

            <button
              type="button"
              onClick={async () => {
                setShowWarningModal(false);
                await enterFullscreen();
              }}
              className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 active:scale-95 transition-all cursor-pointer"
            >
              รับทราบ • กลับเข้าสู่โหมดเต็มจอ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

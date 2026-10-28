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
  const [showMobileMap, setShowMobileMap] = useState<boolean>(false);

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

  // Hide BottomNavbar and external floating widgets during exam
  useEffect(() => {
    document.body.classList.add("exam-mode-active");
    return () => {
      document.body.classList.remove("exam-mode-active");
    };
  }, []);

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

    // Detect mobile or touch device via screen/touch media features (Rule 5: No userAgent sniffing)
    const isTouchOrMobile = typeof window !== "undefined" && (
      'ontouchstart' in window ||
      (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) ||
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(hover: none)').matches
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

  // Confirm and submit helper
  const handleConfirmSubmit = useCallback(() => {
    if (answeredCount < questions.length) {
      if (confirm(`คุณยังตอบไม่ครบ (ตอบแล้ว ${answeredCount}/${questions.length} ข้อ)\nคุณแน่ใจหรือไม่ว่าต้องการส่งข้อสอบตอนนี้?`)) {
        handleSubmitExam("completed");
      }
    } else {
      if (confirm("ยืนยันการส่งข้อสอบและตรวจคำตอบทันที?")) {
        handleSubmitExam("completed");
      }
    }
  }, [answeredCount, questions.length, handleSubmitExam]);

  // ----------------------------------------------------
  // RENDER PHASE 1: INTRO / RULES MODAL
  // ----------------------------------------------------
  if (phase === "intro") {
    return (
      <div className="fixed inset-0 z-[99990] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
        <div className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full p-4 sm:p-7 shadow-2xl border border-gray-100 flex flex-col space-y-3.5 sm:space-y-5 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold shrink-0">
                <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <span className="text-[10px] sm:text-[11px] font-bold text-orange-600 bg-orange-50 px-2 sm:px-2.5 py-0.5 rounded-full border border-orange-200 uppercase">
                  {quiz.code} • {quiz.gradeLevel}
                </span>
                <h3 className="font-bold text-gray-900 text-base sm:text-xl font-kanit mt-0.5 leading-snug">
                  {quiz.title}
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center cursor-pointer shrink-0 ml-2"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Student Info Card */}
          <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 border border-gray-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-700 gap-1">
            <span>ผู้สอบ: <strong className="text-gray-900">{student.name}</strong></span>
            <span className="font-mono font-bold text-orange-600">รหัส {student.id} • ห้อง {student.classroom}</span>
          </div>

          {/* Exam Rules & Anti-cheat conditions */}
          <div className="space-y-2 text-xs text-gray-700">
            <p className="font-bold text-gray-900 flex items-center gap-1.5 text-xs sm:text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>ข้อกำหนดและกติกาการสอบ (กรุณาอ่านให้เข้าใจก่อนเริ่มทำ):</span>
            </p>
            <ul className="space-y-1.5 list-disc list-inside text-gray-600 pl-0.5 leading-relaxed text-[11px] sm:text-xs">
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

          {/* Action Buttons: Full-width stacked on mobile */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 pt-2">
            <button
              type="button"
              onClick={handleStartExam}
              disabled={isLoadingQuestions || questions.length === 0}
              className="w-full sm:w-auto order-1 sm:order-2 inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs shadow-md shadow-red-600/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              style={{ backgroundColor: "#dc2626", color: "#ffffff" }}
            >
              <Maximize2 className="w-4 h-4" />
              <span>{isLoadingQuestions ? "กำลังโหลดข้อสอบ..." : "เข้าใจกติกาแล้ว • เริ่มทำแบบทดสอบ"}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto order-2 sm:order-1 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 font-bold text-xs cursor-pointer text-center"
            >
              ยกเลิก / ยังไม่พร้อม
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
      <div className="fixed inset-0 z-[99990] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
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
    <div className="fixed inset-0 z-[99990] bg-gray-100 text-gray-900 flex flex-col select-none overflow-hidden font-sans h-dvh max-h-dvh">
      {/* 1. Locked Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between shadow-xs shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
            <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[9.5px] sm:text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200 inline-block truncate max-w-[130px] sm:max-w-none">
              {quiz.code} • ล็อคหน้าจอ
            </span>
            <h1 className="text-xs sm:text-sm font-bold text-gray-900 truncate max-w-[130px] xs:max-w-[180px] sm:max-w-md">
              {quiz.title}
            </h1>
          </div>
        </div>

        {/* Center: Timer Bar */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border font-mono font-bold text-xs sm:text-sm transition-colors ${
            secondsRemaining < 300 
              ? "bg-red-50 text-red-600 border-red-200 animate-pulse" 
              : "bg-gray-50 text-gray-700 border-gray-200"
          }`}>
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500" />
            <span>{formatTime(secondsRemaining)}</span>
          </div>

          {/* Warning badge */}
          <div className="hidden md:flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>เตือน: {infractionsCount}/{maxInfractions}</span>
          </div>
        </div>

        {/* Right: Student name & Submit button (Visible on both mobile & desktop) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden sm:block text-right text-xs">
            <p className="font-bold text-gray-800 truncate max-w-[140px]">{student.name}</p>
            <p className="text-[10px] text-gray-500">ห้อง {student.classroom}</p>
          </div>

          <button
            type="button"
            onClick={handleConfirmSubmit}
            disabled={phase === "submitting"}
            className="inline-flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{phase === "submitting" ? "ส่ง..." : "ส่งข้อสอบ"}</span>
          </button>
        </div>
      </header>

      {/* 2. Main Exam Layout: Question Navigator (Left sidebar on desktop) + Content Area */}
      <div 
        className="flex-1 flex flex-row min-h-0 overflow-hidden w-full relative"
      >
        {/* Sidebar Question Navigator (Visible on Desktop md:flex, Hidden on Mobile) */}
        <aside 
          className="hidden md:flex bg-white border-r border-gray-200 p-4 shrink-0 flex-col justify-between overflow-y-auto"
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

        {/* Right Content Area: Main scrollable questions + Pinned Bottom Bar */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden w-full">
          {/* Main Question Display Area */}
          <main 
            className="flex-1 p-3.5 sm:p-6 md:p-8 overflow-y-auto w-full"
          >
            <div className="max-w-3xl mx-auto w-full space-y-4 sm:space-y-6 pb-12 sm:pb-16">
              {currentQuestion ? (
                <>
                  {/* Question Header */}
                  <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-gray-200 gap-2">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      {/* Quick Prev Button */}
                      <button
                        type="button"
                        onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                        disabled={currentIdx === 0}
                        className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
                        title="ข้อก่อนหน้า"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>

                      <span className="px-2.5 sm:px-3.5 py-1 rounded-xl bg-orange-500 text-white font-bold text-xs font-kanit shadow-xs shrink-0">
                        ข้อที่ {currentQuestion.questionNumber} จาก {questions.length}
                      </span>

                      {/* Quick Next Button */}
                      <button
                        type="button"
                        onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                        disabled={currentIdx === questions.length - 1}
                        className="w-7 h-7 rounded-lg bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-2xs shrink-0"
                        title="ข้อถัดไป"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      {answers[currentQuestion.questionNumber] ? (
                        <span className="text-[11px] sm:text-xs font-semibold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 sm:px-2.5 py-0.5 rounded-full border border-emerald-200 shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> บันทึกแล้ว
                        </span>
                      ) : (
                        <span className="text-[11px] sm:text-xs text-amber-700 bg-amber-50 px-2 sm:px-2.5 py-0.5 rounded-full border border-amber-200 font-medium shrink-0">
                          ยังไม่ได้เลือกคำตอบ
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question Text Box */}
                  <div className="bg-white p-4 sm:p-6 md:p-7 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-xs">
                    <h2 className="text-base sm:text-xl font-bold text-gray-900 leading-relaxed font-kanit">
                      {currentQuestion.questionText}
                    </h2>
                  </div>

                  {/* 4 Choices */}
                  <div className="space-y-2.5 sm:space-y-3">
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
                          className={`w-full p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border text-left flex items-center gap-3 sm:gap-4 transition-all cursor-pointer ${
                            isSelected
                              ? "bg-orange-50 border-orange-500 text-orange-950 shadow-xs ring-2 ring-orange-500/20"
                              : "bg-white border-gray-200 hover:border-orange-300 hover:bg-orange-50/20 text-gray-800"
                          }`}
                        >
                          <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 border transition-colors ${
                            isSelected
                              ? "bg-orange-500 text-white border-orange-500 shadow-xs"
                              : "bg-gray-50 text-gray-700 border-gray-300"
                          }`}>
                            {choice.label}
                          </div>
                          <span className="text-xs sm:text-base font-medium leading-relaxed">
                            {choice.text}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Action Buttons: Directly below Choices ก, ข, ค, ง (Single unified row) */}
                  <div className="pt-4 sm:pt-6 border-t border-gray-100 flex items-center justify-between gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                      disabled={currentIdx === 0}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 font-bold text-xs sm:text-sm transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs active:scale-95 shrink-0"
                    >
                      <ArrowLeft className="w-4 h-4 shrink-0" />
                      <span className="hidden xs:inline">ข้อก่อนหน้า</span>
                      <span className="xs:hidden">ก่อนหน้า</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowMobileMap(true)}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-orange-50 hover:bg-orange-100 active:bg-orange-200/70 text-orange-800 font-bold text-xs sm:text-sm border border-orange-200/80 active:scale-95 transition-all cursor-pointer shadow-2xs"
                    >
                      <HelpCircle className="w-4 h-4 text-orange-500 shrink-0" />
                      <span className="truncate">ผังข้อ ({answeredCount}/{questions.length})</span>
                    </button>

                    {currentIdx < questions.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/25 active:scale-95 transition-all cursor-pointer shrink-0"
                        style={{ backgroundColor: "#f97316", color: "#ffffff" }}
                      >
                        <span>ข้อถัดไป</span>
                        <ArrowRight className="w-4 h-4 shrink-0" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleConfirmSubmit}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/25 active:scale-95 transition-all cursor-pointer shrink-0"
                        style={{ backgroundColor: "#059669", color: "#ffffff" }}
                      >
                        <Send className="w-4 h-4 shrink-0" />
                        <span>ส่งข้อสอบ</span>
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-20 text-gray-400">
                  กำลังโหลดข้อสอบ...
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* 3. Mobile Question Navigator Drawer / Bottom Sheet */}
      {showMobileMap && (
        <div 
          className="fixed inset-0 z-[99995] bg-black/60 backdrop-blur-xs flex flex-col justify-end md:hidden animate-in fade-in duration-200"
          onClick={() => setShowMobileMap(false)}
        >
          <div 
            className="bg-white rounded-t-3xl p-5 shadow-2xl border-t border-gray-200 max-h-[82vh] flex flex-col space-y-4 animate-in slide-in-from-bottom duration-250"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-orange-500" />
                <h3 className="font-bold text-gray-900 text-sm font-kanit">
                  แผนผังข้อสอบ ({questions.length} ข้อ)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  ทำแล้ว {answeredCount}/{questions.length}
                </span>
                <button
                  type="button"
                  onClick={() => setShowMobileMap(false)}
                  className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 hover:text-gray-800 flex items-center justify-center cursor-pointer ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Grid of 20 numbers: 5 columns */}
            <div 
              className="overflow-y-auto py-2"
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
                    onClick={() => {
                      setCurrentIdx(idx);
                      setShowMobileMap(false);
                    }}
                    className={`h-11 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer border ${
                      isCurrent
                        ? "ring-2 ring-orange-500 border-orange-500 bg-orange-50 text-orange-800 scale-105 shadow-xs font-extrabold"
                        : isAnswered
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 active:bg-emerald-100"
                        : "bg-gray-50 text-gray-600 border-gray-200 active:bg-gray-100"
                    }`}
                  >
                    {q.questionNumber}
                  </button>
                );
              })}
            </div>

            {/* Legend & Submit button */}
            <div className="pt-3 border-t border-gray-100 flex flex-col gap-3">
              <div className="flex items-center justify-between text-[11px] text-gray-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-emerald-500 inline-block shrink-0" />
                  <span>ตอบแล้ว ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-gray-200 border border-gray-300 inline-block shrink-0" />
                  <span>ยังไม่ตอบ ({questions.length - answeredCount})</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowMobileMap(false);
                  handleConfirmSubmit();
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>ส่งข้อสอบทันที ({answeredCount}/{questions.length} ข้อ)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Anti-Cheat Warning Popup (Infraction detected) */}
      {showWarningModal && (
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-7 shadow-2xl border-2 border-red-500 text-center space-y-4 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center animate-bounce">
              <ShieldAlert className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>

            <div>
              <span className="text-[10px] sm:text-[11px] font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                การแจ้งเตือนความปลอดภัย (ครั้งที่ {infractionsCount} / {maxInfractions})
              </span>
              <h3 className="text-base sm:text-lg font-bold font-kanit text-gray-900 mt-2">
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

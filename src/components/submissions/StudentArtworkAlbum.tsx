"use client";

import React, { useState } from "react";
import { 
  Palette, 
  Sparkles, 
  Maximize2, 
  Printer, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  BookOpen, 
  MessageSquare, 
  ExternalLink,
  Edit3,
  X,
  ChevronRight,
  Eye,
  Lock
} from "lucide-react";

interface StudentArtworkAlbumProps {
  student: { id: string; name: string; classroom: string };
  assignments: any[];
  subMap: Map<string, any>;
  onViewFullscreen: (imageUrl: string) => void;
  onOpenSubmitModal: (assignment: any) => void;
  onSwitchToAssignments: () => void;
}

export default function StudentArtworkAlbum({
  student,
  assignments,
  subMap,
  onViewFullscreen,
  onOpenSubmitModal,
  onSwitchToAssignments,
}: StudentArtworkAlbumProps) {
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>("all");
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [activeFeedbackModal, setActiveFeedbackModal] = useState<{
    title: string;
    score: number | null;
    maxScore: number;
    feedback: string;
    concept?: string;
  } | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // Filter assignments that have submitted artwork images
  const submittedWorks = assignments
    .map((assignment) => {
      const sub = subMap.get(assignment.id);
      if (!sub || (!sub.imageUrl && !sub.fileUrl)) return null;
      return {
        assignment,
        submission: sub,
      };
    })
    .filter(Boolean) as { assignment: any; submission: any }[];

  // Collect unique subjects from submitted works
  const subjects = Array.from(
    new Set(
      submittedWorks.map(
        (item) => item.assignment?.subject?.name || item.assignment?.subjectId || "วิชาศิลปะ"
      )
    )
  );

  const filteredWorks = submittedWorks.filter((item) => {
    if (selectedSubjectFilter === "all") return true;
    const subName = item.assignment?.subject?.name || item.assignment?.subjectId || "วิชาศิลปะ";
    return subName === selectedSubjectFilter;
  });

  // Calculate statistics
  const totalSubmitted = submittedWorks.length;
  const gradedWorks = submittedWorks.filter((w) => w.submission.status === "graded");
  
  const totalEarnedScore = gradedWorks.reduce((acc, curr) => acc + (curr.submission.score || 0), 0);
  const totalPossibleScore = gradedWorks.reduce(
    (acc, curr) => acc + (curr.assignment.maxScore || 10),
    0
  );
  const rawPercentage = totalPossibleScore > 0 ? Math.round((totalEarnedScore / totalPossibleScore) * 100) : 0;
  const scorePercentage = Math.min(100, rawPercentage);

  const handlePrint = () => {
    setIsPrintModalOpen(true);
  };

  const executeBrowserPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 1. Sleek Album Header & Control Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold font-kanit text-gray-900">
                คลังผลงานศิลปะของฉัน (My Artwork Gallery)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">
                {totalSubmitted} ชิ้นงาน
              </span>
              {gradedWorks.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  เฉลี่ย {scorePercentage}%
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 font-light">
              รูปภาพผลงานศิลปะทั้งหมดที่คุณส่ง สามารถแตะดูภาพขยายและอ่านคำชมจากคุณครูได้
            </p>
          </div>
        </div>

        {/* Print Dossier Button */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={handlePrint}
            disabled={totalSubmitted === 0}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs border border-orange-200 shadow-2xs active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            title="พิมพ์เอกสารรับรองแฟ้มสะสมผลงานศิลปะ"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์แฟ้มผลงาน</span>
          </button>
        </div>
      </div>

      {/* 2. Filter by Subject (if multiple subjects exist) */}
      {subjects.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            type="button"
            onClick={() => setSelectedSubjectFilter("all")}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              selectedSubjectFilter === "all"
                ? "bg-orange-500 text-white shadow-xs"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            ทุกรายวิชา ({totalSubmitted})
          </button>
          {subjects.map((sub) => (
            <button
              key={sub}
              type="button"
              onClick={() => setSelectedSubjectFilter(sub)}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedSubjectFilter === sub
                  ? "bg-orange-500 text-white shadow-xs"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      {/* 3. Empty State (No works submitted yet) */}
      {totalSubmitted === 0 ? (
        <div className="bg-white rounded-3xl p-10 sm:p-14 border border-gray-100 text-center shadow-xs space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto shadow-inner border border-orange-100">
            <Palette className="w-10 h-10 stroke-[1.5]" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-lg font-bold font-kanit text-gray-900">
              ยังไม่มีรูปภาพผลงานในคลังสะสมของคุณ
            </h3>
            <p className="text-xs text-gray-500 font-light leading-relaxed">
              เมื่อคุณส่งภาพถ่ายผลงานศิลปะในแต่ละภาระงาน รูปผลงานจะถูกรวบรวมมาจัดแสดงในคลังภาพนี้โดยอัตโนมัติ
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={onSwitchToAssignments}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>ไปที่หน้ารายการงานที่ต้องส่ง</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* 4. Modern Visual Photo Gallery (2-3 Columns) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredWorks.map(({ assignment, submission }) => {
            const artworkImg = submission.imageUrl || submission.fileUrl;
            const isGraded = (submission.status === "graded" || (submission.score !== null && submission.score !== undefined)) && submission.status !== "resubmit";
            const maxScore = assignment.maxScore || 10;
            const score = submission.score;
            const percentage = isGraded && score !== null ? Math.min(100, Math.round((score / maxScore) * 100)) : 0;
            const isFailed = Boolean(failedImages[submission.id]);

            return (
              <div
                key={assignment.id}
                className="bg-white rounded-3xl overflow-hidden border border-gray-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col group"
              >
                {/* Visual Image Preview with Zoom on Tap */}
                <div
                  onClick={() => artworkImg && onViewFullscreen(artworkImg)}
                  className="relative aspect-[4/3] w-full bg-slate-900/5 flex items-center justify-center overflow-hidden cursor-zoom-in group/img"
                  title="แตะเพื่อดูรูปภาพขนาดเต็ม"
                >
                  {artworkImg && !isFailed && (
                    <div
                      className="absolute inset-0 scale-125 blur-2xl opacity-20 pointer-events-none"
                      style={{
                        backgroundImage: `url(${artworkImg})`,
                        backgroundPosition: "center",
                        backgroundSize: "cover",
                      }}
                    />
                  )}

                  {artworkImg && !isFailed ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={artworkImg}
                      alt={assignment.title}
                      onError={() => setFailedImages((prev) => ({ ...prev, [submission.id]: true }))}
                      className="relative h-full w-full object-contain p-2 transition-transform duration-300 group-hover/img:scale-105"
                    />
                  ) : (
                    <div className="text-center p-6 bg-orange-50/60 rounded-2xl border border-orange-200/50 m-4 w-full flex flex-col items-center justify-center">
                      <Palette className="w-10 h-10 text-orange-400 mb-2" />
                      <p className="font-bold text-xs text-orange-950 font-kanit">
                        {assignment.title}
                      </p>
                      <p className="text-[11px] text-orange-700/80 mt-0.5">
                        {isGraded ? "แตะเพื่อดูภาพขยาย" : "แตะเพื่อดูหรือแก้ไขรูปภาพ"}
                      </p>
                    </div>
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
                    <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold shadow-xs bg-white/95 backdrop-blur-md text-gray-800 border border-gray-200">
                      {assignment.subject ? assignment.subject.name : "วิชาศิลปะ"}
                    </span>
                    {submission.technique && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/90 backdrop-blur-md text-white shadow-xs">
                        {submission.technique}
                      </span>
                    )}
                  </div>

                  {/* Hover Zoom Prompt */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white font-semibold text-xs gap-1.5 backdrop-blur-[1px] pointer-events-none">
                    <Maximize2 className="w-4 h-4" />
                    <span>แตะเพื่อดูภาพขยาย</span>
                  </div>
                </div>

                {/* Card Info Body */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <h4 className="font-bold text-gray-900 text-sm sm:text-base font-kanit leading-snug line-clamp-2">
                      {assignment.title}
                    </h4>

                    {/* Score and Status Pill */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(submission.submittedAt).toLocaleDateString("th-TH")}</span>
                      </div>

                      {isGraded ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{score} / {maxScore} ({percentage}%)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>รอครูตรวจ</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    {/* Teacher Feedback Button */}
                    {submission.feedback ? (
                      <button
                        type="button"
                        onClick={() =>
                          setActiveFeedbackModal({
                            title: assignment.title,
                            score,
                            maxScore,
                            feedback: submission.feedback,
                            concept: submission.concept,
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 transition-all cursor-pointer active:scale-95"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>ดูคำชมจากครู</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-gray-400 italic">
                        {isGraded ? "ไม่มีข้อความเพิ่มเติม" : "รอข้อเสนอแนะ"}
                      </span>
                    )}

                    <div className="flex items-center gap-1.5">
                      {isGraded ? (
                        <span 
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200/80 select-none"
                          title="ครูตรวจประเมินผลงานแล้ว ระบบบันทึกคะแนนและไม่อนุญาตให้แก้ไข (ดูได้อย่างเดียว)"
                        >
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                          <span>ดูได้อย่างเดียว</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onOpenSubmitModal(assignment)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-orange-600 hover:text-orange-700 hover:bg-orange-50 font-bold text-xs transition-colors cursor-pointer"
                          title="แก้ไขหรือส่งภาพใหม่"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>แก้ไข</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => artworkImg && onViewFullscreen(artworkImg)}
                        className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                        title="ดูภาพขยาย"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Teacher Feedback Modal Dialog */}
      {activeFeedbackModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setActiveFeedbackModal(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-base font-kanit text-gray-900">
                    ผลการตรวจและคำติชมจากคุณครู
                  </h4>
                  <p className="text-xs text-gray-400">{activeFeedbackModal.title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveFeedbackModal(null)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Score Box */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900">คะแนนประเมินที่ได้:</span>
              <span className="text-base font-black text-emerald-700 font-kanit">
                {activeFeedbackModal.score} / {activeFeedbackModal.maxScore} คะแนน
              </span>
            </div>

            {/* Teacher's Feedback */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-700 block">
                ข้อเสนอแนะจากคุณครูผู้สอน:
              </span>
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs sm:text-sm text-gray-800 leading-relaxed italic">
                &quot;{activeFeedbackModal.feedback}&quot;
              </div>
            </div>

            {/* Concept if present */}
            {activeFeedbackModal.concept && (
              <div className="space-y-1 pt-1">
                <span className="text-xs font-semibold text-gray-500 block">
                  แนวคิดของผลงานที่คุณส่ง:
                </span>
                <p className="text-xs text-gray-600 bg-orange-50/50 p-3 rounded-xl border border-orange-100">
                  {activeFeedbackModal.concept}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setActiveFeedbackModal(null)}
              className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-colors cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}

      {/* 6. Printable Portfolio Dossier Modal */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto print:p-0 print:bg-white print:static">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90dvh] overflow-y-auto shadow-2xl border border-gray-100 p-4 sm:p-8 space-y-6 print:max-w-none print:shadow-none print:border-none print:p-0">
            {/* Modal Controls (Hidden in Print) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-orange-600 shrink-0" />
                <h3 className="font-bold text-gray-900 text-base sm:text-lg font-kanit">
                  ตัวอย่างแฟ้มสะสมผลงาน (Print Preview)
                </h3>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={executeBrowserPrint}
                  className="px-3.5 sm:px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span><span className="hidden sm:inline">สั่งพิมพ์ / </span>บันทึกเป็น PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* PRINT CONTENT AREA */}
            <div id="printable-dossier" className="space-y-6 text-gray-900 font-sans">
              <div className="text-center pb-4 border-b-2 border-gray-900 space-y-1">
                <h1 className="text-xl sm:text-2xl font-bold font-kanit">
                  แฟ้มสะสมผลงานศิลปะออนไลน์ (Student Art Portfolio Dossier)
                </h1>
                <p className="text-sm font-semibold text-gray-700">
                  กลุ่มสาระการเรียนรู้ศิลปะ โรงเรียนวชิรธรรมสาธิต
                </p>
                <p className="text-xs text-gray-500">
                  เอกสารสรุปผลงานและการประเมินผลการเรียนรู้รายบุคคล
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-gray-500 block">ชื่อ-นามสกุล นักเรียน:</span>
                  <span className="font-bold text-sm text-gray-900">{student.name}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">ระดับชั้น / ห้องเรียน:</span>
                  <span className="font-bold text-sm text-gray-900">
                    {student.classroom ? `ห้อง ${student.classroom}` : "-"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">เลขประจำตัวนักเรียน:</span>
                  <span className="font-bold text-sm font-mono text-gray-900">{student.id}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">จำนวนชิ้นงานที่ส่ง:</span>
                  <span className="font-bold text-gray-900">{totalSubmitted} ชิ้นงาน</span>
                </div>
                <div>
                  <span className="text-gray-500 block">คะแนนสะสมรวม:</span>
                  <span className="font-bold text-emerald-700">
                    {totalEarnedScore} / {totalPossibleScore || "-"} คะแนน
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">ผลการประเมินเฉลี่ย:</span>
                  <span className="font-bold text-emerald-700">
                    {totalPossibleScore > 0 ? `${scorePercentage}%` : "-"}
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-1">
                  รายการผลงานที่จัดแสดงในแฟ้มสะสมงาน ({submittedWorks.length} ชิ้น)
                </h3>

                <div className="space-y-6">
                  {submittedWorks.map(({ assignment, submission }, idx) => {
                    const artworkImg = submission.imageUrl || submission.fileUrl;
                    const maxScore = assignment.maxScore || 10;
                    const score = submission.score;

                    return (
                      <div
                        key={assignment.id}
                        className="border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-start break-inside-avoid"
                      >
                        {artworkImg && (
                          <div className="w-36 h-36 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center shrink-0 border border-gray-200">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={artworkImg}
                              alt={assignment.title}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}

                        <div className="flex-1 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-gray-400 font-bold">#{idx + 1}</span>
                            {submission.status === "graded" ? (
                              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                ได้คะแนน {score} / {maxScore} คะแนน
                              </span>
                            ) : (
                              <span className="text-amber-600 font-medium">รอตรวจประเมิน</span>
                            )}
                          </div>

                          <h4 className="font-bold text-sm text-gray-900 font-kanit">
                            {assignment.title}
                          </h4>

                          <p className="text-gray-500 text-[11px]">
                            วิชา: {assignment.subject ? assignment.subject.name : "วิชาศิลปะ"} | 
                            ส่งเมื่อ: {new Date(submission.submittedAt).toLocaleDateString("th-TH")}
                          </p>

                          {submission.concept && (
                            <p className="text-gray-700 bg-gray-50 p-2 rounded-lg italic">
                              &quot;{submission.concept}&quot;
                            </p>
                          )}

                          {submission.feedback && (
                            <div className="text-emerald-900 bg-emerald-50/50 p-2 rounded-lg">
                              <span className="font-bold block text-[11px]">บันทึกจากครูผู้สอน:</span>
                              <p className="italic">{submission.feedback}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs break-inside-avoid">
                <div className="space-y-8">
                  <div className="h-10 border-b border-gray-400 w-48 mx-auto" />
                  <div>
                    <p className="font-bold">({student.name})</p>
                    <p className="text-gray-500">นักเรียนผู้จัดทำแฟ้มสะสมผลงาน</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="h-10 border-b border-gray-400 w-48 mx-auto" />
                  <div>
                    <p className="font-bold">(........................................................)</p>
                    <p className="text-gray-500">ครูผู้สอน / ผู้ประเมินผลการเรียนรู้</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  FileText, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Paperclip,
  RefreshCw,
  Trash2,
  Info,
  Edit3,
  Sparkles,
  Crop,
  RotateCw,
  Lock
} from "lucide-react";
import ImageEditorModal from "@/components/common/ImageEditorModal";

interface SubmitWorkModalProps {
  assignment: any;
  student: { id: string; name: string; classroom: string };
  existingSubmission?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SubmitWorkModal({
  assignment,
  student,
  existingSubmission,
  onClose,
  onSuccess,
}: SubmitWorkModalProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(existingSubmission?.imageUrl || "");
  const [isImageRemoved, setIsImageRemoved] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [externalLink, setExternalLink] = useState<string>(existingSubmission?.externalLink || "");
  const [concept, setConcept] = useState<string>(existingSubmission?.concept || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [aiSuccessMessage, setAiSuccessMessage] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorFile, setEditorFile] = useState<File | null>(null);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    isLate: boolean;
    isEdit: boolean;
    submittedAt: string;
    room: string;
    imagePreview?: string;
    externalLink?: string;
    concept?: string;
    docFileName?: string;
  } | null>(null);

  const isExpired = assignment.dueDate ? new Date() > new Date(assignment.dueDate) : false;

  const defaultRoom = student.classroom || (assignment.classroomsList && assignment.classroomsList.length === 1 ? assignment.classroomsList[0] : "") || "ม.3/1";
  const [selectedRoom, setSelectedRoom] = useState<string>(defaultRoom);

  const isGraded = Boolean(
    existingSubmission &&
    (existingSubmission.status === "graded" || (existingSubmission.score !== null && existingSubmission.score !== undefined)) &&
    existingSubmission.status !== "resubmit"
  );

  // Convert current preview to File for ImageEditorModal if needed
  const getFileFromCurrentPreview = async (): Promise<File | null> => {
    if (imageFile) return imageFile;
    if (!imagePreview) return null;
    try {
      const res = await fetch(imagePreview);
      const blob = await res.blob();
      return new File([blob], "artwork.jpg", { type: blob.type || "image/jpeg" });
    } catch {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imagePreview;
        img.onload = () => {
          const c = document.createElement("canvas");
          c.width = img.naturalWidth || img.width;
          c.height = img.naturalHeight || img.height;
          const ctx = c.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            c.toBlob((b) => {
              if (b) {
                resolve(new File([b], "artwork.jpg", { type: "image/jpeg" }));
              } else {
                resolve(null);
              }
            }, "image/jpeg", 0.92);
          } else {
            resolve(null);
          }
        };
        img.onerror = () => resolve(null);
      });
    }
  };

  const handleOpenEditor = async () => {
    if (imageFile) {
      setEditorFile(imageFile);
      setIsEditorOpen(true);
    } else if (imagePreview) {
      setIsAiProcessing(true);
      const f = await getFileFromCurrentPreview();
      setIsAiProcessing(false);
      if (f) {
        setEditorFile(f);
        setIsEditorOpen(true);
      }
    }
  };

  const handleEditorSave = (editedFile: File) => {
    setImageFile(editedFile);
    setImagePreview(URL.createObjectURL(editedFile));
    setIsImageRemoved(false);
    setIsEditorOpen(false);
    setAiSuccessMessage("✂️ ครอปและปรับสัดส่วนภาพเรียบร้อยแล้ว!");
    setTimeout(() => setAiSuccessMessage(""), 4000);
  };

  // 1-Click AI Auto Enhance: balances contrast, vibrance, brightness, and details
  const handleAiAutoEnhance = async () => {
    if (!imagePreview || isAiProcessing) return;
    setIsAiProcessing(true);
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imagePreview;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Tuned for artwork: boost contrast, pop vibrance, slight brightness for dim classroom photos
        ctx.filter = "contrast(115%) saturate(118%) brightness(103%)";
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const fileName = imageFile ? imageFile.name.replace(/\.[^/.]+$/, "") : "artwork";
              const enhancedFile = new File([blob], `${fileName}-ai-enhanced.jpg`, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              setImageFile(enhancedFile);
              setImagePreview(URL.createObjectURL(enhancedFile));
              setIsImageRemoved(false);
              setAiSuccessMessage("✨ AI ปรับแสง สีสัน และความคมชัดของผลงานให้สวยงามขึ้นแล้ว!");
              setTimeout(() => setAiSuccessMessage(""), 4000);
            }
            setIsAiProcessing(false);
          },
          "image/jpeg",
          0.92
        );
      } else {
        setIsAiProcessing(false);
      }
    } catch (err) {
      console.error("AI auto enhance failed:", err);
      setIsAiProcessing(false);
    }
  };

  // 1-Click 90° Clockwise Rotation
  const handleQuickRotate = async () => {
    if (!imagePreview || isAiProcessing) return;
    setIsAiProcessing(true);
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imagePreview;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalHeight || img.height;
      canvas.height = img.naturalWidth || img.width;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((90 * Math.PI) / 180);
        ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const fileName = imageFile ? imageFile.name.replace(/\.[^/.]+$/, "") : "artwork";
              const rotatedFile = new File([blob], `${fileName}-rotated.jpg`, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              setImageFile(rotatedFile);
              setImagePreview(URL.createObjectURL(rotatedFile));
              setIsImageRemoved(false);
            }
            setIsAiProcessing(false);
          },
          "image/jpeg",
          0.92
        );
      } else {
        setIsAiProcessing(false);
      }
    } catch (err) {
      console.error("Quick rotate failed:", err);
      setIsAiProcessing(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrorMsg("กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง (JPG, PNG, WebP)");
        return;
      }
      setImageFile(file);
      setIsImageRemoved(false);
      setErrorMsg("");
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview("");
    setImageFile(null);
    setIsImageRemoved(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (isGraded) {
      setErrorMsg("ผลงานนี้ได้รับการตรวจประเมินคะแนนแล้ว ไม่สามารถแก้ไขได้ (ดูได้อย่างเดียว)");
      return;
    }

    // Validation: Require at least image, link, or document
    const hasImage = (!isImageRemoved && Boolean(imagePreview)) || Boolean(imageFile);
    if (!hasImage && !externalLink && !docFile) {
      setErrorMsg("กรุณาแนบภาพผลงานศิลปะ หรือลิงก์ผลงาน (Canva/Drive) อย่างน้อย 1 อย่าง");
      return;
    }

    setIsSubmitting(true);

    try {
      const finalRoom = student.classroom || selectedRoom || (assignment.classroomsList && assignment.classroomsList[0]) || "ม.3/1";
      if (!student.classroom && finalRoom) {
        localStorage.setItem("artroom_classroom", finalRoom);
      }

      const formData = new FormData();
      formData.append("assignmentId", assignment.id);
      formData.append("studentId", student.id || "38888");
      formData.append("studentName", student.name);
      formData.append("classroom", finalRoom);
      if (externalLink) formData.append("externalLink", externalLink.trim());
      if (concept) formData.append("concept", concept.trim());

      if (imageFile) {
        formData.append("image", imageFile);
      } else if (imagePreview && !isImageRemoved) {
        formData.append("imageUrl", imagePreview);
      } else if (isImageRemoved) {
        formData.append("removeImage", "true");
        formData.append("imageUrl", "");
      }

      if (docFile) {
        formData.append("file", docFile);
      }

      const res = await fetch("/api/submissions", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setSubmissionResult({
          isLate: Boolean(data.isLate),
          isEdit: Boolean(existingSubmission),
          submittedAt: new Date().toISOString(),
          room: finalRoom,
          imagePreview: (!isImageRemoved && imagePreview) ? imagePreview : undefined,
          externalLink: externalLink ? externalLink.trim() : undefined,
          concept: concept ? concept.trim() : undefined,
          docFileName: docFile?.name || undefined,
        });
      } else {
        setErrorMsg(data.error || "ไม่สามารถส่งงานได้ กรุณาลองใหม่อีกครั้ง");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submissionResult) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div
          className="bg-white rounded-3xl max-w-lg w-full max-h-[90dvh] overflow-y-auto shadow-2xl border border-gray-100 p-4 sm:p-8 animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Action */}
          <div className="flex justify-end mb-2">
            <button
              type="button"
              onClick={onSuccess}
              className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 hover:text-gray-700 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"
              title="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success Status Badge & Titles */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-3.5 shadow-xs">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-xl font-bold font-kanit text-gray-900 leading-snug">
              {submissionResult.isEdit
                ? "บันทึกการแก้ไขงานเรียบร้อยแล้ว"
                : "ส่งผลงานศิลปะสำเร็จแล้ว"}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              ระบบได้บันทึกข้อมูลและส่งต่อไปยังคุณครูผู้สอนเรียบร้อยแล้ว
            </p>

            {/* Submission Timing Badge */}
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border">
              {submissionResult.isLate ? (
                <span className="inline-flex items-center gap-1.5 text-amber-800 bg-amber-50">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>บันทึกสถานะ: ส่งผลงานหลังกำหนดเวลา</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-emerald-800 bg-emerald-50">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>บันทึกสถานะ: ส่งตรงตามกำหนดเวลา</span>
                </span>
              )}
            </div>
          </div>

          {/* Detailed Summary Receipt */}
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 sm:p-5 space-y-3 text-xs text-gray-700 mb-6">
            <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-gray-200/80">
              <span className="text-gray-500 font-medium shrink-0">ภาระงาน</span>
              <span className="font-bold text-gray-900 text-right">
                {assignment.title}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2.5 border-b border-gray-200/80">
              <span className="text-gray-500 font-medium">รายวิชา</span>
              <span className="font-semibold text-gray-800 text-right">
                {assignment.subject ? (assignment.subject.code ? `${assignment.subject.code} ${assignment.subject.name}` : assignment.subject.name) : (assignment.subjectId || "วิชาศิลปะ")} • เต็ม {assignment.maxScore} คะแนน
              </span>
            </div>

            <div className="flex items-center justify-between pb-2.5 border-b border-gray-200/80">
              <span className="text-gray-500 font-medium">ผู้ส่งผลงาน</span>
              <span className="font-semibold text-gray-900 text-right">
                {student.name} ({student.id !== 'STU' ? `รหัส ${student.id}` : 'นักเรียน'}) • ห้อง {submissionResult.room}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2.5 border-b border-gray-200/80">
              <span className="text-gray-500 font-medium">วันและเวลาที่บันทึก</span>
              <span className="font-mono text-gray-800">
                {new Date(submissionResult.submittedAt).toLocaleString("th-TH", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })} น.
              </span>
            </div>

            {/* Artwork Thumbnail Preview */}
            {submissionResult.imagePreview && (
              <div className="pt-1">
                <span className="text-gray-500 font-medium block mb-1.5">ภาพถ่ายผลงานที่แนบส่ง:</span>
                <div className="rounded-xl overflow-hidden border border-gray-200 bg-white p-1 max-h-52 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={submissionResult.imagePreview}
                    alt="ผลงานที่ส่ง"
                    className="max-h-48 w-auto object-contain rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* External link */}
            {submissionResult.externalLink && (
              <div className="pt-1 flex items-start justify-between gap-2">
                <span className="text-gray-500 font-medium shrink-0">ลิงก์ผลงาน:</span>
                <a
                  href={submissionResult.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-semibold text-right truncate max-w-[70%]"
                >
                  {submissionResult.externalLink}
                </a>
              </div>
            )}

            {/* Concept / Technique */}
            {submissionResult.concept && (
              <div className="pt-1">
                <span className="text-gray-500 font-medium block mb-1">แนวคิด / เทคนิค:</span>
                <p className="bg-white p-2.5 rounded-xl border border-gray-200 text-gray-800 text-[11.5px] leading-relaxed">
                  {submissionResult.concept}
                </p>
              </div>
            )}

            {/* Document Attached */}
            {submissionResult.docFileName && (
              <div className="pt-1 flex items-center justify-between">
                <span className="text-gray-500 font-medium">เอกสารแนบเพิ่มเติม:</span>
                <span className="font-semibold text-gray-800 flex items-center gap-1">
                  <Paperclip className="w-3.5 h-3.5 text-gray-500" />
                  <span>{submissionResult.docFileName}</span>
                </span>
              </div>
            )}
          </div>

          {/* Action button */}
          <div className="space-y-2">
            <Button
              type="button"
              onClick={onSuccess}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-md shadow-orange-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>เรียบร้อย (ดูรายการงานที่ส่ง)</span>
            </Button>
            <p className="text-[11px] text-center text-gray-400">
              คุณสามารถตรวจสอบคะแนนและข้อเสนอแนะจากคุณครู หรือส่งแก้ไขผลงานได้ที่หน้านี้ตลอดเวลา
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isGraded) {
    const maxScore = assignment.maxScore || 10;
    const score = existingSubmission.score;
    const percentage = score !== null && score !== undefined ? Math.min(100, Math.round((score / maxScore) * 100)) : null;

    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div
          className="bg-white rounded-3xl max-w-xl w-full max-h-[90dvh] overflow-y-auto shadow-2xl border border-gray-100 p-4 sm:p-8 animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-gray-100 mb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200 uppercase">
                  {assignment.subject ? (assignment.subject.code ? `${assignment.subject.code} ${assignment.subject.name}` : assignment.subject.name) : (assignment.subjectId || "วิชาศิลปะ")}
                </span>
                <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-500" />
                  <span>บันทึกคะแนนแล้ว • ดูได้อย่างเดียว</span>
                </span>
              </div>
              <h3 className="font-bold text-gray-900 text-xl font-kanit mt-2 leading-tight">
                {assignment.title}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                คะแนนเต็ม {maxScore} คะแนน
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 hover:text-gray-700 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Teacher Graded Banner */}
          <div className="bg-emerald-50/80 border border-emerald-200 text-emerald-950 p-4 rounded-2xl mb-5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-emerald-800 text-sm font-kanit">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>คุณครูตรวจให้คะแนนเรียบร้อยแล้ว</span>
              </div>
              {score !== null && score !== undefined && (
                <span className="text-base font-black text-emerald-700 font-kanit bg-white px-3 py-0.5 rounded-xl border border-emerald-200 shadow-2xs">
                  {score} / {maxScore} {percentage !== null ? `(${percentage}%)` : ""}
                </span>
              )}
            </div>
            <p className="text-xs text-emerald-800/90 leading-relaxed">
              ผลงานชิ้นนี้ได้รับการตรวจประเมินคะแนนและบันทึกลงระบบแล้ว นักเรียนไม่สามารถแก้ไขหรือส่งภาพใหม่ได้ สามารถดูภาพผลงานและข้อเสนอแนะจากคุณครูได้ตามข้อมูลด้านล่าง
            </p>
          </div>

          {/* Teacher Feedback if any */}
          {existingSubmission.feedback && (
            <div className="mb-5 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs sm:text-sm text-amber-950 space-y-1">
              <span className="font-bold text-amber-900 text-xs block font-kanit">
                💬 ข้อเสนอแนะ / คำชมจากคุณครู:
              </span>
              <p className="italic leading-relaxed">
                &quot;{existingSubmission.feedback}&quot;
              </p>
            </div>
          )}

          {/* Student Info & Submission Details */}
          <div className="space-y-4 text-xs text-gray-700">
            {/* Artwork Image View */}
            {(existingSubmission.imageUrl || existingSubmission.fileUrl) && (
              <div>
                <span className="text-xs font-bold text-gray-800 block mb-2">
                  ภาพผลงานที่ส่ง:
                </span>
                <div className="rounded-2xl overflow-hidden border border-gray-200 bg-slate-900/5 max-h-80 flex items-center justify-center p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={existingSubmission.imageUrl || existingSubmission.fileUrl}
                    alt={assignment.title}
                    className="max-h-72 w-auto object-contain rounded-xl"
                  />
                </div>
              </div>
            )}

            {/* Concept if any */}
            {existingSubmission.concept && (
              <div>
                <span className="text-xs font-bold text-gray-800 block mb-1">
                  แนวคิด / เทคนิคที่บันทึกไว้:
                </span>
                <p className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-gray-800 leading-relaxed text-xs">
                  {existingSubmission.concept}
                </p>
              </div>
            )}

            {/* External link if any */}
            {existingSubmission.externalLink && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
                <span className="font-medium text-gray-600">ลิงก์ผลงาน:</span>
                <a
                  href={existingSubmission.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-semibold truncate max-w-[70%]"
                >
                  {existingSubmission.externalLink}
                </a>
              </div>
            )}

            {/* Date Submitted */}
            <div className="flex items-center justify-between py-2 text-gray-500 border-t border-gray-100 text-[11.5px]">
              <span>ส่งเมื่อ: {new Date(existingSubmission.submittedAt).toLocaleString("th-TH")}</span>
              <span>ห้อง {existingSubmission.classroom || student.classroom}</span>
            </div>
          </div>

          {/* Close Action */}
          <div className="pt-4 border-t border-gray-100 mt-5">
            <Button
              type="button"
              onClick={onClose}
              className="w-full h-11 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-sm cursor-pointer transition-colors"
            >
              ปิดหน้าต่าง
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Hidden file input controlled via ref */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />

      <div
        className="bg-white rounded-3xl max-w-xl w-full max-h-[90dvh] overflow-y-auto shadow-2xl border border-gray-100 p-4 sm:p-8 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-gray-100 mb-5">
          <div>
            <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200 uppercase">
              {assignment.subject ? (assignment.subject.code ? `${assignment.subject.code} ${assignment.subject.name}` : assignment.subject.name) : (assignment.subjectId || "วิชาศิลปะ")}
            </span>
            <h3 className="font-bold text-gray-900 text-xl font-kanit mt-1.5 leading-tight flex items-center gap-2">
              {existingSubmission ? (
                <>
                  <Edit3 className="w-5 h-5 text-orange-600" />
                  <span>แก้ไขข้อมูลการส่งงาน</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 text-orange-600" />
                  <span>ส่งผลงานศิลปะ</span>
                </>
              )}
            </h3>
            <p className="text-xs text-gray-600 mt-0.5 font-medium">
              {assignment.title} • คะแนนเต็ม {assignment.maxScore} คะแนน
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 hover:text-gray-700 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Student Badge Info */}
        <div className="bg-gray-50 p-3.5 rounded-2xl mb-5 flex items-center justify-between text-xs text-gray-700 font-medium">
          <span>
            ผู้ส่ง: <strong className="text-gray-900">{student.name}</strong> ({student.id !== 'STU' ? `รหัส ${student.id}` : 'นักเรียน'})
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-white border border-gray-200 font-mono font-bold text-orange-600">
            ห้อง {student.classroom || selectedRoom}
          </span>
        </div>

        {/* Late Warning Notice */}
        {isExpired && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-2xl mb-5 flex items-start gap-2.5 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">งานนี้เลยกำหนดส่งแล้ว (Deadline)</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                คุณยังสามารถส่งงานได้ตามปกติ โดยระบบจะบันทึกเวลาจริงและติดแท็ก "ส่งช้ากว่ากำหนด" ให้คุณครูทราบ
              </p>
            </div>
          </div>
        )}

        {/* Error notification */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-2xl mb-5 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Submission Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Artwork Image Upload with Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-gray-600" />
                <span>ภาพถ่ายผลงานศิลปะ (แนะนำอย่างยิ่ง)</span>
              </label>
              {imagePreview && (
                <span className="text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> แนบไฟล์รูปภาพแล้ว
                </span>
              )}
            </div>

            {aiSuccessMessage && (
              <div className="mb-2.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200 text-orange-900 text-xs font-semibold flex items-center gap-2 shadow-2xs animate-in fade-in">
                <Sparkles className="w-4 h-4 text-orange-500 shrink-0" />
                <span>{aiSuccessMessage}</span>
              </div>
            )}

            {imagePreview ? (
              <div className="space-y-3">
                {/* Image Container with screen-fitting bounds and object-contain */}
                <div 
                  className="relative rounded-2xl overflow-hidden border border-gray-200 bg-slate-900/5 min-h-[220px] max-h-80 flex items-center justify-center group shadow-2xs"
                >
                  {/* Subtle Ambient blur for non-standard aspect ratio artwork */}
                  <div 
                    className="absolute inset-0 scale-125 blur-2xl opacity-20 pointer-events-none"
                    style={{
                      backgroundImage: `url(${imagePreview})`,
                      backgroundPosition: "center",
                      backgroundSize: "cover",
                    }}
                  />

                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Artwork preview"
                    className="relative max-h-80 w-auto max-w-full object-contain rounded-xl transition-all"
                  />
                  
                  {/* Corner remove button */}
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer z-10 shadow-xs"
                    title="ลบรูปภาพนี้"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Formal Action Bar for AI Enhance, Crop, Rotate, Change, and Delete */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-gray-50 border border-gray-200">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* 1-Click AI Auto-Enhance Button */}
                    <button
                      type="button"
                      disabled={isAiProcessing}
                      onClick={handleAiAutoEnhance}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 hover:opacity-95 text-white font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                      title="AI ช่วยปรับแสงเงา สีสัน และรายละเอียดภาพให้คมชัดสวยงามในคลิกเดียว"
                    >
                      <Sparkles className={`w-3.5 h-3.5 text-yellow-200 ${isAiProcessing ? "animate-spin" : ""}`} />
                      <span>{isAiProcessing ? "กำลังปรับภาพ..." : "✨ AI ปรับภาพสวย"}</span>
                    </button>

                    {/* Crop & Ratio Editor Button */}
                    <button
                      type="button"
                      disabled={isAiProcessing}
                      onClick={handleOpenEditor}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-orange-50 text-gray-800 hover:text-orange-600 font-semibold text-xs border border-gray-300 hover:border-orange-300 shadow-2xs transition-all cursor-pointer"
                      title="ครอบตัดภาพให้พอดีกับหน้าจอ เช่น สัดส่วน 4:5, 3:4, 1:1 หรือ 16:9"
                    >
                      <Crop className="w-3.5 h-3.5 text-orange-500" />
                      <span>ครอปภาพ / ปรับแต่ง</span>
                    </button>

                    {/* Rotate 90 deg */}
                    <button
                      type="button"
                      disabled={isAiProcessing}
                      onClick={handleQuickRotate}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-gray-100 text-gray-700 font-semibold text-xs border border-gray-300 shadow-2xs transition-all cursor-pointer"
                      title="หมุนภาพตามเข็มนาฬิกา 90 องศา"
                    >
                      <RotateCw className={`w-3.5 h-3.5 text-gray-600 ${isAiProcessing ? "animate-spin" : ""}`} />
                      <span>หมุน 90°</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-gray-100 text-gray-600 hover:text-gray-900 font-medium text-xs border border-gray-200 shadow-2xs transition-all cursor-pointer"
                      title="เลือกไฟล์รูปภาพใหม่จากเครื่อง"
                    >
                      <RefreshCw className="w-3 h-3 text-gray-400" />
                      <span>เปลี่ยนรูป</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="inline-flex items-center justify-center p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      title="ลบรูปภาพนี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 hover:border-orange-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-gray-50/50 hover:bg-orange-50/20 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-orange-100 text-gray-600 group-hover:text-orange-600 flex items-center justify-center mb-2.5 transition-colors">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-gray-800">
                  คลิกเพื่อเลือกไฟล์รูปภาพผลงาน (หรือลากและวางไฟล์ที่นี่)
                </span>
                <span className="text-[11px] text-gray-500 mt-1">
                  รองรับไฟล์รูปแบบ JPG, PNG, WebP (สามารถแก้ไขไฟล์ได้ก่อนคุณครูประเมินผล)
                </span>
              </div>
            )}
          </div>

          {/* 2. External Link (Canva, Drive, YouTube) */}
          <div>
            <label className="text-xs font-bold text-gray-800 block mb-1.5 flex items-center gap-1.5">
              <LinkIcon className="w-4 h-4 text-gray-600" />
              <span>ลิงก์ผลงานภายนอก (ถ้ามี เช่น Canva / Google Drive / YouTube)</span>
            </label>
            <input
              type="url"
              value={externalLink}
              onChange={(e) => setExternalLink(e.target.value)}
              placeholder="https://www.canva.com/design/... หรือ ลิงก์ Google Drive"
              className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-orange-500 outline-none text-xs font-medium"
            />
            <span className="text-[10px] text-gray-400 mt-1 block">
              *หากส่งงานเป็นลิงก์ Google Drive โปรดตรวจสอบว่าตั้งสิทธิ์เป็น "ทุกคนที่มีลิงก์ดูได้"
            </span>
          </div>

          {/* 3. Concept / Technique Description */}
          <div>
            <label className="text-xs font-bold text-gray-800 block mb-1.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-gray-600" />
              <span>แนวคิดของผลงานและเทคนิคที่ใช้ (Concept & Technique)</span>
            </label>
            <textarea
              rows={3}
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="อธิบายแรงบันดาลใจ แนวคิด หรือเทคนิคที่ใช้ในการสร้างสรรค์ผลงาน..."
              className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-orange-500 outline-none text-xs leading-relaxed"
            />
          </div>

          {/* 4. Optional Document / PDF */}
          <div>
            <label className="text-xs font-bold text-gray-800 block mb-1.5 flex items-center gap-1.5">
              <Paperclip className="w-4 h-4 text-gray-600" />
              <span>แนบไฟล์เอกสาร / PDF เพิ่มเติม (ไม่บังคับ)</span>
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx"
              onChange={handleDocChange}
              className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-3 flex items-center gap-3">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-sm shadow-md shadow-red-600/20 active:scale-95 transition-all cursor-pointer"
              style={{ backgroundColor: "#dc2626", color: "#ffffff" }}
            >
              {isSubmitting ? "กำลังส่งงาน..." : existingSubmission ? "บันทึกการแก้ไขงาน" : "ยืนยันการส่งงาน"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-12 px-5 rounded-xl border-gray-200 text-gray-600"
            >
              ยกเลิก
            </Button>
          </div>
        </form>
      </div>

      {/* Shared Image Editor & Aspect Ratio Cropping Modal */}
      {isEditorOpen && (
        <ImageEditorModal
          isOpen={isEditorOpen}
          file={editorFile}
          onClose={() => setIsEditorOpen(false)}
          onSave={handleEditorSave}
          title="ปรับแต่งและครอบตัดภาพผลงานศิลปะ"
          defaultAspectRatio="4:5"
        />
      )}
    </div>
  );
}

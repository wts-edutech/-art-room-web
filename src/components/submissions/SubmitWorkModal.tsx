"use client";

import { useState, useRef, useEffect } from "react";
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
  Lock,
  Camera,
  Loader2,
  Download,
  ZoomIn,
  Eye,
  ExternalLink
} from "lucide-react";
import ImageEditorModal from "@/components/common/ImageEditorModal";
import { compressImage } from "@/lib/image-compressor";

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
  // Multi-image state: up to 3 images (0: ผลงานหลัก, 1: รายละเอียด, 2: ขั้นตอนการทำ)
  const initialPreviews: string[] = (() => {
    if (existingSubmission?.images && Array.isArray(existingSubmission.images) && existingSubmission.images.length > 0) {
      return [
        existingSubmission.images[0] || existingSubmission.imageUrl || "",
        existingSubmission.images[1] || "",
        existingSubmission.images[2] || ""
      ];
    }
    return [existingSubmission?.imageUrl || "", "", ""];
  })();

  const [imageFiles, setImageFiles] = useState<(File | null)[]>([null, null, null]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(initialPreviews);
  const [activeSlot, setActiveSlot] = useState<number>(0);
  const [draftRestored, setDraftRestored] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [externalLink, setExternalLink] = useState<string>(existingSubmission?.externalLink || "");
  const [concept, setConcept] = useState<string>(existingSubmission?.concept || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [aiSuccessMessage, setAiSuccessMessage] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorFile, setEditorFile] = useState<File | null>(null);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    isLate: boolean;
    isEdit: boolean;
    submittedAt: string;
    room: string;
    imagePreview?: string;
    imagePreviews?: string[];
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

  const draftKey = `artroom_sub_draft_${assignment.id}_${student.id}`;

  // Auto-restore draft from localStorage on mount (Data Loss Prevention)
  useEffect(() => {
    if (existingSubmission || isGraded) return;
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const draft = JSON.parse(raw);
        let restoredAny = false;
        if (draft.concept) { setConcept(draft.concept); restoredAny = true; }
        if (draft.externalLink) { setExternalLink(draft.externalLink); restoredAny = true; }
        if (draft.selectedRoom) setSelectedRoom(draft.selectedRoom);
        if (Array.isArray(draft.previews) && draft.previews.some(Boolean)) {
          setImagePreviews([
            draft.previews[0] || "",
            draft.previews[1] || "",
            draft.previews[2] || "",
          ]);
          restoredAny = true;
        }
        if (restoredAny) {
          setDraftRestored(true);
          setTimeout(() => setDraftRestored(false), 5000);
        }
      }
    } catch (e) {
      console.warn("Could not load submission draft:", e);
    }
  }, [assignment.id, student.id, existingSubmission, isGraded, draftKey]);

  // Auto-save draft to localStorage whenever inputs change (Data Loss Prevention)
  useEffect(() => {
    if (isGraded || submissionResult) return;
    const timer = setTimeout(() => {
      try {
        const hasContent = concept.trim() || externalLink.trim() || imagePreviews.some(Boolean);
        if (hasContent) {
          localStorage.setItem(draftKey, JSON.stringify({
            concept,
            externalLink,
            selectedRoom,
            previews: imagePreviews,
            savedAt: Date.now(),
          }));
        }
      } catch (e) {
        console.warn("Could not save submission draft:", e);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [concept, externalLink, selectedRoom, imagePreviews, isGraded, submissionResult, draftKey]);

  const currentPreview = imagePreviews[activeSlot] || "";
  const currentFile = imageFiles[activeSlot] || null;

  // Convert current preview to File for ImageEditorModal if needed
  const getFileFromCurrentPreview = async (): Promise<File | null> => {
    if (currentFile) return currentFile;
    if (!currentPreview) return null;
    try {
      const res = await fetch(currentPreview);
      const blob = await res.blob();
      return new File([blob], `artwork_slot_${activeSlot + 1}.jpg`, { type: blob.type || "image/jpeg" });
    } catch {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = currentPreview;
        img.onload = () => {
          const c = document.createElement("canvas");
          c.width = img.naturalWidth || img.width;
          c.height = img.naturalHeight || img.height;
          const ctx = c.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            c.toBlob((b) => {
              if (b) {
                resolve(new File([b], `artwork_slot_${activeSlot + 1}.jpg`, { type: "image/jpeg" }));
              } else {
                resolve(null);
              }
            }, "image/jpeg", 0.90);
          } else {
            resolve(null);
          }
        };
        img.onerror = () => resolve(null);
      });
    }
  };

  const handleOpenEditor = async () => {
    if (currentFile) {
      setEditorFile(currentFile);
      setIsEditorOpen(true);
    } else if (currentPreview) {
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
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImageFiles(prev => {
        const next = [...prev];
        next[activeSlot] = editedFile;
        return next;
      });
      setImagePreviews(prev => {
        const next = [...prev];
        next[activeSlot] = dataUrl;
        return next;
      });
      setIsEditorOpen(false);
      setAiSuccessMessage(`✂️ ปรับแต่งรูปภาพช่องที่ ${activeSlot + 1} เรียบร้อยแล้ว!`);
      setTimeout(() => setAiSuccessMessage(""), 4000);
    };
    reader.readAsDataURL(editedFile);
  };

  // 1-Click AI Auto Enhance: balances contrast, vibrance, brightness, and details
  const handleAiAutoEnhance = async () => {
    if (!currentPreview || isAiProcessing) return;
    setIsAiProcessing(true);
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = currentPreview;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.filter = "contrast(115%) saturate(118%) brightness(103%)";
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const fileName = currentFile ? currentFile.name.replace(/\.[^/.]+$/, "") : `artwork_slot_${activeSlot + 1}`;
              const enhancedFile = new File([blob], `${fileName}-ai-enhanced.jpg`, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              const reader = new FileReader();
              reader.onload = () => {
                const dataUrl = reader.result as string;
                setImageFiles(prev => {
                  const next = [...prev];
                  next[activeSlot] = enhancedFile;
                  return next;
                });
                setImagePreviews(prev => {
                  const next = [...prev];
                  next[activeSlot] = dataUrl;
                  return next;
                });
                setAiSuccessMessage(`✨ AI ปรับแสงและสีสันของภาพช่องที่ ${activeSlot + 1} สวยงามขึ้นแล้ว!`);
                setTimeout(() => setAiSuccessMessage(""), 4000);
              };
              reader.readAsDataURL(enhancedFile);
            }
            setIsAiProcessing(false);
          },
          "image/jpeg",
          0.88
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
    if (!currentPreview || isAiProcessing) return;
    setIsAiProcessing(true);
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = currentPreview;
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
              const fileName = currentFile ? currentFile.name.replace(/\.[^/.]+$/, "") : `artwork_slot_${activeSlot + 1}`;
              const rotatedFile = new File([blob], `${fileName}-rotated.jpg`, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              const reader = new FileReader();
              reader.onload = () => {
                const dataUrl = reader.result as string;
                setImageFiles(prev => {
                  const next = [...prev];
                  next[activeSlot] = rotatedFile;
                  return next;
                });
                setImagePreviews(prev => {
                  const next = [...prev];
                  next[activeSlot] = dataUrl;
                  return next;
                });
              };
              reader.readAsDataURL(rotatedFile);
            }
            setIsAiProcessing(false);
          },
          "image/jpeg",
          0.88
        );
      } else {
        setIsAiProcessing(false);
      }
    } catch (err) {
      console.error("Quick rotate failed:", err);
      setIsAiProcessing(false);
    }
  };

  const processAndSetImage = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง (JPG, PNG, WebP)");
      return;
    }
    setErrorMsg("");
    setIsCompressing(true);
    try {
      // Auto-compress photos to WebP (~120-180KB) for fast network transfer and safe D1 storage
      const compressed = await compressImage(file, {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.80,
        outputFormat: "image/webp",
      });

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setImageFiles(prev => {
          const next = [...prev];
          next[activeSlot] = compressed;
          return next;
        });
        setImagePreviews(prev => {
          const next = [...prev];
          next[activeSlot] = dataUrl;
          return next;
        });
      };
      reader.readAsDataURL(compressed);
    } catch (err) {
      console.warn("Compression fallback to raw file:", err);
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setImageFiles(prev => {
          const next = [...prev];
          next[activeSlot] = file;
          return next;
        });
        setImagePreviews(prev => {
          const next = [...prev];
          next[activeSlot] = dataUrl;
          return next;
        });
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAndSetImage(file);
    }
  };

  const handleRemoveImage = (slotIndex: number) => {
    setImageFiles(prev => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
    setImagePreviews(prev => {
      const next = [...prev];
      next[slotIndex] = "";
      return next;
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
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

    // Validation: Require at least one image, link, or document
    const validImages = imagePreviews.filter(Boolean);
    const hasAnyImage = validImages.length > 0;
    if (!hasAnyImage && !externalLink.trim() && !docFile) {
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

      // Send primary image and multi-image JSON array
      const primaryImage = validImages[0] || "";
      if (primaryImage) {
        formData.append("imageUrl", primaryImage);
        formData.append("images", JSON.stringify(validImages));
      } else {
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

      const data: any = await res.json();

      if (res.ok) {
        // Clean draft upon successful submission
        try {
          localStorage.removeItem(draftKey);
        } catch {}

        setSubmissionResult({
          isLate: Boolean(data.isLate),
          isEdit: Boolean(existingSubmission),
          submittedAt: new Date().toISOString(),
          room: finalRoom,
          imagePreview: primaryImage || undefined,
          imagePreviews: validImages,
          externalLink: externalLink ? externalLink.trim() : undefined,
          concept: concept ? concept.trim() : undefined,
          docFileName: docFile?.name || undefined,
        });
      } else {
        setErrorMsg(data.error || "ไม่สามารถส่งงานได้ กรุณาลองใหม่อีกครั้ง");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย กรุณากดปุ่มลองใหม่อีกครั้ง (ข้อมูลของคุณยังอยู่ครบ)");
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

            {/* Artwork Thumbnail Previews */}
            {submissionResult.imagePreviews && submissionResult.imagePreviews.length > 0 && (
              <div className="pt-1">
                <span className="text-gray-500 font-medium block mb-1.5">
                  ภาพถ่ายผลงานที่แนบส่ง ({submissionResult.imagePreviews.length} ภาพ):
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {submissionResult.imagePreviews.map((imgUrl, idx) => (
                    <div key={idx} className="rounded-xl overflow-hidden border border-gray-200 bg-white p-1 max-h-36 flex flex-col items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgUrl}
                        alt={`ภาพที่ ${idx + 1}`}
                        className="max-h-28 w-auto object-contain rounded-lg"
                      />
                      <span className="text-[10px] text-gray-500 font-bold mt-1">
                        {idx === 0 ? "1. ผลงานหลัก" : idx === 1 ? "2. รายละเอียด" : "3. ขั้นตอน"}
                      </span>
                    </div>
                  ))}
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
      {/* Hidden file input: Photo Library / Gallery */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />
      {/* Hidden camera input: Direct Mobile Camera Capture */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
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
        <div className="bg-gray-50 p-3.5 rounded-2xl mb-4 flex items-center justify-between text-xs text-gray-700 font-medium">
          <span>
            ผู้ส่ง: <strong className="text-gray-900">{student.name}</strong> ({student.id !== 'STU' ? `รหัส ${student.id}` : 'นักเรียน'})
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-white border border-gray-200 font-mono font-bold text-orange-600">
            ห้อง {student.classroom || selectedRoom}
          </span>
        </div>

        {/* Teacher Instructions & Attachments in Submit Modal */}
        {(assignment.description || assignment.imageUrl || assignment.attachmentUrl || assignment.externalLink) && (
          <div className="mb-5 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-3 text-xs">
            {assignment.description && (
              <div>
                <span className="font-bold text-amber-950 block mb-1 font-kanit">
                  📋 รายละเอียดภาระงาน / คำสั่งจากคุณครู:
                </span>
                <p className="text-amber-900 leading-relaxed font-light whitespace-pre-wrap">
                  {assignment.description}
                </p>
              </div>
            )}

            {/* Reference Image Thumbnail */}
            {assignment.imageUrl && (
              <div className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-amber-200 shadow-2xs">
                <a
                  href={assignment.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative group block w-16 h-16 rounded-lg overflow-hidden bg-slate-900/5 shrink-0 border border-gray-200 cursor-pointer"
                  title="คลิกดูภาพตัวอย่างขนาดเต็ม"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={assignment.imageUrl}
                    alt="ภาพตัวอย่าง"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <ZoomIn className="w-4 h-4" />
                  </div>
                </a>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 font-kanit">🎨 ภาพตัวอย่าง / โจทย์งานศิลปะ</p>
                  <p className="text-[11px] text-gray-500 font-light mt-0.5 truncate">
                    ดูภาพต้นแบบผลงานเพื่อเป็นแนวทางการส่งงาน
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <a
                      href={assignment.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100/80 hover:bg-amber-200 px-2 py-0.5 rounded transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      <span>เปิดดูภาพเต็ม</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Download Worksheet Button */}
            {assignment.attachmentUrl && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 p-2.5 bg-white rounded-xl border border-amber-200 shadow-2xs">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 border border-orange-200">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 truncate">
                      {assignment.attachmentName || "ใบงานศิลปะ (Worksheet)"}
                    </p>
                    {assignment.attachmentSize && (
                      <p className="text-[10px] text-gray-500 font-light">
                        ขนาด: {assignment.attachmentSize}
                      </p>
                    )}
                  </div>
                </div>
                <a
                  href={assignment.attachmentUrl}
                  download={assignment.attachmentName || "ใบงานศิลปะ"}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-xs active:scale-95 transition-all shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลดใบงาน</span>
                </a>
              </div>
            )}

            {/* External Link */}
            {assignment.externalLink && (
              <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-xl border border-amber-200">
                <span className="text-blue-700 font-medium text-[11px] truncate">🔗 {assignment.externalLink}</span>
                <a
                  href={assignment.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 shrink-0"
                >
                  <span>เปิดลิงก์</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        )}

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

        {/* Draft Restored Banner */}
        {draftRestored && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-2xl mb-4 flex items-center gap-2 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>ระบบได้กู้คืนข้อมูลแบบร่างที่คุณพิมพ์ค้างไว้ให้อัตโนมัติเรียบร้อยแล้ว</span>
          </div>
        )}

        {/* Error notification with Instant Retry */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl mb-5 text-xs space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p className="font-semibold leading-relaxed">{errorMsg}</p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="h-8 px-4 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer"
              >
                {isSubmitting ? "กำลังส่งอีกครั้ง..." : "ลองส่งงานอีกครั้ง"}
              </Button>
              <span className="text-[11px] text-gray-500 font-light">ข้อมูลและรูปภาพทั้งหมดยังคงอยู่ครบ ไม่สูญหาย</span>
            </div>
          </div>
        )}

        {/* Submission Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Artwork Multi-Image Upload (Up to 3 images) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-gray-600" />
                <span>ภาพถ่ายผลงานศิลปะ (แนบได้สูงสุด 3 รูป)</span>
              </label>
              <span className="text-[11px] text-gray-500 font-medium">
                แนบแล้ว {imagePreviews.filter(Boolean).length} / 3 ภาพ
              </span>
            </div>

            {/* 3 Image Slots Selector Bar */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "1. ผลงานหลัก *", sub: "ภาพเต็มผลงาน" },
                { label: "2. รายละเอียด", sub: "ซูม/เทคนิคใกล้ๆ" },
                { label: "3. ขั้นตอน", sub: "ภาพขณะสร้างสรรค์" },
              ].map((slot, idx) => {
                const hasImg = Boolean(imagePreviews[idx]);
                const isActive = activeSlot === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveSlot(idx)}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[64px] ${
                      isActive
                        ? "bg-orange-50 border-orange-500 ring-2 ring-orange-400/20 shadow-xs"
                        : "bg-gray-50/80 hover:bg-gray-100 border-gray-200 text-gray-600"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-xs font-bold font-kanit truncate ${isActive ? "text-orange-950" : "text-gray-800"}`}>
                        {slot.label}
                      </span>
                      {hasImg ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="มีรูปภาพแล้ว" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-gray-300 shrink-0" />
                      )}
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1 truncate">
                      {hasImg ? "✓ แนบภาพแล้ว" : slot.sub}
                    </span>
                  </button>
                );
              })}
            </div>

            {aiSuccessMessage && (
              <div className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200 text-orange-900 text-xs font-semibold flex items-center gap-2 shadow-2xs animate-in fade-in">
                <Sparkles className="w-4 h-4 text-orange-500 shrink-0" />
                <span>{aiSuccessMessage}</span>
              </div>
            )}

            {/* Active Slot Image Container */}
            {currentPreview ? (
              <div className="space-y-3">
                <div 
                  className="relative rounded-2xl overflow-hidden border border-gray-200 bg-slate-900/5 min-h-[220px] max-h-80 flex items-center justify-center group shadow-2xs"
                >
                  <div 
                    className="absolute inset-0 scale-125 blur-2xl opacity-20 pointer-events-none"
                    style={{
                      backgroundImage: `url(${currentPreview})`,
                      backgroundPosition: "center",
                      backgroundSize: "cover",
                    }}
                  />

                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentPreview}
                    alt={`Artwork preview slot ${activeSlot + 1}`}
                    className="relative max-h-80 w-auto max-w-full object-contain rounded-xl transition-all"
                  />
                  
                  {/* Slot Indicator Tag */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md text-white text-[11px] font-bold">
                    ช่องที่ {activeSlot + 1}: {activeSlot === 0 ? "ผลงานหลัก" : activeSlot === 1 ? "รายละเอียด" : "ขั้นตอน"}
                  </div>

                  {/* Corner remove button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(activeSlot)}
                    className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer z-10 shadow-xs"
                    title="ลบรูปภาพช่องนี้"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Action Bar for AI Enhance, Crop, Rotate, Change, and Delete */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-gray-50 border border-gray-200">
                  <div className="flex flex-wrap items-center gap-2">
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

                    <button
                      type="button"
                      disabled={isAiProcessing}
                      onClick={handleOpenEditor}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-orange-50 text-gray-800 hover:text-orange-600 font-semibold text-xs border border-gray-300 hover:border-orange-300 shadow-2xs transition-all cursor-pointer"
                      title="ครอบตัดภาพให้พอดีกับหน้าจอ"
                    >
                      <Crop className="w-3.5 h-3.5 text-orange-500" />
                      <span>ครอปภาพ / ปรับแต่ง</span>
                    </button>

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

                  <div className="flex flex-wrap items-center gap-2 ml-auto">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3 py-1.5 rounded-xl bg-white hover:bg-gray-100 text-gray-700 font-semibold text-xs border border-gray-200 shadow-2xs transition-all cursor-pointer"
                      title="ถ่ายภาพใหม่ด้วยกล้องมือถือ"
                    >
                      <Camera className="w-3.5 h-3.5 text-red-500" />
                      <span>ถ่ายใหม่</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3 py-1.5 rounded-xl bg-white hover:bg-gray-100 text-gray-700 font-semibold text-xs border border-gray-200 shadow-2xs transition-all cursor-pointer"
                      title="เลือกภาพใหม่จากคลังรูปภาพ"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-orange-500" />
                      <span>เลือกใหม่</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(activeSlot)}
                      className="inline-flex items-center justify-center min-h-[40px] min-w-[40px] p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      title="ลบรูปภาพช่องนี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Dual camera & gallery selection buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 min-h-[48px] px-4 py-3 bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:opacity-95 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-sm active:scale-95 transition-all cursor-pointer"
                  >
                    <Camera className="w-5 h-5 shrink-0" />
                    <span>ถ่ายรูปสำหรับช่องที่ {activeSlot + 1}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 min-h-[48px] px-4 py-3 bg-white hover:bg-orange-50 border-2 border-orange-200 text-orange-900 rounded-2xl font-bold text-xs sm:text-sm shadow-2xs active:scale-95 transition-all cursor-pointer"
                  >
                    <ImageIcon className="w-5 h-5 text-orange-600 shrink-0" />
                    <span>เลือกจากคลังรูปภาพ</span>
                  </button>
                </div>

                {/* Dropzone area for Desktop drag-and-drop / click */}
                <div 
                  onClick={() => !isCompressing && fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) processAndSetImage(file);
                  }}
                  className={`border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all group ${
                    isCompressing
                      ? "border-orange-400 bg-orange-50/40 cursor-wait"
                      : "border-gray-300 hover:border-orange-500 bg-gray-50/50 hover:bg-orange-50/20"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 transition-colors ${
                    isCompressing
                      ? "bg-orange-500 text-white animate-spin"
                      : "bg-gray-100 group-hover:bg-orange-100 text-gray-600 group-hover:text-orange-600"
                  }`}>
                    {isCompressing ? <Loader2 className="w-5 h-5" /> : <Upload className="w-4 h-4" />}
                  </div>
                  <span className="text-xs font-semibold text-gray-800">
                    {isCompressing ? "⚡ กำลังประมวลผลและบีบอัดรูปภาพให้อัตโนมัติ..." : `คลิกเพื่อเลือกภาพสำหรับช่องที่ ${activeSlot + 1} หรือลากไฟล์มาวาง`}
                  </span>
                  <span className="text-[11px] text-gray-500 mt-0.5">
                    บีบอัดเป็น WebP คมชัด อัตโนมัติ ปลอดภัย ไม่เปลืองอินเทอร์เน็ต
                  </span>
                </div>
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

"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  Sparkles, 
  Eye, 
  FileText, 
  Download, 
  Heart, 
  CheckCircle2, 
  Pencil, 
  Save, 
  RotateCcw,
  ExternalLink,
  Layers,
  GraduationCap,
  Printer,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface MaterialLivePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: any;
  onConfirmPublish: (updatedMaterial: any) => Promise<void>;
}

export default function MaterialLivePreviewModal({
  isOpen,
  onClose,
  material,
  onConfirmPublish
}: MaterialLivePreviewModalProps) {
  const [activeView, setActiveView] = useState<"card" | "document" | "edit">("card");
  const [isPublishing, setIsPublishing] = useState(false);

  // Editable fields in preview
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("ใบงานและแบบฝึกหัด");
  const [grade, setGrade] = useState("all");
  const [topic, setTopic] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileSize, setFileSize] = useState("1.5 MB");
  const [contentMarkdown, setContentMarkdown] = useState("");

  useEffect(() => {
    if (material) {
      setTitle(material.title || "");
      setDescription(material.description || "");
      setCategory(material.category || "ใบงานและแบบฝึกหัด");
      setGrade(material.grade || "all");
      setTopic(material.topic || "");
      setImageUrl(material.recommendedImageUrl || material.imageUrl || "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=800&auto=format&fit=crop");
      setFileName(material.suggestedFileName || material.fileName || `${material.title || 'material'}.pdf`);
      setFileUrl(material.fileUrl || "https://pdfobject.com/pdf/sample.pdf");
      setFileSize(material.fileSize || "1.5 MB");
      setContentMarkdown(material.contentMarkdown || material.content || "");
      setActiveView("card");
    }
  }, [material]);

  if (!isOpen || !material) return null;

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await onConfirmPublish({
        ...material,
        title,
        description,
        category,
        grade,
        topic,
        imageUrl,
        fileName,
        fileUrl,
        fileSize,
        content: contentMarkdown
      });
      onClose();
    } catch (e) {
      console.error("Publish failed:", e);
    } finally {
      setIsPublishing(false);
    }
  };

  const gradeLabels: Record<string, string> = {
    all: "ทุกระดับชั้น",
    m1: "ม.1",
    m2: "ม.2",
    m3: "ม.3",
    m4: "ม.4",
    m5: "ม.5",
    m6: "ม.6",
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPublishing) onClose();
      }}
    >
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200 my-auto flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-orange-50/70 via-amber-50/40 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-orange-500/20 shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold font-kanit text-gray-900 leading-tight">
                  แสดงตัวอย่างสื่อการสอน (Live Preview)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  รอยืนยันขึ้นหน้าเว็บจริง
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                ตรวจสอบความถูกต้อง ปรับแต่งข้อความ หรือดูตัวอย่างการ์ดหน้าบ้านจริงก่อนกดยืนยันเผยแพร่
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isPublishing}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* View Switcher Tabs */}
        <div className="px-5 py-2.5 bg-gray-50/80 border-b border-gray-200/80 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-gray-200/70 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveView("card")}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeView === "card"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-orange-600" />
              <span>1. การ์ดหน้าบ้าน (/materials)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView("document")}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeView === "document"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>2. ใบงานฉบับเต็ม (Full Sheet)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView("edit")}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeView === "edit"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Pencil className="w-3.5 h-3.5 text-amber-600" />
              <span>3. แก้ไขข้อมูล (Edit Content)</span>
            </button>
          </div>

          <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>AI: {material.aiPersonaName || "AI Assistant"}</span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 bg-[#FAF9F5]">
          {/* TAB 1: Live Card Preview (Direct replica of https://art-room-web.pages.dev/materials) */}
          {activeView === "card" && (
            <div className="space-y-4 max-w-xl mx-auto">
              <div className="text-center pb-1">
                <span className="text-[11px] font-bold text-orange-700 bg-orange-100/70 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  จำลองการแสดงผลบนหน้า /materials จริง
                </span>
              </div>

              {/* The Art Room Material Card */}
              <div className="bg-white rounded-3xl border border-gray-200/90 shadow-lg hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between max-w-sm sm:max-w-md mx-auto">
                {/* Image & Badges */}
                <div className="relative aspect-16/10 w-full bg-gray-100 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  {/* Dark Vignette Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                  {/* Badges Top Left */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                    {topic && (
                      <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white font-bold text-[10px] tracking-wide shadow-xs">
                        {topic}
                      </span>
                    )}
                    <span className="px-2.5 py-1 rounded-full bg-red-600 text-white font-bold text-[10px] tracking-wide shadow-xs flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      <span>{category}</span>
                    </span>
                  </div>

                  {/* Bookmark Heart Top Right */}
                  <div className="absolute top-3 right-3">
                    <div className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-md text-gray-500 hover:text-red-500 flex items-center justify-center shadow-xs">
                      <Heart className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Grade Badge Bottom Left */}
                  <div className="absolute bottom-3 left-3">
                    <span className="px-2.5 py-0.5 rounded-md bg-white/90 backdrop-blur-md text-gray-800 font-bold text-[10px]">
                      {gradeLabels[grade] || "ทุกระดับชั้น"}
                    </span>
                  </div>
                </div>

                {/* Card Body Content */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="font-bold text-gray-900 text-base sm:text-lg font-kanit leading-snug line-clamp-2">
                      {title}
                    </h4>
                    <p className="text-xs text-gray-500 font-light mt-1.5 line-clamp-3 leading-relaxed">
                      {description}
                    </p>
                  </div>

                  {/* Meta Stats & Actions */}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                      <Download className="w-3.5 h-3.5" />
                      <span>0 ครั้ง • {fileSize}</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setActiveView("document")}
                        className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>ดูตัวอย่าง</span>
                      </button>
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center gap-1 cursor-pointer border border-red-200"
                      >
                        <Download className="w-3 h-3" />
                        <span>ดาวน์โหลด</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Full Document / Worksheet A4 Sheet Preview */}
          {activeView === "document" && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-md space-y-5 text-gray-800">
                {/* Official School Worksheet Header */}
                <div className="border-b-2 border-orange-500/80 pb-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 shadow-inner overflow-hidden shrink-0 flex items-center justify-center p-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/school-logo.png" alt="School Logo" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-gray-900 font-kanit">
                        โรงเรียนวชิรธรรมสาธิต (Wachiratham Sathit School)
                      </h3>
                      <p className="text-xs text-orange-700 font-medium">
                        กลุ่มสาระการเรียนรู้ศิลปะ • รายวิชาทัศนศิลป์
                      </p>
                      <p className="text-[11px] text-gray-400">
                        ระดับชั้น: {gradeLabels[grade] || "ทุกระดับชั้น"} • เอกสารสื่อการเรียนรู้ทางการ
                      </p>
                    </div>
                  </div>

                  <div className="text-right hidden sm:block">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-orange-100 text-orange-800 text-[11px] font-bold">
                      {category}
                    </span>
                  </div>
                </div>

                {/* Worksheet Title */}
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-gray-950 font-kanit">
                    {title}
                  </h2>
                  {topic && (
                    <span className="text-xs text-orange-600 font-semibold mt-0.5 block">
                      หน่วยการเรียนรู้: {topic}
                    </span>
                  )}
                </div>

                {/* Learning Objectives */}
                {material.objectives && material.objectives.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-orange-50/60 border border-orange-200/80 space-y-1.5 text-xs">
                    <h5 className="font-bold text-orange-950 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-orange-600" />
                      <span>จุดประสงค์การเรียนรู้ (Learning Objectives)</span>
                    </h5>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-[11px] pl-1 leading-relaxed">
                      {material.objectives.map((obj: string, idx: number) => (
                        <li key={idx}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Theory / Concept */}
                <div className="space-y-2 text-xs leading-relaxed text-gray-700">
                  <h5 className="font-bold text-gray-900 text-sm">สาระสำคัญ / องค์ความรู้</h5>
                  <p className="text-gray-600 text-[12px] bg-gray-50 p-4 rounded-2xl border border-gray-100 whitespace-pre-line leading-relaxed">
                    {material.theoryContent?.replace(/^###.*\n/, '') || description}
                  </p>
                </div>

                {/* Activity Steps */}
                {material.activitySteps && material.activitySteps.length > 0 && (
                  <div className="space-y-2.5 text-xs">
                    <h5 className="font-bold text-gray-900 text-sm">ขั้นตอนการปฏิบัติกิจกรรมของนักเรียน</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {material.activitySteps.map((step: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-xl bg-gray-50 border border-gray-200/80 space-y-1">
                          <span className="font-bold text-orange-700 text-[11px] block">
                            ขั้นตอนที่ {step.step}: {step.title}
                          </span>
                          <p className="text-[11px] text-gray-600 leading-relaxed">
                            {step.detail}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rubric Assessment Table */}
                {material.rubricCriteria && material.rubricCriteria.length > 0 && (
                  <div className="space-y-2 text-xs">
                    <h5 className="font-bold text-gray-900 text-sm">เกณฑ์การให้คะแนนรูบริก (Assessment Rubric)</h5>
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-gray-100 font-bold text-gray-700">
                          <tr>
                            <th className="p-2.5">เกณฑ์การประเมิน</th>
                            <th className="p-2.5 w-20 text-center">สัดส่วน</th>
                            <th className="p-2.5">คำอธิบายระดับคุณภาพ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {material.rubricCriteria.map((r: any, idx: number) => (
                            <tr key={idx} className="hover:bg-gray-50/60">
                              <td className="p-2.5 font-semibold text-gray-900">{r.criteria}</td>
                              <td className="p-2.5 text-center font-mono text-orange-700 font-bold">{r.weight}</td>
                              <td className="p-2.5 text-gray-600">{r.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Footer Stamp */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                  <span>จัดทำโดยกลุ่มสาระการเรียนรู้ศิลปะ โรงเรียนวชิรธรรมสาธิต</span>
                  <span>ระบบ ART ROOM AI Studio</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Edit on the Fly */}
          {activeView === "edit" && (
            <div className="space-y-4 max-w-2xl mx-auto bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
              <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                <Pencil className="w-4 h-4 text-amber-500" />
                <span>ปรับแต่งรายละเอียดสื่อการสอนก่อนเผยแพร่</span>
              </h4>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">ชื่อสื่อการสอน / ชื่องาน</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-gray-50/60 focus:bg-white focus:border-orange-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">หมวดหมู่</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-gray-50/60 focus:bg-white focus:border-orange-500 outline-none text-xs sm:text-sm"
                    >
                      <option value="ใบงานและแบบฝึกหัด">ใบงานและแบบฝึกหัด</option>
                      <option value="ใบความรู้และชีตสรุป">ใบความรู้และชีตสรุป</option>
                      <option value="สื่อวิดีทัศน์">สื่อวิดีทัศน์</option>
                      <option value="สื่อภาพและเทคนิค">สื่อภาพและเทคนิค</option>
                      <option value="คู่มือและเกณฑ์ประเมิน">คู่มือและเกณฑ์ประเมิน</option>
                      <option value="สไลด์สื่อการสอน (Canva/PPT)">สไลด์สื่อการสอน (Canva/PPT)</option>
                      <option value="แบบฝึกหัด">แบบฝึกหัด</option>
                      <option value="เกณฑ์การประเมิน">เกณฑ์การประเมิน</option>
                      <option value="คู่มือ">คู่มือ</option>
                      <option value="ข้อสอบ/แบบทดสอบ">ข้อสอบ/แบบทดสอบ</option>
                      <option value="สื่อการเรียนรู้">สื่อการเรียนรู้ทั่วไป</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">ระดับชั้น</label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-gray-50/60 focus:bg-white focus:border-orange-500 outline-none"
                    >
                      <option value="all">ทุกระดับชั้น</option>
                      <option value="m1">ม.1</option>
                      <option value="m2">ม.2</option>
                      <option value="m3">ม.3</option>
                      <option value="m4">ม.4</option>
                      <option value="m5">ม.5</option>
                      <option value="m6">ม.6</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">หน่วยการเรียนรู้ (Topic Tag)</label>
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="เช่น จุด & เส้น, ทฤษฎีสี"
                      className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-gray-50/60 focus:bg-white focus:border-orange-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">คำอธิบายย่อ (แสดงบนการ์ดหน้าเว็บ)</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50/60 focus:bg-white focus:border-orange-500 outline-none resize-none leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">ลิงก์ภาพปก (Image URL)</label>
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-gray-50/60 focus:bg-white focus:border-orange-500 outline-none font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">ลิงก์ไฟล์เอกสารดาวน์โหลด (PDF/Drive)</label>
                    <input
                      type="text"
                      value={fileUrl}
                      onChange={(e) => setFileUrl(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-gray-50/60 focus:bg-white focus:border-orange-500 outline-none font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 sm:p-5 border-t border-gray-100 bg-white flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPublishing}
            className="rounded-xl text-xs px-4 h-10 border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer"
          >
            ยกเลิก
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveView(activeView === "card" ? "document" : "card")}
              className="rounded-xl text-xs px-3.5 h-10 border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              {activeView === "card" ? (
                <>
                  <FileText className="w-3.5 h-3.5 mr-1 text-blue-600" />
                  <span>ดูเอกสารเต็ม</span>
                </>
              ) : (
                <>
                  <Layers className="w-3.5 h-3.5 mr-1 text-orange-600" />
                  <span>ดูการ์ดหน้าบ้าน</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              onClick={handlePublish}
              disabled={isPublishing || !title.trim()}
              className="rounded-xl text-xs font-bold px-6 h-10 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/20 cursor-pointer transition-all disabled:opacity-50"
            >
              {isPublishing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>กำลังเผยแพร่...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4" />
                  <span>ยืนยันและเผยแพร่ขึ้นหน้าเว็บจริง</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

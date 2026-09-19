"use client";

import { useState } from "react";
import { 
  X, 
  Sparkles, 
  Bot, 
  Copy, 
  Check, 
  ExternalLink, 
  BookOpen, 
  Lightbulb, 
  FileText, 
  Wand2, 
  ArrowRight,
  Layers,
  CheckCircle2,
  FileCheck2,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AiMaterialStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPreview: (generatedMaterial: any) => void;
}

const AI_PERSONAS = [
  {
    id: "gpt",
    name: "ChatGPT (GPT-4o)",
    provider: "OpenAI",
    badge: "โครงสร้างมาตรฐาน",
    description: "วางแผนบทเรียนเป็นทางการ ภาษาถูกต้อง รูบริกมาตรฐานกระทรวงฯ",
    color: "from-emerald-500 to-teal-600",
    borderActive: "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20",
    externalUrl: "https://chatgpt.com",
  },
  {
    id: "gemini",
    name: "Google Gemini 2.0",
    provider: "Google DeepMind",
    badge: "ไอเดียสร้างสรรค์ STEAM",
    description: "กระตุ้นจินตนาการ บูรณาการศิลปะร่วมสมัย และกิจกรรมทดลอง",
    color: "from-blue-500 to-indigo-600",
    borderActive: "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20",
    externalUrl: "https://gemini.google.com",
  },
  {
    id: "claude",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    badge: "วิเคราะห์ลึกซึ้ง ประณีต",
    description: "เน้นสุนทรียศาสตร์ทางศิลปะ ขั้นตอนการปฏิบัติงานทีละสเต็ปอย่างละเอียด",
    color: "from-purple-500 to-pink-600",
    borderActive: "border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/20",
    externalUrl: "https://claude.ai",
  },
  {
    id: "notebooklm",
    name: "Google NotebookLM",
    provider: "Google Research",
    badge: "สรุปสาระสำคัญ Study Guide",
    description: "สกัดคีย์เวิร์ด บรีฟสาระสำคัญ คัดเน้นประเด็น และชุดคำถามสะท้อนคิด",
    color: "from-amber-500 to-orange-600",
    borderActive: "border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20",
    externalUrl: "https://notebooklm.google.com",
  },
];

const SUGGESTED_IDEAS = [
  "การวาดภาพทัศนียภาพ 1 จุด (Perspective)",
  "การลงน้ำหนักแสงเงา 7 ระดับ ด้วยดินสอ EE",
  "ทฤษฎีสี วงจรสี และคู่สีตรงข้าม 12 สี",
  "การจัดองค์ประกอบภาพ Rule of Thirds",
  "เทคนิคจิตรกรรมสีน้ำเบื้องต้น (เปียกบนเปียก)",
  "การออกแบบลวดลายผ้าและลายไทยร่วมสมัย",
  "ประวัติศาสตร์ศิลปะยุคเรเนซองส์และศิลปินเอก",
];

export default function AiMaterialStudioModal({
  isOpen,
  onClose,
  onOpenPreview,
}: AiMaterialStudioModalProps) {
  const [selectedModel, setSelectedModel] = useState<string>("gpt");
  const [topic, setTopic] = useState<string>("");
  const [grade, setGrade] = useState<string>("all");
  const [category, setCategory] = useState<string>("ใบงานและแบบฝึกหัด");
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [importText, setImportText] = useState<string>("");
  const [isImporting, setIsImporting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleGenerateInSystem = async () => {
    if (!topic.trim()) {
      alert("กรุณาระบุหัวข้อสื่อการสอนที่ต้องการออกแบบ");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/admin/generate-material", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          grade,
          category,
          aiModel: selectedModel,
          customPrompt: customPrompt.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.material) {
        onClose();
        onOpenPreview(data.material);
      } else {
        alert(data.error || "ไม่สามารถออกแบบสื่อการสอนได้ กรุณาลองใหม่อีกครั้ง");
      }
    } catch (e) {
      console.error(e);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ AI");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMasterPromptText = () => {
    const gradeText = grade === "all" ? "ทุกระดับชั้นมัธยมศึกษา" : `ชั้นมัธยมศึกษาปีที่ ${grade.replace("m", "")}`;
    return `คุณคือผู้เชี่ยวชาญด้านการออกแบบหลักสูตรและการสอนวิชาทัศนศิลป์ (Visual Arts) ระดับมัธยมศึกษา โรงเรียนวชิรธรรมสาธิต
ช่วยออกแบบสื่อการสอนประเภท "${category}" สำหรับนักเรียน "${gradeText}" 
เรื่อง: "${topic || 'การสร้างสรรค์ผลงานศิลปะ'}"

กรุณาจัดทำรายละเอียดให้ครบถ้วนในรูปแบบที่นำไปใช้งานได้จริง:
1. ชื่อสื่อการสอน / ชื่องานที่น่าสนใจ
2. จุดประสงค์การเรียนรู้ 3 ข้อ (พุทธิพิสัย, ทักษะพิสัย, จิตพิสัย)
3. สาระสำคัญ / องค์ความรู้เชิงทฤษฎีศิลปะ (เข้าใจง่าย เหมาะกับวัย)
4. ขั้นตอนและคำชี้แจงกิจกรรมของนักเรียน (Step-by-step 4 ขั้นตอน)
5. ตารางเกณฑ์การประเมินรูบริก 4 ระดับ (ยอดเยี่ยม, ดี, พอใช้, ปรับปรุง)
6. คำถามสะท้อนคิดหลังบทเรียน 2 ข้อ

ใช้สำนวนภาษาทางการ สุภาพ และส่งเสริมความคิดสร้างสรรค์ตามแนวทางของกลุ่มสาระการเรียนรู้ศิลปะ`;
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(generateMasterPromptText());
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      prompt("คัดลอก Master Prompt สำหรับนำไปใช้งาน:", generateMasterPromptText());
    }
  };

  const handleParseImportText = () => {
    if (!importText.trim()) return;
    const lines = importText.split("\n").map((l) => l.trim()).filter(Boolean);
    const parsedTitle = lines[0]?.replace(/^[#*-0-9.\s]+/, "") || topic || "ใบงานศิลปะสร้างสรรค์";
    const parsedDesc = lines.slice(1, 4).join(" ").substring(0, 160) || `สื่อการสอนเรื่อง ${parsedTitle} สำหรับนักเรียนโรงเรียนวชิรธรรมสาธิต`;

    const importedMaterial = {
      title: parsedTitle,
      topic: topic || parsedTitle,
      category,
      grade,
      description: parsedDesc,
      objectives: [
        "เข้าใจหลักการและความสำคัญของหัวข้อที่เรียนรู้",
        "สามารถปฏิบัติงานสร้างสรรค์ตามขั้นตอนได้อย่างถูกต้อง",
        "เห็นคุณค่าในผลงานและมีความมุ่งมั่นในการทำงาน"
      ],
      theoryContent: importText,
      activitySteps: [
        { step: 1, title: "เตรียมอุปกรณ์และทำความเข้าใจโจทย์", detail: "ศึกษาเอกสารและเตรียมอุปกรณ์วาดภาพให้พร้อม" },
        { step: 2, title: "วางแผนและร่างภาพ", detail: "ร่างโครงสร้างภาพตามหลักการที่ได้เรียนรู้" },
        { step: 3, title: "ลงมือสร้างสรรค์ผลงาน", detail: "ใช้เทคนิคที่กำหนดอย่างประณีตและตั้งใจ" },
        { step: 4, title: "ตรวจทานและส่งงาน", detail: "ประเมินผลงานของตนเองตามเกณฑ์ก่อนส่ง" }
      ],
      rubricCriteria: [
        { criteria: "ความคิดสร้างสรรค์", weight: "30%", description: "มีความแปลกใหม่และน่าสนใจ" },
        { criteria: "ทักษะและเทคนิค", weight: "40%", description: "ใช้เครื่องมือและเทคนิคถูกต้อง" },
        { criteria: "ความประณีต", weight: "30%", description: "งานสะอาด เรียบร้อย ตรงเวลา" }
      ],
      recommendedImageUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=800&auto=format&fit=crop",
      suggestedFileName: `worksheet_${Date.now()}.pdf`,
      fileSize: "1.5 MB",
      fileUrl: "https://pdfobject.com/pdf/sample.pdf",
      contentMarkdown: importText,
      aiModel: selectedModel,
      aiPersonaName: AI_PERSONAS.find((p) => p.id === selectedModel)?.name || "AI Assistant",
      generatedAt: new Date().toISOString()
    };

    onClose();
    onOpenPreview(importedMaterial);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isGenerating) onClose();
      }}
    >
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200 my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-orange-50/80 via-amber-50/40 to-white">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-orange-500/25 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-xl font-bold font-kanit text-gray-900 leading-tight">
                  ระบบ AI ผู้ช่วยออกแบบสื่อการสอน (AI Material Studio)
                </h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-2xs">
                  Art Room AI
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                เลือกโมเดล AI ผู้ช่วย (GPT, Gemini, Claude, Notebook LM) เพื่อสังเคราะห์ใบงานและสื่อการสอนศิลปะ พร้อมพรีวิวก่อนเผยแพร่
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {/* Section 1: Choose AI Persona */}
          <div className="space-y-2.5">
            <label className="font-bold text-gray-800 text-xs sm:text-sm flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-orange-600" />
                <span>1. เลือกโมเดล AI ผู้ช่วยที่คุณต้องการใช้งาน</span>
              </span>
              <span className="text-[11px] font-normal text-gray-400">
                (คลิกเลือกโมเดลด้านล่าง)
              </span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {AI_PERSONAS.map((m) => {
                const isSelected = selectedModel === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedModel(m.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? m.borderActive
                        : "border-gray-200 hover:border-orange-300 bg-white"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="font-bold text-gray-900 text-xs font-kanit">
                          {m.name}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
                        )}
                      </div>
                      <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 mb-1.5">
                        {m.badge}
                      </span>
                      <p className="text-[11px] text-gray-500 leading-relaxed font-light">
                        {m.description}
                      </p>
                    </div>

                    <div className="pt-2 mt-2 border-t border-gray-100 flex items-center justify-between text-[10px]">
                      <span className="text-gray-400">{m.provider}</span>
                      <a
                        href={m.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-orange-600 hover:underline inline-flex items-center gap-0.5 font-medium"
                      >
                        <span>เปิดเว็บ</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Material Parameters */}
          <div className="space-y-3.5 bg-gray-50/70 p-4 sm:p-5 rounded-2xl border border-gray-200/80">
            <h4 className="font-bold text-gray-900 text-xs sm:text-sm flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-orange-600" />
              <span>2. กำหนดหัวข้อและประเภทสื่อการสอน</span>
            </h4>

            {/* Topic Input */}
            <div>
              <label className="font-bold text-gray-700 block mb-1">
                หัวข้อหรือประเด็นที่ต้องการสอน <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="เช่น การวาดภาพทัศนียภาพ 1 จุด, เทคนิคสีไม้ไล่เฉดสีผลไม้, ทฤษฎีสีและคู่สีตรงข้าม..."
                className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none text-xs font-medium"
              />
            </div>

            {/* Quick Suggestions Chips */}
            <div>
              <span className="text-[11px] text-gray-500 block mb-1.5 font-medium">
                💡 หรือคลิกเลือกไอเดียแนะนำยอดนิยม:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_IDEAS.map((idea, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTopic(idea)}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-orange-50 border border-gray-200 hover:border-orange-300 text-[11px] text-gray-700 transition-colors cursor-pointer shadow-2xs"
                  >
                    + {idea}
                  </button>
                ))}
              </div>
            </div>

            {/* Grade & Category Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="font-bold text-gray-700 block mb-1">ระดับชั้นเป้าหมาย</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white focus:border-orange-500 outline-none text-xs font-medium cursor-pointer"
                >
                  <option value="all">ทุกระดับชั้น (All Levels)</option>
                  <option value="m1">มัธยมศึกษาปีที่ 1 (ม.1)</option>
                  <option value="m2">มัธยมศึกษาปีที่ 2 (ม.2)</option>
                  <option value="m3">มัธยมศึกษาปีที่ 3 (ม.3)</option>
                  <option value="m4">มัธยมศึกษาปีที่ 4 (ม.4)</option>
                  <option value="m5">มัธยมศึกษาปีที่ 5 (ม.5)</option>
                  <option value="m6">มัธยมศึกษาปีที่ 6 (ม.6)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">ประเภทสื่อการสอน</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white focus:border-orange-500 outline-none text-xs font-medium cursor-pointer"
                >
                  <option value="ใบงานและแบบฝึกหัด">📄 ใบงานและแบบฝึกหัด (Worksheet)</option>
                  <option value="ใบความรู้และชีตสรุป">📚 ใบความรู้และชีตสรุป (Knowledge Sheet)</option>
                  <option value="สื่อวิดีทัศน์">🎬 สื่อวิดีทัศน์ / วิดีโอสอน (Video Lesson)</option>
                  <option value="สื่อภาพและเทคนิค">🖼️ สื่อภาพและเทคนิค (Visual Guide)</option>
                  <option value="คู่มือและเกณฑ์ประเมิน">📖 คู่มือและเกณฑ์ประเมิน (Handbook & Rubrics)</option>
                  <option value="สไลด์สื่อการสอน (Canva/PPT)">🎨 สไลด์สื่อการสอน (Presentation)</option>
                  <option value="แบบฝึกหัด">✏️ แบบฝึกหัด (Practice)</option>
                  <option value="เกณฑ์การประเมิน">📝 เกณฑ์การประเมินรูบริก (Rubric Guide)</option>
                  <option value="ข้อสอบ/แบบทดสอบ">📑 ข้อสอบ / แบบทดสอบ (Quiz & Exam)</option>
                  <option value="สื่อการเรียนรู้">✨ สื่อการเรียนรู้ทั่วไป (Learning Materials)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: AI Tool Bridge & External Prompt Copy */}
          <div className="space-y-3 bg-amber-50/50 p-4 sm:p-5 rounded-2xl border border-amber-200/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-bold text-amber-950 text-xs sm:text-sm flex items-center gap-1.5">
                  <Wand2 className="w-4 h-4 text-amber-600" />
                  <span>3. เครื่องมือคัดลอก Master Prompt ไปใช้กับ AI ภายนอก</span>
                </h4>
                <p className="text-[11px] text-amber-900/80 mt-0.5">
                  สามารถคัดลอก Prompt ภาษาไทยที่ปรับแต่งมาอย่างดี ไปวางใน ChatGPT, Gemini, Claude หรือ NotebookLM เพื่อต่อยอดได้อิสระ
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleCopyPrompt}
                className="rounded-xl text-xs h-9 px-3.5 border-amber-300 text-amber-900 hover:bg-amber-100/70 bg-white shrink-0 cursor-pointer"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    <span>คัดลอก Prompt แล้ว!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    <span>คัดลอก Master Prompt</span>
                  </>
                )}
              </Button>
            </div>

            {/* Quick links to 4 AI providers */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-[11px] text-amber-900 font-medium">เปิดเว็บโมเดลภายนอก:</span>
              <a
                href="https://chatgpt.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg bg-white border border-amber-200 hover:border-emerald-400 text-emerald-800 text-[10px] font-bold flex items-center gap-1 shadow-2xs"
              >
                <span>ChatGPT ↗</span>
              </a>
              <a
                href="https://gemini.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg bg-white border border-amber-200 hover:border-blue-400 text-blue-800 text-[10px] font-bold flex items-center gap-1 shadow-2xs"
              >
                <span>Google Gemini ↗</span>
              </a>
              <a
                href="https://claude.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg bg-white border border-amber-200 hover:border-purple-400 text-purple-800 text-[10px] font-bold flex items-center gap-1 shadow-2xs"
              >
                <span>Claude ↗</span>
              </a>
              <a
                href="https://notebooklm.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg bg-white border border-amber-200 hover:border-orange-400 text-orange-800 text-[10px] font-bold flex items-center gap-1 shadow-2xs"
              >
                <span>Notebook LM ↗</span>
              </a>
            </div>

            {/* Import Box */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-amber-900 font-bold">
                  นำเข้าข้อความที่ได้จาก AI ภายนอก (Import / Paste Text):
                </span>
                {importText && (
                  <button
                    type="button"
                    onClick={handleParseImportText}
                    className="text-[11px] text-orange-700 font-bold hover:underline cursor-pointer"
                  >
                    นำข้อมูลนี้ไปเปิดดู Live Preview ➔
                  </button>
                )}
              </div>
              <textarea
                rows={2}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="วางผลลัพธ์ที่ได้จาก ChatGPT, Claude หรือ NotebookLM ที่นี่ เพื่อนำเข้าและพรีวิว..."
                className="w-full p-2.5 rounded-xl border border-amber-200 bg-white focus:border-amber-500 outline-none text-[11px] font-mono leading-relaxed resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-gray-100 bg-white flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isGenerating}
            className="rounded-xl text-xs px-4 h-11 border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer"
          >
            ยกเลิก
          </Button>

          <Button
            type="button"
            onClick={handleGenerateInSystem}
            disabled={isGenerating || !topic.trim()}
            className="rounded-xl text-xs font-bold px-7 h-11 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/25 cursor-pointer transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>AI กำลังออกแบบสื่อการสอน...</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>✨ ให้ AI ออกแบบและเปิด Live Preview</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

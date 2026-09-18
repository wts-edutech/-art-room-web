"use client";

import { useState, useRef, useEffect } from "react";
import { 
  FileText, Sparkles, Download, Eye, Palette, 
  RotateCcw, CheckCircle2, ArrowRight, BookOpen, 
  Layers, Lightbulb, PenTool, Circle, Info
} from "lucide-react";
import Link from "next/link";

interface DigitalLessonWorksheetProps {
  title?: string;
  pdfUrl?: string;
  attachmentName?: string;
}

export default function DigitalLessonWorksheet({
  title = "พื้นฐาน: เรื่องของ 'จุด'",
  pdfUrl,
  attachmentName = "worksheet_01_points_and_lines.pdf",
}: DigitalLessonWorksheetProps) {
  const [activeTab, setActiveTab] = useState<"worksheet" | "studio" | "pdf">("worksheet");

  // Canvas State for Interactive Dot Studio
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dotSize, setDotSize] = useState<number>(2);
  const [toolMode, setToolMode] = useState<"single" | "spray" | "eraser">("spray");
  const [sprayDensity, setSprayDensity] = useState<number>(12);
  const [inkColor, setInkColor] = useState<string>("#1f2937");
  const [hasDrawn, setHasDrawn] = useState<boolean>(false);
  const [template, setTemplate] = useState<"blank" | "sphere">("sphere");
  const isDrawingRef = useRef<boolean>(false);

  // Initialize canvas
  useEffect(() => {
    if (activeTab === "studio" && canvasRef.current) {
      initCanvas();
    }
  }, [activeTab, template]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Draw Template if sphere selected
    if (template === "sphere") {
      drawSphereTemplate(ctx, rect.width, rect.height);
    }
  };

  const drawSphereTemplate = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.32;

    // Guideline circle (dotted)
    ctx.save();
    ctx.setLineDash([4, 6]);
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Light source indicator arrow
    ctx.setLineDash([]);
    ctx.strokeStyle = "#f59e0b";
    ctx.fillStyle = "#f59e0b";
    ctx.lineWidth = 2;

    // Light arrow
    ctx.beginPath();
    ctx.moveTo(centerX - radius - 40, centerY - radius - 40);
    ctx.lineTo(centerX - radius + 10, centerY - radius + 10);
    ctx.stroke();

    ctx.font = "bold 12px Kanit, sans-serif";
    ctx.fillText("☀️ ทิศทางแสงเข้า (Light Source)", centerX - radius - 80, centerY - radius - 50);

    // Subtle helper text
    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px Kanit, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("พื้นที่ไฮไลท์ (จุดห่างที่สุด)", centerX - radius * 0.3, centerY - radius * 0.3);
    ctx.fillText("พื้นที่เงามืด (จุดหนาแน่นที่สุด)", centerX + radius * 0.4, centerY + radius * 0.5);

    ctx.restore();
  };

  // Draw Dots Logic
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    placeDot(e);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    placeDot(e);
  };

  const handleCanvasMouseUp = () => {
    isDrawingRef.current = false;
  };

  const placeDot = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setHasDrawn(true);

    if (toolMode === "eraser") {
      ctx.save();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(x, y, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.fillStyle = inkColor;

    if (toolMode === "single") {
      ctx.beginPath();
      ctx.arc(x, y, dotSize, 0, Math.PI * 2);
      ctx.fill();
    } else if (toolMode === "spray") {
      const radius = 18;
      for (let i = 0; i < sprayDensity; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * radius;
        const dotX = x + r * Math.cos(angle);
        const dotY = y + r * Math.sin(angle);
        ctx.beginPath();
        ctx.arc(dotX, dotY, dotSize * (0.8 + Math.random() * 0.4), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  };

  const handleDownloadArtwork = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `stippling_art_${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="w-full bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
      {/* Top Interactive Mode Navigation Bar */}
      <div className="bg-gray-50/90 p-2.5 sm:p-3 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-gray-200/80 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab("worksheet")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "worksheet"
                ? "bg-orange-500 text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>ใบความรู้และแบบฝึกหัด</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("studio")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "studio"
                ? "bg-orange-500 text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>กระดานทดลองแต้มจุด (Dot Studio)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pdf")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "pdf"
                ? "bg-orange-500 text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>มุมมอง PDF</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden md:inline-flex text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            ✓ สื่อการเรียนรู้ทางการประจำวิชาศิลปะ
          </span>
        </div>
      </div>

      {/* MODE 1: DIGITAL WORKSHEET (Rich Educational Sheet in Thai) */}
      {activeTab === "worksheet" && (
        <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200 font-sans">
          {/* School Header Banner */}
          <div className="bg-gradient-to-r from-orange-50/70 to-amber-50/70 p-6 rounded-2xl border border-orange-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="inline-block text-[11px] font-bold text-orange-700 uppercase tracking-wide bg-white px-2.5 py-0.5 rounded-full border border-orange-200 shadow-2xs">
                โรงเรียนวชิรธรรมสาธิต • กลุ่มสาระการเรียนรู้ศิลปะ
              </span>
              <h2 className="text-xl sm:text-2xl font-black font-kanit text-gray-900 leading-tight">
                ใบความรู้ที่ 1.1: พื้นฐานการสร้างสรรค์ด้วย "จุด" (Point in Art)
              </h2>
              <p className="text-xs text-gray-600">
                รายวิชา ศ21101 ศิลปะ 1 (ทัศนศิลป์) • ระดับชั้นมัธยมศึกษาปีที่ 1 • ภาคเรียนที่ 1
              </p>
            </div>
            <div className="text-right sm:border-l sm:border-orange-200/80 sm:pl-6 shrink-0 text-xs text-gray-500">
              <p className="font-bold text-gray-800">หน่วยการเรียนรู้ที่ 1</p>
              <p>ทัศนธาตุและการจัดวาง</p>
              <p className="text-[11px] text-orange-600 font-semibold mt-1">เวลาเรียน 2 คาบ</p>
            </div>
          </div>

          {/* Section 1: Definition of Point */}
          <section className="space-y-3">
            <h3 className="text-base sm:text-lg font-bold font-kanit text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span>1. "จุด" (Point/Dot) ในทางทัศนศิลป์คืออะไร?</span>
            </h3>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-light">
              <strong>จุด</strong> คือ หน่วยย่อยที่สุดของทัศนธาตุทางศิลปะที่สายตามองเห็นได้ จุดไม่มีมิติความกว้าง ความยาว หรือความลึกในตัวเอง แต่เมื่อถูกจรดลงบนระนาบว่าง (Space) จุดจะกลายเป็น <strong>"ศูนย์รวมความสนใจ (Focal Point)"</strong> แรกของสายตามนุษย์ทันที
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/70 text-xs space-y-1">
                <span className="font-bold text-gray-900 block">จุดเดี่ยว (Single Dot)</span>
                <p className="text-gray-600 text-[11px]">ดึงดูดสายตา ให้ความรู้สึกหยุดนิ่ง มั่นคง และเป็นเป้าหมาย</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/70 text-xs space-y-1">
                <span className="font-bold text-gray-900 block">จุดเรียงแถว (Linear Dots)</span>
                <p className="text-gray-600 text-[11px]">สายตาจะเชื่อมจุดต่อจุดอัตโนมัติ นำสายตาเกิดเป็น "เส้น (Line)"</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/70 text-xs space-y-1">
                <span className="font-bold text-gray-900 block">จุดกลุ่ม (Cluster Dots)</span>
                <p className="text-gray-600 text-[11px]">จุดที่เกาะกลุ่มหนาแน่น จะเกิดเป็น "น้ำหนัก รูปร่าง และพื้นผิว"</p>
              </div>
            </div>
          </section>

          {/* Section 2: Stippling & Value Scale */}
          <section className="space-y-4">
            <h3 className="text-base sm:text-lg font-bold font-kanit text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span>2. เทคนิคการสร้างน้ำหนักแสงเงาด้วยจุด (Stippling Value Scale)</span>
            </h3>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-light">
              <strong>Stippling (สตีปปลิง)</strong> คือ เทคนิคการสร้างน้ำหนักแสงเงาและมิติความตื้นลึกโดยใช้เพียง "จุด" ขนาดเล็กนับร้อยนับพันจุด โดยไม่ต้องลากเส้นแรเงา (Hatching) เลยแม้แต่เส้นเดียว
            </p>

            {/* Interactive Visual Scale Bar */}
            <div className="bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-200 space-y-3">
              <span className="text-xs font-bold text-gray-800 block">
                ตารางระดับน้ำหนัก 5 ระดับด้วยเทคนิคจุด (5-Step Stippling Scale):
              </span>

              <div className="overflow-x-auto pb-1">
                <div className="grid grid-cols-5 min-w-[340px] gap-2 text-center text-xs">
                  {/* Level 1: Highlight */}
                  <div className="space-y-1.5">
                    <div className="h-20 rounded-xl bg-white border border-gray-300 flex items-center justify-center p-2 relative overflow-hidden shadow-2xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-800 m-auto" />
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-800 absolute top-3 right-4" />
                    </div>
                    <span className="font-bold text-gray-800 text-[11px] block">ระดับ 1</span>
                    <span className="text-[10px] text-gray-500 block">ไฮไลท์ (จุดห่าง)</span>
                  </div>

                  {/* Level 2: Light Midtone */}
                  <div className="space-y-1.5">
                    <div className="h-20 rounded-xl bg-white border border-gray-300 flex flex-wrap gap-2.5 p-2.5 items-center justify-center relative shadow-2xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-800" />
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-800" />
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-800" />
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-800" />
                    </div>
                    <span className="font-bold text-gray-800 text-[11px] block">ระดับ 2</span>
                    <span className="text-[10px] text-gray-500 block">แสงสว่าง</span>
                  </div>

                  {/* Level 3: Midtone */}
                  <div className="space-y-1.5">
                    <div className="h-20 rounded-xl bg-white border border-gray-300 flex flex-wrap gap-1.5 p-2 items-center justify-center shadow-2xs">
                      {Array.from({ length: 14 }).map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-800" />
                      ))}
                    </div>
                    <span className="font-bold text-gray-800 text-[11px] block">ระดับ 3</span>
                    <span className="text-[10px] text-gray-500 block">น้ำหนักกลาง</span>
                  </div>

                  {/* Level 4: Shadow */}
                  <div className="space-y-1.5">
                    <div className="h-20 rounded-xl bg-white border border-gray-300 flex flex-wrap gap-1.5 p-1.5 items-center justify-center shadow-2xs">
                      {Array.from({ length: 32 }).map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-900" />
                      ))}
                    </div>
                    <span className="font-bold text-gray-800 text-[11px] block">ระดับ 4</span>
                    <span className="text-[10px] text-gray-500 block">เงาเข้ม</span>
                  </div>

                  {/* Level 5: Core Shadow */}
                  <div className="space-y-1.5">
                    <div className="h-20 rounded-xl bg-gray-900 border border-gray-900 flex items-center justify-center p-2 shadow-2xs">
                      <span className="text-[10px] text-gray-400">จุดทึบแน่น</span>
                    </div>
                    <span className="font-bold text-gray-800 text-[11px] block">ระดับ 5</span>
                    <span className="text-[10px] text-gray-500 block">เงามืดที่สุด</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-gray-200 text-xs text-gray-600 flex items-center gap-2 mt-2">
                <Info className="w-4 h-4 text-orange-600 shrink-0" />
                <span>
                  <strong>หลักการสำคัญ:</strong> ยิ่งจุดชิดและถี่มากเท่าไร ภาพจะยิ่งเข้มมืดลง ในทางกลับกัน ยิ่งจุดห่างและโปร่ง ภาพจะยิ่งสว่างขึ้น
                </span>
              </div>
            </div>
          </section>

          {/* Section 3: Pointillism History & Masterpiece */}
          <section className="space-y-3">
            <h3 className="text-base sm:text-lg font-bold font-kanit text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span>3. ศิลปะลัทธิผสานจุดสี (Pointillism) ในประวัติศาสตร์ศิลป์</span>
            </h3>
            <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 border border-gray-200/80 grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
              <div className="col-span-1 w-full h-44 sm:h-48 rounded-xl overflow-hidden bg-white border border-gray-200 shadow-xs relative flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600&auto=format&fit=crop"
                  alt="Pointillism Example"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="col-span-1 md:col-span-2 text-xs sm:text-sm text-gray-700 space-y-2.5">
                <p className="leading-relaxed">
                  <strong>จอร์จส์ เซอราต์ (Georges Seurat)</strong> ศิลปินเอกชาวฝรั่งเศส ได้ริเริ่มเทคนิคการใช้จุดสีเดี่ยวแต้มลงบนผืนผ้าใบ โดยไม่ผสมสีบนจานสีเลย เช่น การจุดสีเหลืองสลับกับจุดสีน้ำเงิน
                </p>
                <p className="leading-relaxed text-gray-600 font-light">
                  เมื่อเราถอยออกมามองในระยะห่าง ดวงตาของมนุษย์จะ <strong>"ผสมสีทางสายตา (Optical Color Mixing)"</strong> เอง ทำให้เรามองเห็นเป็นสีเขียวที่ดูสดใสเปล่งประกายกว่าการผสมสีทั่วไป
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Assignment Challenge */}
          <section className="bg-gradient-to-br from-orange-500/10 via-amber-500/10 to-transparent p-6 rounded-2xl border border-orange-200 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-sm">
                  ✏️
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm font-kanit">
                    กิจกรรมฝึกปฏิบัติการ (Practice Activity)
                  </h4>
                  <p className="text-[11px] text-gray-500">ภาระงานประจำหน่วยการเรียนรู้</p>
                </div>
              </div>
              <span className="text-xs font-bold text-orange-700 bg-white px-3 py-1 rounded-full border border-orange-200 shadow-2xs">
                คะแนนเต็ม 10 คะแนน
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-orange-200/70 text-xs text-gray-700 space-y-2">
              <p className="font-semibold text-gray-900">
                โจทย์: ให้นักเรียนฝึกวาดรูปทรงกลม 3 มิติ (3D Sphere) โดยใช้เทคนิคการแต้มจุด (Stippling) เพียงอย่างเดียว
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 text-[11px]">
                <li>ห้ามลากเส้นขอบหนา หรือใช้การแรเงาแบบขีดเส้น ให้ใช้จุดล้วนในการกำหนดขอบเขตและน้ำหนัก</li>
                <li>กำหนดให้ทิศทางแสงเข้าจากมุมบนซ้าย เงาตกทอด (Cast Shadow) ทอดไปทางขวาล่าง</li>
                <li>ใช้อุปกรณ์: ปากกาพิกม่าสีดำ เบอร์ 0.1 หรือ 0.3 ลงบนกระดาษวาดเขียนขนาด A4</li>
                <li>เมื่อทำเสร็จแล้ว ถ่ายรูปผลงานของตนเองให้ชัดเจน แล้วนำมาส่งในระบบส่งงาน</li>
              </ul>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
              <button
                type="button"
                onClick={() => setActiveTab("studio")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-800 text-xs font-bold hover:bg-gray-50 shadow-2xs transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                <span>เปิดกระดานทดลองแต้มจุดจำลอง</span>
              </button>

              <Link
                href="/submissions"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <span>ไปที่หน้าระบบส่งงาน</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </section>
        </div>
      )}

      {/* MODE 2: INTERACTIVE DOT STUDIO (Canvas Studio) */}
      {activeTab === "studio" && (
        <div className="p-4 sm:p-8 space-y-5 animate-in fade-in duration-200">
          {/* Studio Control Toolbar */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex flex-wrap items-center justify-between gap-4 text-xs">
            {/* Tool Mode */}
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-gray-200">
              <button
                type="button"
                onClick={() => setToolMode("spray")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  toolMode === "spray" ? "bg-orange-500 text-white shadow-xs" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                พ่นละอองจุด (Spray)
              </button>
              <button
                type="button"
                onClick={() => setToolMode("single")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  toolMode === "single" ? "bg-orange-500 text-white shadow-xs" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                จุดเดี่ยว (Single)
              </button>
              <button
                type="button"
                onClick={() => setToolMode("eraser")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  toolMode === "eraser" ? "bg-red-500 text-white shadow-xs" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                ยางลบ (Eraser)
              </button>
            </div>

            {/* Dot Size Controls */}
            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-medium">ขนาดหัวจุด:</span>
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200">
                {[1, 2, 3, 5].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setDotSize(size)}
                    className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center transition-all cursor-pointer ${
                      dotSize === size ? "bg-gray-800 text-white" : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Selector */}
            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-medium">แม่แบบฝึกหัด:</span>
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value as any)}
                className="h-9 px-3 rounded-xl border border-gray-200 bg-white font-semibold text-xs outline-none focus:border-orange-500"
              >
                <option value="sphere">ไกด์ทรงกลม 3D Sphere</option>
                <option value="blank">กระดานว่าง (Blank)</option>
              </select>
            </div>

            {/* Color Palette */}
            <div className="flex items-center gap-1.5">
              {[
                { name: "หมึกดำ", color: "#111827" },
                { name: "น้ำเงิน", color: "#1d4ed8" },
                { name: "แดง", color: "#b91c1c" },
                { name: "ส้ม", color: "#ea580c" },
              ].map((c) => (
                <button
                  key={c.color}
                  type="button"
                  title={c.name}
                  onClick={() => setInkColor(c.color)}
                  className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                    inkColor === c.color ? "ring-2 ring-offset-2 ring-orange-500 scale-110" : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.color }}
                />
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={initCanvas}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 font-bold transition-all cursor-pointer"
                title="ล้างกระดานวาดใหม่"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ล้างกระดาน</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadArtwork}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>บันทึกภาพ PNG</span>
              </button>
            </div>
          </div>

          {/* Interactive Canvas Stage */}
          <div className="relative rounded-2xl overflow-hidden border border-gray-300 bg-white shadow-inner flex items-center justify-center min-h-[460px]">
            <canvas
              ref={canvasRef}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              className="w-full h-[460px] cursor-crosshair touch-none"
            />

            {!hasDrawn && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none bg-gray-900/80 text-white text-xs px-4 py-2 rounded-full backdrop-blur-xs flex items-center gap-2 animate-bounce">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>คลิกหรือลากเมาส์บนกระดานเพื่อทดลองแต้มจุดสร้างน้ำหนักแสงเงา</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODE 3: PDF / ORIGINAL VIEWER */}
      {activeTab === "pdf" && (
        <div className="p-4 animate-in fade-in duration-200">
          {pdfUrl ? (
            <iframe
              className="w-full min-h-[70vh] rounded-2xl border border-gray-200 bg-white"
              src={pdfUrl}
              title={title}
            />
          ) : (
            <div className="p-12 text-center text-gray-400 bg-gray-50 rounded-2xl">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-30 text-gray-400" />
              <p className="text-sm">เอกสารใบงานนี้พร้อมให้เปิดในมุมมองดิจิทัลแบบโต้ตอบ</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

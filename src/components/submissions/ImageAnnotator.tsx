"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Check, Eraser, PenLine, RotateCcw, Trash2, Undo2, X, ImageOff } from "lucide-react";
import { swalAlert, swalConfirm } from "@/lib/swal";

/**
 * หน้าจอเขียนตรวจบนภาพผลงาน (เต็มจอ) — รองรับ Apple Pencil (แรงกด), นิ้ว และเมาส์
 * เส้นเก็บเป็นพิกัดสัดส่วน (0..1) เพื่อให้รวมกับภาพความละเอียดใดก็ได้ตอนบันทึก
 */

export interface AnnotatorImage {
  /** ภาพต้นฉบับของนักเรียน */
  originalUrl: string;
  /** ภาพที่ใช้เริ่มเขียน (ภาพที่เคยตรวจแล้ว หรือ ต้นฉบับ) */
  currentUrl: string;
}

type Tool = "pen" | "eraser";
type Point = { x: number; y: number; p: number };
type Stroke = { tool: Tool; points: Point[] };
type ImageState = { base: "current" | "original"; strokes: Stroke[] };

const PEN_COLOR = "#ef2b2b";
const PEN_WIDTH = 0.0045; // สัดส่วนของด้านยาวของภาพ
const ERASER_WIDTH = 0.035;
const MAX_EXPORT_DIM = 2000;

function widthFactor(p: number) {
  // pressure 0..1 (เมาส์/นิ้วมักเป็น 0.5) → 0.55..1.45
  return 0.55 + Math.min(1, Math.max(0, p)) * 0.9;
}

function drawSegment(
  ctx: CanvasRenderingContext2D,
  stroke: Stroke,
  from: Point,
  to: Point,
  w: number,
  h: number
) {
  const longSide = Math.max(w, h);
  const base = (stroke.tool === "pen" ? PEN_WIDTH : ERASER_WIDTH) * longSide;
  ctx.globalCompositeOperation = stroke.tool === "pen" ? "source-over" : "destination-out";
  ctx.strokeStyle = PEN_COLOR;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = stroke.tool === "pen" ? base * widthFactor((from.p + to.p) / 2) : base;
  ctx.beginPath();
  ctx.moveTo(from.x * w, from.y * h);
  ctx.lineTo(to.x * w, to.y * h);
  ctx.stroke();
}

function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke, w: number, h: number) {
  const pts = stroke.points;
  if (pts.length === 0) return;
  if (pts.length === 1) {
    drawSegment(ctx, stroke, pts[0], { ...pts[0], x: pts[0].x + 0.0001 }, w, h);
    return;
  }
  for (let i = 1; i < pts.length; i++) drawSegment(ctx, stroke, pts[i - 1], pts[i], w, h);
}

function renderStrokes(canvas: HTMLCanvasElement, strokes: Stroke[]) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.globalCompositeOperation = "source-over";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const s of strokes) drawStroke(ctx, s, canvas.width, canvas.height);
  ctx.globalCompositeOperation = "source-over";
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("โหลดภาพไม่สำเร็จ"));
    img.src = src;
  });
}

/** รวมภาพพื้น + เส้นที่เขียน → JPEG data URL */
async function flatten(baseUrl: string, strokes: Stroke[]): Promise<string> {
  const img = await loadImage(baseUrl);
  const scale = Math.min(1, MAX_EXPORT_DIM / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));

  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  const ctx = out.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);

  const layer = document.createElement("canvas");
  layer.width = w;
  layer.height = h;
  renderStrokes(layer, strokes);
  ctx.drawImage(layer, 0, 0);

  return out.toDataURL("image/jpeg", 0.85);
}

interface ImageAnnotatorProps {
  images: AnnotatorImage[];
  initialIndex?: number;
  title?: string;
  /** changes: { index: dataUrl ใหม่ | null (ลบการเขียน) } เฉพาะภาพที่มีการเปลี่ยนแปลง */
  onDone: (changes: Record<number, string | null>) => void;
  onCancel: () => void;
}

export default function ImageAnnotator({ images, initialIndex = 0, title, onDone, onCancel }: ImageAnnotatorProps) {
  const [activeIdx, setActiveIdx] = useState(Math.min(initialIndex, Math.max(0, images.length - 1)));
  const [tool, setTool] = useState<Tool>("pen");
  const [states, setStates] = useState<ImageState[]>(() => images.map(() => ({ base: "current", strokes: [] })));
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [box, setBox] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [imgError, setImgError] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activePointer = useRef<number | null>(null);
  const liveStroke = useRef<Stroke | null>(null);
  const statesRef = useRef(states);
  statesRef.current = states;

  const active = images[activeIdx];
  const activeState = states[activeIdx];
  const hasExisting = (i: number) => images[i] && images[i].currentUrl !== images[i].originalUrl;
  const baseUrl = activeState?.base === "original" ? active?.originalUrl : active?.currentUrl;

  const isDirty = (s: ImageState, i: number) => s.strokes.length > 0 || (s.base === "original" && hasExisting(i));
  const anyDirty = states.some(isDirty);

  // ล็อกการเลื่อนหน้าขณะเขียน
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // คำนวณขนาดภาพให้พอดีพื้นที่
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage || !natural) return;
    const fit = () => {
      const cw = stage.clientWidth;
      const ch = stage.clientHeight;
      const s = Math.min(cw / natural.w, ch / natural.h);
      setBox({ w: Math.floor(natural.w * s), h: Math.floor(natural.h * s) });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [natural]);

  // ปรับความละเอียด canvas และวาดเส้นใหม่เมื่อขนาด/ภาพเปลี่ยน
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !box.w || !box.h) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    canvas.width = Math.round(box.w * dpr);
    canvas.height = Math.round(box.h * dpr);
    renderStrokes(canvas, statesRef.current[activeIdx]?.strokes || []);
  }, [box, activeIdx]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && canvas.width) renderStrokes(canvas, activeState?.strokes || []);
  }, [activeState?.strokes]);

  useEffect(() => {
    setNatural(null);
    setImgError(false);
  }, [baseUrl]);

  const updateActive = useCallback(
    (fn: (s: ImageState) => ImageState) => {
      setStates((prev) => prev.map((s, i) => (i === activeIdx ? fn(s) : s)));
    },
    [activeIdx]
  );

  const toPoint = (e: { clientX: number; clientY: number; pressure: number; pointerType: string }): Point => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const p = e.pointerType === "pen" ? (e.pressure > 0 ? e.pressure : 0.5) : 0.5;
    return {
      x: Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height)),
      p,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activePointer.current !== null) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    activePointer.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    const stroke: Stroke = { tool, points: [toPoint(e)] };
    liveStroke.current = stroke;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    drawStroke(ctx, stroke, canvas.width, canvas.height);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activePointer.current !== e.pointerId || !liveStroke.current) return;
    e.preventDefault();
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const native = e.nativeEvent as PointerEvent;
    const events = typeof native.getCoalescedEvents === "function" ? native.getCoalescedEvents() : [];
    const list = events.length > 0 ? events : [native];
    const stroke = liveStroke.current;
    for (const ev of list) {
      const pt = toPoint(ev);
      const prev = stroke.points[stroke.points.length - 1];
      stroke.points.push(pt);
      drawSegment(ctx, stroke, prev, pt, canvas.width, canvas.height);
    }
  };

  const finishStroke = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activePointer.current !== e.pointerId) return;
    activePointer.current = null;
    const stroke = liveStroke.current;
    liveStroke.current = null;
    if (stroke && stroke.points.length > 0) {
      updateActive((s) => ({ ...s, strokes: [...s.strokes, stroke] }));
    }
  };

  const handleUndo = () => updateActive((s) => ({ ...s, strokes: s.strokes.slice(0, -1) }));

  const handleClear = async () => {
    if (!activeState || activeState.strokes.length === 0) return;
    if (await swalConfirm("ล้างเส้นที่เขียนในรอบนี้ทั้งหมด?", { confirmText: "ล้างเส้น" })) {
      updateActive((s) => ({ ...s, strokes: [] }));
    }
  };

  const handleResetToOriginal = async () => {
    const ok = await swalConfirm(
      "เริ่มใหม่จากภาพต้นฉบับ? การเขียนตรวจเดิมของภาพนี้จะถูกลบเมื่อกดบันทึกคะแนน",
      { confirmText: "เริ่มใหม่", isDanger: true }
    );
    if (ok) updateActive(() => ({ base: "original", strokes: [] }));
  };

  const handleUseExisting = () => updateActive(() => ({ base: "current", strokes: [] }));

  const handleCancel = async () => {
    if (anyDirty && !(await swalConfirm("ยกเลิกการเขียนตรวจ? เส้นที่เขียนจะไม่ถูกบันทึก", { confirmText: "ยกเลิกการเขียน", isDanger: true }))) {
      return;
    }
    onCancel();
  };

  const handleDone = async () => {
    setIsExporting(true);
    try {
      const changes: Record<number, string | null> = {};
      for (let i = 0; i < images.length; i++) {
        const s = states[i];
        if (!isDirty(s, i)) continue;
        const url = s.base === "original" ? images[i].originalUrl : images[i].currentUrl;
        if (s.strokes.length === 0) {
          // เริ่มใหม่จากต้นฉบับแต่ไม่ได้เขียนอะไร → ลบการเขียนตรวจ
          changes[i] = null;
        } else {
          changes[i] = await flatten(url, s.strokes);
        }
      }
      onDone(changes);
    } catch (err) {
      console.error(err);
      swalAlert("ไม่สามารถรวมภาพที่เขียนได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsExporting(false);
    }
  };

  // คีย์ลัด Ctrl/Cmd+Z
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        setStates((prev) => prev.map((s, i) => (i === activeIdx ? { ...s, strokes: s.strokes.slice(0, -1) } : s)));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIdx]);

  const toolBtn = (selected: boolean) =>
    `h-11 px-3 sm:px-4 rounded-xl flex items-center gap-1.5 text-sm font-bold transition-all cursor-pointer select-none ${
      selected ? "bg-white text-gray-900 shadow-md" : "bg-white/10 text-white hover:bg-white/20"
    }`;

  return (
    <div
      className="fixed inset-0 z-[80] bg-neutral-900 flex flex-col select-none"
      style={{ WebkitUserSelect: "none", WebkitTouchCallout: "none" } as React.CSSProperties}
    >
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-5 py-2.5 bg-black/60 border-b border-white/10">
        <div className="min-w-0">
          <p className="text-white font-bold text-sm sm:text-base font-kanit truncate">✏️ เขียนตรวจบนภาพ</p>
          {title && <p className="text-[11px] text-gray-300 truncate">{title}</p>}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <button type="button" onClick={() => setTool("pen")} className={toolBtn(tool === "pen")} title="ปากกาแดง">
            <PenLine className="w-4 h-4" style={{ color: tool === "pen" ? PEN_COLOR : undefined }} />
            <span className="hidden sm:inline">ปากกา</span>
          </button>
          <button type="button" onClick={() => setTool("eraser")} className={toolBtn(tool === "eraser")} title="ยางลบ">
            <Eraser className="w-4 h-4" />
            <span className="hidden sm:inline">ยางลบ</span>
          </button>
          <button
            type="button"
            onClick={handleUndo}
            disabled={!activeState?.strokes.length}
            className={`${toolBtn(false)} disabled:opacity-40 disabled:cursor-not-allowed`}
            title="ย้อนกลับ (Undo)"
          >
            <Undo2 className="w-4 h-4" />
            <span className="hidden sm:inline">ย้อนกลับ</span>
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={!activeState?.strokes.length}
            className={`${toolBtn(false)} disabled:opacity-40 disabled:cursor-not-allowed`}
            title="ล้างเส้นที่เขียน"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden md:inline">ล้างเส้น</span>
          </button>
          {hasExisting(activeIdx) &&
            (activeState?.base === "current" ? (
              <button type="button" onClick={handleResetToOriginal} className={toolBtn(false)} title="เริ่มใหม่จากภาพต้นฉบับ">
                <RotateCcw className="w-4 h-4" />
                <span className="hidden md:inline">เริ่มใหม่จากต้นฉบับ</span>
              </button>
            ) : (
              <button type="button" onClick={handleUseExisting} className={toolBtn(false)} title="กลับไปใช้ภาพที่ตรวจไว้เดิม">
                <ImageOff className="w-4 h-4" />
                <span className="hidden md:inline">ใช้ภาพที่ตรวจเดิม</span>
              </button>
            ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="h-11 px-3 sm:px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">ยกเลิก</span>
          </button>
          <button
            type="button"
            onClick={handleDone}
            disabled={isExporting}
            className="h-11 px-4 sm:px-5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-bold flex items-center gap-1.5 cursor-pointer shadow-lg"
          >
            <Check className="w-4 h-4" />
            {isExporting ? "กำลังรวมภาพ..." : "เสร็จ"}
          </button>
        </div>
      </div>

      {/* Drawing stage */}
      <div ref={stageRef} className="relative flex-1 min-h-0 m-2 sm:m-4 flex items-center justify-center overflow-hidden">
        {baseUrl && (
          <div className="relative shadow-2xl bg-white" style={{ width: box.w || undefined, height: box.h || undefined }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={baseUrl}
              src={baseUrl}
              alt="ผลงานนักเรียน"
              draggable={false}
              onLoad={(e) => setNatural({ w: e.currentTarget.naturalWidth || 1, h: e.currentTarget.naturalHeight || 1 })}
              onError={() => setImgError(true)}
              className="block w-full h-full pointer-events-none"
              style={natural ? undefined : { position: "absolute", opacity: 0, width: 1, height: 1 }}
            />
            {natural && (
              <canvas
                ref={canvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={finishStroke}
                onPointerCancel={finishStroke}
                onContextMenu={(e) => e.preventDefault()}
                className="absolute inset-0 w-full h-full"
                style={{ touchAction: "none", cursor: tool === "pen" ? "crosshair" : "cell" }}
              />
            )}
          </div>
        )}
        {!natural && !imgError && <p className="absolute text-gray-400 text-sm">กำลังโหลดภาพ...</p>}
        {imgError && <p className="absolute text-red-300 text-sm">ไม่สามารถโหลดภาพได้</p>}
      </div>

      {/* Image switcher */}
      {images.length > 1 && (
        <div className="flex items-center justify-center gap-2.5 pb-3 pt-1">
          {images.map((img, idx) => {
            const s = states[idx];
            const thumb = s.base === "original" ? img.originalUrl : img.currentUrl;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIdx(idx)}
                className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-black/40 ${
                  activeIdx === idx ? "border-orange-500 ring-2 ring-orange-400/50" : "border-white/30 opacity-60 hover:opacity-100"
                }`}
                title={`ภาพที่ ${idx + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumb} alt={`ภาพที่ ${idx + 1}`} className="w-full h-full object-cover" />
                {isDirty(s, idx) && (
                  <span className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-red-500 border border-white" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}


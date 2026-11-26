"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  RotateCw,
  FlipHorizontal,
  Check,
  Sparkles,
  Sliders,
  RefreshCw,
  SunMedium,
  Contrast,
  Palette,
  Crop,
  Wand2,
  Maximize2,
  FileCheck2,
} from "lucide-react";

export type AspectPreset =
  | "free"
  | "original"
  | "a4-p"
  | "a4-l"
  | "4:5"
  | "3:4"
  | "4:3"
  | "16:9"
  | "1:1";

export interface ImageEditorModalProps {
  isOpen: boolean;
  file: File | null;
  onClose: () => void;
  onSave: (editedFile: File) => void;
  /** Optional handler when modal auto-opens on upload and student chooses to keep full original image */
  onSkipCrop?: (rawFile: File) => void;
  title?: string;
  defaultAspectRatio?: AspectPreset;
  /** Automatically detect worksheet/paper bounds and trim surrounding desk background on open */
  autoDetectArtwork?: boolean;
}

type FilterPreset = "normal" | "document" | "vivid" | "warm" | "pop" | "bw";

interface CropRect {
  x: number; // 0..1
  y: number; // 0..1
  w: number; // 0..1
  h: number; // 0..1
}

type DragHandle = "move" | "nw" | "ne" | "sw" | "se" | "n" | "s" | "w" | "e";

const FULL_CROP: CropRect = { x: 0, y: 0, w: 1, h: 1 };

function getTargetRatioValue(preset: AspectPreset, stageW: number, stageH: number): number | null {
  switch (preset) {
    case "free":
    case "original":
      return null;
    case "a4-p":
      return 1 / 1.4142;
    case "a4-l":
      return 1.4142;
    case "4:5":
      return 4 / 5;
    case "3:4":
      return 3 / 4;
    case "4:3":
      return 4 / 3;
    case "16:9":
      return 16 / 9;
    case "1:1":
      return 1;
    default:
      return stageW > 0 && stageH > 0 ? stageW / stageH : null;
  }
}

/**
 * Smart client-side detector that finds a paper worksheet / drawing canvas
 * photographed on a desk (wood, grey table, green cutting mat, dark floor, etc.)
 * while preserving safe margins so student names/scores on paper edges are never clipped.
 */
function detectArtworkBoundsFromCanvas(sourceCanvas: HTMLCanvasElement): { rect: CropRect; detected: boolean } {
  try {
    const maxSample = 280;
    const scale = Math.min(1, maxSample / Math.max(sourceCanvas.width, sourceCanvas.height));
    const w = Math.max(32, Math.round(sourceCanvas.width * scale));
    const h = Math.max(32, Math.round(sourceCanvas.height * scale));

    const sampleCanvas = document.createElement("canvas");
    sampleCanvas.width = w;
    sampleCanvas.height = h;
    const ctx = sampleCanvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return { rect: FULL_CROP, detected: false };

    ctx.drawImage(sourceCanvas, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;

    const getPixel = (x: number, y: number) => {
      const idx = (y * w + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const sat = Math.max(r, g, b) - Math.min(r, g, b);
      return { r, g, b, lum, sat };
    };

    const isBrightPaper = (p: { lum: number; sat: number }) =>
      (p.lum >= 176 && p.sat <= 42) || (p.lum >= 205 && p.sat <= 58);

    // Check if the central area actually contains bright worksheet/drawing paper
    let centerPaperHits = 0;
    let centerTotal = 0;
    for (let y = Math.floor(h * 0.22); y <= Math.floor(h * 0.78); y += 2) {
      for (let x = Math.floor(w * 0.22); x <= Math.floor(w * 0.78); x += 2) {
        centerTotal++;
        if (isBrightPaper(getPixel(x, y))) centerPaperHits++;
      }
    }
    const hasPaperCore = centerTotal > 0 && centerPaperHits / centerTotal >= 0.22;

    const medianColor = (coords: Array<[number, number]>) => {
      const rs: number[] = [];
      const gs: number[] = [];
      const bs: number[] = [];
      let paperCount = 0;
      for (const [x, y] of coords) {
        const p = getPixel(x, y);
        rs.push(p.r);
        gs.push(p.g);
        bs.push(p.b);
        if (isBrightPaper(p)) paperCount++;
      }
      rs.sort((a, b) => a - b);
      gs.sort((a, b) => a - b);
      bs.sort((a, b) => a - b);
      const mid = Math.floor(rs.length / 2);
      return {
        r: rs[mid] ?? 128,
        g: gs[mid] ?? 128,
        b: bs[mid] ?? 128,
        paperRatio: coords.length ? paperCount / coords.length : 0,
      };
    };

    const colorDist = (p: { r: number; g: number; b: number }, bg: { r: number; g: number; b: number }) =>
      Math.sqrt((p.r - bg.r) ** 2 + (p.g - bg.g) ** 2 + (p.b - bg.b) ** 2);

    const yStart = Math.floor(h * 0.1);
    const yEnd = Math.ceil(h * 0.9);
    const xStart = Math.floor(w * 0.1);
    const xEnd = Math.ceil(w * 0.9);

    // 1. Scan Left border inward
    const leftEdgeCoords: Array<[number, number]> = [];
    for (let y = yStart; y < yEnd; y++) leftEdgeCoords.push([1, y]);
    const leftBg = medianColor(leftEdgeCoords);
    let leftPx = 0;
    if (leftBg.paperRatio < 0.5) {
      let refBg = { r: leftBg.r, g: leftBg.g, b: leftBg.b };
      const maxX = Math.floor(w * 0.38);
      for (let x = 0; x < maxX; x++) {
        let bgMatches = 0;
        let paperMatches = 0;
        let count = 0;
        let sumR = 0, sumG = 0, sumB = 0;
        for (let y = yStart; y < yEnd; y += 2) {
          const p = getPixel(x, y);
          count++;
          if (isBrightPaper(p)) paperMatches++;
          if (colorDist(p, refBg) <= 48 || colorDist(p, leftBg) <= 44 || (leftBg.r + leftBg.g + leftBg.b < 180 && p.lum < 65)) {
            bgMatches++;
            sumR += p.r; sumG += p.g; sumB += p.b;
          }
        }
        const paperFrac = paperMatches / Math.max(1, count);
        const bgFrac = bgMatches / Math.max(1, count);
        if ((hasPaperCore && paperFrac >= 0.30) || bgFrac < 0.54) break;
        leftPx = x + 1;
        if (bgMatches > 4) {
          refBg = {
            r: Math.round(refBg.r * 0.6 + (sumR / bgMatches) * 0.4),
            g: Math.round(refBg.g * 0.6 + (sumG / bgMatches) * 0.4),
            b: Math.round(refBg.b * 0.6 + (sumB / bgMatches) * 0.4),
          };
        }
      }
    }

    // 2. Scan Right border inward
    const rightEdgeCoords: Array<[number, number]> = [];
    for (let y = yStart; y < yEnd; y++) rightEdgeCoords.push([w - 2, y]);
    const rightBg = medianColor(rightEdgeCoords);
    let rightPx = w - 1;
    if (rightBg.paperRatio < 0.5) {
      let refBg = { r: rightBg.r, g: rightBg.g, b: rightBg.b };
      const minX = Math.ceil(w * 0.62);
      for (let x = w - 1; x >= minX; x--) {
        let bgMatches = 0;
        let paperMatches = 0;
        let count = 0;
        let sumR = 0, sumG = 0, sumB = 0;
        for (let y = yStart; y < yEnd; y += 2) {
          const p = getPixel(x, y);
          count++;
          if (isBrightPaper(p)) paperMatches++;
          if (colorDist(p, refBg) <= 48 || colorDist(p, rightBg) <= 44 || (rightBg.r + rightBg.g + rightBg.b < 180 && p.lum < 65)) {
            bgMatches++;
            sumR += p.r; sumG += p.g; sumB += p.b;
          }
        }
        const paperFrac = paperMatches / Math.max(1, count);
        const bgFrac = bgMatches / Math.max(1, count);
        if ((hasPaperCore && paperFrac >= 0.30) || bgFrac < 0.54) break;
        rightPx = x - 1;
        if (bgMatches > 4) {
          refBg = {
            r: Math.round(refBg.r * 0.6 + (sumR / bgMatches) * 0.4),
            g: Math.round(refBg.g * 0.6 + (sumG / bgMatches) * 0.4),
            b: Math.round(refBg.b * 0.6 + (sumB / bgMatches) * 0.4),
          };
        }
      }
    }

    // 3. Scan Top border inward
    const topEdgeCoords: Array<[number, number]> = [];
    for (let x = xStart; x < xEnd; x++) topEdgeCoords.push([x, 1]);
    const topBg = medianColor(topEdgeCoords);
    let topPx = 0;
    if (topBg.paperRatio < 0.5) {
      let refBg = { r: topBg.r, g: topBg.g, b: topBg.b };
      const maxY = Math.floor(h * 0.36);
      for (let y = 0; y < maxY; y++) {
        let bgMatches = 0;
        let paperMatches = 0;
        let count = 0;
        let sumR = 0, sumG = 0, sumB = 0;
        for (let x = xStart; x < xEnd; x += 2) {
          const p = getPixel(x, y);
          count++;
          if (isBrightPaper(p)) paperMatches++;
          if (colorDist(p, refBg) <= 48 || colorDist(p, topBg) <= 44 || (topBg.r + topBg.g + topBg.b < 180 && p.lum < 65)) {
            bgMatches++;
            sumR += p.r; sumG += p.g; sumB += p.b;
          }
        }
        const paperFrac = paperMatches / Math.max(1, count);
        const bgFrac = bgMatches / Math.max(1, count);
        if ((hasPaperCore && paperFrac >= 0.30) || bgFrac < 0.54) break;
        topPx = y + 1;
        if (bgMatches > 4) {
          refBg = {
            r: Math.round(refBg.r * 0.6 + (sumR / bgMatches) * 0.4),
            g: Math.round(refBg.g * 0.6 + (sumG / bgMatches) * 0.4),
            b: Math.round(refBg.b * 0.6 + (sumB / bgMatches) * 0.4),
          };
        }
      }
    }

    // 4. Scan Bottom border inward (more conservative so bottom student name is never clipped)
    const bottomEdgeCoords: Array<[number, number]> = [];
    for (let x = xStart; x < xEnd; x++) bottomEdgeCoords.push([x, h - 2]);
    const bottomBg = medianColor(bottomEdgeCoords);
    let bottomPx = h - 1;
    if (bottomBg.paperRatio < 0.45) {
      let refBg = { r: bottomBg.r, g: bottomBg.g, b: bottomBg.b };
      const minY = Math.ceil(h * 0.66);
      for (let y = h - 1; y >= minY; y--) {
        let bgMatches = 0;
        let paperMatches = 0;
        let count = 0;
        let sumR = 0, sumG = 0, sumB = 0;
        for (let x = xStart; x < xEnd; x += 2) {
          const p = getPixel(x, y);
          count++;
          if (isBrightPaper(p)) paperMatches++;
          if (colorDist(p, refBg) <= 46 || colorDist(p, bottomBg) <= 42 || (bottomBg.r + bottomBg.g + bottomBg.b < 180 && p.lum < 65)) {
            bgMatches++;
            sumR += p.r; sumG += p.g; sumB += p.b;
          }
        }
        const paperFrac = paperMatches / Math.max(1, count);
        const bgFrac = bgMatches / Math.max(1, count);
        if ((hasPaperCore && paperFrac >= 0.26) || bgFrac < 0.58) break;
        bottomPx = y - 1;
        if (bgMatches > 4) {
          refBg = {
            r: Math.round(refBg.r * 0.6 + (sumR / bgMatches) * 0.4),
            g: Math.round(refBg.g * 0.6 + (sumG / bgMatches) * 0.4),
            b: Math.round(refBg.b * 0.6 + (sumB / bgMatches) * 0.4),
          };
        }
      }
    }

    // Add 1.4% outward breathing margin so paper borders and student names stay safe
    const pad = 0.014;
    const nx1 = leftPx > 3 ? Math.max(0, leftPx / w - pad) : 0;
    const ny1 = topPx > 3 ? Math.max(0, topPx / h - pad) : 0;
    const nx2 = rightPx < w - 4 ? Math.min(1, (rightPx + 1) / w + pad) : 1;
    const ny2 = bottomPx < h - 4 ? Math.min(1, (bottomPx + 1) / h + pad) : 1;

    const cw = nx2 - nx1;
    const ch = ny2 - ny1;
    const totalTrimmed = nx1 + ny1 + (1 - nx2) + (1 - ny2);

    if (cw >= 0.38 && ch >= 0.38 && totalTrimmed >= 0.035) {
      return {
        rect: { x: nx1, y: ny1, w: cw, h: ch },
        detected: true,
      };
    }

    return { rect: FULL_CROP, detected: false };
  } catch {
    return { rect: FULL_CROP, detected: false };
  }
}

export default function ImageEditorModal({
  isOpen,
  file,
  onClose,
  onSave,
  onSkipCrop,
  title = "ครอบตัดขอบโต๊ะ & ปรับภาพผลงาน",
  defaultAspectRatio = "free",
  autoDetectArtwork = true,
}: ImageEditorModalProps) {
  const [rotation90, setRotation90] = useState<number>(0); // 0, 90, 180, 270
  const [straighten, setStraighten] = useState<number>(0); // -15..+15 deg
  const [isFlippedH, setIsFlippedH] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<AspectPreset>(defaultAspectRatio);
  const [crop, setCrop] = useState<CropRect>(FULL_CROP);
  const [autoTrimmedNotice, setAutoTrimmedNotice] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"crop" | "adjust" | "filter">("crop");

  // Adjustments
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [activeFilter, setActiveFilter] = useState<FilterPreset>("normal");

  // Stage state (baked 90° rotation + flip so crop coordinates match 1:1 visually)
  const [stageUrl, setStageUrl] = useState<string | null>(null);
  const [stageNaturalSize, setStageNaturalSize] = useState<{ w: number; h: number }>({ w: 1, h: 1 });
  const [stageDisplaySize, setStageDisplaySize] = useState<{ w: number; h: number }>({ w: 320, h: 240 });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const rawImageRef = useRef<HTMLImageElement | null>(null);
  const stageCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<{
    handle: DragHandle;
    startClientX: number;
    startClientY: number;
    startCrop: CropRect;
  } | null>(null);

  // Build oriented stage canvas from raw image + 90-deg rotation + horizontal flip
  const rebuildStage = useCallback(
    (img: HTMLImageElement, rot90: number, flipH: boolean, runAutoDetect: boolean, targetPreset: AspectPreset) => {
      const swapped = rot90 === 90 || rot90 === 270;
      const rawW = swapped ? img.naturalHeight || img.height : img.naturalWidth || img.width;
      const rawH = swapped ? img.naturalWidth || img.width : img.naturalHeight || img.height;

      // Cap working canvas at 1800px for instant 60fps mobile interaction and crisp output
      const maxStageDim = 1800;
      const scale = Math.min(1, maxStageDim / Math.max(rawW, rawH));
      const cw = Math.max(64, Math.round(rawW * scale));
      const ch = Math.max(64, Math.round(rawH * scale));

      const c = document.createElement("canvas");
      c.width = cw;
      c.height = ch;
      const ctx = c.getContext("2d");
      if (!ctx) return;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.save();
      ctx.translate(cw / 2, ch / 2);
      ctx.rotate((rot90 * Math.PI) / 180);
      if (flipH) ctx.scale(-1, 1);

      const drawW = swapped ? ch : cw;
      const drawH = swapped ? cw : ch;
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      stageCanvasRef.current = c;
      setStageNaturalSize({ w: cw, h: ch });
      setStageUrl(c.toDataURL("image/jpeg", 0.92));

      if (runAutoDetect) {
        const { rect, detected } = detectArtworkBoundsFromCanvas(c);
        setAutoTrimmedNotice(detected);
        const ratioVal = getTargetRatioValue(targetPreset, cw, ch);
        if (ratioVal) {
          setCrop(fitCropToAspect(rect, ratioVal, cw, ch));
        } else {
          setCrop(rect);
        }
      }
    },
    []
  );

  // Fit a crop rect to a target pixel aspect ratio centered around current crop
  function fitCropToAspect(base: CropRect, ratioVal: number, stageW: number, stageH: number): CropRect {
    const cx = base.x + base.w / 2;
    const cy = base.y + base.h / 2;
    // Desired w_px / h_px = ratioVal => (w * stageW) / (h * stageH) = ratioVal => w / h = ratioVal * (stageH / stageW)
    const normRatio = ratioVal * (stageH / stageW);

    let nw = base.w;
    let nh = nw / normRatio;
    if (nh > base.h) {
      nh = base.h;
      nw = nh * normRatio;
    }
    if (nw > 1) {
      nw = 1;
      nh = nw / normRatio;
    }
    if (nh > 1) {
      nh = 1;
      nw = nh * normRatio;
    }
    const nx = Math.max(0, Math.min(1 - nw, cx - nw / 2));
    const ny = Math.max(0, Math.min(1 - nh, cy - nh / 2));
    return { x: nx, y: ny, w: nw, h: nh };
  }

  // Load file on open
  useEffect(() => {
    if (!file || !isOpen) {
      setStageUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = objectUrl;
    img.onload = () => {
      rawImageRef.current = img;
      setRotation90(0);
      setStraighten(0);
      setIsFlippedH(false);
      setBrightness(100);
      setContrast(100);
      setSaturation(100);
      setActiveFilter("normal");
      setActiveTab("crop");
      setAspectRatio(defaultAspectRatio);
      rebuildStage(img, 0, false, autoDetectArtwork, defaultAspectRatio);
    };

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file, isOpen, autoDetectArtwork, defaultAspectRatio, rebuildStage]);

  // Measure viewport container so stage display size matches image aspect ratio 1:1
  useEffect(() => {
    if (!isOpen) return;
    const updateSize = () => {
      const el = viewportRef.current;
      if (!el || stageNaturalSize.w <= 0 || stageNaturalSize.h <= 0) return;
      const pad = 28;
      const availW = Math.max(180, el.clientWidth - pad);
      const availH = Math.max(180, el.clientHeight - pad);
      const fitScale = Math.min(availW / stageNaturalSize.w, availH / stageNaturalSize.h);
      setStageDisplaySize({
        w: Math.max(120, Math.round(stageNaturalSize.w * fitScale)),
        h: Math.max(120, Math.round(stageNaturalSize.h * fitScale)),
      });
    };

    updateSize();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateSize) : null;
    if (ro && viewportRef.current) ro.observe(viewportRef.current);
    window.addEventListener("resize", updateSize);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", updateSize);
    };
  }, [isOpen, stageNaturalSize, stageUrl]);

  // ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleAutoDetectClick = () => {
    if (!stageCanvasRef.current) return;
    const { rect, detected } = detectArtworkBoundsFromCanvas(stageCanvasRef.current);
    setAutoTrimmedNotice(detected);
    setAspectRatio("free");
    setCrop(rect);
  };

  const handleSelectAspect = (preset: AspectPreset) => {
    setAspectRatio(preset);
    const ratioVal = getTargetRatioValue(preset, stageNaturalSize.w, stageNaturalSize.h);
    if (!ratioVal) return;
    const base = crop.w < 0.2 || crop.h < 0.2 ? FULL_CROP : crop;
    setCrop(fitCropToAspect(base, ratioVal, stageNaturalSize.w, stageNaturalSize.h));
  };

  const handleRotate90 = () => {
    if (!rawImageRef.current) return;
    const nextRot = (rotation90 + 90) % 360;
    // Rotate current crop box 90° clockwise so student's selection stays on the paper!
    const rotatedCrop: CropRect = {
      x: Math.max(0, Math.min(1, 1 - (crop.y + crop.h))),
      y: crop.x,
      w: crop.h,
      h: crop.w,
    };
    setRotation90(nextRot);
    rebuildStage(rawImageRef.current, nextRot, isFlippedH, false, aspectRatio);
    setCrop(rotatedCrop);
  };

  const handleFlipH = () => {
    if (!rawImageRef.current) return;
    const nextFlip = !isFlippedH;
    const flippedCrop: CropRect = {
      x: Math.max(0, Math.min(1, 1 - (crop.x + crop.w))),
      y: crop.y,
      w: crop.w,
      h: crop.h,
    };
    setIsFlippedH(nextFlip);
    rebuildStage(rawImageRef.current, rotation90, nextFlip, false, aspectRatio);
    setCrop(flippedCrop);
  };

  const resetAll = () => {
    if (!rawImageRef.current) return;
    setRotation90(0);
    setStraighten(0);
    setIsFlippedH(false);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setActiveFilter("normal");
    setAspectRatio("free");
    setAutoTrimmedNotice(false);
    rebuildStage(rawImageRef.current, 0, false, false, "free");
    setCrop(FULL_CROP);
  };

  const handleApplyFilter = (preset: FilterPreset) => {
    setActiveFilter(preset);
    switch (preset) {
      case "normal":
        setBrightness(100);
        setContrast(100);
        setSaturation(100);
        break;
      case "document":
        // Brightens grey phone shadows on white A4 worksheets while keeping colored pencils crisp
        setBrightness(107);
        setContrast(122);
        setSaturation(108);
        break;
      case "vivid":
        setBrightness(104);
        setContrast(114);
        setSaturation(126);
        break;
      case "warm":
        setBrightness(104);
        setContrast(106);
        setSaturation(114);
        break;
      case "pop":
        setBrightness(108);
        setContrast(122);
        setSaturation(122);
        break;
      case "bw":
        setBrightness(106);
        setContrast(126);
        setSaturation(0);
        break;
    }
  };

  const getFilterString = () => `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

  // Auto-scale factor when straightening so rotated corners don't leave empty triangles
  const getStraightenScale = (deg: number) => {
    if (deg === 0) return 1;
    const rad = (Math.abs(deg) * Math.PI) / 180;
    const ratio = Math.max(
      stageNaturalSize.w / Math.max(1, stageNaturalSize.h),
      stageNaturalSize.h / Math.max(1, stageNaturalSize.w)
    );
    return Math.min(1.45, Math.cos(rad) + Math.sin(rad) * Math.min(1.35, ratio));
  };

  // Pointer drag handlers for smooth mobile touch & desktop mouse cropping
  const startDrag = (handle: DragHandle, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    dragStateRef.current = {
      handle,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startCrop: { ...crop },
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragStateRef.current;
    if (!drag) return;
    e.preventDefault();

    const dx = (e.clientX - drag.startClientX) / Math.max(1, stageDisplaySize.w);
    const dy = (e.clientY - drag.startClientY) / Math.max(1, stageDisplaySize.h);
    const s = drag.startCrop;
    const minSize = 0.14;

    if (drag.handle === "move") {
      const nx = Math.max(0, Math.min(1 - s.w, s.x + dx));
      const ny = Math.max(0, Math.min(1 - s.h, s.y + dy));
      setCrop({ x: nx, y: ny, w: s.w, h: s.h });
      return;
    }

    let x1 = s.x;
    let y1 = s.y;
    let x2 = s.x + s.w;
    let y2 = s.y + s.h;

    if (drag.handle.includes("w")) x1 = Math.max(0, Math.min(x2 - minSize, s.x + dx));
    if (drag.handle.includes("e")) x2 = Math.min(1, Math.max(x1 + minSize, s.x + s.w + dx));
    if (drag.handle.includes("n")) y1 = Math.max(0, Math.min(y2 - minSize, s.y + dy));
    if (drag.handle.includes("s")) y2 = Math.min(1, Math.max(y1 + minSize, s.y + s.h + dy));

    let nw = x2 - x1;
    let nh = y2 - y1;

    const ratioVal = getTargetRatioValue(aspectRatio, stageNaturalSize.w, stageNaturalSize.h);
    if (ratioVal) {
      const normRatio = ratioVal * (stageNaturalSize.h / Math.max(1, stageNaturalSize.w));
      if (drag.handle === "n" || drag.handle === "s") {
        nw = Math.min(1, nh * normRatio);
        const cx = (x1 + x2) / 2;
        x1 = Math.max(0, Math.min(1 - nw, cx - nw / 2));
        x2 = x1 + nw;
        nh = nw / normRatio;
        if (drag.handle === "n") y1 = y2 - nh;
        else y2 = y1 + nh;
      } else {
        nh = Math.min(1, nw / normRatio);
        if (drag.handle === "w" || drag.handle === "e") {
          const cy = (y1 + y2) / 2;
          y1 = Math.max(0, Math.min(1 - nh, cy - nh / 2));
          y2 = y1 + nh;
        } else if (drag.handle.includes("n")) {
          y1 = Math.max(0, y2 - nh);
          nh = y2 - y1;
          nw = nh * normRatio;
          if (drag.handle.includes("w")) x1 = x2 - nw;
          else x2 = x1 + nw;
        } else {
          y2 = Math.min(1, y1 + nh);
          nh = y2 - y1;
          nw = nh * normRatio;
          if (drag.handle.includes("w")) x1 = x2 - nw;
          else x2 = x1 + nw;
        }
      }
    }

    setAutoTrimmedNotice(false);
    setCrop({
      x: Math.max(0, Math.min(1 - minSize, x1)),
      y: Math.max(0, Math.min(1 - minSize, y1)),
      w: Math.max(minSize, Math.min(1, x2 - x1)),
      h: Math.max(minSize, Math.min(1, y2 - y1)),
    });
  };

  const endDrag = () => {
    dragStateRef.current = null;
  };

  // Export exact cropped + straightened + filtered image
  const handleSave = async () => {
    if (!file || !stageCanvasRef.current) return;
    setIsProcessing(true);

    try {
      const srcStage = stageCanvasRef.current;
      const fullW = srcStage.width;
      const fullH = srcStage.height;

      // 1. Render full stage with straighten angle + color adjustments (matches preview 1:1)
      const transformedCanvas = document.createElement("canvas");
      transformedCanvas.width = fullW;
      transformedCanvas.height = fullH;
      const tCtx = transformedCanvas.getContext("2d");
      if (!tCtx) throw new Error("Canvas unavailable");

      tCtx.fillStyle = "#ffffff";
      tCtx.fillRect(0, 0, fullW, fullH);
      tCtx.imageSmoothingEnabled = true;
      tCtx.imageSmoothingQuality = "high";
      tCtx.filter = getFilterString();

      tCtx.save();
      tCtx.translate(fullW / 2, fullH / 2);
      if (straighten !== 0) {
        const sScale = getStraightenScale(straighten);
        tCtx.rotate((straighten * Math.PI) / 180);
        tCtx.scale(sScale, sScale);
      }
      tCtx.drawImage(srcStage, -fullW / 2, -fullH / 2, fullW, fullH);
      tCtx.restore();

      // 2. Slice exact user crop rectangle
      const sx = Math.round(crop.x * fullW);
      const sy = Math.round(crop.y * fullH);
      const sw = Math.max(64, Math.min(fullW - sx, Math.round(crop.w * fullW)));
      const sh = Math.max(64, Math.min(fullH - sy, Math.round(crop.h * fullH)));

      const maxOutDim = 1500;
      const outScale = Math.min(1, maxOutDim / Math.max(sw, sh));
      const outW = Math.max(64, Math.round(sw * outScale));
      const outH = Math.max(64, Math.round(sh * outScale));

      const outCanvas = document.createElement("canvas");
      outCanvas.width = outW;
      outCanvas.height = outH;
      const oCtx = outCanvas.getContext("2d");
      if (!oCtx) throw new Error("Output canvas unavailable");

      oCtx.fillStyle = "#ffffff";
      oCtx.fillRect(0, 0, outW, outH);
      oCtx.imageSmoothingEnabled = true;
      oCtx.imageSmoothingQuality = "high";
      oCtx.drawImage(transformedCanvas, sx, sy, sw, sh, 0, 0, outW, outH);

      outCanvas.toBlob(
        (blob) => {
          if (!blob) {
            setIsProcessing(false);
            return;
          }
          const originalName = file.name.replace(/\.[^/.]+$/, "");
          const editedFile = new File([blob], `${originalName}-cropped.jpg`, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          setIsProcessing(false);
          onSave(editedFile);
        },
        "image/jpeg",
        0.90
      );
    } catch (err) {
      console.error("Error exporting cropped image:", err);
      setIsProcessing(false);
    }
  };

  if (!isOpen || !file || !stageUrl) return null;

  const straightenScale = getStraightenScale(straighten);

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95dvh] border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-3.5 border-b border-gray-100 bg-white z-10 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-2xs shrink-0">
              <Crop className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-gray-900 font-kanit truncate">
                {title}
              </h2>
              <p className="text-[11px] text-gray-500 truncate">
                ลากมุมหรือขอบสีขาวเพื่อตัดพื้นโต๊ะออกให้เหลือเฉพาะใบงาน/ผลงานศิลปะ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={resetAll}
              className="px-2.5 py-1.5 rounded-xl border border-gray-200 hover:border-orange-300 text-xs font-semibold text-gray-600 hover:text-orange-600 flex items-center gap-1 transition-colors cursor-pointer"
              title="ขยายเต็มภาพเดิมและรีเซ็ตค่าทั้งหมด"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ภาพเต็มเดิม</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (onSkipCrop && file) {
                  onSkipCrop(file);
                } else {
                  onClose();
                }
              }}
              className="w-8 h-8 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer"
              title="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Auto-detect Banner */}
        {autoTrimmedNotice && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-1.5 text-[11px] sm:text-xs text-emerald-900 font-semibold flex items-center justify-between gap-2 shrink-0">
            <span className="flex items-center gap-1.5 truncate">
              <Wand2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>ระบบตัดขอบพื้นโต๊ะรอบใบงานให้อัตโนมัติแล้ว — ลากมุมสีขาวขยับปรับเพิ่มได้ตามต้องการ</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setCrop(FULL_CROP);
                setAutoTrimmedNotice(false);
              }}
              className="text-[11px] font-bold text-emerald-700 underline shrink-0 cursor-pointer"
            >
              ดูภาพเต็ม
            </button>
          </div>
        )}

        {/* Main Workspace */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-neutral-950 min-h-0">
          {/* Interactive Crop Stage */}
          <div
            ref={viewportRef}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            className="flex-1 relative flex items-center justify-center p-3 sm:p-5 overflow-hidden min-h-[270px] sm:min-h-[380px] select-none touch-none bg-neutral-950"
          >
            <div
              className="relative shadow-2xl bg-neutral-900 overflow-hidden"
              style={{
                width: `${stageDisplaySize.w}px`,
                height: `${stageDisplaySize.h}px`,
              }}
            >
              {/* Full Underlying Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={stageUrl}
                alt="Crop workspace"
                draggable={false}
                className="w-full h-full block pointer-events-none select-none"
                style={{
                  filter: getFilterString(),
                  transform:
                    straighten !== 0
                      ? `rotate(${straighten}deg) scale(${straightenScale})`
                      : undefined,
                }}
              />

              {/* 4 Darkened Mask Regions Outside Crop Box (dims the desk area!) */}
              <div
                className="absolute left-0 right-0 top-0 bg-black/65 pointer-events-none"
                style={{ height: `${crop.y * 100}%` }}
              />
              <div
                className="absolute left-0 right-0 bottom-0 bg-black/65 pointer-events-none"
                style={{ height: `${Math.max(0, (1 - crop.y - crop.h) * 100)}%` }}
              />
              <div
                className="absolute left-0 bg-black/65 pointer-events-none"
                style={{
                  top: `${crop.y * 100}%`,
                  height: `${crop.h * 100}%`,
                  width: `${crop.x * 100}%`,
                }}
              />
              <div
                className="absolute right-0 bg-black/65 pointer-events-none"
                style={{
                  top: `${crop.y * 100}%`,
                  height: `${crop.h * 100}%`,
                  width: `${Math.max(0, (1 - crop.x - crop.w) * 100)}%`,
                }}
              />

              {/* Interactive Draggable Crop Frame */}
              <div
                onPointerDown={(e) => startDrag("move", e)}
                className="absolute border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.4)] cursor-move touch-none"
                style={{
                  left: `${crop.x * 100}%`,
                  top: `${crop.y * 100}%`,
                  width: `${crop.w * 100}%`,
                  height: `${crop.h * 100}%`,
                }}
              >
                {/* 3x3 Rule-of-Thirds Alignment Grid */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                  <div className="border-r border-b border-white/40" />
                  <div className="border-r border-b border-white/40" />
                  <div className="border-b border-white/40" />
                  <div className="border-r border-b border-white/40" />
                  <div className="border-r border-b border-white/40" />
                  <div className="border-b border-white/40" />
                  <div className="border-r border-white/40" />
                  <div className="border-r border-white/40" />
                  <div />
                </div>

                {/* 4 Corner Handles (Large 36x36px Touch Targets) */}
                <div
                  onPointerDown={(e) => startDrag("nw", e)}
                  className="absolute -top-4 -left-4 w-9 h-9 flex items-center justify-center cursor-nwse-resize touch-none z-20"
                >
                  <span className="w-4 h-4 border-t-4 border-l-4 border-orange-400 bg-white/20 rounded-tl-xs shadow-xs" />
                </div>
                <div
                  onPointerDown={(e) => startDrag("ne", e)}
                  className="absolute -top-4 -right-4 w-9 h-9 flex items-center justify-center cursor-nesw-resize touch-none z-20"
                >
                  <span className="w-4 h-4 border-t-4 border-r-4 border-orange-400 bg-white/20 rounded-tr-xs shadow-xs" />
                </div>
                <div
                  onPointerDown={(e) => startDrag("sw", e)}
                  className="absolute -bottom-4 -left-4 w-9 h-9 flex items-center justify-center cursor-nesw-resize touch-none z-20"
                >
                  <span className="w-4 h-4 border-b-4 border-l-4 border-orange-400 bg-white/20 rounded-bl-xs shadow-xs" />
                </div>
                <div
                  onPointerDown={(e) => startDrag("se", e)}
                  className="absolute -bottom-4 -right-4 w-9 h-9 flex items-center justify-center cursor-nwse-resize touch-none z-20"
                >
                  <span className="w-4 h-4 border-b-4 border-r-4 border-orange-400 bg-white/20 rounded-br-xs shadow-xs" />
                </div>

                {/* 4 Edge Midpoint Handles (Easy single-side desk trim on mobile!) */}
                <div
                  onPointerDown={(e) => startDrag("n", e)}
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-12 h-7 flex items-center justify-center cursor-ns-resize touch-none z-10"
                >
                  <span className="w-7 h-1.5 rounded-full bg-white shadow-md border border-black/30" />
                </div>
                <div
                  onPointerDown={(e) => startDrag("s", e)}
                  className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-12 h-7 flex items-center justify-center cursor-ns-resize touch-none z-10"
                >
                  <span className="w-7 h-1.5 rounded-full bg-white shadow-md border border-black/30" />
                </div>
                <div
                  onPointerDown={(e) => startDrag("w", e)}
                  className="absolute top-1/2 -left-3.5 -translate-y-1/2 w-7 h-12 flex items-center justify-center cursor-ew-resize touch-none z-10"
                >
                  <span className="w-1.5 h-7 rounded-full bg-white shadow-md border border-black/30" />
                </div>
                <div
                  onPointerDown={(e) => startDrag("e", e)}
                  className="absolute top-1/2 -right-3.5 -translate-y-1/2 w-7 h-12 flex items-center justify-center cursor-ew-resize touch-none z-10"
                >
                  <span className="w-1.5 h-7 rounded-full bg-white shadow-md border border-black/30" />
                </div>
              </div>
            </div>
          </div>

          {/* Right / Bottom Controls Panel */}
          <div className="w-full md:w-80 lg:w-96 bg-white border-t md:border-t-0 md:border-l border-gray-100 flex flex-col justify-between overflow-y-auto max-h-[44dvh] md:max-h-none">
            <div className="p-3.5 sm:p-5 space-y-3.5">
              {/* Quick Smart Actions Row */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleAutoDetectClick}
                  className="py-2.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
                  title="ตรวจจับขอบกระดาษใบงานและตัดพื้นโต๊ะออกให้อัตโนมัติ"
                >
                  <Wand2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">ตัดขอบโต๊ะอัตโนมัติ</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyFilter(activeFilter === "document" ? "normal" : "document")}
                  className={`py-2.5 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer border ${
                    activeFilter === "document"
                      ? "bg-orange-600 text-white border-orange-600"
                      : "bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent hover:opacity-95"
                  }`}
                  title="ลดเงามืดบนกระดาษและเร่งสีผลงานให้สว่างคมชัด"
                >
                  <FileCheck2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">
                    {activeFilter === "document" ? "✓ โหมดใบงานชัด" : "ปรับใบงานสว่างชัด"}
                  </span>
                </button>
              </div>

              {/* Tabs */}
              <div className="flex rounded-xl bg-gray-100 p-1 border border-gray-200/60">
                <button
                  type="button"
                  onClick={() => setActiveTab("crop")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "crop"
                      ? "bg-white text-orange-600 shadow-2xs"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <Crop className="w-3.5 h-3.5" />
                  <span>ครอป & หมุน</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("adjust")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "adjust"
                      ? "bg-white text-orange-600 shadow-2xs"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>ปรับแสงสี</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("filter")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "filter"
                      ? "bg-white text-orange-600 shadow-2xs"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>โทนสี</span>
                </button>
              </div>

              {/* TAB 1: CROP & ROTATE */}
              {activeTab === "crop" && (
                <div className="space-y-3.5 animate-in fade-in duration-150">
                  {/* Aspect Ratio Presets */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
                      สัดส่วนกรอบครอป (แนะนำ &quot;อิสระ&quot; เพื่อลากตามขอบกระดาษจริง)
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(
                        [
                          { id: "free", label: "อิสระ" },
                          { id: "a4-p", label: "A4 ตั้ง" },
                          { id: "a4-l", label: "A4 นอน" },
                          { id: "4:5", label: "4:5" },
                          { id: "3:4", label: "3:4" },
                          { id: "4:3", label: "4:3" },
                          { id: "1:1", label: "1:1" },
                          { id: "16:9", label: "16:9" },
                        ] as { id: AspectPreset; label: string }[]
                      ).map((item) => {
                        const selected =
                          aspectRatio === item.id ||
                          (item.id === "free" && aspectRatio === "original");
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleSelectAspect(item.id)}
                            className={`py-1.5 px-1 text-[11px] font-bold rounded-xl border text-center transition-all cursor-pointer ${
                              selected
                                ? "bg-orange-50 border-orange-500 text-orange-700 ring-2 ring-orange-500/10"
                                : "border-gray-200 text-gray-600 hover:border-gray-300"
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Rotate 90, Flip, Full Frame */}
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={handleRotate90}
                      className="p-2 rounded-xl border border-gray-200 hover:border-orange-400 hover:bg-orange-50/50 text-gray-700 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                      <span>หมุน 90°</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleFlipH}
                      className={`p-2 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isFlippedH
                          ? "border-orange-500 bg-orange-50 text-orange-700"
                          : "border-gray-200 hover:border-orange-400 hover:bg-orange-50/50 text-gray-700"
                      }`}
                    >
                      <FlipHorizontal className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                      <span>พลิกซ้าย-ขวา</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAspectRatio("free");
                        setCrop(FULL_CROP);
                        setAutoTrimmedNotice(false);
                      }}
                      className="p-2 rounded-xl border border-gray-200 hover:border-orange-400 hover:bg-orange-50/50 text-gray-700 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                      <span>เต็มกรอบ</span>
                    </button>
                  </div>

                  {/* Fine Straighten Slider (-15 to +15 deg) */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-gray-700 mb-1">
                      <span>ดัดกระดาษเอียงให้ตรง (ปรับองศาละเอียด)</span>
                      <button
                        type="button"
                        onClick={() => setStraighten(0)}
                        className="text-orange-600 font-semibold hover:underline cursor-pointer"
                      >
                        {straighten > 0 ? `+${straighten}°` : `${straighten}°`} {straighten !== 0 ? "(รีเซ็ต)" : ""}
                      </button>
                    </div>
                    <input
                      type="range"
                      min="-15"
                      max="15"
                      step="0.5"
                      value={straighten}
                      onChange={(e) => setStraighten(parseFloat(e.target.value))}
                      className="w-full accent-orange-500 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: ADJUSTMENTS */}
              {activeTab === "adjust" && (
                <div className="space-y-3.5 animate-in fade-in duration-150">
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-1">
                      <span className="flex items-center gap-1.5">
                        <SunMedium className="w-3.5 h-3.5 text-amber-500" />
                        ความสว่าง (Brightness)
                      </span>
                      <span className="text-gray-500">{brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="65"
                      max="145"
                      value={brightness}
                      onChange={(e) => setBrightness(parseInt(e.target.value, 10))}
                      className="w-full accent-orange-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-1">
                      <span className="flex items-center gap-1.5">
                        <Contrast className="w-3.5 h-3.5 text-blue-500" />
                        ความคมชัดกระดาษ (Contrast)
                      </span>
                      <span className="text-gray-500">{contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="65"
                      max="150"
                      value={contrast}
                      onChange={(e) => setContrast(parseInt(e.target.value, 10))}
                      className="w-full accent-orange-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-1">
                      <span className="flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5 text-rose-500" />
                        ความสดของสี (Saturation)
                      </span>
                      <span className="text-gray-500">{saturation}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="180"
                      value={saturation}
                      onChange={(e) => setSaturation(parseInt(e.target.value, 10))}
                      className="w-full accent-orange-500 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: FILTER PRESETS */}
              {activeTab === "filter" && (
                <div className="grid grid-cols-2 gap-2 animate-in fade-in duration-150">
                  {[
                    { id: "normal", name: "สีจริงตามต้นฉบับ", desc: "ไม่ปรับแต่งโทนสี" },
                    { id: "document", name: "📄 ใบงานสว่างคมชัด", desc: "ลดเงามืด กระดาษขาวขึ้น" },
                    { id: "vivid", name: "🎨 สีศิลปะสดใส", desc: "เร่งสีไม้/สีน้ำให้โดดเด่น" },
                    { id: "warm", name: "☀️ แสงอุ่นละมุน", desc: "ลดโทนฟ้าจากไฟนีออน" },
                    { id: "pop", name: "✨ คมชัดจัดจ้าน", desc: "เพิ่มมิติแสงเงาเข้มขึ้น" },
                    { id: "bw", name: "✏️ ลายเส้นขาวดำ", desc: "เหมาะกับงานแรเงาดินสอ" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => handleApplyFilter(f.id as FilterPreset)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        activeFilter === f.id
                          ? "border-orange-500 bg-orange-50/70 ring-2 ring-orange-500/10"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <p className={`text-xs font-bold ${activeFilter === f.id ? "text-orange-900" : "text-gray-800"}`}>
                        {f.name}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{f.desc}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Save / Skip Buttons */}
            <div className="p-3.5 sm:p-5 border-t border-gray-100 bg-gray-50/80 space-y-2 shrink-0">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleSave}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-md shadow-orange-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>กำลังครอบตัดและบันทึกภาพ...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>ยืนยันครอป & ใช้ภาพนี้</span>
                  </>
                )}
              </button>

              {onSkipCrop ? (
                <button
                  type="button"
                  onClick={() => file && onSkipCrop(file)}
                  className="w-full py-2 text-center text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                >
                  ข้ามการครอป (ใช้ภาพเต็มต้นฉบับ)
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2 text-center text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

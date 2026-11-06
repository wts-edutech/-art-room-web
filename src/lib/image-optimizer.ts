/**
 * Client-Side Image Optimizer
 * Compresses and resizes images in browser before upload/storage.
 * Protects database storage limit and accelerates page load times.
 */

export interface OptimizeImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: 'image/webp' | 'image/jpeg' | 'image/png';
  outputType?: 'image/webp' | 'image/jpeg' | 'image/png';
  autoTrimBorders?: boolean;
  cropToAspect?: number; // e.g. 3/4 = 0.75 for portrait
  zoom?: number; // e.g. 1.05 to 1.3 to zoom in and eliminate borders
}

/**
 * Detects and trims dark/black borders (pillarbox or letterbox)
 * common in mobile screenshots or photos downloaded from apps/social media.
 */
export function trimBordersFromCanvas(canvas: HTMLCanvasElement, threshold = 35): HTMLCanvasElement {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const width = canvas.width;
  const height = canvas.height;
  if (width < 20 || height < 20) return canvas;

  try {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    const isDark = (x: number, y: number) => {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];
      if (a < 50) return true; // transparent
      return r <= threshold && g <= threshold && b <= threshold;
    };

    // 1. Detect left pillarbox
    let left = 0;
    const maxScanX = Math.floor(width * 0.35);
    for (let x = 0; x < maxScanX; x++) {
      let darkCount = 0;
      const samples = 25;
      for (let s = 1; s <= samples; s++) {
        const y = Math.floor((height * s) / (samples + 1));
        if (isDark(x, y)) darkCount++;
      }
      if (darkCount / samples >= 0.85) {
        left = x + 1;
      } else {
        break;
      }
    }

    // 2. Detect right pillarbox
    let right = width - 1;
    const minScanX = Math.ceil(width * 0.65);
    for (let x = width - 1; x >= minScanX; x--) {
      let darkCount = 0;
      const samples = 25;
      for (let s = 1; s <= samples; s++) {
        const y = Math.floor((height * s) / (samples + 1));
        if (isDark(x, y)) darkCount++;
      }
      if (darkCount / samples >= 0.85) {
        right = x - 1;
      } else {
        break;
      }
    }

    // 3. Detect top letterbox
    let top = 0;
    const maxScanY = Math.floor(height * 0.25);
    for (let y = 0; y < maxScanY; y++) {
      let darkCount = 0;
      const samples = 25;
      for (let s = 1; s <= samples; s++) {
        const x = Math.floor((width * s) / (samples + 1));
        if (isDark(x, y)) darkCount++;
      }
      if (darkCount / samples >= 0.85) {
        top = y + 1;
      } else {
        break;
      }
    }

    // 4. Detect bottom letterbox
    let bottom = height - 1;
    const minScanY = Math.ceil(height * 0.75);
    for (let y = height - 1; y >= minScanY; y--) {
      let darkCount = 0;
      const samples = 25;
      for (let s = 1; s <= samples; s++) {
        const x = Math.floor((width * s) / (samples + 1));
        if (isDark(x, y)) darkCount++;
      }
      if (darkCount / samples >= 0.85) {
        bottom = y - 1;
      } else {
        break;
      }
    }

    // Only crop if meaningful borders exist (> 4px)
    const hasSideBorders = left >= 5 || right <= width - 6;
    const hasTopBottomBorders = top >= 5 || bottom <= height - 6;

    if (hasSideBorders || hasTopBottomBorders) {
      const cropW = Math.max(10, right - left + 1);
      const cropH = Math.max(10, bottom - top + 1);
      const trimmedCanvas = document.createElement('canvas');
      trimmedCanvas.width = cropW;
      trimmedCanvas.height = cropH;
      const tCtx = trimmedCanvas.getContext('2d');
      if (tCtx) {
        tCtx.drawImage(canvas, left, top, cropW, cropH, 0, 0, cropW, cropH);
        return trimmedCanvas;
      }
    }
  } catch (err) {
    console.warn("Could not trim canvas borders:", err);
  }

  return canvas;
}

/**
 * Trims black borders from an existing image data URL or image object.
 */
export async function trimBlackBordersFromDataUrl(dataUrl: string, quality = 0.85): Promise<string> {
  return new Promise((resolve) => {
    if (!dataUrl || typeof window === 'undefined') {
      return resolve(dataUrl);
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(dataUrl);

        ctx.drawImage(img, 0, 0);
        const trimmed = trimBordersFromCanvas(canvas);
        resolve(trimmed.toDataURL('image/jpeg', quality));
      } catch (err) {
        console.warn("Failed to trim black borders from dataUrl:", err);
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Compresses an image File or Blob and returns a data URL (base64 string).
 */
export async function optimizeImageToDataUrl(
  file: File | Blob,
  options: OptimizeImageOptions = {}
): Promise<string> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.80,
    mimeType,
    outputType,
    autoTrimBorders = true,
    zoom = 1.0
  } = options;
  const resolvedMimeType = outputType || mimeType || 'image/jpeg';

  return new Promise((resolve, reject) => {
    // If not an image, reject
    if (file.type && !file.type.startsWith('image/')) {
      reject(new Error('File is not an image'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions preserving aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(readerEvent.target?.result as string);
          return;
        }

        // Draw with high quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        if (zoom && zoom > 1.0) {
          // Zoom in around center to eliminate border artifacts
          const zoomFactor = Math.min(zoom, 2.0);
          const zoomedW = width * zoomFactor;
          const zoomedH = height * zoomFactor;
          const offsetX = (width - zoomedW) / 2;
          const offsetY = (height - zoomedH) / 2;
          ctx.drawImage(img, offsetX, offsetY, zoomedW, zoomedH);
        } else {
          ctx.drawImage(img, 0, 0, width, height);
        }

        // Smart border trimming (strips black borders from mobile screenshots)
        let finalCanvas = canvas;
        if (autoTrimBorders && resolvedMimeType !== 'image/png') {
          finalCanvas = trimBordersFromCanvas(canvas);
        }

        // Check webp support fallback
        let targetType = resolvedMimeType;
        let resultDataUrl = finalCanvas.toDataURL(targetType, quality);

        // Fallback to jpeg if browser doesn't output webp
        if (!resultDataUrl.startsWith(`data:${targetType}`)) {
          targetType = 'image/jpeg';
          resultDataUrl = finalCanvas.toDataURL(targetType, quality);
        }

        resolve(resultDataUrl);
      };

      img.onerror = () => reject(new Error('Failed to load image for optimization'));
      img.src = readerEvent.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Compresses an image File and returns a new optimized File object.
 */
export async function optimizeImageToFile(
  file: File,
  options: OptimizeImageOptions = {}
): Promise<File> {
  // If not an image, return as is
  if (!file.type || !file.type.startsWith('image/')) {
    return file;
  }

  try {
    const dataUrl = await optimizeImageToDataUrl(file, {
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 0.80,
      mimeType: 'image/jpeg',
      ...options
    });
    
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
    return new File([blob], newFileName, { type: 'image/jpeg' });
  } catch (err) {
    console.warn("Image optimization fallback to original file:", err);
    return file;
  }
}

/**
 * Removes solid/white/light background from an image dataURL using edge-seeded flood fill
 * with smooth alpha feathering, and auto-crops transparent padding around the subject.
 * Always outputs a transparent PNG (`data:image/png;base64,...`).
 */
export async function removeBackgroundFromDataUrl(
  srcDataUrl: string,
  tolerance = 38
): Promise<string> {
  return new Promise((resolve) => {
    if (!srcDataUrl || typeof window === 'undefined') {
      return resolve(srcDataUrl);
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const w = img.width;
        const h = img.height;
        if (w < 4 || h < 4) return resolve(srcDataUrl);

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(srcDataUrl);

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        // Sample corner and border pixels to determine background color
        const samples: Array<[number, number, number]> = [];
        const borderCoords: Array<[number, number]> = [
          [0, 0],
          [w - 1, 0],
          [0, h - 1],
          [w - 1, h - 1],
          [Math.floor(w / 2), 0],
          [0, Math.floor(h / 2)],
          [w - 1, Math.floor(h / 2)],
        ];
        for (const [bx, by] of borderCoords) {
          const idx = (by * w + bx) * 4;
          if (data[idx + 3] > 128) {
            samples.push([data[idx], data[idx + 1], data[idx + 2]]);
          }
        }

        // Default to pure white if corners are already transparent
        let bgR = 255,
          bgG = 255,
          bgB = 255;
        if (samples.length > 0) {
          // Pick median/average of bright/consistent corner samples
          bgR = Math.round(samples.reduce((s, c) => s + c[0], 0) / samples.length);
          bgG = Math.round(samples.reduce((s, c) => s + c[1], 0) / samples.length);
          bgB = Math.round(samples.reduce((s, c) => s + c[2], 0) / samples.length);
        }

        const colorDist = (r: number, g: number, b: number) => {
          const dr = r - bgR;
          const dg = g - bgG;
          const db = b - bgB;
          return Math.sqrt(dr * dr + dg * dg + db * db);
        };

        // Also treat near-pure-white pixels connected to outside as background
        const isBgCandidate = (idx: number) => {
          const a = data[idx + 3];
          if (a < 20) return true;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const distToSample = colorDist(r, g, b);
          const distToWhite = Math.sqrt(
            (255 - r) * (255 - r) + (255 - g) * (255 - g) + (255 - b) * (255 - b)
          );
          return distToSample <= tolerance || distToWhite <= tolerance;
        };

        // Flood fill from all 4 outer edges so internal white areas (eyes, shirt, shoes) are preserved!
        const visited = new Uint8Array(w * h);
        const isBgMask = new Uint8Array(w * h);
        const queue = new Int32Array(w * h);
        let head = 0;
        let tail = 0;

        const pushIfBg = (x: number, y: number) => {
          const pos = y * w + x;
          if (visited[pos]) return;
          visited[pos] = 1;
          const idx = pos * 4;
          if (isBgCandidate(idx)) {
            isBgMask[pos] = 1;
            queue[tail++] = pos;
          }
        };

        for (let x = 0; x < w; x++) {
          pushIfBg(x, 0);
          pushIfBg(x, h - 1);
        }
        for (let y = 0; y < h; y++) {
          pushIfBg(0, y);
          pushIfBg(w - 1, y);
        }

        while (head < tail) {
          const pos = queue[head++];
          const x = pos % w;
          const y = (pos - x) / w;

          if (x > 0) pushIfBg(x - 1, y);
          if (x < w - 1) pushIfBg(x + 1, y);
          if (y > 0) pushIfBg(x, y - 1);
          if (y < h - 1) pushIfBg(x, y + 1);
        }

        // Apply transparency and soft edge feathering on boundary pixels
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const pos = y * w + x;
            const idx = pos * 4;
            if (isBgMask[pos]) {
              data[idx + 3] = 0;
            } else {
              // Check if adjacent to a removed background pixel for smooth anti-aliasing
              const touchesBg =
                (x > 0 && isBgMask[pos - 1]) ||
                (x < w - 1 && isBgMask[pos + 1]) ||
                (y > 0 && isBgMask[pos - w]) ||
                (y < h - 1 && isBgMask[pos + w]);
              if (touchesBg) {
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];
                const dist = Math.min(
                  colorDist(r, g, b),
                  Math.sqrt((255 - r) ** 2 + (255 - g) ** 2 + (255 - b) ** 2)
                );
                if (dist < tolerance * 1.6) {
                  const ratio = Math.max(0, Math.min(1, (dist - tolerance * 0.5) / (tolerance * 1.1)));
                  data[idx + 3] = Math.round(data[idx + 3] * ratio);
                }
              }
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);

        // Auto-crop excess transparent space around the mascot so it fills the button nicely
        let minX = w,
          minY = h,
          maxX = 0,
          maxY = 0;
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const a = data[(y * w + x) * 4 + 3];
            if (a > 25) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }

        if (maxX > minX && maxY > minY) {
          const pad = Math.round(Math.max(maxX - minX, maxY - minY) * 0.04);
          const cropX = Math.max(0, minX - pad);
          const cropY = Math.max(0, minY - pad);
          const cropW = Math.min(w - cropX, maxX - minX + 1 + pad * 2);
          const cropH = Math.min(h - cropY, maxY - minY + 1 + pad * 2);

          const outCanvas = document.createElement('canvas');
          outCanvas.width = cropW;
          outCanvas.height = cropH;
          const outCtx = outCanvas.getContext('2d');
          if (outCtx) {
            outCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
            return resolve(outCanvas.toDataURL('image/png'));
          }
        }

        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        console.warn('removeBackgroundFromDataUrl error:', err);
        resolve(srcDataUrl);
      }
    };
    img.onerror = () => resolve(srcDataUrl);
    img.src = srcDataUrl;
  });
}


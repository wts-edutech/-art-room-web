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
    mimeType = 'image/jpeg',
    autoTrimBorders = true,
    zoom = 1.0
  } = options;

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
        if (autoTrimBorders) {
          finalCanvas = trimBordersFromCanvas(canvas);
        }

        // Check webp support fallback
        let targetType = mimeType;
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


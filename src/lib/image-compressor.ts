/**
 * Client-Side Smart Image Compressor (High-Performance Engine)
 * Automatically resizes and compresses high-resolution camera photos (e.g. 5-15MB)
 * down to ~60-120KB WebP before upload, maintaining excellent visual quality and safe D1 payloads.
 * Uses createImageBitmap for ultra-fast off-thread GPU-assisted decoding when available.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0 (default 0.78)
  outputFormat?: 'image/webp' | 'image/jpeg';
}

function isHeicOrHeif(file: File): boolean {
  const mime = (file.type || '').toLowerCase();
  const name = (file.name || '').toLowerCase();
  return (
    mime.includes('heic') ||
    mime.includes('heif') ||
    name.endsWith('.heic') ||
    name.endsWith('.heif')
  );
}

async function convertHeicViaCdn(file: File): Promise<File | null> {
  if (typeof window === 'undefined') return null;
  try {
    let heic2anyFn = (window as any).heic2any;
    if (!heic2anyFn) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load heic2any'));
        document.head.appendChild(script);
      });
      heic2anyFn = (window as any).heic2any;
    }
    if (!heic2anyFn) return null;
    const converted = await heic2anyFn({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.85,
    });
    const outBlob: Blob = Array.isArray(converted) ? converted[0] : converted;
    if (!outBlob) return null;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    return new File([outBlob], `${baseName}.jpg`, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
  } catch (err) {
    console.warn('[ImageCompressor] HEIC conversion fallback failed:', err);
    return null;
  }
}

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const isHeic = isHeicOrHeif(file);
  // Only compress raster images; skip SVG, GIF, PDF
  if ((!file.type.startsWith('image/') && !isHeic) || file.type.includes('svg') || file.type.includes('gif')) {
    return file;
  }

  let workingFile = file;
  const maxWidth = options.maxWidth || 1200;
  const maxHeight = options.maxHeight || 1200;
  const quality = options.quality ?? 0.78;
  const outputFormat = options.outputFormat || 'image/webp';

  // Fast path: Try createImageBitmap (hardware-accelerated, no base64 string conversion)
  if (typeof window !== 'undefined' && 'createImageBitmap' in window) {
    try {
      const bitmap = await createImageBitmap(workingFile);
      let { width, height } = bitmap;

      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(bitmap, 0, 0, width, height);

        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, outputFormat, quality)
        );

        if (blob) {
          const ext = outputFormat === 'image/webp' ? '.webp' : '.jpg';
          const baseName = workingFile.name.replace(/\.[^/.]+$/, '');
          return new File([blob], `${baseName}${ext}`, {
            type: outputFormat,
            lastModified: Date.now(),
          });
        }
      }
    } catch (e) {
      console.warn('[ImageCompressor] createImageBitmap fallback to FileReader:', e);
      if (isHeic) {
        const decodedHeic = await convertHeicViaCdn(workingFile);
        if (decodedHeic) {
          workingFile = decodedHeic;
        }
      }
    }
  } else if (isHeic) {
    const decodedHeic = await convertHeicViaCdn(workingFile);
    if (decodedHeic) {
      workingFile = decodedHeic;
    }
  }

  // Standard fallback path: FileReader + Image element
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate proportional scale
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(workingFile); // Fallback to original
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(workingFile);
            }

            const ext = outputFormat === 'image/webp' ? '.webp' : '.jpg';
            const baseName = workingFile.name.replace(/\.[^/.]+$/, '');
            const compressedFile = new File([blob], `${baseName}${ext}`, {
              type: outputFormat,
              lastModified: Date.now(),
            });

            return resolve(compressedFile);
          },
          outputFormat,
          quality
        );
      };

      img.onerror = async () => {
        if (isHeic && workingFile === file) {
          const decodedHeic = await convertHeicViaCdn(file);
          if (decodedHeic) {
            return resolve(decodedHeic);
          }
        }
        resolve(workingFile);
      };
      img.src = e.target?.result as string;
    };

    reader.onerror = () => resolve(workingFile);
    reader.readAsDataURL(workingFile);
  });
}

export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

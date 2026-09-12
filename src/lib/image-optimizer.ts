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
}

/**
 * Compresses an image File or Blob and returns a data URL (base64 string).
 */
export async function optimizeImageToDataUrl(
  file: File | Blob,
  options: OptimizeImageOptions = {}
): Promise<string> {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.82,
    mimeType = 'image/webp'
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
        ctx.drawImage(img, 0, 0, width, height);

        // Check webp support fallback
        let targetType = mimeType;
        let resultDataUrl = canvas.toDataURL(targetType, quality);

        // Fallback to jpeg if browser doesn't output webp
        if (!resultDataUrl.startsWith(`data:${targetType}`)) {
          targetType = 'image/jpeg';
          resultDataUrl = canvas.toDataURL(targetType, quality);
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

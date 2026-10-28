/**
 * Image and Media Optimization Utilities for Art Room
 * Handles Google Drive URL parsing, edge thumbnail resizing, and responsive image dimensions.
 */

/**
 * Extracts Google Drive File ID from various link formats:
 * - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * - https://drive.google.com/uc?id=FILE_ID
 * - https://drive.google.com/open?id=FILE_ID
 * - https://lh3.googleusercontent.com/d/FILE_ID
 */
export function extractGoogleDriveId(url?: string | null): string | null {
  if (!url || typeof url !== "string") return null;

  // Pattern 1: /d/FILE_ID
  const matchD = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (matchD && matchD[1]) return matchD[1];

  // Pattern 2: id=FILE_ID
  const matchId = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchId && matchId[1]) return matchId[1];

  return null;
}

/**
 * Optimizes an image URL for fast loading:
 * - Google Drive: converts to Google UserContent edge thumbnail with =w{width} (WebP compressed on Google's CDN)
 * - Unsplash: injects optimal width & format parameters
 * - Local/Other: returns clean URL
 */
export function optimizeImageUrl(
  url?: string | null,
  options: { width?: number; quality?: number; fallback?: string } = {}
): string {
  const fallback = options.fallback || "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=800&auto=format&fit=crop";
  if (!url || typeof url !== "string" || !url.trim()) return fallback;

  const trimmed = url.trim();
  const width = options.width || 800;

  // 1. Google Drive / Google UserContent
  if (trimmed.includes("drive.google.com") || trimmed.includes("googleusercontent.com")) {
    const fileId = extractGoogleDriveId(trimmed);
    if (fileId) {
      // Use Google's fast WebP edge thumbnail generator (=w{width})
      // This reduces 5MB-10MB mobile uploads to 50KB-80KB WebP automatically!
      return `https://lh3.googleusercontent.com/d/${fileId}=w${width}`;
    }
  }

  // 2. Unsplash Images
  if (trimmed.includes("images.unsplash.com")) {
    try {
      const u = new URL(trimmed);
      u.searchParams.set("w", String(width));
      u.searchParams.set("auto", "format");
      u.searchParams.set("fit", "crop");
      u.searchParams.set("q", String(options.quality || 80));
      return u.toString();
    } catch {
      return trimmed;
    }
  }

  return trimmed;
}

/**
 * Formats a Google Drive or cloud document URL for optimal iframe embedding
 */
export function formatDocumentPreviewUrl(url?: string | null): string {
  if (!url || typeof url !== "string") return "";

  const trimmed = url.trim();

  // If it's a Google Drive link, ensure it ends with /preview
  if (trimmed.includes("drive.google.com")) {
    const fileId = extractGoogleDriveId(trimmed);
    if (fileId) {
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
    if (trimmed.includes("/view")) {
      return trimmed.replace(/\/view(\?.*)?$/, "/preview");
    }
  }

  return trimmed;
}

/**
 * Extracts YouTube video ID from various link formats
 */
export function extractYouTubeId(url?: string | null): string | null {
  if (!url || typeof url !== "string") return null;

  const clean = url.trim();
  // Standard watch URL: youtube.com/watch?v=ID
  const matchWatch = clean.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (matchWatch && matchWatch[1]) return matchWatch[1];

  // Raw 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) return clean;

  return null;
}

/**
 * Returns optimized YouTube thumbnail URL
 */
export function getYouTubeThumbnail(videoId?: string | null, quality: "hq" | "max" = "hq"): string {
  if (!videoId) return "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop";
  const name = quality === "max" ? "maxresdefault.jpg" : "hqdefault.jpg";
  return `https://img.youtube.com/vi/${videoId}/${name}`;
}

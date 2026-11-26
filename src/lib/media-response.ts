// src/lib/media-response.ts
// Shared helper for serving stored media (R2 refs, data URLs, HTTP URLs, or relative paths)
// with proper HTTP caching headers on Cloudflare Pages Edge Runtime.

import { R2_PREFIX, offloadDataUrl, serveR2Ref } from '@/lib/r2-storage';

export const PUBLIC_API_CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=30, s-maxage=120, stale-while-revalidate=300',
};

export const PUBLIC_LONG_CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
};

export const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
};

/**
 * Returns public cache headers unless the request explicitly asks for fresh data (?fresh=1 or ?t=...)
 */
export function getCacheHeaders(request?: Request, long = false): Record<string, string> {
  if (request) {
    try {
      const { searchParams } = new URL(request.url);
      if (searchParams.has('fresh') || searchParams.has('nocache')) {
        return NO_CACHE_HEADERS;
      }
    } catch {}
  }
  return long ? PUBLIC_LONG_CACHE_HEADERS : PUBLIC_API_CACHE_HEADERS;
}

/**
 * Convert a File/Blob from multipart FormData into a data URL and offload to R2 if available.
 */
export async function fileToStoredMedia(file: File, r2KeyBase: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString('base64');
  const mime = file.type || 'image/jpeg';
  const dataUrl = `data:${mime};base64,${base64}`;
  return offloadDataUrl(dataUrl, r2KeyBase);
}

/**
 * Convert an R2 ref ("r2:key") into its browser-accessible URL ("/api/media?key=...")
 */
export function resolveR2Url(value?: string | null): string | null {
  if (!value) return null;
  if (value.startsWith(R2_PREFIX)) {
    return `/api/media?key=${encodeURIComponent(value.slice(R2_PREFIX.length))}`;
  }
  return value;
}

/**
 * Serve a stored media target (r2:, data:, http(s):, or /relative) as an HTTP Response.
 */
export async function serveStoredMedia(
  target: string | null | undefined,
  request: Request,
  options: {
    selfPath?: string;
    fileName?: string | null;
    cacheControl?: string;
  } = {}
): Promise<Response | null> {
  if (!target) return null;
  const trimmed = String(target).trim();
  if (!trimmed) return null;
  if (options.selfPath && trimmed.includes(options.selfPath)) {
    return null;
  }

  // 1. Cloudflare R2 object reference
  if (trimmed.startsWith(R2_PREFIX)) {
    return await serveR2Ref(trimmed, options.fileName);
  }

  // 2. Base64 Data URL
  if (trimmed.startsWith('data:')) {
    const match = trimmed.match(/^data:([^;]+);base64,([\s\S]+)$/);
    if (!match) return null;
    const mimeType = match[1];
    const base64Data = match[2].replace(/\s+/g, '');
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const headers: Record<string, string> = {
      'Content-Type': mimeType,
      'Cache-Control': options.cacheControl || 'public, max-age=31536000, immutable',
    };
    if (options.fileName) {
      headers['Content-Disposition'] = `inline; filename="${encodeURIComponent(options.fileName)}"`;
    }
    return new Response(bytes, { headers });
  }

  // 3. External HTTP/HTTPS URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return Response.redirect(trimmed, 302);
  }

  // 4. Relative static asset path (e.g. /images/... or /uploads/...)
  if (trimmed.startsWith('/')) {
    const absoluteUrl = new URL(trimmed, request.url).toString();
    return Response.redirect(absoluteUrl, 302);
  }

  return null;
}


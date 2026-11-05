// src/lib/r2-storage.ts
// เก็บรูปลง Cloudflare R2 (binding: MEDIA) แทนการเก็บ base64 ใน D1
// ถ้ายังไม่ได้ผูก R2 binding จะ fallback กลับไปเก็บ data URL เหมือนเดิม (ไม่ทำให้ระบบพัง)
import { getRequestContext } from '@cloudflare/next-on-pages';

export const R2_PREFIX = 'r2:';

type R2Like = {
  put: (key: string, value: ArrayBuffer | Uint8Array, opts?: any) => Promise<any>;
  get: (key: string) => Promise<{ body: ReadableStream; httpMetadata?: { contentType?: string } } | null>;
  delete: (key: string | string[]) => Promise<void>;
};

export function getMediaBucket(): R2Like | null {
  try {
    const env = getRequestContext()?.env as any;
    return (env?.MEDIA as R2Like) || null;
  } catch {
    return null;
  }
}

function dataUrlToBytes(dataUrl: string): { mime: string; bytes: Uint8Array } | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/s);
  if (!match) return null;
  const bin = atob(match[2]);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { mime: match[1], bytes };
}

const EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
};

/**
 * อัปโหลด data URL ขึ้น R2 แล้วคืนค่า "r2:<key>"
 * ถ้าไม่ใช่ data URL หรือไม่มี R2 binding จะคืนค่าเดิม
 */
export async function offloadDataUrl(value: string, keyBase: string): Promise<string> {
  if (!value || !value.startsWith('data:')) return value;
  const bucket = getMediaBucket();
  if (!bucket) return value;
  const parsed = dataUrlToBytes(value);
  if (!parsed) return value;
  const key = `${keyBase}.${EXT[parsed.mime] || 'bin'}`;
  await bucket.put(key, parsed.bytes, { httpMetadata: { contentType: parsed.mime } });
  return `${R2_PREFIX}${key}`;
}

export async function offloadDataUrls(values: string[], keyBase: string): Promise<string[]> {
  const stamp = Date.now();
  return Promise.all(values.map((v, i) => offloadDataUrl(v, `${keyBase}/${stamp}_${i}`)));
}

/** คืน Response ของไฟล์จาก R2 ตาม ref "r2:<key>" หรือ null ถ้าไม่พบ */
export async function serveR2Ref(ref: string): Promise<Response | null> {
  if (!ref.startsWith(R2_PREFIX)) return null;
  const bucket = getMediaBucket();
  if (!bucket) return null;
  const obj = await bucket.get(ref.slice(R2_PREFIX.length));
  if (!obj) return null;
  return new Response(obj.body, {
    headers: {
      'Content-Type': obj.httpMetadata?.contentType || 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}


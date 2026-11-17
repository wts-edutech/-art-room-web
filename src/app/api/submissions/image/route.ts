export const runtime = 'edge';

import { getRequestContext } from '@cloudflare/next-on-pages';
import { R2_PREFIX, serveR2Ref } from '@/lib/r2-storage';

// Helper to safely parse images whether raw array, single-stringified, or double-stringified JSON
function parseImageArray(raw: any): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter((x): x is string => typeof x === 'string');
  if (typeof raw !== 'string') return [];
  let val: any = raw.trim();
  for (let i = 0; i < 5 && typeof val === 'string'; i++) {
    try {
      const next = JSON.parse(val);
      if (next === val) break;
      val = next;
    } catch {
      break;
    }
  }
  return Array.isArray(val) ? val.filter((x): x is string => typeof x === 'string') : [];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const index = parseInt(searchParams.get('index') || '0', 10);
    const isFileRequest = searchParams.get('type') === 'file' || searchParams.has('file');
    const isAnnotated = searchParams.get('annotated') === '1';

    if (!id) {
      return new Response('Missing submission id', { status: 400 });
    }

    const d1 = getRequestContext()?.env?.DB;

    // ภาพที่ครูเขียนตรวจแล้ว
    if (isAnnotated) {
      const row: any = d1
        ? await d1.prepare('SELECT annotated_images AS annotatedImages FROM submissions WHERE id = ?').bind(id).first()
        : null;
      const list = parseImageArray(row?.annotatedImages);
      const target = list[index];
      if (!target) return new Response('Annotation not found', { status: 404 });
      return serveTarget(target, request, null);
    }

    const sub: any = d1
      ? await d1
          .prepare(
            'SELECT student_id AS studentId, assignment_id AS assignmentId, image_url AS imageUrl, images, file_url AS fileUrl, file_name AS fileName FROM submissions WHERE id = ?'
          )
          .bind(id)
          .first()
      : null;

    if (!sub) {
      return new Response('Submission not found', { status: 404 });
    }

    // 1. If explicitly asking for file attachment (or if isFileRequest)
    if (isFileRequest && sub.fileUrl) {
      return serveTarget(sub.fileUrl, request, sub.fileName);
    }

    // 2. Parse images array with robust unwrap
    const imagesList = parseImageArray(sub.images);
    let targetImg: string | null = null;

    if (imagesList.length > 0) {
      if (index >= 0 && index < imagesList.length && imagesList[index]) {
        targetImg = imagesList[index];
      } else if (imagesList[0]) {
        targetImg = imagesList[0];
      }
    }

    // Fall back to primary imageUrl ONLY if it is not a circular reference to this endpoint
    if ((!targetImg || targetImg.includes('/api/submissions/image')) && sub.imageUrl && !sub.imageUrl.includes('/api/submissions/image')) {
      targetImg = sub.imageUrl;
    }

    // 3. Auto-heal: If targetImg is still missing or circular, attempt direct resolution from R2 bucket
    if ((!targetImg || targetImg.includes('/api/submissions/image')) && sub.studentId && sub.assignmentId) {
      try {
        const bucket = (getRequestContext()?.env as any)?.MEDIA;
        if (bucket && typeof bucket.list === 'function') {
          const prefix = `submissions/${sub.studentId}/${sub.assignmentId}/`;
          const listRes = await bucket.list({ prefix, limit: 10 }).catch(() => null);
          if (listRes && Array.isArray(listRes.objects) && listRes.objects.length > 0) {
            const sorted = listRes.objects.sort((a: any, b: any) =>
              new Date(a.uploaded || 0).getTime() - new Date(b.uploaded || 0).getTime()
            );
            const obj = sorted[index] || sorted[0];
            if (obj && obj.key) {
              targetImg = `${R2_PREFIX}${obj.key}`;
            }
          }
        }
      } catch (r2LookupErr) {
        console.warn('R2 auto-heal lookup failed:', r2LookupErr);
      }
    }

    // If still no image found, but a file attachment exists, serve the file attachment
    if ((!targetImg || targetImg.includes('/api/submissions/image')) && sub.fileUrl) {
      return serveTarget(sub.fileUrl, request, sub.fileName);
    }

    if (!targetImg || targetImg.includes('/api/submissions/image')) {
      return new Response('Image not found', { status: 404 });
    }

    return serveTarget(targetImg, request, sub.fileName);
  } catch (error: any) {
    console.error('Error serving submission image:', error);
    return new Response('Failed to load image', { status: 500 });
  }
}

async function serveTarget(target: string, request: Request, fileName?: string | null): Promise<Response> {
  // Never redirect to self / relative api endpoint
  if (target.includes('/api/submissions/image')) {
    return new Response('Image not found', { status: 404 });
  }

  // Stored in Cloudflare R2
  if (target.startsWith(R2_PREFIX)) {
    const r2Res = await serveR2Ref(target, fileName);
    return r2Res || new Response('File not found in storage', { status: 404 });
  }

  // Data URL (data:image/webp;base64,... or data:application/pdf;base64,...)
  if (target.startsWith('data:')) {
    const match = target.match(/^data:([^;]+);base64,([\s\S]+)$/);
    if (match) {
      const mimeType = match[1];
      const base64Data = match[2];
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const headers: Record<string, string> = {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      };
      if (fileName) {
        headers['Content-Disposition'] = `inline; filename="${encodeURIComponent(fileName)}"`;
      }
      return new Response(bytes, { headers });
    }
  }

  // External absolute HTTP/HTTPS URL
  if (target.startsWith('http://') || target.startsWith('https://')) {
    return Response.redirect(target, 302);
  }

  // Relative path (e.g. /uploads/...)
  if (target.startsWith('/')) {
    const absoluteUrl = new URL(target, request.url).toString();
    return Response.redirect(absoluteUrl, 302);
  }

  return new Response('Invalid media format', { status: 400 });
}

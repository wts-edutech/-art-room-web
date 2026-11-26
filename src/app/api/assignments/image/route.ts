export const runtime = 'edge';

import { getRequestContext } from '@cloudflare/next-on-pages';
import { R2_PREFIX, serveR2Ref } from '@/lib/r2-storage';

async function serveMediaValue(target: string, request: Request): Promise<Response | null> {
  if (!target || target.includes('/api/assignments/image')) {
    return null;
  }

  // Cloudflare R2 object reference
  if (target.startsWith(R2_PREFIX)) {
    return await serveR2Ref(target);
  }

  // Data URL (e.g. data:image/jpeg;base64,...)
  if (target.startsWith('data:')) {
    const match = target.match(/^data:([^;]+);base64,([\s\S]+)$/);
    if (match) {
      const mimeType = match[1];
      const base64Data = match[2].replace(/\s+/g, '');
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      return new Response(bytes, {
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }
    return null;
  }

  // Absolute external URL
  if (target.startsWith('http://') || target.startsWith('https://')) {
    return Response.redirect(target, 302);
  }

  // Relative static asset path (e.g. /uploads/...)
  if (target.startsWith('/')) {
    const absoluteUrl = new URL(target, request.url).toString();
    return Response.redirect(absoluteUrl, 302);
  }

  return null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new Response('Missing assignment id', { status: 400 });
    }

    const d1 = getRequestContext()?.env?.DB;
    const ass: any = d1
      ? await d1
          .prepare(
            'SELECT image_url AS imageUrl, attachment_url AS attachmentUrl, attachment_type AS attachmentType FROM assignments WHERE id = ?'
          )
          .bind(id)
          .first()
      : null;

    if (!ass) {
      return new Response('Image not found', { status: 404 });
    }

    // 1. Try primary imageUrl (unless empty or self-referencing proxy URL)
    if (ass.imageUrl) {
      const res = await serveMediaValue(String(ass.imageUrl).trim(), request);
      if (res) return res;
    }

    // 2. Fallback: if imageUrl was overwritten by a circular /api/assignments/image URL,
    // check if attachmentUrl holds an image (e.g. data:image/... or r2:...)
    if (ass.attachmentUrl) {
      const att = String(ass.attachmentUrl).trim();
      const isImageAttachment =
        ass.attachmentType === 'image' ||
        att.startsWith('data:image/') ||
        att.startsWith(R2_PREFIX);
      if (isImageAttachment) {
        const res = await serveMediaValue(att, request);
        if (res) return res;
      }
    }

    return new Response('Image not found', { status: 404 });
  } catch (error: any) {
    console.error('Error serving assignment image:', error);
    return new Response('Failed to load image', { status: 500 });
  }
}

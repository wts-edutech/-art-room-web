export const runtime = 'edge';

import { getRequestContext } from '@cloudflare/next-on-pages';
import { R2_PREFIX } from '@/lib/r2-storage';
import { serveStoredMedia } from '@/lib/media-response';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const field = searchParams.get('field'); // 'attachment' to serve attachment_url

    if (!id) {
      return new Response('Missing assignment id', { status: 400 });
    }

    const d1 = (getRequestContext()?.env as any)?.DB;
    const ass: any = d1
      ? await d1
          .prepare(
            'SELECT image_url AS imageUrl, attachment_url AS attachmentUrl, attachment_name AS attachmentName, attachment_type AS attachmentType FROM assignments WHERE id = ?'
          )
          .bind(id)
          .first()
      : null;

    if (!ass) {
      return new Response('Image not found', { status: 404 });
    }

    // Requesting attachment specifically
    if (field === 'attachment' && ass.attachmentUrl) {
      const res = await serveStoredMedia(ass.attachmentUrl, request, {
        selfPath: '/api/assignments/image',
        fileName: ass.attachmentName || null,
      });
      if (res) return res;
    }

    // 1. Primary imageUrl
    if (ass.imageUrl) {
      const res = await serveStoredMedia(ass.imageUrl, request, {
        selfPath: '/api/assignments/image',
      });
      if (res) return res;
    }

    // 2. Fallback: if imageUrl was missing/circular, serve image attachment if present
    if (ass.attachmentUrl) {
      const att = String(ass.attachmentUrl).trim();
      const isImageAttachment =
        ass.attachmentType === 'image' ||
        att.startsWith('data:image/') ||
        att.startsWith(R2_PREFIX);
      if (isImageAttachment) {
        const res = await serveStoredMedia(att, request, {
          selfPath: '/api/assignments/image',
        });
        if (res) return res;
      }
    }

    return new Response('Image not found', { status: 404 });
  } catch (error: any) {
    console.error('Error serving assignment image:', error);
    return new Response('Failed to load image', { status: 500 });
  }
}

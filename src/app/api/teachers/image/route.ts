export const runtime = 'edge';

import { getRequestContext } from '@cloudflare/next-on-pages';
import { serveStoredMedia } from '@/lib/media-response';

function safeParseArray(val: any): any[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') || 'teacher-kae';
    const section = searchParams.get('section') || 'avatar';
    const itemId = searchParams.get('itemId') || '';
    const field = searchParams.get('field') || 'imageUrl';
    const index = parseInt(searchParams.get('index') || '0', 10);

    const d1 = (getRequestContext()?.env as any)?.DB;
    if (!d1) {
      return new Response('Database unavailable', { status: 500 });
    }

    let target: string | null = null;
    let fileName: string | null = null;

    if (section === 'avatar') {
      const row: any = await d1
        .prepare('SELECT image_url AS val FROM teachers WHERE id = ?')
        .bind(id)
        .first();
      target = row?.val || null;
    } else if (section === 'award') {
      const row: any = await d1
        .prepare('SELECT awards AS val FROM teachers WHERE id = ?')
        .bind(id)
        .first();
      const list = safeParseArray(row?.val);
      const item = list.find((a: any, idx: number) => String(a?.id ?? idx) === itemId);
      if (item) {
        if (field === 'images' && Array.isArray(item.images)) {
          target = item.images[index] || null;
        } else if (field === 'coverImage') {
          target = item.coverImage || item.imageUrl || null;
        } else {
          target = item.imageUrl || item.coverImage || null;
        }
      }
    } else if (section === 'activity') {
      const row: any = await d1
        .prepare('SELECT activity_images AS val FROM teachers WHERE id = ?')
        .bind(id)
        .first();
      const list = safeParseArray(row?.val);
      const item = list.find((a: any, idx: number) => String(a?.id ?? idx) === itemId);
      target = item?.imageUrl || null;
    } else if (section === 'innovation') {
      const row: any = await d1
        .prepare('SELECT innovations AS val FROM teachers WHERE id = ?')
        .bind(id)
        .first();
      const list = safeParseArray(row?.val);
      const item = list.find((a: any, idx: number) => String(a?.id ?? idx) === itemId);
      if (item) {
        if (field === 'pdfUrl') {
          target = item.pdfUrl || null;
          fileName = item.pdfFileName || 'document.pdf';
        } else {
          target = item.coverImageUrl || null;
        }
      }
    }

    const res = await serveStoredMedia(target, request, {
      selfPath: '/api/teachers/image',
      fileName,
    });

    return res || new Response('Media not found', { status: 404 });
  } catch (error) {
    console.error('GET /api/teachers/image error:', error);
    return new Response('Failed to load media', { status: 500 });
  }
}

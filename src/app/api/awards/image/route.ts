export const runtime = 'edge';

import { getRequestContext } from '@cloudflare/next-on-pages';
import { serveStoredMedia } from '@/lib/media-response';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const field = searchParams.get('field') === 'certificate' ? 'certificate' : 'image';

    if (!id) {
      return new Response('Missing award id', { status: 400 });
    }

    const d1 = (getRequestContext()?.env as any)?.DB;
    if (!d1) {
      return new Response('Database unavailable', { status: 500 });
    }

    const col = field === 'certificate' ? 'certificate_url' : 'image_url';
    const row: any = await d1
      .prepare(`SELECT ${col} AS target FROM awards WHERE id = ?`)
      .bind(id)
      .first();

    const res = await serveStoredMedia(row?.target, request, {
      selfPath: '/api/awards/image',
    });

    return res || new Response('Image not found', { status: 404 });
  } catch (error) {
    console.error('GET /api/awards/image error:', error);
    return new Response('Failed to load image', { status: 500 });
  }
}

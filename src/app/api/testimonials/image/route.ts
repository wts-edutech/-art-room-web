export const runtime = 'edge';

import { getRequestContext } from '@cloudflare/next-on-pages';
import { serveStoredMedia } from '@/lib/media-response';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const field = searchParams.get('field') === 'univ' ? 'univ' : 'image';

    if (!id) {
      return new Response('Missing testimonial id', { status: 400 });
    }

    const d1 = (getRequestContext()?.env as any)?.DB;
    if (!d1) {
      return new Response('Database unavailable', { status: 500 });
    }

    const col = field === 'univ' ? 'univ_image_url' : 'image_url';
    const row: any = await d1
      .prepare(`SELECT ${col} AS target FROM testimonials WHERE id = ?`)
      .bind(id)
      .first();

    const res = await serveStoredMedia(row?.target, request, {
      selfPath: '/api/testimonials/image',
    });

    return res || new Response('Image not found', { status: 404 });
  } catch (error) {
    console.error('GET /api/testimonials/image error:', error);
    return new Response('Failed to load image', { status: 500 });
  }
}

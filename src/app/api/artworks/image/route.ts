export const runtime = 'edge';

import { getRequestContext } from '@cloudflare/next-on-pages';
import { serveStoredMedia } from '@/lib/media-response';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new Response('Missing artwork id', { status: 400 });
    }

    const d1 = (getRequestContext()?.env as any)?.DB;
    if (!d1) {
      return new Response('Database unavailable', { status: 500 });
    }

    const row: any = await d1
      .prepare('SELECT image_url AS imageUrl FROM artworks WHERE id = ?')
      .bind(id)
      .first();

    const res = await serveStoredMedia(row?.imageUrl, request, {
      selfPath: '/api/artworks/image',
    });

    return res || new Response('Image not found', { status: 404 });
  } catch (error) {
    console.error('GET /api/artworks/image error:', error);
    return new Response('Failed to load image', { status: 500 });
  }
}

export const runtime = 'edge';

import { serveR2Ref, R2_PREFIX } from '@/lib/r2-storage';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return new Response('Missing key', { status: 400 });
    }

    const ref = key.startsWith(R2_PREFIX) ? key : `${R2_PREFIX}${key}`;
    const res = await serveR2Ref(ref);

    if (!res) {
      return new Response('Media not found', { status: 404 });
    }

    return res;
  } catch (error: any) {
    console.error('GET /api/media error:', error);
    return new Response('Internal error', { status: 500 });
  }
}

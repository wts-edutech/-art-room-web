export const runtime = 'edge';

import { getRequestContext } from '@cloudflare/next-on-pages';
import { serveStoredMedia } from '@/lib/media-response';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') === 'mascot' ? 'mascot' : 'logo';

    const d1 = (getRequestContext()?.env as any)?.DB;
    if (!d1) {
      return new Response('Database unavailable', { status: 500 });
    }

    const settingKey = type === 'mascot' ? 'site_mascot_settings' : 'site_logo_settings';
    const row: any = await d1
      .prepare('SELECT value FROM site_settings WHERE key = ?')
      .bind(settingKey)
      .first();

    let target: string | null = null;
    if (row?.value) {
      try {
        const parsed = JSON.parse(row.value);
        target = type === 'mascot' ? parsed?.mascotUrl : parsed?.logoUrl;
      } catch {}
    }

    const fallback = type === 'mascot' ? '/images/artroom-mascot-custom.png' : '/artroom-logo.png';
    if (!target || target === '/school-logo.png' || target === '/images/artroom-mascot-transparent.png') {
      target = fallback;
    }

    const res = await serveStoredMedia(target, request, {
      selfPath: '/api/settings/media',
      cacheControl: 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
    });

    return res || Response.redirect(new URL(fallback, request.url).toString(), 302);
  } catch (error) {
    console.error('GET /api/settings/media error:', error);
    return new Response('Failed to load settings media', { status: 500 });
  }
}

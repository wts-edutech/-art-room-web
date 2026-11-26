export const runtime = 'edge';

import { getRequestContext } from '@cloudflare/next-on-pages';
import { serveR2Ref, R2_PREFIX } from '@/lib/r2-storage';
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
    const key = searchParams.get('key');
    const type = searchParams.get('type');

    // 1. Direct Cloudflare R2 key serving (/api/media?key=...)
    if (key) {
      const ref = key.startsWith(R2_PREFIX) ? key : `${R2_PREFIX}${key}`;
      const res = await serveR2Ref(ref);
      return res || new Response('Media not found', { status: 404 });
    }

    if (!type) {
      return new Response('Missing key or type', { status: 400 });
    }

    const d1 = (getRequestContext()?.env as any)?.DB;
    if (!d1) {
      return new Response('Database unavailable', { status: 500 });
    }

    // 2. Artworks image (/api/media?type=artwork&id=...)
    if (type === 'artwork') {
      const id = searchParams.get('id');
      if (!id) return new Response('Missing id', { status: 400 });
      const row: any = await d1
        .prepare('SELECT image_url AS target FROM artworks WHERE id = ?')
        .bind(id)
        .first();
      const res = await serveStoredMedia(row?.target, request, { selfPath: '/api/media' });
      return res || new Response('Image not found', { status: 404 });
    }

    // 3. Testimonials image (/api/media?type=testimonial&id=...&field=image|univ)
    if (type === 'testimonial') {
      const id = searchParams.get('id');
      if (!id) return new Response('Missing id', { status: 400 });
      const col = searchParams.get('field') === 'univ' ? 'univ_image_url' : 'image_url';
      const row: any = await d1
        .prepare(`SELECT ${col} AS target FROM testimonials WHERE id = ?`)
        .bind(id)
        .first();
      const res = await serveStoredMedia(row?.target, request, { selfPath: '/api/media' });
      return res || new Response('Image not found', { status: 404 });
    }

    // 4. Awards image/certificate (/api/media?type=award&id=...&field=image|certificate)
    if (type === 'award') {
      const id = searchParams.get('id');
      if (!id) return new Response('Missing id', { status: 400 });
      const col = searchParams.get('field') === 'certificate' ? 'certificate_url' : 'image_url';
      const row: any = await d1
        .prepare(`SELECT ${col} AS target FROM awards WHERE id = ?`)
        .bind(id)
        .first();
      const res = await serveStoredMedia(row?.target, request, { selfPath: '/api/media' });
      return res || new Response('Image not found', { status: 404 });
    }

    // 5. Settings logo/mascot (/api/media?type=setting&name=logo|mascot&v=...)
    if (type === 'setting') {
      const name = searchParams.get('name') === 'mascot' ? 'mascot' : 'logo';
      const settingKey = name === 'mascot' ? 'site_mascot_settings' : 'site_logo_settings';
      const row: any = await d1
        .prepare('SELECT value FROM site_settings WHERE key = ?')
        .bind(settingKey)
        .first();

      let target: string | null = null;
      if (row?.value) {
        try {
          const parsed = JSON.parse(row.value);
          target = name === 'mascot' ? parsed?.mascotUrl : parsed?.logoUrl;
        } catch {}
      }

      const fallback = name === 'mascot' ? '/images/artroom-mascot-custom.png' : '/artroom-logo.png';
      if (!target || target === '/school-logo.png' || target === '/images/artroom-mascot-transparent.png') {
        target = fallback;
      }

      const res = await serveStoredMedia(target, request, {
        selfPath: '/api/media',
        cacheControl: 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
      });
      return res || Response.redirect(new URL(fallback, request.url).toString(), 302);
    }

    // 6. Teachers avatar/awards/activities/innovations
    if (type === 'teacher') {
      const id = searchParams.get('id') || 'teacher-kae';
      const section = searchParams.get('section') || 'avatar';
      const itemId = searchParams.get('itemId') || '';
      const field = searchParams.get('field') || 'imageUrl';
      const index = parseInt(searchParams.get('index') || '0', 10);

      let target: string | null = null;
      let fileName: string | null = null;

      if (section === 'avatar') {
        const row: any = await d1.prepare('SELECT image_url AS val FROM teachers WHERE id = ?').bind(id).first();
        target = row?.val || null;
      } else if (section === 'award') {
        const row: any = await d1.prepare('SELECT awards AS val FROM teachers WHERE id = ?').bind(id).first();
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
        const row: any = await d1.prepare('SELECT activity_images AS val FROM teachers WHERE id = ?').bind(id).first();
        const list = safeParseArray(row?.val);
        const item = list.find((a: any, idx: number) => String(a?.id ?? idx) === itemId);
        target = item?.imageUrl || null;
      } else if (section === 'innovation') {
        const row: any = await d1.prepare('SELECT innovations AS val FROM teachers WHERE id = ?').bind(id).first();
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

      const res = await serveStoredMedia(target, request, { selfPath: '/api/media', fileName });
      return res || new Response('Media not found', { status: 404 });
    }

    return new Response('Unsupported media type', { status: 400 });
  } catch (error: any) {
    console.error('GET /api/media error:', error);
    return new Response('Internal error', { status: 500 });
  }
}

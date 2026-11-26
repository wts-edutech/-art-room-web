export const runtime = 'edge';

import { getRequestContext } from '@cloudflare/next-on-pages';
import { serveR2Ref, R2_PREFIX, offloadDataUrl } from '@/lib/r2-storage';
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

/** Non-blocking background migration: once a D1 data: blob is read, offload it to R2 so future D1 queries skip multi-MB pages */
function scheduleLazyR2Offload(
  d1: any,
  rawValue: any,
  r2KeyBase: string,
  sqlUpdate: string,
  bindId: string
) {
  if (!d1 || typeof rawValue !== 'string' || !rawValue.startsWith('data:')) return;
  try {
    const ctx = getRequestContext()?.ctx;
    if (!ctx || typeof ctx.waitUntil !== 'function') return;
    ctx.waitUntil(
      (async () => {
        try {
          const ref = await offloadDataUrl(rawValue, r2KeyBase);
          if (ref && ref.startsWith(R2_PREFIX)) {
            await d1.prepare(sqlUpdate).bind(ref, bindId).run();
          }
        } catch {}
      })()
    );
  } catch {}
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
      const row: any = await d1.prepare('SELECT image_url AS target FROM artworks WHERE id = ?').bind(id).first();
      scheduleLazyR2Offload(d1, row?.target, `artworks/${id}/img`, 'UPDATE artworks SET image_url = ? WHERE id = ?', id);
      const res = await serveStoredMedia(row?.target, request, { selfPath: '/api/media' });
      return res || new Response('Image not found', { status: 404 });
    }

    // 3. Testimonials image (/api/media?type=testimonial&id=...&field=image|univ)
    if (type === 'testimonial') {
      const id = searchParams.get('id');
      if (!id) return new Response('Missing id', { status: 400 });
      const col = searchParams.get('field') === 'univ' ? 'univ_image_url' : 'image_url';
      const row: any = await d1.prepare(`SELECT ${col} AS target FROM testimonials WHERE id = ?`).bind(id).first();
      scheduleLazyR2Offload(d1, row?.target, `testimonials/${id}/${col}`, `UPDATE testimonials SET ${col} = ? WHERE id = ?`, id);
      const res = await serveStoredMedia(row?.target, request, { selfPath: '/api/media' });
      return res || new Response('Image not found', { status: 404 });
    }

    // 4. Awards image/certificate (/api/media?type=award&id=...&field=image|certificate)
    if (type === 'award') {
      const id = searchParams.get('id');
      if (!id) return new Response('Missing id', { status: 400 });
      const col = searchParams.get('field') === 'certificate' ? 'certificate_url' : 'image_url';
      const row: any = await d1.prepare(`SELECT ${col} AS target FROM awards WHERE id = ?`).bind(id).first();
      scheduleLazyR2Offload(d1, row?.target, `awards/${id}/${col}`, `UPDATE awards SET ${col} = ? WHERE id = ?`, id);
      const res = await serveStoredMedia(row?.target, request, { selfPath: '/api/media' });
      return res || new Response('Image not found', { status: 404 });
    }

    // 5. Activities image/certificate/gallery (/api/media?type=activity&id=...&field=image|certificate|images&index=...)
    if (type === 'activity') {
      const id = searchParams.get('id');
      if (!id) return new Response('Missing id', { status: 400 });
      const field = searchParams.get('field') || 'image';
      const index = parseInt(searchParams.get('index') || '0', 10);

      if (field === 'images') {
        const row: any = await d1.prepare('SELECT images FROM activities WHERE id = ?').bind(id).first();
        const list = safeParseArray(row?.images);
        if (list.some((v: any) => typeof v === 'string' && v.startsWith('data:'))) {
          try {
            const ctx = getRequestContext()?.ctx;
            if (ctx && typeof ctx.waitUntil === 'function') {
              ctx.waitUntil(
                (async () => {
                  try {
                    const migrated = await Promise.all(
                      list.map((v: any, idx: number) =>
                        typeof v === 'string' && v.startsWith('data:')
                          ? offloadDataUrl(v, `activities/${id}/gallery_${idx}`)
                          : v
                      )
                    );
                    await d1.prepare('UPDATE activities SET images = ? WHERE id = ?').bind(JSON.stringify(migrated), id).run();
                  } catch {}
                })()
              );
            }
          } catch {}
        }
        const target = list[index] || list[0] || null;
        const res = await serveStoredMedia(target, request, { selfPath: '/api/media' });
        return res || new Response('Image not found', { status: 404 });
      }

      const col = field === 'certificate' ? 'certificate_url' : 'image_url';
      const row: any = await d1.prepare(`SELECT ${col} AS target FROM activities WHERE id = ?`).bind(id).first();
      scheduleLazyR2Offload(d1, row?.target, `activities/${id}/${col}`, `UPDATE activities SET ${col} = ? WHERE id = ?`, id);
      const res = await serveStoredMedia(row?.target, request, { selfPath: '/api/media' });
      return res || new Response('Image not found', { status: 404 });
    }

    // 6. Downloads cover image / file (/api/media?type=download&id=...&field=image|file)
    if (type === 'download') {
      const id = searchParams.get('id');
      if (!id) return new Response('Missing id', { status: 400 });
      const isFile = searchParams.get('field') === 'file';
      const row: any = await d1
        .prepare('SELECT image_url AS imageUrl, file_url AS fileUrl, file_name AS fileName FROM downloads WHERE id = ?')
        .bind(id)
        .first();
      const target = isFile ? row?.fileUrl : row?.imageUrl;
      const col = isFile ? 'file_url' : 'image_url';
      scheduleLazyR2Offload(d1, target, `downloads/${id}/${col}`, `UPDATE downloads SET ${col} = ? WHERE id = ?`, id);
      const res = await serveStoredMedia(target, request, {
        selfPath: '/api/media',
        fileName: isFile ? row?.fileName || null : null,
      });
      return res || new Response('Media not found', { status: 404 });
    }

    // 7. Ideas image / file (/api/media?type=idea&id=...&field=image|file&index=...)
    if (type === 'idea') {
      const id = searchParams.get('id');
      if (!id) return new Response('Missing id', { status: 400 });
      const field = searchParams.get('field') || 'image';
      const index = parseInt(searchParams.get('index') || '0', 10);

      if (field === 'file') {
        const row: any = await d1.prepare('SELECT files FROM ideas WHERE id = ?').bind(id).first();
        if (typeof row?.files === 'string' && row.files.startsWith('data:')) {
          scheduleLazyR2Offload(d1, row.files, `ideas/${id}/file_0`, 'UPDATE ideas SET files = ? WHERE id = ?', id);
          const res = await serveStoredMedia(row.files, request, { selfPath: '/api/media' });
          return res || new Response('File not found', { status: 404 });
        }
        const list = safeParseArray(row?.files);
        if (typeof row?.files === 'string' && row.files.includes('data:')) {
          try {
            const ctx = getRequestContext()?.ctx;
            if (ctx && typeof ctx.waitUntil === 'function') {
              ctx.waitUntil(
                (async () => {
                  try {
                    const migrated = await Promise.all(
                      list.map(async (f: any, fIdx: number) => {
                        if (typeof f === 'string' && f.startsWith('data:')) {
                          return offloadDataUrl(f, `ideas/${id}/file_${fIdx}`);
                        }
                        if (f && typeof f === 'object' && typeof f.url === 'string' && f.url.startsWith('data:')) {
                          return { ...f, url: await offloadDataUrl(f.url, `ideas/${id}/file_${fIdx}`) };
                        }
                        return f;
                      })
                    );
                    await d1.prepare('UPDATE ideas SET files = ? WHERE id = ?').bind(JSON.stringify(migrated), id).run();
                  } catch {}
                })()
              );
            }
          } catch {}
        }
        const entry = list[index] || list[0];
        const res = await serveStoredMedia(entry?.url || entry, request, {
          selfPath: '/api/media',
          fileName: entry?.name || null,
        });
        return res || new Response('File not found', { status: 404 });
      }

      const row: any = await d1.prepare('SELECT cover_image_url AS target FROM ideas WHERE id = ?').bind(id).first();
      scheduleLazyR2Offload(d1, row?.target, `ideas/${id}/cover`, 'UPDATE ideas SET cover_image_url = ? WHERE id = ?', id);
      const res = await serveStoredMedia(row?.target, request, { selfPath: '/api/media' });
      return res || new Response('Image not found', { status: 404 });
    }

    // 8. Lessons image (/api/media?type=lesson&id=...)
    if (type === 'lesson') {
      const id = searchParams.get('id');
      if (!id) return new Response('Missing id', { status: 400 });
      const row: any = await d1.prepare('SELECT image_url AS target FROM lessons WHERE id = ?').bind(id).first();
      scheduleLazyR2Offload(d1, row?.target, `lessons/${id}/img`, 'UPDATE lessons SET image_url = ? WHERE id = ?', id);
      const res = await serveStoredMedia(row?.target, request, { selfPath: '/api/media' });
      return res || new Response('Image not found', { status: 404 });
    }

    // 9. Student custom avatar (/api/media?type=student&id=...)
    if (type === 'student') {
      const id = searchParams.get('id');
      if (!id) return new Response('Missing id', { status: 400 });
      const row: any = await d1.prepare('SELECT avatar AS target FROM students WHERE id = ?').bind(id).first();
      scheduleLazyR2Offload(d1, row?.target, `students/${id}/avatar`, 'UPDATE students SET avatar = ? WHERE id = ?', id);
      const res = await serveStoredMedia(row?.target, request, { selfPath: '/api/media' });
      return res || new Response('Avatar not found', { status: 404 });
    }

    // 10. Settings logo/mascot (/api/media?type=setting&name=logo|mascot&v=...)
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

    // 11. Teachers avatar/awards/activities/innovations
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
        scheduleLazyR2Offload(d1, target, `teachers/${id}/avatar`, 'UPDATE teachers SET image_url = ? WHERE id = ?', id);
      } else if (section === 'award') {
        const row: any = await d1.prepare('SELECT awards AS val FROM teachers WHERE id = ?').bind(id).first();
        const list = safeParseArray(row?.val);
        if (typeof row?.val === 'string' && row.val.includes('data:')) {
          try {
            const ctx = getRequestContext()?.ctx;
            if (ctx && typeof ctx.waitUntil === 'function') {
              ctx.waitUntil(
                (async () => {
                  try {
                    const migrated = await Promise.all(
                      list.map(async (entry: any, eIdx: number) => {
                        if (!entry || typeof entry !== 'object') return entry;
                        const next = { ...entry };
                        const eid = String(entry.id ?? eIdx);
                        if (typeof next.imageUrl === 'string' && next.imageUrl.startsWith('data:')) {
                          next.imageUrl = await offloadDataUrl(next.imageUrl, `teachers/${id}/award_${eid}_img`);
                        }
                        if (typeof next.coverImage === 'string' && next.coverImage.startsWith('data:')) {
                          next.coverImage = await offloadDataUrl(next.coverImage, `teachers/${id}/award_${eid}_cover`);
                        }
                        if (Array.isArray(next.images)) {
                          next.images = await Promise.all(
                            next.images.map((img: any, iIdx: number) =>
                              typeof img === 'string' && img.startsWith('data:')
                                ? offloadDataUrl(img, `teachers/${id}/award_${eid}_g_${iIdx}`)
                                : img
                            )
                          );
                        }
                        return next;
                      })
                    );
                    await d1.prepare('UPDATE teachers SET awards = ? WHERE id = ?').bind(JSON.stringify(migrated), id).run();
                  } catch {}
                })()
              );
            }
          } catch {}
        }
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
        if (typeof row?.val === 'string' && row.val.includes('data:')) {
          try {
            const ctx = getRequestContext()?.ctx;
            if (ctx && typeof ctx.waitUntil === 'function') {
              ctx.waitUntil(
                (async () => {
                  try {
                    const migrated = await Promise.all(
                      list.map(async (entry: any, eIdx: number) => {
                        if (!entry || typeof entry !== 'object') return entry;
                        const next = { ...entry };
                        const eid = String(entry.id ?? eIdx);
                        if (typeof next.imageUrl === 'string' && next.imageUrl.startsWith('data:')) {
                          next.imageUrl = await offloadDataUrl(next.imageUrl, `teachers/${id}/act_${eid}_img`);
                        }
                        return next;
                      })
                    );
                    await d1.prepare('UPDATE teachers SET activity_images = ? WHERE id = ?').bind(JSON.stringify(migrated), id).run();
                  } catch {}
                })()
              );
            }
          } catch {}
        }
        const item = list.find((a: any, idx: number) => String(a?.id ?? idx) === itemId);
        target = item?.imageUrl || null;
      } else if (section === 'innovation') {
        const row: any = await d1.prepare('SELECT innovations AS val FROM teachers WHERE id = ?').bind(id).first();
        const list = safeParseArray(row?.val);
        if (typeof row?.val === 'string' && row.val.includes('data:')) {
          try {
            const ctx = getRequestContext()?.ctx;
            if (ctx && typeof ctx.waitUntil === 'function') {
              ctx.waitUntil(
                (async () => {
                  try {
                    const migrated = await Promise.all(
                      list.map(async (entry: any, eIdx: number) => {
                        if (!entry || typeof entry !== 'object') return entry;
                        const next = { ...entry };
                        const eid = String(entry.id ?? eIdx);
                        if (typeof next.coverImageUrl === 'string' && next.coverImageUrl.startsWith('data:')) {
                          next.coverImageUrl = await offloadDataUrl(next.coverImageUrl, `teachers/${id}/innov_${eid}_cover`);
                        }
                        if (typeof next.pdfUrl === 'string' && next.pdfUrl.startsWith('data:')) {
                          next.pdfUrl = await offloadDataUrl(next.pdfUrl, `teachers/${id}/innov_${eid}_pdf`);
                        }
                        return next;
                      })
                    );
                    await d1.prepare('UPDATE teachers SET innovations = ? WHERE id = ?').bind(JSON.stringify(migrated), id).run();
                  } catch {}
                })()
              );
            }
          } catch {}
        }
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

export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { activities } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { R2_PREFIX, offloadDataUrl } from '@/lib/r2-storage';
import { fileToStoredMedia, getCacheHeaders, resolveR2Url } from '@/lib/media-response';

let columnsEnsured = false;
async function ensureColumns() {
  if (columnsEnsured) return;
  try {
    const ctx = getRequestContext();
    const d1 = (ctx?.env as any)?.DB;
    if (d1) {
      try { await d1.prepare(`ALTER TABLE activities ADD COLUMN time TEXT`).run(); } catch {}
      try { await d1.prepare(`ALTER TABLE activities ADD COLUMN location TEXT`).run(); } catch {}
      try { await d1.prepare(`ALTER TABLE activities ADD COLUMN category TEXT`).run(); } catch {}
      try { await d1.prepare(`ALTER TABLE activities ADD COLUMN color TEXT`).run(); } catch {}
      try { await d1.prepare(`ALTER TABLE activities ADD COLUMN certificateUrl TEXT`).run(); } catch {}
      try { await d1.prepare(`ALTER TABLE activities ADD COLUMN certificate_url TEXT`).run(); } catch {}
      columnsEnsured = true;
    }
  } catch {}
}

function parseImagesList(raw: any): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

async function queryActivitiesLight(db: ReturnType<typeof getDb>) {
  return db
    .select({
      id: activities.id,
      title: activities.title,
      date: activities.date,
      time: activities.time,
      location: activities.location,
      category: activities.category,
      color: activities.color,
      description: activities.description,
      createdAt: activities.createdAt,
      imageUrl: sql<string | null>`CASE
        WHEN image_url IS NULL OR image_url = '' THEN NULL
        WHEN image_url LIKE 'data:%' THEN 'has_blob'
        ELSE image_url
      END`.as('imageUrl'),
      certificateUrl: sql<string | null>`CASE
        WHEN certificate_url IS NULL OR certificate_url = '' THEN NULL
        WHEN certificate_url LIKE 'data:%' THEN 'has_blob'
        ELSE certificate_url
      END`.as('certificateUrl'),
      imagesCount: sql<number>`CASE
        WHEN images IS NULL OR images = '' THEN 0
        WHEN json_valid(images) AND json_type(images) = 'array' THEN json_array_length(images)
        ELSE 0
      END`.as('imagesCount'),
      imagesHasBlob: sql<number>`CASE WHEN images LIKE '%data:%' THEN 1 ELSE 0 END`.as('imagesHasBlob'),
      imagesRawIfSmall: sql<string | null>`CASE WHEN images LIKE '%data:%' THEN NULL ELSE images END`.as('imagesRawIfSmall'),
    })
    .from(activities)
    .orderBy(desc(activities.createdAt));
}

export async function GET(request: Request) {
  try {
    const db = getDb();
    let all;
    try {
      all = await queryActivitiesLight(db);
    } catch {
      await ensureColumns();
      all = await queryActivitiesLight(db);
    }

    const normalized = (all || []).map((item: any) => {
      const aid = encodeURIComponent(item.id);
      const imageUrl =
        item.imageUrl === 'has_blob'
          ? `/api/media?type=activity&id=${aid}&field=image`
          : resolveR2Url(item.imageUrl);

      const certificateUrl =
        item.certificateUrl === 'has_blob'
          ? `/api/media?type=activity&id=${aid}&field=certificate`
          : resolveR2Url(item.certificateUrl);

      let imagesOut: string[] = [];
      if (item.imagesHasBlob && Number(item.imagesCount) > 0) {
        imagesOut = Array.from(
          { length: Number(item.imagesCount) },
          (_, idx) => `/api/media?type=activity&id=${aid}&field=images&index=${idx}`
        );
      } else if (item.imagesRawIfSmall) {
        imagesOut = parseImagesList(item.imagesRawIfSmall).map((u) => resolveR2Url(u) || u);
      }

      return {
        id: item.id,
        title: item.title,
        date: item.date,
        time: item.time,
        location: item.location,
        category: item.category,
        color: item.color,
        description: item.description,
        createdAt: item.createdAt,
        imageUrl,
        certificateUrl,
        images: JSON.stringify(imagesOut),
      };
    });

    return NextResponse.json(normalized, { headers: getCacheHeaders(request, true) });
  } catch (error) {
    console.error("GET /api/activities error:", error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureColumns();
    const db = getDb();
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body: any = await request.json();
      if (!body.title || !body.date) {
        return NextResponse.json({ error: 'Title and Date are required' }, { status: 400 });
      }
      const id = body.id || Date.now().toString();
      const stamp = Date.now();
      const rawImgs = parseImagesList(body.images);
      const offloadedImgs = await Promise.all(
        rawImgs.map((u, idx) =>
          typeof u === 'string' && u.startsWith('data:')
            ? offloadDataUrl(u, `activities/${id}/img_${stamp}_${idx}`)
            : Promise.resolve(u)
        )
      );

      const newEntry = {
        id,
        title: body.title,
        date: body.date,
        description: body.description || '',
        time: body.time || '',
        location: body.location || '',
        category: body.category || '',
        color: body.color || 'red',
        imageUrl: body.imageUrl
          ? await offloadDataUrl(String(body.imageUrl), `activities/${id}/cover_${stamp}`)
          : null,
        certificateUrl: body.certificateUrl
          ? await offloadDataUrl(String(body.certificateUrl), `activities/${id}/cert_${stamp}`)
          : null,
        images: offloadedImgs.length > 0 ? JSON.stringify(offloadedImgs) : null,
        createdAt: new Date().toISOString(),
      };
      await db.insert(activities).values(newEntry as any);
      return NextResponse.json(newEntry, { status: 201 });
    }

    const formData = await request.formData();
    const id = Date.now().toString();
    const stamp = Date.now();
    const newEntry: any = {
      id,
      time: (formData.get('time') as string) || '',
      location: (formData.get('location') as string) || '',
      category: (formData.get('category') as string) || '',
      color: (formData.get('color') as string) || 'red',
    };
    const images: string[] = [];

    for (const [key, value] of formData.entries()) {
      if (value instanceof File && value.size > 0) {
        const stored = await fileToStoredMedia(value, `activities/${id}/${key}_${stamp}_${images.length}`);
        if (key === 'images') {
          images.push(stored);
        } else if (key === 'certificate') {
          newEntry.certificateUrl = stored;
        } else {
          newEntry[key === 'image' || key === 'coverImage' ? (key === 'coverImage' ? 'coverImageUrl' : 'imageUrl') : key] = stored;
        }
      } else if (typeof value === 'string' && key !== 'image' && key !== 'coverImage') {
        if (key === 'images') {
          images.push(value.startsWith('data:') ? await offloadDataUrl(value, `activities/${id}/img_${stamp}_${images.length}`) : value);
        } else if (key === 'certificate' || key === 'certificateUrl') {
          newEntry.certificateUrl = value.startsWith('data:') ? await offloadDataUrl(value, `activities/${id}/cert_${stamp}`) : value;
        } else {
          newEntry[key] = value;
        }
      }
    }

    if (images.length > 0) {
      newEntry.images = JSON.stringify(images);
      if (!newEntry.imageUrl) {
        newEntry.imageUrl = images[0];
      }
    }

    if (!newEntry.createdAt) newEntry.createdAt = new Date().toISOString();

    await db.insert(activities).values(newEntry as any);
    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    console.error("POST /api/activities error:", error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await ensureColumns();
    const db = getDb();
    const contentType = request.headers.get('content-type') || '';

    const resolveIncomingUrl = async (val: any, existingVal: any, r2Key: string) => {
      if (!val || typeof val !== 'string') return val;
      if (val.includes('/api/media?type=activity')) return existingVal || val;
      if (val.startsWith('/api/media?key=')) {
        try {
          const k = new URL(val, 'https://local.invalid').searchParams.get('key');
          if (k) return `${R2_PREFIX}${k}`;
        } catch {}
      }
      if (val.startsWith('data:')) return offloadDataUrl(val, r2Key);
      return val;
    };

    if (contentType.includes('application/json')) {
      const body: any = await request.json();
      const id = body.id;
      if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

      const existing: any = await db.select().from(activities).where(eq(activities.id, id)).get();
      const existingImgs = parseImagesList(existing?.images);
      const stamp = Date.now();

      const updateEntry: any = {
        title: body.title,
        date: body.date,
        description: body.description ?? '',
        time: body.time ?? '',
        location: body.location ?? '',
        category: body.category ?? '',
        color: body.color ?? 'red',
      };
      if (body.imageUrl !== undefined) {
        updateEntry.imageUrl = await resolveIncomingUrl(body.imageUrl, existing?.imageUrl, `activities/${id}/cover_${stamp}`);
      }
      if (body.certificateUrl !== undefined) {
        updateEntry.certificateUrl = await resolveIncomingUrl(body.certificateUrl, existing?.certificateUrl, `activities/${id}/cert_${stamp}`);
      }
      if (body.images !== undefined) {
        const rawList = parseImagesList(body.images);
        const resolvedList = await Promise.all(
          rawList.map((u, idx) => resolveIncomingUrl(u, existingImgs[idx], `activities/${id}/img_${stamp}_${idx}`))
        );
        updateEntry.images = JSON.stringify(resolvedList);
      }

      await db.update(activities).set(updateEntry).where(eq(activities.id, id));
      return NextResponse.json({ success: true, id, ...updateEntry }, { status: 200 });
    }

    const formData = await request.formData();
    const id = formData.get('id') as string;
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const existing: any = await db.select().from(activities).where(eq(activities.id, id)).get();
    const existingImgs = parseImagesList(existing?.images);
    const stamp = Date.now();

    const updateEntry: any = {
      time: (formData.get('time') as string) || '',
      location: (formData.get('location') as string) || '',
      category: (formData.get('category') as string) || '',
      color: (formData.get('color') as string) || 'red',
    };
    const images: string[] = [];

    const existingImagesRaw = formData.getAll('existingImages');
    for (let idx = 0; idx < existingImagesRaw.length; idx++) {
      const val = existingImagesRaw[idx];
      if (typeof val === 'string' && val) {
        let origIdx = idx;
        try {
          const idxParam = new URL(val, 'https://local.invalid').searchParams.get('index');
          if (idxParam !== null) origIdx = parseInt(idxParam, 10);
        } catch {}
        images.push(await resolveIncomingUrl(val, existingImgs[origIdx], `activities/${id}/img_${stamp}_${idx}`));
      }
    }

    for (const [key, value] of formData.entries()) {
      if (key === 'id' || key === 'existingImages') continue;

      if (value instanceof File && value.size > 0) {
        const stored = await fileToStoredMedia(value, `activities/${id}/${key}_${stamp}_${images.length}`);
        if (key === 'images') {
          images.push(stored);
        } else if (key === 'certificate') {
          updateEntry.certificateUrl = stored;
        } else {
          updateEntry[key === 'image' || key === 'coverImage' ? (key === 'coverImage' ? 'coverImageUrl' : 'imageUrl') : key] = stored;
        }
      } else if (typeof value === 'string' && key !== 'image' && key !== 'coverImage') {
        if (key === 'images') {
          images.push(await resolveIncomingUrl(value, existingImgs[images.length], `activities/${id}/img_${stamp}_${images.length}`));
        } else if (key === 'certificate' || key === 'certificateUrl') {
          updateEntry.certificateUrl = await resolveIncomingUrl(value, existing?.certificateUrl, `activities/${id}/cert_${stamp}`);
        } else if (key === 'imageUrl') {
          updateEntry.imageUrl = await resolveIncomingUrl(value, existing?.imageUrl, `activities/${id}/cover_${stamp}`);
        } else {
          updateEntry[key] = value;
        }
      }
    }

    if (images.length > 0) {
      updateEntry.images = JSON.stringify(images);
      if (!updateEntry.imageUrl) {
        updateEntry.imageUrl = images[0];
      }
    }

    await db.update(activities).set(updateEntry as any).where(eq(activities.id, id));
    return NextResponse.json({ success: true, ...updateEntry }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/activities error:", error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const db = getDb();
    await db.delete(activities).where(eq(activities.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/activities error:", error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

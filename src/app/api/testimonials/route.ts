export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { testimonials } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { offloadDataUrl } from '@/lib/r2-storage';
import { fileToStoredMedia, getCacheHeaders } from '@/lib/media-response';

export async function GET(request: Request) {
  try {
    const db = getDb();
    // Avoid transferring multi-MB base64 blobs from D1 in the list query
    const all = await db
      .select({
        id: testimonials.id,
        name: testimonials.name,
        university: testimonials.university,
        quote: testimonials.quote,
        createdAt: testimonials.createdAt,
        imageUrl: sql<string | null>`CASE
          WHEN image_url IS NULL OR image_url = '' THEN NULL
          WHEN image_url LIKE 'data:%' OR image_url LIKE 'r2:%' THEN 'has_blob'
          ELSE image_url
        END`.as('imageUrl'),
        univImageUrl: sql<string | null>`CASE
          WHEN univ_image_url IS NULL OR univ_image_url = '' THEN NULL
          WHEN univ_image_url LIKE 'data:%' OR univ_image_url LIKE 'r2:%' THEN 'has_blob'
          ELSE univ_image_url
        END`.as('univImageUrl'),
      })
      .from(testimonials)
      .orderBy(desc(testimonials.createdAt));

    const result = all.map((item) => ({
      ...item,
      imageUrl:
        item.imageUrl === 'has_blob'
          ? `/api/testimonials/image?id=${encodeURIComponent(item.id)}&field=image`
          : item.imageUrl,
      univImageUrl:
        item.univImageUrl === 'has_blob'
          ? `/api/testimonials/image?id=${encodeURIComponent(item.id)}&field=univ`
          : item.univImageUrl,
    }));

    return NextResponse.json(result, { headers: getCacheHeaders(request, true) });
  } catch (error) {
    console.error("GET /api/testimonials error:", error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const db = getDb();
    const id = Date.now().toString();
    const newEntry: any = { id };

    for (const [key, value] of formData.entries()) {
      if (value instanceof File && value.size > 0) {
        const fieldName =
          key === 'image' || key === 'coverImage'
            ? 'imageUrl'
            : key === 'univImage'
              ? 'univImageUrl'
              : key;
        newEntry[fieldName] = await fileToStoredMedia(
          value,
          `testimonials/${id}/${fieldName}_${Date.now()}`
        );
      } else if (typeof value === 'string' && key !== 'image' && key !== 'coverImage') {
        const fieldName = key === 'univImage' ? 'univImageUrl' : key;
        if ((fieldName === 'imageUrl' || fieldName === 'univImageUrl') && value.startsWith('data:')) {
          newEntry[fieldName] = await offloadDataUrl(
            value,
            `testimonials/${id}/${fieldName}_${Date.now()}`
          );
        } else {
          newEntry[fieldName] = value;
        }
      }
    }

    if (!newEntry.createdAt) newEntry.createdAt = new Date().toISOString();

    await db.insert(testimonials).values(newEntry as any);
    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    console.error("POST /api/testimonials error:", error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    const db = getDb();
    let id = '';
    const updates: any = {};

    if (contentType.includes('application/json')) {
      const body = await request.json().catch(() => ({}));
      id = body.id;
      if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
      if (body.name !== undefined) updates.name = String(body.name).trim();
      if (body.university !== undefined) updates.university = String(body.university).trim();
      if (body.quote !== undefined) updates.quote = String(body.quote).trim();
      if (body.imageUrl !== undefined) {
        if (body.imageUrl === '__CLEAR__') {
          updates.imageUrl = null;
        } else if (typeof body.imageUrl === 'string' && !body.imageUrl.includes('/api/testimonials/image')) {
          updates.imageUrl = await offloadDataUrl(body.imageUrl, `testimonials/${id}/image_${Date.now()}`);
        }
      }
      if (body.univImageUrl !== undefined) {
        if (body.univImageUrl === '__CLEAR__') {
          updates.univImageUrl = null;
        } else if (typeof body.univImageUrl === 'string' && !body.univImageUrl.includes('/api/testimonials/image')) {
          updates.univImageUrl = await offloadDataUrl(body.univImageUrl, `testimonials/${id}/univ_${Date.now()}`);
        }
      }
    } else {
      const formData = await request.formData();
      id = formData.get('id') as string;
      if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

      for (const [key, value] of formData.entries()) {
        if (key === 'id') continue;
        if (value instanceof File && value.size > 0) {
          const fieldName =
            key === 'image' || key === 'coverImage'
              ? 'imageUrl'
              : key === 'univImage'
                ? 'univImageUrl'
                : key;
          updates[fieldName] = await fileToStoredMedia(
            value,
            `testimonials/${id}/${fieldName}_${Date.now()}`
          );
        } else if (typeof value === 'string') {
          const fieldName =
            key === 'image' || key === 'coverImage'
              ? 'imageUrl'
              : key === 'univImage'
                ? 'univImageUrl'
                : key;
          if (value === '__CLEAR__') {
            updates[fieldName] = null;
          } else if (
            (fieldName === 'imageUrl' || fieldName === 'univImageUrl') &&
            value.includes('/api/testimonials/image')
          ) {
            // Preserve existing stored blob/R2 image when client echoes proxy URL unchanged
            continue;
          } else if ((fieldName === 'imageUrl' || fieldName === 'univImageUrl') && value.startsWith('data:')) {
            updates[fieldName] = await offloadDataUrl(value, `testimonials/${id}/${fieldName}_${Date.now()}`);
          } else {
            updates[fieldName] = value;
          }
        }
      }
    }

    const allowedKeys = ['name', 'university', 'quote', 'imageUrl', 'univImageUrl'];
    const cleanUpdates: any = {};
    for (const key of allowedKeys) {
      if (updates[key] !== undefined) {
        cleanUpdates[key] = updates[key];
      }
    }

    if (Object.keys(cleanUpdates).length === 0) {
      return NextResponse.json({ success: true, message: 'ไม่มีข้อมูลเปลี่ยนแปลง' });
    }

    await db.update(testimonials).set(cleanUpdates).where(eq(testimonials.id, id));
    return NextResponse.json({ success: true, id, ...cleanUpdates });
  } catch (error) {
    console.error("PUT /api/testimonials error:", error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const db = getDb();
    await db.delete(testimonials).where(eq(testimonials.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/testimonials error:", error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

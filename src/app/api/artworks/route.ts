export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { artworks } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { checkIsAdmin } from '@/lib/api-auth';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { offloadDataUrl } from '@/lib/r2-storage';
import { fileToStoredMedia, getCacheHeaders } from '@/lib/media-response';

let artworksTableEnsured = false;
async function ensureArtworksTable() {
  if (artworksTableEnsured) return;
  try {
    const ctx = getRequestContext();
    const d1 = (ctx?.env as any)?.DB;
    if (!d1) return;

    await d1.prepare(`
      CREATE TABLE IF NOT EXISTS artworks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        image_url TEXT NOT NULL,
        year TEXT,
        technique TEXT,
        dimensions TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    try { await d1.prepare(`ALTER TABLE artworks ADD COLUMN technique TEXT`).run(); } catch (_) {}
    try { await d1.prepare(`ALTER TABLE artworks ADD COLUMN dimensions TEXT`).run(); } catch (_) {}
    artworksTableEnsured = true;
  } catch (e) {
    console.error("ensureArtworksTable error:", e);
  }
}

async function queryArtworksLight(db: ReturnType<typeof getDb>) {
  return db
    .select({
      id: artworks.id,
      title: artworks.title,
      author: artworks.author,
      year: artworks.year,
      technique: artworks.technique,
      dimensions: artworks.dimensions,
      createdAt: artworks.createdAt,
      imageUrl: sql<string>`CASE
        WHEN image_url LIKE 'data:%' OR image_url LIKE 'r2:%' THEN 'has_blob'
        ELSE image_url
      END`.as('imageUrl'),
    })
    .from(artworks)
    .orderBy(desc(artworks.createdAt));
}

export async function GET(request: Request) {
  try {
    const db = getDb();
    let all;
    try {
      all = await queryArtworksLight(db);
    } catch {
      await ensureArtworksTable();
      all = await queryArtworksLight(db);
    }

    const normalized = all.map((item: any) => ({
      ...item,
      imageUrl:
        item.imageUrl === 'has_blob'
          ? `/api/artworks/image?id=${encodeURIComponent(item.id)}`
          : item.imageUrl,
      studentName: item.author || item.studentName || '',
      grade: item.year || item.grade || 'ทั่วไป',
      author: item.author || item.studentName || '',
      year: item.year || item.grade || 'ทั่วไป',
      technique: item.technique || '',
      dimensions: item.dimensions || '',
    }));

    return NextResponse.json(normalized, { headers: getCacheHeaders(request, true) });
  } catch (error: any) {
    console.error("GET /api/artworks error:", error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json({ error: 'Unauthorized — สำหรับผู้ดูแลระบบเท่านั้น' }, { status: 401 });
    }
    await ensureArtworksTable();
    const db = getDb();

    const id = Date.now().toString();
    let title = '';
    let studentName = '';
    let grade = '';
    let technique = '';
    let dimensions = '';
    let imageUrl = '';

    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await request.json();
      title = body.title || '';
      studentName = body.studentName || body.author || '';
      grade = body.grade || body.year || 'ทั่วไป';
      technique = body.technique || '';
      dimensions = body.dimensions || '';
      imageUrl = body.imageUrl || '';
      if (imageUrl.startsWith('data:')) {
        imageUrl = await offloadDataUrl(imageUrl, `artworks/${id}/image_${Date.now()}`);
      }
    } else {
      const formData = await request.formData();
      title = (formData.get('title') as string) || '';
      studentName = (formData.get('studentName') as string) || (formData.get('author') as string) || '';
      grade = (formData.get('grade') as string) || (formData.get('year') as string) || '';
      technique = (formData.get('technique') as string) || '';
      dimensions = (formData.get('dimensions') as string) || '';
      imageUrl = (formData.get('imageUrl') as string) || '';

      const imageFile = formData.get('image') || formData.get('coverImage');
      if (imageFile && typeof imageFile === 'object' && 'arrayBuffer' in imageFile && (imageFile as any).size > 0) {
        imageUrl = await fileToStoredMedia(imageFile as File, `artworks/${id}/image_${Date.now()}`);
      } else if (imageUrl.startsWith('data:')) {
        imageUrl = await offloadDataUrl(imageUrl, `artworks/${id}/image_${Date.now()}`);
      }
    }

    const newEntry = {
      id,
      title,
      author: studentName,
      imageUrl: imageUrl || '',
      year: grade,
      technique,
      dimensions,
      createdAt: new Date().toISOString()
    };

    await db.insert(artworks).values(newEntry as any);
    return NextResponse.json(newEntry, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/artworks error:", error);
    const msg = error?.message || String(error);
    return NextResponse.json({ error: `เกิดข้อผิดพลาดในการบันทึก: ${msg}` }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json({ error: 'Unauthorized — สำหรับผู้ดูแลระบบเท่านั้น' }, { status: 401 });
    }
    await ensureArtworksTable();
    const formData = await request.formData();
    const db = getDb();

    const id = formData.get('id') as string;
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const title = (formData.get('title') as string) || '';
    const studentName = (formData.get('studentName') as string) || (formData.get('author') as string) || '';
    const grade = (formData.get('grade') as string) || (formData.get('year') as string) || '';
    const technique = (formData.get('technique') as string) || '';
    const dimensions = (formData.get('dimensions') as string) || '';

    let imageUrl = (formData.get('imageUrl') as string) || '';
    const imageFile = formData.get('image') || formData.get('coverImage');
    if (imageFile && typeof imageFile === 'object' && 'arrayBuffer' in imageFile && (imageFile as any).size > 0) {
      imageUrl = await fileToStoredMedia(imageFile as File, `artworks/${id}/image_${Date.now()}`);
    } else if (imageUrl.includes('/api/artworks/image')) {
      // Preserve existing stored blob/R2 image when client echoes proxy URL unchanged
      imageUrl = '';
    } else if (imageUrl.startsWith('data:')) {
      imageUrl = await offloadDataUrl(imageUrl, `artworks/${id}/image_${Date.now()}`);
    }

    const updateData: any = {
      title,
      author: studentName,
      year: grade,
      technique,
      dimensions,
    };
    if (imageUrl) {
      updateData.imageUrl = imageUrl;
    }

    await db.update(artworks).set(updateData).where(eq(artworks.id, id));
    return NextResponse.json({
      success: true,
      ...updateData,
      id,
      studentName,
      grade,
      technique,
      dimensions,
    });
  } catch (error: any) {
    console.error("PUT /api/artworks error:", error);
    const msg = error?.message || String(error);
    return NextResponse.json({ error: `เกิดข้อผิดพลาดในการแก้ไข: ${msg}` }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json({ error: 'Unauthorized — สำหรับผู้ดูแลระบบเท่านั้น' }, { status: 401 });
    }
    await ensureArtworksTable();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const db = getDb();
    await db.delete(artworks).where(eq(artworks.id, id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/artworks error:", error);
    const msg = error?.message || String(error);
    return NextResponse.json({ error: `เกิดข้อผิดพลาดในการลบ: ${msg}` }, { status: 500 });
  }
}

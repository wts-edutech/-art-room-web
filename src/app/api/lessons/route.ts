export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { lessons } from '@/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { checkIsAdmin } from '@/lib/api-auth';
import { fileToStoredMedia, getCacheHeaders, resolveR2Url } from '@/lib/media-response';

export async function GET(request: Request) {
  const headers = getCacheHeaders(request, true);
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'general';

    const db = getDb();
    const selectFields = {
      id: lessons.id,
      title: lessons.title,
      description: lessons.description,
      category: lessons.category,
      videoId: lessons.videoId,
      type: lessons.type,
      createdAt: lessons.createdAt,
      views: lessons.views,
      ratingSum: lessons.ratingSum,
      ratingCount: lessons.ratingCount,
      imageUrl: sql<string | null>`CASE
        WHEN image_url IS NULL OR image_url = '' THEN NULL
        WHEN image_url LIKE 'data:%' THEN 'has_blob'
        ELSE image_url
      END`.as('imageUrl'),
    };

    const conditions = [];
    if (type && type !== 'all') {
      conditions.push(eq(lessons.type, type));
    }

    const all = conditions.length > 0
      ? await db.select(selectFields).from(lessons).where(and(...conditions)).orderBy(desc(lessons.createdAt))
      : await db.select(selectFields).from(lessons).orderBy(desc(lessons.createdAt));

    const normalized = (all || []).map((item) => ({
      ...item,
      imageUrl:
        item.imageUrl === 'has_blob'
          ? `/api/media?type=lesson&id=${encodeURIComponent(item.id)}`
          : resolveR2Url(item.imageUrl) || '',
    }));

    return NextResponse.json(normalized, { headers });
  } catch (error) {
    console.error("GET /api/lessons error:", error);
    return NextResponse.json([], { headers });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json({ error: 'Unauthorized — สำหรับผู้ดูแลระบบเท่านั้น' }, { status: 401 });
    }

    const formData = await request.formData();
    const db = getDb();
    
    // Parse form data
    const title = (formData.get('title') as string) || '';
    const description = (formData.get('description') as string) || '';
    const category = (formData.get('category') as string) || 'สื่อวิดีทัศน์';
    const videoId = (formData.get('videoId') as string) || '';
    const type = (formData.get('type') as string) || 'general';

    const image = formData.get('image') as File | null;
    let imageUrl = (formData.get('imageUrl') as string) || '';
    
    const newId = Date.now().toString();
    if (image && image.size > 0) {
      imageUrl = await fileToStoredMedia(image, `lessons/${newId}/img_${Date.now()}`);
    }

    const newEntry = {
      id: newId,
      title,
      description,
      category,
      videoId,
      imageUrl,
      type,
      createdAt: new Date().toISOString(),
      views: 0,
      ratingSum: 0,
      ratingCount: 0
    };
    
    await db.insert(lessons).values(newEntry as any);
    
    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    console.error("POST /api/lessons error:", error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json({ error: 'Unauthorized — สำหรับผู้ดูแลระบบเท่านั้น' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    
    const db = getDb();
    await db.delete(lessons).where(eq(lessons.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/lessons error:", error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { news } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { checkIsAdmin } from '@/lib/api-auth';
import { fileToStoredMedia, getCacheHeaders, resolveR2Url } from '@/lib/media-response';

export async function GET(request: Request) {
  try {
    const db = getDb();
    const all = await db.select().from(news).orderBy(desc(news.createdAt));
    const normalized = all.map((item) => ({
      ...item,
      imageUrl: resolveR2Url(item.imageUrl),
    }));
    return NextResponse.json(normalized, {
      headers: getCacheHeaders(request),
    });
  } catch (error) {
    console.error("GET /api/news error:", error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json({ error: 'Unauthorized — สำหรับผู้ดูแลระบบเท่านั้น' }, { status: 401 });
    }
    const formData = await request.formData();
    const db = getDb();
    const newEntry: any = { id: Date.now().toString() };
    
    // Parse form data dynamically
    for (const [key, value] of formData.entries()) {
      if (value instanceof File && value.size > 0) {
        const fieldName = key === 'image' || key === 'coverImage' ? (key === 'coverImage' ? 'coverImageUrl' : 'imageUrl') : key;
        newEntry[fieldName] = await fileToStoredMedia(value, `news/${newEntry.id}/${fieldName}_${Date.now()}`);
      } else if (typeof value === 'string' && key !== 'image' && key !== 'coverImage') {
        newEntry[key] = value;
      }
    }
    
    if (!newEntry.content && newEntry.excerpt) {
      newEntry.content = newEntry.excerpt;
    }
    if (!newEntry.createdAt) newEntry.createdAt = new Date().toISOString();
    
    await db.insert(news).values(newEntry as any);
    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    console.error("POST /api/news error:", error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json({ error: 'Unauthorized — สำหรับผู้ดูแลระบบเท่านั้น' }, { status: 401 });
    }
    const formData = await request.formData();
    const id = formData.get('id') as string;
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const db = getDb();
    const updateData: any = {};

    for (const [key, value] of formData.entries()) {
      if (key === 'id') continue;
      if (value instanceof File && value.size > 0) {
        const fieldName = key === 'image' || key === 'coverImage' ? (key === 'coverImage' ? 'coverImageUrl' : 'imageUrl') : key;
        updateData[fieldName] = await fileToStoredMedia(value, `news/${id}/${fieldName}_${Date.now()}`);
      } else if (typeof value === 'string' && key !== 'image' && key !== 'coverImage') {
        updateData[key] = value;
      }
    }

    if (!updateData.content && updateData.excerpt) {
      updateData.content = updateData.excerpt;
    }

    await db.update(news).set({
      ...(updateData.title ? { title: updateData.title } : {}),
      ...(updateData.content !== undefined ? { content: updateData.content } : {}),
      ...(updateData.date ? { date: updateData.date } : {}),
      ...(updateData.imageUrl ? { imageUrl: updateData.imageUrl } : {}),
    }).where(eq(news.id, id));

    return NextResponse.json({ success: true, id, ...updateData });
  } catch (error) {
    console.error("PUT /api/news error:", error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
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
    await db.delete(news).where(eq(news.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/news error:", error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { lessons } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { checkIsAdmin } from '@/lib/api-auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'general';

    const db = getDb();
    let query = db.select().from(lessons);

    const conditions = [];
    if (type && type !== 'all') {
      conditions.push(eq(lessons.type, type));
    }

    const all = conditions.length > 0
      ? await query.where(and(...conditions)).orderBy(desc(lessons.createdAt))
      : await query.orderBy(desc(lessons.createdAt));

    return NextResponse.json(all || []);
  } catch (error) {
    console.error("GET /api/lessons error:", error);
    return NextResponse.json([]);
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
    
    if (image && image.size > 0) {
      const bytes = await image.arrayBuffer();
      const base64 = Buffer.from(bytes).toString('base64');
      imageUrl = `data:${image.type};base64,${base64}`;
    }

    const newEntry = {
      id: Date.now().toString(),
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
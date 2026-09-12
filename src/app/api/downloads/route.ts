export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { downloads } from '@/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { checkIsAdmin } from '@/lib/api-auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const grade = searchParams.get('grade');

    const db = getDb();
    let query = db.select().from(downloads);

    const conditions = [];
    if (category && category !== 'all') {
      conditions.push(eq(downloads.category, category));
    }
    if (grade && grade !== 'all') {
      conditions.push(eq(downloads.grade, grade));
    }

    const all = conditions.length > 0
      ? await query.where(and(...conditions)).orderBy(desc(downloads.createdAt))
      : await query.orderBy(desc(downloads.createdAt));

    return NextResponse.json(all);
  } catch (error) {
    console.error("GET /api/downloads error:", error);
    return NextResponse.json({ error: 'Failed to fetch downloads' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json({ error: 'Unauthorized — สำหรับผู้ดูแลระบบเท่านั้น' }, { status: 401 });
    }

    const formData = await request.formData();
    const db = getDb();

    const title = formData.get('title') as string;
    const description = (formData.get('description') as string) || '';
    const category = (formData.get('category') as string) || 'ใบงาน';
    const grade = (formData.get('grade') as string) || 'all';
    const fileUrl = formData.get('fileUrl') as string;
    const fileName = (formData.get('fileName') as string) || title;
    const fileSize = (formData.get('fileSize') as string) || 'PDF';

    if (!title || !fileUrl) {
      return NextResponse.json({ error: 'Title and fileUrl are required' }, { status: 400 });
    }

    const newDownload = {
      id: Date.now().toString(),
      title,
      description,
      category,
      grade,
      fileUrl,
      fileName,
      fileSize,
      downloadsCount: 0,
      createdAt: new Date().toISOString()
    };

    await db.insert(downloads).values(newDownload as any);
    return NextResponse.json(newDownload, { status: 201 });
  } catch (error) {
    console.error("POST /api/downloads error:", error);
    return NextResponse.json({ error: 'Failed to create download' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const db = getDb();
    await db.update(downloads)
      .set({ downloadsCount: sql`${downloads.downloadsCount} + 1` })
      .where(eq(downloads.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/downloads error:", error);
    return NextResponse.json({ error: 'Failed to increment download count' }, { status: 500 });
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
    await db.delete(downloads).where(eq(downloads.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/downloads error:", error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { ideas, comments } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { checkIsAdmin } from '@/lib/api-auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json({ error: 'Unauthorized — สำหรับผู้ดูแลระบบเท่านั้น' }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = (await request.json().catch(() => ({}))) as any;

    const db = getDb();
    const updates: any = {};
    if (body.status) updates.status = body.status;
    if (body.title) updates.title = body.title;
    if (body.description) updates.description = body.description;
    if (body.category) updates.category = body.category;
    if (body.link !== undefined) updates.link = body.link;
    if (body.isFeatured !== undefined) updates.isFeatured = body.isFeatured ? 1 : 0;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    await db.update(ideas).set(updates).where(eq(ideas.id, id));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/ideas/[id] error:", error);
    return NextResponse.json({ error: 'Failed to update idea' }, { status: 500 });
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const db = getDb();
    const result = await db.select().from(ideas).where(eq(ideas.id, id));
    
    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    const ideaData = result[0];
    
    const ideaComments = await db.select().from(comments).where(eq(comments.ideaId, id)).orderBy(desc(comments.time));
    
    let safeFiles: any[] = [];
    if (ideaData.files) {
      if (typeof ideaData.files === 'string') {
        if (ideaData.files.startsWith('data:')) {
          safeFiles = [{ name: 'ไฟล์แนบ', url: ideaData.files }];
        } else {
          try { safeFiles = JSON.parse(ideaData.files); } catch(e) {}
        }
      } else if (Array.isArray(ideaData.files)) {
        safeFiles = ideaData.files;
      }
    }
    
    const ideaWithComments = {
      ...ideaData,
      files: safeFiles,
      comments: ideaComments.map((c: any) => ({
        id: c.id,
        authorName: c.author,
        authorEmail: c.authorEmail || '',
        authorImage: c.authorImage || '',
        text: c.text,
        createdAt: c.time,
      }))
    };
    
    return NextResponse.json(ideaWithComments);
  } catch (error) {
    console.error("GET /api/ideas/[id] error:", error);
    return NextResponse.json({ error: 'Failed to fetch idea' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json({ error: 'Unauthorized — สำหรับผู้ดูแลระบบเท่านั้น' }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = resolvedParams.id;
    const db = getDb();
    
    // First delete associated comments
    await db.delete(comments).where(eq(comments.ideaId, id));
    
    // Then delete the idea
    await db.delete(ideas).where(eq(ideas.id, id));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/ideas/[id] error:", error);
    return NextResponse.json({ error: 'Failed to delete idea' }, { status: 500 });
  }
}
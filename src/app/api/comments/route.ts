export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { comments } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getSession, checkIsAdmin } from '@/lib/api-auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get('lessonId');

    const db = getDb();
    let all;
    if (lessonId && lessonId !== 'all') {
      all = await db
        .select()
        .from(comments)
        .where(eq(comments.lessonId, lessonId))
        .orderBy(desc(comments.time));
    } else {
      all = await db
        .select()
        .from(comments)
        .orderBy(desc(comments.time))
        .limit(50);
    }
    return NextResponse.json(all);
  } catch (error) {
    console.error('GET /api/comments error:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const lessonId = body.lessonId || 'materials-hub';
    const text = String(body.text || '').trim();

    if (!text) {
      return NextResponse.json({ error: 'กรุณากรอกข้อความแสดงความคิดเห็น' }, { status: 400 });
    }

    if (text.length > 1000) {
      return NextResponse.json({ error: 'ข้อความมีความยาวเกินกำหนด (สูงสุด 1,000 ตัวอักษร)' }, { status: 400 });
    }

    const session = await getSession();
    const isAdmin = await checkIsAdmin();

    let authorName = '';
    if (isAdmin) {
      authorName = body.author ? `${body.author} (Admin)` : 'ผู้ดูแลระบบ (Admin)';
    } else if (session) {
      authorName = session.name;
    } else {
      authorName = body.author || 'ผู้เยี่ยมชม';
    }

    const db = getDb();
    const newEntry = {
      id: Date.now().toString(),
      lessonId: lessonId,
      author: authorName,
      authorEmail: session?.userId || body.authorEmail || '',
      authorImage: body.authorImage || '',
      text: text,
      time: new Date().toISOString(),
    };

    await db.insert(comments).values(newEntry);
    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    console.error('POST /api/comments error:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('id') || searchParams.get('commentId');

    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
    }

    const session = await getSession();
    const isAdmin = await checkIsAdmin();

    const db = getDb();
    const existing = await db
      .select()
      .from(comments)
      .where(eq(comments.id, commentId))
      .get();

    if (!existing) {
      return NextResponse.json({ error: 'ไม่พบความคิดเห็นนี้' }, { status: 404 });
    }

    // Admin can delete any; author can delete their own
    if (!isAdmin && session && existing.author !== session.name) {
      return NextResponse.json({ error: 'Forbidden — ไม่มีสิทธิ์ลบความคิดเห็นนี้' }, { status: 403 });
    }

    await db.delete(comments).where(eq(comments.id, commentId));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/comments error:', error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}

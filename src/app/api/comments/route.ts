export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { comments } from '@/db/schema';
import { eq, desc, inArray } from 'drizzle-orm';
import { getSession, checkIsAdmin } from '@/lib/api-auth';
import { checkProfanity, analyzeComment, PROFANITY_ALERT_MESSAGE } from '@/lib/profanity-filter';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get('lessonId');
    const isAdminQuery = searchParams.get('admin') === 'true';

    const db = getDb();
    let rows;
    if (lessonId && lessonId !== 'all') {
      rows = await db
        .select()
        .from(comments)
        .where(eq(comments.lessonId, lessonId))
        .orderBy(desc(comments.time))
        .limit(isAdminQuery ? 500 : 100);
    } else {
      rows = await db
        .select()
        .from(comments)
        .orderBy(desc(comments.time))
        .limit(isAdminQuery ? 500 : 100);
    }

    // Attach moderation flag analysis
    const enhanced = (rows || []).map((item) => {
      const analysis = analyzeComment(item.text);
      return {
        ...item,
        isFlagged: analysis.isFlagged,
        flaggedWord: analysis.flaggedWord,
      };
    });

    return NextResponse.json(enhanced);
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

    // Profanity Filter (Alert & Block)
    const textCheck = checkProfanity(text);
    const authorCheck = checkProfanity(body.author || '');
    if (!textCheck.isClean || !authorCheck.isClean) {
      return NextResponse.json({
        error: PROFANITY_ALERT_MESSAGE,
        isProfanity: true,
      }, { status: 400 });
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
    const idsParam = searchParams.get('ids');

    let bodyIds: string[] = [];
    try {
      const body = await request.json().catch(() => null);
      if (body && Array.isArray(body.ids)) {
        bodyIds = body.ids.filter(Boolean);
      }
    } catch {}

    const session = await getSession();
    const isAdmin = await checkIsAdmin();

    const db = getDb();

    // Case 1: Bulk delete (Admin only)
    const targetIds = bodyIds.length > 0 
      ? bodyIds 
      : idsParam ? idsParam.split(',').map((s) => s.trim()).filter(Boolean) : [];

    if (targetIds.length > 0) {
      if (!isAdmin) {
        return NextResponse.json({ error: 'Unauthorized — เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถลบหลายรายการได้' }, { status: 403 });
      }
      await db.delete(comments).where(inArray(comments.id, targetIds));
      return NextResponse.json({ success: true, count: targetIds.length });
    }

    // Case 2: Single comment delete
    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
    }

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

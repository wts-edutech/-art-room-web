export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { comments } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSession, checkIsAdmin } from '@/lib/api-auth';
import { checkProfanity, PROFANITY_ALERT_MESSAGE } from '@/lib/profanity-filter';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const resolvedParams = await params;
    const ideaId = resolvedParams.id;
    const body = (await request.json().catch(() => ({}))) as any;
    
    // Check session or admin token
    const session = await getSession();
    const isAdmin = await checkIsAdmin();
    
    if (!session && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized — กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็น' }, 
        { status: 401 }
      );
    }
    
    const text = String(body.text || '').trim();
    if (!text) {
      return NextResponse.json({ error: 'กรุณากรอกข้อความความคิดเห็น' }, { status: 400 });
    }
    if (text.length > 1000) {
      return NextResponse.json({ error: 'ข้อความมีความยาวเกินกำหนด (สูงสุด 1,000 ตัวอักษร)' }, { status: 400 });
    }

    // Profanity Filter (Alert & Block)
    const textCheck = checkProfanity(text);
    if (!textCheck.isClean) {
      return NextResponse.json({
        error: PROFANITY_ALERT_MESSAGE,
        isProfanity: true,
      }, { status: 400 });
    }

    // Determine verified author name
    let authorName = '';
    if (isAdmin) {
      authorName = body.authorName ? `${body.authorName} (Admin)` : 'ผู้ดูแลระบบ (Admin)';
    } else if (session) {
      authorName = session.name;
    } else {
      authorName = body.authorName || 'ผู้ใช้งาน';
    }

    const db = getDb();
    const newComment = {
      id: Date.now().toString(),
      ideaId: ideaId,
      lessonId: '-', // generic foreign key placeholder
      author: authorName,
      authorEmail: session?.userId || '',
      authorImage: body.authorImage || '',
      text: text,
      time: new Date().toISOString()
    };
    
    await db.insert(comments).values(newComment);
    
    // Map to frontend format
    const mappedComment = {
      id: newComment.id,
      authorName: newComment.author,
      authorImage: newComment.authorImage,
      text: newComment.text,
      createdAt: newComment.time
    };
    
    return NextResponse.json(mappedComment, { status: 201 });
  } catch (error) {
    console.error("POST /api/ideas/[id]/comment error:", error);
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const resolvedParams = await params;
    const ideaId = resolvedParams.id;
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');

    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
    }

    const session = await getSession();
    const isAdmin = await checkIsAdmin();

    if (!session && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized — กรุณาเข้าสู่ระบบ' }, { status: 401 });
    }

    const db = getDb();
    const existing = await db
      .select()
      .from(comments)
      .where(and(eq(comments.id, commentId), eq(comments.ideaId, ideaId)))
      .get();

    if (!existing) {
      return NextResponse.json({ error: 'ไม่พบความคิดเห็นนี้' }, { status: 404 });
    }

    // Admin can delete any comment; author can delete only their own
    if (!isAdmin && session && existing.author !== session.name) {
      return NextResponse.json({ error: 'Forbidden — ไม่มีสิทธิ์ลบความคิดเห็นนี้' }, { status: 403 });
    }

    await db.delete(comments).where(eq(comments.id, commentId));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/ideas/[id]/comment error:", error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
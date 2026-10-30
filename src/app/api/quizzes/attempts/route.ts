export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { quizAttempts, quizzes } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { checkIsAdmin, getAdminSession, getSession } from '@/lib/api-auth';

// GET /api/quizzes/attempts
// Teacher fetches all student scores and attempt reports; Students only fetch their own attempts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const quizId = searchParams.get('quizId');
    const classroom = searchParams.get('classroom');
    const studentId = searchParams.get('studentId');

    const adminSession = await getAdminSession();
    const session = await getSession();

    const db = getDb();
    const conditions = [];

    if (!adminSession.isAdmin) {
      if (!session || session.role !== 'student') {
        return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบเพื่อดูประวัติการทำแบบทดสอบ' }, { status: 401 });
      }
      // Strict student isolation: only see own attempts
      conditions.push(eq(quizAttempts.studentId, session.userId));
      if (quizId) {
        conditions.push(eq(quizAttempts.quizId, quizId));
      }
    } else {
      // Teacher/Admin filtering
      if (quizId) conditions.push(eq(quizAttempts.quizId, quizId));
      if (classroom) conditions.push(eq(quizAttempts.classroom, classroom));
      if (studentId) conditions.push(eq(quizAttempts.studentId, studentId));
    }

    const attempts = conditions.length > 0
      ? await db.select().from(quizAttempts).where(and(...conditions)).orderBy(desc(quizAttempts.submittedAt))
      : await db.select().from(quizAttempts).orderBy(desc(quizAttempts.submittedAt)).limit(300);

    return NextResponse.json(attempts);
  } catch (error: any) {
    console.error('Error fetching quiz attempts:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/quizzes/attempts
// Teacher resets a student's attempt to allow re-taking
export async function DELETE(request: Request) {
  try {
    const isAdmin = await checkIsAdmin();
    const referer = request.headers.get('referer') || '';
    const isLocalOrAdminReferer = process.env.NODE_ENV !== 'production' && referer.includes('/admin');

    if (!isAdmin && !isLocalOrAdminReferer) {
      return NextResponse.json({ error: 'Unauthorized: Teacher privileges required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const attemptId = searchParams.get('id');
    const studentId = searchParams.get('studentId');
    const quizId = searchParams.get('quizId');

    const db = getDb();

    if (attemptId) {
      await db.delete(quizAttempts).where(eq(quizAttempts.id, attemptId));
      return NextResponse.json({ success: true, message: 'ลบประวัติการสอบเพื่อให้นักเรียนทำใหม่เรียบร้อยแล้ว' });
    }

    if (studentId && quizId) {
      await db
        .delete(quizAttempts)
        .where(and(eq(quizAttempts.studentId, studentId), eq(quizAttempts.quizId, quizId)));
      return NextResponse.json({ success: true, message: 'รีเซ็ตสิทธิ์ให้นักเรียนทำข้อสอบใหม่เรียบร้อยแล้ว' });
    }

    return NextResponse.json({ error: 'Missing attemptId or studentId+quizId' }, { status: 400 });
  } catch (error: any) {
    console.error('Error resetting quiz attempt:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

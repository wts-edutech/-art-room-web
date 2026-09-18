export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { quizzes, quizQuestions, quizAttempts, students } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { sendQuizNotification } from '@/lib/email-notifier';

// POST /api/quizzes/submit
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      quizId,
      studentId,
      studentName,
      classroom,
      answers, // Record<number, "A" | "B" | "C" | "D"> e.g. { "1": "B", "2": "A" }
      infractionsCount = 0,
      status = 'completed' // 'completed', 'timed_out', 'force_submitted'
    } = body;

    if (!quizId || !studentId || !studentName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = getDb();

    // Verify student belongs to school
    const validStudent = await db.select().from(students).where(eq(students.id, String(studentId).trim())).get();
    if (!validStudent) {
      return NextResponse.json({ error: 'สงวนสิทธิ์เฉพาะนักเรียนโรงเรียนวชิรธรรมสาธิตเท่านั้น' }, { status: 403 });
    }

    // 1. Verify quiz
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, quizId));
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // 2. Check if student already submitted (prevent duplicate submissions)
    const existing = await db
      .select()
      .from(quizAttempts)
      .where(and(eq(quizAttempts.quizId, quizId), eq(quizAttempts.studentId, studentId)));

    if (existing && existing.length > 0) {
      return NextResponse.json({
        error: 'คุณได้ส่งแบบทดสอบนี้ไปแล้ว ไม่สามารถส่งซ้ำได้',
        attempt: {
          score: existing[0].score,
          totalQuestions: existing[0].totalQuestions,
          submittedAt: existing[0].submittedAt
        }
      }, { status: 409 });
    }

    // 3. Fetch answer keys from database
    const questions = await db
      .select({
        questionNumber: quizQuestions.questionNumber,
        correctAnswer: quizQuestions.correctAnswer
      })
      .from(quizQuestions)
      .where(eq(quizQuestions.quizId, quizId));

    // 4. Calculate score
    let score = 0;
    const totalQuestions = questions.length || quiz.totalQuestions || 20;

    for (const q of questions) {
      const studentAns = answers?.[q.questionNumber] || answers?.[String(q.questionNumber)];
      if (studentAns && studentAns.toUpperCase() === q.correctAnswer.toUpperCase()) {
        score += 1;
      }
    }

    // 5. Insert attempt record
    const attemptId = `att_${Date.now()}_${studentId}`;
    const nowIso = new Date().toISOString();

    await db.insert(quizAttempts).values({
      id: attemptId,
      quizId,
      studentId,
      studentName,
      classroom: classroom || 'ไม่ระบุห้อง',
      score,
      totalQuestions,
      answers: JSON.stringify(answers || {}),
      infractionsCount: Number(infractionsCount) || 0,
      startedAt: nowIso,
      submittedAt: nowIso,
      status: status || 'completed'
    });

    // Trigger automated email notification to teacher
    try {
      const origin = new URL(request.url).origin;
      await sendQuizNotification({
        studentName: String(studentName).trim(),
        studentId: String(studentId).trim(),
        classroom: classroom || 'ไม่ระบุห้อง',
        quizTitle: quiz.title || 'แบบทดสอบ',
        score,
        totalQuestions,
        infractionsCount: Number(infractionsCount) || 0,
        submittedAt: nowIso,
        origin,
      });
    } catch (notifErr) {
      console.warn("Automated email notification failed for quiz attempt:", notifErr);
    }

    return NextResponse.json({
      success: true,
      score,
      totalQuestions,
      infractionsCount,
      submittedAt: nowIso,
      message: 'บันทึกคะแนนการทำแบบทดสอบเรียบร้อยแล้ว'
    });
  } catch (error: any) {
    console.error('Error submitting quiz:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

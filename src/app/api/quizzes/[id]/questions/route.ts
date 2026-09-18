export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { quizzes, quizQuestions } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

import { checkIsAdmin } from '@/lib/api-auth';

// GET /api/quizzes/[id]/questions
// If ?withAnswers=true, includes correctAnswer and explanation (for teacher preview/edit)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const withAnswers = searchParams.get('withAnswers') === 'true';
    const db = getDb();

    // Verify quiz exists
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, id));
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Fetch questions ordered by questionNumber
    let questions;
    if (withAnswers) {
      questions = await db
        .select()
        .from(quizQuestions)
        .where(eq(quizQuestions.quizId, id))
        .orderBy(asc(quizQuestions.questionNumber));
    } else {
      questions = await db
        .select({
          id: quizQuestions.id,
          quizId: quizQuestions.quizId,
          questionNumber: quizQuestions.questionNumber,
          questionText: quizQuestions.questionText,
          choiceA: quizQuestions.choiceA,
          choiceB: quizQuestions.choiceB,
          choiceC: quizQuestions.choiceC,
          choiceD: quizQuestions.choiceD,
          imageUrl: quizQuestions.imageUrl,
          // Exclude correctAnswer and explanation for exam integrity
        })
        .from(quizQuestions)
        .where(eq(quizQuestions.quizId, id))
        .orderBy(asc(quizQuestions.questionNumber));
    }

    let parsedTargetClassrooms: string[] = [];
    try {
      parsedTargetClassrooms = typeof quiz.targetClassrooms === 'string'
        ? JSON.parse(quiz.targetClassrooms)
        : (Array.isArray(quiz.targetClassrooms) ? quiz.targetClassrooms : []);
    } catch {
      parsedTargetClassrooms = [];
    }

    return NextResponse.json({
      quiz: {
        id: quiz.id,
        code: quiz.code,
        title: quiz.title,
        gradeLevel: quiz.gradeLevel,
        description: quiz.description,
        totalQuestions: quiz.totalQuestions,
        maxScore: quiz.maxScore,
        timeLimitMinutes: quiz.timeLimitMinutes,
        isActive: quiz.isActive,
        targetClassrooms: parsedTargetClassrooms
      },
      questions
    });
  } catch (error: any) {
    console.error('Error fetching quiz questions:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/quizzes/[id]/questions
// Teacher updates a question's text, choices, correct answer, or explanation
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quizId } = await params;
    const isAdmin = await checkIsAdmin();
    const referer = request.headers.get('referer') || '';
    const isLocalOrAdminReferer = process.env.NODE_ENV !== 'production' && referer.includes('/admin');

    if (!isAdmin && !isLocalOrAdminReferer) {
      return NextResponse.json({ error: 'Unauthorized: Teacher/Admin privileges required' }, { status: 403 });
    }

    const body = await request.json();
    const { questionId, questionText, choiceA, choiceB, choiceC, choiceD, correctAnswer, explanation } = body;

    if (!questionId || !questionText || !choiceA || !choiceB || !choiceC || !choiceD || !correctAnswer) {
      return NextResponse.json({ error: 'กรุณากรอกข้อมูลคำถาม ตัวเลือก A-D และเฉลยให้ครบถ้วน' }, { status: 400 });
    }

    const validAnswers = ['A', 'B', 'C', 'D'];
    if (!validAnswers.includes(correctAnswer.toUpperCase())) {
      return NextResponse.json({ error: 'คำตอบที่ถูกต้องต้องเป็น A, B, C หรือ D เท่านั้น' }, { status: 400 });
    }

    const db = getDb();
    await db
      .update(quizQuestions)
      .set({
        questionText: questionText.trim(),
        choiceA: choiceA.trim(),
        choiceB: choiceB.trim(),
        choiceC: choiceC.trim(),
        choiceD: choiceD.trim(),
        correctAnswer: correctAnswer.toUpperCase(),
        explanation: explanation ? explanation.trim() : null
      })
      .where(eq(quizQuestions.id, questionId));

    return NextResponse.json({
      success: true,
      message: 'บันทึกการแก้ไขคำถามเรียบร้อยแล้ว',
      updated: {
        id: questionId,
        questionText,
        choiceA,
        choiceB,
        choiceC,
        choiceD,
        correctAnswer: correctAnswer.toUpperCase(),
        explanation
      }
    });
  } catch (error: any) {
    console.error('Error updating quiz question:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/quizzes/[id]/questions
// Teacher/Admin adds a new question to the quiz
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quizId } = await params;
    const isAdmin = await checkIsAdmin();
    const referer = request.headers.get('referer') || '';
    const isLocalOrAdminReferer = process.env.NODE_ENV !== 'production' && referer.includes('/admin');

    if (!isAdmin && !isLocalOrAdminReferer) {
      return NextResponse.json({ error: 'Unauthorized: Teacher/Admin privileges required' }, { status: 403 });
    }

    const body = await request.json();
    const { questionText, choiceA, choiceB, choiceC, choiceD, correctAnswer = 'A', explanation, imageUrl } = body;

    if (!questionText || !choiceA || !choiceB || !choiceC || !choiceD) {
      return NextResponse.json({ error: 'กรุณากรอกโจทย์และตัวเลือก ก-ง ให้ครบถ้วน' }, { status: 400 });
    }

    const validAnswers = ['A', 'B', 'C', 'D'];
    const chosenAnswer = validAnswers.includes(String(correctAnswer).toUpperCase())
      ? String(correctAnswer).toUpperCase()
      : 'A';

    const db = getDb();

    // Verify quiz exists
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, quizId));
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Determine next question number
    const existingQuestions = await db
      .select()
      .from(quizQuestions)
      .where(eq(quizQuestions.quizId, quizId))
      .orderBy(asc(quizQuestions.questionNumber));

    const nextNumber = existingQuestions.length + 1;
    const questionId = `q_${quizId}_${Date.now()}`;

    const newQuestion = {
      id: questionId,
      quizId,
      questionNumber: nextNumber,
      questionText: String(questionText).trim(),
      choiceA: String(choiceA).trim(),
      choiceB: String(choiceB).trim(),
      choiceC: String(choiceC).trim(),
      choiceD: String(choiceD).trim(),
      correctAnswer: chosenAnswer,
      explanation: explanation ? String(explanation).trim() : null,
      imageUrl: imageUrl ? String(imageUrl).trim() : null,
    };

    await db.insert(quizQuestions).values(newQuestion);

    // Update totalQuestions in quizzes table
    const updatedCount = nextNumber;
    await db.update(quizzes).set({ totalQuestions: updatedCount }).where(eq(quizzes.id, quizId));

    return NextResponse.json({
      success: true,
      message: 'เพิ่มข้อสอบใหม่เรียบร้อยแล้ว',
      question: newQuestion,
      totalQuestions: updatedCount
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating quiz question:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/quizzes/[id]/questions
// Teacher/Admin deletes a question from the quiz
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quizId } = await params;
    const isAdmin = await checkIsAdmin();
    const referer = request.headers.get('referer') || '';
    const isLocalOrAdminReferer = process.env.NODE_ENV !== 'production' && referer.includes('/admin');

    if (!isAdmin && !isLocalOrAdminReferer) {
      return NextResponse.json({ error: 'Unauthorized: Teacher/Admin privileges required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get('questionId');

    if (!questionId) {
      return NextResponse.json({ error: 'Missing questionId parameter' }, { status: 400 });
    }

    const db = getDb();

    // Delete question
    await db.delete(quizQuestions).where(eq(quizQuestions.id, questionId));

    // Re-fetch remaining questions and re-number them sequentially
    const remaining = await db
      .select()
      .from(quizQuestions)
      .where(eq(quizQuestions.quizId, quizId))
      .orderBy(asc(quizQuestions.questionNumber));

    for (let i = 0; i < remaining.length; i++) {
      if (remaining[i].questionNumber !== i + 1) {
        await db
          .update(quizQuestions)
          .set({ questionNumber: i + 1 })
          .where(eq(quizQuestions.id, remaining[i].id));
      }
    }

    // Update totalQuestions on quizzes table
    await db.update(quizzes).set({ totalQuestions: remaining.length }).where(eq(quizzes.id, quizId));

    return NextResponse.json({
      success: true,
      message: 'ลบข้อสอบเรียบร้อยแล้ว',
      totalQuestions: remaining.length
    });
  } catch (error: any) {
    console.error('Error deleting quiz question:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}


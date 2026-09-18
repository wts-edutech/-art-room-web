export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { quizzes, quizAttempts } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { checkIsAdmin } from '@/lib/api-auth';

function parseClassrooms(val: any): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try {
    let parsed = typeof val === 'string' ? JSON.parse(val) : val;
    if (typeof parsed === 'string') {
      parsed = JSON.parse(parsed);
    }
    if (Array.isArray(parsed)) return parsed;
  } catch {
    return [];
  }
  return [];
}

// GET /api/quizzes
// Fetches quizzes. If gradeLevel is provided, filters by grade.
// If classroom is provided, filters by targeted classrooms.
// If studentId is provided, attaches student's submission attempt (if any).
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gradeLevel = searchParams.get('gradeLevel'); // "ม.3" or "ม.4"
    const classroom = searchParams.get('classroom'); // e.g. "ม.3/1" or "3/1"
    const studentId = searchParams.get('studentId');
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const db = getDb();
    let allQuizzes = await db.select().from(quizzes).orderBy(quizzes.id);

    if (gradeLevel) {
      allQuizzes = allQuizzes.filter(q => q.gradeLevel === gradeLevel);
    }
    if (activeOnly) {
      allQuizzes = allQuizzes.filter(q => q.isActive);
    }

    // If student classroom is provided, check if quiz targets this classroom
    if (classroom) {
      const cleanStudentRoom = classroom.replace(/^ห้อง\s*/, '').trim();
      const studentNum = cleanStudentRoom.replace('ม.', '').trim();
      allQuizzes = allQuizzes.filter(q => {
        const targets = parseClassrooms(q.targetClassrooms);

        // If targetClassrooms is empty or null, quiz is open to all classrooms in this grade
        if (!targets || targets.length === 0) return true;

        // Check if student's room matches any of the targeted rooms
        return targets.some(target => {
          const cleanTarget = String(target).replace(/^ห้อง\s*/, '').trim();
          const targetNum = cleanTarget.replace('ม.', '').trim();
          return (
            cleanTarget === cleanStudentRoom ||
            cleanTarget === `ม.${cleanStudentRoom}` ||
            targetNum === studentNum
          );
        });
      });
    }

    // If studentId provided, fetch attempts for this student
    let userAttempts: any[] = [];
    if (studentId) {
      userAttempts = await db.select().from(quizAttempts).where(eq(quizAttempts.studentId, studentId));
    }

    const result = allQuizzes.map(q => {
      const attempt = userAttempts.find(a => a.quizId === q.id);
      return {
        ...q,
        targetClassrooms: parseClassrooms(q.targetClassrooms),
        userAttempt: attempt ? {
          id: attempt.id,
          score: attempt.score,
          totalQuestions: attempt.totalQuestions,
          infractionsCount: attempt.infractionsCount,
          submittedAt: attempt.submittedAt,
          status: attempt.status
        } : null
      };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH /api/quizzes
// Admin toggles active status of a quiz and/or sets targeted classrooms
// Body: { id: "quiz_m3_pretest", isActive?: boolean, targetClassrooms?: string[] }
export async function PATCH(request: Request) {
  try {
    const isAdmin = await checkIsAdmin();
    const referer = request.headers.get('referer') || '';
    const isLocalOrAdminReferer = process.env.NODE_ENV !== 'production' && referer.includes('/admin');

    if (!isAdmin && !isLocalOrAdminReferer) {
      return NextResponse.json({ error: 'Unauthorized: Teacher/Admin privileges required' }, { status: 403 });
    }

    const body = await request.json();
    const { id, isActive, targetClassrooms } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing required quiz ID' }, { status: 400 });
    }

    const db = getDb();
    const updateData: any = {};

    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive);
    }

    if (targetClassrooms !== undefined) {
      updateData.targetClassrooms = Array.isArray(targetClassrooms) && targetClassrooms.length > 0
        ? targetClassrooms
        : null;
    }

    await db.update(quizzes).set(updateData).where(eq(quizzes.id, id));

    return NextResponse.json({ success: true, id, ...updateData });
  } catch (error: any) {
    console.error('Error updating quiz status:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/quizzes
// Teacher/Admin creates a new quiz (e.g. formative test during class, score-collecting quiz, unit test)
export async function POST(request: Request) {
  try {
    const isAdmin = await checkIsAdmin();
    const referer = request.headers.get('referer') || '';
    const isLocalOrAdminReferer = process.env.NODE_ENV !== 'production' && referer.includes('/admin');

    if (!isAdmin && !isLocalOrAdminReferer) {
      return NextResponse.json({ error: 'Unauthorized: Teacher/Admin privileges required' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      code,
      gradeLevel,
      description,
      maxScore,
      timeLimitMinutes,
      isActive = true,
      targetClassrooms = [],
      questions = []
    } = body;

    if (!title || !code || !gradeLevel) {
      return NextResponse.json({ error: 'กรุณากรอกชื่อแบบทดสอบ รหัสวิชา และระดับชั้นให้ครบถ้วน' }, { status: 400 });
    }

    const db = getDb();
    const quizId = `quiz_${Date.now()}`;
    const cleanCode = String(code).trim();
    const cleanTitle = String(title).trim();
    const cleanGrade = String(gradeLevel).trim();
    const parsedQuestions = Array.isArray(questions) ? questions : [];
    const totalQ = parsedQuestions.length > 0 ? parsedQuestions.length : (Number(body.totalQuestions) || 10);
    const scoreVal = Number(maxScore) || totalQ;
    const timeVal = Number(timeLimitMinutes) || 15;

    const newQuiz = {
      id: quizId,
      code: cleanCode,
      title: cleanTitle,
      gradeLevel: cleanGrade,
      description: description ? String(description).trim() : `แบบทดสอบเก็บคะแนน ${cleanCode} ${cleanGrade}`,
      totalQuestions: totalQ,
      maxScore: scoreVal,
      timeLimitMinutes: timeVal,
      isActive: Boolean(isActive),
      targetClassrooms: Array.isArray(targetClassrooms) && targetClassrooms.length > 0 ? targetClassrooms : null,
    };

    await db.insert(quizzes).values(newQuiz);

    // If initial questions provided, insert them into quiz_questions
    if (parsedQuestions.length > 0) {
      const { quizQuestions } = await import('@/db/schema');
      for (let i = 0; i < parsedQuestions.length; i++) {
        const q = parsedQuestions[i];
        if (q.questionText && q.choiceA && q.choiceB && q.choiceC && q.choiceD) {
          await db.insert(quizQuestions).values({
            id: `q_${quizId}_${i + 1}`,
            quizId,
            questionNumber: i + 1,
            questionText: String(q.questionText).trim(),
            choiceA: String(q.choiceA).trim(),
            choiceB: String(q.choiceB).trim(),
            choiceC: String(q.choiceC).trim(),
            choiceD: String(q.choiceD).trim(),
            correctAnswer: (q.correctAnswer || 'A').toUpperCase(),
            explanation: q.explanation ? String(q.explanation).trim() : null,
            imageUrl: q.imageUrl || null,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'สร้างแบบทดสอบเรียบร้อยแล้ว',
      quiz: {
        ...newQuiz,
        targetClassrooms: Array.isArray(targetClassrooms) ? targetClassrooms : []
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating quiz:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/quizzes
// Teacher/Admin updates quiz general information
export async function PUT(request: Request) {
  try {
    const isAdmin = await checkIsAdmin();
    const referer = request.headers.get('referer') || '';
    const isLocalOrAdminReferer = process.env.NODE_ENV !== 'production' && referer.includes('/admin');

    if (!isAdmin && !isLocalOrAdminReferer) {
      return NextResponse.json({ error: 'Unauthorized: Teacher/Admin privileges required' }, { status: 403 });
    }

    const body = await request.json();
    const { id, title, code, gradeLevel, description, maxScore, timeLimitMinutes, totalQuestions, targetClassrooms } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing quiz ID' }, { status: 400 });
    }

    const db = getDb();
    const updateData: any = {};

    if (title !== undefined) updateData.title = String(title).trim();
    if (code !== undefined) updateData.code = String(code).trim();
    if (gradeLevel !== undefined) updateData.gradeLevel = String(gradeLevel).trim();
    if (description !== undefined) updateData.description = String(description).trim();
    if (maxScore !== undefined) updateData.maxScore = Number(maxScore);
    if (timeLimitMinutes !== undefined) updateData.timeLimitMinutes = Number(timeLimitMinutes);
    if (totalQuestions !== undefined) updateData.totalQuestions = Number(totalQuestions);
    if (targetClassrooms !== undefined) {
      updateData.targetClassrooms = Array.isArray(targetClassrooms) && targetClassrooms.length > 0 ? targetClassrooms : null;
    }

    await db.update(quizzes).set(updateData).where(eq(quizzes.id, id));

    return NextResponse.json({ success: true, message: 'แก้ไขข้อมูลแบบทดสอบเรียบร้อยแล้ว', id, ...updateData });
  } catch (error: any) {
    console.error('Error updating quiz:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/quizzes
// Teacher/Admin deletes a quiz and its questions
export async function DELETE(request: Request) {
  try {
    const isAdmin = await checkIsAdmin();
    const referer = request.headers.get('referer') || '';
    const isLocalOrAdminReferer = process.env.NODE_ENV !== 'production' && referer.includes('/admin');

    if (!isAdmin && !isLocalOrAdminReferer) {
      return NextResponse.json({ error: 'Unauthorized: Teacher/Admin privileges required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing quiz ID' }, { status: 400 });
    }

    const db = getDb();
    const { quizQuestions } = await import('@/db/schema');

    // Delete associated questions and attempts, then quiz
    await db.delete(quizQuestions).where(eq(quizQuestions.quizId, id));
    await db.delete(quizAttempts).where(eq(quizAttempts.quizId, id));
    await db.delete(quizzes).where(eq(quizzes.id, id));

    return NextResponse.json({ success: true, message: 'ลบแบบทดสอบเรียบร้อยแล้ว', id });
  } catch (error: any) {
    console.error('Error deleting quiz:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}


export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import {
  students,
  assignments,
  submissions,
  quizzes,
  quizAttempts,
  subjects,
  classrooms,
} from '@/db/schema';
import { checkIsAdmin } from '@/lib/api-auth';
import { asc, desc } from 'drizzle-orm';

export async function GET() {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();

    // Fetch lightweight fields in parallel (explicitly excluding heavy base64 image columns)
    const [
      allClassrooms,
      allSubjects,
      allAssignments,
      allQuizzes,
      allStudents,
      allSubmissions,
      allQuizAttempts,
    ] = await Promise.all([
      db.select().from(classrooms).orderBy(asc(classrooms.name)),
      db.select().from(subjects).orderBy(asc(subjects.code)),
      db
        .select({
          id: assignments.id,
          title: assignments.title,
          subjectId: assignments.subjectId,
          classrooms: assignments.classrooms,
          targetStudents: assignments.targetStudents,
          maxScore: assignments.maxScore,
          dueDate: assignments.dueDate,
          isActive: assignments.isActive,
          createdAt: assignments.createdAt,
        })
        .from(assignments)
        .orderBy(asc(assignments.createdAt)),
      db
        .select({
          id: quizzes.id,
          code: quizzes.code,
          title: quizzes.title,
          gradeLevel: quizzes.gradeLevel,
          totalQuestions: quizzes.totalQuestions,
          maxScore: quizzes.maxScore,
          isActive: quizzes.isActive,
          targetClassrooms: quizzes.targetClassrooms,
          createdAt: quizzes.createdAt,
        })
        .from(quizzes)
        .orderBy(asc(quizzes.createdAt)),
      db
        .select({
          id: students.id,
          name: students.name,
          classroom: students.classroom,
          gradeLevel: students.gradeLevel,
          studentNumber: students.studentNumber,
        })
        .from(students)
        .orderBy(asc(students.studentNumber), asc(students.id)),
      db
        .select({
          id: submissions.id,
          assignmentId: submissions.assignmentId,
          studentId: submissions.studentId,
          classroom: submissions.classroom,
          score: submissions.score,
          status: submissions.status,
          isLate: submissions.isLate,
          submittedAt: submissions.submittedAt,
          updatedAt: submissions.updatedAt,
        })
        .from(submissions)
        .orderBy(desc(submissions.submittedAt)),
      db
        .select({
          id: quizAttempts.id,
          quizId: quizAttempts.quizId,
          studentId: quizAttempts.studentId,
          classroom: quizAttempts.classroom,
          score: quizAttempts.score,
          totalQuestions: quizAttempts.totalQuestions,
          submittedAt: quizAttempts.submittedAt,
          status: quizAttempts.status,
        })
        .from(quizAttempts)
        .orderBy(desc(quizAttempts.submittedAt)),
    ]);

    return NextResponse.json(
      {
        classrooms: allClassrooms || [],
        subjects: allSubjects || [],
        assignments: allAssignments || [],
        quizzes: allQuizzes || [],
        students: allStudents || [],
        submissions: allSubmissions || [],
        quizAttempts: allQuizAttempts || [],
        serverTime: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      }
    );
  } catch (error: any) {
    console.error('GET /api/admin/scorebook error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to load scorebook data' },
      { status: 500 }
    );
  }
}

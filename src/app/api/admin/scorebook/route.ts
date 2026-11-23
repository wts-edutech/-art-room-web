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

    // Fetch only the minimal columns needed for the assignment scorebook
    const [
      allSubjects,
      allAssignments,
      allStudents,
      allSubmissions,
    ] = await Promise.all([
      db
        .select({
          id: subjects.id,
          code: subjects.code,
          name: subjects.name,
          gradeLevel: subjects.gradeLevel,
        })
        .from(subjects)
        .orderBy(asc(subjects.code)),
      db
        .select({
          id: assignments.id,
          title: assignments.title,
          subjectId: assignments.subjectId,
          classrooms: assignments.classrooms,
          targetStudents: assignments.targetStudents,
          maxScore: assignments.maxScore,
          isActive: assignments.isActive,
          createdAt: assignments.createdAt,
        })
        .from(assignments)
        .orderBy(asc(assignments.createdAt)),
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
          submittedAt: submissions.submittedAt,
        })
        .from(submissions)
        .orderBy(desc(submissions.submittedAt)),
    ]);

    return NextResponse.json(
      {
        subjects: allSubjects || [],
        assignments: allAssignments || [],
        students: allStudents || [],
        submissions: allSubmissions || [],
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

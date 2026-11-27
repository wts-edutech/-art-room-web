export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import {
  students,
  assignments,
  submissions,
  subjects,
} from '@/db/schema';
import { checkIsAdmin } from '@/lib/api-auth';
import { asc, desc } from 'drizzle-orm';

function parseJsonArray(val: unknown): string[] {
  let cur: unknown = val;
  for (let i = 0; i < 3; i++) {
    if (Array.isArray(cur)) return cur.map((v) => String(v).trim()).filter(Boolean);
    if (typeof cur === 'string') {
      const trimmed = cur.trim();
      if (trimmed.startsWith('[') || trimmed.startsWith('"')) {
        try {
          cur = JSON.parse(trimmed);
          continue;
        } catch {
          break;
        }
      }
    }
    break;
  }
  return [];
}

function extractGradePrefix(roomOrGrade?: string | null): string {
  if (!roomOrGrade) return '';
  const m = roomOrGrade.match(/ม\.?\s*([1-6])/);
  return m ? `ม.${m[1]}` : roomOrGrade.trim();
}

export async function GET(request: Request) {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const submissionsOnly = searchParams.get('submissionsOnly') === '1';
    const includeAllStudents = searchParams.get('allStudents') === '1';

    const db = getDb();

    // Lightweight refresh mode: only fetch submissions (avoids re-scanning ~2,900 students every refresh)
    if (submissionsOnly) {
      const allSubmissions = await db
        .select({
          id: submissions.id,
          assignmentId: submissions.assignmentId,
          studentId: submissions.studentId,
          studentName: submissions.studentName,
          classroom: submissions.classroom,
          score: submissions.score,
          status: submissions.status,
          submittedAt: submissions.submittedAt,
        })
        .from(submissions)
        .orderBy(desc(submissions.submittedAt));

      return NextResponse.json(
        {
          submissions: allSubmissions || [],
          submissionsOnly: true,
          serverTime: new Date().toISOString(),
        },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          },
        }
      );
    }

    // Fetch minimal columns needed for the assignment scorebook
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
          dueDate: assignments.dueDate,
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
          studentName: submissions.studentName,
          classroom: submissions.classroom,
          score: submissions.score,
          status: submissions.status,
          submittedAt: submissions.submittedAt,
        })
        .from(submissions)
        .orderBy(desc(submissions.submittedAt)),
    ]);

    const safeSubjects = allSubjects || [];
    const safeAssignments = allAssignments || [];
    const safeStudents = allStudents || [];
    const safeSubmissions = allSubmissions || [];

    // Filter student payload to taught classrooms/grades (~500 rows vs 2,879 school-wide rows -> 5x faster download)
    let filteredStudents = safeStudents;
    if (!includeAllStudents && safeAssignments.length > 0) {
      const subjectMap = new Map(safeSubjects.map((s) => [s.id, s]));
      const taughtRooms = new Set<string>();
      const taughtGrades = new Set<string>();
      let hasUnscopedAssignment = false;

      for (const a of safeAssignments) {
        if (a.isActive === false) continue;
        const rooms = parseJsonArray(a.classrooms);
        if (rooms.length > 0) {
          for (const r of rooms) taughtRooms.add(r);
        } else {
          const subj = subjectMap.get(a.subjectId);
          const g = extractGradePrefix(subj?.gradeLevel);
          if (g) taughtGrades.add(g);
          else hasUnscopedAssignment = true;
        }
      }

      if (!hasUnscopedAssignment && (taughtRooms.size > 0 || taughtGrades.size > 0)) {
        const matched = safeStudents.filter((st) => {
          const room = (st.classroom || '').trim();
          if (room && taughtRooms.has(room)) return true;
          if (taughtGrades.size > 0) {
            const g = extractGradePrefix(room || st.gradeLevel);
            if (g && taughtGrades.has(g)) return true;
          }
          return false;
        });
        if (matched.length > 0) {
          filteredStudents = matched;
        }
      }
    }

    const activeAssIds = new Set(safeAssignments.map((a) => a.id));
    const filteredSubmissions =
      activeAssIds.size > 0
        ? safeSubmissions.filter((s) => activeAssIds.has(s.assignmentId))
        : safeSubmissions;

    return NextResponse.json(
      {
        subjects: safeSubjects,
        assignments: safeAssignments,
        students: filteredStudents,
        submissions: filteredSubmissions,
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

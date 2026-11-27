export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { submissions, assignments, students, quizzes, quizAttempts } from '@/db/schema';
import { desc, inArray, sql } from 'drizzle-orm';
import { checkIsAdmin } from '@/lib/api-auth';
import { buildAnnotatedUrls } from '@/lib/submission-annotations';

// Helper to safely parse images whether raw array, single-stringified, or double-stringified JSON
function parseImageArray(raw: any): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter((x): x is string => typeof x === 'string');
  if (typeof raw !== 'string') return [];
  let val: any = raw.trim();
  for (let i = 0; i < 5 && typeof val === 'string'; i++) {
    try {
      const next = JSON.parse(val);
      if (next === val) break;
      val = next;
    } catch {
      break;
    }
  }
  return Array.isArray(val) ? val.filter((x): x is string => typeof x === 'string') : [];
}

export async function GET(request: Request) {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json({ error: 'Unauthorized — สำหรับครูผู้สอนเท่านั้น' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const typeFilter = searchParams.get('type') || 'all'; // 'all' | 'assignment' | 'quiz'
    const classroomFilter = searchParams.get('classroom') || 'all';
    const statusFilter = searchParams.get('status') || 'all';
    const searchQuery = (searchParams.get('q') || '').trim().toLowerCase();

    const db = getDb();

    const subSelectFields = {
      id: submissions.id,
      assignmentId: submissions.assignmentId,
      studentId: submissions.studentId,
      studentName: submissions.studentName,
      classroom: submissions.classroom,
      imageCount: sql<number>`CASE 
        WHEN ${submissions.images} IS NULL THEN 0 
        WHEN ${submissions.images} LIKE '%blob:%' OR ${submissions.images} LIKE '%/api/submissions/image%' THEN 0
        WHEN json_valid(${submissions.images}) AND json_type(${submissions.images}) = 'array' THEN json_array_length(${submissions.images})
        WHEN json_valid(${submissions.images}) AND json_type(${submissions.images}) = 'text' AND json_valid(json_extract(${submissions.images}, '$')) THEN json_array_length(json_extract(${submissions.images}, '$'))
        WHEN length(${submissions.images}) > 5 THEN 1
        ELSE 0
      END`,
      annotatedFlags: sql<string>`CASE
        WHEN ${submissions.annotatedImages} IS NULL OR length(${submissions.annotatedImages}) <= 2 THEN ''
        WHEN json_valid(${submissions.annotatedImages}) AND json_type(${submissions.annotatedImages}) = 'array' THEN
          json_array(
            CASE WHEN length(COALESCE(json_extract(${submissions.annotatedImages}, '$[0]'), '')) > 0 THEN '1' ELSE '' END,
            CASE WHEN length(COALESCE(json_extract(${submissions.annotatedImages}, '$[1]'), '')) > 0 THEN '1' ELSE '' END,
            CASE WHEN length(COALESCE(json_extract(${submissions.annotatedImages}, '$[2]'), '')) > 0 THEN '1' ELSE '' END
          )
        WHEN json_valid(${submissions.annotatedImages}) AND json_type(${submissions.annotatedImages}) = 'text' AND json_valid(json_extract(${submissions.annotatedImages}, '$')) THEN
          json_array(
            CASE WHEN length(COALESCE(json_extract(json_extract(${submissions.annotatedImages}, '$'), '$[0]'), '')) > 0 THEN '1' ELSE '' END,
            CASE WHEN length(COALESCE(json_extract(json_extract(${submissions.annotatedImages}, '$'), '$[1]'), '')) > 0 THEN '1' ELSE '' END,
            CASE WHEN length(COALESCE(json_extract(json_extract(${submissions.annotatedImages}, '$'), '$[2]'), '')) > 0 THEN '1' ELSE '' END
          )
        ELSE '["1"]'
      END`,
      hasImage: sql<number>`CASE 
        WHEN ${submissions.images} IS NOT NULL AND length(${submissions.images}) > 2 AND ${submissions.images} NOT LIKE '%blob:%' AND ${submissions.images} NOT LIKE '%/api/submissions/image%' THEN 1 
        WHEN ${submissions.imageUrl} IS NOT NULL AND length(${submissions.imageUrl}) > 0 AND ${submissions.imageUrl} NOT LIKE '%/api/submissions/image%' AND ${submissions.imageUrl} NOT LIKE '%blob:%' THEN 1 
        ELSE 0 
      END`,
      hasFile: sql<number>`CASE WHEN ${submissions.fileUrl} IS NOT NULL AND length(${submissions.fileUrl}) > 0 THEN 1 ELSE 0 END`,
      fileName: submissions.fileName,
      externalLink: submissions.externalLink,
      concept: submissions.concept,
      score: submissions.score,
      feedback: submissions.feedback,
      status: submissions.status,
      isLate: submissions.isLate,
      submittedAt: submissions.submittedAt,
      updatedAt: submissions.updatedAt,
    };

    // 1. Fetch raw datasets in parallel (select light columns for students, assignments & submissions)
    const [subList, assList, studList, quizList, attemptList] = await Promise.all([
      db.select(subSelectFields).from(submissions).orderBy(desc(submissions.submittedAt)),
      db.select({ id: assignments.id, title: assignments.title, subjectId: assignments.subjectId, maxScore: assignments.maxScore }).from(assignments),
      db.select({ id: students.id, studentNumber: students.studentNumber, classroom: students.classroom }).from(students),
      db.select().from(quizzes),
      db.select().from(quizAttempts).orderBy(desc(quizAttempts.submittedAt)),
    ]);

    const assignmentMap = new Map(assList.map(a => [a.id, a]));
    const studentMap = new Map(studList.map(s => [s.id, s]));
    const quizMap = new Map(quizList.map(q => [q.id, q]));

    // 2. Normalize assignment submissions into unified schema
    const normalizedSubmissions = (subList || []).map(sub => {
      const ass = assignmentMap.get(sub.assignmentId);
      const student = studentMap.get(sub.studentId);
      const count = Math.max(Number(sub.imageCount) || 0, sub.hasImage ? 1 : 0);
      const ver = sub.updatedAt ? `&v=${encodeURIComponent(sub.updatedAt)}` : '';
      let imagesList: string[] = [];
      if (count > 0) {
        imagesList = Array.from({ length: count }, (_, idx) => `/api/submissions/image?id=${encodeURIComponent(sub.id)}&index=${idx}${ver}`);
      }

      return {
        id: sub.id,
        type: 'assignment' as const,
        itemId: sub.assignmentId,
        itemTitle: ass?.title || 'งานศิลปะ',
        subjectName: ass?.subjectId || 'ศิลปะ',
        studentId: sub.studentId,
        studentName: sub.studentName,
        studentAvatar: student?.avatar || null,
        studentNumber: student?.studentNumber ?? null,
        classroom: sub.classroom,
        score: sub.score,
        maxScore: ass?.maxScore ?? 10,
        status: sub.status || 'pending', // 'pending' | 'graded' | 'resubmit'
        isLate: Boolean(sub.isLate),
        imageUrl: imagesList.length > 0 ? imagesList[0] : (sub.hasImage ? `/api/submissions/image?id=${encodeURIComponent(sub.id)}` : null),
        images: imagesList,
        annotatedImages: buildAnnotatedUrls(sub.id, sub.annotatedFlags, imagesList.length, sub.updatedAt),
        fileUrl: sub.hasFile ? `/api/submissions/image?id=${encodeURIComponent(sub.id)}&type=file` : null,
        fileName: sub.fileName || null,
        externalLink: sub.externalLink || null,
        concept: sub.concept || null,
        feedback: sub.feedback || null,
        submittedAt: sub.submittedAt,
        updatedAt: sub.updatedAt,
      };
    });

    // 3. Normalize quiz attempts into unified schema
    const normalizedQuizzes = (attemptList || []).map(att => {
      const quiz = quizMap.get(att.quizId);
      const student = studentMap.get(att.studentId);
      return {
        id: att.id,
        type: 'quiz' as const,
        itemId: att.quizId,
        itemTitle: quiz?.title || 'แบบทดสอบ',
        subjectName: quiz?.code || quiz?.gradeLevel || 'ศิลปะ',
        studentId: att.studentId,
        studentName: att.studentName,
        studentAvatar: student?.avatar || null,
        studentNumber: student?.studentNumber ?? null,
        classroom: att.classroom,
        score: att.score,
        maxScore: att.totalQuestions || quiz?.totalQuestions || 20,
        status: 'completed',
        isLate: false,
        imageUrl: null,
        fileUrl: null,
        fileName: null,
        externalLink: null,
        concept: `ตอบครบ ${att.totalQuestions} ข้อ • สถิติการออกจากจอ ${att.infractionsCount || 0} ครั้ง`,
        feedback: null,
        infractionsCount: att.infractionsCount || 0,
        answers: att.answers ? (typeof att.answers === 'string' ? JSON.parse(att.answers) : att.answers) : null,
        submittedAt: att.submittedAt,
        updatedAt: null,
      };
    });

    // 4. Combine and apply filters
    let combined = [];
    if (typeFilter === 'assignment') {
      combined = normalizedSubmissions;
    } else if (typeFilter === 'quiz') {
      combined = normalizedQuizzes;
    } else {
      combined = [...normalizedSubmissions, ...normalizedQuizzes];
    }

    // Sort by submittedAt descending (newest first)
    combined.sort((a, b) => {
      const timeA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
      const timeB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
      return timeB - timeA;
    });

    // Filter by classroom
    if (classroomFilter && classroomFilter !== 'all') {
      combined = combined.filter(item => item.classroom === classroomFilter);
    }

    // Filter by status
    if (statusFilter && statusFilter !== 'all') {
      if (statusFilter === 'pending') {
        combined = combined.filter(item => item.status === 'pending');
      } else if (statusFilter === 'graded') {
        combined = combined.filter(item => item.status === 'graded');
      } else if (statusFilter === 'resubmit') {
        combined = combined.filter(item => item.status === 'resubmit');
      } else if (statusFilter === 'completed') {
        combined = combined.filter(item => item.status === 'completed');
      }
    }

    // Filter by search query
    if (searchQuery) {
      combined = combined.filter(item => {
        const matchName = item.studentName?.toLowerCase().includes(searchQuery);
        const matchId = item.studentId?.toLowerCase().includes(searchQuery);
        const matchTitle = item.itemTitle?.toLowerCase().includes(searchQuery);
        const matchClass = item.classroom?.toLowerCase().includes(searchQuery);
        return matchName || matchId || matchTitle || matchClass;
      });
    }

    // 5. Calculate overview statistics
    const stats = {
      totalItems: (subList?.length || 0) + (attemptList?.length || 0),
      totalAssignments: subList?.length || 0,
      totalQuizzes: attemptList?.length || 0,
      pendingGrading: (subList || []).filter(s => s.status === 'pending' || (s.score === null && s.status !== 'resubmit')).length,
      gradedCount: (subList || []).filter(s => s.status === 'graded' || (s.score !== null && s.score !== undefined)).length,
      resubmitCount: (subList || []).filter(s => s.status === 'resubmit').length,
    };

    // Extract unique classrooms for filter dropdown
    const allClassrooms = Array.from(
      new Set([
        ...(subList || []).map(s => s.classroom),
        ...(attemptList || []).map(a => a.classroom),
        ...studList.map(s => s.classroom).filter(Boolean)
      ])
    ).filter(Boolean).sort((a: any, b: any) => a.localeCompare(b, 'th', { numeric: true }));

    return NextResponse.json({
      success: true,
      data: combined,
      stats,
      classrooms: allClassrooms,
    });
  } catch (error: any) {
    console.error("GET /api/submissions/all error:", error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch unified submissions' }, { status: 500 });
  }
}

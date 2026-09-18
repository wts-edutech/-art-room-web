export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { submissions, assignments, students, subjects } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { checkIsAdmin } from '@/lib/api-auth';

export async function GET(request: Request) {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('assignmentId');
    const classroom = searchParams.get('classroom');

    if (!assignmentId) {
      return NextResponse.json({ error: 'assignmentId is required' }, { status: 400 });
    }

    const db = getDb();
    const assignment = await db.select().from(assignments).where(eq(assignments.id, assignmentId)).get();
    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    const subject = await db.select().from(subjects).where(eq(subjects.id, assignment.subjectId)).get();

    // Get all students for this classroom (or all classrooms assigned)
    let allStudents = await db.select().from(students).orderBy(students.id);
    if (classroom) {
      allStudents = allStudents.filter(s => s.classroom === classroom);
    }

    // Get all submissions for this assignment
    let allSubs = await db.select().from(submissions).where(eq(submissions.assignmentId, assignmentId));
    if (classroom) {
      allSubs = allSubs.filter(s => s.classroom === classroom);
    }

    const subMap = new Map(allSubs.map(s => [s.studentId, s]));

    // Sort students by studentNumber or id
    allStudents.sort((a, b) => {
      const numA = a.studentNumber || 9999;
      const numB = b.studentNumber || 9999;
      if (numA !== numB) return numA - numB;
      return a.id.localeCompare(b.id, 'th', { numeric: true });
    });

    // Build comprehensive report rows
    const reportData = allStudents.map((st, index) => {
      const sub = subMap.get(st.id);
      return {
        studentNumber: st.studentNumber || (index + 1),
        orderNo: index + 1,
        studentId: st.id,
        studentName: st.name,
        classroom: st.classroom || classroom || '-',
        assignmentTitle: assignment.title,
        maxScore: assignment.maxScore || 10,
        status: sub 
          ? (sub.status === 'graded' ? 'ตรวจแล้ว' : sub.status === 'resubmit' ? 'ให้ส่งแก้ไข' : 'ส่งแล้ว รอตรวจ') 
          : 'ยังไม่ส่ง',
        isSubmitted: !!sub,
        isLate: sub ? (sub.isLate ? 'ส่งช้ากว่ากำหนด' : 'ตรงเวลา') : '-',
        submittedAt: sub ? (sub.submittedAt ? new Date(sub.submittedAt).toLocaleString('th-TH') : '-') : '-',
        score: sub && sub.score !== null ? sub.score : (sub ? 'รอตรวจ' : 0),
        feedback: sub && sub.feedback ? sub.feedback : '-',
        hasImage: sub && sub.imageUrl ? 'มีภาพ' : 'ไม่มี',
        hasLink: sub && sub.externalLink ? sub.externalLink : '-',
      };
    });

    return NextResponse.json({
      assignment,
      subject,
      classroom: classroom || 'ทุกห้อง',
      totalStudents: allStudents.length,
      submittedCount: allSubs.length,
      reportData,
    });
  } catch (error: any) {
    console.error("GET /api/submissions/export error:", error);
    return NextResponse.json({ error: error?.message || 'Failed to export report' }, { status: 500 });
  }
}

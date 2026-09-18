export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { students } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { checkIsAdmin } from '@/lib/api-auth';
import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/auth-utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const classroom = searchParams.get('classroom');

    const db = getDb();
    const { submissions, quizAttempts } = await import('@/db/schema');

    if (id) {
      const student = await db.select().from(students).where(eq(students.id, id)).get();
      if (!student) return NextResponse.json(null);

      const [userSubs, userQuizzes] = await Promise.all([
        db.select().from(submissions).where(eq(submissions.studentId, id)),
        db.select().from(quizAttempts).where(eq(quizAttempts.studentId, id)),
      ]);

      const dates = [
        student.lastLoginAt,
        ...userSubs.map(s => s.submittedAt),
        ...userQuizzes.map(q => q.submittedAt)
      ].filter(Boolean) as string[];
      dates.sort().reverse();

      return NextResponse.json({
        ...student,
        loginCount: student.loginCount || 0,
        lastLoginAt: student.lastLoginAt || null,
        submissionsCount: userSubs.length,
        quizzesCount: userQuizzes.length,
        lastActiveAt: dates[0] || null,
      });
    }

    const [all, allSubmissions, allQuizAttempts] = await Promise.all([
      db.select().from(students).orderBy(students.id),
      db.select({ studentId: submissions.studentId, submittedAt: submissions.submittedAt }).from(submissions),
      db.select({ studentId: quizAttempts.studentId, submittedAt: quizAttempts.submittedAt }).from(quizAttempts),
    ]);

    // Build fast lookup maps for submissions and quizzes
    const subMap = new Map<string, { count: number; lastAt: string | null }>();
    for (const sub of allSubmissions) {
      if (!sub.studentId) continue;
      const current = subMap.get(sub.studentId) || { count: 0, lastAt: null };
      const latest = !current.lastAt || (sub.submittedAt && sub.submittedAt > current.lastAt) ? sub.submittedAt : current.lastAt;
      subMap.set(sub.studentId, { count: current.count + 1, lastAt: latest });
    }

    const quizMap = new Map<string, { count: number; lastAt: string | null }>();
    for (const qa of allQuizAttempts) {
      if (!qa.studentId) continue;
      const current = quizMap.get(qa.studentId) || { count: 0, lastAt: null };
      const latest = !current.lastAt || (qa.submittedAt && qa.submittedAt > current.lastAt) ? qa.submittedAt : current.lastAt;
      quizMap.set(qa.studentId, { count: current.count + 1, lastAt: latest });
    }

    let list = all || [];
    if (classroom) {
      list = list.filter(s => s.classroom === classroom);
    }

    const result = list.map(s => {
      const subInfo = subMap.get(s.id);
      const quizInfo = quizMap.get(s.id);
      const subCount = subInfo?.count || 0;
      const quizCount = quizInfo?.count || 0;

      const dates = [s.lastLoginAt, subInfo?.lastAt, quizInfo?.lastAt].filter(Boolean) as string[];
      dates.sort().reverse();
      const lastActiveAt = dates[0] || null;

      return {
        ...s,
        loginCount: s.loginCount || 0,
        lastLoginAt: s.lastLoginAt || null,
        submissionsCount: subCount,
        quizzesCount: quizCount,
        lastActiveAt,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/students error:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    let id = '';
    let name = '';
    let classroom = '';
    let gradeLevel = '';
    let academicYearId = '';
    let studentNumber: number | null = null;

    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await request.json().catch(() => ({}));
      id = body.id;
      name = body.name;
      classroom = body.classroom || '';
      gradeLevel = body.gradeLevel || '';
      academicYearId = body.academicYearId || '';
      if (body.studentNumber !== undefined && body.studentNumber !== '' && body.studentNumber !== null) {
        studentNumber = Number(body.studentNumber) || null;
      }
    } else {
      const formData = await request.formData().catch(() => null);
      if (formData) {
        id = (formData.get('id') as string) || '';
        name = (formData.get('name') as string) || '';
        classroom = (formData.get('classroom') as string) || '';
        gradeLevel = (formData.get('gradeLevel') as string) || '';
        academicYearId = (formData.get('academicYearId') as string) || '';
        const numVal = formData.get('studentNumber');
        if (numVal) {
          studentNumber = Number(numVal) || null;
        }
      }
    }

    id = String(id || '').trim();
    name = String(name || '').trim();

    const isAdmin = await checkIsAdmin();
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;
    const session = sessionToken ? await verifySessionToken(sessionToken) : null;
    const isSelfStudent = session && session.role === 'student' && session.userId === id;

    if (!isAdmin && !isSelfStudent) {
      return NextResponse.json({ error: 'Unauthorized — สำหรับผู้ดูแลระบบหรือเจ้าของบัญชีเท่านั้น' }, { status: 401 });
    }
    classroom = String(classroom || '').trim();
    gradeLevel = String(gradeLevel || '').trim();
    if (!gradeLevel && classroom) {
      const match = classroom.match(/^(ม\.\d+)/i);
      if (match) gradeLevel = match[1];
    }

    if (!id || !name) {
      return NextResponse.json({ error: 'กรุณากรอกทั้งรหัสนักเรียนและชื่อ-นามสกุล' }, { status: 400 });
    }

    const db = getDb();

    // Check if student exists, if so update, else insert
    const existing = await db.select().from(students).where(eq(students.id, id)).get();
    if (existing) {
      const updateData: any = { name };
      if (classroom) updateData.classroom = classroom;
      if (gradeLevel) updateData.gradeLevel = gradeLevel;
      if (academicYearId) updateData.academicYearId = academicYearId;
      if (studentNumber !== null) updateData.studentNumber = studentNumber;
      await db.update(students).set(updateData).where(eq(students.id, id));
    } else {
      await db.insert(students).values({ 
        id, 
        name, 
        classroom: classroom || null, 
        gradeLevel: gradeLevel || null, 
        studentNumber: studentNumber || null,
        academicYearId: academicYearId || null 
      });
    }

    return NextResponse.json({ id, name, classroom, gradeLevel, studentNumber, success: true }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/students error:", error);
    return NextResponse.json({ error: error?.message || 'Failed to save student' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json({ error: 'Unauthorized — สำหรับผู้ดูแลระบบเท่านั้น' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const id = searchParams.get('id');

    const db = getDb();

    if (action === 'deleteAll') {
      await db.delete(students);
      return NextResponse.json({ success: true, message: 'All students deleted' });
    }

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await db.delete(students).where(eq(students.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/students error:", error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const isAdmin = await checkIsAdmin();
    const referer = request.headers.get('referer') || '';
    const isLocalOrAdminReferer = process.env.NODE_ENV !== 'production' && referer.includes('/admin');

    if (!isAdmin && !isLocalOrAdminReferer) {
      return NextResponse.json({ error: 'Unauthorized — สำหรับผู้ดูแลระบบเท่านั้น' }, { status: 401 });
    }

    const body = await request.json();
    const { id, action } = body;

    if (!id) {
      return NextResponse.json({ error: 'กรุณาระบุรหัสนักเรียน' }, { status: 400 });
    }

    const db = getDb();

    if (action === 'resetPassword') {
      // Setting password to null resets the student to their default `${studentId}@wts` password
      await db.update(students).set({ password: null }).where(eq(students.id, String(id)));
      return NextResponse.json({
        success: true,
        message: `รีเซ็ตรหัสผ่านของนักเรียนรหัส ${id} กลับเป็นค่าเริ่มต้น (${id}@wts) เรียบร้อยแล้ว`
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error("PATCH /api/students error:", error);
    return NextResponse.json({ error: error?.message || 'Failed to process request' }, { status: 500 });
  }
}
export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { submissions, assignments, students } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { checkIsAdmin } from '@/lib/api-auth';
import { sendSubmissionNotification } from '@/lib/email-notifier';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const assignmentId = searchParams.get('assignmentId');
    const classroom = searchParams.get('classroom');

    const db = getDb();
    let query = db.select().from(submissions);

    const all = await query.orderBy(desc(submissions.submittedAt));
    let list = all || [];

    if (studentId) {
      list = list.filter(s => s.studentId === studentId);
    }
    if (assignmentId) {
      list = list.filter(s => s.assignmentId === assignmentId);
    }
    if (classroom) {
      list = list.filter(s => s.classroom === classroom);
    }

    // Attach assignment details
    const assignmentsList = await db.select().from(assignments);
    const assignmentMap = new Map(assignmentsList.map(a => [a.id, a]));

    const enriched = list.map(item => ({
      ...item,
      assignment: assignmentMap.get(item.assignmentId) || null,
    }));

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("GET /api/submissions error:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let body: any = {};
    let imageUrl = '';
    let fileUrl = '';
    let fileName = '';

    if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData().catch(() => null);
      if (formData) {
        for (const [key, value] of formData.entries()) {
          if (value instanceof File && value.size > 0) {
            const bytes = await value.arrayBuffer();
            const base64 = Buffer.from(bytes).toString('base64');
            const dataUrl = `data:${value.type};base64,${base64}`;

            if (key === 'image' || key === 'artwork') {
              imageUrl = dataUrl;
            } else if (key === 'file') {
              fileUrl = dataUrl;
              fileName = value.name;
            }
          } else if (typeof value === 'string') {
            body[key] = value;
            if (key === 'imageUrl') imageUrl = value;
            if (key === 'fileUrl') fileUrl = value;
            if (key === 'fileName') fileName = value;
          }
        }
      }
    } else {
      body = await request.json().catch(() => ({}));
      imageUrl = body.imageUrl || '';
      fileUrl = body.fileUrl || '';
      fileName = body.fileName || '';
    }

    const {
      assignmentId,
      studentId,
      studentName,
      classroom,
      externalLink,
      concept,
    } = body;

    if (!assignmentId || !studentName) {
      return NextResponse.json({ error: 'ข้อมูลไม่ครบถ้วน (ต้องระบุรหัสงาน และชื่อผู้ส่ง)' }, { status: 400 });
    }

    const db = getDb();

    // Check assignment existence and deadline
    const assignment = await db.select().from(assignments).where(eq(assignments.id, assignmentId)).get();
    let isLate = false;
    if (assignment && assignment.dueDate) {
      const dueTime = new Date(assignment.dueDate).getTime();
      const nowTime = Date.now();
      if (!isNaN(dueTime) && nowTime > dueTime) {
        isLate = true;
      }
    }

    // Auto-resolve missing studentId or classroom if not provided
    let finalStudentId = studentId ? String(studentId).trim() : '';
    let finalClassroom = classroom ? String(classroom).trim() : '';

    if (!finalStudentId || !finalClassroom) {
      const studentMatch = await db.select().from(students).where(eq(students.name, studentName.trim())).get();
      if (studentMatch) {
        if (!finalStudentId) finalStudentId = studentMatch.id;
        if (!finalClassroom && studentMatch.classroom) finalClassroom = studentMatch.classroom;
      }
    }

    if (!finalStudentId) {
      return NextResponse.json({ error: 'สงวนสิทธิ์การส่งงานเฉพาะนักเรียนโรงเรียนวชิรธรรมสาธิตเท่านั้น กรุณาเข้าสู่ระบบด้วยรหัสนักเรียน' }, { status: 403 });
    }

    const validStudent = await db.select().from(students).where(eq(students.id, finalStudentId)).get();
    if (!validStudent) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลนักเรียนในระบบ กรุณาเข้าสู่ระบบด้วยรหัสนักเรียน 5 หลักที่ถูกต้อง' }, { status: 403 });
    }

    if (!finalClassroom) {
      finalClassroom = validStudent.classroom || '';
      if (!finalClassroom && assignment?.classrooms) {
        try {
          const rooms = JSON.parse(assignment.classrooms);
          if (Array.isArray(rooms) && rooms.length > 0) finalClassroom = rooms[0];
        } catch {}
      }
      if (!finalClassroom) finalClassroom = 'ม.1/1';
    }

    // Check if student already submitted this assignment
    const existing = await db
      .select()
      .from(submissions)
      .where(and(eq(submissions.assignmentId, assignmentId), eq(submissions.studentId, finalStudentId)))
      .get();

    const nowIso = new Date().toISOString();

    if (existing) {
      // Don't allow overwrite if already graded and not marked for resubmit
      const isGradedAlready = (existing.status === 'graded' || (existing.score !== null && existing.score !== undefined)) && existing.status !== 'resubmit';
      if (isGradedAlready) {
        return NextResponse.json({ 
          error: 'งานนี้ได้รับการตรวจประเมินให้คะแนนเรียบร้อยแล้ว ไม่สามารถแก้ไขได้ นักเรียนสามารถดูได้อย่างเดียว' 
        }, { status: 403 });
      }

      const updateData: any = {
        studentName: studentName.trim(),
        classroom: finalClassroom.trim(),
        externalLink: externalLink !== undefined ? String(externalLink).trim() : existing.externalLink,
        concept: concept !== undefined ? String(concept).trim() : existing.concept,
        status: 'pending', // Reset status back to pending review
        isLate: existing.isLate || isLate,
        updatedAt: nowIso,
      };

      if (imageUrl) {
        updateData.imageUrl = imageUrl;
      } else if (body.removeImage === 'true' || body.removeImage === true) {
        updateData.imageUrl = '';
      }
      if (fileUrl) {
        updateData.fileUrl = fileUrl;
        updateData.fileName = fileName;
      }

      await db.update(submissions).set(updateData).where(eq(submissions.id, existing.id));

      // Trigger automated email notification to teacher
      try {
        const origin = new URL(request.url).origin;
        await sendSubmissionNotification({
          studentName: String(studentName).trim(),
          studentId: finalStudentId,
          classroom: finalClassroom,
          assignmentTitle: assignment?.title || 'ชิ้นงานศิลปะ',
          submittedAt: nowIso,
          concept: concept ? String(concept).trim() : existing.concept,
          hasImage: Boolean(imageUrl || updateData.imageUrl),
          hasFile: Boolean(fileUrl || updateData.fileUrl),
          isLate: Boolean(updateData.isLate),
          origin,
        });
      } catch (notifErr) {
        console.warn("Automated email notification failed on update:", notifErr);
      }

      return NextResponse.json({ success: true, id: existing.id, isUpdated: true, isLate: updateData.isLate });
    }

    // New submission
    const id = `sub_${Date.now()}_${finalStudentId}`;
    const newSubmission = {
      id,
      assignmentId,
      studentId: finalStudentId,
      studentName: String(studentName).trim(),
      classroom: finalClassroom,
      imageUrl: imageUrl || null,
      fileUrl: fileUrl || null,
      fileName: fileName || null,
      externalLink: externalLink ? String(externalLink).trim() : null,
      concept: concept ? String(concept).trim() : null,
      score: null,
      feedback: null,
      status: 'pending',
      isLate,
      submittedAt: nowIso,
      updatedAt: null,
    };

    await db.insert(submissions).values(newSubmission as any);

    // Trigger automated email notification to teacher
    try {
      const origin = new URL(request.url).origin;
      await sendSubmissionNotification({
        studentName: String(studentName).trim(),
        studentId: finalStudentId,
        classroom: finalClassroom,
        assignmentTitle: assignment?.title || 'ชิ้นงานศิลปะ',
        submittedAt: nowIso,
        concept: concept ? String(concept).trim() : undefined,
        hasImage: Boolean(imageUrl),
        hasFile: Boolean(fileUrl),
        isLate,
        origin,
      });
    } catch (notifErr) {
      console.warn("Automated email notification failed on new submission:", notifErr);
    }

    return NextResponse.json({ success: true, id, isLate }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/submissions error:", error);
    return NextResponse.json({ error: error?.message || 'Failed to submit assignment' }, { status: 500 });
  }
}

// Teacher grading or feedback update
export async function PUT(request: Request) {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json({ error: 'Unauthorized — สำหรับครูผู้สอนเท่านั้น' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { id, score, feedback, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const db = getDb();
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (score !== undefined) {
      updateData.score = score !== '' && score !== null ? parseFloat(score) : null;
    }
    if (feedback !== undefined) {
      updateData.feedback = feedback ? String(feedback).trim() : null;
    }
    const hasValidScore = score !== undefined && score !== '' && score !== null;
    if (status === 'resubmit') {
      updateData.status = 'resubmit';
    } else if (hasValidScore) {
      updateData.status = 'graded';
    } else if (status) {
      updateData.status = status;
    }

    await db.update(submissions).set(updateData).where(eq(submissions.id, id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("PUT /api/submissions error:", error);
    return NextResponse.json({ error: error?.message || 'Failed to update submission' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const db = getDb();
    await db.delete(submissions).where(eq(submissions.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/submissions error:", error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

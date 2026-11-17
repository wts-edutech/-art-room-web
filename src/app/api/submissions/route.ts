export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { submissions, assignments, students } from '@/db/schema';
import { eq, and, or, desc, inArray, sql } from 'drizzle-orm';
import { checkIsAdmin, getAdminSession, getSession } from '@/lib/api-auth';
import { sendSubmissionNotification } from '@/lib/email-notifier';
import { offloadDataUrl, offloadDataUrls } from '@/lib/r2-storage';
import { buildAnnotatedUrls, parseStringArray } from '@/lib/submission-annotations';

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
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId')?.trim();
    const studentName = searchParams.get('studentName')?.trim();
    const assignmentId = searchParams.get('assignmentId')?.trim();
    const classroom = searchParams.get('classroom')?.trim();

    const db = getDb();
    const conditions = [];

    const referer = request.headers.get('referer') || '';
    const isAdminReferer = referer.includes('/admin');
    const adminSession = await getAdminSession();
    const isAdmin = adminSession.isAdmin || isAdminReferer;
    const session = await getSession();

    // Data isolation & access control:
    if (isAdmin) {
      // Admin / Teacher: can filter freely by assignment, classroom, or student
      if (studentId && studentName) {
        conditions.push(or(eq(submissions.studentId, studentId), eq(submissions.studentName, studentName)));
      } else if (studentId) {
        conditions.push(eq(submissions.studentId, studentId));
      } else if (studentName) {
        conditions.push(eq(submissions.studentName, studentName));
      }
      if (assignmentId) {
        conditions.push(eq(submissions.assignmentId, assignmentId));
      }
      if (classroom) {
        conditions.push(eq(submissions.classroom, classroom));
      }
    } else if (session && session.role === 'student') {
      // Authenticated student: query by student's own ID or Name for resilient lookup
      const sId = session.userId.trim();
      const sName = studentName ? studentName.trim() : (session.name ? session.name.trim() : '');
      if (sName) {
        conditions.push(or(eq(submissions.studentId, sId), eq(submissions.studentName, sName)));
      } else {
        conditions.push(eq(submissions.studentId, sId));
      }
      if (assignmentId) {
        conditions.push(eq(submissions.assignmentId, assignmentId));
      }
    } else if (studentId) {
      // Student querying their own work by ID or Name
      const sId = studentId.trim();
      if (studentName) {
        conditions.push(or(eq(submissions.studentId, sId), eq(submissions.studentName, studentName.trim())));
      } else {
        conditions.push(eq(submissions.studentId, sId));
      }
      if (assignmentId) {
        conditions.push(eq(submissions.assignmentId, assignmentId));
      }
    } else if (assignmentId) {
      // Assignment level query for grading
      conditions.push(eq(submissions.assignmentId, assignmentId));
      if (classroom) {
        conditions.push(eq(submissions.classroom, classroom));
      }
    } else {
      // Unauthenticated non-admin with no filter: return empty array safely
      return NextResponse.json([]);
    }

    const selectFields = {
      id: submissions.id,
      assignmentId: submissions.assignmentId,
      studentId: submissions.studentId,
      studentName: submissions.studentName,
      classroom: submissions.classroom,
      imageCount: sql<number>`CASE 
        WHEN ${submissions.images} IS NULL THEN 0 
        WHEN json_valid(${submissions.images}) AND json_type(${submissions.images}) = 'array' THEN json_array_length(${submissions.images})
        WHEN json_valid(${submissions.images}) AND json_type(${submissions.images}) = 'text' AND json_valid(json_extract(${submissions.images}, '$')) THEN json_array_length(json_extract(${submissions.images}, '$'))
        WHEN length(${submissions.images}) > 5 THEN 1
        ELSE 0
      END`,
      annotatedImages: submissions.annotatedImages,
      hasImage: sql<number>`CASE 
        WHEN ${submissions.images} IS NOT NULL AND length(${submissions.images}) > 2 THEN 1 
        WHEN ${submissions.imageUrl} IS NOT NULL AND length(${submissions.imageUrl}) > 0 AND ${submissions.imageUrl} NOT LIKE '%/api/submissions/image%' THEN 1 
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

    const list = conditions.length > 0
      ? await db.select(selectFields).from(submissions).where(and(...conditions)).orderBy(desc(submissions.submittedAt))
      : await db.select(selectFields).from(submissions).orderBy(desc(submissions.submittedAt)).limit(200);

    if (!list || list.length === 0) {
      return NextResponse.json([]);
    }

    // Extract unique assignment IDs for batch fetching
    const assignmentIds = Array.from(new Set(list.map(s => s.assignmentId).filter(Boolean)));

    // Fetch lightweight assignment metadata only (strictly exclude heavy inline image base64)
    let assignmentsList: any[] = [];
    if (assignmentIds.length > 0) {
      assignmentsList = await db.select({
        id: assignments.id,
        title: assignments.title,
        maxScore: assignments.maxScore,
        dueDate: assignments.dueDate,
        subjectId: assignments.subjectId,
      }).from(assignments).where(inArray(assignments.id, assignmentIds));
    }

    const assignmentMap = new Map(assignmentsList.map(a => [a.id, a]));

    const enriched = list.map(item => {
      const count = Math.max(Number(item.imageCount) || 0, item.hasImage ? 1 : 0);
      let imageList: string[] = [];
      if (count > 0) {
        imageList = Array.from({ length: count }, (_, idx) => `/api/submissions/image?id=${encodeURIComponent(item.id)}&index=${idx}`);
      }

      return {
        id: item.id,
        assignmentId: item.assignmentId,
        studentId: item.studentId,
        studentName: item.studentName,
        classroom: item.classroom,
        imageUrl: imageList.length > 0 ? imageList[0] : null,
        images: imageList,
        annotatedImages: buildAnnotatedUrls(item.id, item.annotatedImages, imageList.length, item.updatedAt),
        hasImage: imageList.length > 0 ? 1 : 0,
        hasFile: item.hasFile,
        fileUrl: item.hasFile ? `/api/submissions/image?id=${encodeURIComponent(item.id)}&type=file` : null,
        fileName: item.fileName,
        externalLink: item.externalLink,
        concept: item.concept,
        score: item.score,
        feedback: item.feedback,
        status: item.status,
        isLate: item.isLate,
        submittedAt: item.submittedAt,
        updatedAt: item.updatedAt,
        assignment: assignmentMap.get(item.assignmentId) || null,
      };
    });

    return NextResponse.json(enriched, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
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
    let imageUrls: string[] = [];
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
              imageUrls.push(dataUrl);
            } else if (key.startsWith('image_') || key.startsWith('images')) {
              imageUrls.push(dataUrl);
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

    // Support images array passed as JSON or data URLs (only if binary files weren't uploaded)
    if (imageUrls.length === 0 && body.images) {
      const parsed = parseImageArray(body.images);
      for (const item of parsed) {
        if (
          typeof item === 'string' &&
          !item.includes('/api/submissions/image') &&
          (item.startsWith('data:') || item.startsWith('http') || item.startsWith('/') || item.startsWith('r2:'))
        ) {
          imageUrls.push(item);
        }
      }
    }

    if (
      imageUrls.length === 0 &&
      imageUrl &&
      !imageUrl.includes('/api/submissions/image') &&
      (imageUrl.startsWith('data:') || imageUrl.startsWith('http') || imageUrl.startsWith('/') || imageUrl.startsWith('r2:'))
    ) {
      imageUrls.push(imageUrl);
    }
    // Limit to max 3 images for stability and storage safety
    imageUrls = imageUrls.slice(0, 3);
    const primaryImage = imageUrls[0] || (imageUrl && !imageUrl.includes('/api/submissions/image') ? imageUrl : '');

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

    // Enforce authenticated student identity
    const session = await getSession();
    const adminSession = await getAdminSession();
    if (!adminSession.isAdmin && session && session.role === 'student') {
      finalStudentId = session.userId;
    }

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

    if (validStudent && validStudent.classroom) {
      finalClassroom = validStudent.classroom;
    } else if (!finalClassroom) {
      if (assignment?.classrooms) {
        try {
          const rooms = JSON.parse(assignment.classrooms);
          if (Array.isArray(rooms) && rooms.length > 0) finalClassroom = rooms[0];
        } catch {}
      }
      if (!finalClassroom) finalClassroom = 'ม.1/1';
    }

    // Check if student already submitted this assignment (by studentId OR studentName)
    const existing = await db
      .select()
      .from(submissions)
      .where(and(
        eq(submissions.assignmentId, assignmentId),
        or(
          eq(submissions.studentId, finalStudentId),
          eq(submissions.studentName, String(studentName).trim())
        )
      ))
      .get();

    // Offload base64 images/files to R2 (falls back to data URLs if MEDIA binding is missing)
    if (imageUrls.length > 0) {
      imageUrls = await offloadDataUrls(imageUrls, `submissions/${finalStudentId}/${assignmentId}`);
    }
    if (fileUrl && fileUrl.startsWith('data:')) {
      fileUrl = await offloadDataUrl(fileUrl, `submissions/${finalStudentId}/${assignmentId}_file`);
    }

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

      if (imageUrls.length > 0) {
        updateData.imageUrl = `/api/submissions/image?id=${encodeURIComponent(existing.id)}&index=0`;
        updateData.images = imageUrls;
        updateData.annotatedImages = null; // ภาพใหม่ → ล้างการเขียนตรวจของภาพเดิม
      } else if (body.removeImage === 'true' || body.removeImage === true) {
        updateData.imageUrl = '';
        updateData.images = null;
        updateData.annotatedImages = null;
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
          hasImage: Boolean(primaryImage || updateData.imageUrl),
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
      imageUrl: imageUrls.length > 0 ? `/api/submissions/image?id=${encodeURIComponent(id)}&index=0` : (primaryImage || null),
      images: imageUrls.length > 0 ? imageUrls : null,
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
        hasImage: Boolean(primaryImage),
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
    return NextResponse.json({ error: error?.message || 'Failed to submit assignment', cause: String(error?.cause?.message || error?.cause || '') }, { status: 500 });
  }
}

// Teacher grading or feedback update
export async function PUT(request: Request) {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json({ error: 'Unauthorized — สำหรับครูผู้สอนเท่านั้น' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { id, score, feedback, status, annotations } = body;

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

    // ภาพที่ครูเขียนตรวจ: { [index]: dataUrl (บันทึกใหม่) | null (ลบการเขียน) }
    if (annotations && typeof annotations === 'object' && !Array.isArray(annotations)) {
      const entries = Object.entries(annotations as Record<string, unknown>)
        .map(([k, v]) => [parseInt(k, 10), v] as const)
        .filter(([i, v]) => Number.isInteger(i) && i >= 0 && i < 10 && (v === null || (typeof v === 'string' && v.startsWith('data:image/'))));

      if (entries.length > 0) {
        const existing = await db
          .select({ annotatedImages: submissions.annotatedImages, studentId: submissions.studentId })
          .from(submissions)
          .where(eq(submissions.id, id))
          .get();
        if (!existing) {
          return NextResponse.json({ error: 'ไม่พบงานที่ส่ง' }, { status: 404 });
        }
        const list = parseStringArray(existing.annotatedImages);
        const stamp = Date.now();
        for (const [i, v] of entries) {
          while (list.length <= i) list.push('');
          list[i] = v === null
            ? ''
            : await offloadDataUrl(v as string, `submissions/annotated/${existing.studentId}/${id}_${i}_${stamp}`);
        }
        updateData.annotatedImages = list.some(Boolean) ? list : null;
      }
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

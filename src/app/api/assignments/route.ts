export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { assignments, subjects } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { checkIsAdmin } from '@/lib/api-auth';
import { offloadDataUrl } from '@/lib/r2-storage';

let migrationDone = false;
async function ensureAssignmentColumns(db: any) {
  if (migrationDone) return;
  const cols = [
    sql`ALTER TABLE assignments ADD COLUMN image_url TEXT`,
    sql`ALTER TABLE assignments ADD COLUMN attachment_url TEXT`,
    sql`ALTER TABLE assignments ADD COLUMN attachment_name TEXT`,
    sql`ALTER TABLE assignments ADD COLUMN attachment_size TEXT`,
    sql`ALTER TABLE assignments ADD COLUMN attachment_type TEXT`,
    sql`ALTER TABLE assignments ADD COLUMN external_link TEXT`,
  ];
  for (const stmt of cols) {
    try {
      await db.run(stmt);
    } catch {}
  }
  migrationDone = true;
}

// Robust helper to safely parse JSON arrays whether single-stringified, double-stringified, or comma-separated
function parseJsonArray(val: any): string[] {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.map(String).map(s => s.trim()).filter(Boolean);
  }
  if (typeof val === 'string') {
    try {
      let parsed = JSON.parse(val);
      if (typeof parsed === 'string') {
        parsed = JSON.parse(parsed);
      }
      if (Array.isArray(parsed)) {
        return parsed.map(String).map(s => s.trim()).filter(Boolean);
      }
    } catch {
      if (val.includes(',')) {
        return val.split(',').map(s => s.trim()).filter(Boolean);
      }
      const trimmed = val.trim();
      return trimmed ? [trimmed] : [];
    }
  }
  return [];
}

async function queryAssignmentsLight(db: ReturnType<typeof getDb>) {
  return db
    .select({
      id: assignments.id,
      title: assignments.title,
      description: assignments.description,
      subjectId: assignments.subjectId,
      classrooms: assignments.classrooms,
      targetStudents: assignments.targetStudents,
      maxScore: assignments.maxScore,
      dueDate: assignments.dueDate,
      // Only fetch a flag or non-blob URL so D1 never transfers multi-MB base64 strings
      imageUrl: sql<string | null>`CASE
        WHEN image_url IS NULL OR image_url = '' THEN NULL
        WHEN image_url LIKE 'data:%' OR image_url LIKE 'r2:%' OR image_url LIKE '%/api/assignments/image%' THEN 'has_image'
        ELSE image_url
      END`.as('imageUrl'),
      attachmentName: assignments.attachmentName,
      attachmentSize: assignments.attachmentSize,
      attachmentType: assignments.attachmentType,
      externalLink: assignments.externalLink,
      isActive: assignments.isActive,
      createdAt: assignments.createdAt,
      attachmentUrl: sql<string | null>`CASE
        WHEN attachment_url IS NULL OR attachment_url = '' THEN NULL
        WHEN attachment_url LIKE 'data:%' OR attachment_url LIKE 'r2:%' OR attachment_url LIKE '%/api/assignments/image%' THEN 'has_attachment'
        ELSE attachment_url
      END`.as('attachmentUrl'),
    })
    .from(assignments)
    .orderBy(desc(assignments.createdAt));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const classroom = searchParams.get('classroom')?.trim();
    const studentId = searchParams.get('studentId')?.trim();
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const db = getDb();
    let all;
    try {
      all = await queryAssignmentsLight(db);
    } catch {
      await ensureAssignmentColumns(db);
      all = await queryAssignmentsLight(db);
    }

    let list = all || [];

    if (activeOnly) {
      list = list.filter(a => a.isActive);
    }
    if (subjectId) {
      list = list.filter(a => a.subjectId === subjectId);
    }

    if (studentId) {
      list = list.filter(a => {
        const targets = parseJsonArray(a.targetStudents);
        if (targets.length > 0) {
          return targets.includes(studentId);
        }
        if (!classroom) return true;
        const rooms = parseJsonArray(a.classrooms);
        if (rooms.length === 0) return true;
        return rooms.includes(classroom);
      });
    } else if (classroom) {
      list = list.filter(a => {
        const rooms = parseJsonArray(a.classrooms);
        if (rooms.length === 0) return true;
        return rooms.includes(classroom);
      });
    }

    const subjectsList = await db.select().from(subjects);
    const subjectMap = new Map(subjectsList.map(s => [s.id, s]));

    const enriched = list.map(item => ({
      ...item,
      imageUrl: item.imageUrl === 'has_image'
        ? `/api/assignments/image?id=${encodeURIComponent(item.id)}`
        : item.imageUrl,
      attachmentUrl: item.attachmentUrl === 'has_attachment'
        ? `/api/assignments/image?id=${encodeURIComponent(item.id)}&field=attachment`
        : item.attachmentUrl,
      classroomsList: parseJsonArray(item.classrooms),
      targetStudentsList: parseJsonArray(item.targetStudents),
      subject: subjectMap.get(item.subjectId) || {
        id: item.subjectId,
        code: '',
        name: item.subjectId,
        gradeLevel: '',
      },
    }));

    return NextResponse.json(enriched, {
      headers: {
        'Cache-Control': 'private, max-age=15, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error("GET /api/assignments error:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const {
      title,
      description,
      subjectId,
      classrooms: targetRooms,
      targetStudents,
      maxScore,
      dueDate,
      isActive,
      imageUrl,
      attachmentUrl,
      attachmentName,
      attachmentSize,
      attachmentType,
      externalLink,
    } = body;

    if (!title || !subjectId) {
      return NextResponse.json({ error: 'กรุณาระบุชื่องานและวิชาที่มอบหมาย' }, { status: 400 });
    }

    const db = getDb();
    await ensureAssignmentColumns(db);
    const id = `assign_${Date.now()}`;

    const roomsArray = parseJsonArray(targetRooms);
    const studentsArray = parseJsonArray(targetStudents);

    const [storedImageUrl, storedAttachmentUrl] = await Promise.all([
      imageUrl ? offloadDataUrl(String(imageUrl).trim(), `assignments/${id}/cover_${Date.now()}`) : Promise.resolve(null),
      attachmentUrl ? offloadDataUrl(String(attachmentUrl).trim(), `assignments/${id}/att_${Date.now()}`) : Promise.resolve(null),
    ]);

    const newAssignment = {
      id,
      title: title.trim(),
      description: description ? String(description).trim() : null,
      subjectId: String(subjectId),
      classrooms: roomsArray.length > 0 ? JSON.stringify(roomsArray) : null,
      targetStudents: studentsArray.length > 0 ? JSON.stringify(studentsArray) : null,
      maxScore: Number(maxScore) || 10,
      dueDate: dueDate ? String(dueDate) : null,
      imageUrl: storedImageUrl,
      attachmentUrl: storedAttachmentUrl,
      attachmentName: attachmentName ? String(attachmentName).trim() : null,
      attachmentSize: attachmentSize ? String(attachmentSize).trim() : null,
      attachmentType: attachmentType ? String(attachmentType).trim() : null,
      externalLink: externalLink ? String(externalLink).trim() : null,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    };

    await db.insert(assignments).values(newAssignment as any);
    return NextResponse.json(newAssignment, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/assignments error:", error);
    return NextResponse.json({ error: error?.message || 'Failed to create assignment' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const {
      id,
      title,
      description,
      subjectId,
      classrooms: targetRooms,
      targetStudents,
      maxScore,
      dueDate,
      isActive,
      imageUrl,
      attachmentUrl,
      attachmentName,
      attachmentSize,
      attachmentType,
      externalLink,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const db = getDb();
    await ensureAssignmentColumns(db);
    const updateData: any = {};
    if (title) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description ? String(description).trim() : null;
    if (subjectId) updateData.subjectId = String(subjectId);
    if (targetRooms !== undefined) {
      const roomsArray = parseJsonArray(targetRooms);
      updateData.classrooms = roomsArray.length > 0 ? JSON.stringify(roomsArray) : null;
    }
    if (targetStudents !== undefined) {
      const studentsArray = parseJsonArray(targetStudents);
      updateData.targetStudents = studentsArray.length > 0 ? JSON.stringify(studentsArray) : null;
    }
    if (maxScore !== undefined) updateData.maxScore = Number(maxScore) || 10;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? String(dueDate) : null;

    if (imageUrl !== undefined) {
      const trimmedImg = imageUrl ? String(imageUrl).trim() : '';
      // Preserve existing stored image if client sends back the proxy URL unchanged
      if (!trimmedImg.includes('/api/assignments/image')) {
        updateData.imageUrl = trimmedImg
          ? await offloadDataUrl(trimmedImg, `assignments/${id}/cover_${Date.now()}`)
          : null;
      }
    }
    if (attachmentUrl !== undefined) {
      const trimmedAtt = attachmentUrl ? String(attachmentUrl).trim() : '';
      // Preserve existing stored attachment if client sends back the proxy URL unchanged
      if (!trimmedAtt.includes('/api/assignments/image')) {
        updateData.attachmentUrl = trimmedAtt
          ? await offloadDataUrl(trimmedAtt, `assignments/${id}/att_${Date.now()}`)
          : null;
      }
    }
    if (attachmentName !== undefined) updateData.attachmentName = attachmentName ? String(attachmentName).trim() : null;
    if (attachmentSize !== undefined) updateData.attachmentSize = attachmentSize ? String(attachmentSize).trim() : null;
    if (attachmentType !== undefined) updateData.attachmentType = attachmentType ? String(attachmentType).trim() : null;
    if (externalLink !== undefined) updateData.externalLink = externalLink ? String(externalLink).trim() : null;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    await db.update(assignments).set(updateData).where(eq(assignments.id, id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("PUT /api/assignments error:", error);
    return NextResponse.json({ error: error?.message || 'Failed to update assignment' }, { status: 500 });
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
    await db.delete(assignments).where(eq(assignments.id, id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/assignments error:", error);
    return NextResponse.json({ error: error?.message || 'Failed to delete assignment' }, { status: 500 });
  }
}

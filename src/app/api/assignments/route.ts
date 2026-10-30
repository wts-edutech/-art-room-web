export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { assignments, subjects } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { checkIsAdmin } from '@/lib/api-auth';

let migrationDone = false;
async function ensureAssignmentColumns(db: any) {
  if (migrationDone) return;
  try {
    await db.run(sql`ALTER TABLE assignments ADD COLUMN image_url TEXT`);
  } catch {}
  try {
    await db.run(sql`ALTER TABLE assignments ADD COLUMN attachment_url TEXT`);
  } catch {}
  try {
    await db.run(sql`ALTER TABLE assignments ADD COLUMN attachment_name TEXT`);
  } catch {}
  try {
    await db.run(sql`ALTER TABLE assignments ADD COLUMN attachment_size TEXT`);
  } catch {}
  try {
    await db.run(sql`ALTER TABLE assignments ADD COLUMN attachment_type TEXT`);
  } catch {}
  try {
    await db.run(sql`ALTER TABLE assignments ADD COLUMN external_link TEXT`);
  } catch {}
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const classroom = searchParams.get('classroom')?.trim();
    const studentId = searchParams.get('studentId')?.trim();
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const db = getDb();
    await ensureAssignmentColumns(db);
    const all = await db.select().from(assignments).orderBy(desc(assignments.createdAt));
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
        // If assignment specifies specific students, only targeted students can see it
        if (targets.length > 0) {
          return targets.includes(studentId);
        }

        // Otherwise, check classroom assignment
        if (!classroom) return true;
        const rooms = parseJsonArray(a.classrooms);
        if (rooms.length === 0) return true; // all classrooms if empty
        return rooms.includes(classroom);
      });
    } else if (classroom) {
      list = list.filter(a => {
        const rooms = parseJsonArray(a.classrooms);
        if (rooms.length === 0) return true; // all classrooms if empty
        return rooms.includes(classroom);
      });
    }

    // Attach subject info if available
    const subjectsList = await db.select().from(subjects);
    const subjectMap = new Map(subjectsList.map(s => [s.id, s]));

    const enriched = list.map(item => ({
      ...item,
      imageUrl: item.imageUrl ? (item.imageUrl.startsWith('data:') ? `/api/assignments/image?id=${encodeURIComponent(item.id)}` : item.imageUrl) : null,
      classroomsList: parseJsonArray(item.classrooms),
      targetStudentsList: parseJsonArray(item.targetStudents),
      subject: subjectMap.get(item.subjectId) || {
        id: item.subjectId,
        code: '',
        name: item.subjectId,
        gradeLevel: '',
      },
    }));

    return NextResponse.json(enriched);
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

    const newAssignment = {
      id,
      title: title.trim(),
      description: description ? String(description).trim() : null,
      subjectId: String(subjectId),
      classrooms: roomsArray.length > 0 ? JSON.stringify(roomsArray) : null,
      targetStudents: studentsArray.length > 0 ? JSON.stringify(studentsArray) : null,
      maxScore: Number(maxScore) || 10,
      dueDate: dueDate ? String(dueDate) : null,
      imageUrl: imageUrl ? String(imageUrl).trim() : null,
      attachmentUrl: attachmentUrl ? String(attachmentUrl).trim() : null,
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
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl ? String(imageUrl).trim() : null;
    if (attachmentUrl !== undefined) updateData.attachmentUrl = attachmentUrl ? String(attachmentUrl).trim() : null;
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

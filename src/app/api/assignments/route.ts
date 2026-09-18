export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { assignments, subjects } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { checkIsAdmin } from '@/lib/api-auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const classroom = searchParams.get('classroom');
    const studentId = searchParams.get('studentId');
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const db = getDb();
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
        let targets: string[] = [];
        try {
          targets = typeof a.targetStudents === 'string' ? JSON.parse(a.targetStudents) : (a.targetStudents || []);
        } catch {
          targets = [];
        }

        // If assignment specifies specific students, only targeted students can see it
        if (Array.isArray(targets) && targets.length > 0) {
          return targets.includes(studentId);
        }

        // Otherwise, check classroom assignment
        if (!classroom) return true;
        let rooms: string[] = [];
        try {
          rooms = typeof a.classrooms === 'string' ? JSON.parse(a.classrooms) : (a.classrooms || []);
        } catch {
          rooms = [];
        }
        return Array.isArray(rooms) ? (rooms.length === 0 || rooms.includes(classroom)) : true;
      });
    } else if (classroom) {
      list = list.filter(a => {
        if (!a.classrooms) return true; // all classrooms if empty
        let rooms: string[] = [];
        try {
          rooms = typeof a.classrooms === 'string' ? JSON.parse(a.classrooms) : (a.classrooms || []);
        } catch {
          rooms = [];
        }
        return Array.isArray(rooms) ? (rooms.length === 0 || rooms.includes(classroom)) : true;
      });
    }

    // Attach subject info if available
    const subjectsList = await db.select().from(subjects);
    const subjectMap = new Map(subjectsList.map(s => [s.id, s]));

    const enriched = list.map(item => ({
      ...item,
      classroomsList: (() => {
        try {
          return typeof item.classrooms === 'string' ? JSON.parse(item.classrooms) : (item.classrooms || []);
        } catch {
          return [];
        }
      })(),
      targetStudentsList: (() => {
        try {
          return typeof item.targetStudents === 'string' ? JSON.parse(item.targetStudents) : (item.targetStudents || []);
        } catch {
          return [];
        }
      })(),
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
    const { title, description, subjectId, classrooms: targetRooms, targetStudents, maxScore, dueDate, isActive } = body;

    if (!title || !subjectId) {
      return NextResponse.json({ error: 'กรุณาระบุชื่องานและวิชาที่มอบหมาย' }, { status: 400 });
    }

    const db = getDb();
    const id = `assign_${Date.now()}`;

    const newAssignment = {
      id,
      title: title.trim(),
      description: description ? String(description).trim() : null,
      subjectId: String(subjectId),
      classrooms: targetRooms && Array.isArray(targetRooms) && targetRooms.length > 0
        ? JSON.stringify(targetRooms)
        : null,
      targetStudents: targetStudents && Array.isArray(targetStudents) && targetStudents.length > 0
        ? JSON.stringify(targetStudents)
        : null,
      maxScore: Number(maxScore) || 10,
      dueDate: dueDate ? String(dueDate) : null,
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
    const { id, title, description, subjectId, classrooms: targetRooms, targetStudents, maxScore, dueDate, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const db = getDb();
    const updateData: any = {};
    if (title) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description ? String(description).trim() : null;
    if (subjectId) updateData.subjectId = String(subjectId);
    if (targetRooms !== undefined) {
      updateData.classrooms = targetRooms && Array.isArray(targetRooms) && targetRooms.length > 0
        ? JSON.stringify(targetRooms)
        : null;
    }
    if (targetStudents !== undefined) {
      updateData.targetStudents = targetStudents && Array.isArray(targetStudents) && targetStudents.length > 0
        ? JSON.stringify(targetStudents)
        : null;
    }
    if (maxScore !== undefined) updateData.maxScore = Number(maxScore) || 10;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? String(dueDate) : null;
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
  } catch (error) {
    console.error("DELETE /api/assignments error:", error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

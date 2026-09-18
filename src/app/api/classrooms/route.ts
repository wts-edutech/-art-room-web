export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { classrooms } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { checkIsAdmin } from '@/lib/api-auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const academicYearId = searchParams.get('academicYearId');
    const gradeLevel = searchParams.get('gradeLevel');

    const db = getDb();
    const all = await db.select().from(classrooms);
    let list = all || [];

    if (academicYearId) {
      list = list.filter(c => !c.academicYearId || c.academicYearId === academicYearId);
    }
    if (gradeLevel) {
      list = list.filter(c => c.gradeLevel === gradeLevel);
    }

    // Natural sort: e.g. ม.1/1, ม.1/2, ..., ม.1/10
    list.sort((a, b) => a.name.localeCompare(b.name, 'th', { numeric: true }));

    return NextResponse.json(list);
  } catch (error) {
    console.error("GET /api/classrooms error:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { name, gradeLevel, academicYearId, batchGenerate, grade, count } = body;

    const db = getDb();

    // Batch generate rooms e.g. ม.3/1 through ม.3/12
    if (batchGenerate && grade && count) {
      const createdList: any[] = [];
      const numRooms = Math.min(Math.max(1, parseInt(count) || 1), 20);

      for (let i = 1; i <= numRooms; i++) {
        const roomName = `${grade}/${i}`;
        const id = `${grade.replace(/[^a-zA-Z0-9]/g, '')}_${i}`;

        const existing = await db.select().from(classrooms).where(eq(classrooms.id, id)).get();
        if (!existing) {
          const newRoom = {
            id,
            name: roomName,
            gradeLevel: grade,
            academicYearId: academicYearId ? String(academicYearId) : null,
          };
          await db.insert(classrooms).values(newRoom);
          createdList.push(newRoom);
        }
      }

      return NextResponse.json({ success: true, count: createdList.length, created: createdList }, { status: 201 });
    }

    // Single room creation
    if (!name || !gradeLevel) {
      return NextResponse.json({ error: 'กรุณาระบุชื่อห้องเรียน (เช่น ม.3/1) และระดับชั้น' }, { status: 400 });
    }

    const id = `${gradeLevel.replace(/[^a-zA-Z0-9]/g, '')}_${name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;

    const newRoom = {
      id,
      name: name.trim(),
      gradeLevel: gradeLevel.trim(),
      academicYearId: academicYearId ? String(academicYearId) : null,
    };

    await db.insert(classrooms).values(newRoom);
    return NextResponse.json(newRoom, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/classrooms error:", error);
    return NextResponse.json({ error: error?.message || 'Failed to create classroom' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const gradeLevel = searchParams.get('gradeLevel');

    const db = getDb();

    if (gradeLevel) {
      await db.delete(classrooms).where(eq(classrooms.gradeLevel, gradeLevel));
      return NextResponse.json({ success: true, message: `Deleted all rooms for ${gradeLevel}` });
    }

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await db.delete(classrooms).where(eq(classrooms.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/classrooms error:", error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

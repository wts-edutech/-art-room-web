export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { subjects } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { checkIsAdmin } from '@/lib/api-auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const academicYearId = searchParams.get('academicYearId');
    const gradeLevel = searchParams.get('gradeLevel');

    const db = getDb();
    let query = db.select().from(subjects);

    const all = await query.orderBy(subjects.gradeLevel, subjects.code);
    let filtered = all || [];

    if (academicYearId) {
      filtered = filtered.filter(s => !s.academicYearId || s.academicYearId === academicYearId);
    }
    if (gradeLevel) {
      filtered = filtered.filter(s => s.gradeLevel === gradeLevel);
    }

    return NextResponse.json(filtered);
  } catch (error) {
    console.error("GET /api/subjects error:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { code, name, gradeLevel, academicYearId } = body;

    if (!code || !name || !gradeLevel) {
      return NextResponse.json({ error: 'กรุณาระบุรหัสวิชา, ชื่อวิชา, และระดับชั้น' }, { status: 400 });
    }

    const db = getDb();
    const id = `${code.trim().toUpperCase()}_${Date.now()}`;

    const newSubject = {
      id,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      gradeLevel: gradeLevel.trim(),
      academicYearId: academicYearId ? String(academicYearId) : null,
    };

    await db.insert(subjects).values(newSubject);
    return NextResponse.json(newSubject, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/subjects error:", error);
    return NextResponse.json({ error: error?.message || 'Failed to create subject' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { id, code, name, gradeLevel, academicYearId } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const db = getDb();
    const updateData: any = {};
    if (code) updateData.code = code.trim().toUpperCase();
    if (name) updateData.name = name.trim();
    if (gradeLevel) updateData.gradeLevel = gradeLevel.trim();
    if (academicYearId !== undefined) updateData.academicYearId = academicYearId || null;

    await db.update(subjects).set(updateData).where(eq(subjects.id, id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("PUT /api/subjects error:", error);
    return NextResponse.json({ error: error?.message || 'Failed to update subject' }, { status: 500 });
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
    await db.delete(subjects).where(eq(subjects.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/subjects error:", error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

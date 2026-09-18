export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { academicYears } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { checkIsAdmin } from '@/lib/api-auth';

export async function GET() {
  try {
    const db = getDb();
    const list = await db.select().from(academicYears).orderBy(desc(academicYears.year), desc(academicYears.semester));
    return NextResponse.json(list || []);
  } catch (error) {
    console.error("GET /api/academic-years error:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { year, semester, name, isActive } = body;

    if (!year || !semester) {
      return NextResponse.json({ error: 'กรุณาระบุปีการศึกษาและภาคเรียน' }, { status: 400 });
    }

    const db = getDb();
    const id = `${year}-${semester}`;
    const displayName = name || `ปีการศึกษา ${year} / ภาคเรียนที่ ${semester}`;

    // If marked active, unset any other active years
    if (isActive) {
      await db.update(academicYears).set({ isActive: false });
    }

    const existing = await db.select().from(academicYears).where(eq(academicYears.id, id)).get();
    if (existing) {
      await db.update(academicYears).set({
        name: displayName,
        isActive: Boolean(isActive),
      }).where(eq(academicYears.id, id));
    } else {
      await db.insert(academicYears).values({
        id,
        year: String(year),
        semester: String(semester),
        name: displayName,
        isActive: Boolean(isActive ?? true),
      });
    }

    return NextResponse.json({ success: true, id, name: displayName }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/academic-years error:", error);
    return NextResponse.json({ error: error?.message || 'Failed to save academic year' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { id, isActive, name } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const db = getDb();

    // If making active, unset others
    if (isActive) {
      await db.update(academicYears).set({ isActive: false });
    }

    const updateData: any = {};
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (name) updateData.name = name;

    await db.update(academicYears).set(updateData).where(eq(academicYears.id, id));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("PUT /api/academic-years error:", error);
    return NextResponse.json({ error: error?.message || 'Failed to update academic year' }, { status: 500 });
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
    await db.delete(academicYears).where(eq(academicYears.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/academic-years error:", error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

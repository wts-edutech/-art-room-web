export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { students } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { checkIsAdmin } from '@/lib/api-auth';

export async function GET() {
  try {
    const db = getDb();
    const all = await db.select().from(students).orderBy(students.id);
    return NextResponse.json(all || []);
  } catch (error) {
    console.error("GET /api/students error:", error);
    // Return empty array instead of crashing client
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json({ error: 'Unauthorized — สำหรับผู้ดูแลระบบเท่านั้น' }, { status: 401 });
    }

    let id = '';
    let name = '';

    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await request.json().catch(() => ({}));
      id = body.id;
      name = body.name;
    } else {
      const formData = await request.formData().catch(() => null);
      if (formData) {
        id = (formData.get('id') as string) || '';
        name = (formData.get('name') as string) || '';
      }
    }

    id = String(id || '').trim();
    name = String(name || '').trim();

    if (!id || !name) {
      return NextResponse.json({ error: 'กรุณากรอกทั้งรหัสนักเรียนและชื่อ-นามสกุล' }, { status: 400 });
    }

    const db = getDb();

    // Check if student exists, if so update, else insert
    const existing = await db.select().from(students).where(eq(students.id, id)).get();
    if (existing) {
      await db.update(students).set({ name }).where(eq(students.id, id));
    } else {
      await db.insert(students).values({ id, name });
    }

    return NextResponse.json({ id, name, success: true }, { status: 201 });
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
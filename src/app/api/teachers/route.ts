export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { teachers } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { checkIsAdmin } from '@/lib/api-auth';

export async function GET() {
  try {
    const db = getDb();
    const all = await db.select().from(teachers).orderBy(asc(teachers.orderIndex));
    return NextResponse.json(all);
  } catch (error) {
    console.error("GET /api/teachers error:", error);
    return NextResponse.json({ error: 'Failed to fetch teachers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json({ error: 'Unauthorized — สำหรับผู้ดูแลระบบเท่านั้น' }, { status: 401 });
    }

    const formData = await request.formData();
    const db = getDb();

    const name = formData.get('name') as string;
    const role = (formData.get('role') as string) || 'ครูผู้สอนศิลปะ';
    const position = (formData.get('position') as string) || '';
    const grades = (formData.get('grades') as string) || '';
    const specialties = (formData.get('specialties') as string) || '';
    const bio = (formData.get('bio') as string) || '';
    const email = (formData.get('email') as string) || '';
    const roomLocation = (formData.get('roomLocation') as string) || 'ห้องปฏิบัติการศิลปะ อาคาร 2';
    const orderIndex = parseInt((formData.get('orderIndex') as string) || '0', 10);

    const image = formData.get('image') as File | null;
    let imageUrl = (formData.get('imageUrl') as string) || '';

    if (image && image.size > 0) {
      const bytes = await image.arrayBuffer();
      const base64 = Buffer.from(bytes).toString('base64');
      imageUrl = `data:${image.type};base64,${base64}`;
    }

    const newTeacher = {
      id: Date.now().toString(),
      name,
      role,
      position,
      grades,
      specialties,
      bio,
      imageUrl,
      email,
      roomLocation,
      orderIndex,
      createdAt: new Date().toISOString()
    };

    await db.insert(teachers).values(newTeacher as any);
    return NextResponse.json(newTeacher, { status: 201 });
  } catch (error) {
    console.error("POST /api/teachers error:", error);
    return NextResponse.json({ error: 'Failed to create teacher entry' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json({ error: 'Unauthorized — สำหรับผู้ดูแลระบบเท่านั้น' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const db = getDb();
    await db.delete(teachers).where(eq(teachers.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/teachers error:", error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

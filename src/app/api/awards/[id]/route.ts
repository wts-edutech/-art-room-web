export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { awards } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { checkIsAdmin } from '@/lib/api-auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json({ error: 'Unauthorized — สำหรับผู้ดูแลระบบเท่านั้น' }, { status: 401 });
    }
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const formData = await request.formData();
    const db = getDb();
    
    const updates: any = {};
    for (const [key, value] of formData.entries()) {
      if (value instanceof File && value.size > 0) {
        const bytes = await value.arrayBuffer();
        const base64 = Buffer.from(bytes).toString('base64');
        updates[key === 'image' || key === 'coverImage' ? (key === 'coverImage' ? 'coverImageUrl' : 'imageUrl') : key] = `data:${value.type};base64,${base64}`;
      } else if (typeof value === 'string' && key !== 'image' && key !== 'coverImage') {
        if (key === 'isHighlight') {
          updates[key] = value === 'true';
        } else {
          updates[key] = value;
        }
      }
    }

    if (Object.keys(updates).length > 0) {
      await db.update(awards).set(updates).where(eq(awards.id, id));
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/awards/[id] error:", error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json({ error: 'Unauthorized — สำหรับผู้ดูแลระบบเท่านั้น' }, { status: 401 });
    }
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const db = getDb();
    
    await db.delete(awards).where(eq(awards.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/awards/[id] error:", error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

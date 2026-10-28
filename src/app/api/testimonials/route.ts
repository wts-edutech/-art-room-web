export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { testimonials } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const db = getDb();
    const all = await db.select().from(testimonials).orderBy(desc(testimonials.createdAt));
    return NextResponse.json(all);
  } catch (error) {
    console.error("GET /api/testimonials error:", error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const db = getDb();
    const newEntry: any = { id: Date.now().toString() };
    
    // Parse form data dynamically
    for (const [key, value] of formData.entries()) {
      if (value instanceof File && value.size > 0) {
        const bytes = await value.arrayBuffer();
        const base64 = Buffer.from(bytes).toString('base64');
        const fieldName = (key === 'image' || key === 'coverImage') 
          ? 'imageUrl' 
          : (key === 'univImage' ? 'univImageUrl' : key);
        newEntry[fieldName] = `data:${value.type};base64,${base64}`;
      } else if (typeof value === 'string' && key !== 'image' && key !== 'coverImage') {
        const fieldName = key === 'univImage' ? 'univImageUrl' : key;
        newEntry[fieldName] = value;
      }
    }
    
    if (!newEntry.createdAt) newEntry.createdAt = new Date().toISOString();
    
    await db.insert(testimonials).values(newEntry as any);
    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    console.error("POST /api/testimonials error:", error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    const db = getDb();
    let id = '';
    const updates: any = {};

    if (contentType.includes('application/json')) {
      const body = await request.json().catch(() => ({}));
      id = body.id;
      if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
      if (body.name !== undefined) updates.name = String(body.name).trim();
      if (body.university !== undefined) updates.university = String(body.university).trim();
      if (body.quote !== undefined) updates.quote = String(body.quote).trim();
      if (body.imageUrl !== undefined) updates.imageUrl = body.imageUrl === '__CLEAR__' ? null : body.imageUrl;
      if (body.univImageUrl !== undefined) updates.univImageUrl = body.univImageUrl === '__CLEAR__' ? null : body.univImageUrl;
    } else {
      const formData = await request.formData();
      id = formData.get('id') as string;
      if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

      for (const [key, value] of formData.entries()) {
        if (key === 'id') continue;
        if (value instanceof File && value.size > 0) {
          const bytes = await value.arrayBuffer();
          const base64 = Buffer.from(bytes).toString('base64');
          const fieldName = (key === 'image' || key === 'coverImage') 
            ? 'imageUrl' 
            : (key === 'univImage' ? 'univImageUrl' : key);
          updates[fieldName] = `data:${value.type};base64,${base64}`;
        } else if (typeof value === 'string') {
          const fieldName = (key === 'image' || key === 'coverImage') 
            ? 'imageUrl' 
            : (key === 'univImage' ? 'univImageUrl' : key);
          if (value === '__CLEAR__') {
            updates[fieldName] = null;
          } else {
            updates[fieldName] = value;
          }
        }
      }
    }

    const allowedKeys = ['name', 'university', 'quote', 'imageUrl', 'univImageUrl'];
    const cleanUpdates: any = {};
    for (const key of allowedKeys) {
      if (updates[key] !== undefined) {
        cleanUpdates[key] = updates[key];
      }
    }

    if (Object.keys(cleanUpdates).length === 0) {
      return NextResponse.json({ success: true, message: 'ไม่มีข้อมูลเปลี่ยนแปลง' });
    }

    await db.update(testimonials).set(cleanUpdates).where(eq(testimonials.id, id));
    return NextResponse.json({ success: true, id, ...cleanUpdates });
  } catch (error) {
    console.error("PUT /api/testimonials error:", error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    
    const db = getDb();
    await db.delete(testimonials).where(eq(testimonials.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/testimonials error:", error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
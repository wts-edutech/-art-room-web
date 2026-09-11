export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { awards } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const db = getDb();
    const all = await db.select().from(awards).orderBy(desc(awards.createdAt));
    return NextResponse.json(all);
  } catch (error) {
    console.error("GET /api/awards error:", error);
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
        newEntry[key === 'image' || key === 'coverImage' ? (key === 'coverImage' ? 'coverImageUrl' : 'imageUrl') : key] = `data:${value.type};base64,${base64}`;
      } else if (typeof value === 'string' && key !== 'image' && key !== 'coverImage') {
        if (key === 'isHighlight') {
          newEntry[key] = value === 'true';
        } else {
          newEntry[key] = value;
        }
      }
    }
    
    if (!newEntry.createdAt) newEntry.createdAt = new Date().toISOString();
    
    await db.insert(awards).values(newEntry as any);
    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    console.error("POST /api/awards error:", error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

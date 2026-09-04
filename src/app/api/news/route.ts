import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { news } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const db = getDb();
    const all = await db.select().from(news).orderBy(desc(news.createdAt));
    return NextResponse.json(all);
  } catch (error) {
    console.error("GET /api/news error:", error);
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
        newEntry[key] = value;
      }
    }
    
    if (!newEntry.createdAt) newEntry.createdAt = new Date().toISOString();
    
    await db.insert(news).values(newEntry as any);
    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    console.error("POST /api/news error:", error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    
    const db = getDb();
    await db.delete(news).where(eq(news.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/news error:", error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
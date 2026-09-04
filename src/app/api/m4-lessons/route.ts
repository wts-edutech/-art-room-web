import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { lessons } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const db = getDb();
    const all = await db.select().from(lessons).where(eq(lessons.type, 'm4')).orderBy(desc(lessons.createdAt));
    return NextResponse.json(all);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const db = getDb();
    
    // Parse form data
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const categoryKey = 'm4Category';
    const videoKey = 'm4VideoId';
    
    const category = formData.get(categoryKey) as string;
    const videoId = formData.get(videoKey) as string;
    const image = formData.get('image') as File | null;
    let imageUrl = formData.get('imageUrl') as string || '';
    
    if (image && image.size > 0) {
      const bytes = await image.arrayBuffer();
      const base64 = Buffer.from(bytes).toString('base64');
      imageUrl = `data:${image.type};base64,${base64}`;
    }

    const newEntry = {
      id: Date.now().toString(),
      title,
      description,
      category,
      videoId,
      imageUrl,
      type: 'm4',
      createdAt: new Date().toISOString(),
      views: 0,
      ratingSum: 0,
      ratingCount: 0
    };
    
    await db.insert(lessons).values(newEntry as any);
    
    // Send back the format the client expects
    return NextResponse.json({
      ...newEntry,
      [categoryKey]: category,
      [videoKey]: videoId
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    
    const db = getDb();
    await db.delete(lessons).where(eq(lessons.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
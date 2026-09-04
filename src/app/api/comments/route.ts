import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { comments } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get('lessonId');
    if (!lessonId) return NextResponse.json({ error: 'Missing lessonId' }, { status: 400 });

    const db = getDb();
    const all = await db.select().from(comments).where(eq(comments.lessonId, lessonId)).orderBy(desc(comments.time));
    return NextResponse.json(all);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.lessonId || !body.text) return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });

    const db = getDb();
    const newEntry = {
      id: Date.now().toString(),
      lessonId: body.lessonId,
      author: body.author || 'Anonymous',
      authorEmail: body.authorEmail || '',
      authorImage: body.authorImage || '',
      text: body.text,
      time: new Date().toISOString()
    };
    
    await db.insert(comments).values(newEntry);
    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { lessons } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { id, action, rating } = await request.json();
    if (!id || !action) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const db = getDb();
    const lesson = await db.select().from(lessons).where(eq(lessons.id, id)).get();
    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    if (action === 'view') {
      await db.update(lessons).set({ views: (lesson.views || 0) + 1 }).where(eq(lessons.id, id));
    } else if (action === 'rate' && typeof rating === 'number') {
      await db.update(lessons).set({ 
        ratingSum: (lesson.ratingSum || 0) + rating,
        ratingCount: (lesson.ratingCount || 0) + 1
      }).where(eq(lessons.id, id));
    }

    const updated = await db.select().from(lessons).where(eq(lessons.id, id)).get();
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
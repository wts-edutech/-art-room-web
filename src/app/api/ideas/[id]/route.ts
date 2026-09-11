export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { ideas, comments } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const { status } = await request.json();
    if (!status) return NextResponse.json({ error: 'Status is required' }, { status: 400 });

    const db = getDb();
    await db.update(ideas).set({ status }).where(eq(ideas.id, id));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update idea' }, { status: 500 });
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const db = getDb();
    const result = await db.select().from(ideas).where(eq(ideas.id, id));
    
    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    const ideaData = result[0];
    
    const ideaComments = await db.select().from(comments).where(eq(comments.ideaId, id)).orderBy(desc(comments.time));
    
    const ideaWithComments = {
      ...ideaData,
      comments: ideaComments.map((c: any) => ({
        id: c.id,
        authorName: c.author,
        text: c.text,
        createdAt: c.time,
      }))
    };
    
    return NextResponse.json(ideaWithComments);
  } catch (error) {
    console.error("GET /api/ideas/[id] error:", error);
    return NextResponse.json({ error: 'Failed to fetch idea' }, { status: 500 });
  }
}
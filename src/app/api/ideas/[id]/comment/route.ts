import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { comments } from '@/db/schema';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const ideaId = params.id;
    const body = await request.json();
    const db = getDb();
    
    const newComment = {
      id: Date.now().toString(),
      ideaId: ideaId,
      lessonId: '-', // Using lessonId as generic foreign key or create new schema for idea_comments. We put '-' for lessonId
      author: body.authorName || 'Anonymous',
      authorEmail: '',
      authorImage: '',
      text: body.text || '-',
      time: new Date().toISOString()
    };
    
    await db.insert(comments).values(newComment);
    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
  }
}
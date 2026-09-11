export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { comments } from '@/db/schema';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const resolvedParams = await params;
    const ideaId = resolvedParams.id;
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
    
    // Map to frontend format
    const mappedComment = {
      id: newComment.id,
      authorName: newComment.author,
      text: newComment.text,
      createdAt: newComment.time
    };
    
    return NextResponse.json(mappedComment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
  }
}
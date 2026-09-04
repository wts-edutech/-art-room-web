const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, '../src/app/api');

function getInteractApiCode() {
  return `
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
`;
}

function getIdeasCommentApiCode() {
  return `
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
`;
}

function getIdeasIdApiCode() {
  return `
import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { ideas } from '@/db/schema';
import { eq } from 'drizzle-orm';

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
`;
}

// Write the files
fs.writeFileSync(path.join(apiDir, 'lessons', 'interact', 'route.ts'), getInteractApiCode().trim(), 'utf8');
fs.writeFileSync(path.join(apiDir, 'm3-lessons', 'interact', 'route.ts'), getInteractApiCode().trim(), 'utf8');
fs.writeFileSync(path.join(apiDir, 'm4-lessons', 'interact', 'route.ts'), getInteractApiCode().trim(), 'utf8');

const ideasIdDir = path.join(apiDir, 'ideas', '[id]');
const ideasCommentDir = path.join(apiDir, 'ideas', '[id]', 'comment');

if (fs.existsSync(ideasIdDir)) {
  fs.writeFileSync(path.join(ideasIdDir, 'route.ts'), getIdeasIdApiCode().trim(), 'utf8');
}
if (fs.existsSync(ideasCommentDir)) {
  fs.writeFileSync(path.join(ideasCommentDir, 'route.ts'), getIdeasCommentApiCode().trim(), 'utf8');
}

console.log('Rewrote interact and ideas/[id] APIs');

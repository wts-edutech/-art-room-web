const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, '../src/app/api');

function getLessonApiCode(lessonType) {
  return `
import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { lessons } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const db = getDb();
    const all = await db.select().from(lessons).where(eq(lessons.type, '${lessonType}')).orderBy(desc(lessons.createdAt));
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
    const categoryKey = '${lessonType === 'm3' ? 'm3Category' : lessonType === 'm4' ? 'm4Category' : 'category'}';
    const videoKey = '${lessonType === 'm3' ? 'm3VideoId' : lessonType === 'm4' ? 'm4VideoId' : 'videoId'}';
    
    const category = formData.get(categoryKey) as string;
    const videoId = formData.get(videoKey) as string;
    const image = formData.get('image') as File | null;
    let imageUrl = formData.get('imageUrl') as string || '';
    
    if (image && image.size > 0) {
      const bytes = await image.arrayBuffer();
      const base64 = Buffer.from(bytes).toString('base64');
      imageUrl = \`data:\${image.type};base64,\${base64}\`;
    }

    const newEntry = {
      id: Date.now().toString(),
      title,
      description,
      category,
      videoId,
      imageUrl,
      type: '${lessonType}',
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
`;
}

fs.writeFileSync(path.join(apiDir, 'lessons', 'route.ts'), getLessonApiCode('general').trim(), 'utf8');
fs.writeFileSync(path.join(apiDir, 'm3-lessons', 'route.ts'), getLessonApiCode('m3').trim(), 'utf8');
fs.writeFileSync(path.join(apiDir, 'm4-lessons', 'route.ts'), getLessonApiCode('m4').trim(), 'utf8');
console.log('Rewrote lessons APIs');

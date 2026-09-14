export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { ideas, comments } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { checkIsAdmin } from '@/lib/api-auth';

let migrationDone = false;
async function ensureIsFeaturedColumn(db: any) {
  if (migrationDone) return;
  try {
    await db.run(sql`ALTER TABLE ideas ADD COLUMN is_featured INTEGER DEFAULT 0`);
  } catch (e) {
    // Column already exists or already migrated
  }
  migrationDone = true;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdminParam = searchParams.get('admin') === 'true';
    const isAdmin = isAdminParam && (await checkIsAdmin());

    const db = getDb();
    await ensureIsFeaturedColumn(db);
    
    let all;
    if (isAdmin) {
      all = await db.select().from(ideas).orderBy(desc(ideas.createdAt));
    } else {
      all = await db.select().from(ideas).where(eq(ideas.status, 'approved')).orderBy(desc(ideas.createdAt));
    }

    // Fetch comment counts for each idea
    const commentCountMap: Record<string, number> = {};
    try {
      const allComments = await db.select({ ideaId: comments.ideaId }).from(comments);
      allComments.forEach((c) => {
        if (c.ideaId) {
          commentCountMap[c.ideaId] = (commentCountMap[c.ideaId] || 0) + 1;
        }
      });
    } catch (commentErr) {
      console.warn("Could not fetch comments count:", commentErr);
    }

    const safeData = all.map((idea) => {
      let safeFiles: any[] = [];
      if (idea.files) {
        if (typeof idea.files === 'string') {
          if (idea.files.startsWith('data:')) {
            safeFiles = [{ name: 'ไฟล์แนบ', url: idea.files }];
          } else {
            try { safeFiles = JSON.parse(idea.files); } catch(e) {}
          }
        } else if (Array.isArray(idea.files)) {
          safeFiles = idea.files;
        }
      }
      return { 
        ...idea, 
        isFeatured: idea.isFeatured ? 1 : 0,
        files: safeFiles,
        commentsCount: commentCountMap[idea.id] || 0
      };
    });
    
    return NextResponse.json(safeData);
  } catch (error) {
    console.error("GET /api/ideas error:", error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const db = getDb();
    await ensureIsFeaturedColumn(db);
    const newEntry: any = { id: Date.now().toString() };
    
    // Parse form data dynamically
    for (const [key, value] of formData.entries()) {
      if (value instanceof File && value.size > 0) {
        const bytes = await value.arrayBuffer();
        const base64 = Buffer.from(bytes).toString('base64');
        const url = `data:${value.type};base64,${base64}`;
        
        if (key === 'files') {
          if (!newEntry.files) newEntry.files = [];
          newEntry.files.push({ 
            name: value.name, 
            url, 
            size: value.size,
            type: value.type 
          });
        } else {
          newEntry[key === 'image' || key === 'coverImage' ? (key === 'coverImage' ? 'coverImageUrl' : 'imageUrl') : key] = url;
        }
      } else if (typeof value === 'string' && key !== 'image' && key !== 'coverImage') {
        newEntry[key] = value;
      }
    }
    
    if (newEntry.files) {
      newEntry.files = JSON.stringify(newEntry.files);
    }
    
    if (!newEntry.createdAt) newEntry.createdAt = new Date().toISOString();

    // Set as featured by default so it immediately pops up in "แนะนำไอเดียใหม่"
    newEntry.isFeatured = 1;

    // Approve submission so it shows up in "แนะนำไอเดียใหม่" and can be moderated by admin
    const isAdmin = await checkIsAdmin();
    if (newEntry.status === 'pending' && isAdmin) {
      newEntry.status = 'pending';
    } else {
      newEntry.status = 'approved';
    }
    
    await db.insert(ideas).values(newEntry as any);
    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    console.error("POST /api/ideas error:", error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json({ error: 'Unauthorized — สำหรับผู้ดูแลระบบเท่านั้น' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    
    const db = getDb();
    await db.delete(comments).where(eq(comments.ideaId, id));
    await db.delete(ideas).where(eq(ideas.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/ideas error:", error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
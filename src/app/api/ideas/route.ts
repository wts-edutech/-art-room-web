export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { ideas, comments } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { checkIsAdmin } from '@/lib/api-auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdminParam = searchParams.get('admin') === 'true';
    const isAdmin = isAdminParam && (await checkIsAdmin());

    const db = getDb();
    
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

    // Check if author is admin and requested instant approval
    const isAdmin = await checkIsAdmin();
    if (isAdmin && newEntry.status === 'approved') {
      newEntry.status = 'approved';
    } else {
      newEntry.status = 'pending';
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
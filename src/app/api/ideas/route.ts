export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { ideas, comments, students } from '@/db/schema';
import { eq, desc, sql, inArray } from 'drizzle-orm';
import { checkIsAdmin, getSession } from '@/lib/api-auth';

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

    // Lookup students to dynamically enrich ideas with live author avatar, classroom, gradeLevel, and role
    const studentById = new Map<string, any>();
    const studentByName = new Map<string, any>();
    try {
      const targetIds = Array.from(
        new Set(
          (all || [])
            .map((i: any) => (i.authorEmail || '').replace(/@.*$/, '').trim())
            .filter(Boolean)
        )
      );
      const targetNames = Array.from(
        new Set(
          (all || [])
            .map((i: any) => (i.authorName || '').trim())
            .filter(Boolean)
        )
      );

      const studPromises = [];
      if (targetIds.length > 0) {
        studPromises.push(
          db
            .select({
              id: students.id,
              name: students.name,
              classroom: students.classroom,
              gradeLevel: students.gradeLevel,
              avatar: students.avatar,
            })
            .from(students)
            .where(inArray(students.id, targetIds))
        );
      }
      if (targetNames.length > 0) {
        studPromises.push(
          db
            .select({
              id: students.id,
              name: students.name,
              classroom: students.classroom,
              gradeLevel: students.gradeLevel,
              avatar: students.avatar,
            })
            .from(students)
            .where(inArray(students.name, targetNames))
        );
      }

      const studResults = await Promise.all(studPromises);
      for (const s of studResults.flat()) {
        studentById.set(s.id, s);
        studentByName.set(s.name.trim(), s);
      }
    } catch (studErr) {
      console.warn("Could not enrich ideas with student data:", studErr);
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

      const cleanId = (idea.authorEmail || '').replace(/@.*$/, '').trim();
      const matchedStudent = studentById.get(cleanId) || studentByName.get((idea.authorName || '').trim());
      const isStudentPrefix = /^(เด็กชาย|เด็กหญิง|ด\.ช\.|ด\.ญ\.|นาย|นางสาว|น\.ส\.)/.test((idea.authorName || '').trim());
      const authorRole = matchedStudent || isStudentPrefix ? 'student' : 'teacher';

      return { 
        ...idea, 
        isFeatured: idea.isFeatured ? 1 : 0,
        files: safeFiles,
        commentsCount: commentCountMap[idea.id] || 0,
        authorAvatar: matchedStudent?.avatar || '',
        authorClassroom: matchedStudent?.classroom || '',
        authorGradeLevel: matchedStudent?.gradeLevel || '',
        authorStudentId: matchedStudent?.id || (/^\d{5}$/.test(cleanId) ? cleanId : ''),
        authorRole,
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
    const session = await getSession();
    const isAdmin = await checkIsAdmin();
    if (!session && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized — กรุณาเข้าสู่ระบบก่อนแชร์ไอเดีย' }, { status: 401 });
    }

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
    if (!newEntry.authorEmail && session?.userId) {
      newEntry.authorEmail = session.userId;
    }

    // Set as featured by default so it immediately pops up in "แนะนำไอเดียใหม่"
    newEntry.isFeatured = 1;

    // Approve submission so it shows up in "แนะนำไอเดียใหม่" and can be moderated by admin
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
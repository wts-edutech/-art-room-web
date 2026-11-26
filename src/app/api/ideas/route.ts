export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { ideas, comments, students } from '@/db/schema';
import { eq, desc, sql, inArray } from 'drizzle-orm';
import { checkIsAdmin, getSession } from '@/lib/api-auth';
import { offloadDataUrl } from '@/lib/r2-storage';
import { fileToStoredMedia, getCacheHeaders, NO_CACHE_HEADERS, resolveR2Url } from '@/lib/media-response';

let migrationDone = false;
async function ensureIsFeaturedColumn(db: any) {
  if (migrationDone) return;
  try {
    await db.run(sql`ALTER TABLE ideas ADD COLUMN is_featured INTEGER DEFAULT 0`);
  } catch {
    // Column already exists
  }
  migrationDone = true;
}

async function queryIdeasLight(db: ReturnType<typeof getDb>, isAdmin: boolean) {
  const fields = {
    id: ideas.id,
    title: ideas.title,
    description: ideas.description,
    category: ideas.category,
    authorName: ideas.authorName,
    authorEmail: ideas.authorEmail,
    likes: ideas.likes,
    status: ideas.status,
    isFeatured: ideas.isFeatured,
    createdAt: ideas.createdAt,
    imageUrl: sql<string | null>`CASE
      WHEN image_url IS NULL OR image_url = '' THEN NULL
      WHEN image_url LIKE 'data:%' THEN 'has_blob'
      ELSE image_url
    END`.as('imageUrl'),
    filesHasBlob: sql<number>`CASE WHEN files LIKE '%data:%' THEN 1 ELSE 0 END`.as('filesHasBlob'),
    filesCount: sql<number>`CASE
      WHEN files IS NULL OR files = '' THEN 0
      WHEN files LIKE 'data:%' THEN 1
      WHEN json_valid(files) AND json_type(files) = 'array' THEN json_array_length(files)
      ELSE 0
    END`.as('filesCount'),
    filesRawIfSmall: sql<string | null>`CASE WHEN files LIKE '%data:%' THEN NULL ELSE files END`.as('filesRawIfSmall'),
  };

  return isAdmin
    ? db.select(fields).from(ideas).orderBy(desc(ideas.createdAt))
    : db.select(fields).from(ideas).where(eq(ideas.status, 'approved')).orderBy(desc(ideas.createdAt));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdminParam = searchParams.get('admin') === 'true';
    const isAdmin = isAdminParam && (await checkIsAdmin());

    const db = getDb();
    let all;
    try {
      all = await queryIdeasLight(db, isAdmin);
    } catch {
      await ensureIsFeaturedColumn(db);
      all = await queryIdeasLight(db, isAdmin);
    }

    const commentCountMap: Record<string, number> = {};
    try {
      const counts = await db
        .select({ ideaId: comments.ideaId, cnt: sql<number>`count(*)` })
        .from(comments)
        .groupBy(comments.ideaId);
      counts.forEach((c) => {
        if (c.ideaId) commentCountMap[c.ideaId] = Number(c.cnt) || 0;
      });
    } catch (commentErr) {
      console.warn("Could not fetch comments count:", commentErr);
    }

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

      const studSelect = {
        id: students.id,
        name: students.name,
        classroom: students.classroom,
        gradeLevel: students.gradeLevel,
        avatar: sql<string | null>`CASE
          WHEN avatar IS NULL OR avatar = '' THEN NULL
          WHEN avatar LIKE 'data:%' THEN 'has_blob'
          ELSE avatar
        END`.as('avatar'),
      };

      const studPromises = [];
      if (targetIds.length > 0) {
        studPromises.push(db.select(studSelect).from(students).where(inArray(students.id, targetIds)));
      }
      if (targetNames.length > 0) {
        studPromises.push(db.select(studSelect).from(students).where(inArray(students.name, targetNames)));
      }

      const studResults = await Promise.all(studPromises);
      for (const s of studResults.flat()) {
        const publicAvatar =
          s.avatar === 'has_blob'
            ? `/api/media?type=student&id=${encodeURIComponent(s.id)}`
            : resolveR2Url(s.avatar) || s.avatar || '';
        const enrichedStud = { ...s, avatar: publicAvatar };
        studentById.set(s.id, enrichedStud);
        studentByName.set(s.name.trim(), enrichedStud);
      }
    } catch (studErr) {
      console.warn("Could not enrich ideas with student data:", studErr);
    }

    const safeData = (all || []).map((idea: any) => {
      const iid = encodeURIComponent(idea.id);
      let safeFiles: any[] = [];
      if (idea.filesHasBlob && Number(idea.filesCount) > 0) {
        safeFiles = Array.from({ length: Number(idea.filesCount) }, (_, idx) => ({
          name: `ไฟล์แนบ ${idx + 1}`,
          url: `/api/media?type=idea&id=${iid}&field=file&index=${idx}`,
        }));
      } else if (idea.filesRawIfSmall) {
        try {
          const parsed = JSON.parse(idea.filesRawIfSmall);
          if (Array.isArray(parsed)) {
            safeFiles = parsed.map((f: any) => ({
              ...f,
              url: resolveR2Url(f?.url) || f?.url,
            }));
          }
        } catch {}
      }

      const cleanId = (idea.authorEmail || '').replace(/@.*$/, '').trim();
      const matchedStudent = studentById.get(cleanId) || studentByName.get((idea.authorName || '').trim());
      const isStudentPrefix = /^(เด็กชาย|เด็กหญิง|ด\.ช\.|ด\.ญ\.|นาย|นางสาว|น\.ส\.)/.test((idea.authorName || '').trim());
      const authorRole = matchedStudent || isStudentPrefix ? 'student' : 'teacher';

      return {
        id: idea.id,
        title: idea.title,
        description: idea.description,
        category: idea.category,
        authorName: idea.authorName,
        authorEmail: idea.authorEmail,
        likes: idea.likes,
        status: idea.status,
        createdAt: idea.createdAt,
        imageUrl:
          idea.imageUrl === 'has_blob'
            ? `/api/media?type=idea&id=${iid}&field=image`
            : resolveR2Url(idea.imageUrl),
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

    const headers = isAdmin ? NO_CACHE_HEADERS : getCacheHeaders(request);
    return NextResponse.json(safeData, { headers });
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
    const id = Date.now().toString();
    const stamp = Date.now();
    const newEntry: any = { id };

    for (const [key, value] of formData.entries()) {
      if (value instanceof File && value.size > 0) {
        const storedUrl = await fileToStoredMedia(value, `ideas/${id}/${key}_${stamp}`);
        if (key === 'files') {
          if (!newEntry.files) newEntry.files = [];
          newEntry.files.push({
            name: value.name,
            url: storedUrl,
            size: value.size,
            type: value.type,
          });
        } else {
          newEntry[key === 'image' || key === 'coverImage' ? (key === 'coverImage' ? 'coverImageUrl' : 'imageUrl') : key] = storedUrl;
        }
      } else if (typeof value === 'string' && key !== 'image' && key !== 'coverImage') {
        if (key === 'imageUrl' && value.startsWith('data:')) {
          newEntry.imageUrl = await offloadDataUrl(value, `ideas/${id}/img_${stamp}`);
        } else {
          newEntry[key] = value;
        }
      }
    }

    if (newEntry.files) {
      newEntry.files = JSON.stringify(newEntry.files);
    }

    if (!newEntry.createdAt) newEntry.createdAt = new Date().toISOString();
    if (!newEntry.authorEmail && session?.userId) {
      newEntry.authorEmail = session.userId;
    }

    newEntry.isFeatured = 1;
    newEntry.status = newEntry.status === 'pending' && isAdmin ? 'pending' : 'approved';

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

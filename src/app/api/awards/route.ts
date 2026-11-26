export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { awards } from '@/db/schema';
import { desc, sql } from 'drizzle-orm';
import { checkIsAdmin } from '@/lib/api-auth';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { offloadDataUrl } from '@/lib/r2-storage';
import { fileToStoredMedia, getCacheHeaders } from '@/lib/media-response';

let awardsTableEnsured = false;
async function ensureAwardsTable() {
  if (awardsTableEnsured) return;
  try {
    const ctx = getRequestContext();
    const d1 = (ctx?.env as any)?.DB;
    if (!d1) return;

    await d1.prepare(`
      CREATE TABLE IF NOT EXISTS awards (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        student TEXT NOT NULL,
        grade TEXT,
        description TEXT,
        image_url TEXT,
        certificate_url TEXT,
        year TEXT,
        date TEXT,
        award_level TEXT,
        competition_level TEXT,
        organization TEXT,
        is_highlight INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    const columns = ['certificate_url', 'award_level', 'competition_level', 'organization', 'is_highlight', 'grade'];
    for (const col of columns) {
      try {
        await d1.prepare(`ALTER TABLE awards ADD COLUMN ${col} TEXT`).run();
      } catch {
        // column already exists
      }
    }
    awardsTableEnsured = true;
  } catch (e) {
    console.error("ensureAwardsTable error:", e);
  }
}

async function queryAwardsLight(db: ReturnType<typeof getDb>) {
  return db
    .select({
      id: awards.id,
      title: awards.title,
      student: awards.student,
      grade: awards.grade,
      description: awards.description,
      year: awards.year,
      date: awards.date,
      awardLevel: awards.awardLevel,
      competitionLevel: awards.competitionLevel,
      organization: awards.organization,
      isHighlight: awards.isHighlight,
      createdAt: awards.createdAt,
      imageUrl: sql<string | null>`CASE
        WHEN image_url IS NULL OR image_url = '' THEN NULL
        WHEN image_url LIKE 'data:%' OR image_url LIKE 'r2:%' THEN 'has_blob'
        ELSE image_url
      END`.as('imageUrl'),
      certificateUrl: sql<string | null>`CASE
        WHEN certificate_url IS NULL OR certificate_url = '' THEN NULL
        WHEN certificate_url LIKE 'data:%' OR certificate_url LIKE 'r2:%' THEN 'has_blob'
        ELSE certificate_url
      END`.as('certificateUrl'),
    })
    .from(awards)
    .orderBy(desc(awards.createdAt));
}

export async function GET(request: Request) {
  try {
    const db = getDb();
    let all;
    try {
      all = await queryAwardsLight(db);
    } catch {
      await ensureAwardsTable();
      all = await queryAwardsLight(db);
    }

    const normalized = all.map((item) => ({
      ...item,
      imageUrl:
        item.imageUrl === 'has_blob'
          ? `/api/awards/image?id=${encodeURIComponent(item.id)}&field=image`
          : item.imageUrl,
      certificateUrl:
        item.certificateUrl === 'has_blob'
          ? `/api/awards/image?id=${encodeURIComponent(item.id)}&field=certificate`
          : item.certificateUrl,
    }));

    return NextResponse.json(normalized, { headers: getCacheHeaders(request, true) });
  } catch (error: any) {
    console.error("GET /api/awards error:", error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json({ error: 'Unauthorized — สำหรับผู้ดูแลระบบเท่านั้น' }, { status: 401 });
    }
    await ensureAwardsTable();
    const formData = await request.formData();
    const db = getDb();

    const id = Date.now().toString();
    const title = (formData.get('title') as string) || '';
    const student = (formData.get('student') as string) || '';
    const grade = (formData.get('grade') as string) || '';
    const description = (formData.get('description') as string) || '';
    const year = (formData.get('year') as string) || '';
    const date = (formData.get('date') as string) || '';
    const awardLevel = (formData.get('awardLevel') as string) || '';
    const competitionLevel = (formData.get('competitionLevel') as string) || '';
    const organization = (formData.get('organization') as string) || '';
    const isHighlightStr = (formData.get('isHighlight') as string) || 'false';
    const isHighlight = isHighlightStr === 'true';

    // Handle Award Image
    let imageUrl = (formData.get('imageUrl') as string) || '';
    const imageFile = formData.get('image') || formData.get('coverImage');
    if (imageFile && typeof imageFile === 'object' && 'arrayBuffer' in imageFile && (imageFile as any).size > 0) {
      imageUrl = await fileToStoredMedia(imageFile as File, `awards/${id}/image_${Date.now()}`);
    } else if (imageUrl.startsWith('data:')) {
      imageUrl = await offloadDataUrl(imageUrl, `awards/${id}/image_${Date.now()}`);
    }

    // Handle Certificate File
    let certificateUrl = (formData.get('certificateUrl') as string) || '';
    const certFile = formData.get('certificate');
    if (certFile && typeof certFile === 'object' && 'arrayBuffer' in certFile && (certFile as any).size > 0) {
      certificateUrl = await fileToStoredMedia(certFile as File, `awards/${id}/cert_${Date.now()}`);
    } else if (certificateUrl.startsWith('data:')) {
      certificateUrl = await offloadDataUrl(certificateUrl, `awards/${id}/cert_${Date.now()}`);
    }

    const newEntry = {
      id,
      title,
      student,
      grade,
      description,
      imageUrl: imageUrl || null,
      certificateUrl: certificateUrl || null,
      year,
      date,
      awardLevel,
      competitionLevel,
      organization,
      isHighlight,
      createdAt: new Date().toISOString()
    };

    await db.insert(awards).values(newEntry as any);
    return NextResponse.json(newEntry, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/awards error:", error);
    const msg = error?.message || String(error);
    return NextResponse.json({ error: `เกิดข้อผิดพลาดในการบันทึก: ${msg}` }, { status: 500 });
  }
}

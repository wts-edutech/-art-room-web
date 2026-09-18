export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { awards } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { checkIsAdmin } from '@/lib/api-auth';
import { getRequestContext } from '@cloudflare/next-on-pages';

async function ensureAwardsTable() {
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
  } catch (e) {
    console.error("ensureAwardsTable error:", e);
  }
}

export async function GET() {
  try {
    await ensureAwardsTable();
    const db = getDb();
    const all = await db.select().from(awards).orderBy(desc(awards.createdAt));
    return NextResponse.json(all);
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
      const bytes = await (imageFile as any).arrayBuffer();
      const base64 = Buffer.from(bytes).toString('base64');
      const mime = (imageFile as any).type || 'image/jpeg';
      imageUrl = `data:${mime};base64,${base64}`;
    }

    // Handle Certificate File
    let certificateUrl = (formData.get('certificateUrl') as string) || '';
    const certFile = formData.get('certificate');
    if (certFile && typeof certFile === 'object' && 'arrayBuffer' in certFile && (certFile as any).size > 0) {
      const bytes = await (certFile as any).arrayBuffer();
      const base64 = Buffer.from(bytes).toString('base64');
      const mime = (certFile as any).type || 'image/jpeg';
      certificateUrl = `data:${mime};base64,${base64}`;
    }

    const newEntry = {
      id: Date.now().toString(),
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

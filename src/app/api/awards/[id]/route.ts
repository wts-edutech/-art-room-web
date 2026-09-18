export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { awards } from '@/db/schema';
import { eq } from 'drizzle-orm';
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

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json({ error: 'Unauthorized — สำหรับผู้ดูแลระบบเท่านั้น' }, { status: 401 });
    }
    await ensureAwardsTable();
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const formData = await request.formData();
    const db = getDb();
    
    const updates: any = {};
    if (formData.has('title')) updates.title = formData.get('title') as string;
    if (formData.has('student')) updates.student = formData.get('student') as string;
    if (formData.has('grade')) updates.grade = formData.get('grade') as string;
    if (formData.has('description')) updates.description = formData.get('description') as string;
    if (formData.has('year')) updates.year = formData.get('year') as string;
    if (formData.has('date')) updates.date = formData.get('date') as string;
    if (formData.has('awardLevel')) updates.awardLevel = formData.get('awardLevel') as string;
    if (formData.has('competitionLevel')) updates.competitionLevel = formData.get('competitionLevel') as string;
    if (formData.has('organization')) updates.organization = formData.get('organization') as string;
    if (formData.has('isHighlight')) updates.isHighlight = formData.get('isHighlight') === 'true';

    // Award Image
    const imageFile = formData.get('image') || formData.get('coverImage');
    if (imageFile && typeof imageFile === 'object' && 'arrayBuffer' in imageFile && (imageFile as any).size > 0) {
      const bytes = await (imageFile as any).arrayBuffer();
      const base64 = Buffer.from(bytes).toString('base64');
      const mime = (imageFile as any).type || 'image/jpeg';
      updates.imageUrl = `data:${mime};base64,${base64}`;
    } else if (formData.has('imageUrl')) {
      updates.imageUrl = formData.get('imageUrl') as string;
    }

    // Certificate File
    const certFile = formData.get('certificate');
    if (certFile && typeof certFile === 'object' && 'arrayBuffer' in certFile && (certFile as any).size > 0) {
      const bytes = await (certFile as any).arrayBuffer();
      const base64 = Buffer.from(bytes).toString('base64');
      const mime = (certFile as any).type || 'image/jpeg';
      updates.certificateUrl = `data:${mime};base64,${base64}`;
    } else if (formData.has('certificateUrl')) {
      updates.certificateUrl = formData.get('certificateUrl') as string;
    }

    if (Object.keys(updates).length > 0) {
      await db.update(awards).set(updates).where(eq(awards.id, id));
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("PUT /api/awards/[id] error:", error);
    const msg = error?.message || String(error);
    return NextResponse.json({ error: `เกิดข้อผิดพลาดในการแก้ไข: ${msg}` }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json({ error: 'Unauthorized — สำหรับผู้ดูแลระบบเท่านั้น' }, { status: 401 });
    }
    await ensureAwardsTable();
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const db = getDb();
    
    await db.delete(awards).where(eq(awards.id, id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/awards/[id] error:", error);
    const msg = error?.message || String(error);
    return NextResponse.json({ error: `เกิดข้อผิดพลาดในการลบ: ${msg}` }, { status: 500 });
  }
}

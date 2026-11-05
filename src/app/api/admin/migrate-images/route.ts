export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { submissions } from '@/db/schema';
import { sql, eq } from 'drizzle-orm';
import { requireSuperAdmin } from '@/lib/api-auth';
import { getMediaBucket, offloadDataUrl } from '@/lib/r2-storage';

const BASE64_FILTER = sql`(${submissions.images} LIKE '%data:%' OR ${submissions.imageUrl} LIKE 'data:%')`;

async function countRemaining(db: ReturnType<typeof getDb>) {
  const row = await db.select({ n: sql<number>`count(*)` }).from(submissions).where(BASE64_FILTER).get();
  return Number(row?.n || 0);
}

/** GET: จำนวนงานที่ยังมีรูป base64 ค้างใน D1 */
export async function GET() {
  try {
    await requireSuperAdmin();
    const db = getDb();
    return NextResponse.json({ remaining: await countRemaining(db), r2Ready: Boolean(getMediaBucket()) });
  } catch (error: any) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: error?.message || 'Unauthorized' }, { status: 500 });
  }
}

/** POST: ย้ายรูปทีละชุด (ครั้งละ 5 งาน) จาก D1 ไป R2 */
export async function POST() {
  try {
    await requireSuperAdmin();
    if (!getMediaBucket()) {
      return NextResponse.json({ error: 'ยังไม่ได้ผูก R2 (MEDIA binding) กรุณารอ deploy เสร็จ' }, { status: 400 });
    }
    const db = getDb();
    const rows = await db
      .select({ id: submissions.id, studentId: submissions.studentId, assignmentId: submissions.assignmentId, imageUrl: submissions.imageUrl, images: submissions.images })
      .from(submissions)
      .where(BASE64_FILTER)
      .limit(5)
      .all();

    let migrated = 0;
    const errors: string[] = [];

    for (const row of rows) {
      try {
        const keyBase = `submissions/${row.studentId || 'unknown'}/${row.assignmentId || 'na'}/migrated_${Date.now()}`;
        const update: Record<string, any> = {};

        let list: string[] = [];
        try {
          const parsed = typeof row.images === 'string' ? JSON.parse(row.images) : row.images;
          if (Array.isArray(parsed)) list = parsed;
        } catch {}

        if (list.length > 0) {
          const newList = await Promise.all(list.map((v, i) => offloadDataUrl(v, `${keyBase}_${i}`)));
          update.images = JSON.stringify(newList);
        }

        if (row.imageUrl && row.imageUrl.startsWith('data:')) {
          if (list.length === 0) {
            const ref = await offloadDataUrl(row.imageUrl, `${keyBase}_0`);
            update.images = JSON.stringify([ref]);
          }
          update.imageUrl = `/api/submissions/image?id=${encodeURIComponent(row.id)}&index=0`;
        }

        if (Object.keys(update).length > 0) {
          await db.update(submissions).set(update).where(eq(submissions.id, row.id));
          migrated++;
        }
      } catch (e: any) {
        errors.push(`${row.id}: ${e?.message || e}`);
      }
    }

    return NextResponse.json({ migrated, errors, remaining: await countRemaining(db) });
  } catch (error: any) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: error?.message || 'Migration failed' }, { status: 500 });
  }
}


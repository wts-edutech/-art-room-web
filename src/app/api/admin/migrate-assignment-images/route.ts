export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { requireSuperAdmin } from '@/lib/api-auth';
import { getMediaBucket, offloadDataUrl } from '@/lib/r2-storage';

/** GET: count assignments that still have base64 blobs in D1 */
export async function GET() {
  try {
    await requireSuperAdmin();
    const d1 = getRequestContext()?.env?.DB;
    if (!d1) return NextResponse.json({ error: 'No DB' }, { status: 500 });

    const row: any = await d1
      .prepare(
        `SELECT count(*) as n FROM assignments
         WHERE image_url LIKE 'data:%' OR attachment_url LIKE 'data:%'`
      )
      .first();

    return NextResponse.json({
      remaining: Number(row?.n || 0),
      r2Ready: Boolean(getMediaBucket()),
    });
  } catch (error: any) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 });
  }
}

/** POST: migrate assignment base64 blobs to R2 (batch of 5) */
export async function POST() {
  try {
    await requireSuperAdmin();
    const bucket = getMediaBucket();
    if (!bucket) {
      return NextResponse.json(
        { error: 'ยังไม่ได้ผูก R2 (MEDIA binding) กรุณารอ deploy เสร็จ' },
        { status: 400 }
      );
    }

    const d1 = getRequestContext()?.env?.DB;
    if (!d1) return NextResponse.json({ error: 'No DB' }, { status: 500 });

    // Fetch assignments that still have base64 blobs
    const rows: any[] = (
      await d1
        .prepare(
          `SELECT id, image_url, attachment_url, attachment_type
           FROM assignments
           WHERE image_url LIKE 'data:%' OR attachment_url LIKE 'data:%'
           LIMIT 5`
        )
        .all()
    ).results || [];

    let migrated = 0;
    const errors: string[] = [];
    const details: any[] = [];

    for (const row of rows) {
      try {
        const id = row.id;
        const setClauses: string[] = [];
        const params: any[] = [];

        // Migrate image_url
        if (row.image_url && String(row.image_url).startsWith('data:')) {
          const ref = await offloadDataUrl(
            String(row.image_url),
            `assignments/${id}/image_${Date.now()}`
          );
          setClauses.push('image_url = ?');
          params.push(ref);
        }

        // Migrate attachment_url
        if (row.attachment_url && String(row.attachment_url).startsWith('data:')) {
          const ref = await offloadDataUrl(
            String(row.attachment_url),
            `assignments/${id}/attachment_${Date.now()}`
          );
          setClauses.push('attachment_url = ?');
          params.push(ref);
        }

        if (setClauses.length > 0) {
          params.push(id);
          await d1
            .prepare(`UPDATE assignments SET ${setClauses.join(', ')} WHERE id = ?`)
            .bind(...params)
            .run();
          migrated++;
          details.push({ id, fields: setClauses.length });
        }
      } catch (e: any) {
        errors.push(`${row.id}: ${e?.message || e}`);
      }
    }

    // Count remaining
    const countRow: any = await d1
      .prepare(
        `SELECT count(*) as n FROM assignments
         WHERE image_url LIKE 'data:%' OR attachment_url LIKE 'data:%'`
      )
      .first();

    return NextResponse.json({
      migrated,
      errors,
      details,
      remaining: Number(countRow?.n || 0),
    });
  } catch (error: any) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: error?.message || 'Migration failed' }, { status: 500 });
  }
}

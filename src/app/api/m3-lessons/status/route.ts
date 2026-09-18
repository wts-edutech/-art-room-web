export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { checkIsAdmin } from '@/lib/api-auth';
import { getRequestContext } from '@cloudflare/next-on-pages';

async function getD1() {
  try {
    const ctx = getRequestContext();
    return ctx?.env?.DB || null;
  } catch {
    return null;
  }
}

async function ensureSettingsTable(d1: any) {
  if (!d1) return;
  try {
    await d1.prepare(`
      CREATE TABLE IF NOT EXISTS site_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
  } catch (err) {
    console.warn("ensureSettingsTable note:", err);
  }
}

// In-memory fallback if D1 is not available (e.g. local build)
let memoryM3Enabled = true;

export async function GET() {
  try {
    const d1 = await getD1();
    if (!d1) {
      return NextResponse.json({ enabled: memoryM3Enabled });
    }

    await ensureSettingsTable(d1);

    const stmt = d1.prepare(`
      SELECT value FROM site_settings WHERE key = 'm3_lessons_enabled'
    `);
    const result: any = typeof stmt.first === 'function' ? await stmt.first() : (await stmt.all?.())?.results?.[0];

    // If never set in database, default to true or value in DB
    const enabled = result ? result.value === 'true' : memoryM3Enabled;
    return NextResponse.json({ enabled });

  } catch (error) {
    console.error("GET /api/m3-lessons/status error:", error);
    return NextResponse.json({ enabled: memoryM3Enabled });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json({ error: 'Unauthorized — สำหรับผู้ดูแลระบบเท่านั้น' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const isEnabled = Boolean(body.enabled);

    memoryM3Enabled = isEnabled;

    const d1 = await getD1();
    if (d1) {
      await ensureSettingsTable(d1);
      await d1.prepare(`
        INSERT INTO site_settings (key, value, updated_at) 
        VALUES ('m3_lessons_enabled', ?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
      `).bind(isEnabled ? 'true' : 'false', new Date().toISOString()).run();
    }

    return NextResponse.json({ 
      success: true, 
      enabled: isEnabled,
      message: isEnabled 
        ? 'เปิดการแสดงผลสื่อการสอน ม.3 ในระบบหน้าบ้านแล้ว' 
        : 'ปิดการแสดงผลสื่อการสอน ม.3 ในระบบหน้าบ้านแล้ว'
    });

  } catch (error: any) {
    console.error("POST /api/m3-lessons/status error:", error);
    return NextResponse.json({ error: error?.message || 'Failed to update status' }, { status: 500 });
  }
}

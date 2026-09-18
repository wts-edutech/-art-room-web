export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { checkIsAdmin } from '@/lib/api-auth';
import { getRequestContext } from '@cloudflare/next-on-pages';

export interface AiModelButtonSettings {
  title: string;
  url: string;
  openInNewTab: boolean;
  isEnabled: boolean;
  buttonSize: "compact" | "normal" | "spacious";
  updatedAt?: string;
}

const DEFAULT_SETTINGS: AiModelButtonSettings = {
  title: "WTS CREATIVE AI ART MODEL",
  url: "https://wtscreativeaiart.netlify.app/",
  openInNewTab: true,
  isEnabled: true,
  buttonSize: "compact",
  updatedAt: new Date().toISOString(),
};

let memorySettings: AiModelButtonSettings = { ...DEFAULT_SETTINGS };

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

export async function GET() {
  try {
    const d1 = await getD1();
    if (!d1) {
      return NextResponse.json(memorySettings);
    }

    await ensureSettingsTable(d1);

    const stmt = d1.prepare(`
      SELECT value FROM site_settings WHERE key = 'hero_ai_model_button'
    `);
    const result: any = typeof stmt.first === 'function' ? await stmt.first() : (await stmt.all?.())?.results?.[0];

    if (result?.value) {
      try {
        const parsed = JSON.parse(result.value);
        memorySettings = {
          ...DEFAULT_SETTINGS,
          ...parsed,
        };
      } catch (e) {
        console.warn("Failed to parse hero_ai_model_button json:", e);
      }
    }

    return NextResponse.json(memorySettings);
  } catch (error) {
    console.error("GET /api/settings/ai-model error:", error);
    return NextResponse.json(memorySettings);
  }
}

export async function POST(request: Request) {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json(
        { error: 'Unauthorized — สำหรับผู้ดูแลระบบเท่านั้น' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const title = (body.title?.toString() || DEFAULT_SETTINGS.title).trim();
    const url = (body.url?.toString() || DEFAULT_SETTINGS.url).trim();
    const openInNewTab = body.openInNewTab !== undefined ? Boolean(body.openInNewTab) : true;
    const isEnabled = body.isEnabled !== undefined ? Boolean(body.isEnabled) : true;
    const validSizes = ["compact", "normal", "spacious"];
    const buttonSize = validSizes.includes(body.buttonSize) ? body.buttonSize : "compact";
    const updatedAt = new Date().toISOString();

    const newSettings: AiModelButtonSettings = {
      title: title || DEFAULT_SETTINGS.title,
      url: url || DEFAULT_SETTINGS.url,
      openInNewTab,
      isEnabled,
      buttonSize,
      updatedAt,
    };

    memorySettings = newSettings;

    const d1 = await getD1();
    if (d1) {
      await ensureSettingsTable(d1);
      await d1.prepare(`
        INSERT INTO site_settings (key, value, updated_at) 
        VALUES ('hero_ai_model_button', ?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
      `).bind(JSON.stringify(newSettings), updatedAt).run();
    }

    return NextResponse.json({
      success: true,
      settings: newSettings,
      message: 'บันทึกการตั้งค่าปุ่ม AI Art Model เรียบร้อยแล้ว',
    });
  } catch (error) {
    console.error("POST /api/settings/ai-model error:", error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

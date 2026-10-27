export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { checkIsAdmin } from '@/lib/api-auth';
import { getRequestContext } from '@cloudflare/next-on-pages';

export interface LogoSettings {
  logoUrl: string;
  logoAlt: string;
  brandNamePrefix: string;
  brandNameSuffix: string;
  schoolName: string;
  showText: boolean;
  logoShape: "square" | "circle" | "rounded";
  logoSize: "compact" | "normal" | "large";
  updatedAt?: string;
}

const DEFAULT_SETTINGS: LogoSettings = {
  logoUrl: "/school-logo.png",
  logoAlt: "ตราโรงเรียนวชิรธรรมสาธิต",
  brandNamePrefix: "ART",
  brandNameSuffix: "ROOM",
  schoolName: "WACHIRATHAMMASATIT SCHOOL",
  showText: true,
  logoShape: "rounded",
  logoSize: "normal",
  updatedAt: new Date().toISOString(),
};

let memorySettings: LogoSettings = { ...DEFAULT_SETTINGS };

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
      SELECT value FROM site_settings WHERE key = 'site_logo_settings'
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
        console.warn("Failed to parse site_logo_settings json:", e);
      }
    }

    return NextResponse.json(memorySettings);
  } catch (error) {
    console.error("GET /api/settings/logo error:", error);
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

    let payload: Partial<LogoSettings> = {};
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("logoFile") as File | null;
      let logoUrl = (formData.get("logoUrl") as string) || "";

      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const base64 = Buffer.from(bytes).toString("base64");
        logoUrl = `data:${file.type || "image/png"};base64,${base64}`;
      }

      payload = {
        logoUrl: logoUrl || undefined,
        logoAlt: (formData.get("logoAlt") as string) || undefined,
        brandNamePrefix: (formData.get("brandNamePrefix") as string) || undefined,
        brandNameSuffix: (formData.get("brandNameSuffix") as string) || undefined,
        schoolName: (formData.get("schoolName") as string) || undefined,
        showText: formData.get("showText") !== null ? formData.get("showText") === "true" : undefined,
        logoShape: (formData.get("logoShape") as any) || undefined,
        logoSize: (formData.get("logoSize") as any) || undefined,
      };
    } else {
      payload = await request.json().catch(() => ({}));
    }

    const updatedAt = new Date().toISOString();

    const newSettings: LogoSettings = {
      logoUrl: payload.logoUrl?.trim() || memorySettings.logoUrl || DEFAULT_SETTINGS.logoUrl,
      logoAlt: (payload.logoAlt ?? memorySettings.logoAlt ?? DEFAULT_SETTINGS.logoAlt).trim(),
      brandNamePrefix: (payload.brandNamePrefix ?? memorySettings.brandNamePrefix ?? DEFAULT_SETTINGS.brandNamePrefix).trim(),
      brandNameSuffix: (payload.brandNameSuffix ?? memorySettings.brandNameSuffix ?? DEFAULT_SETTINGS.brandNameSuffix).trim(),
      schoolName: (payload.schoolName ?? memorySettings.schoolName ?? DEFAULT_SETTINGS.schoolName).trim(),
      showText: payload.showText !== undefined ? Boolean(payload.showText) : (memorySettings.showText ?? true),
      logoShape: payload.logoShape || memorySettings.logoShape || "rounded",
      logoSize: payload.logoSize || memorySettings.logoSize || "normal",
      updatedAt,
    };

    memorySettings = newSettings;

    const d1 = await getD1();
    if (d1) {
      await ensureSettingsTable(d1);
      await d1.prepare(`
        INSERT INTO site_settings (key, value, updated_at) 
        VALUES ('site_logo_settings', ?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
      `).bind(JSON.stringify(newSettings), updatedAt).run();
    }

    return NextResponse.json({
      success: true,
      settings: newSettings,
      message: 'บันทึกการตั้งค่ารูปโลโก้และตราโรงเรียนเรียบร้อยแล้ว',
    });
  } catch (error) {
    console.error("POST /api/settings/logo error:", error);
    return NextResponse.json(
      { error: 'Failed to update logo settings' },
      { status: 500 }
    );
  }
}

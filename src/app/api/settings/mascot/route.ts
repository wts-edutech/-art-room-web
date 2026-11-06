export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { checkIsAdmin } from '@/lib/api-auth';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { offloadDataUrl } from '@/lib/r2-storage';

interface MascotSettings {
  mascotUrl: string;
  mascotAlt: string;
  size: number; // in pixels (width, e.g. 64)
  showTooltip: boolean;
  tooltipText: string;
  updatedAt?: string;
}

const DEFAULT_MASCOT_SETTINGS: MascotSettings = {
  mascotUrl: "/images/artroom-mascot-transparent.png",
  mascotAlt: "Art Room Mascot Back to Top",
  size: 64,
  showTooltip: true,
  tooltipText: "ขึ้นด้านบน",
};

let memorySettings: MascotSettings = { ...DEFAULT_MASCOT_SETTINGS };

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

    const stmt = d1.prepare(`SELECT value FROM site_settings WHERE key = 'site_mascot_settings'`);
    const result: any = typeof stmt.first === 'function' ? await stmt.first() : (await stmt.all?.())?.results?.[0];

    if (result?.value) {
      try {
        const parsed = JSON.parse(result.value);
        memorySettings = {
          ...DEFAULT_MASCOT_SETTINGS,
          ...parsed,
        };
      } catch (e) {
        console.warn("Failed to parse site_mascot_settings json:", e);
      }
    }

    return NextResponse.json(memorySettings);
  } catch (error) {
    console.error("GET /api/settings/mascot error:", error);
    return NextResponse.json(memorySettings);
  }
}

export async function POST(request: Request) {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json({ error: 'Unauthorized — สำหรับผู้ดูแลระบบเท่านั้น' }, { status: 401 });
    }

    let payload: Partial<MascotSettings> = {};
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("mascotFile") as File | null;
      let mascotUrl = (formData.get("mascotUrl") as string) || "";

      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const base64 = Buffer.from(bytes).toString("base64");
        const dataUrl = `data:${file.type || "image/png"};base64,${base64}`;
        // Offload image to R2 directly if available!
        mascotUrl = await offloadDataUrl(dataUrl, `mascot/mascot_${Date.now()}`);
      }

      payload = {
        mascotUrl: mascotUrl || undefined,
        mascotAlt: (formData.get("mascotAlt") as string) || undefined,
        tooltipText: (formData.get("tooltipText") as string) || undefined,
        showTooltip: formData.get("showTooltip") !== null ? formData.get("showTooltip") === "true" : undefined,
        size: formData.get("size") ? Number(formData.get("size")) : undefined,
      };
    } else {
      payload = await request.json().catch(() => ({}));
      if (payload.mascotUrl && payload.mascotUrl.startsWith("data:")) {
        payload.mascotUrl = await offloadDataUrl(payload.mascotUrl, `mascot/mascot_${Date.now()}`);
      }
    }

    const updatedAt = new Date().toISOString();

    const newSettings: MascotSettings = {
      mascotUrl: payload.mascotUrl?.trim() || memorySettings.mascotUrl || DEFAULT_MASCOT_SETTINGS.mascotUrl,
      mascotAlt: (payload.mascotAlt ?? memorySettings.mascotAlt ?? DEFAULT_MASCOT_SETTINGS.mascotAlt).trim(),
      tooltipText: (payload.tooltipText ?? memorySettings.tooltipText ?? DEFAULT_MASCOT_SETTINGS.tooltipText).trim(),
      showTooltip: payload.showTooltip !== undefined ? Boolean(payload.showTooltip) : (memorySettings.showTooltip ?? true),
      size: typeof payload.size === "number" ? Math.max(36, Math.min(150, payload.size)) : (memorySettings.size ?? 64),
      updatedAt,
    };

    memorySettings = newSettings;

    const d1 = await getD1();
    if (d1) {
      await ensureSettingsTable(d1);
      await d1.prepare(`
        INSERT INTO site_settings (key, value, updated_at) 
        VALUES ('site_mascot_settings', ?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
      `).bind(JSON.stringify(newSettings), updatedAt).run();
    }

    return NextResponse.json({
      success: true,
      message: "อัปเดตการตั้งค่ามาสคอตเลื่อนขึ้นด้านบนสำเร็จ",
      settings: newSettings,
    });
  } catch (error: any) {
    console.error("POST /api/settings/mascot error:", error);
    return NextResponse.json({ error: error?.message || "บันทึกการตั้งค่าไม่สำเร็จ" }, { status: 500 });
  }
}


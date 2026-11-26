export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { checkIsAdmin } from '@/lib/api-auth';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { R2_PREFIX, offloadDataUrl } from '@/lib/r2-storage';
import { getCacheHeaders, resolveR2Url } from '@/lib/media-response';

interface MascotSettings {
  mascotUrl: string;
  mascotAlt: string;
  size: number;
  showTooltip: boolean;
  tooltipText: string;
  updatedAt?: string;
}

const DEFAULT_MASCOT_SETTINGS: MascotSettings = {
  mascotUrl: "/images/artroom-mascot-custom.png",
  mascotAlt: "Art Room Mascot Back to Top",
  size: 110,
  showTooltip: true,
  tooltipText: "ขึ้นด้านบน",
};

let memorySettings: MascotSettings = { ...DEFAULT_MASCOT_SETTINGS };
let settingsTableEnsured = false;

async function getD1() {
  try {
    const ctx = getRequestContext();
    return (ctx?.env as any)?.DB || null;
  } catch {
    return null;
  }
}

async function ensureSettingsTable(d1: any) {
  if (!d1 || settingsTableEnsured) return;
  try {
    await d1.prepare(`
      CREATE TABLE IF NOT EXISTS site_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
    settingsTableEnsured = true;
  } catch (err) {
    console.warn("ensureSettingsTable note:", err);
  }
}

function toClientMascotSettings(settings: MascotSettings): MascotSettings {
  let publicUrl = settings.mascotUrl;
  if (publicUrl?.startsWith(R2_PREFIX)) {
    publicUrl = resolveR2Url(publicUrl) || DEFAULT_MASCOT_SETTINGS.mascotUrl;
  } else if (publicUrl?.startsWith('data:')) {
    const v = encodeURIComponent(settings.updatedAt || '1');
    publicUrl = `/api/media?type=setting&name=mascot&v=${v}`;
  }
  return { ...settings, mascotUrl: publicUrl };
}

export async function GET(request: Request) {
  const headers = getCacheHeaders(request);
  try {
    const d1 = await getD1();
    if (!d1) {
      return NextResponse.json(toClientMascotSettings(memorySettings), { headers });
    }

    let result: any = null;
    try {
      const stmt = d1.prepare(`SELECT value FROM site_settings WHERE key = 'site_mascot_settings'`);
      result = typeof stmt.first === 'function' ? await stmt.first() : (await stmt.all?.())?.results?.[0];
    } catch {
      await ensureSettingsTable(d1);
    }

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

    return NextResponse.json(toClientMascotSettings(memorySettings), { headers });
  } catch (error) {
    console.error("GET /api/settings/mascot error:", error);
    return NextResponse.json(toClientMascotSettings(memorySettings), { headers });
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
        mascotUrl = `data:${file.type || "image/png"};base64,${base64}`;
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
    }

    const d1 = await getD1();
    let existingStoredMascot = memorySettings.mascotUrl || DEFAULT_MASCOT_SETTINGS.mascotUrl;
    if (d1) {
      await ensureSettingsTable(d1);
      const existingRow: any = await d1
        .prepare(`SELECT value FROM site_settings WHERE key = 'site_mascot_settings'`)
        .first()
        .catch(() => null);
      if (existingRow?.value) {
        try {
          const parsed = JSON.parse(existingRow.value);
          if (parsed?.mascotUrl) existingStoredMascot = parsed.mascotUrl;
        } catch {}
      }
    }

    let resolvedMascotUrl = payload.mascotUrl?.trim() || existingStoredMascot;
    if (resolvedMascotUrl.includes('/api/media?type=setting') || resolvedMascotUrl.includes('/api/settings/media')) {
      resolvedMascotUrl = existingStoredMascot;
    } else if (resolvedMascotUrl.startsWith('/api/media?key=')) {
      try {
        const k = new URL(resolvedMascotUrl, 'https://local.invalid').searchParams.get('key');
        if (k) resolvedMascotUrl = `${R2_PREFIX}${k}`;
      } catch {}
    } else if (resolvedMascotUrl.startsWith('data:')) {
      resolvedMascotUrl = await offloadDataUrl(resolvedMascotUrl, `settings/mascot_${Date.now()}`);
    }

    const updatedAt = new Date().toISOString();

    const newSettings: MascotSettings = {
      mascotUrl: resolvedMascotUrl,
      mascotAlt: (payload.mascotAlt ?? memorySettings.mascotAlt ?? DEFAULT_MASCOT_SETTINGS.mascotAlt).trim(),
      tooltipText: (payload.tooltipText ?? memorySettings.tooltipText ?? DEFAULT_MASCOT_SETTINGS.tooltipText).trim(),
      showTooltip: payload.showTooltip !== undefined ? Boolean(payload.showTooltip) : (memorySettings.showTooltip ?? true),
      size: typeof payload.size === "number" ? Math.max(36, Math.min(150, payload.size)) : (memorySettings.size ?? 64),
      updatedAt,
    };

    memorySettings = newSettings;

    if (d1) {
      await d1.prepare(`
        INSERT INTO site_settings (key, value, updated_at) 
        VALUES ('site_mascot_settings', ?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
      `).bind(JSON.stringify(newSettings), updatedAt).run();
    }

    return NextResponse.json({
      success: true,
      message: "อัปเดตการตั้งค่ามาสคอตเลื่อนขึ้นด้านบนสำเร็จ",
      settings: toClientMascotSettings(newSettings),
    });
  } catch (error: any) {
    console.error("POST /api/settings/mascot error:", error);
    return NextResponse.json({ error: error?.message || "บันทึกการตั้งค่าไม่สำเร็จ" }, { status: 500 });
  }
}

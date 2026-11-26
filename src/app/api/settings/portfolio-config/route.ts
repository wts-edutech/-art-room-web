export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { checkIsAdmin } from '@/lib/api-auth';
import { getRequestContext } from '@cloudflare/next-on-pages';
import {
  PortfolioConfigSettings,
  DEFAULT_PORTFOLIO_CONFIG,
} from '@/lib/portfolio-config';

let memoryConfig: PortfolioConfigSettings = { ...DEFAULT_PORTFOLIO_CONFIG };

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
    await d1
      .prepare(`
        CREATE TABLE IF NOT EXISTS site_settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `)
      .run();
  } catch (err) {
    console.warn('ensureSettingsTable note:', err);
  }
}

export async function GET() {
  try {
    const d1 = await getD1();
    if (!d1) {
      return NextResponse.json(memoryConfig);
    }

    await ensureSettingsTable(d1);

    const stmt = d1.prepare(`SELECT value FROM site_settings WHERE key = 'portfolio_config_v1'`);
    const result: any =
      typeof stmt.first === 'function' ? await stmt.first() : (await stmt.all?.())?.results?.[0];

    if (result?.value) {
      try {
        const parsed = JSON.parse(result.value);
        memoryConfig = {
          ...DEFAULT_PORTFOLIO_CONFIG,
          ...parsed,
        };
      } catch (e) {
        console.warn('Failed to parse portfolio_config_v1:', e);
      }
    }

    return NextResponse.json(memoryConfig);
  } catch (error) {
    console.error('GET /api/settings/portfolio-config error:', error);
    return NextResponse.json(memoryConfig);
  }
}

export async function POST(request: Request) {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json(
        { error: 'Unauthorized — เฉพาะผู้ดูแลระบบเท่านั้น' },
        { status: 401 }
      );
    }

    const body: any = await request.json().catch(() => ({}));
    const updatedAt = new Date().toISOString();

    const cleanLevels = Array.isArray(body.levelOptions)
      ? body.levelOptions.map((s: any) => String(s || '').trim()).filter(Boolean)
      : DEFAULT_PORTFOLIO_CONFIG.levelOptions;

    const cleanCosts = Array.isArray(body.costOptions)
      ? body.costOptions.map((s: any) => String(s || '').trim()).filter(Boolean)
      : DEFAULT_PORTFOLIO_CONFIG.costOptions;

    const newConfig: PortfolioConfigSettings = {
      heroButtonText: String(body.heroButtonText ?? DEFAULT_PORTFOLIO_CONFIG.heroButtonText).trim(),
      heroButtonVisible:
        body.heroButtonVisible !== undefined ? Boolean(body.heroButtonVisible) : true,
      topRightHeaderLabel: String(
        body.topRightHeaderLabel ?? DEFAULT_PORTFOLIO_CONFIG.topRightHeaderLabel
      ).trim(),
      coverMainTitle: String(body.coverMainTitle ?? DEFAULT_PORTFOLIO_CONFIG.coverMainTitle).trim(),
      appliedMajorLabel: String(
        body.appliedMajorLabel ?? DEFAULT_PORTFOLIO_CONFIG.appliedMajorLabel
      ).trim(),
      defaultAcademicYear: String(
        body.defaultAcademicYear ?? DEFAULT_PORTFOLIO_CONFIG.defaultAcademicYear
      ).trim(),
      defaultUniversity: String(
        body.defaultUniversity ?? DEFAULT_PORTFOLIO_CONFIG.defaultUniversity
      ).trim(),
      defaultFaculty: String(body.defaultFaculty ?? DEFAULT_PORTFOLIO_CONFIG.defaultFaculty).trim(),
      defaultMajor: String(body.defaultMajor ?? DEFAULT_PORTFOLIO_CONFIG.defaultMajor).trim(),
      defaultProjectRound: String(
        body.defaultProjectRound ?? DEFAULT_PORTFOLIO_CONFIG.defaultProjectRound
      ).trim(),
      defaultSchoolName: String(
        body.defaultSchoolName ?? DEFAULT_PORTFOLIO_CONFIG.defaultSchoolName
      ).trim(),
      defaultSchoolProvince: String(
        body.defaultSchoolProvince ?? DEFAULT_PORTFOLIO_CONFIG.defaultSchoolProvince
      ).trim(),
      defaultStudyPlan: String(
        body.defaultStudyPlan ?? DEFAULT_PORTFOLIO_CONFIG.defaultStudyPlan
      ).trim(),
      pageLimitNoticeText: String(
        body.pageLimitNoticeText ?? DEFAULT_PORTFOLIO_CONFIG.pageLimitNoticeText
      ).trim(),
      sec1Title: String(body.sec1Title ?? DEFAULT_PORTFOLIO_CONFIG.sec1Title).trim(),
      sec1PersonalTitle: String(
        body.sec1PersonalTitle ?? DEFAULT_PORTFOLIO_CONFIG.sec1PersonalTitle
      ).trim(),
      sec1ParentTitle: String(
        body.sec1ParentTitle ?? DEFAULT_PORTFOLIO_CONFIG.sec1ParentTitle
      ).trim(),
      sec1AddressTitle: String(
        body.sec1AddressTitle ?? DEFAULT_PORTFOLIO_CONFIG.sec1AddressTitle
      ).trim(),
      sec1EducationTitle: String(
        body.sec1EducationTitle ?? DEFAULT_PORTFOLIO_CONFIG.sec1EducationTitle
      ).trim(),
      sec1SubjectGradesTitle: String(
        body.sec1SubjectGradesTitle ?? DEFAULT_PORTFOLIO_CONFIG.sec1SubjectGradesTitle
      ).trim(),
      sec2Title: String(body.sec2Title ?? DEFAULT_PORTFOLIO_CONFIG.sec2Title).trim(),
      sec3Title: String(body.sec3Title ?? DEFAULT_PORTFOLIO_CONFIG.sec3Title).trim(),
      sec4_1Title: String(body.sec4_1Title ?? DEFAULT_PORTFOLIO_CONFIG.sec4_1Title).trim(),
      sec4_2Title: String(body.sec4_2Title ?? DEFAULT_PORTFOLIO_CONFIG.sec4_2Title).trim(),
      sec4_3Title: String(body.sec4_3Title ?? DEFAULT_PORTFOLIO_CONFIG.sec4_3Title).trim(),
      sec5Title: String(body.sec5Title ?? DEFAULT_PORTFOLIO_CONFIG.sec5Title).trim(),
      entryAwardResultLabel: String(
        body.entryAwardResultLabel ?? DEFAULT_PORTFOLIO_CONFIG.entryAwardResultLabel
      ).trim(),
      entryRoleResultLabel: String(
        body.entryRoleResultLabel ?? DEFAULT_PORTFOLIO_CONFIG.entryRoleResultLabel
      ).trim(),
      entryDetailLabel: String(
        body.entryDetailLabel ?? DEFAULT_PORTFOLIO_CONFIG.entryDetailLabel
      ).trim(),
      entryGalleryLabel: String(
        body.entryGalleryLabel ?? DEFAULT_PORTFOLIO_CONFIG.entryGalleryLabel
      ).trim(),
      levelOptions: cleanLevels.length > 0 ? cleanLevels : DEFAULT_PORTFOLIO_CONFIG.levelOptions,
      costOptions: cleanCosts.length > 0 ? cleanCosts : DEFAULT_PORTFOLIO_CONFIG.costOptions,
      defaultQuestion1: String(
        body.defaultQuestion1 ?? DEFAULT_PORTFOLIO_CONFIG.defaultQuestion1
      ).trim(),
      updatedAt,
    };

    memoryConfig = newConfig;

    const d1 = await getD1();
    if (d1) {
      await ensureSettingsTable(d1);
      await d1
        .prepare(`
          INSERT INTO site_settings (key, value, updated_at)
          VALUES ('portfolio_config_v1', ?, ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
        `)
        .bind(JSON.stringify(newConfig), updatedAt)
        .run();
    }

    return NextResponse.json({
      success: true,
      config: newConfig,
      message: 'บันทึกการตั้งค่าข้อความและค่าเริ่มต้นระบบแฟ้มสะสมผลงานเรียบร้อยแล้ว',
    });
  } catch (error) {
    console.error('POST /api/settings/portfolio-config error:', error);
    return NextResponse.json({ error: 'Failed to save portfolio config' }, { status: 500 });
  }
}

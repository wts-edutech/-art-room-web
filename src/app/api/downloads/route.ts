export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { checkIsAdmin } from '@/lib/api-auth';
import { getRequestContext } from '@cloudflare/next-on-pages';

const DEFAULT_DOWNLOADS = [
  {
    id: "dl-1",
    title: "ใบงานที่ 1: พื้นฐาน เรื่องของจุดและเส้นสร้างสรรค์",
    description: "เรียนรู้การจัดวาง การสร้างน้ำหนัก และจังหวะของจุดเพื่อสร้างลวดลายและมิติในงานศิลปะเบื้องต้น เหมาะสำหรับผู้เริ่มต้น",
    category: "แบบฝึกหัด",
    grade: "all",
    fileName: "worksheet_01_points_and_lines.pdf",
    fileSize: "1.4 MB",
    fileUrl: "https://pdfobject.com/pdf/sample.pdf",
    downloadsCount: 342,
    orderIndex: 1
  },
  {
    id: "dl-2",
    title: "ใบงานที่ 2: การลงน้ำหนักแสงเงา 7 ระดับ (Value Scale)",
    description: "แบบฝึกปฏิบัติการลงน้ำหนัก 7 ระดับ ด้วยดินสอดำ EE สำหรับผู้เริ่มต้นสร้างความสมจริง มิติ และน้ำหนักแสงเงาให้ชิ้นงาน",
    category: "แบบฝึกหัด",
    grade: "all",
    fileName: "worksheet_02_value_scale_shading.pdf",
    fileSize: "2.1 MB",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    downloadsCount: 890,
    orderIndex: 2
  },
  {
    id: "dl-3",
    title: "ใบงานที่ 3: การเขียนภาพทัศนียภาพ 1 จุด และ 2 จุด (Perspective Drawing)",
    description: "หลักการลากเส้นระดับสายตา (Eye Level) และจุดรวมสายตา (Vanishing Point)",
    category: "แบบฝึกหัด",
    grade: "m4",
    fileName: "worksheet_03_perspective_drawing.pdf",
    fileSize: "3.1 MB",
    fileUrl: "https://pdfobject.com/pdf/sample.pdf",
    downloadsCount: 156,
    orderIndex: 3
  },
  {
    id: "dl-4",
    title: "ใบความรู้: ทฤษฎีสีและวงจรสีสากล 12 สี (Color Theory & Wheel)",
    description: "สรุปแม่สีขั้นที่ 1, 2, 3 วรรณะสี และคู่สีตรงข้าม พร้อมตัวอย่างการผสมสีน้ำและเทคนิคการระบาย",
    category: "ใบความรู้",
    grade: "all",
    fileName: "handbook_color_theory_wheel.pdf",
    fileSize: "2.8 MB",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    downloadsCount: 520,
    orderIndex: 4
  },
  {
    id: "dl-5",
    title: "เกณฑ์การให้คะแนนผลงานทัศนศิลป์ (Art Rubric Assessment Score)",
    description: "เกณฑ์การประเมินความคิดสร้างสรรค์ ความประณีต และการสื่อความหมาย",
    category: "เกณฑ์การประเมิน",
    grade: "all",
    fileName: "art_rubric_assessment_guide.pdf",
    fileSize: "850 KB",
    fileUrl: "https://pdfobject.com/pdf/sample.pdf",
    downloadsCount: 210,
    orderIndex: 5
  },
  {
    id: "dl-6",
    title: "คู่มือนักเรียน: กฎความปลอดภัยและการดูแลรักษาอุปกรณ์ในห้องปฏิบัติการศิลปะ",
    description: "ระเบียบการยืม-คืนพู่กัน การล้างจานสี การทิ้งสารเคมี และมารยาทการใช้ห้อง",
    category: "คู่มือ",
    grade: "all",
    fileName: "art_room_safety_and_rules.pdf",
    fileSize: "1.2 MB",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    downloadsCount: 285,
    orderIndex: 6
  },
];

// Default grade availability: M.3 and M.4 are open, others without docs default to closed
const DEFAULT_GRADE_SETTINGS: Record<string, boolean> = {
  m1: false,
  m2: false,
  m3: true,
  m4: true,
  m5: false,
  m6: false,
};

let memoryGradeSettings = { ...DEFAULT_GRADE_SETTINGS };

async function getD1() {
  try {
    const ctx = getRequestContext();
    return ctx?.env?.DB || null;
  } catch {
    return null;
  }
}

async function ensureTables(d1: any) {
  if (!d1) return;
  try {
    await d1.prepare(`
      CREATE TABLE IF NOT EXISTS downloads (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL DEFAULT 'แบบฝึกหัด',
        grade TEXT NOT NULL DEFAULT 'all',
        file_name TEXT,
        file_size TEXT,
        file_url TEXT NOT NULL,
        image_url TEXT,
        topic TEXT,
        media_type TEXT DEFAULT 'pdf',
        content TEXT,
        downloads_count INTEGER DEFAULT 0,
        order_index INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    // Gracefully add missing columns if table already existed
    const newCols = [
      "ALTER TABLE downloads ADD COLUMN image_url TEXT",
      "ALTER TABLE downloads ADD COLUMN topic TEXT",
      "ALTER TABLE downloads ADD COLUMN media_type TEXT DEFAULT 'pdf'",
      "ALTER TABLE downloads ADD COLUMN content TEXT"
    ];
    for (const sqlQuery of newCols) {
      try {
        await d1.prepare(sqlQuery).run();
      } catch {}
    }

    await d1.prepare(`
      CREATE TABLE IF NOT EXISTS site_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
  } catch (err) {
    console.warn("ensureTables downloads note:", err);
  }
}

export async function GET() {
  try {
    const d1 = await getD1();
    let gradeSettings = { ...memoryGradeSettings };

    if (!d1) {
      return NextResponse.json({
        downloads: DEFAULT_DOWNLOADS,
        gradeSettings
      });
    }

    await ensureTables(d1);

    // Fetch grade settings
    const settingsStmt = d1.prepare(`
      SELECT value FROM site_settings WHERE key = 'downloads_grade_settings'
    `);
    const settingsRow: any = typeof settingsStmt.first === 'function' ? await settingsStmt.first() : (await settingsStmt.all?.())?.results?.[0];

    if (settingsRow?.value) {
      try {
        gradeSettings = { ...DEFAULT_GRADE_SETTINGS, ...JSON.parse(settingsRow.value) };
        memoryGradeSettings = gradeSettings;
      } catch {}
    }

    // Fetch downloads
    const result = await d1.prepare(`
      SELECT 
        id, 
        title, 
        description, 
        category, 
        grade, 
        file_name as fileName, 
        file_size as fileSize, 
        file_url as fileUrl, 
        image_url as imageUrl,
        topic,
        media_type as mediaType,
        content,
        downloads_count as downloadsCount, 
        order_index as orderIndex, 
        created_at as createdAt
      FROM downloads 
      ORDER BY order_index ASC, created_at DESC
    `).all();

    if (!result || !result.results || result.results.length === 0) {
      return NextResponse.json({
        downloads: DEFAULT_DOWNLOADS,
        gradeSettings
      });
    }

    return NextResponse.json({
      downloads: result.results,
      gradeSettings
    });

  } catch (error) {
    console.error("GET /api/downloads error:", error);
    return NextResponse.json({
      downloads: DEFAULT_DOWNLOADS,
      gradeSettings: memoryGradeSettings
    });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json({ error: 'Unauthorized — สำหรับผู้ดูแลระบบเท่านั้น' }, { status: 401 });
    }

    const d1 = await getD1();
    if (!d1) {
      return NextResponse.json({ error: 'Database binding not available' }, { status: 500 });
    }

    await ensureTables(d1);

    const body = await request.json().catch(() => ({}));

    // Action: Reset to Default Data
    if (body.action === 'reset_default_data') {
      await d1.prepare(`DELETE FROM downloads`).run();
      for (const item of DEFAULT_DOWNLOADS) {
        await d1.prepare(`
          INSERT INTO downloads (id, title, description, category, grade, file_name, file_size, file_url, image_url, topic, media_type, downloads_count, order_index)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          item.id,
          item.title,
          item.description,
          item.category,
          item.grade,
          item.fileName,
          item.fileSize,
          item.fileUrl,
          (item as any).imageUrl || null,
          (item as any).topic || null,
          (item as any).mediaType || 'pdf',
          item.downloadsCount || 0,
          item.orderIndex || 1
        ).run();
      }
      return NextResponse.json({ success: true, message: 'Reset to default downloads completed' });
    }

    // Action: Update Grade Availability Settings
    if (body.action === 'update_grades') {
      const newSettings = { ...memoryGradeSettings, ...(body.gradeSettings || {}) };
      memoryGradeSettings = newSettings;

      await d1.prepare(`
        INSERT INTO site_settings (key, value, updated_at)
        VALUES ('downloads_grade_settings', ?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
      `).bind(JSON.stringify(newSettings), new Date().toISOString()).run();

      return NextResponse.json({ success: true, gradeSettings: newSettings });
    }

    // Action: Seed default worksheets
    if (body.action === 'seed') {
      for (const item of DEFAULT_DOWNLOADS) {
        await d1.prepare(`
          INSERT OR REPLACE INTO downloads (id, title, description, category, grade, file_name, file_size, file_url, image_url, topic, media_type, downloads_count, order_index, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          item.id,
          item.title,
          item.description || '',
          item.category || 'แบบฝึกหัด',
          item.grade || 'all',
          item.fileName || '',
          item.fileSize || '1.0 MB',
          item.fileUrl,
          (item as any).imageUrl || null,
          (item as any).topic || null,
          (item as any).mediaType || 'pdf',
          item.downloadsCount || 0,
          item.orderIndex || 0,
          new Date().toISOString()
        ).run();
      }
      return NextResponse.json({ success: true, message: 'Seeded downloads successfully' });
    }

    // Action: Create New Download Item
    const id = body.id || `dl_${Date.now()}`;
    const title = String(body.title || '').trim();
    if (!title) {
      return NextResponse.json({ error: 'กรุณาระบุชื่อเอกสารหรือใบงาน' }, { status: 400 });
    }

    const description = String(body.description || '').trim();
    const category = String(body.category || 'แบบฝึกหัด').trim();
    const grade = String(body.grade || 'all').trim();
    const fileName = String(body.fileName || `${title}.pdf`).trim();
    const fileSize = String(body.fileSize || '1.5 MB').trim();
    const fileUrl = String(body.fileUrl || '').trim();
    const imageUrl = body.imageUrl ? String(body.imageUrl).trim() : null;
    const topic = body.topic ? String(body.topic).trim() : null;
    const mediaType = String(body.mediaType || 'pdf').trim();
    const content = body.content ? String(body.content) : null;
    const orderIndex = Number(body.orderIndex) || 0;
    const createdAt = new Date().toISOString();

    if (!fileUrl) {
      return NextResponse.json({ error: 'กรุณาระบุลิงก์ดาวน์โหลดไฟล์ (PDF หรือ Google Drive)' }, { status: 400 });
    }

    await d1.prepare(`
      INSERT INTO downloads (id, title, description, category, grade, file_name, file_size, file_url, image_url, topic, media_type, content, downloads_count, order_index, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
    `).bind(id, title, description, category, grade, fileName, fileSize, fileUrl, imageUrl, topic, mediaType, content, orderIndex, createdAt).run();

    return NextResponse.json({
      id,
      title,
      description,
      category,
      grade,
      fileName,
      fileSize,
      fileUrl,
      imageUrl,
      topic,
      mediaType,
      content,
      downloadsCount: 0,
      orderIndex,
      createdAt
    }, { status: 201 });

  } catch (error: any) {
    console.error("POST /api/downloads error:", error);
    return NextResponse.json({ error: error?.message || 'Failed to process request' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json({ error: 'Unauthorized — สำหรับผู้ดูแลระบบเท่านั้น' }, { status: 401 });
    }

    const d1 = await getD1();
    if (!d1) {
      return NextResponse.json({ error: 'Database binding not available' }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    const id = body.id;
    if (!id) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    const title = String(body.title || '').trim();
    if (!title) {
      return NextResponse.json({ error: 'กรุณาระบุชื่อเอกสารหรือใบงาน' }, { status: 400 });
    }

    const description = String(body.description || '').trim();
    const category = String(body.category || 'แบบฝึกหัด').trim();
    const grade = String(body.grade || 'all').trim();
    const fileName = String(body.fileName || '').trim();
    const fileSize = String(body.fileSize || '1.0 MB').trim();
    const fileUrl = String(body.fileUrl || '').trim();
    const imageUrl = body.imageUrl ? String(body.imageUrl).trim() : null;
    const topic = body.topic ? String(body.topic).trim() : null;
    const mediaType = String(body.mediaType || 'pdf').trim();
    const content = body.content ? String(body.content) : null;
    const orderIndex = Number(body.orderIndex) || 0;

    await d1.prepare(`
      UPDATE downloads 
      SET title = ?, description = ?, category = ?, grade = ?, file_name = ?, file_size = ?, file_url = ?, image_url = ?, topic = ?, media_type = ?, content = ?, order_index = ?
      WHERE id = ?
    `).bind(title, description, category, grade, fileName, fileSize, fileUrl, imageUrl, topic, mediaType, content, orderIndex, id).run();

    return NextResponse.json({ success: true, id });

  } catch (error: any) {
    console.error("PUT /api/downloads error:", error);
    return NextResponse.json({ error: error?.message || 'Failed to update document' }, { status: 500 });
  }
}


export async function DELETE(request: Request) {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json({ error: 'Unauthorized — สำหรับผู้ดูแลระบบเท่านั้น' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const d1 = await getD1();
    if (!d1) {
      return NextResponse.json({ error: 'Database binding not available' }, { status: 500 });
    }

    await d1.prepare(`DELETE FROM downloads WHERE id = ?`).bind(id).run();
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("DELETE /api/downloads error:", error);
    return NextResponse.json({ error: error?.message || 'Failed to delete document' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const d1 = await getD1();
    if (d1) {
      await d1.prepare(`
        UPDATE downloads SET downloads_count = downloads_count + 1 WHERE id = ?
      `).bind(id).run();
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true });
  }
}

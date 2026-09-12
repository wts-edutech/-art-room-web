export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { checkIsAdmin } from '@/lib/api-auth';
import { getRequestContext } from '@cloudflare/next-on-pages';

const DEFAULT_TEACHERS = [
  {
    id: "teacher-1",
    name: "ครูพิชญ์ชญา วงศ์ศิลป์",
    role: "หัวหน้ากลุ่มสาระการเรียนรู้ศิลปะ",
    position: "ครูชำนาญการพิเศษ",
    grades: "มัธยมศึกษาปีที่ 3 และ มัธยมศึกษาปีที่ 6",
    specialties: "จิตรกรรมสีน้ำ, ทฤษฎีทัศนศิลป์, องค์ประกอบศิลป์",
    bio: "มุ่งเน้นการส่งเสริมให้นักเรียนค้นหาตัวตนผ่านงานศิลปะ และพัฒนาทักษะสู่การประกวดระดับชาติ",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800",
    email: "art.wts@wts.ac.th",
    roomLocation: "ห้องปฏิบัติการศิลปะ 1 (อาคาร 2 ชั้น 3)",
    orderIndex: 1
  },
  {
    id: "teacher-2",
    name: "ครูธีรภัทร จิตรกรรม",
    role: "ครูผู้สอนกลุ่มสาระการเรียนรู้ศิลปะ",
    position: "ครูชำนาญการ",
    grades: "มัธยมศึกษาปีที่ 4 และ มัธยมศึกษาปีที่ 5",
    specialties: "วาดเส้นด้วยดินสอ EE, สีอะคริลิก, การออกแบบผลิตภัณฑ์",
    bio: "ผู้ฝึกสอนนักเรียนตัวแทนโรงเรียนเข้าร่วมการแข่งขันงานศิลปหัตถกรรมนักเรียน ชนะเลิศระดับเหรียญทอง",
    imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800",
    email: "theerapat.j@wts.ac.th",
    roomLocation: "ห้องปฏิบัติการศิลปะ 2 (อาคาร 2 ชั้น 3)",
    orderIndex: 2
  },
  {
    id: "teacher-3",
    name: "ครูชลธิชา นวศิลป์",
    role: "ครูผู้สอนกลุ่มสาระการเรียนรู้ศิลปะ",
    position: "ครูผู้ช่วย",
    grades: "มัธยมศึกษาปีที่ 1 และ มัธยมศึกษาปีที่ 2",
    specialties: "Digital Art, คาแรคเตอร์ดีไซน์, สื่อผสมสร้างสรรค์",
    bio: "ส่งเสริมการเรียนรู้ศิลปะยุคใหม่ด้วย iPad และแท็บเล็ตกราฟิก เพื่อปูทางสู่อุตสาหกรรมสร้างสรรค์",
    imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=800",
    email: "chonthicha.n@wts.ac.th",
    roomLocation: "ห้องปฏิบัติการคอมพิวเตอร์ศิลปะ (อาคาร 2 ชั้น 3)",
    orderIndex: 3
  },
];

async function getD1() {
  try {
    const ctx = getRequestContext();
    return ctx?.env?.DB || null;
  } catch {
    return null;
  }
}

async function ensureTable(d1: any) {
  if (!d1) return;
  try {
    await d1.prepare(`
      CREATE TABLE IF NOT EXISTS teachers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT,
        position TEXT,
        grades TEXT,
        specialties TEXT,
        bio TEXT,
        image_url TEXT,
        email TEXT,
        room_location TEXT,
        order_index INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
  } catch (err) {
    console.warn("ensureTable teachers note:", err);
  }
}

export async function GET() {
  try {
    const d1 = await getD1();
    if (!d1) {
      return NextResponse.json(DEFAULT_TEACHERS);
    }

    await ensureTable(d1);

    const result = await d1.prepare(`
      SELECT 
        id, 
        name, 
        role, 
        position, 
        grades, 
        specialties, 
        bio, 
        image_url as imageUrl, 
        email, 
        room_location as roomLocation, 
        order_index as orderIndex, 
        created_at as createdAt
      FROM teachers 
      ORDER BY order_index ASC, created_at ASC
    `).all();

    if (!result || !result.results || result.results.length === 0) {
      return NextResponse.json(DEFAULT_TEACHERS);
    }

    return NextResponse.json(result.results);
  } catch (error) {
    console.error("GET /api/teachers error:", error);
    return NextResponse.json(DEFAULT_TEACHERS);
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

    await ensureTable(d1);

    let data: any = {};
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      for (const [key, value] of formData.entries()) {
        if (value instanceof File && value.size > 0) {
          const bytes = await value.arrayBuffer();
          const base64 = Buffer.from(bytes).toString('base64');
          data['imageUrl'] = `data:${value.type};base64,${base64}`;
        } else if (typeof value === 'string') {
          data[key] = value;
        }
      }
    } else {
      data = await request.json().catch(() => ({}));
    }

    // Handle Seed Request
    if (data.action === 'seed') {
      for (const t of DEFAULT_TEACHERS) {
        await d1.prepare(`
          INSERT OR REPLACE INTO teachers (id, name, role, position, grades, specialties, bio, image_url, email, room_location, order_index, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          t.id,
          t.name,
          t.role || '',
          t.position || '',
          t.grades || '',
          t.specialties || '',
          t.bio || '',
          t.imageUrl || '',
          t.email || '',
          t.roomLocation || '',
          t.orderIndex || 0,
          new Date().toISOString()
        ).run();
      }
      return NextResponse.json({ success: true, message: 'Seeded successfully' });
    }

    const id = data.id || `teacher_${Date.now()}`;
    const name = String(data.name || '').trim();
    if (!name) {
      return NextResponse.json({ error: 'กรุณาระบุชื่อ-นามสกุลครูผู้สอน' }, { status: 400 });
    }

    const role = String(data.role || 'ครูผู้สอนกลุ่มสาระการเรียนรู้ศิลปะ').trim();
    const position = String(data.position || 'ครูผู้สอน').trim();
    const grades = String(data.grades || '').trim();
    const specialties = String(data.specialties || '').trim();
    const bio = String(data.bio || '').trim();
    const imageUrl = String(data.imageUrl || data.image || '').trim();
    const email = String(data.email || '').trim();
    const roomLocation = String(data.roomLocation || '').trim();
    const orderIndex = Number(data.orderIndex) || 0;
    const createdAt = new Date().toISOString();

    await d1.prepare(`
      INSERT INTO teachers (id, name, role, position, grades, specialties, bio, image_url, email, room_location, order_index, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(id, name, role, position, grades, specialties, bio, imageUrl, email, roomLocation, orderIndex, createdAt).run();

    return NextResponse.json({
      id,
      name,
      role,
      position,
      grades,
      specialties,
      bio,
      imageUrl,
      email,
      roomLocation,
      orderIndex,
      createdAt
    }, { status: 201 });

  } catch (error: any) {
    console.error("POST /api/teachers error:", error);
    return NextResponse.json({ error: error?.message || 'Failed to create teacher' }, { status: 500 });
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

    let data: any = {};
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      for (const [key, value] of formData.entries()) {
        if (value instanceof File && value.size > 0) {
          const bytes = await value.arrayBuffer();
          const base64 = Buffer.from(bytes).toString('base64');
          data['imageUrl'] = `data:${value.type};base64,${base64}`;
        } else if (typeof value === 'string') {
          data[key] = value;
        }
      }
    } else {
      data = await request.json().catch(() => ({}));
    }

    const id = data.id;
    if (!id) {
      return NextResponse.json({ error: 'Teacher ID is required' }, { status: 400 });
    }

    const name = String(data.name || '').trim();
    if (!name) {
      return NextResponse.json({ error: 'กรุณาระบุชื่อ-นามสกุลครูผู้สอน' }, { status: 400 });
    }

    const role = String(data.role || 'ครูผู้สอนกลุ่มสาระการเรียนรู้ศิลปะ').trim();
    const position = String(data.position || 'ครูผู้สอน').trim();
    const grades = String(data.grades || '').trim();
    const specialties = String(data.specialties || '').trim();
    const bio = String(data.bio || '').trim();
    const imageUrl = String(data.imageUrl || data.image || '').trim();
    const email = String(data.email || '').trim();
    const roomLocation = String(data.roomLocation || '').trim();
    const orderIndex = Number(data.orderIndex) || 0;

    await d1.prepare(`
      UPDATE teachers 
      SET name = ?, role = ?, position = ?, grades = ?, specialties = ?, bio = ?, image_url = ?, email = ?, room_location = ?, order_index = ?
      WHERE id = ?
    `).bind(name, role, position, grades, specialties, bio, imageUrl, email, roomLocation, orderIndex, id).run();

    return NextResponse.json({ success: true, id });

  } catch (error: any) {
    console.error("PUT /api/teachers error:", error);
    return NextResponse.json({ error: error?.message || 'Failed to update teacher' }, { status: 500 });
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

    await d1.prepare(`DELETE FROM teachers WHERE id = ?`).bind(id).run();
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("DELETE /api/teachers error:", error);
    return NextResponse.json({ error: error?.message || 'Failed to delete teacher' }, { status: 500 });
  }
}

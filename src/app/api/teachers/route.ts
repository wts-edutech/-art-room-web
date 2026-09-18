export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { checkIsAdmin } from '@/lib/api-auth';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const DEFAULT_KRU_KAE = {
  id: "teacher-kae",
  name: "ครูชญานิษฐ์ ศิลป์ประเสริฐ (ครูเก๋)",
  role: "หัวหน้ากลุ่มสาระการเรียนรู้ศิลปะ",
  position: "ครูชำนาญการพิเศษ",
  grades: "มัธยมศึกษาปีที่ 3 และ มัธยมศึกษาปีที่ 6",
  specialties: "ทัศนศิลป์, จิตรกรรมสีน้ำและสีน้ำมัน, การสร้างสรรค์สื่อผสม, การสอนศิลปะเพื่อพัฒนาทักษะชีวิต",
  bio: "มุ่งเน้นการจุดประกายความคิดสร้างสรรค์ ส่งเสริมให้นักเรียนค้นพบเอกลักษณ์ของตนเองผ่านงานศิลปะ พร้อมเปิดโอกาสสู่เวทีการประกวดระดับประเทศและระดับสากล",
  imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800",
  email: "krukae.art@wts.ac.th",
  roomLocation: "ห้องปฏิบัติการศิลปะ 1 (อาคาร 2 ชั้น 3)",
  orderIndex: 1,
  education: [
    {
      id: "edu-1",
      level: "ปริญญาตรี",
      degree: "ศิลปศาสตรบัณฑิต (ศศ.บ.)",
      major: "สาขาวิชาทัศนศิลป์ (จิตรกรรม)",
      institution: "มหาวิทยาลัยศิลปากร",
      graduationYear: "2556"
    },
    {
      id: "edu-2",
      level: "ปริญญาโท",
      degree: "ครุศาสตรมหาบัณฑิต (ค.ม.)",
      major: "สาขาวิชาศิลปศึกษา",
      institution: "จุฬาลงกรณ์มหาวิทยาลัย",
      graduationYear: "2561"
    }
  ],
  experience: [
    {
      id: "exp-1",
      role: "ครูผู้สอนวิชาทัศนศิลป์ และหัวหน้ากลุ่มสาระฯ ศิลปะ",
      workplace: "โรงเรียนวชิรธรรมสาธิต",
      period: "2561 - ปัจจุบัน",
      details: "ผู้รับผิดชอบโครงการ Art Room Creative Space และพัฒนาหลักสูตรสื่อการสอนศิลปะออนไลน์"
    },
    {
      id: "exp-2",
      role: "ครูผู้สอนศิลปศึกษา",
      workplace: "โรงเรียนมัธยมวัดธาตุทอง",
      period: "2557 - 2560",
      details: "ผู้ฝึกซ้อมนักเรียนแข่งขันงานศิลปหัตถกรรมนักเรียน ชนะเลิศระดับเหรียญทอง"
    }
  ],
  awards: [
    {
      id: "award-1",
      title: "รางวัลครูผู้สอนดีเด่น กลุ่มสาระการเรียนรู้ศิลปะ ระดับเหรียญทอง",
      year: "2566",
      issuer: "สำนักงานเขตพื้นที่การศึกษามัธยมศึกษากรุงเทพมหานคร เขต 2",
      imageUrl: "https://images.unsplash.com/photo-1578269174936-2709b6aeb913?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: "award-2",
      title: "ครูผู้ฝึกสอนนักเรียนได้รับรางวัลชนะเลิศ การประกวดวาดภาพระดับชาติ",
      year: "2565",
      issuer: "กระทรวงวัฒนธรรม ร่วมกับ หอศิลปวัฒนธรรมแห่งกรุงเทพมหานคร",
      imageUrl: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&q=80&w=800"
    }
  ],
  activityImages: [
    {
      id: "act-1",
      title: "กิจกรรม Workshop วาดเส้นและลงสีน้ำกลางแจ้งริมสวน",
      date: "14 กุมภาพันธ์ 2567",
      imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f80df?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: "act-2",
      title: "นิทรรศการแสดงผลงานศิลปะนักเรียน Art Room Annual Exhibition",
      date: "18 มกราคม 2567",
      imageUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: "act-3",
      title: "การจัดมุมเรียนรู้สื่อผสมและ Digital Painting ในห้องเรียน",
      date: "5 พฤศจิกายน 2566",
      imageUrl: "https://images.unsplash.com/photo-1599423300746-b62533397364?auto=format&fit=crop&q=80&w=800"
    }
  ]
};

const DEFAULT_TEACHERS = [DEFAULT_KRU_KAE];

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
        education TEXT,
        experience TEXT,
        awards TEXT,
        activity_images TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    // Migrate new columns if older table already exists
    try { await d1.prepare(`ALTER TABLE teachers ADD COLUMN education TEXT`).run(); } catch {}
    try { await d1.prepare(`ALTER TABLE teachers ADD COLUMN experience TEXT`).run(); } catch {}
    try { await d1.prepare(`ALTER TABLE teachers ADD COLUMN awards TEXT`).run(); } catch {}
    try { await d1.prepare(`ALTER TABLE teachers ADD COLUMN activity_images TEXT`).run(); } catch {}
  } catch (err) {
    console.warn("ensureTable teachers note:", err);
  }
}

// Safely parse JSON or return default
function safeJsonParse(val: any, fallback: any = []) {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
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
        education,
        experience,
        awards,
        activity_images as activityImages,
        created_at as createdAt
      FROM teachers 
      ORDER BY order_index ASC, created_at ASC
    `).all();

    if (!result || !result.results || result.results.length === 0) {
      return NextResponse.json(DEFAULT_TEACHERS);
    }

    const parsed = result.results.map((item: any) => ({
      ...item,
      education: safeJsonParse(item.education, DEFAULT_KRU_KAE.education),
      experience: safeJsonParse(item.experience, DEFAULT_KRU_KAE.experience),
      awards: safeJsonParse(item.awards, DEFAULT_KRU_KAE.awards),
      activityImages: safeJsonParse(item.activityImages, DEFAULT_KRU_KAE.activityImages),
    }));

    return NextResponse.json(parsed);
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
          data[key] = `data:${value.type};base64,${base64}`;
        } else if (typeof value === 'string') {
          data[key] = value;
        }
      }
    } else {
      data = await request.json().catch(() => ({}));
    }

    // Handle Seed / Reset to Kru Kae
    if (data.action === 'seed') {
      await d1.prepare(`DELETE FROM teachers`).run();
      const t = DEFAULT_KRU_KAE;
      await d1.prepare(`
        INSERT OR REPLACE INTO teachers (id, name, role, position, grades, specialties, bio, image_url, email, room_location, order_index, education, experience, awards, activity_images, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        t.id,
        t.name,
        t.role,
        t.position,
        t.grades,
        t.specialties,
        t.bio,
        t.imageUrl,
        t.email,
        t.roomLocation,
        t.orderIndex,
        JSON.stringify(t.education),
        JSON.stringify(t.experience),
        JSON.stringify(t.awards),
        JSON.stringify(t.activityImages),
        new Date().toISOString()
      ).run();

      return NextResponse.json({ success: true, message: 'Reset to Kru Kae data successfully' });
    }

    const id = data.id || "teacher-kae";
    const name = String(data.name || '').trim();
    if (!name) {
      return NextResponse.json({ error: 'กรุณาระบุชื่อ-นามสกุล' }, { status: 400 });
    }

    const role = String(data.role || 'หัวหน้ากลุ่มสาระการเรียนรู้ศิลปะ').trim();
    const position = String(data.position || 'ครูชำนาญการพิเศษ').trim();
    const grades = String(data.grades || '').trim();
    const specialties = String(data.specialties || '').trim();
    const bio = String(data.bio || '').trim();
    const imageUrl = String(data.imageUrl || data.image || '').trim();
    const email = String(data.email || '').trim();
    const roomLocation = String(data.roomLocation || '').trim();
    const orderIndex = Number(data.orderIndex) || 1;
    const education = typeof data.education === 'string' ? data.education : JSON.stringify(data.education || []);
    const experience = typeof data.experience === 'string' ? data.experience : JSON.stringify(data.experience || []);
    const awards = typeof data.awards === 'string' ? data.awards : JSON.stringify(data.awards || []);
    const activityImages = typeof data.activityImages === 'string' ? data.activityImages : JSON.stringify(data.activityImages || []);
    const createdAt = new Date().toISOString();

    await d1.prepare(`
      INSERT OR REPLACE INTO teachers (id, name, role, position, grades, specialties, bio, image_url, email, room_location, order_index, education, experience, awards, activity_images, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, name, role, position, grades, specialties, bio, imageUrl, email, roomLocation, orderIndex,
      education, experience, awards, activityImages, createdAt
    ).run();

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
      education: safeJsonParse(education),
      experience: safeJsonParse(experience),
      awards: safeJsonParse(awards),
      activityImages: safeJsonParse(activityImages),
      createdAt
    }, { status: 201 });

  } catch (error: any) {
    console.error("POST /api/teachers error:", error);
    return NextResponse.json({ error: error?.message || 'Failed to save teacher profile' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  // Direct delegation to POST handles INSERT OR REPLACE cleanly
  return POST(request);
}

export async function DELETE(request: Request) {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json({ error: 'Unauthorized — สำหรับผู้ดูแลระบบเท่านั้น' }, { status: 401 });
    }

    const d1 = await getD1();
    if (!d1) {
      return NextResponse.json({ error: 'Database binding not available' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await ensureTable(d1);
    await d1.prepare(`DELETE FROM teachers WHERE id = ?`).bind(id).run();

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error("DELETE /api/teachers error:", error);
    return NextResponse.json({ error: error?.message || 'Failed to delete' }, { status: 500 });
  }
}

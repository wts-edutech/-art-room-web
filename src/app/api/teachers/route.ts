export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { checkIsAdmin } from '@/lib/api-auth';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { R2_PREFIX, offloadDataUrl } from '@/lib/r2-storage';
import { getCacheHeaders, resolveR2Url } from '@/lib/media-response';

export const DEFAULT_KRU_KAE = {
  id: "teacher-kae",
  name: "นางสาวสีวลี ยืนยาว (ครูเก๋)",
  role: "กลุ่มสาระการเรียนรู้ศิลปะ",
  position: "ครูชำนาญการ",
  grades: "มัธยมศึกษาปีที่ 3 และ มัธยมศึกษาปีที่ 6",
  specialties: "ทัศนศิลป์, จิตรกรรมสีน้ำและสีน้ำมัน, การสร้างสรรค์สื่อผสม, การสอนศิลปะเพื่อพัฒนาทักษะชีวิต",
  bio: "มุ่งเน้นการจุดประกายความคิดสร้างสรรค์ ส่งเสริมให้นักเรียนค้นพบเอกลักษณ์ของตนเองผ่านงานศิลปะ พร้อมเปิดโอกาสสู่เวทีการประกวดระดับประเทศและระดับสากล",
  imageUrl: "/images/kru-kae-photo.jpg",
  email: "krusiwalee@gmail.com",
  roomLocation: "ห้องปฏิบัติการศิลปะ 126 (อาคาร 1 ชั้น 2)",
  orderIndex: 1,
  education: [
    {
      id: "edu-1",
      level: "ปริญญาตรี",
      degree: "ศึกษาศาสตรบัณฑิต",
      major: "สาขาวิชาศิลปศึกษา",
      institution: "มหาวิทยาลัยบูรพา",
      graduationYear: "2555"
    },
    {
      id: "edu-2",
      level: "ปริญญาโท",
      degree: "ศึกษาศาสตรมหาบัณฑิต",
      major: "สาขาวิชาศิลปศึกษา",
      institution: "มหาวิทยาลัยรามคำแหง",
      graduationYear: "2560"
    }
  ],
  experience: [
    {
      id: "exp-1",
      role: "ครูผู้สอนวิชาทัศนศิลป์",
      workplace: "โรงเรียนมัธยมวัดธาตุทอง",
      period: "2555 - 2560",
      details: "ผู้รับผิดชอบโครงการ Art Room Creative Space และพัฒนาหลักสูตรสื่อการสอนศิลปะออนไลน์"
    },
    {
      id: "exp-2",
      role: "ครูผู้สอนวิชาทัศนศิลป์",
      workplace: "โรงเรียนวชิรธรรมสาธิต",
      period: "2560 - ปัจจุบัน",
      details: "ผู้ฝึกซ้อมนักเรียนแข่งขันทักษะศิลปหัตถกรรมนักเรียน ชนะเลิศระดับเหรียญทอง"
    }
  ],
  awards: [
    {
      id: "award-1",
      title: "รางวัลครูผู้สอนดีเด่น กลุ่มสาระการเรียนรู้ศิลปะ ระดับเหรียญทอง",
      year: "2566",
      issuer: "สำนักงานเขตพื้นที่การศึกษามัธยมศึกษากรุงเทพมหานคร เขต 2",
      imageUrl: "https://images.unsplash.com/photo-1578269174936-2709b6aeb913?auto=format&fit=crop&q=80&w=800",
      images: [
        "https://images.unsplash.com/photo-1578269174936-2709b6aeb913?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&q=80&w=800"
      ],
      coverImage: "https://images.unsplash.com/photo-1578269174936-2709b6aeb913?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: "award-2",
      title: "ครูผู้ฝึกสอนนักเรียนได้รับรางวัลชนะเลิศ การประกวดวาดภาพระดับชาติ",
      year: "2565",
      issuer: "กระทรวงวัฒนธรรม ร่วมกับ หอศิลปวัฒนธรรมแห่งกรุงเทพมหานคร",
      imageUrl: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&q=80&w=800",
      images: [
        "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&q=80&w=800"
      ],
      coverImage: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&q=80&w=800"
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
  ],
  innovations: [
    {
      id: "inno-1",
      title: "นวัตกรรมการจัดการเรียนรู้แบบผสมผสาน Art Room Creative Model ผ่านสื่อดิจิทัลเสมือนจริง",
      category: "นวัตกรรมการจัดการเรียนรู้",
      year: "2567",
      description: "การพัฒนารูปแบบการสอนศิลปะร่วมสมัยที่บูรณาการเทคโนโลยี Digital Art และ Virtual Exhibition เพื่อยกระดับความคิดสร้างสรรค์และทักษะแห่งศตวรรษที่ 21 ของนักเรียนระดับชั้นมัธยมศึกษา",
      coverImageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800",
      websiteUrl: "https://art-room-web.pages.dev/materials/m3",
      pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      pdfFileName: "รายงานรูปเล่มนวัตกรรม_ArtRoom_Model_2567.pdf",
      pdfFileSize: "4.2 MB",
      isPublished: true
    },
    {
      id: "inno-2",
      title: "ชุดสื่อการสอนออนไลน์และเอกสารประกอบการเรียนรู้ทัศนศิลป์ ม.3 (Perspective & Visual Arts)",
      category: "สื่อนวัตกรรมดิจิทัล",
      year: "2566",
      description: "สื่อนวัตกรรมการสอนทัศนศิลป์เรื่องการวาดภาพทัศนียภาพ 1 จุด และ 2 จุด พร้อมชุดวิดีโอสาธิตและใบงานฝึกปฏิบัติการสร้างสรรค์ผลงาน",
      coverImageUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800",
      websiteUrl: "https://inskru.com",
      pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      pdfFileName: "ชุดเอกสารการเรียนรู้ทัศนศิลป์_ม3.pdf",
      pdfFileSize: "2.8 MB",
      isPublished: true
    }
  ]
};

const DEFAULT_TEACHERS = [DEFAULT_KRU_KAE];

async function getD1() {
  try {
    const ctx = getRequestContext();
    return (ctx?.env as any)?.DB || null;
  } catch {
    return null;
  }
}

let teachersTableEnsured = false;
async function ensureTable(d1: any) {
  if (!d1 || teachersTableEnsured) return;
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
        innovations TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    try { await d1.prepare(`ALTER TABLE teachers ADD COLUMN education TEXT`).run(); } catch {}
    try { await d1.prepare(`ALTER TABLE teachers ADD COLUMN experience TEXT`).run(); } catch {}
    try { await d1.prepare(`ALTER TABLE teachers ADD COLUMN awards TEXT`).run(); } catch {}
    try { await d1.prepare(`ALTER TABLE teachers ADD COLUMN activity_images TEXT`).run(); } catch {}
    try { await d1.prepare(`ALTER TABLE teachers ADD COLUMN innovations TEXT`).run(); } catch {}
    teachersTableEnsured = true;
  } catch (err) {
    console.warn("ensureTable teachers note:", err);
  }
}

function safeJsonParse(val: any, fallback: any = []) {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

function toLightMediaUrl(raw: any, proxyUrl: string): any {
  if (!raw || typeof raw !== 'string') return raw;
  if (raw.startsWith(R2_PREFIX)) return resolveR2Url(raw);
  if (raw.startsWith('data:')) return proxyUrl;
  return raw;
}

function lightenTeacherItem(item: any) {
  const tid = encodeURIComponent(item.id || 'teacher-kae');
  const awards = safeJsonParse(item.awards, DEFAULT_KRU_KAE.awards).map((a: any, idx: number) => {
    const itemId = encodeURIComponent(String(a?.id ?? idx));
    return {
      ...a,
      imageUrl: toLightMediaUrl(a?.imageUrl, `/api/teachers/image?id=${tid}&section=award&itemId=${itemId}&field=imageUrl`),
      coverImage: toLightMediaUrl(a?.coverImage, `/api/teachers/image?id=${tid}&section=award&itemId=${itemId}&field=coverImage`),
      images: Array.isArray(a?.images)
        ? a.images.map((img: any, imgIdx: number) =>
            toLightMediaUrl(img, `/api/teachers/image?id=${tid}&section=award&itemId=${itemId}&field=images&index=${imgIdx}`)
          )
        : a?.images,
    };
  });

  const activityImages = safeJsonParse(item.activityImages, DEFAULT_KRU_KAE.activityImages).map((a: any, idx: number) => {
    const itemId = encodeURIComponent(String(a?.id ?? idx));
    return {
      ...a,
      imageUrl: toLightMediaUrl(a?.imageUrl, `/api/teachers/image?id=${tid}&section=activity&itemId=${itemId}`),
    };
  });

  const innovations = safeJsonParse(item.innovations, DEFAULT_KRU_KAE.innovations).map((inno: any, idx: number) => {
    const itemId = encodeURIComponent(String(inno?.id ?? idx));
    return {
      ...inno,
      coverImageUrl: toLightMediaUrl(inno?.coverImageUrl, `/api/teachers/image?id=${tid}&section=innovation&itemId=${itemId}&field=coverImageUrl`),
      pdfUrl: toLightMediaUrl(inno?.pdfUrl, `/api/teachers/image?id=${tid}&section=innovation&itemId=${itemId}&field=pdfUrl`),
    };
  });

  return {
    ...item,
    imageUrl: toLightMediaUrl(item.imageUrl, `/api/teachers/image?id=${tid}&section=avatar`),
    education: safeJsonParse(item.education, DEFAULT_KRU_KAE.education),
    experience: safeJsonParse(item.experience, DEFAULT_KRU_KAE.experience),
    awards,
    activityImages,
    innovations,
  };
}

/** Resolve echoed /api/teachers/image or /api/media URLs back to existing stored values, and offload new data: URLs to R2 */
async function resolveAndOffloadMedia(val: any, existingVal: any, r2KeyBase: string): Promise<any> {
  if (!val || typeof val !== 'string') return val;
  if (val.includes('/api/teachers/image')) {
    return existingVal || val;
  }
  if (val.startsWith('/api/media?key=')) {
    try {
      const u = new URL(val, 'https://local.invalid');
      const k = u.searchParams.get('key');
      if (k) return `${R2_PREFIX}${k}`;
    } catch {}
    return existingVal || val;
  }
  if (val.startsWith('data:')) {
    return offloadDataUrl(val, r2KeyBase);
  }
  return val;
}

const SELECT_TEACHERS_SQL = `
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
    innovations,
    created_at as createdAt
  FROM teachers 
  ORDER BY order_index ASC, created_at ASC
`;

export async function GET(request: Request) {
  try {
    const d1 = await getD1();
    if (!d1) {
      return NextResponse.json(DEFAULT_TEACHERS, { headers: getCacheHeaders(request, true) });
    }

    let result;
    try {
      result = await d1.prepare(SELECT_TEACHERS_SQL).all();
    } catch {
      await ensureTable(d1);
      result = await d1.prepare(SELECT_TEACHERS_SQL).all();
    }

    if (!result || !result.results || result.results.length === 0) {
      return NextResponse.json(DEFAULT_TEACHERS, { headers: getCacheHeaders(request, true) });
    }

    const parsed = result.results.map((item: any) => lightenTeacherItem(item));
    return NextResponse.json(parsed, { headers: getCacheHeaders(request, true) });
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
        INSERT OR REPLACE INTO teachers (id, name, role, position, grades, specialties, bio, image_url, email, room_location, order_index, education, experience, awards, activity_images, innovations, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        JSON.stringify(t.innovations),
        new Date().toISOString()
      ).run();

      return NextResponse.json({ success: true, message: 'Reset to Kru Kae data successfully' });
    }

    const id = data.id || "teacher-kae";
    const name = String(data.name || '').trim();
    if (!name) {
      return NextResponse.json({ error: 'กรุณาระบุชื่อ-นามสกุล' }, { status: 400 });
    }

    // Load existing row so proxy URLs echoed back by Admin preserve stored blobs/R2 refs
    const existingRow: any = await d1
      .prepare('SELECT image_url as imageUrl, awards, activity_images as activityImages, innovations FROM teachers WHERE id = ?')
      .bind(id)
      .first()
      .catch(() => null);

    const existingAwards = safeJsonParse(existingRow?.awards, []);
    const existingActivities = safeJsonParse(existingRow?.activityImages, []);
    const existingInnovations = safeJsonParse(existingRow?.innovations, []);

    const stamp = Date.now();
    const role = String(data.role || 'หัวหน้ากลุ่มสาระการเรียนรู้ศิลปะ').trim();
    const position = String(data.position || 'ครูชำนาญการพิเศษ').trim();
    const grades = String(data.grades || '').trim();
    const specialties = String(data.specialties || '').trim();
    const bio = String(data.bio || '').trim();
    const rawImageUrl = String(data.imageUrl || data.image || '').trim();
    const imageUrl = await resolveAndOffloadMedia(rawImageUrl, existingRow?.imageUrl, `teachers/${id}/avatar_${stamp}`);
    const email = String(data.email || '').trim();
    const roomLocation = String(data.roomLocation || '').trim();
    const orderIndex = Number(data.orderIndex) || 1;
    const education = typeof data.education === 'string' ? data.education : JSON.stringify(data.education || []);
    const experience = typeof data.experience === 'string' ? data.experience : JSON.stringify(data.experience || []);

    const incomingAwards = safeJsonParse(data.awards, []);
    const processedAwards = await Promise.all(
      incomingAwards.map(async (a: any, idx: number) => {
        const prev = existingAwards.find((e: any, eIdx: number) => String(e?.id ?? eIdx) === String(a?.id ?? idx));
        const aId = a?.id || `aw_${idx}`;
        const nextImages = Array.isArray(a?.images)
          ? await Promise.all(
              a.images.map((img: any, imgIdx: number) =>
                resolveAndOffloadMedia(img, prev?.images?.[imgIdx], `teachers/${id}/awards/${aId}_${stamp}_${imgIdx}`)
              )
            )
          : a?.images;
        return {
          ...a,
          imageUrl: await resolveAndOffloadMedia(a?.imageUrl, prev?.imageUrl, `teachers/${id}/awards/${aId}_img_${stamp}`),
          coverImage: await resolveAndOffloadMedia(a?.coverImage, prev?.coverImage, `teachers/${id}/awards/${aId}_cov_${stamp}`),
          images: nextImages,
        };
      })
    );

    const incomingActivities = safeJsonParse(data.activityImages, []);
    const processedActivities = await Promise.all(
      incomingActivities.map(async (a: any, idx: number) => {
        const prev = existingActivities.find((e: any, eIdx: number) => String(e?.id ?? eIdx) === String(a?.id ?? idx));
        const aId = a?.id || `act_${idx}`;
        return {
          ...a,
          imageUrl: await resolveAndOffloadMedia(a?.imageUrl, prev?.imageUrl, `teachers/${id}/activities/${aId}_${stamp}`),
        };
      })
    );

    const incomingInnovations = safeJsonParse(data.innovations, []);
    const processedInnovations = await Promise.all(
      incomingInnovations.map(async (inno: any, idx: number) => {
        const prev = existingInnovations.find((e: any, eIdx: number) => String(e?.id ?? eIdx) === String(inno?.id ?? idx));
        const iId = inno?.id || `inno_${idx}`;
        return {
          ...inno,
          coverImageUrl: await resolveAndOffloadMedia(inno?.coverImageUrl, prev?.coverImageUrl, `teachers/${id}/innovations/${iId}_cov_${stamp}`),
          pdfUrl: await resolveAndOffloadMedia(inno?.pdfUrl, prev?.pdfUrl, `teachers/${id}/innovations/${iId}_pdf_${stamp}`),
        };
      })
    );

    const awardsJson = JSON.stringify(processedAwards);
    const activityImagesJson = JSON.stringify(processedActivities);
    const innovationsJson = JSON.stringify(processedInnovations);
    const createdAt = new Date().toISOString();

    await d1.prepare(`
      INSERT OR REPLACE INTO teachers (id, name, role, position, grades, specialties, bio, image_url, email, room_location, order_index, education, experience, awards, activity_images, innovations, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, name, role, position, grades, specialties, bio, imageUrl, email, roomLocation, orderIndex,
      education, experience, awardsJson, activityImagesJson, innovationsJson, createdAt
    ).run();

    const saved = lightenTeacherItem({
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
      education,
      experience,
      awards: awardsJson,
      activityImages: activityImagesJson,
      innovations: innovationsJson,
      createdAt,
    });

    return NextResponse.json(saved, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/teachers error:", error);
    return NextResponse.json({ error: error?.message || 'Failed to save teacher profile' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
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

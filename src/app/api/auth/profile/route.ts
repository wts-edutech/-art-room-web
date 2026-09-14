export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { students } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/auth-utils';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    let session = null;
    if (token) {
      session = await verifySessionToken(token);
    }

    return NextResponse.json({
      authenticated: !!session,
      user: session ? {
        id: session.id,
        name: session.name,
        role: session.role,
      } : null,
    });
  } catch (error) {
    console.error("GET /api/auth/profile error:", error);
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { name, phone, grade, avatar, displayName, studentId } = body;

    // If student ID is provided, optionally update database
    if (studentId && name) {
      try {
        const db = getDb();
        const existing = await db.select().from(students).where(eq(students.id, String(studentId))).get();
        if (existing) {
          await db.update(students).set({ name: String(name).trim() }).where(eq(students.id, String(studentId)));
        }
      } catch (dbErr) {
        console.warn("DB update student error (continuing with client sync):", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "บันทึกการเปลี่ยนแปลงโปรไฟล์สำเร็จ",
      profile: {
        name: name ? String(name).trim() : undefined,
        displayName: displayName ? String(displayName).trim() : undefined,
        phone: phone ? String(phone).trim() : undefined,
        grade: grade ? String(grade).trim() : undefined,
        avatar: avatar ? String(avatar).trim() : undefined,
      },
    });
  } catch (error) {
    console.error("POST /api/auth/profile error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" }, { status: 500 });
  }
}

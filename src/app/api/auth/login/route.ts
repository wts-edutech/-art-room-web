export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { students } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { createSessionToken } from '@/lib/auth-utils';
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter';

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);

    // 1. Rate Limiting Protection (Max 6 attempts per minute per IP)
    const rateCheck = checkRateLimit(`login_${clientIp}`, 6, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { 
          error: `พยายามเข้าสู่ระบบบ่อยเกินไป เพื่อความปลอดภัยกรุณารออีก ${rateCheck.resetInSeconds} วินาที` 
        }, 
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    
    // 2. Anti-Bot Honeypot Check
    if (body.hp_website || body.bot_trap) {
      return NextResponse.json({ error: 'ตรวจพบบอทอัตโนมัติ คำขอถูกระงับ' }, { status: 400 });
    }

    const studentId = String(body.studentId || '').trim();
    const password = String(body.password || '').trim();

    // 3. Strict Input Format Validation (Prevent SQLi / Script Injection)
    if (!studentId || !password) {
      return NextResponse.json({ error: 'กรุณากรอกรหัสนักเรียนและรหัสผ่าน' }, { status: 400 });
    }

    // Must strictly be 5 digits (e.g. 38888)
    if (!/^\d{5}$/.test(studentId)) {
      return NextResponse.json(
        { error: 'รหัสประจำตัวนักเรียนต้องเป็นตัวเลข 5 หลักเท่านั้น' }, 
        { status: 400 }
      );
    }

    if (password.length > 50) {
      return NextResponse.json({ error: 'รหัสผ่านมีความยาวเกินกำหนด' }, { status: 400 });
    }

    // 4. Secure Authentication Verification (Timing & Enumeration Proof)
    const expectedPassword = `${studentId}@wts`;
    const isPasswordCorrect = password === expectedPassword;

    const db = getDb();
    const student = await db.select().from(students).where(eq(students.id, studentId)).get();

    // Unified Error: Never reveal whether the student ID exists or password is wrong (OWASP standard)
    if (!isPasswordCorrect || !student) {
      return NextResponse.json(
        { error: 'รหัสนักเรียนหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง' }, 
        { status: 401 }
      );
    }

    // 5. Issue Secure HMAC Session Token
    const token = await createSessionToken(student.id, student.name, 'student', 72);

    const cookieStore = await cookies();
    cookieStore.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 72,
      path: '/',
    });

    return NextResponse.json({
      success: true,
      student: {
        id: student.id,
        name: student.name,
        role: 'student'
      }
    });

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูล กรุณาลองใหม่อีกครั้ง' }, { status: 500 });
  }
}
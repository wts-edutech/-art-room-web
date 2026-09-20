export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { students } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { getSession, getAdminSession } from '@/lib/api-auth';

export async function GET(request: Request) {
  try {
    const adminSession = await getAdminSession();
    const studentSession = await getSession();

    let studentData: any = null;
    if (studentSession && studentSession.role === 'student' && studentSession.userId) {
      try {
        const db = getDb();
        studentData = await db.select().from(students).where(eq(students.id, studentSession.userId)).get();
      } catch (e) {
        console.warn('Error fetching student record:', e);
      }
    }

    const response = NextResponse.json({
      authenticated: !!studentSession,
      isAdmin: adminSession.isAdmin,
      user: studentSession ? {
        id: studentSession.userId,
        userId: studentSession.userId,
        name: studentData?.name || studentSession.name,
        role: studentSession.role,
        classroom: studentData?.classroom || '',
        gradeLevel: studentData?.gradeLevel || '',
        studentNumber: studentData?.studentNumber || null,
        avatar: studentData?.avatar || null,
      } : null,
    });

    // If session was revoked or invalid, ensure client drops cookies
    if (!adminSession.isAdmin) {
      response.cookies.set('admin_token', '', { path: '/', maxAge: 0, expires: new Date(0) });
    }
    if (!studentSession) {
      response.cookies.set('session_token', '', { path: '/', maxAge: 0, expires: new Date(0) });
    }

    return response;
  } catch (error) {
    console.error("GET /api/auth/profile error:", error);
    return NextResponse.json({ authenticated: false, isAdmin: false, user: null }, { status: 500 });
  }
}

import { validatePassword, hashPassword } from '@/lib/password-validator';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;
    let session = null;
    if (sessionToken) {
      session = await verifySessionToken(sessionToken);
    }

    const body = await request.json().catch(() => ({}));
    const { name, phone, grade, avatar, displayName, studentId, newPassword, confirmPassword } = body;

    const targetStudentId = studentId ? String(studentId).trim() : (session?.role === 'student' ? session.userId : null);

    let passwordChanged = false;
    let hashedPassword: string | null = null;

    // Validate and hash new password if provided
    if (newPassword) {
      if (confirmPassword !== undefined && newPassword !== confirmPassword) {
        return NextResponse.json({ error: "รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน" }, { status: 400 });
      }

      const validation = validatePassword(newPassword);
      if (!validation.isValid) {
        return NextResponse.json({ 
          error: validation.errors.join(", ") 
        }, { status: 400 });
      }

      hashedPassword = await hashPassword(newPassword);
      passwordChanged = true;
    }

    // If target student ID is known, update database
    if (targetStudentId) {
      try {
        const db = getDb();
        // Auto-migration for avatar column in students table if missing
        try {
          const d1 = (globalThis as any)?.__D1_DATABASE || (process.env as any)?.__D1_DATABASE;
          if (d1?.prepare) {
            await d1.prepare("ALTER TABLE students ADD COLUMN avatar TEXT;").run();
          }
        } catch {}

        const existing = await db.select().from(students).where(eq(students.id, targetStudentId)).get();
        if (existing) {
          const updateFields: any = {};
          if (name) updateFields.name = String(name).trim();
          if (grade) {
            updateFields.classroom = String(grade).trim();
            if (String(grade).includes('/')) {
              updateFields.gradeLevel = String(grade).split('/')[0].trim();
            }
          }
          if (avatar !== undefined) {
            updateFields.avatar = String(avatar).trim();
          }
          if (hashedPassword) {
            updateFields.password = hashedPassword;
          }

          if (Object.keys(updateFields).length > 0) {
            await db.update(students).set(updateFields).where(eq(students.id, targetStudentId));
          }
        }
      } catch (dbErr) {
        console.warn("DB update student error (continuing with client sync):", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: passwordChanged 
        ? "บันทึกข้อมูลโปรไฟล์และเปลี่ยนรหัสผ่านใหม่เรียบร้อยแล้ว" 
        : "บันทึกการเปลี่ยนแปลงโปรไฟล์สำเร็จ",
      passwordChanged,
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

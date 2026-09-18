export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { students } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { verifySessionToken, verifyAdminToken } from '@/lib/auth-utils';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;
    const adminToken = cookieStore.get('admin_token')?.value;

    let isAdmin = false;
    if (adminToken) {
      isAdmin = await verifyAdminToken(adminToken);
    }

    let session = null;
    if (sessionToken) {
      session = await verifySessionToken(sessionToken);
    }

    let studentData: any = null;
    if (session && session.role === 'student' && session.userId) {
      try {
        const db = getDb();
        studentData = await db.select().from(students).where(eq(students.id, session.userId)).get();
      } catch (e) {
        console.warn('Error fetching student record:', e);
      }
    }

    return NextResponse.json({
      authenticated: !!session,
      isAdmin,
      user: session ? {
        id: session.userId,
        userId: session.userId,
        name: studentData?.name || session.name,
        role: session.role,
        classroom: studentData?.classroom || '',
        gradeLevel: studentData?.gradeLevel || '',
        studentNumber: studentData?.studentNumber || null,
      } : null,
    });
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

export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { students, comments } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSession, getAdminSession } from '@/lib/api-auth';
import { R2_PREFIX, offloadDataUrl } from '@/lib/r2-storage';
import { resolveR2Url } from '@/lib/media-response';

function toPublicStudentAvatar(rawAvatar: any, studentId?: string | null): string | null {
  if (!rawAvatar) return null;
  const val = String(rawAvatar).trim();
  if (!val) return null;
  if (val.startsWith('data:')) {
    return studentId ? `/api/media?type=student&id=${encodeURIComponent(studentId)}` : val;
  }
  if (val.startsWith(R2_PREFIX)) {
    return resolveR2Url(val);
  }
  return val;
}

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
        avatar: toPublicStudentAvatar(studentData?.avatar, studentSession.userId),
        hasCustomPassword: Boolean(studentData?.password && String(studentData.password).length > 0),
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
    const studentSession = await getSession();
    const adminSession = await getAdminSession();

    const body = await request.json().catch(() => ({}));
    const { name, phone, grade, avatar, displayName, studentId, newPassword, confirmPassword } = body;

    const targetStudentId = studentId 
      ? String(studentId).trim() 
      : (studentSession?.role === 'student' ? studentSession.userId : null);

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

    // Track resolved public avatar URL to return to client & comments
    let resolvedPublicAvatar: string | undefined = avatar ? String(avatar).trim() : undefined;
    if (resolvedPublicAvatar && resolvedPublicAvatar.startsWith('data:')) {
      const offloaded = await offloadDataUrl(
        resolvedPublicAvatar,
        `students/${targetStudentId || 'guest'}/avatar_${Date.now()}`
      );
      resolvedPublicAvatar = toPublicStudentAvatar(offloaded, targetStudentId) || resolvedPublicAvatar;
      // Store offloaded R2 ref in DB if student exists
      if (targetStudentId) {
        (body as any).__storedAvatar = offloaded;
      }
    }

    // If target student ID is known, update database
    if (targetStudentId) {
      try {
        const db = getDb();
        const existing = await db.select().from(students).where(eq(students.id, targetStudentId)).get();
        if (existing) {
          const updateFields: any = {};
          if (name && studentSession?.role !== 'student') updateFields.name = String(name).trim();
          if (grade) {
            updateFields.classroom = String(grade).trim();
            if (String(grade).includes('/')) {
              updateFields.gradeLevel = String(grade).split('/')[0].trim();
            }
          }
          if (avatar !== undefined) {
            let dbAvatar = (body as any).__storedAvatar ?? String(avatar).trim();
            if (dbAvatar.startsWith('/api/media?type=student') && existing.avatar) {
              dbAvatar = existing.avatar;
            }
            updateFields.avatar = dbAvatar;
            const commentAvatar = toPublicStudentAvatar(dbAvatar, targetStudentId) || dbAvatar;
            resolvedPublicAvatar = commentAvatar;
            // Automatically sync all existing comments for this student across all discussion systems!
            try {
              await db.update(comments)
                .set({ authorImage: commentAvatar })
                .where(eq(comments.authorEmail, targetStudentId));
            } catch (cErr) {
              console.warn("Could not batch update comments avatar:", cErr);
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
        console.error("DB update student error:", dbErr);
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
        avatar: resolvedPublicAvatar,
      },
    });
  } catch (error) {
    console.error("POST /api/auth/profile error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" }, { status: 500 });
  }
}

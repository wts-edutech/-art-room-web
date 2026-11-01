export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/api-auth';
import { verifyAdminPassword, updateAdminPassword, getAdminPasswordPlain } from '@/lib/admin-auth';

/**
 * GET — ดึงรหัสผ่านปัจจุบัน (เฉพาะ Super Admin ที่ล็อกอินแล้ว)
 */
export async function GET() {
  try {
    await requireSuperAdmin();

    const currentPassword = await getAdminPasswordPlain();
    return NextResponse.json({ password: currentPassword });
  } catch (error: any) {
    if (error instanceof Response) return error;
    console.error('GET /api/admin/change-password error:', error);
    return NextResponse.json({ error: 'ไม่สามารถดึงรหัสผ่านได้' }, { status: 500 });
  }
}

/**
 * POST — เปลี่ยนรหัสผ่านผู้ดูแลระบบ (เฉพาะ Super Admin)
 */
export async function POST(request: Request) {
  try {
    await requireSuperAdmin();

    const body = await request.json().catch(() => ({}));
    const currentPassword = String(body.currentPassword ?? '').trim();
    const newPassword = String(body.newPassword ?? '').trim();

    if (!currentPassword) {
      return NextResponse.json({ error: 'กรุณากรอกรหัสผ่านปัจจุบัน' }, { status: 400 });
    }

    if (!newPassword) {
      return NextResponse.json({ error: 'กรุณากรอกรหัสผ่านใหม่' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร' },
        { status: 400 }
      );
    }

    // ตรวจสอบรหัสผ่านปัจจุบัน
    const isCurrentValid = await verifyAdminPassword(currentPassword);
    if (!isCurrentValid) {
      return NextResponse.json(
        { error: 'รหัสผ่านปัจจุบันไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง' },
        { status: 400 }
      );
    }

    // บันทึกรหัสผ่านใหม่ลงฐานข้อมูล
    await updateAdminPassword(newPassword);

    return NextResponse.json({
      success: true,
      message:
        'เปลี่ยนรหัสผ่านผู้ดูแลระบบสำเร็จแล้ว สามารถใช้รหัสผ่านใหม่ในการเข้าสู่ระบบครั้งถัดไปได้ทันที',
    });
  } catch (error) {
    console.error('POST /api/admin/change-password error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการบันทึกรหัสผ่าน กรุณาลองใหม่อีกครั้ง' },
      { status: 500 }
    );
  }
}

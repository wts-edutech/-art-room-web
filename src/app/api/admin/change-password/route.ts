export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/api-auth';
import { 
  verifyAdminPassword, 
  updateAdminPassword, 
  getAdminPasswordPlain,
  getTeachingAdminPasswordPlain,
  updateTeachingAdminPassword
} from '@/lib/admin-auth';

/**
 * GET — ดึงรหัสผ่านปัจจุบัน (Super Admin หรือ Teaching Admin เมื่อระบุ ?target=teaching)
 */
export async function GET(request: Request) {
  try {
    await requireSuperAdmin();

    const { searchParams } = new URL(request.url);
    if (searchParams.get('target') === 'teaching') {
      const password = await getTeachingAdminPasswordPlain();
      return NextResponse.json({ success: true, password });
    }

    const currentPassword = await getAdminPasswordPlain();
    return NextResponse.json({ password: currentPassword });
  } catch (error: any) {
    if (error instanceof Response) return error;
    console.error('GET /api/admin/change-password error:', error);
    return NextResponse.json({ error: 'ไม่สามารถดึงรหัสผ่านได้' }, { status: 500 });
  }
}

/**
 * POST — เปลี่ยนรหัสผ่าน (Super Admin หรือ Teaching Admin เมื่อระบุ target: 'teaching')
 */
export async function POST(request: Request) {
  try {
    await requireSuperAdmin();

    const body = await request.json().catch(() => ({}));

    // กรณีเปลี่ยนรหัสผ่านแอดมินคนที่ 2 (ครูผู้ช่วยสอน/ตรวจงาน)
    if (body.target === 'teaching') {
      const newPassword = String(body.newPassword ?? '').trim();
      if (!newPassword) {
        return NextResponse.json({ error: 'กรุณากรอกรหัสผ่านใหม่สำหรับครูผู้ช่วยสอน' }, { status: 400 });
      }
      if (newPassword.length < 4) {
        return NextResponse.json({ error: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษร' }, { status: 400 });
      }
      const success = await updateTeachingAdminPassword(newPassword);
      if (!success) {
        return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการบันทึกรหัสผ่าน' }, { status: 500 });
      }
      return NextResponse.json({
        success: true,
        message: 'ตั้งรหัสผ่านสำหรับแอดมินคนที่ 2 (ครูผู้ช่วยสอน/ตรวจงาน) สำเร็จแล้ว สามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที',
      });
    }

    // กรณีเปลี่ยนรหัสผ่านแอดมินหลัก (Super Admin)
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
  } catch (error: any) {
    if (error instanceof Response) return error;
    console.error('POST /api/admin/change-password error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการบันทึกรหัสผ่าน กรุณาลองใหม่อีกครั้ง' },
      { status: 500 }
    );
  }
}

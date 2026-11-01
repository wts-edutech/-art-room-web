export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/api-auth';
import { getTeachingAdminPasswordPlain, updateTeachingAdminPassword } from '@/lib/admin-auth';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
};

/**
 * GET — Super Admin views Teaching Admin current password.
 */
export async function GET() {
  try {
    await requireSuperAdmin();
    const password = await getTeachingAdminPasswordPlain();
    return NextResponse.json({ success: true, password }, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_CACHE_HEADERS });
  }
}

/**
 * POST — Super Admin updates Teaching Admin password.
 */
export async function POST(request: Request) {
  try {
    await requireSuperAdmin();

    const body = await request.json().catch(() => ({}));
    const newPassword = String(body.newPassword ?? '').trim();

    if (!newPassword) {
      return NextResponse.json({ error: 'กรุณากรอกรหัสผ่านใหม่สำหรับครูผู้ช่วยสอน' }, { status: 400 });
    }

    if (newPassword.length < 4) {
      return NextResponse.json(
        { error: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษร' },
        { status: 400 }
      );
    }

    const success = await updateTeachingAdminPassword(newPassword);
    if (!success) {
      return NextResponse.json(
        { error: 'เกิดข้อผิดพลาดในการบันทึกรหัสผ่าน' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'ตั้งรหัสผ่านสำหรับแอดมินคนที่ 2 (ครูผู้ช่วยสอน/ตรวจงาน) สำเร็จแล้ว สามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที',
    });
  } catch (error: any) {
    if (error instanceof Response) return error;
    console.error('POST /api/admin/teaching-password error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการบันทึกรหัสผ่าน กรุณาลองใหม่อีกครั้ง' },
      { status: 500 }
    );
  }
}

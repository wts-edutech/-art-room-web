export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { getMasterPinPlain, verifyMasterPin, updateMasterPin } from '@/lib/admin-auth';

/**
 * GET /api/admin/master-pin
 * Returns current master PIN for display to admin.
 */
export async function GET() {
  try {
    await requireAdmin();
    const pin = await getMasterPinPlain();
    return NextResponse.json({ success: true, masterPin: pin });
  } catch (error: any) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

/**
 * POST /api/admin/master-pin
 * Change Master PIN or verify it.
 * Body: { currentPin, newPin, action?: 'verify' }
 */
export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json().catch(() => ({}));

    // If just verifying PIN
    if (body.action === 'verify') {
      const pin = String(body.pin || '').trim();
      const isValid = await verifyMasterPin(pin);
      if (!isValid) {
        return NextResponse.json({ error: 'รหัส Master PIN ไม่ถูกต้อง' }, { status: 403 });
      }
      return NextResponse.json({ success: true, message: 'ยืนยันรหัส Master PIN สำเร็จ' });
    }

    // Changing Master PIN
    const currentPin = String(body.currentPin || '').trim();
    const newPin = String(body.newPin || '').trim();

    if (!currentPin || !newPin) {
      return NextResponse.json({ error: 'กรุณากรอกรหัส Master PIN ปัจจุบันและรหัสใหม่' }, { status: 400 });
    }

    const isCurrentValid = await verifyMasterPin(currentPin);
    if (!isCurrentValid) {
      return NextResponse.json({ error: 'รหัส Master PIN ปัจจุบันไม่ถูกต้อง' }, { status: 403 });
    }

    if (newPin.length < 4 || newPin.length > 20) {
      return NextResponse.json({ error: 'รหัส Master PIN ใหม่ต้องมีความยาว 4 - 20 ตัวอักษร' }, { status: 400 });
    }

    const success = await updateMasterPin(newPin);
    if (!success) {
      return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการบันทึก Master PIN' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'เปลี่ยนรหัส Master PIN สำเร็จแล้ว',
    });
  } catch (error: any) {
    if (error instanceof Response) return error;
    console.error('Master PIN error:', error);
    return NextResponse.json({ error: 'Failed to process Master PIN' }, { status: 500 });
  }
}

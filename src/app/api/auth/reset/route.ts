export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { updateAdminPassword } from '@/lib/admin-auth';

export async function POST() {
  try {
    await updateAdminPassword('admin1234');
    return NextResponse.json({
      success: true,
      message: 'รีเซ็ตรหัสผ่านแอดมินกลับเป็นค่าเริ่มต้น (admin1234) เรียบร้อยแล้ว',
      password: 'admin1234',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}

export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { checkIsAdmin } from '@/lib/api-auth';
import { getNotificationLogs, sendTestNotification } from '@/lib/email-notifier';

// GET /api/notifications - Retrieve recent outbox logs
export async function GET(request: Request) {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const logs = await getNotificationLogs(limit);
    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch logs' }, { status: 500 });
  }
}

// POST /api/notifications - Send test email or manual notification
export async function POST(request: Request) {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { email } = body;
    const url = new URL(request.url);
    const origin = url.origin;

    const result = await sendTestNotification(email, origin);
    return NextResponse.json({
      success: true,
      result,
      message: 'ส่งการแจ้งเตือนทดสอบเรียบร้อยแล้ว ตรวจสอบที่อีเมลของคุณครูหรือดูกล่องประวัติการส่ง',
    });
  } catch (error: any) {
    console.error("POST /api/notifications error:", error);
    return NextResponse.json({ error: error?.message || 'Failed to send test notification' }, { status: 500 });
  }
}

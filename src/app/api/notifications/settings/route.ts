export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { checkIsAdmin } from '@/lib/api-auth';
import { getNotificationSettings, saveNotificationSettings } from '@/lib/email-notifier';

// GET /api/notifications/settings - Get teacher email notification settings
export async function GET() {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await getNotificationSettings();
    return NextResponse.json({
      success: true,
      settings: {
        ...settings,
        // Mask API key for security if present
        resendApiKey: settings.resendApiKey ? `${settings.resendApiKey.substring(0, 6)}...` : '',
        hasCustomResendKey: Boolean(settings.resendApiKey || process.env.RESEND_API_KEY),
        hasCustomWebhook: Boolean(settings.webhookUrl || process.env.EMAIL_WEBHOOK_URL),
      },
    });
  } catch (error: any) {
    console.error("GET /api/notifications/settings error:", error);
    return NextResponse.json({ error: error?.message || 'Failed to get settings' }, { status: 500 });
  }
}

// POST /api/notifications/settings - Update teacher email notification settings
export async function POST(request: Request) {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const {
      teacherEmail,
      isEmailEnabled,
      notifyOnAssignment,
      notifyOnQuiz,
      provider,
      resendApiKey,
      webhookUrl,
    } = body;

    const updates: any = {};
    if (typeof teacherEmail === 'string' && teacherEmail.includes('@')) {
      updates.teacherEmail = teacherEmail.trim();
    }
    if (isEmailEnabled !== undefined) updates.isEmailEnabled = Boolean(isEmailEnabled);
    if (notifyOnAssignment !== undefined) updates.notifyOnAssignment = Boolean(notifyOnAssignment);
    if (notifyOnQuiz !== undefined) updates.notifyOnQuiz = Boolean(notifyOnQuiz);
    if (['auto', 'resend', 'webhook', 'simulation'].includes(provider)) {
      updates.provider = provider;
    }
    if (resendApiKey !== undefined && !resendApiKey.includes('...')) {
      updates.resendApiKey = resendApiKey.trim();
    }
    if (webhookUrl !== undefined) {
      updates.webhookUrl = webhookUrl.trim();
    }

    const saved = await saveNotificationSettings(updates);

    return NextResponse.json({
      success: true,
      settings: saved,
      message: 'บันทึกการตั้งค่าระบบแจ้งเตือนอีเมลเรียบร้อยแล้ว',
    });
  } catch (error: any) {
    console.error("POST /api/notifications/settings error:", error);
    return NextResponse.json({ error: error?.message || 'Failed to save settings' }, { status: 500 });
  }
}

export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAdminToken, verifyAdminTokenWithPayload } from '@/lib/auth-utils';
import { verifyAdminPassword } from '@/lib/admin-auth';
import { registerLoginSession, revokeSessionById } from '@/lib/session-manager';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    const isValid = await verifyAdminPassword(String(password || '').trim());

    if (isValid) {
      // Register device session
      const { sessionId, deviceInfo } = await registerLoginSession({
        userId: 'admin',
        userName: 'ผู้ดูแลระบบ (Admin)',
        role: 'admin',
        request,
      });

      const token = await createAdminToken(24, sessionId); // expires in 24 hours

      const cookieStore = await cookies();
      cookieStore.set('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
      });

      return NextResponse.json({ 
        success: true,
        sessionId,
        device: deviceInfo.summary,
      });
    }

    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    if (token) {
      const payload = await verifyAdminTokenWithPayload(token);
      if (payload?.sid) {
        await revokeSessionById(payload.sid, 'admin', true);
      }
    }
    cookieStore.delete('admin_token');
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true });
  }
}

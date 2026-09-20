export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminTokenWithPayload, verifySessionToken } from '@/lib/auth-utils';
import { revokeSessionById } from '@/lib/session-manager';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;
    const adminToken = cookieStore.get('admin_token')?.value;

    if (sessionToken) {
      try {
        const payload = await verifySessionToken(sessionToken);
        if (payload?.sid) {
          await revokeSessionById(payload.sid, payload.userId, false);
        }
      } catch {}
    }

    if (adminToken) {
      try {
        const payload = await verifyAdminTokenWithPayload(adminToken);
        if (payload?.sid) {
          await revokeSessionById(payload.sid, 'admin', true);
        }
      } catch {}
    }

    // Delete both server-side cookies unconditionally
    cookieStore.delete('session_token');
    cookieStore.delete('admin_token');

    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
    response.cookies.set('session_token', '', { path: '/', maxAge: 0 });
    response.cookies.set('admin_token', '', { path: '/', maxAge: 0 });
    return response;
  } catch (err) {
    console.error('Logout error:', err);
    return NextResponse.json({ success: true });
  }
}

export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminTokenWithPayload, verifySessionToken } from '@/lib/auth-utils';
import { revokeSessionById } from '@/lib/session-manager';

/**
 * GET /api/admin/logout
 * Direct navigation endpoint for instant admin logout.
 * Clears admin_token and session_token cookies and redirects to /admin/login immediately.
 */
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_token')?.value;
    const sessionToken = cookieStore.get('session_token')?.value;

    if (adminToken) {
      try {
        const payload = await verifyAdminTokenWithPayload(adminToken);
        if (payload?.sid) {
          await revokeSessionById(payload.sid, 'admin', true);
        }
      } catch {}
    }

    if (sessionToken) {
      try {
        const payload = await verifySessionToken(sessionToken);
        if (payload?.sid) {
          await revokeSessionById(payload.sid, payload.userId, false);
        }
      } catch {}
    }

    cookieStore.delete('admin_token');
    cookieStore.delete('session_token');

    const url = new URL('/admin/login', request.url);
    const response = NextResponse.redirect(url, { status: 302 });

    // Set expired cookies in response headers to ensure browser drops them
    response.cookies.set('admin_token', '', {
      path: '/',
      maxAge: 0,
      expires: new Date(0),
      httpOnly: true,
      sameSite: 'lax',
    });
    response.cookies.set('session_token', '', {
      path: '/',
      maxAge: 0,
      expires: new Date(0),
      httpOnly: true,
      sameSite: 'lax',
    });

    return response;
  } catch (err) {
    console.error('Admin direct logout error:', err);
    const url = new URL('/admin/login', request.url);
    return NextResponse.redirect(url, { status: 302 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}

export async function DELETE(request: Request) {
  return GET(request);
}

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { getAdminSession, getSession } from '@/lib/api-auth';
import { cookies } from 'next/headers';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
};

/**
 * GET /api/auth/session-check
 * Real-time heartbeat endpoint for checking if current session is still valid.
 * If session has been revoked or kicked by admin, returns 401 and forces client logout.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requireRole = searchParams.get('role'); // e.g. 'admin' or 'student'

    const cookieStore = await cookies();
    const hasAdminCookie = Boolean(cookieStore.get('admin_token')?.value);
    const hasSessionCookie = Boolean(cookieStore.get('session_token')?.value);

    const adminSession = await getAdminSession();
    const userSession = await getSession();

    // If checking specifically for admin
    if (requireRole === 'admin') {
      if (!adminSession.isAdmin) {
        const res = NextResponse.json(
          { active: false, reason: hasAdminCookie ? 'kicked' : 'unauthenticated' },
          { status: 401, headers: NO_CACHE_HEADERS }
        );
        res.cookies.set('admin_token', '', { path: '/', maxAge: 0, expires: new Date(0) });
        return res;
      }
      return NextResponse.json({ active: true, role: 'admin', sid: adminSession.sid }, { headers: NO_CACHE_HEADERS });
    }

    // If general check: if user had cookies but session is no longer valid, they were kicked
    if (hasAdminCookie && !adminSession.isAdmin) {
      const res = NextResponse.json({ active: false, reason: 'kicked', role: 'admin' }, { status: 401, headers: NO_CACHE_HEADERS });
      res.cookies.set('admin_token', '', { path: '/', maxAge: 0, expires: new Date(0) });
      return res;
    }

    if (hasSessionCookie && !userSession) {
      const res = NextResponse.json({ active: false, reason: 'kicked', role: 'student' }, { status: 401, headers: NO_CACHE_HEADERS });
      res.cookies.set('session_token', '', { path: '/', maxAge: 0, expires: new Date(0) });
      return res;
    }

    return NextResponse.json({
      active: adminSession.isAdmin || Boolean(userSession),
      isAdmin: adminSession.isAdmin,
      user: userSession,
    }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ active: true }, { status: 200, headers: NO_CACHE_HEADERS });
  }
}

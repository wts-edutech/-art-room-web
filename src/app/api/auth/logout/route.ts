export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminTokenWithPayload, verifySessionToken } from '@/lib/auth-utils';
import { revokeSessionById } from '@/lib/session-manager';

export async function GET(request: Request) {
  return handleLogout(request);
}

export async function POST(request: Request) {
  return handleLogout(request);
}

export async function DELETE(request: Request) {
  return handleLogout(request);
}

async function handleLogout(request: Request) {
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

    cookieStore.delete('session_token');
    cookieStore.delete('admin_token');

    const { searchParams } = new URL(request.url);
    const redirectParam = searchParams.get('redirect');

    let response: NextResponse;
    if (redirectParam) {
      const targetUrl = new URL(redirectParam, request.url);
      response = NextResponse.redirect(targetUrl, { status: 302 });
    } else {
      response = NextResponse.json({ success: true, message: 'Logged out successfully' });
    }

    response.cookies.set('session_token', '', {
      path: '/',
      maxAge: 0,
      expires: new Date(0),
      httpOnly: true,
      sameSite: 'lax',
    });
    response.cookies.set('admin_token', '', {
      path: '/',
      maxAge: 0,
      expires: new Date(0),
      httpOnly: true,
      sameSite: 'lax',
    });

    return response;
  } catch (err) {
    console.error('Logout error:', err);
    return NextResponse.json({ success: true });
  }
}

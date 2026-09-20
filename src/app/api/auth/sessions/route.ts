export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { createSessionToken } from '@/lib/auth-utils';
import { 
  getUserSessions, 
  revokeSessionById, 
  revokeAllOtherSessions,
  ensureActiveSession
} from '@/lib/session-manager';

/**
 * GET /api/auth/sessions
 * Returns active login sessions for the currently logged-in user.
 * Automatically registers current device if not in DB.
 */
export async function GET(request: Request) {
  try {
    const session = await requireAuth();

    // Auto-register current device if not in DB
    const { sid: currentSid, wasCreated } = await ensureActiveSession({
      userId: session.userId,
      userName: session.name,
      role: session.role,
      sid: session.sid,
      request,
    });

    const sessions = await getUserSessions(session.userId, currentSid);

    const response = NextResponse.json({
      success: true,
      currentSessionId: currentSid,
      sessions,
    });

    if (wasCreated) {
      const newToken = await createSessionToken(session.userId, session.name, session.role, 72, currentSid);
      response.cookies.set('session_token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 72,
        path: '/',
      });
    }

    return response;
  } catch (error: any) {
    if (error instanceof Response) return error;
    console.error('User sessions fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

/**
 * DELETE /api/auth/sessions
 * Revoke a specific session or all other sessions of the logged-in user.
 * Body: { sessionId?: string, allOthers?: boolean }
 */
export async function DELETE(request: Request) {
  try {
    const session = await requireAuth();
    const body = await request.json().catch(() => ({}));

    if (body.allOthers) {
      await revokeAllOtherSessions(session.userId, session.sid);
      return NextResponse.json({
        success: true,
        message: 'ออกจากระบบอุปกรณ์อื่นทั้งหมดเรียบร้อยแล้ว',
      });
    }

    const sessionId = String(body.sessionId || '').trim();
    if (!sessionId) {
      return NextResponse.json({ error: 'ระบุรหัสเซสชันที่ต้องการลบ' }, { status: 400 });
    }

    const ok = await revokeSessionById(sessionId, session.userId, false);
    if (!ok) {
      return NextResponse.json({ error: 'ไม่พบเซสชันหรือไม่มีสิทธิ์ลบเซสชันนี้' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'ลบอุปกรณ์ออกจากระบบเรียบร้อยแล้ว',
    });
  } catch (error: any) {
    if (error instanceof Response) return error;
    console.error('User revoke session error:', error);
    return NextResponse.json({ error: 'Failed to revoke session' }, { status: 500 });
  }
}

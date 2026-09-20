export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { getUserSessions, revokeSessionById, revokeAllOtherSessions } from '@/lib/session-manager';

/**
 * GET /api/auth/sessions
 * Returns active login sessions for the currently logged-in user.
 */
export async function GET() {
  try {
    const session = await requireAuth();
    const sessions = await getUserSessions(session.userId, session.sid);

    return NextResponse.json({
      success: true,
      currentSessionId: session.sid,
      sessions,
    });
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

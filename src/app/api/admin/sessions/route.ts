export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { createAdminToken } from '@/lib/auth-utils';
import { 
  getAllActiveSessions, 
  revokeSessionById, 
  revokeAllOtherSessions,
  ensureActiveSession
} from '@/lib/session-manager';

/**
 * GET /api/admin/sessions
 * Returns all active admin and student login sessions with device metadata.
 * Automatically backfills and registers current active admin device if not in DB.
 */
export async function GET(request: Request) {
  try {
    const adminSession = await requireAdmin();

    // Auto-register current device if not in DB
    const { sid: currentSid, wasCreated } = await ensureActiveSession({
      userId: 'admin',
      userName: 'ผู้ดูแลระบบ (Admin)',
      role: 'admin',
      sid: adminSession.sid,
      request,
    });

    const result = await getAllActiveSessions(currentSid);

    const response = NextResponse.json({
      success: true,
      currentSessionId: currentSid,
      adminSessions: result.adminSessions,
      studentSessions: result.studentSessions,
    });

    // If new session ID was generated for legacy token, refresh cookie
    if (wasCreated) {
      const newToken = await createAdminToken(24, currentSid);
      response.cookies.set('admin_token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
        path: '/',
      });
    }

    return response;
  } catch (error: any) {
    if (error instanceof Response) return error;
    console.error('Admin sessions fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/sessions
 * Revoke a specific session or kick all other sessions.
 * Body: { sessionId?: string, allOthers?: boolean }
 */
export async function DELETE(request: Request) {
  try {
    const adminSession = await requireAdmin();
    const body = await request.json().catch(() => ({}));

    if (body.allOthers) {
      // Kick all other admin sessions
      await revokeAllOtherSessions('admin', adminSession.sid);
      return NextResponse.json({
        success: true,
        message: 'ออกจากระบบอุปกรณ์แอดมินอื่นทั้งหมดเรียบร้อยแล้ว',
      });
    }

    const sessionId = String(body.sessionId || '').trim();
    if (!sessionId) {
      return NextResponse.json({ error: 'ระบุรหัสเซสชันที่ต้องการเตะออก' }, { status: 400 });
    }

    const ok = await revokeSessionById(sessionId, undefined, true);
    if (!ok) {
      return NextResponse.json({ error: 'ไม่พบเซสชันหรือเกิดข้อผิดพลาด' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'เตะอุปกรณ์ออกจากระบบเรียบร้อยแล้ว',
    });
  } catch (error: any) {
    if (error instanceof Response) return error;
    console.error('Admin revoke session error:', error);
    return NextResponse.json({ error: 'Failed to revoke session' }, { status: 500 });
  }
}

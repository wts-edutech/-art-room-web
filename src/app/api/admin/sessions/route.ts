export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { getAllActiveSessions, revokeSessionById, revokeAllOtherSessions } from '@/lib/session-manager';

/**
 * GET /api/admin/sessions
 * Returns all active admin and student login sessions with device metadata.
 */
export async function GET() {
  try {
    const adminSession = await requireAdmin();
    const result = await getAllActiveSessions(adminSession.sid);

    return NextResponse.json({
      success: true,
      currentSessionId: adminSession.sid,
      adminSessions: result.adminSessions,
      studentSessions: result.studentSessions,
    });
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

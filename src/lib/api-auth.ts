import { cookies } from 'next/headers';
import { verifyAdminTokenWithPayload, verifySessionToken } from './auth-utils';
import { isSessionActive, touchSession } from './session-manager';

export interface SessionInfo {
  userId: string;
  name: string;
  role: 'student' | 'guest';
  sid?: string;
}

export interface AdminSessionInfo {
  isAdmin: boolean;
  sid?: string;
}

/**
 * Checks if request has a valid session token (student or guest).
 * Returns session info or null. Strictly rejects revoked sessions.
 */
export async function getSession(): Promise<SessionInfo | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  // If sid is present, strictly verify not revoked
  if (payload.sid) {
    const active = await isSessionActive(payload.sid);
    if (!active) {
      return null;
    }
    touchSession(payload.sid).catch(() => {});
  }

  return {
    userId: payload.userId,
    name: payload.name,
    role: payload.role,
    sid: payload.sid,
  };
}

/**
 * Requires a valid session. Returns session info or throws a 401 Response.
 */
export async function requireAuth(): Promise<SessionInfo> {
  const session = await getSession();
  if (!session) {
    throw new Response(JSON.stringify({ error: 'Unauthorized — กรุณาเข้าสู่ระบบ' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return session;
}

/**
 * Requires a valid student session (not guest). Returns session info or throws.
 */
export async function requireStudent(): Promise<SessionInfo> {
  const session = await requireAuth();
  if (session.role !== 'student') {
    throw new Response(JSON.stringify({ error: 'Forbidden — เฉพาะนักเรียนเท่านั้น' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return session;
}

/**
 * Checks if request has a valid admin token and session is not revoked.
 */
export async function getAdminSession(): Promise<AdminSessionInfo> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return { isAdmin: false };

  const payload = await verifyAdminTokenWithPayload(token);
  if (!payload) return { isAdmin: false };

  // If sid is present, strictly verify not revoked
  if (payload.sid) {
    const active = await isSessionActive(payload.sid);
    if (!active) {
      return { isAdmin: false };
    }
    touchSession(payload.sid).catch(() => {});
    return { isAdmin: true, sid: payload.sid };
  }

  // Token is valid admin
  return { isAdmin: true };
}

/**
 * Checks if request has a valid admin token.
 */
export async function checkIsAdmin(): Promise<boolean> {
  const session = await getAdminSession();
  return session.isAdmin;
}

export async function requireAdmin(): Promise<AdminSessionInfo> {
  const adminSession = await getAdminSession();
  if (!adminSession.isAdmin) {
    throw new Response(JSON.stringify({ error: 'Unauthorized — ไม่ใช่ผู้ดูแลระบบ' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return adminSession;
}

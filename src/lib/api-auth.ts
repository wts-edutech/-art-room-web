import { cookies } from 'next/headers';
import { verifyAdminToken, verifySessionToken } from './auth-utils';

interface SessionInfo {
  userId: string;
  name: string;
  role: 'student' | 'guest';
}

/**
 * Checks if request has a valid session token (student or guest).
 * Returns session info or null.
 */
export async function getSession(): Promise<SessionInfo | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  return {
    userId: payload.userId,
    name: payload.name,
    role: payload.role,
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
 * Checks if request has a valid admin token.
 */
export async function requireAdmin(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (!token || !(await verifyAdminToken(token))) {
    throw new Response(JSON.stringify({ error: 'Unauthorized — ไม่ใช่ผู้ดูแลระบบ' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

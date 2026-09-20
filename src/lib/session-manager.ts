import { getDb } from '@/db';
import { loginSessions } from '@/db/schema';
import { eq, and, desc, sql, ne } from 'drizzle-orm';
import { parseDeviceInfo, DeviceInfo } from './device-detector';

// Fallback UUID generator if crypto.randomUUID is not available
function generateSessionId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

/**
 * Ensures login_sessions table exists in Cloudflare D1 / SQLite
 */
export async function ensureSessionTableExists() {
  try {
    const db = getDb();
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS login_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL DEFAULT '',
        role TEXT NOT NULL DEFAULT 'student',
        ip_address TEXT,
        user_agent TEXT,
        device_type TEXT DEFAULT 'desktop',
        browser TEXT,
        os TEXT,
        location TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        last_active_at TEXT DEFAULT CURRENT_TIMESTAMP,
        is_revoked INTEGER DEFAULT 0
      )
    `);
  } catch (err) {
    // Ignore if already exists or handled by migrations
  }
}

export interface SessionRecordItem {
  id: string;
  userId: string;
  userName: string;
  role: string;
  ipAddress: string | null;
  userAgent: string | null;
  deviceType: string | null;
  browser: string | null;
  os: string | null;
  location: string | null;
  createdAt: string | null;
  lastActiveAt: string | null;
  isRevoked: boolean | null;
  isCurrent?: boolean;
}

/**
 * Register a new login session and return sessionId + info
 */
export async function registerLoginSession(params: {
  userId: string;
  userName: string;
  role: 'admin' | 'student' | 'guest';
  request: Request;
}): Promise<{ sessionId: string; deviceInfo: DeviceInfo }> {
  await ensureSessionTableExists();
  const db = getDb();

  const sessionId = generateSessionId();
  const deviceInfo = parseDeviceInfo(params.request);
  const nowIso = new Date().toISOString();

  await db.insert(loginSessions).values({
    id: sessionId,
    userId: params.userId,
    userName: params.userName,
    role: params.role,
    ipAddress: deviceInfo.ipAddress,
    userAgent: deviceInfo.userAgent,
    deviceType: deviceInfo.deviceType,
    browser: deviceInfo.browser,
    os: deviceInfo.os,
    location: deviceInfo.location,
    createdAt: nowIso,
    lastActiveAt: nowIso,
    isRevoked: false,
  });

  return { sessionId, deviceInfo };
}

/**
 * Ensures that an active user request has a session row in login_sessions.
 * If sid is missing or not in DB, creates one and returns the valid sid.
 */
export async function ensureActiveSession(params: {
  userId: string;
  userName: string;
  role: 'admin' | 'student' | 'guest';
  sid?: string;
  request: Request;
}): Promise<{ sid: string; wasCreated: boolean }> {
  await ensureSessionTableExists();
  const db = getDb();

  if (params.sid) {
    const existing = await db
      .select()
      .from(loginSessions)
      .where(eq(loginSessions.id, params.sid))
      .get();

    if (existing && !existing.isRevoked) {
      // Touch activity and return
      await db
        .update(loginSessions)
        .set({ lastActiveAt: new Date().toISOString() })
        .where(eq(loginSessions.id, params.sid));
      return { sid: params.sid, wasCreated: false };
    }
  }

  // Create new session record for this device
  const { sessionId } = await registerLoginSession({
    userId: params.userId,
    userName: params.userName,
    role: params.role,
    request: params.request,
  });

  return { sid: sessionId, wasCreated: true };
}

/**
 * Verify if a session ID is valid and active (not revoked).
 * Strictly requires the session record to exist in DB and isRevoked to be false.
 */
export async function isSessionActive(sessionId: string): Promise<boolean> {
  if (!sessionId) return false;
  try {
    await ensureSessionTableExists();
    const db = getDb();
    const session = await db
      .select()
      .from(loginSessions)
      .where(eq(loginSessions.id, sessionId))
      .get();

    if (!session) {
      // Session does not exist in DB -> invalid / kicked
      return false;
    }

    return session.isRevoked === false || session.isRevoked === 0;
  } catch (err) {
    console.error('Check session active error:', err);
    return false;
  }
}

/**
 * Update last active timestamp
 */
export async function touchSession(sessionId: string) {
  if (!sessionId) return;
  try {
    const db = getDb();
    await db
      .update(loginSessions)
      .set({ lastActiveAt: new Date().toISOString() })
      .where(eq(loginSessions.id, sessionId));
  } catch {}
}

/**
 * Revoke a specific session (kicks the device)
 */
export async function revokeSessionById(sessionId: string, userId?: string, isAdmin: boolean = false): Promise<boolean> {
  try {
    await ensureSessionTableExists();
    const db = getDb();

    if (isAdmin) {
      // Admin can revoke any session
      await db.update(loginSessions).set({ isRevoked: true }).where(eq(loginSessions.id, sessionId));
      return true;
    }

    // Normal user can only revoke their own session
    if (!userId) return false;
    await db
      .update(loginSessions)
      .set({ isRevoked: true })
      .where(and(eq(loginSessions.id, sessionId), eq(loginSessions.userId, userId)));

    return true;
  } catch (err) {
    console.error('Revoke session error:', err);
    return false;
  }
}

/**
 * Revoke all other sessions for a user except currentSessionId
 */
export async function revokeAllOtherSessions(userId: string, currentSessionId?: string): Promise<number> {
  try {
    await ensureSessionTableExists();
    const db = getDb();

    let query;
    if (currentSessionId) {
      query = and(
        eq(loginSessions.userId, userId),
        ne(loginSessions.id, currentSessionId),
        eq(loginSessions.isRevoked, false)
      );
    } else {
      query = and(eq(loginSessions.userId, userId), eq(loginSessions.isRevoked, false));
    }

    const result = await db.update(loginSessions).set({ isRevoked: true }).where(query);
    return 1;
  } catch (err) {
    console.error('Revoke other sessions error:', err);
    return 0;
  }
}

/**
 * Get active sessions for a specific user
 */
export async function getUserSessions(userId: string, currentSessionId?: string): Promise<SessionRecordItem[]> {
  try {
    await ensureSessionTableExists();
    const db = getDb();

    const list = await db
      .select()
      .from(loginSessions)
      .where(and(eq(loginSessions.userId, userId), eq(loginSessions.isRevoked, false)))
      .orderBy(desc(loginSessions.lastActiveAt))
      .all();

    return list.map((item) => ({
      ...item,
      isCurrent: item.id === currentSessionId,
    }));
  } catch (err) {
    console.error('Get user sessions error:', err);
    return [];
  }
}

/**
 * Get all active sessions for Admin Security Tab
 */
export async function getAllActiveSessions(currentSessionId?: string): Promise<{
  adminSessions: SessionRecordItem[];
  studentSessions: SessionRecordItem[];
}> {
  try {
    await ensureSessionTableExists();
    const db = getDb();

    const list = await db
      .select()
      .from(loginSessions)
      .where(eq(loginSessions.isRevoked, false))
      .orderBy(desc(loginSessions.lastActiveAt))
      .all();

    const adminSessions: SessionRecordItem[] = [];
    const studentSessions: SessionRecordItem[] = [];

    for (const item of list) {
      const record: SessionRecordItem = {
        ...item,
        isCurrent: item.id === currentSessionId,
      };

      if (item.role === 'admin' || item.userId === 'admin') {
        adminSessions.push(record);
      } else {
        studentSessions.push(record);
      }
    }

    return { adminSessions, studentSessions };
  } catch (err) {
    console.error('Get all active sessions error:', err);
    return { adminSessions: [], studentSessions: [] };
  }
}

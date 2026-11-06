import { parseDeviceInfo, DeviceInfo } from './device-detector';
import { getRequestContext } from '@cloudflare/next-on-pages';

// Fallback UUID generator if crypto.randomUUID is not available
function generateSessionId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

function getD1() {
  try {
    const ctx = getRequestContext();
    return ctx?.env?.DB || null;
  } catch {
    return null;
  }
}

// In-Memory Fallback Cache for local dev or unexpected edge glitches
const memorySessions = new Map<string, SessionRecordItem>();

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
  isRevoked: boolean | null | number;
  isCurrent?: boolean;
}

/**
 * Ensures login_sessions table exists in Cloudflare D1 / SQLite
 */
export async function ensureSessionTableExists() {
  const d1 = getD1();
  if (d1) {
    try {
      await d1.prepare(`
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
      `).run();
    } catch (err) {
      console.warn('ensureSessionTableExists D1 note:', err);
    }
  }
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

  const sessionId = generateSessionId();
  const deviceInfo = parseDeviceInfo(params.request);
  const nowIso = new Date().toISOString();

  const record: SessionRecordItem = {
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
  };

  // 1. Store in Memory Cache
  memorySessions.set(sessionId, record);

  // 2. Store in Cloudflare D1
  const d1 = getD1();
  if (d1) {
    try {
      await d1.prepare(`
        INSERT INTO login_sessions (
          id, user_id, user_name, role, ip_address, user_agent, device_type, browser, os, location, created_at, last_active_at, is_revoked
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
      `).bind(
        sessionId,
        params.userId,
        params.userName,
        params.role,
        deviceInfo.ipAddress,
        deviceInfo.userAgent,
        deviceInfo.deviceType,
        deviceInfo.browser,
        deviceInfo.os,
        deviceInfo.location,
        nowIso,
        nowIso
      ).run();
    } catch (d1Err) {
      console.warn('registerLoginSession D1 insert warning:', d1Err);
    }
  }

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

  if (params.sid) {
    const active = await isSessionActive(params.sid);
    if (active) {
      await touchSession(params.sid);
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
 */
export async function isSessionActive(sessionId: string): Promise<boolean> {
  if (!sessionId) return false;

  // Check memory cache first
  const cached = memorySessions.get(sessionId);
  if (cached) {
    if (cached.isRevoked === true || cached.isRevoked === 1) {
      return false;
    }
  }

  const d1 = getD1();
  if (d1) {
    try {
      await ensureSessionTableExists();
      const row: any = await d1.prepare("SELECT is_revoked FROM login_sessions WHERE id = ?").bind(sessionId).first();
      if (!row) {
        // Revocation is stored as is_revoked=1 (rows are never deleted on revoke).
        // A missing row means the INSERT at login failed (e.g. D1 full) or was purged,
        // not that the session was revoked. The signed token is verified by the caller.
        return cached ? !cached.isRevoked : true;
      }
      const isRevoked = row.is_revoked === 1 || row.is_revoked === true || row.is_revoked === '1';
      return !isRevoked;
    } catch (err) {
      console.warn('isSessionActive D1 check warning:', err);
      return cached ? !cached.isRevoked : true;
    }
  }

  return cached ? !cached.isRevoked : true;
}

/**
 * Update last active timestamp
 */
export async function touchSession(sessionId: string) {
  if (!sessionId) return;
  const nowIso = new Date().toISOString();

  const cached = memorySessions.get(sessionId);
  if (cached) {
    cached.lastActiveAt = nowIso;
  }

  const d1 = getD1();
  if (d1) {
    try {
      await d1.prepare("UPDATE login_sessions SET last_active_at = ? WHERE id = ?").bind(nowIso, sessionId).run();
    } catch {}
  }
}

/**
 * Revoke a specific session (kicks the device)
 */
export async function revokeSessionById(sessionId: string, userId?: string, isAdmin: boolean = false): Promise<boolean> {
  if (!sessionId) return false;

  // 1. Update memory cache
  const cached = memorySessions.get(sessionId);
  if (cached) {
    cached.isRevoked = true;
  }

  // 2. Update D1
  const d1 = getD1();
  if (d1) {
    try {
      await ensureSessionTableExists();
      if (isAdmin) {
        await d1.prepare("UPDATE login_sessions SET is_revoked = 1 WHERE id = ?").bind(sessionId).run();
      } else if (userId) {
        await d1.prepare("UPDATE login_sessions SET is_revoked = 1 WHERE id = ? AND user_id = ?").bind(sessionId, userId).run();
      }
      return true;
    } catch (err) {
      console.warn('revokeSessionById D1 warning:', err);
    }
  }

  return Boolean(cached);
}

/**
 * Revoke all other sessions for a user except currentSessionId
 */
export async function revokeAllOtherSessions(userId: string, currentSessionId?: string): Promise<number> {
  // 1. Update memory
  for (const [id, s] of memorySessions.entries()) {
    if (s.userId === userId && id !== currentSessionId) {
      s.isRevoked = true;
    }
  }

  const d1 = getD1();
  if (d1) {
    try {
      await ensureSessionTableExists();
      if (currentSessionId) {
        await d1.prepare("UPDATE login_sessions SET is_revoked = 1 WHERE user_id = ? AND id != ?").bind(userId, currentSessionId).run();
      } else {
        await d1.prepare("UPDATE login_sessions SET is_revoked = 1 WHERE user_id = ?").bind(userId).run();
      }
      return 1;
    } catch (err) {
      console.warn('revokeAllOtherSessions D1 warning:', err);
    }
  }

  return 1;
}

/**
 * Get active sessions for a specific user
 */
export async function getUserSessions(userId: string, currentSessionId?: string): Promise<SessionRecordItem[]> {
  await ensureSessionTableExists();

  const d1 = getD1();
  if (d1) {
    try {
      const res: any = await d1.prepare(`
        SELECT * FROM login_sessions 
        WHERE user_id = ? AND (is_revoked = 0 OR is_revoked IS NULL)
        ORDER BY last_active_at DESC
      `).bind(userId).all();

      const rawList = res?.results || [];
      if (rawList.length > 0) {
        return rawList.map((item: any) => ({
          id: item.id,
          userId: item.user_id,
          userName: item.user_name || '',
          role: item.role || 'student',
          ipAddress: item.ip_address,
          userAgent: item.user_agent,
          deviceType: item.device_type,
          browser: item.browser,
          os: item.os,
          location: item.location,
          createdAt: item.created_at,
          lastActiveAt: item.last_active_at,
          isRevoked: item.is_revoked === 1,
          isCurrent: item.id === currentSessionId,
        }));
      }
    } catch (err) {
      console.warn('getUserSessions D1 warning:', err);
    }
  }

  // Fallback to memory
  const results: SessionRecordItem[] = [];
  for (const s of memorySessions.values()) {
    if (s.userId === userId && !s.isRevoked) {
      results.push({
        ...s,
        isCurrent: s.id === currentSessionId,
      });
    }
  }
  return results;
}

/**
 * Get all active sessions for Admin Security Tab
 */
export async function getAllActiveSessions(currentSessionId?: string): Promise<{
  adminSessions: SessionRecordItem[];
  studentSessions: SessionRecordItem[];
}> {
  await ensureSessionTableExists();

  let rawList: any[] = [];
  const d1 = getD1();

  if (d1) {
    try {
      const res: any = await d1.prepare(`
        SELECT * FROM login_sessions 
        WHERE (is_revoked = 0 OR is_revoked IS NULL)
        ORDER BY last_active_at DESC
      `).all();
      rawList = res?.results || [];
    } catch (err) {
      console.warn('getAllActiveSessions D1 warning:', err);
    }
  }

  // Merge with memory sessions
  const mapById = new Map<string, any>();
  for (const item of rawList) {
    mapById.set(item.id, item);
  }
  for (const [id, item] of memorySessions.entries()) {
    if (!item.isRevoked && !mapById.has(id)) {
      mapById.set(id, {
        id: item.id,
        user_id: item.userId,
        user_name: item.userName,
        role: item.role,
        ip_address: item.ipAddress,
        user_agent: item.userAgent,
        device_type: item.deviceType,
        browser: item.browser,
        os: item.os,
        location: item.location,
        created_at: item.createdAt,
        last_active_at: item.lastActiveAt,
        is_revoked: item.isRevoked,
      });
    }
  }

  const adminSessions: SessionRecordItem[] = [];
  const studentSessions: SessionRecordItem[] = [];

  for (const item of mapById.values()) {
    const isCurrent = item.id === currentSessionId;
    const record: SessionRecordItem = {
      id: item.id,
      userId: item.user_id,
      userName: item.user_name || '',
      role: item.role || 'student',
      ipAddress: item.ip_address,
      userAgent: item.user_agent,
      deviceType: item.device_type,
      browser: item.browser,
      os: item.os,
      location: item.location,
      createdAt: item.created_at,
      lastActiveAt: item.last_active_at,
      isRevoked: item.is_revoked === 1 || item.is_revoked === true,
      isCurrent,
    };

    if (item.role === 'admin' || item.user_id === 'admin') {
      adminSessions.push(record);
    } else {
      studentSessions.push(record);
    }
  }

  // If current admin session was provided but not in list, add it as current
  if (currentSessionId && !adminSessions.some(s => s.id === currentSessionId)) {
    const fallbackCurrent = memorySessions.get(currentSessionId);
    if (fallbackCurrent) {
      adminSessions.unshift({ ...fallbackCurrent, isCurrent: true });
    }
  }

  return { adminSessions, studentSessions };
}

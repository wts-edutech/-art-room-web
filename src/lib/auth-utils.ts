import { createHmac, randomBytes } from 'crypto';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'fallback-secret-change-me';
const SESSION_SECRET = process.env.AUTH_SECRET || 'fallback-session-secret';

// ===== Admin Token =====

interface AdminTokenPayload {
  type: 'admin';
  iat: number; // issued at (ms)
  exp: number; // expiry (ms)
}

/**
 * Creates an HMAC-SHA256 signed admin token with expiry.
 * Format: base64(payload).signature
 */
export function createAdminToken(expiresInHours: number = 24): string {
  const payload: AdminTokenPayload = {
    type: 'admin',
    iat: Date.now(),
    exp: Date.now() + expiresInHours * 60 * 60 * 1000,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', ADMIN_SECRET).update(payloadB64).digest('base64url');

  return `${payloadB64}.${signature}`;
}

/**
 * Verifies an admin token's signature and expiry.
 */
export function verifyAdminToken(token: string): boolean {
  try {
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) return false;

    // Verify signature
    const expectedSig = createHmac('sha256', ADMIN_SECRET).update(payloadB64).digest('base64url');
    if (signature !== expectedSig) return false;

    // Verify expiry
    const payload: AdminTokenPayload = JSON.parse(
      Buffer.from(payloadB64, 'base64url').toString('utf-8')
    );
    if (payload.type !== 'admin') return false;
    if (Date.now() > payload.exp) return false;

    return true;
  } catch {
    return false;
  }
}

// ===== Session Token (Student / Guest) =====

interface SessionPayload {
  userId: string;
  name: string;
  role: 'student' | 'guest';
  iat: number;
  exp: number;
}

/**
 * Creates an HMAC-SHA256 signed session token.
 */
export function createSessionToken(
  userId: string,
  name: string,
  role: 'student' | 'guest',
  expiresInHours: number = 72
): string {
  const payload: SessionPayload = {
    userId,
    name,
    role,
    iat: Date.now(),
    exp: Date.now() + expiresInHours * 60 * 60 * 1000,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', SESSION_SECRET).update(payloadB64).digest('base64url');

  return `${payloadB64}.${signature}`;
}

/**
 * Verifies a session token and returns the payload, or null if invalid.
 */
export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) return null;

    const expectedSig = createHmac('sha256', SESSION_SECRET).update(payloadB64).digest('base64url');
    if (signature !== expectedSig) return null;

    const payload: SessionPayload = JSON.parse(
      Buffer.from(payloadB64, 'base64url').toString('utf-8')
    );

    if (Date.now() > payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
}

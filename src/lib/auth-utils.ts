const ADMIN_SECRET = process.env.ADMIN_SECRET || 'fallback-secret-change-me';
const SESSION_SECRET = process.env.AUTH_SECRET || 'fallback-session-secret';

// ===== Web Crypto Base64URL & HMAC Helpers (Edge Runtime Native) =====

function base64urlEncode(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecode(str: string): Uint8Array {
  const pad = str.length % 4;
  const padded = str + '===='.slice(pad || 4);
  const binary = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function strToBase64url(str: string): string {
  const enc = new TextEncoder();
  return base64urlEncode(enc.encode(str));
}

function base64urlToStr(b64: string): string {
  const bytes = base64urlDecode(b64);
  return new TextDecoder().decode(bytes);
}

async function hmacSign(secret: string, data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return base64urlEncode(sig);
}

// ===== Admin Token =====

export interface AdminTokenPayload {
  type: 'admin';
  iat: number; // issued at (ms)
  exp: number; // expiry (ms)
}

/**
 * Creates an HMAC-SHA256 signed admin token with expiry using Web Crypto API.
 */
export async function createAdminToken(expiresInHours: number = 24): Promise<string> {
  const payload: AdminTokenPayload = {
    type: 'admin',
    iat: Date.now(),
    exp: Date.now() + expiresInHours * 60 * 60 * 1000,
  };

  const payloadB64 = strToBase64url(JSON.stringify(payload));
  const signature = await hmacSign(ADMIN_SECRET, payloadB64);
  return `${payloadB64}.${signature}`;
}

/**
 * Verifies an admin token's signature and expiry using Web Crypto API.
 */
export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) return false;

    const expectedSig = await hmacSign(ADMIN_SECRET, payloadB64);
    if (signature !== expectedSig) return false;

    const payload: AdminTokenPayload = JSON.parse(base64urlToStr(payloadB64));
    if (payload.type !== 'admin') return false;
    if (Date.now() > payload.exp) return false;

    return true;
  } catch {
    return false;
  }
}

// ===== Session Token (Student / Guest) =====

export interface SessionPayload {
  userId: string;
  name: string;
  role: 'student' | 'guest';
  iat: number;
  exp: number;
}

/**
 * Creates an HMAC-SHA256 signed session token using Web Crypto API.
 */
export async function createSessionToken(
  userId: string,
  name: string,
  role: 'student' | 'guest',
  expiresInHours: number = 72
): Promise<string> {
  const payload: SessionPayload = {
    userId,
    name,
    role,
    iat: Date.now(),
    exp: Date.now() + expiresInHours * 60 * 60 * 1000,
  };

  const payloadB64 = strToBase64url(JSON.stringify(payload));
  const signature = await hmacSign(SESSION_SECRET, payloadB64);
  return `${payloadB64}.${signature}`;
}

/**
 * Verifies a session token using Web Crypto API and returns the payload, or null if invalid.
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) return null;

    const expectedSig = await hmacSign(SESSION_SECRET, payloadB64);
    if (signature !== expectedSig) return null;

    const payload: SessionPayload = JSON.parse(base64urlToStr(payloadB64));
    if (Date.now() > payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
}

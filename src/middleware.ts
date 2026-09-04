import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ===== Web Crypto HMAC helpers for Edge Runtime =====

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

async function hmacSign(secret: string, data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return base64urlEncode(sig);
}

/**
 * Verify admin token (HMAC-SHA256 signed, with expiry).
 */
async function verifyAdminTokenInMiddleware(token: string): Promise<boolean> {
  try {
    const secret = process.env.ADMIN_SECRET || 'fallback-secret-change-me';
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) return false;

    const expectedSig = await hmacSign(secret, payloadB64);
    if (signature !== expectedSig) return false;

    const payloadBytes = base64urlDecode(payloadB64);
    const payload = JSON.parse(new TextDecoder().decode(payloadBytes));
    if (payload.type !== 'admin') return false;
    if (Date.now() > payload.exp) return false;

    return true;
  } catch {
    return false;
  }
}

/**
 * Verify session token (HMAC-SHA256 signed, with expiry).
 */
async function verifySessionInMiddleware(token: string): Promise<boolean> {
  try {
    const secret = process.env.AUTH_SECRET || 'fallback-session-secret';
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) return false;

    const expectedSig = await hmacSign(secret, payloadB64);
    if (signature !== expectedSig) return false;

    const payloadBytes = base64urlDecode(payloadB64);
    const payload = JSON.parse(new TextDecoder().decode(payloadBytes));
    if (Date.now() > payload.exp) return false;

    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  const isAdminRoute = path.startsWith('/admin');
  const isLoginRoute = path === '/admin/login';
  
  // === Admin Route Protection ===
  if (isAdminRoute && !isLoginRoute) {
    const token = request.cookies.get('admin_token')?.value;
    
    if (!token || !(await verifyAdminTokenInMiddleware(token))) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  
  // If authenticated admin tries to access login, redirect to admin dashboard
  if (isLoginRoute) {
    const token = request.cookies.get('admin_token')?.value;
    if (token && (await verifyAdminTokenInMiddleware(token))) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  // === API Write Protection (POST/PUT/DELETE on certain routes) ===
  const isProtectedApi = /^\/api\/(ideas|comments|lessons\/interact)/.test(path);
  const isWriteMethod = ['POST', 'PUT', 'DELETE'].includes(request.method);

  if (isProtectedApi && isWriteMethod) {
    const sessionToken = request.cookies.get('session_token')?.value;
    const adminToken = request.cookies.get('admin_token')?.value;

    const hasSession = sessionToken ? await verifySessionInMiddleware(sessionToken) : false;
    const hasAdmin = adminToken ? await verifyAdminTokenInMiddleware(adminToken) : false;

    if (!hasSession && !hasAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized — กรุณาเข้าสู่ระบบ' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/admin', '/api/ideas/:path*', '/api/comments/:path*', '/api/lessons/interact/:path*'],
};



export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/api-auth';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function GET() {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession.isAdmin) {
      return NextResponse.json({ isAdmin: false }, { status: 401, headers: NO_CACHE_HEADERS });
    }

    return NextResponse.json({
      isAdmin: true,
      role: adminSession.role || 'super_admin',
      sid: adminSession.sid,
    }, {
      headers: NO_CACHE_HEADERS,
    });
  } catch (error) {
    console.error('GET /api/admin/me error:', error);
    return NextResponse.json({ isAdmin: false }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
